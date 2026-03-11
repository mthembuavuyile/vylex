// --- !!! IMPORTANT !!! ---
        // Replace the placeholder values in firebaseConfig below with your
        // actual Firebase project configuration details. You can find these
        // in your Firebase project settings -> General tab -> Your apps -> Web app.
        const firebaseConfig = {
            apiKey: "AIzaSyAnEO8oaqwEJzq9yiDnlyCY1qGlGqQt9Es", // Consider environment variables for API keys
            authDomain: "to-do-list-6ce28.firebaseapp.com",
            projectId: "to-do-list-6ce28",
            storageBucket: "to-do-list-6ce28.appspot.com", // Corrected domain
            messagingSenderId: "1029497276623",
            appId: "1:1029497276623:web:1840e90ebcb2b6f4a68fba",
            measurementId: "G-2CGRDCJ3WS"
        };

        // Initialize Firebase
        try {
            if (!firebase.apps.length) { // Avoid re-initializing
                firebase.initializeApp(firebaseConfig);
            }
        } catch (e) {
            console.error("Firebase initialization failed. Ensure config is correct and variables are replaced.", e);
            alert("Error initializing the application. Please check the console and ensure Firebase configuration is set correctly.");
            // Optionally disable UI elements if Firebase fails
        }

        const auth = firebase.auth();
        const db = firebase.firestore();
        const todosCollection = db.collection('todos');

        // --- DOM Elements ---
        const logoutBtn = document.getElementById('logoutBtn');
        const userNameEl = document.getElementById('userName');
        const userNameMobileEl = document.getElementById('userNameMobile');
        const addTaskForm = document.getElementById('addTaskForm');
        const todoInput = document.getElementById('todoInput');
        const prioritySelect = document.getElementById('prioritySelect');
        const tagSelect = document.getElementById('tagSelect');
        const dueDateInput = document.getElementById('dueDateInput');
        const notesInput = document.getElementById('notesInput');
        // Corrected: Reference the actual Add Task button ID
        const addTaskFormBtn = document.getElementById('addTaskFormBtn');
        const errorMessage = document.getElementById('errorMessage');
        const todoList = document.getElementById('todoList');
        const emptyState = document.getElementById('emptyState');
        const noTasksState = document.getElementById('noTasksState');
        const searchInput = document.getElementById('searchInput');
        const tagFilterSelect = document.getElementById('tagFilterSelect');
        const statusFilterSelect = document.getElementById('statusFilterSelect');
        const sortSelect = document.getElementById('sortSelect');
        const navigationTabs = document.getElementById('navigationTabs');
        const tabContents = document.querySelectorAll('.tab-content');
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        const totalTasksEl = document.getElementById('totalTasks');
        const completedTasksEl = document.getElementById('completedTasks');
        const pendingTasksEl = document.getElementById('pendingTasks');
        const overdueTasksEl = document.getElementById('overdueTasks');
        const todaysList = document.getElementById('todaysList');
        const upcomingList = document.getElementById('upcomingList');
        const todaysEmptyState = document.getElementById('todaysEmptyState');
        const upcomingEmptyState = document.getElementById('upcomingEmptyState');
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonthYearEl = document.getElementById('currentMonthYear');
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        const tagsOverviewContainer = document.getElementById('tagsOverviewContainer');
        const noTagsState = document.getElementById('noTagsState'); // For Tags tab
        const tagsListSidebar = document.getElementById('tagsListSidebar');
        const allTagsCountSidebarEl = document.getElementById('allTagsCountSidebar');
        const quickFiltersContainer = document.getElementById('quickFilters');
        const taskDetailModal = document.getElementById('taskDetailModal');
        const closeModalBtn = document.getElementById('closeModal');
        const editTaskForm = document.getElementById('editTaskForm');
        const modalTaskId = document.getElementById('modalTaskId');
        const modalTaskText = document.getElementById('modalTaskText');
        const modalDueDate = document.getElementById('modalDueDate');
        const modalStatus = document.getElementById('modalStatus');
        const modalPriority = document.getElementById('modalPriority');
        const modalTag = document.getElementById('modalTag');
        const modalNotes = document.getElementById('modalNotes');
        const modalErrorMessage = document.getElementById('modalErrorMessage');
        const saveTaskBtn = document.getElementById('saveTaskBtn');
        const deleteTaskBtn = document.getElementById('deleteTaskBtn');
        const notificationToast = document.getElementById('notificationToast');
        const notificationIcon = document.getElementById('notificationIcon');
        const notificationTitle = document.getElementById('notificationTitle');
        const notificationMessage = document.getElementById('notificationMessage');
        const closeNotification = document.getElementById('closeNotification');
        const currentYearEl = document.getElementById('currentYear');
        const dashboardAddTaskBtn = document.getElementById('dashboardAddTaskBtn'); // FAB
        const calendarAddTaskBtn = document.getElementById('calendarAddTaskBtn'); // FAB

        // --- State Variables ---
        let currentUserId = null;
        let allTasks = []; // Holds all raw tasks for the current user from Firestore
        let currentCalendarDate = new Date();
        let unsubscribeSnapshot = null; // To stop listener on logout
        let activeQuickFilter = 'all'; // Sidebar quick filter: 'all', 'today', 'week', 'high', 'overdue'
        let activeSidebarTagFilter = 'all'; // Sidebar tag filter: 'all', 'work', 'personal', etc.
        let notificationTimeout = null; // To manage notification timer

        // --- Utility Functions ---
        const showNotification = (type, title, message) => {
            if (notificationTimeout) clearTimeout(notificationTimeout); // Clear previous timer

            notificationTitle.textContent = title;
            notificationMessage.textContent = message;
            // Reset classes first
            notificationToast.className = 'fixed bottom-5 right-5 shadow-lg rounded-lg p-4 transform transition-all duration-500 ease-out flex items-center z-[70] max-w-sm text-white';
            notificationToast.classList.add('opacity-100', 'translate-y-0'); // Make visible

            notificationIcon.innerHTML = ''; // Clear previous icon

            switch (type) {
                case 'success':
                    notificationToast.classList.add('bg-green-600');
                    notificationIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
                    break;
                case 'error':
                    notificationToast.classList.add('bg-red-600');
                    notificationIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
                    break;
                case 'info':
                     notificationToast.classList.add('bg-blue-600');
                     notificationIcon.innerHTML = '<i class="fas fa-info-circle"></i>';
                     break;
                 case 'warning':
                     notificationToast.classList.add('bg-yellow-500'); // Using yellow for warning
                     notificationIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                    break;
                default: // Use gray as default/neutral
                    notificationToast.classList.add('bg-gray-700');
                    notificationIcon.innerHTML = '<i class="fas fa-bell"></i>';
            }

            // Auto-hide after 5 seconds
            notificationTimeout = setTimeout(() => {
                 hideNotification();
            }, 5000);
        };

        const hideNotification = () => {
             if (notificationTimeout) clearTimeout(notificationTimeout);
             notificationToast.classList.remove('opacity-100', 'translate-y-0');
             notificationToast.classList.add('opacity-0', 'translate-y-[200%]');
        };

        closeNotification.addEventListener('click', hideNotification);

        const formatDate = (dateString) => {
            if (!dateString) return 'No date';
            try {
                // Add T00:00:00 to treat the date string as local time, preventing timezone shifts during formatting
                const date = new Date(dateString + 'T00:00:00');
                if (isNaN(date.getTime())) return 'Invalid date'; // Check if date is valid
                return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            } catch (e) {
                console.error("Error formatting date:", dateString, e);
                return 'Invalid date';
            }
        };

        const getTagClass = (tag) => {
            switch (tag) {
                case 'work': return 'tag-work';
                case 'personal': return 'tag-personal';
                case 'school': return 'tag-school';
                case 'shopping': return 'tag-shopping';
                case 'health': return 'tag-health';
                case 'finance': return 'tag-finance';
                default: return 'bg-gray-200 text-gray-800'; // Default tag style
            }
        };

        const getPriorityBorderClass = (priority) => {
            switch (priority) {
                case 'high': return 'priority-high';
                case 'medium': return 'priority-medium';
                case 'low': return 'priority-low';
                default: return '';
            }
        };

        const getPriorityCalendarClass = (priority) => {
            switch (priority) {
                case 'high': return 'calendar-task-high';
                case 'medium': return 'calendar-task-medium';
                case 'low': return 'calendar-task-low';
                default: return 'bg-gray-100 border-l-2 border-gray-300'; // Default style for calendar tasks
            }
        };

        const priorityValue = (priority) => {
            switch (priority) {
                case 'high': return 3;
                case 'medium': return 2;
                case 'low': return 1;
                default: return 0;
            }
        };

        const getLocalDateString = (date) => {
             // Returns date in "YYYY-MM-DD" format adjusted for local timezone
             const year = date.getFullYear();
             const month = (date.getMonth() + 1).toString().padStart(2, '0');
             const day = date.getDate().toString().padStart(2, '0');
             return `${year}-${month}-${day}`;
        };

        // --- Authentication ---
        auth.onAuthStateChanged(user => {
            if (user) {
                console.log("User detected:", user.uid);
                currentUserId = user.uid;
                const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
                userNameEl.textContent = displayName;
                userNameMobileEl.textContent = displayName;
                loadTasks(); // Fetch tasks for the logged-in user
                setInitialDueDate(); // Set date input defaults
            } else {
                console.log("No user detected, redirecting to login.");
                currentUserId = null;
                if (unsubscribeSnapshot) {
                    console.log("Unsubscribing Firestore listener.");
                    unsubscribeSnapshot();
                    unsubscribeSnapshot = null;
                }
                allTasks = []; // Clear local task cache
                renderAll(); // Clear UI
                // Redirect to login page (ensure login.html exists or change path)
                if (window.location.pathname !== '/login.html' && window.location.pathname !== '/login') { // Avoid redirect loop
                     window.location.href = 'login.html';
                }
            }
        });

        logoutBtn.addEventListener('click', () => {
            auth.signOut().catch(error => {
                console.error("Logout failed: ", error);
                showNotification('error', 'Logout Failed', error.message);
            });
             // onAuthStateChanged will handle redirect and cleanup
        });

        // --- Task Management ---
        const loadTasks = () => {
            if (!currentUserId || !db) {
                 console.warn("loadTasks called without user ID or DB not initialized.");
                 return;
            }
            console.log("loadTasks: Setting up snapshot listener for user:", currentUserId);

            if (unsubscribeSnapshot) {
                console.log("loadTasks: Unsubscribing previous listener.");
                unsubscribeSnapshot();
            }

            const q = todosCollection.where('userId', '==', currentUserId);

            unsubscribeSnapshot = q.onSnapshot(snapshot => {
                console.log("loadTasks: Snapshot received, task count:", snapshot.docs.length);
                allTasks = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        text: data.text || '',
                        completed: data.completed || false,
                        priority: data.priority || 'medium',
                        tag: data.tag || null,
                        dueDate: data.dueDate || null,
                        notes: data.notes || null,
                        // Ensure createdAt is a Firestore Timestamp or null
                        createdAt: data.createdAt instanceof firebase.firestore.Timestamp ? data.createdAt : null,
                        userId: data.userId
                    };
                });
                renderAll(); // Render everything after getting data
            }, error => {
                console.error("Error fetching tasks: ", error);
                showNotification('error', 'Loading Error', 'Could not fetch tasks.');
                allTasks = []; // Clear tasks on error
                renderAll(); // Re-render empty state
            });
        };

        // Central render function called after data changes or filter/tab changes
        const renderAll = () => {
             // Check if Firestore is available before rendering
             if (!db) {
                 console.warn("Firestore not initialized, skipping render.");
                 return;
             }
             const filteredTasks = filterAndSortTasks(); // Apply all active filters
             updateStatistics();
             renderTaskList(filteredTasks); // Pass filtered tasks to the list renderer
             renderDashboardLists(); // Uses allTasks but filters internally
             renderCalendar(); // Uses allTasks but filters internally
             renderTagsTab(); // Uses allTasks but filters internally
             updateSidebarTags(); // Uses allTasks to update counts
        };

        // Applies ALL active filters (sidebar + task tab if active) and sorts
        const filterAndSortTasks = () => {
            let tasksToDisplay = [...allTasks]; // Start with a copy of all raw tasks
            const searchTerm = searchInput.value.toLowerCase();
            const statusFilter = statusFilterSelect.value; // Task tab status dropdown
            const tagFilter = tagFilterSelect.value;       // Task tab tag dropdown
            const sortBy = sortSelect.value;               // Task tab sort dropdown

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
            const todayStr = getLocalDateString(today);
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Start of week (Monday)
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7); // End of week (next Monday morning)


            // 1. Apply Sidebar Quick Filters (Global - operates on allTasks)
            // These filters primarily target *active* tasks unless overridden later.
            switch (activeQuickFilter) {
                case 'today':
                    tasksToDisplay = tasksToDisplay.filter(task => !task.completed && task.dueDate === todayStr);
                    break;
                case 'week':
                    tasksToDisplay = tasksToDisplay.filter(task => {
                        if (task.completed || !task.dueDate) return false;
                        // Use T00:00:00 for consistent date comparison regardless of time component
                        const dueDate = new Date(task.dueDate + 'T00:00:00');
                        // Due date is on or after start of today AND before end of week
                        return dueDate >= today && dueDate < endOfWeek;
                    });
                    break;
                case 'high':
                    tasksToDisplay = tasksToDisplay.filter(task => !task.completed && task.priority === 'high');
                    break;
                case 'overdue':
                     tasksToDisplay = tasksToDisplay.filter(task => {
                          if (task.completed || !task.dueDate) return false;
                          const dueDate = new Date(task.dueDate + 'T00:00:00');
                          return dueDate < today; // Due before the start of today
                     });
                    break;
                case 'all': // 'Show All Active' - Default state
                default:
                    // If 'Show All Active' is selected, we start by filtering for active tasks.
                    // The Task Tab's status filter might override this later if that tab is active.
                    tasksToDisplay = tasksToDisplay.filter(task => !task.completed);
                    break;
            }

             // 2. Apply Sidebar Tag Filter (Global - operates on the result of step 1)
             if (activeSidebarTagFilter !== 'all') {
                 tasksToDisplay = tasksToDisplay.filter(task => {
                     // Handle 'No Tag' case if needed (although sidebar doesn't have explicit 'No Tag' yet)
                     if (activeSidebarTagFilter === 'none') return !task.tag;
                     return task.tag === activeSidebarTagFilter;
                 });
             }

            // 3. Apply Task Tab Specific Filters & Sort (ONLY if Tasks tab is active)
            const activeTabId = document.querySelector('#navigationTabs .tab-button.active')?.getAttribute('data-tab');
            if (activeTabId === 'tasks') {
                // a. Status Filter (Tasks Tab Dropdown) - Overrides sidebar active/inactive focus
                if (statusFilter !== 'all') {
                    // Re-filter based *only* on the dropdown selection, ignoring previous active/inactive filtering
                    // We need to start from the result of the *sidebar tag filter* (step 2) before applying status
                    let tasksAfterSidebarFilters = [...allTasks]; // Re-fetch all tasks first
                     if (activeSidebarTagFilter !== 'all') { // Re-apply sidebar tag filter
                         tasksAfterSidebarFilters = tasksAfterSidebarFilters.filter(task => {
                            if (activeSidebarTagFilter === 'none') return !task.tag;
                            return task.tag === activeSidebarTagFilter;
                         });
                     }
                    // Now apply the status dropdown filter
                    tasksToDisplay = tasksAfterSidebarFilters.filter(task => (statusFilter === 'completed' ? task.completed : !task.completed));
                } else {
                    // If 'All Tasks' is selected in the status dropdown, ensure we are showing both active & completed
                    // that match the sidebar tag filter.
                    let tasksAfterSidebarTagFilter = [...allTasks]; // Re-fetch all tasks
                     if (activeSidebarTagFilter !== 'all') { // Re-apply sidebar tag filter
                         tasksAfterSidebarTagFilter = tasksAfterSidebarTagFilter.filter(task => {
                            if (activeSidebarTagFilter === 'none') return !task.tag;
                            return task.tag === activeSidebarTagFilter;
                         });
                     }
                    tasksToDisplay = tasksAfterSidebarTagFilter; // Show all statuses matching sidebar tag filter
                }


                // b. Tag Filter (Tasks Tab Dropdown) - Applied to the result of 3a
                if (tagFilter !== 'all') {
                    if (tagFilter === 'none') {
                        tasksToDisplay = tasksToDisplay.filter(task => !task.tag);
                    } else {
                        tasksToDisplay = tasksToDisplay.filter(task => task.tag === tagFilter);
                    }
                }

                 // c. Search Filter (Tasks Tab Input) - Applied to the result of 3b
                 if (searchTerm) {
                     tasksToDisplay = tasksToDisplay.filter(task =>
                         task.text.toLowerCase().includes(searchTerm) ||
                         (task.notes && task.notes.toLowerCase().includes(searchTerm))
                     );
                 }

                // d. Sorting (Tasks Tab Dropdown) - Applied last to the filtered list
                tasksToDisplay.sort((a, b) => {
                    switch (sortBy) {
                        case 'priority':
                            const priorityDiff = priorityValue(b.priority) - priorityValue(a.priority);
                            if (priorityDiff !== 0) return priorityDiff;
                            const dateA_p = a.dueDate ? new Date(a.dueDate + 'T00:00:00') : new Date(9999, 0, 1);
                            const dateB_p = b.dueDate ? new Date(b.dueDate + 'T00:00:00') : new Date(9999, 0, 1);
                            return dateA_p - dateB_p; // Secondary sort: earlier due date first
                        case 'createdAt':
                            // Ensure createdAt is valid before calling toDate()
                            const timeA = a.createdAt ? a.createdAt.toDate().getTime() : 0;
                            const timeB = b.createdAt ? b.createdAt.toDate().getTime() : 0;
                            return timeB - timeA; // Newest first
                        case 'name':
                            return a.text.localeCompare(b.text);
                        case 'dueDate':
                        default:
                             const dateA = a.dueDate ? new Date(a.dueDate + 'T00:00:00') : new Date(9999, 0, 1); // Nulls last
                             const dateB = b.dueDate ? new Date(b.dueDate + 'T00:00:00') : new Date(9999, 0, 1);
                             const dateDiff = dateA - dateB; // Earliest first
                             if (dateDiff !== 0) return dateDiff;
                            return priorityValue(b.priority) - priorityValue(a.priority); // Secondary sort: higher priority first
                    }
                });
             } else {
                  // Default sort for OTHER tabs (Dashboard, Calendar, Tags) - Due Date, then Priority
                  // Applied to the result of step 2 (sidebar filters)
                   tasksToDisplay.sort((a, b) => {
                       const dateA = a.dueDate ? new Date(a.dueDate + 'T00:00:00') : new Date(9999, 0, 1);
                       const dateB = b.dueDate ? new Date(b.dueDate + 'T00:00:00') : new Date(9999, 0, 1);
                       const dateDiff = dateA - dateB;
                       if (dateDiff !== 0) return dateDiff;
                       return priorityValue(b.priority) - priorityValue(a.priority);
                   });
             }

            return tasksToDisplay; // Return the final filtered and sorted list
        };

        // Renders the main task list in the "Tasks" tab
        const renderTaskList = (tasks) => {
            todoList.innerHTML = ''; // Clear existing list

            // Determine which empty state to show based on filtering result vs raw data
            const isAnyTaskPresentGlobally = allTasks.length > 0;
            const isFilteredListEmpty = tasks.length === 0;

            // Show "No tasks added yet" state ONLY if allTasks is empty
            noTasksState.classList.toggle('hidden', isAnyTaskPresentGlobally);
            // Show "No tasks match filter" state ONLY if tasks exist globally, but the current filter yields none
            emptyState.classList.toggle('hidden', !isAnyTaskPresentGlobally || !isFilteredListEmpty);

            if (!isFilteredListEmpty) {
                tasks.forEach(task => {
                    todoList.appendChild(createTaskElement(task)); // Use full task element view
                });
            }
        };

        // Creates a single task list item (li element)
        // isCompact controls whether to render a smaller version (e.g., for dashboard)
        const createTaskElement = (task, isCompact = false) => {
            const li = document.createElement('li');
            // Added role="listitem" for better semantics
            li.className = `todo-item flex items-center justify-between p-3 rounded-lg border border-gray-200 mb-2 ${getPriorityBorderClass(task.priority)} ${task.completed ? 'completed bg-gray-50' : 'bg-white'} transition-all duration-200`;
            li.dataset.taskId = task.id;
            li.setAttribute('role', 'listitem');

            const contentDiv = document.createElement('div');
            contentDiv.className = 'flex items-center flex-grow overflow-hidden mr-2';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.className = 'mr-3 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0 cursor-pointer';
            checkbox.setAttribute('aria-label', `Mark task ${task.text} as ${task.completed ? 'incomplete' : 'complete'}`);
            checkbox.addEventListener('change', async (e) => {
                e.stopPropagation();
                await updateTaskCompletion(task.id, checkbox.checked);
            });

            const textContainer = document.createElement('div');
            textContainer.className = 'flex flex-col overflow-hidden';

            const textSpan = document.createElement('span');
            textSpan.className = `task-text font-medium ${isCompact ? 'text-sm' : 'text-base'} ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'} truncate`;
            textSpan.textContent = task.text;
            textSpan.title = task.text; // Tooltip for full text

            const detailsSpan = document.createElement('span');
            detailsSpan.className = `text-xs ${task.completed ? 'text-gray-400' : 'text-gray-500'} mt-1 truncate flex items-center flex-wrap gap-x-2`; // Added gap

            const details = [];
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate + 'T00:00:00');
                const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

                if (!task.completed && dueDate < todayStart) {
                    details.push(`<span class="text-red-500 font-semibold whitespace-nowrap"><i class="fas fa-exclamation-triangle mr-1"></i>Overdue: ${formatDate(task.dueDate)}</span>`);
                } else {
                     details.push(`<span class="whitespace-nowrap"><i class="far fa-calendar-alt mr-1"></i>${formatDate(task.dueDate)}</span>`);
                }
            } else if (!isCompact) {
                 details.push('<span class="text-gray-400 italic whitespace-nowrap">No due date</span>');
            }

            if (task.tag) {
                details.push(`<span class="tag ${getTagClass(task.tag)} !p-0.5 !px-1.5 !text-[10px] !mr-0">${task.tag}</span>`);
            }

            detailsSpan.innerHTML = details.join('');

            contentDiv.appendChild(checkbox);
            textContainer.appendChild(textSpan);
            textContainer.appendChild(detailsSpan);
            contentDiv.appendChild(textContainer);

            // Action Buttons (Delete) - only show in non-compact view
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'flex-shrink-0';
            if (!isCompact) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'text-gray-400 hover:text-red-600 ml-2 px-1 transition duration-150 focus:outline-none focus:ring-2 focus:ring-red-300 rounded';
                deleteBtn.innerHTML = '<i class="fas fa-trash fa-sm"></i>';
                deleteBtn.title = "Delete Task";
                deleteBtn.setAttribute('aria-label', `Delete task ${task.text}`);
                deleteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete task: "${task.text}"?`)) {
                        await deleteTask(task.id);
                    }
                });
                actionsDiv.appendChild(deleteBtn);
            }

            li.appendChild(contentDiv);
            li.appendChild(actionsDiv);

            // Click on list item to open modal
            li.addEventListener('click', (e) => {
                // Ensure the click wasn't on the checkbox or delete button
                if (e.target !== checkbox && !actionsDiv.contains(e.target)) {
                    openTaskModal(task.id);
                }
            });

            return li;
        };

        // Updates task completion status in Firestore
        const updateTaskCompletion = async (taskId, isCompleted) => {
             if (!currentUserId || !db) return;
             const taskRef = todosCollection.doc(taskId);
             try {
                 await taskRef.update({ completed: isCompleted });
                 showNotification('success', 'Task Updated', `Task marked as ${isCompleted ? 'complete' : 'active'}.`);
                  // Snapshot listener handles UI update automatically
             } catch (error) {
                 console.error("Error updating task completion: ", error);
                 showNotification('error', 'Update Failed', 'Could not update task status.');
                 // Optionally revert checkbox optimistically (snapshot should correct it anyway)
                 const checkbox = document.querySelector(`li[data-task-id="${taskId}"] input[type="checkbox"]`);
                 if (checkbox) checkbox.checked = !isCompleted;
             }
        };

         // Deletes a task from Firestore
         const deleteTask = async (taskId) => {
             if (!currentUserId || !db) return;
             const taskRef = todosCollection.doc(taskId);
             try {
                 await taskRef.delete();
                 showNotification('info', 'Task Deleted', 'Task successfully removed.');
                 closeTaskModal(); // Ensure modal is closed if this task was being edited
                  // Snapshot listener handles UI update automatically
             } catch (error) {
                 console.error("Error deleting task: ", error);
                 showNotification('error', 'Delete Failed', 'Could not delete task.');
             }
         };

        // Handles the submission of the "Add New Task" form
        addTaskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearError(errorMessage); // Clear previous form errors

            const text = todoInput.value.trim();
            const priority = prioritySelect.value;
            const tag = tagSelect.value;
            const dueDate = dueDateInput.value; // Already in YYYY-MM-DD format
            const notes = notesInput.value.trim();

            if (!text) {
                displayError('Task description cannot be empty.', errorMessage);
                todoInput.focus();
                return;
            }
            if (!currentUserId || !db) {
                 displayError('User not logged in or database unavailable. Cannot add task.', errorMessage);
                 return;
            }

            addTaskFormBtn.disabled = true; // Disable button during operation
            addTaskFormBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Adding...'; // Indicate loading

            try {
                const newTask = {
                    text,
                    userId: currentUserId,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    completed: false,
                    priority,
                    tag: tag || null,
                    dueDate: dueDate || null,
                    notes: notes || null,
                };
                await todosCollection.add(newTask);
                showNotification('success', 'Task Added', `"${text.substring(0, 30)}${text.length > 30 ? '...' : ''}" added.`);
                addTaskForm.reset(); // Clear the form
                setInitialDueDate(); // Reset due date to default (today)
                 // Snapshot listener will update the UI
            } catch (error) {
                console.error("Error adding task: ", error);
                displayError(`Error adding task: ${error.message}`, errorMessage);
                showNotification('error', 'Add Failed', 'Could not add the task.');
            } finally {
                addTaskFormBtn.disabled = false; // Re-enable button
                addTaskFormBtn.innerHTML = '<i class="fas fa-plus mr-2"></i>Add Task'; // Reset button text
            }
        });

        // --- Filtering and Sorting Listeners (Task Tab) ---
        searchInput.addEventListener('input', () => renderAll());
        tagFilterSelect.addEventListener('change', () => renderAll());
        statusFilterSelect.addEventListener('change', () => renderAll());
        sortSelect.addEventListener('change', () => renderAll());

        // --- Sidebar Quick Filters ---
        quickFiltersContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.filter-button');
            if (!button || button.classList.contains('active')) return;

            const filter = button.dataset.filter;
            activeQuickFilter = filter;

            // Update active class for quick filters
            quickFiltersContainer.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // When a quick filter is applied, it often implies viewing 'active' tasks.
            // Reset the Tasks tab status dropdown to 'Active' unless the quick filter itself is 'Show All Active'.
            // If the user explicitly selected 'Completed' or 'All Tasks' in the dropdown, changing the quick filter
            // will reset it back to 'Active' for consistency, focusing the quick filter's intent.
            statusFilterSelect.value = 'active';

            renderAll(); // Re-render based on new quick filter
        });

         // --- Sidebar Tag Filters ---
        tagsListSidebar.addEventListener('click', (e) => {
             const tagItem = e.target.closest('.filter-tag-button');
             if (!tagItem || tagItem.classList.contains('active')) return;

             const tagFilter = tagItem.dataset.tagFilter;
             activeSidebarTagFilter = tagFilter;

             // Update active class for sidebar tags
             tagsListSidebar.querySelectorAll('.filter-tag-button').forEach(item => item.classList.remove('active'));
             tagItem.classList.add('active');

             renderAll(); // Re-render based on new sidebar tag filter
        });

        // --- Tab Switching ---
        navigationTabs.addEventListener('click', (e) => {
            const button = e.target.closest('.tab-button');
            if (!button || button.classList.contains('active')) return;
            const tabId = button.dataset.tab;
            switchTab(tabId);
        });

        function switchTab(tabId) {
            console.log("Switching to tab:", tabId);
            // Update button active states
            navigationTabs.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.tab === tabId);
            });

            // Show/hide content panes
            tabContents.forEach(content => {
                content.classList.toggle('hidden', content.id !== `${tabId}-tab`);
            });

            // Hide/show relevant FABs based on tab
            dashboardAddTaskBtn.classList.toggle('hidden', tabId !== 'dashboard');
            calendarAddTaskBtn.classList.toggle('hidden', tabId !== 'calendar');

            // Close mobile sidebar on tab switch
            if (sidebar.classList.contains('show')) {
                 toggleSidebar();
            }

             // Re-render content. Crucial because filter/sort logic depends on the active tab.
             renderAll();

             // Optional: Scroll to top of the main content area on tab switch
             document.querySelector('main')?.scrollTo(0, 0);
        }

        // --- Floating Action Button (FAB) Listeners ---
        dashboardAddTaskBtn.addEventListener('click', () => {
            switchTab('tasks');
            // Optional: Scroll the add task form into view
            document.getElementById('addTaskForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('todoInput')?.focus(); // Focus the input field
        });

        calendarAddTaskBtn.addEventListener('click', () => {
            switchTab('tasks');
            // Optional: Scroll the add task form into view
            document.getElementById('addTaskForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('todoInput')?.focus(); // Focus the input field
        });


        // --- Mobile Sidebar ---
        menuToggle.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', toggleSidebar);

        function toggleSidebar() {
            sidebar.classList.toggle('show');
            overlay.classList.toggle('show');
            // Prevent body scrolling when sidebar is open
            document.body.style.overflow = sidebar.classList.contains('show') ? 'hidden' : '';
            // Ensure overlay doesn't block clicks when hidden visually
            overlay.classList.toggle('pointer-events-none', !overlay.classList.contains('show'));
        }

         // --- Dashboard Updates ---
         const updateStatistics = () => {
             const now = new Date();
             const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
             let completedCount = 0;
             let pendingCount = 0;
             let overdueCount = 0;

             allTasks.forEach(task => {
                 if (task.completed) {
                     completedCount++;
                 } else {
                     pendingCount++;
                     if (task.dueDate) {
                         const dueDate = new Date(task.dueDate + 'T00:00:00'); // Compare dates only
                         if (dueDate < today) {
                             overdueCount++;
                         }
                     }
                 }
             });

             totalTasksEl.textContent = allTasks.length;
             completedTasksEl.textContent = completedCount;
             pendingTasksEl.textContent = pendingCount;
             overdueTasksEl.textContent = overdueCount;
         };

         const renderDashboardLists = () => {
             const now = new Date();
             const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
             const todayStr = getLocalDateString(today);
             const endOfWeek = new Date(today);
             endOfWeek.setDate(today.getDate() + 7); // Tasks due up to 7 days from now (exclusive of day 7 morning)

             // Filter for Today's Tasks (active, due today) based on sidebar filters
             const todaysTasks = filterAndSortTasks().filter(task => !task.completed && task.dueDate === todayStr);
                                       // Sorting is already handled by filterAndSortTasks

             // Filter for Upcoming Tasks (active, due after today but within 7 days) based on sidebar filters
             const upcomingTasks = filterAndSortTasks().filter(task => {
                 if (task.completed || !task.dueDate || task.dueDate === todayStr) return false;
                 const dueDate = new Date(task.dueDate + 'T00:00:00');
                 return dueDate > today && dueDate < endOfWeek;
             }); // Sorting handled by filterAndSortTasks

             // Render Today's List
             todaysList.innerHTML = '';
             if (todaysTasks.length > 0) {
                 todaysTasks.forEach(task => todaysList.appendChild(createTaskElement(task, true))); // Use compact view
                 todaysEmptyState.classList.add('hidden');
             } else {
                 todaysEmptyState.classList.remove('hidden');
             }

             // Render Upcoming List
             upcomingList.innerHTML = '';
             if (upcomingTasks.length > 0) {
                 upcomingTasks.forEach(task => upcomingList.appendChild(createTaskElement(task, true))); // Use compact view
                 upcomingEmptyState.classList.add('hidden');
             } else {
                 upcomingEmptyState.classList.remove('hidden');
             }
         };


         // --- Calendar View ---
         const renderCalendar = () => {
             calendarGrid.innerHTML = ''; // Clear grid
             const year = currentCalendarDate.getFullYear();
             const month = currentCalendarDate.getMonth(); // 0-indexed

             currentMonthYearEl.textContent = currentCalendarDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

             const firstDayOfMonth = new Date(year, month, 1);
             const lastDayOfMonth = new Date(year, month + 1, 0);
             const firstDayWeekday = firstDayOfMonth.getDay(); // 0 = Sunday
             const totalDaysInMonth = lastDayOfMonth.getDate();
             const todayStr = getLocalDateString(new Date());

             // Get tasks relevant to the displayed month view (including padding days)
             const firstDisplayedDate = new Date(year, month, 1 - firstDayWeekday);
             const totalCells = Math.ceil((totalDaysInMonth + firstDayWeekday) / 7) * 7;
             const lastDisplayedDate = new Date(firstDisplayedDate);
             lastDisplayedDate.setDate(firstDisplayedDate.getDate() + totalCells);

             const firstDisplayedDateStr = getLocalDateString(firstDisplayedDate);
             const lastDisplayedDateStr = getLocalDateString(lastDisplayedDate);

             // Filter tasks based on current *sidebar* filters that fall within the calendar view's date range
             const tasksForCalendar = filterAndSortTasks().filter(task =>
                task.dueDate && task.dueDate >= firstDisplayedDateStr && task.dueDate < lastDisplayedDateStr
             );

             let currentDate = new Date(firstDisplayedDate); // Start iterating from the first displayed date

             for (let i = 0; i < totalCells; i++) {
                 const dayCell = document.createElement('div');
                 dayCell.className = 'calendar-day p-1 relative flex flex-col'; // Reduced padding

                 const dayNumberSpan = document.createElement('span');
                 dayNumberSpan.className = 'day-number';
                 dayNumberSpan.textContent = currentDate.getDate();

                 const cellDateStr = getLocalDateString(currentDate);
                 const isCurrentMonth = currentDate.getMonth() === month;

                 dayCell.appendChild(dayNumberSpan);

                 if (!isCurrentMonth) {
                     dayCell.classList.add('other-month');
                 } else {
                     dayCell.dataset.date = cellDateStr; // Store YYYY-MM-DD
                     if (cellDateStr === todayStr) {
                         dayCell.classList.add('today');
                     }
                 }

                 // Add tasks for this specific date from the pre-filtered list
                 const tasksForDay = tasksForCalendar.filter(task => task.dueDate === cellDateStr);
                                                   // Already sorted by filterAndSortTasks

                  const tasksContainer = document.createElement('div');
                  // Added custom scrollbar class
                  tasksContainer.className = 'calendar-tasks-container mt-1 space-y-1 flex-grow overflow-y-auto custom-scrollbar';

                 tasksForDay.forEach(task => {
                     const taskEl = document.createElement('div');
                     taskEl.className = `calendar-task ${getPriorityCalendarClass(task.priority)} ${task.completed ? 'opacity-50 line-through' : ''}`;
                     taskEl.textContent = task.text;
                     taskEl.title = `${task.text}\nPriority: ${task.priority}\n${task.completed ? 'Status: Completed' : 'Status: Active'}`; // Multi-line title
                     taskEl.dataset.taskId = task.id;
                     taskEl.setAttribute('role', 'button');
                     taskEl.tabIndex = 0; // Make focusable
                     taskEl.addEventListener('click', (e) => {
                          e.stopPropagation();
                          openTaskModal(task.id);
                     });
                      taskEl.addEventListener('keydown', (e) => {
                         if (e.key === 'Enter' || e.key === ' ') {
                             e.preventDefault();
                             openTaskModal(task.id);
                         }
                     });
                     tasksContainer.appendChild(taskEl);
                 });

                 dayCell.appendChild(tasksContainer);
                 calendarGrid.appendChild(dayCell);

                 // Move to the next day
                 currentDate.setDate(currentDate.getDate() + 1);
             }
         };

         prevMonthBtn.addEventListener('click', () => {
             currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
             renderCalendar();
         });

         nextMonthBtn.addEventListener('click', () => {
             currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
             renderCalendar();
         });

         // --- Tags Tab & Sidebar Tags ---
         const renderTagsTab = () => {
             tagsOverviewContainer.innerHTML = ''; // Clear container

             // Filter tasks based on current *sidebar* filters first
             const relevantTasks = filterAndSortTasks();
             const tasksWithTags = relevantTasks.filter(task => task.tag);

             const tagGroups = tasksWithTags.reduce((acc, task) => {
                 if (!acc[task.tag]) {
                     acc[task.tag] = [];
                 }
                 acc[task.tag].push(task);
                 return acc;
             }, {});

             const sortedTags = Object.keys(tagGroups).sort();

             // Show empty state if no tagged tasks match current filters
             const noTagsMatchFilters = sortedTags.length === 0 && allTasks.some(t => t.tag); // Check if tags exist globally but not in filter results
             noTagsState.classList.toggle('hidden', sortedTags.length > 0 || !noTagsMatchFilters);


             sortedTags.forEach(tag => {
                 // Tasks within tagGroups are already sorted by filterAndSortTasks
                 const tagTasks = tagGroups[tag];

                 const tagCard = document.createElement('div');
                 tagCard.className = 'bg-white rounded-lg shadow p-4 flex flex-col'; // Use flex-col

                 const title = document.createElement('h3');
                 title.className = 'text-lg font-semibold mb-3 flex items-center flex-shrink-0';
                 // Use tag class directly for styling
                 title.innerHTML = `<span class="tag ${getTagClass(tag)} mr-2">${tag}</span> (${tagTasks.length})`;
                 tagCard.appendChild(title);

                 const taskListUl = document.createElement('ul');
                 // Use custom scrollbar, limit height
                 taskListUl.className = 'space-y-2 flex-grow overflow-y-auto max-h-60 custom-scrollbar';
                 taskListUl.setAttribute('role', 'list');

                 if (tagTasks.length > 0) {
                     tagTasks.forEach(task => {
                         taskListUl.appendChild(createTaskElement(task, true)); // Compact view
                     });
                 }
                 // No need for 'else' as we only create cards for tags with tasks matching filters

                 tagCard.appendChild(taskListUl);
                 tagsOverviewContainer.appendChild(tagCard);
             });
         };

          // Updates the tag list in the sidebar with counts of *active* tasks
          const updateSidebarTags = () => {
             // Clear existing dynamic tags (keep the 'Show All')
             const existingTags = tagsListSidebar.querySelectorAll('.dynamic-tag');
             existingTags.forEach(el => el.remove());

              // Calculate counts for *active* tasks per tag from the raw list
              const activeTagCounts = allTasks.reduce((acc, task) => {
                   if (!task.completed && task.tag) {
                       acc[task.tag] = (acc[task.tag] || 0) + 1;
                   }
                  return acc;
              }, {});

             const sortedTags = Object.keys(activeTagCounts).sort();
             const allTagElement = tagsListSidebar.querySelector('[data-tag-filter="all"]');

              // Update 'Show All Active Tasks' count
              const activeTasksCount = allTasks.filter(task => !task.completed).length;
              if (allTagsCountSidebarEl) {
                    allTagsCountSidebarEl.textContent = activeTasksCount;
              }
             // Update active state for 'Show All' tag button
             allTagElement?.classList.toggle('active', activeSidebarTagFilter === 'all');

             // Add/Update other tags dynamically only if they have active tasks
             sortedTags.forEach(tag => {
                 if (activeTagCounts[tag] > 0) {
                     const li = document.createElement('li');
                     li.className = `dynamic-tag filter-tag-button flex items-center justify-between opacity-80 hover:opacity-100 cursor-pointer p-1 rounded`;
                     li.dataset.tagFilter = tag;
                     li.setAttribute('role', 'button');
                     li.tabIndex = 0; // Make focusable

                     // Use span with tag styles for the name part
                     const tagNameSpanContainer = document.createElement('span');
                     tagNameSpanContainer.className = 'flex items-center overflow-hidden mr-2'; // Container to prevent count overlap
                     const tagNameSpan = document.createElement('span');
                     tagNameSpan.className = `tag ${getTagClass(tag)} !m-0 !mr-2`; // Use tag class directly, remove default margin
                     tagNameSpan.textContent = tag;
                     tagNameSpanContainer.appendChild(tagNameSpan);

                     const countSpan = document.createElement('span');
                     countSpan.className = 'bg-white text-indigo-600 px-2 rounded-full text-xs font-mono flex-shrink-0';
                     countSpan.textContent = activeTagCounts[tag];

                     li.appendChild(tagNameSpanContainer);
                     li.appendChild(countSpan);

                     li.classList.toggle('active', activeSidebarTagFilter === tag);

                     // Add keyboard accessibility for tag selection
                     li.addEventListener('keydown', (e) => {
                         if (e.key === 'Enter' || e.key === ' ') {
                             e.preventDefault();
                             li.click(); // Simulate click
                         }
                     });

                     tagsListSidebar.appendChild(li);
                 }
             });
          };


        // --- Task Detail Modal ---
        const openTaskModal = (taskId) => {
            const task = allTasks.find(t => t.id === taskId);
            if (!task) {
                console.error("Task not found for modal:", taskId);
                showNotification('error', 'Error', 'Could not find task details.');
                return;
            }

            clearError(modalErrorMessage); // Clear previous errors
            modalTaskId.value = task.id;
            modalTaskText.value = task.text;
            modalDueDate.value = task.dueDate || '';
            modalStatus.value = task.completed ? 'true' : 'false';
            modalPriority.value = task.priority || 'medium';
            modalTag.value = task.tag || '';
            modalNotes.value = task.notes || '';

            modalTaskTitle.textContent = `Edit Task`; // Keep title concise
            taskDetailModal.classList.remove('hidden');
            modalTaskText.focus(); // Focus first editable field
        };

        const closeTaskModal = () => {
            taskDetailModal.classList.add('hidden');
            editTaskForm.reset();
            clearError(modalErrorMessage);
            modalTaskTitle.textContent = 'Task Details';
        };

        closeModalBtn.addEventListener('click', closeTaskModal);
        taskDetailModal.addEventListener('click', (e) => {
            if (e.target === taskDetailModal) {
                closeTaskModal();
            }
        });
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
             if (e.key === 'Escape' && !taskDetailModal.classList.contains('hidden')) {
                 closeTaskModal();
             }
        });


        editTaskForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            clearError(modalErrorMessage);

            const taskId = modalTaskId.value;
            const text = modalTaskText.value.trim();
            const dueDate = modalDueDate.value;
            const completed = modalStatus.value === 'true';
            const priority = modalPriority.value;
            const tag = modalTag.value;
            const notes = modalNotes.value.trim();

            if (!text) {
                displayError('Task description cannot be empty.', modalErrorMessage);
                modalTaskText.focus();
                return;
            }
            if (!taskId || !currentUserId || !db) {
                 displayError('Cannot save changes, task ID missing or connection issue.', modalErrorMessage);
                 return;
            }

            saveTaskBtn.disabled = true;
            deleteTaskBtn.disabled = true;
            saveTaskBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';

            try {
                const updatedData = {
                    text,
                    dueDate: dueDate || null,
                    completed,
                    priority,
                    tag: tag || null,
                    notes: notes || null,
                    // Optionally add updatedAt timestamp:
                    // updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };
                await todosCollection.doc(taskId).update(updatedData);
                showNotification('success', 'Task Updated', 'Changes saved successfully.');
                closeTaskModal();
                // Snapshot listener handles UI update
            } catch (error) {
                console.error("Error updating task: ", error);
                displayError(`Error updating task: ${error.message}`, modalErrorMessage);
                showNotification('error', 'Update Failed', 'Could not save changes.');
            } finally {
                saveTaskBtn.disabled = false;
                deleteTaskBtn.disabled = false;
                saveTaskBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Save Changes';
            }
        });

         deleteTaskBtn.addEventListener('click', async () => {
             const taskId = modalTaskId.value;
             const taskText = modalTaskText.value || 'this task';
              if (!taskId || !currentUserId || !db) {
                 displayError('Cannot delete, task ID missing or connection issue.', modalErrorMessage);
                 return;
             }

             if (confirm(`Are you sure you want to permanently delete task: "${taskText}"? This cannot be undone.`)) {
                 saveTaskBtn.disabled = true;
                 deleteTaskBtn.disabled = true;
                 deleteTaskBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Deleting...';

                 await deleteTask(taskId); // deleteTask handles notifications & closing modal
                 // No need to re-enable buttons here as the modal will close on success.
                 // If delete fails, the finally block in editTaskForm submit won't run,
                 // so explicitly re-enable here on failure (or rely on modal close/reopen).
                 // For simplicity, we rely on the modal closing via deleteTask -> closeTaskModal
             }
         });


         // --- Error Handling Helpers ---
         function displayError(message, element) {
             element.textContent = message;
             element.classList.remove('hidden');
         }

         function clearError(element) {
             element.textContent = '';
             element.classList.add('hidden');
         }

         // --- Initialization ---
         const setInitialDueDate = () => {
             // Set default due date for the ADD form to today
             dueDateInput.value = getLocalDateString(new Date());
             // Optional: Prevent selecting past dates in ADD form
             // dueDateInput.min = getLocalDateString(new Date());
         };

        // Set footer year
        currentYearEl.textContent = new Date().getFullYear();

        // Initial setup when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
             // Firebase auth listener (onAuthStateChanged) handles the initial data load.
             // Set default view to dashboard initially
             switchTab('dashboard');

             // Set initial visual state for sidebar filters
             quickFiltersContainer.querySelector('[data-filter="all"]')?.classList.add('active');
             tagsListSidebar.querySelector('[data-tag-filter="all"]')?.classList.add('active');

             // Set default due date for add form
             setInitialDueDate();

             // Hide FABs initially, switchTab will show the correct one
             dashboardAddTaskBtn.classList.add('hidden');
             calendarAddTaskBtn.classList.add('hidden');
        });