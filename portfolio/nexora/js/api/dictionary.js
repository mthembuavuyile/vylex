window.NexoraRegistry.register({
    id: 'dictionary',
    name: 'Dictionary API',
    intents:[/define (.+)/i, /meaning of (.+)/i, /what does (.+) mean/i],
    
    async handle(match) {
        const word = match[1].replace(/['"?.]/g, '').trim();
        try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
            if (!res.ok) return { text: `I couldn't find a definition for "${word}".` };
            
            const [entry] = await res.json();
            const meaning = entry.meanings[0];
            const defs = meaning.definitions.slice(0, 2);
            
            const html = `
            <div class="rich-widget">
                <div class="widget-title"><i class="fas fa-book"></i> Dictionary</div>
                <div class="dict-word">
                    ${entry.word}
                    <button onclick="window._speakWord('${entry.word}')" class="icon-btn" style="width:26px;height:26px;font-size:.9rem" title="Pronounce">
                        <i class="fas fa-volume-up"></i>
                    </button>
                </div>
                <div class="dict-phonetic">${entry.phonetic || ''}</div>
                <span class="dict-pos">${meaning.partOfSpeech}</span>
                <ul class="dict-defs">${defs.map(d => `<li>${d.definition}</li>`).join('')}</ul>
            </div>`;
            
            return { html, text: `${entry.word}: ${defs[0].definition}` };
        } catch (err) {
            return { text: "Dictionary service is down." };
        }
    }
});

// Global helper for the dictionary UI button
window._speakWord = w => { 
    if (window.speechSynthesis) { 
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(w)); 
    } 
};