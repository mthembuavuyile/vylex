import { db } from './firebase.js';
import { collection, doc, query, where, orderBy, onSnapshot, getDocs, updateDoc, addDoc, deleteDoc, Timestamp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { state, notifyEventsUpdated } from './state.js';
import { DOMElements } from './dom.js';
import { CONSTANTS, setButtonLoading, hideError, showError, closeModal, escapeHTML, formatDate } from './utils.js';

let unsubscribeFromEvents = null;

export function listenForEventChanges() {
    if (unsubscribeFromEvents) unsubscribeFromEvents();
    const q = query(collection(db, 'events'), where("userId", "==", state.currentUserId), orderBy('date', 'asc'));
    unsubscribeFromEvents = onSnapshot(q, snapshot => {
        state.eventsMap.clear();
        snapshot.forEach(doc => state.eventsMap.set(doc.id, { id: doc.id, ...doc.data() }));
        state.initialDataLoaded.events = true;
        
        notifyEventsUpdated();
        renderCalendar();
        renderUpcomingEvents();
        
        const upcomingCount = [...state.eventsMap.values()].filter(e => e.date.toDate() > new Date()).length;
        const noteEl = document.getElementById('calendar-notification');
        if (noteEl) {
            noteEl.textContent = upcomingCount;
            noteEl.classList.toggle('hidden', upcomingCount === 0);
        }
    }, error => {
        console.error("Error loading events:", error);
    });
}

export function populateEventCaseSelect(selected = '') {
    const select = document.getElementById('event-case-select');
    if(!select) return;
    select.innerHTML = '<option value="">None</option>';
    [...state.casesMap.values()].sort((a, b) => a.caseName.localeCompare(b.caseName)).forEach(c => {
        select.innerHTML += `<option value="${c.id}" ${c.id === selected ? 'selected' : ''}>${escapeHTML(c.caseName)}</option>`;
    });
}

export function renderCalendar() {
    if(!DOMElements.calendarMonth || !DOMElements.calendarGrid) return;
    const year = state.currentCalendarDate.getFullYear();
    const month = state.currentCalendarDate.getMonth();
    DOMElements.calendarMonth.textContent = state.currentCalendarDate.toLocaleString('default', { month: 'long' }) + ' ' + year;
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
    state.eventsMap.forEach(event => {
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

export function renderUpcomingEvents() {
    const list = DOMElements.upcomingEventsList;
    if(!list) return;
    list.innerHTML = '';
    const now = new Date();
    const upcoming = [...state.eventsMap.values()].filter(e => e.date.toDate() >= now).sort((a, b) => a.date.seconds - b.date.seconds);
    if (upcoming.length === 0) {
        list.innerHTML = '<p class="text-center text-gray-500">No upcoming events.</p>';
        return;
    }
    upcoming.forEach(event => {
        const caseName = event.caseId ? state.casesMap.get(event.caseId)?.caseName || 'Unknown' : 'None';
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

export async function handleEventFormSubmit(e) {
    e.preventDefault();
    setButtonLoading(DOMElements.saveEventButton, true, CONSTANTS.SAVE_EVENT_TEXT);
    hideError(DOMElements.eventFormError);
    const eventId = document.getElementById('event-id-input').value.trim();
    const dateVal = document.getElementById('event-date-input').value;
    const titleVal = document.getElementById('event-title-input').value.trim();
    
    if (!titleVal || !dateVal) {
        showError(DOMElements.eventFormError, "Title and Date are required.");
        setButtonLoading(DOMElements.saveEventButton, false, CONSTANTS.SAVE_EVENT_TEXT);
        return;
    }

    const eventData = {
        title: titleVal,
        date: Timestamp.fromDate(new Date(dateVal)),
        caseId: document.getElementById('event-case-select').value || null,
        description: document.getElementById('event-description-input').value.trim(),
        userId: state.currentUserId
    };
    
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

export function handleEventDelete(id) {
    // Extracted logic from event listener
    return deleteDoc(doc(db, 'events', id));
}

export function unsubscribeEvents() {
    if (unsubscribeFromEvents) unsubscribeFromEvents();
}
