/**
 * Sensors & IoT Simulation Manager
 * Simulates real-time IoT feeds, manages custom paired sensors, and builds animated analytics charts
 */

import { showToast } from './toast.js';
import { closeModal } from './modal.js';

const STORAGE_KEY = 'agrisynth_sensors';
let sensorInterval = null;

const DEFAULT_SENSORS = [
    {
        id: 'sns-1',
        name: 'Soil Probe #104',
        type: 'soil',
        location: 'Rooftop Garden A',
        status: 'Active',
        readings: { ph: '6.8', moisture: '65%', temp: '21°C' },
        lastUpdated: '2 mins ago'
    },
    {
        id: 'sns-2',
        name: 'Weather Array (Micro)',
        type: 'weather',
        location: 'Balcony Plot B',
        status: 'Active',
        readings: { temp: '23°C', humidity: '60%', light: '90%' },
        lastUpdated: '1 min ago'
    }
];

let sensors = [];

export function initSensors() {
    loadSensors();
    renderSensors();

    const refreshBtn = document.getElementById('refresh-btn');
    const pairSensorBtn = document.getElementById('pair-sensor-btn');
    
    // Listen to prototype page transition events to save CPU/battery
    document.addEventListener('prototypeActive', () => {
        startSensorSimulation();
        animateCharts();
    });

    document.addEventListener('prototypeInactive', () => {
        stopSensorSimulation();
    });

    if (pairSensorBtn) {
        pairSensorBtn.addEventListener('click', () => {
            handlePairSensor();
        });
    }

    // Refresh Data handler
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon) icon.classList.add('fa-spin');
            
            showToast('Syncing with IoT devices...', 'info');

            // 1. Simulate weather details updates
            setTimeout(() => {
                const tempVal = Math.floor(Math.random() * 12 + 15) + '°C'; // 15-27
                const humidityVal = Math.floor(Math.random() * 40 + 40) + '%'; // 40-80
                const uvVal = 'UV ' + (Math.floor(Math.random() * 8) + 2); // 2-10
                const windVal = (Math.floor(Math.random() * 18) + 4) + ' km/h'; // 4-22

                updateElementText('dash-temp', tempVal);
                updateElementText('dash-humidity', humidityVal);
                updateElementText('dash-uv', uvVal);
                updateElementText('dash-wind', windVal);

                // 2. Animate and update sensor graphs
                animateCharts();
                
                // 3. Fast-forward sensor values immediately
                triggerImmediateSensorReading();

                if (icon) icon.classList.remove('fa-spin');
                showToast('Environmental stats successfully synchronized!', 'success');
            }, 1000);
        });
    }

    // Delegate click for sensor history buttons
    const grid = document.getElementById('sensors-grid');
    if (grid) {
        grid.addEventListener('click', (e) => {
            if (e.target.closest('.sensor-details-btn')) {
                showToast('Opening detailed analytics historical log (Demo)...', 'info');
            }
        });
    }
}

function loadSensors() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            sensors = JSON.parse(raw);
        } catch (err) {
            sensors = [...DEFAULT_SENSORS];
        }
    } else {
        sensors = [...DEFAULT_SENSORS];
        saveToStorage();
    }
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sensors));
}

function renderSensors() {
    const grid = document.getElementById('sensors-grid');
    if (!grid) return;

    grid.innerHTML = sensors.map(sns => {
        let statsHtml = '';
        if (sns.type === 'soil') {
            statsHtml = `pH: ${sns.readings.ph}, Moisture: ${sns.readings.moisture}, Temp: ${sns.readings.temp}`;
        } else {
            statsHtml = `Air Temp: ${sns.readings.temp}, Humidity: ${sns.readings.humidity}, Light: ${sns.readings.light}`;
        }

        return `
            <div class="card">
                <div class="card-header">${escapeHtml(sns.location)} - ${escapeHtml(sns.name)}</div>
                <div class="card-body">
                    <p><strong>Status:</strong> <span style="color: var(--primary)">${sns.status}</span> <i class="fas fa-circle" style="color: var(--primary); font-size: 0.8em;"></i></p>
                    <p>${statsHtml}</p>
                    <p><small>Last Reading: ${sns.lastUpdated}</small></p>
                </div>
                <div class="card-footer" style="background-color: transparent; border-top: none;">
                    <button class="btn btn-sm btn-primary sensor-details-btn">View History</button>
                </div>
            </div>
        `;
    }).join('');
}

function handlePairSensor() {
    const nameInput = document.getElementById('sensor-name');
    const typeSelect = document.getElementById('sensor-type');
    const locInput = document.getElementById('sensor-location');

    if (!nameInput || !nameInput.value.trim()) {
        showToast('Please specify a device name.', 'error');
        return;
    }

    const type = typeSelect ? typeSelect.value : 'soil';

    const newSensor = {
        id: 'sns-' + Date.now(),
        name: nameInput.value.trim(),
        type: type,
        location: (locInput && locInput.value.trim()) ? locInput.value.trim() : 'Plot Area',
        status: 'Active',
        readings: type === 'soil' 
            ? { ph: '6.8', moisture: '60%', temp: '22°C' }
            : { temp: '22°C', humidity: '65%', light: '80%' },
        lastUpdated: 'Just now'
    };

    sensors.push(newSensor);
    saveToStorage();
    renderSensors();

    // Reset inputs
    nameInput.value = '';
    if (locInput) locInput.value = '';

    closeModal('add-sensor-modal');
    showToast(`Sensor "${newSensor.name}" successfully paired!`, 'success');
}

/**
 * Update DOM element text content safely
 */
function updateElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

/**
 * Start simulated readings update loop every 3 seconds
 */
function startSensorSimulation() {
    if (sensorInterval) clearInterval(sensorInterval);
    
    sensorInterval = setInterval(() => {
        triggerImmediateSensorReading();
    }, 3000);
}

/**
 * Generate randomized values for sensor parameters and update standard reads + paired sensors in DOM
 */
function triggerImmediateSensorReading() {
    const moisture = Math.floor(Math.random() * 20 + 55) + '%';      // 55-75%
    const ph = (Math.random() * 1.2 + 6.3).toFixed(1);                // 6.3-7.5
    const light = Math.floor(Math.random() * 25 + 70) + '%';         // 70-95%
    const envTemp = Math.floor(Math.random() * 8 + 18) + '°C';       // 18-26°C

    updateElementText('moisture', moisture);
    updateElementText('ph', ph);
    updateElementText('light', light);
    updateElementText('env-temp', envTemp);

    // Update simulation records inside the paired list too
    sensors.forEach(sns => {
        sns.lastUpdated = 'Just now';
        if (sns.type === 'soil') {
            sns.readings.ph = (Math.random() * 1.0 + 6.4).toFixed(1);
            sns.readings.moisture = Math.floor(Math.random() * 15 + 58) + '%';
            sns.readings.temp = Math.floor(Math.random() * 6 + 18) + '°C';
        } else {
            sns.readings.temp = Math.floor(Math.random() * 6 + 18) + '°C';
            sns.readings.humidity = Math.floor(Math.random() * 20 + 50) + '%';
            sns.readings.light = Math.floor(Math.random() * 15 + 78) + '%';
        }
    });
    renderSensors();
}

/**
 * Stop simulated sensor feeds loop
 */
function stopSensorSimulation() {
    if (sensorInterval) {
        clearInterval(sensorInterval);
        sensorInterval = null;
    }
}

/**
 * Animate the heights and dataset values of the soil monitor bars
 */
function animateCharts() {
    const bars = document.querySelectorAll('#soil-chart .chart-bar');
    if (bars.length === 0) return;

    const labels = [
        { label: 'pH', unit: '', min: 6, max: 8, precision: 1 },
        { label: 'Nitrogen (N)', unit: 'ppm', min: 140, max: 220, precision: 0 },
        { label: 'Phosphorus (P)', unit: 'ppm', min: 18, max: 35, precision: 0 },
        { label: 'Potassium (K)', unit: 'ppm', min: 170, max: 240, precision: 0 },
        { label: 'Moisture', unit: '%', min: 50, max: 85, precision: 0 }
    ];

    bars.forEach((bar, index) => {
        // Zero out height first for nice entrance transitions
        bar.style.height = '0%';
        
        setTimeout(() => {
            const config = labels[index] || { label: 'Data', unit: '%', min: 10, max: 90, precision: 0 };
            const randomVal = (Math.random() * (config.max - config.min) + config.min);
            const displayVal = config.precision > 0 ? randomVal.toFixed(config.precision) : Math.floor(randomVal);
            
            // Map height percentage
            const percent = ((randomVal - config.min * 0.5) / (config.max - config.min * 0.5)) * 100;
            const boundedPercent = Math.min(Math.max(percent, 15), 95);
            
            bar.style.height = `${boundedPercent}%`;
            bar.setAttribute('data-value', `${config.label}: ${displayVal}${config.unit}`);
        }, index * 100 + 50); // slight cascade delay for premium feel
    });
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
}
