// --- Settings Functionality ---
export function initSettings() {
    // Settings form submission
    const settingsForm = document.querySelector('#settings-content form');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Simulate saving settings
            setTimeout(() => {
                alert('Settings saved successfully!');
            }, 1000);
        });
    }
}