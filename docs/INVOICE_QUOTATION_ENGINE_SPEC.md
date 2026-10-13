# Adalaj Universal Invoice & Quotation Engine Specification
## Dual-Entity Compliance, Global Export (200 Countries), and Dynamic .mjs Architecture
**Document Reference:** `DOC-SPEC-INV-2026-v1.0` · October 2026

---

### 1. Executive Summary & Purpose

This specification and executable module (`scripts/invoice-engine.mjs`) provides an autonomous, dynamic billing engine for **Adalaj Food Products Pvt. Ltd.** and its sister firm **Adalaj Distribution & Trading Co.**

It governs:
1. **Domestic Tax Invoices:** GST Act 2017 compliant (CGST, SGST, IGST, HSN, E-Way Bill, IRN).
2. **Global Export Commercial Invoices:** Universal international trade standard covering **200 countries** (Western/EU, GCC/Gulf, Africa, Central Asia, Southeast Asia, Americas), Incoterms 2020, Port of Loading (Mundra `INMUN1`), and LUT under GST Rule 96A (`AD240426001928K`).
3. **Formal Quotations & Proformas:** Adaptive quote generator with automatic 1-click conversion to Tax Invoice.
4. **Commercial Surcharge Engine:** Strict non-sister credit rules (+2.0% credit markup surcharge, >180 days financing interest, zero surcharges for Sister Firm revolving pipeline).
5. **Pure Vector SVG Corporate Stamp & Dynamic QR Generator:** Embedded offline, rendering sharp company seals and instant UPI / e-Invoice QR codes.
6. **DOCX / PDF Export Readiness:** Built-in Word-compatible HTML format ready for conversion into Microsoft Word `.docx` or browser PDF print (`Ctrl + P`).

---

### 2. Legal Entity Profiles

#### A. Main Private Limited Company (Exports & Strategic B2B)
- **Legal Name:** `ADALAJ FOOD PRODUCTS PVT. LTD.`
- **CIN:** `U15400GJ2026PTC149812`
- **GSTIN:** `24AAGCS9412F1Z4` (State: 24 - Gujarat)
- **PAN:** `AAGCS9412F`
- **FoSCoS FSSAI Central License:** `10726024000189`
- **Udyam MSME Registration:** `UDYAM-GJ-01-0089211`
- **Import Export Code (IEC):** `2418002931`
- **Spices Board of India CRES:** `SB/REG/GJ/2026/0419`
- **Letter of Undertaking (LUT) ARN:** `AD240426001928K` (Zero tax under Rule 96A)
- **Authorized Dealer (AD) Code:** `0412894`
- **SWIFT / BIC:** `HDFCINBBXXX`
- **Bank Account:** HDFC Bank Current A/c `50200084920194` · IFSC `HDFC0001824`
- **UPI VPA:** `adalajfoods@hdfcbank`
- **Registered Office:** Plot 12, GIDC Electronic Estate, Sector 25, Gandhinagar - 382024, Gujarat, India
- **Plant / Factory:** Survey No. 248/2, Sarkhej-Gandhinagar Highway, Adalaj, Gandhinagar - 382421, Gujarat, India

#### B. Sister Proprietorship Firm (Gujarat Secondary Distribution & CFA Depot)
- **Legal Name:** `ADALAJ DISTRIBUTION & TRADING CO.`
- **Trade Reg / License:** `GJ-01-2026-09182`
- **GSTIN:** `24AAGCS9412F2Z1` (State: 24 - Gujarat)
- **FSSAI State License:** `20726024000341`
- **Udyam Registration:** `UDYAM-GJ-01-0091482`
- **Bank Account:** State Bank of India Current A/c `39820194012` · IFSC `SBIN0004128`
- **UPI VPA:** `adalajdistribution@sbi`
- **Depot Address:** Depot Shed 4B, Sanand Logistics Park, Sarkhej Road, Sanand - 382110, Gujarat, India

---

### 3. Commercial Rules & Credit Surcharge Engine

1. **Standard Payment Terms:**
   - For all third-party domestic buyers (Modern Trade, Large Institutional, FMCG chains, HORECA, Kirana retailers):
     - **Payment strictly before dispatch or on dispatch (POD).**
2. **Approved Credit Surcharges:**
   - If credit is approved (`credit_30` or `credit_60`): An automatic **+2.0% Credit Markup Surcharge** is added to the subtotal taxable amount before tax calculation.
3. **Extended Credit (>180 Days / 6 Months):**
   - For credit terms exceeding 6 months, a statutory commercial finance charge of **18% per annum pro-rata** (minimum 9.0% for 6 months) is calculated and added to the bill.
4. **Sister Firm Exemption:**
   - Continuous unblocked stock allocation pipeline. Sister firm is **exempt from credit surcharges** (`0% surcharge`) under the revolving inter-firm covenant.
5. **Tax Invariant:**
   - All monetary calculations execute strictly in **integer paise** (`1 INR = 100 paise`).
   - Rounding off follows statutory Section 170 of Income Tax Act and GST Rules (nearest integer rupee).

---

### 4. Global Export Compliance (200 Destination Countries)

| Region / Zone | Key Countries Covered | Compliance Protocols & Certifications |
| :--- | :--- | :--- |
| **GCC / Gulf** | UAE, Saudi Arabia, Oman, Kuwait, Bahrain, Qatar | Halal Compliance Declaration, Spices Board CRES, Port of Discharge (Jebel Ali, Dammam, Shuwaikh), Incoterms 2020 (FOB/CIF), Dubai Municipality food import codes. |
| **Western & Europe** | UK, Germany, Netherlands, France, Italy, Spain | EU Maximum Residue Limits (MRL) for aflatoxins & pesticides, Phytosanitary Certificate, EUR.1 / REX origin declaration, Port of Loading `INMUN1` Mundra. |
| **Americas** | USA, Canada, Mexico | US FDA Registration & Prior Notice reference, FSSAI Export Endorsement, Phytosanitary & Fumigation certificate. |
| **Africa** | Kenya, South Africa, Nigeria, Egypt, Tanzania | COMESA / EAC import standards, Pre-Export Verification of Conformity (PVoC), Certificate of Analysis (CoA). |
| **Central Asia** | Kazakhstan, Uzbekistan, Tajikistan, Azerbaijan | Eurasian Conformity (EAC) declaration, bilingual invoicing, Overland/Multimodal transport transit terms. |
| **Southeast Asia & Oceania** | Singapore, Malaysia, Indonesia, Vietnam, Australia | ASEAN Food Safety standards, Spices Board CRES, Australian Biosecurity / BICON compliance. |

---

### 5. Document Numbering, CRUD & Non-Destructive Voiding

1. **Sequential Numbering Sequences:**
   - Domestic Tax Invoice: `ADL-INV-YYYY-XXXX` (e.g. `ADL-INV-2026-0001`)
   - Export Commercial Invoice: `ADL-EXP-YYYY-XXXX` (e.g. `ADL-EXP-2026-0001`)
   - Formal Quotation: `ADL-QUO-YYYY-XXXX` (e.g. `ADL-QUO-2026-0001`)
   - Sister Downstream Invoice: `ADL-DIS-YYYY-XXXX` (e.g. `ADL-DIS-2026-0001`)
2. **Non-Destructive Voiding Audit Trail:**
   - Under Section 31 of CGST Act, invoices once generated must never be hard-deleted from database tables.
   - Calling `repo.voidInvoice(invoiceNo, reason)` updates status to `'voided'`, stamps `voidedAt` ISO timestamp, and writes an encrypted record into the `voided_invoices_audit` ledger preserving original quantities, rates, and totals.

---

### 6. Converting HTML Output to Microsoft Word (.docx)

The HTML produced by `renderDocumentHTML()` uses standard semantic tables, inline CSS, and standard XML-safe SVG vector blocks.

To convert the generated HTML to `.docx` programmatically or share with team members:
1. **Via Standard MIME header in web applications:**
   ```javascript
   const blob = new Blob([htmlContent], { type: 'application/msword' });
   // Save as "Invoice_ADL-INV-2026-0001.doc" (Word opens directly with full styling)
   ```
2. **Via Pandoc CLI:**
   ```bash
   pandoc invoice.html -o invoice.docx
   ```
3. **Via Browser Direct Print:**
   - Open in Chrome / Edge / Firefox $\to$ Press `Ctrl + P` $\to$ Destination: **Save as PDF** $\to$ Paper size: **A4** $\to$ Margins: **None** (handles full-bleed headers and vector stamp).
