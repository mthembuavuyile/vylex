// =======================================================
// GLOBAL MARKET TERMINAL — Application Bootstrapper
// =======================================================

const App = {
    // Simulated market tick updates
    startTickerSimulation: function() {
        State.autoRefreshId = setInterval(() => {
            // Pick a random number of assets (2 to 4) to update in this tick
            const numToUpdate = Math.floor(Math.random() * 3) + 2;

            for (let i = 0; i < numToUpdate; i++) {
                const assetIndex = Math.floor(Math.random() * State.assets.length);
                const asset = State.assets[assetIndex];

                // Random minor tick between -0.15% and +0.18%
                const pctChange = (Math.random() * 0.33 - 0.15) / 100;

                asset.basePrice = asset.basePrice * (1 + pctChange);
                asset.baseCap = asset.baseCap * (1 + pctChange);
                asset.change += pctChange * 100;

                // Restrict changes within reasonable bounds (-8% to +8%)
                if (asset.change > 8) asset.change = 8;
                if (asset.change < -8) asset.change = -8;

                const decimalDigits = asset.type === 'crypto' && asset.basePrice > 1000 ? 0 : 2;

                const priceEl = Utils.$(`price-${asset.symbol}`);
                const changeEl = Utils.$(`change-${asset.symbol}`);
                const capEl = Utils.$(`cap-${asset.symbol}`);
                const rowEl = Utils.$(`asset-row-${asset.symbol}`);

                if (priceEl && changeEl && capEl && rowEl) {
                    priceEl.textContent = Utils.fmtUSD(asset.basePrice, decimalDigits);
                    changeEl.innerHTML = Utils.changeSpan(asset.change);
                    capEl.textContent = Utils.fmtCompact(asset.baseCap);

                    // Flash row green or red to signify high-end interactive feel
                    const tickClass = pctChange >= 0 ? 'tick-up' : 'tick-down';
                    rowEl.classList.remove('tick-up', 'tick-down');
                    void rowEl.offsetWidth; // Trigger DOM reflow to restart animation
                    rowEl.classList.add(tickClass);
                }
            }

            // Tick indices (SPY & QQQ)
            const spyTick = (Math.random() * 0.08 - 0.035) / 100;
            State.indexData.spy.price *= (1 + spyTick);
            State.indexData.spy.change += spyTick * 100;
            
            const spyPriceEl = Utils.$('spyPrice');
            const spyChangeEl = Utils.$('spyChange');
            if (spyPriceEl) spyPriceEl.textContent = Utils.fmtUSD(State.indexData.spy.price);
            if (spyChangeEl) spyChangeEl.innerHTML = Utils.changeSpan(State.indexData.spy.change);

            const qqqTick = (Math.random() * 0.12 - 0.05) / 100;
            State.indexData.qqq.price *= (1 + qqqTick);
            State.indexData.qqq.change += qqqTick * 100;
            
            const qqqPriceEl = Utils.$('qqqPrice');
            const qqqChangeEl = Utils.$('qqqChange');
            if (qqqPriceEl) qqqPriceEl.textContent = Utils.fmtUSD(State.indexData.qqq.price);
            if (qqqChangeEl) qqqChangeEl.innerHTML = Utils.changeSpan(State.indexData.qqq.change);

            // Re-aggregate and update charts/sentiment gauge
            UI.updateAggregatedStats();
        }, 2800);
    },

    // Global listener bindings
    bindEvents: function() {
        const feedTabs = Utils.$('feedTabs');
        if (feedTabs) {
            feedTabs.addEventListener('click', e => {
                const btn = e.target.closest('.tab-btn');
                if (!btn) return;

                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Fetch the selected feed
                ApiService.fetchRedditFeed(btn.dataset.feed);
            });
        }
    },

    // Initialize application processes
    init: async function() {
        // Initialize state configuration data
        State.init();

        // Bind DOM elements
        this.bindEvents();

        // Render index values initial data
        const spyPriceEl = Utils.$('spyPrice');
        const spyChangeEl = Utils.$('spyChange');
        const qqqPriceEl = Utils.$('qqqPrice');
        const qqqChangeEl = Utils.$('qqqChange');
        
        if (spyPriceEl) spyPriceEl.textContent = Utils.fmtUSD(State.indexData.spy.price);
        if (spyChangeEl) spyChangeEl.innerHTML = Utils.changeSpan(State.indexData.spy.change);
        if (qqqPriceEl) qqqPriceEl.textContent = Utils.fmtUSD(State.indexData.qqq.price);
        if (qqqChangeEl) qqqChangeEl.innerHTML = Utils.changeSpan(State.indexData.qqq.change);

        // Build quotes banner text
        const quoteTextEl = Utils.$('quoteText');
        if (quoteTextEl) {
            quoteTextEl.textContent = `“${CONFIG.QUOTES[State.quotesIndex]}”`;
        }

        // Render Leaderboard & widgets
        UI.renderAssetsTable();
        UI.updateAggregatedStats();
        UI.initGlossary();

        // Start clock ticking
        UI.updateMarketHours();
        setInterval(() => UI.updateMarketHours(), 1000);

        // Fetch external API live values
        await ApiService.fetchCryptoPrices();
        await ApiService.fetchFearAndGreed();
        await ApiService.fetchMempoolFees();
        
        // Fetch news feed
        ApiService.fetchRedditFeed(State.currentFeed);

        // Start local ticker simulations
        this.startTickerSimulation();

        // Register running fetch intervals
        setInterval(() => ApiService.fetchCryptoPrices(), 45000); // 45 seconds for CoinGecko
        setInterval(() => ApiService.fetchMempoolFees(), 60000); // 60 seconds for Mempool space
        setInterval(() => ApiService.fetchFearAndGreed(), 120000); // 2 minutes for Fear and Greed
        setInterval(() => UI.cycleQuotes(), 8000); // 8 seconds for quotes cycle
    }
};

// Start application when DOM has loaded
window.addEventListener('DOMContentLoaded', () => {
    App.init();
});
