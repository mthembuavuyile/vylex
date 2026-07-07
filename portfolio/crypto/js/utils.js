// =======================================================
// HYBRID ASSET TERMINAL — Utility Helper Functions
// =======================================================

const Utils = {
    // Shorthand for DOM selector
    $: id => document.getElementById(id),

    // Format standard numbers with custom decimal digits
    fmt: function(n, digits = 0) {
        if (n === null || n === undefined || isNaN(n)) return '—';
        return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    },

    // Format numbers as currency based on active currency selected
    fmtCurrency: function(v, cur = 'usd', opts = {}) {
        if (v == null || isNaN(v)) return '—';
        const c = cur.toUpperCase();
        try {
            const decimals = ['JPY'].includes(c) ? 0 : (v >= 10000 ? 0 : 2);
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: c,
                minimumFractionDigits: opts.min ?? decimals,
                maximumFractionDigits: opts.max ?? (c === 'BTC' ? 8 : decimals),
                ...opts
            }).format(v);
        } catch (e) {
            return v.toLocaleString() + ' ' + c;
        }
    },

    // Format large financial values (Trillions, Billions, Millions)
    fmtBig: function(v, cur = 'usd') {
        if (v == null || isNaN(v)) return '—';
        if (v >= 1e12) return this.fmtCurrency(v / 1e12, cur) + 'T';
        if (v >= 1e9) return this.fmtCurrency(v / 1e9, cur) + 'B';
        if (v >= 1e6) return this.fmtCurrency(v / 1e6, cur) + 'M';
        return this.fmtCurrency(v, cur);
    },

    // Formats percentages
    fmtPct: function(v) {
        if (v == null || isNaN(v)) return '—';
        return (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
    },

    // Standard integer formatter
    fmtNum: function(v) {
        if (v == null || isNaN(v)) return '—';
        return new Intl.NumberFormat('en-US').format(Math.round(v));
    },

    // Format time from timestamps
    fmtTime: function(ts) {
        return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    // Create colored span HTML indicators for positive/negative change percentages
    changeSpan: function(pct) {
        if (pct === null || pct === undefined || isNaN(pct)) return '';
        const sign = pct >= 0 ? '+' : '';
        const cls = pct >= 0 ? 'up' : 'down';
        return `<span class="${cls}">${sign}${pct.toFixed(2)}%</span>`;
    },

    // Calculate relative elapsed time representation from epoch timestamp
    relTime: function(utcSeconds) {
        const diff = Math.floor(Date.now() / 1000) - utcSeconds;
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    },

    // Clean html inputs to prevent script injections
    escHTML: function(str) {
        if (typeof str !== 'string') return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }
};
