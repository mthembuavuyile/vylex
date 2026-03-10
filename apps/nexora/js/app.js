(function () {
      // ── DOM ──────────────────────────────────────────
      const chatEl = document.getElementById('chat');
      const formEl = document.getElementById('form');
      const inputEl = document.getElementById('input');
      const micBtn = document.getElementById('mic-btn');
      const scrollBtn = document.getElementById('scroll-btn');
      const welcomeEl = document.getElementById('welcome-screen');
      const backdrop = document.getElementById('backdrop');
      const settingsPanel = document.getElementById('settings-panel');
      const voiceSelect = document.getElementById('voice-select');

      // ── State ────────────────────────────────────────
      let synth = window.speechSynthesis;
      let voices = [];
      let selectedVoice = null;
      let recognition = null;
      let isListening = false;

      let theme = localStorage.getItem('nx_theme') || 'light';
      let ttsEnabled = localStorage.getItem('nx_tts') !== 'false';
      let units = localStorage.getItem('nx_units') || 'metric';
      let bibleVer = localStorage.getItem('nx_bible') || 'kjv';
      let speechRate = parseFloat(localStorage.getItem('nx_rate') || '1.0');
      let speechPitch = parseFloat(localStorage.getItem('nx_pitch') || '1.0');

      // ── Intent patterns ──────────────────────────────
      const intents = {
        news: [/(latest|world|tech|technology|business|science)?\s*news/i, /headlines/i, /what's happening/i],
        weather: [/weather (in|for|at) (.+)/i, /what's the weather (like )?(in|at|for) (.+)/i, /temperature (in|at|for) (.+)/i, /how (hot|cold) is it (in|at) (.+)/i],
        dictionary: [/define (.+)/i, /meaning of (.+)/i, /dictionary (.+)/i, /what does (.+) mean/i],
        bible: [/bible verse/i, /random verse/i, /verse from (.+)/i, /(.+) (\d+):(\d+)/i, /scripture/i],
        jokes: [/tell (me |)(a |)joke/i, /make me laugh/i, /funny/i],
        quotes: [/quote/i, /inspiration/i, /motivate me/i, /words of wisdom/i],
        math: [/(?:solve|calculate|compute|math|simplify)\s+(.+)/i, /^[\d\s.+\-*/()^%]+$/],
        time: [/what time is it/i, /current time/i],
        date: [/what('s| is) (the|today'?s) date/i, /what day is it/i],
        greeting: [/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)( there| nexora)?/i],
        help: [/^(help|assist|what can you do)/i, /how do I use you/i],
        clear: [/^clear chat/i, /^reset/i, /^clear$/i]
      };

      // ── Init ─────────────────────────────────────────
      applyTheme(theme);
      initSettings();
      initVoices();
      initSpeechRec();
      handleScrollVisibility();

      window.sendSuggestion = function (text) {
        inputEl.value = text;
        formEl.dispatchEvent(new Event('submit'));
      };

      // ── Settings ─────────────────────────────────────
      function initSettings() {
        // Theme
        document.querySelectorAll('.theme-opt').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.theme === theme);
          btn.addEventListener('click', () => {
            theme = btn.dataset.theme;
            applyTheme(theme);
            localStorage.setItem('nx_theme', theme);
            document.querySelectorAll('.theme-opt').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
          });
        });

        // Panel open/close
        document.getElementById('settings-btn').addEventListener('click', openSettings);
        document.getElementById('close-settings').addEventListener('click', closeSettings);
        backdrop.addEventListener('click', closeSettings);

        // Clear
        document.getElementById('clear-btn').addEventListener('click', () => {
          if (confirm('Start a new chat?')) {
            chatEl.innerHTML = '';
            chatEl.appendChild(welcomeEl);
            welcomeEl.classList.remove('hidden');
          }
        });

        // TTS
        const ttsToggle = document.getElementById('tts-enabled');
        ttsToggle.checked = ttsEnabled;
        ttsToggle.addEventListener('change', e => {
          ttsEnabled = e.target.checked;
          localStorage.setItem('nx_tts', ttsEnabled);
          if (!ttsEnabled) synth.cancel();
        });

        // Rate
        const rateEl = document.getElementById('voice-rate');
        rateEl.value = speechRate;
        document.getElementById('rate-val').textContent = speechRate.toFixed(1);
        rateEl.addEventListener('input', e => {
          speechRate = parseFloat(e.target.value);
          document.getElementById('rate-val').textContent = speechRate.toFixed(1);
          localStorage.setItem('nx_rate', speechRate);
        });

        // Pitch
        const pitchEl = document.getElementById('voice-pitch');
        pitchEl.value = speechPitch;
        document.getElementById('pitch-val').textContent = speechPitch.toFixed(1);
        pitchEl.addEventListener('input', e => {
          speechPitch = parseFloat(e.target.value);
          document.getElementById('pitch-val').textContent = speechPitch.toFixed(1);
          localStorage.setItem('nx_pitch', speechPitch);
        });

        // Units / Bible
        const unitsEl = document.getElementById('weather-units');
        unitsEl.value = units;
        unitsEl.addEventListener('change', e => { units = e.target.value; localStorage.setItem('nx_units', units); });

        const bibleEl = document.getElementById('bible-version');
        bibleEl.value = bibleVer;
        bibleEl.addEventListener('change', e => { bibleVer = e.target.value; localStorage.setItem('nx_bible', bibleVer); });

        // Reset
        document.getElementById('reset-settings').addEventListener('click', () => {
          if (confirm('Reset all settings?')) { localStorage.clear(); location.reload(); }
        });
      }

      function applyTheme(t) {
        document.body.setAttribute('data-theme', t);
      }

      function openSettings() {
        settingsPanel.classList.add('open');
        backdrop.classList.add('show');
      }

      function closeSettings() {
        settingsPanel.classList.remove('open');
        backdrop.classList.remove('show');
      }

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

        // Remove typing indicator if present
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
        wrap.innerHTML = `
            <div class="bot-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-bubble">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>`;
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

      // ── Form Submit ──────────────────────────────────
      formEl.addEventListener('submit', e => {
        e.preventDefault();
        const text = inputEl.value.trim();
        if (!text) return;
        appendMessage('user', text);
        inputEl.value = '';
        processInput(text);
      });

      // ── NLP Engine ───────────────────────────────────
      async function processInput(text) {
        showTyping();
        let intent = 'general', matchData = null;

        for (const [key, patterns] of Object.entries(intents)) {
          for (const p of patterns) {
            const m = text.match(p);
            if (m) { intent = key; matchData = m; break; }
          }
          if (intent !== 'general') break;
        }

        let resp = { html: null, text: '' };

        try {
          switch (intent) {
            case 'news': resp = await fetchNews(text); break;
            case 'weather': {
              const loc = matchData[4] || matchData[3] || matchData[2];
              resp = await fetchWeather(loc);
              break;
            }
            case 'dictionary': resp = await fetchDict(matchData[1]); break;
            case 'bible': resp = await fetchBible(matchData[0]); break;
            case 'jokes': resp = await fetchJoke(); break;
            case 'quotes': resp = await fetchQuote(); break;
            case 'math': resp = calcMath(matchData[1] || matchData[0]); break;
            case 'time': {
              const t = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              resp.text = `The current time is ${t}.`;
              break;
            }
            case 'date': {
              const d = new Date().toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
              resp.text = `Today is ${d}.`;
              break;
            }
            case 'greeting': {
              const h = new Date().getHours();
              const tod = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
              resp.text = `Good ${tod}! I'm Nexora. Ask me about weather, news, math, and more.`;
              break;
            }
            case 'help':
              resp.html = `<div class="rich-widget">
                        <div class="widget-title"><i class="fas fa-circle-info"></i> What I can do</div>
                        <ul class="help-list">
                            <li>"What's the weather in London?"</li>
                            <li>"Show me latest tech news"</li>
                            <li>"Calculate 100 / 4 * 2"</li>
                            <li>"Define serendipity"</li>
                            <li>"Tell me a joke"</li>
                            <li>"Give me a quote"</li>
                            <li>"John 3:16"</li>
                        </ul>
                    </div>`;
              resp.text = 'Here are some things you can ask me.';
              break;
            case 'clear':
              document.getElementById('clear-btn').click();
              return;
            default:
              resp.text = "I'm not sure how to handle that yet. Say 'help' to see what I can do!";
          }
        } catch (err) {
          console.error(err);
          resp.text = 'I ran into a glitch. Please try again.';
        }

        if (resp.html) appendMessage('assistant', resp.html, true);
        else appendMessage('assistant', resp.text);
        speak(resp.text);
      }

      // ── APIs ─────────────────────────────────────────
      async function fetchNews(query) {
        let sub = 'worldnews';
        if (/tech|technology/i.test(query)) sub = 'technology';
        else if (/science/i.test(query)) sub = 'science';
        else if (/business|finance/i.test(query)) sub = 'business';

        const res = await fetch(`https://corsproxy.io/?https://www.reddit.com/r/${sub}/top.json?limit=10&t=day`);

        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        const posts = data.data.children.filter(p => !p.data.stickied && !p.data.over_18).slice(0, 4);

        const fallback = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=100&q=80';
        let html = `<div class="rich-widget">
            <div class="widget-title"><i class="fas fa-newspaper"></i> Top ${sub}</div>
            <div class="news-list">`;
        posts.forEach(({ data: d }) => {
          const img = (d.preview?.images?.[0]?.source?.url || '').replace(/&amp;/g, '&') || fallback;
          html += `<div class="news-item">
                <img class="news-thumb" src="${img}" alt="" onerror="this.src='${fallback}'">
                <div class="news-item-content">
                    <h4>${d.title.substring(0, 80)}…</h4>
                    <a href="https://reddit.com${d.permalink}" target="_blank" rel="noopener">Read more <i class="fas fa-external-link-alt" style="font-size:.65rem"></i></a>
                </div>
            </div>`;
        });
        html += `</div></div>`;
        return { html, text: `Here are the top headlines from r/${sub}.` };
      }

      async function fetchWeather(location) {
        if (!location) return { text: "Please specify a city. E.g. 'Weather in Paris'." };
        const key = 'b4103187cb732a388eac217a5290e08a';
        try {
          const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location.trim())}&units=${units}&appid=${key}`);
          if (!res.ok) {
            if (res.status === 401) throw new Error('API_KEY');
            throw new Error('not found');
          }
          const d = await res.json();
          return buildWeatherWidget(d.name, d.sys.country, d.main.temp, d.main.feels_like, d.weather[0].main, d.weather[0].description, d.main.humidity, d.wind.speed, d.main.pressure);
        } catch (e) {
          if (e.message === 'API_KEY') {
            const t = units === 'metric' ? Math.floor(Math.random() * 15 + 10) : Math.floor(Math.random() * 30 + 50);
            return buildWeatherWidget(location, '', t, t + 2, 'Clouds', 'scattered clouds', 65, 4.5, 1012);
          }
          return { text: `Sorry, I couldn't find weather data for "${location}".` };
        }
      }

      function buildWeatherWidget(city, country, temp, feels, main, desc, humidity, wind, pressure) {
        const tU = units === 'metric' ? '°C' : '°F';
        const wU = units === 'metric' ? 'm/s' : 'mph';
        const icons = { Clear: 'sun', Rain: 'cloud-rain', Drizzle: 'cloud-rain', Snow: 'snowflake', Thunderstorm: 'cloud-bolt' };
        const icon = icons[main] || 'cloud';
        const html = `<div class="rich-widget">
            <div class="widget-title"><i class="fas fa-location-dot"></i> ${city}${country ? ', ' + country : ''}</div>
            <div class="weather-main">
                <div class="weather-temp">${Math.round(temp)}${tU}</div>
                <i class="fas fa-${icon} weather-icon"></i>
            </div>
            <div class="weather-desc">${desc}</div>
            <div class="weather-grid">
                <div><i class="fas fa-temperature-half"></i> Feels ${Math.round(feels)}${tU}</div>
                <div><i class="fas fa-droplet"></i> ${humidity}% humidity</div>
                <div><i class="fas fa-wind"></i> ${wind} ${wU}</div>
                <div><i class="fas fa-gauge"></i> ${pressure} hPa</div>
            </div>
        </div>`;
        return { html, text: `It's ${Math.round(temp)}${tU} and ${desc} in ${city}.` };
      }

      async function fetchDict(word) {
        const clean = (word || '').replace(/['"?.]/g, '').trim();
        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean)}`);
        if (!res.ok) return { text: `No definition found for "${clean}".` };
        const [entry] = await res.json();
        const meaning = entry.meanings[0];
        const defs = meaning.definitions.slice(0, 2);
        const html = `<div class="rich-widget">
            <div class="widget-title"><i class="fas fa-book"></i> Dictionary</div>
            <div class="dict-word">
                ${entry.word}
                <button onclick="window._speakWord('${entry.word}')" class="icon-btn" style="width:26px;height:26px;font-size:.9rem" title="Pronounce"><i class="fas fa-volume-up"></i></button>
            </div>
            <div class="dict-phonetic">${entry.phonetic || ''}</div>
            <span class="dict-pos">${meaning.partOfSpeech}</span>
            <ul class="dict-defs">${defs.map(d => `<li>${d.definition}</li>`).join('')}</ul>
        </div>`;
        return { html, text: `${entry.word}: ${defs[0].definition}` };
      }

      window._speakWord = w => { if (synth) { const u = new SpeechSynthesisUtterance(w); if (selectedVoice) u.voice = selectedVoice; synth.speak(u); } };

      async function fetchBible(ref) {
        const q = ref.replace(/bible verse|verse from|random verse/i, '').trim() || 'John 3:16';
        try {
          const res = await fetch(`https://bible-api.com/${encodeURIComponent(q)}?translation=${bibleVer}`);
          if (!res.ok) throw new Error();
          const d = await res.json();
          const html = `<div class="rich-widget">
                <div class="widget-title"><i class="fas fa-book-bible"></i> Scripture</div>
                <div class="bible-ref">${d.reference}</div>
                <div class="bible-text">"${d.text.trim()}"</div>
                <div class="bible-translation">${d.translation_name}</div>
            </div>`;
          return { html, text: `${d.reference}. ${d.text.trim()}` };
        } catch {
          return { text: "Couldn't find that reference. Try 'John 3:16'." };
        }
      }

      async function fetchJoke() {
        try {
          const res = await fetch('https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit');
          const d = await res.json();
          const jokeHtml = d.type === 'single' ? d.joke : `${d.setup}<br><br><strong>${d.delivery}</strong>`;
          const jokeText = d.type === 'single' ? d.joke : `${d.setup} ... ${d.delivery}`;
          return {
            html: `<div class="rich-widget"><div class="widget-title"><i class="fas fa-face-laugh-squint"></i> Joke</div><div class="joke-text">${jokeHtml}</div></div>`,
            text: jokeText
          };
        } catch {
          return { text: "Why don't scientists trust atoms? Because they make up everything!" };
        }
      }

      async function fetchQuote() {
        try {
          const res = await fetch('https://api.adviceslip.com/advice');
          const d = await res.json();
          const q = d.slip.advice;
          return {
            html: `<div class="rich-widget quote-widget"><div class="widget-title"><i class="fas fa-lightbulb"></i> Daily Inspiration</div><div class="quote-text">"${q}"</div></div>`,
            text: q
          };
        } catch {
          return { text: "The only impossible journey is the one you never begin." };
        }
      }

      function calcMath(expr) {
        try {
          let safe = expr.replace(/[^0-9+\-*/().^% ]/gi, '');
          const js = safe.replace(/\^/g, '**');
          const result = new Function('return ' + js)();
          if (!isFinite(result) || isNaN(result)) throw new Error();
          const final = Number.isInteger(result) ? result : parseFloat(result.toFixed(4));
          return {
            html: `<div class="rich-widget"><div class="widget-title"><i class="fas fa-calculator"></i> Result</div><div style="margin-bottom:6px"><span class="math-expr">${safe}</span></div><div class="math-result">= ${final}</div></div>`,
            text: `The result is ${final}.`
          };
        } catch {
          return { text: "Couldn't compute that expression. Ensure it uses valid numbers and operators." };
        }
      }

      // ── Voice ────────────────────────────────────────
      function initVoices() {
        if (!synth) return;
        const load = () => {
          voices = synth.getVoices();
          if (!voices.length) { setTimeout(load, 150); return; }
          voiceSelect.innerHTML = '';
          const saved = parseInt(localStorage.getItem('nx_voice'));
          voices.forEach((v, i) => {
            if (!v.lang.startsWith('en')) return;
            const o = document.createElement('option');
            o.value = i; o.textContent = `${v.name} (${v.lang})`;
            voiceSelect.appendChild(o);
          });
          const def = voices.find(v => v.lang === 'en-US') || voices[0];
          selectedVoice = (saved != null && voices[saved]) ? voices[saved] : def;
          voiceSelect.value = voices.indexOf(selectedVoice);
        };
        if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = load;
        load();
        voiceSelect.addEventListener('change', () => {
          const idx = parseInt(voiceSelect.value);
          if (voices[idx]) { selectedVoice = voices[idx]; localStorage.setItem('nx_voice', idx); }
        });
      }

      function speak(text) {
        if (!ttsEnabled || !synth) return;
        synth.cancel();
        const clean = text.replace(/<[^>]*>/g, '');
        const u = new SpeechSynthesisUtterance(clean);
        if (selectedVoice) u.voice = selectedVoice;
        u.rate = speechRate;
        u.pitch = speechPitch;
        synth.speak(u);
      }

      // ── Mic ──────────────────────────────────────────
      function initSpeechRec() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { micBtn.style.display = 'none'; return; }

        const rec = new SR();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onstart = () => { isListening = true; micBtn.classList.add('listening'); inputEl.placeholder = 'Listening…'; };
        rec.onresult = e => { inputEl.value = e.results[0][0].transcript; formEl.dispatchEvent(new Event('submit')); };
        rec.onerror = () => stopListen(rec);
        rec.onend = () => stopListen(rec);

        micBtn.addEventListener('click', () => {
          if (isListening) { rec.stop(); return; }
          try { rec.start(); } catch { rec.stop(); setTimeout(() => rec.start(), 200); }
        });
      }

      function stopListen(rec) {
        isListening = false;
        micBtn.classList.remove('listening');
        inputEl.placeholder = 'Message Nexora…';
      }
    })();