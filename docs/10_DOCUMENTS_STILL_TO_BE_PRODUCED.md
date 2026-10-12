# Documents Still to Be Produced
## Adalaj Packing Ops Hub — Technical & Operational Deliverables Roadmap
**Reference:** Part 11 of Master Build Prompt (Version 1.1)

---

### Overview

These specifications and diagrams are derived directly from the application flows in Part 3, backend schema in Part 5, and the completeness addendum in Part 13. Each deliverable serves a distinct architectural, audit, or operational purpose and is prepared according to the phased project lifecycle.

---

### Deliverables Register

| Document | Purpose | Target Milestone | Status |
|---|---|---|---|
| **DFD Level 0 (Context)** | System context mapping business interactions with external actors: suppliers, contract packers, employees, CA/auditor, banks, GST/tax authorities, and e-commerce marketplaces. | Before Phase 1 Full Build | Pending Review |
| **DFD Level 1** | Primary data flows across operational domains: procurement, packing run, expense management, multi-mode payroll, debt amortization, reporting, and statutory compliance. | Before Phase 1 Full Build | Pending Review |
| **DFD Level 2** | Sub-process decomposition: atomic batch posting & inventory decrement, payroll net pay run with statutory deductions, GSTR-2B invoice matching. | Per Module Sprint | In Progress |
| **DFD Level 3** | Algorithmic logic flows: finished SKU unit costing, overhead cost allocation, and multi-slab sales commission calculations. | Per Module as Needed | Scheduled |
| **ER Diagram & Data Dictionary** | Comprehensive relational model showing every table, column data type, foreign key constraint, indexing strategy, and field description. | Before Phase 1 Full Build | Initial Draft in Doc 05 |
| **UML Use Case Diagrams** | Actor-to-action permission boundaries across Super Admin, Owner, Accountant, Supervisor, Storekeeper, Sales Rep, and Auditor. | Before Phase 1 Full Build | Draft in Doc 03 |
| **UML Class Diagram** | Domain entities, value objects, and service relationships (PostingService, StockLedger, PayrollEngine, TaxReconciler). | Before Phase 1 Full Build | Scheduled |
| **UML Sequence Diagrams** | Step-by-step transaction flows: user login with MFA, offline expense outbox sync, inward GRN receipt, batch closure & finish goods posting, monthly payroll run, disaster backup/restore. | Per Module Sprint | Scheduled |
| **UML State Diagrams** | Lifecycle state machines for Bills (Draft, Approved, Paid, Void), Transactions (Pending, Posted, Reversed), Batches (Scheduled, In-Progress, QC-Hold, Closed), Lots (Quarantine, Active, Depleted). | Per Module Sprint | Scheduled |
| **UML Activity Diagrams** | Operational procedural workflows: month-end financial period lock, third-party job work dispatch & reconciliation, physical stock take audit. | Per Module Sprint | Scheduled |
| **Deployment Diagram** | Edge infrastructure topology: Cloudflare Pages (React PWA), Workers API gateway, D1 SQLite edge clusters, R2 document vault, KV rate limiting, external DR backup replication. | Before Phase 1 Full Build | Draft in Doc 02 |
| **OpenAPI Specification** | Fully typed REST API contract (`openapi.yaml`) defining all request schemas, query parameters, response structures, and HTTP error models. | Evolves Per Module | In Progress |
| **Wireframes & Screen Specs** | High-fidelity screen designs across mobile (portrait/short landscape), tablet, and desktop viewports adhering to Industrial Elegance tokens. | Before Each Module | Draft in Doc 04 |
| **Design Tokens Sheet** | Centralized design tokens: Adalaj Heritage Crimson (`#9E1C23`), Amber Gold (`#F59E0B`), typography hierarchy, fluid clamp spacing, and WCAG AAA contrast pairs. | Before Phase 1 UI Build | Draft in Doc 04 |
| **Test Plan & UAT Scripts** | Comprehensive test strategy covering unit tests, API integration tests, offline outbox sync assertions, responsive viewport E2E tests, and CA acceptance scripts. | Before Go-Live | In Progress |
| **Data Migration Plan** | Historical data ingestion strategy: opening cash/bank balances, supplier master import, raw powder lot balances, and parallel run validation protocol. | Before Phase 1 Pilot | Scheduled |
| **Threat Model & Security Plan** | STRIDE threat modeling covering 19 security directives, rate-limiting thresholds, CORS policies, CSP headers, and token rotation. | Before Phase 1 Full Build | Draft in Doc 06 |
| **Runbook & DR Procedures** | Operational guide: one-click backup execution, out-of-Cloudflare disaster recovery restoration, secret rotation procedures, and incident response playbooks. | Before Phase 1 Go-Live | Scheduled |
| **Statutory Rules Sheet** | Authoritative tax and payroll parameter matrix (PF 12%, ESIC 0.75%, Gujarat PT slabs, TDS section thresholds) verified and signed off by the CA. | Before Phase 2 Sprint | Pending CA Input |
| **Cost Allocation Policy** | Formal business policy defining how factory rent, electricity bills, and supervisor wages are allocated across product lines (per kg vs machine hour). | Before Phase 2 Sprint | Pending Owner Input |
| **Data Retention & Privacy Notice**| Policy on statutory record retention (8 years under Indian Companies & GST Act), employee PII minimization, and audit trail retention. | Before Phase 2 Sprint | Scheduled |
| **User Guide & Training Manual** | Role-based operational manuals for Factory Supervisors, Store Keepers, and Sales Reps in English (with Gujarati and Hindi translations planned). | Before Go-Live | Scheduled |
