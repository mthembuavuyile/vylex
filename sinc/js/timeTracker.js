// timeTracker.js - Time tracking functionality for SINC Dashboard

// Timer state
const state = {
    isRunning: false,
    startTime: null,
    elapsedTime: 0,
    currentTimer: null,
    activeTask: null,
    activeCase: null,
    timeEntries: []
  };
  
  // DOM elements cache
  const elements = {};
  
  /**
   * Initialize time tracking functionality
   */
  export function initTimeTracking() {
    console.log("Initializing Time Tracking...");
    
    // Cache DOM elements
    cacheElements();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load saved time entries
    loadTimeEntries();
    
    console.log("Time Tracking Initialized");
  }
  
  /**
   * Cache DOM elements for performance
   */
  function cacheElements() {
    const ids = [
      'timer-display', 'start-timer-btn', 'stop-timer-btn', 
      'task-select', 'case-select', 'description-input',
      'time-log-container', 'manual-entry-form', 'manual-entry-btn',
      'timer-btn', 'time-tracking-content', 'timer-interface',
      'manual-entry-form-container'
    ];
    
    ids.forEach(id => {
      elements[id] = document.getElementById(id);
    });
  }
  
  /**
   * Set up all event listeners
   */
  function setupEventListeners() {
    // Timer controls
    if (elements['start-timer-btn']) {
      elements['start-timer-btn'].addEventListener('click', startTimer);
    }
    
    if (elements['stop-timer-btn']) {
      elements['stop-timer-btn'].addEventListener('click', stopTimer);
    }
    
    // Form submission
    if (elements['manual-entry-form']) {
      elements['manual-entry-form'].addEventListener('submit', handleManualEntry);
    }
    
    // Tab switching
    if (elements['manual-entry-btn']) {
      elements['manual-entry-btn'].addEventListener('click', () => switchTab('manual'));
    }
    
    if (elements['timer-btn']) {
      elements['timer-btn'].addEventListener('click', () => switchTab('timer'));
    }
  }
  
  /**
   * Switch between timer and manual entry tabs
   */
  function switchTab(tab) {
    if (tab === 'manual') {
      // Show manual entry, hide timer
      if (elements['timer-interface']) elements['timer-interface'].classList.add('hidden');
      if (elements['manual-entry-form-container']) elements['manual-entry-form-container'].classList.remove('hidden');
      
      // Update button styles
      updateTabStyles(elements['manual-entry-btn'], elements['timer-btn']);
    } else {
      // Show timer, hide manual entry
      if (elements['timer-interface']) elements['timer-interface'].classList.remove('hidden');
      if (elements['manual-entry-form-container']) elements['manual-entry-form-container'].classList.add('hidden');
      
      // Update button styles
      updateTabStyles(elements['timer-btn'], elements['manual-entry-btn']);
    }
  }
  
  /**
   * Update styles for active/inactive tabs
   */
  function updateTabStyles(activeBtn, inactiveBtn) {
    if (activeBtn && inactiveBtn) {
      // Active button styles
      activeBtn.classList.add('text-sky-700', 'border-b-2', 'border-sky-700');
      activeBtn.classList.remove('text-gray-500', 'hover:text-gray-700');
      
      // Inactive button styles
      inactiveBtn.classList.remove('text-sky-700', 'border-b-2', 'border-sky-700');
      inactiveBtn.classList.add('text-gray-500', 'hover:text-gray-700');
    }
  }
  
  // ----- Timer Functions -----
  
  /**
   * Start the timer
   */
  function startTimer() {
    // Validate required fields
    const caseValue = elements['case-select']?.value;
    const taskValue = elements['task-select']?.value;
    
    if (!caseValue || !taskValue) {
      alert('Please select both a case and task before starting the timer.');
      return;
    }
    
    // Update UI
    elements['start-timer-btn'].classList.add('hidden');
    elements['stop-timer-btn'].classList.remove('hidden');
    elements['time-tracking-content']?.classList.add('active-timer');
    
    // Set timer state
    state.isRunning = true;
    state.startTime = Date.now() - state.elapsedTime;
    state.activeTask = taskValue;
    state.activeCase = caseValue;
    
    // Start interval to update display
    state.currentTimer = setInterval(updateTimerDisplay, 1000);
  }
  
  /**
   * Stop the timer and save the entry
   */
  function stopTimer() {
    if (!state.isRunning) return;
    
    // Clear interval
    clearInterval(state.currentTimer);
    
    // Update UI
    elements['start-timer-btn'].classList.remove('hidden');
    elements['stop-timer-btn'].classList.add('hidden');
    elements['time-tracking-content']?.classList.remove('active-timer');
    
    // Calculate final duration
    const endTime = Date.now();
    const duration = endTime - state.startTime;
    
    // Create time entry
    const timeEntry = {
      id: generateUniqueId(),
      case: state.activeCase,
      task: state.activeTask,
      description: elements['description-input']?.value || '',
      duration,
      date: new Date().toISOString(),
      billable: true // Default to billable
    };
    
    // Add to entries and save
    addTimeEntry(timeEntry);
    
    // Reset timer state
    state.isRunning = false;
    state.elapsedTime = 0;
    state.startTime = null;
    state.currentTimer = null;
    
    // Reset display
    if (elements['timer-display']) {
      elements['timer-display'].textContent = '00:00:00';
    }
    
    // Clear description input
    if (elements['description-input']) {
      elements['description-input'].value = '';
    }
  }
  
  /**
   * Update the timer display
   */
  function updateTimerDisplay() {
    if (!state.isRunning) return;
    
    const currentTime = Date.now();
    state.elapsedTime = currentTime - state.startTime;
    
    if (elements['timer-display']) {
      elements['timer-display'].textContent = formatDuration(state.elapsedTime);
    }
  }
  
  // ----- Manual Entry Functions -----
  
  /**
   * Handle manual time entry form submission
   */
  function handleManualEntry(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = {
      date: form.elements['entry-date'].value,
      hours: parseInt(form.elements['entry-hours'].value || 0),
      minutes: parseInt(form.elements['entry-minutes'].value || 0),
      caseValue: form.elements['entry-case'].value,
      taskValue: form.elements['entry-task'].value,
      description: form.elements['entry-description'].value,
      billable: form.elements['entry-billable'].checked
    };
    
    // Validate inputs
    if (!formData.date || (!formData.hours && !formData.minutes) || !formData.caseValue || !formData.taskValue) {
      alert('Please fill all required fields');
      return;
    }
    
    // Check if we're editing an existing entry
    if (form.dataset.editMode === 'true' && form.dataset.editId) {
      updateTimeEntry(form.dataset.editId, formData);
      cancelEditMode();
    } else {
      // Calculate duration in milliseconds
      const duration = (formData.hours * 60 * 60 * 1000) + (formData.minutes * 60 * 1000);
      
      // Create time entry
      const timeEntry = {
        id: generateUniqueId(),
        case: formData.caseValue,
        task: formData.taskValue,
        description: formData.description,
        duration,
        date: new Date(formData.date).toISOString(),
        billable: formData.billable
      };
      
      // Add to entries and save
      addTimeEntry(timeEntry);
      
      // Reset form
      form.reset();
      
      // Show success message
      showFormMessage(form, 'Time entry added successfully!', 'success');
    }
  }
  
  /**
   * Show temporary form message
   */
  function showFormMessage(form, message, type = 'success') {
    const messageEl = document.createElement('div');
    messageEl.className = type === 'success' 
      ? 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-2'
      : 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-2';
    messageEl.setAttribute('role', 'alert');
    messageEl.textContent = message;
    
    form.appendChild(messageEl);
    
    // Remove message after 3 seconds
    setTimeout(() => messageEl.remove(), 3000);
  }
  
  /**
   * Cancel edit mode
   */
  function cancelEditMode() {
    const form = elements['manual-entry-form'];
    if (!form) return;
    
    // Reset form
    form.reset();
    
    // Remove edit mode indicator
    delete form.dataset.editMode;
    delete form.dataset.editId;
    
    // Change submit button text back
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = 'Add Entry';
    }
    
    // Remove cancel button
    const cancelBtn = form.querySelector('.cancel-edit-btn');
    if (cancelBtn) {
      cancelBtn.remove();
    }
  }
  
  // ----- Time Entry Management -----
  
  /**
   * Add a time entry to the list and save to localStorage
   */
  function addTimeEntry(entry) {
    // Add to state
    state.timeEntries.push(entry);
    
    // Save to localStorage
    saveTimeEntries();
    
    // Update UI
    renderTimeEntries();
  }
  
  /**
   * Update an existing time entry
   */
  function updateTimeEntry(id, formData) {
    const entryIndex = state.timeEntries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) return;
    
    // Calculate duration in milliseconds
    const duration = (formData.hours * 60 * 60 * 1000) + (formData.minutes * 60 * 1000);
    
    // Update the entry
    state.timeEntries[entryIndex] = {
      ...state.timeEntries[entryIndex],
      case: formData.caseValue,
      task: formData.taskValue,
      description: formData.description,
      duration,
      date: new Date(formData.date).toISOString(),
      billable: formData.billable
    };
    
    // Save and update UI
    saveTimeEntries();
    renderTimeEntries();
  }
  
  /**
   * Delete a time entry
   */
  function deleteTimeEntry(id) {
    if (confirm('Are you sure you want to delete this time entry?')) {
      state.timeEntries = state.timeEntries.filter(entry => entry.id !== id);
      saveTimeEntries();
      renderTimeEntries();
    }
  }
  
  /**
   * Edit a time entry
   */
  function editTimeEntry(id) {
    const entry = state.timeEntries.find(entry => entry.id === id);
    if (!entry) return;
    
    // Show manual entry form
    switchTab('manual');
    
    // Fill form with entry data
    const form = elements['manual-entry-form'];
    if (!form) return;
    
    const entryDate = new Date(entry.date);
    form.elements['entry-date'].value = entryDate.toISOString().split('T')[0];
    
    const hours = Math.floor(entry.duration / (60 * 60 * 1000));
    const minutes = Math.floor((entry.duration % (60 * 60 * 1000)) / (60 * 1000));
    
    form.elements['entry-hours'].value = hours;
    form.elements['entry-minutes'].value = minutes;
    form.elements['entry-case'].value = entry.case;
    form.elements['entry-task'].value = entry.task;
    form.elements['entry-description'].value = entry.description || '';
    form.elements['entry-billable'].checked = entry.billable;
    
    // Add edit mode indicator
    form.dataset.editMode = 'true';
    form.dataset.editId = id;
    
    // Change submit button text
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = 'Update Entry';
    }
    
    // Add cancel button if not already present
    if (!form.querySelector('.cancel-edit-btn')) {
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'cancel-edit-btn ml-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.addEventListener('click', cancelEditMode);
      
      submitBtn.parentNode.appendChild(cancelBtn);
    }
  }
  
  // ----- Storage Functions -----
  
  /**
   * Save time entries to localStorage
   */
  function saveTimeEntries() {
    localStorage.setItem('sincTimeEntries', JSON.stringify(state.timeEntries));
  }
  
  /**
   * Load time entries from localStorage
   */
  function loadTimeEntries() {
    const savedEntries = localStorage.getItem('sincTimeEntries');
    if (savedEntries) {
      state.timeEntries = JSON.parse(savedEntries);
      renderTimeEntries();
    }
  }
  
  /**
   * Render time entries in the UI
   */
  function renderTimeEntries() {
    const container = elements['time-log-container'];
    if (!container) return;
    
    container.innerHTML = '';
    
    if (state.timeEntries.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          No time entries yet. Start the timer or add a manual entry.
        </div>
      `;
      return;
    }
    
    // Create table with header
    const table = createTimeEntryTable();
    container.appendChild(table);
    
    // Sort entries by date (most recent first)
    const sortedEntries = [...state.timeEntries].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    // Add entry rows
    populateTimeEntryTable(table.querySelector('tbody'), sortedEntries);
    
    // Add event listeners for edit and delete buttons
    addTimeEntryEventListeners(container);
  }
  
  /**
   * Create the time entry table structure
   */
  function createTimeEntryTable() {
    const table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-gray-200';
    
    table.innerHTML = `
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case/Task</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Billable</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200"></tbody>
    `;
    
    return table;
  }
  
  /**
   * Fill the table with time entry rows
   */
  function populateTimeEntryTable(tbody, entries) {
    entries.forEach(entry => {
      const row = document.createElement('tr');
      
      // Format date
      const entryDate = new Date(entry.date);
      const dateFormatted = entryDate.toLocaleDateString();
      
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${dateFormatted}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          ${entry.case}<br>
          <span class="text-xs text-gray-500">${entry.task}</span>
        </td>
        <td class="px-6 py-4 text-sm text-gray-500">${entry.description || '-'}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDuration(entry.duration)}</td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${entry.billable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
            ${entry.billable ? 'Yes' : 'No'}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <button data-id="${entry.id}" class="edit-entry-btn text-indigo-600 hover:text-indigo-900 mr-2">Edit</button>
          <button data-id="${entry.id}" class="delete-entry-btn text-red-600 hover:text-red-900">Delete</button>
        </td>
      `;
      
      tbody.appendChild(row);
    });
  }
  
  /**
   * Add event listeners to edit and delete buttons
   */
  function addTimeEntryEventListeners(container) {
    const editButtons = container.querySelectorAll('.edit-entry-btn');
    const deleteButtons = container.querySelectorAll('.delete-entry-btn');
    
    editButtons.forEach(button => {
      button.addEventListener('click', () => editTimeEntry(button.dataset.id));
    });
    
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => deleteTimeEntry(button.dataset.id));
    });
  }
  
  // ----- Utility Functions -----
  
  /**
   * Format milliseconds into HH:MM:SS
   */
  function formatDuration(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  }
  
  /**
   * Generate a unique ID for time entries
   */
  function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }