
// --- IMPORTS ---

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, addDoc, onSnapshot, query, where, updateDoc, deleteDoc, Timestamp, serverTimestamp, writeBatch, orderBy, limit } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

// --- FIREBASE CONFIG & INITIALIZATION ---
const firebaseConfig = { apiKey: "AIzaSyCqBlHjmayoGIvlLJD58yR6phsHzLtjAH4", authDomain: "sinc-c6b24.firebaseapp.com", projectId: "sinc-c6b24", storageBucket: "sinc-c6b24.appspot.com", appId: "1:547513001470:web:7c37b34318c0ee0709ccaf" };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- DOM ELEMENT SELECTORS ---
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const DOMElements = {
  // User info displays
  welcomeMessage: $('#welcome-message'),
  userNameDisplay: $('#user-name-display'), userEmailDisplay: $('#user-email-display'), userAvatarDisplay: $('#user-avatar-display'),
  userAvatarButton: $('#user-avatar-button'), dropdownUserName: $('#dropdown-user-name'), dropdownUserEmail: $('#dropdown-user-email'),
  // Layout & Navigation
  sidebar: $('#sidebar'), overlay: $('#overlay'), userDropdownMenu: $('#user-dropdown-menu'),
  // Modals & Forms
  clientModal: $('#client-modal'), clientForm: $('#client-form'), clientFormError: $('#client-form-error'), saveClientButton: $('#save-client-button'),
  confirmationModal: $('#confirmation-modal'), confirmationTitle: $('#confirmation-title'), confirmationMessage: $('#confirmation-message'), confirmationConfirmBtn: $('#confirmation-confirm-btn'),
  // Tables
  clientsTableBody: $('#clients-table-body'), clientsTableContainer: $('#clients-table-container'),
  casesTableBody: $('#cases-table-body'), casesTableContainer: $('#cases-table-container'),
  // Profile Page
  profileForm: $('#profile-form'), profileNameInput: $('#profile-name'), profileEmailInput: $('#profile-email'),
  saveProfileButton: $('#save-profile-button'), profileFormFeedback: $('#profile-form-feedback'),
  // Documents
  addDocumentButton: $('#add-document-button'),
  documentsTableBody: $('#documents-table-body'), documentsTableContainer: $('#documents-table-container'),
  documentsFilterCase: $('#documents-filter-case'), documentsSearch: $('#documents-search'),
  documentModal: $('#document-modal'), documentForm: $('#document-form'), documentFormError: $('#document-form-error'),
  documentCaseSelect: $('#document-case-select'), documentFileInput: $('#document-file-input'),
  saveDocumentButton: $('#save-document-button'), documentUploadProgress: $('#document-upload-progress'),
  // Case Edit Page
  caseEditForm: $('#case-edit-form'), caseEditError: $('#case-edit-error'), saveCaseButton: $('#case-edit-save'),
  caseEditDescription: $('#case-edit-description'), caseEditPreview: $('#case-edit-preview'),
  caseEditPreviewLength: $('#case-edit-preview-length'),
  // Calendar
  addEventButton: $('#add-event-button'),
  eventModal: $('#event-modal'), eventForm: $('#event-form'), eventFormError: $('#event-form-error'), saveEventButton: $('#save-event-button'),
  calendarMonth: $('#calendar-month'), calendarGrid: $('#calendar-grid'),
  calendarPrev: $('#calendar-prev'), calendarNext: $('#calendar-next'),
  upcomingEventsList: $('#upcoming-events-list'),
  // Settings
  billingSettingsForm: $('#billing-settings-form'),
  defaultHourlyRate: $('#default-hourly-rate'),
  saveBillingSettings: $('#save-billing-settings'),
  billingSettingsFeedback: $('#billing-settings-feedback')
};

// --- GLOBAL STATE & CONSTANTS ---
let currentUserId = null, unsubscribeFromClients = null, unsubscribeFromCases = null, unsubscribeFromRecentCases = null, unsubscribeFromDocuments = null, unsubscribeFromEvents = null;
let clientsMap = new Map(), casesMap = new Map(), documentsMap = new Map(), eventsMap = new Map();
let initialClientFormData = '', initialDataLoaded = { clients: false, cases: false, documents: false, events: false };
let documentsFilter = { caseId: 'all', search: '' };
let currentCalendarDate = new Date();

const CONSTANTS = {
  DEFAULT_AVATAR_SVG: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NkZTVmMyI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyYzAgMS4xLjkgMiAyIDJoMTRjMS4xIDAgMi0uOSAyLTJ2LTJjMC0yLjY2LTUuMzMtNC04LTR6Ii8+PC9zdmc+",
  SPINNER_SVG: `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`,
  SAVE_CLIENT_TEXT: "Save Client", SAVE_CASE_TEXT: "Save Changes", SAVE_PROFILE_TEXT: "Save Changes", UPLOAD_DOCUMENT_TEXT: "Upload", SAVE_EVENT_TEXT: "Save Event",
  SAVE_BILLING_SETTINGS_TEXT: "Save Settings"
};

// --- CORE APPLICATION LOGIC ---
onAuthStateChanged(auth, user => {
  if (user) handleUserAuthenticated(user);
  else window.location.href = 'index.html';
});

async function handleUserAuthenticated(user) {
  currentUserId = user.uid;
  document.body.style.display = '';

  const userDocRef = doc(db, "users", user.uid);
  const userProfile = {
    email: user.email,
    lastLogin: Timestamp.fromDate(new Date()),
    ...(user.displayName && { name: user.displayName }),
    ...(user.photoURL && { photoURL: user.photoURL })
  };
  await setDoc(userDocRef, userProfile, { merge: true });

  const finalProfileSnap = await getDoc(userDocRef);
  const finalProfile = finalProfileSnap.data() || {};

  updateUserInfoUI(finalProfile.name || 'New User', user.email, finalProfile.photoURL);

  if (finalProfile.defaultHourlyRate) {
    DOMElements.defaultHourlyRate.value = finalProfile.defaultHourlyRate;
  }

  initDashboard(user.uid);
}

function initDashboard(userId) {
  initUI();
  initEventListeners();
  listenForClientChanges(userId);
  listenForCaseChanges(userId);
  listenForRecentCases(userId);
  listenForDocumentChanges(userId);
  listenForEventChanges(userId);

  // Initialize the time tracker since its HTML is now static on the page
  const dependencies = {
    db,
    auth,
    getCasesMap: () => casesMap,
    getFirestoreModules: () => ({
      collection, doc, addDoc, onSnapshot, query, where, orderBy, deleteDoc, serverTimestamp
    })
  };
  initTimeTracker(dependencies);
}

function handleLogout() {
  [unsubscribeFromClients, unsubscribeFromCases, unsubscribeFromRecentCases, unsubscribeFromDocuments, unsubscribeFromEvents].forEach(unsub => unsub && unsub());
  signOut(auth).catch(error => console.error("Logout Error:", error));
}

// --- FIRESTORE LISTENERS ---
function listenForClientChanges(userId) {
  if (unsubscribeFromClients) unsubscribeFromClients();
  const q = query(collection(db, 'clients'), where("userId", "==", userId));
  unsubscribeFromClients = onSnapshot(q, snapshot => {
    clientsMap.clear();
    snapshot.forEach(doc => clientsMap.set(doc.id, { id: doc.id, ...doc.data() }));
    initialDataLoaded.clients = true;
    renderClientsTable();
    updateStatsAndCounts();
    if (initialDataLoaded.cases) renderCasesTable();
    if (initialDataLoaded.clients) renderClientsTable(); // Re-render to update case counts
  }, error => {
    console.error(`Error loading clients:`, error);
    renderTableError(DOMElements.clientsTableBody, 4, "Could not load clients.");
  });
}

function listenForCaseChanges(userId) {
  if (unsubscribeFromCases) unsubscribeFromCases();
  const q = query(collection(db, 'cases'), where("userId", "==", userId), orderBy('updatedAt', 'desc'));
  unsubscribeFromCases = onSnapshot(q, snapshot => {
    casesMap.clear();
    snapshot.forEach(doc => casesMap.set(doc.id, { id: doc.id, ...doc.data() }));

    // Fire an event to notify other modules (like Time Tracker) that cases have been updated
    window.dispatchEvent(new CustomEvent('casesUpdated', { detail: casesMap }));

    initialDataLoaded.cases = true;
    renderCasesTable();
    updateStatsAndCounts();
    populateDocumentCaseFilter();
    populateDocumentCaseSelect();
    if (initialDataLoaded.clients) renderClientsTable(); // Re-render to update case counts
  }, error => {
    console.error(`Error loading cases:`, error);
    renderTableError(DOMElements.casesTableBody, 5, "Could not load cases. A database index is likely required.");
  });
}

function listenForRecentCases(userId) {
  if (unsubscribeFromRecentCases) unsubscribeFromRecentCases();
  const q = query(collection(db, 'cases'), where("userId", "==", userId), orderBy('updatedAt', 'desc'), limit(5));
  unsubscribeFromRecentCases = onSnapshot(q, snapshot => {
    const recentCases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderRecentActivity(recentCases);
  }, error => {
    console.error("Error listening to recent cases:", error);
    $('#recent-activity-list').innerHTML = `<div class="text-center py-8 text-red-500">Could not load recent activity. A database index may be required.</div>`;
  });
}

function listenForDocumentChanges(userId) {
  if (unsubscribeFromDocuments) unsubscribeFromDocuments();
  const q = query(collection(db, 'documents'), where("userId", "==", userId), orderBy('uploadedAt', 'desc'));
  unsubscribeFromDocuments = onSnapshot(q, snapshot => {
    documentsMap.clear();
    snapshot.forEach(doc => documentsMap.set(doc.id, { id: doc.id, ...doc.data() }));
    initialDataLoaded.documents = true;
    renderDocumentsTable();
    updateStatsAndCounts();
  }, error => {
    console.error("Error loading documents:", error);
    renderTableError(DOMElements.documentsTableBody, 6, "Could not load documents. Check permissions or database rules.");
  });
}

function listenForEventChanges(userId) {
  if (unsubscribeFromEvents) unsubscribeFromEvents();
  const q = query(collection(db, 'events'), where("userId", "==", userId), orderBy('date', 'asc'));
  unsubscribeFromEvents = onSnapshot(q, snapshot => {
    eventsMap.clear();
    snapshot.forEach(doc => eventsMap.set(doc.id, { id: doc.id, ...doc.data() }));
    initialDataLoaded.events = true;
    renderCalendar();
    renderUpcomingEvents();
    const upcomingCount = [...eventsMap.values()].filter(e => e.date.toDate() > new Date()).length;
    $('#calendar-notification').textContent = upcomingCount;
    $('#calendar-notification').classList.toggle('hidden', upcomingCount === 0);
  }, error => {
    console.error("Error loading events:", error);
  });
}

// --- FORM & DATA HANDLERS ---
const getClientFormData = () => ({ name: $('#client-name-input').value.trim(), email: $('#client-email-input').value.trim().toLowerCase(), type: $('#client-type-select').value });

async function handleClientFormSubmit(e) {
  e.preventDefault(); if (!currentUserId) return;
  setButtonLoading(DOMElements.saveClientButton, true, CONSTANTS.SAVE_CLIENT_TEXT); hideError(DOMElements.clientFormError);
  const clientId = $('#client-id-input').value.trim(), clientData = { ...getClientFormData(), userId: currentUserId };
  try {
    const clientsRef = collection(db, 'clients'), emailQuery = query(clientsRef, where("userId", "==", currentUserId), where("email", "==", clientData.email));
    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty && emailSnapshot.docs.some(doc => doc.id !== clientId)) throw new Error("A client with this email already exists.");
    if (clientId) await updateDoc(doc(db, 'clients', clientId), clientData); else await addDoc(clientsRef, clientData);
    closeModal(DOMElements.clientModal);
  } catch (error) {
    showError(DOMElements.clientFormError, error.message || "Failed to save client.");
  } finally { setButtonLoading(DOMElements.saveClientButton, false, CONSTANTS.SAVE_CLIENT_TEXT); }
}

async function handleCaseEditFormSubmit(e) {
  e.preventDefault(); if (!currentUserId) return;
  setButtonLoading(DOMElements.saveCaseButton, true, CONSTANTS.SAVE_CASE_TEXT);
  hideError(DOMElements.caseEditError);

  const caseId = $('#case-edit-id').value.trim();
  const caseData = {
    caseName: $('#case-edit-name').value.trim(),
    clientId: $('#case-edit-client').value,
    status: $('#case-edit-status').value,
    description: $('#case-edit-description').value.trim(),
    userId: currentUserId,
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

async function handleProfileFormSubmit(e) {
  e.preventDefault(); if (!auth.currentUser) return;
  setButtonLoading(DOMElements.saveProfileButton, true, CONSTANTS.SAVE_PROFILE_TEXT);
  DOMElements.profileFormFeedback.textContent = ''; DOMElements.profileFormFeedback.className = 'text-sm';

  const newName = DOMElements.profileNameInput.value.trim();
  try {
    await updateProfile(auth.currentUser, { displayName: newName });
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userDocRef, { name: newName });

    updateUserInfoUI(newName, auth.currentUser.email, auth.currentUser.photoURL);
    DOMElements.profileFormFeedback.textContent = 'Profile updated successfully!';
    DOMElements.profileFormFeedback.classList.add('text-green-600');
  } catch (error) {
    console.error("Error updating profile:", error);
    DOMElements.profileFormFeedback.textContent = 'Failed to update profile. Please try again.';
    DOMElements.profileFormFeedback.classList.add('text-red-600');
  } finally {
    setButtonLoading(DOMElements.saveProfileButton, false, CONSTANTS.SAVE_PROFILE_TEXT);
  }
}

async function handleBillingSettingsFormSubmit(e) {
  e.preventDefault();
  setButtonLoading(DOMElements.saveBillingSettings, true, CONSTANTS.SAVE_BILLING_SETTINGS_TEXT);
  DOMElements.billingSettingsFeedback.textContent = '';
  DOMElements.billingSettingsFeedback.className = 'text-sm';

  const defaultRate = parseFloat(DOMElements.defaultHourlyRate.value) || 0;

  try {
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userDocRef, { defaultHourlyRate: defaultRate });
    DOMElements.billingSettingsFeedback.textContent = 'Billing settings updated successfully!';
    DOMElements.billingSettingsFeedback.classList.add('text-green-600');
  } catch (error) {
    console.error("Error updating billing settings:", error);
    DOMElements.billingSettingsFeedback.textContent = 'Failed to update billing settings. Please try again.';
    DOMElements.billingSettingsFeedback.classList.add('text-red-600');
  } finally {
    setButtonLoading(DOMElements.saveBillingSettings, false, CONSTANTS.SAVE_BILLING_SETTINGS_TEXT);
  }
}

async function handleClientDelete(clientId) {
  const onConfirm = async () => {
    try {
      const casesQuery = query(collection(db, 'cases'), where('clientId', '==', clientId), where('userId', '==', currentUserId));
      const casesSnapshot = await getDocs(casesQuery);
      const batch = writeBatch(db);
      casesSnapshot.forEach(docSnap => batch.delete(docSnap.ref));
      batch.delete(doc(db, 'clients', clientId));
      await batch.commit();
      // Note: Documents linked to deleted cases are not auto-deleted here. Consider back-end cleanup.
    } catch (error) { console.error("Error deleting client:", error); showConfirmation("Error", "Failed to delete client.", () => { }, true); }
  };
  showConfirmation("Delete Client?", "This will permanently delete the client and all associated cases. This cannot be undone.", onConfirm);
}

async function handleCaseDelete(caseId) {
  const onConfirm = async () => {
    try {
      // Delete documents linked to this case (storage + firestore)
      const docsQuery = query(collection(db, 'documents'), where('userId', '==', currentUserId), where('caseId', '==', caseId));
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

async function handleDocumentFormSubmit(e) {
  e.preventDefault(); if (!currentUserId) return;
  const file = DOMElements.documentFileInput.files[0];
  const caseId = DOMElements.documentCaseSelect.value;
  hideError(DOMElements.documentFormError);
  if (!file || !caseId) { showError(DOMElements.documentFormError, "Please select a file and link it to a case."); return; }

  setButtonLoading(DOMElements.saveDocumentButton, true, CONSTANTS.UPLOAD_DOCUMENT_TEXT);
  setUploadProgress(0);

  try {
    // Create Firestore doc first to obtain an ID
    const docRef = await addDoc(collection(db, 'documents'), {
      userId: currentUserId,
      caseId,
      name: file.name,
      size: file.size,
      contentType: file.type || 'application/octet-stream',
      uploadedAt: serverTimestamp()
    });

    const path = `documents/${currentUserId}/${docRef.id}/${file.name}`;
    const sRef = storageRef(storage, path);
    const task = uploadBytesResumable(sRef, file, { contentType: file.type });

    await new Promise((resolve, reject) => {
      task.on('state_changed', (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        setUploadProgress(pct);
      }, reject, resolve);
    });

    const downloadURL = await getDownloadURL(sRef);
    await updateDoc(docRef, { storagePath: path, downloadURL });

    closeModal(DOMElements.documentModal);
    DOMElements.documentForm.reset();
    setUploadProgress(0);
  } catch (error) {
    console.error("Upload failed:", error);
    showError(DOMElements.documentFormError, "Failed to upload document. Please try again.");
  } finally {
    setButtonLoading(DOMElements.saveDocumentButton, false, CONSTANTS.UPLOAD_DOCUMENT_TEXT);
  }
}

async function handleDocumentDelete(documentId) {
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

async function handleDocumentDownload(documentId) {
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

async function handleEventFormSubmit(e) {
  e.preventDefault();
  setButtonLoading(DOMElements.saveEventButton, true, CONSTANTS.SAVE_EVENT_TEXT);
  hideError(DOMElements.eventFormError);
  const eventId = $('#event-id-input').value.trim();
  const eventData = {
    title: $('#event-title-input').value.trim(),
    date: Timestamp.fromDate(new Date($('#event-date-input').value)),
    caseId: $('#event-case-select').value || null,
    description: $('#event-description-input').value.trim(),
    userId: currentUserId
  };
  if (!eventData.title || !$('#event-date-input').value) {
    showError(DOMElements.eventFormError, "Title and Date are required.");
    setButtonLoading(DOMElements.saveEventButton, false, CONSTANTS.SAVE_EVENT_TEXT);
    return;
  }
  try {
    if (eventId) {
      await updateDoc(doc(db, 'events', eventId), eventData);
    } else {
      await addDoc(collection(db, 'events'), eventData);
    }
    closeModal(DOMElements.eventModal);
  } catch (error) {
    console.error("Error saving event:", error);
    showError(DOMElements.eventFormError, "Failed to save event.");
  } finally {
    setButtonLoading(DOMElements.saveEventButton, false, CONSTANTS.SAVE_EVENT_TEXT);
  }
}

// --- UI & RENDERING ---
function initUI() { initSidebar(); initRouter(); }

function initSidebar() { const toggle = () => { DOMElements.sidebar.classList.toggle('-translate-x-full'); DOMElements.overlay.classList.toggle('hidden'); }; $('#menu-toggle').addEventListener('click', toggle); $('#close-sidebar').addEventListener('click', toggle); DOMElements.overlay.addEventListener('click', toggle); }
function initRouter() {
  const route = () => {
    const [path, id] = window.location.hash.substring(1).split('/');
    const targetId = path || 'dashboard';
    $$('.content-section').forEach(s => s.classList.toggle('hidden', s.id !== targetId));
    $$('.sidebar-link').forEach(l => l.classList.toggle('active', l.dataset.target === targetId));

    if (targetId === 'case-view' && id) renderCaseViewPage(id);
    else if (targetId === 'case-edit') renderCaseEditPage(id || 'new');

    if (window.innerWidth < 1024 && !DOMElements.sidebar.classList.contains('-translate-x-full')) {
      DOMElements.sidebar.classList.add('-translate-x-full'); DOMElements.overlay.classList.add('hidden');
    }
    window.scrollTo(0, 0);
  };
  window.addEventListener('hashchange', route);
  route(); // Initial route call
}

function updateUserInfoUI(name, email, photoURL) {
  const avatar = photoURL || CONSTANTS.DEFAULT_AVATAR_SVG;
  DOMElements.welcomeMessage.textContent = `Welcome back, ${name.split(' ')[0]}! 👋`;
  DOMElements.userNameDisplay.textContent = name;
  DOMElements.userNameDisplay.classList.remove('anim-pulse', 'bg-gray-200', 'w-24', 'h-4');
  DOMElements.userEmailDisplay.textContent = email;
  DOMElements.userAvatarDisplay.src = avatar;
  DOMElements.userAvatarButton.src = avatar;
  DOMElements.dropdownUserName.textContent = name;
  DOMElements.dropdownUserEmail.textContent = email;
  DOMElements.profileNameInput.value = name;
  DOMElements.profileEmailInput.value = email;
}

function updateStatsAndCounts() {
  $('#total-clients-stat').textContent = clientsMap.size;
  $('#total-cases-stat').textContent = casesMap.size;
  $('#active-cases-stat').textContent = [...casesMap.values()].filter(c => c.status !== 'Closed').length;
  $('#total-docs-stat').textContent = documentsMap.size;
  // Update sidebar counts
  $('#sidebar-case-count').textContent = casesMap.size;
  $('#sidebar-client-count').textContent = clientsMap.size;
}

function renderRecentActivity(recentCases) {
  const listEl = $('#recent-activity-list');
  listEl.innerHTML = '';
  if (recentCases.length === 0) { listEl.innerHTML = `<div class="text-center py-8 text-gray-500">No recent activity.</div>`; return; }
  const fragment = document.createDocumentFragment();
  recentCases.forEach(caseData => {
    const clientName = clientsMap.get(caseData.clientId)?.name || 'Unknown Client';
    const item = document.createElement('a');
    item.href = `#case-view/${caseData.id}`;
    item.className = 'flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors';
    item.innerHTML = `<div><p class="font-medium text-gray-800">${escapeHTML(caseData.caseName)}</p><p class="text-sm text-gray-500">Client: ${escapeHTML(clientName)}</p></div><div class="text-right"><p class="text-sm text-gray-500">${formatDate(caseData.updatedAt)}</p><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(caseData.status)}">${caseData.status}</span></div>`;
    fragment.appendChild(item);
  });
  listEl.appendChild(fragment);
}

function renderClientsTable() {
  if (!initialDataLoaded.clients) { renderTableSkeleton(DOMElements.clientsTableBody, 4, 5); return; }
  if (DOMElements.clientsTableContainer.querySelector('#empty-state')) DOMElements.clientsTableContainer.querySelector('#empty-state').remove();
  if (clientsMap.size === 0) { renderEmptyState(DOMElements.clientsTableContainer, DOMElements.clientsTableBody, "No Clients Found", "Get started by adding your first client.", "add-client-button"); return; }
  const fragment = document.createDocumentFragment();
  [...clientsMap.values()].sort((a, b) => a.name.localeCompare(b.name)).forEach(client => {
    const activeCasesCount = [...casesMap.values()].filter(c => c.clientId === client.id && c.status !== 'Closed').length;
    const row = document.createElement('tr');
    row.className = "hover:bg-gray-50";
    row.innerHTML = `<td class="px-6 py-4 whitespace-nowrap"><div class="flex items-center"><div class="h-10 w-10 flex-shrink-0"><span class="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center"><span class="text-sky-800 font-medium">${escapeHTML(client.name.charAt(0).toUpperCase())}</span></span></div><div class="ml-4"><div class="text-sm font-medium text-gray-900">${escapeHTML(client.name)}</div><div class="text-sm text-gray-500">${escapeHTML(client.email)}</div></div></div></td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHTML(client.type)}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${activeCasesCount} Active</td><td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button class="text-sky-600 hover:text-sky-900 edit-client-btn" data-id="${client.id}">Edit</button><button class="text-red-600 hover:text-red-900 ml-4 delete-client-btn" data-id="${client.id}">Delete</button></td>`;
    fragment.appendChild(row);
  });
  DOMElements.clientsTableBody.innerHTML = '';
  DOMElements.clientsTableBody.appendChild(fragment);
}

function renderCasesTable() {
  if (!initialDataLoaded.cases) { renderTableSkeleton(DOMElements.casesTableBody, 5, 5); return; }
  if (DOMElements.casesTableContainer.querySelector('#empty-state')) DOMElements.casesTableContainer.querySelector('#empty-state').remove();
  if (casesMap.size === 0) { renderEmptyState(DOMElements.casesTableContainer, DOMElements.casesTableBody, "No Case Files Found", "Add your first case file to see it here.", "add-case-button"); return; }
  const fragment = document.createDocumentFragment();
  [...casesMap.values()].forEach(caseData => {
    const clientInfo = clientsMap.get(caseData.clientId) || { name: 'Unknown Client' };
    const row = document.createElement('tr');
    row.className = "hover:bg-gray-50";
    row.innerHTML = `<td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-medium text-gray-900">${escapeHTML(caseData.caseName)}</div><div class="text-sm text-gray-500 max-w-xs truncate">${escapeHTML(caseData.description || 'No description')}</div></td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${escapeHTML(clientInfo.name)}</td><td class="px-6 py-4 whitespace-nowrap"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(caseData.status)}">${caseData.status}</span></td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(caseData.updatedAt)}</td><td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><a href="#case-view/${caseData.id}" class="text-sky-600 hover:text-sky-900">View</a></td>`;
    fragment.appendChild(row);
  });
  DOMElements.casesTableBody.innerHTML = '';
  DOMElements.casesTableBody.appendChild(fragment);
}

function renderDocumentsTable() {
  if (!initialDataLoaded.documents) { renderTableSkeleton(DOMElements.documentsTableBody, 6, 5); return; }
  if (DOMElements.documentsTableContainer.querySelector('#empty-state')) DOMElements.documentsTableContainer.querySelector('#empty-state').remove();

  const docs = [...documentsMap.values()]
    .filter(d => documentsFilter.caseId === 'all' || d.caseId === documentsFilter.caseId)
    .filter(d => {
      const q = documentsFilter.search.toLowerCase().trim();
      if (!q) return true;
      return (d.name || '').toLowerCase().includes(q) || (d.contentType || '').toLowerCase().includes(q);
    });

  if (docs.length === 0) {
    renderEmptyState(DOMElements.documentsTableContainer, DOMElements.documentsTableBody, "No Documents Found", "Upload your first document to see it listed here.", "add-document-button");
    return;
  }

  const fragment = document.createDocumentFragment();
  docs.forEach(d => {
    const caseName = casesMap.get(d.caseId)?.caseName || 'Unlinked';
    const row = document.createElement('tr');
    row.className = "hover:bg-gray-50";
    row.innerHTML = `<td class="px-6 py-4 whitespace-nowrap"><div class="flex items-center"><div class="h-10 w-10 flex-shrink-0"><span class="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">${fileTypeIcon(d.contentType)}</span></div><div class="ml-4"><div class="text-sm font-medium text-gray-900">${escapeHTML(d.name || 'Untitled')}</div><div class="text-xs text-gray-500">${escapeHTML(d.storagePath || '')}</div></div></div></td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${escapeHTML(caseName)}</td><td class="px-6 py-4 whitespace-nowrap"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeBadgeClass(d.contentType)}">${escapeHTML(shortType(d.contentType))}</span></td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatBytes(d.size)}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(d.uploadedAt)}</td><td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button class="text-purple-600 hover:text-purple-900 mr-4 download-document-btn" data-id="${d.id}">Download</button><button class="text-red-600 hover:text-red-900 delete-document-btn" data-id="${d.id}">Delete</button></td>`;
    fragment.appendChild(row);
  });
  DOMElements.documentsTableBody.innerHTML = '';
  DOMElements.documentsTableBody.appendChild(fragment);
}

function renderCaseViewPage(caseId) {
  const caseData = casesMap.get(caseId);
  if (!caseData) { window.location.hash = '#cases'; return; }

  const client = clientsMap.get(caseData.clientId);
  const clientName = client ? client.name : "Unknown Client";

  $('#case-breadcrumb-name').textContent = caseData.caseName;
  $('#case-view-title').textContent = caseData.caseName;
  $('#case-view-client').textContent = clientName;
  $('#case-edit-link').href = `#case-edit/${caseId}`;

  const deleteBtn = $('#case-delete-button');
  deleteBtn.onclick = () => handleCaseDelete(caseId);

  $('#case-view-status').innerHTML = `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(caseData.status)}">${caseData.status}</span>`;
  $('#case-view-client-chip').textContent = clientName;
  $('#case-view-created').textContent = formatDate(caseData.createdAt);
  $('#case-view-updated').textContent = formatDate(caseData.updatedAt);

  const desc = caseData.description || '';
  $('#case-description-length').textContent = `${desc.length} characters`;
  $('#case-view-description').innerHTML = renderRichContent(desc);

  // Populate associated documents
  const associatedDocs = [...documentsMap.values()].filter(d => d.caseId === caseId);
  const docsList = $('#case-associated-documents');
  docsList.innerHTML = '';
  if (associatedDocs.length === 0) {
    docsList.innerHTML = '<li class="text-gray-500">No documents associated yet.</li>';
  } else {
    associatedDocs.forEach(d => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${d.downloadURL}" target="_blank" rel="noopener noreferrer" class="text-sky-600 hover:text-sky-800">${escapeHTML(d.name)}</a> (${shortType(d.contentType)}, ${formatBytes(d.size)})`;
      docsList.appendChild(li);
    });
  }

  // Set up upload button for this case
  $('#upload-for-case-button').onclick = () => {
    DOMElements.documentForm.reset();
    populateDocumentCaseSelect(caseId);
    setUploadProgress(0);
    hideError(DOMElements.documentFormError);
    openModal(DOMElements.documentModal);
  };
}

function renderCaseEditPage(caseId) {
  DOMElements.caseEditForm.reset();
  hideError(DOMElements.caseEditError);
  populateClientDropdownForEdit();

  const isNew = caseId === 'new';
  $('#case-edit-id').value = isNew ? '' : caseId;

  $('#case-edit-title').textContent = isNew ? 'Add New Case File' : 'Edit Case File';
  $('#case-edit-breadcrumb-action').textContent = isNew ? 'Add' : 'Edit';
  $('#case-edit-cancel').href = isNew ? '#cases' : `#case-view/${caseId}`;
  $('#case-edit-breadcrumb-case').classList.toggle('hidden', isNew);
  $('#case-edit-breadcrumb-slash').classList.toggle('hidden', isNew);

  if (!isNew) {
    const caseData = casesMap.get(caseId);
    if (!caseData) { window.location.hash = '#cases'; return; }
    $('#case-edit-breadcrumb-case').textContent = caseData.caseName;
    $('#case-edit-breadcrumb-case').href = `#case-view/${caseId}`;
    $('#case-edit-name').value = caseData.caseName;
    $('#case-edit-client').value = caseData.clientId;
    $('#case-edit-status').value = caseData.status;
    $('#case-edit-description').value = caseData.description || '';
  }
  // Trigger initial preview render
  DOMElements.caseEditDescription.dispatchEvent(new Event('input'));
}

function renderCalendar() {
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth();
  DOMElements.calendarMonth.textContent = currentCalendarDate.toLocaleString('default', { month: 'long' }) + ' ' + year;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  DOMElements.calendarGrid.innerHTML = '';
  // Add empty cells
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'bg-white p-2';
    DOMElements.calendarGrid.appendChild(empty);
  }
  // Group events by date
  const eventsByDate = {};
  eventsMap.forEach(event => {
    const dateStr = event.date.toDate().toDateString();
    if (!eventsByDate[dateStr]) eventsByDate[dateStr] = [];
    eventsByDate[dateStr].push(event);
  });
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toDateString();
    const dayEvents = eventsByDate[dateStr] || [];
    const cell = document.createElement('div');
    cell.className = 'bg-white p-2 min-h-[80px] relative hover:bg-gray-50 cursor-pointer';
    cell.dataset.date = date.toISOString().split('T')[0];
    cell.innerHTML = `<span class="absolute top-1 right-2 text-sm font-medium ${date.getDate() === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear() ? 'bg-sky-100 text-sky-800 rounded-full px-2' : 'text-gray-800'}">${day}</span>`;
    if (dayEvents.length > 0) {
      const dots = document.createElement('div');
      dots.className = 'flex justify-start mt-6';
      const maxDots = Math.min(dayEvents.length, 3);
      for (let i = 0; i < maxDots; i++) {
        dots.innerHTML += '<span class="h-2 w-2 rounded-full bg-sky-500 mr-1"></span>';
      }
      if (dayEvents.length > 3) {
        dots.innerHTML += `<span class="text-xs text-gray-500">+${dayEvents.length - 3}</span>`;
      }
      cell.appendChild(dots);
    }
    DOMElements.calendarGrid.appendChild(cell);
  }
}

function renderUpcomingEvents() {
  const list = DOMElements.upcomingEventsList;
  list.innerHTML = '';
  const now = new Date();
  const upcoming = [...eventsMap.values()].filter(e => e.date.toDate() >= now).sort((a, b) => a.date.seconds - b.date.seconds);
  if (upcoming.length === 0) {
    list.innerHTML = '<p class="text-center text-gray-500">No upcoming events.</p>';
    return;
  }
  upcoming.forEach(event => {
    const caseName = event.caseId ? casesMap.get(event.caseId)?.caseName || 'Unknown' : 'None';
    const item = document.createElement('div');
    item.className = 'border-b pb-4 last:border-0';
    item.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-medium text-gray-800">${escapeHTML(event.title)}</p>
                            <p class="text-sm text-gray-500">${formatDate(event.date)}</p>
                            <p class="text-sm text-gray-500">Case: ${escapeHTML(caseName)}</p>
                        </div>
                        <div class="flex gap-2">
                            <button class="text-sky-600 hover:text-sky-900 edit-event-btn" data-id="${event.id}">Edit</button>
                            <button class="text-red-600 hover:text-red-900 delete-event-btn" data-id="${event.id}">Delete</button>
                        </div>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">${escapeHTML(event.description || 'No description')}</p>
                `;
    list.appendChild(item);
  });
}

// --- MODAL & UI HELPERS ---
function openModal(modalEl) { modalEl.classList.remove('hidden'); setTimeout(() => { modalEl.firstElementChild.classList.remove('scale-95', 'opacity-0'); modalEl.classList.remove('opacity-0'); }, 10); }
function closeModal(modalEl) { modalEl.firstElementChild.classList.add('scale-95', 'opacity-0'); modalEl.classList.add('opacity-0'); setTimeout(() => { modalEl.classList.add('hidden'); }, 300); }
function showConfirmation(title, message, onConfirm, isError = false) { DOMElements.confirmationTitle.textContent = title; DOMElements.confirmationMessage.innerHTML = message; DOMElements.confirmationConfirmBtn.className = isError ? 'px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700' : 'px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700'; DOMElements.confirmationConfirmBtn.textContent = isError ? 'OK' : 'Confirm'; openModal(DOMElements.confirmationModal); const confirmHandler = () => { onConfirm(); closeModal(DOMElements.confirmationModal); cleanup(); }; const cancelHandler = () => { closeModal(DOMElements.confirmationModal); cleanup(); }; const cleanup = () => { DOMElements.confirmationConfirmBtn.removeEventListener('click', confirmHandler); $('#confirmation-cancel-btn').removeEventListener('click', cancelHandler); }; DOMElements.confirmationConfirmBtn.addEventListener('click', confirmHandler, { once: true }); $('#confirmation-cancel-btn').addEventListener('click', cancelHandler, { once: true }); }
function showError(el, msg) { el.textContent = msg; el.classList.remove('hidden'); }
function hideError(el) { el.textContent = ''; el.classList.add('hidden'); }
function getStatusClass(s) { const c = { 'Open': 'bg-green-100 text-green-800', 'In Progress': 'bg-yellow-100 text-yellow-800', 'On Hold': 'bg-gray-200 text-gray-800', 'Closed': 'bg-sky-100 text-sky-800' }; return c[s] || 'bg-gray-100 text-gray-800'; }
function setButtonLoading(btn, isLoading, defaultText) { btn.disabled = isLoading; btn.innerHTML = isLoading ? `${CONSTANTS.SPINNER_SVG} Processing...` : defaultText; }
function setUploadProgress(percent) { DOMElements.documentUploadProgress.style.width = `${percent}%`; }
function renderEmptyState(container, tbody, title, subtitle, buttonId) { tbody.innerHTML = ''; if (container.querySelector('#empty-state')) container.querySelector('#empty-state').remove(); container.insertAdjacentHTML('beforeend', `<div id="empty-state" class="text-center py-16 px-6"><svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg><h3 class="mt-2 text-lg font-medium text-gray-900">${title}</h3><p class="mt-1 text-sm text-gray-500">${subtitle}</p><div class="mt-6"><button type="button" data-trigger="${buttonId}" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${buttonId.includes('document') ? 'bg-purple-600 hover:bg-purple-700' : 'bg-sky-600 hover:bg-sky-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 empty-state-btn">+ Add New</button></div></div>`); }
function renderTableSkeleton(tbody, cols, rows) { tbody.innerHTML = Array.from({ length: rows }, () => `<tr class="skeleton-row">${Array.from({ length: cols }, () => `<td class="px-6 py-4"><div class="skeleton loading-skeleton"></div><div class="skeleton-sm loading-skeleton"></div></td>`).join('')}</tr>`).join(''); }
function renderTableError(tbody, colspan, message) { tbody.innerHTML = `<tr><td colspan="${colspan}" class="text-center py-16 px-6"><div class="flex flex-col items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><h3 class="mt-2 text-lg font-medium text-gray-900">An Error Occurred</h3><p class="mt-1 text-sm text-gray-500">${message}</p><p class="mt-2 text-xs text-gray-400">This may be due to a missing database index or network issue. See console for details.</p></div></td></tr>`; }
function populateClientDropdownForEdit(selectedId = null) { const selectEl = $('#case-edit-client'); selectEl.innerHTML = '<option value="">Select a client...</option>'; if (clientsMap.size === 0) { selectEl.innerHTML += '<option value="" disabled>No clients. Add a client first.</option>'; return; } [...clientsMap.values()].sort((a, b) => a.name.localeCompare(b.name)).forEach(client => { selectEl.innerHTML += `<option value="${client.id}" ${client.id === selectedId ? 'selected' : ''}>${escapeHTML(client.name)}</option>`; }); }
function populateDocumentCaseFilter() { const current = DOMElements.documentsFilterCase.value || 'all'; DOMElements.documentsFilterCase.innerHTML = `<option value="all">All cases</option>`;[...casesMap.values()].sort((a, b) => a.caseName.localeCompare(b.caseName)).forEach(c => DOMElements.documentsFilterCase.insertAdjacentHTML('beforeend', `<option value="${c.id}">${escapeHTML(c.caseName)}</option>`)); DOMElements.documentsFilterCase.value = current; }
function populateDocumentCaseSelect(selectedId = '') { DOMElements.documentCaseSelect.innerHTML = '<option value="">Select a case...</option>'; if (casesMap.size === 0) { DOMElements.documentCaseSelect.insertAdjacentHTML('beforeend', '<option value="" disabled>No cases. Add a case first.</option>'); return; } [...casesMap.values()].sort((a, b) => a.caseName.localeCompare(b.caseName)).forEach(c => DOMElements.documentCaseSelect.insertAdjacentHTML('beforeend', `<option value="${c.id}" ${c.id === selectedId ? 'selected' : ''}>${escapeHTML(c.caseName)}</option>`)); DOMElements.documentCaseSelect.value = selectedId || ''; }
function populateEventCaseSelect(selected = '') {
  const select = $('#event-case-select');
  select.innerHTML = '<option value="">None</option>';
  [...casesMap.values()].sort((a, b) => a.caseName.localeCompare(b.caseName)).forEach(c => {
    select.innerHTML += `<option value="${c.id}" ${c.id === selected ? 'selected' : ''}>${escapeHTML(c.caseName)}</option>`;
  });
}

// --- EVENT LISTENERS ---
function initEventListeners() {
  $('#logout-button').addEventListener('click', handleLogout);
  DOMElements.clientForm.addEventListener('submit', handleClientFormSubmit);
  DOMElements.caseEditForm.addEventListener('submit', handleCaseEditFormSubmit);
  DOMElements.profileForm.addEventListener('submit', handleProfileFormSubmit);
  DOMElements.documentForm.addEventListener('submit', handleDocumentFormSubmit);
  DOMElements.eventForm.addEventListener('submit', handleEventFormSubmit);
  DOMElements.billingSettingsForm.addEventListener('submit', handleBillingSettingsFormSubmit);

  $('#add-client-button').addEventListener('click', () => { DOMElements.clientForm.reset(); $('#client-modal-title').textContent = "Add New Client"; $('#client-id-input').value = ""; hideError(DOMElements.clientFormError); openModal(DOMElements.clientModal); });

  DOMElements.addDocumentButton.addEventListener('click', () => {
    DOMElements.documentForm.reset();
    populateDocumentCaseSelect();
    setUploadProgress(0);
    hideError(DOMElements.documentFormError);
    openModal(DOMElements.documentModal);
  });
  DOMElements.documentsFilterCase.addEventListener('change', (e) => { documentsFilter.caseId = e.target.value; renderDocumentsTable(); });
  DOMElements.documentsSearch.addEventListener('input', (e) => { documentsFilter.search = e.target.value; renderDocumentsTable(); });

  $('#user-dropdown-toggle').addEventListener('click', () => DOMElements.userDropdownMenu.classList.toggle('hidden'));

  DOMElements.caseEditDescription.addEventListener('input', e => {
    const text = e.target.value;
    DOMElements.caseEditPreview.innerHTML = renderRichContent(text);
    DOMElements.caseEditPreviewLength.textContent = `${text.length} characters`;
  });

  DOMElements.addEventButton.addEventListener('click', () => { DOMElements.eventForm.reset(); $('#event-modal-title').textContent = "Add New Event"; $('#event-id-input').value = ""; populateEventCaseSelect(); hideError(DOMElements.eventFormError); $('#event-date-input').value = new Date().toISOString().split('T')[0]; openModal(DOMElements.eventModal); });

  DOMElements.calendarPrev.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
  });

  DOMElements.calendarNext.addEventListener('click', () => {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
  });

  document.body.addEventListener('click', e => {
    const target = e.target;

    if (!target.closest('#user-dropdown-toggle') && !target.closest('#user-dropdown-menu')) DOMElements.userDropdownMenu.classList.add('hidden');

    const modal = target.closest('.modal');
    if (target.dataset.role === 'cancel' && modal) {
      if (modal.id === 'client-modal' && $('#client-id-input').value) {
        if (initialClientFormData !== JSON.stringify(getClientFormData())) { showConfirmation('Discard Changes?', 'You have unsaved changes. Are you sure?', () => closeModal(modal)); return; }
      }
      closeModal(modal);
    }
    if (target.dataset.role === 'modal-backdrop') closeModal(modal);
    if (target.matches('.empty-state-btn')) {
      const triggerId = target.dataset.trigger;
      if (triggerId === 'add-case-button') window.location.hash = '#case-edit/new';
      else $(`#${triggerId}`).click();
    }

    const clientBtn = target.closest('.edit-client-btn, .delete-client-btn');
    if (clientBtn && DOMElements.clientsTableBody.contains(clientBtn)) {
      const id = clientBtn.dataset.id;
      if (clientBtn.classList.contains('edit-client-btn')) {
        const client = clientsMap.get(id); $('#client-modal-title').textContent = "Edit Client"; $('#client-id-input').value = id;
        $('#client-name-input').value = client.name; $('#client-email-input').value = client.email; $('#client-type-select').value = client.type;
        hideError(DOMElements.clientFormError); initialClientFormData = JSON.stringify(getClientFormData()); openModal(DOMElements.clientModal);
      } else if (clientBtn.classList.contains('delete-client-btn')) { handleClientDelete(id); }
    }

    const docBtn = target.closest('.delete-document-btn, .download-document-btn');
    if (docBtn && DOMElements.documentsTableBody.contains(docBtn)) {
      if (docBtn.classList.contains('delete-document-btn')) handleDocumentDelete(docBtn.dataset.id);
      if (docBtn.classList.contains('download-document-btn')) handleDocumentDownload(docBtn.dataset.id);
    }

    const eventBtn = target.closest('.edit-event-btn, .delete-event-btn');
    if (eventBtn) {
      const id = eventBtn.dataset.id;
      if (eventBtn.classList.contains('edit-event-btn')) {
        const event = eventsMap.get(id);
        if (!event) return;
        $('#event-modal-title').textContent = "Edit Event";
        $('#event-id-input').value = id;
        $('#event-title-input').value = event.title;
        $('#event-date-input').value = event.date.toDate().toISOString().split('T')[0];
        $('#event-case-select').value = event.caseId || '';
        $('#event-description-input').value = event.description || '';
        populateEventCaseSelect(event.caseId);
        hideError(DOMElements.eventFormError);
        openModal(DOMElements.eventModal);
      } else if (eventBtn.classList.contains('delete-event-btn')) {
        showConfirmation("Delete Event?", "This will permanently delete the event.", async () => {
          try {
            await deleteDoc(doc(db, 'events', id));
          } catch (error) {
            console.error("Error deleting event:", error);
          }
        });
      }
    }
  });
}

// --- UTILITIES ---
function escapeHTML(str) { if (str == null) return ''; return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s])); }
function formatDate(ts) { try { if (!ts) return 'N/A'; return (ts.toDate ? ts.toDate() : new Date(ts)).toLocaleDateString(); } catch { return 'N/A'; } }
function formatBytes(bytes) { if (!bytes && bytes !== 0) return '—'; const s = ['B', 'KB', 'MB', 'GB', 'TB']; if (bytes === 0) return '0 B'; const i = Math.floor(Math.log(bytes) / Math.log(1024)); return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${s[i]}`; }
function shortType(ct = '') { const [t, s] = ct.split('/'); if (t === 'application' && s) { if (s.includes('pdf')) return 'PDF'; if (s.includes('word')) return 'DOCX'; if (s.includes('spreadsheet')) return 'XLSX'; if (s.includes('zip')) return 'ZIP'; } return (t === 'image' || t === 'text') ? t.charAt(0).toUpperCase() + t.slice(1) : s ? s.toUpperCase() : t; }
function typeBadgeClass(ct = '') { if (ct.includes('pdf')) return 'bg-red-100 text-red-800'; if (ct.includes('word')) return 'bg-blue-100 text-blue-800'; if (ct.includes('spreadsheet')) return 'bg-green-100 text-green-800'; if (ct.startsWith('image/')) return 'bg-yellow-100 text-yellow-800'; return 'bg-purple-100 text-purple-800'; }
function fileTypeIcon(ct = '') { return `<span class="text-purple-700 text-xs font-bold">${escapeHTML(shortType(ct).slice(0, 3).toUpperCase())}</span>`; }
function renderRichContent(text = '') {
  if (!text.trim()) return '<p class="text-gray-500">No description provided.</p>';

  const linkRegex = /(https?:\/\/[^\s<]+)/g;
  const linkify = (str) => str.replace(linkRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

  const lines = text.split('\n');
  let html = '';
  let inList = false;

  lines.forEach(line => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('- ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${linkify(escapeHTML(trimmedLine.substring(2)))}</li>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }

      if (trimmedLine.startsWith('## ')) {
        html += `<h4>${linkify(escapeHTML(trimmedLine.substring(3)))}</h4>`;
      } else if (trimmedLine.startsWith('# ')) {
        html += `<h3>${linkify(escapeHTML(trimmedLine.substring(2)))}</h3>`;
      } else if (trimmedLine) {
        html += `<p>${linkify(escapeHTML(trimmedLine))}</p>`;
      } else {
        html += '<br>';
      }
    }
  });

  if (inList) html += '</ul>';
  return html;
}

/**
 * Initializes all functionality for the Time Tracking module.
 * @param {object} dependencies - Shared resources from the main app.
 */
function initTimeTracker(dependencies) {
  const { db, auth, getCasesMap, getFirestoreModules } = dependencies;
  const { collection, addDoc, onSnapshot, query, where, orderBy, deleteDoc, doc, serverTimestamp } = getFirestoreModules();
  const userId = auth.currentUser.uid;

  // --- State Variables ---
  let timerInterval = null;
  let startTime = 0;
  let elapsedSeconds = 0;
  let unsubscribeFromEntries = null;

  // --- DOM Elements (scoped to the time tracker) ---
  const timeTrackerElements = {
    container: $('#time-tracking'),
    caseSelect: $('#time-case-select'),
    taskSelect: $('#time-activity-select'),
    description: $('#time-description'),
    display: $('#time-display'),
    feedback: $('#time-feedback'),
    startBtn: $('#time-start-btn'),
    stopBtn: $('#time-stop-btn'),
    saveBtn: $('#time-save-btn'),
    entriesTableBody: $('#time-entries-table-body'),
    todayTotalEl: $('#time-today-total span'),
  };

  // If elements aren't found, the view hasn't loaded. Exit gracefully.
  if (!timeTrackerElements.container || !timeTrackerElements.startBtn) {
    console.error("Time Tracker HTML not loaded or found, initialization aborted.");
    return;
  }

  // --- Core Functions ---
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const updateTimerDisplay = () => {
    const currentElapsed = Math.floor((Date.now() - startTime) / 1000);
    timeTrackerElements.display.textContent = formatTime(currentElapsed);
  };

  const resetTimer = () => {
    clearInterval(timerInterval);
    timerInterval = null;
    startTime = 0;
    elapsedSeconds = 0;
    timeTrackerElements.display.textContent = "00:00:00";
    timeTrackerElements.startBtn.classList.remove('hidden');
    timeTrackerElements.stopBtn.classList.add('hidden');
    timeTrackerElements.saveBtn.disabled = true;
    timeTrackerElements.feedback.textContent = '';
    // Don't reset the form fields, user might want to start another timer for the same task
  };

  const startTimer = () => {
    if (!timeTrackerElements.caseSelect.value || !timeTrackerElements.taskSelect.value) {
      timeTrackerElements.feedback.textContent = "Please select a case and task first.";
      return;
    }
    timeTrackerElements.feedback.textContent = "";
    startTime = Date.now();
    timerInterval = setInterval(updateTimerDisplay, 1000);

    timeTrackerElements.startBtn.classList.add('hidden');
    timeTrackerElements.stopBtn.classList.remove('hidden');
    timeTrackerElements.saveBtn.disabled = true;
    [timeTrackerElements.caseSelect, timeTrackerElements.taskSelect, timeTrackerElements.description].forEach(el => el.disabled = true);
  };

  const stopTimer = () => {
    elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    clearInterval(timerInterval);
    timerInterval = null;

    timeTrackerElements.stopBtn.classList.add('hidden');
    // We don't show start button again until saved/reset
    timeTrackerElements.saveBtn.disabled = false;
    [timeTrackerElements.caseSelect, timeTrackerElements.taskSelect, timeTrackerElements.description].forEach(el => el.disabled = false);
  };

  const saveEntry = async () => {
    if (elapsedSeconds < 1) {
      timeTrackerElements.feedback.textContent = "Timer was not run long enough to save.";
      return;
    }

    timeTrackerElements.saveBtn.disabled = true;
    timeTrackerElements.saveBtn.textContent = 'Saving...';

    try {
      await addDoc(collection(db, 'timeEntries'), {
        userId,
        caseId: timeTrackerElements.caseSelect.value,
        task: timeTrackerElements.taskSelect.value,
        description: timeTrackerElements.description.value.trim(),
        durationSeconds: elapsedSeconds,
        entryDate: serverTimestamp(),
      });
      // Reset form for next entry
      timeTrackerElements.description.value = '';
      resetTimer();
    } catch (error) {
      console.error("Error saving time entry:", error);
      timeTrackerElements.feedback.textContent = "Failed to save entry.";
    } finally {
      timeTrackerElements.saveBtn.textContent = 'Save Entry';
    }
  };

  const deleteEntry = async (entryId) => {
    if (confirm('Are you sure you want to delete this time entry?')) {
      try {
        await deleteDoc(doc(db, 'timeEntries', entryId));
      } catch (error) {
        console.error("Error deleting entry:", error);
        alert("Could not delete the entry.");
      }
    }
  };

  // --- Rendering and Data Population ---
  const populateCaseDropdown = (cases) => {
    const select = timeTrackerElements.caseSelect;
    select.innerHTML = '<option value="">Select a case...</option>'; // Clear existing
    if (!cases || cases.size === 0) {
      select.innerHTML += '<option disabled>No cases found</option>';
      return;
    }
    const sortedCases = [...cases.values()].sort((a, b) => a.caseName.localeCompare(b.caseName));
    sortedCases.forEach(caseData => {
      select.innerHTML += `<option value="${caseData.id}">${escapeHTML(caseData.caseName)}</option>`;
    });
  };

  const renderEntries = (entries) => {
    const tbody = timeTrackerElements.entriesTableBody;
    const cases = getCasesMap();
    tbody.innerHTML = ''; // Clear skeleton or old data

    if (entries.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">No time entries recorded yet.</td></tr>`;
      return;
    }

    let todaySeconds = 0;
    const today = new Date().toDateString();

    const fragment = document.createDocumentFragment();
    entries.forEach(entry => {
      const caseName = cases.get(entry.caseId)?.caseName || 'Unknown Case';
      const entryDate = entry.entryDate?.toDate();

      if (entryDate && entryDate.toDateString() === today) {
        todaySeconds += entry.durationSeconds;
      }

      const row = document.createElement('tr');
      row.className = "hover:bg-gray-50";
      row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">${escapeHTML(caseName)}</div>
                            <div class="text-sm text-gray-500 truncate max-w-xs">${escapeHTML(entry.description || 'No description')}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">${escapeHTML(entry.task)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${formatTime(entry.durationSeconds)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${entryDate ? entryDate.toLocaleDateString() : 'N/A'}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button class="text-red-600 hover:text-red-900 delete-time-entry-btn" data-id="${entry.id}">Delete</button>
                        </td>
                    `;
      fragment.appendChild(row);
    });
    tbody.appendChild(fragment);

    // Update Today's Total
    const totalHours = Math.floor(todaySeconds / 3600);
    const totalMinutes = Math.floor((todaySeconds % 3600) / 60);
    timeTrackerElements.todayTotalEl.textContent = `${totalHours}h ${totalMinutes}m`;
  };

  const listenForTimeEntries = () => {
    if (unsubscribeFromEntries) unsubscribeFromEntries();
    const q = query(collection(db, 'timeEntries'), where("userId", "==", userId), orderBy('entryDate', 'desc'));
    unsubscribeFromEntries = onSnapshot(q, snapshot => {
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderEntries(entries);
    }, error => {
      console.error("Error fetching time entries:", error);
      timeTrackerElements.entriesTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-600">Could not load time entries.</td></tr>`;
    });
  };

  // --- Event Listeners ---
  timeTrackerElements.startBtn.addEventListener('click', startTimer);
  timeTrackerElements.stopBtn.addEventListener('click', stopTimer);
  timeTrackerElements.saveBtn.addEventListener('click', saveEntry);

  // Use event delegation for delete buttons
  timeTrackerElements.container.addEventListener('click', (e) => {
    if (e.target.matches('.delete-time-entry-btn')) {
      const entryId = e.target.dataset.id;
      deleteEntry(entryId);
    }
  });

  // Listen for global case updates from the main app
  window.addEventListener('casesUpdated', (e) => {
    populateCaseDropdown(e.detail);
  });

  // --- Initialization ---
  populateCaseDropdown(getCasesMap());
  listenForTimeEntries();

  console.log("Time Tracker Initialized.");
}
