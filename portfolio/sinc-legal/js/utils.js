// --- DOM ELEMENT SELECTORS ---
export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => document.querySelectorAll(selector);

export const CONSTANTS = {
    DEFAULT_AVATAR_SVG: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2NkZTVmMyI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHptMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyYzAgMS4xLjkgMiAyIDJoMTRjMS4xIDAgMi0uOSAyLTJ2LTJjMC0yLjY2LTUuMzMtNC04LTR6Ii8+PC9zdmc+",
    // The space between 7.962 and 7.962 has been fixed below
    SPINNER_SVG: `<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`,
    SAVE_CLIENT_TEXT: "Save Client",
    SAVE_CASE_TEXT: "Save Changes",
    SAVE_PROFILE_TEXT: "Save Changes",
    UPLOAD_DOCUMENT_TEXT: "Upload",
    SAVE_EVENT_TEXT: "Save Event",
    SAVE_BILLING_SETTINGS_TEXT: "Save Settings"
};

// --- DATA FORMATTERS ---
export function escapeHTML(str) { if (str == null) return ''; return String(str).replace(/[&<>"']/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s])); }
export function formatDate(ts) { try { if (!ts) return 'N/A'; return (ts.toDate ? ts.toDate() : new Date(ts)).toLocaleDateString(); } catch { return 'N/A'; } }
export function formatBytes(bytes) { if (!bytes && bytes !== 0) return '—'; const s = ['B', 'KB', 'MB', 'GB', 'TB']; if (bytes === 0) return '0 B'; const i = Math.floor(Math.log(bytes) / Math.log(1024)); return `${(bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${s[i]}`; }
export function shortType(ct = '') { const [t, s] = ct.split('/'); if (t === 'application' && s) { if (s.includes('pdf')) return 'PDF'; if (s.includes('word')) return 'DOCX'; if (s.includes('spreadsheet')) return 'XLSX'; if (s.includes('zip')) return 'ZIP'; } return (t === 'image' || t === 'text') ? t.charAt(0).toUpperCase() + t.slice(1) : s ? s.toUpperCase() : t; }
export function typeBadgeClass(ct = '') { if (ct.includes('pdf')) return 'bg-red-100 text-red-800'; if (ct.includes('word')) return 'bg-blue-100 text-blue-800'; if (ct.includes('spreadsheet')) return 'bg-green-100 text-green-800'; if (ct.startsWith('image/')) return 'bg-yellow-100 text-yellow-800'; return 'bg-purple-100 text-purple-800'; }
export function fileTypeIcon(ct = '') { return `<span class="text-purple-700 text-xs font-bold">${escapeHTML(shortType(ct).slice(0, 3).toUpperCase())}</span>`; }
export function getStatusClass(s) { const c = { 'Open': 'bg-green-100 text-green-800', 'In Progress': 'bg-yellow-100 text-yellow-800', 'On Hold': 'bg-gray-200 text-gray-800', 'Closed': 'bg-sky-100 text-sky-800' }; return c[s] || 'bg-gray-100 text-gray-800'; }

export function renderRichContent(text = '') {
    if (!text.trim()) return '<p class="text-gray-500">No description provided.</p>';
    const linkRegex = /(https?:\/\/[^\s<]+)/g;
    const linkify = (str) => str.replace(linkRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    const lines = text.split('\n');
    let html = '', inList = false;
    lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('- ')) {
            if (!inList) { html += '<ul>'; inList = true; }
            html += `<li>${linkify(escapeHTML(trimmedLine.substring(2)))}</li>`;
        } else {
            if (inList) { html += '</ul>'; inList = false; }
            if (trimmedLine.startsWith('## ')) html += `<h4>${linkify(escapeHTML(trimmedLine.substring(3)))}</h4>`;
            else if (trimmedLine.startsWith('# ')) html += `<h3>${linkify(escapeHTML(trimmedLine.substring(2)))}</h3>`;
            else if (trimmedLine) html += `<p>${linkify(escapeHTML(trimmedLine))}</p>`;
            else html += '<br>';
        }
    });
    if (inList) html += '</ul>';
    return html;
}

// --- UI HELPERS ---
export function openModal(modalEl) { modalEl.classList.remove('hidden'); setTimeout(() => { modalEl.firstElementChild.classList.remove('scale-95', 'opacity-0'); modalEl.classList.remove('opacity-0'); }, 10); }
export function closeModal(modalEl) { modalEl.firstElementChild.classList.add('scale-95', 'opacity-0'); modalEl.classList.add('opacity-0'); setTimeout(() => { modalEl.classList.add('hidden'); }, 300); }
export function showError(el, msg) { el.textContent = msg; el.classList.remove('hidden'); }
export function hideError(el) { el.textContent = ''; el.classList.add('hidden'); }
export function setButtonLoading(btn, isLoading, defaultText) { btn.disabled = isLoading; btn.innerHTML = isLoading ? `${CONSTANTS.SPINNER_SVG} Processing...` : defaultText; }
export function setUploadProgress(el, percent) { if (el) el.style.width = `${percent}%`; }

export function showConfirmation(title, message, onConfirm, isError = false) {
    const modal = $('#confirmation-modal'), titleEl = $('#confirmation-title'), msgEl = $('#confirmation-message'), confirmBtn = $('#confirmation-confirm-btn'), cancelBtn = $('#confirmation-cancel-btn');
    titleEl.textContent = title;
    msgEl.innerHTML = message;
    confirmBtn.className = isError ? 'px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700' : 'px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700';
    confirmBtn.textContent = isError ? 'OK' : 'Confirm';
    openModal(modal);
    const confirmHandler = () => { onConfirm(); closeModal(modal); cleanup(); };
    const cancelHandler = () => { closeModal(modal); cleanup(); };
    const cleanup = () => { confirmBtn.removeEventListener('click', confirmHandler); cancelBtn.removeEventListener('click', cancelHandler); };
    confirmBtn.addEventListener('click', confirmHandler, { once: true });
    if (cancelBtn) cancelBtn.addEventListener('click', cancelHandler, { once: true });
}

export function renderEmptyState(container, tbody, title, subtitle, buttonId) { tbody.innerHTML = ''; if (container.querySelector('#empty-state')) container.querySelector('#empty-state').remove(); container.insertAdjacentHTML('beforeend', `<div id="empty-state" class="text-center py-16 px-6"><svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg><h3 class="mt-2 text-lg font-medium text-gray-900">${title}</h3><p class="mt-1 text-sm text-gray-500">${subtitle}</p><div class="mt-6"><button type="button" data-trigger="${buttonId}" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${buttonId.includes('document') ? 'bg-purple-600 hover:bg-purple-700' : 'bg-sky-600 hover:bg-sky-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 empty-state-btn">+ Add New</button></div></div>`); }
export function renderTableSkeleton(tbody, cols, rows) { tbody.innerHTML = Array.from({ length: rows }, () => `<tr class="skeleton-row">${Array.from({ length: cols }, () => `<td class="px-6 py-4"><div class="skeleton loading-skeleton"></div><div class="skeleton-sm loading-skeleton"></div></td>`).join('')}</tr>`).join(''); }
export function renderTableError(tbody, colspan, message) { tbody.innerHTML = `<tr><td colspan="${colspan}" class="text-center py-16 px-6"><div class="flex flex-col items-center"><svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><h3 class="mt-2 text-lg font-medium text-gray-900">An Error Occurred</h3><p class="mt-1 text-sm text-gray-500">${message}</p><p class="mt-2 text-xs text-gray-400">This may be due to a missing database index or network issue. See console for details.</p></div></td></tr>`; }