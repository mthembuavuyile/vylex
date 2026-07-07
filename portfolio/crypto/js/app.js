// =======================================================
// HYBRID ASSET PLATFORM — Application Bootstrapper
// =======================================================

const App = {
    // Simulated market tick updates (updates elements inside Global Market Leaderboard)
    startTickerSimulation: function() {
        State.autoRefreshId = setInterval(() => {
            // Ticker simulation is only visible/active if we are on the global multi-asset tab
            if (State.activeTab !== 'global') return;

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
                    priceEl.textContent = Utils.fmtCurrency(asset.basePrice, State.currency, { min: decimalDigits, max: decimalDigits });
                    changeEl.innerHTML = Utils.changeSpan(asset.change);
                    capEl.textContent = Utils.fmtBig(asset.baseCap, State.currency);

                    // Flash row green or red to signify high-end interactive feel
                    const tickClass = pctChange >= 0 ? 'tick-up' : 'tick-down';
                    rowEl.classList.remove('tick-up', 'tick-down');
                    void rowEl.offsetWidth; // Trigger DOM reflow to restart animation
                    rowEl.classList.add(tickClass);
                }
            }

            // Sync index price simulation
            const spyTick = (Math.random() * 0.08 - 0.035) / 100;
            State.indexData.spy.price *= (1 + spyTick);
            State.indexData.spy.change += spyTick * 100;
            
            const spyPriceEl = Utils.$('spyPrice');
            const spyChangeEl = Utils.$('spyChange');
            if (spyPriceEl) spyPriceEl.textContent = Utils.fmtCurrency(State.indexData.spy.price, State.currency);
            if (spyChangeEl) spyChangeEl.innerHTML = Utils.changeSpan(State.indexData.spy.change);

            const qqqTick = (Math.random() * 0.12 - 0.05) / 100;
            State.indexData.qqq.price *= (1 + qqqTick);
            State.indexData.qqq.change += qqqTick * 100;
            
            const qqqPriceEl = Utils.$('qqqPrice');
            const qqqChangeEl = Utils.$('qqqChange');
            if (qqqPriceEl) qqqPriceEl.textContent = Utils.fmtCurrency(State.indexData.qqq.price, State.currency);
            if (qqqChangeEl) qqqChangeEl.innerHTML = Utils.changeSpan(State.indexData.qqq.change);

            // Re-aggregate stats (recomputes total cap and updates sentiment dial)
            UI.updateAggregatedStats();
        }, 2800);
    },

    // Dynamic SATS / Fiat converter calculations
    doConvert: async function() {
        const amount = parseFloat(Utils.$('convAmount').value);
        const from = Utils.$('convFrom').value;
        const to = Utils.$('convTo').value;
        const resultEl = Utils.$('convResult');

        if (isNaN(amount) || amount <= 0) { resultEl.innerHTML = 'Enter a valid amount'; return; }
        if (from === to) { resultEl.innerHTML = `<strong>${amount} ${from}</strong>`; return; }

        resultEl.textContent = 'Converting…';

        try {
            let result;
            if (from === 'BTC' || to === 'BTC') {
                const query = from === 'BTC' ? to : from;
                const res = await fetch(`${CONFIG.API.CG}/simple/price?ids=bitcoin&vs_currencies=${query.toLowerCase()}`);
                const data = await res.json();
                const rate = data.bitcoin[query.toLowerCase()];
                result = from === 'BTC' ? amount * rate : amount / rate;
            } else {
                const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`);
                const data = await res.json();
                result = data.rates?.[to];
            }

            if (result == null) throw new Error('Conversion rate unavailable');
            const prec = to === 'BTC' ? 8 : 2;
            resultEl.innerHTML = `${amount} ${from} = <strong>${result.toFixed(prec)} ${to}</strong>`;
        } catch (e) {
            resultEl.innerHTML = `<span style="color:var(--red)">Error: ${e.message}</span>`;
        }
    },

    // Refresh everything for active dashboards
    fullRefresh: async function() {
        if (State.activeTab === 'sats') {
            await Promise.all([
                ApiService.fetchBtcPriceAndStats(),
                ApiService.fetchNetworkStats(),
                ApiService.fetchMempoolFees(),
                ApiService.fetchRecentBlocks(),
                ApiService.fetchFearAndGreed(),
                ApiService.fetchMarketOverview(),
                ApiService.fetchChartData()
            ]);
        } else if (State.activeTab === 'global') {
            await Promise.all([
                ApiService.fetchCryptoPrices(),
                ApiService.fetchMempoolFees(),
                ApiService.fetchFearAndGreed(),
                ApiService.fetchRedditFeed(State.currentRedditFeed, true)
            ]);
        }
    },

    // Handle hash-based SPA routing
    handleRouting: function() {
        const hash = window.location.hash || '#/sats';
        let targetView = 'sats';
        
        if (hash === '#/global') {
            targetView = 'global';
        } else if (hash === '#/tools') {
            targetView = 'tools';
        }

        UI.routeView(targetView);
        this.fullRefresh();
    },

    // Bind event handlers
    bindEvents: function() {
        // Nav tab buttons routing click triggers
        document.querySelectorAll('.nav-tab-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const targetView = e.target.closest('.nav-tab-btn').dataset.view;
                window.location.hash = `#/${targetView}`;
            });
        });

        // Global currency select trigger
        const currencySelect = Utils.$('currencySelect');
        if (currencySelect) {
            currencySelect.addEventListener('change', e => {
                State.currency = e.target.value.toLowerCase();
                this.fullRefresh();
            });
        }

        // --- SATS Events ---
        const tfButtons = Utils.$('tfButtons');
        if (tfButtons) {
            tfButtons.addEventListener('click', e => {
                const btn = e.target.closest('.tf-btn');
                if (!btn) return;
                State.chartTf = btn.dataset.tf;
                document.querySelectorAll('.tf-btn').forEach(b => b.classList.toggle('active', b.dataset.tf === State.chartTf));
                UI.buildChart();
                ApiService.fetchChartData();
            });
        }

        const chartTypeBtn = Utils.$('chartTypeBtn');
        if (chartTypeBtn) {
            chartTypeBtn.addEventListener('click', () => {
                State.chartType = State.chartType === 'line' ? 'candlestick' : 'line';
                chartTypeBtn.textContent = 'Candles ' + (State.chartType === 'candlestick' ? 'ON' : 'OFF');
                chartTypeBtn.classList.toggle('active', State.chartType === 'candlestick');
                UI.buildChart();
                UI.renderChartData();
            });
        }

        const refreshBtn = Utils.$('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.fullRefresh());
        }

        const autoRefresh = Utils.$('autoRefresh');
        if (autoRefresh) {
            autoRefresh.addEventListener('change', e => {
                if (e.target.checked) {
                    this.startAutoRefreshTimer();
                } else {
                    this.stopAutoRefreshTimer();
                }
            });
        }

        const newsTabs = Utils.$('newsTabs');
        if (newsTabs) {
            newsTabs.addEventListener('click', e => {
                const tab = e.target.closest('.news-tab');
                if (!tab) return;
                document.querySelectorAll('.news-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                State.currentNewsCategory = tab.dataset.src;
                ApiService.fetchRedditFeed(State.currentNewsCategory, false);
            });
        }

        // --- Global Market Events ---
        const feedTabs = Utils.$('feedTabs');
        if (feedTabs) {
            feedTabs.addEventListener('click', e => {
                const btn = e.target.closest('.tab-btn');
                if (!btn) return;
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                State.currentRedditFeed = btn.dataset.feed;
                ApiService.fetchRedditFeed(State.currentRedditFeed, true);
            });
        }

        // --- Tools Events ---
        const convBtn = Utils.$('convBtn');
        if (convBtn) {
            convBtn.addEventListener('click', () => this.doConvert());
        }
        const convAmount = Utils.$('convAmount');
        if (convAmount) {
            convAmount.addEventListener('keydown', e => {
                if (e.key === 'Enter') this.doConvert();
            });
        }
        const newTermBtn = Utils.$('newTermBtn');
        if (newTermBtn) {
            newTermBtn.addEventListener('click', () => UI.showRandomTerm());
        }
        const newQuoteBtn = Utils.$('newQuoteBtn');
        if (newQuoteBtn) {
            newQuoteBtn.addEventListener('click', () => UI.showRandomQuote());
        }
    },

    // Interval timers for refresh toggles
    autoRefreshTimerId: null,
    startAutoRefreshTimer: function() {
        this.stopAutoRefreshTimer();
        const auto = Utils.$('autoRefresh');
        if (auto && auto.checked) {
            this.autoRefreshTimerId = setInterval(() => {
                this.fullRefresh();
            }, 30000); // 30s auto updates
        }
    },
    stopAutoRefreshTimer: function() {
        if (this.autoRefreshTimerId) {
            clearInterval(this.autoRefreshTimerId);
            this.autoRefreshTimerId = null;
        }
    },

    // Initialize application processes
    init: function() {
        // Initialize state clone vectors
        State.init();

        // Bind DOM events
        this.bindEvents();

        // Setup quotes initial text
        const quoteTextEl = Utils.$('quoteText');
        if (quoteTextEl) {
            quoteTextEl.textContent = `“${CONFIG.QUOTES[State.quotesIndex]}”`;
        }

        // Set timezone clocks ticking
        UI.updateMarketHours();
        setInterval(() => UI.updateMarketHours(), 1000);

        // Run quotes ticker banner cycles
        setInterval(() => UI.cycleQuotes(), 8000);

        // Bind hash change listener for routing and execute once on boot
        window.addEventListener('hashchange', () => this.handleRouting());
        this.handleRouting();

        // Load tools glossary widget
        UI.initGlossary();
        UI.showRandomTerm();
        UI.showRandomQuote();

        // Start simulated local tickers
        this.startTickerSimulation();

        // Start auto updates if checked
        this.startAutoRefreshTimer();

        // Slow updates for secondary network logs
        setInterval(() => {
            if (State.activeTab === 'sats') {
                ApiService.fetchNetworkStats();
                ApiService.fetchRecentBlocks();
            }
        }, 120000);

        setInterval(() => {
            if (State.activeTab === 'sats') {
                ApiService.fetchMarketOverview();
            }
        }, 180000);

        setInterval(() => {
            if (State.activeTab === 'sats') {
                ApiService.fetchRedditFeed(State.currentNewsCategory, false);
            } else if (State.activeTab === 'global') {
                ApiService.fetchRedditFeed(State.currentRedditFeed, true);
            }
        }, 600000);
    }
};

// Auto start on load
window.addEventListener('DOMContentLoaded', () => {
    App.init();
});