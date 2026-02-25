// Theme Management
const ThemeManager = {
    themes: {
        light: {
            background: '#f8fafc',
            text: '#1e293b',
            card: '#ffffff'
        },
        dark: {
            background: '#1a1a1a',
            text: '#ffffff',
            card: '#2d2d2d'
        }
    },

    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme(savedTheme);
    },

    toggleTheme() {
        const root = document.documentElement;
        const isDark = root.style.getPropertyValue('--background') === this.themes.dark.background;
        const newTheme = isDark ? 'light' : 'dark';
        this.applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    },

    applyTheme(theme) {
        const root = document.documentElement;
        const themeValues = this.themes[theme];
        Object.entries(themeValues).forEach(([property, value]) => {
            root.style.setProperty(`--${property}`, value);
        });
    }
};

// Navigation Management
const NavigationManager = {
    init() {
        this.setupEventListeners();
    },

    toggleMenu() {
        const nav = document.getElementById('nav');
        if (!nav) return;
        
        nav.classList.toggle('active');
        
        if (nav.classList.contains('active') && !document.querySelector('.close-menu')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-menu';
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.onclick = () => this.toggleMenu();
            nav.appendChild(closeBtn);
        }
    },

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const nav = document.getElementById('nav');
            const hamburger = document.querySelector('.hamburger');
            
            if (nav?.classList.contains('active') && 
                !nav.contains(e.target) && 
                !hamburger?.contains(e.target)) {
                this.toggleMenu();
            }
        });
    }
};

// Word Data Management
// API Configuration
const API_CONFIG = {
    WORDS_API: {
        KEY: 'f5078a0212mshb1fa8580c4e1506p1b5d08jsn8fde9b6fb27a',
        BASE_URL: 'https://wordsapiv1.p.rapidapi.com/words',
        HEADERS: {
            'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
            'x-rapidapi-key': 'f5078a0212mshb1fa8580c4e1506p1b5d08jsn8fde9b6fb27a'
        }
    },
    WIKTIONARY: {
        BASE_URL: 'https://en.wiktionary.org/w/api.php'
    },
    MYMEMORY: {
        BASE_URL: 'https://api.mymemory.translated.net/get'
    }
};

// API Service Layer
const ApiService = {
    async fetchFromWordsAPI(word, endpoint = '') {
        const response = await fetch(
            `${API_CONFIG.WORDS_API.BASE_URL}/${encodeURIComponent(word)}${endpoint}`,
            { headers: API_CONFIG.WORDS_API.HEADERS }
        );
        
        if (!response.ok) {
            throw new Error(`WordsAPI Error: ${response.status}`);
        }
        
        return response.json();
    },

    async fetchFromWiktionary(word) {
        const response = await fetch(
            `${API_CONFIG.WIKTIONARY.BASE_URL}?action=query&format=json&prop=extracts&titles=${encodeURIComponent(word)}&origin=*`
        );
        
        if (!response.ok) {
            throw new Error(`Wiktionary Error: ${response.status}`);
        }
        
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        
        if (!pages[pageId].extract) {
            throw new Error('No definition found');
        }
        
        return pages[pageId].extract;
    },

    async translate(word, targetLang) {
        const response = await fetch(
            `${API_CONFIG.MYMEMORY.BASE_URL}?q=${encodeURIComponent(word)}&langpair=en|${encodeURIComponent(targetLang)}`
        );
        
        if (!response.ok) {
            throw new Error(`Translation Error: ${response.status}`);
        }
        
        const data = await response.json();
        return data.responseData.translatedText;
    }
};

// History Manager
const HistoryManager = {
    MAX_HISTORY_ITEMS: 50,
    STORAGE_KEY: 'lexicoSearchHistory',

    initialize() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
        }
    },

    save(word) {
        let history = this.getHistory();
        const newSearch = {
            word: word,
            timestamp: new Date().toISOString()
        };
        
        history = history.filter(item => item.word.toLowerCase() !== word.toLowerCase());
        history.unshift(newSearch);
        history = history.slice(0, this.MAX_HISTORY_ITEMS);
        
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    },

    getHistory() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
    }
};

// Display Manager
const DisplayManager = {
    displayDefinitions(data, element) {
        if (!element || !data.results) return;
        
        element.innerHTML = data.results
            .filter(result => result.definition)
            .map(result => `<li>${result.definition}</li>`)
            .join('');
    },

    displaySynonyms(data, element) {
        if (!element || !data.results) return;
        
        const synonyms = new Set();
        data.results.forEach(result => {
            if (result.synonyms) {
                result.synonyms.forEach(synonym => synonyms.add(synonym));
            }
        });
        
        element.innerHTML = Array.from(synonyms)
            .map(synonym => `<li>${synonym}</li>`)
            .join('');
    },

    displayRhymes(rhymes, element, originalWord) {
        if (!element || !rhymes) return;
        
        const filteredRhymes = this.filterRelevantRhymes(originalWord, rhymes)
            .map(rhyme => `<li>${rhyme}</li>`)
            .join('');
            
        element.innerHTML = filteredRhymes;
    },

    filterRelevantRhymes(originalWord, rhymes) {
        return rhymes
            .filter(rhyme => {
                if (rhyme.endsWith(originalWord)) return false;
                
                let commonEndingLength = 0;
                for (let i = 1; i <= Math.min(originalWord.length, rhyme.length); i++) {
                    if (originalWord.slice(-i) === rhyme.slice(-i)) {
                        commonEndingLength = i;
                    } else {
                        break;
                    }
                }
                
                return commonEndingLength >= 2 && rhyme.length <= originalWord.length * 2;
            })
            .slice(0, 10);
    },

    displayWiktionaryResult(data, element) {
        if (!element) return;
        const cleanedHTML = data.replace(/<[^>]+>/g, '');
        element.innerHTML = `<li>${cleanedHTML}</li>`;
    }
};

// Main Word Data Manager
const WordDataManager = {
    elements: {},

    async init() {
        this.cacheElements();
        this.setupEventListeners();
        HistoryManager.initialize();
    },

    cacheElements() {
        const elementIds = [
            'wordInput', 'loading', 'error', 'definitionList', 
            'synonymList', 'rhymeList', 'etymology', 'examples', 
            'pronunciation', 'phonetic'
        ];
        
        elementIds.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
    },

    setupEventListeners() {
        if (this.elements.wordInput) {
            this.elements.wordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.fetchWordData();
                }
            });
        }
    },

    async fetchWordData() {
        const word = this.elements.wordInput?.value.toLowerCase().trim();
        
        if (!word) {
            this.showError('Please enter a word to search');
            return;
        }

        this.resetResults();
        this.showLoading(true);

        try {
            const wordData = await ApiService.fetchFromWordsAPI(word);
            HistoryManager.save(word);
            
            this.displayResults(wordData);
            await this.fetchAndDisplayRhymes(word);
            
        } catch (error) {
            console.warn('Falling back to Wiktionary...');
            
            try {
                const wiktionaryData = await ApiService.fetchFromWiktionary(word);
                DisplayManager.displayWiktionaryResult(wiktionaryData, this.elements.definitionList);
            } catch (wikiError) {
                this.showError('Word not found in any source.');
                console.error(wikiError);
            }
        } finally {
            this.showLoading(false);
        }
    },

    async fetchAndDisplayRhymes(word) {
        try {
            const rhymeData = await ApiService.fetchFromWordsAPI(word, '/rhymes');
            if (rhymeData.rhymes?.all) {
                DisplayManager.displayRhymes(
                    rhymeData.rhymes.all,
                    this.elements.rhymeList,
                    word
                );
            }
        } catch (error) {
            console.error('Error fetching rhymes:', error);
        }
    },

    displayResults(data) {
        DisplayManager.displayDefinitions(data, this.elements.definitionList);
        DisplayManager.displaySynonyms(data, this.elements.synonymList);
        
        // Additional display methods can be added here as needed
    },

    showLoading(show = true) {
        if (this.elements.loading) {
            this.elements.loading.style.display = show ? 'block' : 'none';
        }
    },

    showError(message) {
        if (this.elements.error) {
            this.elements.error.textContent = message;
            this.elements.error.style.display = 'block';
        }
    },

    resetResults() {
        Object.entries(this.elements).forEach(([id, element]) => {
            if (element && id !== 'wordInput' && id !== 'loading') {
                element.innerHTML = '';
            }
        });
        
        if (this.elements.error) {
            this.elements.error.style.display = 'none';
        }
    }
};

// Initialize the application
WordDataManager.init();

// Speech Synthesis Management
const SpeechManager = {
    voices: [],

    init() {
        this.populateVoiceList();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => this.populateVoiceList();
        }
    },

    populateVoiceList() {
        this.voices = window.speechSynthesis.getVoices();
        const voiceSelect = document.getElementById('voiceSelect');
        if (!voiceSelect) return;

        voiceSelect.innerHTML = '';
        this.voices.forEach((voice, index) => {
            const option = new Option(`${voice.name} (${voice.lang})`, index);
            voiceSelect.options.add(option);
        });
    },

    playPronunciation() {
        const wordInput = document.getElementById('wordInput');
        if (!wordInput) return;

        const word = wordInput.value;
        
        if (!word) {
            alert('Please enter a word');
            return;
        }

        const voiceSelect = document.getElementById('voiceSelect');
        if (!voiceSelect) return;

        const voiceIndex = voiceSelect.value;
        const utterance = new SpeechSynthesisUtterance(word);
        
        if (this.voices[voiceIndex]) {
            utterance.voice = this.voices[voiceIndex];
        }

        utterance.rate = 0.9;
        utterance.pitch = 1;

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    }
};

function openSearchHistory() {
    const historyWindow = window.open('', 'Lexico Search History', 'width=500,height=600');
    const history = JSON.parse(localStorage.getItem('lexicoSearchHistory'));
    
    const historyContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Lexico - Search History</title>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                    background-color: var(--bg-color, #ffffff);
                    color: var(--text-color, #333333);
                }
                .history-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .clear-btn {
                    background-color: #dc3545;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .history-list {
                    list-style: none;
                    padding: 0;
                }
                .history-item {
                    padding: 15px;
                    border-bottom: 1px solid #ddd;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .history-item:hover {
                    background-color: #f5f5f5;
                }
                .word {
                    font-weight: bold;
                    color: #2c3e50;
                }
                .timestamp {
                    color: #666;
                    font-size: 0.8em;
                    margin-top: 5px;
                }
                .no-history {
                    text-align: center;
                    color: #666;
                    padding: 20px;
                }
            </style>
        </head>
        <body>
            <div class="history-header">
                <h2><i class="fas fa-history"></i> Search History</h2>
                <button class="clear-btn" onclick="clearHistory()">
                    <i class="fas fa-trash"></i> Clear History
                </button>
            </div>
            ${history.length > 0 ? `
                <ul class="history-list">
                    ${history.map(item => `
                        <li class="history-item" onclick="searchWord('${item.word}')">
                            <div class="word">${item.word}</div>
                            <div class="timestamp">${item.timestamp}</div>
                        </li>
                    `).join('')}
                </ul>
            ` : `
                <div class="no-history">
                    <i class="fas fa-search"></i>
                    <p>No search history yet</p>
                </div>
            `}
            <script>
                function clearHistory() {
                    if (confirm('Are you sure you want to clear all search history?')) {
                        window.opener.localStorage.setItem('lexicoSearchHistory', JSON.stringify([]));
                        window.location.reload();
                    }
                }
                
                function searchWord(word) {
                    window.opener.document.getElementById('wordInput').value = word;
                    window.opener.fetchWordData();
                }
            </script>
        </body>
        </html>
    `;
    
    historyWindow.document.write(historyContent);
    historyWindow.document.close();
}

// Initialize everything when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    NavigationManager.init();
    WordDataManager.init();
    SpeechManager.init();

    // Set up global functions for HTML onclick attributes
    window.toggleTheme = () => ThemeManager.toggleTheme();
    window.toggleMenu = () => NavigationManager.toggleMenu();
    window.fetchWordData = () => WordDataManager.fetchWordData();
    window.playPronunciation = () => SpeechManager.playPronunciation();
    window.openSearchHistory = openSearchHistory;
});