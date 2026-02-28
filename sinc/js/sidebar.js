// --- Elements ---
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuToggle = document.getElementById('menu-toggle');
const closeSidebar = document.getElementById('close-sidebar');

// --- Functions ---
function openMobileSidebar() {
    if (!sidebar || !overlay) return;
    sidebar.classList.remove('mobile-menu-closed');
    sidebar.classList.add('mobile-menu-open'); // Explicit open class (optional)
    overlay.classList.remove('hidden');
    // Optional: Prevent body scrolling when overlay is visible
    // document.body.style.overflow = 'hidden';
}

function closeMobileSidebar() {
    if (!sidebar || !overlay) return;
    sidebar.classList.add('mobile-menu-closed');
    sidebar.classList.remove('mobile-menu-open'); // Remove explicit open class
    overlay.classList.add('hidden');
    // Optional: Restore body scrolling
    // document.body.style.overflow = '';
}

// --- Initialization ---
export function initSidebar() {
    if (menuToggle) {
        menuToggle.addEventListener('click', openMobileSidebar);
    }
    if (closeSidebar) {
        closeSidebar.addEventListener('click', closeMobileSidebar);
    }
    if (overlay) {
        overlay.addEventListener('click', closeMobileSidebar);
    }

    // Ensure sidebar is closed initially on mobile if JS loads after CSS potentially shows it
    if (window.innerWidth < 1024 && sidebar && !sidebar.classList.contains('mobile-menu-open')) {
         sidebar.classList.add('mobile-menu-closed');
    }
}

// --- Export close function if needed elsewhere (e.g., router) ---
export { closeMobileSidebar };