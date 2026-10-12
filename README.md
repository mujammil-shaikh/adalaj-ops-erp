# Adalaj Packing Ops Hub
## Operational Cockpit & Financial Intelligence System
**Version:** 1.1.0 · October 2026 · Adalaj, Gujarat, India  
**Stack:** React 19 + TypeScript + Tailwind CSS v4 + Cloudflare (Pages / Workers / D1 / R2 / KV) + Google Antigravity & Gemini 3.8 Flash (High reasoning)  

---

### Master Specification & Source of Truth

- **[Master Build Prompt & Project Specification](./docs/MASTER_BUILD_PROMPT.md)**: Single-file source of truth (Version 1.1) governing product requirements, Cloudflare edge architecture, UI/UX tokens, Drizzle schema, 19 security directives, implementation roadmap, and the Section 13 mandatory completeness addendum.
- **[Agent Engineering Directives (AGENTS.md)](./AGENTS.md)**: Hard coding and architectural invariants (integer paise math, zero hardcoded business configuration, posting service invariant, non-destructive deletion, server-side RBAC).

---

### Complete Documentation Suite

All architectural, operational, and technical specifications are organized in the [`docs/`](./docs/README.md) directory:

1. **[01. Product Requirements Document (PRD)](./docs/01_PRODUCT_REQUIREMENTS_DOCUMENT.md)** — Production lines, packaging specifications, core modules, and non-goals.
2. **[02. Technical Requirements Document (TRD)](./docs/02_TECHNICAL_REQUIREMENTS_DOCUMENT.md)** — Cloudflare edge architecture, offline sync engine, performance standards.
3. **[03. App Flow & User Journeys](./docs/03_APP_FLOW_AND_USER_JOURNEYS.md)** — RBAC role hierarchy, navigation matrix, and detailed operational workflows.
4. **[04. UI/UX Design Specification](./docs/04_UI_UX_DESIGN_SPECIFICATION.md)** — Industrial elegance tokens, Adalaj Crimson & Amber palettes, WCAG AAA contrast, Factory Floor Mode.
5. **[05. Backend Schema & Database Design](./docs/05_BACKEND_SCHEMA_AND_DATABASE_DESIGN.md)** — Drizzle ORM schema for SQLite / Cloudflare D1 with integer currency and gram units.
6. **[06. Security & Hardening Standards](./docs/06_SECURITY_AND_HARDENING_STANDARDS.md)** — Complete 19-point security checklist and OWASP edge protection.
7. **[07. Implementation Plan & Task Tracker](./docs/07_IMPLEMENTATION_PLAN_AND_TASK_TRACKER.md)** — Phased engineering task tracker with acceptance gates and security tracker.
8. **[08. Project Directory Structure](./docs/08_PROJECT_DIRECTORY_STRUCTURE.md)** — Full-stack monorepo folder layout and responsibilities.
9. **[09. Agentic Build Guide](./docs/09_AGENTIC_BUILD_GUIDE.md)** — Antigravity & Gemini 3.8 Flash pair-programming protocols and report templates.
10. **[10. Documents Still to Be Produced](./docs/10_DOCUMENTS_STILL_TO_BE_PRODUCED.md)** — Roadmap for upcoming engineering artifacts (DFD 0-3, UML diagrams, OpenAPI spec).
11. **[11. Open Questions & Architecture Decisions](./docs/11_OPEN_QUESTIONS.md)** — 15 prioritized questions for business owners and Chartered Accountants.
12. **[12. Mandatory Completeness Addendum (v1.1)](./docs/12_MANDATORY_COMPLETENESS_ADDENDUM_V1.1.md)** — Binding addendum for bill-level GST/ITC, marketing costs, licences, multi-mode payroll, sales incentives, full CRUD, and separate RBAC portals.

---

### Getting Started

#### Prerequisites
- Node.js (v20+ recommended) or Bun

#### Installation & Execution
```bash
# Install dependencies
bun install   # or npm install

# Run local development server
bun run dev   # or npm run dev

# Run TypeScript typecheck
bun run typecheck   # or npm run typecheck

# Production build
bun run build   # or npm run build
```

---

### Core Operational Truths

1. **Packing Run Operations:** Current manufacturing is a **packing run**, not baking/roasting. No baking shrinkage is applied by default.
2. **Packaging Formats:** Flexible pouches (100g, 200g, 500g digitally printed; 1kg, 2kg, 5kg silver-foil pouches with top stickers; ₹10 roll-fed strip pouches). Pouches are not rigid cans.
3. **Outsourcing Segregation:** Adalaj own-brand ₹10 packaging outsourced to a third-party packer is tracked under segregated custody (`loc_packer`) with delivery challans, distinct from potential customer job work.
