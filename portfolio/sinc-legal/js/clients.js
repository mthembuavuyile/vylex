import { db } from './firebase.js';
import { collection, doc, query, where, onSnapshot, getDocs, updateDoc, addDoc, writeBatch } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { state, notifyClientsUpdated } from './state.js';
import { DOMElements } from './dom.js';
import { CONSTANTS, setButtonLoading, hideError, showError, closeModal, renderTableSkeleton, renderEmptyState, renderTableError, escapeHTML, openModal, showConfirmation } from './utils.js';
import { renderCasesTable } from './cases.js';

let unsubscribeFromClients = null;
let initialClientFormData = '';

export function listenForClientChanges() {
    if (unsubscribeFromClients) unsubscribeFromClients();
    const q = query(collection(db, 'clients'), where("userId", "==", state.currentUserId));
    unsubscribeFromClients = onSnapshot(q, snapshot => {
        state.clientsMap.clear();
        snapshot.forEach(doc => state.clientsMap.set(doc.id, { id: doc.id, ...doc.data() }));
        state.initialDataLoaded.clients = true;
        
        notifyClientsUpdated();
        renderClientsTable();
        updateClientStats();
        
        if (state.initialDataLoaded.cases) {
             // In cases.js, we will also export this so cases can re-render to update case counts
             renderCasesTable();
             renderClientsTable(); // Re-render to update case counts
        }
    }, error => {
        console.error(`Error loading clients:`, error);
        renderTableError(DOMElements.clientsTableBody, 4, "Could not load clients.");
    });
}

export function updateClientStats() {
    const totalClientsStat = document.getElementById('total-clients-stat');
    const sidebarClientCount = document.getElementById('sidebar-client-count');
    if (totalClientsStat) totalClientsStat.textContent = state.clientsMap.size;
    if (sidebarClientCount) sidebarClientCount.textContent = state.clientsMap.size;
}

export function renderClientsTable() {
    if (!state.initialDataLoaded.clients) { renderTableSkeleton(DOMElements.clientsTableBody, 4, 5); return; }
    if (DOMElements.clientsTableContainer.querySelector('#empty-state')) DOMElements.clientsTableContainer.querySelector('#empty-state').remove();
    if (state.clientsMap.size === 0) { renderEmptyState(DOMElements.clientsTableContainer, DOMElements.clientsTableBody, "No Clients Found", "Get started by adding your first client.", "add-client-button"); return; }
    
    const fragment = document.createDocumentFragment();
    [...state.clientsMap.values()].sort((a, b) => a.name.localeCompare(b.name)).forEach(client => {
        const activeCasesCount = [...state.casesMap.values()].filter(c => c.clientId === client.id && c.status !== 'Closed').length;
        const row = document.createElement('tr');
        row.className = "hover:bg-gray-50";
        row.innerHTML = `<td class="px-6 py-4 whitespace-nowrap"><div class="flex items-center"><div class="h-10 w-10 flex-shrink-0"><span class="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center"><span class="text-sky-800 font-medium">${escapeHTML(client.name.charAt(0).toUpperCase())}</span></span></div><div class="ml-4"><div class="text-sm font-medium text-gray-900">${escapeHTML(client.name)}</div><div class="text-sm text-gray-500">${escapeHTML(client.email)}</div></div></div></td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHTML(client.type)}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${activeCasesCount} Active</td><td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button class="text-sky-600 hover:text-sky-900 edit-client-btn" data-id="${client.id}">Edit</button><button class="text-red-600 hover:text-red-900 ml-4 delete-client-btn" data-id="${client.id}">Delete</button></td>`;
        fragment.appendChild(row);
    });
    DOMElements.clientsTableBody.innerHTML = '';
    DOMElements.clientsTableBody.appendChild(fragment);
}

export const getClientFormData = () => ({ 
    name: document.getElementById('client-name-input').value.trim(), 
    email: document.getElementById('client-email-input').value.trim().toLowerCase(), 
    type: document.getElementById('client-type-select').value 
});

export async function handleClientFormSubmit(e) {
    e.preventDefault(); if (!state.currentUserId) return;
    setButtonLoading(DOMElements.saveClientButton, true, CONSTANTS.SAVE_CLIENT_TEXT); 
    hideError(DOMElements.clientFormError);
    
    const clientId = document.getElementById('client-id-input').value.trim();
    const clientData = { ...getClientFormData(), userId: state.currentUserId };
    
    try {
        const clientsRef = collection(db, 'clients');
        const emailQuery = query(clientsRef, where("userId", "==", state.currentUserId), where("email", "==", clientData.email));
        const emailSnapshot = await getDocs(emailQuery);
        if (!emailSnapshot.empty && emailSnapshot.docs.some(doc => doc.id !== clientId)) throw new Error("A client with this email already exists.");
        
        if (clientId) await updateDoc(doc(db, 'clients', clientId), clientData); 
        else await addDoc(clientsRef, clientData);
        
        closeModal(DOMElements.clientModal);
    } catch (error) {
        showError(DOMElements.clientFormError, error.message || "Failed to save client.");
    } finally { 
        setButtonLoading(DOMElements.saveClientButton, false, CONSTANTS.SAVE_CLIENT_TEXT); 
    }
}

export async function handleClientDelete(clientId) {
    const onConfirm = async () => {
        try {
            const casesQuery = query(collection(db, 'cases'), where('clientId', '==', clientId), where('userId', '==', state.currentUserId));
            const casesSnapshot = await getDocs(casesQuery);
            const batch = writeBatch(db);
            casesSnapshot.forEach(docSnap => batch.delete(docSnap.ref));
            batch.delete(doc(db, 'clients', clientId));
            await batch.commit();
        } catch (error) { 
            console.error("Error deleting client:", error); 
            showConfirmation("Error", "Failed to delete client.", () => { }, true); 
        }
    };
    showConfirmation("Delete Client?", "This will permanently delete the client and all associated cases. This cannot be undone.", onConfirm);
}

export function openAddClientModal() {
    DOMElements.clientForm.reset(); 
    document.getElementById('client-modal-title').textContent = "Add New Client"; 
    document.getElementById('client-id-input').value = ""; 
    hideError(DOMElements.clientFormError); 
    openModal(DOMElements.clientModal);
}

export function openEditClientModal(id) {
    const client = state.clientsMap.get(id); 
    document.getElementById('client-modal-title').textContent = "Edit Client"; 
    document.getElementById('client-id-input').value = id;
    document.getElementById('client-name-input').value = client.name; 
    document.getElementById('client-email-input').value = client.email; 
    document.getElementById('client-type-select').value = client.type;
    hideError(DOMElements.clientFormError); 
    initialClientFormData = JSON.stringify(getClientFormData()); 
    openModal(DOMElements.clientModal);
}

export function getInitialClientFormData() {
    return initialClientFormData;
}

export function unsubscribeClients() {
    if (unsubscribeFromClients) unsubscribeFromClients();
}
