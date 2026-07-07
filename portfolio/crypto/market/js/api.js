// =======================================================
// GLOBAL MARKET TERMINAL — External Network APIs
// =======================================================

const ApiService = {
    // Fetch live prices for Bitcoin & Ethereum from CoinGecko
    fetchCryptoPrices: async function() {
        try {
            const res = await fetch(`${CONFIG.API.CG}/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`);
            if (!res.ok) throw new Error('CoinGecko fetch failed');
            const data = await res.json();

            const btc = State.assets.find(a => a.symbol === 'BTC');
            const eth = State.assets.find(a => a.symbol === 'ETH');

            if (btc && data.bitcoin) {
                btc.basePrice = data.bitcoin.usd;
                btc.baseCap = data.bitcoin.usd_market_cap || btc.baseCap;
                btc.change = data.bitcoin.usd_24h_change || btc.change;
            }

            if (eth && data.ethereum) {
                eth.basePrice = data.ethereum.usd;
                eth.baseCap = data.ethereum.usd_market_cap || eth.baseCap;
                eth.change = data.ethereum.usd_24h_change || eth.change;
            }

            // Trigger UI updates
            UI.renderAssetsTable();
            UI.updateAggregatedStats();
        } catch (e) {
            console.warn('Unable to load live CoinGecko prices, relying on simulation ticks.', e);
        }
    },

    // Fetch Reddit news feed items
    fetchRedditFeed: async function(feedKey) {
        State.currentFeed = feedKey;
        UI.showFeedLoader();

        // Check cache first to stay DRY and fast
        if (State.newsCache[feedKey] && (Date.now() - State.newsCache[feedKey].timestamp < 60000)) {
            UI.renderRedditFeed(State.newsCache[feedKey].posts);
            return;
        }

        try {
            const res = await fetch(`${CONFIG.API.REDDIT_BASE}/${feedKey}/.json?limit=15&sort=hot`);
            if (!res.ok) throw new Error('Reddit API returned error');
            const data = await res.json();

            const posts = data.data.children
                .filter(p => !p.data.stickied)
                .slice(0, 10)
                .map(p => ({
                    title: p.data.title,
                    subreddit: p.data.subreddit,
                    permalink: p.data.permalink,
                    created_utc: p.data.created_utc,
                    ups: p.data.ups
                }));

            // Store in cache
            State.newsCache[feedKey] = {
                timestamp: Date.now(),
                posts: posts
            };

            UI.renderRedditFeed(posts);
        } catch (e) {
            console.warn(`Reddit feed fetch for ${feedKey} failed.`, e);
            UI.renderRedditFeedError(feedKey);
        }
    },

    // Fetch Alternative.me Fear and Greed Index
    fetchFearAndGreed: async function() {
        try {
            const res = await fetch(CONFIG.API.FNG);
            if (!res.ok) throw new Error('Fear & Greed API failed');
            const data = await res.json();
            
            if (data.data && data.data[0]) {
                const score = parseInt(data.data[0].value);
                const label = data.data[0].value_classification;
                
                // Update UI using real data
                UI.updateSentimentDial(score, label);
            }
        } catch (e) {
            console.warn('Alternative.me Fear & Greed API unavailable, utilizing default calculated sentiment.', e);
        }
    },

    // Fetch Bitcoin network transaction details from Mempool Space API
    fetchMempoolFees: async function() {
        try {
            const res = await fetch(`${CONFIG.API.MEMPOOL}/v1/fees/recommended`);
            if (!res.ok) throw new Error('Mempool.space API failed');
            const fees = await res.json();
            
            // Render fees in network card
            UI.renderMempoolFees(fees);
        } catch (e) {
            console.warn('Mempool Space API fees fetch failed.', e);
        }
    }
};
