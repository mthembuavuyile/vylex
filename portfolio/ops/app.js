// ================= INITIAL SEED DATA =================
const DEFAULT_CLIENTS = [
  { id: "c-1", name: "Makhaswa Holdings", prefix: "MH", email: "lucas@makhaswa.co.za", contact_name: "Lucas (Owner)", phone: "+27 64 878 4287", address: "12 Marine Drive, Durban, 4001" },
  { id: "c-2", name: "Luxury Shutters & Blinds", prefix: "LSB", email: "info@luxuryshuttersandblinds.co.za", contact_name: "Sicelo Meyiwa (Owner)", phone: "+27 71 926 8316", address: "42 Bank Terrace, Westridge, Durban, 4091" },
  { id: "c-3", name: "Tokyo Creative Studio", prefix: "TC", email: "hello@tokyocreative.co.za", contact_name: "Kenji Tokyo (Director)", phone: "+27 83 222 1111", address: "44 Sandton Drive, Sandton, Johannesburg, 2196" }
];

const DEFAULT_QUOTES = [
  {
    id: "q-1",
    client_id: "c-3",
    quote_number: "Q-2026-001",
    status: "draft",
    issued_at: "2026-07-10",
    expires_at: "2026-07-24",
    line_items: [
      { 
        description: "Homepage UI/UX Redesign - Tokyo Creative Portal", 
        qty: 1, 
        rate: 9500.00,
        details: [
          "Modernised interface using Inter typography & custom grid layouts",
          "Centralised, dynamic banner management",
          "Dynamic filter engine for creative portfolio projects",
          "SEO preserved via metadata & clean semantic HTML"
        ]
      }
    ],
    subtotal: 9500.00,
    vat: 0,
    total: 9500.00,
    notes: "Requires assets to be delivered by Tokyo team."
  },
  {
    id: "q-2",
    client_id: "c-2",
    quote_number: "Q-2026-002",
    status: "accepted",
    issued_at: "2026-07-11",
    expires_at: "2026-07-25",
    line_items: [
      { 
        description: "Website V2 Redesign & Code Architecture Refactoring", 
        qty: 1, 
        rate: 800.00,
        details: [
          "Modernised site using Montserrat typography and custom grid layouts",
          "Centralised, dynamic header/footer component loading",
          "Dynamic product engine with category filtering and image lightbox",
          "SEO preserved via canonical URLs, schema markup, and custom metadata"
        ]
      }
    ],
    subtotal: 800.00,
    vat: 0,
    total: 800.00,
    notes: "Enhancements for print-ready invoice layouts."
  },
  {
    id: "q-3",
    client_id: "c-1",
    quote_number: "Q-2026-003",
    status: "sent",
    issued_at: "2026-07-15",
    expires_at: "2026-07-29",
    line_items: [
      { 
        description: "Update gallery page & optimize construction project images", 
        qty: 1, 
        rate: 1500.00,
        details: [
          "Optimized 50+ high-res portfolio images for fast web delivery",
          "Integrated smooth lightbox viewer gallery component"
        ]
      },
      { 
        description: "Develop custom operational team portal login", 
        qty: 1, 
        rate: 12000.00,
        details: [
          "Secure single-tenant auth gate with role-based access",
          "Connected database schemas for real-time client records"
        ]
      }
    ],
    subtotal: 13500.00,
    vat: 0,
    total: 13500.00,
    notes: "Direct integration with client's live staging portal."
  }
];

const DEFAULT_INVOICES = [
  {
    id: "inv-1",
    client_id: "c-2",
    quote_id: "q-2",
    invoice_number: "LSB-2026-001",
    status: "paid",
    issued_at: "2026-07-11",
    due_at: "2026-07-18",
    line_items: [
      { 
        description: "Website V2 Redesign & Code Architecture Refactoring", 
        qty: 1, 
        rate: 800.00,
        details: [
          "Modernised site using Montserrat typography and custom grid layouts",
          "Centralised, dynamic header/footer component loading",
          "Dynamic product engine with category filtering and image lightbox",
          "SEO preserved via canonical URLs, schema markup, and custom metadata"
        ]
      }
    ],
    subtotal: 800.00,
    vat: 0,
    total: 800.00,
    notes: "Settled via EFT on 2026-07-12.",
    paid_at: "2026-07-12"
  },
  {
    id: "inv-2",
    client_id: "c-1",
    quote_id: null,
    invoice_number: "MH-2026-001",
    status: "unpaid",
    issued_at: "2026-07-01",
    due_at: "2026-07-15", // Due today (unpaid -> overdue)
    line_items: [
      { 
        description: "Emergency server repair & DNS routing recovery", 
        qty: 1, 
        rate: 8500.00,
        details: [
          "Investigated core VM failure on cloud hosting platform",
          "Restored standard database backups and verified schema integrity",
          "Reconfigured Cloudflare proxy routing for fast SSL recovery"
        ]
      }
    ],
    subtotal: 8500.00,
    vat: 0,
    total: 8500.00,
    notes: "Overdue support intervention.",
    paid_at: null
  }
];

// ================= GLOBAL STATE =================
let clients = [];
let quotes = [];
let invoices = [];
let activeClientSimQuoteId = "";

// ================= RUNTIME APP START =================
document.addEventListener("DOMContentLoaded", () => {
  initData();
  
  // Set up forms & default builder inputs
  populateClientDropdown();
  updateQuoteNumberLabel();
  resetQuoteRows();
  
  // Load initial view & compute stats
  switchView("dashboard");
});

// ================= DATA LOGIC =================
function initData() {
  const localClients = localStorage.getItem("vylex_ops_clients");
  const localQuotes = localStorage.getItem("vylex_ops_quotes");
  const localInvoices = localStorage.getItem("vylex_ops_invoices");

  if (!localClients || !localQuotes || !localInvoices) {
    resetPrototypeData();
  } else {
    clients = JSON.parse(localClients);
    quotes = JSON.parse(localQuotes);
    invoices = JSON.parse(localInvoices);
    
    // Automatically migrate/enrich old client data from local storage if properties are missing
    let migrated = false;
    clients.forEach(c => {
      // Fix name mappings: change Apex -> Makhaswa, Elite -> Luxury Shutters & Blinds
      if (c.name.includes("Apex")) {
        c.name = "Makhaswa Holdings";
        c.prefix = "MH";
        c.email = "lucas@makhaswa.co.za";
        migrated = true;
      }
      if (c.name.includes("Elite") || c.name.includes("Shutters")) {
        c.name = "Luxury Shutters & Blinds";
        c.prefix = "LSB";
        c.email = "info@luxuryshuttersandblinds.co.za";
        migrated = true;
      }
      
      if (!c.contact_name) {
        migrated = true;
        if (c.name.includes("Makhaswa")) {
          c.contact_name = "Lucas (Owner)";
          c.phone = "+27 64 878 4287";
          c.address = "12 Marine Drive, Durban, 4001";
        } else if (c.name.includes("Shutters")) {
          c.contact_name = "Sicelo Meyiwa (Owner)";
          c.phone = "+27 71 926 8316";
          c.address = "42 Bank Terrace, Westridge, Durban, 4091";
        } else if (c.name.includes("Tokyo")) {
          c.contact_name = "Kenji Tokyo (Director)";
          c.phone = "+27 83 222 1111";
          c.address = "44 Sandton Drive, Sandton, Johannesburg, 2196";
        }
      }
    });
    
    // Also migrate quotes and invoices item details if they are missing or if client names/prefixes changed
    quotes.forEach(q => {
      const client = clients.find(c => c.id === q.client_id);
      if (client) {
        q.line_items.forEach((item) => {
          if (!item.details) {
            migrated = true;
            if (item.description.includes("Redesign")) {
              item.details = [
                "Modernised interface using Inter typography & custom grid layouts",
                "Centralised, dynamic banner management",
                "Dynamic filter engine for creative portfolio projects",
                "SEO preserved via metadata & clean semantic HTML"
              ];
            } else if (item.description.includes("domain") || item.description.includes("migration")) {
              item.details = [
                "Centralised domain migration with zero email downtime",
                "Configured SPF, DKIM, and DMARC security protocols",
                "Set up Google Workspace team accounts and shared drives"
              ];
            } else if (item.description.includes("gallery")) {
              item.details = [
                "Optimized 50+ high-res portfolio images for fast web delivery",
                "Integrated smooth lightbox viewer gallery component"
              ];
            } else if (item.description.includes("portal")) {
              item.details = [
                "Secure single-tenant auth gate with role-based access",
                "Connected database schemas for real-time client records"
              ];
            } else if (item.description.includes("Architecture")) {
              item.details = [
                "Modernised site using Montserrat typography and custom grid layouts",
                "Centralised, dynamic header/footer component loading",
                "Dynamic product engine with category filtering and image lightbox",
                "SEO preserved via canonical URLs, schema markup, and custom metadata"
              ];
            }
          }
        });
      }
    });

    invoices.forEach(inv => {
      const client = clients.find(c => c.id === inv.client_id);
      if (client) {
        // Fix invoice numbers prefix to match LSB and MH
        if (client.prefix === "LSB" && inv.invoice_number.startsWith("ES-")) {
          inv.invoice_number = inv.invoice_number.replace("ES-", "LSB-");
          migrated = true;
        }
        if (client.prefix === "MH" && inv.invoice_number.startsWith("AP-")) {
          inv.invoice_number = inv.invoice_number.replace("AP-", "MH-");
          migrated = true;
        }

        inv.line_items.forEach(item => {
          if (!item.details) {
            migrated = true;
            if (item.description.includes("Emergency") || item.description.includes("repair")) {
              item.details = [
                "Investigated core VM failure on cloud hosting platform",
                "Restored standard database backups and verified schema integrity",
                "Reconfigured Cloudflare proxy routing for fast SSL recovery"
              ];
            } else if (item.description.includes("domain") || item.description.includes("migration")) {
              item.details = [
                "Centralised domain migration with zero email downtime",
                "Configured SPF, DKIM, and DMARC security protocols",
                "Set up Google Workspace team accounts and shared drives"
              ];
            } else if (item.description.includes("Architecture")) {
              item.details = [
                "Modernised site using Montserrat typography and custom grid layouts",
                "Centralised, dynamic header/footer component loading",
                "Dynamic product engine with category filtering and image lightbox",
                "SEO preserved via canonical URLs, schema markup, and custom metadata"
              ];
            }
          }
        });
      }
    });

    if (migrated) {
      saveDataToLocalStorage();
    }
  }
}

function saveDataToLocalStorage() {
  localStorage.setItem("vylex_ops_clients", JSON.stringify(clients));
  localStorage.setItem("vylex_ops_quotes", JSON.stringify(quotes));
  localStorage.setItem("vylex_ops_invoices", JSON.stringify(invoices));
}

function resetPrototypeData() {
  clients = [...DEFAULT_CLIENTS];
  quotes = [...DEFAULT_QUOTES];
  invoices = [...DEFAULT_INVOICES];
  saveDataToLocalStorage();
  
  showToast("🔄 Prototype state reset to default mock values.");
  
  // Reload drops and data
  populateClientDropdown();
  updateQuoteNumberLabel();
  resetQuoteRows();
  updateDashboardData();
  loadQuotesAndInvoicesLogs();
  populateSimSelector();
}

// ================= VIEW MANAGER =================
function switchView(viewId) {
  // Hide all sections
  document.getElementById("view-dashboard").classList.add("hidden");
  document.getElementById("view-billing").classList.add("hidden");
  document.getElementById("view-builder").classList.add("hidden");
  document.getElementById("view-client").classList.add("hidden");

  // Deactivate all nav buttons
  document.getElementById("nav-dashboard").classList.remove("active");
  document.getElementById("nav-billing").classList.remove("active");
  document.getElementById("nav-builder").classList.remove("active");
  document.getElementById("nav-client").classList.remove("active");

  // Show selected section
  document.getElementById(`view-${viewId}`).classList.remove("hidden");
  
  // Activate selected nav button
  const navBtn = document.getElementById(`nav-${viewId}`);
  if (navBtn) navBtn.classList.add("active");

  // Perform view-specific data reloading
  if (viewId === "dashboard") {
    updateDashboardData();
  } else if (viewId === "billing") {
    loadQuotesAndInvoicesLogs();
  } else if (viewId === "builder") {
    updateQuoteNumberLabel();
  }
}

// ================= TOAST BANNER =================
function showToast(message) {
  const banner = document.getElementById("toast-banner");
  const msgSpan = document.getElementById("toast-msg");
  
  msgSpan.textContent = message;
  banner.classList.remove("toast-hidden");
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideToast();
  }, 5000);
}

function hideToast() {
  document.getElementById("toast-banner").classList.add("toast-hidden");
}

// ================= DASHBOARD UI LOGIC =================
function updateDashboardData() {
  // Compute Stats
  let pendingZar = 0;
  let overdueZar = 0;
  let collectedZar = 0;
  let activeQuotesCount = 0;
  
  let pendingCount = 0;
  let overdueCount = 0;
  let collectedCount = 0;

  const todayStr = "2026-07-15"; // Simulating current time in metadata context

  invoices.forEach(inv => {
    if (inv.status === "paid") {
      collectedZar += inv.total;
      collectedCount++;
    } else if (inv.status === "unpaid") {
      pendingZar += inv.total;
      pendingCount++;
      
      // Determine if overdue
      if (inv.due_at < todayStr) {
        overdueZar += inv.total;
        overdueCount++;
      }
    }
  });

  quotes.forEach(q => {
    if (q.status === "sent") {
      activeQuotesCount++;
    }
  });

  // Update UI values
  document.getElementById("stat-pending-val").textContent = formatZAR(pendingZar);
  document.getElementById("stat-pending-count").textContent = `${pendingCount} unpaid invoices`;
  
  document.getElementById("stat-overdue-val").textContent = formatZAR(overdueZar);
  document.getElementById("stat-overdue-count").textContent = `${overdueCount} invoices past due`;
  
  document.getElementById("stat-collected-val").textContent = formatZAR(collectedZar);
  document.getElementById("stat-collected-count").textContent = `${collectedCount} paid this month`;

  document.getElementById("stat-quotes-val").textContent = activeQuotesCount;

  // Populate Dashboard Table (Invoices Awaiting Action)
  const tbody = document.getElementById("dashboard-invoices-body");
  tbody.innerHTML = "";

  const unpaidInvoices = invoices.filter(inv => inv.status === "unpaid");

  if (unpaidInvoices.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-500 text-xs">No active invoices outstanding. Great job!</td></tr>`;
  } else {
    unpaidInvoices.forEach(inv => {
      const client = clients.find(c => c.id === inv.client_id) || { name: "Unknown" };
      const isOverdue = inv.due_at < todayStr;
      const statusHtml = isOverdue 
        ? `<span class="badge badge-overdue"><i class="fa-solid fa-triangle-exclamation"></i> Overdue</span>`
        : `<span class="badge badge-unpaid"><i class="fa-solid fa-clock"></i> Unpaid</span>`;

      tbody.innerHTML += `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="p-4 font-mono font-bold text-slate-900 text-xs">${inv.invoice_number}</td>
          <td class="p-4 text-xs font-semibold text-slate-700">${client.name}</td>
          <td class="p-4 text-xs text-slate-500 font-mono">${inv.due_at}</td>
          <td class="p-4 text-xs text-right font-bold text-slate-900 font-mono">${formatZAR(inv.total)}</td>
          <td class="p-4">${statusHtml}</td>
          <td class="p-4 text-center">
            <button onclick="markInvoiceAsPaid('${inv.id}')" class="text-xs bg-emerald-600/10 hover:bg-emerald-600 text-emerald-600 hover:text-white px-2.5 py-1.5 rounded-lg border border-emerald-500/20 transition-all">
              <i class="fa-solid fa-circle-check"></i> Mark Paid
            </button>
          </td>
        </tr>
      `;
    });
  }

  // Populate Client list sidebar
  const clientListDiv = document.getElementById("dashboard-clients-list");
  clientListDiv.innerHTML = "";
  clients.forEach(c => {
    clientListDiv.innerHTML += `
      <div class="flex items-center justify-between py-2.5">
        <div>
          <span class="font-bold text-slate-900 text-sm">${c.name}</span>
          <span class="block text-[10px] text-slate-500 font-mono mt-0.5">${c.email}</span>
        </div>
        <span class="text-xs bg-amber-50 text-amber-700 font-mono font-bold px-2 py-0.5 rounded border border-amber-200/60">
          Prefix: ${c.prefix}
        </span>
      </div>
    `;
  });
}

// ================= LOGS UI LOGIC =================
function loadQuotesAndInvoicesLogs() {
  const quoteBody = document.getElementById("billing-quotes-body");
  quoteBody.innerHTML = "";
  quotes.forEach(q => {
    const client = clients.find(c => c.id === q.client_id) || { name: "Unknown" };
    let statusClass = "badge-draft";
    if (q.status === "sent") statusClass = "badge-sent";
    if (q.status === "accepted") statusClass = "badge-accepted";

    quoteBody.innerHTML += `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="p-4 font-mono font-bold text-slate-900 text-xs">${q.quote_number}</td>
        <td class="p-4 text-xs font-semibold text-slate-700">${client.name}</td>
        <td class="p-4 text-xs text-right font-bold text-slate-900 font-mono">${formatZAR(q.total)}</td>
        <td class="p-4">
          <span class="badge ${statusClass}">${q.status}</span>
        </td>
        <td class="p-4 text-center">
          <button onclick="simQuoteLink('${q.id}')" class="text-[11px] bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-1 rounded-md hover:bg-amber-600 hover:text-white transition">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Open
          </button>
        </td>
      </tr>
    `;
  });

  const invoiceBody = document.getElementById("billing-invoices-body");
  invoiceBody.innerHTML = "";
  invoices.forEach(inv => {
    const client = clients.find(c => c.id === inv.client_id) || { name: "Unknown" };
    let statusClass = "badge-unpaid";
    if (inv.status === "paid") statusClass = "badge-paid";
    if (inv.status === "overdue") statusClass = "badge-overdue";

    let actionBtn = "";
    if (inv.status !== "paid") {
      actionBtn = `
        <button onclick="markInvoiceAsPaid('${inv.id}')" class="text-[11px] bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md hover:bg-emerald-600 hover:text-white transition">
          <i class="fa-solid fa-circle-check"></i> Collect
        </button>
      `;
    } else {
      actionBtn = `<span class="text-xs text-slate-500 font-semibold"><i class="fa-solid fa-check"></i> Settle EFT</span>`;
    }

    invoiceBody.innerHTML += `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="p-4 font-mono font-bold text-slate-900 text-xs">${inv.invoice_number}</td>
        <td class="p-4 text-xs font-semibold text-slate-700">${client.name}</td>
        <td class="p-4 text-xs text-right font-bold text-slate-900 font-mono">${formatZAR(inv.total)}</td>
        <td class="p-4">
          <span class="badge ${statusClass}">${inv.status}</span>
        </td>
        <td class="p-4 text-center">
          ${actionBtn}
        </td>
      </tr>
    `;
  });
}

function markInvoiceAsPaid(invoiceId) {
  const idx = invoices.findIndex(inv => inv.id === invoiceId);
  if (idx !== -1) {
    invoices[idx].status = "paid";
    invoices[idx].paid_at = new Date().toISOString().split("T")[0];
    saveDataToLocalStorage();
    showToast(`💰 Invoice ${invoices[idx].invoice_number} marked as PAID. Cash collected!`);
    updateDashboardData();
    loadQuotesAndInvoicesLogs();
  }
}

function simQuoteLink(quoteId) {
  activeClientSimQuoteId = quoteId;
  switchView("client");
  populateSimSelector();
  loadSimulatedQuote();
}

// ================= DYNAMIC QUOTE BUILDER LOGIC =================
function populateClientDropdown() {
  const select = document.getElementById("quote-client");
  select.innerHTML = "";
  clients.forEach(c => {
    select.innerHTML += `<option value="${c.id}">${c.name} (${c.prefix})</option>`;
  });
}

function updateQuoteNumberLabel() {
  const newNum = `Q-2026-00${quotes.length + 1}`;
  document.getElementById("generated-quote-num").textContent = newNum;
}

function resetQuoteRows() {
  const container = document.getElementById("quote-rows-container");
  container.innerHTML = "";
  addQuoteRow(); // Add one clean row
}

function addQuoteRow() {
  const container = document.getElementById("quote-rows-container");
  const rowIndex = container.children.length;

  const row = document.createElement("div");
  row.className = "row-grid bg-slate-50 p-3 md:p-0 rounded-xl md:bg-transparent border border-slate-200 md:border-none";
  row.id = `row-${rowIndex}`;

  row.innerHTML = `
    <div class="col-span-8" data-label="Description">
      <textarea placeholder="e.g. Website V2 Redesign&#10;- Bullet point 1&#10;- Bullet point 2" class="form-input row-desc font-sans" rows="2" required></textarea>
    </div>
    <div class="col-span-1 text-center" data-label="Qty">
      <input type="number" value="1" min="1" oninput="calculateQuoteTotal()" class="form-input row-qty text-center" required />
    </div>
    <div class="col-span-2 text-right" data-label="Unit Rate (ZAR)">
      <input type="number" placeholder="8500" min="0" oninput="calculateQuoteTotal()" class="form-input row-rate text-right" required />
    </div>
    <div class="col-span-1 text-center">
      <button type="button" onclick="deleteQuoteRow('${rowIndex}')" class="row-delete-btn" title="Delete Row">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
  `;

  container.appendChild(row);
  calculateQuoteTotal();
}

function deleteQuoteRow(index) {
  const row = document.getElementById(`row-${index}`);
  if (row) {
    // Only delete if more than 1 row exists
    const container = document.getElementById("quote-rows-container");
    if (container.children.length > 1) {
      row.remove();
      calculateQuoteTotal();
    } else {
      showToast("⚠️ Quotes must contain at least one line item.");
    }
  }
}

function calculateQuoteTotal() {
  const container = document.getElementById("quote-rows-container");
  let subtotal = 0;

  for (let row of container.children) {
    const qtyInput = row.querySelector(".row-qty");
    const rateInput = row.querySelector(".row-rate");
    
    if (qtyInput && rateInput) {
      const qty = parseFloat(qtyInput.value) || 0;
      const rate = parseFloat(rateInput.value) || 0;
      subtotal += qty * rate;
    }
  }

  const vat = 0; // Excluded/VAT exempt for now
  const total = subtotal;

  document.getElementById("summary-subtotal").textContent = formatZAR(subtotal);
  document.getElementById("summary-total").textContent = formatZAR(total);
}

function handleQuoteSubmit(e) {
  e.preventDefault();
  
  const clientId = document.getElementById("quote-client").value;
  const expiryDays = parseInt(document.getElementById("quote-expiry").value);
  const notes = document.getElementById("quote-notes").value;
  
  // Extract rows
  const container = document.getElementById("quote-rows-container");
  const line_items = [];
  let subtotal = 0;

  for (let row of container.children) {
    const descInputVal = row.querySelector(".row-desc").value;
    const qty = parseFloat(row.querySelector(".row-qty").value) || 1;
    const rate = parseFloat(row.querySelector(".row-rate").value) || 0;
    
    // Parse text area lines: first line is description, subsequent lines are details/sub-bullets
    const lines = descInputVal.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const description = lines[0] || "";
    const details = lines.slice(1).map(l => l.replace(/^[-*•]\s*/, ""));
    
    line_items.push({ description, qty, rate, details });
    subtotal += qty * rate;
  }

  const newQuoteId = `q-${quotes.length + 1}`;
  const newQuoteNum = `Q-2026-00${quotes.length + 1}`;
  
  // Generate dates
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  
  const expiryDate = new Date(today);
  expiryDate.setDate(today.getDate() + expiryDays);
  const expiryStr = expiryDate.toISOString().split("T")[0];

  const newQuote = {
    id: newQuoteId,
    client_id: clientId,
    quote_number: newQuoteNum,
    status: "sent",
    issued_at: todayStr,
    expires_at: expiryStr,
    line_items,
    subtotal,
    vat: 0,
    total: subtotal,
    notes
  };

  quotes.push(newQuote);
  saveDataToLocalStorage();

  showToast(`🚀 Quote ${newQuoteNum} generated and marked as SENT!`);
  
  // Transition to client simulation for this quote
  activeClientSimQuoteId = newQuoteId;
  switchView("client");
  populateSimSelector();
  loadSimulatedQuote();
  
  // Reset Form inputs
  document.getElementById("quote-builder-form").reset();
  resetQuoteRows();
}

// ================= CLIENT PORTAL SIMULATION LOGIC =================
function openClientSimulator() {
  // If no sim quote selected, select the first sent or draft quote
  if (!activeClientSimQuoteId && quotes.length > 0) {
    activeClientSimQuoteId = quotes[quotes.length - 1].id;
  }
  switchView("client");
  populateSimSelector();
  loadSimulatedQuote();
}

function populateSimSelector() {
  const selector = document.getElementById("client-sim-selector");
  selector.innerHTML = "";
  quotes.forEach(q => {
    const client = clients.find(c => c.id === q.client_id) || { name: "Unknown" };
    const selectedAttr = q.id === activeClientSimQuoteId ? "selected" : "";
    selector.innerHTML += `<option value="${q.id}" ${selectedAttr}>${q.quote_number} - ${client.name} (${q.status})</option>`;
  });
}

function loadSimulatedQuote() {
  const quoteId = document.getElementById("client-sim-selector").value;
  activeClientSimQuoteId = quoteId;
  const quote = quotes.find(q => q.id === quoteId);
  if (!quote) return;

  const client = clients.find(c => c.id === quote.client_id) || { name: "Unknown" };

  // Set fields
  document.getElementById("sim-doc-number").textContent = quote.quote_number;
  document.getElementById("sim-doc-date").textContent = formatDateLabel(quote.issued_at);
  document.getElementById("sim-doc-expiry").textContent = formatDateLabel(quote.expires_at || quote.due_at);
  document.getElementById("sim-client-name").textContent = client.name;
  document.getElementById("sim-client-contact").textContent = client.contact_name || "";
  document.getElementById("sim-client-phone").textContent = client.phone || "";
  document.getElementById("sim-client-email").textContent = client.email;
  document.getElementById("sim-client-address").textContent = client.address || "South Africa";

  // Build items rows
  const tbody = document.getElementById("sim-line-items");
  tbody.innerHTML = "";

  quote.line_items.forEach(item => {
    const total = item.qty * item.rate;
    let bulletsHtml = "";
    if (item.details && item.details.length > 0) {
      bulletsHtml = `
        <ul class="list-disc pl-4 mt-1.5 space-y-0.5 text-xs text-slate-500 font-light">
          ${item.details.map(bullet => `<li>${bullet}</li>`).join("")}
        </ul>
      `;
    }
    tbody.innerHTML += `
      <tr class="border-b border-gray-100 text-slate-700 align-top">
        <td class="py-4 pr-4">
          <div class="font-bold text-[#051b38]">${item.description}</div>
          ${bulletsHtml}
        </td>
        <td class="py-4 text-center font-mono text-slate-600">${item.qty}</td>
        <td class="py-4 text-right font-mono font-bold text-slate-900">${formatZAR(total)}</td>
      </tr>
    `;
  });

  // Financial summary
  document.getElementById("sim-subtotal").textContent = formatZAR(quote.total);
  document.getElementById("sim-total").textContent = formatZAR(quote.total);

  // Status Watermark & Action controls
  const watermark = document.getElementById("quote-watermark");
  const interactiveBlock = document.getElementById("sim-interactive-block");
  const paymentDetails = document.getElementById("sim-payment-details");

  if (quote.status === "accepted") {
    // Show watermark
    watermark.classList.remove("hidden");
    // Show invoice header instead of quote
    document.getElementById("sim-type-title").textContent = "Invoice";
    document.getElementById("sim-doc-expiry-label").textContent = "Due Date";
    document.getElementById("sim-total-label").textContent = "Total Due";
    
    // Hide controls, show bank details
    interactiveBlock.classList.add("hidden");
    paymentDetails.classList.remove("hidden");
    
    // Find matching invoice reference number
    const inv = invoices.find(i => i.quote_id === quote.id);
    if (inv) {
      document.getElementById("sim-bank-ref").textContent = `*${inv.invoice_number}*`;
      document.getElementById("sim-doc-number").textContent = inv.invoice_number;
      document.getElementById("sim-doc-date").textContent = formatDateLabel(inv.issued_at);
      document.getElementById("sim-doc-expiry").textContent = formatDateLabel(inv.due_at);
    }
  } else {
    // Default quote controls
    watermark.classList.add("hidden");
    document.getElementById("sim-type-title").textContent = "Project Quote";
    document.getElementById("sim-doc-expiry-label").textContent = "Expiry Date";
    document.getElementById("sim-total-label").textContent = "Total Due";
    
    interactiveBlock.classList.remove("hidden");
    paymentDetails.classList.add("hidden");
  }
}

function simulateClientAccept() {
  const quote = quotes.find(q => q.id === activeClientSimQuoteId);
  if (!quote) return;

  if (quote.status === "accepted") {
    showToast("⚠️ This project has already been accepted.");
    return;
  }

  quote.status = "accepted";
  
  // Find Client to fetch custom prefix
  const client = clients.find(c => c.id === quote.client_id) || { prefix: "INV" };
  
  // Auto-generate invoice number based on prefix
  const clientInvoices = invoices.filter(i => i.client_id === quote.client_id);
  const nextInvoiceIndex = clientInvoices.length + 1;
  const invoiceNum = `${client.prefix}-2026-00${nextInvoiceIndex}`;

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  
  const due = new Date(today);
  due.setDate(today.getDate() + 14); // Standard 14-day terms
  const dueStr = due.toISOString().split("T")[0];

  const newInvoice = {
    id: `inv-${invoices.length + 1}`,
    client_id: quote.client_id,
    quote_id: quote.id,
    invoice_number: invoiceNum,
    status: "unpaid",
    issued_at: todayStr,
    due_at: dueStr,
    line_items: quote.line_items,
    subtotal: quote.total,
    vat: 0,
    total: quote.total,
    notes: quote.notes,
    paid_at: null
  };

  invoices.push(newInvoice);
  saveDataToLocalStorage();

  showToast(`🎉 Project Accepted! Invoice ${invoiceNum} generated. EFT details populated.`);
  
  // Reload Simulator Presentation
  loadSimulatedQuote();
}

function simulateClientDecline() {
  const quote = quotes.find(q => q.id === activeClientSimQuoteId);
  if (!quote) return;

  quote.status = "declined";
  saveDataToLocalStorage();
  showToast("❌ Quote status changed to DECLINED.");
  
  // Reload
  populateSimSelector();
  loadSimulatedQuote();
}

// ================= FORMAT UTILITIES =================
function formatZAR(value) {
  return "R " + parseFloat(value).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDateLabel(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1]) - 1;
  const day = parseInt(parts[2]);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${day} ${months[monthIdx]} ${year}`;
}
