// js/api/ocr.js
(function () {
    'use strict';

    // ── Inject modal HTML once ──────────────────────────────
    function injectModal() {
        if (document.getElementById('ocr-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'ocr-modal';
        modal.innerHTML = `
        <div id="ocr-backdrop"></div>
        <div id="ocr-panel" role="dialog" aria-label="Text Recognition">
            <div class="ocr-header">
                <span><i class="fas fa-font"></i> Text Recognition</span>
                <button id="ocr-close" aria-label="Close"><i class="fas fa-times"></i></button>
            </div>
            <div class="ocr-tabs">
                <button class="ocr-tab active" data-tab="camera">
                    <i class="fas fa-camera"></i> Camera
                </button>
                <button class="ocr-tab" data-tab="upload">
                    <i class="fas fa-upload"></i> Upload
                </button>
            </div>

            <!-- Camera Tab -->
            <div class="ocr-content active" id="ocr-camera-content">
                <div class="ocr-video-wrap">
                    <video id="ocr-video" autoplay playsinline muted></video>
                    <div id="ocr-text-overlay">
                        <div class="ocr-corners"></div>
                        <p>Point at text to recognize</p>
                    </div>
                </div>
                <div class="ocr-cam-btns">
                    <button id="ocr-capture-btn" class="ocr-btn primary">
                        <i class="fas fa-camera"></i> Capture
                    </button>
                    <button id="ocr-retake-btn" class="ocr-btn secondary" style="display:none">
                        <i class="fas fa-redo"></i> Retake
                    </button>
                    <button id="ocr-recognize-cam-btn" class="ocr-btn primary" style="display:none" disabled>
                        <i class="fas fa-magic"></i> Recognize
                    </button>
                </div>
            </div>

            <!-- Upload Tab -->
            <div class="ocr-content" id="ocr-upload-content">
                <div id="ocr-drop-zone">
                    <i class="fas fa-image fa-2x" style="opacity:.4;margin-bottom:10px;"></i>
                    <p>Drag & drop an image or <label for="ocr-file-input" style="color:var(--primary);cursor:pointer;text-decoration:underline">browse</label></p>
                    <input type="file" id="ocr-file-input" accept="image/*" style="display:none">
                </div>
                <div id="ocr-img-preview" style="display:none">
                    <img id="ocr-preview-img" alt="Preview" style="max-height:180px;border-radius:8px;width:100%;object-fit:contain;">
                    <button id="ocr-remove-img" class="ocr-btn secondary" style="margin-top:8px;width:100%">
                        <i class="fas fa-trash"></i> Remove Image
                    </button>
                </div>
                <button id="ocr-recognize-upload-btn" class="ocr-btn primary" style="display:none;width:100%;margin-top:10px" disabled>
                    <i class="fas fa-magic"></i> Recognize Text
                </button>
            </div>

            <!-- Status & Result -->
            <div class="ocr-status">
                <span id="ocr-status-dot" class="ocr-dot"></span>
                <span id="ocr-status-text">Loading AI model…</span>
            </div>
            <div id="ocr-progress-bar" class="ocr-progress hidden">
                <div id="ocr-progress-fill" class="ocr-progress-fill"></div>
            </div>
            <div id="ocr-result-box" class="ocr-result-box hidden">
                <p id="ocr-result-text"></p>
                <div class="ocr-result-actions">
                    <button id="ocr-copy-btn" class="ocr-btn secondary">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <button id="ocr-send-btn" class="ocr-btn primary">
                        <i class="fas fa-paper-plane"></i> Send to Chat
                    </button>
                </div>
            </div>
        </div>`;
        document.body.appendChild(modal);
        injectStyles();
        initOCRLogic();
    }

    // ── CSS ─────────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('ocr-styles')) return;
        const style = document.createElement('style');
        style.id = 'ocr-styles';
        style.textContent = `
        #ocr-modal { position:fixed;inset:0;z-index:1000;display:none; }
        #ocr-modal.open { display:block; }
        #ocr-backdrop {
            position:fixed;inset:0;
            background:rgba(0,0,0,.5);
            backdrop-filter:blur(4px);
        }
        #ocr-panel {
            position:fixed;
            bottom:0;left:0;right:0;
            background:var(--surface,#fff);
            border-radius:20px 20px 0 0;
            padding:20px 16px 32px;
            max-height:90vh;
            overflow-y:auto;
            box-shadow:0 -4px 32px rgba(0,0,0,.18);
            animation:ocrSlideUp .3s ease;
        }
        @media(min-width:600px){
            #ocr-panel {
                bottom:auto;top:50%;left:50%;
                transform:translate(-50%,-50%);
                max-width:480px;width:100%;
                border-radius:16px;
                animation:ocrFadeIn .25s ease;
            }
        }
        @keyframes ocrSlideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes ocrFadeIn { from{opacity:0;transform:translate(-50%,-46%)} to{opacity:1;transform:translate(-50%,-50%)} }

        .ocr-header {
            display:flex;justify-content:space-between;align-items:center;
            font-weight:600;font-size:.95rem;
            margin-bottom:14px;
            color:var(--text,#111);
        }
        .ocr-header button {
            background:none;border:none;cursor:pointer;
            color:var(--text-muted,#888);font-size:1rem;padding:4px;
        }
        .ocr-tabs {
            display:flex;gap:8px;margin-bottom:14px;
            border-bottom:1px solid var(--border,#eee);
            padding-bottom:10px;
        }
        .ocr-tab {
            background:none;border:none;cursor:pointer;
            padding:6px 14px;border-radius:20px;
            font-size:.85rem;font-weight:500;
            color:var(--text-muted,#888);
            transition:all .18s;
        }
        .ocr-tab.active {
            background:var(--primary,#4f6ef7);color:#fff;
        }
        .ocr-content { display:none; }
        .ocr-content.active { display:block; }

        .ocr-video-wrap {
            position:relative;width:100%;
            border-radius:12px;overflow:hidden;
            background:#000;aspect-ratio:4/3;
            margin-bottom:12px;
        }
        #ocr-video { width:100%;height:100%;object-fit:cover;display:block; }
        #ocr-text-overlay {
            position:absolute;inset:0;
            display:flex;flex-direction:column;
            align-items:center;justify-content:center;
            pointer-events:none;
        }
        #ocr-text-overlay p {
            color:rgba(255,255,255,.7);font-size:.8rem;
            margin-top:8px;background:rgba(0,0,0,.35);
            padding:3px 10px;border-radius:10px;
        }
        .ocr-corners {
            width:180px;height:120px;
            border:2.5px solid rgba(255,255,255,.6);
            border-radius:8px;
            box-shadow:inset 0 0 0 1px rgba(0,0,0,.2);
        }
        .ocr-cam-btns {
            display:flex;gap:8px;justify-content:center;
        }
        #ocr-drop-zone {
            border:2px dashed var(--border,#ddd);
            border-radius:12px;padding:32px 16px;
            text-align:center;cursor:pointer;
            color:var(--text-muted,#888);font-size:.9rem;
            transition:border-color .18s;
        }
        #ocr-drop-zone.dragover { border-color:var(--primary,#4f6ef7); }

        .ocr-btn {
            display:inline-flex;align-items:center;gap:6px;
            padding:9px 18px;border-radius:20px;
            border:none;cursor:pointer;font-size:.85rem;font-weight:600;
            transition:all .15s;font-family:inherit;
        }
        .ocr-btn.primary {
            background:var(--primary,#4f6ef7);color:#fff;
        }
        .ocr-btn.primary:hover { filter:brightness(1.1); }
        .ocr-btn.primary:disabled { opacity:.5;cursor:default; }
        .ocr-btn.secondary {
            background:var(--surface2,#f5f5f5);
            border:1px solid var(--border,#ddd);
            color:var(--text,#111);
        }
        .ocr-status {
            display:flex;align-items:center;gap:7px;
            margin-top:12px;font-size:.8rem;
            color:var(--text-muted,#888);
        }
        .ocr-dot {
            width:8px;height:8px;border-radius:50%;
            background:var(--success,#22c55e);flex-shrink:0;
        }
        .ocr-dot.processing { background:var(--warn,#f59e0b);animation:ocrPulse 1s infinite; }
        .ocr-dot.error { background:var(--error,#ef4444); }
        @keyframes ocrPulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .ocr-progress {
            height:4px;background:var(--border,#eee);
            border-radius:2px;margin-top:8px;overflow:hidden;
        }
        .ocr-progress.hidden { display:none; }
        .ocr-progress-fill {
            height:100%;background:var(--primary,#4f6ef7);
            border-radius:2px;width:0%;transition:width .2s;
        }
        .ocr-result-box {
            margin-top:12px;background:var(--surface2,#f5f5f5);
            border:1px solid var(--border,#eee);
            border-radius:12px;padding:14px;
        }
        .ocr-result-box.hidden { display:none; }
        #ocr-result-text {
            font-size:.9rem;line-height:1.6;color:var(--text,#111);
            white-space:pre-wrap;word-break:break-word;
            margin:0 0 12px;max-height:140px;overflow-y:auto;
        }
        .ocr-result-actions { display:flex;gap:8px; }`;
        document.head.appendChild(style);
    }

    // ── OCR Logic ────────────────────────────────────────────
    function initOCRLogic() {
        let stream = null;
        let worker = null;
        let isReady = false;
        let capturedBlob = null;
        let uploadFile = null;
        let lastText = null;
        let currentTab = 'camera';

        const $ = id => document.getElementById(id);

        // Load Tesseract.js dynamically
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        script.onload = initTesseract;
        document.head.appendChild(script);

        async function initTesseract() {
            setStatus('Loading AI model…', 'processing');
            try {
                worker = await Tesseract.createWorker('eng', 1, {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            const pct = Math.round(m.progress * 100);
                            $('ocr-progress-fill').style.width = pct + '%';
                            setStatus(`Recognizing… ${pct}%`, 'processing');
                        }
                    }
                });
                isReady = true;
                setStatus('Ready', '');
                $('ocr-recognize-cam-btn').disabled = false;
                $('ocr-recognize-upload-btn').disabled = false;
            } catch {
                setStatus('Failed to load AI model', 'error');
            }
        }

        // Tab switching
        document.querySelectorAll('.ocr-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                currentTab = tab.dataset.tab;
                document.querySelectorAll('.ocr-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                document.querySelectorAll('.ocr-content').forEach(c => c.classList.remove('active'));
                $(`ocr-${currentTab}-content`).classList.add('active');
                hideResult();
                if (currentTab === 'camera') startCamera();
                else stopCamera();
            });
        });

        // Camera
        async function startCamera() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
                });
                $('ocr-video').srcObject = stream;
                $('ocr-text-overlay').style.display = 'flex';
                $('ocr-capture-btn').style.display = '';
                $('ocr-retake-btn').style.display = 'none';
                $('ocr-recognize-cam-btn').style.display = 'none';
                capturedBlob = null;
                setStatus('Camera active', '');
            } catch {
                setStatus('Camera unavailable', 'error');
            }
        }

        function stopCamera() {
            if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
        }

        $('ocr-capture-btn').addEventListener('click', () => {
            const video = $('ocr-video');
            video.pause();
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            canvas.toBlob(blob => {
                capturedBlob = blob;
                $('ocr-capture-btn').style.display = 'none';
                $('ocr-retake-btn').style.display = '';
                $('ocr-recognize-cam-btn').style.display = '';
                $('ocr-text-overlay').style.display = 'none';
                setStatus('Image captured. Click Recognize.', '');
            }, 'image/jpeg', 0.95);
        });

        $('ocr-retake-btn').addEventListener('click', () => {
            capturedBlob = null;
            $('ocr-video').play();
            $('ocr-capture-btn').style.display = '';
            $('ocr-retake-btn').style.display = 'none';
            $('ocr-recognize-cam-btn').style.display = 'none';
            $('ocr-text-overlay').style.display = 'flex';
            hideResult();
            setStatus('Camera active', '');
        });

        // Upload
        $('ocr-file-input').addEventListener('change', e => {
            if (e.target.files[0]) loadFile(e.target.files[0]);
        });
        $('ocr-drop-zone').addEventListener('click', () => $('ocr-file-input').click());
        $('ocr-drop-zone').addEventListener('dragover', e => { e.preventDefault(); $('ocr-drop-zone').classList.add('dragover'); });
        $('ocr-drop-zone').addEventListener('dragleave', () => $('ocr-drop-zone').classList.remove('dragover'));
        $('ocr-drop-zone').addEventListener('drop', e => {
            e.preventDefault();
            $('ocr-drop-zone').classList.remove('dragover');
            if (e.dataTransfer.files[0]?.type.startsWith('image/')) loadFile(e.dataTransfer.files[0]);
        });

        function loadFile(file) {
            uploadFile = file;
            const reader = new FileReader();
            reader.onload = e => {
                $('ocr-preview-img').src = e.target.result;
                $('ocr-drop-zone').style.display = 'none';
                $('ocr-img-preview').style.display = '';
                $('ocr-recognize-upload-btn').style.display = '';
                setStatus('Image loaded. Click Recognize.', '');
            };
            reader.readAsDataURL(file);
        }

        $('ocr-remove-img').addEventListener('click', () => {
            uploadFile = null;
            $('ocr-file-input').value = '';
            $('ocr-drop-zone').style.display = '';
            $('ocr-img-preview').style.display = 'none';
            $('ocr-recognize-upload-btn').style.display = 'none';
            hideResult();
            setStatus('Ready to upload image', '');
        });

        // Recognize
        async function recognize(source) {
            if (!isReady || !source) return;
            setStatus('Processing image…', 'processing');
            $('ocr-progress-bar').classList.remove('hidden');
            hideResult();
            try {
                const { data: { text } } = await worker.recognize(source);
                $('ocr-progress-bar').classList.add('hidden');
                if (text.trim()) {
                    lastText = text.trim();
                    $('ocr-result-text').textContent = lastText;
                    $('ocr-result-box').classList.remove('hidden');
                    setStatus('Recognition complete', '');
                } else {
                    setStatus('No text found in image', 'error');
                }
            } catch {
                $('ocr-progress-bar').classList.add('hidden');
                setStatus('Recognition failed', 'error');
            }
        }

        $('ocr-recognize-cam-btn').addEventListener('click', () => recognize(capturedBlob));
        $('ocr-recognize-upload-btn').addEventListener('click', () => recognize(uploadFile));

        // Copy & Send
        $('ocr-copy-btn').addEventListener('click', async () => {
            if (!lastText) return;
            try { await navigator.clipboard.writeText(lastText); } catch {}
        });

        $('ocr-send-btn').addEventListener('click', () => {
            if (!lastText) return;
            closeOCR();
            // Send recognized text into Nexora's chat
            const input = document.getElementById('input');
            const form = document.getElementById('form');
            if (input && form) {
                input.value = `Recognized text from image:\n${lastText}`;
                form.dispatchEvent(new Event('submit', { cancelable: true }));
            }
        });

        // Close
        $('ocr-close').addEventListener('click', closeOCR);
        $('ocr-backdrop').addEventListener('click', closeOCR);

        function closeOCR() {
            stopCamera();
            $('ocr-modal').classList.remove('open');
        }

        // Helpers
        function setStatus(msg, type) {
            $('ocr-status-text').textContent = msg;
            $('ocr-status-dot').className = 'ocr-dot' + (type ? ' ' + type : '');
        }
        function hideResult() {
            $('ocr-result-box').classList.add('hidden');
            lastText = null;
        }

        // Expose open for the registry module
        window._ocrOpen = function () {
            $('ocr-modal').classList.add('open');
            if (currentTab === 'camera') startCamera();
        };
    }

    // ── Registry Module ──────────────────────────────────────
    window.NexoraRegistry.register({
        id: 'ocr',
        name: 'Text Recognition (OCR)',
        example: 'scan text from image',
        intents: [
            /(?:scan|read|recognize|extract|ocr|capture)\s+(?:text|words?|writing)(?:\s+from\s+(?:image|photo|picture|camera))?/i,
            /(?:text\s+from\s+(?:image|photo|picture|camera))/i,
            /(?:open|launch|start)\s+(?:ocr|scanner|text\s+recogni[sz]er)/i,
            /(?:what\s+(?:does\s+)?(?:this|the)\s+(?:image|photo|picture)\s+say)/i,
        ],

        async handle() {
            injectModal();
            // Small delay so the modal DOM is ready
            setTimeout(() => window._ocrOpen?.(), 50);
            return {
                html: `<div class="rich-widget">
                    <div class="widget-title"><i class="fas fa-font"></i> Text Recognition</div>
                    <p style="margin:0;font-size:.88rem;color:var(--text-muted)">
                        The OCR scanner is open. Use your camera or upload an image, 
                        then hit <strong>Send to Chat</strong> to bring the text here.
                    </p>
                </div>`,
                text: 'Opening text recognition. Use camera or upload an image, then send the result to chat.'
            };
        }
    });

})();