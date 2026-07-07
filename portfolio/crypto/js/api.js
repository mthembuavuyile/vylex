// =======================================================
// HYBRID ASSET TERMINAL — Network API Services
// =======================================================

const ApiService = {
    // Fetch SATS Bitcoin prices & stats
    fetchBtcPriceAndStats: async function() {
        try {
            const cur = State.currency.toLowerCase();
            const [priceRes, coinRes] = await Promise.all([
                fetch(`${CONFIG.API.CG}/simple/price?ids=bitcoin&vs_currencies=${cur}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`),
                fetch(`${CONFIG.API.CG}/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`)
            ]);

            if (!priceRes.ok || !coinRes.ok) throw new Error('CoinGecko BTC price load failed');

            const pData = await priceRes.json();
            const cData = await coinRes.json();
            const btc = pData.bitcoin;
            const md = cData.market_data;

            // Update state
            State.lastBtcPrice = btc[cur];

            // Render stats inside SATS
            UI.renderSatsPrice(btc, md, cur);
            
            // Also sync it to Global assets list if BTC exists in leaderboard
            const globalBtc = State.assets.find(a => a.symbol === 'BTC');
            if (globalBtc) {
                globalBtc.basePrice = btc[cur];
                globalBtc.baseCap = btc[`${cur}_market_cap`] || globalBtc.baseCap;
                globalBtc.change = btc[`${cur}_24h_change`] || globalBtc.change;
                UI.renderAssetsTable();
            }

            // Load BTC Dominance
            const globalRes = await fetch(`${CONFIG.API.CG}/global`);
            if (globalRes.ok) {
                const gd = await globalRes.json();
                const dom = gd.data?.market_cap_percentage?.btc;
                if (dom) {
                    Utils.$('mDominance').textContent = dom.toFixed(1) + '%';
                    Utils.$('hDominance').textContent = dom.toFixed(1) + '%';
                    const cryptoDom = Utils.$('cryptoDom');
                    if (cryptoDom) cryptoDom.textContent = dom.toFixed(1) + '%';
                }
            }

            UI.updateChartStatus('Bitcoin stats refreshed', false);
        } catch (e) {
            console.warn('Bitcoin stats load failed.', e);
            UI.updateChartStatus('API load failed: ' + e.message, true);
        }
    },

    // Fetch live prices for Global Leaderboard (BTC & ETH) from CoinGecko
    fetchCryptoPrices: async function() {
        try {
            const cur = State.currency.toLowerCase();
            const res = await fetch(`${CONFIG.API.CG}/simple/price?ids=bitcoin,ethereum&vs_currencies=${cur}&include_24hr_change=true&include_market_cap=true`);
            if (!res.ok) throw new Error('CoinGecko simple price fetch failed');
            const data = await res.json();

            const btc = State.assets.find(a => a.symbol === 'BTC');
            const eth = State.assets.find(a => a.symbol === 'ETH');

            if (btc && data.bitcoin) {
                btc.basePrice = data.bitcoin[cur] || btc.basePrice;
                btc.baseCap = data.bitcoin[`${cur}_market_cap`] || btc.baseCap;
                btc.change = data.bitcoin[`${cur}_24h_change`] || btc.change;
            }

            if (eth && data.ethereum) {
                eth.basePrice = data.ethereum[cur] || eth.basePrice;
                eth.baseCap = data.ethereum[`${cur}_market_cap`] || eth.baseCap;
                eth.change = data.ethereum[`${cur}_24h_change`] || eth.change;
            }

            UI.renderAssetsTable();
            UI.updateAggregatedStats();
        } catch (e) {
            console.warn('Leaderboard crypto price load failed. Ticker ticks will override.', e);
        }
    },

    // Fetch Reddit news feeds (both SATS News and Global Discussion feeds)
    fetchRedditFeed: async function(category, isGlobal = false) {
        const cacheKey = `${category}_${new Date().getHours()}`;
        
        // Cache verify
        if (State.newsCache[cacheKey]) {
            if (isGlobal) {
                UI.renderRedditFeedGlobal(State.newsCache[cacheKey]);
            } else {
                UI.renderNewsSats(State.newsCache[cacheKey]);
            }
            return;
        }

        // Show spinner loader
        if (isGlobal) UI.showFeedLoaderGlobal(); else UI.showFeedLoaderSats();

        try {
            const url = CONFIG.API.REDDIT[category];
            if (!url) throw new Error('Subreddit route undefined');
            const res = await fetch(url, { headers: { Accept: 'application/json' } });
            if (!res.ok) throw new Error(`Reddit API status code: ${res.status}`);
            const data = await res.json();
            const posts = (data?.data?.children || [])
                .filter(p => p.data && p.data.title && !p.data.stickied && !p.data.over_18 && p.data.ups > 5)
                .slice(0, 10)
                .map(p => p.data);

            State.newsCache[cacheKey] = posts;

            if (isGlobal) {
                UI.renderRedditFeedGlobal(posts);
            } else {
                UI.renderNewsSats(posts);
            }
        } catch (e) {
            console.warn(`Reddit feed fetch failed for ${category}.`, e);
            if (isGlobal) {
                UI.renderRedditFeedErrorGlobal(category);
            } else {
                UI.renderNewsErrorSats(category, e.message);
            }
        }
    },

    // Fetch Alternative.me Fear & Greed index
    fetchFearAndGreed: async function() {
        try {
            const res = await fetch(CONFIG.API.FNG);
            if (!res.ok) throw new Error('Fear & Greed API connection failed');
            const data = await res.json();
            const d = data.data?.[0];
            if (!d) throw new Error('Fear & Greed data empty');
            const val = parseInt(d.value);
            
            // Draw Fear & Greed needle inside SATS
            UI.drawFearGreedGauge(val, d.value_classification);
            Utils.setText('hFG', val);
            Utils.setText('fgUpdate', 'Updated: ' + new Date(d.timestamp * 1000).toLocaleDateString());

            // Update Sentiment Dial inside Global Market
            UI.updateSentimentDial(val, d.value_classification);
        } catch (e) {
            console.warn('Alternative.me Fear & Greed index load failed.', e);
            UI.drawFearGreedGauge(50, 'Neutral');
            Utils.setText('fgValue', '—');
            Utils.setText('fgLabel', 'Unavailable');
        }
    },

    // Fetch Recommended Mempool fees (sat/vB rates)
    fetchMempoolFees: async function() {
        try {
            const [feeRes, mpRes] = await Promise.all([
                fetch(`${CONFIG.API.MEMPOOL}/v1/fees/recommended`),
                fetch(`${CONFIG.API.MEMPOOL}/mempool`)
            ]);

            if (feeRes.ok) {
                const d = await feeRes.json();
                // SATS fees
                Utils.setText('feeHigh', d.fastestFee ?? '—');
                Utils.setText('feeMed', d.halfHourFee ?? '—');
                Utils.setText('feeLow', d.hourFee ?? '—');
                
                // Global fees
                UI.renderMempoolFeesGlobal(d);
            }

            if (mpRes.ok) {
                const d = await mpRes.json();
                Utils.setText('mempoolSize', d.vsize ? (d.vsize / 1e6).toFixed(2) + ' vMB' : '—');
                Utils.setText('mempoolTxs', d.count ? Utils.fmtNum(d.count) : '—');
            }
        } catch (e) {
            console.warn('Mempool recommended fee fetch failed.', e);
        }
    },

    // Fetch Bitcoin network hashrate & adjustments
    fetchNetworkStats: async function() {
        try {
            const [hrRes, diffRes, heightRes] = await Promise.all([
                fetch(`${CONFIG.API.MEMPOOL}/v1/mining/hashrate/1w`),
                fetch(`${CONFIG.API.MEMPOOL}/v1/difficulty-adjustment`),
                fetch(`${CONFIG.API.MEMPOOL}/blocks/tip/height`)
            ]);

            if (hrRes.ok) {
                const d = await hrRes.json();
                const hr = d?.currentHashrate;
                Utils.setText('nHash', hr ? (hr / 1e18).toFixed(2) + ' EH/s' : '—');
            }

            if (diffRes.ok) {
                const d = await diffRes.json();
                Utils.setText('nDiff', d.currentDifficulty ? (d.currentDifficulty / 1e12).toFixed(2) + ' T' : '—');
                const chEl = Utils.$('nNextDiff');
                if (chEl && d.difficultyChange != null) {
                    chEl.textContent = (d.difficultyChange >= 0 ? '+' : '') + d.difficultyChange.toFixed(2) + '%';
                    chEl.className = 'metric-value ' + (d.difficultyChange >= 0 ? 'up' : 'down');
                }
            }

            if (heightRes.ok) {
                const height = parseInt(await heightRes.text());
                if (!isNaN(height)) {
                    Utils.setText('nBlockHeight', Utils.fmtNum(height));
                    Utils.setText('hBlock', Utils.fmtNum(height));

                    const HALVING_INTERVAL = 210000;
                    const epoch = Math.floor(height / HALVING_INTERVAL);
                    const nextHalving = (epoch + 1) * HALVING_INTERVAL;
                    const blocksLeft = nextHalving - height;
                    const daysLeft = Math.floor(blocksLeft * 10 / 60 / 24);
                    const hoursLeft = Math.floor((blocksLeft * 10 / 60) % 24);

                    Utils.setText('halvingBlocks', Utils.fmtNum(blocksLeft));
                    Utils.setText('halvingDays', `~${daysLeft}d ${hoursLeft}h remaining`);
                    Utils.setText('hHalving', `~${daysLeft}d`);
                }
            }
        } catch (e) {
            console.warn('Network difficulty hashrate stats fetch failed.', e);
        }
    },

    // Fetch Recent block confirmations
    fetchRecentBlocks: async function() {
        const body = Utils.$('recentBlocksBody');
        if (!body) return;
        try {
            const res = await fetch(`${CONFIG.API.MEMPOOL}/v1/blocks`);
            if (!res.ok) throw new Error('API error');
            const blocks = await res.json();
            body.innerHTML = blocks.slice(0, 6).map(b => `
                <div class="block-item">
                    <div>
                        <div class="block-height">#${b.height.toLocaleString()}</div>
                        <div class="block-meta">${new Date(b.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div>
                        <div class="block-size">${(b.size / 1e6).toFixed(2)} MB</div>
                        <div class="block-txs">${b.tx_count?.toLocaleString() || 0} txs</div>
                    </div>
                </div>`).join('');
        } catch (e) {
            body.innerHTML = '<div class="err-inline">Failed to load blocks</div>';
        }
    },

    // Fetch Pricing overview of secondary coins
    fetchMarketOverview: async function() {
        const body = Utils.$('marketOverviewBody');
        if (!body) return;
        try {
            const ids = Object.keys(CONFIG.COIN_META).join(',');
            const cur = State.currency.toLowerCase();
            const res = await fetch(`${CONFIG.API.CG}/simple/price?ids=${ids}&vs_currencies=${cur}&include_24hr_change=true`);
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            body.innerHTML = Object.entries(data).map(([id, info]) => {
                const meta = CONFIG.COIN_META[id];
                if (!meta) return '';
                const price = info[cur];
                const change = info[`${cur}_24h_change`];
                return `
                    <div class="coin-row">
                        <div class="coin-left">
                            <img class="coin-logo" src="${meta.logo}" alt="${meta.name}" loading="lazy" onerror="this.style.display='none'">
                            <div class="coin-info">
                                <div class="coin-name">${meta.name}</div>
                                <div class="coin-sym">${meta.sym}</div>
                            </div>
                        </div>
                        <div class="coin-right">
                            <div class="coin-price">${Utils.fmtCurrency(price, cur)}</div>
                            <div class="coin-change ${change >= 0 ? 'up' : 'down'}">${Utils.fmtPct(change)}</div>
                        </div>
                    </div>`;
            }).join('');
        } catch (e) {
            body.innerHTML = '<div class="err-inline">Failed to load market data</div>';
        }
    },

    // Fetch Bitcoin history for Chart.js
    fetchChartData: async function() {
        UI.setChartLoading(true);
        UI.updateChartStatus('Loading chart...', false);
        const days = { '1H': 1, '4H': 1, '1D': 1, '1W': 7 }[State.chartTf] || 1;
        const cur = State.currency.toLowerCase();
        try {
            const res = await fetch(`${CONFIG.API.CG}/coins/bitcoin/market_chart?vs_currency=${cur}&days=${days}`);
            if (!res.ok) throw new Error('Chart API connection failed');
            const data = await res.json();
            State.rawPrices = data.prices || [];
            UI.renderChartData();
            UI.updateChartStatus(`${State.chartTf} timeframe loaded`, false);
        } catch (e) {
            console.warn('Bitcoin chart data fetch failed.', e);
            UI.updateChartStatus('Chart API error: ' + e.message, true);
            State.rawPrices = [];
            UI.renderChartData();
        } finally {
            UI.setChartLoading(false);
        }
    }
};
