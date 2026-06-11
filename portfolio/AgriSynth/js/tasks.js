/**
 * Task Management Module
 * Implements CRUD actions and completion checks with localStorage syncing
 */

import { showToast } from './toast.js';
import { closeModal } from './modal.js';

const STORAGE_KEY = 'agrisynth_tasks';

// Default starter tasks list
const DEFAULT_TASKS = [
    { id: 'task-1', title: 'Water tomato plants (Plot A)', date: 'Today', assignee: 'Avuyile M.', completed: false, timeframe: 'Morning' },
    { id: 'task-2', title: 'Add compost to herb garden (Community Plot)', date: 'Yesterday', assignee: 'Sarah P.', completed: true, timeframe: 'Afternoon' },
    { id: 'task-3', title: 'Harvest lettuce (Plot C)', date: 'Friday', assignee: 'You', completed: false, timeframe: 'Morning' },
    { id: 'task-4', title: 'Pest check on tomato plants', date: 'Yesterday', assignee: 'Sarah P.', completed: true, timeframe: 'All Day' }
];

let tasks = [];

/**
 * Load tasks and register click interactions
 */
export function initTasks() {
    loadTasks();
    renderTasks();

    const saveTaskBtn = document.getElementById('save-task-btn');
    if (saveTaskBtn) {
        saveTaskBtn.addEventListener('click', () => {
            handleCreateTask();
        });
    }

    // Bind event delegation for lists
    ['all-tasks-list', 'dashboard-tasks-list'].forEach(listId => {
        const listEl = document.getElementById(listId);
        if (listEl) {
            // Checkbox change listener
            listEl.addEventListener('change', (e) => {
                if (e.target.matches('input[type="checkbox"]')) {
                    const taskId = e.target.id.replace('chk-', '');
                    toggleTaskCompletion(taskId);
                }
            });

            // Action button click listener (Delete / Edit)
            listEl.addEventListener('click', (e) => {
                const deleteBtn = e.target.closest('.task-delete-btn');
                const editBtn = e.target.closest('.task-edit-btn');
                
                if (deleteBtn) {
                    const taskId = deleteBtn.dataset.taskId;
                    handleDeleteTask(taskId);
                } else if (editBtn) {
                    showToast('Task modification is a premium feature!', 'info');
                }
            });
        }
    });
}

function loadTasks() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            tasks = JSON.parse(raw);
        } catch (err) {
            tasks = [...DEFAULT_TASKS];
        }
    } else {
        tasks = [...DEFAULT_TASKS];
        saveToStorage();
    }
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/**
 * Render tasks to both Dashboard Overview list and Tasks tab list
 */
function renderTasks() {
    const dashList = document.getElementById('dashboard-tasks-list');
    const allList = document.getElementById('all-tasks-list');
    
    if (dashList) {
        // Show first 3 incomplete or important tasks
        const activeTasks = tasks.slice(0, 4); 
        dashList.innerHTML = activeTasks.map(task => renderTaskItemHtml(task, false)).join('');
    }

    if (allList) {
        allList.innerHTML = tasks.map(task => renderTaskItemHtml(task, true)).join('');
    }
}

/**
 * HTML Builder for single task row item
 */
function renderTaskItemHtml(task, showDelete = true) {
    const isChecked = task.completed ? 'checked' : '';
    const completedClass = task.completed ? 'completed' : '';
    
    const deleteButtonHtml = showDelete 
        ? `<button class="btn btn-sm btn-outline task-delete-btn" data-task-id="${task.id}" aria-label="Delete Task"><i class="fas fa-trash"></i></button>`
        : '';

    return `
        <div class="task-item ${completedClass}">
            <div class="task-status">
                <input type="checkbox" id="chk-${task.id}" ${isChecked}>
            </div>
            <div class="task-details">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    <span><i class="fas fa-calendar-alt"></i> ${escapeHtml(task.date || 'Anytime')}</span>
                    <span><i class="fas fa-user"></i> ${escapeHtml(task.assignee || 'Unassigned')}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn btn-sm btn-outline task-edit-btn" aria-label="Edit Task"><i class="fas fa-edit"></i></button>
                ${deleteButtonHtml}
            </div>
        </div>
    `;
}

/**
 * Toggle completed state of task
 */
function toggleTaskCompletion(id) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveToStorage();
        renderTasks();
        
        const message = tasks[taskIndex].completed ? 'Task completed! Keep it up!' : 'Task set back to active.';
        showToast(message, tasks[taskIndex].completed ? 'success' : 'info');
    }
}

/**
 * Create a new task from inputs
 */
function handleCreateTask() {
    const titleInput = document.getElementById('task-title-input');
    const dateInput = document.getElementById('task-date');
    const assigneeInput = document.getElementById('task-assignee');

    if (!titleInput || !titleInput.value.trim()) {
        showToast('Please provide a task description.', 'error');
        return;
    }

    const newTask = {
        id: 'task-' + Date.now(),
        title: titleInput.value.trim(),
        date: formatDateString(dateInput ? dateInput.value : ''),
        assignee: (assigneeInput && assigneeInput.value.trim()) ? assigneeInput.value.trim() : 'You',
        completed: false
    };

    tasks.push(newTask);
    saveToStorage();
    renderTasks();

    // Reset inputs
    titleInput.value = '';
    if (dateInput) dateInput.value = '';
    if (assigneeInput) assigneeInput.value = '';

    closeModal('add-task-modal');
    showToast('Task scheduled successfully!', 'success');
}

/**
 * Delete task from storage
 */
function handleDeleteTask(id) {
    if (confirm('Are you sure you want to remove this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveToStorage();
        renderTasks();
        showToast('Task has been deleted.', 'info');
    }
}

/**
 * Simple helper to format standard input dates cleanly
 */
function formatDateString(val) {
    if (!val) return 'Anytime';
    const parts = val.split('-');
    if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    return val;
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}
