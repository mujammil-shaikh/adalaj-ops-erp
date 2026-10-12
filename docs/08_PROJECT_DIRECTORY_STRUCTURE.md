# Project Directory Structure & Repository Layout
## Project Name: Adalaj Packing Ops & Financial Intelligence System
**Document Version:** 1.0.0  
**Target Environment:** Full-Stack Cloudflare (Pages + Workers + D1 + R2 + KV)  

---

### Root Directory Tree

```
adalaj-packing-ops/
├── .env.example                     # Environment template (NO SECRETS)
├── .gitignore                       # Git exclusion rules (node_modules, dist, .env, .wrangler)
├── bun.lock                         # Lockfile for deterministic package installations
├── index.html                       # HTML entry point (SEO, PWA tags, fonts, title)
├── metadata.json                    # AI Studio applet capabilities and permissions
├── package.json                     # NPM project manifest & scripts
├── tsconfig.json                    # TypeScript compiler configuration (strict mode)
├── tsconfig.node.json               # Node/Vite specific TypeScript config
├── vite.config.ts                   # Vite bundler, PWA plugin, Tailwind v4 integration
├── wrangler.toml                    # Cloudflare deployment manifest (Pages, Workers, D1, R2, KV)
│
├── docs/                            # Comprehensive System Architecture Documentation
│   ├── 01_PRODUCT_REQUIREMENTS_DOCUMENT.md
│   ├── 02_TECHNICAL_REQUIREMENTS_DOCUMENT.md
│   ├── 03_APP_FLOW_AND_USER_JOURNEYS.md
│   ├── 04_UI_UX_DESIGN_SPECIFICATION.md
│   ├── 05_BACKEND_SCHEMA_AND_DATABASE_DESIGN.md
│   ├── 06_SECURITY_AND_HARDENING_STANDARDS.md
│   ├── 07_IMPLEMENTATION_PLAN_AND_TASK_TRACKER.md
│   └── 08_PROJECT_DIRECTORY_STRUCTURE.md
│
├── public/                          # Static public assets (unbundled)
│   ├── adalaj-logo.svg              # Official Adalaj Heritage brand vector logo
│   ├── favicon.ico                  # Browser tab icon
│   ├── manifest.json                # PWA web application manifest (standalone)
│   ├── pwa-192x192.png              # Android / Chrome standard homescreen icon
│   ├── pwa-512x512.png              # Splash screen high-res icon
│   └── sw.js                        # Service worker for offline shell caching
│
├── server/                          # Cloudflare Workers Serverless Edge Backend
│   ├── index.ts                     # Worker entry point & Hono/Native API router
│   ├── middleware/                  # Edge middleware pipeline
│   │   ├── auth.ts                  # JWT validation & role-based access control (RBAC)
│   │   ├── cors.ts                  # Explicit whitelist CORS header injector
│   │   ├── rateLimit.ts             # Cloudflare KV IP token bucket limiter
│   │   ├── securityHeaders.ts       # CSP, HSTS, X-Frame-Options headers
│   │   └── validator.ts             # Zod input payload sanitizer
│   ├── routes/                      # API endpoint handlers
│   │   ├── ai.ts                    # Server-side Google Gemini Flash proxy
│   │   ├── auth.ts                  # User login, token refresh, logout
│   │   ├── batches.ts               # Packing batch BMR create, update, close, yield
│   │   ├── bills.ts                 # Vendor purchase bills & MSME tracking
│   │   ├── inventory.ts             # Stock SKUs, lots, inward GRN, movements
│   │   ├── machines.ts              # Plant asset register & maintenance logs
│   │   ├── payroll.ts               # Employees, attendance, PF/ESIC slip generation
│   │   ├── sync.ts                  # Offline outbox sync commit handler
│   │   └── transactions.ts          # Vouchers, ledger, bank account balances
│   └── db/                          # Cloudflare D1 / Drizzle ORM configuration
│       ├── schema.ts                # Drizzle SQLite table definitions
│       ├── migrations/              # SQL migration history files
│       │   ├── 0001_initial.sql
│       │   └── 0002_add_machines.sql
│       └── client.ts                # D1 database client connector
│
└── src/                             # Frontend React 19 Client Application
    ├── main.tsx                     # React root DOM hydration entry point
    ├── App.tsx                      # Root application component & module router
    ├── index.css                    # Tailwind CSS v4 entry & @custom-variant dark
    │
    ├── components/                  # Modular React UI components
    │   ├── common/                  # Reusable presentation atoms & molecules
    │   │   ├── AdalajLogo.tsx       # Dual-theme SVG brand mark & typography
    │   │   ├── ConfirmModal.tsx     # Double-confirmation safety dialog
    │   │   ├── StatCard.tsx         # Monospace financial summary card
    │   │   └── Toast.tsx            # Temporary alert notification
    │   │
    │   ├── layout/                  # Structural scaffolding components
    │   │   ├── AppLayout.tsx        # Viewport adaptive layout (sidebar/bottom nav)
    │   │   ├── OfflineIndicator.tsx # Network online/offline outbox sync status
    │   │   └── PWAInstallButton.tsx # In-app install banner & prompt handler
    │   │
    │   └── modules/                 # Major Business Feature Modules
    │       ├── DashboardWhereIsMyMoney.tsx # "Where Is My Money Today?" cockpit
    │       ├── BatchesModule.tsx          # BMR packing runs & Recipe BOM builder
    │       ├── InventoryModule.tsx        # Raw powder lots, packing foils, movements
    │       ├── ExpensesModule.tsx         # Vouchers, bills, bank accounts, parties
    │       ├── FactoryFloorMode.tsx       # Touch console for plant operators
    │       ├── PayrollModule.tsx          # Monthly, daily, piece-rate wages & PF/ESIC
    │       ├── MachinesModule.tsx         # Plant machinery assets & depreciation
    │       ├── DebtModule.tsx             # Bank loans, CC limits & EMI paydowns
    │       └── DataBackupModule.tsx       # JSON backup, snapshot restore, Tally export
    │
    ├── context/                     # Global React context providers
    │   └── ThemeContext.tsx         # Dark / Light theme state & class toggle
    │
    ├── hooks/                       # Custom React lifecycle hooks
    │   ├── useDeviceAdaptive.ts     # Screen shape & aspect ratio detection
    │   ├── useOnlineStatus.ts       # Navigator network connectivity listener
    │   └── useOutboxSync.ts         # Offline mutation queue sync trigger
    │
    ├── lib/                         # Core utility & infrastructure libraries
    │   ├── format.ts                # Indian numbering (₹ Lakh/Crore), dates, grams
    │   └── storage.ts               # Local IndexedDB/LocalStorage storage engine
    │
    └── types/                       # Shared TypeScript interface definitions
        └── index.ts                 # Vouchers, Batches, Lots, SKUs, Recipes, Machines
```

---

### File Responsibilities Summary

- **`wrangler.toml`**: Configures Cloudflare Pages and Workers routing, D1 database binding (`DB`), KV namespace binding (`RATE_LIMIT_KV`), R2 bucket binding (`ATTACHMENTS_BUCKET`), and secret environment bindings.
- **`src/lib/storage.ts`**: High-performance local storage engine that guarantees 100% functionality without internet connection, manages the append-only outbox event queue, and performs optimistic updates.
- **`src/components/modules/BatchesModule.tsx`**: Tracks both Line A (in-house production of 100g, 200g, 500g branded cylinder/pouch, 1kg, 2kg, 5kg silver foil with sticker) and Line B (job work, ₹10 strip packs outsourced to Sanand).
- **`src/components/modules/DashboardWhereIsMyMoney.tsx`**: The financial cockpit synthesizing all accounts, raw materials, packing materials, debts, and statutory reserves in real time.
- **`server/routes/ai.ts`**: The secure server-side proxy connecting to Google Gemini Flash for yield analysis, ensuring the user's API key is never exposed to client browsers.
