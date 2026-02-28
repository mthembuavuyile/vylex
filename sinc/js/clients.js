// --- Client Functionality ---
export function initClients() {
    // Client table interactions
    const clientRows = document.querySelectorAll('#clients-content tbody tr');
    clientRows.forEach(row => {
        row.addEventListener('click', (e) => {
            if (!e.target.matches('a')) {
                const clientName = row.querySelector('.text-gray-900').textContent;
                window.location.hash = `client-${clientName.toLowerCase().replace(' ', '-')}`;
            }
        });
    });

    // Add new client button functionality
    const addClientBtn = document.querySelector('#clients-content button');
    const addClientModal = document.getElementById('addClientModal');
    const cancelAddClient = document.getElementById('cancelAddClient');

    if (addClientBtn && addClientModal && cancelAddClient) {
        // Show the modal when "Add Client" is clicked
        addClientBtn.addEventListener('click', () => {
            addClientModal.classList.remove('hidden');
        });

        // Hide the modal when "Cancel" is clicked
        cancelAddClient.addEventListener('click', () => {
            addClientModal.classList.add('hidden');
        });

        // Handle form submission
        const addClientForm = document.getElementById('addClientForm');
        if (addClientForm) {
            addClientForm.addEventListener('submit', function(e) {
                e.preventDefault();

                const name = document.getElementById('clientNameInput').value;
                const email = document.getElementById('clientEmailInput').value;

                console.log("Client Added:", { name, email });

                this.reset();
                addClientModal.classList.add('hidden');

                // Optionally, add the client to a visible list or send to backend
            });
        }
    }
}