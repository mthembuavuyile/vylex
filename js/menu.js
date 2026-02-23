document.addEventListener("DOMContentLoaded", () => {
    // 1. Inject Header
    loadComponent('/components/header.html', 'header-placeholder', () => {
        initializeNavbar();
        updateBrandIdentity();
        highlightActiveLink();
    });

    // 2. Inject Footer
    loadComponent('/components/footer.html', 'footer-placeholder', () => {
        document.getElementById('year').textContent = new Date().getFullYear();
    });
});

/**
 * Helper to fetch HTML and inject it
 */
function loadComponent(path, elementId, callback) {
    fetch(path)
        .then(response => {
            if (!response.ok) throw new Error(`Could not load ${path}`);
            return response.text();
        })
        .then(html => {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = html;
                if (callback) callback();
            }
        })
        .catch(err => console.error(err));
}

/**
 * Sets the "Subtitle" (e.g., Web Division) based on body attribute
 */
function updateBrandIdentity() {
    const subtitleEl = document.getElementById('brand-subtitle');
    // Default to 'Technology Group' if not specified
    const currentSubtitle = document.body.getAttribute('data-subtitle') || 'Technology Group';
    
    if (subtitleEl) {
        subtitleEl.textContent = currentSubtitle;
    }
}

/**
 * Adds the 'active' class to the current page's link
 */
function highlightActiveLink() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-link');

    links.forEach(link => {
        const linkPath = link.getAttribute('href');

        // Logic for exact match or directory match
        if (currentPath === linkPath || 
           (currentPath === '/' && linkPath === '/') ||
           (linkPath !== '/' && currentPath.includes(linkPath))) {
            link.classList.add('active');
        }
    });
}

/**
 * Mobile Menu and Scroll Logic
 */
function initializeNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    // Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            navbar.classList.add('nav-sticky');
        } else {
            navbar.classList.remove('nav-sticky');
        }
    });

    // Mobile Toggle
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            const isOpen = mobileMenu.classList.contains('open');
            if (isOpen) {
                mobileMenu.classList.remove('open');
                mobileBtn.setAttribute('aria-expanded', 'false');
            } else {
                mobileMenu.classList.add('open');
                mobileBtn.setAttribute('aria-expanded', 'true');
            }
        });
    }
}