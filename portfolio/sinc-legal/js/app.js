import { DOMElements } from './dom.js';
import { renderRichContent, closeModal, hideError } from './utils.js';
import { 
    listenForClientChanges, handleClientFormSubmit, handleClientDelete, 
    openAddClientModal, openEditClientModal, getInitialClientFormData, getClientFormData, unsubscribeClients
} from './clients.js';
import { 
    listenForCaseChanges, listenForRecentCases, handleCaseEditFormSubmit, 
    renderCaseViewPage, renderCaseEditPage, unsubscribeCases 
} from './cases.js';
import { 
    listenForDocumentChanges, handleDocumentFormSubmit, handleDocumentDelete, 
    handleDocumentDownload, unsubscribeDocuments 
} from './documents.js';
import { 
    listenForEventChanges, handleEventFormSubmit, handleEventDelete, 
    unsubscribeEvents, populateEventCaseSelect
} from './events.js';
import { handleProfileFormSubmit, handleBillingSettingsFormSubmit } from './profile.js';
import { initTimeTracker } from './time-tracker.js';
import { initAuthListener, setInitDashboardCallback, setLogoutCallback, handleLogout } from './auth-dashboard.js';
import { state } from './state.js';

// --- CORE APPLICATION LOGIC ---

setInitDashboardCallback((userId) => {
    initUI();
    initEventListeners();
    listenForClientChanges();
    listenForCaseChanges();
    listenForRecentCases();
    listenForDocumentChanges();
    listenForEventChanges();
    initTimeTracker();
});

setLogoutCallback(() => {
    unsubscribeClients();
    unsubscribeCases();
    unsubscribeDocuments();
    unsubscribeEvents();
});

initAuthListener();

// --- UI & ROUTING ---
function initUI() { 
    initSidebar(); 
    initRouter(); 
}

function initSidebar() { 
    const toggle = () => { 
        if(DOMElements.sidebar) DOMElements.sidebar.classList.toggle('-translate-x-full'); 
        if(DOMElements.overlay) DOMElements.overlay.classList.toggle('hidden'); 
    }; 
    const menuToggle = document.getElementById('menu-toggle');
    const closeSidebar = document.getElementById('close-sidebar');
    if(menuToggle) menuToggle.addEventListener('click', toggle); 
    if(closeSidebar) closeSidebar.addEventListener('click', toggle); 
    if(DOMElements.overlay) DOMElements.overlay.addEventListener('click', toggle); 
}

function initRouter() {
    const route = () => {
        const [path, id] = window.location.hash.substring(1).split('/');
        const targetId = path || 'dashboard';
        document.querySelectorAll('.content-section').forEach(s => s.classList.toggle('hidden', s.id !== targetId));
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.toggle('active', l.dataset.target === targetId));

        if (targetId === 'case-view' && id) renderCaseViewPage(id);
        else if (targetId === 'case-edit') renderCaseEditPage(id || 'new');

        if (window.innerWidth < 1024 && DOMElements.sidebar && !DOMElements.sidebar.classList.contains('-translate-x-full')) {
            DOMElements.sidebar.classList.add('-translate-x-full'); 
            DOMElements.overlay.classList.add('hidden');
        }
        window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', route);
    route(); // Initial route call
}

// --- EVENT LISTENERS ---
function initEventListeners() {
    const logoutBtn = document.getElementById('logout-button');
    if(logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    if(DOMElements.clientForm) DOMElements.clientForm.addEventListener('submit', handleClientFormSubmit);
    if(DOMElements.caseEditForm) DOMElements.caseEditForm.addEventListener('submit', handleCaseEditFormSubmit);
    if(DOMElements.profileForm) DOMElements.profileForm.addEventListener('submit', handleProfileFormSubmit);
    if(DOMElements.documentForm) DOMElements.documentForm.addEventListener('submit', handleDocumentFormSubmit);
    if(DOMElements.eventForm) DOMElements.eventForm.addEventListener('submit', handleEventFormSubmit);
    if(DOMElements.billingSettingsForm) DOMElements.billingSettingsForm.addEventListener('submit', handleBillingSettingsFormSubmit);

    const addClientBtn = document.getElementById('add-client-button');
    if(addClientBtn) addClientBtn.addEventListener('click', openAddClientModal);

    if(DOMElements.addDocumentButton) {
        DOMElements.addDocumentButton.addEventListener('click', () => {
            DOMElements.documentForm.reset();
            import('./documents.js').then(mod => mod.populateDocumentCaseSelect()); // Dynamic load for cross dependency
            import('./utils.js').then(mod => mod.setUploadProgress(DOMElements.documentUploadProgress, 0));
            hideError(DOMElements.documentFormError);
            import('./utils.js').then(mod => mod.openModal(DOMElements.documentModal));
        });
    }

    if(DOMElements.documentsFilterCase) {
        DOMElements.documentsFilterCase.addEventListener('change', (e) => { 
            state.documentsFilter.caseId = e.target.value; 
            import('./documents.js').then(mod => mod.renderDocumentsTable()); 
        });
    }
    if(DOMElements.documentsSearch) {
        DOMElements.documentsSearch.addEventListener('input', (e) => { 
            state.documentsFilter.search = e.target.value; 
            import('./documents.js').then(mod => mod.renderDocumentsTable()); 
        });
    }

    const userDropdownToggle = document.getElementById('user-dropdown-toggle');
    if(userDropdownToggle && DOMElements.userDropdownMenu) {
        userDropdownToggle.addEventListener('click', () => DOMElements.userDropdownMenu.classList.toggle('hidden'));
    }

    if(DOMElements.caseEditDescription) {
        DOMElements.caseEditDescription.addEventListener('input', e => {
            const text = e.target.value;
            if(DOMElements.caseEditPreview) DOMElements.caseEditPreview.innerHTML = renderRichContent(text);
            if(DOMElements.caseEditPreviewLength) DOMElements.caseEditPreviewLength.textContent = `${text.length} characters`;
        });
    }

    if(DOMElements.addEventButton) {
        DOMElements.addEventButton.addEventListener('click', () => { 
            DOMElements.eventForm.reset(); 
            document.getElementById('event-modal-title').textContent = "Add New Event"; 
            document.getElementById('event-id-input').value = ""; 
            populateEventCaseSelect(); 
            hideError(DOMElements.eventFormError); 
            document.getElementById('event-date-input').value = new Date().toISOString().split('T')[0]; 
            import('./utils.js').then(mod => mod.openModal(DOMElements.eventModal)); 
        });
    }

    if(DOMElements.calendarPrev) {
        DOMElements.calendarPrev.addEventListener('click', () => {
            state.currentCalendarDate.setMonth(state.currentCalendarDate.getMonth() - 1);
            import('./events.js').then(mod => mod.renderCalendar());
        });
    }

    if(DOMElements.calendarNext) {
        DOMElements.calendarNext.addEventListener('click', () => {
            state.currentCalendarDate.setMonth(state.currentCalendarDate.getMonth() + 1);
            import('./events.js').then(mod => mod.renderCalendar());
        });
    }

    // Global body click handler for modals and delegated buttons
    document.body.addEventListener('click', async e => {
        const target = e.target;
        if (!target) return;

        if (!target.closest('#user-dropdown-toggle') && !target.closest('#user-dropdown-menu') && DOMElements.userDropdownMenu) {
            DOMElements.userDropdownMenu.classList.add('hidden');
        }

        const modal = target.closest('.modal');
        if (target.dataset.role === 'cancel' && modal) {
            if (modal.id === 'client-modal' && document.getElementById('client-id-input')?.value) {
                if (getInitialClientFormData() !== JSON.stringify(getClientFormData())) { 
                    const { showConfirmation } = await import('./utils.js');
                    showConfirmation('Discard Changes?', 'You have unsaved changes. Are you sure?', () => closeModal(modal)); 
                    return; 
                }
            }
            closeModal(modal);
        }
        if (target.dataset.role === 'modal-backdrop') closeModal(modal);
        
        if (target.matches('.empty-state-btn')) {
            const triggerId = target.dataset.trigger;
            if (triggerId === 'add-case-button') window.location.hash = '#case-edit/new';
            else {
                const triggerEl = document.getElementById(triggerId);
                if(triggerEl) triggerEl.click();
            }
        }

        const clientBtn = target.closest('.edit-client-btn, .delete-client-btn');
        if (clientBtn && DOMElements.clientsTableBody?.contains(clientBtn)) {
            const id = clientBtn.dataset.id;
            if (clientBtn.classList.contains('edit-client-btn')) openEditClientModal(id);
            else if (clientBtn.classList.contains('delete-client-btn')) handleClientDelete(id);
        }

        const docBtn = target.closest('.delete-document-btn, .download-document-btn');
        if (docBtn && DOMElements.documentsTableBody?.contains(docBtn)) {
            if (docBtn.classList.contains('delete-document-btn')) handleDocumentDelete(docBtn.dataset.id);
            if (docBtn.classList.contains('download-document-btn')) handleDocumentDownload(docBtn.dataset.id);
        }

        const eventBtn = target.closest('.edit-event-btn, .delete-event-btn');
        if (eventBtn) {
            const id = eventBtn.dataset.id;
            if (eventBtn.classList.contains('edit-event-btn')) {
                const event = state.eventsMap.get(id);
                if (!event) return;
                document.getElementById('event-modal-title').textContent = "Edit Event";
                document.getElementById('event-id-input').value = id;
                document.getElementById('event-title-input').value = event.title;
                document.getElementById('event-date-input').value = event.date.toDate().toISOString().split('T')[0];
                document.getElementById('event-case-select').value = event.caseId || '';
                document.getElementById('event-description-input').value = event.description || '';
                populateEventCaseSelect(event.caseId);
                hideError(DOMElements.eventFormError);
                import('./utils.js').then(mod => mod.openModal(DOMElements.eventModal));
            } else if (eventBtn.classList.contains('delete-event-btn')) {
                const { showConfirmation } = await import('./utils.js');
                showConfirmation("Delete Event?", "This will permanently delete the event.", async () => {
                    try {
                        await handleEventDelete(id);
                    } catch (error) {
                        console.error("Error deleting event:", error);
                    }
                });
            }
        }
    });
}
