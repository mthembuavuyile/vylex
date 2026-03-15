window.NexoraRegistry.register({
    id: 'currency',
    name: 'Exchange Rate API',
    intents: [
        // "Convert 100 USD to ZAR" / "Convert 200 dollars to rand"
        /convert (\d+(?:\.\d+)?) (\w+) to (\w+)/i,

        // "100 USD to ZAR" / "200 dollars to rand" / "100 euros in pounds"
        /(\d+(?:\.\d+)?) (\w+) (?:to|in) (\w+)/i,

        // "What is 500 ZAR in USD?" / "What is 500 rand in dollars?"
        /what is (\d+(?:\.\d+)?) (\w+) (?:in|to) (\w+)/i,

        // "How much is 200 euros in dollars?" / "How much is 50 rand in dollars?"
        /how much is (\d+(?:\.\d+)?) (\w+) (?:in|to) (\w+)/i,

        // "Exchange rate USD to ZAR" / "Exchange rate for GBP"
        /exchange rate (?:for |of )?(\w+)(?: to (\w+))?/i,

        // "ZAR to USD rate" / "rand to dollar rate"
        /(\w+) to (\w+) rate/i,

        // "currency ZAR" / "currency rand"
        /^currency (\w+)/i
    ],

    // Map common words to ISO 4217 currency codes
    _currencyWords: {
        dollar: 'USD', dollars: 'USD', usd: 'USD',
        euro: 'EUR', euros: 'EUR', eur: 'EUR',
        pound: 'GBP', pounds: 'GBP', sterling: 'GBP', gbp: 'GBP',
        rand: 'ZAR', rands: 'ZAR', zar: 'ZAR',
        yen: 'JPY', jpy: 'JPY',
        rupee: 'INR', rupees: 'INR', inr: 'INR',
        yuan: 'CNY', renminbi: 'CNY', cny: 'CNY',
        franc: 'CHF', francs: 'CHF', chf: 'CHF',
        krona: 'SEK', sek: 'SEK',
        won: 'KRW', krw: 'KRW',
        peso: 'MXN', mxn: 'MXN',
        real: 'BRL', reais: 'BRL', brl: 'BRL',
        naira: 'NGN', ngn: 'NGN',
        krone: 'NOK', nok: 'NOK',
        dirham: 'AED', aed: 'AED',
        riyal: 'SAR', sar: 'SAR',
        lira: 'TRY', try: 'TRY',
        ruble: 'RUB', rubles: 'RUB', rub: 'RUB',
        dong: 'VND', vnd: 'VND',
        baht: 'THB', thb: 'THB',
        ringgit: 'MYR', myr: 'MYR',
        aud: 'AUD', 'australian dollar': 'AUD',
        cad: 'CAD', 'canadian dollar': 'CAD',
        nzd: 'NZD', 'new zealand dollar': 'NZD',
        hkd: 'HKD', 'hong kong dollar': 'HKD',
        sgd: 'SGD', 'singapore dollar': 'SGD',
        dkk: 'DKK', pln: 'PLN', czk: 'CZK',
        huf: 'HUF', zwd: 'ZWL', egp: 'EGP',
        kes: 'KES', shilling: 'KES',
        ghs: 'GHS', cedi: 'GHS'
    },

    _toCode(raw) {
        if (!raw) return null;
        const normalized = raw.trim().toLowerCase();
        if (this._currencyWords[normalized]) return this._currencyWords[normalized];
        // Strip trailing 's' for plurals not explicitly listed (e.g. "dollars" -> "dollar")
        if (normalized.endsWith('s') && this._currencyWords[normalized.slice(0, -1)]) {
            return this._currencyWords[normalized.slice(0, -1)];
        }
        // Assume it's already a currency code
        return raw.trim().toUpperCase();
    },

    // Currency name + flag emoji map for richer UI
    _meta: {
        USD: { name: 'US Dollar',           flag: '🇺🇸' },
        EUR: { name: 'Euro',                flag: '🇪🇺' },
        GBP: { name: 'British Pound',       flag: '🇬🇧' },
        ZAR: { name: 'South African Rand',  flag: '🇿🇦' },
        JPY: { name: 'Japanese Yen',        flag: '🇯🇵' },
        INR: { name: 'Indian Rupee',        flag: '🇮🇳' },
        CNY: { name: 'Chinese Yuan',        flag: '🇨🇳' },
        CHF: { name: 'Swiss Franc',         flag: '🇨🇭' },
        AUD: { name: 'Australian Dollar',   flag: '🇦🇺' },
        CAD: { name: 'Canadian Dollar',     flag: '🇨🇦' },
        NZD: { name: 'New Zealand Dollar',  flag: '🇳🇿' },
        HKD: { name: 'Hong Kong Dollar',    flag: '🇭🇰' },
        SGD: { name: 'Singapore Dollar',    flag: '🇸🇬' },
        SEK: { name: 'Swedish Krona',       flag: '🇸🇪' },
        NOK: { name: 'Norwegian Krone',     flag: '🇳🇴' },
        DKK: { name: 'Danish Krone',        flag: '🇩🇰' },
        MXN: { name: 'Mexican Peso',        flag: '🇲🇽' },
        BRL: { name: 'Brazilian Real',      flag: '🇧🇷' },
        KRW: { name: 'South Korean Won',    flag: '🇰🇷' },
        AED: { name: 'UAE Dirham',          flag: '🇦🇪' },
        SAR: { name: 'Saudi Riyal',         flag: '🇸🇦' },
        TRY: { name: 'Turkish Lira',        flag: '🇹🇷' },
        RUB: { name: 'Russian Ruble',       flag: '🇷🇺' },
        NGN: { name: 'Nigerian Naira',      flag: '🇳🇬' },
        KES: { name: 'Kenyan Shilling',     flag: '🇰🇪' },
        GHS: { name: 'Ghanaian Cedi',       flag: '🇬🇭' },
        EGP: { name: 'Egyptian Pound',      flag: '🇪🇬' },
        MYR: { name: 'Malaysian Ringgit',   flag: '🇲🇾' },
        THB: { name: 'Thai Baht',           flag: '🇹🇭' },
        VND: { name: 'Vietnamese Dong',     flag: '🇻🇳' },
        PLN: { name: 'Polish Zloty',        flag: '🇵🇱' },
        CZK: { name: 'Czech Koruna',        flag: '🇨🇿' },
        HUF: { name: 'Hungarian Forint',    flag: '🇭🇺' },
        IDR: { name: 'Indonesian Rupiah',   flag: '🇮🇩' },
        PHP: { name: 'Philippine Peso',     flag: '🇵🇭' },
        PKR: { name: 'Pakistani Rupee',     flag: '🇵🇰' },
        BDT: { name: 'Bangladeshi Taka',    flag: '🇧🇩' },
    },

    _getMeta(code) {
        return this._meta[code] || { name: code, flag: '🏳️' };
    },

    async handle(match) {
        // --- Parse amount + currencies from whichever intent fired ---
        let amount = 1;
        let fromCode, toCode;

        // Intents with 3 groups: amount, from, to
        if (match[1] && match[2] && match[3]) {
            const maybeAmount = parseFloat(match[1]);
            if (!isNaN(maybeAmount)) {
                amount    = maybeAmount;
                fromCode  = this._toCode(match[2]);
                toCode    = this._toCode(match[3]);
            } else {
                // "exchange rate EUR to USD" pattern — groups are from, to
                fromCode  = this._toCode(match[1]);
                toCode    = this._toCode(match[2]);
            }
        } else if (match[1] && match[2]) {
            // "ZAR to USD rate" — two currency groups
            fromCode = this._toCode(match[1]);
            toCode   = this._toCode(match[2]);
        } else if (match[1]) {
            // "exchange rate for GBP" — single currency vs USD
            fromCode = this._toCode(match[1]);
            toCode   = 'USD';
        }

        if (!fromCode || !toCode) {
            return { text: "Please specify both currencies, e.g. \"100 ZAR to USD\" or \"exchange rate EUR to GBP\"." };
        }

        if (fromCode === toCode) {
            return { text: `${fromCode} and ${toCode} are the same currency — the rate is 1:1.` };
        }

        // --- Fetch from Frankfurter (free, no key, ECB data) ---
        // Falls back to ExchangeRate-API open endpoint if Frankfurter fails
        let rate = null;
        let source = '';

        try {
            const res = await fetch(
                `https://api.frankfurter.app/latest?from=${fromCode}&to=${toCode}`
            );
            if (res.ok) {
                const data = await res.json();
                rate   = data.rates?.[toCode];
                source = 'Frankfurter (ECB)';
            }
        } catch (e) {
            console.warn('Frankfurter failed, trying fallback...');
        }

        // Fallback: open.er-api.com (free, no key for base USD)
        if (!rate) {
            try {
                const res = await fetch(
                    `https://open.er-api.com/v6/latest/${fromCode}`
                );
                if (res.ok) {
                    const data = await res.json();
                    if (data.result === 'success') {
                        rate   = data.rates?.[toCode];
                        source = 'ExchangeRate-API';
                    }
                }
            } catch (e) {
                console.warn('ExchangeRate-API fallback also failed.');
            }
        }

        if (!rate) {
            return {
                text: `Sorry, I couldn't fetch the exchange rate for ${fromCode} → ${toCode} right now. Please try again later.`
            };
        }

        const converted     = (amount * rate).toFixed(2);
        const rateFormatted = rate < 0.01
            ? rate.toExponential(4)
            : rate.toFixed(4);

        const fromMeta  = this._getMeta(fromCode);
        const toMeta    = this._getMeta(toCode);

        // Format numbers with commas
        const fmtNum = n => Number(n).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const html = `
        <div class="rich-widget currency-widget">
            <div class="widget-title">
                <i class="fas fa-coins"></i> Currency Converter
            </div>

            <div class="currency-conversion" style="
                display: flex;
                align-items: center;
                gap: 12px;
                margin: 14px 0;
                flex-wrap: wrap;
            ">
                <!-- FROM -->
                <div class="currency-box" style="
                    background: var(--surface-2, rgba(0,0,0,0.05));
                    border-radius: 12px;
                    padding: 14px 18px;
                    flex: 1;
                    min-width: 120px;
                    text-align: center;
                ">
                    <div style="font-size: 2rem; line-height: 1;">${fromMeta.flag}</div>
                    <div style="font-size: 1.4rem; font-weight: 700; margin-top: 6px;">
                        ${fmtNum(amount)}
                    </div>
                    <div style="font-size: 0.85rem; font-weight: 600; opacity: 0.7;">
                        ${fromCode}
                    </div>
                    <div style="font-size: 0.75rem; opacity: 0.55;">${fromMeta.name}</div>
                </div>

                <!-- ARROW -->
                <div style="
                    font-size: 1.4rem;
                    color: var(--primary);
                    flex-shrink: 0;
                ">
                    <i class="fas fa-arrow-right-long"></i>
                </div>

                <!-- TO -->
                <div class="currency-box" style="
                    background: var(--primary, #4f6ef7);
                    color: #fff;
                    border-radius: 12px;
                    padding: 14px 18px;
                    flex: 1;
                    min-width: 120px;
                    text-align: center;
                ">
                    <div style="font-size: 2rem; line-height: 1;">${toMeta.flag}</div>
                    <div style="font-size: 1.4rem; font-weight: 700; margin-top: 6px;">
                        ${fmtNum(converted)}
                    </div>
                    <div style="font-size: 0.85rem; font-weight: 600; opacity: 0.85;">
                        ${toCode}
                    </div>
                    <div style="font-size: 0.75rem; opacity: 0.7;">${toMeta.name}</div>
                </div>
            </div>

            <!-- Rate row -->
            <div style="
                font-size: 0.82rem;
                opacity: 0.6;
                text-align: center;
                margin-bottom: 4px;
            ">
                1 ${fromCode} = ${rateFormatted} ${toCode}
            </div>

            <!-- Reverse rate -->
            <div style="
                font-size: 0.78rem;
                opacity: 0.45;
                text-align: center;
                margin-bottom: 10px;
            ">
                1 ${toCode} = ${(1 / rate).toFixed(4)} ${fromCode}
            </div>

            <div style="font-size: 0.72rem; opacity: 0.4; text-align: right;">
                via ${escapeHtml(source)}
            </div>
        </div>`;

        return {
            html,
            text: `${amount} ${fromCode} = ${fmtNum(converted)} ${toCode} (rate: 1 ${fromCode} = ${rateFormatted} ${toCode})`
        };
    }
});

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}