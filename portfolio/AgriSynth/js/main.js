/**
 * AgriSynth Entry Bootstrap Module
 * Imports and initializes all domain logic controllers
 */

import { initTheme } from './theme.js';
import { initNavigation } from './navigation.js';
import { initSensors } from './sensors.js';
import { initTasks } from './tasks.js';
import { initResources } from './resources.js';
import { initMarket } from './market.js';
import { initLearning } from './learn.js';
import { initModals } from './modal.js';

document.addEventListener('DOMContentLoaded', () => {
    // Bootstrap modular features
    initTheme();
    initModals();
    initNavigation();
    initSensors();
    initTasks();
    initResources();
    initMarket();
    initLearning();

    // Set copyright footer year dynamically
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});
