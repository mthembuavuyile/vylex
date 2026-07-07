// =======================================================
// GLOBAL MARKET TERMINAL — Runtime State Management
// =======================================================

const State = {
    // Current base currency for display
    currency: 'usd',

    // Chart selections
    chartTf: '1H',
    chartType: 'line',
    priceChart: null,
    rawPrices: [],

    // Running tick simulator or API intervals
    autoRefreshId: null,

    // Active configuration lists copied/initialized
    assets: [],
    indexData: {},

    // News/Reddit configurations
    currentFeed: 'stocks',
    newsCache: {},

    // Index indicators
    vixIndex: 14.25,
    lastBtcPrice: 0,

    // Dynamic banner indices
    quotesIndex: 0,

    // Initialize state mapping configuration assets
    init: function() {
        // Create a copy of config assets to support modifications locally
        this.assets = CONFIG.ASSETS_DATA.map(a => ({ ...a }));
        this.indexData = {
            spy: { ...CONFIG.INDEX_DATA.spy },
            qqq: { ...CONFIG.INDEX_DATA.qqq }
        };
        this.quotesIndex = Math.floor(Math.random() * CONFIG.QUOTES.length);
    }
};
