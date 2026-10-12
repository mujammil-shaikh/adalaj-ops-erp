# Mandatory Completeness Addendum — Version 1.1
## Adalaj Packing Ops Hub — Operational & Financial Completeness Specification
**Reference:** Part 13 of Master Build Prompt (Version 1.1 · 12 October 2026)

---

### Binding Scope Notice

This document is a binding extension to all preceding specifications (Parts 1–12). Every requirement specified here must be represented in the data schema, UI views, API endpoints, permissions matrix, automated tests, and operational reports.

Mockups, static screens, or unbacked documentation do not constitute implementation. Where advanced reconciliation workflows are phased, underlying source data (bills, GST components, expense splits, audit trails) must be captured from Phase 1 to preserve historical integrity.

---

### 13.1 Explicit Coverage Matrix

| Operational Area | Required System Coverage | Phased Delivery Expectation |
|---|---|---|
| **Advertising & Marketing** | Complete tracking of all ad spend, platforms (Meta, Google, Amazon Ads), influencer contracts, packaging artwork design, creative production, POS banners, product catalogues, samples issued, exhibitions, trade fair booths, dealer schemes, cashbacks, and sales commissions with itemized tax/bills. | Foundation expense capture & configurable heads in Phase 1; advanced campaign ROI analytics in Phase 3. |
| **E-Commerce & Quick Commerce** | Multi-channel marketplace reconciliations: Amazon, Flipkart, Blinkit, Zepto, Instamart. Full breakdown of referral commission, closing fees, FBA/storage charges, pick-and-pack, shipping logistics, reverse logistics (RTO), customer refunds, penalties, GST on fees, TCS deductions, and net bank payout bridges. | Manual file/CSV statement import and reconciliation in Phase 2/3; direct API webhooks in Phase 4. |
| **Licences & Compliance** | Dynamic registry of statutory registrations: FSSAI Food Business Licence, GST certificates, Trademark classes, Legal Metrology (Weights & Measures), Factory Inspectorate, Gujarat Pollution Control Board (GPCB), Fire NOC, GS1 Barcodes, Udyam MSME, and periodic lab test reports. Renewal fees, penalties, document vaults, and automated alerts. | Master register, document vault, expense linkage, and due-date alerts in Phase 2. |
| **GST on Purchases & Expenses** | Bill-level and line-level tax capture across raw spice powder, packaging films, stickers, cartons, machinery assets, maintenance, electricity, freight, and services. Tracks CGST, SGST, IGST, cess, reverse charge (RCM), and vendor GSTIN validity. | Full invoice & line tax capture with supplier bills in Phase 1; automated reconciliation in Phase 2. |
| **GST Paid, Claimed & Reconciled** | Input Tax Credit (ITC) lifecycle: Eligible, Ineligible (blocked under Sec 17(5)), Pending supplier upload, Matched with GSTR-2B, Claimed, Reversed, and Reclaimed. Tax liability netting, government challan tracking (PMT-06 / GSTR-3B offsets), and audit export packs for the CA. | Source tax ledgers in Phase 1; GSTR-2B statement import & mismatch queue in Phase 2. |
| **Multi-Mode Payroll & Labour** | Flexible workforce compensation: Fixed monthly salary, daily wage, hourly wage, shift rate, overtime hours, piece-rate (₹ per pack or per kg), contract labour, and mixed packages. Integrated attendance, advance loans & recovery schedules, Gujarat Professional Tax (PT) slabs, PF (12%), ESIC (0.75%), and TDS. | Employee setup and wage schema in Phase 1; full automated payroll run and payslips in Phase 2. |
| **Sales Representatives & Incentives** | Dedicated Sales Rep portal and incentive engine: Fixed base pay + multi-slab sales commission, territory targets, volume incentives, deduction for returns/credit notes, collection-based milestones, and expense reimbursements with approval workflows. | Sales Rep portal, incentive rule builder, and calculation engine in Phase 2/3. |
| **Full CRUD Everywhere** | Complete Create, Read, Update, Search, Filter, Sort, Paginate, Attach, History, and Export functionality across every entity and child table (bills, bill lines, employees, machines, batches, campaigns, licences). Zero inert or non-functional UI controls. | Enforced across every sprint and verified via automated test suites. |
| **Role-Based Access Control (RBAC) & Portals** | Distinct portals with server-side privilege boundaries: Platform Super Admin, Business Owner/Admin, Accountant, Storekeeper, Production Supervisor, Labour/Employee, Sales Rep, and CA/Auditor. Role matrix enforced on every API route and database query. | Core RBAC in Phase 1; dedicated role portals delivered across Phase 1 and Phase 2. |
| **Adaptive PWA & Zero-Pill Design** | Responsive across all real viewport dimensions: compact mobile (320px), ultra-short landscape (568x320), tablets, foldables, and widescreen displays. Adalaj Heritage Crimson (`#9E1C23`) & Amber Gold (`#F59E0B`), Light/Dark/System themes, WCAG AAA contrast, offline sync. | PWA baseline in Phase 1; verified continuously with responsive E2E test runs. |

---

### 13.2 Bill-Level GST, ITC & Statutory Tax Architecture

#### 1. Inward Bill Data Model
Every supplier invoice, expense bill, debit note, and credit note captures:
- Supplier Legal Name, Trade Name, GSTIN, State Code, Place of Supply.
- Supplier Invoice Number, Invoice Date, Financial Year, Payment Due Date.
- Bill Lines: Item/Service link, HSN/SAC code, quantity, unit rate, gross value, discount, taxable base value.
- Tax Components: CGST %, SGST %, IGST %, Cess % with computed rupee amounts.
- ITC Review Status: `ELIGIBLE`, `INELIGIBLE_BLOCKED`, `PENDING_2B`, `MATCHED_2B`, `CLAIMED`, `REVERSED`, `RECLAIMED`.
- RCM (Reverse Charge Mechanism) flag where tax is payable by Adalaj directly to the government.
- Digital attachments (PDF invoice or camera receipt photo stored in Cloudflare R2 / local blob).

#### 2. Duplicate Invoice Detection Key
To prevent duplicate billing fraud, every inward invoice enforces uniqueness across:
$$\text{Supplier GSTIN} + \text{Normalized Invoice Number} + \text{Financial Year}$$
Overrides require explicit Owner sign-off with a mandatory justification logged in the audit trail.

#### 3. GSTR-2B Statement Matching & Reconciliation Engine
- Staged CSV/Excel upload of GSTR-2B auto-drafted statements.
- Automated row-level matching engine:
  - Exact match on GSTIN + Invoice Number + Date + Tax Amount.
  - Soft match (minor rounding differences or date variances within $\pm 3$ days).
  - Exceptions queue: Missing in Books (supplier filed, no bill in app), Missing in 2B (bill entered, supplier failed to file), Tax Value Mismatch.
- One-click rollback/undo for uploaded statements prior to posting reconciliation.

#### 4. Tax Payments & Government Challans
- Tracking actual cash tax payments deposited via PMT-06 challans (CPIN/CIN numbers, bank reference, payment date).
- Offset allocations against CGST, SGST, IGST liabilities for monthly GSTR-3B filing.
- Clear separation between supplier tax paid and government tax deposited.

---

### 13.3 Advertising, Marketing & Marketplace Economics

#### 1. Detailed Expense Taxonomy
Marketing expenditures must never be collapsed into a single generic bucket. Categories include:
- **Digital Advertising:** Meta Ads (Instagram/Facebook), Google Search/YouTube, Amazon Sponsored Ads, Blinkit/Zepto brand placements.
- **Creative & Production:** Graphic design retainers, product packaging artwork, food photography, video commercial editing, copywriting.
- **Physical Marketing:** Trade standees, flex banners, shop signboards, printed product brochures, wholesale rate cards, promotional merchandise.
- **Promotions & Sampling:** Free merchant samples (powder and packaging costs expensed), influencer sample kits, tasting booth materials.
- **Events & Exhibitions:** Stall rental, electricity/setup charges, travel/logistics, dealer meet expenses.
- **Trade Schemes:** Retailer display contest incentives, distributor volume discounts, seasonal booking rebates.

#### 2. E-Commerce & Marketplace Settlement Bridge
Marketplace payouts represent net cash after extensive fees and deductions. The system reconstructs the full financial bridge:
$$\text{Net Payout} = \text{Gross Sales} - \text{Referral Fees} - \text{Closing Fees} - \text{Shipping/Fulfillment} - \text{Returns/RTO} - \text{Ads} - \text{GST on Fees} - \text{TCS (1\%)}$$
- Dedicated marketplace statement import for Amazon, Flipkart, Quick Commerce.
- Prevents accounting error of booking net bank credit as gross top-line revenue.
- Captures input tax credit on marketplace service fee invoices.

---

### 13.4 Licences, Permits & Compliance Register

1. **Extensible Entity Model:** Non-hardcoded compliance registry supporting any regulatory document:
   - FSSAI Central/State Food Manufacturing Licence (14-digit number).
   - GSTIN Registration Certificate (Form REG-06).
   - Legal Metrology Packaged Commodities Registration.
   - Udyam MSME Registration Certificate.
   - Trademark Class 30 (Spices & Seasonings).
   - Factory Inspectorate License (Gujarat Factories Rules).
   - GPCB Consent to Establish (CTE) & Consent to Operate (CTO).
   - GS1 Company Prefix & Barcode Allocations.
   - Periodic NABL Accredited Lab Test Reports (microbiology, pesticide residue).
2. **Event & Renewal History:** Preserves permanent record of all initial applications, annual renewals, inspection audit dates, and penalty fees without overwriting previous cycles.
3. **Automated Expiry Alerts:** Configurable notifications (60 days, 30 days, 15 days, 7 days prior to expiry) with responsible owner assignments.

---

### 13.5 Comprehensive Workforce Compensation & Incentive Engine

#### 1. Pay Model Diversity
The payroll engine handles all operational staffing configurations:
- **Salaried Staff:** Monthly fixed salary with standardized working day divisors.
- **Daily Wage Workers:** Daily rate multiplied by attendance ledger days.
- **Hourly Workers:** Base hourly rate with exact timestamp / timecard tracking.
- **Piece-Rate Factory Packers:** Configurable rate per completed unit (e.g. ₹0.35 per 100g pouch sealed, ₹2.50 per master corrugated box packed). Output verified against batch records.
- **Contract Labour:** Invoices received from labour staffing contractors with GST and TDS under Section 194C.
- **Mixed Compensation:** Base monthly retainer + piece-rate production bonus + overtime pay.

#### 2. Statutory Withholdings (Gujarat Jurisdiction)
- **Employee Provident Fund (EPF):** 12% employee deduction, 12% employer contribution (split into EPF 3.67% and EPS 8.33% up to statutory ceilings).
- **Employee State Insurance (ESIC):** 0.75% employee deduction, 3.25% employer contribution for eligible wage thresholds.
- **Gujarat Professional Tax (PT):** Automated slab deductions based on monthly gross earnings.
- **TDS on Salaries (Section 192):** Monthly estimated income tax deduction where applicable.

#### 3. Sales Representative Portal & Incentive Engine
- Dedicated mobile-friendly portal restricted to sales rep's assigned accounts and territory.
- Multi-tier commission rules:
  - Percentage of net sales value or cash collections.
  - Fixed rupee reward per carton / SKU tier sold.
  - Stepped slab accelerators upon achieving monthly territory targets.
  - Automated clawbacks/reversals on returned goods or cancelled orders.
  - Transparent statement generation showing every qualifying bill line.

---

### 13.6 Super Admin, Business Owner & RBAC Architecture

1. **Platform Super Admin Portal:**
   - Dedicated management boundary for system health, infrastructure monitoring, deployment status, and database maintenance.
   - Strictly isolated from business financial data and customer secrets.
   - Mandatory Multi-Factor Authentication (MFA) and audited break-glass procedures with automatic session timeouts.
2. **Business Owner / Operations Cockpit:**
   - Full domain authority over the Adalaj entity: product masters, batch authorizations, financial ledgers, payroll approvals, period locks, and audit exports.
3. **Role-Based Privilege Enforcement:**
   - Privilege verification executed on every Worker API isolate route and database prepared statement.
   - Object-level access control preventing Insecure Direct Object References (IDOR).
   - Comprehensive audit logging recording actor, timestamp, client IP, action, entity ID, and state deltas.

---

### 13.7 Responsive PWA Acceptance Gates

1. **Fluid Responsive Viewport Support:**
   - Compact phones (320px width minimum).
   - Short landscape devices (568px width, 320px height) with scrollable dialogs and zero clipped controls.
   - Foldable inner/outer displays and split-screen multitasking.
   - Standard tablets (768px, 1024px) in portrait and landscape.
   - High-density desktops and ultrawide monitors (up to 4K).
2. **Theme & Contrast Integrity:**
   - Light Theme, Dark Theme, System Theme, and High-Contrast Industrial Mode.
   - Complete adherence to WCAG AAA color contrast ratios across all text, borders, and status indicators.
   - Authentic Adalaj brand assets integrated without geometric distortion.
3. **Offline Resilience:**
   - IndexedDB outbox queue capturing transactions while offline.
   - Replay synchronization upon network reconnection with conflict detection alerts.
