import { db, storage } from './firebase.js';
import { collection, doc, query, where, orderBy, onSnapshot, getDoc, getDocs, updateDoc, addDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";
import { state, notifyDocumentsUpdated } from './state.js';
import { DOMElements } from './dom.js';
import { CONSTANTS, setButtonLoading, setUploadProgress, hideError, showError, closeModal, renderTableSkeleton, renderEmptyState, renderTableError, escapeHTML, formatDate, formatBytes, shortType, typeBadgeClass, fileTypeIcon, showConfirmation } from './utils.js';

let unsubscribeFromDocuments = null;

export function listenForDocumentChanges() {
    if (unsubscribeFromDocuments) unsubscribeFromDocuments();
    const q = query(collection(db, 'documents'), where("userId", "==", state.currentUserId), orderBy('uploadedAt', 'desc'));
    unsubscribeFromDocuments = onSnapshot(q, snapshot => {
        state.documentsMap.clear();
        snapshot.forEach(doc => state.documentsMap.set(doc.id, { id: doc.id, ...doc.data() }));
        state.initialDataLoaded.documents = true;
        
        notifyDocumentsUpdated();
        renderDocumentsTable();
        updateDocumentStats();
    }, error => {
        console.error("Error loading documents:", error);
        renderTableError(DOMElements.documentsTableBody, 6, "Could not load documents. Check permissions or database rules.");
    });
}

export function updateDocumentStats() {
    const totalDocsStat = document.getElementById('total-docs-stat');
    if (totalDocsStat) totalDocsStat.textContent = state.documentsMap.size;
}

export function renderDocumentsTable() {
    if (!state.initialDataLoaded.documents) { renderTableSkeleton(DOMElements.documentsTableBody, 6, 5); return; }
    if (DOMElements.documentsTableContainer.querySelector('#empty-state')) DOMElements.documentsTableContainer.querySelector('#empty-state').remove();

    const docs = [...state.documentsMap.values()]
      .filter(d => state.documentsFilter.caseId === 'all' || d.caseId === state.documentsFilter.caseId)
      .filter(d => {
          const q = state.documentsFilter.search.toLowerCase().trim();
          if (!q) return true;
          return (d.name || '').toLowerCase().includes(q) || (d.contentType || '').toLowerCase().includes(q);
      });

    if (docs.length === 0) {
        renderEmptyState(DOMElements.documentsTableContainer, DOMElements.documentsTableBody, "No Documents Found", "Upload your first document to see it listed here.", "add-document-button");
        return;
    }

    const fragment = document.createDocumentFragment();
    docs.forEach(d => {
        const caseName = state.casesMap.get(d.caseId)?.caseName || 'Unlinked';
        const row = document.createElement('tr');
        row.className = "hover:bg-gray-50";
        row.innerHTML = `<td class="px-6 py-4 whitespace-nowrap"><div class="flex items-center"><div class="h-10 w-10 flex-shrink-0"><span class="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">${fileTypeIcon(d.contentType)}</span></div><div class="ml-4"><div class="text-sm font-medium text-gray-900">${escapeHTML(d.name || 'Untitled')}</div><div class="text-xs text-gray-500">${escapeHTML(d.storagePath || '')}</div></div></div></td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${escapeHTML(caseName)}</td><td class="px-6 py-4 whitespace-nowrap"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeBadgeClass(d.contentType)}">${escapeHTML(shortType(d.contentType))}</span></td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatBytes(d.size)}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(d.uploadedAt)}</td><td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button class="text-purple-600 hover:text-purple-900 mr-4 download-document-btn" data-id="${d.id}">Download</button><button class="text-red-600 hover:text-red-900 delete-document-btn" data-id="${d.id}">Delete</button></td>`;
        fragment.appendChild(row);
    });
    DOMElements.documentsTableBody.innerHTML = '';
    DOMElements.documentsTableBody.appendChild(fragment);
}

export function populateDocumentCaseFilter() { 
    if(!DOMElements.documentsFilterCase) return;
    const current = DOMElements.documentsFilterCase.value || 'all'; 
    DOMElements.documentsFilterCase.innerHTML = `<option value="all">All cases</option>`;
    [...state.casesMap.values()].sort((a, b) => a.caseName.localeCompare(b.caseName)).forEach(c => DOMElements.documentsFilterCase.insertAdjacentHTML('beforeend', `<option value="${c.id}">${escapeHTML(c.caseName)}</option>`)); 
    DOMElements.documentsFilterCase.value = current; 
}

export function populateDocumentCaseSelect(selectedId = '') { 
    if(!DOMElements.documentCaseSelect) return;
    DOMElements.documentCaseSelect.innerHTML = '<option value="">Select a case...</option>'; 
    if (state.casesMap.size === 0) { 
        DOMElements.documentCaseSelect.insertAdjacentHTML('beforeend', '<option value="" disabled>No cases. Add a case first.</option>'); 
        return; 
    } 
    [...state.casesMap.values()].sort((a, b) => a.caseName.localeCompare(b.caseName)).forEach(c => DOMElements.documentCaseSelect.insertAdjacentHTML('beforeend', `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${escapeHTML(c.caseName)}</option>`)); 
    DOMElements.documentCaseSelect.value = selectedId || ''; 
}

export async function handleDocumentFormSubmit(e) {
    e.preventDefault(); if (!state.currentUserId) return;
    const file = DOMElements.documentFileInput.files[0];
    const caseId = DOMElements.documentCaseSelect.value;
    hideError(DOMElements.documentFormError);
    if (!file || !caseId) { showError(DOMElements.documentFormError, "Please select a file and link it to a case."); return; }
  
    setButtonLoading(DOMElements.saveDocumentButton, true, CONSTANTS.UPLOAD_DOCUMENT_TEXT);
    setUploadProgress(DOMElements.documentUploadProgress, 0);
  
    try {
        const docRef = await addDoc(collection(db, 'documents'), {
            userId: state.currentUserId,
            caseId,
            name: file.name,
            size: file.size,
            contentType: file.type || 'application/octet-stream',
            uploadedAt: serverTimestamp()
        });
  
        const path = `documents/${state.currentUserId}/${docRef.id}/${file.name}`;
        const sRef = storageRef(storage, path);
        const task = uploadBytesResumable(sRef, file, { contentType: file.type });
  
        await new Promise((resolve, reject) => {
            task.on('state_changed', (snap) => {
                const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                setUploadProgress(DOMElements.documentUploadProgress, pct);
            }, reject, resolve);
        });
  
        const downloadURL = await getDownloadURL(sRef);
        await updateDoc(docRef, { storagePath: path, downloadURL });
  
        closeModal(DOMElements.documentModal);
        DOMElements.documentForm.reset();
        setUploadProgress(DOMElements.documentUploadProgress, 0);
    } catch (error) {
        console.error("Upload failed:", error);
        showError(DOMElements.documentFormError, "Failed to upload document. Please try again.");
    } finally {
        setButtonLoading(DOMElements.saveDocumentButton, false, CONSTANTS.UPLOAD_DOCUMENT_TEXT);
    }
}

export async function handleDocumentDelete(documentId) {
    const onConfirm = async () => {
        try {
            const dRef = doc(db, 'documents', documentId);
            const snap = await getDoc(dRef);
            const data = snap.data();
            if (data?.storagePath) {
                try { await deleteObject(storageRef(storage, data.storagePath)); } catch (e) { console.warn('Storage delete failed', e); }
            }
            await deleteDoc(dRef);
        } catch (error) {
            console.error("Error deleting document:", error);
            showConfirmation("Error", "Failed to delete document.", () => { }, true);
        }
    };
    showConfirmation("Delete Document?", "This will permanently delete this document. This cannot be undone.", onConfirm);
}
  
export async function handleDocumentDownload(documentId) {
    try {
        const docSnap = await getDoc(doc(db, 'documents', documentId));
        const data = docSnap.data();
        if (data?.downloadURL) { window.open(data.downloadURL, '_blank', 'noopener'); }
        else { throw new Error('No download URL available.'); }
    } catch (error) {
        console.error("Download failed:", error);
        showConfirmation("Error", "Unable to download this document.", () => { }, true);
    }
}

export function unsubscribeDocuments() {
    if (unsubscribeFromDocuments) unsubscribeFromDocuments();
}
