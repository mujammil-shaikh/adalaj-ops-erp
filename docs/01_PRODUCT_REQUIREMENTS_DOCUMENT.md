# Product Requirements Document (PRD)
## Project Name: Adalaj Packing Ops & Financial Intelligence System
**Document Version:** 1.1.0  
**Target Environment:** Cloudflare Edge (Pages + Workers + D1 + R2 + KV)  
**Coding Agent Model:** Google Antigravity with Gemini 3.8 Flash (High reasoning)  
**Author:** Adalaj Operations & Engineering Architecture Team  
**Last Updated:** October 2026 (Synchronized with Master Build Prompt v1.1)  

---

### 1. Executive Summary & Vision
Adalaj Packing Ops & Financial Intelligence System is an enterprise-grade, offline-first, dual-theme Progressive Web Application (PWA) purpose-built for food & spice powder packing operations, outsourced contract packaging, and real-time financial cockpit intelligence.

The application bridges the physical factory floor in Adalaj, Gujarat (vertical band sealers, handheld inkjet coding guns, and future multi-screw Auger Servo FFFS machinery) with real-time financial tracking ("Where Is My Money Today?"), ensuring every gram of spice powder, every pouch, and every rupee spent (from raw bulk spice lots to electricity bills, factory rent, and piece-rate wages) is tracked with zero data loss, complete audit trails, and seamless reconciliation for Chartered Accountants (CA).

---

### 2. Business Model & Operational Truth

#### Line A: Own Brand Packaging (In-House Operations)
1. **Bulk Inward Procurement:**
   - Raw spice powder purchased in commercial lots (100 kg to 1 tonne) from APMC Unjha / Rajkot mandis or direct millers.
   - Quality check (moisture %, aroma, sieve test) and Goods Received Note (GRN) lot assignment with landed rate per kg.
2. **Current Operation (Packing Run Only):**
   - The currently confirmed operation is **packing only** (issuing powder and packaging material to a run, recording packs produced, rejects/wastage, operator time, QC, and posting finished goods).
   - *Clarification:* There is **no baking/roasting step** enabled by default. Do not add baking shrinkage to the default process. Future optional pre-processing stages may be configured dynamically if confirmed.
3. **Packaging SKU Formats:**
   - **Consumer Brand Packaging:**
     - 50g Branded Pack (SKU supported; format configurable; future roll-fed central-seal pouch).
     - 100g Digitally Printed Pouch / Central-Seal Pouch.
     - 200g Digitally Printed Pouch / Central-Seal Pouch.
     - 500g Digitally Printed Pouch / Central-Seal Pouch.
     *(Note: Pouch styles are flexible pouches or roll film, never rigid cylinder cans).*
   - **Institutional / Bulk Packaging:**
     - 1kg Silver Foil Pouch with branded top sticker.
     - 2kg Silver Foil Pouch with branded top sticker.
     - 5kg Silver Foil Pouch with branded top sticker.
4. **Current In-House Equipment Line:**
   - Continuous Vertical Band Sealing machine with Teflon guides.
   - Handheld batch coding inkjet gun for MRP, Batch No, MFD, and Expiry printing.
5. **Future Planned Equipment Line (Auger Servo FFFS Machine):**
   - High-speed Form-Fill-Seal machine with 3 interchangeable servo screws:
     - Screw 1: 5g to 50g micro-dosing.
     - Screw 2: 50g to 250g mid-range pouches.
     - Screw 3: 500g to 2000g (2kg) heavy-fill pouches.
   - Automatically feeds roll film for central-seal pouches up to 2kg upon commissioning.

#### Line B: Third-Party Packaging & Outsourced Sachet Strips
1. **Current Interim Workflow (Months 1–3):**
   - ₹10 retail strip rolls require multi-track collar packing machinery currently unavailable in-house.
   - Raw powder and packaging rolls are dispatched under GST Delivery Challan to a third-party contract packer.
   - Tracking segregated stock held at third-party premises (`loc_packer`).
   - Job work conversion charge billed per 1,000 sachets / strips + freight.
2. **Transition Strategy:**
   - Once the new 3-screw Auger Servo FFFS machine is commissioned at the Adalaj factory, ₹10 strip work transitions in-house based on a recorded commissioning decision.
3. **Distinction from Customer Job Work:**
   - Outsourced packing of Adalaj's own brand is distinct from potential future job work for external clients. Customer-owned materials, if job work is added, must reside in a separate non-owned, non-valued stock ledger.

---

### 3. Core Functional Modules

#### 3.1 Financial Cockpit: "Where Is My Money Today?"
- **Liquid Capital & Accounts:** Real-time consolidated balances across Current Accounts (HDFC), Cash-in-Hand factory safe, and petty cash floats.
- **Stock Asset Valuation:** Live rupee valuation of Raw Powder, Packaging Materials (rolls, foils, stickers, master cartons), Finished Goods, and Stock held with third-party packers.
- **Debtors & Creditors (Receivables & Payables):**
  - Customer outstanding balances with aging brackets (0–30, 31–60, 60+ days).
  - Supplier payables with MSME payment statutory alerts (45-day deadline under Section 43B(h) of the Income Tax Act).
- **Borrowings & Fixed Assets:**
  - Bank machinery loans, working capital Cash Credit (CC) limits, and monthly EMI schedule.
  - Plant & Machinery Gross Block, Accumulated Depreciation (SLM & WDV slabs), and Net Book Value.
- **Statutory Liability Reserves:**
  - Accrued GST payable (Outward tax minus Input Tax Credit).
  - Employee and employer PF (12%), ESIC (0.75% / 3.25%), Professional Tax (Gujarat slabs), and TDS on rent, contract, and professional fees.
- **Monthly Burn Analysis:** Grouped Opex breakdown (Raw materials, packing materials, factory rent, electricity, wages, freight, marketing, and commissions).

#### 3.2 Packing Batch Management & Recipe BOM (BMR - Batch Manufacturing Record)
- **Batch Lifecycle:** Draft $\rightarrow$ Active/Running $\rightarrow$ QC Inspection $\rightarrow$ Closed & Posted (or Voided with reason).
- **Recipe Bill of Materials (BOM):**
  - Standard recipe per SKU specifying exact powder weight (e.g. 50g, 100g, 200g, 500g, 1kg, 2kg, 5kg).
  - Primary packaging consumption (1 pouch/foil bag per unit + machine scrap allowance).
  - Secondary packaging consumption (stickers, outer corrugated carton share, tape, strapping band).
- **Automated Inventory Posting:**
  - Deducts raw powder lots and packaging inventory upon batch completion.
  - Generates Finished Goods stock lots with calculated batch cost per unit.
- **Batch Yield & Scrap Accounting:**
  - Inward powder fed into hopper vs packed output = Floor spillage and machine scrap.
  - Overall Batch Yield % calculation against standard target.

#### 3.3 Factory Floor Mode (High-Visibility Touch Console)
- Designed for tablets (landscape) or rugged touchscreens in powder environments.
- High-contrast touch buttons for fast counter increment (+10, +50, +100 packs).
- Instant logging of damaged pouches, foil jams, and floor powder spillage.
- Worker badge assignment and shift tracking.

#### 3.4 Raw Material & Packaging Stock Management
- **SKU Master:** Raw spices, packaging materials (pouches, rolls, foils, stickers, master cartons, tapes), finished goods.
- **Lot Tracking (GRN):** Internal Lot No, Supplier Lot No, APMC origin, Received Quantity, Landed Rate (₹/kg), Expiry Date, QC Status (Available, Quarantine, Exhausted, Rejected).
- **Stock Movement Ledger:** Append-only ledger recording Receipts (GRN), Issues to Production, Dispatch to Packer, Returns from Packer, Sales Dispatch, and Adjustments.

#### 3.5 Operational Expenses, Vendor Bills & Cash Management
- **Direct Costs:** Raw spices, packaging materials, inbound freight, labor wages, third-party packing charges.
- **Overheads & Fixed Opex:** Factory rent, UGVCL electric power bills, water charges, machine maintenance, tools & spares.
- **Advertising, Marketing & E-Commerce (Section 13.3):**
  - Meta/Google ads, creative retainers, packaging artwork, banners, merchant samples, trade fairs.
  - Marketplace settlement bridge: gross sales, commissions, closing fees, FBA, shipping, returns, GST on fees, TCS, net bank payout.
- **Anti-Fraud Controls:** Duplicate transaction detection on supplier GSTIN + invoice number + financial year.

#### 3.6 Bill-Level GST, ITC & Statutory Tax (Section 13.2)
- Multi-line invoice capture with CGST, SGST, IGST, and cess.
- ITC review status: Eligible, Ineligible (blocked), Pending 2B, Matched 2B, Claimed, Reversed, Reclaimed.
- GSTR-2B statement import and matching engine with exceptions queue.
- Government PMT-06 challan payments and GSTR-3B offset tracking.

#### 3.7 Licences, Compliance & Document Vault (Section 13.4)
- User-extensible compliance registry (FSSAI, GST, Legal Metrology, Udyam MSME, Trademark, GPCB, Factory License, lab tests).
- Expiry date tracking, renewal event history, fee capture, and automated alerts.

#### 3.8 Comprehensive Workforce Compensation & Sales Rep Portal (Section 13.5)
- Multi-mode payroll: Monthly fixed, daily wage, hourly rate, shift pay, piece-rate (₹ per pack/kg), contract labour.
- Gujarat statutory deductions: PF 12%, ESIC 0.75%, Gujarat PT slabs, TDS on salaries.
- Dedicated Sales Rep portal: territory assignments, multi-slab commission calculation, order clawbacks on returns, transparent statements.

#### 3.9 Fixed Assets & Plant Machinery Register
- Asset register covering Band Sealing units, Batch Coding guns, Air Compressors, Scales, and planned Auger Servo machine.
- Straight Line (SLM) and Written Down Value (WDV) depreciation calculation.
- Scheduled preventive maintenance logs and technician service history.

#### 3.10 Portals & Role-Based Access Control (RBAC) (Section 13.7)
- Platform Super Admin portal: system health, tenant isolation, MFA, audited break-glass controls.
- Business Owner portal: complete operational and financial control, period lock/unlock, user permissions.
- Role portals: Accountant, Storekeeper, Supervisor, Labour/Employee, Sales Rep, CA/Auditor.
- Strict server-side verification on every API route and database query.

---

### 4. Non-Functional Requirements
- **Availability:** 99.99% uptime via Cloudflare Global Edge network.
- **Performance:** Sub-50ms response times on edge API isolates; instant offline UI updates.
- **Design Discipline:** Anti-AI slop (Zero-Pill discipline), Adalaj Heritage Crimson (`#9E1C23`) & Amber Gold (`#F59E0B`), WCAG AAA compliance.
- **Responsive PWA:** True responsive behavior across compact phones (320px), short landscape (568x320), tablets, and widescreen displays.
- **Data Integrity:** Integer paise currency storage, integer base units for stock, immutable audit logs, and double-entry reconciliation.
