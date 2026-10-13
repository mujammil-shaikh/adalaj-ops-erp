import React, { useState } from 'react';
import {
  FileText,
  Ship,
  FileCheck,
  ShieldAlert,
  Printer,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Download,
  Share2,
  Trash2,
  Building2,
  Globe,
  DollarSign,
  QrCode,
  Calendar,
  X,
  CreditCard,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { db } from '../../lib/storage';
import {
  SalesInvoice,
  SalesInvoiceItem,
  SalesQuotation,
  VoidedInvoiceAudit,
  PaymentCreditTerm,
  BusinessEntityId,
} from '../../types';
import { formatINR, formatDate } from '../../lib/format';
import { useTheme } from '../../context/ThemeContext';
import {
  renderDocumentHTML,
  generateCorporateStampSVG,
  generateDynamicQRCodeSVG,
  ENTITIES,
} from '../../../scripts/invoice-engine.mjs';

export const InvoicesAndQuotationsModule: React.FC = () => {
  const { isDark } = useTheme();

  // Navigation Sub-tabs
  const [activeTab, setActiveTab] = useState<
    'domestic_invoices' | 'export_invoices' | 'quotations' | 'void_audit' | 'preview'
  >('domestic_invoices');

  // Master Data
  const [invoices, setInvoices] = useState<SalesInvoice[]>(() => db.getSalesInvoices());
  const [quotations, setQuotations] = useState<SalesQuotation[]>(() => db.getSalesQuotations());
  const [voidAudits, setVoidAudits] = useState<VoidedInvoiceAudit[]>(() => db.getVoidedInvoicesAudit());
  const [previewDocument, setPreviewDocument] = useState<SalesInvoice | SalesQuotation | null>(() => invoices[0] || null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showCreateExportModal, setShowCreateExportModal] = useState(false);
  const [showCreateQuotationModal, setShowCreateQuotationModal] = useState(false);
  const [showPaymentCollectModal, setShowPaymentCollectModal] = useState(false);
  const [showVoidModal, setShowVoidModal] = useState(false);

  // Selected records for modals
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);

  // Form States - New Domestic Invoice
  const [invBuyerName, setInvBuyerName] = useState('Gujarat Modern Hypermarkets Ltd.');
  const [invBuyerGstin, setInvBuyerGstin] = useState('24AAACG1234F1Z9');
  const [invBuyerAddress, setInvBuyerAddress] = useState('Block C, SG Corporate Tower, Ahmedabad - 380054');
  const [invBuyerStateCode, setInvBuyerStateCode] = useState('24');
  const [invCreditTerms, setInvCreditTerms] = useState<PaymentCreditTerm>('credit_30');
  const [invItemName, setInvItemName] = useState('Turmeric Powder 100g Consumer Pouches');
  const [invItemHsn, setInvItemHsn] = useState('0910');
  const [invItemQty, setInvItemQty] = useState(2500);
  const [invItemRateRupees, setInvItemRateRupees] = useState(38);
  const [invItemPackSize, setInvItemPackSize] = useState(100);

  // Form States - New Export Invoice
  const [expConsigneeName, setExpConsigneeName] = useState('Al-Madina Spice Trading LLC, Dubai, UAE');
  const [expAddress, setExpAddress] = useState('Warehouse 14, Al Ras Spice Market, Deira, Dubai, UAE');
  const [expCountry, setExpCountry] = useState('United Arab Emirates');
  const [expCurrency, setExpCurrency] = useState<'USD' | 'EUR' | 'AED' | 'GBP' | 'SAR'>('USD');
  const [expExchangeRate, setExpExchangeRate] = useState(83.5);
  const [expIncoterms, setExpIncoterms] = useState<'FOB' | 'CIF' | 'CFR' | 'EXW'>('FOB');
  const [expItemName, setExpItemName] = useState('Pure Ground Turmeric Powder (25kg Sacks)');
  const [expItemHsn, setExpItemHsn] = useState('0910');
  const [expItemQtySacks, setExpItemQtySacks] = useState(600);
  const [expItemRateDollars, setExpItemRateDollars] = useState(41.67);

  // Form States - New Quotation
  const [quoBuyerName, setQuoBuyerName] = useState('Taj Vivanta & Gateway Palace Catering Division');
  const [quoBuyerGstin, setQuoBuyerGstin] = useState('24AABCT9981P1Z3');
  const [quoBuyerAddress, setQuoBuyerAddress] = useState('SG Highway Luxury Hotel Complex, Bodakdev, Ahmedabad');
  const [quoItemName, setQuoItemName] = useState('Turmeric Powder (Haldi) 500g Kitchen Pack');
  const [quoItemQty, setQuoItemQty] = useState(1000);
  const [quoItemRateRupees, setQuoItemRateRupees] = useState(180);

  // Form States - Payment Collection & Void Reason
  const [collectAmountRupees, setCollectAmountRupees] = useState(0);
  const [collectMode, setCollectMode] = useState('HDFC Bank NEFT/RTGS');
  const [collectRef, setCollectRef] = useState('');
  const [voidReasonText, setVoidReasonText] = useState('Customer cancelled PO due to schedule revision; re-invoicing required.');

  const reloadData = () => {
    setInvoices(db.getSalesInvoices());
    setQuotations(db.getSalesQuotations());
    setVoidAudits(db.getVoidedInvoicesAudit());
  };

  // 1. Create Domestic Tax Invoice Handler
  const handleCreateDomesticInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(invItemQty) || 1;
    const ratePaise = Math.round(Number(invItemRateRupees) * 100);
    const subtotalPaise = qty * ratePaise;

    // Commercial Surcharge Rule: +2% if on credit
    const isCredit = invCreditTerms === 'credit_30' || invCreditTerms === 'credit_60';
    const creditSurchargeRatePct = isCredit ? 2.0 : 0;
    const creditSurchargePaise = isCredit ? Math.round((subtotalPaise * 2.0) / 100) : 0;
    const totalTaxablePaise = subtotalPaise + creditSurchargePaise;

    // Tax Engine: Intra-state (24 Gujarat) vs Inter-state
    const isIntraState = invBuyerStateCode === '24';
    const taxRatePct = 5;
    const grossTaxPaise = Math.round((totalTaxablePaise * taxRatePct) / 100);

    const cgstPaise = isIntraState ? Math.round(grossTaxPaise / 2) : 0;
    const sgstPaise = isIntraState ? grossTaxPaise - cgstPaise : 0;
    const igstPaise = isIntraState ? 0 : grossTaxPaise;

    const grandTotalPaise = totalTaxablePaise + grossTaxPaise;
    const invNo = `ADL-INV-2026-${String(invoices.length + 1).padStart(4, '0')}`;

    const newInv: SalesInvoice = {
      id: `inv_${Date.now()}`,
      invoiceNo: invNo,
      invoiceType: 'domestic_tax_invoice',
      entityId: 'pvt_ltd',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + (isCredit ? 30 : 7) * 86400000).toISOString().split('T')[0],
      buyerName: invBuyerName,
      buyerGstin: invBuyerGstin,
      buyerAddress: invBuyerAddress,
      buyerState: isIntraState ? 'Gujarat' : 'Other State',
      buyerStateCode: invBuyerStateCode,
      buyerCountry: 'India',
      creditTerms: invCreditTerms,
      creditDays: isCredit ? 30 : 0,
      creditSurchargeRatePct,
      creditSurchargePaise,
      extendedCreditInterestPaise: 0,
      subtotalTaxablePaise: subtotalPaise,
      totalTaxablePaise,
      cgstPaise,
      sgstPaise,
      igstPaise,
      totalTaxPaise: grossTaxPaise,
      roundOffPaise: 0,
      grandTotalPaise,
      paidAmountPaise: 0,
      balanceDuePaise: grandTotalPaise,
      status: 'issued',
      eWayBillNo: `2418${Date.now().toString().slice(-8)}`,
      irn: `irn_${Date.now().toString(16)}`,
      isExport: false,
      currency: 'INR',
      exchangeRate: 1.0,
      foreignAmount: grandTotalPaise / 100,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: `item_inv_1`,
          sku: 'FG-ITEM-01',
          name: invItemName,
          description: `${invItemPackSize}g consumer pouches`,
          hsnCode: invItemHsn,
          packSizeGrams: Number(invItemPackSize) || 100,
          quantityUnits: qty,
          unitType: 'pouches',
          ratePerUnitPaise: ratePaise,
          taxableAmountPaise: subtotalPaise,
          gstRatePct: 5,
          cgstPaise,
          sgstPaise,
          igstPaise,
          totalPaise: grandTotalPaise,
        },
      ],
    };

    db.addSalesInvoice(newInv);
    reloadData();
    setShowCreateInvoiceModal(false);
    setPreviewDocument(newInv);
    setActiveTab('preview');
  };

  // 2. Create Global Export Invoice Handler
  const handleCreateExportInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(expItemQtySacks) || 1;
    const rateRupees = Number(expItemRateDollars) * Number(expExchangeRate);
    const ratePaise = Math.round(rateRupees * 100);
    const subtotalPaise = qty * ratePaise;

    const invNo = `ADL-EXP-2026-${String(invoices.length + 1).padStart(4, '0')}`;

    const newInv: SalesInvoice = {
      id: `inv_${Date.now()}`,
      invoiceNo: invNo,
      invoiceType: 'export_commercial',
      entityId: 'pvt_ltd',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      buyerName: expConsigneeName,
      buyerAddress: expAddress,
      buyerCountry: expCountry,
      buyerState: 'International',
      buyerStateCode: '99',
      creditTerms: 'advance',
      creditDays: 0,
      creditSurchargeRatePct: 0,
      creditSurchargePaise: 0,
      extendedCreditInterestPaise: 0,
      subtotalTaxablePaise: subtotalPaise,
      totalTaxablePaise: subtotalPaise,
      cgstPaise: 0,
      sgstPaise: 0,
      igstPaise: 0, // Zero rated export under LUT ARN Rule 96A
      totalTaxPaise: 0,
      roundOffPaise: 0,
      grandTotalPaise: subtotalPaise,
      paidAmountPaise: subtotalPaise, // Advance
      balanceDuePaise: 0,
      status: 'paid',
      isExport: true,
      currency: expCurrency,
      exchangeRate: Number(expExchangeRate) || 83.5,
      foreignAmount: Number((subtotalPaise / 100 / (Number(expExchangeRate) || 83.5)).toFixed(2)),
      incoterms: expIncoterms,
      portOfLoading: 'Mundra Port, Gujarat (INMUN1)',
      portOfDischarge: `${expCountry} International Sea Port`,
      destinationCountry: expCountry,
      iecNo: ENTITIES.pvt_ltd.iec,
      lutArn: ENTITIES.pvt_ltd.lutArn,
      cresNo: ENTITIES.pvt_ltd.spicesBoardCres,
      swiftBic: ENTITIES.pvt_ltd.bankDetails.swiftBic,
      adCode: ENTITIES.pvt_ltd.bankDetails.adCode,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: `item_exp_1`,
          sku: 'EXP-BULK-25KG',
          name: expItemName,
          description: '25kg multi-wall poly-lined export sacks',
          hsnCode: expItemHsn,
          packSizeGrams: 25000,
          quantityUnits: qty,
          unitType: 'boxes',
          ratePerUnitPaise: ratePaise,
          taxableAmountPaise: subtotalPaise,
          gstRatePct: 0,
          cgstPaise: 0,
          sgstPaise: 0,
          igstPaise: 0,
          totalPaise: subtotalPaise,
        },
      ],
    };

    db.addSalesInvoice(newInv);
    reloadData();
    setShowCreateExportModal(false);
    setPreviewDocument(newInv);
    setActiveTab('preview');
  };

  // 3. Create Quotation Handler
  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(quoItemQty) || 1;
    const ratePaise = Math.round(Number(quoItemRateRupees) * 100);
    const subtotalPaise = qty * ratePaise;
    const taxPaise = Math.round((subtotalPaise * 5) / 100);
    const grandTotalPaise = subtotalPaise + taxPaise;

    const quoNo = `ADL-QUO-2026-${String(quotations.length + 1).padStart(4, '0')}`;

    const newQuo: SalesQuotation = {
      id: `quo_${Date.now()}`,
      quotationNo: quoNo,
      date: new Date().toISOString().split('T')[0],
      validUntilDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      entityId: 'pvt_ltd',
      buyerName: quoBuyerName,
      buyerGstin: quoBuyerGstin,
      buyerAddress: quoBuyerAddress,
      buyerCountry: 'India',
      creditTerms: 'credit_30',
      creditSurchargeRatePct: 2.0,
      creditSurchargePaise: Math.round((subtotalPaise * 2) / 100),
      subtotalTaxablePaise: subtotalPaise,
      estimatedTaxPaise: taxPaise,
      grandTotalPaise,
      termsAndConditions: [
        'Quotation validity is 30 calendar days from issue date.',
        'Spices are pure whole steam-sterilized, zero added color.',
        'Standard credit is 30 days (+2% credit surcharge included).',
      ],
      status: 'sent',
      createdAt: new Date().toISOString(),
      items: [
        {
          id: `item_quo_1`,
          sku: 'QUO-FG-01',
          name: quoItemName,
          description: 'Standard consumer catering pack',
          hsnCode: '0910',
          packSizeGrams: 500,
          quantityUnits: qty,
          unitType: 'pouches',
          ratePerUnitPaise: ratePaise,
          taxableAmountPaise: subtotalPaise,
          gstRatePct: 5,
          cgstPaise: Math.round(taxPaise / 2),
          sgstPaise: Math.round(taxPaise / 2),
          igstPaise: 0,
          totalPaise: grandTotalPaise,
        },
      ],
    };

    db.addSalesQuotation(newQuo);
    reloadData();
    setShowCreateQuotationModal(false);
    setPreviewDocument(newQuo);
    setActiveTab('preview');
  };

  // Convert Quotation to Invoice Action
  const handleConvertQuotation = (quotationNo: string) => {
    const inv = db.convertQuotationToInvoice(quotationNo);
    if (inv) {
      reloadData();
      setPreviewDocument(inv);
      setActiveTab('preview');
    }
  };

  // Void Invoice Action
  const handleVoidInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    db.voidSalesInvoice(selectedInvoice.invoiceNo, voidReasonText, 'Admin');
    reloadData();
    setShowVoidModal(false);
    setSelectedInvoice(null);
  };

  // Payment Collection Action
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    const paise = Math.round(Number(collectAmountRupees) * 100);
    db.recordInvoicePayment(selectedInvoice.invoiceNo, paise, collectMode, collectRef);
    reloadData();
    setShowPaymentCollectModal(false);
    setSelectedInvoice(null);
  };

  // Filtered lists
  const domesticInvoices = invoices.filter((i) => !i.isExport && (
    i.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.buyerName.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  const exportInvoices = invoices.filter((i) => i.isExport && (
    i.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.buyerName.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  return (
    <div className="space-y-4">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E1C23] dark:text-amber-400">
            <FileText className="w-4 h-4" />
            <span>Commercial Operations &amp; Billing</span>
            <span>·</span>
            <span>Dual Compliance Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Sales Invoices, Quotations &amp; Global Exports
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
            Domestic GST compliant billing, 200 countries international trade engine, and +2% credit surcharge governance.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'domestic_invoices' && (
            <button
              onClick={() => setShowCreateInvoiceModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold text-xs transition shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Domestic Tax Invoice</span>
            </button>
          )}

          {activeTab === 'export_invoices' && (
            <button
              onClick={() => setShowCreateExportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition shadow-sm active:scale-95"
            >
              <Ship className="w-4 h-4" />
              <span>+ Create Export Commercial Invoice</span>
            </button>
          )}

          {activeTab === 'quotations' && (
            <button
              onClick={() => setShowCreateQuotationModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold text-xs transition shadow-sm active:scale-95"
            >
              <FileCheck className="w-4 h-4" />
              <span>+ Create Formal Quotation</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('domestic_invoices')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'domestic_invoices'
              ? 'border-[#9E1C23] text-[#9E1C23] dark:text-amber-400 dark:border-amber-400 font-bold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Domestic Tax Invoices ({domesticInvoices.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('export_invoices')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'export_invoices'
              ? 'border-[#9E1C23] text-[#9E1C23] dark:text-amber-400 dark:border-amber-400 font-bold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Ship className="w-4 h-4" />
          <span>Global Export Invoices ({exportInvoices.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('quotations')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'quotations'
              ? 'border-[#9E1C23] text-[#9E1C23] dark:text-amber-400 dark:border-amber-400 font-bold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Quotations &amp; Proformas ({quotations.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('void_audit')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'void_audit'
              ? 'border-[#9E1C23] text-[#9E1C23] dark:text-amber-400 dark:border-amber-400 font-bold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Void Audit Ledger ({voidAudits.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'preview'
              ? 'border-[#9E1C23] text-[#9E1C23] dark:text-amber-400 dark:border-amber-400 font-bold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Document Print Preview</span>
        </button>
      </div>

      {/* Search Bar */}
      {activeTab !== 'preview' && (
        <div className="p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice #, quotation #, or customer name..."
              className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 1: DOMESTIC TAX INVOICES                                          */}
      {/* ===================================================================== */}
      {activeTab === 'domestic_invoices' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {domesticInvoices.map((inv) => (
              <div
                key={inv.id}
                className="rounded-2xl border p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-[#9E1C23] dark:text-amber-400">
                      {inv.invoiceNo}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        inv.status === 'paid'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                          : inv.status === 'voided'
                          ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1.5 truncate">
                    {inv.buyerName}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    GSTIN: {inv.buyerGstin || 'Unregistered'} · {inv.buyerState} (Code {inv.buyerStateCode})
                  </p>

                  {/* Commercial Credit Surcharge Badge */}
                  {inv.creditSurchargePaise > 0 && (
                    <div className="mt-2 p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-700 dark:text-rose-400 font-bold flex items-center justify-between">
                      <span>★ 2% Commercial Credit Surcharge:</span>
                      <span>+{formatINR(inv.creditSurchargePaise)}</span>
                    </div>
                  )}

                  <div className="mt-2 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Taxable Subtotal:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{formatINR(inv.subtotalTaxablePaise)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">CGST + SGST (5%):</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{formatINR(inv.totalTaxPaise)}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800 font-bold">
                      <span className="text-slate-900 dark:text-white">Grand Total:</span>
                      <span className="text-[#9E1C23] dark:text-amber-400">{formatINR(inv.grandTotalPaise)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-rose-600 font-semibold">
                      <span>Balance Outstanding:</span>
                      <span>{formatINR(inv.balanceDuePaise)}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => {
                      setPreviewDocument(inv);
                      setActiveTab('preview');
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>

                  {inv.status !== 'paid' && inv.status !== 'voided' && (
                    <button
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setCollectAmountRupees(inv.balanceDuePaise / 100);
                        setShowPaymentCollectModal(true);
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Collect</span>
                    </button>
                  )}

                  {inv.status !== 'voided' && (
                    <button
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setShowVoidModal(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Void / Cancel Invoice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: GLOBAL EXPORT INVOICES (200 COUNTRIES)                         */}
      {/* ===================================================================== */}
      {activeTab === 'export_invoices' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl border bg-blue-50/50 dark:bg-blue-950/20 border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-blue-900 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                <strong>Mundra Port Export Terminal (INMUN1)</strong> · Spices Board CRES #{ENTITIES.pvt_ltd.spicesBoardCres} · LUT ARN #{ENTITIES.pvt_ltd.lutArn}
              </span>
            </div>
            <span className="font-bold text-[11px] bg-blue-500/20 px-2 py-0.5 rounded">
              Rule 96A Zero-Rated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {exportInvoices.map((inv) => (
              <div
                key={inv.id}
                className="rounded-2xl border p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-blue-700 dark:text-blue-400">
                      {inv.invoiceNo}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                      {inv.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1.5 truncate">
                    {inv.buyerName}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Destination: <strong>{inv.destinationCountry}</strong> · Port: {inv.portOfDischarge}
                  </p>

                  <div className="mt-2 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Incoterms:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{inv.incoterms} Mundra</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Foreign Currency Value:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {inv.currency} {inv.foreignAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Realization (@ ₹{inv.exchangeRate}):</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{formatINR(inv.grandTotalPaise)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => {
                      setPreviewDocument(inv);
                      setActiveTab('preview');
                    }}
                    className="w-full py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-bold flex items-center justify-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View Export Commercial Invoice</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: FORMAL QUOTATIONS & PROFORMAS                                 */}
      {/* ===================================================================== */}
      {activeTab === 'quotations' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {quotations.map((quo) => (
              <div
                key={quo.id}
                className="rounded-2xl border p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-[#9E1C23] dark:text-amber-400">
                      {quo.quotationNo}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        quo.status === 'converted'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                      }`}
                    >
                      {quo.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1.5 truncate">
                    {quo.buyerName}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Valid Until: <strong>{quo.validUntilDate}</strong>
                  </p>

                  <div className="mt-2 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Taxable Estimate:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{formatINR(quo.subtotalTaxablePaise)}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800 font-bold">
                      <span className="text-slate-900 dark:text-white">Estimated Quote Total:</span>
                      <span className="text-[#9E1C23] dark:text-amber-400">{formatINR(quo.grandTotalPaise)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => {
                      setPreviewDocument(quo);
                      setActiveTab('preview');
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  {quo.status !== 'converted' && (
                    <button
                      onClick={() => handleConvertQuotation(quo.quotationNo)}
                      className="flex-1 py-1.5 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Convert to Invoice</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: VOID AUDIT LEDGER (NON-DESTRUCTIVE DELETION TRACKER)           */}
      {/* ===================================================================== */}
      {activeTab === 'void_audit' && (
        <div className="rounded-2xl border p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Statutory Void &amp; Cancellation Audit Register</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Section 31 CGST Act Invariant: Cancelled bills are preserved with timestamp, reason &amp; cryptographic audit trail.
              </p>
            </div>
            <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
              {voidAudits.length} Void Records
            </span>
          </div>

          {voidAudits.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 border border-dashed rounded-xl">
              Zero voided invoices recorded. All generated bills remain active in books.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Original Invoice #</th>
                    <th className="py-2.5 px-3">Voided Timestamp</th>
                    <th className="py-2.5 px-3">Authorized By</th>
                    <th className="py-2.5 px-3">Document Amount</th>
                    <th className="py-2.5 px-3">Documented Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {voidAudits.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40">
                      <td className="py-2.5 px-3 font-bold text-rose-600">{v.originalInvoiceNo}</td>
                      <td className="py-2.5 px-3 text-slate-500">{new Date(v.voidedAt).toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300">{v.voidedBy}</td>
                      <td className="py-2.5 px-3 font-bold">{formatINR(v.originalGrandTotalPaise)}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {v.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: DOCUMENT PRINT PREVIEW (EMBEDDED VECTOR STAMP & QR CODE)       */}
      {/* ===================================================================== */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-[#9E1C23] dark:text-amber-400" />
              <span>
                Document Selected: <strong>{previewDocument ? ('invoiceNo' in previewDocument ? previewDocument.invoiceNo : previewDocument.quotationNo) : 'None'}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (!previewDocument) return;
                  const html = renderDocumentHTML(previewDocument);
                  const blob = new Blob([html], { type: 'text/html' });
                  const url = URL.createObjectURL(blob);
                  const docNum = 'invoiceNo' in previewDocument ? previewDocument.invoiceNo : previewDocument.quotationNo;
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${docNum}.html`;
                  a.click();
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300"
              >
                Download HTML / DOCX
              </button>

              <button
                onClick={() => {
                  const printWin = window.open('', '_blank');
                  if (printWin && previewDocument) {
                    printWin.document.write(renderDocumentHTML(previewDocument));
                    printWin.document.close();
                    printWin.focus();
                    setTimeout(() => printWin.print(), 250);
                  }
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#9E1C23] text-white font-bold shadow hover:bg-[#83161C]"
              >
                🖨️ Direct Print / Save as PDF
              </button>
            </div>
          </div>

          {/* Inline Live Render Frame */}
          {previewDocument ? (
            <div className="rounded-2xl border border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden bg-white">
              <iframe
                title="Document Print Preview"
                srcDoc={renderDocumentHTML(previewDocument)}
                className="w-full h-[900px] border-none"
              />
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 border border-dashed rounded-xl">
              No document selected for preview. Click "Print" or "Preview" on any invoice or quotation above.
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: CREATE DOMESTIC TAX INVOICE                                 */}
      {/* ===================================================================== */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-4 sm:p-6 space-y-4 my-8 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Create Domestic GST Tax Invoice
                </h3>
                <p className="text-xs text-slate-500">
                  Adalaj Food Products Pvt. Ltd. (GSTIN: 24AAGCS9412F1Z4)
                </p>
              </div>
              <button onClick={() => setShowCreateInvoiceModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateDomesticInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Buyer / Customer Name *</label>
                <input
                  type="text"
                  required
                  value={invBuyerName}
                  onChange={(e) => setInvBuyerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Buyer GSTIN *</label>
                  <input
                    type="text"
                    required
                    value={invBuyerGstin}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setInvBuyerGstin(val);
                      if (val.length >= 2) {
                        setInvBuyerStateCode(val.slice(0, 2));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">State Code (Override)</label>
                  <input
                    type="text"
                    value={invBuyerStateCode}
                    onChange={(e) => setInvBuyerStateCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    {invBuyerStateCode === '24' ? '24 - Gujarat (Intra: CGST+SGST)' : 'Inter-State (IGST 5%)'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Billing Address</label>
                <input
                  type="text"
                  value={invBuyerAddress}
                  onChange={(e) => setInvBuyerAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              {/* Payment & Credit Terms */}
              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 space-y-1.5">
                <label className="block font-bold text-[#9E1C23] dark:text-amber-400 uppercase text-[10px]">
                  Payment Covenant &amp; Surcharge Terms *
                </label>
                <select
                  value={invCreditTerms}
                  onChange={(e) => setInvCreditTerms(e.target.value as PaymentCreditTerm)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                >
                  <option value="on_dispatch">Payment on Dispatch / Advance (0% Surcharge)</option>
                  <option value="credit_30">30 Days Credit (+2.0% Commercial Credit Surcharge)</option>
                  <option value="credit_60">60 Days Credit (+2.0% Commercial Credit Surcharge)</option>
                  <option value="credit_extended">&gt; 180 Days Extended Credit (+2% Surcharge + 9% Financing)</option>
                </select>
              </div>

              {/* Line Item */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold mb-1">Item SKU / Description *</label>
                  <input
                    type="text"
                    required
                    value={invItemName}
                    onChange={(e) => setInvItemName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Quantity (Pouches/Units) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={invItemQty}
                    onChange={(e) => setInvItemQty(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Unit Rate (₹ / pouch) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={invItemRateRupees}
                    onChange={(e) => setInvItemRateRupees(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="px-4 py-2 rounded-lg border text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#9E1C23] text-white font-bold shadow hover:bg-[#83161C]"
                >
                  Generate Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: CREATE EXPORT COMMERCIAL INVOICE                             */}
      {/* ===================================================================== */}
      {showCreateExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-4 sm:p-6 space-y-4 my-8 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Create Export Commercial Invoice (200 Countries)
                </h3>
                <p className="text-xs text-blue-600 font-semibold">
                  Mundra Port (INMUN1) · LUT ARN: {ENTITIES.pvt_ltd.lutArn}
                </p>
              </div>
              <button onClick={() => setShowCreateExportModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateExportInvoice} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">International Consignee Name *</label>
                <input
                  type="text"
                  required
                  value={expConsigneeName}
                  onChange={(e) => setExpConsigneeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Destination Country *</label>
                  <input
                    type="text"
                    required
                    value={expCountry}
                    onChange={(e) => setExpCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Incoterms 2020 *</label>
                  <select
                    value={expIncoterms}
                    onChange={(e) => setExpIncoterms(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="FOB">FOB (Free on Board - Mundra Port)</option>
                    <option value="CIF">CIF (Cost, Insurance &amp; Freight)</option>
                    <option value="CFR">CFR (Cost &amp; Freight)</option>
                    <option value="EXW">EXW (Ex Works Factory)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Invoice Currency *</label>
                  <select
                    value={expCurrency}
                    onChange={(e) => setExpCurrency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="USD">USD ($) - US Dollars</option>
                    <option value="EUR">EUR (€) - Euros</option>
                    <option value="AED">AED (د.إ) - UAE Dirhams</option>
                    <option value="GBP">GBP (£) - British Pounds</option>
                    <option value="SAR">SAR (﷼) - Saudi Riyals</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Exchange Rate (₹ / Unit) *</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={expExchangeRate}
                    onChange={(e) => setExpExchangeRate(Number(e.target.value) || 83.5)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Quantity (25kg Sacks) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={expItemQtySacks}
                    onChange={(e) => setExpItemQtySacks(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Rate in Foreign Currency *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expItemRateDollars}
                    onChange={(e) => setExpItemRateDollars(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateExportModal(false)}
                  className="px-4 py-2 rounded-lg border text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-700 text-white font-bold shadow hover:bg-blue-800"
                >
                  Generate Export Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: CREATE FORMAL QUOTATION                                      */}
      {/* ===================================================================== */}
      {showCreateQuotationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-4 sm:p-6 space-y-4 my-8 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Create Formal Commercial Quotation
                </h3>
                <p className="text-xs text-slate-500">Valid for 30 calendar days</p>
              </div>
              <button onClick={() => setShowCreateQuotationModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Customer / Buyer Name *</label>
                <input
                  type="text"
                  required
                  value={quoBuyerName}
                  onChange={(e) => setQuoBuyerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Item Description *</label>
                <input
                  type="text"
                  required
                  value={quoItemName}
                  onChange={(e) => setQuoItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quoItemQty}
                    onChange={(e) => setQuoItemQty(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Estimated Unit Rate (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quoItemRateRupees}
                    onChange={(e) => setQuoItemRateRupees(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateQuotationModal(false)}
                  className="px-4 py-2 rounded-lg border text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#9E1C23] text-white font-bold shadow hover:bg-[#83161C]"
                >
                  Generate Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: RECORD PAYMENT COLLECTION                                    */}
      {/* ===================================================================== */}
      {showPaymentCollectModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-4 sm:p-6 space-y-4 my-8 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Record Payment Collection
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedInvoice.invoiceNo} · {selectedInvoice.buyerName}
                </p>
              </div>
              <button onClick={() => setShowPaymentCollectModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Invoice Amount:</span>
                  <span className="font-bold">{formatINR(selectedInvoice.grandTotalPaise)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Outstanding Balance:</span>
                  <span className="font-bold text-rose-600">{formatINR(selectedInvoice.balanceDuePaise)}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Collected Amount (₹) *</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={collectAmountRupees}
                  onChange={(e) => setCollectAmountRupees(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Payment Mode *</label>
                <select
                  value={collectMode}
                  onChange={(e) => setCollectMode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="HDFC Bank NEFT/RTGS">HDFC Bank NEFT/RTGS</option>
                  <option value="UPI / QR Instant Transfer">UPI / QR Instant Transfer</option>
                  <option value="Account Payee Cheque">Account Payee Cheque</option>
                  <option value="Cash at Factory Safe">Cash at Factory Safe</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Bank UTR / Transaction Ref</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC20261019024"
                  value={collectRef}
                  onChange={(e) => setCollectRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentCollectModal(false)}
                  className="px-4 py-2 rounded-lg border text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-bold shadow hover:bg-emerald-700"
                >
                  Confirm Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 5: VOID / CANCEL INVOICE                                        */}
      {/* ===================================================================== */}
      {showVoidModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-4 sm:p-6 space-y-4 my-8 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Void Invoice: {selectedInvoice.invoiceNo}
                </h3>
              </div>
              <button onClick={() => setShowVoidModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleVoidInvoice} className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Under Section 31 of CGST Act, this invoice will be reversed and moved into the permanent void audit register. It cannot be deleted destructively.
              </p>

              <div>
                <label className="block font-semibold mb-1">Reason / Justification for Voiding *</label>
                <textarea
                  rows={3}
                  required
                  value={voidReasonText}
                  onChange={(e) => setVoidReasonText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVoidModal(false)}
                  className="px-4 py-2 rounded-lg border text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 text-white font-bold shadow hover:bg-rose-700"
                >
                  Confirm Void Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
