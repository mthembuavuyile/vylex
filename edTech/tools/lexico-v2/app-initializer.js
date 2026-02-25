// app-initializer.js

document.addEventListener('DOMContentLoaded', initializeApp);

// --- Global Theme Toggle Function (called by HTML onclick) ---
function toggleTheme() {
    const body = document.body;
    const themeToggleButton = document.getElementById('theme-toggle');
    const isCurrentlyLight = body.classList.contains('light-theme-active');

    if (isCurrentlyLight) {
        body.classList.remove('light-theme-active');
        // Revert to default dark theme variables (from CSS :root)
        document.documentElement.style.setProperty('--background', '#1a1a1a');
        document.documentElement.style.setProperty('--text', '#e2e8f0');
        document.documentElement.style.setProperty('--card', '#2d2d2d');
        document.documentElement.style.setProperty('--card-text', '#cbd5e1');
        document.documentElement.style.setProperty('--glass-bg', 'rgba(40, 40, 40, 0.5)');
        document.documentElement.style.setProperty('--glass-border', 'rgba(50, 50, 50, 0.7)');
        
        themeToggleButton.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        localStorage.setItem('lexicoTheme', 'dark');
    } else {
        body.classList.add('light-theme-active');
        // Update CSS Variables for light theme
        document.documentElement.style.setProperty('--background', '#f4f6f8'); // Slightly off-white
        document.documentElement.style.setProperty('--text', '#111827');     // Dark gray for text
        document.documentElement.style.setProperty('--card', '#ffffff');
        document.documentElement.style.setProperty('--card-text', '#1f2937'); // Slightly lighter dark gray
        document.documentElement.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.6)');
        document.documentElement.style.setProperty('--glass-border', 'rgba(209, 213, 219, 0.5)'); // Light gray border
        
        themeToggleButton.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        localStorage.setItem('lexicoTheme', 'light');
    }
}

function loadInitialTheme() {
    const savedTheme = localStorage.getItem('lexicoTheme');
    const themeToggleButton = document.getElementById('theme-toggle');
    
    // Set default (dark) state first
    document.body.classList.remove('light-theme-active');
    themeToggleButton.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    // Ensure CSS vars are default dark (they are from :root, but to be safe if JS changed them and didn't reload)
    document.documentElement.style.setProperty('--background', '#1a1a1a');
    document.documentElement.style.setProperty('--text', '#e2e8f0');
    document.documentElement.style.setProperty('--card', '#2d2d2d');
    // ... other dark theme vars if needed

    if (savedTheme === 'light') {
        // Apply light theme settings by calling toggleTheme (which will flip to light)
        toggleTheme(); 
    }
}


// --- Main Initialization Function ---
function initializeApp() {
    loadInitialTheme();
    initTTSSetup();
    setupEventListeners();
    setupAudioVisualizer();

    if (typeof loadDictionarySearchHistoryFromStorage === 'function') {
        loadDictionarySearchHistoryFromStorage();
    }
    loadTtsHistoryFromStorage();
    ttsUpdateHistoryUI(); 

    if (typeof switchTab === 'function') switchTab('dictionary'); 
    
    const dictInput = document.getElementById('dictionaryWordInput');
    const clearDictBtn = document.getElementById('clear-dictionary-search');
    if (dictInput && clearDictBtn) {
        clearDictBtn.style.display = dictInput.value ? 'inline-block' : 'none';
    }
}

// --- Event Listener Setup ---
function setupEventListeners() {
    // Dictionary Search
    const dictWordInput = document.getElementById('dictionaryWordInput');
    const dictSearchButton = document.getElementById('dictionarySearchButton');
    const clearDictSearchBtn = document.getElementById('clear-dictionary-search');

    if (dictSearchButton && dictWordInput) {
        dictSearchButton.addEventListener('click', () => {
            if (typeof searchWord === 'function') searchWord(dictWordInput.value);
        });
        dictWordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (typeof searchWord === 'function') searchWord(dictWordInput.value);
            }
        });
    }
    if (clearDictSearchBtn && dictWordInput) {
        clearDictSearchBtn.addEventListener('click', () => {
            dictWordInput.value = '';
            clearDictSearchBtn.style.display = 'none';
            dictWordInput.focus();
            if (typeof clearDictionaryResultsUI === 'function') clearDictionaryResultsUI();
            if (typeof clearDictionaryError === 'function') clearDictionaryError();
            const resultsContainer = document.getElementById('dictionaryResultsContainer');
            if (resultsContainer) resultsContainer.classList.add('hidden');
        });
        dictWordInput.addEventListener('input', () => {
            clearDictSearchBtn.style.display = dictWordInput.value ? 'inline-block' : 'none';
        });
    }
    
    // TTS Controls
    const ttsText = document.getElementById('tts-text');
    const ttsSpeakButton = document.getElementById('tts-speak-button');
    const ttsClearButton = document.getElementById('tts-clear-button');
    const speechRateSlider = document.getElementById('speech-rate');
    const speechPitchSlider = document.getElementById('speech-pitch');
    const rateValueDisplay = document.getElementById('rate-value');
    const pitchValueDisplay = document.getElementById('pitch-value');
    const autoSpeakToggleBtn = document.getElementById('auto-speak-toggle');

    if (ttsSpeakButton && typeof ttsSpeakCustomText === 'function') {
        ttsSpeakButton.addEventListener('click', ttsSpeakCustomText);
    }
    if (ttsClearButton && typeof ttsClearText === 'function') {
        ttsClearButton.addEventListener('click', ttsClearText);
    }
    
    if (speechRateSlider && rateValueDisplay) {
        speechRateSlider.addEventListener('input', () => rateValueDisplay.textContent = speechRateSlider.value);
    }
    if (speechPitchSlider && pitchValueDisplay) {
        speechPitchSlider.addEventListener('input', () => pitchValueDisplay.textContent = speechPitchSlider.value);
    }
    if (autoSpeakToggleBtn && typeof ttsToggleAutoSpeak === 'function') {
        autoSpeakToggleBtn.addEventListener('click', ttsToggleAutoSpeak);
    }
    if (ttsText) {
        ttsText.addEventListener('input', handleTtsTextareaInput);
    }

    const ttsHistoryList = document.getElementById('tts-history-list');
    if (ttsHistoryList && typeof ttsCopyToInput === 'function') {
        ttsHistoryList.addEventListener('click', (event) => {
            const listItem = event.target.closest('li');
            if (listItem && listItem.dataset.text) {
                ttsCopyToInput(listItem.dataset.text); 
            }
        });
    }
}

// --- TTS Specific Initializations ---
function initTTSSetup() {
    if ('speechSynthesis' in window && typeof initGlobalVoices === 'function') {
        if (speechSynthesis.getVoices().length > 0) {
            initGlobalVoices();
        } else {
            speechSynthesis.onvoiceschanged = initGlobalVoices;
        }
    } else {
        console.warn("Speech synthesis not supported or initGlobalVoices not found.");
        const voiceOptions = document.getElementById('voice-options');
        if (voiceOptions) voiceOptions.innerHTML = "<option>TTS Not Supported</option>";
    }

    const speechRateSlider = document.getElementById('speech-rate');
    const speechPitchSlider = document.getElementById('speech-pitch');
    const rateValueDisplay = document.getElementById('rate-value');
    const pitchValueDisplay = document.getElementById('pitch-value');
    if (speechRateSlider && rateValueDisplay) rateValueDisplay.textContent = speechRateSlider.value;
    if (speechPitchSlider && pitchValueDisplay) pitchValueDisplay.textContent = speechPitchSlider.value;
}

function handleTtsTextareaInput() {
    // ttsAutoSpeak and ttsAutoSpeakTimeout are global vars from core-functionality.js
    if (typeof ttsAutoSpeak !== 'undefined' && ttsAutoSpeak) { 
        clearTimeout(ttsAutoSpeakTimeout); 
        ttsAutoSpeakTimeout = setTimeout(() => {
            if(typeof ttsSpeakCustomText === 'function') ttsSpeakCustomText();
        }, 1500); 
    }
}

// --- TTS History Management (UI and Storage) ---
const TTS_HISTORY_KEY = 'lexicoTtsHistory';

function loadTtsHistoryFromStorage() {
    const storedHistory = localStorage.getItem(TTS_HISTORY_KEY);
    if (storedHistory && typeof ttsSpeechHistory !== 'undefined') {
        ttsSpeechHistory = JSON.parse(storedHistory);
    }
}

function saveTtsHistoryToStorage() {
    if (typeof ttsSpeechHistory !== 'undefined') {
        localStorage.setItem(TTS_HISTORY_KEY, JSON.stringify(ttsSpeechHistory));
    }
}

function ttsUpdateHistoryUI() {
    const historyList = document.getElementById('tts-history-list');
    const historySection = document.getElementById('tts-history-section');

    if (!historyList || !historySection || typeof ttsSpeechHistory === 'undefined') return;

    if (ttsSpeechHistory.length === 0) {
        historySection.classList.add('hidden');
        historyList.innerHTML = '';
    } else {
        historySection.classList.remove('hidden');
        historyList.innerHTML = ttsSpeechHistory.map(text => {
            const escapedText = escapeHTML(text);
            return `<li data-text="${escapedText}" class="p-3 rounded-lg cursor-pointer hover:bg-opacity-30 transition-all text-sm" style="background: var(--glass-bg); border:1px solid var(--glass-border); margin-bottom: 8px;">
                ${escapedText.length > 60 ? escapedText.substring(0, 57) + '...' : escapedText}
             </li>`;
        }).join('');
        saveTtsHistoryToStorage(); 
    }
}

function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, function (match) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[match];
    });
}



// --- Audio Visualizer ---
function setupAudioVisualizer() {
    const visualizerContainer = document.getElementById('visualizer');
    if (visualizerContainer) {
        const numBars = 25; 
        let existingBars = visualizerContainer.querySelectorAll('.visualizer-bar').length;
        if (existingBars > 0) return; // Avoid adding bars multiple times if DOM is manipulated

        for (let i = 0; i < numBars; i++) {
            const bar = document.createElement('div');
            bar.className = 'visualizer-bar';
            bar.style.animationDelay = `${i * 0.06}s`;
            bar.style.height = `${Math.random() * 20 + 5}px`; 
            visualizerContainer.appendChild(bar);
        }
    }
}