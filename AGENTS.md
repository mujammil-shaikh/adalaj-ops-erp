# AGENTS.md — Autonomous Agent Directives & Engineering Standards
## Adalaj Packing Ops Hub — Operational Cockpit & Financial Intelligence System
**Reference Version:** 1.1 · October 2026

---

### 1. Project Context & Documentation Index

**Adalaj Packing Ops Hub** is an offline-first, dual-theme Progressive Web Application (PWA) and edge backend built for food & spice powder manufacturing, packaging operations, and financial intelligence in Adalaj, Gujarat.

All development must align strictly with the documentation suite under `docs/`:
- **Master Specification:** [docs/MASTER_BUILD_PROMPT.md](file:///c:/Users/shaik/Downloads/packing-ops-hub/docs/MASTER_BUILD_PROMPT.md) (Single source of truth)
- **Product Requirements (PRD):** [docs/01_PRODUCT_REQUIREMENTS_DOCUMENT.md](file:///c:/Users/shaik/Downloads/packing-ops-hub/docs/01_PRODUCT_REQUIREMENTS_DOCUMENT.md)
- **Technical Requirements (TRD):** [docs/02_TECHNICAL_REQUIREMENTS_DOCUMENT.md](file:///c:/Users/shaik/Downloads/packing-ops-hub/docs/02_TECHNICAL_REQUIREMENTS_DOCUMENT.md)
- **App Flow & User Journeys:** [docs/03_APP_FLOW_AND_USER_JOURNEYS.md](file:///c:/Users/shaik/Downloads/packing-ops-hub/docs/03_APP_FLOW_AND_USER_JOURNEYS.md)
- **UI/UX Design Specification:** [docs/04_UI_UX_DESIGN_SPECIFICATION.md](file:///c:/Users/shaik/Downloads/packing-ops-hub/docs/04_UI_UX_DESIGN_SPECIFICATION.md)
- **Backend Schema & Database:** [docs/05_BACKEND_SCHEMA_AND_DATABASE_DESIGN.md](file:///c:/Users/shaik/Downloads/packing-ops-hub/docs/05_BACKEND_SCHEMA_AND_DATABASE_DESIGN.md)
- **Security & Hardening (19 Directives):** [docs/06_SECURITY_AND_HARDENING_STANDARDS.md](file:///c:/Users/shaik/Downloads/packing-ops-hub/docs/06_SECURITY_AND_HARDENING_STANDARDS.md)
- **Implementation Plan & Tracker:** [docs/07_IMPLEMENTATION_PLAN_AND_TASK_TRACKER.md](file:///c:/Users/shaik/Downloads/packing-ops-hub/docs/07_IMPLEMENTATION_PLAN_AND_TASK_TRACKER.md)
- **Project Directory Structure:** [docs/08_PROJECT_DIRECTORY_STRUCTURE.md](file:///c:/Users/shaik/Downloads/packing-ops-hub/docs/08_PROJECT_DIRECTORY_STRUCTURE.md)
- **Agentic Build Guide:** [docs/09_AGENTIC_BUILD_GUIDE.md](file:///c:/Users/shaik/Downloads/packing-ops-hub/docs/09_AGENTIC_BUILD_GUIDE.md)
- **Documents to be Produced:** [docs/10_DOCUMENTS_STILL_TO_BE_PRODUCED.md](file:///c:/Users/shaik/Downloads/packing-ops-hub/docs/10_DOCUMENTS_STILL_TO_BE_PRODUCED.md)
- **Open Questions:** [docs/11_OPEN_QUESTIONS.md](file:///c:/Users/shaik/Downloads/packing-ops-hub/docs/11_OPEN_QUESTIONS.md)
- **Mandatory Completeness Addendum (v1.1):** [docs/12_MANDATORY_COMPLETENESS_ADDENDUM_V1.1.md](file:///c:/Users/shaik/Downloads/packing-ops-hub/docs/12_MANDATORY_COMPLETENESS_ADDENDUM_V1.1.md)

---

### 2. Technology Stack & Standard Commands

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Vite PWA
- **Backend Target:** Cloudflare Workers, Hono, Drizzle ORM, D1 (SQLite), R2 (Storage), KV (Rate Limiting)
- **Package Manager:** `bun` / `pnpm` / `npm`
- **Verification Commands:**
  - `bun run build` / `npm run build` — Production bundling and asset verification
  - `bun run lint` / `npm run lint` — Code quality and ESLint validation
  - `bun test` / `npm test` — Unit, integration, and golden calculation tests
  - `bun run typecheck` — TypeScript strict type validation

---

### 3. Non-Negotiable Hard Engineering Rules

1. **Integer Arithmetic Only:**
   - **Money:** Stored and calculated exclusively as integer paise (`1 INR = 100 paise`). Never use floating-point types for currency.
   - **Quantities:** Stored in integer base units (grams for powder, units for pouches/stickers/boxes).
2. **Zero Hardcoded Business Configuration:**
   - Categories, expense heads, SKU specifications, packaging styles, machines, locations, suppliers, unit conversions, tax rates, pay components, cost allocation rules, and approval limits are database records, not code constants.
   - Seed templates are editable starting defaults, never immutable rules. Only fixed technical workflow states exist as code enums.
3. **No Destructive Deletion of Financial/Stock Data:**
   - Never perform hard deletions on posted money, stock movements, bills, tax rows, or payroll records.
   - Corrections must execute via reversal/void with a documented justification, linking back to original entries with audit timestamps.
4. **Central Posting Service Invariant:**
   - Every state change affecting account balances or stock ledgers must route through the central Posting Service.
   - Atomic multi-table updates, idempotency key checks, and audit log generation are mandatory.
5. **Schema Validation & Query Safety:**
   - Every API payload must be strictly validated using Zod schemas.
   - Use parameterized prepared statements or Drizzle ORM queries. Never build SQL queries by string concatenation.
6. **Server-Side Authorization Everywhere:**
   - Every API mutation and data query must authenticate the user, verify role permissions, and enforce entity/data ownership on the server isolate.
   - Never rely on UI button hiding or client-side guards for security.
7. **Secrets Discipline:**
   - Never commit API keys, secrets, private tokens, or live customer PII to git, client-side code, prompts, or console logs. Use Cloudflare Secrets / environment variables.
8. **Dependency Discipline:**
   - Do not add third-party dependencies without clear architectural justification and tree-shaking assessment.
9. **Branch & Environment Isolation:**
   - Work on feature branches. Local and staging environments first. Never execute unreviewed, destructive migrations on production.
10. **Definition of Done:**
    - Code compiles cleanly with zero TypeScript errors.
    - Automated unit and integration tests pass.
    - Security checklist points for the module are verified.
    - Documentation and task tracker are updated concurrently.

---

### 4. Operational Invariant: Packaging Truth

- Current production is a **packing run**, not baking/roasting. Do not add baking shrinkage to the default process.
- Pouch packaging formats are flexible pouches (digital printed or roll-fed central seal), not rigid cans.
- Outsourced packing (third-party contractor for ₹10 pouches) is tracked distinctly from potential future customer job work.

---

### 5. When Unsure

Do not invent or guess tax treatments, statutory slabs, or accounting rules. Escalate questions to the business owner or Chartered Accountant as documented in [docs/11_OPEN_QUESTIONS.md](file:///c:/Users/shaik/Downloads/packing-ops-hub/docs/11_OPEN_QUESTIONS.md).
