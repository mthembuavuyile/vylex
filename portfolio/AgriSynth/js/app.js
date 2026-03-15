document.addEventListener('DOMContentLoaded', function() {
        const siteHeader = document.querySelector('header');
        const navToggle = document.querySelector('.nav-toggle');
        // const mainNav = document.querySelector('.main-nav'); // Not directly used, classList on header instead
        const body = document.body;
        let isSiteNavOpen = false;

        function updateHeaderPadding() {
            if (siteHeader && getComputedStyle(siteHeader).display !== 'none') {
                body.style.paddingTop = siteHeader.offsetHeight + 'px';
            } else {
                body.style.paddingTop = '0';
            }
        }

        function closeSiteNav() {
            if (siteHeader) siteHeader.classList.remove('nav-open');
            if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
            body.classList.remove('body-no-scroll');
            isSiteNavOpen = false;
        }

        if (navToggle) {
            navToggle.addEventListener('click', function() {
                isSiteNavOpen = !isSiteNavOpen;
                if (siteHeader) siteHeader.classList.toggle('nav-open', isSiteNavOpen);
                navToggle.setAttribute('aria-expanded', isSiteNavOpen ? 'true' : 'false');
                body.classList.toggle('body-no-scroll', isSiteNavOpen);
            });
        }

        document.addEventListener('click', function(e) {
            if (isSiteNavOpen && siteHeader && !siteHeader.contains(e.target) && !navToggle.contains(e.target)) {
                 if (!e.target.closest('.main-nav')) { // Ensure clicking inside nav doesn't close it
                    closeSiteNav();
                }
            }
        });

        const siteNavLinks = document.querySelectorAll('.main-nav a.nav-link');
        siteNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                    e.preventDefault();
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        let headerOffset = 0;
                        if (siteHeader && getComputedStyle(siteHeader).display !== 'none') {
                            headerOffset = siteHeader.offsetHeight;
                        }
                        window.scrollTo({
                            top: targetElement.offsetTop - headerOffset,
                            behavior: 'smooth'
                        });
                    }
                }
                if (isSiteNavOpen) closeSiteNav();
            });
        });

        let lastScroll = 0;
        const scrollThreshold = 5;
        window.addEventListener('scroll', () => {
            if (!siteHeader || getComputedStyle(siteHeader).display === 'none') return;
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) { // Add shadow and slight bg change earlier
                siteHeader.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                let bgColor = body.classList.contains('dark-mode') ? 'rgba(34, 59, 35, 0.98)' : 'rgba(76, 175, 80, 0.98)'; // Darker green for dark mode
                siteHeader.style.backgroundColor = bgColor;
            } else {
                siteHeader.style.boxShadow = 'none';
                siteHeader.style.backgroundColor = ''; // Reverts to CSS gradient
            }

            if (Math.abs(currentScroll - lastScroll) > scrollThreshold) {
                if (currentScroll > lastScroll && currentScroll > siteHeader.offsetHeight) {
                    if (!isSiteNavOpen) siteHeader.style.transform = 'translateY(-100%)';
                } else {
                    siteHeader.style.transform = 'translateY(0)';
                }
                lastScroll = currentScroll;
            }
        });
        
        updateHeaderPadding();
        window.addEventListener('resize', updateHeaderPadding);

        document.getElementById('current-year').textContent = new Date().getFullYear();
        
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = themeToggle.querySelector('i');
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDarkMode = body.classList.contains('dark-mode');
            themeIcon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            // Adjust scrolled header color if visible and scrolled
            if (window.pageYOffset > 50 && siteHeader && getComputedStyle(siteHeader).display !== 'none') {
                 siteHeader.style.backgroundColor = isDarkMode ? 'rgba(34, 59, 35, 0.98)' : 'rgba(76, 175, 80, 0.98)';
            } else if (window.pageYOffset <= 50 && siteHeader) {
                 siteHeader.style.backgroundColor = ''; // Revert to gradient
            }
        });
        // Load saved theme
        if (localStorage.getItem('theme') === 'dark') {
            body.classList.add('dark-mode');
            themeIcon.className = 'fas fa-sun';
        }
        
        const exploreBtn = document.getElementById('explore-prototype-btn');
        const exitBtn = document.getElementById('exit-prototype-btn');
        const landingContent = document.querySelector('.landing-content');
        const appDashboard = document.getElementById('app-dashboard');
        let sensorInterval; // For sensor simulation
        
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                if (landingContent) landingContent.style.display = 'none';
                if (appDashboard) appDashboard.style.display = 'block';
                if (siteHeader) siteHeader.style.display = 'none';
                updateHeaderPadding(); 
                window.scrollTo(0, 0);
                startSensorSimulation();
            });
        }
        
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                if (appDashboard) appDashboard.style.display = 'none';
                if (landingContent) landingContent.style.display = 'block';
                if (siteHeader) siteHeader.style.display = ''; 
                updateHeaderPadding(); 
                window.scrollTo(0, 0);
                if (isAppSidebarOpen) closeAppSidebar();
                stopSensorSimulation();
            });
        }
        
        const tabLinks = document.querySelectorAll('.sidebar-menu a');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                tabLinks.forEach(l => l.classList.remove('active'));
                tabContents.forEach(t => t.classList.remove('active'));
                link.classList.add('active');
                const tabId = link.getAttribute('data-tab');
                const targetTab = document.getElementById(tabId);
                if (targetTab) targetTab.classList.add('active');
                if (isAppSidebarOpen) closeAppSidebar(); 
            });
        });
        
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const appSidebar = document.getElementById('app-sidebar');
        const appOverlay = document.getElementById('app-overlay');
        let isAppSidebarOpen = false;

        function openAppSidebar() {
            if (appSidebar) appSidebar.classList.add('show');
            if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'true');
            if (appOverlay) appOverlay.style.display = 'block';
            body.classList.add('body-no-scroll');
            isAppSidebarOpen = true;
        }
        function closeAppSidebar() {
            if (appSidebar) appSidebar.classList.remove('show');
            if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
            if (appOverlay) appOverlay.style.display = 'none';
            body.classList.remove('body-no-scroll');
            isAppSidebarOpen = false;
        }

        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                isAppSidebarOpen ? closeAppSidebar() : openAppSidebar();
            });
        }
        if (appOverlay) {
            appOverlay.addEventListener('click', () => {
                if (isAppSidebarOpen) closeAppSidebar();
            });
        }
        
        function openModal(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) return;
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('show'), 10);
            body.style.overflow = 'hidden';
        }
        
        function closeModal(modalOrId) {
            const modal = (typeof modalOrId === 'string') ? document.getElementById(modalOrId) : modalOrId;
            if (!modal) return;
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                // Only restore body scroll if no other modals are open
                if (document.querySelectorAll('.modal.show').length === 0) {
                    body.style.overflow = '';
                }
            }, 300);
        }

        document.querySelectorAll('[data-modal-id]').forEach(el => {
            el.addEventListener('click', function() {
                const modalId = this.dataset.modalId;
                if (this.classList.contains('modal-close') || this.classList.contains('modal-cancel')) {
                    closeModal(modalId);
                }
            });
        });
        
        ['add-resource-btn', 'add-task-btn', 'add-sensor-btn', 'add-listing-btn', 'share-knowledge-btn'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                const modalId = id.replace('-btn', '-modal');
                btn.addEventListener('click', (e) => {
                     e.preventDefault(); 
                     openModal(modalId);
                });
            }
        });
        // Manifesto modal openers
        ['read-manifesto-btn-hero', 'read-manifesto-btn-section'].forEach(id => {
            const btn = document.getElementById(id);
            if(btn) btn.addEventListener('click', () => openModal('manifesto-modal'));
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.show').forEach(closeModal);
            }
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal(modal);
            });
        });

        function showToast(message, type = 'success') {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.textContent = message;
            body.appendChild(toast);
            setTimeout(() => toast.classList.add('show'), 10);
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // Sensor data simulation (from File 1, adapted)
        function startSensorSimulation() {
            if (sensorInterval) clearInterval(sensorInterval); // Clear existing interval if any
            sensorInterval = setInterval(() => {
                const moistureEl = document.getElementById('moisture');
                const phEl = document.getElementById('ph');
                const envTempEl = document.getElementById('env-temp'); // Note: Renamed from 'temp' in File 1
                const lightEl = document.getElementById('light');

                if(moistureEl) moistureEl.textContent = Math.floor(Math.random() * 20 + 55) + '%'; // 55-75%
                if(phEl) phEl.textContent = (Math.random() * 1.4 + 6.2).toFixed(1); // 6.2-7.6
                if(envTempEl) envTempEl.textContent = Math.floor(Math.random() * 8 + 18) + '°C'; // 18-26°C
                if(lightEl) lightEl.textContent = Math.floor(Math.random() * 20 + 75) + '%'; // 75-95%
            }, 3000);
        }

        function stopSensorSimulation() {
            if (sensorInterval) {
                clearInterval(sensorInterval);
                sensorInterval = null;
            }
        }

        // App Interactivity
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                const icon = this.querySelector('i');
                icon.classList.add('fa-spin');
                
                // Simulate weather update
                ['dash-temp', 'dash-humidity', 'dash-uv', 'dash-wind'].forEach(id => {
                    const el = document.getElementById(id);
                    if(el) {
                        const currentText = el.textContent; el.textContent = '...';
                        setTimeout(() => {
                            if (id === 'dash-temp') el.textContent = (Math.floor(Math.random() * 10) + 18) + '°C';
                            else if (id === 'dash-humidity') el.textContent = (Math.floor(Math.random() * 50) + 40) + '%';
                            else if (id === 'dash-uv') el.textContent = 'UV ' + (Math.floor(Math.random() * 6) + 2);
                            else if (id === 'dash-wind') el.textContent = (Math.floor(Math.random() * 15) + 5) + ' km/h';
                            else el.textContent = currentText; // Fallback
                        }, 800);
                    }
                });
                // Simulate chart update
                document.querySelectorAll('#soil-chart .chart-bar').forEach(bar => {
                    bar.style.height = '0%';
                    setTimeout(() => bar.style.height = (Math.floor(Math.random() * 70) + 20) + '%', Math.random() * 500 + 300);
                });
                // Trigger one quick sensor update
                if (typeof startSensorSimulation === "function" && typeof stopSensorSimulation === "function") {
                     stopSensorSimulation(); startSensorSimulation(); // restart to get immediate values
                }

                setTimeout(() => icon.classList.remove('fa-spin'), 1200);
                showToast('Dashboard data refreshed!', 'info');
            });
        }
        
        const saveResourceBtn = document.getElementById('save-resource-btn');
        if (saveResourceBtn) {
            saveResourceBtn.addEventListener('click', () => {
                const name = document.getElementById('resource-name').value;
                if (!name) { showToast('Resource name is required.', 'error'); return; }
                
                const newCard = document.createElement('div');
                newCard.className = 'card';
                newCard.innerHTML = `<div class="card-header">${name}</div><div class="resource-card-img"><i class="fas fa-tools"></i></div><div class="card-body"><p>${document.getElementById('resource-description').value || 'Newly added resource.'}</p><p><strong>Owner:</strong> You</p></div><div class="card-footer"><span><i class="fas fa-check-circle" style="color:var(--primary)"></i> Available</span><button class="btn btn-sm btn-primary">Request</button></div>`;
                
                const grid = document.getElementById('resources-grid');
                if (grid) grid.appendChild(newCard);
                
                document.getElementById('resource-name').value = '';
                document.getElementById('resource-description').value = '';
                closeModal('add-resource-modal');
                showToast('Resource added successfully!', 'success');
            });
        }

        const saveTaskBtn = document.getElementById('save-task-btn');
        if (saveTaskBtn) {
            saveTaskBtn.addEventListener('click', () => {
                const title = document.getElementById('task-title-input').value;
                if (!title) { showToast('Task title is required.', 'error'); return; }
                const date = document.getElementById('task-date').value;
                const assignee = document.getElementById('task-assignee').value || 'Unassigned';

                const newTaskItem = document.createElement('div');
                newTaskItem.className = 'task-item';
                const taskId = 'task-' + Date.now();
                newTaskItem.innerHTML = `<div class="task-status"><input type="checkbox" id="${taskId}"></div><div class="task-details"><div class="task-title">${title}</div><div class="task-meta"><span><i class="fas fa-calendar-alt"></i> ${date || 'Anytime'}</span><span><i class="fas fa-user"></i> ${assignee}</span></div></div><div class="task-actions"><button class="btn btn-sm btn-outline task-edit-btn" aria-label="Edit Task"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-outline task-delete-btn" aria-label="Delete Task"><i class="fas fa-trash"></i></button></div>`;
                
                const list = document.getElementById('all-tasks-list');
                if (list) list.appendChild(newTaskItem);
                
                document.getElementById('task-title-input').value = '';
                document.getElementById('task-date').value = '';
                document.getElementById('task-assignee').value = '';
                closeModal('add-task-modal');
                showToast('Task added successfully!', 'success');
            });
        }

        ['all-tasks-list', 'dashboard-tasks-list'].forEach(listId => {
            const taskList = document.getElementById(listId);
            if (taskList) {
                taskList.addEventListener('change', function(e) {
                    if (e.target.matches('input[type="checkbox"]')) {
                        const taskItem = e.target.closest('.task-item');
                        if (taskItem) taskItem.classList.toggle('completed', e.target.checked);
                    }
                });
                taskList.addEventListener('click', function(e) {
                    const targetButton = e.target.closest('button.task-edit-btn, button.task-delete-btn');
                    if (!targetButton) return;

                    if (targetButton.classList.contains('task-edit-btn')) {
                        showToast('Edit task feature coming soon!', 'info');
                    } else if (targetButton.classList.contains('task-delete-btn')) {
                        if (confirm('Are you sure you want to delete this task? (Demo)')) {
                            targetButton.closest('.task-item').remove();
                            showToast('Task deleted', 'info');
                        }
                    }
                });
            }
        });
        document.querySelectorAll('.tasks-list input[type="checkbox"]:checked').forEach(cb => {
            const taskItem = cb.closest('.task-item');
            if (taskItem) taskItem.classList.add('completed');
        });

        const saveSettingsBtn = document.getElementById('save-settings-btn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                showToast('Settings saved (demo)!', 'success');
            });
        }
        
        document.addEventListener('click', function(e){
            if (e.target.closest('.sensor-details-btn')) showToast('Viewing sensor details (demo).', 'info');
            if (e.target.closest('.market-action-btn')) showToast('Market action (demo).', 'info');
            if (e.target.closest('.learn-action-btn')) showToast('Opening learning resource (demo).', 'info');
        });

        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        if ("IntersectionObserver" in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            }, { threshold: 0.1 });
            animatedElements.forEach(el => {
                observer.observe(el);
            });
        } else { 
            animatedElements.forEach(el => el.classList.add('is-visible'));
        }

    });