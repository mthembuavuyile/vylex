// --- Task Tabs ---

const TASK_TAB_BUTTON_SELECTOR = '#task-tabs .task-tab-button';
const TASK_TAB_CONTENT_SELECTOR = '#tasks-list-container .task-tab-content';
const ACTIVE_TAB_CLASS = 'tab-active'; // Matches CSS
const INACTIVE_TAB_CLASS = 'tab-inactive'; // Matches CSS

export function initTaskTabs() {
    const tabButtons = document.querySelectorAll(TASK_TAB_BUTTON_SELECTOR);
    const tabContents = document.querySelectorAll(TASK_TAB_CONTENT_SELECTOR);

    if (!tabButtons.length || !tabContents.length) return; // Don't run if elements aren't present

    // Set initial styles for inactive tabs
    tabButtons.forEach(button => {
        if (!button.classList.contains(ACTIVE_TAB_CLASS)) {
             button.classList.add(INACTIVE_TAB_CLASS);
        }
    });

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.tabTarget + '-list'; // e.g., my-tasks-list
            const targetContent = document.getElementById(targetId);

            // --- Update Button Styles ---
            tabButtons.forEach(btn => {
                btn.classList.remove(ACTIVE_TAB_CLASS);
                btn.classList.add(INACTIVE_TAB_CLASS);
                 // Explicitly remove Tailwind classes associated with active state if needed,
                 // but relying on CSS classes is better. Example:
                 // btn.classList.remove('text-sky-700', 'border-sky-500');
                 // btn.classList.add('text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300', 'border-transparent');
            });
            button.classList.add(ACTIVE_TAB_CLASS);
            button.classList.remove(INACTIVE_TAB_CLASS);
            // button.classList.add('text-sky-700', 'border-sky-500');
            // button.classList.remove('text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300', 'border-transparent');


            // --- Update Content Visibility ---
            tabContents.forEach(content => {
                content.classList.add('hidden');
            });

            if (targetContent) {
                targetContent.classList.remove('hidden');
            } else {
                console.warn(`Task tab content with ID "${targetId}" not found.`);
            }
        });
    });
}

// Add other UI component initializers here if needed
// export function initSomethingElse() { ... }