import { db, storage } from './firebase.js';
import { collection, doc, query, where, orderBy, onSnapshot, limit, getDocs, updateDoc, addDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { ref as storageRef, deleteObject } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";
import { state, notifyCasesUpdated } from './state.js';
import { DOMElements } from './dom.js';
import { CONSTANTS, setButtonLoading, hideError, showError, closeModal, renderTableSkeleton, renderEmptyState, renderTableError, escapeHTML, formatDate, getStatusClass, renderRichContent, showConfirmation } from './utils.js';
import { renderClientsTable } from './clients.js';
import { populateDocumentCaseFilter, populateDocumentCaseSelect } from './documents.js';

let unsubscribeFromCases = null;
let unsubscribeFromRecentCases = null;

export function listenForCaseChanges() {
    if (unsubscribeFromCases) unsubscribeFromCases();
    const q = query(collection(db, 'cases'), where("userId", "==", state.currentUserId), orderBy('updatedAt', 'desc'));
    unsubscribeFromCases = onSnapshot(q, snapshot => {
        state.casesMap.clear();
        snapshot.forEach(doc => state.casesMap.set(doc.id, { id: doc.id, ...doc.data() }));
        state.initialDataLoaded.cases = true;
        
        notifyCasesUpdated();
        renderCasesTable();
        updateCaseStats();
        populateDocumentCaseFilter();
        populateDocumentCaseSelect();
        
        if (state.initialDataLoaded.clients) renderClientsTable();
    }, error => {
        console.error(`Error loading cases:`, error);
        renderTableError(DOMElements.casesTableBody, 5, "Could not load cases. A database index is likely required.");
    });
}

export function listenForRecentCases() {
    if (unsubscribeFromRecentCases) unsubscribeFromRecentCases();
    const q = query(collection(db, 'cases'), where("userId", "==", state.currentUserId), orderBy('updatedAt', 'desc'), limit(5));
    unsubscribeFromRecentCases = onSnapshot(q, snapshot => {
        const recentCases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderRecentActivity(recentCases);
    }, error => {
        console.error("Error listening to recent cases:", error);
        document.getElementById('recent-activity-list').innerHTML = `<div class="text-center py-8 text-red-500">Could not load recent activity. A database index may be required.</div>`;
    });
}

export function updateCaseStats() {
    const totalCasesStat = document.getElementById('total-cases-stat');
    const activeCasesStat = document.getElementById('active-cases-stat');
    const sidebarCaseCount = document.getElementById('sidebar-case-count');
    
    if (totalCasesStat) totalCasesStat.textContent = state.casesMap.size;
    if (activeCasesStat) activeCasesStat.textContent = [...state.casesMap.values()].filter(c => c.status !== 'Closed').length;
    if (sidebarCaseCount) sidebarCaseCount.textContent = state.casesMap.size;
}

export function renderRecentActivity(recentCases) {
    const listEl = document.getElementById('recent-activity-list');
    listEl.innerHTML = '';
    if (recentCases.length === 0) { listEl.innerHTML = `<div class="text-center py-8 text-gray-500">No recent activity.</div>`; return; }
    const fragment = document.createDocumentFragment();
    recentCases.forEach(caseData => {
        const clientName = state.clientsMap.get(caseData.clientId)?.name || 'Unknown Client';
        const item = document.createElement('a');
        item.href = `#case-view/${caseData.id}`;
        item.className = 'flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors';
        item.innerHTML = `<div><p class="font-medium text-gray-800">${escapeHTML(caseData.caseName)}</p><p class="text-sm text-gray-500">Client: ${escapeHTML(clientName)}</p></div><div class="text-right"><p class="text-sm text-gray-500">${formatDate(caseData.updatedAt)}</p><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(caseData.status)}">${caseData.status}</span></div>`;
        fragment.appendChild(item);
    });
    listEl.appendChild(fragment);
}

export function renderCasesTable() {
    if (!state.initialDataLoaded.cases) { renderTableSkeleton(DOMElements.casesTableBody, 5, 5); return; }
    if (DOMElements.casesTableContainer.querySelector('#empty-state')) DOMElements.casesTableContainer.querySelector('#empty-state').remove();
    if (state.casesMap.size === 0) { renderEmptyState(DOMElements.casesTableContainer, DOMElements.casesTableBody, "No Case Files Found", "Add your first case file to see it here.", "add-case-button"); return; }
    
    const fragment = document.createDocumentFragment();
    [...state.casesMap.values()].forEach(caseData => {
        const clientInfo = state.clientsMap.get(caseData.clientId) || { name: 'Unknown Client' };
        const row = document.createElement('tr');
        row.className = "hover:bg-gray-50";
        row.innerHTML = `<td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-medium text-gray-900">${escapeHTML(caseData.caseName)}</div><div class="text-sm text-gray-500 max-w-xs truncate">${escapeHTML(caseData.description || 'No description')}</div></td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${escapeHTML(clientInfo.name)}</td><td class="px-6 py-4 whitespace-nowrap"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(caseData.status)}">${caseData.status}</span></td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(caseData.updatedAt)}</td><td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><a href="#case-view/${caseData.id}" class="text-sky-600 hover:text-sky-900">View</a></td>`;
        fragment.appendChild(row);
    });
    DOMElements.casesTableBody.innerHTML = '';
    DOMElements.casesTableBody.appendChild(fragment);
}

export async function handleCaseEditFormSubmit(e) {
    e.preventDefault(); if (!state.currentUserId) return;
    setButtonLoading(DOMElements.saveCaseButton, true, CONSTANTS.SAVE_CASE_TEXT);
    hideError(DOMElements.caseEditError);
  
    const caseId = document.getElementById('case-edit-id').value.trim();
    const caseData = {
        caseName: document.getElementById('case-edit-name').value.trim(),
        clientId: document.getElementById('case-edit-client').value,
        status: document.getElementById('case-edit-status').value,
        description: document.getElementById('case-edit-description').value.trim(),
        userId: state.currentUserId,
        updatedAt: serverTimestamp()
    };
  
    if (!caseData.caseName || !caseData.clientId) {
        showError(DOMElements.caseEditError, "File Reference and Client are required.");
        setButtonLoading(DOMElements.saveCaseButton, false, CONSTANTS.SAVE_CASE_TEXT);
        return;
    }
  
    try {
        let savedCaseId = caseId;
        if (caseId) {
            await updateDoc(doc(db, 'cases', caseId), caseData);
        } else {
            caseData.createdAt = serverTimestamp();
            const newCaseRef = await addDoc(collection(db, "cases"), caseData);
            savedCaseId = newCaseRef.id;
        }
        window.location.hash = `#case-view/${savedCaseId}`;
    } catch (error) {
        console.error("Error saving case:", error);
        showError(DOMElements.caseEditError, "Failed to save case file. Please try again.");
    } finally {
        setButtonLoading(DOMElements.saveCaseButton, false, CONSTANTS.SAVE_CASE_TEXT);
    }
}

export async function handleCaseDelete(caseId) {
    const onConfirm = async () => {
        try {
            // Delete documents linked to this case (storage + firestore)
            const docsQuery = query(collection(db, 'documents'), where('userId', '==', state.currentUserId), where('caseId', '==', caseId));
            const docsSnapshot = await getDocs(docsQuery);
            await Promise.all(docsSnapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();
                if (data.storagePath) {
                    try { await deleteObject(storageRef(storage, data.storagePath)); } catch (e) { console.warn('Storage delete failed for', data.storagePath, e); }
                }
                await deleteDoc(docSnap.ref);
            }));
            // Delete the case
            await deleteDoc(doc(db, 'cases', caseId));
            window.location.hash = '#cases';
        }
        catch (error) { console.error("Error deleting case:", error); showConfirmation("Error", "Failed to delete case.", () => { }, true); }
    };
    showConfirmation("Delete Case File?", "This will permanently delete this case and all its documents. This cannot be undone.", onConfirm);
}

export function populateClientDropdownForEdit(selectedId = null) { 
    const selectEl = document.getElementById('case-edit-client'); 
    selectEl.innerHTML = '<option value="">Select a client...</option>'; 
    if (state.clientsMap.size === 0) { selectEl.innerHTML += '<option value="" disabled>No clients. Add a client first.</option>'; return; } 
    [...state.clientsMap.values()].sort((a, b) => a.name.localeCompare(b.name)).forEach(client => { selectEl.innerHTML += `<option value="${client.id}" ${client.id === selectedId ? 'selected' : ''}>${escapeHTML(client.name)}</option>`; }); 
}

export function renderCaseViewPage(caseId) {
    const caseData = state.casesMap.get(caseId);
    if (!caseData) { window.location.hash = '#cases'; return; }
  
    const client = state.clientsMap.get(caseData.clientId);
    const clientName = client ? client.name : "Unknown Client";
  
    document.getElementById('case-breadcrumb-name').textContent = caseData.caseName;
    document.getElementById('case-view-title').textContent = caseData.caseName;
    document.getElementById('case-view-client').textContent = clientName;
    document.getElementById('case-edit-link').href = `#case-edit/${caseId}`;
  
    const deleteBtn = document.getElementById('case-delete-button');
    deleteBtn.onclick = () => handleCaseDelete(caseId);
  
    document.getElementById('case-view-status').innerHTML = `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(caseData.status)}">${caseData.status}</span>`;
    document.getElementById('case-view-client-chip').textContent = clientName;
    document.getElementById('case-view-created').textContent = formatDate(caseData.createdAt);
    document.getElementById('case-view-updated').textContent = formatDate(caseData.updatedAt);
  
    const desc = caseData.description || '';
    document.getElementById('case-description-length').textContent = `${desc.length} characters`;
    document.getElementById('case-view-description').innerHTML = renderRichContent(desc);
  
    // Populate associated documents
    const associatedDocs = [...state.documentsMap.values()].filter(d => d.caseId === caseId);
    const docsList = document.getElementById('case-associated-documents');
    docsList.innerHTML = '';
    if (associatedDocs.length === 0) {
        docsList.innerHTML = '<li class="text-gray-500">No documents associated yet.</li>';
    } else {
        associatedDocs.forEach(d => {
            const shortType = (ct = '') => { const [t, s] = ct.split('/'); return (t === 'image' || t === 'text') ? t.charAt(0).toUpperCase() + t.slice(1) : s ? s.toUpperCase() : t; };
            const formatBytes = (bytes) => { if (!bytes && bytes !== 0) return '—'; const s = ['B', 'KB', 'MB', 'GB', 'TB']; if (bytes === 0) return '0 B'; const i = Math.floor(Math.log(bytes) / Math.log(1024)); return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${s[i]}`; };
            
            const li = document.createElement('li');
            li.innerHTML = `<a href="${d.downloadURL}" target="_blank" rel="noopener noreferrer" class="text-sky-600 hover:text-sky-800">${escapeHTML(d.name)}</a> (${shortType(d.contentType)}, ${formatBytes(d.size)})`;
            docsList.appendChild(li);
        });
    }
  
    // Set up upload button for this case
    document.getElementById('upload-for-case-button').onclick = () => {
        DOMElements.documentForm.reset();
        populateDocumentCaseSelect(caseId);
        if(DOMElements.documentUploadProgress) DOMElements.documentUploadProgress.style.width = '0%';
        hideError(DOMElements.documentFormError);
        openModal(DOMElements.documentModal);
    };
}
  
export function renderCaseEditPage(caseId) {
    DOMElements.caseEditForm.reset();
    hideError(DOMElements.caseEditError);
    populateClientDropdownForEdit();
  
    const isNew = caseId === 'new';
    document.getElementById('case-edit-id').value = isNew ? '' : caseId;
  
    document.getElementById('case-edit-title').textContent = isNew ? 'Add New Case File' : 'Edit Case File';
    document.getElementById('case-edit-breadcrumb-action').textContent = isNew ? 'Add' : 'Edit';
    document.getElementById('case-edit-cancel').href = isNew ? '#cases' : `#case-view/${caseId}`;
    document.getElementById('case-edit-breadcrumb-case').classList.toggle('hidden', isNew);
    document.getElementById('case-edit-breadcrumb-slash').classList.toggle('hidden', isNew);
  
    if (!isNew) {
        const caseData = state.casesMap.get(caseId);
        if (!caseData) { window.location.hash = '#cases'; return; }
        document.getElementById('case-edit-breadcrumb-case').textContent = caseData.caseName;
        document.getElementById('case-edit-breadcrumb-case').href = `#case-view/${caseId}`;
        document.getElementById('case-edit-name').value = caseData.caseName;
        document.getElementById('case-edit-client').value = caseData.clientId;
        document.getElementById('case-edit-status').value = caseData.status;
        document.getElementById('case-edit-description').value = caseData.description || '';
    }
    // Trigger initial preview render
    DOMElements.caseEditDescription.dispatchEvent(new Event('input'));
}

export function unsubscribeCases() {
    if (unsubscribeFromCases) unsubscribeFromCases();
    if (unsubscribeFromRecentCases) unsubscribeFromRecentCases();
}
