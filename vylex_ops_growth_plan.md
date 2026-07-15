# Vylex Ops — Growth Plan: From Prototype to Platform

## Where You Are Today

Based on the actual codebase:

| Asset | Current State | Architecture | Data |
|---|---|---|---|
| **Vylex Ops** ([app.js](file:///c:/Users/mthem/OneDrive/Desktop/vylex/ops/app.js)) | Working prototype with dashboard, quote builder, billing log, client portal simulation | Static HTML/JS, localStorage | Clients, Quotes, Invoices (linked by `client_id`, `quote_id`) |
| **Invoice Maker** (Absorbed) | Standalone free tool, absorbed into Ops billing module | Static HTML/JS, no persistence | One-off invoice data, no client relationship |
| **ComplyOS** (comply.vylex.co.za) | Separate compliance platform | Own domain, has backend | CIPC, SARS, B-BBEE compliance tracking |

Your Ops prototype already has the right **data model** — clients, quotes, invoices, and the flow between them. The foundation is solid. What's missing is persistence (database), auth (users), and the transition from "demo" to "real tool people depend on daily."

---

## The Platform Vision

```
ops.vylex.co.za (2027+)
│
├── Dashboard          ← already built (prototype)
├── Clients / CRM      ← partially built (client records in Ops)
├── Quotes             ← already built (quote builder in Ops)
├── Invoices           ← already built (billing log in Ops)
│   └── Invoice Maker  ← absorbed as the invoice generation engine
├── Tasks              ← new module
├── Documents           ← new module
├── Compliance         ← ComplyOS absorbed as module
├── AI Assistant       ← new module
├── Analytics          ← new module (extends dashboard stats)
├── Automations        ← new module
└── Settings / API     ← new module
```

Every module reinforces the same daily workflow: *a business owner opens Ops in the morning to see their clients, money, and work.*

---

## Phase 1 — Make Ops Real (Now → 3 months)

**Goal**: Go from static prototype to a live tool you and 5-10 clients actually use daily.

### What to build

| Priority | Feature | Why |
|---|---|---|
| 🔴 Critical | **Backend + Database** | localStorage → Firebase/Supabase/PostgreSQL. Without this, nothing persists across devices |
| 🔴 Critical | **Authentication** | Login for you (admin) and later clients. Start with Google Auth or email/password |
| 🔴 Critical | **Client Portal** | Your Ops prototype already simulates this — make it real. Clients click a link, see their quote, click "Accept" |
| 🟡 Important | **PDF Export** | Merge Invoice Maker's PDF generation into Ops. When a quote converts to invoice → auto-generate PDF |
| 🟡 Important | **WhatsApp Share** | One-click share quote/invoice link via WhatsApp (SA businesses live on WhatsApp) |

### How Invoice Maker gets absorbed

Your [Invoice Maker](file:///c:/Users/mthem/OneDrive/Desktop/vylex/portfolio/invoice-maker/index.html) is a standalone PDF generator with no client relationship. In Ops, the flow becomes:

```
❌ Old: Open Invoice Maker → manually type client details → generate PDF → send via email

✅ New: Ops quote accepted → auto-generates invoice → PDF ready → share via WhatsApp link
         └── client details auto-filled from CRM
         └── line items pulled from the quote
         └── invoice number auto-generated (e.g. MH-2026-002)
```

The Invoice Maker's **PDF generation logic** (html2pdf/jsPDF) becomes a utility function inside Ops. The standalone tool can stay live as a free lead magnet ("Try our free invoice maker → want the full workflow? Use Vylex Ops").

### Architecture

```
ops.vylex.co.za
├── Frontend: React / Next.js / or vanilla JS (your choice)
├── Backend: Node.js + Express or Firebase Functions
├── Database: Supabase (PostgreSQL) or Firebase Firestore
├── Auth: Firebase Auth or Supabase Auth
├── Storage: Cloud storage for documents/PDFs
└── Hosting: Vercel / Railway / own VPS
```

> [!TIP]
> Start with **Supabase** or **Firebase**. Both give you auth, database, storage, and hosting in one. You can migrate later. Don't over-engineer the infrastructure before you have paying users.

### End of Phase 1 checkpoint
- [ ] You use Ops daily for your own Vylex client billing
- [ ] At least 5 real clients can open their quote links and approve
- [ ] Data persists in a database, not localStorage
- [ ] Invoices generate as PDFs automatically

---

## Phase 2 — Sell It (3-6 months)

**Goal**: First 20 paying SME customers. Turn Ops from "my internal tool" into a product others pay for.

### What to build

| Priority | Feature | Why |
|---|---|---|
| 🔴 Critical | **Multi-tenancy** | Each business gets their own workspace. Your data model already has `client_id` — now add `org_id` |
| 🔴 Critical | **Onboarding flow** | New user signs up → sets up business name, logo, banking details → creates first client → sends first quote |
| 🟡 Important | **Client CRM** | Expand client records beyond name/prefix. Add: notes, history, last contact, total revenue, status |
| 🟡 Important | **Payment tracking** | Mark invoices as paid, partial payment, track EFT references (your prototype already has this concept) |
| 🟡 Important | **Notifications** | Email/WhatsApp alerts: "Quote accepted", "Invoice overdue", "Payment received" |
| 🟢 Nice | **Dashboard analytics** | Revenue trends, client health, overdue aging — you already compute stats in `updateDashboardData()` |

### Pricing model

| Tier | Price | Features |
|---|---|---|
| **Free** | R0/mo | 3 clients, 5 quotes/mo, Vylex branding on documents |
| **Pro** | R199-R349/mo | Unlimited clients, custom branding, PDF exports, WhatsApp integration |
| **Business** | R599-R799/mo | Multiple team members, API access, priority support |

### How to get first 20 customers
- Your existing Vylex clients (Makhaswa, Luxury Shutters, Everyday Supply, etc.) are the test market
- SA business WhatsApp groups, local Facebook groups for SMEs
- Free Invoice Maker users → upsell to Ops
- "Built for South African businesses" is your differentiator vs. global tools

### End of Phase 2 checkpoint
- [ ] 20+ businesses using Ops for real billing
- [ ] Monthly recurring revenue from subscriptions
- [ ] Multi-tenant — each business has their own workspace
- [ ] You're getting real feedback on what to build next

---

## Phase 3 — Expand the Platform (6-12 months)

**Goal**: Add modules that make Ops the place where work happens — not just billing.

### What to build (ordered by value)

| Module | What it does | Why it passes the test |
|---|---|---|
| **Tasks / Projects** | Kanban board, assign work to team members, link tasks to clients | "Which clients have active work?" — connects to billing |
| **Documents** | Store contracts, receipts, proposals per client | Every quote/invoice is already a document — extend this |
| **ComplyOS integration** | Pull compliance status into Ops dashboard | "Is this client's CIPC up to date before I invoice them?" |
| **Recurring invoices** | Auto-generate monthly invoices for retainer clients | Reduces manual work, increases retention |
| **Basic reporting** | Revenue by month, by client, by service type | Business owners need to see if they're growing |

### How ComplyOS gets absorbed

ComplyOS (comply.vylex.co.za) already has its own backend. It doesn't need to be rebuilt — it becomes an **integration**:

```
Phase 3a: API bridge
├── ComplyOS exposes an API: GET /api/org/{id}/compliance-status
├── Ops dashboard shows a "Compliance" widget pulling from that API
└── User clicks widget → opens ComplyOS in a new tab (or iframe)

Phase 3b: Full embed (later)
├── ComplyOS UI embedded inside Ops as a module
├── Single sign-on — log into Ops, ComplyOS auth is handled
└── Data shared: client → compliance records linked
```

This is the same pattern Shopify uses — POS, payments, shipping were all separate products that became embedded modules over time.

### End of Phase 3 checkpoint
- [ ] Ops has 4+ modules (Billing, CRM, Tasks, Documents)
- [ ] ComplyOS data visible from within Ops
- [ ] Users log in once and do most of their daily work inside Ops
- [ ] 50+ paying customers

---

## Phase 4 — Intelligence & Scale (12-18+ months)

**Goal**: AI becomes the interface. Ops becomes the operating system.

### What to build

| Feature | What it does |
|---|---|
| **AI Assistant** | Natural language queries: "Show overdue invoices", "Draft a follow-up for Makhaswa", "Which clients haven't ordered in 3 months?" |
| **Automations** | Rule-based triggers: "When invoice is 7 days overdue → send WhatsApp reminder", "When quote expires → notify me" |
| **Integrations** | Banking API (auto-reconcile payments), Xero/Sage export, Google Calendar sync |
| **API + Webhooks** | Let other developers build on top of Ops |
| **Mobile app** | React Native or PWA — business owners check Ops on their phone |
| **Marketplace** | Templates, plugins, integrations built by partners |

### End of Phase 4 checkpoint
- [ ] Users spend most time talking to the AI assistant instead of clicking through menus
- [ ] Ops has 100+ paying customers
- [ ] Platform has an API that third parties use
- [ ] You can fill in the blank: *"Vylex Ops is the best platform for ________"*

---

## Module Absorption Timeline

```
NOW          3 months       6 months        12 months       18 months
 │              │              │               │               │
 ▼              ▼              ▼               ▼               ▼
Ops Proto   Ops v1 Live    Ops Multi-      Ops Platform    Ops AI + API
(static)    (backend+auth) Tenant          (4+ modules)    (intelligence)
 │              │              │               │               │
 │         Invoice Maker's    ComplyOS       Full ComplyOS   AI Assistant
 │         PDF engine         API bridge     embed           Automations
 │         absorbed into      into Ops       into Ops        Integrations
 │         Ops invoicing      dashboard      as module       Mobile App
 │              │              │               │               │
 │              │              │           Tasks module        │
 │              │              │           Documents           │
 │              │              │           Reporting           │
```

---

## The One Rule

Before building any feature, ask:

> *"Does this make Vylex Ops more valuable to a business owner who already uses it for client billing?"*

- Tasks module? **Yes** — they can see what work is active alongside what's invoiced
- Documents? **Yes** — contracts and receipts live next to the client record
- ComplyOS? **Yes** — compliance status is part of running a business
- AI assistant? **Yes** — faster access to everything already in the system
- A writing app? **No** — that's Vylex Nexys territory
- A game? **No** — doesn't strengthen the core

---

## Immediate Next Step

The single most important thing to do right now:

**Move Ops from localStorage to a real backend and start using it yourself for every Vylex client interaction.**

The moment you stop using spreadsheets/WhatsApp/email to manage your own client billing and start using Ops for it — you'll discover exactly what's missing. That's your roadmap.
