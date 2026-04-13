export const state = {
    currentUserId: null,
    clientsMap: new Map(),
    casesMap: new Map(),
    documentsMap: new Map(),
    eventsMap: new Map(),
    initialDataLoaded: { clients: false, cases: false, documents: false, events: false },
    documentsFilter: { caseId: 'all', search: '' },
    currentCalendarDate: new Date()
};

export function setCurrentUserId(id) {
    state.currentUserId = id;
}

export function notifyCasesUpdated() {
    window.dispatchEvent(new CustomEvent('casesUpdated', { detail: state.casesMap }));
}

export function notifyClientsUpdated() {
    window.dispatchEvent(new CustomEvent('clientsUpdated', { detail: state.clientsMap }));
}

export function notifyDocumentsUpdated() {
    window.dispatchEvent(new CustomEvent('documentsUpdated', { detail: state.documentsMap }));
}

export function notifyEventsUpdated() {
    window.dispatchEvent(new CustomEvent('eventsUpdated', { detail: state.eventsMap }));
}
