// --- Firebase Setup ---
    // NOTE: Your Firebase config is public by design. Secure your database using Firebase Security Rules.
    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
    import { getDatabase, ref, onValue, onChildAdded, onChildChanged, onChildRemoved, set, push, serverTimestamp, runTransaction, remove, onDisconnect } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
    
    const firebaseConfig = {
        apiKey: "AIzaSyD1ivyeUKAoNFZ-NQIlQ9AVlvfTTYqmgA0",
        authDomain: "nexysnet-43a4d.firebaseapp.com",
        databaseURL: "https://nexysnet-43a4d-default-rtdb.firebaseio.com",
        projectId: "nexysnet-43a4d",
        storageBucket: "nexysnet-43a4d.appspot.com",
        messagingSenderId: "756843839147",
        appId: "1:756843839147:web:56a7f6bc8d797142be41ee"
    };
    
    class NexysSocialApp {
        constructor() {
            // --- Constants ---
            this.REACTIONS_AVAILABLE = ['❤️', '🚀', '🤯', '🔥', '👍', '😂'];
            this.MAX_POST_LENGTH = 500;
            
            // --- State ---
            this.state = {
                currentUser: 'Guest',
                captcha: { num1: 0, num2: 0, answer: 0 },
                isFeedInitialized: false,
                urlParams: { postId: null, searchQuery: null },
                searchTimeout: null,
                lastScrollTop: 0,
                headerHeight: 0,
            };
    
            // --- Firebase ---
            this.firebaseApp = initializeApp(firebaseConfig);
            this.db = getDatabase(this.firebaseApp);
            this.postsRef = ref(this.db, 'posts');
            this.connectionsRef = ref(this.db, 'connections');
            this.presenceRef = ref(this.db, '.info/connected');
    
            // --- DOM Elements ---
            this.D = {
                userAvatar: document.getElementById('userAvatar'),
                usernameModal: document.getElementById('usernameModal'),
                closeModal: document.getElementById('closeModal'),
                saveUserName: document.getElementById('saveUserName'),
                userNameInput: document.getElementById('userNameInput'),
                captchaQuestion: document.getElementById('captchaQuestion'),
                captchaAnswer: document.getElementById('captchaAnswer'),
                composerTrigger: document.getElementById('composer-trigger'),
                composerAvatar: document.getElementById('composerAvatar'),
                composerExpandedContent: document.getElementById('composer-expanded-content'),
                postContentInput: document.getElementById('postContentInput'),
                postImageURLInput: document.getElementById('postImageURLInput'),
                postTagsInput: document.getElementById('postTagsInput'),
                submitPostBtn: document.getElementById('submitPostBtn'),
                cancelPostBtn: document.getElementById('cancelPostBtn'),
                postsContainer: document.getElementById('postsContainer'),
                skeletonLoader: document.getElementById('skeleton-loader'),
                postCharCounter: document.getElementById('postCharCounter'),
                postTemplate: document.getElementById('post-template'),
                noResultsTemplate: document.getElementById('no-results-template'),
                toast: document.getElementById('toast'),
                toastIcon: document.getElementById('toastIcon'),
                toastMessage: document.getElementById('toastMessage'),
                onlineCount: document.getElementById('onlineCount'),
                activeUsers: document.getElementById('activeUsers'),
                totalPosts: document.getElementById('totalPosts'),
                totalReactions: document.getElementById('totalReactions'),
                trendingTopics: document.getElementById('trendingTopics'),
                // REFACTORED elements
                mainHeader: document.getElementById('main-header'),
                mainContent: document.querySelector('main'),
                logoLink: document.getElementById('logo-link'),
                headerMainContent: document.getElementById('header-main-content'),
                mobileSearchView: document.getElementById('mobile-search-view'),
                mobileSearchToggle: document.getElementById('mobile-search-toggle'),
                mobileSearchClose: document.getElementById('mobile-search-close'),
                desktopSearchInput: document.getElementById('desktopSearchInput'),
                mobileSearchInput: document.getElementById('mobileSearchInput'),
            };
    
            this.init();
        }
    
        // --- INITIALIZATION ---
    init() {
        this.setHeaderHeight();
        this.handleUrlParameters();
        this.initUser();
        this.bindEvents();
        this.initFirebaseListeners();

        // Check for postId in URL after initialization
        if (this.state.urlParams.postId) {
            setTimeout(() => {
                const targetPost = this.D.postsContainer.querySelector(`[data-post-id="${this.state.urlParams.postId}"]`);
                if (!targetPost && this.state.isFeedInitialized) {
                    this.handlePostNotFound();
                }
            }, 3000);
        }
    }


        setHeaderHeight() {
            this.state.headerHeight = this.D.mainHeader.offsetHeight;
            this.D.mainContent.style.paddingTop = `${this.state.headerHeight + 24}px`; // header height + original py-6
        }
        
        bindEvents() {
            this.D.userAvatar.addEventListener('click', () => this.showUsernameModal());
            this.D.closeModal.addEventListener('click', () => this.D.usernameModal.classList.remove('active'));
            this.D.saveUserName.addEventListener('click', () => this.handleSaveUser());
            [this.D.userNameInput, this.D.captchaAnswer].forEach(el => el.addEventListener('keypress', (e) => e.key === 'Enter' && this.handleSaveUser()));
            
            // REFACTORED Header, Logo, and Search Events
            window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
            this.D.logoLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            this.D.mobileSearchToggle.addEventListener('click', () => this.toggleMobileSearch(true));
            this.D.mobileSearchClose.addEventListener('click', () => this.toggleMobileSearch(false));
            
            // CONSOLIDATED Search event for both inputs
            [this.D.desktopSearchInput, this.D.mobileSearchInput].forEach(input => {
                input.addEventListener('input', (e) => {
                    clearTimeout(this.state.searchTimeout);
                    this.state.searchTimeout = setTimeout(() => {
                        const query = e.target.value.trim();
                        // Sync the other input's value for seamless experience
                        if (e.target === this.D.desktopSearchInput) {
                            this.D.mobileSearchInput.value = query;
                        } else {
                            this.D.desktopSearchInput.value = query;
                        }
                        this.filterPosts(query);
                        this.updateUrlWithSearch(query);
                    }, 300);
                });
            });

            // Composer events
            this.D.composerTrigger.addEventListener('click', () => this.checkUser() && this.toggleComposer(true));
            this.D.cancelPostBtn.addEventListener('click', () => this.toggleComposer(false));
            this.D.submitPostBtn.addEventListener('click', () => this.handleCreatePost());
            this.D.postContentInput.addEventListener('input', () => this.updateCharCounter());
            this.D.postImageURLInput.addEventListener('input', () => this.updateCharCounter());
            this.D.postsContainer.addEventListener('click', (e) => this.handlePostInteraction(e));
        }
    
        // --- NEW METHODS for header and mobile search ---
        handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Only hide header if mobile search is not active
            if (this.D.mobileSearchView.classList.contains('hidden')) {
                if (scrollTop > this.state.lastScrollTop && scrollTop > this.state.headerHeight) {
                    // Scroll Down
                    this.D.mainHeader.classList.add('header-hidden');
                } else {
                    // Scroll Up
                    this.D.mainHeader.classList.remove('header-hidden');
                }
            }
            
            this.state.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }

        toggleMobileSearch(show) {
            this.D.headerMainContent.classList.toggle('hidden', show);
            this.D.mobileSearchView.classList.toggle('hidden', !show);
            
            if (show) {
                this.D.mobileSearchInput.focus();
                // Ensure header is visible when search is activated
                this.D.mainHeader.classList.remove('header-hidden');
            } else {
                // Clear search when user cancels on mobile
                const query = '';
                this.D.mobileSearchInput.value = query;
                this.D.desktopSearchInput.value = query;
                this.filterPosts(query);
                this.updateUrlWithSearch(query);
            }
        }
        
        // --- UTILITY FUNCTIONS (unchanged) ---
        formatTimeAgo = (ts) => {
            if (!ts) return '';
            const seconds = (Date.now() - ts) / 1000;
            if (seconds < 60) return `${Math.round(seconds)}s ago`;
            const minutes = seconds / 60;
            if (minutes < 60) return `${Math.round(minutes)}m ago`;
            const hours = minutes / 60;
            if (hours < 24) return `${Math.round(hours)}h ago`;
            return new Date(ts).toLocaleDateString('en-us', { month: 'short', day: 'numeric' });
        };
        getInitials = (name) => (!name || typeof name !== 'string') ? '??' : name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '??';
        escapeHTML = (str) => str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
        showToast = (message, type = 'info') => {
            this.D.toastMessage.textContent = message;
            const icons = { success: '✅', error: '❌', info: 'ℹ️' };
            const colors = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-blue-600' };
            this.D.toastIcon.textContent = icons[type];
            this.D.toast.className = `fixed bottom-6 right-6 text-white py-4 px-6 rounded-xl shadow-2xl z-50 border border-white/20 ${colors[type]} show`;
            setTimeout(() => this.D.toast.classList.remove('show'), 3000);
        };
    
        // --- URL & SEARCH HANDLING ---
        handleUrlParameters() {
            const params = new URLSearchParams(window.location.search);
            this.state.urlParams.postId = params.get('post');
            this.state.urlParams.searchQuery = params.get('q');
            
            if (this.state.urlParams.searchQuery) {
                this.D.desktopSearchInput.value = this.state.urlParams.searchQuery;
                this.D.mobileSearchInput.value = this.state.urlParams.searchQuery;
            }
        }
    


        updateUrlWithSearch(query) {
    const url = new URL(window.location);
    
    // Clear any existing search-related parameters
    url.searchParams.delete('q');
    url.searchParams.delete('search');
    
    // Only add the query parameter if there's actually a search query
    if (query && query.trim()) {
        url.searchParams.set('q', query.trim());
    }
    
    // Update the URL without reloading the page
    window.history.replaceState({}, '', url);
}
        
        filterPosts(query) {
            const lowerCaseQuery = query.toLowerCase();
            let visibleCount = 0;
            
            const noResultsEl = this.D.postsContainer.querySelector('#no-results-message');
            if (noResultsEl) noResultsEl.remove();
    
            Array.from(this.D.postsContainer.children).forEach(postEl => {
                if (!postEl.dataset.postId) return;
                
                const postContent = (postEl.querySelector('[data-post-content]')?.textContent || '').toLowerCase();
                const authorName = (postEl.querySelector('[data-author-name]')?.textContent || '').toLowerCase();
                const postTags = (postEl.querySelector('[data-post-tags]')?.textContent || '').toLowerCase();
    
                if (postContent.includes(lowerCaseQuery) || authorName.includes(lowerCaseQuery) || postTags.includes(lowerCaseQuery)) {
                    postEl.style.display = '';
                    visibleCount++;
                } else {
                    postEl.style.display = 'none';
                }
            });
            
            if (visibleCount === 0 && query && this.state.isFeedInitialized) {
                const noResultsClone = this.D.noResultsTemplate.content.cloneNode(true);
                noResultsClone.firstElementChild.id = 'no-results-message';
                noResultsClone.getElementById('no-results-query').textContent = this.escapeHTML(query);
                this.D.postsContainer.appendChild(noResultsClone);
            }
        }
        
        highlightPost(postElement) {
            if (!postElement) return;
            postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            postElement.classList.add('post-highlighted');
            setTimeout(() => {
                postElement.classList.remove('post-highlighted');
            }, 3000);
        }
    
        // --- USER & AUTH (unchanged) ---
        initUser() {
            const storedUserName = localStorage.getItem('nexysSocialUserName');
            if (storedUserName) {
                this.updateUserUI(storedUserName);
                this.initPresence();
            } else {
                this.showUsernameModal();
            }
        }
        checkUser() { if (this.state.currentUser === 'Guest') { this.showUsernameModal(); return false; } return true; }
        showUsernameModal() { this.D.usernameModal.classList.add('active'); this.generateCaptcha(); this.D.userNameInput.focus(); }
        generateCaptcha() {
            this.state.captcha.num1 = Math.floor(Math.random() * 10) + 1;
            this.state.captcha.num2 = Math.floor(Math.random() * 10) + 1;
            this.state.captcha.answer = this.state.captcha.num1 + this.state.captcha.num2;
            this.D.captchaQuestion.textContent = `Human Check: What is ${this.state.captcha.num1} + ${this.state.captcha.num2}?`;
            this.D.captchaAnswer.value = '';
        }
        handleSaveUser() {
            if (parseInt(this.D.captchaAnswer.value, 10) !== this.state.captcha.answer) { this.showToast("Incorrect answer. Please try again.", 'error'); this.generateCaptcha(); return; }
            const newUserName = this.D.userNameInput.value.trim();
            if (newUserName.length >= 3) {
                localStorage.setItem('nexysSocialUserName', newUserName);
                this.initUser();
                this.D.usernameModal.classList.remove('active');
                this.showToast(`Welcome, ${newUserName}!`, 'success');
            } else { this.showToast("Username must be at least 3 characters.", 'error'); }
        }
        updateUserUI(name) {
            this.state.currentUser = name;
            const initials = this.getInitials(name);
            this.D.userAvatar.textContent = initials;
            this.D.composerAvatar.textContent = initials;
            this.D.userAvatar.title = `Logged in as ${name}`;
        }
    
        // --- UI & COMPONENTS (unchanged) ---
        createRichText(text) {
            const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            const tagRegex = /(#[\w-]+)/g;
            let richText = this.escapeHTML(text);
            richText = richText.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${url}</a>`);
            richText = richText.replace(tagRegex, (tag) => `<span class="text-purple-400 font-semibold">${tag}</span>`);
            return richText;
        }
        toggleComposer(expand) {
            if (expand) { this.D.composerExpandedContent.classList.add('expanded'); this.D.postContentInput.focus(); } 
            else {
                this.D.composerExpandedContent.classList.remove('expanded');
                this.D.postContentInput.value = ''; this.D.postImageURLInput.value = ''; this.D.postTagsInput.value = '';
                this.updateCharCounter();
            }
        }
        updateCharCounter() {
            const count = this.D.postContentInput.value.length; const remaining = this.MAX_POST_LENGTH - count;
            this.D.postCharCounter.textContent = remaining;
            this.D.postCharCounter.style.color = remaining < 0 ? 'var(--accent-red)' : 'var(--text-tertiary)';
            const hasContent = this.D.postContentInput.value.trim().length > 0 || this.D.postImageURLInput.value.trim().length > 0;
            this.D.submitPostBtn.disabled = remaining < 0 || !hasContent;
        }
        createPostElement(postId, post) {
            const clone = this.D.postTemplate.content.cloneNode(true); const article = clone.querySelector('.post-card'); article.dataset.postId = postId;
            article.querySelector('[data-author-initials]').textContent = this.getInitials(post.author);
            article.querySelector('[data-author-name]').textContent = this.escapeHTML(post.author);
            article.querySelector('[data-timestamp]').textContent = this.formatTimeAgo(post.timestamp);
            article.querySelector('[data-action="delete"]').style.display = (post.author === this.state.currentUser) ? 'block' : 'none';
            const tagsContainer = article.querySelector('[data-post-tags]');
            if (post.tags) { tagsContainer.innerHTML = post.tags.split(/\s+/).filter(Boolean).map(tag => `<span class="text-xs bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full">${this.escapeHTML(tag)}</span>`).join(' '); }
            article.querySelector('[data-post-content]').innerHTML = this.createRichText(post.content);
            const img = article.querySelector('[data-post-image]'); img.style.display = post.imageUrl ? 'block' : 'none'; if (post.imageUrl) img.src = post.imageUrl;
            article.querySelector('[data-reactions-panel]').innerHTML = this.REACTIONS_AVAILABLE.map(r => `<button class="text-2xl p-2 rounded-full hover:bg-gray-700 transition-transform hover:scale-125" data-action="react" data-reaction="${r}">${r}</button>`).join('');
            article.querySelector('[data-share-link]').value = `${window.location.origin}${window.location.pathname}?post=${postId}`;
            article.querySelector('[data-current-user-initials]').textContent = this.getInitials(this.state.currentUser);
            this.updatePostElement(article, post);
            return article;
        }
        updatePostElement(element, post) {
            const totalReactions = Object.values(post.reactions || {}).reduce((sum, count) => sum + count, 0);
            const userReaction = post.userReactions?.[this.state.currentUser];
            element.querySelector('[data-reaction-emoji]').textContent = userReaction || '🤍';
            element.querySelector('[data-reaction-count]').textContent = totalReactions;
            const commentsContainer = element.querySelector('[data-comments-container]');
            const commentCount = post.comments ? Object.keys(post.comments).length : 0;
            element.querySelector('[data-comment-count]').textContent = commentCount;
            commentsContainer.innerHTML = '';
            if (post.comments) { const sortedComments = Object.values(post.comments).sort((a, b) => a.timestamp - b.timestamp); sortedComments.forEach(c => commentsContainer.appendChild(this.createCommentElement(c))); }
        }
        createCommentElement(comment) {
            const div = document.createElement('div'); div.className = 'flex space-x-3';
            div.innerHTML = `<div class="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center font-bold text-sm">${this.getInitials(comment.author)}</div><div class="flex-1 bg-gray-700 rounded-lg p-3"><p class="font-semibold text-sm text-white">${this.escapeHTML(comment.author)} <span class="text-xs text-gray-400 font-normal ml-2">${this.formatTimeAgo(comment.timestamp)}</span></p><p class="text-sm text-gray-300 mt-1 whitespace-pre-wrap break-words">${this.escapeHTML(comment.text)}</p></div>`;
            return div;
        }
    
        // --- FIREBASE & REAL-TIME LOGIC ---
        initPresence() {
            onValue(this.presenceRef, (snap) => {
                if (snap.val() === false) return;
                const con = push(this.connectionsRef); onDisconnect(con).remove();
                set(con, { user: this.state.currentUser, timestamp: serverTimestamp() });
            });
            onValue(this.connectionsRef, (snap) => {
                const count = snap.exists() ? snap.size : 0;
                this.D.onlineCount.textContent = `${count} online`;
                this.D.activeUsers.textContent = count;
            });
        }

        //  Fixed to handle url parameters correctly

initFirebaseListeners() {
    let pendingHighlight = this.state.urlParams.postId; // Track if we need to highlight a post
    
    onChildAdded(this.postsRef, (snapshot) => {
        if (!this.state.isFeedInitialized) { 
            this.D.postsContainer.innerHTML = ''; 
            this.state.isFeedInitialized = true; 
        }
        
        const postEl = this.createPostElement(snapshot.key, snapshot.val()); 
        postEl.classList.add('animate-slide-up'); 
        this.D.postsContainer.prepend(postEl);
        
        // Check if this is the post we need to highlight
        if (snapshot.key === pendingHighlight) {
            // Use setTimeout to ensure the element is fully rendered
            setTimeout(() => {
                this.highlightPost(postEl);
                pendingHighlight = null; // Clear the pending highlight
            }, 100);
        }
        
        // Apply search filter if active
        if (this.D.desktopSearchInput.value) { 
            this.filterPosts(this.D.desktopSearchInput.value); 
        }
    });
    
    onChildChanged(this.postsRef, (snapshot) => {
        const postEl = this.D.postsContainer.querySelector(`[data-post-id="${snapshot.key}"]`); 
        if (postEl) this.updatePostElement(postEl, snapshot.val());
    });
    
    onChildRemoved(this.postsRef, (snapshot) => {
        const postEl = this.D.postsContainer.querySelector(`[data-post-id="${snapshot.key}"]`);
        if (postEl) { 
            postEl.classList.add('animate-fade-out'); 
            postEl.addEventListener('animationend', () => postEl.remove()); 
        }
    });
    
    onValue(this.postsRef, (snapshot) => {
        this.updatePlatformStats(snapshot);
        
        // Handle search query from URL after initial load
        if (this.state.urlParams.searchQuery && this.state.isFeedInitialized) {
            this.filterPosts(this.state.urlParams.searchQuery); 
            this.state.urlParams.searchQuery = null;
        }
        
        // If we still have a pending highlight and posts are loaded, try to find and highlight it
        if (pendingHighlight && this.state.isFeedInitialized) {
            const targetPost = this.D.postsContainer.querySelector(`[data-post-id="${pendingHighlight}"]`);
            if (targetPost) {
                setTimeout(() => {
                    this.highlightPost(targetPost);
                    pendingHighlight = null;
                }, 200);
            }
        }
    });
}

handlePostNotFound() {
    if (this.state.urlParams.postId) {
        // Show a toast message that the post wasn't found
        this.showToast("Post not found or may have been deleted.", 'error');
        
        // Clear the post parameter from URL
        const url = new URL(window.location);
        url.searchParams.delete('post');
        window.history.replaceState({}, '', url);
        
        // Clear the postId from state
        this.state.urlParams.postId = null;
    }
}

        updatePlatformStats(snapshot) {
            if (!snapshot.exists()) { this.D.trendingTopics.innerHTML = `<div class="text-sm text-gray-400">No trends yet.</div>`; return; }
            const posts = snapshot.val(); const postCount = Object.keys(posts).length; let totalReactions = 0; const tagCounts = {};
            for (const key in posts) {
                totalReactions += Object.values(posts[key].reactions || {}).reduce((a, b) => a + b, 0);
                if (posts[key].tags) { posts[key].tags.split(/\s+/).filter(Boolean).forEach(tag => { const cleanTag = tag.toLowerCase(); tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1; }); }
            }
            this.D.totalPosts.textContent = postCount; this.D.totalReactions.textContent = totalReactions;
            const sortedTags = Object.entries(tagCounts).sort(([, a], [, b]) => b - a).slice(0, 5);
            this.D.trendingTopics.innerHTML = sortedTags.map(([tag, count]) => `<div class="flex justify-between items-center text-sm"><span class="font-semibold text-purple-300">${this.escapeHTML(tag)}</span><span class="text-gray-400">${count} posts</span></div>`).join('') || `<div class="text-sm text-gray-400">No trends yet.</div>`;
        }
    
        // --- INTERACTION HANDLERS (unchanged) ---
        handlePostInteraction(e) {
            const target = e.target.closest('[data-action]'); if (!target) return; const action = target.dataset.action;
            const postCard = target.closest('.post-card'); if (!postCard) return; const postId = postCard.dataset.postId;
            const togglePanel = (panelSelector, btn) => {
                const panel = postCard.querySelector(panelSelector); const isActive = !panel.classList.toggle('hidden');
                postCard.querySelectorAll('.interaction-btn.active').forEach(b => b !== btn && b.classList.remove('active'));
                btn.classList.toggle('active', isActive);
                if (panelSelector.includes('comments') && isActive) { panel.querySelector('[data-comment-input]')?.focus(); }
            };
            switch (action) {
                case 'toggle-reactions': togglePanel('[data-reactions-panel]', target); break;
                case 'toggle-comments': togglePanel('[data-comments-section]', target); break;
                case 'toggle-share': togglePanel('[data-share-panel]', target); break;
                case 'delete': this.deletePost(postId, postCard.querySelector('[data-author-name]').textContent); break;
                case 'react': if (this.checkUser()) this.addReaction(postId, target.dataset.reaction); break;
                case 'add-comment': if (this.checkUser()) this.addComment(postId, postCard); break;
                case 'copy-share-link': this.copyShareLink(postCard, target); break;
            }
        }
        handleCreatePost() {
            if (!this.checkUser()) return;
            const content = this.D.postContentInput.value.trim(); const imageURL = this.D.postImageURLInput.value.trim(); const tags = this.D.postTagsInput.value.trim();
            if (this.D.postContentInput.value.length > this.MAX_POST_LENGTH) return this.showToast(`Post exceeds ${this.MAX_POST_LENGTH} chars.`, 'error');
            this.D.submitPostBtn.disabled = true; this.D.submitPostBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Posting...`;
            set(push(this.postsRef), { content, tags, author: this.state.currentUser, timestamp: serverTimestamp(), imageUrl: imageURL || null, })
                .then(() => { this.toggleComposer(false); this.showToast('Post published!', 'success'); })
                .catch(error => { console.error("Error creating post: ", error); this.showToast('Failed to publish post.', 'error'); })
                .finally(() => { this.D.submitPostBtn.disabled = false; this.D.submitPostBtn.innerHTML = '<span>Post ✨</span>'; });
        }
        addReaction(postId, newReaction) {
            runTransaction(ref(this.db, `posts/${postId}`), (post) => {
                if (post) {
                    post.reactions = post.reactions || {}; post.userReactions = post.userReactions || {};
                    const oldReaction = post.userReactions[this.state.currentUser];
                    if (oldReaction === newReaction) { if (post.reactions[oldReaction]) post.reactions[oldReaction]--; delete post.userReactions[this.state.currentUser]; }
                    else { if (oldReaction && post.reactions[oldReaction]) post.reactions[oldReaction]--; post.reactions[newReaction] = (post.reactions[newReaction] || 0) + 1; post.userReactions[this.state.currentUser] = newReaction; }
                } return post;
            });
        }
        addComment(postId, postCard) {
            const input = postCard.querySelector('[data-comment-input]'); const text = input.value.trim(); if (!text) return;
            set(push(ref(this.db, `posts/${postId}/comments`)), { author: this.state.currentUser, text, timestamp: serverTimestamp() }).then(() => { input.value = ''; });
        }
        deletePost(postId, author) {
            if (author !== this.state.currentUser) { return this.showToast("You can only delete your own posts.", "error"); }
            if (confirm("Are you sure you want to delete this post? This cannot be undone.")) {
                remove(ref(this.db, `posts/${postId}`)).then(() => this.showToast("Post deleted.", "success")).catch((e) => { console.error("Error deleting post:", e); this.showToast("Error deleting post.", "error"); });
            }
        }
        copyShareLink(postCard, button) {
            const input = postCard.querySelector('[data-share-link]');
            navigator.clipboard.writeText(input.value).then(() => { button.textContent = 'Copied!'; setTimeout(() => { button.textContent = 'Copy'; }, 2000); });
        }
    }
    
    // --- App Start ---
    document.addEventListener('DOMContentLoaded', () => {
        new NexysSocialApp();
    });