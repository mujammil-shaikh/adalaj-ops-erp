# Open Questions & Architecture Decisions
## Adalaj Packing Ops Hub — Business Clarifications & Technical Inquiries
**Reference:** Part 12 of Master Build Prompt (Version 1.1)

---

### Core Questions Requiring Owner / CA Clarification

Items 1 through 3 directly influence architectural boundaries and database schema designs. Until confirmed, the system implements safe, flexible, configurable assumptions.

---

### Priority Questions (Significant Design Impact)

1. **Accounting Software & Integration Boundary (Decision D4):**
   - *Question:* Should this system only feed your Chartered Accountant's software via structured exports (current assumption: Tally Prime XML / clean CSV), or will it eventually replace external accounting with an in-house full double-entry ledger?
   - *Specifics:* Which software does your CA currently use (Tally Prime, Busy, Zoho Books, Marg, or other)?
   - *Configurable Baseline:* V1 operates as an operations, inventory, batch costing, and cash-flow intelligence system providing structured exports to the CA.

2. **Job Work Strategy & Customer-Owned Material (Decision D9):**
   - *Question:* Will the Adalaj factory perform contract packing (Job Work) for external third-party brands in the future? If yes, will clients supply their own spice powder and packaging films?
   - *Impact:* Customer-supplied raw materials must be strictly segregated into non-owned, non-valued inventory accounts (`stock_cust_powder`) to prevent inflating Adalaj's asset balance sheet.

3. **₹10 Pouch / Strip Sachet Outsourcing Specifics (Decisions D5, D10):**
   - *Question:* What is the exact net weight of the ₹10 retail pouch (e.g., 15g, 18g, 20g)? Does Adalaj supply the roll film and outer master bag to the contractor, or does the contractor provide packaging material? What is the contractor's billing unit (per 1,000 sachets or per kg)? What is the target commissioning date for bringing this in-house?
   - *Configurable Baseline:* Weight, supplied materials, contractor rates, and transition dates are configurable database parameters, not hardcoded constants.

---

### Operational & Configuration Inquiries

4. **Team Size & Statutory Thresholds:**
   - *Question:* How many total employees and workers operate today, and what is the 12-month projection?
   - *Context:* Determines statutory applicability thresholds for Employee Provident Fund (EPF - typically 20+ workers) and Employee State Insurance (ESIC - typically 10+ workers in manufacturing). CA confirmation is required.

5. **Current Product & Machine Footprint:**
   - *Question:* How many distinct raw spice powders (e.g. Chilli, Turmeric, Cumin, Coriander) and packaging SKUs are active today? What is the complete machinery inventory?
   - *Baseline:* Vertical band sealer and handheld inkjet coding gun are active. Planned Auger Servo FFFS machine (3 screws) is modeled as a planned asset until commissioned.

6. **Historical Data Migration Scope:**
   - *Question:* What historical records exist today (Excel workbooks, physical bills, WhatsApp notes, Tally backups), and how many months of historical data should be migrated into opening balances?

7. **Sales Billing Software:**
   - *Question:* Which software handles outbound retail and wholesale sales invoices today, and what export formats does it support (CSV, Excel, direct REST API)?

8. **Overhead Cost Allocation Policy:**
   - *Question:* How should shared fixed overheads (factory rent, electricity power bills, supervisor salaries) be allocated across finished product lines (e.g. per kg packed, per machine run hour, or percentage of raw material cost)?

9. **Owner Payment Approval Threshold:**
   - *Question:* Above what transaction amount (e.g., ₹25,000 or ₹50,000) must an expense voucher require explicit Owner approval before bank posting?

10. **Localization & Language Support:**
    - *Question:* Which factory floor and storekeeper screens must offer Gujarati or Hindi language toggles from day one?

11. **Barcode / QR Hardware:**
    - *Question:* Will factory operators utilize built-in smartphone cameras for QR code batch scanning, or will dedicated USB/Bluetooth 2D barcode handheld scanners be deployed?

12. **Application Brand & Domain:**
    - *Question:* What is the official production web domain (e.g. `ops.adalajspices.com`) and Cloudflare deployment zone?

13. **Cloudflare Infrastructure Budget:**
    - *Question:* Is the business comfortable with Cloudflare paid plans (Workers Paid / D1 / R2 storage) and small monthly budgets for uptime monitoring?

14. **Code & Security Audit Personnel:**
    - *Question:* Who will conduct the independent human code, statutory calculation, and security audit prior to production cutover?

15. **Agentic Environment Verification:**
    - *Status:* Verified active model: Google Antigravity with Gemini 3.8 Flash (High reasoning tier).
