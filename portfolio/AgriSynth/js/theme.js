/**
 * Theme Engine
 * Toggles and persists user dark/light mode preferences
 */

/**
 * Initialize current theme from localStorage or system settings
 */
export function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const icon = themeToggle.querySelector('i');
    
    // Check saved preference or default to dark/light matching system
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        if (icon) {
            icon.className = 'fas fa-sun';
            themeToggle.setAttribute('aria-label', 'Switch to Light Mode');
        }
    } else {
        document.body.classList.remove('dark-mode');
        if (icon) {
            icon.className = 'fas fa-moon';
            themeToggle.setAttribute('aria-label', 'Switch to Dark Mode');
        }
    }
    
    // Set up click listener
    themeToggle.addEventListener('click', () => {
        toggleTheme(themeToggle, icon);
    });
}

/**
 * Toggle the theme state
 * @param {HTMLElement} toggleBtn 
 * @param {HTMLElement} icon 
 */
function toggleTheme(toggleBtn, icon) {
    const isDark = document.body.classList.toggle('dark-mode');
    
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    if (toggleBtn) {
        toggleBtn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }
    
    // Dispatch a custom theme-changed event for modules that need to redraw (like sensors/charts)
    const event = new CustomEvent('themeChanged', { detail: { isDark } });
    document.dispatchEvent(event);
}
