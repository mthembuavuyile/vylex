/**
 * Navigation & Page Layout Manager
 * Handles scroll headers, page switching transitions, and dashboard tab routing
 */

let lastScrollTop = 0;
const scrollDelta = 5;

/**
 * Initialize all site and app navigation listeners
 */
export function initNavigation() {
    const siteHeader = document.querySelector('header');
    const navToggle = document.querySelector('.nav-toggle');
    const exploreBtn = document.getElementById('explore-prototype-btn');
    const exitBtn = document.getElementById('exit-prototype-btn');
    const landingContent = document.querySelector('.landing-content');
    const appDashboard = document.getElementById('app-dashboard');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const appSidebar = document.getElementById('app-sidebar');
    const appOverlay = document.getElementById('app-overlay');

    // 1. Landing Header scroll shadow & hide/show on scroll direction
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add shadow and glass backgrounds when page is scrolled past header height
        if (scrollTop > 50) {
            siteHeader.classList.add('header-scrolled');
        } else {
            siteHeader.classList.remove('header-scrolled');
        }

        // Hide/Show Header depending on scroll direction
        if (Math.abs(lastScrollTop - scrollTop) <= scrollDelta) return;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down - hide header (unless hamburger is open)
            if (!siteHeader.classList.contains('nav-open')) {
                siteHeader.style.transform = 'translateY(-100%)';
            }
        } else {
            // Scrolling up - show header
            siteHeader.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    // 2. Mobile landing hamburger toggle
    if (navToggle && siteHeader) {
        navToggle.addEventListener('click', () => {
            const isOpen = siteHeader.classList.toggle('nav-open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            document.body.classList.toggle('body-no-scroll', isOpen);
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (siteHeader.classList.contains('nav-open') && !siteHeader.contains(e.target) && !navToggle.contains(e.target)) {
                siteHeader.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('body-no-scroll');
            }
        });
    }

    // 3. Smooth scrolling for landing menu links
    document.querySelectorAll('.main-nav a.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerOffset = siteHeader ? siteHeader.offsetHeight : 0;
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    
                    window.scrollTo({
                        top: elementPosition - headerOffset,
                        behavior: 'smooth'
                    });
                }
            }
            // Close mobile menu on click
            if (siteHeader && siteHeader.classList.contains('nav-open')) {
                siteHeader.classList.remove('nav-open');
                if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('body-no-scroll');
            }
        });
    });

    // 4. Switch from Landing Page to App Prototype Mode
    if (exploreBtn && landingContent && appDashboard) {
        exploreBtn.addEventListener('click', () => {
            // Add subtle transition
            landingContent.style.opacity = '0';
            if (siteHeader) {
                siteHeader.style.transform = 'translateY(-100%)';
                siteHeader.style.opacity = '0';
            }
            
            setTimeout(() => {
                landingContent.style.display = 'none';
                if (siteHeader) siteHeader.style.display = 'none';
                
                appDashboard.style.display = 'block';
                document.body.classList.add('app-active');
                window.scrollTo(0, 0);
                
                // Dispatch event so other modules know app is running (e.g. sensor charts)
                document.dispatchEvent(new CustomEvent('prototypeActive'));
            }, 300);
        });
    }

    // 5. Exit App Prototype Mode
    if (exitBtn && landingContent && appDashboard) {
        exitBtn.addEventListener('click', () => {
            appDashboard.style.display = 'none';
            document.body.classList.remove('app-active');
            
            landingContent.style.display = 'block';
            if (siteHeader) {
                siteHeader.style.display = 'block';
                siteHeader.style.transform = 'translateY(0)';
                siteHeader.style.opacity = '1';
            }
            
            setTimeout(() => {
                landingContent.style.opacity = '1';
                window.scrollTo(0, 0);
                
                document.dispatchEvent(new CustomEvent('prototypeInactive'));
            }, 10);
            
            // Close mobile sidebar if left open
            if (appSidebar && appSidebar.classList.contains('show')) {
                closeSidebar(appSidebar, mobileMenuBtn, appOverlay);
            }
        });
    }

    // 6. Dashboard Sidebar tab switcher
    const tabLinks = document.querySelectorAll('.sidebar-menu a');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Toggle active menu states
            tabLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Toggle active tab content panels
            tabContents.forEach(content => content.classList.remove('active'));
            const tabId = link.getAttribute('data-tab');
            const targetTab = document.getElementById(tabId);
            if (targetTab) {
                targetTab.classList.add('active');
                // Trigger scroll-to-top of dashboard content for mobile
                if (window.innerWidth <= 768) {
                    window.scrollTo({
                        top: document.querySelector('.main-content').offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
            
            // Close sidebar drawer on mobile
            if (appSidebar && appSidebar.classList.contains('show')) {
                closeSidebar(appSidebar, mobileMenuBtn, appOverlay);
            }
        });
    });

    // 7. Mobile App Sidebar Drawer toggles
    if (mobileMenuBtn && appSidebar && appOverlay) {
        mobileMenuBtn.addEventListener('click', () => {
            const isSidebarOpen = appSidebar.classList.toggle('show');
            mobileMenuBtn.setAttribute('aria-expanded', isSidebarOpen ? 'true' : 'false');
            appOverlay.style.display = isSidebarOpen ? 'block' : 'none';
            document.body.classList.toggle('body-no-scroll', isSidebarOpen);
        });

        appOverlay.addEventListener('click', () => {
            closeSidebar(appSidebar, mobileMenuBtn, appOverlay);
        });
    }

    // 8. Scroll Reveal and Scroll Spy initialization
    initScrollReveal();
    initScrollSpy(siteHeader);
}

/**
 * Initialize IntersectionObserver to trigger entry animations for sections
 */
function initScrollReveal() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (animatedElements.length === 0) return;

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => observer.observe(el));
    } else {
        // Fallback for browsers without IntersectionObserver support
        animatedElements.forEach(el => el.classList.add('is-visible'));
    }
}

/**
 * Initialize scroll spy to highlight the active landing page header nav link
 */
function initScrollSpy(siteHeader) {
    const sections = document.querySelectorAll('main > section.landing-content > section, main > section.landing-content > div.hero, footer');
    const navLinks = document.querySelectorAll('.main-nav a.nav-link');
    if (sections.length === 0 || navLinks.length === 0) return;

    window.addEventListener('scroll', () => {
        // Only run scroll spy if dashboard is not active
        if (document.body.classList.contains('app-active')) return;

        let currentSectionId = 'home';
        const headerHeight = siteHeader ? siteHeader.offsetHeight : 0;
        const scrollPosition = window.scrollY + headerHeight + 120; // offset for better trigger alignment

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                if (sectionId) {
                    currentSectionId = sectionId;
                }
            }
        });

        // Specially handle page bottom to force Contact active highlight
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
            currentSectionId = 'contact';
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${currentSectionId}` || (currentSectionId === 'manifesto-section' && href === '#manifesto-section')) {
                link.classList.add('active');
            }
        });
    });
}

/**
 * Helper to close mobile sidebar drawer
 */
function closeSidebar(sidebar, menuBtn, overlay) {
    if (sidebar) sidebar.classList.remove('show');
    if (menuBtn) {
        menuBtn.setAttribute('aria-expanded', 'false');
        // Reset hamburger icon if relevant
    }
    if (overlay) overlay.style.display = 'none';
    document.body.classList.remove('body-no-scroll');
}
