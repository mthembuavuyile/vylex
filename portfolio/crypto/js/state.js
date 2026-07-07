// =======================================================
// HYBRID ASSET TERMINAL — Runtime State Management
// =======================================================

const State = {
    // Current base currency for display
    currency: 'usd',

    // Active tab ('sats' for Bitcoin Terminal, 'global' for Hybrid Stock & Crypto, 'tools' for Converter/Glossary)
    activeTab: 'sats',

    // SATS Chart selections (Chart.js)
    chartTf: '1H',
    chartType: 'line',
    priceChart: null,
    rawPrices: [],

    // Running simulator interval ID
    autoRefreshId: null,

    // Active configurations copied from CONFIG
    assets: [],
    indexData: {},

    // News & discussions caches
    currentNewsCategory: 'all_crypto', // SATS news categories
    currentRedditFeed: 'stocks',      // Global market subreddits
    newsCache: {},

    // Index indicators (VIX volatility & Bitcoin last price)
    vixIndex: 14.25,
    lastBtcPrice: 0,

    // Dynamic rotation indices
    quotesIndex: 0,

    // Initialize state clones
    init: function() {
        this.assets = CONFIG.ASSETS_DATA.map(a => ({ ...a }));
        this.indexData = {
            spy: { ...CONFIG.INDEX_DATA.spy },
            qqq: { ...CONFIG.INDEX_DATA.qqq }
        };
        this.quotesIndex = Math.floor(Math.random() * CONFIG.QUOTES.length);
    }
};
