# App Flow & User Journeys Specification
## Project Name: Adalaj Packing Ops & Financial Intelligence System
**Document Version:** 1.0.0  
**Target Platform:** Adaptive PWA (Mobile / Tablet / Desktop / Factory Floor Touch)  

---

### 1. Persona & Role Matrix

| Role | Device Type | Core Objectives | Permissions |
|---|---|---|---|
| **Owner (Director)** | Smartphone / Laptop | High-level profit & loss, cash/bank balances, approvals over ₹50,000, overall yield. | Full Admin (Create, Read, Update, Delete, Void, Approve). |
| **Accountant** | Desktop PC | Voucher entry, supplier bills, MSME payments, GST/TDS reports, bank reconciliations. | CRUD Financials, Inventory Read, Read-only Batches. |
| **Floor Supervisor** | Tablet (Landscape) | Start/End packing batches, assign operators, enter yields, track baking moisture loss. | CRUD Batches, Read SKUs, Move Stock, Read Machines. |
| **Packaging Operator** | Touch Screen Terminal | Fast touch counting (+10, +50, +100), record spill powder & damaged pouches. | Factory Floor Mode only (increment counters, log scrap). |
| **Store Keeper** | Smartphone / Tablet | Inward raw powder GRN, dispatch to 3rd party packer, outward finished goods. | CRUD Lots, Movements, Dispatch Notes. |
| **CA / External Auditor** | Desktop PC | Review trial balance, verify statutory deposits (PF/ESIC/PT), export Tally XML. | Read-Only across all modules. No editing or deletion. |

---

### 2. Global Navigation & Module Architecture

```
[ App Header: Adalaj Logo | Module Name | Theme Toggle | Role Switcher | Outbox Status | Install PWA ]
  |
  +---> [M1: Dashboard - "Where Is My Money Today?"]
  |       |-- Liquid Capital Cards (Cash Safe, HDFC Bank)
  |       |-- Total Stock Value (Raw, Foil/Cylinders, WIP, FG, 3rd Party)
  |       |-- Receivables vs Payables (Debtors/Creditors)
  |       |-- Borrowings & Monthly EMI Burden
  |       |-- Active Floor Batch Live Status Widget
  |       \-- Category-wise Opex Burn Pie & Breakdown
  |
  +---> [M2: Packing Batches & Recipes (BMR)]
  |       |-- Active & Completed Batches Register
  |       |-- New Batch Modal (Raw Lot, Machine, Shift, Recipe, Target)
  |       |-- Recipe & BOM Builder (10₹, 50g, 100g, 200g, 500g, 1kg, 2kg, 5kg)
  |       |-- Batch Closer & Yield Ledger (Baking loss %, scrap %, FG lots)
  |       \-- Batch Void / Edit Flow
  |
  +---> [M3: Stock & Lots (Inventory Management)]
  |       |-- SKU Master Catalog (Raw, Packing, WIP, FG)
  |       |-- Active Powder Lots (GRN inward, supplier lot, landed rate, QC status)
  |       |-- Third-Party Job Work Transfers (Dispatch & Receipt from Sanand packer)
  |       \-- Append-Only Stock Movements Ledger
  |
  +---> [M4: Expenses, Vendor Bills & Accounts]
  |       |-- Expense Vouchers (Direct Opex, Overheads, Salaries, Fuel, Rent, Power)
  |       |-- Vendor Bills & GST Invoices (Subtotal, GST 5%/12%/18%, Paid vs Due)
  |       |-- Bank & Cash Accounts (HDFC Current, Factory Safe, UPI)
  |       \-- Parties & Contacts (Suppliers, Transporters, Job Workers, Dealers)
  |
  +---> [M5: Factory Floor Mode (Touch Console)]
  |       |-- Fullscreen High-Contrast Operator Display
  |       |-- Quick Multi-Increment Touch Buttons (+10, +50, +100 packs)
  |       |-- Powder Spill (g) & Damaged Can/Pouch Counter
  |       \-- Shift Operator Badge Selector
  |
  +---> [M6: Payroll, Wages & Statutory Compliance]
  |       |-- Employee Directory (Monthly, Daily, Piece-Rate Packaging)
  |       |-- Attendance & Packaging Piece Count Input
  |       |-- Automatic Deductions (PF 12%, ESIC 0.75%, Professional Tax)
  |       \-- Monthly Payroll Register & Digital Payslip Modal
  |
  +---> [M7: Plant Machines & Fixed Assets]
  |       |-- Machine Register (Auger Servo, Band Sealer, Inkjet Gun, Scales)
  |       |-- Current Book Value & Annual Depreciation
  |       |-- Total Operational Batch Hours
  |       \-- Maintenance & Service History Logger
  |
  +---> [M8: Debt & EMI Schedule]
  |       |-- Loan Register (Machinery Loans, Cash Credit)
  |       |-- Next Due Date & Remaining Tenure
  |       \-- Record Repayment (Reduces loan & posts bank voucher)
  |
  \---> [M9: Backup, Tally Export & Audit]
          |-- One-Click JSON Backup & Restore
          |-- Tally Prime Compatible CSV/XML Voucher Export
          |-- CA Verification Mode
          \-- Outbox Offline Synchronization Monitor
```

---

### 3. Detailed Step-by-Step User Journeys

#### Journey 1: Procurement of Raw Spice Powder to Inward GRN
1. **Purchase Arrival:** Supplier delivers 500 kg raw turmeric/cumin powder to Adalaj godown.
2. **Store Keeper Action:**
   - Navigates to **Stock & Lots** -> **Active Powder Lots** tab.
   - Clicks **"+ Inward Powder Lot (GRN)"**.
   - Selects raw material item, inputs Internal Lot No (`LOT-2026-089`), Supplier Name (`Unjha Mandi Spice Traders`), Supplier Lot No, Received Quantity (500 kg), and Landed Rate (₹285/kg).
   - Marks QC status as `available` (or `hold` if sample sent to laboratory).
   - Submits form -> System automatically creates Lot record AND appends an inward `grn_received` entry in the **Stock Movements Ledger**.

#### Journey 2: Executing a Production Batch (In-House 100g Brand Cylinder)
1. **Supervisor Action:**
   - Navigates to **Packing Batches** -> Clicks **"+ Start New Batch"**.
   - Selects Recipe (`100g Cylinder Consumer Brand`), Raw Material Lot (`LOT-2026-089`), Packaging Machine (`Vertical Band Sealer #1`), Shift, and Target Quantity (1,000 packs).
   - Inputs Raw Powder Issued (102.5 kg to account for standard 2.5% process loss).
   - Clicks **"Launch Packaging Run"** -> Batch status becomes `running`.
2. **Floor Operator Action (Factory Floor Mode):**
   - Operator switches terminal to **Factory Floor Mode**.
   - Taps large `+50` and `+100` touch buttons as cartons fill up.
   - Logs 150g floor spill and 3 rejected wrinkled pouches.
3. **Batch Completion & Inventory Commitment:**
   - Supervisor reviews final counts: 1,000 packs produced, 100 kg powder utilized, 1.8 kg baking/moisture loss, 0.7 kg floor spill.
   - Clicks **"Close & Post Batch to Inventory"**.
   - System executes atomic transaction:
     - Deducts 102.5 kg from Raw Powder Lot.
     - Deducts 1,003 packaging pouches from stock.
     - Creates 1,000 units of Finished Good SKU (`100g Turmeric Brand Pouch`) with unit landed cost calculated down to the paisa.

#### Journey 3: Third-Party Job Work for ₹10 Retail Sachets
1. **Material Dispatch:**
   - Store Keeper selects 200 kg powder and 20,000 unit roll film from Adalaj godown.
   - Clicks **"+ Transfer to Packer"** in Inventory Module.
   - Selects location `Third-Party Contractor (Sanand)`.
   - Generates Delivery Challan -> Stock moves from Adalaj physical warehouse to `loc_packer`.
2. **Receipt of Finished Sachets:**
   - Job worker delivers 19,800 finished ₹10 strips + 5 kg residual powder scrap.
   - Store Keeper logs receipt -> Stock at `loc_packer` clears, Finished Goods at Adalaj increases by 19,800 units.
3. **Payment of Job Work Charges:**
   - Job worker invoices ₹0.35 per sachet conversion charge (₹6,930 + 18% GST).
   - Accountant records bill under `ExpensesModule` -> tagged to Line B (Job Work).

#### Journey 4: Daily Expense Logging & Anti-Fraud Duplicate Check
1. Owner or Accountant clicks **"+ Quick Expense"** anywhere in the app.
2. Selects Head Category (e.g. `Light Bill / UGVCL Power`, `Factory Rent`, `Diesel for Baking Oven`).
3. Enters Amount (₹14,500), Party Name (`UGVCL Power Distribution`), Mode (`HDFC NetBanking`), and uploads photo of electricity receipt.
4. If an identical payment exists on the same date to the same party, the system immediately presents an Amber Duplicate Alert banner preventing accidental double payment.
5. Once saved, the account balance of HDFC decreases by ₹14,500, and the "Where Is My Money" cockpit updates instantaneously.
