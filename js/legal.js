// Set Year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Accordion Logic
    function toggleAccordion(id) {
      const allItems = document.querySelectorAll('.accordion-item');
      const targetItem = document.getElementById(id);
      
      if (!targetItem) return;

      const targetContent = targetItem.querySelector('.accordion-content');
      const isAlreadyActive = targetItem.classList.contains('active');

      // Close all items
      allItems.forEach(item => {
        item.classList.remove('active');
        item.querySelector('.accordion-content').style.maxHeight = null;
      });

      // If it wasn't already active, open it
      if (!isAlreadyActive) {
        targetItem.classList.add('active');
        targetContent.style.maxHeight = targetContent.scrollHeight + "px";
      }
    }

    // Handle URL Hash on load (e.g. site.com/legal#privacy)
    window.addEventListener('load', () => {
      const hash = window.location.hash.substring(1); 
      if (hash && document.getElementById(hash) && document.getElementById(hash).classList.contains('accordion-item')) {
        // Scroll to the policies section specifically
        const policiesSection = document.getElementById('policies');
        policiesSection.scrollIntoView();
        // Open the specific accordion
        setTimeout(() => toggleAccordion(hash), 100); 
      }
    });

    // Sidebar active state on scroll
    const sections = document.querySelectorAll('.section[id]');
    const links = document.querySelectorAll('.sidebar-nav a');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          const activeLink = document.querySelector(`.sidebar-nav a[href="#${entry.target.id}"]`);
          if (activeLink) activeLink.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -60% 0px' });

    sections.forEach(s => observer.observe(s));