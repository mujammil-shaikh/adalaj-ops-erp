import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Building2,
  ShieldCheck,
  CreditCard,
  Landmark,
  X,
  FileCheck,
  ExternalLink,
  Layers,
  Wrench,
  Package,
  Zap,
  Briefcase,
  Printer,
} from 'lucide-react';
import { db } from '../../lib/storage';
import {
  PurchaseOrder,
  PurchaseCategory,
  POFulfillmentStatus,
  PaymentMilestoneType,
  POPartPayment,
  POItemLine,
  Account,
  Party,
} from '../../types';
import { formatINR, formatDate } from '../../lib/format';
import { useTheme } from '../../context/ThemeContext';

export const PurchaseOrdersModule: React.FC = () => {
  const { isDark } = useTheme();

  const [pos, setPos] = useState<PurchaseOrder[]>(db.getPurchaseOrders());
  const [parties] = useState<Party[]>(db.getParties());
  const [accounts] = useState<Account[]>(db.getAccounts());

  const [activeTab, setActiveTab] = useState<'pos' | 'milestones' | 'gst_itc'>('pos');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New PO Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [poNumber, setPoNumber] = useState(`PO-2026-10-${String(pos.length + 1).padStart(3, '0')}`);
  const [partyId, setPartyId] = useState(parties[0]?.id || '');
  const [partyName, setPartyName] = useState(parties[0]?.name || '');
  const [purchaseCategory, setPurchaseCategory] = useState<PurchaseCategory>('raw_material');
  const [initiationDate, setInitiationDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedFulfillmentDate, setExpectedFulfillmentDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [lineDesc, setLineDesc] = useState('');
  const [lineHsn, setLineHsn] = useState('09103020');
  const [lineQty, setLineQty] = useState(1000);
  const [lineUnit, setLineUnit] = useState('kg');
  const [lineUnitPriceRupees, setLineUnitPriceRupees] = useState(100);
  const [lineGstRatePct, setLineGstRatePct] = useState(5);
  const [lineClaimableITC, setLineClaimableITC] = useState(true);
  const [initialAdvanceRupees, setInitialAdvanceRupees] = useState(0);
  const [advanceUtr, setAdvanceUtr] = useState('');

  // Payment Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPoForPayment, setSelectedPoForPayment] = useState<PurchaseOrder | null>(null);
  const [milestoneType, setMilestoneType] = useState<PaymentMilestoneType>('part_payment');
  const [paymentAmountRupees, setPaymentAmountRupees] = useState(50000);
  const [paymentMode, setPaymentMode] = useState<POPartPayment['paymentMode']>('bank_neft_rtgs');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[1]?.id || accounts[0]?.id || '');
  const [utrOrRef, setUtrOrRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Fulfillment Modal state
  const [showFulfillmentModal, setShowFulfillmentModal] = useState(false);
  const [selectedPoForFulfill, setSelectedPoForFulfill] = useState<PurchaseOrder | null>(null);
  const [fulfillStatus, setFulfillStatus] = useState<POFulfillmentStatus>('fulfilled');
  const [grnNumber, setGrnNumber] = useState('');
  const [fulfillNotes, setFulfillNotes] = useState('');

  const reloadData = () => {
    setPos(db.getPurchaseOrders());
  };

  // Metrics
  const totalCommittedPaise = pos.reduce((acc, p) => acc + p.totalAmountPaise, 0);
  const totalPaidPaise = pos.reduce((acc, p) => acc + p.totalPaidPaise, 0);
  const totalBalanceDuePaise = pos.reduce((acc, p) => acc + p.balanceDuePaise, 0);
  const totalClaimableGstPaise = pos.reduce((acc, p) => acc + p.totalClaimableGstPaise, 0);

  // Category Pill styling
  const getCategoryBadge = (cat: PurchaseCategory) => {
    switch (cat) {
      case 'machinery':
        return { label: 'Machinery & Capex', bg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30', icon: Wrench };
      case 'raw_material':
        return { label: 'Raw Spices & Powder', bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30', icon: Package };
      case 'packing_material':
        return { label: 'Packing Pouches & Rolls', bg: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30', icon: Layers };
      case 'rent':
        return { label: 'Factory Shed Rent', bg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30', icon: Building2 };
      case 'electricity':
        return { label: 'Electricity / Power', bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30', icon: Zap };
      case 'ca_legal':
        return { label: 'CA & Auditor Retainer', bg: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30', icon: Briefcase };
      case 'stationery':
        return { label: 'Stationery & Ribbons', bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', icon: Printer };
      case 'licences':
        return { label: 'Regulatory Licences', bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30', icon: ShieldCheck };
      default:
        return { label: cat, bg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30', icon: FileText };
    }
  };

  const getStatusBadge = (st: POFulfillmentStatus) => {
    switch (st) {
      case 'fulfilled':
        return { label: 'Fulfilled / Received', bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' };
      case 'partially_fulfilled':
        return { label: 'Partially Received / In Progress', bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30' };
      case 'issued':
        return { label: 'PO Issued to Vendor', bg: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30' };
      case 'draft':
        return { label: 'Draft PO', bg: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30' };
      case 'cancelled':
        return { label: 'Cancelled', bg: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30' };
    }
  };

  // Filtered list
  const filteredPos = pos.filter((p) => {
    const matchesSearch =
      p.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.fulfillmentNotes || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.purchaseCategory === categoryFilter;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle Create PO
  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();

    const taxablePaise = Math.round(lineQty * lineUnitPriceRupees * 100);
    const gstRateDecimal = lineGstRatePct / 100;
    const gstTotalPaise = Math.round(taxablePaise * gstRateDecimal);
    const halfGstPaise = Math.round(gstTotalPaise / 2);
    const grossTotalPaise = taxablePaise + gstTotalPaise;

    const claimableGstPaise = lineClaimableITC ? gstTotalPaise : 0;
    const advancePaise = Math.round(initialAdvanceRupees * 100);

    const paymentsList: POPartPayment[] = [];
    if (advancePaise > 0) {
      paymentsList.push({
        id: `pay_adv_${Date.now()}`,
        poId: `po_${Date.now()}`,
        date: initiationDate,
        milestoneType: 'advance',
        amountPaise: advancePaise,
        paymentMode: 'bank_neft_rtgs',
        accountId: accounts[1]?.id || 'acc_hdfc_curr',
        accountName: accounts[1]?.name || 'HDFC Current A/c',
        utrOrRef: advanceUtr || `ADV-${Date.now().toString().slice(-6)}`,
        notes: 'Initial token / advance paid at PO generation',
      });
    }

    const totalPaid = advancePaise;
    const balanceDue = Math.max(0, grossTotalPaise - totalPaid);

    const newPO: PurchaseOrder = {
      id: `po_${Date.now()}`,
      poNumber,
      initiationDate,
      expectedFulfillmentDate,
      partyId: partyId || 'pty_custom',
      partyName,
      purchaseCategory,
      status: balanceDue === 0 ? 'fulfilled' : totalPaid > 0 ? 'partially_fulfilled' : 'issued',
      taxableAmountPaise: taxablePaise,
      cgstPaise: halfGstPaise,
      sgstPaise: halfGstPaise,
      igstPaise: 0,
      totalAmountPaise: grossTotalPaise,
      totalClaimableGstPaise: claimableGstPaise,
      totalIneligibleGstPaise: lineClaimableITC ? 0 : gstTotalPaise,
      advancePaidPaise: advancePaise,
      totalPaidPaise: totalPaid,
      balanceDuePaise: balanceDue,
      payments: paymentsList,
      items: [
        {
          id: `poi_${Date.now()}`,
          description: lineDesc || `${purchaseCategory} Purchase Item`,
          category: purchaseCategory,
          hsnOrSac: lineHsn,
          qty: lineQty,
          unit: lineUnit,
          unitPricePaise: Math.round(lineUnitPriceRupees * 100),
          taxableAmountPaise: taxablePaise,
          gstRatePct: lineGstRatePct,
          cgstPaise: halfGstPaise,
          sgstPaise: halfGstPaise,
          igstPaise: 0,
          totalPaise: grossTotalPaise,
          isClaimableITC: lineClaimableITC,
          isRCM: false,
        },
      ],
      fulfillmentNotes: 'Newly generated PO recorded in central procurement register.',
    };

    db.addPurchaseOrder(newPO);
    reloadData();
    setShowCreateModal(false);
  };

  // Handle Record Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoForPayment) return;

    const amountPaise = Math.round(paymentAmountRupees * 100);
    const acc = accounts.find((a) => a.id === selectedAccountId);

    const newPayment: POPartPayment = {
      id: `pay_${Date.now()}`,
      poId: selectedPoForPayment.id,
      date: new Date().toISOString().split('T')[0],
      milestoneType,
      amountPaise,
      paymentMode,
      accountId: selectedAccountId,
      accountName: acc?.name || 'Bank Account',
      utrOrRef: utrOrRef || `UTR-${Date.now().toString().slice(-6)}`,
      notes: paymentNotes || `${milestoneType} payment against PO ${selectedPoForPayment.poNumber}`,
    };

    db.addPOPartPayment(selectedPoForPayment.id, newPayment);
    reloadData();
    setShowPaymentModal(false);
    setSelectedPoForPayment(null);
  };

  // Handle Fulfillment Update
  const handleFulfillmentUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoForFulfill) return;

    db.updatePOFulfillmentStatus(
      selectedPoForFulfill.id,
      fulfillStatus,
      fulfillNotes,
      grnNumber
    );
    reloadData();
    setShowFulfillmentModal(false);
    setSelectedPoForFulfill(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Purchase Orders & Fulfillment
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#9A2229]/10 text-[#9A2229] dark:bg-amber-500/10 dark:text-amber-300 border border-[#9A2229]/20">
              Procurement & Part-Payments
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tracking initiation & fulfillment dates for Machinery, Raw Spices, Packing Materials, Rent, Power, and CA Bills.
          </p>
        </div>

        <button
          onClick={() => {
            setPoNumber(`PO-2026-10-${String(pos.length + 1).padStart(3, '0')}`);
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#9A2229] hover:bg-[#851C22] shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order (PO)</span>
        </button>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          className={`p-4 rounded-xl border transition ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Total PO Commitments</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatINR(totalCommittedPaise)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {pos.length} purchase contracts
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border transition ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Advances & Paid Part Deals</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatINR(totalPaidPaise)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400/80 mt-1">
            {Math.round((totalPaidPaise / (totalCommittedPaise || 1)) * 100)}% of committed total settled
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border transition ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Outstanding Balance Due</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            {formatINR(totalBalanceDuePaise)}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400/80 mt-1">
            Pending post-commissioning & QC
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border transition ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Claimable GST (ITC)</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
            {formatINR(totalClaimableGstPaise)}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400/80 mt-1">
            Eligible input credit in GSTR-2B
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('pos')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'pos'
              ? 'bg-[#9A2229] text-white'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>All Purchase Orders ({pos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('milestones')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'milestones'
              ? 'bg-[#9A2229] text-white'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Advance & Part-Payment Milestones</span>
        </button>

        <button
          onClick={() => setActiveTab('gst_itc')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'gst_itc'
              ? 'bg-[#9A2229] text-white'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>GST Claimable vs Ineligible ITC</span>
        </button>
      </div>

      {/* 4. Tab Content */}
      {activeTab === 'pos' && (
        <div className="space-y-4">
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PO#, vendor, machinery, or items..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#9A2229]/20 ${
                  isDark
                    ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none cursor-pointer ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <option value="all">All Purchase Categories</option>
                <option value="machinery">Machinery & Capex</option>
                <option value="raw_material">Raw Spices</option>
                <option value="packing_material">Packing Material</option>
                <option value="rent">Factory Rent</option>
                <option value="electricity">Electricity / Power</option>
                <option value="ca_legal">CA & Legal Retainer</option>
                <option value="stationery">Stationery & Consumables</option>
                <option value="licences">Regulatory Licences</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold focus:outline-none cursor-pointer ${
                  isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <option value="all">All Statuses</option>
                <option value="issued">Issued</option>
                <option value="partially_fulfilled">Partially Received</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          {/* PO Cards Grid */}
          <div className="space-y-3">
            {filteredPos.length === 0 ? (
              <div
                className={`p-12 text-center rounded-2xl border text-slate-400 text-xs ${
                  isDark ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                No purchase orders matched your current filters.
              </div>
            ) : (
              filteredPos.map((po) => {
                const catMeta = getCategoryBadge(po.purchaseCategory);
                const stMeta = getStatusBadge(po.status);
                const CatIcon = catMeta.icon;

                return (
                  <div
                    key={po.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isDark
                        ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        : 'bg-white border-amber-900/10 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#9A2229]/10 text-[#9A2229] dark:bg-amber-500/10 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                          <CatIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                              {po.poNumber}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catMeta.bg}`}
                            >
                              {catMeta.label}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${stMeta.bg}`}
                            >
                              {stMeta.label}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                            {po.partyName}
                            {po.partyGstin && (
                              <span className="ml-1.5 text-[10px] text-slate-400 font-mono">
                                ({po.partyGstin})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="text-xs text-slate-400">Total Order Value</div>
                          <div className="text-base font-black text-slate-900 dark:text-white">
                            {formatINR(po.totalAmountPaise)}
                          </div>
                        </div>
                        <div className="border-l pl-4 dark:border-slate-800">
                          <div className="text-xs text-slate-400">Balance Pending</div>
                          <div
                            className={`text-base font-black ${
                              po.balanceDuePaise > 0
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {formatINR(po.balanceDuePaise)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline & Details Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 text-xs border-b dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Date of Initiation:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatDate(po.initiationDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Expected Fulfillment:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatDate(po.expectedFulfillmentDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Actual Fulfillment Date:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {po.actualFulfillmentDate ? formatDate(po.actualFulfillmentDate) : 'Pending Delivery / QC'}
                        </span>
                      </div>
                    </div>

                    {/* Items lines summary */}
                    <div className="py-2 space-y-1.5">
                      {po.items.map((it) => (
                        <div
                          key={it.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-950/40"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {it.description}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              (HSN/SAC: {it.hsnOrSac})
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-right flex-shrink-0">
                            <span className="text-slate-500">
                              {it.qty} {it.unit} @ ₹{(it.unitPricePaise / 100).toLocaleString('en-IN')}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {formatINR(it.totalPaise)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Payments Progress Bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span>
                          Advance / Part Paid: <strong>{formatINR(po.totalPaidPaise)}</strong> ({po.payments.length} payments recorded)
                        </span>
                        <span>
                          Remaining: <strong>{formatINR(po.balanceDuePaise)}</strong>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((po.totalPaidPaise / (po.totalAmountPaise || 1)) * 100)
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3 pt-3 flex flex-wrap items-center justify-between gap-2 border-t dark:border-slate-800">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 italic truncate max-w-md">
                        {po.fulfillmentNotes || 'No fulfillment remarks recorded.'}
                      </div>

                      <div className="flex items-center gap-2">
                        {po.balanceDuePaise > 0 && (
                          <button
                            onClick={() => {
                              setSelectedPoForPayment(po);
                              setPaymentAmountRupees(Math.round(po.balanceDuePaise / 100));
                              setShowPaymentModal(true);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition cursor-pointer"
                          >
                            + Record Part Payment
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedPoForFulfill(po);
                            setFulfillStatus(po.status);
                            setGrnNumber(po.grnNumber || '');
                            setFulfillNotes(po.fulfillmentNotes || '');
                            setShowFulfillmentModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
                        >
                          Fulfillment / GRN Status
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Milestones & Split Payments */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-xl border text-xs ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            <div className="font-bold mb-1 flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-[#9A2229] dark:text-amber-400" />
              <span>Industrial Advance & Split Instalment Ledger</span>
            </div>
            <p>
              Shows advance booking deposits, in-transit dispatch part payments, and final commissioning balances for machinery, large raw spices, and flexible packaging runs.
            </p>
          </div>

          <div
            className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead
                  className={`border-b font-bold ${
                    isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <tr>
                    <th className="p-3">Payment Date</th>
                    <th className="p-3">PO Number</th>
                    <th className="p-3">Vendor / Recipient</th>
                    <th className="p-3">Milestone Type</th>
                    <th className="p-3">Mode & Bank</th>
                    <th className="p-3">UTR / Cheque Ref</th>
                    <th className="p-3 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {pos.flatMap((p) =>
                    p.payments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-medium text-slate-500">{formatDate(pay.date)}</td>
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                          {p.poNumber}
                        </td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                          {p.partyName}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              pay.milestoneType === 'advance'
                                ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30'
                                : pay.milestoneType === 'part_payment'
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {pay.milestoneType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {pay.accountName}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500">
                          {pay.utrOrRef}
                        </td>
                        <td className="p-3 text-right font-black text-slate-900 dark:text-white">
                          {formatINR(pay.amountPaise)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: GST Input Tax Credit (ITC) Report */}
      {activeTab === 'gst_itc' && (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-xl border text-xs ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-blue-50/70 border-blue-200 text-blue-900'
            }`}
          >
            <div className="font-bold mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>GSTR-2B Input Tax Credit (ITC) Claim Verification</span>
            </div>
            <p>
              Segregates eligible claimable GST against output tax on finished spices from blocked ITC under Section 17(5) and exempt utilities (such as power tariffs and government licence challans).
            </p>
          </div>

          <div
            className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead
                  className={`border-b font-bold ${
                    isDark ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <tr>
                    <th className="p-3">PO Number</th>
                    <th className="p-3">Vendor & Category</th>
                    <th className="p-3 text-right">Taxable Value</th>
                    <th className="p-3 text-right">CGST</th>
                    <th className="p-3 text-right">SGST</th>
                    <th className="p-3 text-right">Total GST</th>
                    <th className="p-3">ITC Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {pos.map((p) => {
                    const totalGst = p.cgstPaise + p.sgstPaise + p.igstPaise;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                          {p.poNumber}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {p.partyName}
                          </div>
                          <div className="text-[10px] text-slate-400 capitalize">
                            {p.purchaseCategory.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="p-3 text-right font-medium">
                          {formatINR(p.taxableAmountPaise)}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-500">
                          {formatINR(p.cgstPaise)}
                        </td>
                        <td className="p-3 text-right font-mono text-slate-500">
                          {formatINR(p.sgstPaise)}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                          {formatINR(totalGst)}
                        </td>
                        <td className="p-3">
                          {p.totalClaimableGstPaise > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                              Claimable ITC (100%)
                            </span>
                          ) : totalGst === 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
                              GST Exempt / Nil Rate
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                              Ineligible Sec 17(5)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. Create PO Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-900/10 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#9A2229]" />
                Create New Purchase Order
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">PO Number</label>
                  <input
                    type="text"
                    required
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Purchase Category</label>
                  <select
                    value={purchaseCategory}
                    onChange={(e) => setPurchaseCategory(e.target.value as PurchaseCategory)}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-medium dark:bg-slate-950 dark:border-slate-700"
                  >
                    <option value="raw_material">Raw Material (Bulk Spices)</option>
                    <option value="packing_material">Packing Material (Pouches, Rolls)</option>
                    <option value="machinery">Machinery & Capex</option>
                    <option value="rent">Factory Shed Rent</option>
                    <option value="electricity">Electricity / Power</option>
                    <option value="ca_legal">CA & Legal Retainer</option>
                    <option value="stationery">Stationery & Consumables</option>
                    <option value="licences">Regulatory Licences</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Vendor / Party Name</label>
                  <input
                    type="text"
                    required
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder="e.g. Patel Agro Spices Unjha"
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Initiation Date</label>
                  <input
                    type="date"
                    required
                    value={initiationDate}
                    onChange={(e) => setInitiationDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Expected Delivery / Due Date</label>
                  <input
                    type="date"
                    required
                    value={expectedFulfillmentDate}
                    onChange={(e) => setExpectedFulfillmentDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Item / Service Description</label>
                  <input
                    type="text"
                    required
                    value={lineDesc}
                    onChange={(e) => setLineDesc(e.target.value)}
                    placeholder="e.g. Rajapuri Turmeric Bulbs or 100g 3-layer pouches"
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={lineQty}
                    onChange={(e) => setLineQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={lineUnit}
                    onChange={(e) => setLineUnit(e.target.value)}
                    placeholder="kg, pcs, unit"
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={lineUnitPriceRupees}
                    onChange={(e) => setLineUnitPriceRupees(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">GST Rate (%)</label>
                  <select
                    value={lineGstRatePct}
                    onChange={(e) => setLineGstRatePct(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% (Raw Spices)</option>
                    <option value={12}>12%</option>
                    <option value={18}>18% (Machinery / Packaging)</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">Claimable Input Tax Credit (ITC)?</span>
                  <input
                    type="checkbox"
                    checked={lineClaimableITC}
                    onChange={(e) => setLineClaimableITC(e.target.checked)}
                    className="w-4 h-4 accent-[#9A2229] rounded cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t dark:border-slate-800">
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">
                      Initial Advance Paid (₹) — Optional
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={initialAdvanceRupees}
                      onChange={(e) => setInitialAdvanceRupees(Number(e.target.value))}
                      placeholder="0"
                      className="w-full px-3 py-1.5 rounded-lg border text-xs dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">
                      Advance UTR / Reference
                    </label>
                    <input
                      type="text"
                      value={advanceUtr}
                      onChange={(e) => setAdvanceUtr(e.target.value)}
                      placeholder="e.g. HDFC1001849102"
                      className="w-full px-3 py-1.5 rounded-lg border text-xs dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#9A2229] hover:bg-[#851C22]"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Record Part Payment Modal */}
      {showPaymentModal && selectedPoForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-900/10 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Record Advance or Part Payment
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-2 text-xs text-slate-500">
              For <strong>{selectedPoForPayment.poNumber}</strong> ({selectedPoForPayment.partyName}).
              Remaining balance due: <strong>{formatINR(selectedPoForPayment.balanceDuePaise)}</strong>.
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4 mt-2">
              <div>
                <label className="block text-xs font-semibold mb-1">Milestone Type</label>
                <select
                  value={milestoneType}
                  onChange={(e) => setMilestoneType(e.target.value as PaymentMilestoneType)}
                  className="w-full px-3 py-2 rounded-xl border text-xs font-medium dark:bg-slate-950 dark:border-slate-700"
                >
                  <option value="advance">Advance Booking Token</option>
                  <option value="part_payment">Part Payment on Dispatch / Loading</option>
                  <option value="final_settlement">Final Clearance on Commissioning / Acceptance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Amount to Pay (₹)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={paymentAmountRupees}
                  onChange={(e) => setPaymentAmountRupees(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border text-sm font-bold dark:bg-slate-950 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as POPartPayment['paymentMode'])}
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  >
                    <option value="bank_neft_rtgs">Bank NEFT / RTGS</option>
                    <option value="upi">UPI Transfer</option>
                    <option value="cheque">Bank Cheque</option>
                    <option value="cash">Cash Safe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Debited Account</label>
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">UTR / Cheque Ref Number</label>
                <input
                  type="text"
                  required
                  value={utrOrRef}
                  onChange={(e) => setUtrOrRef(e.target.value)}
                  placeholder="e.g. HDFC1004910283"
                  className="w-full px-3 py-2 rounded-xl border text-xs font-mono dark:bg-slate-950 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Payment Notes</label>
                <textarea
                  rows={2}
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Milestone note, inspection cleared, etc."
                  className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Fulfillment / GRN Modal */}
      {showFulfillmentModal && selectedPoForFulfill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-900/10 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                Update Fulfillment & Receiving
              </h3>
              <button
                onClick={() => setShowFulfillmentModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-2 text-xs text-slate-500">
              Updating delivery status for <strong>{selectedPoForFulfill.poNumber}</strong> (
              {selectedPoForFulfill.partyName}).
            </div>

            <form onSubmit={handleFulfillmentUpdate} className="space-y-4 mt-2">
              <div>
                <label className="block text-xs font-semibold mb-1">Fulfillment Status</label>
                <select
                  value={fulfillStatus}
                  onChange={(e) => setFulfillStatus(e.target.value as POFulfillmentStatus)}
                  className="w-full px-3 py-2 rounded-xl border text-xs font-medium dark:bg-slate-950 dark:border-slate-700"
                >
                  <option value="fulfilled">Fulfilled / Fully Received</option>
                  <option value="partially_fulfilled">Partially Fulfilled / Partial Delivery</option>
                  <option value="issued">Issued (Awaiting Transporter / Dispatch)</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">GRN (Goods Receipt Note) Number</label>
                <input
                  type="text"
                  value={grnNumber}
                  onChange={(e) => setGrnNumber(e.target.value)}
                  placeholder="e.g. GRN-RAW-2026-102"
                  className="w-full px-3 py-2 rounded-xl border text-xs font-mono dark:bg-slate-950 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Receiving Inspection & Floor Notes</label>
                <textarea
                  rows={3}
                  value={fulfillNotes}
                  onChange={(e) => setFulfillNotes(e.target.value)}
                  placeholder="Material QC check, moisture level, seal intact, etc."
                  className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFulfillmentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md"
                >
                  Update Fulfillment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
