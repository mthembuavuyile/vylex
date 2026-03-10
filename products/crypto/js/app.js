// ==========================================
// SATS Bitcoin Terminal — Core Application
// ==========================================

const API = {
    CG: 'https://api.coingecko.com/api/v3',
    MEMPOOL: 'https://mempool.space/api',
    FNG: 'https://api.alternative.me/fng/?limit=1',
    REDDIT: {
        all_crypto: 'https://www.reddit.com/r/CryptoCurrency/.json?limit=20&sort=hot',
        bitcoin: 'https://www.reddit.com/r/Bitcoin/.json?limit=20&sort=hot',
        ethereum: 'https://www.reddit.com/r/ethereum/.json?limit=20&sort=hot',
        altcoins: 'https://www.reddit.com/r/altcoin/.json?limit=20&sort=hot',
        defi: 'https://www.reddit.com/r/defi/.json?limit=20&sort=hot',
        nfts: 'https://www.reddit.com/r/NFT/.json?limit=20&sort=hot',
    }
};

const QUOTES = [
    "Not your keys, not your coins.",
    "HODL: Hold On for Dear Life.",
    "Be your own bank.",
    "Stay humble, stack sats.",
    "Bitcoin is digital gold.",
    "Scarcity creates value — only 21 million BTC.",
    "Crypto never sleeps.",
    "Bear markets build strong hands.",
    "In code we trust.",
    "The blockchain never forgets.",
    "Buy the dip, stack the sats.",
    "Volatility is the price of opportunity.",
    "Hard money for a soft world.",
    "Decentralization is the revolution.",
    "Sats are the new cents.",
    "The halvening cometh.",
    "Stack sats like your future depends on it — because it does.",
    "Digital scarcity, endless possibility.",
    "WAGMI — We're All Gonna Make It.",
    "Proof of work is proof of value."
];

const TERMS = [
    { term: "HODL", def: "Hold On for Dear Life — the strategy of holding cryptocurrency regardless of market volatility." },
    { term: "Blockchain", def: "A distributed, immutable ledger that records transactions across a decentralized network of nodes." },
    { term: "Satoshi", def: "The smallest unit of Bitcoin — 0.00000001 BTC. Named after the pseudonymous creator Satoshi Nakamoto." },
    { term: "Lightning Network", def: "A Layer 2 payment protocol built on Bitcoin enabling fast, low-fee micropayments through off-chain payment channels." },
    { term: "Hash Rate", def: "The total computational power used by the Bitcoin network to mine and process transactions, measured in EH/s." },
    { term: "Mining", def: "The process of validating Bitcoin transactions and adding them to the blockchain, rewarded with newly minted BTC." },
    { term: "Halving", def: "An event every ~210,000 blocks (~4 years) that cuts the Bitcoin block reward in half, enforcing deflationary supply." },
    { term: "UTXO", def: "Unspent Transaction Output — the fundamental unit of Bitcoin accounting, representing spendable BTC." },
    { term: "Cold Wallet", def: "Cryptocurrency storage that is completely offline, providing maximum security against hacks." },
    { term: "DeFi", def: "Decentralized Finance — financial applications built on blockchain with no central intermediaries." },
    { term: "Gas Fee", def: "A fee paid to Ethereum validators to compensate for the computing energy required to process transactions." },
    { term: "Smart Contract", def: "Self-executing code stored on a blockchain that automatically enforces agreement terms." },
    { term: "Whale", def: "An individual or entity holding a large enough cryptocurrency position to influence market prices." },
    { term: "DYOR", def: "Do Your Own Research — essential advice reminding investors to independently verify before investing." },
    { term: "Proof of Work", def: "A consensus mechanism requiring computational effort to validate transactions and secure the blockchain." }
];

const COIN_META = {
    bitcoin: { name: 'Bitcoin', sym: 'BTC', logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
    ethereum: { name: 'Ethereum', sym: 'ETH', logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
    tether: { name: 'Tether', sym: 'USDT', logo: 'https://assets.coingecko.com/coins/images/325/small/Tether-logo.png' },
    binancecoin: { name: 'BNB', sym: 'BNB', logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
    ripple: { name: 'XRP', sym: 'XRP', logo: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png' },
    'usd-coin': { name: 'USD Coin', sym: 'USDC', logo: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png' },
    solana: { name: 'Solana', sym: 'SOL', logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
    tron: { name: 'TRON', sym: 'TRX', logo: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png' },
    dogecoin: { name: 'Dogecoin', sym: 'DOGE', logo: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png' },
    cardano: { name: 'Cardano', sym: 'ADA', logo: 'https://assets.coingecko.com/coins/images/975/small/cardano.png' },
    chainlink: { name: 'Chainlink', sym: 'LINK', logo: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png' },
    litecoin: { name: 'Litecoin', sym: 'LTC', logo: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png' },
    polkadot: { name: 'Polkadot', sym: 'DOT', logo: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png' },
};

// ---- STATE ----
let currency = 'usd';
let chartTf = '1H';
let chartType = 'line';
let priceChart = null;
let rawPrices = [];
let autoRefreshId = null;
let newsCache = {};
let currentNewsCategory = 'all_crypto';
let lastBtcPrice = 0;

// ---- FORMATTERS ----
function fmtCurrency(v, cur = 'usd', opts = {}) {
    if (v == null || isNaN(v)) return '—';
    const c = cur.toUpperCase();
    try {
        const decimals = ['JPY'].includes(c) ? 0 : (v >= 10000 ? 0 : 2);
        return new Intl.NumberFormat('en-US', {
            style: 'currency', currency: c,
            minimumFractionDigits: opts.min ?? decimals,
            maximumFractionDigits: opts.max ?? (c === 'BTC' ? 8 : decimals),
            ...opts
        }).format(v);
    } catch (e) {
        return v.toLocaleString() + ' ' + c;
    }
}

function fmtBig(v, cur = 'usd') {
    if (v == null || isNaN(v)) return '—';
    if (v >= 1e12) return fmtCurrency(v / 1e12, cur) + 'T';
    if (v >= 1e9) return fmtCurrency(v / 1e9, cur) + 'B';
    if (v >= 1e6) return fmtCurrency(v / 1e6, cur) + 'M';
    return fmtCurrency(v, cur);
}

function fmtPct(v) {
    if (v == null || isNaN(v)) return '—';
    return (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
}

function fmtNum(v) {
    if (v == null || isNaN(v)) return '—';
    return new Intl.NumberFormat('en-US').format(Math.round(v));
}

function fmtTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escHTML(s) {
    if (typeof s !== 'string') return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

// ---- DOM HELPERS ----
function $id(id) { return document.getElementById(id); }
function setText(id, v) { const el = $id(id); if (el) el.textContent = v; }
function setClass(id, cls) { const el = $id(id); if (el) el.className = cls; }
function pctClass(v) { return v >= 0 ? 'metric-value up' : 'metric-value down'; }

// ---- BITCOIN PRICE DATA ----
async function loadBtcPrice() {
    try {
        const [priceRes, coinRes] = await Promise.all([
            fetch(`${API.CG}/simple/price?ids=bitcoin&vs_currencies=${currency}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`),
            fetch(`${API.CG}/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`)
        ]);

        if (!priceRes.ok || !coinRes.ok) throw new Error('CoinGecko API error');

        const pData = await priceRes.json();
        const cData = await coinRes.json();
        const btc = pData.bitcoin;
        const md = cData.market_data;

        const cur = currency.toLowerCase();
        const price = btc[cur];
        const change = btc[`${cur}_24h_change`];
        const mcap = btc[`${cur}_market_cap`];
        const vol = btc[`${cur}_24h_vol`];

        // Animate price change
        const priceEl = $id('heroPrice');
        if (lastBtcPrice && price !== lastBtcPrice) {
            priceEl.classList.add(price > lastBtcPrice ? 'up' : 'down');
            setTimeout(() => priceEl.classList.remove('up', 'down'), 1200);
        }
        lastBtcPrice = price;

        setText('heroPrice', fmtCurrency(price, cur));
        setText('heroCurrency', currency.toUpperCase());

        const chEl = $id('heroChange');
        chEl.textContent = fmtPct(change) + ' (24h)';
        chEl.className = 'change ' + (change >= 0 ? 'up' : 'down');

        setText('heroHigh', fmtCurrency(md.high_24h[cur], cur));
        setText('heroLow', fmtCurrency(md.low_24h[cur], cur));
        setText('heroMcap', fmtBig(mcap, cur));
        setText('heroVol', fmtBig(vol, cur));
        setText('heroUpdated', 'Updated: ' + fmtTime(Date.now()));

        // Market stats
        const globalRes = await fetch(`${API.CG}/global`);
        if (globalRes.ok) {
            const gd = await globalRes.json();
            const dom = gd.data?.market_cap_percentage?.btc;
            setText('mDominance', dom ? dom.toFixed(1) + '%' : '—');
            setText('hDominance', dom ? dom.toFixed(1) + '%' : '—');
        }

        const circ = md.circulating_supply;
        setText('mCirc', circ ? fmtNum(circ) + ' BTC' : '—');
        if (circ) {
            const pct = (circ / 21000000) * 100;
            setText('mSupplyPct', pct.toFixed(2) + '%');
            const fill = $id('supplyFill');
            if (fill) fill.style.width = pct + '%';
        }

        const ath = md.ath?.[cur];
        const athPct = md.ath_change_percentage?.[cur];
        setText('mATH', ath ? fmtCurrency(ath, cur) : '—');
        const athEl = $id('mATHPct');
        if (athEl && athPct != null) {
            athEl.textContent = fmtPct(athPct);
            athEl.className = pctClass(athPct);
        }

        const c7d = md.price_change_percentage_7d_in_currency?.[cur];
        const c30d = md.price_change_percentage_30d_in_currency?.[cur];
        const el7 = $id('m7d'); if (el7) { el7.textContent = fmtPct(c7d); el7.className = pctClass(c7d); }
        const el30 = $id('m30d'); if (el30) { el30.textContent = fmtPct(c30d); el30.className = pctClass(c30d); }

        // Update chart summary
        updateChartStatus('Data refreshed', false);

    } catch (e) {
        console.error('Price load error', e);
        setText('heroPrice', 'API Error');
        updateChartStatus('API error: ' + e.message, true);
    }
}

// ---- NETWORK STATS ----
async function loadNetworkStats() {
    try {
        const [hrRes, diffRes, heightRes] = await Promise.all([
            fetch(`${API.MEMPOOL}/v1/mining/hashrate/1w`),
            fetch(`${API.MEMPOOL}/v1/difficulty-adjustment`),
            fetch(`${API.MEMPOOL}/blocks/tip/height`)
        ]);

        if (hrRes.ok) {
            const d = await hrRes.json();
            const hr = d?.currentHashrate;
            setText('nHash', hr ? (hr / 1e18).toFixed(2) + ' EH/s' : '—');
        }

        if (diffRes.ok) {
            const d = await diffRes.json();
            setText('nDiff', d.currentDifficulty ? (d.currentDifficulty / 1e12).toFixed(2) + ' T' : '—');
            const chEl = $id('nNextDiff');
            if (chEl && d.difficultyChange != null) {
                chEl.textContent = (d.difficultyChange >= 0 ? '+' : '') + d.difficultyChange.toFixed(2) + '%';
                chEl.className = 'metric-value ' + (d.difficultyChange >= 0 ? 'up' : 'down');
            }
        }

        if (heightRes.ok) {
            const height = parseInt(await heightRes.text());
            if (!isNaN(height)) {
                setText('nBlockHeight', fmtNum(height));
                setText('hBlock', fmtNum(height));

                const HALVING_INTERVAL = 210000;
                const epoch = Math.floor(height / HALVING_INTERVAL);
                const nextHalving = (epoch + 1) * HALVING_INTERVAL;
                const blocksLeft = nextHalving - height;
                const daysLeft = Math.floor(blocksLeft * 10 / 60 / 24);
                const hoursLeft = Math.floor((blocksLeft * 10 / 60) % 24);

                setText('halvingBlocks', fmtNum(blocksLeft));
                setText('halvingDays', `~${daysLeft}d ${hoursLeft}h remaining`);
                setText('hHalving', `~${daysLeft}d`);
            }
        }
    } catch (e) {
        console.error('Network stats error', e);
    }
}

// ---- MEMPOOL ----
async function loadMempool() {
    try {
        const [feeRes, mpRes] = await Promise.all([
            fetch(`${API.MEMPOOL}/v1/fees/recommended`),
            fetch(`${API.MEMPOOL}/mempool`)
        ]);

        if (feeRes.ok) {
            const d = await feeRes.json();
            setText('feeHigh', d.fastestFee ?? '—');
            setText('feeMed', d.halfHourFee ?? '—');
            setText('feeLow', d.hourFee ?? '—');
        }

        if (mpRes.ok) {
            const d = await mpRes.json();
            setText('mempoolSize', d.vsize ? (d.vsize / 1e6).toFixed(2) + ' vMB' : '—');
            setText('mempoolTxs', d.count ? fmtNum(d.count) : '—');
        }
    } catch (e) {
        console.error('Mempool error', e);
    }
}

// ---- RECENT BLOCKS ----
async function loadRecentBlocks() {
    const body = $id('recentBlocksBody');
    try {
        const res = await fetch(`${API.MEMPOOL}/v1/blocks`);
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
}

// ---- FEAR & GREED ----
async function loadFearGreed() {
    try {
        const res = await fetch(API.FNG);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        const d = data.data?.[0];
        if (!d) throw new Error('No data');
        const val = parseInt(d.value);
        drawFearGreedGauge(val, d.value_classification);
        setText('hFG', val);
        setText('fgUpdate', 'Updated: ' + new Date(d.timestamp * 1000).toLocaleDateString());
    } catch (e) {
        drawFearGreedGauge(50, 'Neutral');
        setText('fgValue', '—');
        setText('fgLabel', 'Unavailable');
    }
}

function drawFearGreedGauge(value, label) {
    const canvas = $id('fearGreedGauge');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2, cy = H - 10;
    const r = Math.min(cx, cy) * 0.85;
    const lw = r * 0.18;

    // BG arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 0);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Color based on value
    let color;
    if (value <= 24) color = '#ff4d6d';
    else if (value <= 46) color = '#ff9f2a';
    else if (value <= 54) color = '#f7d26a';
    else if (value <= 74) color = '#00d4a0';
    else color = '#4dff91';

    // Colored arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * (value / 100));
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Update text
    const fgVal = $id('fgValue');
    if (fgVal) { fgVal.textContent = value; fgVal.style.color = color; }
    const fgLbl = $id('fgLabel');
    if (fgLbl) { fgLbl.textContent = label || 'Neutral'; fgLbl.style.color = color; }
}

// ---- MARKET OVERVIEW ----
async function loadMarketOverview() {
    const body = $id('marketOverviewBody');
    try {
        const ids = Object.keys(COIN_META).join(',');
        const res = await fetch(`${API.CG}/simple/price?ids=${ids}&vs_currencies=${currency}&include_24hr_change=true`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        body.innerHTML = Object.entries(data).map(([id, info]) => {
            const meta = COIN_META[id];
            if (!meta) return '';
            const price = info[currency];
            const change = info[`${currency}_24h_change`];
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
            <div class="coin-price">${fmtCurrency(price, currency)}</div>
            <div class="coin-change ${change >= 0 ? 'up' : 'down'}">${fmtPct(change)}</div>
          </div>
        </div>`;
        }).join('');
    } catch (e) {
        body.innerHTML = '<div class="err-inline">Failed to load market data</div>';
    }
}

// ---- CHART ----
function getChartDays(tf) {
    return { '1H': 1, '4H': 1, '1D': 1, '1W': 7 }[tf] || 1;
}

function filterForTimeframe(data, tf) {
    const now = Date.now();
    const windows = { '1H': 3600000, '4H': 14400000 };
    if (windows[tf]) {
        return data.filter(p => p[0] >= now - windows[tf]);
    }
    return data;
}

function aggregateOHLC(data, intervalMs) {
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
}

function getCandleInterval(tf) {
    return { '1H': 5 * 60000, '4H': 15 * 60000, '1D': 60 * 60000, '1W': 4 * 3600000 }[tf] || 300000;
}

function getTimeUnit(tf) {
    return { '1H': 'minute', '4H': 'minute', '1D': 'hour', '1W': 'day' }[tf] || 'hour';
}

function buildChart() {
    if (priceChart) priceChart.destroy();
    const canvas = $id('priceChart');
    if (!canvas) return;

    const isCandlestick = chartType === 'candlestick';
    priceChart = new Chart(canvas.getContext('2d'), {
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
                                return [`O: ${fmtCurrency(o, currency)}`, `H: ${fmtCurrency(h, currency)}`, `L: ${fmtCurrency(l, currency)}`, `C: ${fmtCurrency(c, currency)}`];
                            }
                            return fmtCurrency(ctx.parsed.y, currency);
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: { unit: getTimeUnit(chartTf), tooltipFormat: 'MMM dd HH:mm', displayFormats: { minute: 'HH:mm', hour: 'HH:00', day: 'MMM dd' } },
                    grid: { color: 'rgba(31,45,61,0.5)' },
                    ticks: { color: '#3d5a73', maxTicksLimit: 10 }
                },
                y: {
                    grid: { color: 'rgba(31,45,61,0.5)' },
                    ticks: { color: '#3d5a73', callback: v => fmtCurrency(v, currency) }
                }
            },
            interaction: { intersect: false, mode: 'index' }
        }
    });
}

function renderChartData() {
    if (!priceChart || !rawPrices.length) return;
    const filtered = filterForTimeframe(rawPrices, chartTf);
    let chartData;
    if (chartType === 'candlestick') {
        chartData = aggregateOHLC(filtered, getCandleInterval(chartTf));
    } else {
        chartData = filtered.map(([ts, price]) => ({ x: ts, y: price }));
    }
    priceChart.data.datasets[0].data = chartData;
    priceChart.options.scales.x.time.unit = getTimeUnit(chartTf);
    priceChart.update('none');
}

async function loadChartData() {
    setChartLoading(true);
    updateChartStatus('Loading…', false);
    const days = getChartDays(chartTf);
    const cur = currency.toLowerCase();
    try {
        const res = await fetch(`${API.CG}/coins/bitcoin/market_chart?vs_currency=${cur}&days=${days}`);
        if (!res.ok) throw new Error('Chart API error');
        const data = await res.json();
        rawPrices = data.prices || [];
        renderChartData();
        updateChartStatus(`${chartTf} loaded`, false);
    } catch (e) {
        updateChartStatus('Chart error: ' + e.message, true);
        rawPrices = [];
        renderChartData();
    } finally {
        setChartLoading(false);
    }
}

function setChartLoading(v) {
    const s = $id('chartSpinner');
    if (s) s.classList.toggle('visible', v);
    const btn = $id('refreshBtn');
    if (btn) btn.classList.toggle('spinning', v);
}

function updateChartStatus(msg, isErr) {
    const el = $id('statusMsg');
    if (el) { el.textContent = msg; el.className = 'status-text ' + (isErr ? 'err' : 'ok'); }
    const badge = $id('chartStatus');
    if (badge) badge.textContent = isErr ? 'Error' : 'Live';
    setText('lastUpdatedTime', fmtTime(Date.now()));
}

// ---- CONVERTER ----
async function doConvert() {
    const amount = parseFloat($id('convAmount').value);
    const from = $id('convFrom').value;
    const to = $id('convTo').value;
    const resultEl = $id('convResult');

    if (isNaN(amount) || amount <= 0) { resultEl.innerHTML = 'Enter a valid amount'; return; }
    if (from === to) { resultEl.innerHTML = `<strong>${amount} ${from}</strong>`; return; }

    resultEl.textContent = 'Converting…';

    try {
        let result;
        if (from === 'BTC' || to === 'BTC') {
            const query = from === 'BTC' ? to : from;
            const res = await fetch(`${API.CG}/simple/price?ids=bitcoin&vs_currencies=${query.toLowerCase()}`);
            const data = await res.json();
            const rate = data.bitcoin[query.toLowerCase()];
            result = from === 'BTC' ? amount * rate : amount / rate;
        } else {
            const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`);
            const data = await res.json();
            result = data.rates?.[to];
        }

        if (result == null) throw new Error('Rate unavailable');
        const prec = to === 'BTC' ? 8 : 2;
        resultEl.innerHTML = `${amount} ${from} = <strong>${result.toFixed(prec)} ${to}</strong>`;
    } catch (e) {
        resultEl.innerHTML = `<span style="color:var(--red)">Error: ${e.message}</span>`;
    }
}

// ---- NEWS ----
async function loadNews(category) {
    const grid = $id('newsGrid');
    const cacheKey = `${category}_${new Date().getHours()}`;

    if (newsCache[cacheKey]) {
        renderNews(newsCache[cacheKey]);
        return;
    }

    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text3); font-size:0.8rem; letter-spacing:0.1em; animation: pulse 1.5s ease infinite;">LOADING NEWS…</div>';

    try {
        const url = API.REDDIT[category];
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`Reddit ${res.status}`);
        const data = await res.json();
        const posts = (data?.data?.children || [])
            .filter(p => p.data && p.data.title && !p.data.stickied && !p.data.over_18 && p.data.ups > 5)
            .slice(0, 9)
            .map(p => p.data);
        newsCache[cacheKey] = posts;
        renderNews(posts);
    } catch (e) {
        grid.innerHTML = `<div style="grid-column:1/-1; padding:30px; color:var(--text3); font-size:0.75rem; text-align:center;">
      Reddit unavailable or rate-limited. Try again later.<br><small style="color:var(--text3); margin-top:8px; display:block;">${e.message}</small>
    </div>`;
    }
}

function renderNews(posts) {
    const grid = $id('newsGrid');
    if (!posts?.length) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text3); font-size:0.8rem;">No posts found in this category.</div>';
        return;
    }

    grid.innerHTML = posts.map(item => {
        let img = '';
        if (item.preview?.images?.[0]?.source?.url) {
            img = item.preview.images[0].source.url.replace(/&amp;/g, '&');
        } else if (item.thumbnail?.startsWith('http')) {
            img = item.thumbnail.replace(/&amp;/g, '&');
        }

        const title = escHTML(item.title);
        const date = new Date(item.created_utc * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        return `<div class="news-card">
      ${img ? `<img class="news-img" src="${img}" alt="" loading="lazy" onerror="this.style.display='none'">` : ''}
      <div class="news-content">
        <div class="news-title"><a href="https://reddit.com${item.permalink}" target="_blank" rel="noopener noreferrer">${title}</a></div>
        <div class="news-meta">
          <span class="sub">r/${escHTML(item.subreddit)}</span>
          <span class="news-score">▲ ${(item.ups || 0).toLocaleString()} · ${date}</span>
        </div>
      </div>
    </div>`;
    }).join('');
}

// ---- TERM / QUOTE ----
let currentTermIdx = -1;
let currentQuoteIdx = -1;

function showTerm() {
    let idx;
    do { idx = Math.floor(Math.random() * TERMS.length); } while (idx === currentTermIdx);
    currentTermIdx = idx;
    const t = TERMS[idx];
    $id('termWord').textContent = t.term;
    $id('termDef').textContent = t.def;
}

function showQuote() {
    let idx;
    do { idx = Math.floor(Math.random() * QUOTES.length); } while (idx === currentQuoteIdx);
    currentQuoteIdx = idx;
    $id('quoteText').textContent = QUOTES[idx];
}

// ---- AUTO REFRESH ----
function startAutoRefresh() {
    if (autoRefreshId) clearInterval(autoRefreshId);
    if ($id('autoRefresh')?.checked) {
        autoRefreshId = setInterval(() => {
            loadBtcPrice();
        }, 30000);
    }
}

function stopAutoRefresh() {
    if (autoRefreshId) { clearInterval(autoRefreshId); autoRefreshId = null; }
}

// ---- FULL REFRESH ----
async function fullRefresh() {
    await Promise.all([
        loadChartData(),
        loadBtcPrice(),
        loadNetworkStats(),
        loadMempool(),
        loadRecentBlocks(),
        loadFearGreed(),
        loadMarketOverview()
    ]);
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
    // Build chart
    buildChart();

    // Event: currency
    $id('currencySelect').addEventListener('change', e => {
        currency = e.target.value.toLowerCase();
        loadBtcPrice();
        loadMarketOverview();
        loadChartData();
    });

    // Event: timeframe buttons
    $id('tfButtons').addEventListener('click', e => {
        const btn = e.target.closest('.tf-btn');
        if (!btn) return;
        chartTf = btn.dataset.tf;
        document.querySelectorAll('.tf-btn').forEach(b => b.classList.toggle('active', b.dataset.tf === chartTf));
        buildChart();
        loadChartData();
    });

    // Event: chart type toggle
    $id('chartTypeBtn').addEventListener('click', () => {
        chartType = chartType === 'line' ? 'candlestick' : 'line';
        $id('chartTypeBtn').textContent = 'Candles ' + (chartType === 'candlestick' ? 'ON' : 'OFF');
        $id('chartTypeBtn').classList.toggle('active', chartType === 'candlestick');
        buildChart();
        renderChartData();
    });

    // Event: refresh
    $id('refreshBtn').addEventListener('click', async () => {
        await fullRefresh();
        startAutoRefresh();
    });

    // Event: auto refresh toggle
    $id('autoRefresh').addEventListener('change', e => {
        if (e.target.checked) startAutoRefresh(); else stopAutoRefresh();
    });

    // Event: news tabs
    $id('newsTabs').addEventListener('click', e => {
        const tab = e.target.closest('.news-tab');
        if (!tab) return;
        document.querySelectorAll('.news-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentNewsCategory = tab.dataset.src;
        loadNews(currentNewsCategory);
    });

    // Event: converter
    $id('convBtn').addEventListener('click', doConvert);
    $id('convAmount').addEventListener('keydown', e => { if (e.key === 'Enter') doConvert(); });

    // Event: term / quote
    $id('newTermBtn').addEventListener('click', showTerm);
    $id('newQuoteBtn').addEventListener('click', showQuote);

    // Initial load
    showTerm();
    showQuote();
    loadNews(currentNewsCategory);

    // Staggered data load
    fullRefresh().then(() => startAutoRefresh());

    // Periodic updates (slower intervals for secondary data)
    setInterval(() => { loadNetworkStats(); loadRecentBlocks(); }, 120000);
    setInterval(() => { loadMempool(); }, 60000);
    setInterval(() => { loadFearGreed(); }, 300000);
    setInterval(() => { loadMarketOverview(); }, 180000);
    setInterval(() => { loadNews(currentNewsCategory); }, 600000);
});