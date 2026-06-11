/**
 * Resources Sharing Module
 * Simulates tool/resource borrowing with state persistence in localStorage
 */

import { showToast } from './toast.js';
import { closeModal } from './modal.js';

const STORAGE_KEY = 'agrisynth_resources';

const DEFAULT_RESOURCES = [
    {
        id: 'res-1',
        name: 'Heavy Duty Garden Shovel',
        type: 'tool',
        description: 'High-quality stainless steel garden shovel. Excellent for working tough soils.',
        owner: 'Community Shed',
        available: true,
        borrower: null
    },
    {
        id: 'res-2',
        name: 'Electric Tiller (Small)',
        type: 'tool',
        description: 'Compact electric tiller, perfect for loosening raised beds before sowing.',
        owner: 'John D.',
        available: false,
        borrower: 'Jane'
    }
];

let resources = [];

export function initResources() {
    loadResources();
    renderResources();

    const saveResourceBtn = document.getElementById('save-resource-btn');
    if (saveResourceBtn) {
        saveResourceBtn.addEventListener('click', () => {
            handleCreateResource();
        });
    }

    // Bind event delegation for request buttons
    const grid = document.getElementById('resources-grid');
    if (grid) {
        grid.addEventListener('click', (e) => {
            const requestBtn = e.target.closest('.resource-request-btn');
            if (requestBtn) {
                const resId = requestBtn.dataset.resourceId;
                handleRequestResource(resId);
            }
        });
    }
}

function loadResources() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            resources = JSON.parse(raw);
        } catch (err) {
            resources = [...DEFAULT_RESOURCES];
        }
    } else {
        resources = [...DEFAULT_RESOURCES];
        saveToStorage();
    }
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
}

function renderResources() {
    const grid = document.getElementById('resources-grid');
    if (!grid) return;

    grid.innerHTML = resources.map(res => {
        let statusHtml = '';
        let buttonDisabled = '';
        let buttonText = 'Request';
        
        if (res.available) {
            statusHtml = `<span><i class="fas fa-check-circle" style="color:var(--primary)"></i> Available</span>`;
        } else {
            const borrowerName = res.borrower === 'You' ? 'You' : (res.borrower || 'Jane');
            statusHtml = `<span><i class="fas fa-times-circle" style="color:var(--accent)"></i> In Use (by ${borrowerName})</span>`;
            buttonDisabled = 'disabled';
            buttonText = res.borrower === 'You' ? 'Requested' : 'Unavailable';
        }

        // Determine icon based on category
        let iconClass = 'fa-trowel';
        if (res.type === 'seed') iconClass = 'fa-seedling';
        if (res.type === 'compost') iconClass = 'fa-recycle';
        if (res.type === 'other') iconClass = 'fa-box-open';

        return `
            <div class="card">
                <div class="card-header">${escapeHtml(res.name)}</div>
                <div class="resource-card-img"><i class="fas ${iconClass}"></i></div>
                <div class="card-body">
                    <p>${escapeHtml(res.description)}</p>
                    <p><strong>Owner:</strong> ${escapeHtml(res.owner)}</p>
                </div>
                <div class="card-footer">
                    ${statusHtml}
                    <button class="btn btn-sm btn-primary resource-request-btn" data-resource-id="${res.id}" ${buttonDisabled}>
                        ${buttonText}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function handleCreateResource() {
    const nameInput = document.getElementById('resource-name');
    const typeSelect = document.getElementById('resource-type');
    const descInput = document.getElementById('resource-description');

    if (!nameInput || !nameInput.value.trim()) {
        showToast('Please specify a resource name.', 'error');
        return;
    }

    const newRes = {
        id: 'res-' + Date.now(),
        name: nameInput.value.trim(),
        type: typeSelect ? typeSelect.value : 'tool',
        description: descInput ? descInput.value.trim() : 'Newly added shared resource.',
        owner: 'You',
        available: true,
        borrower: null
    };

    resources.push(newRes);
    saveToStorage();
    renderResources();

    // Reset fields
    nameInput.value = '';
    if (descInput) descInput.value = '';

    closeModal('add-resource-modal');
    showToast(`Shared resource "${newRes.name}" successfully listed!`, 'success');
}

/**
 * Handle borrowing interactions
 */
function handleRequestResource(id) {
    const resIndex = resources.findIndex(r => r.id === id);
    if (resIndex !== -1 && resources[resIndex].available) {
        resources[resIndex].available = false;
        resources[resIndex].borrower = 'You';
        saveToStorage();
        renderResources();
        
        showToast(`Request sent! You have borrowed: ${resources[resIndex].name}`, 'success');
    }
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}
