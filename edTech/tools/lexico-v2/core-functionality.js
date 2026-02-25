// Global Variables
let globalVoices = [];
let globalIsPlaying = false;
let globalSynthesis = window.speechSynthesis;
let ttsSpeechHistory = [];
let ttsAutoSpeak = false;
let ttsAutoSpeakTimeout;

// API Configuration
const API_CONFIG = {
    WORDS_API: {
        KEY: 'f5078a0212mshb1fa8580c4e1506p1b5d08jsn8fde9b6fb27a',
        BASE_URL: 'https://wordsapiv1.p.rapidapi.com/words',
        HEADERS: {
            'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
        }
    },
    WIKTIONARY: { BASE_URL: 'https://en.wiktionary.org/w/api.php' },
    MYMEMORY: { BASE_URL: 'https://api.mymemory.translated.net/get' }
};
API_CONFIG.WORDS_API.HEADERS['x-rapidapi-key'] = API_CONFIG.WORDS_API.KEY;

// Unified Speech Function
function speakText(text) {
    if (!text || typeof text !== 'string' || text.trim() === '') return;

    if (globalIsPlaying && globalSynthesis.speaking) {
        globalSynthesis.cancel();
        return;
    }

    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        const voiceSelectElement = document.getElementById('voice-options');
        
        if (voiceSelectElement && globalVoices.length > 0) {
            const selectedVoice = globalVoices.find(
                voice => voice.name === voiceSelectElement.value
            );
            if (selectedVoice) utterance.voice = selectedVoice;
        }
        
        const rateElement = document.getElementById('speech-rate');
        const pitchElement = document.getElementById('speech-pitch');
        if (rateElement) utterance.rate = parseFloat(rateElement.value);
        else utterance.rate = 1;
        if (pitchElement) utterance.pitch = parseFloat(pitchElement.value);
        else utterance.pitch = 1;

        const visualizer = document.getElementById('visualizer');
        utterance.onstart = () => {
            globalIsPlaying = true;
            if (visualizer) visualizer.classList.remove('hidden');
        };

        utterance.onend = () => {
            globalIsPlaying = false;
            if (visualizer) visualizer.classList.add('hidden');
        };

        utterance.onerror = (event) => {
            console.error('SpeechSynthesisUtterance.onerror', event);
            globalIsPlaying = false;
            if (visualizer) visualizer.classList.add('hidden');
        };
        
        if (globalSynthesis.speaking) {
            globalSynthesis.cancel();
        }
        setTimeout(() => globalSynthesis.speak(utterance), 50);

    } else {
        alert('Text-to-speech is not supported in your browser.');
    }
}

// Voice Initialization
function initGlobalVoices() {
    try {
        globalVoices = globalSynthesis.getVoices().filter(voice => voice.lang.startsWith('en'));
        const voiceSelect = document.getElementById('voice-options');

        if (voiceSelect) {
            const currentVoice = voiceSelect.value;
            voiceSelect.innerHTML = globalVoices
                .map(voice => `<option value="${voice.name}" ${voice.name === currentVoice ? 'selected' : ''}>${voice.name} (${voice.lang})</option>`)
                .join('');
            if (globalVoices.length === 0) {
                 voiceSelect.innerHTML = `<option value="">No English voices found</option>`;
            }
        }
    } catch (error) {
        console.error("Error initializing voices:", error);
    }
}

// Tab Functionality
function switchTab(tab) {
    const dictTabButton = document.getElementById('dictionary-tab-button');
    const ttsTabButton = document.getElementById('tts-tab-button');
    const dictContent = document.getElementById('dictionary-content');
    const ttsContent = document.getElementById('tts-content');

    if (!dictTabButton || !ttsTabButton || !dictContent || !ttsContent) {
        console.error("Tab switch elements not found.");
        return;
    }

    if (tab === 'dictionary') {
        dictTabButton.classList.add('active');
        ttsTabButton.classList.remove('active');
        dictContent.classList.remove('hidden');
        ttsContent.classList.add('hidden');
    } else {
        dictTabButton.classList.remove('active');
        ttsTabButton.classList.add('active');
        dictContent.classList.add('hidden');
        ttsContent.classList.remove('hidden');
    }
}

// API Service
const ApiService = {
    async fetchFromWordsAPI(word, endpoint = '') {
        const response = await fetch(
            `${API_CONFIG.WORDS_API.BASE_URL}/${encodeURIComponent(word)}${endpoint}`,
            { headers: API_CONFIG.WORDS_API.HEADERS }
        );
        if (!response.ok) {
            if (response.status === 404) throw new Error(`Word not found in WordsAPI: ${word}`);
            if (response.status === 401 || response.status === 403) throw new Error(`WordsAPI Unauthorized/Forbidden. Check API Key.`);
            throw new Error(`WordsAPI Error: ${response.status} for ${word}${endpoint}`);
        }
        return response.json();
    },
    async fetchFromWiktionary(word) {
        const response = await fetch(
            `${API_CONFIG.WIKTIONARY.BASE_URL}?action=query&format=json&prop=extracts&titles=${encodeURIComponent(word)}&exintro&explaintext&origin=*`
        );
        if (!response.ok) throw new Error(`Wiktionary Error: ${response.status}`);
        const data = await response.json();
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pageId === "-1" || !pages[pageId].extract) throw new Error('No definition found in Wiktionary');
        return pages[pageId].extract;
    }
};

// TTS Functions
function ttsSpeakCustomText() {
    const textArea = document.getElementById('tts-text');
    if (!textArea) return;
    const text = textArea.value.trim();
    if (!text) return;
    speakText(text);
    ttsAddToHistory(text);
}

function ttsAddToHistory(text) {
    if (ttsSpeechHistory.length === 0 || ttsSpeechHistory[0] !== text) {
        ttsSpeechHistory.unshift(text);
        if (ttsSpeechHistory.length > 10) ttsSpeechHistory.pop();
        ttsUpdateHistoryUI();
    }
}

function ttsClearText() {
    const textArea = document.getElementById('tts-text');
    if (textArea) textArea.value = '';
}

function ttsToggleAutoSpeak() {
    const toggle = document.getElementById('auto-speak-toggle');
    ttsAutoSpeak = !ttsAutoSpeak;
    if (toggle) {
        toggle.classList.toggle('active', ttsAutoSpeak);
        toggle.innerHTML = `<i class="fas fa-magic"></i> Auto-Speak: ${ttsAutoSpeak ? 'ON' : 'OFF'}`;
    }
}

function ttsCopyToInput(text) {
    const textArea = document.getElementById('tts-text');
    if (textArea) { 
        textArea.value = text; 
        textArea.focus(); 
    }
}