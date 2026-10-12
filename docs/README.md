# Adalaj Packing Ops & Financial Intelligence System
## Master Architecture & Specification Index
**Release Version:** 1.1.0 (12 October 2026)  
**Stack:** React 19 + TypeScript + Tailwind v4 + Cloudflare (Pages / Workers / D1 / R2 / KV) + Google Antigravity & Gemini 3.8 Flash (High reasoning)  
**Location:** Adalaj, Gujarat, India  

---

### Primary Source of Truth

- **[00. Master Build Prompt & Complete Project Specification](./MASTER_BUILD_PROMPT.md)**  
  *Single-file source of truth (Version 1.1).* Defines all product behavior, packaging reality, Cloudflare edge architecture, security checklist, task tracker, agentic guidelines, and the Section 13 mandatory completeness addendum.

---

### Complete Navigable Documentation Suite

This directory contains the modular breakdown extracted from the master specification. All documents are synchronized with Version 1.1:

1. **[01. Product Requirements Document (PRD)](./01_PRODUCT_REQUIREMENTS_DOCUMENT.md)**
   - Executive summary, Line A (Own-brand in-house packing) vs Line B (Third-party ₹10 sachet strip outsourcing).
   - Packaging truth: flexible pouches (100g, 200g, 500g digitally printed; 1kg, 2kg, 5kg silver foil with top sticker; ₹10 roll-fed strip pouch). No baking/roasting in default line.
   - Machine transition plan: Current vertical band sealer + handheld coding gun $\rightarrow$ Planned 3-screw Auger Servo FFFS machine.
   - Core modules: "Where Is My Money Today?" cockpit, BMR batch tracking, inventory lots (GRN), multi-tier expenses, payroll, and debt registers.

2. **[02. Technical Requirements Document (TRD)](./02_TECHNICAL_REQUIREMENTS_DOCUMENT.md)**
   - High-level Cloudflare architecture (Pages frontend, Workers API isolates, D1 SQLite database, R2 object storage, KV rate limiting).
   - Offline-first IndexedDB engine with outbox replay pattern.
   - Edge performance, sub-50ms latency, and caching strategy.

3. **[03. App Flow & User Journeys](./03_APP_FLOW_AND_USER_JOURNEYS.md)**
   - Role-based permissions matrix (Super Admin, Owner, Accountant, Supervisor, Storekeeper, Sales Rep, CA/Auditor).
   - Module hierarchy and step-by-step user journeys: inward powder GRN, batch execution, third-party contractor dispatch, expense entry with anti-fraud duplicate checks.

4. **[04. UI/UX Design Specification](./04_UI_UX_DESIGN_SPECIFICATION.md)**
   - Industrial elegance and anti-AI slop design principles (Zero-Pill discipline).
   - Color tokens: Adalaj Heritage Crimson (`#9E1C23`), Amber Gold (`#F59E0B`), Light/Dark/System themes, WCAG AAA contrast.
   - Typography hierarchy (Montserrat UI, Playfair Display headers, tabular monospace numbers).
   - Viewport adaptive matrix (compact mobile, short landscape, tablet, widescreen desktop).
   - Factory Floor Mode high-visibility touch console ergonomics.

5. **[05. Backend Schema & Database Design](./05_BACKEND_SCHEMA_AND_DATABASE_DESIGN.md)**
   - Complete Drizzle ORM schema for Cloudflare D1 / SQLite: Accounts, Parties, SKUs, Stock Lots, Movements, Recipes/BOMs, Batches, Bills, Employees, Machines, Loans, and Outbox Events.
   - Integer paise currency storage and gram-level powder precision.

6. **[06. Security & Hardening Standards (The 19 Directives)](./06_SECURITY_AND_HARDENING_STANDARDS.md)**
   - Comprehensive implementation of all 19 security requirements (API key isolation, env validation, admin route protection, JWT/MFA auth, RBAC, input sanitization, CSP/CORS, rate limiting, D1 prepared statements, Argon2id/bcrypt, git secret scanning).

7. **[07. Implementation Plan & Task Tracker](./07_IMPLEMENTATION_PLAN_AND_TASK_TRACKER.md)**
   - Complete phased task tracker (Phase 0 Preparation, Phase 1 Foundation, Phase 2 People & Debt, Phase 3 Outsourcing Transition & E-Com, Phase 4 Scale).
   - Section 13 milestone acceptance tasks (GST capture, ITC matching, marketing costs, licence vault, multi-pay models, sales rep engine, super admin portal).
   - 19-point security checklist verification tracker.

8. **[08. Project Directory Structure](./08_PROJECT_DIRECTORY_STRUCTURE.md)**
   - Monorepo directory layout from root `/` showing full-stack Cloudflare and React responsibilities.

9. **[09. Agentic Build Guide (Antigravity & Gemini)](./09_AGENTIC_BUILD_GUIDE.md)**
   - Coding agent standards using Google Antigravity with Gemini 3.8 Flash (High reasoning).
   - Root `AGENTS.md` hard rules, standard prompt template, execution report format, and safety rules.

10. **[10. Documents Still to Be Produced](./10_DOCUMENTS_STILL_TO_BE_PRODUCED.md)**
    - Register of upcoming engineering deliverables: DFD levels 0–3, UML class/sequence/state/activity diagrams, deployment topology, OpenAPI spec, test plan, and data migration plan.

11. **[11. Open Questions & Architecture Decisions](./11_OPEN_QUESTIONS.md)**
    - 15 business and technical questions requiring Owner and CA clarification, detailing configurable baselines and design implications.

12. **[12. Mandatory Completeness Addendum (Version 1.1)](./12_MANDATORY_COMPLETENESS_ADDENDUM_V1.1.md)**
    - Binding requirements expansion: bill-level GST & ITC reconciliation (GSTR-2B matching), advertising/marketing cost heads, e-commerce fee bridge, licence/compliance vault, multi-mode payroll & sales rep incentive engine, full CRUD everywhere, separate Platform Super Admin vs Business Owner RBAC portals, and responsive PWA acceptance gates.
