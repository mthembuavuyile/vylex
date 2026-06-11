/**
 * Toast Notification System
 * Displays premium corner notifications for user actions
 */

let container = null;

function getToastContainer() {
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Show a toast notification
 * @param {string} message - Message to show
 * @param {'success'|'error'|'info'} type - Type of alert
 */
export function showToast(message, type = 'success') {
    const toastContainer = getToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Choose icon based on type
    let iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';
    if (type === 'info') iconClass = 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animation tick
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove toast after duration
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
            // Clean up container if empty
            if (container && container.children.length === 0) {
                container.remove();
                container = null;
            }
        }, 300);
    }, 3000);
}
