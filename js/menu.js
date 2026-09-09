document.addEventListener("DOMContentLoaded", () => {
    // 1. Inject Header
    loadComponent('/components/header.html', 'header-placeholder', () => {
        initializeNavbar();
        updateBrandIdentity();
        highlightActiveLink();
    });

    // 2. Inject Footer
    loadComponent('/components/footer.html', 'footer-placeholder', () => {
        const yearEl = document.getElementById('year');
        if (yearEl) yearEl.textContent = new Date().getFullYear();
    });

    // 3. Initialize Animations (.fade-up elements)
    initializeScrollAnimations();

    // 4. Initialize FAQ Accordions (if present on page)
    initializeFaqAccordions();
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
    const backdrop = document.getElementById('mobile-menu-backdrop');

    // Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            navbar.classList.add('nav-sticky');
        } else {
            navbar.classList.remove('nav-sticky');
        }
    });

    function toggleMenu(forceClose = false) {
        const isOpen = mobileMenu.classList.contains('open');
        const shouldClose = forceClose || isOpen;

        if (shouldClose) {
            mobileMenu.classList.remove('open');
            mobileBtn.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
            if (backdrop) {
                backdrop.classList.remove('active');
            }
        } else {
            mobileMenu.classList.add('open');
            mobileBtn.setAttribute('aria-expanded', 'true');
            document.body.classList.add('menu-open');
            if (backdrop) {
                backdrop.classList.add('active');
            }
        }
    }

    // Mobile Toggle
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    // Close menu when clicking on backdrop
    if (backdrop) {
        backdrop.addEventListener('click', () => {
            toggleMenu(true);
        });
    }

    // Close menu when window resized to desktop size
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) { // lg breakpoint is 1024px
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                toggleMenu(true);
            }
        }
    });
}

/**
 * Scroll reveal animations for elements with .fade-up
 */
function initializeScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-up');
    if (!fadeElements.length) return;

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px 50px 0px'
        });

        fadeElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for browsers without IntersectionObserver
        fadeElements.forEach(el => el.classList.add('visible'));
    }

    // Safety fallback: reveal all elements after 1.5 seconds so content is never stuck blank
    setTimeout(() => {
        fadeElements.forEach(el => el.classList.add('visible'));
    }, 1500);
}

/**
 * FAQ Accordion logic for pages with .faq-item and .faq-question
 */
function initializeFaqAccordions() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (!faqQuestions.length) return;

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.closest('.faq-item');
            if (!item) return;

            const isOpen = item.classList.contains('open');

            // Close all other items for a clean accordion experience
            document.querySelectorAll('.faq-item.open').forEach(openItem => {
                if (openItem !== item) {
                    openItem.classList.remove('open');
                    const answer = openItem.querySelector('.faq-answer');
                    if (answer) answer.style.maxHeight = null;
                }
            });

            // Toggle current item
            if (isOpen) {
                item.classList.remove('open');
                const answer = item.querySelector('.faq-answer');
                if (answer) answer.style.maxHeight = null;
            } else {
                item.classList.add('open');
                const answer = item.querySelector('.faq-answer');
                if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}