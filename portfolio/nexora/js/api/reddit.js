window.NexoraRegistry.register({
    id: 'reddit',
    name: 'Reddit Posts',
    example: 'show me crypto news',
    intents: [
        // 1. Explicit r/ mention: "show me r/programming", "r/science"
        /(?:show me |top posts (?:on|from|in) |what'?s? (?:hot|trending|popular) on )?r\/([A-Za-z0-9_]+)/i,
        
        // 2. Topic + news/posts: "crypto news", "south african news", "tech updates"
        /\b(crypto(?:currency)?|bitcoin|finance|stock|market|tech(?:nology)?|science|gaming|south\s?african?|sa\s?news|world|global|politics?|ai|programming|dev(?:eloper)?)\b.*?\b(?:news|posts?|updates?|trending|hot|top)\b/i,
        
        // 3. Fallback: "reddit <topic>" or "show me news"
        /\breddit\s+([A-Za-z0-9_\s]+)/i,
        /(?:give me|what'?s?|show me)\s+(?:the\s+)?(?:\w+\s+)?news\b/i,

        // 4. The "Just say news" Catch-all
        /^\s*news\s*$/i
    ],

    async handle(match) {
        const raw = match[0].toLowerCase();
        
        // Comprehensive Topic Map
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

        // Logic Priority 1: Check for explicit "r/subreddit" in the string
        const explicit = raw.match(/\br\/([a-z0-9_]+)/i);
        if (explicit) {
            subreddit = explicit[1];
        } 

        // Logic Priority 2: Keyword mapping (Longest match first)
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

        // Logic Priority 3: Extract capture group from regex if still empty
        if (!subreddit) {
            for (let i = 1; i < match.length; i++) {
                if (match[i]) {
                    subreddit = match[i].replace(/^r\//, '').trim().split(' ')[0];
                    break;
                }
            }
        }

        // Final Fallback
        if (!subreddit) subreddit = 'news';

        return await fetchAndRenderReddit(subreddit);
    }
});

// Helper function to keep the handle() clean and prevent crashes
async function fetchAndRenderReddit(subreddit) {
    const url = `https://corsproxy.io/?https://www.reddit.com/r/${encodeURIComponent(subreddit)}/hot.json?limit=10`;

    try {
        const res = await fetch(url);
        if (res.status === 404) return { text: `r/${subreddit} doesn't seem to exist.` };
        if (!res.ok) return { text: `Reddit is a bit busy. (Error ${res.status})` };

        const data = await res.json();
        const posts = data?.data?.children;

        if (!posts || posts.length === 0) return { text: `r/${subreddit} is looking a bit empty right now.` };

        const items = posts.slice(0, 5).map(({ data: p }) => {
            const hasImg = p.thumbnail && p.thumbnail.startsWith('http');
            const imgHtml = hasImg ? `<img src="${p.thumbnail}" class="news-thumb" style="width:60px;height:60px;object-fit:cover;border-radius:6px;flex-shrink:0;">` : '';
            
            return `
            <li style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid rgba(128,128,128,0.1);list-style:none;">
                ${imgHtml}
                <div style="flex:1;min-width:0;">
                    <a href="https://reddit.com${p.permalink}" target="_blank" style="font-size:0.95rem;font-weight:500;text-decoration:none;color:inherit;line-height:1.3;display:block;">
                        ${escapeHtml(p.title)}
                    </a>
                    <div style="font-size:0.75rem;opacity:0.6;margin-top:4px;">
                        <span>▲ ${formatNum(p.ups)}</span> • <span>💬 ${formatNum(p.num_comments)}</span> • <span>u/${escapeHtml(p.author)}</span>
                    </div>
                </div>
            </li>`;
        }).join('');

        const html = `
        <div class="rich-widget" style="padding:10px;">
            <div class="widget-title" style="font-weight:bold;margin-bottom:10px;display:flex;align-items:center;gap:8px;">
                <i class="fab fa-reddit-alien" style="color:#FF4500;"></i> r/${escapeHtml(subreddit)}
            </div>
            <ul style="padding:0;margin:0;">${items}</ul>
            <a href="https://reddit.com/r/${subreddit}" target="_blank" style="display:block;text-align:center;margin-top:12px;font-size:0.8rem;opacity:0.7;text-decoration:none;">View more on Reddit ↗</a>
        </div>`;

        return { html, text: `Here are the latest trending posts from r/${subreddit}.` };

    } catch (err) {
        return { text: "I had trouble connecting to Reddit. Please try again in a moment." };
    }
}

function formatNum(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return String(n);
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}