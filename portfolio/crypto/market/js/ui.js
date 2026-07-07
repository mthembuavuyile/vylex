// =======================================================
// GLOBAL MARKET TERMINAL — User Interface Operations
// =======================================================

const UI = {
    // Render the sorted assets leaderboard table
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
            
            // Format price: crypto gets no decimals if > 1000, otherwise 2
            const decimalDigits = isCrypto && asset.basePrice > 1000 ? 0 : 2;

            tr.innerHTML = `
                <td>
                    <div class="stock-name-cell">
                        <span class="stock-rank">${idx + 1}</span>
                        <span class="stock-logo">${asset.logo}</span>
                        <span class="${symbolClass}">${asset.symbol}</span>
                        <span style="font-weight: 500;">${asset.name}</span>
                    </div>
                </td>
                <td class="hide-mobile" style="color:var(--muted); font-size:11px;">${asset.exchange}</td>
                <td class="num-col" id="price-${asset.symbol}">${Utils.fmtUSD(asset.basePrice, decimalDigits)}</td>
                <td class="num-col" id="change-${asset.symbol}">${Utils.changeSpan(asset.change)}</td>
                <td class="num-col hide-mobile" id="cap-${asset.symbol}">${Utils.fmtCompact(asset.baseCap)}</td>
                <td class="num-col hide-tablet">
                    <span class="${badgeClass}">${asset.targetVal}</span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    // Update the top stats row and other aggregated indices
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

        // Top stats cards updates
        if (btc) {
            const btcPriceEl = Utils.$('btcPrice');
            const btcChangeEl = Utils.$('btcChange');
            if (btcPriceEl) btcPriceEl.textContent = Utils.fmtUSD(btc.basePrice, 0);
            if (btcChangeEl) btcChangeEl.innerHTML = Utils.changeSpan(btc.change);
        }
        if (eth) {
            const ethPriceEl = Utils.$('ethPrice');
            const ethChangeEl = Utils.$('ethChange');
            if (ethPriceEl) ethPriceEl.textContent = Utils.fmtUSD(eth.basePrice, 0);
            if (ethChangeEl) ethChangeEl.innerHTML = Utils.changeSpan(eth.change);
        }

        const totalCapEl = Utils.$('totalCap');
        const totalCapChangeEl = Utils.$('totalCapChange');
        if (totalCapEl) totalCapEl.textContent = Utils.fmtCompact(totalCap);
        if (totalCapChangeEl) totalCapChangeEl.innerHTML = Utils.changeSpan(avgChange);

        const combinedValCard = Utils.$('combinedValCard');
        if (combinedValCard) combinedValCard.textContent = Utils.fmtCompact(totalCap);

        // Crypto Dominance (BTC Cap / Total Cap)
        if (btc) {
            const dom = (btc.baseCap / totalCap) * 100;
            const cryptoDomEl = Utils.$('cryptoDom');
            if (cryptoDomEl) cryptoDomEl.textContent = dom.toFixed(2) + '%';
        }

        // VIX calculation (simulated offset based on stock/crypto performance)
        let vixChange = (avgChange * -1.8);
        State.vixIndex = Math.max(9.0, Math.min(35.0, State.vixIndex + vixChange * 0.1));

        const vixRawValEl = Utils.$('vixRawValue');
        if (vixRawValEl) {
            vixRawValEl.textContent = State.vixIndex.toFixed(2);
            if (State.vixIndex > 20) {
                vixRawValEl.style.color = 'var(--down)';
            } else {
                vixRawValEl.style.color = 'var(--accent)';
            }
        }

        // Calculate dial properties
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

    // Handle Fear & Greed Sentiment Dial rendering
    updateSentimentDial: function(score, classification) {
        const sentimentScoreEl = Utils.$('sentimentScore');
        const sentimentLabelEl = Utils.$('sentimentLabel');
        const sentimentBadgeEl = Utils.$('sentimentBadge');
        const sentimentArcEl = Utils.$('sentimentArc');
        const vixSentimentEl = Utils.$('vixSentiment');
        const vixValueEl = Utils.$('vixValue');

        if (!sentimentScoreEl) return;

        sentimentScoreEl.textContent = score;

        // SVG stroke dash offset calculation
        const dash = (score / 100) * 157;
        let color = 'var(--accent2)'; // default blue
        let badgeText = 'Neutral';

        const classificationLower = classification.toLowerCase();
        if (classificationLower.includes('fear')) {
            color = 'var(--down)';
            badgeText = 'Fearful';
        } else if (classificationLower.includes('greed')) {
            color = 'var(--accent)';
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

    // Show spinner in Reddit feed panel
    showFeedLoader: function() {
        const list = Utils.$('feedList');
        if (list) {
            list.innerHTML = '<li style="padding:32px;text-align:center;"><div class="spinner"></div></li>';
        }
    },

    // Populate Reddit News items into DOM
    renderRedditFeed: function(posts) {
        const list = Utils.$('feedList');
        if (!list) return;

        if (!posts || !posts.length) {
            list.innerHTML = '<li style="padding:24px;color:var(--muted);text-align:center;">No recent posts found.</li>';
            return;
        }

        list.innerHTML = posts.map(p => {
            const ago = Utils.relTime(p.created_utc);
            const ups = Utils.fmt(p.ups);
            return `
                <li class="feed-item">
                    <a href="https://www.reddit.com${p.permalink}" target="_blank" rel="noopener noreferrer">
                        <div style="font-weight: 500; margin-bottom: 2px;">${Utils.escHtml(p.title)}</div>
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

    // Display network feed error messages (CORS fallbacks)
    renderRedditFeedError: function(subreddit) {
        const list = Utils.$('feedList');
        if (list) {
            list.innerHTML = `
                <li style="padding:24px;color:var(--down);text-align:center;font-size:12.5px;">
                    Reddit feed for r/${subreddit} is currently offline or blocked by CORS limits.
                    <br/><span style="color:var(--muted); font-size:10px;">Fallback: Toggle tabs or reload to retry</span>
                </li>`;
        }
    },

    // Update timezone clocks and market hours badges
    updateMarketHours: function() {
        const now = new Date();
        const clockEl = Utils.$('clock');
        if (clockEl) {
            clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
        }

        // New York (NYSE - Eastern Time)
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
            nyTimeEl.innerHTML = `${nyTimeStr} EDT <span style="font-size:10px; color:${nyOpen ? 'var(--accent)' : 'var(--muted)'}; font-weight:bold;">${nyOpen ? '[OPEN]' : '[CLOSED]'}</span>`;
        }

        // Riyadh (Tadawul - AST)
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
            riTimeEl.innerHTML = `${riTimeStr} AST <span style="font-size:10px; color:${riOpen ? 'var(--accent)' : 'var(--muted)'}; font-weight:bold;">${riOpen ? '[OPEN]' : '[CLOSED]'}</span>`;
        }

        // Taipei (TWSE - NST)
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
            taTimeEl.innerHTML = `${taTimeStr} NST <span style="font-size:10px; color:${taOpen ? 'var(--accent)' : 'var(--muted)'}; font-weight:bold;">${taOpen ? '[OPEN]' : '[CLOSED]'}</span>`;
        }
    },

    // Cycle items in the SATS Terminal Quotes Banner
    cycleQuotes: function() {
        const quoteTextEl = Utils.$('quoteText');
        if (!quoteTextEl) return;

        // Apply a brief fade-out transition
        quoteTextEl.style.opacity = '0';

        setTimeout(() => {
            // Select next index
            State.quotesIndex = (State.quotesIndex + 1) % CONFIG.QUOTES.length;
            quoteTextEl.textContent = `“${CONFIG.QUOTES[State.quotesIndex]}”`;
            quoteTextEl.style.opacity = '1';
        }, 400);
    },

    // Initialize glossary items and search listeners
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
                    <div class="glossary-term">${Utils.escHtml(t.term)}</div>
                    <div class="glossary-definition">${Utils.escHtml(t.def)}</div>
                </div>
            `).join('');
        };

        // Render initial complete glossary list
        renderList();

        // Listen for input filtering
        if (glossarySearch) {
            glossarySearch.addEventListener('input', e => {
                renderList(e.target.value);
            });
        }
    },

    // Render Mempool.space transaction fee details
    renderMempoolFees: function(fees) {
        const btcBlockFeeRow = Utils.$('btcBlockFeeRow');
        const btcBlockFeeVal = Utils.$('btcBlockFeeVal');
        
        if (!btcBlockFeeRow || !btcBlockFeeVal) return;
        
        // Show row and display values
        btcBlockFeeRow.style.display = 'flex';
        btcBlockFeeVal.textContent = `${fees.fastestFee} sat/vB`;
        btcBlockFeeVal.title = `Low priority: ${fees.hourFee} sat/vB | Medium priority: ${fees.halfHourFee} sat/vB`;
    }
};
