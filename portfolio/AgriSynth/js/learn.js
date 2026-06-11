/**
 * Learning Hub Module
 * Allows users to read and share farming articles or video tutorials
 */

import { showToast } from './toast.js';
import { closeModal } from './modal.js';

const STORAGE_KEY = 'agrisynth_learning';

const DEFAULT_ARTICLES = [
    {
        id: 'lrn-1',
        title: 'Guide to Balcony Gardening in Joburg',
        description: 'Maximize small urban spaces for vegetable production. Covers soil, containers, and suitable crops for the Highveld climate.',
        type: 'Article',
        difficulty: 'Beginner'
    },
    {
        id: 'lrn-2',
        title: 'Video: Organic Pest Control Methods',
        description: 'Learn natural ways to manage common garden pests without harmful chemicals. Features expert tips and DIY recipes.',
        type: 'Video',
        difficulty: 'Intermediate'
    }
];

let articles = [];

export function initLearning() {
    loadArticles();
    renderArticles();

    const shareBtn = document.getElementById('save-knowledge-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            handleCreateArticle();
        });
    }

    const grid = document.getElementById('learn-articles-grid');
    if (grid) {
        grid.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.learn-action-btn');
            if (actionBtn) {
                showToast('Loading learning resource content (Demo)...', 'info');
            }
        });
    }
}

function loadArticles() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            articles = JSON.parse(raw);
        } catch (err) {
            articles = [...DEFAULT_ARTICLES];
        }
    } else {
        articles = [...DEFAULT_ARTICLES];
        saveToStorage();
    }
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
}

function renderArticles() {
    const grid = document.getElementById('learn-articles-grid');
    if (!grid) return;

    grid.innerHTML = articles.map(article => {
        return `
            <div class="card">
                <div class="card-header">${escapeHtml(article.title)}</div>
                <div class="card-body">
                    <p>${escapeHtml(article.description)}</p>
                    <p><strong>Type:</strong> ${escapeHtml(article.type)} | <strong>Difficulty:</strong> ${escapeHtml(article.difficulty)}</p>
                </div>
                <div class="card-footer" style="background-color: transparent; border-top: none;">
                    <button class="btn btn-sm btn-primary learn-action-btn">
                        ${article.type === 'Video' ? 'Watch Video' : 'Read Article'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function handleCreateArticle() {
    const titleInput = document.getElementById('share-title');
    const typeSelect = document.getElementById('share-type');
    const diffSelect = document.getElementById('share-difficulty');
    const descInput = document.getElementById('share-description');

    if (!titleInput || !titleInput.value.trim()) {
        showToast('Please specify a resource title.', 'error');
        return;
    }

    const newArticle = {
        id: 'lrn-' + Date.now(),
        title: titleInput.value.trim(),
        type: typeSelect ? typeSelect.value : 'Article',
        difficulty: diffSelect ? diffSelect.value : 'Beginner',
        description: descInput ? descInput.value.trim() : 'Farming educational materials.'
    };

    articles.push(newArticle);
    saveToStorage();
    renderArticles();

    // Reset fields
    titleInput.value = '';
    if (descInput) descInput.value = '';

    closeModal('share-knowledge-modal');
    showToast(`Shared resource "${newArticle.title}" has been published!`, 'success');
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}
