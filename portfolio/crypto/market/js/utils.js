// =======================================================
// GLOBAL MARKET TERMINAL — Utility Helper Functions
// =======================================================

const Utils = {
    // Shorthand for DOM selector
    $: id => document.getElementById(id),

    // Format standard numbers with custom decimal digits
    fmt: function(n, digits = 0) {
        if (n === null || n === undefined) return '—';
        return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
    },

    // Format numbers as USD currency
    fmtUSD: function(n, digits = 2) {
        if (n === null || n === undefined) return '—';
        return '$' + this.fmt(n, digits);
    },

    // Format large financial parameters in readable trillions (T), billions (B), millions (M)
    fmtCompact: function(n) {
        if (!n) return '—';
        if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
        if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
        if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
        return '$' + this.fmt(n);
    },

    // Create colored span indicators for positive/negative change percentages
    changeSpan: function(pct) {
        if (pct === null || pct === undefined) return '';
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

    // Clean html inputs to secure inputs
    escHtml: function(str) {
        if (!str) return '';
        return str
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/'/g, '&#39;');
    }
};
