const editor = document.getElementById('editor');
        const wordCounter = document.getElementById('wordCounter');
        const themeToggle = document.getElementById('themeToggle');
        const saveBtn = document.getElementById('saveBtn');
        const exportPdfBtn = document.getElementById('exportPdfBtn');
        const alertMessage = document.getElementById('alertMessage');
        const storageKey = 'WriterContent';
        const themeKey = 'WriterTheme';

        // Load content and theme from local storage on page load
        window.onload = () => {
            // Load saved content
            const savedContent = localStorage.getItem(storageKey);
            if (savedContent) {
                editor.innerHTML = savedContent;
                updateWordCount();
            }

            // Load saved theme
            const savedTheme = localStorage.getItem(themeKey);
            if (savedTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        };

        // Update word count
        function updateWordCount() {
            const text = editor.innerText || '';
            const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
            const charCount = text.length;
            wordCounter.textContent = `${wordCount} words, ${charCount} characters`;
        }

        // Save content to local storage
        editor.addEventListener('input', () => {
            localStorage.setItem(storageKey, editor.innerHTML);
            updateWordCount();
        });

        // Add click handler for Save button
        saveBtn.addEventListener('click', () => {
            localStorage.setItem(storageKey, editor.innerHTML);
            showAlert('Document saved successfully!', 'success');
        });

        // Toggle theme
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem(themeKey, 'light');
                themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem(themeKey, 'dark');
                themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            }
        });

        // Export to PDF
        exportPdfBtn.addEventListener('click', () => {
            const element = editor;
            const opt = {
                margin: [15, 15],
                filename: 'Writer_document.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            // Generate PDF
            html2pdf().from(element).set(opt).save()
                .then(() => {
                    showAlert('PDF exported successfully!', 'success');
                })
                .catch(err => {
                    showAlert('Error exporting PDF. Please try again.', 'error');
                    console.error('PDF export error:', err);
                });
        });

        // Formatting functions
        document.getElementById('boldBtn').addEventListener('click', () => {
            document.execCommand('bold', false, null);
            editor.focus();
        });

        document.getElementById('italicBtn').addEventListener('click', () => {
            document.execCommand('italic', false, null);
            editor.focus();
        });

        document.getElementById('underlineBtn').addEventListener('click', () => {
            document.execCommand('underline', false, null);
            editor.focus();
        });

        document.getElementById('strikeBtn').addEventListener('click', () => {
            document.execCommand('strikeThrough', false, null);
            editor.focus();
        });

        document.getElementById('alignLeftBtn').addEventListener('click', () => {
            document.execCommand('justifyLeft', false, null);
            editor.focus();
        });

        document.getElementById('alignCenterBtn').addEventListener('click', () => {
            document.execCommand('justifyCenter', false, null);
            editor.focus();
        });

        document.getElementById('alignRightBtn').addEventListener('click', () => {
            document.execCommand('justifyRight', false, null);
            editor.focus();
        });

        document.getElementById('listBtn').addEventListener('click', () => {
            document.execCommand('insertUnorderedList', false, null);
            editor.focus();
        });

        document.getElementById('numberListBtn').addEventListener('click', () => {
            document.execCommand('insertOrderedList', false, null);
            editor.focus();
        });

        document.getElementById('linkBtn').addEventListener('click', () => {
            const url = prompt('Enter URL:', 'https://');
            if (url) {
                document.execCommand('createLink', false, url);
            }
            editor.focus();
        });

        document.getElementById('clearFormatBtn').addEventListener('click', () => {
            document.execCommand('removeFormat', false, null);
            editor.focus();
        });

        document.getElementById('fontFamily').addEventListener('change', function () {
            if (this.value !== 'inherit') {
                document.execCommand('fontName', false, this.value);
                editor.focus();
            }
        });

        document.getElementById('fontSize').addEventListener('change', function () {
            if (this.value) {
                document.execCommand('fontSize', false, this.value);
                editor.focus();
            }
        });

        // Show alert message
        function showAlert(message, type) {
            alertMessage.textContent = message;
            alertMessage.className = 'alert show alert-' + type;

            // Auto-hide after 3 seconds
            setTimeout(() => {
                alertMessage.classList.remove('show');
            }, 3000);
        }