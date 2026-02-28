// --- Elements ---
const userMenuButton = document.getElementById('user-menu-button');
const userMenu = document.getElementById('user-menu');
const notificationsButton = document.getElementById('notifications-button');
const notificationsPanel = document.getElementById('notifications-panel');
const searchButton = document.getElementById('search-button');
const searchModal = document.getElementById('search-modal');
const closeSearch = document.getElementById('close-search');

// --- Utility for Dropdowns/Modals ---
function initToggleElement(button, target, closeOnClickOutside = true, openClass = null, closeClass = 'hidden') {
    if (!button || !target) return;

    button.addEventListener('click', (event) => {
        event.stopPropagation();
        const isHidden = target.classList.toggle(closeClass);
        if (openClass) target.classList.toggle(openClass, !isHidden);
        if (button.hasAttribute('aria-expanded')) {
            button.setAttribute('aria-expanded', !isHidden);
        }
    });

    if (closeOnClickOutside) {
        document.addEventListener('click', (event) => {
            if (!target.contains(event.target) && event.target !== button && !target.classList.contains(closeClass)) {
                target.classList.add(closeClass);
                 if (openClass) target.classList.remove(openClass);
                if (button.hasAttribute('aria-expanded')) {
                    button.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }
}

function initModal(openButton, modal, closeButton) {
    if (!openButton || !modal || !closeButton) return;

    openButton.addEventListener('click', () => {
        modal.classList.remove('hidden');
        modal.classList.add('flex'); // Use flex for centering
    });

    const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    closeButton.addEventListener('click', closeModal);

    // Close modal if clicking on the background overlay
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
}


// --- Initialization ---
export function initHeader() {
    initToggleElement(userMenuButton, userMenu);
    initToggleElement(notificationsButton, notificationsPanel);
    initModal(searchButton, searchModal, closeSearch);
}