/***********************
     *  STATE + STORAGE
     ***********************/
    const STORAGE_KEY = "kasigig_full_demo_v1";

    const appState = {
      currentRole: "hustler",         // 'hustler' | 'employer'
      isLowData: false,
      isOffline: false,
      activeGigId: null,              // gig currently being worked on
      alertGigId: null,               // smart alert
      wallet: 0,
      completed: 0,
      thumbsUp: 14,
      claps: 9,
      gigs: []
    };

    function nowTimeLabel(){
      const d = new Date();
      return d.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
    }

    function loadState(){
      try{
        const raw = localStorage.getItem(STORAGE_KEY);
        if(raw){
          const parsed = JSON.parse(raw);
          Object.assign(appState, parsed);
        } else {
          seedData();
          saveState();
        }
      } catch(e){
        seedData();
      }
    }

    function saveState(){
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentRole: appState.currentRole,
        isLowData: appState.isLowData,
        isOffline: appState.isOffline,
        activeGigId: appState.activeGigId,
        alertGigId: appState.alertGigId,
        wallet: appState.wallet,
        completed: appState.completed,
        thumbsUp: appState.thumbsUp,
        claps: appState.claps,
        gigs: appState.gigs
      }));
    }

    function seedData(){
      appState.gigs = [
        {
          id: 1,
          title: "Fix leaking tap urgently",
          category: "Plumbing",
          price: 180,
          location: "Soweto, Diepkloof",
          lat: -26.25, lng: 27.95,
          description: "Small leak in kitchen. Need done today before load shedding.",
          owner: { name: "Mama Dudu", trust: 92 },
          bids: [
            { name: "Thabo", amount: 160, time: "2m ago" },
            { name: "Lerato", amount: 175, time: "12m ago" }
          ],
          status: "live", // live | in_progress | completed
          time: "11:20",
          otp: null,
          hired: null, // { name, amount }
          privacy: { hideExactLocationWhenInProgress: true }
        },
        {
          id: 2,
          title: "Deliver 2 boxes to Alex",
          category: "Delivery",
          price: 95,
          location: "Alexandra",
          lat: -26.10, lng: 28.10,
          description: "From Park Station to Alexandra. Bike preferred.",
          owner: { name: "Thabo", trust: 88 },
          bids: [],
          status: "live",
          time: "11:45",
          otp: null,
          hired: null,
          privacy: { hideExactLocationWhenInProgress: true }
        },
        {
          id: 3,
          title: "Deep clean 3-room flat",
          category: "Cleaning",
          price: 320,
          location: "Orlando West, Soweto",
          lat: -26.27, lng: 27.92,
          description: "After party mess. Bring own supplies.",
          owner: { name: "Lethabo", trust: 90 },
          bids: [{ name: "Nomsa", amount: 290, time: "45m ago" }],
          status: "live",
          time: "10:15",
          otp: null,
          hired: null,
          privacy: { hideExactLocationWhenInProgress: true }
        },
        {
          id: 4,
          title: "Install new light fittings",
          category: "Electrical",
          price: 450,
          location: "Meadowlands",
          lat: -26.22, lng: 27.88,
          description: "6 LED bulbs + ceiling fan. Certified electrician only.",
          owner: { name: "Sbu", trust: 86 },
          bids: [
            { name: "Vusi", amount: 420, time: "1h ago" },
            { name: "Sbu", amount: 400, time: "3h ago" }
          ],
          status: "live",
          time: "09:50",
          otp: null,
          hired: null,
          privacy: { hideExactLocationWhenInProgress: true }
        },
        {
          id: 5,
          title: "Braids for my daughter",
          category: "Hair",
          price: 250,
          location: "Tembisa",
          lat: -25.95, lng: 28.22,
          description: "Knotless braids, shoulder length.",
          owner: { name: "Zinhle", trust: 93 },
          bids: [],
          status: "live",
          time: "12:05",
          otp: null,
          hired: null,
          privacy: { hideExactLocationWhenInProgress: true }
        },
        {
          id: 6,
          title: "Fridge not cooling",
          category: "Appliance",
          price: 350,
          location: "Orlando West",
          lat: -26.23, lng: 27.90,
          description: "Defy fridge not cooling. Need diagnosis + quick fix.",
          owner: { name: "Mama Dudu", trust: 92 },
          bids: [],
          status: "live",
          time: "12:15",
          otp: null,
          hired: null,
          privacy: { hideExactLocationWhenInProgress: true }
        },
        {
          id: 7,
          title: "Transport 2 bags to Taxi Rank",
          category: "Transport",
          price: 50,
          location: "Diepkloof",
          lat: -26.25, lng: 27.95,
          description: "Two bags, light. Need delivery within 30 minutes.",
          owner: { name: "Kagiso", trust: 80 },
          bids: [],
          status: "live",
          time: "12:20",
          otp: null,
          hired: null,
          privacy: { hideExactLocationWhenInProgress: true }
        },
        {
          id: 8,
          title: "Install DSTV dish",
          category: "Tech",
          price: 250,
          location: "Dobsonville",
          lat: -26.21, lng: 27.85,
          description: "Mount dish + align signal. Bracket available.",
          owner: { name: "Lerato", trust: 89 },
          bids: [],
          status: "live",
          time: "12:22",
          otp: null,
          hired: null,
          privacy: { hideExactLocationWhenInProgress: true }
        }
      ];
      appState.wallet = 0;
      appState.completed = 0;
      appState.alertGigId = null;
      appState.activeGigId = null;
      appState.currentRole = "hustler";
      appState.isLowData = false;
      appState.isOffline = false;
    }

    /***********************
     *  MAPS
     ***********************/
    let mainMap = null;
    let phoneMap = null;
    let mainMarkers = [];
    let tileLayer = null;

    function initMapsIfNeeded(){
      // Main map
      if(!appState.isLowData && !mainMap){
        mainMap = L.map('main-map', { zoomControl:false, attributionControl:false }).setView([-26.2041, 28.0473], 13);
        tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { className:'map-tiles' }).addTo(mainMap);
        L.control.zoom({ position:'bottomright' }).addTo(mainMap);
      }

      // Phone map (always tiny; skip in low data to save)
      if(!appState.isLowData && !phoneMap){
        phoneMap = L.map('phone-map', {
          zoomControl:false, attributionControl:false, dragging:false, scrollWheelZoom:false, doubleClickZoom:false, boxZoom:false, keyboard:false, tap:false
        }).setView([-26.25, 27.95], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(phoneMap);
        L.marker([-26.25, 27.95]).addTo(phoneMap);
      }
    }

    function destroyMainMap(){
      if(mainMap){
        mainMap.remove();
        mainMap = null;
        mainMarkers = [];
        tileLayer = null;
      }
    }

    function renderMapMarkers(gigs){
      if(!mainMap) return;
      mainMarkers.forEach(m => mainMap.removeLayer(m));
      mainMarkers = [];

      gigs.forEach(gig => {
        const iconHtml = markerEmoji(gig.category);
        const icon = L.divIcon({
          className:'custom-marker',
          html: `<div class="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xl shadow-xl border-2 border-white">${iconHtml}</div>`,
          iconSize:[32,32],
          iconAnchor:[16,16]
        });

        const marker = L.marker([gig.lat, gig.lng], { icon }).addTo(mainMap);

        const ownerLine = gig.owner?.name ? `${gig.owner.name} • Trust ${gig.owner.trust ?? 0}` : "Verified poster";
        marker.bindPopup(`
          <div class="text-sm min-w-[220px]">
            <div class="font-semibold">${escapeHtml(gig.title)}</div>
            <div class="text-xs text-emerald-700">${escapeHtml(gig.location)} • R${gig.price}</div>
            <div class="text-[10px] text-zinc-600 mt-1">${escapeHtml(ownerLine)}</div>
            <button onclick="viewGig(${gig.id}); if(window.__closePopup) window.__closePopup();" class="mt-3 w-full bg-black text-white text-xs py-2 rounded-2xl">
              Open
            </button>
          </div>
        `);

        // helper to close popup from inline handler
        window.__closePopup = () => mainMap.closePopup();

        mainMarkers.push(marker);
      });
    }

    function markerEmoji(category){
      if(category === "Plumbing") return "🔧";
      if(category === "Delivery") return "🛵";
      if(category === "Cleaning") return "🧹";
      if(category === "Electrical") return "💡";
      if(category === "Hair") return "💇";
      if(category === "Appliance") return "🔌";
      if(category === "Transport") return "🚗";
      if(category === "Tech") return "🛰️";
      return "🛠️";
    }

    /***********************
     *  UI ROUTER
     ***********************/
    function hideAllSections(){
      document.getElementById('home-section').classList.add('hidden');
      document.getElementById('map-section').classList.add('hidden');
      document.getElementById('gigs-section').classList.add('hidden');
      document.getElementById('workflow-section').classList.add('hidden');
    }

    function setActiveNav(section){
      const links = document.querySelectorAll(".nav-link");
      links.forEach(l => l.classList.remove("text-yellow-400"));
      const label = section === "home" ? "Home" : section === "map" ? "Live Map" : "Find Gigs";
      links.forEach(l => { if(l.textContent.trim() === label) l.classList.add("text-yellow-400"); });
    }

    function navigate(section){
      hideAllSections();

      if(section === "home"){
        document.getElementById('home-section').classList.remove('hidden');
      } else if(section === "map"){
        document.getElementById('map-section').classList.remove('hidden');
        initMapsIfNeeded();
        applyFilters(); // ensures map + sidebar updated
      } else if(section === "gigs"){
        document.getElementById('gigs-section').classList.remove('hidden');
        applyFilters();
      } else if(section === "workflow"){
        document.getElementById('workflow-section').classList.remove('hidden');
      }

      setActiveNav(section);
    }

    /***********************
     *  FILTERS + RENDER
     ***********************/
    function getLiveGigs(){
      return appState.gigs.filter(g => g.status === "live");
    }

    function applyFilters(){
      // Gather filter inputs (map + gigs)
      const cat1 = (document.getElementById("filter-category")?.value || "").trim();
      const cat2 = (document.getElementById("filter-category-map")?.value || "").trim();
      const category = cat1 || cat2;

      const price1 = parseInt(document.getElementById("price-filter")?.value || "600", 10);
      const price2 = parseInt(document.getElementById("price-filter-map")?.value || "600", 10);
      const maxPrice = Math.min(price1, price2);

      const termA = (document.getElementById("gigs-search")?.value || "").toLowerCase();
      const termB = (document.getElementById("map-search")?.value || "").toLowerCase();
      const term = (termA || termB).trim();

      if(document.getElementById("price-value")) document.getElementById("price-value").textContent = `R${price1}`;
      if(document.getElementById("price-value-map")) document.getElementById("price-value-map").textContent = `R${price2}`;

      let filtered = getLiveGigs();

      if(category) filtered = filtered.filter(g => normalizeCategory(g.category) === normalizeCategory(category));
      filtered = filtered.filter(g => g.price <= maxPrice);

      if(term){
        filtered = filtered.filter(g =>
          g.title.toLowerCase().includes(term) ||
          g.location.toLowerCase().includes(term) ||
          g.category.toLowerCase().includes(term) ||
          (g.owner?.name || "").toLowerCase().includes(term)
        );
      }

      renderGigsGrid(filtered);
      renderSidebar(filtered);
      renderMapMarkers(filtered);
      updateSubtitles(filtered);

      // Phone preview cards
      renderPhoneCards();
    }

    function normalizeCategory(cat){
      // 'Hair & Beauty' vs 'Hair'
      if(!cat) return "";
      const c = cat.toLowerCase();
      if(c.includes("hair")) return "hair";
      if(c.includes("plumb")) return "plumbing";
      if(c.includes("deliver")) return "delivery";
      if(c.includes("clean")) return "cleaning";
      if(c.includes("elect")) return "electrical";
      if(c.includes("appliance")) return "appliance";
      if(c.includes("transport")) return "transport";
      if(c.includes("tech")) return "tech";
      return c;
    }

    function renderGigsGrid(list){
      const container = document.getElementById("gigs-grid");
      if(!container) return;
      container.innerHTML = "";

      if(list.length === 0){
        container.innerHTML = `
          <div class="col-span-full bg-zinc-950/60 border border-zinc-800 rounded-3xl p-10 text-center">
            <div class="text-3xl">😅</div>
            <div class="mt-3 font-semibold">No gigs match your filters</div>
            <div class="text-sm text-zinc-400 mt-1">Try a higher price limit or clear the search.</div>
          </div>
        `;
        return;
      }

      list.forEach(gig => {
        const bidsPreview = gig.bids.slice(0, 3).map(b => `
          <div class="w-6 h-6 bg-zinc-700 border-2 border-zinc-900 rounded-full text-[10px] flex items-center justify-center">${escapeHtml((b.name || "?")[0] || "?")}</div>
        `).join("");

        const card = document.createElement("div");
        card.className = "job-card bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden cursor-pointer";
        card.innerHTML = `
          <div class="h-2 bg-gradient-to-r from-yellow-400 to-emerald-400"></div>
          <div class="p-6">
            <div class="flex justify-between items-start gap-4">
              <div class="min-w-0">
                <div class="text-xs uppercase tracking-widest text-zinc-500">${escapeHtml(gig.category)}</div>
                <div class="font-semibold text-lg leading-tight mt-1 line-clamp-1">${escapeHtml(gig.title)}</div>
                <div class="mt-2 text-[11px] text-zinc-400 flex items-center gap-2">
                  <span class="inline-flex items-center gap-1"><i class="fa-solid fa-location-dot text-yellow-400"></i>${escapeHtml(gig.location)}</span>
                  <span class="text-zinc-600">•</span>
                  <span class="text-zinc-400">Owner: <span class="text-white/90">${escapeHtml(gig.owner?.name || "Unknown")}</span> (<span class="text-emerald-400">${gig.owner?.trust ?? 0}</span>)</span>
                </div>
              </div>
              <div class="text-right">
                <div class="font-mono text-2xl font-bold text-yellow-400">R${gig.price}</div>
                <div class="text-[10px] text-zinc-500">${escapeHtml(gig.time || "now")}</div>
              </div>
            </div>

            <div class="mt-6 flex justify-between items-center">
              <div class="flex -space-x-2">${bidsPreview}</div>
              <div class="flex gap-2">
                <button onclick="event.stopPropagation(); viewGig(${gig.id});"
                  class="text-xs bg-white/10 hover:bg-yellow-400 hover:text-black px-4 py-2 rounded-2xl transition-all">
                  Open
                </button>
                <button onclick="event.stopPropagation(); quickBid(${gig.id});"
                  class="text-xs bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black px-4 py-2 rounded-2xl transition-all border border-emerald-500/20">
                  Quick Bid
                </button>
              </div>
            </div>
          </div>
        `;
        card.onclick = () => viewGig(gig.id);
        container.appendChild(card);
      });
    }

    function renderSidebar(list){
      const container = document.getElementById("sidebar-gigs");
      if(!container) return;
      container.innerHTML = "";

      const top = list.slice(0, 4);
      if(top.length === 0){
        container.innerHTML = `
          <div class="text-sm text-zinc-400 bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4">
            No gigs in this view.
          </div>
        `;
        return;
      }

      top.forEach(gig => {
        const el = document.createElement("div");
        el.className = "flex gap-4 cursor-pointer hover:bg-zinc-800/70 p-3 -mx-3 rounded-2xl transition-all border border-transparent hover:border-yellow-400/20";
        el.innerHTML = `
          <div class="text-2xl flex-shrink-0">${markerEmoji(gig.category)}</div>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm line-clamp-1">${escapeHtml(gig.title)}</div>
            <div class="text-xs text-zinc-400">${escapeHtml(gig.location)} • ${gig.bids.length} bids</div>
          </div>
          <div class="text-right text-xs font-mono text-yellow-400">
            R${gig.price}
          </div>
        `;
        el.onclick = () => viewGig(gig.id);
        container.appendChild(el);
      });
    }

    function updateSubtitles(filtered){
      const liveCount = getLiveGigs().length;
      const onlineHustlers = 35 + Math.floor(Math.random() * 25);

      document.getElementById("map-subtitle").textContent =
        `${filtered.length} gigs shown • ${onlineHustlers} hustlers online`;

      document.getElementById("gigs-subtitle").textContent =
        `${filtered.length} gigs shown • ${liveCount} total live`;

      // Home stats
      const inSoweto = getLiveGigs().filter(g => g.location.toLowerCase().includes("soweto") || g.location.toLowerCase().includes("orlando") || g.location.toLowerCase().includes("diepkloof")).length;
      document.getElementById("home-live-line").textContent =
        `${inSoweto} gigs live in Soweto right now`;

      document.getElementById("stats-matched").textContent = `${(4800 + Math.floor(Math.random()*500)).toLocaleString()} gigs matched this week`;
      document.getElementById("stats-repeat").textContent = `${85 + Math.floor(Math.random()*10)}% repeat hustlers`;

      // Phone line
      const phoneCount = Math.min(3, getLiveGigs().length);
      const phoneEl = document.getElementById("phone-live-count");
      if(phoneEl) phoneEl.textContent = `${getLiveGigs().length} live`;
    }

    function renderPhoneCards(){
      const wrap = document.getElementById("phone-cards");
      if(!wrap) return;
      wrap.innerHTML = "";

      const sample = getLiveGigs().slice(0, 2);
      sample.forEach(gig => {
        const card = document.createElement("div");
        card.className = "bg-zinc-800 rounded-2xl p-4 flex gap-4 cursor-pointer hover:bg-zinc-700/70 transition";
        card.onclick = () => { navigate("gigs"); viewGig(gig.id); };
        card.innerHTML = `
          <div class="w-12 h-12 bg-amber-500 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl">${markerEmoji(gig.category)}</div>
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-sm line-clamp-1">${escapeHtml(gig.title)}</div>
            <div class="text-xs text-zinc-400">${escapeHtml(gig.location)} • R${gig.price} • ${gig.bids.length} bids</div>
          </div>
        `;
        wrap.appendChild(card);
      });
    }

    /***********************
     *  GIG DETAILS + BIDDING
     ***********************/
    function viewGig(id){
      const gig = appState.gigs.find(g => g.id === id);
      if(!gig) return;

      // If already in progress and this is the active job, go to workflow
      if(gig.status === "in_progress" && appState.activeGigId === gig.id){
        navigate("workflow");
        renderActiveJobScreen();
        return;
      }

      const modal = document.getElementById("detail-modal");
      const content = document.getElementById("modal-content");

      const lowest = gig.bids.length ? Math.min(...gig.bids.map(b => b.amount), gig.price) : gig.price;
      const canStart = gig.status === "live";

      content.innerHTML = `
        <div class="flex justify-between items-start">
          <div class="min-w-0">
            <div class="uppercase text-[10px] tracking-[1px] text-emerald-400 font-mono">${gig.status === "live" ? "LIVE GIG" : gig.status.toUpperCase()}</div>
            <div class="text-2xl font-semibold mt-1 line-clamp-1">${escapeHtml(gig.title)}</div>
            <div class="text-xs text-zinc-400 mt-1">Posted by <span class="text-white/90">${escapeHtml(gig.owner?.name || "Unknown")}</span> • Trust <span class="text-emerald-400">${gig.owner?.trust ?? 0}</span></div>
          </div>
          <button onclick="hideDetailModal()" class="cursor-pointer w-9 h-9 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 hover:text-white">✕</button>
        </div>

        <div class="flex flex-wrap items-center gap-3 mt-6 text-sm">
          <div class="px-4 py-1 bg-zinc-800 rounded-2xl border border-zinc-700">${escapeHtml(gig.category)}</div>
          <div class="px-4 py-1 bg-zinc-800 rounded-2xl border border-zinc-700"><i class="fa-solid fa-location-dot text-yellow-400 mr-1"></i>${escapeHtml(gig.location)}</div>
          <div class="ml-auto font-mono text-3xl font-bold text-yellow-400">R${gig.price}</div>
        </div>

        <div class="mt-5 text-zinc-300 text-[15px] leading-relaxed">
          ${escapeHtml(gig.description)}
        </div>

        <div class="mt-7 bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-300">
          <div class="flex items-center justify-between">
            <span class="uppercase tracking-widest text-zinc-400">Bids (${gig.bids.length})</span>
            <span class="text-emerald-400 font-mono">Lowest: R${lowest}</span>
          </div>
          <div class="space-y-3 mt-3">
            ${gig.bids.length ? gig.bids.map((bid, i) => `
              <div class="flex items-center justify-between bg-zinc-800/60 p-3 rounded-2xl border border-zinc-700">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-lg">👤</div>
                  <div class="min-w-0">
                    <div class="text-sm">${escapeHtml(bid.name)}</div>
                    <div class="text-[10px] text-zinc-500">${escapeHtml(bid.time || "now")}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-semibold text-sm">R${bid.amount}</div>
                  ${
                    appState.currentRole === "employer" && canStart
                      ? `<button onclick="acceptBid(${gig.id}, ${i})" class="text-[10px] text-emerald-400 hover:underline">ACCEPT</button>`
                      : `<span class="text-[10px] text-zinc-500">${appState.currentRole === "hustler" ? "Public" : "—"}</span>`
                  }
                </div>
              </div>
            `).join("") : `<div class="text-zinc-500 text-sm">No bids yet. Be first.</div>`}
          </div>
        </div>

        <div class="mt-6 pt-6 border-t border-zinc-800">
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1">
              <div class="text-[10px] uppercase text-zinc-400 mb-2">Make your bid</div>
              <input id="bid-amount" type="number" value="${Math.max(50, gig.price - 20)}"
                class="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-emerald-400">
              <div class="text-[10px] text-zinc-500 mt-2">Real-time. Visible to all. Offline will queue locally.</div>
            </div>
            <div class="sm:w-52 flex flex-col gap-3">
              <button onclick="placeBid(${gig.id})"
                class="w-full bg-emerald-400 hover:bg-emerald-500 text-black font-semibold py-4 rounded-2xl">
                BID
              </button>

              <button onclick="${canStart ? `startJob(${gig.id})` : `showToast('This gig is not live.', 'warn')`}"
                class="w-full ${canStart ? "bg-yellow-400 hover:bg-yellow-300 text-black" : "bg-zinc-800 text-zinc-400"} font-semibold py-4 rounded-2xl">
                ${canStart ? "SEND BID (The Deal)" : "Unavailable"}
              </button>
            </div>
          </div>
        </div>
      `;

      modal.classList.remove("hidden");
      modal.classList.add("flex");
    }

    function hideDetailModal(){
      const modal = document.getElementById("detail-modal");
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }

    function quickBid(gigId){
      const gig = appState.gigs.find(g => g.id === gigId);
      if(!gig) return;
      const amount = Math.max(50, gig.price - 15);
      gig.bids.unshift({ name: "You", amount, time: "just now" });
      saveState();
      applyFilters();
      showToast(`Quick bid of R${amount} placed! 🔥`, "ok");
    }

    function placeBid(gigId){
      const input = document.getElementById("bid-amount");
      const amount = parseInt(input?.value || "0", 10);
      if(!amount || amount < 1) return;

      const gig = appState.gigs.find(g => g.id === gigId);
      if(!gig) return;

      // Offline queue simulation: store anyway, mark as queued
      gig.bids.unshift({ name: "You", amount, time: appState.isOffline ? "queued (offline)" : "just now" });
      saveState();

      applyFilters();
      showToast(appState.isOffline ? `Bid queued: R${amount} (will sync)` : `Bid of R${amount} placed! 🔥`, "ok");
      hideDetailModal();

      // Simulate another bidder if online
      if(!appState.isOffline){
        setTimeout(() => {
          const names = ["Zanele", "Kagiso", "Nomsa", "Vusi"];
          const n = names[Math.floor(Math.random()*names.length)];
          gig.bids.push({ name: n, amount: amount + 15, time: "now" });
          saveState();
          applyFilters();
        }, 2400);
      }
    }

    function acceptBid(gigId, bidIndex){
      const gig = appState.gigs.find(g => g.id === gigId);
      if(!gig) return;
      if(appState.currentRole !== "employer"){
        showToast("Switch to Employer mode to accept bids.", "warn");
        return;
      }
      const bid = gig.bids[bidIndex];
      if(!bid){
        showToast("Bid not found.", "warn");
        return;
      }
      gig.hired = { name: bid.name, amount: bid.amount };
      showToast(`Accepted ${bid.name} at R${bid.amount}. Now start the job.`, "ok");
      saveState();
      viewGig(gigId);
    }

    /***********************
     *  THE DEAL WORKFLOW
     ***********************/
    function startJob(gigId){
      const gig = appState.gigs.find(g => g.id === gigId);
      if(!gig) return;

      if(gig.status !== "live"){
        showToast("This job isn't live.", "warn");
        return;
      }

      // Generate OTP and lock job
      gig.status = "in_progress";
      gig.otp = Math.floor(1000 + Math.random()*9000);
      gig.startedAt = Date.now();

      // If no hire chosen, default to "You" at fixed price (demo)
      if(!gig.hired){
        gig.hired = { name: "You", amount: gig.price };
      }

      appState.activeGigId = gig.id;
      saveState();

      hideDetailModal();
      navigate("workflow");
      renderActiveJobScreen();

      showToast("Bid accepted! Job is Live.", "ok");
    }

    function renderActiveJobScreen(){
      const gig = appState.gigs.find(g => g.id === appState.activeGigId);
      if(!gig){
        document.getElementById("workflow-view").innerHTML = `
          <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
            <div class="text-3xl">🤷</div>
            <div class="mt-3 font-semibold">No active job</div>
            <button onclick="navigate('map')" class="mt-6 bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-2xl">Back to Map</button>
          </div>
        `;
        return;
      }

      const hideMapText = gig.privacy?.hideExactLocationWhenInProgress ? "Map location hidden for privacy." : "Location visible.";
      const withWho = appState.currentRole === "hustler" ? gig.owner?.name : (gig.hired?.name || "Hustler");
      const amount = gig.hired?.amount ?? gig.price;

      document.getElementById("workflow-view").innerHTML = `
        <div class="flex flex-col min-h-[70vh]">
          <button onclick="navigate('map')" class="mb-4 text-sm text-zinc-400 hover:text-white">
            <i class="fa-solid fa-arrow-left"></i> Back to Map
          </button>

          <!-- Status -->
          <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <div class="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <div>
              <div class="font-bold text-emerald-300 text-sm tracking-wide">JOB IN PROGRESS</div>
              <div class="text-xs text-zinc-400">${escapeHtml(hideMapText)}</div>
            </div>
            <div class="ml-auto text-xs text-zinc-400 font-mono">${new Date(gig.startedAt).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</div>
          </div>

          <!-- Job Info -->
          <div class="text-center mb-6">
            <div class="text-xs uppercase tracking-widest text-zinc-500">${escapeHtml(gig.category)}</div>
            <h2 class="text-2xl font-bold logo-font mt-1">${escapeHtml(gig.title)}</h2>
            <div class="text-zinc-400 text-sm mt-1">
              With <span class="text-white/90">${escapeHtml(withWho || "—")}</span>
              • <span class="text-yellow-400 font-mono">R${amount}</span>
            </div>
            <div class="text-[11px] text-zinc-500 mt-2">
              ${escapeHtml(gig.location)} • Trust ${gig.owner?.trust ?? 0}
            </div>
          </div>

          <!-- Actions -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <button onclick="showToast('Opening data-free chat (demo).', 'ok')"
              class="bg-zinc-800 hover:bg-zinc-700 py-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-zinc-700">
              <i class="fa-solid fa-comments text-2xl text-yellow-400"></i>
              <span class="text-xs font-bold">Chat (Data Free)</span>
            </button>
            <button onclick="showToast('Calling… (demo).', 'ok')"
              class="bg-zinc-800 hover:bg-zinc-700 py-4 rounded-2xl flex flex-col items-center justify-center gap-2 border border-zinc-700">
              <i class="fa-solid fa-phone text-2xl text-emerald-400"></i>
              <span class="text-xs font-bold">Call Now</span>
            </button>
          </div>

          <!-- Safety -->
          <button onclick="triggerPanic()"
            class="mb-auto w-full border border-red-900/50 bg-red-900/10 text-red-400 text-xs py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-red-900/20">
            <i class="fa-solid fa-triangle-exclamation"></i>
            FEEL UNSAFE? ALERT COMMUNITY
          </button>

          <!-- Completion -->
          <div class="mt-6 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
            <div class="p-5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <div class="font-semibold">Completion</div>
                <div class="text-xs text-zinc-400">OTP payout unlocks wallet release.</div>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-[10px] uppercase font-bold px-2 py-1 rounded-lg border ${appState.currentRole === "hustler" ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10" : "border-yellow-400/30 text-yellow-300 bg-yellow-400/10"}">
                  ${appState.currentRole.toUpperCase()}
                </span>
                <button onclick="toggleRoleViewForDemo()" class="text-[10px] text-zinc-400 underline">Switch view</button>
              </div>
            </div>

            <div class="p-5">
              <!-- Hustler UI -->
              <div id="hustler-completion-ui" class="${appState.currentRole === "hustler" ? "" : "hidden"}">
                <div class="text-center mb-4">
                  <h3 class="font-bold mb-1">Job Done?</h3>
                  <p class="text-xs text-zinc-400">Ask the employer for the 4-digit PIN.</p>
                </div>
                <div class="flex gap-2 justify-center mb-4">
                  <input type="number" id="otp-input" placeholder="0000"
                    class="otp-input w-44 bg-black border border-zinc-700 rounded-xl py-3 text-white text-xl focus:border-yellow-400 outline-none transition-colors">
                </div>
                <button onclick="attemptCompleteJob()" class="w-full bg-emerald-500 text-black font-bold py-4 rounded-2xl hover:bg-emerald-400">
                  COMPLETE & GET PAID
                </button>
                <div class="text-[10px] text-zinc-500 mt-2 text-center">
                  Wrong PIN? You won’t get paid until it matches.
                </div>
              </div>

              <!-- Employer UI -->
              <div id="employer-completion-ui" class="${appState.currentRole === "employer" ? "" : "hidden"} text-center">
                <h3 class="font-bold text-yellow-300 mb-2">Job Done PIN</h3>
                <p class="text-xs text-zinc-400 mb-4">Give this ONLY when satisfied with the work.</p>
                <div class="text-4xl font-mono font-bold tracking-[0.5em] bg-white text-black py-4 rounded-xl mb-4 select-all">
                  ${gig.otp}
                </div>
                <button onclick="showToast('PIN copied (demo).', 'ok')" class="text-xs bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl border border-zinc-700">Copy</button>
                <div class="text-[10px] text-zinc-500 mt-3">
                  Hustler: <span class="text-white/80">${escapeHtml(gig.hired?.name || "—")}</span> • Amount: <span class="text-yellow-400 font-mono">R${amount}</span>
                </div>
              </div>
            </div>

            <div class="p-5 border-t border-zinc-800 flex gap-3">
              <button onclick="cancelActiveJob()" class="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 rounded-2xl">
                Cancel Job
              </button>
              <button onclick="viewGig(${gig.id})" class="flex-1 bg-white/10 hover:bg-yellow-400 hover:text-black text-white font-semibold py-3 rounded-2xl">
                View Details
              </button>
            </div>
          </div>
        </div>
      `;
    }

    function toggleRoleViewForDemo(){
      appState.currentRole = appState.currentRole === "hustler" ? "employer" : "hustler";
      saveState();
      syncProfileUI();
      renderActiveJobScreen();
      showToast(`Switched to ${appState.currentRole} view.`, "ok");
    }

    function attemptCompleteJob(){
      const gig = appState.gigs.find(g => g.id === appState.activeGigId);
      if(!gig) return;

      const input = document.getElementById("otp-input")?.value || "";
      const pin = parseInt(input, 10);

      if(pin === gig.otp){
        // Complete + pay
        gig.status = "completed";
        gig.completedAt = Date.now();

        const payout = gig.hired?.amount ?? gig.price;
        appState.wallet += payout;
        appState.completed += 1;

        // Rating fun
        appState.thumbsUp += 1;
        if(Math.random() > 0.4) appState.claps += 1;

        appState.activeGigId = null;
        saveState();

        document.getElementById("workflow-view").innerHTML = `
          <div class="flex flex-col items-center justify-center text-center p-8 bg-zinc-900 border border-zinc-800 rounded-3xl">
            <div class="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-4xl mb-6 text-black animate-bounce">
              <i class="fa-solid fa-check"></i>
            </div>
            <h2 class="text-3xl font-bold logo-font mb-2">Mali In! 💸</h2>
            <p class="text-zinc-400 mb-6">R${payout} has been released to your wallet.</p>

            <div class="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl w-full mb-6">
              <div class="text-sm font-bold mb-4">Rate ${escapeHtml(gig.owner?.name || "Employer")}</div>
              <div class="flex justify-center gap-3 text-3xl text-zinc-600" id="rating-stars">
                ${[1,2,3,4,5].map(i => `<button onclick="rateEmployer(${i})" class="fa-solid fa-star hover:text-yellow-400 transition-colors"></button>`).join("")}
              </div>
              <div class="text-[10px] text-zinc-500 mt-3">Rating updates trust score (demo).</div>
            </div>

            <div class="grid grid-cols-2 gap-3 w-full">
              <button onclick="navigate('gigs'); applyFilters();" class="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl">
                Find Next Gig
              </button>
              <button onclick="showProfileModal()" class="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-4 rounded-2xl">
                View Wallet
              </button>
            </div>
          </div>
        `;

        triggerConfetti();
        syncProfileUI();
        applyFilters();
        showToast("Job completed. Paid out.", "ok");
      } else {
        showToast("❌ Incorrect PIN. Ask Employer again.", "err");
        const el = document.getElementById("otp-input");
        if(el){
          el.classList.add("border-red-500");
          setTimeout(() => el.classList.remove("border-red-500"), 1200);
        }
      }
    }

    function cancelActiveJob(){
      const gig = appState.gigs.find(g => g.id === appState.activeGigId);
      if(!gig){
        showToast("No active job.", "warn");
        return;
      }
      if(!confirm("Cancel this job? (Demo)")) return;

      // Put it back live (demo)
      gig.status = "live";
      gig.otp = null;
      gig.hired = null;
      appState.activeGigId = null;

      saveState();
      applyFilters();
      navigate("map");
      showToast("Job cancelled. Back to live.", "warn");
    }

    function rateEmployer(stars){
      // Demo: adjust trust a bit
      const lastCompleted = appState.gigs
        .filter(g => g.status === "completed")
        .sort((a,b) => (b.completedAt||0) - (a.completedAt||0))[0];

      if(lastCompleted && lastCompleted.owner){
        const delta = stars >= 4 ? 1 : stars <= 2 ? -1 : 0;
        lastCompleted.owner.trust = clamp((lastCompleted.owner.trust ?? 90) + delta, 0, 100);
        saveState();
      }

      showToast(`Rated ${stars}★ (demo).`, "ok");
    }

    /***********************
     *  POST GIG
     ***********************/
    function showPostModal(){
      document.getElementById("post-modal").classList.remove("hidden");
      document.getElementById("post-modal").classList.add("flex");
    }
    function hidePostModal(){
      document.getElementById("post-modal").classList.add("hidden");
      document.getElementById("post-modal").classList.remove("flex");
    }

    function submitPostJob(){
      const title = (document.getElementById("post-title").value || "").trim() || "New Gig";
      const price = parseInt(document.getElementById("post-price").value || "250", 10) || 250;
      const category = document.getElementById("post-category").value;
      const location = (document.getElementById("post-location").value || "").trim() || "Johannesburg";
      const desc = (document.getElementById("post-desc").value || "").trim() || "Just posted.";
      const ownerName = (document.getElementById("post-owner").value || "").trim() || "Poster";
      const ownerTrust = clamp(parseInt(document.getElementById("post-owner-trust").value || "90", 10), 0, 100);

      const baseLat = -26.22, baseLng = 27.95;
      const newGig = {
        id: Date.now(),
        title,
        category: category === "Hair" ? "Hair" : category,
        price,
        location,
        lat: baseLat + (Math.random()*0.12 - 0.06),
        lng: baseLng + (Math.random()*0.12 - 0.06),
        description: desc,
        owner: { name: ownerName, trust: ownerTrust },
        bids: [],
        status: "live",
        time: nowTimeLabel(),
        otp: null,
        hired: null,
        privacy: { hideExactLocationWhenInProgress: true }
      };

      appState.gigs.unshift(newGig);
      saveState();

      hidePostModal();
      applyFilters();

      // Smart alert for newly posted gig
      appState.alertGigId = newGig.id;
      saveState();
      showSmartAlert(newGig);

      showToast("Gig posted! Live now 🚀", "ok");
      setTimeout(() => navigate("map"), 400);
    }

    /***********************
     *  SMART ALERT + LIVE UPDATES
     ***********************/
    function showSmartAlert(gig){
      const bar = document.getElementById("smart-alert");
      const txt = document.getElementById("smart-alert-text");
      if(!bar || !txt) return;

      txt.textContent = `${gig.title} needed in ${gig.location} (R${gig.price}).`;
      bar.classList.remove("hidden");
      bar.classList.add("flex");

      setTimeout(() => {
        // auto-hide after a bit
        bar.classList.add("hidden");
        bar.classList.remove("flex");
      }, 9000);
    }

    function viewAlertGig(){
      if(!appState.alertGigId) return;
      const g = appState.gigs.find(x => x.id === appState.alertGigId);
      if(!g) return;
      navigate("map");
      viewGig(g.id);
      appState.alertGigId = null;
      saveState();
    }

    function fakeLiveUpdate(){
      if(appState.isOffline) return; // no live updates offline

      const live = getLiveGigs();
      if(!live.length) return;

      const randomGig = live[Math.floor(Math.random()*live.length)];

      // 60% chance add bid, 40% chance add new gig
      if(Math.random() < 0.6){
        if(randomGig.bids.length < 6){
          const names = ["Thabo","Nomsa","Kagiso","Zinhle","Vusi","Sbu"];
          const newBid = {
            name: names[Math.floor(Math.random()*names.length)],
            amount: Math.max(50, randomGig.price - Math.floor(Math.random()*70)),
            time: "just now"
          };
          randomGig.bids.unshift(newBid);
          saveState();
          applyFilters();
          if(!document.getElementById("map-section").classList.contains("hidden")){
            showToast(`New bid on "${randomGig.title}"!`, "ok");
          }
        }
      } else {
        const titles = ["Fix gate hinge","Wash car + vacuum","Move couch","Unblock drain","Haircut house call","Install TV bracket"];
        const cats = ["Cleaning","Plumbing","Transport","Tech","Hair","Electrical","Delivery"];
        const locs = ["Orlando West","Soweto, Protea Glen","Meadowlands","Dobsonville","Diepkloof","Tembisa","Alexandra"];
        const owners = ["Mama Dudu","Lerato","Kagiso","Sbu","Thabo","Zanele"];

        const t = titles[Math.floor(Math.random()*titles.length)];
        const c = cats[Math.floor(Math.random()*cats.length)];
        const l = locs[Math.floor(Math.random()*locs.length)];
        const o = owners[Math.floor(Math.random()*owners.length)];

        const newGig = {
          id: Date.now() + Math.floor(Math.random()*999),
          title: t,
          category: c,
          price: 80 + Math.floor(Math.random()*420),
          location: l,
          lat: -26.22 + (Math.random()*0.14 - 0.07),
          lng: 27.95 + (Math.random()*0.14 - 0.07),
          description: "New gig just dropped. Quick turnaround.",
          owner: { name: o, trust: 82 + Math.floor(Math.random()*16) },
          bids: [],
          status: "live",
          time: nowTimeLabel(),
          otp: null,
          hired: null,
          privacy: { hideExactLocationWhenInProgress: true }
        };

        appState.gigs.unshift(newGig);
        appState.alertGigId = newGig.id;
        saveState();
        applyFilters();
        showSmartAlert(newGig);
      }
    }

    /***********************
     *  PROFILE + ROLE
     ***********************/
    function showProfileModal(){
      document.getElementById("profile-modal").classList.remove("hidden");
      syncProfileUI();
    }
    function hideProfileModal(){
      document.getElementById("profile-modal").classList.add("hidden");
    }

    function switchRole(role){
      appState.currentRole = role;
      saveState();
      syncProfileUI();
      showToast(`Role: ${role}`, "ok");
    }

    function syncProfileUI(){
      const bg = document.getElementById("toggle-bg");
      const hStats = document.getElementById("hustler-stats");
      const eStats = document.getElementById("employer-stats");

      if(appState.currentRole === "hustler"){
        bg.style.transform = "translateX(0)";
        document.getElementById("btn-hustler").classList.remove("text-zinc-500");
        document.getElementById("btn-employer").classList.add("text-zinc-500");
        hStats.classList.remove("hidden");
        eStats.classList.add("hidden");
      } else {
        bg.style.transform = "translateX(100%)";
        document.getElementById("btn-hustler").classList.add("text-zinc-500");
        document.getElementById("btn-employer").classList.remove("text-zinc-500");
        hStats.classList.add("hidden");
        eStats.classList.remove("hidden");
      }

      document.getElementById("wallet-balance").textContent = `R${appState.wallet.toLocaleString()}`;
      document.getElementById("completed-count").textContent = `${appState.completed}`;
      document.getElementById("thumbs-up").textContent = `${appState.thumbsUp}`;
      document.getElementById("claps").textContent = `${appState.claps}`;

      // Trust score shown (demo)
      const trust = 94 + Math.min(6, Math.floor(appState.completed / 2));
      document.getElementById("trust-score").textContent = `${trust}`;
    }

    function addSkillPrompt(){
      const skill = prompt("Add a skill (demo):");
      if(!skill) return;
      const wrap = document.getElementById("skills-wrap");
      const chip = document.createElement("span");
      chip.className = "px-3 py-1 bg-zinc-800 rounded-lg text-xs border border-zinc-700";
      chip.textContent = skill;
      wrap.insertBefore(chip, wrap.lastElementChild);
      showToast(`Added skill: ${skill}`, "ok");
    }

    /***********************
     *  OFFLINE + DATA SAVER
     ***********************/
    function toggleOffline(){
      appState.isOffline = !appState.isOffline;

      const btn = document.getElementById("offline-btn");
      const dot = document.getElementById("offline-dot");
      const text = document.getElementById("offline-text");
      const presence = document.getElementById("presence-dot");

      if(appState.isOffline){
        dot.className = "w-2 h-2 bg-amber-400 rounded-full live-dot";
        btn.classList.remove("bg-emerald-500/10","text-emerald-400","border-emerald-500/20");
        btn.classList.add("bg-amber-500/10","text-amber-400","border-amber-500/20");
        text.textContent = "OFFLINE • CACHED";
        presence.classList.remove("bg-emerald-500");
        presence.classList.add("bg-amber-400");
        showToast("🔋 Offline mode: saving locally.", "warn");
      } else {
        dot.className = "w-2 h-2 bg-emerald-400 rounded-full live-dot";
        btn.classList.add("bg-emerald-500/10","text-emerald-400","border-emerald-500/20");
        btn.classList.remove("bg-amber-500/10","text-amber-400","border-amber-500/20");
        text.textContent = "ONLINE • JHB";
        presence.classList.add("bg-emerald-500");
        presence.classList.remove("bg-amber-400");

        // simulate sync: any "queued (offline)" bids become "synced"
        appState.gigs.forEach(g => {
          g.bids.forEach(b => {
            if((b.time || "").includes("queued")) b.time = "synced";
          });
        });
        saveState();
        applyFilters();
        showToast("📶 Back online. Synced updates.", "ok");
      }

      saveState();
    }

    function toggleDataMode(){
      appState.isLowData = !appState.isLowData;
      const body = document.body;
      const btnText = document.getElementById("data-text");
      const btn = document.getElementById("data-btn");

      if(appState.isLowData){
        body.classList.add("low-data-mode");
        btnText.textContent = "Data Saver";
        btn.classList.add("border-yellow-400","text-yellow-400");
        // destroy map to save memory + tiles
        destroyMainMap();
        showToast("Data Saver ON: map hidden.", "warn");
      } else {
        body.classList.remove("low-data-mode");
        btnText.textContent = "High Res";
        btn.classList.remove("border-yellow-400","text-yellow-400");
        // rebuild map when entering map section
        showToast("High Res ON: map enabled.", "ok");
        if(!document.getElementById("map-section").classList.contains("hidden")){
          initMapsIfNeeded();
          applyFilters();
        }
      }

      saveState();
    }

    /***********************
     *  SAFETY
     ***********************/
    function triggerPanic(){
      if(confirm("⚠ ACTIVATE PANIC MODE?\n\nDemo: This would alert community security + emergency contacts with your live location.")){
        showToast("🚨 PANIC ALERT SENT (demo)", "err");
      }
    }

    /***********************
     *  TOAST + CONFETTI
     ***********************/
    function showToast(msg, type="ok"){
      const t = document.getElementById("toast");
      const m = document.getElementById("toast-msg");
      const ico = document.getElementById("toast-ico");

      m.textContent = msg;

      if(type === "ok"){
        ico.className = "fa-solid fa-circle-check text-emerald-500";
      } else if(type === "warn"){
        ico.className = "fa-solid fa-triangle-exclamation text-amber-500";
      } else {
        ico.className = "fa-solid fa-circle-xmark text-red-500";
      }

      t.classList.remove("-translate-y-20");
      setTimeout(() => t.classList.add("-translate-y-20"), 3000);
    }

    function triggerConfetti(){
      const colors = ['#facc15', '#22c55e', '#ffffff'];
      for(let i=0; i<55; i++){
        const p = document.createElement('div');
        p.style.position='fixed';
        p.style.left='50%';
        p.style.top='45%';
        p.style.width='10px';
        p.style.height='10px';
        p.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
        p.style.transition='all 1s ease-out';
        p.style.zIndex='9999';
        p.style.borderRadius='3px';
        document.body.appendChild(p);

        setTimeout(() => {
          const x = (Math.random() - 0.5) * window.innerWidth;
          const y = (Math.random() - 0.5) * window.innerHeight;
          p.style.transform = `translate(${x}px, ${y}px) rotate(${Math.random()*360}deg)`;
          p.style.opacity='0';
        }, 10);

        setTimeout(() => p.remove(), 1000);
      }
    }

    /***********************
     *  HELPERS
     ***********************/
    function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }
    function escapeHtml(str){
      return String(str ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
    }

    /***********************
     *  KEYBOARD SHORTCUTS
     ***********************/
    document.addEventListener("keydown", (e) => {
      if(e.key === "/"){
        // Focus search in current section
        if(!document.getElementById("map-section").classList.contains("hidden")){
          document.getElementById("map-search")?.focus();
        } else if(!document.getElementById("gigs-section").classList.contains("hidden")){
          document.getElementById("gigs-search")?.focus();
        }
        e.preventDefault();
      }
      if(e.key === "Escape"){
        // Close modals
        hideDetailModal();
        hidePostModal();
        hideProfileModal();
      }
    });

    /***********************
     *  INIT
     ***********************/
    function init(){
      loadState();

      // Apply persisted data saver styling
      if(appState.isLowData) document.body.classList.add("low-data-mode");

      // Set phone time quick
      const d = new Date();
      document.getElementById("phone-time").textContent = d.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
      document.getElementById("phone-net").textContent = appState.isOffline ? "OFF" : "5G";

      // Sync role UI
      syncProfileUI();

      // Home first
      navigate("home");

      // Render everything once
      initMapsIfNeeded();
      applyFilters();

      // Smart alert after a short delay (if none already)
      setTimeout(() => {
        if(!appState.alertGigId){
          const candidate = getLiveGigs().find(g => normalizeCategory(g.category) === "appliance") || getLiveGigs()[0];
          if(candidate){
            appState.alertGigId = candidate.id;
            saveState();
            showSmartAlert(candidate);
          }
        }
      }, 2200);

      // Live updates every 8s
      setInterval(fakeLiveUpdate, 8000);

      // Resume active job if present
      if(appState.activeGigId){
        const gig = appState.gigs.find(g => g.id === appState.activeGigId);
        if(gig && gig.status === "in_progress"){
          navigate("workflow");
          renderActiveJobScreen();
        } else {
          appState.activeGigId = null;
          saveState();
        }
      }
    }

    window.onload = init;