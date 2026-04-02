// ─── DOM References ────────────────────────────────────────────
const editor = document.getElementById('editor');
const wordCounter = document.getElementById('wordCounter');
const themeToggle = document.getElementById('themeToggle');
const saveBtn = document.getElementById('saveBtn');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const alertMessage = document.getElementById('alertMessage');
const tabBar = document.getElementById('tabBar');
const addTabBtn = document.getElementById('addTabBtn');

// ─── Storage Keys ──────────────────────────────────────────────
const NOTES_KEY = 'WriterNotes';
const ACTIVE_KEY = 'WriterActiveTab';
const THEME_KEY = 'WriterTheme';

// ─── State ─────────────────────────────────────────────────────
let notes = [];       // Array of { id, title, content }
let activeId = null;  // Currently active note id

// ─── Helpers ───────────────────────────────────────────────────
function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function persist() {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    localStorage.setItem(ACTIVE_KEY, activeId);
}

function getActive() {
    return notes.find(n => n.id === activeId);
}

// ─── Tab Rendering ─────────────────────────────────────────────
function renderTabs() {
    // Remove all existing tabs (keep the add button)
    tabBar.querySelectorAll('.tab').forEach(t => t.remove());

    notes.forEach(note => {
        const tab = document.createElement('div');
        tab.className = 'tab' + (note.id === activeId ? ' active' : '');
        tab.dataset.id = note.id;

        const title = document.createElement('span');
        title.className = 'tab-title';
        title.textContent = note.title;
        title.title = 'Double-click to rename';

        // Switch tab on click
        title.addEventListener('click', () => switchTab(note.id));

        // Rename on double-click
        title.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            startRename(note.id, title);
        });

        tab.appendChild(title);

        // Close button (only if more than 1 note)
        if (notes.length > 1) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'tab-close';
            closeBtn.innerHTML = '<i class="fas fa-times"></i>';
            closeBtn.title = 'Close note';
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeTab(note.id);
            });
            tab.appendChild(closeBtn);
        }

        tabBar.insertBefore(tab, addTabBtn);
    });
}

// ─── Tab Actions ───────────────────────────────────────────────
function switchTab(id) {
    // Save current content before switching
    const current = getActive();
    if (current) {
        current.content = editor.innerHTML;
    }

    activeId = id;
    const note = getActive();
    if (note) {
        editor.innerHTML = note.content;
    }

    persist();
    renderTabs();
    updateWordCount();
}

function addTab() {
    // Save current editor content first
    const current = getActive();
    if (current) {
        current.content = editor.innerHTML;
    }

    const note = {
        id: uid(),
        title: 'Untitled ' + (notes.length + 1),
        content: ''
    };
    notes.push(note);
    activeId = note.id;
    editor.innerHTML = '';

    persist();
    renderTabs();
    updateWordCount();
    editor.focus();

    showAlert('New note created!', 'success');
}

function closeTab(id) {
    if (notes.length <= 1) return;

    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) return;

    const noteTitle = notes[idx].title;
    notes.splice(idx, 1);

    // If we closed the active tab, switch to the nearest neighbor
    if (activeId === id) {
        const newIdx = Math.min(idx, notes.length - 1);
        activeId = notes[newIdx].id;
        const note = getActive();
        editor.innerHTML = note ? note.content : '';
    }

    persist();
    renderTabs();
    updateWordCount();

    showAlert(`"${noteTitle}" closed`, 'success');
}

function startRename(id, titleEl) {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tab-rename-input';
    input.value = note.title;
    input.maxLength = 30;

    const finishRename = () => {
        const newTitle = input.value.trim() || 'Untitled';
        note.title = newTitle;
        persist();
        renderTabs();
    };

    input.addEventListener('blur', finishRename);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            input.blur();
        }
        if (e.key === 'Escape') {
            input.value = note.title; // revert
            input.blur();
        }
    });

    titleEl.replaceWith(input);
    input.focus();
    input.select();
}

// ─── Word Count ────────────────────────────────────────────────
function updateWordCount() {
    const text = editor.innerText || '';
    const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const charCount = text.length;
    wordCounter.textContent = `${wordCount} words, ${charCount} characters`;
}

// ─── Auto-save on input ───────────────────────────────────────
editor.addEventListener('input', () => {
    const note = getActive();
    if (note) {
        note.content = editor.innerHTML;
    }
    persist();
    updateWordCount();
});

// ─── Manual Save ───────────────────────────────────────────────
saveBtn.addEventListener('click', () => {
    const note = getActive();
    if (note) {
        note.content = editor.innerHTML;
    }
    persist();
    showAlert('All notes saved!', 'success');
});

// ─── Add Tab Button ────────────────────────────────────────────
addTabBtn.addEventListener('click', addTab);

// ─── Theme Toggle ──────────────────────────────────────────────
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem(THEME_KEY, 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem(THEME_KEY, 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
});

// ─── Export PDF ────────────────────────────────────────────────
exportPdfBtn.addEventListener('click', () => {
    const note = getActive();
    const filename = note ? note.title.replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'document' : 'document';

    const opt = {
        margin: [15, 15],
        filename: `${filename}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(editor).set(opt).save()
        .then(() => {
            showAlert('PDF exported successfully!', 'success');
        })
        .catch(err => {
            showAlert('Error exporting PDF. Please try again.', 'error');
            console.error('PDF export error:', err);
        });
});

// ─── Formatting Commands ───────────────────────────────────────
document.getElementById('boldBtn').addEventListener('click', () => {
    document.execCommand('bold', false, null);
    editor.focus();
});

document.getElementById('italicBtn').addEventListener('click', () => {
    document.execCommand('italic', false, null);
    editor.focus();
});

document.getElementById('underlineBtn').addEventListener('click', () => {
    document.execCommand('underline', false, null);
    editor.focus();
});

document.getElementById('strikeBtn').addEventListener('click', () => {
    document.execCommand('strikeThrough', false, null);
    editor.focus();
});

document.getElementById('alignLeftBtn').addEventListener('click', () => {
    document.execCommand('justifyLeft', false, null);
    editor.focus();
});

document.getElementById('alignCenterBtn').addEventListener('click', () => {
    document.execCommand('justifyCenter', false, null);
    editor.focus();
});

document.getElementById('alignRightBtn').addEventListener('click', () => {
    document.execCommand('justifyRight', false, null);
    editor.focus();
});

document.getElementById('listBtn').addEventListener('click', () => {
    document.execCommand('insertUnorderedList', false, null);
    editor.focus();
});

document.getElementById('numberListBtn').addEventListener('click', () => {
    document.execCommand('insertOrderedList', false, null);
    editor.focus();
});

document.getElementById('linkBtn').addEventListener('click', () => {
    const url = prompt('Enter URL:', 'https://');
    if (url) {
        document.execCommand('createLink', false, url);
    }
    editor.focus();
});

document.getElementById('clearFormatBtn').addEventListener('click', () => {
    document.execCommand('removeFormat', false, null);
    editor.focus();
});

document.getElementById('fontFamily').addEventListener('change', function () {
    if (this.value !== 'inherit') {
        document.execCommand('fontName', false, this.value);
        editor.focus();
    }
});

document.getElementById('fontSize').addEventListener('change', function () {
    if (this.value) {
        document.execCommand('fontSize', false, this.value);
        editor.focus();
    }
});

// ─── Alert ─────────────────────────────────────────────────────
function showAlert(message, type) {
    alertMessage.textContent = message;
    alertMessage.className = 'alert show alert-' + type;
    setTimeout(() => {
        alertMessage.classList.remove('show');
    }, 3000);
}

// ─── Keyboard Shortcuts ────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+N — New note
    if (e.ctrlKey && e.shiftKey && e.key === 'N') {
        e.preventDefault();
        addTab();
    }
    // Ctrl+W — Close current note
    if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        if (notes.length > 1) closeTab(activeId);
    }
    // Ctrl+Tab — Next note
    if (e.ctrlKey && e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        const idx = notes.findIndex(n => n.id === activeId);
        const nextIdx = (idx + 1) % notes.length;
        switchTab(notes[nextIdx].id);
    }
    // Ctrl+Shift+Tab — Previous note
    if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        const idx = notes.findIndex(n => n.id === activeId);
        const prevIdx = (idx - 1 + notes.length) % notes.length;
        switchTab(notes[prevIdx].id);
    }
});

// ─── Initialization ───────────────────────────────────────────
window.onload = () => {
    // Load theme
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }

    // Load notes
    const savedNotes = localStorage.getItem(NOTES_KEY);
    const savedActive = localStorage.getItem(ACTIVE_KEY);

    if (savedNotes) {
        try {
            notes = JSON.parse(savedNotes);
        } catch (e) {
            notes = [];
        }
    }

    // Migrate legacy single-note content
    if (notes.length === 0) {
        const legacyContent = localStorage.getItem('WriterContent') || '';
        notes = [{
            id: uid(),
            title: 'My Note',
            content: legacyContent || 'Welcome to Vylex Writer! Start typing or use the formatting tools above.'
        }];
    }

    // Restore active tab
    if (savedActive && notes.find(n => n.id === savedActive)) {
        activeId = savedActive;
    } else {
        activeId = notes[0].id;
    }

    // Load editor content
    const note = getActive();
    if (note) {
        editor.innerHTML = note.content;
    }

    persist();
    renderTabs();
    updateWordCount();
};