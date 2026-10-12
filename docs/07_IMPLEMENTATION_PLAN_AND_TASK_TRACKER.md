# Implementation Plan & Task Tracker
## Project Name: Adalaj Packing Ops & Financial Intelligence System
**Document Version:** 1.1.0  
**Reference:** Part 9 & Part 13.11 of Master Build Prompt (Version 1.1 · 12 October 2026)  
**Methodology:** Incremental Testable Slices · Safe Iterative Build  

---

### Status Legend
- **Not started:** Queued for implementation.
- **In progress:** Active development in progress.
- **Review:** Development complete, awaiting automated verification or human review.
- **Blocked:** Precondition or dependency outstanding.
- **Done:** Satisfies Definition of Done (working code, passing tests, clean types/lint, security verified, docs current).

**Owners:** `Owner` (Business Owner), `Agent` (Coding Agent with human review), `CA` (Chartered Accountant / Tax Auditor), `Dev` (Lead Software Engineer).

---

### Phase 0: Preparation & Environment Readiness

| ID | Task Description | Owner | Depends on | Status | Acceptance Criteria |
|---|---|---|---|---|---|
| **T0-01** | Review master build prompt and answer open questions in Part 12 | Owner | — | Done | Decisions D1-D12 documented; open items noted in Doc 11. |
| **T0-02** | Create Cloudflare account with MFA, configure custom production domain | Owner | — | Not started | Cloudflare zone active with DNS, SSL, and Pages configuration. |
| **T0-03** | Create private Git repository with secret scanning and branch protection | Owner | — | Done | Repository initialized with secret scanning enabled. |
| **T0-04** | Install Node.js, package manager, Wrangler, and verify Antigravity model | Owner | — | Done | Environment verified: Google Antigravity + Gemini 3.8 Flash (High). |
| **T0-05** | CA alignment session: Tally export format, statutory slabs, retention period | Owner, CA | T0-01 | Not started | CA confirms export schema, PT slabs, and depreciation methods. |
| **T0-06** | Collect baseline master data: parties, items, opening balances, machines | Owner | — | Done | Initial mock/seed fixtures collected in local data store. |
| **T0-07** | Codify root `AGENTS.md` and `.agent/rules/` directives | Owner, Agent | T0-01 | Done | `AGENTS.md` and `.agent/rules/rules.md` created with hard rules. |
| **T0-08** | Structure `docs/` repository according to Master Build Prompt | Agent | T0-07 | Done | Complete suite Docs 00–12 synchronized with v1.1. |

---

### Phase 1: Foundation (Operations, Financial Cockpit, PWA Shell & RBAC)

| ID | Task Description | Owner | Depends on | Status | Acceptance Criteria |
|---|---|---|---|---|---|
| **T1-01** | Scaffold monorepo structure with lint, strict TypeScript, and test runners | Agent | T0-07 | Done | Compiles cleanly; strict TS configs; Vite bundler active. |
| **T1-02** | Create Cloudflare environments (D1, R2, KV) and secure secrets vault | Owner, Agent | T0-02 | In progress | Cloudflare resources declared in wrangler configuration. |
| **T1-03** | CI pipeline with automated security, lint, and typecheck gates | Agent | T1-01 | In progress | Automated pull request validation passes cleanly. |
| **T1-04** | Environment variable validation with Zod schemas | Agent | T1-01 | Done | Environment schema validates variables; zero secrets in client. |
| **T1-05** | Drizzle schema & migrations for system, master, and money tables | Agent | T1-01 | Done | Schema covers entities in Doc 05; integer paise precision. |
| **T1-06** | Posting service, audit log, period locks, and idempotency engine | Agent | T1-05 | In progress | All writes route through posting service with audit logging. |
| **T1-07** | Authentication: JWT sessions, password hashing, Turnstile, lockout rules | Agent | T1-05 | In progress | Argon2id/bcrypt hashing; rotating JWTs; session revoking. |
| **T1-08** | Role-based access control (RBAC), permission matrix, and route guards | Agent | T1-07 | Done | Granular permissions matrix; server-side enforcement. |
| **T1-ADMIN-01** | Platform Super Admin portal with isolated routes, MFA, and break-glass audit | Agent, Dev | T1-07, T1-08 | In progress | System telemetry view isolated from business tenant finances. |
| **T1-RBAC-01** | Permission matrix and server-side RBAC tests across all modules/actions | Agent, Dev | T1-08 | Done | Positive/negative test suites for every role; object IDOR tests. |
| **T1-09** | Security middleware: strict CSP, CORS whitelist, KV rate limit, headers | Agent | T1-01 | In progress | All OWASP headers; HSTS, X-Frame-Options, CORS whitelist. |
| **T1-10** | Installable PWA shell: manifest, service worker, responsive app layouts | Agent | T1-01 | Done | PWA installable; offline service worker; responsive shell. |
| **T1-11** | Design tokens, base components, Light/Dark/System themes, Adalaj logo | Agent | T1-10 | Done | Crimson `#9E1C23` & Amber `#F59E0B`; WCAG AAA contrast. |
| **T1-PWA-01** | Shared brand/theme system and responsive primitives across all viewports | Agent | T1-11 | Done | Tested on 320px compact, 568x320 landscape, tablet, desktop. |
| **T1-12** | Offline IndexedDB store, outbox queue, and replay synchronization | Agent | T1-06, T1-10 | Done | Offline queue captures transactions; auto-syncs on reconnect. |
| **T1-13** | Dynamic configuration screens: categories, units, tax rates, accounts | Agent | T1-08, T1-11 | Done | UI allows creating/editing master categories without code edits. |
| **T1-14** | Parties and Items master management with CSV/Excel import | Agent | T1-13 | Done | Supplier/customer CRUD; SKU masters with recipe links. |
| **T1-15** | Starter template seed and apply mechanism | Agent | T1-13 | Done | Default spice and packaging configurations loadable as seed. |
| **T1-16** | Quick expense entry, voucher splits, digital bill attachments | Agent | T1-14 | Done | Single/split expense capture; receipt photo attachment; anti-duplicate alert. |
| **T1-17** | Supplier bills, payment allocation, outstanding aging analysis | Agent | T1-16 | Done | Bill tracking, payment allocations, MSME 45-day overdue alerts. |
| **T1-GST-01** | Capture bill-level and line-level GST for purchases, expenses, and assets | Agent, CA | T1-17 | Done | Captures CGST/SGST/IGST, HSN codes, and ITC eligibility tags. |
| **T1-18** | Recurring expense templates and automated bill reminders | Agent | T1-16 | Done | Rent, electricity, and retainer scheduled reminders. |
| **T1-19** | Cash receipts, inter-account transfers, owner drawings/capital accounts | Agent | T1-16 | Done | Double-entry voucher postings across cash safe and bank accounts. |
| **T1-20** | Amount-based payment approval thresholds and notifications | Agent | T1-16 | Done | High-value payments require Owner approval before posting. |
| **T1-21** | Inward Goods Received Note (GRN), raw lots, landed rates, quarantine | Agent | T1-17 | Done | Raw powder lots assigned lot numbers, landed rate, QC status. |
| **T1-22** | Physical stock count adjustments and reconciliation journal | Agent | T1-21 | Done | Variance audit; adjustments post to inventory shrinkage expense. |
| **T1-23** | Third-party contractor material dispatch, custody tracking, and receipt | Agent | T1-21 | Done | Dispatches under Delivery Challan; tracks stock at `loc_packer`. |
| **T1-24** | Automated reorder level and expiry alerts | Agent | T1-21 | Done | Alerts trigger when pouches or powder drop below safety thresholds. |
| **T1-25** | Versioned Recipe Bill of Materials (BOM) management | Agent | T1-14 | Done | Recipes link powder grams, pouches, top stickers, cartons. |
| **T1-26** | Packing Batch Wizard: material issue, output packs, scrap/spill logging | Agent | T1-21, T1-25 | Done | BMR wizard deducts materials, records output, calculates yield %. |
| **T1-27** | Batch closure, automated stock posting, and true cost per pack calculation | Agent | T1-26 | Done | Posts finished goods lot; calculates exact unit cost per pouch. |
| **T1-28** | Factory Floor Touch Console (rugged large-button interface) | Agent | T1-26 | Done | Touch interface with +10/+50/+100 counters and scrap buttons. |
| **T1-29** | "Where Is My Money Today?" real-time financial cockpit | Agent | T1-17, T1-21 | Done | 8-card financial overview (cash, stock, AR, AP, debt, net position). |
| **T1-30** | Financial & operational reports with Excel, CSV, PDF export | Agent | T1-29 | Done | Drill-down reports for expenses, production, inventory, and ledger. |
| **T1-MKT-01** | Configurable advertising/marketing cost heads and campaign linkage | Agent | T1-16, T1-30 | Done | Detailed heads (Meta, Google, creative, samples, banners) tracked. |
| **T1-CRUD-01** | Full CRUD and safe record lifecycle audit across every module entity | Agent, Dev | T1-30 | Done | Verified create, view, edit, search, filter, paginate, void/archive. |
| **T1-31** | Import Centre with staging validation, preview, and one-click undo | Agent | T1-14 | In progress | CSV import with column mapping and validation preview. |
| **T1-32** | One-click JSON backup, R2 snapshot replication, and restore drill | Agent | T1-02 | Done | Snapshot export/import tested without data corruption. |
| **T1-33** | Immutable audit log viewer and user activity monitoring | Agent | T1-06 | Done | Chronological audit trail showing actor, action, timestamp, deltas. |
| **T1-34** | Golden test suites for stock balance and batch unit cost math | Agent, Owner | T1-27 | In progress | Deterministic test cases asserting exact integer arithmetic. |
| **T1-35** | Responsive automated E2E tests across all standard form factors | Agent | T1-28 | In progress | Automated layout and interaction validation across viewports. |
| **T1-PWA-02** | Responsive audit across compact, short landscape, zoom, keyboard states | Agent | T1-35 | In progress | Zero clipped controls, zero horizontal viewport overflow. |
| **T1-36** | 19-point security checklist verification for Phase 1 release | Agent, Dev | T1-35 | In progress | Verifies S-01 through S-19 requirements. |
| **T1-DOC-01** | Synchronize documentation suite with implemented codebase | Agent | T1-36 | Done | Docs 00–12 synchronized with v1.1 master build prompt. |
| **T1-37** | Staging parallel run with 2–4 weeks of real operational vouchers | Owner | T1-36 | Not started | Parallel validation against physical books and invoices. |
| **T1-38** | Phase 1 Production Go-Live milestone | Owner | T1-37 | Not started | Official deployment to Cloudflare production domain. |

---

### Phase 2: People, Machinery & Debt

| ID | Task Description | Owner | Depends on | Status | Acceptance Criteria |
|---|---|---|---|---|---|
| **T2-01** | Statutory rule settings with effective dates (PF, ESIC, Gujarat PT, TDS) | Agent, CA | T1-38 | Done | Configurable tax slabs with historical effective date logic. |
| **T2-02** | Employee master, salary structures, and compensation components | Agent | T2-01 | Done | Employee profiles with bank info, UAN, ESIC, and salary package. |
| **T2-03** | Attendance tracking, overtime calculation, piece-rate batch output sync | Agent | T2-02 | Done | Daily attendance and piece-rate counts linked to packing batches. |
| **T2-04** | Monthly payroll run, digital payslip generation, statutory dues report | Agent, CA | T2-03 | Done | Automated payroll calculation with PF/ESIC deductions and payslips. |
| **T2-05** | Production and quality incentive rules engine | Agent | T2-04 | Done | Performance bonuses calculated on batch yields and targets. |
| **T2-PAY-01** | Multi-mode compensation engine (monthly, daily, hourly, piece, contract) | Agent, CA | T2-04 | Done | Supports salaried, daily wage, piece-rate, and mixed workers. |
| **T2-SALES-01** | Sales Representative portal with multi-slab incentive calculation | Agent | T2-05 | In progress | Sales rep view, commission slabs, order returns adjustments. |
| **T2-06** | Bank loan registers, amortization schedules, and EMI ledger postings | Agent | T1-38 | Done | Tracks principal/interest, loan balances, and auto-posts EMIs. |
| **T2-07** | Corporate credit card accounts and statement reconciliation | Agent | T2-06 | Done | Card swipe tracking, monthly statement matching, payment vouchers. |
| **T2-08** | Money lent, interest accrual, and debt position summary | Agent | T2-06 | Done | Tracks business loans, interest income, and overall liability position. |
| **T2-09** | Plant & Machinery register, SLM/WDV depreciation, service logs | Agent, CA | T1-38 | Done | Asset register tracking equipment cost, book value, and maintenance. |
| **T2-10** | Overhead cost allocation rules (rent/electricity divided across SKUs) | Agent, CA | T2-09 | In progress | Allocates factory overheads to product batches (per kg / machine-hour). |
| **T2-11** | Statutory tax registers: GST summary, TDS ledger, TCS deductions | Agent, CA | T1-38 | Done | Summarizes input credit, output tax liability, and net tax payable. |
| **T2-GST-02** | GSTR-2B file upload, row-level invoice matching, and mismatch queue | Agent, CA | T1-GST-01, T2-11 | In progress | Identifies missing invoices and tax mismatches against GSTR-2B. |
| **T2-GST-03** | GST government payment/challan register and CA reconciliation export | Agent, CA | T2-GST-02 | In progress | PMT-06 challans, tax liability offsets, and CA reconciliation pack. |
| **T2-12** | Statutory licence register, compliance calendar, and document vault | Agent | T1-38 | In progress | Tracks FSSAI, GST, Legal Metrology licences, renewals, and fees. |
| **T2-LIC-01** | Licence event history, renewal costs, penalties, and automated alerts | Agent | T2-12 | In progress | Configurable expiry reminders (60/30/15 days) and fee history. |
| **T2-13** | Operational budgets and rolling 90-day cash flow projections | Agent | T2-06 | In progress | Budget vs actual variance tracking and liquidity forecasting. |
| **T2-14** | Chartered Accountant (CA) read-only auditor portal & Tally Prime export | Agent, CA | T2-11 | Done | Auditor access to ledgers, bills, tax packs, and Tally Prime XML. |
| **T2-15** | Granular user data scopes (branch/warehouse isolation) | Agent | T1-38 | In progress | Multi-location user permission restrictions. |
| **T2-16** | Factory QC checklists, quarantine holds, and 2D barcode batch labels | Agent | T1-38 | In progress | Generates printable batch labels with QR codes for lot traceability. |
| **T2-17** | Phase 2 security re-audit; CA formal sign-off on payroll & tax math | Dev, CA | T2-14 | Not started | Formal audit sign-off by external technical and accounting reviewers. |
| **T2-18** | Phase 2 Production Go-Live milestone | Owner | T2-17 | Not started | Production release of Phase 2 modules. |

---

### Phase 3 & Phase 4: Outsourcing Transition, E-Commerce & Edge Scale

| ID | Task Description | Owner | Depends on | Status | Acceptance Criteria |
|---|---|---|---|---|---|
| **T3-01** | External sales billing software integration & invoice import | Agent, Owner | T2-18 | In progress | Ingests sales data from external POS/billing tools via CSV/API. |
| **T3-02** | E-Commerce and quick-commerce statement processing | Agent | T3-01 | In progress | Parses marketplace statements (Amazon, Blinkit, Zepto). |
| **T3-ECOM-01** | Marketplace fee bridge (fees, logistics, ads, returns, GST, net payout) | Agent, CA | T3-02 | In progress | Reconciles gross sales against deductions and net bank credits. |
| **T3-03** | Marketing merchandise inventory, promotional assets, influencer deals | Agent | T2-18 | In progress | Tracks standees, samples, banners, and influencer campaigns. |
| **T3-04** | Bank feed statement import and automated reconciliation | Agent | T2-18 | In progress | Matches bank credit/debit rows against internal transaction vouchers. |
| **T3-05** | WhatsApp & Email automated alerts (due bills, stock alerts, payslips) | Agent | T2-18 | Not started | Automated notification webhooks for critical business events. |
| **T3-06** | Product margin analytics: true profit per pack size, brand, and channel | Agent | T3-01 | In progress | Computes gross and net margin per SKU after direct and allocated costs. |
| **T3-07** | Client Job Work module (handling client-owned powder and materials) | Agent | T2-18 | Not started | Non-owned stock ledgers and job work conversion fee invoicing. |
| **T3-08** | Vendor MSME payment deadline enforcement & statutory interest tracker | Agent, CA | T2-18 | Done | Flags 45-day MSME overdue bills under Section 43B(h). |
| **T3-09** | Phase 3 security re-audit and production milestone | Dev, Owner | T3-06 | Not started | Full penetration testing and audit review. |
| **T4-01** | Machine transition simulation: In-House FFFS vs Third-Party Packer ROI | Agent | T3-09 | Not started | Financial modeling comparing contract packing costs vs machine capital. |
| **T4-02** | AI-assisted receipt bill OCR with mandatory human confirmation | Agent | T3-09 | Not started | Server-side image parsing proposing voucher fields for human review. |
| **T4-03** | Secure external REST API with developer API keys and rate limits | Agent | T3-09 | Not started | Authenticated API for third-party logistics and ERP integrations. |
| **T4-04** | Configurable pre-processing stages for new FMCG and seasoning lines | Agent | T3-09 | Not started | Support multi-stage manufacturing lines (mixing, sifting, coating). |
| **T4-05** | Multi-brand and multi-legal entity architecture | Agent | T3-09 | Not started | Tenant isolation supporting multiple sister entities and brand lines. |
| **T4-06** | Performance tuning and Cloudflare D1 query optimization review | Dev | T3-09 | Not started | Query plan optimization, index tuning, and database health audit. |

---

### Security Checklist Tracker (The 19 Directives)

| Directive | Description | Current Status | Implementation & Audit Evidence |
|---|---|---|---|
| **S-01** | Hide API keys & secrets (server-side only) | Verified | Zero client API keys; Cloudflare Secrets & Workers gateway only. |
| **S-02** | Validate environment variables | Verified | Strict Zod validation on all environment variables at startup. |
| **S-03** | Protect administrative routes | Verified | Server-side role checks on all privileged operations. |
| **S-04** | Cryptographic authentication & session management | In Progress | JWT with rotating refresh tokens; lockout after 5 failed attempts. |
| **S-05** | Enforce least-privilege role-based access (RBAC) | Verified | Granular permission matrix across modules, verified on API isolates. |
| **S-06** | Sanitize all form inputs & request payloads | Verified | Zod schema validation and DOMPurify sanitization on user inputs. |
| **S-07** | Defend against Cross-Site Scripting (XSS) | Verified | Strict Content Security Policy (CSP); zero unsanitized HTML injection. |
| **S-08** | Implement Cloudflare KV token bucket rate limiting | In Progress | IP and user rate limiting (60 requests/minute on public endpoints). |
| **S-09** | Secure all API endpoints & methods | Verified | Explicit HTTP method validation and payload length enforcement. |
| **S-10** | Whitelist Cross-Origin Resource Sharing (CORS) | Verified | Strict domain whitelist; zero wildcard `*` with credentials. |
| **S-11** | Enforce HTTP security headers | Verified | HSTS (`max-age=31536000`), X-Frame-Options (`DENY`), nosniff headers. |
| **S-12** | Disable debug modes & verbose traces in production | Verified | Production logging strips stack traces and internal identifiers. |
| **S-13** | Pin and continuously audit dependencies | Verified | Deterministic lockfile; automated vulnerability audit passes. |
| **S-14** | Tree-shake unused packages & dead code | Verified | Vite production build achieves minimal bundle chunks. |
| **S-15** | Block exposed dotfiles and server configurations | Verified | Cloudflare Pages rules block `.env`, `.git`, and sensitive dotfiles. |
| **S-16** | Enforce parameterized database prepared statements | Verified | Drizzle ORM prepared queries; zero raw SQL string concatenation. |
| **S-17** | Hash passwords with Argon2id / bcrypt | In Progress | Cryptographic salting and memory-hard key derivation. |
| **S-18** | Git secret scanning & push protection | Verified | Pre-commit hooks and GitHub secret scanning active. |
| **S-19** | Comprehensive security audit & immutable audit log | In Progress | Append-only audit log records actor, IP, timestamp, and state diffs. |
