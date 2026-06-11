/**
 * Modal Management System
 * Facilitates open, close, ESC key close, and backdrop clicking
 */

/**
 * Open a modal by ID
 * @param {string} modalId 
 */
export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.style.display = 'flex';
    document.body.classList.add('body-no-scroll');
    
    // Focus trapping/reset
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex="0"]');
    if (focusableElements.length > 0) {
        // focus the first element or close button
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
        else focusableElements[0].focus();
    }
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

/**
 * Close a modal
 * @param {string|HTMLElement} modalOrId 
 */
export function closeModal(modalOrId) {
    const modal = (typeof modalOrId === 'string') ? document.getElementById(modalOrId) : modalOrId;
    if (!modal) return;
    
    modal.classList.remove('show');
    
    setTimeout(() => {
        modal.style.display = 'none';
        
        // Restore body scroll if no other active modals are open
        const activeModals = document.querySelectorAll('.modal.show');
        if (activeModals.length === 0) {
            document.body.classList.remove('body-no-scroll');
        }
    }, 300);
}

/**
 * Initialize global modal close events (ESC key & backdrop clicks)
 */
export function initModals() {
    // Escape key closes open modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal.show');
            openModals.forEach(modal => closeModal(modal));
        }
    });

    // Backdrop click closes modal
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Cancel buttons or Close button actions inside modals
    document.querySelectorAll('[data-modal-id]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.dataset.modalId;
            if (this.classList.contains('modal-close') || this.classList.contains('modal-cancel')) {
                closeModal(modalId);
            }
        });
    });

    // Open modal via data-open-modal attribute
    document.querySelectorAll('[data-open-modal]').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.dataset.openModal;
            openModal(modalId);
        });
    });
}
