// =======================================================
// HYBRID ASSET TERMINAL — User Interface Operations
// =======================================================

const UI = {
    // ---------------------------------------------------
    // Navigation / Routing Views Swapping
    // ---------------------------------------------------
    routeView: function(viewName) {
        State.activeTab = viewName;

        // Hide all views
        document.querySelectorAll('.view-container').forEach(el => {
            el.style.display = 'none';
        });

        // Show active view
        const activeContainer = Utils.$(`view-${viewName}`);
        if (activeContainer) {
            activeContainer.style.display = 'block';
        }

        // Toggle nav links active states
        document.querySelectorAll('.nav-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // Trigger updates depending on view
        if (viewName === 'sats') {
            this.buildChart();
            ApiService.fetchChartData();
        } else if (viewName === 'global') {
            this.renderAssetsTable();
            this.updateAggregatedStats();
            this.updateMarketHours();
        }
    },

    // ---------------------------------------------------
    // SATS Dashboard Operations
    // ---------------------------------------------------

    // Update SATS Price Hero elements
    renderSatsPrice: function(btc, md, cur) {
        const price = btc[cur];
        const change = btc[`${cur}_24h_change`];
        const mcap = btc[`${cur}_market_cap`];
        const vol = btc[`${cur}_24h_vol`];

        // Animate price change
        const priceEl = Utils.$('heroPrice');
        if (State.lastBtcPrice && price !== State.lastBtcPrice) {
            priceEl.classList.add(price > State.lastBtcPrice ? 'up' : 'down');
            setTimeout(() => priceEl.classList.remove('up', 'down'), 1200);
        }

        Utils.setText('heroPrice', Utils.fmtCurrency(price, cur));
        Utils.setText('heroCurrency', cur.toUpperCase());

        const chEl = Utils.$('heroChange');
        if (chEl) {
            chEl.textContent = Utils.fmtPct(change) + ' (24h)';
            chEl.className = 'change ' + (change >= 0 ? 'up' : 'down');
        }

        Utils.setText('heroHigh', Utils.fmtCurrency(md.high_24h[cur], cur));
        Utils.setText('heroLow', Utils.fmtCurrency(md.low_24h[cur], cur));
        Utils.setText('heroMcap', Utils.fmtBig(mcap, cur));
        Utils.setText('heroVol', Utils.fmtBig(vol, cur));
        Utils.setText('heroUpdated', 'Updated: ' + Utils.fmtTime(Date.now()));

        const circ = md.circulating_supply;
        Utils.setText('mCirc', circ ? Utils.fmtNum(circ) + ' BTC' : '—');
        if (circ) {
            const pct = (circ / 21000000) * 100;
            Utils.setText('mSupplyPct', pct.toFixed(2) + '%');
            const fill = Utils.$('supplyFill');
            if (fill) fill.style.width = pct + '%';
        }

        const ath = md.ath?.[cur];
        const athPct = md.ath_change_percentage?.[cur];
        Utils.setText('mATH', ath ? Utils.fmtCurrency(ath, cur) : '—');
        const athEl = Utils.$('mATHPct');
        if (athEl && athPct != null) {
            athEl.textContent = Utils.fmtPct(athPct);
            athEl.className = athPct >= 0 ? 'metric-value up' : 'metric-value down';
        }

        const c7d = md.price_change_percentage_7d_in_currency?.[cur];
        const c30d = md.price_change_percentage_30d_in_currency?.[cur];
        
        const el7 = Utils.$('m7d'); 
        if (el7) { 
            el7.textContent = Utils.fmtPct(c7d); 
            el7.className = c7d >= 0 ? 'metric-value up' : 'metric-value down'; 
        }
        
        const el30 = Utils.$('m30d'); 
        if (el30) { 
            el30.textContent = Utils.fmtPct(c30d); 
            el30.className = c30d >= 0 ? 'metric-value up' : 'metric-value down'; 
        }
    },

    // Draw SATS Fear & Greed needle (Canvas indicator)
    drawFearGreedGauge: function(value, label) {
        const canvas = Utils.$('fearGreedGauge');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        const cx = W / 2, cy = H - 10;
        const r = Math.min(cx, cy) * 0.85;
        const lw = r * 0.18;

        // Background gauge arc
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI, 0);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = lw;
        ctx.lineCap = 'round';
        ctx.stroke();

        // needle colored indicator
        let color;
        if (value <= 24) color = '#ff4d6d';
        else if (value <= 46) color = '#ff9f2a';
        else if (value <= 54) color = '#f7d26a';
        else if (value <= 74) color = '#00d4a0';
        else color = '#4dff91';

        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * (value / 100));
        ctx.strokeStyle = color;
        ctx.lineWidth = lw;
        ctx.lineCap = 'round';
        ctx.stroke();

        const fgVal = Utils.$('fgValue');
        if (fgVal) { fgVal.textContent = value; fgVal.style.color = color; }
        const fgLbl = Utils.$('fgLabel');
        if (fgLbl) { fgLbl.textContent = label || 'Neutral'; fgLbl.style.color = color; }
    },

    // Render SATS Reddit feed news
    renderNewsSats: function(posts) {
        const grid = Utils.$('newsGrid');
        if (!grid) return;
        if (!posts?.length) {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text3); font-size:0.8rem;">No news posts found.</div>';
            return;
        }

        grid.innerHTML = posts.map(item => {
            let img = '';
            if (item.preview?.images?.[0]?.source?.url) {
                img = item.preview.images[0].source.url.replace(/&amp;/g, '&');
            } else if (item.thumbnail?.startsWith('http')) {
                img = item.thumbnail.replace(/&amp;/g, '&');
            }

            const title = Utils.escHTML(item.title);
            const date = new Date(item.created_utc * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

            return `
                <div class="news-card">
                    ${img ? `<img class="news-img" src="${img}" alt="" loading="lazy" onerror="this.style.display='none'">` : ''}
                    <div class="news-content">
                        <div class="news-title"><a href="https://reddit.com${item.permalink}" target="_blank" rel="noopener noreferrer">${title}</a></div>
                        <div class="news-meta">
                            <span class="sub">r/${Utils.escHTML(item.subreddit)}</span>
                            <span class="news-score">▲ ${(item.ups || 0).toLocaleString()} · ${date}</span>
                        </div>
                    </div>
                </div>`;
        }).join('');
    },

    // News feed errors (SATS)
    renderNewsErrorSats: function(category, errMsg) {
        const grid = Utils.$('newsGrid');
        if (grid) {
            grid.innerHTML = `<div style="grid-column:1/-1; padding:30px; color:var(--text3); font-size:0.75rem; text-align:center;">
                Reddit feed for r/${category} is currently blocked by CORS limits.
                <br/><small style="color:var(--text3); margin-top:8px; display:block;">Error details: ${errMsg}</small>
            </div>`;
        }
    },

    // Loader display for news
    showFeedLoaderSats: function() {
        const grid = Utils.$('newsGrid');
        if (grid) {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text3); font-size:0.8rem; letter-spacing:0.1em; animation: pulse 1.5s ease infinite;">LOADING NEWS…</div>';
        }
    },

    // ---------------------------------------------------
    // SATS Chart (Chart.js) Controllers
    // ---------------------------------------------------
    setChartLoading: function(v) {
        const s = Utils.$('chartSpinner');
        if (s) s.classList.toggle('visible', v);
        const btn = Utils.$('refreshBtn');
        if (btn) btn.classList.toggle('spinning', v);
    },

    updateChartStatus: function(msg, isErr) {
        const el = Utils.$('statusMsg');
        if (el) { el.textContent = msg; el.className = 'status-text ' + (isErr ? 'err' : 'ok'); }
        const badge = Utils.$('chartStatus');
        if (badge) badge.textContent = isErr ? 'Error' : 'Live';
        Utils.setText('lastUpdatedTime', Utils.fmtTime(Date.now()));
    },

    // Chart.js helper mathematical converters
    filterForTimeframe: function(data, tf) {
        const now = Date.now();
        const windows = { '1H': 3600000, '4H': 14400000 };
        if (windows[tf]) {
            return data.filter(p => p[0] >= now - windows[tf]);
        }
        return data;
    },

    aggregateOHLC: function(data, intervalMs) {
        if (!data?.length) return [];
        const result = [];
        let bucket = null, prices = [];

        for (const [ts, price] of data) {
            const bucketTs = Math.floor(ts / intervalMs) * intervalMs;
            if (bucket !== bucketTs) {
                if (prices.length) result.push({ x: bucket, o: prices[0], h: Math.max(...prices), l: Math.min(...prices), c: prices[prices.length - 1] });
                bucket = bucketTs;
                prices = [price];
            } else {
                prices.push(price);
            }
        }
        if (prices.length) result.push({ x: bucket, o: prices[0], h: Math.max(...prices), l: Math.min(...prices), c: prices[prices.length - 1] });
        return result;
    },

    buildChart: function() {
        if (State.priceChart) State.priceChart.destroy();
        const canvas = Utils.$('priceChart');
        if (!canvas) return;

        const isCandlestick = State.chartType === 'candlestick';
        State.priceChart = new Chart(canvas.getContext('2d'), {
            type: isCandlestick ? 'candlestick' : 'line',
            data: {
                datasets: [{
                    label: 'BTC Price',
                    data: [],
                    borderColor: '#f7931a',
                    backgroundColor: 'rgba(247,147,26,0.07)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    color: { up: '#00d4a0', down: '#ff4d6d', unchanged: '#7a9bb5' }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(8,10,14,0.95)',
                        titleColor: '#c8d8e8',
                        bodyColor: '#7a9bb5',
                        borderColor: '#f7931a',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label(ctx) {
                                if (isCandlestick && ctx.raw) {
                                    const { o, h, l, c } = ctx.raw;
                                    return [
                                        `O: ${Utils.fmtCurrency(o, State.currency)}`, 
                                        `H: ${Utils.fmtCurrency(h, State.currency)}`, 
                                        `L: ${Utils.fmtCurrency(l, State.currency)}`, 
                                        `C: ${Utils.fmtCurrency(c, State.currency)}`
                                    ];
                                }
                                return Utils.fmtCurrency(ctx.parsed.y, State.currency);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: { 
                            unit: { '1H': 'minute', '4H': 'minute', '1D': 'hour', '1W': 'day' }[State.chartTf] || 'hour', 
                            tooltipFormat: 'MMM dd HH:mm', 
                            displayFormats: { minute: 'HH:mm', hour: 'HH:00', day: 'MMM dd' } 
                        },
                        grid: { color: 'rgba(31,45,61,0.5)' },
                        ticks: { color: '#3d5a73', maxTicksLimit: 10 }
                    },
                    y: {
                        grid: { color: 'rgba(31,45,61,0.5)' },
                        ticks: { color: '#3d5a73', callback: v => Utils.fmtCurrency(v, State.currency) }
                    }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });
    },

    renderChartData: function() {
        if (!State.priceChart || !State.rawPrices.length) return;
        const filtered = this.filterForTimeframe(State.rawPrices, State.chartTf);
        let chartData;
        if (State.chartType === 'candlestick') {
            const candleInterval = { '1H': 5 * 60000, '4H': 15 * 60000, '1D': 60 * 60000, '1W': 4 * 3600000 }[State.chartTf] || 300000;
            chartData = this.aggregateOHLC(filtered, candleInterval);
        } else {
            chartData = filtered.map(([ts, price]) => ({ x: ts, y: price }));
        }
        State.priceChart.data.datasets[0].data = chartData;
        State.priceChart.options.scales.x.time.unit = { '1H': 'minute', '4H': 'minute', '1D': 'hour', '1W': 'day' }[State.chartTf] || 'hour';
        State.priceChart.update('none');
    },


    // ---------------------------------------------------
    // Global Multi-Asset Terminal Operations
    // ---------------------------------------------------

    // Leaderboard Assets Table (Stocks + Crypto mixed)
    renderAssetsTable: function() {
        const tbody = Utils.$('stocksTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        // Sort assets by market cap descending
        const sortedAssets = [...State.assets].sort((a, b) => b.baseCap - a.baseCap);

        sortedAssets.forEach((asset, idx) => {
            const tr = document.createElement('tr');
            tr.id = `asset-row-${asset.symbol}`;

            const isCrypto = asset.type === 'crypto';
            const symbolClass = isCrypto ? 'crypto-symbol' : 'stock-symbol';
            const badgeClass = isCrypto ? 'crypto-badge' : 'range-badge';
            
            // Format price decimals
            const decimalDigits = isCrypto && asset.basePrice > 1000 ? 0 : 2;

            tr.innerHTML = `
                <td>
                    <div class="stock-name-cell">
                        <span class="stock-rank">${idx + 1}</span>
                        <span class="stock-logo">${asset.logo}</span>
                        <span class="${symbolClass}">${asset.symbol}</span>
                        <span class="asset-full-name">${asset.name}</span>
                    </div>
                </td>
                <td class="hide-mobile" style="color:var(--muted); font-size:11.5px;">${asset.exchange}</td>
                <td class="num-col" id="price-${asset.symbol}">${Utils.fmtCurrency(asset.basePrice, State.currency, { min: decimalDigits, max: decimalDigits })}</td>
                <td class="num-col" id="change-${asset.symbol}">${Utils.changeSpan(asset.change)}</td>
                <td class="num-col hide-mobile" id="cap-${asset.symbol}">${Utils.fmtBig(asset.baseCap, State.currency)}</td>
                <td class="num-col hide-tablet">
                    <span class="${badgeClass}">${asset.targetVal}</span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    // Update the Global asset stats (combined caps, indices, VIX sentiment updates)
    updateAggregatedStats: function() {
        let totalCap = 0;
        let totalChangeSum = 0;

        const btc = State.assets.find(a => a.symbol === 'BTC');
        const eth = State.assets.find(a => a.symbol === 'ETH');

        State.assets.forEach(asset => {
            totalCap += asset.baseCap;
            totalChangeSum += asset.change;
        });

        const avgChange = totalChangeSum / State.assets.length;

        // sync top mini cards (global dashboard stats)
        if (btc) {
            const btcPriceEl = Utils.$('btcPrice');
            const btcChangeEl = Utils.$('btcChange');
            if (btcPriceEl) btcPriceEl.textContent = Utils.fmtCurrency(btc.basePrice, State.currency, { min: 0, max: 0 });
            if (btcChangeEl) btcChangeEl.innerHTML = Utils.changeSpan(btc.change);
        }
        if (eth) {
            const ethPriceEl = Utils.$('ethPrice');
            const ethChangeEl = Utils.$('ethChange');
            if (ethPriceEl) ethPriceEl.textContent = Utils.fmtCurrency(eth.basePrice, State.currency, { min: 0, max: 0 });
            if (ethChangeEl) ethChangeEl.innerHTML = Utils.changeSpan(eth.change);
        }

        const totalCapEl = Utils.$('totalCap');
        const totalCapChangeEl = Utils.$('totalCapChange');
        if (totalCapEl) totalCapEl.textContent = Utils.fmtBig(totalCap, State.currency);
        if (totalCapChangeEl) totalCapChangeEl.innerHTML = Utils.changeSpan(avgChange);

        const combinedValCard = Utils.$('combinedValCard');
        if (combinedValCard) combinedValCard.textContent = Utils.fmtBig(totalCap, State.currency);

        // Crypto dominance percentage
        if (btc) {
            const dom = (btc.baseCap / totalCap) * 100;
            const cryptoDomEl = Utils.$('cryptoDom');
            if (cryptoDomEl) cryptoDomEl.textContent = dom.toFixed(2) + '%';
        }

        // VIX calculation shifts
        let vixChange = (avgChange * -1.8);
        State.vixIndex = Math.max(9.0, Math.min(35.0, State.vixIndex + vixChange * 0.1));

        const vixRawValEl = Utils.$('vixRawValue');
        if (vixRawValEl) {
            vixRawValEl.textContent = State.vixIndex.toFixed(2);
            vixRawValEl.style.color = State.vixIndex > 20 ? 'var(--down)' : 'var(--accent)';
        }

        let sentimentScore = Math.round(100 - ((State.vixIndex - 9) / 26) * 100);
        sentimentScore = Math.max(10, Math.min(95, sentimentScore));

        let label = 'Balanced Markets';
        if (sentimentScore <= 35) {
            label = 'Extreme Fear';
        } else if (sentimentScore >= 65) {
            label = 'Extreme Greed';
        }

        this.updateSentimentDial(sentimentScore, label);
    },

    // Global SVG Fear & Greed needle
    updateSentimentDial: function(score, classification) {
        const sentimentScoreEl = Utils.$('sentimentScore');
        const sentimentLabelEl = Utils.$('sentimentLabel');
        const sentimentBadgeEl = Utils.$('sentimentBadge');
        const sentimentArcEl = Utils.$('sentimentArc');
        const vixSentimentEl = Utils.$('vixSentiment');
        const vixValueEl = Utils.$('vixValue');

        if (!sentimentScoreEl) return;

        sentimentScoreEl.textContent = score;

        // Arc offset calculation
        const dash = (score / 100) * 157;
        let color = 'var(--accent2)'; // Stock blue
        let badgeText = 'Neutral';

        const classificationLower = classification.toLowerCase();
        if (classificationLower.includes('fear')) {
            color = 'var(--down)'; // neon red
            badgeText = 'Fearful';
        } else if (classificationLower.includes('greed')) {
            color = 'var(--accent)'; // neon green
            badgeText = 'Greedy';
        }

        if (sentimentBadgeEl) sentimentBadgeEl.textContent = badgeText;
        if (sentimentArcEl) {
            sentimentArcEl.style.stroke = color;
            sentimentArcEl.setAttribute('stroke-dasharray', `${dash} 157`);
        }
        if (sentimentLabelEl) {
            sentimentLabelEl.textContent = classification;
            sentimentLabelEl.style.color = color;
        }
        if (sentimentScoreEl) sentimentScoreEl.style.color = color;

        if (vixSentimentEl) vixSentimentEl.textContent = classification;
        if (vixValueEl) {
            vixValueEl.innerHTML = `VIX Index: <span style="font-weight:bold;color:${color}">${State.vixIndex.toFixed(2)}</span>`;
        }
    },

    // Global Reddit feed news rendering
    renderRedditFeedGlobal: function(posts) {
        const list = Utils.$('feedList');
        if (!list) return;

        if (!posts || !posts.length) {
            list.innerHTML = '<li style="padding:24px;color:var(--muted);text-align:center;">No discussion posts found.</li>';
            return;
        }

        list.innerHTML = posts.map(p => {
            const ago = Utils.relTime(p.created_utc);
            const ups = Utils.fmtNum(p.ups);
            return `
                <li class="feed-item">
                    <a href="https://www.reddit.com${p.permalink}" target="_blank" rel="noopener noreferrer">
                        <div class="feed-item-title">${Utils.escHTML(p.title)}</div>
                        <div class="feed-meta">
                            <span>r/${p.subreddit}</span>
                            <span>·</span>
                            <span>${ago}</span>
                            <span>·</span>
                            <span style="color:var(--accent-crypto);">▲ ${ups} upvotes</span>
                        </div>
                    </a>
                </li>`;
        }).join('');
    },

    renderRedditFeedErrorGlobal: function(subreddit) {
        const list = Utils.$('feedList');
        if (list) {
            list.innerHTML = `
                <li style="padding:24px;color:var(--down);text-align:center;font-size:12.5px;">
                    Reddit discussions for r/${subreddit} are offline due to CORS locks.
                    <br/><span style="color:var(--muted); font-size:10px;">Toggle tabs or check network logs to retry.</span>
                </li>`;
        }
    },

    showFeedLoaderGlobal: function() {
        const list = Utils.$('feedList');
        if (list) {
            list.innerHTML = '<li style="padding:32px;text-align:center;"><div class="spinner"></div></li>';
        }
    },

    // Global dashboard clocks/timezone updater
    updateMarketHours: function() {
        const now = new Date();
        const clockEl = Utils.$('clock');
        if (clockEl) {
            clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
        }

        // New York (NYSE)
        const nyTimeStr = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false, hour: '2-digit', minute: '2-digit' });
        const nyWeekday = now.getDay();
        const nyHour = parseInt(nyTimeStr.split(':')[0]);
        const nyMin = parseInt(nyTimeStr.split(':')[1]);
        const nyTotalMin = nyHour * 60 + nyMin;
        const nyOpen = nyWeekday >= 1 && nyWeekday <= 5 && nyTotalMin >= (9 * 60 + 30) && nyTotalMin <= (16 * 60);

        const nyDot = Utils.$('nyDot');
        const nyTimeEl = Utils.$('nyTime');
        if (nyDot) nyDot.className = `market-dot ${nyOpen ? 'market-open' : 'market-closed'}`;
        if (nyTimeEl) {
            nyTimeEl.innerHTML = `${nyTimeStr} EDT <span style="font-size:10.5px; color:${nyOpen ? 'var(--accent)' : 'var(--muted)'}; font-weight:bold;">${nyOpen ? '[OPEN]' : '[CLOSED]'}</span>`;
        }

        // Riyadh (Tadawul)
        const riTimeStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Riyadh', hour12: false, hour: '2-digit', minute: '2-digit' });
        const riHour = parseInt(riTimeStr.split(':')[0]);
        const riMin = parseInt(riTimeStr.split(':')[1]);
        const riTotalMin = riHour * 60 + riMin;
        const riWeekday = now.getDay();
        const riOpen = riWeekday >= 0 && riWeekday <= 4 && riTotalMin >= (10 * 60) && riTotalMin <= (15 * 60);

        const riDot = Utils.$('riDot');
        const riTimeEl = Utils.$('riTime');
        if (riDot) riDot.className = `market-dot ${riOpen ? 'market-open' : 'market-closed'}`;
        if (riTimeEl) {
            riTimeEl.innerHTML = `${riTimeStr} AST <span style="font-size:10.5px; color:${riOpen ? 'var(--accent)' : 'var(--muted)'}; font-weight:bold;">${riOpen ? '[OPEN]' : '[CLOSED]'}</span>`;
        }

        // Taipei (TWSE)
        const taTimeStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Taipei', hour12: false, hour: '2-digit', minute: '2-digit' });
        const taHour = parseInt(taTimeStr.split(':')[0]);
        const taMin = parseInt(taTimeStr.split(':')[1]);
        const taTotalMin = taHour * 60 + taMin;
        const taWeekday = now.getDay();
        const taOpen = taWeekday >= 1 && taWeekday <= 5 && taTotalMin >= (9 * 60) && taTotalMin <= (13 * 60 + 30);

        const taDot = Utils.$('taDot');
        const taTimeEl = Utils.$('taTime');
        if (taDot) taDot.className = `market-dot ${taOpen ? 'market-open' : 'market-closed'}`;
        if (taTimeEl) {
            taTimeEl.innerHTML = `${taTimeStr} NST <span style="font-size:10.5px; color:${taOpen ? 'var(--accent)' : 'var(--muted)'}; font-weight:bold;">${taOpen ? '[OPEN]' : '[CLOSED]'}</span>`;
        }
    },

    // Mempool recommended fees (sat/vB rates) inside Global Hours box
    renderMempoolFeesGlobal: function(fees) {
        const btcBlockFeeRow = Utils.$('btcBlockFeeRow');
        const btcBlockFeeVal = Utils.$('btcBlockFeeVal');
        
        if (!btcBlockFeeRow || !btcBlockFeeVal) return;
        
        btcBlockFeeRow.style.display = 'flex';
        btcBlockFeeVal.textContent = `${fees.fastestFee} sat/vB`;
        btcBlockFeeVal.title = `Low: ${fees.hourFee} | Medium: ${fees.halfHourFee} | High: ${fees.fastestFee} sat/vB`;
    },

    // ---------------------------------------------------
    // Common Widgets (Quotes & Glossary)
    // ---------------------------------------------------

    // Cycle news quotes banner
    cycleQuotes: function() {
        const quoteTextEl = Utils.$('quoteText');
        if (!quoteTextEl) return;

        quoteTextEl.style.opacity = '0';

        setTimeout(() => {
            State.quotesIndex = (State.quotesIndex + 1) % CONFIG.QUOTES.length;
            quoteTextEl.textContent = `“${CONFIG.QUOTES[State.quotesIndex]}”`;
            quoteTextEl.style.opacity = '1';
        }, 400);
    },

    // Searchable Glossary init
    initGlossary: function() {
        const glossaryList = Utils.$('glossaryList');
        const glossarySearch = Utils.$('glossarySearch');

        if (!glossaryList) return;

        const renderList = (filterText = '') => {
            const query = filterText.toLowerCase().trim();
            const filtered = CONFIG.TERMS.filter(t => 
                t.term.toLowerCase().includes(query) || 
                t.def.toLowerCase().includes(query)
            );

            if (!filtered.length) {
                glossaryList.innerHTML = `<div style="padding:16px;color:var(--muted);text-align:center;">No matching terms found.</div>`;
                return;
            }

            glossaryList.innerHTML = filtered.map(t => `
                <div class="glossary-item">
                    <div class="glossary-term">${Utils.escHTML(t.term)}</div>
                    <div class="glossary-definition">${Utils.escHTML(t.def)}</div>
                </div>
            `).join('');
        };

        renderList();

        if (glossarySearch) {
            glossarySearch.addEventListener('input', e => {
                renderList(e.target.value);
            });
        }
    },

    // Load dynamic random terms and quotes in the tools panel
    showRandomTerm: function() {
        let idx;
        const currentTermIdx = State.termsIndex || 0;
        do { idx = Math.floor(Math.random() * CONFIG.TERMS.length); } while (idx === currentTermIdx);
        State.termsIndex = idx;
        const t = CONFIG.TERMS[idx];
        const termWordEl = Utils.$('termWord');
        const termDefEl = Utils.$('termDef');
        if (termWordEl) termWordEl.textContent = t.term;
        if (termDefEl) termDefEl.textContent = t.def;
    },

    showRandomQuote: function() {
        let idx;
        const currentQuoteIdx = State.quotesIndex || 0;
        do { idx = Math.floor(Math.random() * CONFIG.QUOTES.length); } while (idx === currentQuoteIdx);
        State.quotesIndex = idx;
        const el = Utils.$('satsQuoteText');
        if (el) el.textContent = CONFIG.QUOTES[idx];
    }
};
