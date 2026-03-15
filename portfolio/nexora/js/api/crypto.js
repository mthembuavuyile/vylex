window.NexoraRegistry.register({
    id: 'crypto',
    name: 'Cryptocurrency API',
    intents:[/(?:what is the |)?price of (.+)/i, /(.+) price(?: right now| today)?/i],
    
    async handle(match) {
        const coinRaw = match[1].toLowerCase().replace('right now', '').trim();
        
        // Map common phrases to coin ids
        const coinMap = { 'btc': 'bitcoin', 'bitcoin': 'bitcoin', 'eth': 'ethereum', 'ethereum': 'ethereum', 'doge': 'dogecoin', 'dogecoin': 'dogecoin' };
        const coinId = coinMap[coinRaw] || coinRaw;

        try {
            const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
            const data = await res.json();
            
            if (!data[coinId]) {
                return { text: `Sorry, I couldn't find pricing data for "${coinRaw}". Try Bitcoin, Ethereum, or Dogecoin.` };
            }
            
            const price = data[coinId].usd;
            const formattedPrice = price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            
            const html = `
            <div class="rich-widget">
                <div class="widget-title"><i class="fab fa-bitcoin"></i> Crypto Market</div>
                <div style="font-size: 2.2rem; font-weight: 700; color: var(--success); margin: 8px 0;">${formattedPrice}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: capitalize;">Coin: ${coinId}</div>
            </div>`;
            
            return { html, text: `The current price of ${coinId} is ${formattedPrice}.` };
        } catch (err) {
            return { text: "The crypto market API is currently unreachable." };
        }
    }
});