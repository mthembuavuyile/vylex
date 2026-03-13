// Import initializers from other modules
import { initSidebar } from './sidebar.js';
import { initHeader } from './header.js';
import { initRouter } from './router.js';
import { initTaskTabs } from './uiComponents.js';
import { initClients } from './clients.js';
import { initSettings } from './settings.js';
import { initFileUpload } from './fileUpload.js';
import { initTimeTracking } from './timeTracker.js';
import { initCalendar } from './calendar.js';




// --- Global Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("SINC Dashboard Initializing...");

    initSidebar();
    initHeader();
    initRouter();
    initTaskTabs(); // Initialize task tabs (will only run if task elements exist on current page)
    initClients();  // Initialize client functionality
    initSettings(); // Initialize settings functionality
    initTimeTracking(); // Initialize time tracking functionality
    initFileUpload(); // Initialize file upload functionality
    initCalendar(); // Initialize calendar functionality

    // You could initialize other components here
    // initSomethingElse();

    console.log("SINC Dashboard Ready.");
});
