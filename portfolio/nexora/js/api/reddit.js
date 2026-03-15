window.NexoraRegistry.register({
    id: 'reddit',
    name: 'Reddit Posts',
    example: 'show me crypto news',
    intents: [
        /(?:show me |top posts (?:on|from|in) |what'?s? (?:hot|trending|popular) on )?r\/([A-Za-z0-9_]+)/i,
        /\b(crypto(?:currency)?|bitcoin|finance|stock|market|tech(?:nology)?|science|gaming|south\s?african?|sa\s?news|world|global|politics?|ai|programming|dev(?:eloper)?)\b.*?\b(?:news|posts?|updates?|trending|hot|top)\b/i,
        /\breddit\s+([A-Za-z0-9_\s]+)/i,
        /(?:give me|what'?s?|show me)\s+(?:the\s+)?(?:\w+\s+)?news\b/i,
        /^\s*news\s*$/i
    ],

    async handle(match) {
        const raw = match[0].toLowerCase();

        const TOPIC_MAP = [
            { keywords: ['crypto', 'cryptocurrency', 'bitcoin', 'btc'], subreddit: 'cryptocurrency' },
            { keywords: ['finance', 'stock', 'investing', 'market', 'wall street'], subreddit: 'wallstreetbets' },
            { keywords: ['tech', 'technology', 'ai', 'programming', 'coding', 'dev'], subreddit: 'technology' },
            { keywords: ['science', 'space', 'nasa', 'health'], subreddit: 'science' },
            { keywords: ['gaming', 'games', 'pcgaming'], subreddit: 'gaming' },
            { keywords: ['south african', 'south africa', 'sa news'], subreddit: 'southafrica' },
            { keywords: ['world', 'global', 'international', 'news'], subreddit: 'worldnews' },
            { keywords: ['funny', 'memes', 'humor'], subreddit: 'memes' }
        ];

        let subreddit = '';

        const explicit = raw.match(/\br\/([a-z0-9_]+)/i);
        if (explicit) subreddit = explicit[1];

        if (!subreddit) {
            let bestLen = 0;
            for (const entry of TOPIC_MAP) {
                for (const kw of entry.keywords) {
                    if (raw.includes(kw) && kw.length > bestLen) {
                        subreddit = entry.subreddit;
                        bestLen = kw.length;
                    }
                }
            }
        }

        if (!subreddit) {
            for (let i = 1; i < match.length; i++) {
                if (match[i]) {
                    subreddit = match[i].replace(/^r\//, '').trim().split(' ')[0];
                    break;
                }
            }
        }

        if (!subreddit) subreddit = 'news';
        return await fetchAndRenderReddit(subreddit);
    }
});

// ─── CORS Proxy list (tried in order) ────────────────────────────────────────
const CORS_PROXIES = [
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

async function fetchWithProxyFallback(targetUrl, options = {}) {
    let lastErr;
    for (const makeProxy of CORS_PROXIES) {
        try {
            const res = await fetch(makeProxy(targetUrl), options);
            // allorigins wraps 404/403 as 200 with error body — handled downstream
            if (res.ok) return res;
            lastErr = new Error(`HTTP ${res.status}`);
        } catch (e) {
            lastErr = e;
        }
    }
    throw lastErr || new Error('All proxies failed');
}

// ─── Method 1: RSS Feed (most reliable through proxies) ──────────────────────
async function fetchViaRSS(subreddit) {
    const target = `https://www.reddit.com/r/${subreddit}/hot.rss?limit=10`;
    const res = await fetchWithProxyFallback(target, {
        headers: { 'Accept': 'application/rss+xml, application/xml, text/xml, */*' }
    });

    const text = await res.text();

    // allorigins returns JSON wrapper sometimes
    let xmlText = text;
    try {
        const json = JSON.parse(text);
        if (json?.contents) xmlText = json.contents;
    } catch (_) { /* not JSON, use as-is */ }

    // Detect Reddit error pages
    if (xmlText.includes('"reason": "private"') || xmlText.includes('"error": 403')) {
        throw new Error(`r/${subreddit} is private`);
    }
    if (xmlText.includes('"error": 404')) {
        throw new Error(`r/${subreddit} not found`);
    }

    const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
    if (xml.querySelector('parsererror')) throw new Error('RSS parse failed');

    const entries = Array.from(xml.querySelectorAll('entry, item'));
    if (!entries.length) throw new Error('No RSS entries found');

    return entries.slice(0, 5).map(el => {
        const linkEl = el.querySelector('link');
        const href = linkEl?.getAttribute('href') || linkEl?.textContent?.trim() || '';
        const title = el.querySelector('title')?.textContent?.trim() || 'Untitled';
        const author = el.querySelector('author name, dc\\:creator, creator')?.textContent?.trim() || '';

        let thumbnail = null;
        const mediaThumbnail = el.querySelector('thumbnail');
        if (mediaThumbnail) {
            thumbnail = mediaThumbnail.getAttribute('url');
        } else {
            const content = el.querySelector('content, description')?.textContent || '';
            const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) thumbnail = imgMatch[1];
        }

        return { title, url: href, ups: null, comments: null, author, flair: '', thumbnail, source: 'rss' };
    });
}

// ─── Method 2: JSON API (fallback) ───────────────────────────────────────────
async function fetchViaJSON(subreddit) {
    const target = `https://www.reddit.com/r/${subreddit}/hot.json?limit=10&raw_json=1`;
    const res = await fetchWithProxyFallback(target, {
        headers: { 'Accept': 'application/json' }
    });

    const text = await res.text();

    let data;
    try {
        // allorigins wraps in { contents, status }
        const wrapper = JSON.parse(text);
        data = wrapper?.contents ? JSON.parse(wrapper.contents) : wrapper;
    } catch (_) {
        throw new Error('JSON parse failed');
    }

    if (data?.reason === 'private' || data?.error === 403) throw new Error(`r/${subreddit} is private`);
    if (data?.error === 404) throw new Error(`r/${subreddit} not found`);

    const posts = data?.data?.children;
    if (!posts?.length) throw new Error('No posts returned');

    return posts.slice(0, 5).map(({ data: p }) => ({
        title:     p.title,
        url:       `https://reddit.com${p.permalink}`,
        ups:       p.ups,
        comments:  p.num_comments,
        author:    p.author,
        flair:     p.link_flair_text || '',
        thumbnail: p.thumbnail?.startsWith('http') ? p.thumbnail : null,
        source:    'json'
    }));
}

// ─── Orchestrate: RSS first, then JSON ───────────────────────────────────────
async function fetchAndRenderReddit(subreddit) {
    let posts = null;
    let method = '';

    try {
        posts = await fetchViaRSS(subreddit);
        method = 'RSS Feed';
    } catch (rssErr) {
        if (rssErr.message.includes('not found'))
            return { text: `r/${subreddit} doesn't seem to exist on Reddit.` };
        if (rssErr.message.includes('private'))
            return { text: `r/${subreddit} is a private community and can't be accessed.` };

        try {
            posts = await fetchViaJSON(subreddit);
            method = 'JSON API';
        } catch (jsonErr) {
            if (jsonErr.message.includes('not found'))
                return { text: `r/${subreddit} doesn't seem to exist on Reddit.` };
            if (jsonErr.message.includes('private'))
                return { text: `r/${subreddit} is a private community and can't be accessed.` };

            return { text: `Couldn't load r/${subreddit} right now — Reddit may be blocking the request. Try again shortly.` };
        }
    }

    const items = posts.map(({ title, url, ups, comments, author, flair, thumbnail }) => {
        const imgHtml = thumbnail
            ? `<img src="${thumbnail}" alt="" class="news-thumb">`
            : `<div class="news-thumb fallback">📄</div>`;

        const flairHtml = flair
            ? `<span class="reddit-flair">${escapeHtml(flair)}</span>`
            : '';

        const metaParts = [];
        if (ups !== null)      metaParts.push(`▲ ${formatNum(ups)}`);
        if (comments !== null) metaParts.push(`💬 ${formatNum(comments)}`);
        if (author)            metaParts.push(`u/${escapeHtml(author)}`);
        const metaHtml = metaParts.join(' &nbsp;·&nbsp; ');

        return `
        <li class="reddit-post news-item">
            ${imgHtml}
            <div class="news-item-content">
                ${flairHtml}
                <h4><a href="${escapeHtml(url)}" target="_blank">${escapeHtml(title)}</a></h4>
                ${metaHtml ? `<div class="reddit-meta">${metaHtml}</div>` : ''}
            </div>
        </li>`;
    }).join('');

    const html = `
    <div class="rich-widget" style="padding:10px;">
        <div class="widget-title" style="font-weight:bold;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span style="display:flex;align-items:center;gap:8px;">
                <i class="fab fa-reddit-alien" style="color:#FF4500;"></i>
                r/${escapeHtml(subreddit)}
            </span>
            <span style="font-size:0.7rem;font-weight:400;opacity:0.45;">${escapeHtml(method)}</span>
        </div>
        <ul class="reddit-list news-list">${items}</ul>
        <a href="https://reddit.com/r/${encodeURIComponent(subreddit)}" target="_blank"
           style="display:block;text-align:center;margin-top:12px;font-size:0.8rem;opacity:0.6;text-decoration:none;">
            View more on Reddit ↗
        </a>
    </div>`;

    return { html, text: `Here are the latest trending posts from r/${subreddit} (via ${method}).` };
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function formatNum(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
    return String(n);
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}