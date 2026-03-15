window.NexoraRegistry.register({
    id: 'bible',
    name: 'Bible API',
    intents: [
        // Captures: "bible verse john 3:16", "show me bible verse genesis 1:1"
        /(?:bible\s+verse|scripture|verse)\s+(?:of\s+|for\s+)?(.+)/i,
        
        // Captures: "read john 3:16 from the bible", "read me psalm 23"
        /read\s+(?:me\s+)?(.+?)(?:\s+from\s+the\s+bible)?$/i,
        
        // Captures: "what does john 3:16 say?", "what says genesis 1:1"
        /what\s+(?:does\s+)?(.+?)\s+say\??$/i,
        
        // Catch-all for bare references like "John 3:16" 
        // Note: Place this last so specific phrases trigger first
        /^(?:get\s+)?([1-3]?\s?[a-zA-Z]+\s+\d+[:\.]\d+(?:-\d+)?)$/i
    ],

    async handle(match) {
        // match[1] will now be the reference across all new regex patterns
        let reference = (match[1] || '').trim();
        
        // Clean up common trailing punctuation from natural language
        reference = reference.replace(/[?.!,]$/g, '').trim();

        if (!reference) {
            return { text: "Please provide a Bible reference, e.g. \"John 3:16\" or \"Psalm 23:1-3\"." };
        }

        const translation = 'kjv';

        try {
            const res = await fetch(
                `https://bible-api.com/${encodeURIComponent(reference)}?translation=${translation}`
            );

            if (!res.ok) {
                return { text: `I couldn't find the verse "${reference}". Please check the formatting (e.g., "John 3:16").` };
            }

            const data = await res.json();

            if (data.error) {
                return { text: `Bible reference not found: "${reference}".` };
            }

            const verses = data.verses || [];
            const verseLines = verses.map(v =>
                `<p class="bible-verse"><span class="verse-num">${v.chapter}:${v.verse}</span> ${escapeHtml(v.text.trim())}</p>`
            ).join('');

            const html = `
            <div class="rich-widget">
                <div class="widget-title"><i class="fas fa-book-open"></i> ${escapeHtml(data.reference)}</div>
                <div class="bible-text">${verseLines}</div>
                <div class="bible-translation">Translation: <em>${data.translation_name || translation.toUpperCase()}</em></div>
            </div>`;

            return {
                html,
                text: `${data.reference} — ${data.text.trim()}`
            };
        } catch (err) {
            return { text: "The Bible service is currently unavailable." };
        }
    }
});