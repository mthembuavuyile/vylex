document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. Sticky Header
    // ==========================================
    const header = document.getElementById('page-header');

    const handleScroll = () => {
        if (window.scrollY > 20) {
            header.classList.add('stuck');
        } else {
            header.classList.remove('stuck');
        }
    };

    // Initial check and scroll listener
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    // ==========================================
    // 2. Mobile Menu Toggle
    // ==========================================
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenuContainer = document.getElementById('mobile-menu-container');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileClose = document.getElementById('mobile-menu-close');
    const mobileLinks = mobileMenu.querySelectorAll('a');

    const openMobileMenu = () => {
        header.setAttribute('data-mobile-menu-open', 'true');
        mobileMenuContainer.classList.remove('pointer-events-none');
        mobileOverlay.classList.remove('opacity-0');
        mobileMenu.classList.remove('translate-x-full');
        document.body.classList.add('no-scroll'); // Prevent background scrolling
    };

    const closeMobileMenu = () => {
        header.setAttribute('data-mobile-menu-open', 'false');
        mobileMenuContainer.classList.add('pointer-events-none');
        mobileOverlay.classList.add('opacity-0');
        mobileMenu.classList.add('translate-x-full');
        document.body.classList.remove('no-scroll');
    };

    mobileBtn.addEventListener('click', () => {
        const isOpen = header.getAttribute('data-mobile-menu-open') === 'true';
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    mobileClose.addEventListener('click', closeMobileMenu);
    mobileOverlay.addEventListener('click', closeMobileMenu);

    // Close menu when a link is clicked
    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // ==========================================
    // 3. Image Lightbox / Modal
    // ==========================================
    const heroImg = document.getElementById('hero-screenshot');
    const openLightboxBtn = document.getElementById('open-lightbox');
    const modal = document.getElementById('image-modal');
    const modalPanel = document.getElementById('image-modal-panel');
    const modalImg = document.getElementById('modal-image');
    const modalCloseBtn = document.getElementById('modal-close');
    const modalFullscreenBtn = document.getElementById('modal-fullscreen');

    // The inner container that animates
    const modalContent = modalPanel.querySelector('.modal-enter');

    const openModal = () => {
        // Set the modal image source to match the trigger image
        modalImg.src = heroImg.src;
        modalImg.alt = heroImg.alt;

        modal.classList.remove('modal-hidden');
        document.body.classList.add('no-scroll');

        // Trigger enter animation on the next frame
        requestAnimationFrame(() => {
            modalContent.classList.add('modal-enter-active');
        });
    };

    const closeModal = () => {
        modalContent.classList.remove('modal-enter-active');
        modalContent.classList.add('modal-leave-active');

        // Wait for the leave transition to finish before hiding
        setTimeout(() => {
            modal.classList.add('modal-hidden');
            modalContent.classList.remove('modal-leave-active');

            // Only remove no-scroll if the mobile menu isn't open
            if (header.getAttribute('data-mobile-menu-open') !== 'true') {
                document.body.classList.remove('no-scroll');
            }

            // Exit fullscreen if active
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(err => console.warn(err));
            }
        }, 150); // Matches the 150ms in CSS transition
    };

    // Open triggers
    heroImg.addEventListener('click', openModal);
    openLightboxBtn.addEventListener('click', openModal);

    // Close triggers
    modalCloseBtn.addEventListener('click', closeModal);

    // Close when clicking the backdrop
    modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            closeModal();
        }
    });

    // Fullscreen toggle logic
    modalFullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            modalContent.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });

    // Close modal on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('modal-hidden')) {
            closeModal();
        }
    });
});