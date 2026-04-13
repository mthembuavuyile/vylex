import { db } from './firebase.js';
import { collection, addDoc, onSnapshot, query, where, orderBy, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { state } from './state.js';
import { escapeHTML } from './utils.js';

let timerInterval = null;
let startTime = 0;
let elapsedSeconds = 0;
let unsubscribeFromEntries = null;

const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

export function initTimeTracker() {
    const elements = {
        container: document.getElementById('time-tracking'),
        caseSelect: document.getElementById('time-case-select'),
        taskSelect: document.getElementById('time-activity-select'),
        description: document.getElementById('time-description'),
        display: document.getElementById('time-display'),
        feedback: document.getElementById('time-feedback'),
        startBtn: document.getElementById('time-start-btn'),
        stopBtn: document.getElementById('time-stop-btn'),
        saveBtn: document.getElementById('time-save-btn'),
        entriesTableBody: document.getElementById('time-entries-table-body'),
        todayTotalEl: document.querySelector('#time-today-total span'),
    };

    if (!elements.container || !elements.startBtn) {
        console.error("Time Tracker HTML not loaded or found, initialization aborted.");
        return;
    }

    const updateTimerDisplay = () => {
        const currentElapsed = Math.floor((Date.now() - startTime) / 1000);
        elements.display.textContent = formatTime(currentElapsed);
    };

    const resetTimer = () => {
        clearInterval(timerInterval);
        timerInterval = null;
        startTime = 0;
        elapsedSeconds = 0;
        elements.display.textContent = "00:00:00";
        elements.startBtn.classList.remove('hidden');
        elements.stopBtn.classList.add('hidden');
        elements.saveBtn.disabled = true;
        elements.feedback.textContent = '';
    };

    const startTimer = () => {
        if (!elements.caseSelect.value || !elements.taskSelect.value) {
            elements.feedback.textContent = "Please select a case and task first.";
            return;
        }
        elements.feedback.textContent = "";
        startTime = Date.now();
        timerInterval = setInterval(updateTimerDisplay, 1000);

        elements.startBtn.classList.add('hidden');
        elements.stopBtn.classList.remove('hidden');
        elements.saveBtn.disabled = true;
        [elements.caseSelect, elements.taskSelect, elements.description].forEach(el => el.disabled = true);
    };

    const stopTimer = () => {
        elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        clearInterval(timerInterval);
        timerInterval = null;

        elements.stopBtn.classList.add('hidden');
        elements.saveBtn.disabled = false;
        [elements.caseSelect, elements.taskSelect, elements.description].forEach(el => el.disabled = false);
    };

    const saveEntry = async () => {
        if (elapsedSeconds < 1) {
            elements.feedback.textContent = "Timer was not run long enough to save.";
            return;
        }

        elements.saveBtn.disabled = true;
        elements.saveBtn.textContent = 'Saving...';

        try {
            await addDoc(collection(db, 'timeEntries'), {
                userId: state.currentUserId,
                caseId: elements.caseSelect.value,
                task: elements.taskSelect.value,
                description: elements.description.value.trim(),
                durationSeconds: elapsedSeconds,
                entryDate: serverTimestamp(),
            });
            elements.description.value = '';
            resetTimer();
        } catch (error) {
            console.error("Error saving time entry:", error);
            elements.feedback.textContent = "Failed to save entry.";
        } finally {
            elements.saveBtn.textContent = 'Save Entry';
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

    const populateCaseDropdown = (casesMap) => {
        elements.caseSelect.innerHTML = '<option value="">Select a case...</option>';
        if (!casesMap || casesMap.size === 0) {
            elements.caseSelect.innerHTML += '<option disabled>No cases found</option>';
            return;
        }
        const sortedCases = [...casesMap.values()].sort((a, b) => a.caseName.localeCompare(b.caseName));
        sortedCases.forEach(caseData => {
            elements.caseSelect.innerHTML += `<option value="${caseData.id}">${escapeHTML(caseData.caseName)}</option>`;
        });
    };

    const renderEntries = (entries) => {
        const cases = state.casesMap;
        elements.entriesTableBody.innerHTML = ''; 

        if (entries.length === 0) {
            elements.entriesTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-500">No time entries recorded yet.</td></tr>`;
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
        elements.entriesTableBody.appendChild(fragment);

        const totalHours = Math.floor(todaySeconds / 3600);
        const totalMinutes = Math.floor((todaySeconds % 3600) / 60);
        elements.todayTotalEl.textContent = `${totalHours}h ${totalMinutes}m`;
    };

    const listenForTimeEntries = () => {
        if (unsubscribeFromEntries) unsubscribeFromEntries();
        const q = query(collection(db, 'timeEntries'), where("userId", "==", state.currentUserId), orderBy('entryDate', 'desc'));
        unsubscribeFromEntries = onSnapshot(q, snapshot => {
            const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderEntries(entries);
        }, error => {
            console.error("Error fetching time entries:", error);
            elements.entriesTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-red-600">Could not load time entries.</td></tr>`;
        });
    };

    elements.startBtn.addEventListener('click', startTimer);
    elements.stopBtn.addEventListener('click', stopTimer);
    elements.saveBtn.addEventListener('click', saveEntry);

    elements.container.addEventListener('click', (e) => {
        if (e.target.matches('.delete-time-entry-btn')) {
            const entryId = e.target.dataset.id;
            deleteEntry(entryId);
        }
    });

    window.addEventListener('casesUpdated', (e) => {
        populateCaseDropdown(e.detail);
    });

    populateCaseDropdown(state.casesMap);
    listenForTimeEntries();

    console.log("Time Tracker Initialized.");
}