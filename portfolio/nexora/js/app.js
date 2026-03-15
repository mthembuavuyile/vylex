// js/app.js
(function () {
    'use strict';

    // ── DOM Elements ──────────────────────────────────────────
    const chatEl = document.getElementById('chat');
    const formEl = document.getElementById('form');
    const inputEl = document.getElementById('input');
    const micBtn = document.getElementById('mic-btn');
    const scrollBtn = document.getElementById('scroll-btn');
    const welcomeEl = document.getElementById('welcome-screen');
    const backdrop = document.getElementById('backdrop');
    const settingsPanel = document.getElementById('settings-panel');
    const voiceSelect = document.getElementById('voice-select');

    // Voice Settings Elements
    const rateSlider = document.getElementById('voice-rate');
    const rateVal = document.getElementById('rate-val');
    const pitchSlider = document.getElementById('voice-pitch');
    const pitchVal = document.getElementById('pitch-val');

    // ── Shared Application State ──────────────────────────────
    window.NexoraAppState = {
        theme: localStorage.getItem('nx_theme') || 'light',
        ttsEnabled: localStorage.getItem('nx_tts') !== 'false',
        units: localStorage.getItem('nx_units') || 'metric',
        speechRate: parseFloat(localStorage.getItem('nx_rate') || '1.0'),
        speechPitch: parseFloat(localStorage.getItem('nx_pitch') || '1.0')
    };

    let synth = window.speechSynthesis;
    let voices = [];
    let selectedVoice = null;
    let isListening = false;

    // ── Init ─────────────────────────────────────────
    applyTheme(window.NexoraAppState.theme);
    initSettings();
    initVoices();
    initSpeechRec();
    handleScrollVisibility();

    // Make global so suggestion buttons in HTML can call it
    window.sendSuggestion = function (text) {
        inputEl.value = text;
        formEl.dispatchEvent(new Event('submit', { cancelable: true }));
    };

    // ── Settings ─────────────────────────────────────
    function initSettings() {
        document.querySelectorAll('.theme-opt').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === window.NexoraAppState.theme);
            btn.addEventListener('click', () => {
                window.NexoraAppState.theme = btn.dataset.theme;
                applyTheme(window.NexoraAppState.theme);
                localStorage.setItem('nx_theme', window.NexoraAppState.theme);
                document.querySelectorAll('.theme-opt').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        document.getElementById('settings-btn').addEventListener('click', openSettings);
        document.getElementById('close-settings').addEventListener('click', closeSettings);
        backdrop.addEventListener('click', closeSettings);

        document.getElementById('clear-btn').addEventListener('click', () => {
            if (confirm('Start a new chat?')) {
                chatEl.innerHTML = '';
                chatEl.appendChild(welcomeEl);
                welcomeEl.classList.remove('hidden');
            }
        });

        const ttsToggle = document.getElementById('tts-enabled');
        if (ttsToggle) {
            ttsToggle.checked = window.NexoraAppState.ttsEnabled;
            ttsToggle.addEventListener('change', e => {
                window.NexoraAppState.ttsEnabled = e.target.checked;
                localStorage.setItem('nx_tts', window.NexoraAppState.ttsEnabled);
                if (!window.NexoraAppState.ttsEnabled && synth) synth.cancel();
            });
        }

        if (voiceSelect) {
            voiceSelect.addEventListener('change', e => {
                selectedVoice = voices[e.target.value];
            });
        }

        if (rateSlider && rateVal) {
            rateSlider.value = window.NexoraAppState.speechRate;
            rateVal.textContent = window.NexoraAppState.speechRate.toFixed(1);
            rateSlider.addEventListener('input', e => {
                const val = parseFloat(e.target.value);
                window.NexoraAppState.speechRate = val;
                rateVal.textContent = val.toFixed(1);
                localStorage.setItem('nx_rate', val);
            });
        }

        if (pitchSlider && pitchVal) {
            pitchSlider.value = window.NexoraAppState.speechPitch;
            pitchVal.textContent = window.NexoraAppState.speechPitch.toFixed(1);
            pitchSlider.addEventListener('input', e => {
                const val = parseFloat(e.target.value);
                window.NexoraAppState.speechPitch = val;
                pitchVal.textContent = val.toFixed(1);
                localStorage.setItem('nx_pitch', val);
            });
        }

        const unitsEl = document.getElementById('weather-units');
        if (unitsEl) {
            unitsEl.value = window.NexoraAppState.units;
            unitsEl.addEventListener('change', e => {
                window.NexoraAppState.units = e.target.value;
                localStorage.setItem('nx_units', window.NexoraAppState.units);
            });
        }

        document.getElementById('reset-settings').addEventListener('click', () => {
            if (confirm('Reset all settings to default?')) {
                localStorage.clear();
                location.reload();
            }
        });
    }

    function applyTheme(t) { document.body.setAttribute('data-theme', t); }
    function openSettings() { settingsPanel.classList.add('open'); backdrop.classList.add('show'); }
    function closeSettings() { settingsPanel.classList.remove('open'); backdrop.classList.remove('show'); }

    // ── Chat UI ──────────────────────────────────────
    function hideWelcome() {
        if (!welcomeEl.classList.contains('hidden')) welcomeEl.classList.add('hidden');
    }

    function appendMessage(role, content, isHtml = false) {
        hideWelcome();
        const wrap = document.createElement('div');
        wrap.className = `message ${role}`;

        if (role === 'assistant') {
            const av = document.createElement('div');
            av.className = 'bot-avatar';
            av.innerHTML = '<i class="fas fa-robot"></i>';
            wrap.appendChild(av);
        }

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        if (isHtml) bubble.innerHTML = content;
        else bubble.textContent = content;
        wrap.appendChild(bubble);

        const ti = document.getElementById('typing-indicator');
        if (ti) ti.remove();

        chatEl.appendChild(wrap);
        scrollToBottom();
    }

    function showTyping() {
        if (document.getElementById('typing-indicator')) return;
        hideWelcome();
        const wrap = document.createElement('div');
        wrap.id = 'typing-indicator';
        wrap.className = 'message assistant';
        wrap.innerHTML = `<div class="bot-avatar"><i class="fas fa-robot"></i></div>
                          <div class="message-bubble"><div class="typing-dots"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
        chatEl.appendChild(wrap);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatEl.scrollTo({ top: chatEl.scrollHeight, behavior: 'smooth' });
    }

    function handleScrollVisibility() {
        chatEl.addEventListener('scroll', () => {
            const fromBottom = chatEl.scrollHeight - chatEl.clientHeight - chatEl.scrollTop;
            scrollBtn.classList.toggle('visible', fromBottom > 80);
        });
        scrollBtn.addEventListener('click', scrollToBottom);
    }

    // ── Form Submit & CORE NLP ENGINE ────────────────
    formEl.addEventListener('submit', e => {
        e.preventDefault();
        const text = inputEl.value.trim();
        if (!text) return;
        appendMessage('user', text);
        inputEl.value = '';
        processInput(text);
    });

    // ── Natural-language example builder ─────────────
    // Maps module ids to friendly example phrases shown in error/help messages.
    // Falls back to the module's own `example` field, then its name.
    const FRIENDLY_EXAMPLES = {
        weather:    'weather in Durban',
        crypto:     'Bitcoin price',
        dictionary: 'define serendipity',
        jokes:      'tell me a joke',
        reddit:     'show me reddit posts',
        bible:      'a Bible verse',
        advice:     'give me some advice',
        image:      'show me a photo of a mountain'
    };

    function getFriendlyExamples(count = 3) {
        const modules = (window.NexoraRegistry && window.NexoraRegistry.modules) || [];
        return modules
            .map(m => FRIENDLY_EXAMPLES[m.id] || m.example || m.name)
            .slice(0, count);
    }

    async function processInput(text) {
        showTyping();
        let resp = { html: null, text: '' };

        try {
            // 1. Greetings
            if (/^(hi|hello|hey|greetings)/i.test(text)) {
                resp.text = `Hello! I'm Nexora, built by Vylex. How can I help you today?`;
            }

            // 2. Help / capabilities
            else if (/^(help|what can you do|commands|capabilities)/i.test(text)) {
                const modules = (window.NexoraRegistry && window.NexoraRegistry.modules) || [];

                const listItems = modules.length > 0
                    ? modules.map(m => {
                        const example = FRIENDLY_EXAMPLES[m.id] || m.example || m.name;
                        return `<li><span class="help-example">${escapeHtml(example)}</span></li>`;
                    }).join('')
                    : '<li>Basic chat</li>';

                resp.text = `Here's what I can help with: ${getFriendlyExamples(3).join(', ')}, and more.`;

                resp.html = `
                    <div class="help-container">
                        <p style="margin:0 0 8px;font-weight:600;">Here's what I can do:</p>
                        <ul style="margin:0;padding-left:18px;line-height:1.8;">${listItems}</ul>
                    </div>`;
            }

            // 3. Smart module delegation
            else {
                const matchedAPI = window.NexoraRegistry ? window.NexoraRegistry.matchIntent(text) : null;

                if (matchedAPI) {
                    resp = await matchedAPI.module.handle(matchedAPI.match, window.NexoraAppState);
                } else {
                    // Build a friendly, natural-sounding fallback with real examples
                    const examples = getFriendlyExamples(3);
                    const hint = examples.length > 0
                        ? `Try something like "${examples[0]}" or "${examples[1]}"`
                        : 'Try asking about the weather or a word definition';

                    resp.text = `I'm not sure how to help with that. ${hint}. Type "help" to see everything I can do.`;
                }
            }
        } catch (err) {
            console.error(err);
            resp.text = "Something went wrong on my end — please try again in a moment.";
        }

        if (resp.html) appendMessage('assistant', resp.html, true);
        else appendMessage('assistant', resp.text);

        speak(resp.text);
    }

    // ── Voice / Speech ───────────────────────────────
    function initVoices() {
        if (!synth) return;
        const load = () => {
            voices = synth.getVoices();
            if (!voices.length) { setTimeout(load, 150); return; }
            if (voiceSelect) voiceSelect.innerHTML = '';

            voices.forEach((v, i) => {
                if (!v.lang.startsWith('en')) return;
                const o = document.createElement('option');
                o.value = i;
                o.textContent = `${v.name} (${v.lang})`;
                if (voiceSelect) voiceSelect.appendChild(o);
            });

            selectedVoice = voices.find(v => v.lang === 'en-US') || voices[0];

            if (voiceSelect && selectedVoice) {
                voiceSelect.value = voices.indexOf(selectedVoice);
            }
        };
        if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = load;
        load();
    }

    function speak(text) {
        if (!window.NexoraAppState.ttsEnabled || !synth) return;
        synth.cancel();
        const clean = text.replace(/<[^>]*>/g, '');
        const u = new SpeechSynthesisUtterance(clean);
        if (selectedVoice) u.voice = selectedVoice;
        u.rate = window.NexoraAppState.speechRate;
        u.pitch = window.NexoraAppState.speechPitch;
        synth.speak(u);
    }

    function initSpeechRec() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            if (micBtn) micBtn.style.display = 'none';
            return;
        }
        const rec = new SR();
        rec.continuous = false;
        rec.interimResults = false;

        rec.onstart = () => {
            isListening = true;
            micBtn.classList.add('listening');
            inputEl.placeholder = 'Listening…';
        };

        rec.onresult = e => {
            inputEl.value = e.results[0][0].transcript;
            formEl.dispatchEvent(new Event('submit', { cancelable: true }));
        };

        rec.onend = () => {
            isListening = false;
            micBtn.classList.remove('listening');
            inputEl.placeholder = 'Message Nexora…';
        };

        micBtn.addEventListener('click', () => isListening ? rec.stop() : rec.start());
    }

    // ── Helpers ──────────────────────────────────────
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

})();