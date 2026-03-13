// --- Theme Management ---
const ThemeManager = {
    init() {
        this.themeToggleBtn = document.getElementById('theme-toggle');
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

        const savedTheme = localStorage.getItem('lexicoTheme') || 'dark';
        this.applyTheme(savedTheme);
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    },

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('lexicoTheme', theme);

        const icon = this.themeToggleBtn.querySelector('i');
        if (theme === 'light') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
};

// --- API Service ---
const ApiService = {
    API_BASE_URL: 'https://api.dictionaryapi.dev/api/v2/entries/en',

    async fetchWord(word) {
        const response = await fetch(`${this.API_BASE_URL}/${word}`);

        if (!response.ok) {
            // The API returns a JSON object with error details even for 404s
            const errorData = await response.json();
            throw new Error(errorData.title || `Error: ${response.status}`);
        }
        return response.json();
    }
};

// --- Main Application Logic ---
const DictionaryApp = {
    init() {
        // Cache DOM elements
        this.wordInput = document.getElementById('word-input');
        this.searchBtn = document.getElementById('search-btn');
        this.messageArea = document.getElementById('message-area');
        this.resultsContainer = document.getElementById('results-container');
        this.audio = null;

        // Setup event listeners
        this.searchBtn.addEventListener('click', () => this.handleSearch());
        this.wordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
    },

    async handleSearch() {
        const word = this.wordInput.value.trim();
        if (!word) return;

        this.clearResults();
        this.showMessage('Loading...', 'loading');

        try {
            const data = await ApiService.fetchWord(word);
            this.clearMessage();
            this.displayResults(data[0]);
        } catch (error) {
            this.displayError(error.message);
        }
    },

    displayResults(data) {
        // --- Word Header (Word, Phonetic, Audio) ---
        const phoneticText = data.phonetic || (data.phonetics.find(p => p.text)?.text || '');
        const audioSrc = data.phonetics.find(p => p.audio)?.audio;

        const headerHTML = `
            <div class="word-header">
                <div>
                    <h2>${data.word}</h2>
                    <p>${phoneticText}</p>
                </div>
                <button id="play-audio-btn" ${!audioSrc ? 'disabled' : ''}>
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
        `;
        this.resultsContainer.innerHTML += headerHTML;
        
        if(audioSrc){
            this.audio = new Audio(audioSrc);
            document.getElementById('play-audio-btn').addEventListener('click', () => this.audio.play());
        }

        // --- Meanings (Part of Speech, Definitions, Examples) ---
        data.meanings.forEach(meaning => {
            const definitionsHTML = meaning.definitions.map(def => `
                <li>
                    <p>${def.definition}</p>
                    ${def.example ? `<p class="example">"${def.example}"</p>` : ''}
                </li>
            `).join('');

            const synonymsHTML = meaning.synonyms && meaning.synonyms.length > 0
                ? `<div class="synonyms"><span>Synonyms:</span> ${meaning.synonyms.map(s => `<a href="#" onclick="DictionaryApp.searchSynonym('${s}'); return false;">${s}</a>`).join('')}</div>`
                : '';

            const meaningHTML = `
                <div class="meaning">
                    <h3 class="part-of-speech">${meaning.partOfSpeech}</h3>
                    <ul class="definition-list">${definitionsHTML}</ul>
                    ${synonymsHTML}
                </div>
            `;
            this.resultsContainer.innerHTML += meaningHTML;
        });
    },

    searchSynonym(word) {
        this.wordInput.value = word;
        this.handleSearch();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    showMessage(text, className) {
        this.messageArea.innerHTML = `<div class="${className}">${text}</div>`;
    },

    displayError(message) {
        this.showMessage(`<div><h4>${message}</h4><p>Sorry, we couldn't find definitions for the word you were looking for. You can try the search again at later time or head to the web instead.</p></div>`, 'error');
    },

    clearResults() {
        this.resultsContainer.innerHTML = '';
        this.clearMessage();
    },

    clearMessage() {
        this.messageArea.innerHTML = '';
    }
};

// --- Initialize the App ---
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    DictionaryApp.init();
});