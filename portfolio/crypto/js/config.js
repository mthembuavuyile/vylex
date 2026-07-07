// =======================================================
// HYBRID ASSET TERMINAL — Unified Configuration
// =======================================================

const CONFIG = {
    // API endpoints for blockchain, prices, sentiment, and news
    API: {
        CG: 'https://api.coingecko.com/api/v3',
        MEMPOOL: 'https://mempool.space/api',
        FNG: 'https://api.alternative.me/fng/?limit=1',
        REDDIT: {
            all_crypto: 'https://www.reddit.com/r/CryptoCurrency/.json?limit=15&sort=hot',
            bitcoin: 'https://www.reddit.com/r/Bitcoin/.json?limit=15&sort=hot',
            ethereum: 'https://www.reddit.com/r/ethereum/.json?limit=15&sort=hot',
            altcoins: 'https://www.reddit.com/r/altcoin/.json?limit=15&sort=hot',
            defi: 'https://www.reddit.com/r/defi/.json?limit=15&sort=hot',
            nfts: 'https://www.reddit.com/r/NFT/.json?limit=15&sort=hot',
            // Global Market subreddits
            stocks: 'https://www.reddit.com/r/stocks/.json?limit=15&sort=hot',
            wallstreetbets: 'https://www.reddit.com/r/wallstreetbets/.json?limit=15&sort=hot'
        }
    },

    // Global Asset array for Leaderboard (Stocks & Crypto mixed)
    ASSETS_DATA: [
        { name: "NVIDIA Corporation", symbol: "NVDA", exchange: "NASDAQ", targetVal: "$4.7T - $5.2T", basePrice: 193.42, baseCap: 4.76e12, logo: "🟢", type: "stock", change: 1.45 },
        { name: "Alphabet Inc.", symbol: "GOOGL", exchange: "NASDAQ", targetVal: "$3.8T - $4.0T", basePrice: 156.84, baseCap: 3.84e12, logo: "🔵", type: "stock", change: 0.88 },
        { name: "Apple Inc.", symbol: "AAPL", exchange: "NASDAQ", targetVal: "$3.7T - $4.0T", basePrice: 242.10, baseCap: 3.72e12, logo: "🍎", type: "stock", change: 0.65 },
        { name: "Microsoft Corporation", symbol: "MSFT", exchange: "NASDAQ", targetVal: "$2.7T - $3.0T", basePrice: 382.75, baseCap: 2.84e12, logo: "💻", type: "stock", change: -0.32 },
        { name: "Amazon.com, Inc.", symbol: "AMZN", exchange: "NASDAQ", targetVal: "$2.2T - $2.8T", basePrice: 224.50, baseCap: 2.33e12, logo: "📦", type: "stock", change: 1.12 },
        { name: "SpaceX (Space Exploration)", symbol: "SPCX", exchange: "NASDAQ", targetVal: "$2.1T - $2.5T", basePrice: 164.85, baseCap: 2.15e12, logo: "🚀", type: "stock", change: 2.11 },
        { name: "Taiwan Semiconductor Mfg Co.", symbol: "TSM", exchange: "NYSE", targetVal: "$1.7T - $2.1T", basePrice: 182.15, baseCap: 1.88e12, logo: "🇹🇼", type: "stock", change: 2.10 },
        { name: "Broadcom Inc.", symbol: "AVGO", exchange: "NASDAQ", targetVal: "$1.4T - $2.0T", basePrice: 168.90, baseCap: 1.57e12, logo: "📡", type: "stock", change: 0.42 },
        { name: "Saudi Aramco", symbol: "2222", exchange: "TADAWUL", targetVal: "$1.5T - $1.8T", basePrice: 7.74, baseCap: 1.55e12, logo: "🇸🇦", type: "stock", change: -0.10 },
        { name: "Meta Platforms, Inc.", symbol: "META", exchange: "NASDAQ", targetVal: "$1.4T - $1.7T", basePrice: 574.65, baseCap: 1.46e12, logo: "♾️", type: "stock", change: -1.25 },
        { name: "Tesla, Inc.", symbol: "TSLA", exchange: "NASDAQ", targetVal: "$1.4T - $1.6T", basePrice: 442.80, baseCap: 1.41e12, logo: "⚡", type: "stock", change: 3.84 },
        { name: "Bitcoin", symbol: "BTC", exchange: "CRYPTO", targetVal: "Decentralized L1", basePrice: 67250.00, baseCap: 1.32e12, logo: "₿", type: "crypto", change: 1.25 },
        { name: "Ethereum", symbol: "ETH", exchange: "CRYPTO", targetVal: "Smart Contracts", basePrice: 3480.00, baseCap: 4.18e11, logo: "Ξ", type: "crypto", change: -0.45 }
    ],

    // Baseline index values
    INDEX_DATA: {
        spy: { price: 5462.10, change: 0.42 },
        qqq: { price: 19684.50, change: 0.78 }
    },

    // Extended cryptocurrency coin meta from SATS terminal
    COIN_META: {
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
    },

    // Cycling wisdom quotes
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
        "Proof of work is proof of value.",
        "The market is a device for transferring money from the active to the patient.",
        "Rule No. 1: Never lose money. Rule No. 2: Never forget rule No. 1.",
        "Price is what you pay. Value is what you get.",
        "In the short run, the market is a voting machine but in the long run, it is a weighing machine."
    ],

    // Dictionary glossary terms
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
        { term: "Proof of Work", def: "A consensus mechanism requiring computational effort to validate transactions and secure the blockchain." },
        { term: "VIX Index", def: "Chicago Board Options Exchange Volatility Index — a real-time market index representing the market's expectation of 30-day forward-looking volatility." },
        { term: "P/E Ratio", def: "Price-to-Earnings Ratio — the ratio for valuing a company that measures its current share price relative to its earnings per share." },
        { term: "S&P 500", def: "Standard & Poor's 500 Index — a market-capitalization-weighted index of 500 leading publicly traded companies in the U.S." },
        { term: "Nasdaq 100", def: "A stock market index made up of 101 non-financial securities issued by the largest U.S. and international companies listed on the Nasdaq." }
    ]
};
