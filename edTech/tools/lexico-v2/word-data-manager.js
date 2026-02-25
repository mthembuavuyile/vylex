// word-data-manager.js

// DOM Elements for Dictionary (ensure these are accessible after DOM load)
let dictionaryWordInput, dictionarySearchButton, clearDictionarySearchBtn;
let dictionaryLoading, dictionaryError, dictionaryResultsContainer;
let dictionaryWordHeader, dictionaryDefinitionList, dictionarySynonymList, dictionaryRhymeList, dictionaryEtymologySection;

// Initialize DOM elements once DOM is loaded (or rely on app-initializer to pass them/ensure availability)
document.addEventListener('DOMContentLoaded', () => {
    dictionaryWordInput = document.getElementById('dictionaryWordInput');
    // dictionarySearchButton = document.getElementById('dictionarySearchButton'); // Event listener set in app-initializer
    clearDictionarySearchBtn = document.getElementById('clear-dictionary-search');

    dictionaryLoading = document.getElementById('dictionaryLoading');
    dictionaryError = document.getElementById('dictionaryError');
    dictionaryResultsContainer = document.getElementById('dictionaryResultsContainer');

    dictionaryWordHeader = document.getElementById('dictionaryWordHeader');
    dictionaryDefinitionList = document.getElementById('dictionaryDefinitionList');
    dictionarySynonymList = document.getElementById('dictionarySynonymList');
    dictionaryRhymeList = document.getElementById('dictionaryRhymeList');
    dictionaryEtymologySection = document.getElementById('dictionaryEtymology');
});


let dictionarySearchHistory = [];
const DICTIONARY_HISTORY_KEY = 'lexicoDictionarySearchHistory';

// --- Dictionary Search Logic ---

async function searchWord(wordToSearch) {
    const word = wordToSearch.trim().toLowerCase();
    if (!word) {
        showDictionaryError("Please enter a word.");
        return;
    }

    showDictionaryLoading();
    clearDictionaryResultsUI();
    clearDictionaryError();
    dictionaryResultsContainer.classList.add('hidden');

    try {
        let wordData = {
            word: word,
            definitions: [],
            pronunciation: null,
            syllables: null,
            synonyms: [],
            rhymes: [],
            etymology: [],
        };

        // Attempt to fetch all data from WordsAPI
        try {
            const apiData = await ApiService.fetchFromWordsAPI(word);
            wordData.word = apiData.word || word; 
            
            if (apiData.pronunciation) {
                wordData.pronunciation = typeof apiData.pronunciation === 'string' 
                    ? apiData.pronunciation 
                    : (apiData.pronunciation.all || apiData.pronunciation.noun || apiData.pronunciation.verb);
            }
            if (apiData.syllables) {
                wordData.syllables = apiData.syllables.list ? apiData.syllables.list.join('-') : null;
            }
            
            if (apiData.results && apiData.results.length > 0) {
                apiData.results.forEach(res => {
                    wordData.definitions.push({
                        definition: res.definition,
                        partOfSpeech: res.partOfSpeech,
                        examples: res.examples || [],
                        synonyms: res.synonyms || [], // Some definitions have specific synonyms
                    });
                    if (res.synonyms) wordData.synonyms.push(...res.synonyms);
                    if (res.etymology && typeof res.etymology === 'string') wordData.etymology.push(res.etymology);
                });
            }
        } catch (wordsApiErrorInitial) {
            console.warn(`Initial WordsAPI fetch for "${word}" failed or was partial: ${wordsApiErrorInitial.message}`);
            // If the initial fetch fails completely, we might rely on specific endpoints or Wiktionary later
        }

        // Fetch specific parts if not sufficiently covered or to get more comprehensive data
        try {
            const synonymsData = await ApiService.fetchFromWordsAPI(word, '/synonyms');
            if (synonymsData.synonyms) wordData.synonyms.push(...synonymsData.synonyms);
        } catch (e) { console.warn(`Could not fetch synonyms for ${word}: ${e.message}`); }
        
        try {
            const rhymesData = await ApiService.fetchFromWordsAPI(word, '/rhymes');
            if (rhymesData.rhymes && rhymesData.rhymes.all) wordData.rhymes.push(...rhymesData.rhymes.all);
        } catch (e) { console.warn(`Could not fetch rhymes for ${word}: ${e.message}`); }

        try {
            if (wordData.etymology.length === 0) { // Only fetch if not already populated
                const etymologyData = await ApiService.fetchFromWordsAPI(word, '/etymology');
                if (etymologyData.etymology) {
                     if (Array.isArray(etymologyData.etymology)) {
                        wordData.etymology.push(...etymologyData.etymology);
                    } else if (typeof etymologyData.etymology === 'string') {
                        wordData.etymology.push(etymologyData.etymology);
                    }
                }
            }
        } catch (e) { console.warn(`Could not fetch etymology for ${word}: ${e.message}`); }

        // Deduplicate
        wordData.synonyms = [...new Set(wordData.synonyms)];
        wordData.rhymes = [...new Set(wordData.rhymes)];
        wordData.etymology = [...new Set(wordData.etymology)];


        // Fallback to Wiktionary for definitions if WordsAPI provided none
        if (wordData.definitions.length === 0) {
            console.warn(`No definitions from WordsAPI for ${word}. Trying Wiktionary.`);
            try {
                const wiktionaryExtract = await ApiService.fetchFromWiktionary(word);
                const definitions = wiktionaryExtract
                    .split('\n')
                    .map(line => line.trim())
                    .filter(line => line.startsWith('# ') && !line.startsWith('#*') && !line.startsWith('#:')) // Basic filtering
                    .map(line => line.substring(2).replace(/\[\[[^|\]]+\|([^\]]+)\]\]/g, '$1').replace(/\[\[([^\]]+)\]\]/g, '$1').trim()) // Simplify wikitext links
                    .filter(line => line.length > 10); // Filter out very short/non-definition lines
                
                if (definitions.length > 0) {
                     wordData.definitions = definitions.map(def => ({ definition: def, partOfSpeech: 'Wiktionary', examples: [] }));
                } else {
                    console.warn("No definitions found in Wiktionary either.");
                }
            } catch (wiktionaryError) {
                console.error(`Wiktionary failed for ${word}: ${wiktionaryError.message}`);
            }
        }
        
        if (wordData.definitions.length === 0 && wordData.synonyms.length === 0 && wordData.rhymes.length === 0) {
            throw new Error(`No information found for "${word}".`);
        }

        displayWordData(wordData);
        addWordToSearchHistory(word);
        dictionaryResultsContainer.classList.remove('hidden');

    } catch (error) {
        console.error("Error searching word:", error);
        showDictionaryError(error.message || "Failed to fetch word data. Please try again.");
    } finally {
        hideDictionaryLoading();
    }
}


// --- UI Display Functions ---
function clearDictionaryResultsUI() {
    if(dictionaryWordHeader) dictionaryWordHeader.innerHTML = '';
    if(dictionaryDefinitionList) dictionaryDefinitionList.innerHTML = '';
    if(dictionarySynonymList) dictionarySynonymList.innerHTML = '';
    if(dictionaryRhymeList) dictionaryRhymeList.innerHTML = '';
    if(dictionaryEtymologySection) {
        dictionaryEtymologySection.innerHTML = ''; 
        dictionaryEtymologySection.classList.add('hidden');
    }
}

function displayWordData(data) {
    displayWordHeader(data.word, data.pronunciation, data.syllables);
    displayDefinitions(data.definitions);
    displaySynonyms(data.synonyms);
    displayRhymes(data.rhymes);
    displayEtymology(data.etymology);
}

function displayWordHeader(word, pronunciation, syllables) {
    if (!dictionaryWordHeader) return;
    let headerHTML = `<h2 class="text-3xl font-bold capitalize mb-1">${word}</h2>`;
    if (pronunciation) {
        headerHTML += `<p class="text-lg text-gray-400 italic mb-1">/${pronunciation}/</p>`;
    }
    if (syllables) {
        headerHTML += `<p class="text-md text-gray-500 mb-2">Syllables: ${syllables}</p>`;
    }
    headerHTML += `
        <button class="icon-btn text-xl p-2" onclick="speakText('${word.replace(/'/g, "\\'")}')" title="Speak word">
            <i class="fas fa-volume-up"></i>
        </button>
    `;
    dictionaryWordHeader.innerHTML = headerHTML;
}

function displayDefinitions(definitions) {
    if (!dictionaryDefinitionList) return;
    if (!definitions || definitions.length === 0) {
        dictionaryDefinitionList.innerHTML = '<li>No definitions found.</li>';
        return;
    }
    dictionaryDefinitionList.innerHTML = definitions.map(def => `
        <li class="mb-4 p-3 rounded-lg" style="background: rgba(255,255,255,0.05);">
            ${def.partOfSpeech ? `<strong class="font-semibold capitalize text-accent mb-1 block">${def.partOfSpeech}</strong>` : ''}
            <p>${def.definition}</p>
            ${def.examples && def.examples.length > 0 ? `<p class="text-sm italic text-gray-400 mt-2">Example: <span class="text-gray-300">${def.examples.join('; ')}</span></p>` : ''}
            ${def.synonyms && def.synonyms.length > 0 ? `<p class="text-sm text-gray-400 mt-1">Synonyms: <span class="text-gray-300">${def.synonyms.slice(0,5).join(', ')}</span></p>` : ''}
        </li>
    `).join('');
}

function createInteractiveListItem(text, type) {
    const li = document.createElement('li');
    li.textContent = text;
    // Classes are already defined in HTML structure's CSS for .synonym-list li, .rhyme-list li
    // We just add content and click listener
    li.addEventListener('click', () => {
        if(dictionaryWordInput) dictionaryWordInput.value = text;
        searchWord(text);
        if(typeof switchTab === "function") switchTab('dictionary'); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    return li;
}

function displaySynonyms(synonyms) {
    if (!dictionarySynonymList) return;
    dictionarySynonymList.innerHTML = ''; 
    if (!synonyms || synonyms.length === 0) {
        dictionarySynonymList.innerHTML = '<li>No synonyms found.</li>';
        return;
    }
    synonyms.forEach(synonym => {
        dictionarySynonymList.appendChild(createInteractiveListItem(synonym, 'synonym'));
    });
}

function displayRhymes(rhymes) {
    if (!dictionaryRhymeList) return;
    dictionaryRhymeList.innerHTML = ''; 
    if (!rhymes || rhymes.length === 0) {
        dictionaryRhymeList.innerHTML = '<li>No rhymes found.</li>';
        return;
    }
    rhymes.forEach(rhyme => {
        dictionaryRhymeList.appendChild(createInteractiveListItem(rhyme, 'rhyme'));
    });
}

function displayEtymology(etymologyEntries) {
    if (!dictionaryEtymologySection) return;
    if (!etymologyEntries || etymologyEntries.length === 0) {
        dictionaryEtymologySection.innerHTML = '';
        dictionaryEtymologySection.classList.add('hidden');
        return;
    }
    
    let content = '<h3><i class="fas fa-feather-alt"></i> Etymology</h3>';
    content += '<ul class="list-disc pl-5 space-y-2 mt-3">';
    etymologyEntries.forEach(entry => {
        content += `<li class="text-gray-300">${entry}</li>`;
    });
    content += '</ul>';
    
    dictionaryEtymologySection.innerHTML = content;
    dictionaryEtymologySection.classList.remove('hidden');
}


// --- Loading and Error States ---
function showDictionaryLoading() {
    if (dictionaryLoading) dictionaryLoading.classList.remove('hidden');
}
function hideDictionaryLoading() {
    if (dictionaryLoading) dictionaryLoading.classList.add('hidden');
}
function showDictionaryError(message) {
    if (dictionaryError) {
        dictionaryError.textContent = message;
        dictionaryError.classList.remove('hidden');
    }
}
function clearDictionaryError() {
    if (dictionaryError) {
        dictionaryError.textContent = '';
        dictionaryError.classList.add('hidden');
    }
}

// --- Dictionary Search History ---
function loadDictionarySearchHistoryFromStorage() {
    const storedHistory = localStorage.getItem(DICTIONARY_HISTORY_KEY);
    if (storedHistory) {
        dictionarySearchHistory = JSON.parse(storedHistory);
    }
}

function saveDictionarySearchHistoryToStorage() {
    localStorage.setItem(DICTIONARY_HISTORY_KEY, JSON.stringify(dictionarySearchHistory));
}

function addWordToSearchHistory(word) {
    if (!word) return;
    const lowerCaseWord = word.toLowerCase();
    dictionarySearchHistory = dictionarySearchHistory.filter(item => item.toLowerCase() !== lowerCaseWord);
    dictionarySearchHistory.unshift(word); 
    if (dictionarySearchHistory.length > 20) { 
        dictionarySearchHistory.pop();
    }
    saveDictionarySearchHistoryToStorage();
}

function clearDictionarySearchHistoryLocal() { // Renamed to avoid conflict if global 'clearDictionarySearchHistory' is used
    dictionarySearchHistory = [];
    saveDictionarySearchHistoryToStorage();
    const historyModalContent = document.querySelector('#dictionaryHistoryModal .modal-content ul');
    if (historyModalContent) {
        historyModalContent.innerHTML = '<li>History cleared.</li>';
    }
}

// Global function for HTML onclick
function openDictionarySearchHistory() {
    let modal = document.getElementById('dictionaryHistoryModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dictionaryHistoryModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(0,0,0,0.7); display: flex;
            align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(5px);
        `;
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content glass'; 
        modalContent.style.cssText = `
            padding: 30px; border-radius: 16px; width: 90%; max-width: 500px;
            max-height: 80vh; overflow-y: auto; background: var(--card); color: var(--card-text);
        `;
        
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.style.cssText = `
            position: absolute; top: 15px; right: 20px; font-size: 28px;
            background: none; border: none; color: var(--text); cursor: pointer; opacity: 0.7;
        `;
        closeButton.onmouseover = () => closeButton.style.opacity = '1';
        closeButton.onmouseout = () => closeButton.style.opacity = '0.7';
        closeButton.onclick = () => modal.style.display = 'none';

        const title = document.createElement('h3');
        title.innerHTML = '<i class="fas fa-history"></i> Search History';
        title.className = 'text-2xl font-semibold mb-6 text-accent';

        const historyList = document.createElement('ul');
        historyList.className = 'history-list space-y-3';

        const clearHistoryButton = document.createElement('button');
        clearHistoryButton.innerHTML = '<i class="fas fa-trash"></i> Clear History';
        clearHistoryButton.className = 'btn danger mt-6 w-full'; // Full width button
        clearHistoryButton.onclick = () => {
            clearDictionarySearchHistoryLocal();
            historyList.innerHTML = '<li>History cleared.</li>'; 
        };
        
        modalContent.appendChild(closeButton);
        modalContent.appendChild(title);
        modalContent.appendChild(historyList);
        modalContent.appendChild(clearHistoryButton);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    const historyListElem = modal.querySelector('.modal-content ul');
    historyListElem.innerHTML = ''; 

    if (dictionarySearchHistory.length === 0) {
        historyListElem.innerHTML = '<li class="text-gray-400">No search history yet.</li>';
    } else {
        dictionarySearchHistory.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            li.className = 'cursor-pointer p-3 rounded-lg hover:bg-opacity-20 transition-all'; 
            li.style.background = 'var(--glass-bg)';
            li.style.border = '1px solid var(--glass-border)';
            li.onclick = () => {
                if(dictionaryWordInput) dictionaryWordInput.value = item;
                searchWord(item);
                modal.style.display = 'none'; 
                if(typeof switchTab === "function") switchTab('dictionary');
            };
            historyListElem.appendChild(li);
        });
    }
    modal.style.display = 'flex';
}