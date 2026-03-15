window.NexoraRegistry.register({
    id: 'reddit',
    name: 'Reddit Posts',
    example: 'show me crypto news',
    intents: [
        // 1. Explicit r/ mention
        /(?:show me |top posts (?:on|from|in) |what'?s? (?:hot|trending|popular) on )?r\/([A-Za-z0-9_]+)/i,

        // 2. Topic + news/posts
        /\b(crypto(?:currency)?|bitcoin|finance|stock|market|tech(?:nology)?|science|gaming|south\s?african?|sa\s?news|world|global|politics?|ai|programming|dev(?:eloper)?)\b.*?\b(?:news|posts?|updates?|trending|hot|top)\b/i,

        // 3. Fallback: "reddit <topic>" or "show me news"
        /\breddit\s+([A-Za-z0-9_\s]+)/i,
        /(?:give me|what'?s?|show me)\s+(?:the\s+)?(?:\w+\s+)?news\b/i,

        // 4. Catch-all
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

        // Priority 1: Explicit r/subreddit
        const explicit = raw.match(/\br\/([a-z0-9_]+)/i);
        if (explicit) subreddit = explicit[1];

        // Priority 2: Keyword mapping (longest match wins)
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

        // Priority 3: Capture group from regex
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

// ─── Proxy Waterfall Orchestrator ────────────────────────────────────────────
async function fetchWithProxyWaterfall(targetUrl) {
    const proxies = [
        { name: 'allorigins', url: `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}` },
        { name: 'corsproxy', url: `https://corsproxy.io/?${encodeURIComponent(targetUrl)}` },
        { name: 'codetabs', url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}` }
    ];

    let lastError = new Error("All proxies failed");

    for (const proxy of proxies) {
        try {
            const res = await fetch(proxy.url);

            // Handle AllOrigins wrapper specifically
            if (proxy.name === 'allorigins') {
                const json = await res.json();
                
                if (json.status && json.status.http_code) {
                    if (json.status.http_code === 404) throw new Error('not found');
                    if (json.status.http_code === 403) throw new Error('private');
                    if (json.status.http_code >= 400) throw new Error(`HTTP ${json.status.http_code}`);
                }
                
                if (json.contents) return json.contents;
                throw new Error('AllOrigins returned empty contents');
            } 
            
            // Handle standard raw proxies
            if (res.status === 404) throw new Error('not found');
            if (res.status === 403) throw new Error('private');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            
            return await res.text();

        } catch (err) {
            // Bubble up Reddit logic errors instantly, don't fall back to next proxy
            if (err.message === 'not found' || err.message === 'private') {
                throw err;
            }
            
            // Otherwise, it's a proxy/network failure. Log and try the next one.
            console.warn(`[Proxy] ${proxy.name} failed:`, err.message);
            lastError = err;
        }
    }

    throw lastError;
}

// ─── Method 1: Reddit RSS Feed ───────────────────────────────────────────────
async function fetchViaRSS(subreddit) {
    const rawText = await fetchWithProxyWaterfall(`https://www.reddit.com/r/${subreddit}/hot.rss?limit=10`);
    
    const xml = new DOMParser().parseFromString(rawText, 'application/xml');
    if (xml.querySelector('parsererror')) throw new Error('RSS parse failed');

    const entries = Array.from(xml.querySelectorAll('entry, item'));
    if (!entries.length) throw new Error('No RSS entries');

    return entries.slice(0, 5).map(el => {
        const linkEl  = el.querySelector('link');
        const href    = linkEl?.getAttribute('href') || linkEl?.textContent?.trim() || '';
        const title   = el.querySelector('title')?.textContent?.trim() || 'Untitled';
        const author  = el.querySelector('author name, dc\\:creator, creator')?.textContent?.trim() || '';

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

// ─── Method 2: Reddit JSON API ───────────────────────────────────────────────
async function fetchViaJSON(subreddit) {
    const rawText = await fetchWithProxyWaterfall(`https://www.reddit.com/r/${subreddit}/hot.json?limit=10&raw_json=1`);
    
    const data = JSON.parse(rawText);
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

// ─── Render + orchestrate with fallback ──────────────────────────────────────
async function fetchAndRenderReddit(subreddit) {
    let posts  = null;
    let method = '';
    let warning = '';

    // Fix 1: Try RSS first, then fallback to JSON API
    try {
        posts  = await fetchViaRSS(subreddit);
        method = 'RSS Feed (.rss)';
    } catch (rssErr) {
        if (rssErr.message === 'not found') {
            return { text: `r/${subreddit} doesn't seem to exist on Reddit.` };
        }
        if (rssErr.message === 'private') {
            return { text: `r/${subreddit} is a private community.` };
        }

        warning = `RSS unavailable (${rssErr.message}), using JSON.`;
        try {
            posts  = await fetchViaJSON(subreddit);
            method = 'JSON API (.json)';
        } catch (jsonErr) {
            return { text: `Couldn't load r/${subreddit} via either method. Try again shortly. (${jsonErr.message})` };
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
                <h4>
                    <a href="${escapeHtml(url)}" target="_blank">
                        ${escapeHtml(title)}
                    </a>
                </h4>
                ${metaHtml ? `<div class="reddit-meta">${metaHtml}</div>` : ''}
            </div>
        </li>`;
    }).join('');

    const warningHtml = warning
        ? `<div style="font-size:0.72rem;opacity:0.5;margin-bottom:8px;">⚠️ ${escapeHtml(warning)}</div>`
        : '';

    const html = `
    <div class="rich-widget" style="padding:10px;">
        <div class="widget-title" style="font-weight:bold;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span style="display:flex;align-items:center;gap:8px;">
                <i class="fab fa-reddit-alien" style="color:#FF4500;"></i>
                r/${escapeHtml(subreddit)}
            </span>
            <span style="font-size:0.7rem;font-weight:400;opacity:0.45;">${escapeHtml(method)}</span>
        </div>
        ${warningHtml}
        
        <ul class="reddit-list news-list">
            ${items}
        </ul>

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
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#39;');
}