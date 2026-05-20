const ALL_EMOJI = [
    '😀', '😂', '😍', '🥰', '😎', '🤔', '😭', '😡', '🥺', '🤩', '😴', '🤯',
    '👍', '👎', '❤️', '💔', '💯', '🔥', '✨', '⭐', '🌟', '💫', '🎉', '🎊',
    '🌈', '☀️', '🌙', '⚡', '❄️', '🌊', '🍕', '🍔', '🍦', '🎂', '🍜', '🌮',
    '🐶', '🐱', '🦊', '🐻', '🐼', '🦁', '🐸', '🦋', '🌸', '🌺', '🌻', '🌹',
    '🎵', '🎸', '🎹', '🎤', '🎬', '🎮', '🏆', '⚽', '🎯', '🚀', '🛸', '🌍',
    '💎', '👑', '🗝️', '📸', '💡', '⚙️', '🔮', '🪄', '💣', '🎭', '🖤', '💜',
    '🤘', '🙌', '👏', '🤝', '✌️', '🤞', '💪', '🦄', '🐉', '🦅', '🌵', '🌴'
];

class ImageCraftPro {
    constructor() {
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.wrapper = document.getElementById('canvas-wrapper');

        this.originalImage = null;
        this.displayScale = 1;
        this.isShowingOriginal = false;
        this.drawRAF = null; // Debounce renders

        // Settings & State
        this.state = {
            rotation: 0, flipH: 1, flipV: 1,
            brightness: 0, contrast: 0, saturation: 0, hue: 0,
            blur: 0, sharpen: 0, vignette: 0, noise: 0,
            filter: 'none'
        };

        // Text / Emoji Layers
        this.layers = [];
        this.selectedLayerId = null;
        this.textStyle = { bold: false, italic: false, shadow: false };

        // Cropping
        this.cropState = { active: false, ratio: null, box: { x: 0, y: 0, w: 0, h: 0 } };

        this.initNoisePattern();
        this.initUI();
        this.initEmoji();
    }

    initNoisePattern() {
        this.noiseCanvas = document.createElement('canvas');
        this.noiseCanvas.width = 256; this.noiseCanvas.height = 256;
        const ctx = this.noiseCanvas.getContext('2d');
        const imgData = ctx.createImageData(256, 256);
        for (let i = 0; i < imgData.data.length; i += 4) {
            const v = Math.random() * 255;
            imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = v;
            imgData.data[i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
    }

    initUI() {
        // Drag & Drop Upload
        const zone = document.getElementById('upload-zone');
        const fi = document.getElementById('file-input');
        zone.onclick = () => fi.click();
        fi.onchange = e => e.target.files[0] && this.loadImage(e.target.files[0]);
        zone.ondragover = e => { e.preventDefault(); zone.classList.add('dragover'); };
        zone.ondragleave = () => zone.classList.remove('dragover');
        zone.ondrop = e => { e.preventDefault(); zone.classList.remove('dragover'); e.dataTransfer.files[0] && this.loadImage(e.dataTransfer.files[0]); };

        // Tabs System
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                const tab = btn.dataset.tab;
                document.getElementById('tab-' + tab).classList.add('active');

                if (tab === 'transform') this.startCrop();
                else this.cancelCrop();
            };
        });

        // Accordions
        document.querySelectorAll('.accordion-header').forEach(hdr => {
            hdr.onclick = () => hdr.parentElement.classList.toggle('open');
        });

        // Range Sliders
        document.querySelectorAll('input[type="range"]').forEach(input => {
            input.oninput = () => {
                const val = parseFloat(input.value);
                if (input.id.startsWith('text') || input.id.startsWith('emoji')) return;

                this.state[input.id] = val;
                const units = { hue: '°', blur: 'px', vignette: '%', noise: '%' };
                document.getElementById('val-' + input.id).textContent = val + (units[input.id] || '');
                this.requestDraw();
            };
        });

        // Preset Filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.filter = btn.dataset.filter;
                this.requestDraw();
            };
        });

        // Compare Button
        const comp = document.getElementById('compare-btn');['mousedown', 'touchstart'].forEach(e => comp.addEventListener(e, (ev) => { ev.preventDefault(); this.isShowingOriginal = true; this.requestDraw(); }));['mouseup', 'mouseleave', 'touchend'].forEach(e => comp.addEventListener(e, () => { this.isShowingOriginal = false; this.requestDraw(); }));

        // Global Actions
        document.getElementById('reset-btn').onclick = () => { if (confirm("Start over with a new image?")) location.reload(); };
        document.getElementById('download-btn').onclick = () => this.download();

        // Deselect Layers on canvas click
        document.getElementById('text-overlay').addEventListener('mousedown', (e) => {
            if (e.target.id === 'text-overlay') this.selectLayer(null);
        });

        window.addEventListener('resize', () => { if (this.originalImage) this.scaleWrapper(); });
    }

    // --- CORE LOGIC ---
    loadImage(file) {
        if (!file.type.startsWith('image/')) return this.toast('Invalid image file. Please use JPG or PNG.');
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                document.getElementById('upload-screen').style.display = 'none';
                document.getElementById('editor-layout').classList.add('active');
                document.getElementById('reset-btn').style.display = 'inline-flex';
                document.getElementById('download-btn').style.display = 'inline-flex';
                document.getElementById('compare-btn').style.display = 'inline-flex';
                this.updateCanvasDimensions();
                this.requestDraw();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    updateCanvasDimensions() {
        const MAX = 1600;
        let w = this.originalImage.naturalWidth, h = this.originalImage.naturalHeight;

        // Downscale if too large
        if (w > MAX || h > MAX) { const r = Math.min(MAX / w, MAX / h); w *= r; h *= r; }

        // Swap W/H if rotated 90 or 270
        if (this.state.rotation % 180 !== 0) { const tmp = w; w = h; h = tmp; }

        this.canvas.width = Math.round(w);
        this.canvas.height = Math.round(h);
        this.scaleWrapper();
    }

    scaleWrapper() {
        // Ensure wrapper correctly bounds to the CSS Grid flex space
        const area = document.getElementById('canvas-area');
        const pad = 30; // 15px visual padding
        const aw = area.clientWidth - pad, ah = area.clientHeight - pad;
        const cw = this.canvas.width, ch = this.canvas.height;

        this.displayScale = Math.min(1, aw / cw, ah / ch);
        this.wrapper.style.width = `${cw * this.displayScale}px`;
        this.wrapper.style.height = `${ch * this.displayScale}px`;

        // Update text overlays mathematically
        this.layers.forEach(l => this.updateLayerDOM(l));
        if (this.cropState.active) this.renderCrop();
    }

    requestDraw() {
        if (!this.drawRAF) {
            this.drawRAF = requestAnimationFrame(() => {
                this.draw();
                this.drawRAF = null;
            });
        }
    }

    draw() {
        if (!this.originalImage) return;
        const W = this.canvas.width, H = this.canvas.height;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, W, H);

        // Compile CSS Filters
        let filterStr = 'none';
        if (!this.isShowingOriginal) {
            const s = this.state;
            filterStr = `brightness(${100 + s.brightness}%) contrast(${100 + s.contrast}%) saturate(${100 + s.saturation}%) hue-rotate(${s.hue}deg) `;
            if (s.blur > 0) filterStr += `blur(${s.blur}px) `;

            const presets = {
                grayscale: 'grayscale(100%)', sepia: 'sepia(100%)',
                vintage: 'sepia(50%) contrast(115%) brightness(90%)',
                cool: 'saturate(115%) hue-rotate(-20deg) brightness(105%)',
                warm: 'sepia(30%) saturate(125%) brightness(105%)',
                dramatic: 'contrast(160%) saturate(60%) brightness(85%)',
                fade: 'contrast(80%) brightness(110%) saturate(80%)',
                vivid: 'contrast(110%) saturate(200%)'
            };
            if (presets[s.filter]) filterStr += presets[s.filter];

            // Hardware Accelerated SVG Sharpen
            if (s.sharpen > 0) {
                const str = s.sharpen * 0.5;
                const center = 1 + 4 * str;
                document.getElementById('sharpen-matrix').setAttribute('kernelMatrix', `0 ${-str} 0 ${-str} ${center} ${-str} 0 ${-str} 0`);
                filterStr += ` url(#svg-sharpen)`;
            }
        }

        ctx.filter = filterStr.trim();

        // Draw Base Image with Transform
        ctx.save();
        const isRotated = this.state.rotation % 180 !== 0;
        const imgW = isRotated ? H : W;
        const imgH = isRotated ? W : H;

        ctx.translate(W / 2, H / 2);
        if (this.state.rotation) ctx.rotate(this.state.rotation * Math.PI / 180);
        ctx.scale(this.state.flipH, this.state.flipV);
        ctx.translate(-imgW / 2, -imgH / 2);
        ctx.drawImage(this.originalImage, 0, 0, imgW, imgH);
        ctx.restore();
        ctx.filter = 'none';

        // Advanced Overlays (Vignette & Noise)
        if (!this.isShowingOriginal) {
            if (this.state.vignette > 0) {
                ctx.save();
                const r = Math.max(W, H) * 0.7;
                const grad = ctx.createRadialGradient(W / 2, H / 2, r * 0.4, W / 2, H / 2, r);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(1, `rgba(0,0,0,${this.state.vignette / 100})`);
                ctx.globalCompositeOperation = 'multiply';
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, W, H);
                ctx.restore();
            }
            if (this.state.noise > 0) {
                ctx.save();
                ctx.globalCompositeOperation = 'overlay';
                ctx.globalAlpha = this.state.noise / 100 * 0.5; // Scale intensity nicely
                ctx.fillStyle = ctx.createPattern(this.noiseCanvas, 'repeat');
                ctx.fillRect(0, 0, W, H);
                ctx.restore();
            }
        }
    }

    rotate(deg) {
        this.state.rotation = (this.state.rotation + deg + 360) % 360;

        // Keep layers pinned to the image visually
        this.layers.forEach(l => {
            if (deg === 90 || deg === -270) {
                const nx = 100 - l.y; l.y = l.x; l.x = nx;
            } else if (deg === -90 || deg === 270) {
                const ny = 100 - l.x; l.x = l.y; l.y = ny;
            }
        });

        this.updateCanvasDimensions();
        this.requestDraw();
    }

    flip(dir) {
        if (dir === 'h') { this.state.flipH *= -1; this.layers.forEach(l => l.x = 100 - l.x); }
        else { this.state.flipV *= -1; this.layers.forEach(l => l.y = 100 - l.y); }
        this.layers.forEach(l => this.updateLayerDOM(l));
        this.requestDraw();
    }

    resetAdjustments() {
        ['brightness', 'contrast', 'saturation', 'hue', 'blur', 'sharpen', 'vignette', 'noise'].forEach(k => {
            this.state[k] = 0; document.getElementById(k).value = 0;
            const el = document.getElementById('val-' + k); if (el) el.textContent = '0' + (k === 'hue' ? '°' : k === 'blur' ? 'px' : '%');
        });
        this.state.filter = 'none';
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('.filter-btn[data-filter="none"]').classList.add('active');
        this.requestDraw(); this.toast('Adjustments Reset');
    }

    // --- TEXT & EMOJI ---
    addText() {
        const text = document.getElementById('text-input').value.trim();
        if (!text) return this.toast('Please enter some text');
        const size = parseInt(document.getElementById('text-size').value);
        const color = document.getElementById('text-color').value;
        this.createLayer(text, size, color, false);
        document.getElementById('text-input').value = '';
    }

    initEmoji() {
        document.getElementById('emoji-grid').innerHTML = ALL_EMOJI.map(e => `<button class="emoji-btn" onclick="app.createLayer('${e}', parseInt(document.getElementById('emoji-size').value), 'transparent', true)">${e}</button>`).join('');
    }
    searchEmoji(q) {
        if (!q) return this.initEmoji();
        const filtered = ALL_EMOJI.filter(e => e.toLowerCase().includes(q.toLowerCase()) || Math.random() > 0.6).slice(0, 30);
        document.getElementById('emoji-grid').innerHTML = filtered.map(e => `<button class="emoji-btn" onclick="app.createLayer('${e}', parseInt(document.getElementById('emoji-size').value), 'transparent', true)">${e}</button>`).join('');
    }

    createLayer(text, size, color, isEmoji) {
        const id = Date.now();
        const layer = { id, text, size, color, isEmoji, x: 50, y: 50, ...this.textStyle };
        this.layers.push(layer);

        const node = document.createElement('div');
        node.id = 'layer-' + id; node.className = 'text-node';
        node.textContent = text;
        document.getElementById('text-overlay').appendChild(node);

        this.initDrag(node, layer);
        this.updateLayerDOM(layer);
        this.updateLayerList();
        this.selectLayer(id);
        this.toast((isEmoji ? 'Emoji' : 'Text') + ' Added');
    }

    updateLayerDOM(layer) {
        const node = document.getElementById('layer-' + layer.id);
        if (!node) return;
        node.style.left = layer.x + '%'; node.style.top = layer.y + '%';
        node.style.fontSize = (layer.size * this.displayScale) + 'px';
        node.style.color = layer.color;
        node.style.fontWeight = layer.bold ? '700' : '400';
        node.style.fontStyle = layer.italic ? 'italic' : 'normal';
        node.style.textShadow = layer.shadow ? `2px 2px ${6 * this.displayScale}px rgba(0,0,0,0.8)` : 'none';
        node.style.fontFamily = layer.isEmoji ? 'sans-serif' : "'Inter', sans-serif";
    }

    initDrag(node, layer) {
        let startX, startY, startLx, startLy;
        const getPos = e => e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };

        const move = e => {
            e.preventDefault();
            const p = getPos(e);
            const dx = (p.x - startX) / this.wrapper.clientWidth * 100;
            const dy = (p.y - startY) / this.wrapper.clientHeight * 100;
            layer.x = Math.max(0, Math.min(100, startLx + dx));
            layer.y = Math.max(0, Math.min(100, startLy + dy));
            node.style.left = layer.x + '%'; node.style.top = layer.y + '%';
        };
        const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); document.removeEventListener('touchmove', move); document.removeEventListener('touchend', up); };
        const down = e => {
            this.selectLayer(layer.id);
            const p = getPos(e);
            startX = p.x; startY = p.y; startLx = layer.x; startLy = layer.y;
            document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
            document.addEventListener('touchmove', move, { passive: false }); document.addEventListener('touchend', up);
        };
        node.onmousedown = down; node.ontouchstart = down;
    }

    selectLayer(id) {
        this.selectedLayerId = id;
        document.querySelectorAll('.text-node').forEach(n => n.classList.remove('selected'));
        document.querySelectorAll('.layer-item').forEach(n => n.classList.remove('selected'));
        if (id) {
            document.getElementById('layer-' + id).classList.add('selected');
            const li = document.querySelector(`.layer-item[data-id="${id}"]`);
            if (li) li.classList.add('selected');

            const l = this.layers.find(x => x.id === id);
            if (l && !l.isEmoji) {
                document.getElementById('text-input').value = l.text;
                document.getElementById('text-size').value = l.size;
                document.getElementById('val-text-size').textContent = l.size;
                document.getElementById('text-color').value = l.color;['bold', 'italic', 'shadow'].forEach(k => document.getElementById(`btn-${k}`).classList.toggle('active', l[k]));
            } else {
                document.getElementById('text-input').value = '';
            }
        } else {
            document.getElementById('text-input').value = '';
        }
    }

    handleTextInput(e) {
        if (!this.selectedLayerId) return;
        const l = this.layers.find(x => x.id === this.selectedLayerId);
        if (l && !l.isEmoji) {
            l.text = e.target.value;
            document.getElementById('layer-' + l.id).textContent = l.text;
            this.updateLayerList();
        }
    }

    updateSelectedText(key, val) {
        if (key === 'size') document.getElementById('val-text-size').textContent = val;
        if (!this.selectedLayerId) return;
        const l = this.layers.find(x => x.id === this.selectedLayerId);
        if (l && !l.isEmoji) { l[key] = key === 'size' ? parseInt(val) : val; this.updateLayerDOM(l); }
    }

    toggleTextStyle(style) {
        this.textStyle[style] = !this.textStyle[style];
        document.getElementById(`btn-${style}`).classList.toggle('active', this.textStyle[style]);
        if (this.selectedLayerId) {
            const l = this.layers.find(x => x.id === this.selectedLayerId);
            if (l && !l.isEmoji) { l[style] = this.textStyle[style]; this.updateLayerDOM(l); }
        }
    }

    deleteLayer(id) {
        this.layers = this.layers.filter(x => x.id !== id);
        document.getElementById('layer-' + id).remove();
        if (this.selectedLayerId === id) this.selectLayer(null);
        this.updateLayerList();
    }

    updateLayerList() {
        const list = document.getElementById('text-layers-list');
        if (!this.layers.length) { list.innerHTML = '<p style="font-size:0.85rem; color:var(--text-muted);">No layers yet.</p>'; return; }
        list.innerHTML = this.layers.slice().reverse().map(l => `
                    <div class="layer-item ${l.id === this.selectedLayerId ? 'selected' : ''}" data-id="${l.id}" onclick="app.selectLayer(${l.id})">
                        <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:75%;">${l.text}</span>
                        <button onclick="event.stopPropagation(); app.deleteLayer(${l.id})"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `).join('');
    }

    // --- NON-DESTRUCTIVE CROP ---
    startCrop() {
        if (!this.originalImage) return;
        this.cropState.active = true;
        document.getElementById('crop-overlay').classList.add('active');

        // Initialize Free Ratio logic
        document.querySelectorAll('.crop-ratio-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.crop-ratio-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setCropRatio(btn.dataset.ratio);
            }
        });

        // Set default box (80% of center)
        this.setCropRatio('free');
        this.initCropDrag();
    }

    cancelCrop() {
        this.cropState.active = false;
        document.getElementById('crop-overlay').classList.remove('active');
    }

    setCropRatio(ratioStr) {
        this.cropState.ratio = ratioStr === 'free' ? null : parseFloat(ratioStr);
        const cw = this.canvas.width, ch = this.canvas.height;
        let w = cw * 0.8, h = ch * 0.8;

        if (this.cropState.ratio) {
            const r = this.cropState.ratio;
            if (cw / ch > r) { h = ch * 0.9; w = h * r; }
            else { w = cw * 0.9; h = w / r; }
        }
        this.cropState.box = { x: (cw - w) / 2, y: (ch - h) / 2, w, h };
        this.renderCrop();
    }

    renderCrop() {
        if (!this.cropState.active) return;
        const { x, y, w, h } = this.cropState.box;
        const sc = this.displayScale;
        const vx = x * sc, vy = y * sc, vw = w * sc, vh = h * sc;
        const W = this.canvas.width * sc, H = this.canvas.height * sc;

        const boxDOM = document.getElementById('crop-box');
        boxDOM.style.cssText = `left:${vx}px; top:${vy}px; width:${vw}px; height:${vh}px`;

        document.getElementById('shade-top').style.cssText = `top:0; left:0; right:0; height:${vy}px`;
        document.getElementById('shade-bottom').style.cssText = `bottom:0; left:0; right:0; height:${H - (vy + vh)}px`;
        document.getElementById('shade-left').style.cssText = `top:${vy}px; height:${vh}px; left:0; width:${vx}px`;
        document.getElementById('shade-right').style.cssText = `top:${vy}px; height:${vh}px; right:0; width:${W - (vx + vw)}px`;
    }

    initCropDrag() {
        const boxDOM = document.getElementById('crop-box');
        let type = null, startX, startY, sBox;

        const getMouse = e => {
            const rect = this.wrapper.getBoundingClientRect();
            const p = e.touches ? e.touches[0] : e;
            return { x: (p.clientX - rect.left) / this.displayScale, y: (p.clientY - rect.top) / this.displayScale };
        };

        const down = e => {
            e.preventDefault();
            const m = getMouse(e);
            startX = m.x; startY = m.y; sBox = { ...this.cropState.box };
            type = e.target.dataset.handle || 'move';

            document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
            document.addEventListener('touchmove', move, { passive: false }); document.addEventListener('touchend', up);
        };

        const move = e => {
            e.preventDefault();
            const m = getMouse(e);
            const dx = m.x - startX, dy = m.y - startY;
            let nx = sBox.x, ny = sBox.y, nw = sBox.w, nh = sBox.h;
            const CW = this.canvas.width, CH = this.canvas.height;

            if (type === 'move') {
                nx = Math.max(0, Math.min(CW - nw, nx + dx));
                ny = Math.max(0, Math.min(CH - nh, ny + dy));
            } else {
                if (type.includes('l')) { nx += dx; nw -= dx; }
                if (type.includes('r')) { nw += dx; }
                if (type.includes('t')) { ny += dy; nh -= dy; }
                if (type.includes('b')) { nh += dy; }

                if (nw < 40) { if (type.includes('l')) nx -= (40 - nw); nw = 40; }
                if (nh < 40) { if (type.includes('t')) ny -= (40 - nh); nh = 40; }

                // Ratio constraints
                if (this.cropState.ratio) {
                    const r = this.cropState.ratio;
                    if (Math.abs(dx) > Math.abs(dy)) {
                        const targetH = nw / r;
                        if (type.includes('t')) ny += (nh - targetH);
                        nh = targetH;
                    } else {
                        const targetW = nh * r;
                        if (type.includes('l')) nx += (nw - targetW);
                        nw = targetW;
                    }
                }
            }

            // Strict Bounds Enforcer
            if (nx < 0) { nw += nx; nx = 0; }
            if (ny < 0) { nh += ny; ny = 0; }
            if (nx + nw > CW) { nw = CW - nx; }
            if (ny + nh > CH) { nh = CH - ny; }

            if (this.cropState.ratio && type !== 'move') {
                if (nw / nh > this.cropState.ratio) nw = nh * this.cropState.ratio;
                else nh = nw / this.cropState.ratio;
            }

            this.cropState.box = { x: nx, y: ny, w: nw, h: nh };
            this.renderCrop();
        };

        const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); document.removeEventListener('touchmove', move); document.removeEventListener('touchend', up); };
        boxDOM.onmousedown = down; boxDOM.ontouchstart = down;
    }

    applyCrop() {
        if (!this.originalImage || !this.cropState.active) return;
        const { x, y, w, h } = this.cropState.box;

        // Crop the UNFILTERED but rotated/flipped original image to prevent filter baking
        const rawCanvas = document.createElement('canvas');
        rawCanvas.width = this.canvas.width; rawCanvas.height = this.canvas.height;
        const rctx = rawCanvas.getContext('2d');

        const isRotated = this.state.rotation % 180 !== 0;
        const imgW = isRotated ? rawCanvas.height : rawCanvas.width;
        const imgH = isRotated ? rawCanvas.width : rawCanvas.height;

        rctx.translate(rawCanvas.width / 2, rawCanvas.height / 2);
        if (this.state.rotation) rctx.rotate(this.state.rotation * Math.PI / 180);
        rctx.scale(this.state.flipH, this.state.flipV);
        rctx.translate(-imgW / 2, -imgH / 2);
        rctx.drawImage(this.originalImage, 0, 0, imgW, imgH);

        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = w; cropCanvas.height = h;
        cropCanvas.getContext('2d').drawImage(rawCanvas, x, y, w, h, 0, 0, w, h);

        const img = new Image();
        img.onload = () => {
            this.originalImage = img;
            this.state.rotation = 0; this.state.flipH = 1; this.state.flipV = 1;

            // Reposition text layers relative to the new crop boundaries
            this.layers.forEach(l => {
                const px = (l.x / 100) * rawCanvas.width;
                const py = (l.y / 100) * rawCanvas.height;
                l.x = ((px - x) / w) * 100;
                l.y = ((py - y) / h) * 100;
            });

            this.cancelCrop();
            this.updateCanvasDimensions();
            this.requestDraw();
            document.querySelector('.nav-btn[data-tab="adjust"]').click();
            this.toast('Crop applied successfully');
        };
        img.src = cropCanvas.toDataURL('image/png');
    }

    // --- EXPORT ---
    download() {
        if (!this.originalImage) return;
        this.selectLayer(null);

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = this.canvas.width; exportCanvas.height = this.canvas.height;
        const ectx = exportCanvas.getContext('2d');

        ectx.drawImage(this.canvas, 0, 0); // Contains filters + image

        // Bake text layers natively
        ectx.textAlign = 'center'; ectx.textBaseline = 'middle';
        this.layers.forEach(l => {
            ectx.save();
            ectx.font = `${l.italic ? 'italic ' : ''}${l.bold ? '700 ' : '400 '}${l.size}px ${l.isEmoji ? 'sans-serif' : "'Inter', sans-serif"}`;
            ectx.fillStyle = l.color;
            if (l.shadow) { ectx.shadowColor = 'rgba(0,0,0,0.8)'; ectx.shadowBlur = 6; ectx.shadowOffsetX = 2; ectx.shadowOffsetY = 2; }

            const px = (l.x / 100) * exportCanvas.width;
            const py = (l.y / 100) * exportCanvas.height;
            ectx.fillText(l.text, px, py);
            ectx.restore();
        });

        const link = document.createElement('a');
        link.download = `ImageCraft_Pro_${Date.now()}.png`;
        link.href = exportCanvas.toDataURL('image/png', 1.0);
        link.click();
        this.toast('Image Downloaded Successfully!');
    }

    toast(msg) {
        const t = document.getElementById('toast');
        t.textContent = msg; t.classList.add('show');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
    }
}

window.app = new ImageCraftPro();