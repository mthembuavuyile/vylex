/**
 * Local Market Module
 * Manages organic produce listings, mock transactions, and local state
 */

import { showToast } from './toast.js';
import { closeModal } from './modal.js';

const STORAGE_KEY = 'agrisynth_market';

const DEFAULT_MARKET = [
    {
        id: 'mrk-1',
        name: 'Organic Basil (Freshly Picked)',
        price: 25, // R25
        unit: 'bunch',
        available: 15,
        location: 'Rooftop Garden A',
        type: 'leaf',
        description: 'Aromatic, fresh organic sweet basil. Picked on demand.'
    },
    {
        id: 'mrk-2',
        name: 'Mixed Heirloom Tomatoes',
        price: 40, // R40
        unit: 'kg',
        available: 5,
        location: 'Community Plot C',
        type: 'veg',
        description: 'Vibrant, colorful heirloom tomatoes grown using local compost.'
    },
    {
        id: 'mrk-3',
        name: 'Organic Russet Potatoes',
        price: 30, // R30
        unit: 'kg',
        available: 22,
        location: 'Rooftop Garden B',
        type: 'veg',
        description: 'Freshly dug organic potatoes, rich in flavor and perfect for roasting.'
    },
    {
        id: 'mrk-4',
        name: 'Sweet Organic Onions',
        price: 18, // R18
        unit: 'kg',
        available: 14,
        location: 'Community Garden A',
        type: 'veg',
        description: 'Crisp, sweet red and white onions grown from local heirloom seed.'
    }
];

let listings = [];

export function initMarket() {
    loadListings();
    renderListings();

    const saveListingBtn = document.getElementById('save-listing-btn');
    if (saveListingBtn) {
        saveListingBtn.addEventListener('click', () => {
            handleCreateListing();
        });
    }

    // Event delegation for buying items
    const grid = document.getElementById('market-listings-grid');
    if (grid) {
        grid.addEventListener('click', (e) => {
            const buyBtn = e.target.closest('.market-purchase-btn');
            if (buyBtn) {
                const itemId = buyBtn.dataset.itemId;
                handlePurchase(itemId);
            }
        });
    }
}

function loadListings() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            listings = JSON.parse(raw);
        } catch (err) {
            listings = [...DEFAULT_MARKET];
        }
    } else {
        listings = [...DEFAULT_MARKET];
        saveToStorage();
    }
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
}

function renderListings() {
    const grid = document.getElementById('market-listings-grid');
    if (!grid) return;

    grid.innerHTML = listings.map(item => {
        let buttonHtml = '';
        let statusText = '';
        
        if (item.available > 0) {
            statusText = `<strong>Available:</strong> ${item.available} ${item.unit}s`;
            buttonHtml = `<button class="btn btn-sm btn-primary market-purchase-btn" data-item-id="${item.id}">Buy 1 Unit</button>`;
        } else {
            statusText = `<span style="color:var(--error); font-weight: 600;">Out of Stock</span>`;
            buttonHtml = `<button class="btn btn-sm btn-secondary" disabled>Out of Stock</button>`;
        }

        // Choose icon
        let iconClass = 'fa-leaf';
        if (item.type === 'veg') iconClass = 'fa-carrot';
        if (item.type === 'fruit') iconClass = 'fa-apple-alt';

        return `
            <div class="card">
                <div class="card-header">${escapeHtml(item.name)}</div>
                <div class="resource-card-img"><i class="fas ${iconClass}"></i></div>
                <div class="card-body">
                    <p>${escapeHtml(item.description || 'No description provided.')}</p>
                    <p><strong>Price:</strong> R${item.price} / ${escapeHtml(item.unit)}</p>
                    <p>${statusText}</p>
                    <p><small><strong>From:</strong> ${escapeHtml(item.location)}</small></p>
                </div>
                <div class="card-footer" style="background-color: transparent; border-top: none;">
                    ${buttonHtml}
                </div>
            </div>
        `;
    }).join('');
}

function handleCreateListing() {
    const nameInput = document.getElementById('listing-name');
    const priceInput = document.getElementById('listing-price');
    const unitSelect = document.getElementById('listing-unit');
    const qtyInput = document.getElementById('listing-qty');
    const typeSelect = document.getElementById('listing-type');
    const descInput = document.getElementById('listing-description');
    const locInput = document.getElementById('listing-location');

    if (!nameInput || !nameInput.value.trim() || !priceInput || !priceInput.value) {
        showToast('Please fill in the listing title and unit price.', 'error');
        return;
    }

    const price = parseFloat(priceInput.value);
    const qty = parseInt(qtyInput ? qtyInput.value : '1') || 1;

    const newListing = {
        id: 'mrk-' + Date.now(),
        name: nameInput.value.trim(),
        price: isNaN(price) ? 10 : price,
        unit: unitSelect ? unitSelect.value : 'bunch',
        available: isNaN(qty) ? 1 : qty,
        location: (locInput && locInput.value.trim()) ? locInput.value.trim() : 'Co-op Gardens',
        type: typeSelect ? typeSelect.value : 'veg',
        description: descInput ? descInput.value.trim() : 'Organic community produce.'
    };

    listings.push(newListing);
    saveToStorage();
    renderListings();

    // Reset inputs
    nameInput.value = '';
    priceInput.value = '';
    if (qtyInput) qtyInput.value = '1';
    if (descInput) descInput.value = '';
    if (locInput) locInput.value = '';

    closeModal('add-listing-modal');
    showToast(`Listing "${newListing.name}" published to market!`, 'success');
}

function handlePurchase(id) {
    const itemIndex = listings.findIndex(item => item.id === id);
    if (itemIndex !== -1 && listings[itemIndex].available > 0) {
        listings[itemIndex].available -= 1;
        saveToStorage();
        renderListings();
        showToast(`Purchase confirmed! You bought 1 ${listings[itemIndex].unit} of ${listings[itemIndex].name}.`, 'success');
    }
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}
