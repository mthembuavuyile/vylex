window.NexoraRegistry.register({
    id: 'bible',
    name: 'Bible API',
    intents: [
        // 1. Generic / Random requests (No specific verse mentioned)
        /^(?:give\s+me\s+a|tell\s+me\s+a|read\s+me\s+a|show\s+me\s+a)?\s*(?:random\s+)?(?:bible\s+verse|scripture|verse)s?$/i,

        // 2. Captures: "bible verse john 3:16", "show me bible verse genesis 1:1"
        /(?:bible\s+verse|scripture|verse)\s+(?:of\s+|for\s+)?(.+)/i,
        
        // 3. Captures: "read john 3:16 from the bible", "read me psalm 23"
        /read\s+(?:me\s+)?(.+?)(?:\s+from\s+the\s+bible)?$/i,
        
        // 4. Captures: "what does john 3:16 say?", "what says genesis 1:1"
        /what\s+(?:does\s+)?(.+?)\s+say\??$/i,
        
        // 5. Catch-all for bare references like "John 3:16" 
        /^(?:get\s+)?([1-3]?\s?[a-zA-Z]+\s+\d+[:\.]\d+(?:-\d+)?)$/i
    ],

    async handle(match) {
        // match[1] might be undefined if the first generic regex catches it
        let reference = (match[1] || '').trim();
        
        // Clean up common trailing punctuation from natural language
        reference = reference.replace(/[?.!,]$/g, '').trim();

        // Intercept generic phrases that might have slipped into the capture group 
        // (e.g., if the user typed "read me a bible verse")
        const genericPhrases = ['a bible verse', 'a verse', 'a random verse', 'a scripture', 'random', 'some scripture'];
        if (genericPhrases.includes(reference.toLowerCase())) {
            reference = ''; 
        }

        // If no specific reference is provided, pick a random one
        if (!reference) {
            const randomVerses = [
                "John 3:16", "Jeremiah 29:11", "Romans 8:28", "Philippians 4:13", 
                "Genesis 1:1", "Proverbs 3:5-6", "1 Corinthians 13:4-5", 
                "Psalm 23:1-3", "Isaiah 41:10", "Matthew 6:33", "Romans 12:2",
                "Joshua 1:9", "Hebrews 11:1", "James 1:2", "1 Peter 5:7",
                "Ephesians 2:8", "Galatians 5:22-23", "Colossians 3:14", "Psalm 119:105"
            ];
            reference = randomVerses[Math.floor(Math.random() * randomVerses.length)];
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