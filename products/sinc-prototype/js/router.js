import { closeMobileSidebar } from './sidebar.js';

// --- Elements ---
const mainContent = document.getElementById('main-content');
const sidebarNav = document.getElementById('sidebar-nav'); // More specific parent

// --- Selectors ---
const CONTENT_SECTION_SELECTOR = ':scope > div[id$="-content"]'; // Direct children ending with -content
const SIDEBAR_LINK_SELECTOR = '.sidebar-link[data-target]'; // Links in nav with data-target
const LINK_TRIGGER_SELECTOR = '.sidebar-link-trigger[data-target]'; // Other elements that trigger navigation

const ACTIVE_LINK_CLASS = 'sidebar-link-active';
const DEFAULT_ROUTE = 'dashboard';

// --- State ---
let currentActiveTarget = '';

// --- Functions ---

/**
 * Hides all content sections and shows the one matching the target ID.
 * @param {string} targetId - The target identifier (e.g., 'dashboard', 'cases').
 */
function showContent(targetId) {
    if (!mainContent) return;

    const contentSections = mainContent.querySelectorAll(CONTENT_SECTION_SELECTOR);
    const targetSectionId = `${targetId}-content`;
    let sectionFound = false;

    contentSections.forEach(section => {
        if (section.id === targetSectionId) {
            section.classList.remove('hidden');
            sectionFound = true;
        } else {
            section.classList.add('hidden');
        }
    });

    // Fallback if the target section doesn't exist
    if (!sectionFound && targetId !== DEFAULT_ROUTE) {
        console.warn(`Content section for "${targetId}" not found. Showing default.`);
        showContent(DEFAULT_ROUTE); // Show dashboard if target not found
    } else if (!sectionFound && targetId === DEFAULT_ROUTE) {
         console.error(`Default content section "${DEFAULT_ROUTE}-content" not found!`);
         // Maybe display an error message in the main content area
    }
}

/**
 * Updates the active style for the sidebar link corresponding to the target ID.
 * @param {string} targetId - The target identifier (e.g., 'dashboard', 'cases').
 */
function updateActiveLink(targetId) {
    if (!sidebarNav) return;
    const sidebarLinks = sidebarNav.querySelectorAll(SIDEBAR_LINK_SELECTOR);

    sidebarLinks.forEach(link => {
        link.classList.remove(ACTIVE_LINK_CLASS);
        if (link.dataset.target === targetId) {
            link.classList.add(ACTIVE_LINK_CLASS);
        }
    });
}

/**
 * Handles route changes based on hash or direct calls.
 */
function handleRouteChange() {
    const hash = window.location.hash.substring(1); // Remove #
    const targetId = hash || DEFAULT_ROUTE;

    if (targetId !== currentActiveTarget) {
        currentActiveTarget = targetId;
        showContent(targetId);
        updateActiveLink(targetId);

        // Close mobile sidebar on navigation
        if (window.innerWidth < 1024) {
            closeMobileSidebar();
        }
         // Scroll to top of main content area
         mainContent.scrollTop = 0; // For scrollable main area
         // or window.scrollTo(0, 0); // For scrolling the whole window
    }
}

/**
 * Navigates to a specific target ID, updating the hash.
 * @param {string} targetId
 */
function navigateTo(targetId) {
     if (targetId && targetId !== currentActiveTarget) {
         window.location.hash = targetId;
         // handleRouteChange will be triggered by the hashchange event
     } else if (targetId === currentActiveTarget) {
         // If clicking the already active link, maybe just close sidebar on mobile
         if (window.innerWidth < 1024) {
            closeMobileSidebar();
        }
     }
}

// --- Initialization ---
export function initRouter() {
    // Initial load
    handleRouteChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleRouteChange);

    // Add click listeners to all elements that should trigger navigation
    document.body.addEventListener('click', (event) => {
        // Find the closest ancestor link/trigger with a data-target
        const triggerElement = event.target.closest('[data-target]');

        if (triggerElement && (triggerElement.matches(SIDEBAR_LINK_SELECTOR) || triggerElement.matches(LINK_TRIGGER_SELECTOR))) {
            event.preventDefault(); // Prevent default link behavior only if it's a nav trigger
            const targetId = triggerElement.dataset.target;
            navigateTo(targetId);
        }
    });
}