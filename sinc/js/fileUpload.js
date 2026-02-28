// fileUpload.js

export function initFileUpload() {
    const uploadInput = document.getElementById('file-upload');
    const docList = document.querySelector('#document-list ul');

    if (!uploadInput || !docList) {
        console.warn("File upload DOM elements not found.");
        return;
    }

    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const li = document.createElement('li');
            li.className = "py-2 flex items-center justify-between";
            li.innerHTML = `
                <span class="text-gray-800">${file.name}</span>
                <button class="text-sm text-sky-600 hover:underline">View</button>
            `;
            docList.appendChild(li);
        }
    });

    console.log("File Upload Initialized.");
}
