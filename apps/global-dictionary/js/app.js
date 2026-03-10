import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, set, remove, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const app = initializeApp({
  apiKey: "AIzaSyCyhOVe36a1W1y4y1HlStvnm6lf7sYqGbE",
  authDomain: "global-dictionary-e3513.firebaseapp.com",
  databaseURL: "https://global-dictionary-e3513-default-rtdb.firebaseio.com",
  projectId: "global-dictionary-e3513",
  storageBucket: "global-dictionary-e3513.appspot.com",
  messagingSenderId: "103997454700",
  appId: "1:103997454700:web:06882f352aaf7ed227db49",
});

const db = getDatabase(app);
const wordsRef = ref(db, 'words');

// State management
let allWords = [];
let filteredWords = [];
let isSubmitting = false;

// DOM elements
const modal = document.getElementById('addWordModal');
const addWordBtn = document.getElementById('addWordBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const wordForm = document.getElementById('wordForm');
const searchInput = document.getElementById('searchInput');
const wordsContainer = document.getElementById('wordsContainer');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const submitBtn = document.getElementById('submitBtn');

// ─── Utility functions ───────────────────────────────────────────────────────

function validateInput(value, minLength = 2) {
  return value && value.trim().length >= minLength;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// ─── Modal ───────────────────────────────────────────────────────────────────

function openModal() {
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  document.getElementById('nameInput').focus();
}

function closeModal() {
  modal.classList.remove('active');
  document.body.style.overflow = '';
  wordForm.reset();
  submitBtn.disabled = false;
  submitBtn.textContent = 'Add Word to Dictionary';
}

addWordBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
});

// ─── Word Card (safe DOM builder — no innerHTML, no XSS) ─────────────────────

function createWordCard(word) {
  const card = document.createElement('div');
  card.className = 'word-card';

  // Header
  const header = document.createElement('div');
  header.className = 'word-header';

  const title = document.createElement('h3');
  title.className = 'word-title';
  title.textContent = word.word; // textContent is XSS-safe

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.setAttribute('aria-label', `Delete word entry for ${word.word}`);
  deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
  deleteBtn.addEventListener('click', () => deleteWord(word.id));

  header.append(title, deleteBtn);

  // Definition
  const definition = document.createElement('p');
  definition.className = 'word-definition';
  definition.textContent = word.definition;

  // Meta
  const meta = document.createElement('div');
  meta.className = 'word-meta';

  [
    ['fa-user-pen', word.name],
    ['fa-earth-americas', word.country],
    ['fa-calendar-days', formatDate(word.timestamp)]
  ].forEach(([icon, text]) => {
    const div = document.createElement('div');
    const i = document.createElement('i');
    i.className = `fa-solid ${icon}`;
    div.append(i, document.createTextNode(text));
    meta.appendChild(div);
  });

  card.append(header, definition, meta);
  return card;
}

// ─── Display words ────────────────────────────────────────────────────────────

function displayWords(words) {
  wordsContainer.innerHTML = '';
  loadingState.style.display = 'none';

  if (!words || words.length === 0) {
    wordsContainer.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  wordsContainer.style.display = 'grid';

  const sorted = [...words].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  sorted.forEach(word => wordsContainer.appendChild(createWordCard(word)));
}

// ─── Statistics ───────────────────────────────────────────────────────────────

function updateStats(words) {
  document.getElementById('totalWords').textContent = words.length;
  document.getElementById('totalCountries').textContent =
    new Set(words.map(w => w.country.toLowerCase())).size;
  document.getElementById('totalContributors').textContent =
    new Set(words.map(w => w.name.toLowerCase())).size;
}

// ─── Search ───────────────────────────────────────────────────────────────────

function filterWords(searchTerm) {
  if (!searchTerm.trim()) {
    filteredWords = allWords;
  } else {
    const term = searchTerm.toLowerCase();
    filteredWords = allWords.filter(word =>
      word.word.toLowerCase().includes(term) ||
      word.definition.toLowerCase().includes(term) ||
      word.country.toLowerCase().includes(term) ||
      word.name.toLowerCase().includes(term)
    );
  }
  displayWords(filteredWords);
}

const debouncedSearch = debounce((searchTerm) => filterWords(searchTerm), 300);

searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));

// ─── Delete ───────────────────────────────────────────────────────────────────

async function deleteWord(id) {
  if (!confirm("Delete this word? This cannot be undone.")) return;
  try {
    await remove(ref(db, `words/${id}`));
  } catch (error) {
    console.error('Error deleting word:', error);
    alert('Failed to delete. Please try again.');
  }
}

// ─── Form submission ──────────────────────────────────────────────────────────

wordForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (isSubmitting) return; // prevent double-submit

  const name       = document.getElementById('nameInput').value;
  const country    = document.getElementById('countryInput').value;
  const word       = document.getElementById('wordInput').value;
  const definition = document.getElementById('definitionInput').value;

  if (
    !validateInput(name) ||
    !validateInput(country) ||
    !validateInput(word) ||
    !validateInput(definition, 10)
  ) {
    alert("Please ensure all fields are properly filled. Name, country, and word must be at least 2 characters, and definition must be at least 10 characters.");
    return;
  }

  isSubmitting = true;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Adding Word...';

  try {
    const id = Date.now();
    const newWord = {
      id,
      name: name.trim(),
      country: country.trim(),
      word: word.trim(),
      definition: definition.trim(),
      timestamp: new Date().toISOString()
    };

    await set(ref(db, `words/${id}`), newWord);
    closeModal();
  } catch (error) {
    console.error('Error adding word:', error);
    alert('Failed to add the word. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Add Word to Dictionary';
  } finally {
    isSubmitting = false;
  }
});

// ─── Realtime listener ────────────────────────────────────────────────────────

onValue(wordsRef, (snapshot) => {
  try {
    const data = snapshot.val();
    allWords = data ? Object.values(data) : [];

    const currentSearch = searchInput.value;
    if (currentSearch.trim()) {
      filterWords(currentSearch);
    } else {
      filteredWords = allWords;
      displayWords(filteredWords);
    }

    updateStats(allWords);
  } catch (error) {
    console.error('Error loading words:', error);
    loadingState.style.display = 'none';
    emptyState.style.display = 'block';
  }
});

// ─── Load countries datalist ──────────────────────────────────────────────────

async function loadCountries() {
  try {
    const res = await fetch('https://restcountries.com/v3.1/all?fields=name');
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const countries = await res.json();
    const datalist = document.getElementById('countries');
    countries
      .sort((a, b) => a.name.common.localeCompare(b.name.common))
      .forEach(c => {
        const option = document.createElement('option');
        option.value = c.name.common;
        datalist.appendChild(option);
      });
  } catch (error) {
    console.error("Could not load country list:", error);
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

loadingState.style.display = 'flex';
loadCountries();