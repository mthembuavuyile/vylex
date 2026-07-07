// =======================================================
// GLOBAL MARKET TERMINAL — Configuration Constants
// =======================================================

const CONFIG = {
    // API endpoints for blockchain, crypto prices, sentiment, and news
    API: {
        CG: 'https://api.coingecko.com/api/v3',
        MEMPOOL: 'https://mempool.space/api',
        FNG: 'https://api.alternative.me/fng/?limit=1',
        REDDIT_BASE: 'https://www.reddit.com/r'
    },

    // Global Asset array (Stocks & Crypto mixed)
    // Updated SpaceX (SPCX) with NASDAQ June 12, 2026 historic IPO details ($2.1T+ valuation, ~$165 trading range)
    ASSETS_DATA: [
        { name: "NVIDIA Corporation", symbol: "NVDA", exchange: "NASDAQ", targetVal: "$4.7T - $5.2T", basePrice: 193.42, baseCap: 4.76e12, logo: "🟢", type: "stock", change: 1.45 },
        { name: "Alphabet Inc.", symbol: "GOOGL", exchange: "NASDAQ", targetVal: "$3.8T - $4.0T", basePrice: 156.84, baseCap: 3.84e12, logo: "🔵", type: "stock", change: 0.88 },
        { name: "Apple Inc.", symbol: "AAPL", exchange: "NASDAQ", targetVal: "$3.7T - $4.0T", basePrice: 242.10, baseCap: 3.72e12, logo: "🍎", type: "stock", change: 0.65 },
        { name: "Microsoft Corporation", symbol: "MSFT", exchange: "NASDAQ", targetVal: "$2.7T - $3.0T", basePrice: 382.75, baseCap: 2.84e12, logo: "💻", type: "stock", change: -0.32 },
        { name: "Amazon.com, Inc.", symbol: "AMZN", exchange: "NASDAQ", targetVal: "$2.2T - $2.8T", basePrice: 224.50, baseCap: 2.33e12, logo: "📦", type: "stock", change: 1.12 },
        { name: "SpaceX (Space Exploration)", symbol: "SPCX", exchange: "NASDAQ", targetVal: "$2.1T - $2.5T", basePrice: 164.85, baseCap: 2.15e12, logo: "🚀", type: "stock", change: 22.11 },
        { name: "Taiwan Semiconductor Mfg Co.", symbol: "TSM", exchange: "NYSE", targetVal: "$1.7T - $2.1T", basePrice: 182.15, baseCap: 1.88e12, logo: "🇹🇼", type: "stock", change: 2.10 },
        { name: "Broadcom Inc.", symbol: "AVGO", exchange: "NASDAQ", targetVal: "$1.4T - $2.0T", basePrice: 168.90, baseCap: 1.57e12, logo: "📡", type: "stock", change: 0.42 },
        { name: "Saudi Aramco", symbol: "2222", exchange: "TADAWUL", targetVal: "$1.5T - $1.8T", basePrice: 7.74, baseCap: 1.55e12, logo: "🇸🇦", type: "stock", change: -0.10 },
        { name: "Meta Platforms, Inc.", symbol: "META", exchange: "NASDAQ", targetVal: "$1.4T - $1.7T", basePrice: 574.65, baseCap: 1.46e12, logo: "♾️", type: "stock", change: -1.25 },
        { name: "Tesla, Inc.", symbol: "TSLA", exchange: "NASDAQ", targetVal: "$1.4T - $1.6T", basePrice: 442.80, baseCap: 1.41e12, logo: "⚡", type: "stock", change: 3.84 },
        { name: "Bitcoin", symbol: "BTC", exchange: "CRYPTO", targetVal: "Decentralized Layer 1", basePrice: 67250.00, baseCap: 1.32e12, logo: "₿", type: "crypto", change: 1.25 },
        { name: "Ethereum", symbol: "ETH", exchange: "CRYPTO", targetVal: "Smart Contract Platform", basePrice: 3480.00, baseCap: 4.18e11, logo: "Ξ", type: "crypto", change: -0.45 }
    ],

    // Baseline index values
    INDEX_DATA: {
        spy: { price: 5462.10, change: 0.42 },
        qqq: { price: 19684.50, change: 0.78 }
    },

    // Expanded cryptocurrency coin meta from SATS terminal
    COIN_META: {
        bitcoin: { name: 'Bitcoin', sym: 'BTC', logo: '₿' },
        ethereum: { name: 'Ethereum', sym: 'ETH', logo: 'Ξ' },
        tether: { name: 'Tether', sym: 'USDT', logo: '💵' },
        binancecoin: { name: 'BNB', sym: 'BNB', logo: '🔶' },
        ripple: { name: 'XRP', sym: 'XRP', logo: '✕' },
        'usd-coin': { name: 'USD Coin', sym: 'USDC', logo: '🇺🇸' },
        solana: { name: 'Solana', sym: 'SOL', logo: '☀️' },
        tron: { name: 'TRON', sym: 'TRX', logo: '🔴' },
        dogecoin: { name: 'Dogecoin', sym: 'DOGE', logo: '🐕' },
        cardano: { name: 'Cardano', sym: 'ADA', logo: '₳' },
        chainlink: { name: 'Chainlink', sym: 'LINK', logo: '🔗' },
        litecoin: { name: 'Litecoin', sym: 'LTC', logo: 'Ł' },
        polkadot: { name: 'Polkadot', sym: 'DOT', logo: '●' },
    },

    // SATS Terminal cycling wisdom quotes
    QUOTES: [
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
    ],

    // Interactive glossary dictionary definitions
    TERMS: [
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
    ]
};
