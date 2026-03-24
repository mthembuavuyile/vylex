function bibleApp() {
    return {

        // ─────────────────────────────────────────────
        // CONSTANTS & DATA
        // ─────────────────────────────────────────────

        bibleBooks: [
            { id: 'GEN', name: 'Genesis', chapters: 50, testament: 'OT' },
            { id: 'EXO', name: 'Exodus', chapters: 40, testament: 'OT' },
            { id: 'LEV', name: 'Leviticus', chapters: 27, testament: 'OT' },
            { id: 'NUM', name: 'Numbers', chapters: 36, testament: 'OT' },
            { id: 'DEU', name: 'Deuteronomy', chapters: 34, testament: 'OT' },
            { id: 'JOS', name: 'Joshua', chapters: 24, testament: 'OT' },
            { id: 'JDG', name: 'Judges', chapters: 21, testament: 'OT' },
            { id: 'RUT', name: 'Ruth', chapters: 4, testament: 'OT' },
            { id: '1SA', name: '1 Samuel', chapters: 31, testament: 'OT' },
            { id: '2SA', name: '2 Samuel', chapters: 24, testament: 'OT' },
            { id: '1KI', name: '1 Kings', chapters: 22, testament: 'OT' },
            { id: '2KI', name: '2 Kings', chapters: 25, testament: 'OT' },
            { id: '1CH', name: '1 Chronicles', chapters: 29, testament: 'OT' },
            { id: '2CH', name: '2 Chronicles', chapters: 36, testament: 'OT' },
            { id: 'EZR', name: 'Ezra', chapters: 10, testament: 'OT' },
            { id: 'NEH', name: 'Nehemiah', chapters: 13, testament: 'OT' },
            { id: 'EST', name: 'Esther', chapters: 10, testament: 'OT' },
            { id: 'JOB', name: 'Job', chapters: 42, testament: 'OT' },
            { id: 'PSA', name: 'Psalms', chapters: 150, testament: 'OT' },
            { id: 'PRO', name: 'Proverbs', chapters: 31, testament: 'OT' },
            { id: 'ECC', name: 'Ecclesiastes', chapters: 12, testament: 'OT' },
            { id: 'SNG', name: 'Song of Solomon', chapters: 8, testament: 'OT' },
            { id: 'ISA', name: 'Isaiah', chapters: 66, testament: 'OT' },
            { id: 'JER', name: 'Jeremiah', chapters: 52, testament: 'OT' },
            { id: 'LAM', name: 'Lamentations', chapters: 5, testament: 'OT' },
            { id: 'EZK', name: 'Ezekiel', chapters: 48, testament: 'OT' },
            { id: 'DAN', name: 'Daniel', chapters: 12, testament: 'OT' },
            { id: 'HOS', name: 'Hosea', chapters: 14, testament: 'OT' },
            { id: 'JOL', name: 'Joel', chapters: 3, testament: 'OT' },
            { id: 'AMO', name: 'Amos', chapters: 9, testament: 'OT' },
            { id: 'OBA', name: 'Obadiah', chapters: 1, testament: 'OT' },
            { id: 'JON', name: 'Jonah', chapters: 4, testament: 'OT' },
            { id: 'MIC', name: 'Micah', chapters: 7, testament: 'OT' },
            { id: 'NAM', name: 'Nahum', chapters: 3, testament: 'OT' },
            { id: 'HAB', name: 'Habakkuk', chapters: 3, testament: 'OT' },
            { id: 'ZEP', name: 'Zephaniah', chapters: 3, testament: 'OT' },
            { id: 'HAG', name: 'Haggai', chapters: 2, testament: 'OT' },
            { id: 'ZEC', name: 'Zechariah', chapters: 14, testament: 'OT' },
            { id: 'MAL', name: 'Malachi', chapters: 4, testament: 'OT' },
            { id: 'MAT', name: 'Matthew', chapters: 28, testament: 'NT' },
            { id: 'MRK', name: 'Mark', chapters: 16, testament: 'NT' },
            { id: 'LUK', name: 'Luke', chapters: 24, testament: 'NT' },
            { id: 'JHN', name: 'John', chapters: 21, testament: 'NT' },
            { id: 'ACT', name: 'Acts', chapters: 28, testament: 'NT' },
            { id: 'ROM', name: 'Romans', chapters: 16, testament: 'NT' },
            { id: '1CO', name: '1 Corinthians', chapters: 16, testament: 'NT' },
            { id: '2CO', name: '2 Corinthians', chapters: 13, testament: 'NT' },
            { id: 'GAL', name: 'Galatians', chapters: 6, testament: 'NT' },
            { id: 'EPH', name: 'Ephesians', chapters: 6, testament: 'NT' },
            { id: 'PHP', name: 'Philippians', chapters: 4, testament: 'NT' },
            { id: 'COL', name: 'Colossians', chapters: 4, testament: 'NT' },
            { id: '1TH', name: '1 Thessalonians', chapters: 5, testament: 'NT' },
            { id: '2TH', name: '2 Thessalonians', chapters: 3, testament: 'NT' },
            { id: '1TI', name: '1 Timothy', chapters: 6, testament: 'NT' },
            { id: '2TI', name: '2 Timothy', chapters: 4, testament: 'NT' },
            { id: 'TIT', name: 'Titus', chapters: 3, testament: 'NT' },
            { id: 'PHM', name: 'Philemon', chapters: 1, testament: 'NT' },
            { id: 'HEB', name: 'Hebrews', chapters: 13, testament: 'NT' },
            { id: 'JAS', name: 'James', chapters: 5, testament: 'NT' },
            { id: '1PE', name: '1 Peter', chapters: 5, testament: 'NT' },
            { id: '2PE', name: '2 Peter', chapters: 3, testament: 'NT' },
            { id: '1JN', name: '1 John', chapters: 5, testament: 'NT' },
            { id: '2JN', name: '2 John', chapters: 1, testament: 'NT' },
            { id: '3JN', name: '3 John', chapters: 1, testament: 'NT' },
            { id: 'JUD', name: 'Jude', chapters: 1, testament: 'NT' },
            { id: 'REV', name: 'Revelation', chapters: 22, testament: 'NT' }
        ],

        translations: [
            { id: 'web', name: 'World English Bible (WEB)' },
            { id: 'kjv', name: 'King James Version (KJV)' },
            { id: 'bbe', name: 'Bible in Basic English (BBE)' }
        ],

        themes: ['light', 'dark', 'sepia'],

        // Translation code mappings per API (primary uses lowercase, bolls uses uppercase)
        // Bolls.life supported translations that overlap with our list
        bollsTranslationMap: {
            web: 'WEB',
            kjv: 'KJV',
            bbe: 'BBE'
        },

        // ─────────────────────────────────────────────
        // STATE
        // ─────────────────────────────────────────────

        selectedBook: 'JHN',
        selectedChapter: 3,
        translation: 'web',
        theme: 'light',

        verses: [],
        loading: true,
        error: false,
        errorMessage: '',

        highlights: {},

        // UI State
        showNavigator: false,
        navStep: 'books',   // 'books' | 'chapters'
        navBookId: '',
        searchQuery: '',
        showTranslationMenu: false,
        activeVerse: null,
        toast: { show: false, message: '', timeout: null },
        targetVerse: null,

        // ─────────────────────────────────────────────
        // COMPUTED GETTERS
        // ─────────────────────────────────────────────

        get oldTestamentBooks() {
            const q = this.searchQuery.toLowerCase();
            return this.bibleBooks.filter(
                b => b.testament === 'OT' && b.name.toLowerCase().includes(q)
            );
        },

        get newTestamentBooks() {
            const q = this.searchQuery.toLowerCase();
            return this.bibleBooks.filter(
                b => b.testament === 'NT' && b.name.toLowerCase().includes(q)
            );
        },

        get currentBookName() {
            return this.bibleBooks.find(b => b.id === this.selectedBook)?.name || '';
        },

        get currentBook() {
            return this.bibleBooks.find(b => b.id === this.selectedBook) || null;
        },

        get translationName() {
            return this.translations.find(t => t.id === this.translation)?.name || '';
        },

        get navBookName() {
            return this.bibleBooks.find(b => b.id === this.navBookId)?.name || '';
        },

        get navChapters() {
            const book = this.bibleBooks.find(b => b.id === this.navBookId);
            return book ? Array.from({ length: book.chapters }, (_, i) => i + 1) : [];
        },

        get isFirstChapter() {
            return this.selectedBook === 'GEN' && this.selectedChapter === 1;
        },

        get isLastChapter() {
            return this.selectedBook === 'REV' && this.selectedChapter === 22;
        },


        //Check if a given verse is highlighted

        isVerseHighlighted(verse) {
            if (!verse) return false;
            const key = `${this.selectedBook}-${this.selectedChapter}-${verse.verse}`;
            return !!this.highlights[key];
        },

        // ─────────────────────────────────────────────
        // INITIALIZATION
        // ─────────────────────────────────────────────

        init() {
            this.loadPreferences();

            // --- NEW: Parse URL Parameters ---
            const params = new URLSearchParams(window.location.search);
            if (params.has('book')) {
                const b = params.get('book').toUpperCase();
                if (this.bibleBooks.find(book => book.id === b)) this.selectedBook = b;
            }
            if (params.has('chapter')) {
                const c = parseInt(params.get('chapter'), 10);
                if (!isNaN(c) && c > 0) this.selectedChapter = c;
            }
            if (params.has('translation')) {
                const t = params.get('translation').toLowerCase();
                if (this.translations.find(trans => trans.id === t)) this.translation = t;
            }
            if (params.has('verse')) {
                this.targetVerse = parseInt(params.get('verse'), 10);
            }

            this.loadHighlights(); // NEW: Load highlights on init
            this.applyTheme();
            this.fetchVerses();
        },

        // ─────────────────────────────────────────────
        // PREFERENCES
        // ─────────────────────────────────────────────

        loadPreferences() {
            try {
                this.selectedBook = localStorage.getItem('vylex_bible_book') || 'JHN';
                this.selectedChapter = parseInt(localStorage.getItem('vylex_bible_chapter') || '3', 10);
                this.translation = localStorage.getItem('vylex_bible_translation') || 'web';
                this.theme = localStorage.getItem('vylex_bible_theme') || 'light';

                // Guard against corrupted values
                if (!this.bibleBooks.find(b => b.id === this.selectedBook)) this.selectedBook = 'JHN';
                if (!this.translations.find(t => t.id === this.translation)) this.translation = 'web';
                if (!this.themes.includes(this.theme)) this.theme = 'light';
                if (isNaN(this.selectedChapter) || this.selectedChapter < 1) this.selectedChapter = 1;
            } catch {
                // localStorage unavailable (private browsing, etc.) — use defaults silently
            }
        },

        savePreferences() {
            try {
                localStorage.setItem('vylex_bible_book', this.selectedBook);
                localStorage.setItem('vylex_bible_chapter', String(this.selectedChapter));
                localStorage.setItem('vylex_bible_translation', this.translation);
                localStorage.setItem('vylex_bible_theme', this.theme);
            } catch {
                // Ignore write errors (storage quota, etc.)
            }
        },

        // NEW: Highlight management persistence
        saveHighlights() {
            try {
                localStorage.setItem('vylex_bible_highlights', JSON.stringify(this.highlights));
            } catch (e) {
                console.warn('Could not save highlights to localStorage:', e);
                this.showToast('Could not save highlight (storage full?)', 4000);
            }
        },

        loadHighlights() {
            try {
                const storedHighlights = localStorage.getItem('vylex_bible_highlights');
                this.highlights = storedHighlights ? JSON.parse(storedHighlights) : {};
            } catch (e) {
                console.warn('Could not load highlights from localStorage, resetting:', e);
                this.highlights = {};
            }
        },

        _finalizeFetch(verses) {
            this.verses = verses;
            this._writeCache(this.verses);
            this.loading = false;

            // Wait for DOM to render, then scroll to verse if deep-linked
            this.$nextTick(() => {
                if (this.targetVerse) {
                    const el = document.getElementById('verse-' + this.targetVerse);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        // Optional: automatically open the menu/highlight the shared verse
                        const targetV = this.verses.find(v => v.verse == this.targetVerse);
                        if (targetV) this.activeVerse = targetV;
                        
                        // Reset target verse so normal chapter navigation works properly
                        this.targetVerse = null; 
                    }
                }
            });
        },

        // ─────────────────────────────────────────────
        // THEME MANAGEMENT
        // ─────────────────────────────────────────────

        cycleTheme() {
            const idx = this.themes.indexOf(this.theme);
            this.theme = this.themes[(idx + 1) % this.themes.length];
            this.applyTheme();
            this.savePreferences();
        },

        applyTheme() {
            const html = document.documentElement;
            html.classList.remove('dark', 'sepia');
            if (this.theme === 'dark') html.classList.add('dark');
            if (this.theme === 'sepia') html.classList.add('sepia');
        },

        // ─────────────────────────────────────────────
        // NETWORKING UTILITIES
        // ─────────────────────────────────────────────

        /**
         * Fetch with a configurable timeout. Rejects with an AbortError on timeout.
         * @param {string} url
         * @param {number} [timeoutMs=7000]
         * @returns {Promise<Response>}
         */
        async _fetchWithTimeout(url, timeoutMs = 7000) {
            const controller = new AbortController();
            const timerId = setTimeout(() => controller.abort(), timeoutMs);
            try {
                const response = await fetch(url, { signal: controller.signal });
                return response;
            } finally {
                clearTimeout(timerId);
            }
        },

        /**
         * Strip HTML tags, remove Strong's numbers, remove embedded verse numbers,
         * and normalise whitespace from a string.
         * @param {string} str
         * @returns {string}
         */
        _cleanVerseText(str) {
            if (!str) return '';

            let cleanText = str;

            // 1. Strip HTML tags
            cleanText = cleanText.replace(/<[^>]*>/g, '');

            // 2. Remove leading verse numbers (e.g., "1And" becomes "And")
            // This prevents duplicate verse numbers since your UI already adds them
            cleanText = cleanText.replace(/^\s*\d+\s*/, '');

            // 3. Remove Strong's numbers (digits immediately following letters)
            // Uses a capture group to keep the word, but drop the attached number
            cleanText = cleanText.replace(/([a-zA-Z])\d+/g, '$1');
            cleanText = cleanText.replace(/\s+\d{3,5}\b/g, '');

            // 4. Normalise whitespace
            return cleanText.replace(/\s+/g, ' ').trim();
        },

        // ─────────────────────────────────────────────
        // CACHE HELPERS
        // ─────────────────────────────────────────────

        _cacheKey() {
            return `vylex_bible_${this.translation}_${this.selectedBook}_${this.selectedChapter}`;
        },

        _readCache() {
            try {
                const raw = localStorage.getItem(this._cacheKey());
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
            } catch {
                return null;
            }
        },

        _writeCache(verses) {
            try {
                localStorage.setItem(this._cacheKey(), JSON.stringify(verses));
            } catch {
                // Storage quota exceeded or unavailable — not critical
            }
        },

        // ─────────────────────────────────────────────
        // VERSE FETCHING — 3-TIER FALLBACK
        // ─────────────────────────────────────────────

        async fetchVerses() {
            this.loading = true;
            this.error = false;
            this.errorMessage = '';
            this.verses = [];
            this.activeVerse = null;

            if (!this.targetVerse) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

            this.savePreferences();

            const bookName = this.currentBookName;
            const chapter = this.selectedChapter;
            const bookIndex = this.bibleBooks.findIndex(b => b.id === this.selectedBook) + 1; // 1-based

            // ── Tier 1: bible-api.com ────────────────
            try {
                const url = `https://bible-api.com/${encodeURIComponent(bookName)}+${chapter}?translation=${this.translation}`;
                const response = await this._fetchWithTimeout(url, 7000);
                const data = await response.json();

                if (!response.ok || data.error) throw new Error(data.error || 'Primary API error');

                const verses = data.verses || [];
                if (verses.length === 0) throw new Error('Empty response from primary API');

                this.verses = verses.map(v => ({
                    verse: v.verse,
                    text: this._cleanVerseText(v.text)
                }));

                this._writeCache(this.verses);
                this.loading = false;
                return;

            } catch (err1) {
                console.warn('[Bible] Tier-1 (bible-api.com) failed:', err1.message);
            }

            // ── Tier 2: bolls.life ───────────────────
            try {
                const bollsTranslation = this.bollsTranslationMap[this.translation] || this.translation.toUpperCase();
                const url = `https://bolls.life/get-chapter/${bollsTranslation}/${bookIndex}/${chapter}/`;
                const response = await this._fetchWithTimeout(url, 7000);

                if (!response.ok) throw new Error(`Bolls API HTTP ${response.status}`);

                const data = await response.json();

                if (!Array.isArray(data) || data.length === 0) throw new Error('Empty response from Bolls API');

                this.verses = data.map(v => ({
                    verse: v.verse,
                    text: this._cleanVerseText(v.text)
                }));

                this._writeCache(this.verses);
                this.loading = false;
                return;

            } catch (err2) {
                console.warn('[Bible] Tier-2 (bolls.life) failed:', err2.message);
            }

            // ── Tier 3: Offline device cache ─────────
            const cached = this._readCache();
            if (cached) {
                this.verses = cached;
                this.loading = false;
                this.showToast('Offline mode — loaded from device cache.');
                return;
            }

            // ── Ultimate failure ──────────────────────
            this.error = true;

            const translationHints = {
                bbe: 'KJV or WEB',
                web: 'KJV or BBE',
                kjv: 'WEB or BBE'
            };

            const suggestion = translationHints[this.translation];

            this.errorMessage = `Unable to load passage. Check your internet connection and try again.${suggestion ? ` You could also try the ${suggestion} translation.` : ''}`;
            this.loading = false;
        },

        // ─────────────────────────────────────────────
        // NAVIGATION
        // ─────────────────────────────────────────────

        openNavigator() {
            this.navBookId = this.selectedBook;
            this.navStep = 'books';
            this.searchQuery = '';
            this.showNavigator = true;
        },

        closeNavigator() {
            this.showNavigator = false;
            this.searchQuery = '';
        },

        selectNavBook(book) {
            this.navBookId = book.id;
            this.navStep = 'chapters';
            // Scroll modal back to top after step change
            this.$nextTick?.(() => {
                const el = document.querySelector('.nav-scroll-container');
                if (el) el.scrollTop = 0;
            });
        },

        backToBooks() {
            this.navStep = 'books';
        },

        executeNavigation(chapter) {
            this.selectedBook = this.navBookId;
            this.selectedChapter = chapter;
            this.closeNavigator();
            this.fetchVerses();
        },

        prevChapter() {
            if (this.loading || this.isFirstChapter) return;

            const idx = this.bibleBooks.findIndex(b => b.id === this.selectedBook);

            if (this.selectedChapter > 1) {
                this.selectedChapter--;
            } else if (idx > 0) {
                const prev = this.bibleBooks[idx - 1];
                this.selectedBook = prev.id;
                this.selectedChapter = prev.chapters;
            }

            this.fetchVerses();
        },

        nextChapter() {
            if (this.loading || this.isLastChapter) return;

            const idx = this.bibleBooks.findIndex(b => b.id === this.selectedBook);
            const book = this.bibleBooks[idx];

            if (this.selectedChapter < book.chapters) {
                this.selectedChapter++;
            } else if (idx < this.bibleBooks.length - 1) {
                this.selectedBook = this.bibleBooks[idx + 1].id;
                this.selectedChapter = 1;
            }

            this.fetchVerses();
        },

        // ─────────────────────────────────────────────
        // TRANSLATION MENU
        // ─────────────────────────────────────────────

        openTranslations() {
            this.showTranslationMenu = true;
        },

        closeTranslations() {
            this.showTranslationMenu = false;
        },

        setTranslation(id) {
            if (id === this.translation) {
                this.closeTranslations();
                return;
            }
            this.translation = id;
            this.closeTranslations();
            this.fetchVerses();
        },

        // ─────────────────────────────────────────────
        // VERSE INTERACTION
        // ─────────────────────────────────────────────

        selectVerse(verse) {
            // Toggle: tapping the same verse de-selects it
            this.activeVerse = (this.activeVerse?.verse === verse.verse) ? null : verse;
        },
        _getShareUrl() {
            const baseUrl = window.location.origin + window.location.pathname; // Gets https://vylex.co.za/portfolio/bible/index.html
            return `${baseUrl}?book=${this.selectedBook}&chapter=${this.selectedChapter}&verse=${this.activeVerse.verse}&translation=${this.translation}`;
        },

        clearActiveVerse() {
            this.activeVerse = null;
        },

        getFormattedVerse(verse) {
            if (!verse) return '';
            const ref = `${this.currentBookName} ${this.selectedChapter}:${verse.verse}`;
            return `"${verse.text.trim()}" — ${ref} (${this.translation.toUpperCase()})`;
        },

        getFormattedActiveVerse() {
            return this.getFormattedVerse(this.activeVerse);
        },

        async copyActiveVerse() {
            if (!this.activeVerse) return;
            const text = this.getFormattedActiveVerse();
            const shareUrl = this._getShareUrl();

            try {
                // Now copies both the text AND the link
                await navigator.clipboard.writeText(`${text}\n\nRead here: ${shareUrl}`);
                this.clearActiveVerse();
                this.showToast('Verse and link copied to clipboard ✓');
            } catch {
                prompt('Copy this verse:', `${text}\n\nRead here: ${shareUrl}`);
            }
        },

        shareActiveVerse() {
            if (!this.activeVerse) return;
            const text = this.getFormattedActiveVerse();
            const shareUrl = this._getShareUrl();

            if (navigator.share) {
                navigator.share({
                    title: `Bible Verse: ${this.currentBookName} ${this.selectedChapter}:${this.activeVerse.verse}`,
                    text: text,
                    url: shareUrl
                })
                    .then(() => this.clearActiveVerse())
                    .catch(err => {
                        // User cancelled share or share failed — fall back to copy
                        if (err.name !== 'AbortError') this.copyActiveVerse();
                    });
            } else {
                // Web Share API not available — fall back to copy
                this.copyActiveVerse();
            }
        },
        // NEW: Toggle highlight for a verse
        toggleHighlight(verse) {
            if (!verse) return;
            const key = `${this.selectedBook}-${this.selectedChapter}-${verse.verse}`;

            if (this.highlights[key]) {
                // Unhighlight
                // Use Vue/Alpine reactivity workaround: create a new object
                const newHighlights = { ...this.highlights };
                delete newHighlights[key];
                this.highlights = newHighlights;
                this.showToast('Verse unhighlighted.');
            } else {
                // Highlight
                this.highlights = { ...this.highlights, [key]: true };
                this.showToast('Verse highlighted ✓');
            }
            this.saveHighlights();
            this.clearActiveVerse(); // Close the action sheet after toggling
        },

        // ─────────────────────────────────────────────
        // TOAST NOTIFICATIONS
        // ─────────────────────────────────────────────

        showToast(message, durationMs = 3000) {
            this.toast.message = message;
            this.toast.show = true;
            if (this.toast.timeout) clearTimeout(this.toast.timeout);
            this.toast.timeout = setTimeout(() => {
                this.toast.show = false;
                this.toast.message = '';
                this.toast.timeout = null;
            }, durationMs);
        }

    };
}