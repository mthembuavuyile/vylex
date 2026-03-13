// --- Elements ---
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const menuToggle = document.getElementById('menu-toggle');
const closeSidebar = document.getElementById('close-sidebar');
const sidebarLinks = document.querySelectorAll('.sidebar-link'); // Select all nav links

// --- Functions ---
function openMobileSidebar() {
    if (!sidebar || !overlay) return;
    sidebar.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
}

function closeMobileSidebar() {
    if (!sidebar || !overlay) return;
    sidebar.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
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
    
    // Close sidebar when a navigation link is clicked
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 1024) { // Only trigger close on mobile
                closeMobileSidebar();
            }
        });
    });
}

// IMPORTANT: If this file is your main app.js, you must call the function to run it!
// If you are importing this into another file, make sure that file calls initSidebar();
// In this cate its an independent sidebar.js
initSidebar(); 

// --- Export close function if needed elsewhere (e.g., router) ---
export { closeMobileSidebar };