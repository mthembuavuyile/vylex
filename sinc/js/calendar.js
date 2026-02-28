// calendar.js
export function initCalendar() {
    // Calendar state
    let currentDate = new Date();
    let currentView = 'month'; // 'month', 'week', or 'day'
    let events = [
        {
            id: 1,
            title: 'Client Meeting: Johnson Case',
            date: new Date(2025, 3, 27), // April 27, 2025
            startTime: '10:00',
            endTime: '12:00',
            type: 'meeting',
            case: 'johnson',
            color: 'blue'
        },
        {
            id: 2,
            title: 'Court Deadline: Smith Filing',
            date: new Date(2025, 3, 27), // April 27, 2025
            startTime: '14:00',
            endTime: '14:30',
            type: 'deadline',
            case: 'smith',
            color: 'red'
        },
        {
            id: 3,
            title: 'Team Meeting',
            date: new Date(2025, 3, 27), // April 27, 2025
            startTime: '17:00',
            endTime: '18:00',
            type: 'meeting',
            case: '',
            color: 'green'
        },
        {
            id: 4,
            title: 'Court Hearing: Smith v. Jones',
            date: new Date(2025, 3, 28), // April 28, 2025
            startTime: '10:00',
            endTime: '12:00',
            type: 'court',
            case: 'smith',
            color: 'red'
        },
        {
            id: 5,
            title: 'Client Meeting: Johnson Estate',
            date: new Date(2025, 3, 29), // April 29, 2025
            startTime: '14:00',
            endTime: '15:00',
            type: 'meeting',
            case: 'johnson',
            color: 'blue'
        },
        {
            id: 6,
            title: 'Filing Deadline: Davis Incorporation',
            date: new Date(2025, 3, 30), // April 30, 2025
            startTime: '17:00',
            endTime: '17:30',
            type: 'deadline',
            case: 'davis',
            color: 'green'
        }
    ];

    // DOM Elements
    const calendarContent = document.getElementById('calendar-content');
    const monthYearLabel = document.getElementById('calendar-month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const viewMonthBtn = document.getElementById('view-month');
    const viewWeekBtn = document.getElementById('view-week');
    const viewDayBtn = document.getElementById('view-day');
    const addEventBtn = document.getElementById('add-event');
    const calendarGrid = document.getElementById('calendar-grid');
    const monthView = document.getElementById('month-view');
    const weekView = document.getElementById('week-view');
    const dayView = document.getElementById('day-view');
    const eventModal = document.getElementById('event-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelEventBtn = document.getElementById('cancel-event');
    const eventForm = document.getElementById('event-form');
    const singleDayHeader = document.getElementById('single-day-header');

    // Initialize calendar if elements exist
    if (!calendarContent) return;

    // Event listeners
    prevMonthBtn.addEventListener('click', () => navigateMonth(-1));
    nextMonthBtn.addEventListener('click', () => navigateMonth(1));
    viewMonthBtn.addEventListener('click', () => switchView('month'));
    viewWeekBtn.addEventListener('click', () => switchView('week'));
    viewDayBtn.addEventListener('click', () => switchView('day'));
    addEventBtn.addEventListener('click', openEventModal);
    closeModalBtn.addEventListener('click', closeEventModal);
    cancelEventBtn.addEventListener('click', closeEventModal);
    eventForm.addEventListener('submit', saveEvent);

    // Initial render
    updateMonthYearLabel();
    renderCalendar();

    // Functions
    function navigateMonth(change) {
        currentDate.setMonth(currentDate.getMonth() + change);
        updateMonthYearLabel();
        renderCalendar();
    }

    function updateMonthYearLabel() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
        monthYearLabel.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }

    function switchView(view) {
        currentView = view;
        
        // Update active button styling
        [viewMonthBtn, viewWeekBtn, viewDayBtn].forEach(btn => {
            btn.classList.remove('bg-sky-600', 'text-white');
            btn.classList.add('border', 'border-gray-300', 'text-gray-700');
        });

        let activeBtn;
        if (view === 'month') activeBtn = viewMonthBtn;
        else if (view === 'week') activeBtn = viewWeekBtn;
        else activeBtn = viewDayBtn;

        activeBtn.classList.remove('border', 'border-gray-300', 'text-gray-700');
        activeBtn.classList.add('bg-sky-600', 'text-white');

        // Hide/show appropriate views
        monthView.classList.toggle('hidden', view !== 'month');
        weekView.classList.toggle('hidden', view !== 'week');
        dayView.classList.toggle('hidden', view !== 'day');

        // Render the appropriate view
        renderCalendar();
    }

    function renderCalendar() {
        if (currentView === 'month') {
            renderMonthView();
        } else if (currentView === 'week') {
            renderWeekView();
        } else {
            renderDayView();
        }
    }

    function renderMonthView() {
        // Clear the grid
        calendarGrid.innerHTML = '';
        
        // Get the first day of the month
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
        const startingDayOfWeek = firstDay.getDay();
        
        // Calculate the previous month's days that need to be displayed
        const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
        
        // Create day cells
        let dayCount = 0;
        let dayOfMonth = 1;
        let nextMonthDay = 1;
        
        // Calculate how many rows we need (5 or 6 weeks)
        const totalDays = startingDayOfWeek + lastDay.getDate();
        const rows = Math.ceil(totalDays / 7);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < 7; col++) {
                const dayCell = document.createElement('div');
                dayCell.classList.add('border', 'border-gray-200', 'p-1', 'h-24', 'overflow-y-auto');
                
                // Fill in the day number
                let dayNumber;
                let isCurrentMonth = true;
                
                if (dayCount < startingDayOfWeek) {
                    // Previous month days
                    dayNumber = prevMonthLastDay - (startingDayOfWeek - dayCount - 1);
                    dayCell.classList.add('bg-gray-100', 'text-gray-400');
                    isCurrentMonth = false;
                } else if (dayOfMonth <= lastDay.getDate()) {
                    // Current month days
                    dayNumber = dayOfMonth++;
                    
                    // Check if this is today
                    const today = new Date();
                    if (currentDate.getFullYear() === today.getFullYear() && 
                        currentDate.getMonth() === today.getMonth() && 
                        dayNumber === today.getDate()) {
                        dayCell.classList.add('bg-sky-50', 'border-sky-500', 'border-2');
                    }
                    
                } else {
                    // Next month days
                    dayNumber = nextMonthDay++;
                    dayCell.classList.add('bg-gray-100', 'text-gray-400');
                    isCurrentMonth = false;
                }
                
                dayCell.innerHTML = `<div class="text-right">${dayNumber}</div><div class="event-container"></div>`;
                
                // Attach date data to the cell
                const cellDate = new Date(
                    isCurrentMonth ? currentDate.getFullYear() : (dayCount < startingDayOfWeek ? 
                        (currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear()) : 
                        (currentDate.getMonth() === 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear())),
                    isCurrentMonth ? currentDate.getMonth() : (dayCount < startingDayOfWeek ? 
                        (currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1) : 
                        (currentDate.getMonth() === 11 ? 0 : currentDate.getMonth() + 1)),
                    dayNumber
                );
                
                dayCell.dataset.date = cellDate.toISOString().split('T')[0];
                
                // Add events for this day
                addEventsToCell(dayCell, cellDate);
                
                // Add click event to cell
                dayCell.addEventListener('click', () => {
                    // Set the current date to the clicked day
                    currentDate = new Date(cellDate);
                    
                    // If clicked on a day in previous/next month, navigate to that month
                    if (!isCurrentMonth) {
                        updateMonthYearLabel();
                        renderCalendar();
                    } else {
                        // Otherwise, just switch to day view for that day
                        switchView('day');
                    }
                });
                
                calendarGrid.appendChild(dayCell);
                dayCount++;
            }
        }
    }

    function addEventsToCell(cell, date) {
        const eventContainer = cell.querySelector('.event-container');
        const dateEvents = events.filter(event => 
            event.date.getDate() === date.getDate() && 
            event.date.getMonth() === date.getMonth() && 
            event.date.getFullYear() === date.getFullYear()
        );
        
        dateEvents.slice(0, 2).forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.classList.add(`bg-${event.color}-100`, `text-${event.color}-800`, 'text-xs', 'p-1', 'mb-1', 'truncate', 'rounded');
            eventDiv.textContent = `${event.startTime} ${event.title}`;
            eventDiv.dataset.eventId = event.id;
            eventDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                openEventModal(event);
            });
            eventContainer.appendChild(eventDiv);
        });
        
        // If there are more events, add a "+X more" indicator
        if (dateEvents.length > 2) {
            const moreDiv = document.createElement('div');
            moreDiv.classList.add('text-xs', 'text-gray-500', 'text-center');
            moreDiv.textContent = `+${dateEvents.length - 2} more`;
            eventContainer.appendChild(moreDiv);
        }
    }

    function renderWeekView() {
        weekView.innerHTML = '';
        
        // Create header row with days of the week
        const headerRow = document.createElement('div');
        headerRow.classList.add('grid', 'grid-cols-8', 'gap-1', 'mb-2');
        
        // Time column header
        const timeHeader = document.createElement('div');
        timeHeader.classList.add('font-semibold', 'p-2', 'text-center');
        timeHeader.textContent = 'Time';
        headerRow.appendChild(timeHeader);
        
        // Get the first day of the week (Sunday)
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        
        // Add day headers
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        for (let i = 0; i < 7; i++) {
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + i);
            
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('font-semibold', 'p-2', 'text-center');
            
            // Highlight current day
            const today = new Date();
            if (dayDate.getDate() === today.getDate() && 
                dayDate.getMonth() === today.getMonth() && 
                dayDate.getFullYear() === today.getFullYear()) {
                dayHeader.classList.add('bg-sky-100', 'text-sky-800', 'rounded');
            }
            
            dayHeader.textContent = `${days[i]} ${dayDate.getDate()} ${months[dayDate.getMonth()]}`;
            dayHeader.dataset.date = dayDate.toISOString().split('T')[0];
            
            // Add click event to switch to day view
            dayHeader.addEventListener('click', () => {
                currentDate = new Date(dayDate);
                switchView('day');
            });
            
            headerRow.appendChild(dayHeader);
        }
        
        weekView.appendChild(headerRow);
        
        // Create time slots (1-hour intervals from 8 AM to 6 PM)
        for (let hour = 8; hour <= 18; hour++) {
            const timeRow = document.createElement('div');
            timeRow.classList.add('grid', 'grid-cols-8', 'gap-1', 'mb-1');
            
            // Time label
            const timeLabel = document.createElement('div');
            timeLabel.classList.add('text-right', 'pr-2', 'text-sm', 'text-gray-500');
            timeLabel.textContent = `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
            timeRow.appendChild(timeLabel);
            
            // Time slots for each day
            for (let day = 0; day < 7; day++) {
                const dayDate = new Date(weekStart);
                dayDate.setDate(weekStart.getDate() + day);
                dayDate.setHours(hour, 0, 0, 0);
                
                const timeSlot = document.createElement('div');
                timeSlot.classList.add('border', 'border-gray-200', 'p-1', 'h-12', 'bg-white');
                
                // Find events for this time slot
                const slotEvents = events.filter(event => {
                    const eventDate = event.date;
                    const eventStartHour = parseInt(event.startTime.split(':')[0]);
                    const eventEndHour = parseInt(event.endTime.split(':')[0]);
                    
                    return eventDate.getDate() === dayDate.getDate() && 
                           eventDate.getMonth() === dayDate.getMonth() && 
                           eventDate.getFullYear() === dayDate.getFullYear() && 
                           eventStartHour <= hour && eventEndHour > hour;
                });
                
                // Add events to the time slot
                slotEvents.forEach(event => {
                    const eventDiv = document.createElement('div');
                    eventDiv.classList.add(`bg-${event.color}-100`, `text-${event.color}-800`, 'text-xs', 'p-1', 'truncate', 'rounded');
                    eventDiv.textContent = event.title;
                    eventDiv.dataset.eventId = event.id;
                    eventDiv.addEventListener('click', (e) => {
                        e.stopPropagation();
                        openEventModal(event);
                    });
                    timeSlot.appendChild(eventDiv);
                });
                
                // Add click event to add new event at this time
                timeSlot.addEventListener('click', () => {
                    const newEvent = {
                        id: events.length + 1,
                        title: '',
                        date: dayDate,
                        startTime: `${hour < 10 ? '0' + hour : hour}:00`,
                        endTime: `${(hour + 1) < 10 ? '0' + (hour + 1) : (hour + 1)}:00`,
                        type: '',
                        case: '',
                        color: 'gray'
                    };
                    openEventModal(newEvent);
                });
                
                timeRow.appendChild(timeSlot);
            }
            
            weekView.appendChild(timeRow);
        }
    }

    function renderDayView() {
        dayView.innerHTML = '';
        
        // Update single day header
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
        
        singleDayHeader.textContent = `${dayNames[currentDate.getDay()]}, ${months[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
        
        // Create time slots (1-hour intervals from 8 AM to 6 PM)
        for (let hour = 8; hour <= 18; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.classList.add('flex', 'border-b', 'border-gray-200', 'py-2');
            
            // Time label
            const timeLabel = document.createElement('div');
            timeLabel.classList.add('w-20', 'text-right', 'pr-4', 'text-gray-500', 'font-medium');
            timeLabel.textContent = `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
            timeSlot.appendChild(timeLabel);
            
            // Event container
            const eventContainer = document.createElement('div');
            eventContainer.classList.add('flex-1');
            
            // Find events for this time slot
            const slotEvents = events.filter(event => {
                const eventDate = event.date;
                const eventStartHour = parseInt(event.startTime.split(':')[0]);
                const eventEndHour = parseInt(event.endTime.split(':')[0]);
                
                return eventDate.getDate() === currentDate.getDate() && 
                       eventDate.getMonth() === currentDate.getMonth() && 
                       eventDate.getFullYear() === currentDate.getFullYear() && 
                       eventStartHour <= hour && eventEndHour > hour;
            });
            
            if (slotEvents.length > 0) {
                slotEvents.forEach(event => {
                    const eventDiv = document.createElement('div');
                    eventDiv.classList.add(`bg-${event.color}-100`, `text-${event.color}-800`, 'p-2', 'mb-1', 'rounded');
                    eventDiv.innerHTML = `
                        <div class="font-medium">${event.title}</div>
                        <div class="text-sm">${event.startTime} - ${event.endTime}</div>
                        ${event.type ? `<div class="text-xs uppercase tracking-wide mt-1">${event.type}</div>` : ''}
                        ${event.case ? `<div class="text-xs mt-1">Case: ${event.case}</div>` : ''}
                    `;
                    eventDiv.dataset.eventId = event.id;
                    eventDiv.addEventListener('click', () => openEventModal(event));
                    eventContainer.appendChild(eventDiv);
                });
            } else {
                // Empty slot - clickable to add new event
                const emptySlot = document.createElement('div');
                emptySlot.classList.add('h-12', 'border', 'border-dashed', 'border-gray-300', 'rounded', 'hover:bg-gray-50', 'cursor-pointer');
                emptySlot.addEventListener('click', () => {
                    const newEvent = {
                        id: events.length + 1,
                        title: '',
                        date: new Date(currentDate),
                        startTime: `${hour < 10 ? '0' + hour : hour}:00`,
                        endTime: `${(hour + 1) < 10 ? '0' + (hour + 1) : (hour + 1)}:00`,
                        type: '',
                        case: '',
                        color: 'gray'
                    };
                    openEventModal(newEvent);
                });
                eventContainer.appendChild(emptySlot);
            }
            
            timeSlot.appendChild(eventContainer);
            dayView.appendChild(timeSlot);
        }
    }

    function openEventModal(event = null) {
        // Populate form with event data if editing
        const eventTitleInput = document.getElementById('event-title');
        const eventDateInput = document.getElementById('event-date');
        const eventStartInput = document.getElementById('event-start');
        const eventEndInput = document.getElementById('event-end');
        const eventTypeInput = document.getElementById('event-type');
        const eventCaseInput = document.getElementById('event-case');
        const eventColorInput = document.getElementById('event-color');
        const eventIdInput = document.getElementById('event-id');
        const deleteEventBtn = document.getElementById('delete-event');
        
        if (event) {
            // Editing existing event
            eventTitleInput.value = event.title;
            eventDateInput.value = event.date.toISOString().split('T')[0];
            eventStartInput.value = event.startTime;
            eventEndInput.value = event.endTime;
            eventTypeInput.value = event.type;
            eventCaseInput.value = event.case;
            eventColorInput.value = event.color;
            eventIdInput.value = event.id;
            
            // Show delete button for existing events
            deleteEventBtn.classList.remove('hidden');
            deleteEventBtn.onclick = () => {
                deleteEvent(event.id);
                closeEventModal();
            };
        } else {
            // Creating new event
            eventTitleInput.value = '';
            eventDateInput.value = currentDate.toISOString().split('T')[0];
            eventStartInput.value = '09:00';
            eventEndInput.value = '10:00';
            eventTypeInput.value = '';
            eventCaseInput.value = '';
            eventColorInput.value = 'blue';
            eventIdInput.value = '';
            
            // Hide delete button for new events
            deleteEventBtn.classList.add('hidden');
        }
        
        // Show modal
        eventModal.classList.remove('hidden');
    }

    function closeEventModal() {
        eventModal.classList.add('hidden');
    }

    function saveEvent(e) {
        e.preventDefault();
        
        // Get form values
        const eventId = document.getElementById('event-id').value;
        const title = document.getElementById('event-title').value;
        const dateStr = document.getElementById('event-date').value;
        const startTime = document.getElementById('event-start').value;
        const endTime = document.getElementById('event-end').value;
        const type = document.getElementById('event-type').value;
        const caseValue = document.getElementById('event-case').value;
        const color = document.getElementById('event-color').value;
        
        // Create date object
        const date = new Date(dateStr);
        
        if (eventId) {
            // Update existing event
            const index = events.findIndex(event => event.id === parseInt(eventId));
            if (index !== -1) {
                events[index] = {
                    ...events[index],
                    title,
                    date,
                    startTime,
                    endTime,
                    type,
                    case: caseValue,
                    color
                };
            }
        } else {
            // Add new event
            const newEvent = {
                id: events.length + 1,
                title,
                date,
                startTime,
                endTime,
                type,
                case: caseValue,
                color
            };
            events.push(newEvent);
        }
        
        // Close modal and re-render calendar
        closeEventModal();
        renderCalendar();
    }

    function deleteEvent(id) {
        const index = events.findIndex(event => event.id === parseInt(id));
        if (index !== -1) {
            events.splice(index, 1);
            renderCalendar();
        }
    }
}
