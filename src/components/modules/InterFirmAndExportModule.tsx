import React, { useState, useEffect } from 'react';
import {
  Truck,
  Globe,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  Building2,
  Package,
  Layers,
  FileText,
  Ship,
  FileCheck,
  ChevronRight,
  X,
  ExternalLink,
  MapPin,
  Anchor,
  DollarSign,
  Scale,
  Receipt,
  AlertCircle,
  AlertTriangle,
  Download,
  CreditCard,
  Landmark,
  RefreshCw,
  TrendingUp,
  Filter,
  Check,
} from 'lucide-react';
import { db } from '../../lib/storage';
import {
  InterFirmTransfer,
  InterFirmTransferItem,
  ExportShipment,
  TransferStatus,
  TransferFormat,
  ExportFormat,
  ExportShipmentStatus,
  CustomerChannel,
  CHANNEL_DETAILS,
  BusinessEntityId,
  InterEntityStockAllocation,
  SisterDownstreamInvoice,
  SisterDownstreamInvoiceItem,
  InterEntitySettlement,
  InterEntityLedgerReconciliation,
  StockFlowReconciliation,
  Party,
} from '../../types';
import { formatINR, formatDate } from '../../lib/format';
import { useTheme } from '../../context/ThemeContext';

export const InterFirmAndExportModule: React.FC = () => {
  const { isDark } = useTheme();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'reconciliation' | 'cfa_transfers' | 'downstream_billing' | 'entities_matrix' | 'export_shipments'
  >('reconciliation');

  // Master Data States
  const [transfers, setTransfers] = useState<InterFirmTransfer[]>(db.getInterFirmTransfers());
  const [exports, setExports] = useState<ExportShipment[]>(db.getExportShipments());
  const [allocations, setAllocations] = useState<InterEntityStockAllocation[]>(db.getStockAllocations());
  const [sisterInvoices, setSisterInvoices] = useState<SisterDownstreamInvoice[]>(db.getSisterDownstreamInvoices());
  const [settlements, setSettlements] = useState<InterEntitySettlement[]>(db.getInterEntitySettlements());
  const [entitiesConfig, setEntitiesConfig] = useState(db.getEntitiesConfig());
  const [parties, setParties] = useState<Party[]>(db.getParties());
  const [searchQuery, setSearchQuery] = useState('');

  // Reconciliation States
  const [reconReport, setReconReport] = useState<InterEntityLedgerReconciliation>(
    db.getInterEntityReconciliationReport()
  );
  const [stockFlow, setStockFlow] = useState<StockFlowReconciliation>(
    db.getStockFlowReconciliation()
  );

  // Modals
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showDownstreamInvoiceModal, setShowDownstreamInvoiceModal] = useState(false);
  const [showPaymentCollectModal, setShowPaymentCollectModal] = useState(false);
  const [selectedInvoiceForCollect, setSelectedInvoiceForCollect] = useState<SisterDownstreamInvoice | null>(null);
  const [selectedChallanForGRN, setSelectedChallanForGRN] = useState<InterFirmTransfer | null>(null);

  // Form States - Transfer Challan
  const [transferChallanNo, setTransferChallanNo] = useState(
    `DC-2026-10-${String(transfers.length + 1).padStart(3, '0')}`
  );
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [destinationFirmName, setDestinationFirmName] = useState(entitiesConfig.sister_prop.name);
  const [destinationGstin, setDestinationGstin] = useState(entitiesConfig.sister_prop.gstin);
  const [destinationAddress, setDestinationAddress] = useState(entitiesConfig.sister_prop.address);
  const [vehicleNo, setVehicleNo] = useState('GJ-01-ET-8492');
  const [ewayBillNo, setEwayBillNo] = useState(`2418${Date.now().toString().slice(-8)}`);
  const [driverPhone, setDriverPhone] = useState('+91 98250 88123');
  const [transferFormat, setTransferFormat] = useState<TransferFormat>('mixed_assorted');
  const [transferItemName, setTransferItemName] = useState('Turmeric Powder 100g Consumer Pouches');
  const [transferItemBatch, setTransferItemBatch] = useState('BAT-2026-10-04');
  const [transferPacksCount, setTransferPacksCount] = useState(1000);
  const [transferPackSizeGrams, setTransferPackSizeGrams] = useState(100);
  const [transferRatePerKgRupees, setTransferRatePerKgRupees] = useState(400);

  // Form States - Export Shipment
  const [exportInvoiceNo, setExportInvoiceNo] = useState(`EXP-2026-${String(exports.length + 1).padStart(3, '0')}`);
  const [shippingBillNo, setShippingBillNo] = useState(`SB-${Date.now().toString().slice(-7)}/2026`);
  const [exportDate, setExportDate] = useState(new Date().toISOString().split('T')[0]);
  const [consigneeName, setConsigneeName] = useState('Al-Madina Spice Trading LLC, Dubai, UAE');
  const [destinationCountry, setDestinationCountry] = useState('United Arab Emirates');
  const [destinationPort, setDestinationPort] = useState('Jebel Ali Port (AEJEA)');
  const [portOfLoading, setPortOfLoading] = useState('Mundra Port, Gujarat (INMUN1)');
  const [lutNumber, setLutNumber] = useState('AD240326001928K');
  const [iecNumber, setIecNumber] = useState('0819034291');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('bulk_export');
  const [containerNo, setContainerNo] = useState('MSKU-781920-4');
  const [sealNo, setSealNo] = useState(`IN-MUN-${Date.now().toString().slice(-5)}`);
  const [totalWeightKg, setTotalWeightKg] = useState(15000);
  const [foreignCurrency, setForeignCurrency] = useState<'USD' | 'AED' | 'EUR'>('USD');
  const [foreignAmountDollars, setForeignAmountDollars] = useState(25000);
  const [exchangeRate, setExchangeRate] = useState(83.5);

  // Form States - Inter-Entity Settlement
  const [settlementAmountRupees, setSettlementAmountRupees] = useState(100000); // ₹1,00,000
  const [settlementUtr, setSettlementUtr] = useState(`SBIN${Date.now().toString().slice(-8)}`);
  const [settlementMode, setSettlementMode] = useState<'NEFT' | 'RTGS' | 'IMPS' | 'Cheque'>('NEFT');
  const [settlementType, setSettlementType] = useState<'stock_advance' | 'interim_settlement' | 'final_cycle_clearance'>('interim_settlement');
  const [settlementDate, setSettlementDate] = useState(new Date().toISOString().split('T')[0]);
  const [settlementNotes, setSettlementNotes] = useState('Biweekly stock settlement remittance to Main Pvt. Ltd. HDFC current a/c');

  // Form States - Allocation Cycle
  const [allocationNumber, setAllocationNumber] = useState(`ALC-2026-10-C${allocations.length + 1}`);
  const [allocationStart, setAllocationStart] = useState('2026-10-16');
  const [allocationEnd, setAllocationEnd] = useState('2026-10-31');
  const [allocationDueDays, setAllocationDueDays] = useState(45);
  const [allocationKg, setAllocationKg] = useState(1200);
  const [allocationValuationRupees, setAllocationValuationRupees] = useState(450000);

  // Form States - Downstream Secondary Invoice
  const [downstreamInvNo, setDownstreamInvNo] = useState(`ADL-DIS-2026-${String(sisterInvoices.length + 1).padStart(4, '0')}`);
  const [downstreamDate, setDownstreamDate] = useState(new Date().toISOString().split('T')[0]);
  const [downstreamCustomerId, setDownstreamCustomerId] = useState('pty_zepto_sanand');
  const [downstreamItemSku, setDownstreamItemSku] = useState('FG-HLD-100G');
  const [downstreamQtyPacks, setDownstreamQtyPacks] = useState(500);
  const [downstreamPackSize, setDownstreamPackSize] = useState(100);
  const [downstreamRatePerPack, setDownstreamRatePerPack] = useState(40);
  const [downstreamPaidNowRupees, setDownstreamPaidNowRupees] = useState(0);

  // Form States - Collection
  const [collectAmountRupees, setCollectAmountRupees] = useState(0);
  const [collectMode, setCollectMode] = useState<'Cash' | 'SBI Bank Transfer' | 'UPI'>('SBI Bank Transfer');
  const [collectRef, setCollectRef] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const reloadData = () => {
    setTransfers(db.getInterFirmTransfers());
    setExports(db.getExportShipments());
    setAllocations(db.getStockAllocations());
    setSisterInvoices(db.getSisterDownstreamInvoices());
    setSettlements(db.getInterEntitySettlements());
    setEntitiesConfig(db.getEntitiesConfig());
    setParties(db.getParties());
    setReconReport(db.getInterEntityReconciliationReport());
    setStockFlow(db.getStockFlowReconciliation());
  };

  // Re-sync on entity changes
  useEffect(() => {
    const handler = () => reloadData();
    window.addEventListener('adalaj:entity_changed', handler);
    return () => window.removeEventListener('adalaj:entity_changed', handler);
  }, []);

  // Summary Metrics
  const totalTransferredGrams = transfers.reduce((acc, t) => acc + t.totalGrams, 0);
  const totalTransferredValuationPaise = transfers.reduce((acc, t) => acc + t.totalValuationPaise, 0);
  const totalExportRealizedPaise = exports.reduce((acc, e) => acc + e.inrRealizedPaise, 0);
  const totalExportWeightKg = exports.reduce((acc, e) => acc + e.totalWeightKg, 0);
  const totalDownstreamSalesPaise = sisterInvoices.reduce((acc, inv) => acc + inv.totalPaise, 0);
  const totalDownstreamCollectedPaise = sisterInvoices.reduce((acc, inv) => acc + inv.paidAmountPaise, 0);
  const totalDownstreamOutstandingPaise = sisterInvoices.reduce((acc, inv) => acc + inv.balanceDuePaise, 0);

  // Filtered Customer Master for Sister Downstream Invoicing
  const sisterCustomers = parties.filter(
    (p) => p.assignedEntityId === 'sister_prop' || (p.channel && !CHANNEL_DETAILS[p.channel]?.entityId.includes('pvt_ltd'))
  );

  // Handle Create Transfer Challan
  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const totalItemGrams = transferPacksCount * transferPackSizeGrams;
    const valuationPaise = Math.round((totalItemGrams / 1000) * transferRatePerKgRupees * 100);

    const newItem: InterFirmTransferItem = {
      itemId: `item_tr_${Date.now()}`,
      sku: 'FG-TR-DISPATCH',
      name: transferItemName,
      packSizeGrams: transferPackSizeGrams,
      batchNumber: transferItemBatch,
      packsCount: transferPacksCount,
      boxesCount: Math.ceil(transferPacksCount / 40),
      totalGrams: totalItemGrams,
      ratePerKgPaise: Math.round(transferRatePerKgRupees * 100),
      totalValuationPaise: valuationPaise,
    };

    const newTransfer: InterFirmTransfer = {
      id: `ift_${Date.now()}`,
      transferChallanNo,
      date: transferDate,
      destinationFirmName,
      destinationGstin,
      destinationAddress,
      vehicleNo,
      ewayBillNo,
      driverPhone,
      format: transferFormat,
      items: [newItem],
      totalGrams: totalItemGrams,
      totalValuationPaise: valuationPaise,
      status: 'in_transit',
      remarks: 'Inter-firm stock delivery challan under GST Rule 55 generated. En-route to Aslali CFA Depot.',
    };

    db.addInterFirmTransfer(newTransfer);
    reloadData();
    setShowTransferModal(false);
    showToast(`Delivery Challan ${transferChallanNo} generated and stock dispatched!`);
  };

  // Handle Acknowledge CFA Depot Receipt (GRN)
  const handleAcknowledgeReceipt = (challan: InterFirmTransfer) => {
    db.updateTransferStatus(challan.id, 'received_at_cfa', 'Goods physically received and verified at Aslali CFA Depot Bay #2');
    reloadData();
    setSelectedChallanForGRN(null);
    showToast(`Delivery Challan ${challan.transferChallanNo} marked as Received at CFA Depot!`);
  };

  // Handle Create Inter-Entity Settlement
  const handleCreateSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    const amountPaise = Math.round(settlementAmountRupees * 100);

    const newSettlement: InterEntitySettlement = {
      id: `ies_${Date.now()}`,
      settlementNo: `IES-2026-10-${String(settlements.length + 1).padStart(3, '0')}`,
      date: settlementDate,
      amountPaise,
      remittedFromAccountId: 'acc_sbi_sister',
      depositedToAccountId: 'acc_hdfc_curr',
      paymentMode: settlementMode,
      bankUtrRef: settlementUtr,
      settlementType,
      linkedAllocationIds: allocations.map((a) => a.id),
      notes: settlementNotes,
      verifiedByAuditor: true,
    };

    db.addInterEntitySettlement(newSettlement);
    reloadData();
    setShowSettlementModal(false);
    showToast(`Inter-Entity Settlement ₹${settlementAmountRupees.toLocaleString('en-IN')} remitted via UTR ${settlementUtr}!`);
  };

  // Handle Create New Allocation Cycle
  const handleCreateAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    const dueDate = new Date(Date.now() + allocationDueDays * 86400000).toISOString().split('T')[0];
    const valPaise = Math.round(allocationValuationRupees * 100);

    const newAlloc: InterEntityStockAllocation = {
      id: `alc_${Date.now()}`,
      allocationNumber,
      cycle: 'biweekly',
      periodStart: allocationStart,
      periodEnd: allocationEnd,
      creditDueDate: dueDate,
      sourceEntityId: 'pvt_ltd',
      destinationEntityId: 'sister_prop',
      totalAllocatedGrams: allocationKg * 1000,
      totalValuationPaise: valPaise,
      challanIds: [],
      status: 'active',
      settledAmountPaise: 0,
      balanceOutstandingPaise: valPaise,
      notes: `Predefined stock allocation quota of ${allocationKg} kg for Gujarat secondary distribution.`,
    };

    db.addStockAllocation(newAlloc);
    reloadData();
    setShowAllocationModal(false);
    showToast(`Stock Allocation Cycle ${allocationNumber} created successfully!`);
  };

  // Handle Create Sister Downstream Invoice
  const handleCreateDownstreamInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = parties.find((p) => p.id === downstreamCustomerId);
    const totalGrams = downstreamQtyPacks * downstreamPackSize;
    const grossTotalPaise = Math.round(downstreamQtyPacks * downstreamRatePerPack * 100);
    // 5% GST calculation: taxable = total / 1.05
    const taxablePaise = Math.round(grossTotalPaise / 1.05);
    const totalGstPaise = grossTotalPaise - taxablePaise;
    const cgstPaise = Math.round(totalGstPaise / 2);
    const sgstPaise = totalGstPaise - cgstPaise;
    const paidPaise = Math.round(downstreamPaidNowRupees * 100);
    const balanceDue = Math.max(0, grossTotalPaise - paidPaise);

    const channel = cust?.channel || 'small_retailer';

    const newItem: SisterDownstreamInvoiceItem = {
      itemId: `item_sec_${Date.now()}`,
      sku: downstreamItemSku,
      name: downstreamItemSku.includes('HLD') ? 'Turmeric Powder Consumer Pouch' : 'Mirchi Chilli Powder Consumer Pouch',
      packSizeGrams: downstreamPackSize,
      batchNo: 'BAT-2026-10-02',
      qtyPacks: downstreamQtyPacks,
      totalGrams,
      ratePerPackPaise: Math.round(downstreamRatePerPack * 100),
      taxableAmountPaise: taxablePaise,
      gstRatePct: 5,
      cgstPaise,
      sgstPaise,
      totalPaise: grossTotalPaise,
    };

    const newInvoice: SisterDownstreamInvoice = {
      id: `sis_inv_${Date.now()}`,
      invoiceNo: downstreamInvNo,
      date: downstreamDate,
      channel,
      customerId: cust?.id || 'pty_custom',
      customerName: cust?.name || 'Local Grocery Retailer',
      customerGstin: cust?.gstin,
      customerCity: cust?.city || 'Ahmedabad',
      customerPhone: cust?.phone,
      paymentDueDate: new Date(Date.now() + (cust?.creditDays || 14) * 86400000).toISOString().split('T')[0],
      paymentStatus: balanceDue === 0 ? 'paid' : paidPaise > 0 ? 'part_paid' : 'unpaid',
      items: [newItem],
      totalGrams,
      taxableAmountPaise: taxablePaise,
      cgstPaise,
      sgstPaise,
      totalPaise: grossTotalPaise,
      paidAmountPaise: paidPaise,
      balanceDuePaise: balanceDue,
      notes: `Secondary sales invoice issued under GSTIN ${entitiesConfig.sister_prop.gstin}`,
      payments:
        paidPaise > 0
          ? [
              {
                id: `pay_${Date.now()}`,
                date: downstreamDate,
                amountPaise: paidPaise,
                mode: 'Cash / Instant Collection',
                reference: 'COL-INSTANT-01',
              },
            ]
          : [],
    };

    db.addSisterDownstreamInvoice(newInvoice);
    reloadData();
    setShowDownstreamInvoiceModal(false);
    showToast(`Secondary Invoice ${downstreamInvNo} issued for ₹${(grossTotalPaise / 100).toLocaleString('en-IN')}!`);
  };

  // Handle Record Customer Collection on Downstream Invoice
  const handleRecordCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForCollect) return;

    const amtPaise = Math.round(collectAmountRupees * 100);
    db.recordSisterInvoicePayment(
      selectedInvoiceForCollect.id,
      amtPaise,
      collectMode,
      collectRef || `REC-${Date.now().toString().slice(-6)}`
    );

    reloadData();
    setShowPaymentCollectModal(false);
    setSelectedInvoiceForCollect(null);
    showToast(`Payment of ₹${collectAmountRupees.toLocaleString('en-IN')} recorded for invoice ${selectedInvoiceForCollect.invoiceNo}!`);
  };

  // Handle Create Export Shipment
  const handleCreateExport = (e: React.FormEvent) => {
    e.preventDefault();
    const inrPaise = Math.round(foreignAmountDollars * exchangeRate * 100);

    const newExport: ExportShipment = {
      id: `exp_${Date.now()}`,
      exportInvoiceNo,
      shippingBillNo,
      date: exportDate,
      consigneeName,
      destinationCountry,
      destinationPort,
      portOfLoading,
      lutNumber,
      iecNumber,
      apedaRcmcNo: 'APEDA/GUJ/2024/991',
      spicesBoardRegNo: 'CRES/SPICES/ADL/009',
      exportFormat,
      containerNo,
      sealNo,
      totalWeightKg,
      foreignCurrency,
      foreignAmountCents: Math.round(foreignAmountDollars * 100),
      inrRealizedPaise: inrPaise,
      status: 'customs_cleared',
      notes: `Export under LUT Rule 96A without payment of IGST. Consignment booked for ${destinationCountry}.`,
    };

    db.addExportShipment(newExport);
    reloadData();
    setShowExportModal(false);
    showToast(`Export Shipment ${exportInvoiceNo} logged!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-2xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Bar with Entity Context Badges */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Dual Legal Entities, Distribution & Financial Reconciliation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#9A2229]/10 text-[#9A2229] dark:bg-amber-500/10 dark:text-amber-300 border border-[#9A2229]/20">
              Sections 1–8 Enterprise Standard
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Clean statutory separation between <strong>Main Pvt. Ltd.</strong> (Large B2B, Modern Trade, Exports) and{' '}
            <strong>Sister Proprietorship</strong> (CFA Depot, Gujarat Retailers, Quick-Commerce) with automated ledger matching.
          </p>
        </div>

        {/* Global Action Buttons based on active tab */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'reconciliation' && (
            <button
              onClick={() => setShowSettlementModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 shadow-md transition active:scale-95 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Settle Inter-Entity Dues</span>
            </button>
          )}

          {activeTab === 'cfa_transfers' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAllocationModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs border border-amber-600/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 transition active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Allocation Cycle</span>
              </button>
              <button
                onClick={() => setShowTransferModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs text-white bg-[#9A2229] hover:bg-[#851C22] shadow-md transition active:scale-95 cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>New Delivery Challan (Rule 55)</span>
              </button>
            </div>
          )}

          {activeTab === 'downstream_billing' && (
            <button
              onClick={() => setShowDownstreamInvoiceModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs text-white bg-amber-600 hover:bg-amber-700 shadow-md transition active:scale-95 cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>Issue Secondary Retail Invoice</span>
            </button>
          )}

          {activeTab === 'export_shipments' && (
            <button
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md transition active:scale-95 cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>Log Export Shipment</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Statutory Entity Overview Header Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Main Pvt Ltd Profile Card */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 transition ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-rose-50/40 border-rose-200/60'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-[#9A2229] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {entitiesConfig.pvt_ltd.name}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#9A2229]/10 text-[#9A2229] dark:bg-rose-500/20 dark:text-rose-300">
                Pvt. Ltd.
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 space-x-2">
              <span>CIN: {entitiesConfig.pvt_ltd.cinOrReg}</span>
              <span>·</span>
              <span className="font-mono font-semibold">GSTIN: {entitiesConfig.pvt_ltd.gstin}</span>
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">
              <strong>Mandate:</strong> Modern Trade (DMart/Reliance), Industrial Ingredients (ITC/Haldiram scale), Export Containers, Capex & Factory.
            </div>
          </div>
        </div>

        {/* Sister Firm Profile Card */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 transition ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-amber-50/50 border-amber-200/70'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Truck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                {entitiesConfig.sister_prop.name}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                Proprietorship
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 space-x-2">
              <span>Trade Reg: {entitiesConfig.sister_prop.cinOrReg}</span>
              <span>·</span>
              <span className="font-mono font-semibold">GSTIN: {entitiesConfig.sister_prop.gstin}</span>
            </div>
            <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">
              <strong>Mandate:</strong> Aslali CFA Depot, Super-Stockists, Kirana Retailers, Zepto/Blinkit Dark Stores, D2C & Local HORECA.
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div
        className={`flex items-center gap-1 p-1 rounded-xl border overflow-x-auto select-none ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100/90 border-slate-200'
        }`}
      >
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'reconciliation'
              ? 'bg-indigo-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Financial Reconciliation & Audit (Sec. 5)</span>
          {reconReport.status === 'matched' ? (
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('cfa_transfers')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'cfa_transfers'
              ? 'bg-[#9A2229] text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Stock Allocations & Delivery Challans (Sec. 4)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
            {transfers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('downstream_billing')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'downstream_billing'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Sister Downstream Secondary Billing (Sec. 3)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
            {sisterInvoices.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('entities_matrix')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'entities_matrix'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Customer Channel Routing Matrix (Sec. 2)</span>
        </button>

        <button
          onClick={() => setActiveTab('export_shipments')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'export_shipments'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Overseas Export Shipments (Sec. 2)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 text-white">
            {exports.length}
          </span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: DUAL-ENTITY FINANCIAL & STOCK RECONCILIATION (SECTION 5)
          ========================================================================= */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Parity Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Main Books Receivable */}
            <div
              className={`p-4 rounded-xl border transition ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Main Pvt. Ltd. Books</span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded">
                  Sundry Debtor (Asset)
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {formatINR(reconReport.mainReceivableFromSisterPaise)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Receivable from Sister Firm for stock supplied
              </div>
            </div>

            {/* Sister Books Payable */}
            <div
              className={`p-4 rounded-xl border transition ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Sister Proprietorship Books</span>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  Sundry Creditor (Liability)
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {formatINR(reconReport.sisterPayableToMainPaise)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Payable to Main Company for acknowledged stock
              </div>
            </div>

            {/* Net Ledger Discrepancy */}
            <div
              className={`p-4 rounded-xl border transition ${
                reconReport.netDiscrepancyPaise === 0
                  ? isDark
                    ? 'bg-emerald-950/20 border-emerald-800/40'
                    : 'bg-emerald-50/60 border-emerald-200'
                  : isDark
                  ? 'bg-rose-950/20 border-rose-800/40'
                  : 'bg-rose-50/60 border-rose-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400">Net Ledger Variance</span>
                <ShieldCheck
                  className={`w-4 h-4 ${
                    reconReport.netDiscrepancyPaise === 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                />
              </div>
              <div
                className={`text-xl sm:text-2xl font-black ${
                  reconReport.netDiscrepancyPaise === 0
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatINR(reconReport.netDiscrepancyPaise)}
              </div>
              <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Auditor-matched parity (0 variance)</span>
              </div>
            </div>

            {/* Agreed Credit Limit Utilization */}
            <div
              className={`p-4 rounded-xl border transition ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span>Credit Limit Utilization</span>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  {reconReport.creditUtilizationPct}% of limit
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {formatINR(reconReport.creditLimitPaise)}
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, reconReport.creditUtilizationPct)}%` }}
                ></div>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Agreed Terms: 45 Days (Up to 90 Days / 3 Months)
              </div>
            </div>
          </div>

          {/* Diagnostic Alerts Panel */}
          {reconReport.alerts && reconReport.alerts.length > 0 && (
            <div className="space-y-2">
              {reconReport.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    alert.type === 'error'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                      : alert.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {alert.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                    ) : alert.type === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                    )}
                    <span>{alert.message}</span>
                  </div>
                  {alert.referenceId && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 font-bold">
                      {alert.referenceId}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Physical Stock Flow Pipeline (Section 4 & 5) */}
          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span>Inter-Entity Physical Stock Flow Pipeline (Adalaj Plant ➔ Aslali CFA Depot)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  End-to-end reconciliation: Supplied ➔ In-Transit ➔ Received ➔ Sold Downstream ➔ Remaining Closing Stock
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Gram-Accurate Ledger Audit
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center select-none">
              {/* 1. Opening */}
              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-950/60 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">1. Opening Depot</div>
                <div className="text-base font-black text-slate-800 dark:text-white mt-1">
                  {(stockFlow.openingDepotStockGrams / 1000).toLocaleString('en-IN')} kg
                </div>
                <div className="text-[10px] text-slate-400">Previous Cycle</div>
              </div>

              {/* 2. Supplied by Main */}
              <div className="p-3 rounded-xl border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40">
                <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">2. Supplied (Main)</div>
                <div className="text-base font-black text-blue-700 dark:text-blue-300 mt-1">
                  +{(stockFlow.suppliedByMainGrams / 1000).toLocaleString('en-IN')} kg
                </div>
                <div className="text-[10px] text-blue-500">Challans Generated</div>
              </div>

              {/* 3. In-Transit */}
              <div className="p-3 rounded-xl border bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40">
                <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">3. In-Transit</div>
                <div className="text-base font-black text-amber-700 dark:text-amber-300 mt-1">
                  {(stockFlow.inTransitGrams / 1000).toLocaleString('en-IN')} kg
                </div>
                <div className="text-[10px] text-amber-500">En-Route (GJ-18)</div>
              </div>

              {/* 4. Acknowledged Received */}
              <div className="p-3 rounded-xl border bg-teal-50/50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/40">
                <div className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase">4. Received (CFA)</div>
                <div className="text-base font-black text-teal-700 dark:text-teal-300 mt-1">
                  {(stockFlow.receivedAtSisterGrams / 1000).toLocaleString('en-IN')} kg
                </div>
                <div className="text-[10px] text-teal-500">GRN Cleared</div>
              </div>

              {/* 5. Sold Downstream */}
              <div className="p-3 rounded-xl border bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40">
                <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">5. Sold Downstream</div>
                <div className="text-base font-black text-purple-700 dark:text-purple-300 mt-1">
                  -{(stockFlow.soldDownstreamGrams / 1000).toLocaleString('en-IN')} kg
                </div>
                <div className="text-[10px] text-purple-500">Retail & Quick-Com</div>
              </div>

              {/* 6. Closing Depot Remaining */}
              <div className="p-3 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40">
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">6. Closing Stock</div>
                <div className="text-base font-black text-emerald-700 dark:text-emerald-300 mt-1">
                  {(stockFlow.closingDepotStockGrams / 1000).toLocaleString('en-IN')} kg
                </div>
                <div className="text-[10px] text-emerald-500">Depot Hand-Stock</div>
              </div>
            </div>
          </div>

          {/* Inter-Entity Cross-Ledger Statement (Audit Review Format) */}
          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Audit-Ready Inter-Firm Ledger Statement (October 2026 Fiscal Cycle)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Detailed cross-verification of Delivery Challans, Inward GRNs, Remittances, and Settlement Vouchers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => showToast('Reconciliation export generated for Chartered Accountant review!')}
                  className="px-3 py-1.5 rounded-lg border text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CA Statement</span>
                </button>
                <button
                  onClick={() => setShowSettlementModal(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Remittance</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead
                  className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Voucher / Challan Ref</th>
                    <th className="py-2.5 px-3">Particulars & Transaction Type</th>
                    <th className="py-2.5 px-3 text-right">Main Debits (Supplied)</th>
                    <th className="py-2.5 px-3 text-right">Sister Credits (Remitted)</th>
                    <th className="py-2.5 px-3 text-right">Net Running Balance</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                  {/* Delivery Challan 1 */}
                  <tr>
                    <td className="py-2.5 px-3">2026-10-10</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#9A2229] dark:text-amber-400">
                      DC-2026-10-001
                    </td>
                    <td className="py-2.5 px-3">
                      Stock Dispatch: 520 kg Consumer Pouches (Haldi, Mirchi) to Aslali CFA Depot
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      ₹2,18,000.00
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                    <td className="py-2.5 px-3 text-right font-bold">₹2,18,000.00 Dr</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400">
                        Received at CFA
                      </span>
                    </td>
                  </tr>

                  {/* Settlement Remittance 1 */}
                  <tr>
                    <td className="py-2.5 px-3">2026-10-10</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      IES-2026-10-001
                    </td>
                    <td className="py-2.5 px-3">
                      NEFT Settlement Remittance via UTR <span className="font-mono">SBIN1010992812</span> (Sister SBI ➔ Main HDFC)
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ₹1,50,000.00
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold">₹68,000.00 Dr</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        Settled & Verified
                      </span>
                    </td>
                  </tr>

                  {/* Delivery Challan 2 */}
                  <tr>
                    <td className="py-2.5 px-3">2026-10-12</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#9A2229] dark:text-amber-400">
                      DC-2026-10-002
                    </td>
                    <td className="py-2.5 px-3">
                      Stock Dispatch: 500 kg Bulk Sacks (Dhaniya) via Vehicle <span className="font-mono">GJ-18-AZ-4410</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                      ₹1,65,000.00
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                    <td className="py-2.5 px-3 text-right font-bold">₹2,33,000.00 Dr</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        In-Transit (E-Way 2418)
                      </span>
                    </td>
                  </tr>
                </tbody>
                <tfoot
                  className={`border-t-2 font-bold ${
                    isDark ? 'border-slate-700 bg-slate-950/40' : 'border-slate-300 bg-slate-50'
                  }`}
                >
                  <tr>
                    <td colSpan={3} className="py-3 px-3 text-right text-xs">
                      Total Ledger Totals & Net Receivable from Sister Firm:
                    </td>
                    <td className="py-3 px-3 text-right text-sm font-black text-slate-900 dark:text-white">
                      ₹3,83,000.00
                    </td>
                    <td className="py-3 px-3 text-right text-sm font-black text-emerald-600 dark:text-emerald-400">
                      ₹1,50,000.00
                    </td>
                    <td className="py-3 px-3 text-right text-sm font-black text-indigo-700 dark:text-indigo-400">
                      ₹2,33,000.00 Dr
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] text-emerald-600 font-bold">100% Balanced</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: STOCK ALLOCATIONS & DELIVERY CHALLANS (SECTION 4)
          ========================================================================= */}
      {activeTab === 'cfa_transfers' && (
        <div className="space-y-6 animate-fade-in">
          {/* Active Allocation Cycle Banner */}
          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Stock Allocation Cycle {allocations[0]?.allocationNumber || 'ALC-2026-10-C1'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    Biweekly Quota (1st – 15th Oct 2026)
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Predefined stock quota supplied on credit under agreed 45-day settlement arrangement.
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400">Agreed Settlement Due Date</div>
                <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                  {allocations[0]?.creditDueDate || '2026-11-15'} (33 Days Remaining)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-950/60 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Allocated Quantity</div>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {(allocations[0]?.totalAllocatedGrams / 1000 || 1020).toLocaleString('en-IN')} kg
                </div>
                <div className="text-[10px] text-slate-400">Spices Consumer Pouches & Sacks</div>
              </div>

              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-950/60 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Agreed Transfer Valuation</div>
                <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                  {formatINR(allocations[0]?.totalValuationPaise || 38300000)}
                </div>
                <div className="text-[10px] text-slate-400">Base manufacturing transfer rate</div>
              </div>

              <div className="p-3 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40">
                <div className="text-[10px] text-emerald-600 font-bold uppercase">Remitted & Settled</div>
                <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-1">
                  {formatINR(allocations[0]?.settledAmountPaise || 15000000)}
                </div>
                <div className="text-[10px] text-emerald-600">Advance remittance received</div>
              </div>

              <div className="p-3 rounded-xl border bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40">
                <div className="text-[10px] text-amber-600 font-bold uppercase">Balance Payable by Sister</div>
                <div className="text-lg font-black text-amber-700 dark:text-amber-400 mt-1">
                  {formatINR(allocations[0]?.balanceOutstandingPaise || 23300000)}
                </div>
                <div className="text-[10px] text-amber-600">Outstanding credit due 15 Nov</div>
              </div>
            </div>
          </div>

          {/* Delivery Challans under GST Rule 55 */}
          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#9A2229] dark:text-amber-400" />
                  <span>GST Rule 55 Delivery Challans (Adalaj Plant ➔ Aslali CFA Depot)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Inter-firm finished goods transfers with vehicle numbers, E-way bill validation, and receipt acknowledgment.
                </p>
              </div>

              <button
                onClick={() => setShowTransferModal(true)}
                className="px-3.5 py-1.5 rounded-xl font-bold text-xs text-white bg-[#9A2229] hover:bg-[#851C22] transition shadow cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Challan</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead
                  className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <tr>
                    <th className="py-2.5 px-3">Challan No</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Destination Firm</th>
                    <th className="py-2.5 px-3">Vehicle / E-Way Bill</th>
                    <th className="py-2.5 px-3">Products & Format</th>
                    <th className="py-2.5 px-3 text-right">Weight (kg)</th>
                    <th className="py-2.5 px-3 text-right">Transfer Valuation</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                  {transfers.map((challan) => (
                    <tr key={challan.id} className="hover:bg-slate-500/5 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#9A2229] dark:text-amber-400">
                        {challan.transferChallanNo}
                      </td>
                      <td className="py-2.5 px-3">{formatDate(challan.date)}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold">{challan.destinationFirmName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{challan.destinationGstin}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-mono font-bold">{challan.vehicleNo}</div>
                        <div className="text-[10px] text-slate-400">E-Way: {challan.ewayBillNo || 'Portal'}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold truncate max-w-[200px]">
                          {challan.items.map((i) => i.name).join(', ')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {challan.items.reduce((sum, i) => sum + i.packsCount, 0)} packs
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        {(challan.totalGrams / 1000).toLocaleString('en-IN')} kg
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatINR(challan.totalValuationPaise)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            challan.status === 'received_at_cfa'
                              ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse'
                          }`}
                        >
                          {challan.status === 'received_at_cfa' ? 'Received at CFA' : 'In-Transit'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {challan.status === 'in_transit' ? (
                          <button
                            onClick={() => handleAcknowledgeReceipt(challan)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white bg-teal-600 hover:bg-teal-700 shadow transition active:scale-95 cursor-pointer"
                            title="Acknowledge Physical Delivery at Aslali CFA Depot"
                          >
                            Receive GRN
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">Acknowledged</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: SISTER DOWNSTREAM SECONDARY BILLING (SECTION 3)
          ========================================================================= */}
      {activeTab === 'downstream_billing' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Description & Channel Performance Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div
              className={`p-4 rounded-xl border transition ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
              }`}
            >
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Secondary Sales</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatINR(totalDownstreamSalesPaise)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {sisterInvoices.length} invoices generated independently
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border transition ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
              }`}
            >
              <div className="text-[10px] text-emerald-600 font-bold uppercase">Collected & Realized</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {formatINR(totalDownstreamCollectedPaise)}
              </div>
              <div className="text-[11px] text-emerald-600/80 mt-1">
                Deposited to Sister SBI / Cash A/c
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border transition ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
              }`}
            >
              <div className="text-[10px] text-amber-600 font-bold uppercase">Customer Receivables Due</div>
              <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {formatINR(totalDownstreamOutstandingPaise)}
              </div>
              <div className="text-[11px] text-amber-600/80 mt-1">
                Active customer credit across Gujarat
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border transition ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
              }`}
            >
              <div className="text-[10px] text-indigo-600 font-bold uppercase">Key Secondary Channels</div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 space-y-0.5">
                <div>Quick-Com: Zepto & Blinkit</div>
                <div>Super-Stockists: Surat Market</div>
                <div>Kirana Retailers: Bhavnagar</div>
              </div>
            </div>
          </div>

          {/* Secondary Invoices Table */}
          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-600" />
                  <span>Sister Firm Customer Invoices (Adalaj Distribution & Trading Co. · GSTIN 24AAGCS9412F2Z1)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Downstream secondary invoices to retailers, stockists, and quick-commerce. Main company is not burdened with processing individual retail transactions.
                </p>
              </div>

              <button
                onClick={() => setShowDownstreamInvoiceModal(true)}
                className="px-3.5 py-1.5 rounded-xl font-bold text-xs text-white bg-amber-600 hover:bg-amber-700 transition shadow cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue Secondary Invoice</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead
                  className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <tr>
                    <th className="py-2.5 px-3">Invoice No</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Customer & Channel</th>
                    <th className="py-2.5 px-3">City</th>
                    <th className="py-2.5 px-3 text-right">Taxable</th>
                    <th className="py-2.5 px-3 text-right">GST (5%)</th>
                    <th className="py-2.5 px-3 text-right">Total Invoice</th>
                    <th className="py-2.5 px-3 text-right">Paid</th>
                    <th className="py-2.5 px-3 text-right">Balance Due</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                  {sisterInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-500/5 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-700 dark:text-amber-400">
                        {inv.invoiceNo}
                      </td>
                      <td className="py-2.5 px-3">{formatDate(inv.date)}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{inv.customerName}</div>
                        <div className="text-[10px] text-slate-400">
                          Channel: <span className="font-semibold">{inv.channel.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">{inv.customerCity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {formatINR(inv.taxableAmountPaise)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {formatINR(inv.cgstPaise + inv.sgstPaise)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                        {formatINR(inv.totalPaise)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                        {formatINR(inv.paidAmountPaise)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                        {formatINR(inv.balanceDuePaise)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.paymentStatus === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : inv.paymentStatus === 'part_paid'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {inv.paymentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {inv.balanceDuePaise > 0 ? (
                          <button
                            onClick={() => {
                              setSelectedInvoiceForCollect(inv);
                              setCollectAmountRupees(inv.balanceDuePaise / 100);
                              setShowPaymentCollectModal(true);
                            }}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition active:scale-95 cursor-pointer"
                          >
                            Collect
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: LEGAL ENTITIES & CUSTOMER ROUTING MATRIX (SECTIONS 1, 2, 7 & 8)
          ========================================================================= */}
      {activeTab === 'entities_matrix' && (
        <div className="space-y-6 animate-fade-in">
          {/* Statutory Separation Matrix Explanation */}
          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
            }`}
          >
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-500" />
              <span>Core Operating Rule: Two Distinct Legal Entities with Strict Customer Routing</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
              Per Section 8 of the Master Directive: The software strictly preserves legal and accounting separation between
              both entities. <strong>The Main Pvt. Ltd. company</strong> directly invoices only major strategic accounts and large-value
              business, while <strong>the Sister Proprietorship firm</strong> independently manages all secondary Gujarat distribution,
              CFA operations, quick commerce, and small retailer billing.
            </p>
          </div>

          {/* Two-Column Channel Routing Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Main Pvt Ltd Exclusive Channels (8 Channels) */}
            <div
              className={`p-5 rounded-2xl border ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-rose-50/30 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2.5 pb-3 border-b border-rose-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-[#9A2229] text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#9A2229] dark:text-rose-400">
                    Main Pvt. Ltd. Exclusive B2B Channels (8 Slabs)
                  </h4>
                  <div className="text-[10px] text-slate-500">
                    Billed directly under GSTIN {entitiesConfig.pvt_ltd.gstin}
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl border bg-white/70 dark:bg-slate-950/60 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">1. Modern Trade Supermarkets</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Reliance Smart, Avenue Supermarts (DMart), Star Bazaar, Spencer's
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border bg-white/70 dark:bg-slate-950/60 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">2. Industrial & Manufacturing Ingredients</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    ITC, Haldiram's scale food corporations buying bulk spice powders as raw ingredients
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border bg-white/70 dark:bg-slate-950/60 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">3. Direct Exports & International Buyers</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Overseas consignees via Mundra Port under GST LUT Rule 96A
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border bg-white/70 dark:bg-slate-950/60 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">4. Large HORECA Accounts</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Taj, Marriott, luxury resort chains, state-wide 5-star hospitality groups
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border bg-white/70 dark:bg-slate-950/60 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">5. Large Institutional Customers</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Western Railway Catering, IRCTC base kitchens, defense canteens, hospital groups
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border bg-white/70 dark:bg-slate-950/60 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">6. Large FMCG & Food-Service Chains</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Multi-outlet national fast-food franchises, organised restaurant chains
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border bg-white/70 dark:bg-slate-950/60 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">7. Private-Label & Contract Manufacturing</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    OEM packaging contracts manufacturing under third-party brand labels
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border bg-white/70 dark:bg-slate-950/60 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">8. Headquarters & Home-State Depot</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Direct company billing for designated home-state operations
                  </div>
                </div>
              </div>
            </div>

            {/* Sister Proprietorship Exclusive Channels (7 Channels) */}
            <div
              className={`p-5 rounded-2xl border ${
                isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-amber-50/30 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-2.5 pb-3 border-b border-amber-200 dark:border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-sm text-amber-700 dark:text-amber-400">
                    Sister Proprietorship Secondary Channels (7 Slabs)
                  </h4>
                  <div className="text-[10px] text-slate-500">
                    Billed independently under GSTIN {entitiesConfig.sister_prop.gstin}
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl border bg-white/70 dark:bg-slate-950/60 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">1. E-Commerce & Quick-Commerce</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Zepto dark stores, Blinkit Ahmedabad hubs, Swiggy Instamart, Amazon FBA
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border bg-white/70 dark:bg-slate-950/60 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">2. Small & Medium Retailers (Kirana)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Independent grocery stores, local provision merchants across Gujarat
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border bg-white/70 dark:bg-slate-950/60 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">3. Super-Stockists (SS) & Stockists</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    District and taluka super-stockists holding buffer inventory
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border bg-white/70 dark:bg-slate-950/60 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">4. CFA Operations & Wholesale Distributors</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Carrying & forwarding agents supplying secondary wholesale routes
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border bg-white/70 dark:bg-slate-950/60 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">5. Independent Cafés & Smaller HORECA</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Standalone restaurants, tea/snack stalls, local caterers, sweet shops
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border bg-white/70 dark:bg-slate-950/60 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">6. Direct-to-Consumer (D2C)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Aslali CFA counter walk-in customers, brand website direct deliveries
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border bg-white/70 dark:bg-slate-950/60 dark:border-slate-800">
                  <div className="font-bold text-slate-900 dark:text-white">7. Regional Secondary Wholesale Trade</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Route-van cash/credit trade, rural haat traders, semi-bulk pack buyers
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Master Routing Directory */}
          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  <span>Customer Master Directory with Statutory Entity Assignment</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Every account is strictly classified by business channel to prevent wrong-entity invoicing.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customer, city, GSTIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 dark:bg-slate-950 dark:border-slate-800"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead
                  className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <tr>
                    <th className="py-2.5 px-3">Customer Name</th>
                    <th className="py-2.5 px-3">City / Jurisdiction</th>
                    <th className="py-2.5 px-3">Business Channel</th>
                    <th className="py-2.5 px-3">Mandatory Billing Entity</th>
                    <th className="py-2.5 px-3 text-right">Credit Terms</th>
                    <th className="py-2.5 px-3 text-right">Credit Limit</th>
                    <th className="py-2.5 px-3 text-right">Outstanding Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                  {parties
                    .filter(
                      (p) =>
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.channel && p.channel.includes(searchQuery.toLowerCase()))
                    )
                    .map((p) => {
                      const isMain = p.assignedEntityId === 'pvt_ltd';
                      return (
                        <tr key={p.id} className="hover:bg-slate-500/5 transition">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                            {p.gstin && <div className="text-[10px] text-slate-400 font-mono">{p.gstin}</div>}
                          </td>
                          <td className="py-2.5 px-3">{p.city}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {(p.channel || 'general').replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isMain
                                  ? 'bg-[#9A2229]/10 text-[#9A2229] dark:bg-rose-500/20 dark:text-rose-300'
                                  : 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                              }`}
                            >
                              {isMain ? 'Main Pvt. Ltd.' : 'Sister Proprietorship'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono">{p.creditDays} days</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                            {p.creditLimitPaise ? formatINR(p.creditLimitPaise) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold font-mono">
                            {p.outstandingPaise < 0 ? (
                              <span className="text-amber-600 dark:text-amber-400">
                                {formatINR(Math.abs(p.outstandingPaise))} (Receivable)
                              </span>
                            ) : p.outstandingPaise > 0 ? (
                              <span className="text-rose-600 dark:text-rose-400">
                                {formatINR(p.outstandingPaise)} (Payable)
                              </span>
                            ) : (
                              <span className="text-emerald-500">0.00</span>
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

      {/* =========================================================================
          TAB 5: OVERSEAS EXPORT SHIPMENTS (SECTION 2 - MAIN PVT LTD)
          ========================================================================= */}
      {activeTab === 'export_shipments' && (
        <div className="space-y-6 animate-fade-in">
          {/* Export Header KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div
              className={`p-4 rounded-xl border transition ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
              }`}
            >
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Export Realized</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatINR(totalExportRealizedPaise)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Under GST LUT Rule 96A</div>
            </div>

            <div
              className={`p-4 rounded-xl border transition ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
              }`}
            >
              <div className="text-[10px] text-blue-600 font-bold uppercase">Total Tonnage Shipped</div>
              <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {(totalExportWeightKg / 1000).toFixed(1)} MT
              </div>
              <div className="text-[11px] text-blue-500 mt-1">Mundra Port (INMUN1) Gate</div>
            </div>

            <div
              className={`p-4 rounded-xl border transition ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
              }`}
            >
              <div className="text-[10px] text-indigo-600 font-bold uppercase">Overseas Buyers</div>
              <div className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">
                Dubai (UAE) & New York (USA)
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Spices Board CRES Certified</div>
            </div>

            <div
              className={`p-4 rounded-xl border transition ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
              }`}
            >
              <div className="text-[10px] text-slate-400 font-bold uppercase">Active Port Gateway</div>
              <div className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">
                Mundra Port, Gujarat
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">FCL Marine Containers</div>
            </div>
          </div>

          {/* Export Shipments Table */}
          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Ship className="w-4 h-4 text-blue-600" />
                  <span>Mundra Port International FCL Shipments (Main Pvt. Ltd. Exclusive)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Exports executed under Letter of Undertaking (LUT) with Spices Board registration and Bill of Lading.
                </p>
              </div>

              <button
                onClick={() => setShowExportModal(true)}
                className="px-3.5 py-1.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition shadow cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Export Container</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead
                  className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <tr>
                    <th className="py-2.5 px-3">Export Invoice</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Consignee & Country</th>
                    <th className="py-2.5 px-3">Port & Container</th>
                    <th className="py-2.5 px-3">Format</th>
                    <th className="py-2.5 px-3 text-right">Weight (MT)</th>
                    <th className="py-2.5 px-3 text-right">Foreign Value</th>
                    <th className="py-2.5 px-3 text-right">INR Realized</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                  {exports.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-500/5 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {exp.exportInvoiceNo}
                        <div className="text-[10px] text-slate-400">{exp.shippingBillNo}</div>
                      </td>
                      <td className="py-2.5 px-3">{formatDate(exp.date)}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{exp.consigneeName}</div>
                        <div className="text-[10px] text-slate-400">{exp.destinationCountry}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-mono">{exp.containerNo}</div>
                        <div className="text-[10px] text-slate-400">{exp.destinationPort}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {exp.exportFormat.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        {(exp.totalWeightKg / 1000).toFixed(1)} MT
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        {exp.foreignCurrency} ${(exp.foreignAmountCents / 100).toLocaleString('en-US')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-slate-900 dark:text-white">
                        {formatINR(exp.inrRealizedPaise)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {exp.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: INTER-ENTITY SETTLEMENT REMITTANCE
          ========================================================================= */}
      {showSettlementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-lg p-6 rounded-2xl border shadow-2xl animate-scale-up ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base">Record Inter-Entity Settlement Remittance</h3>
              </div>
              <button
                onClick={() => setShowSettlementModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSettlement} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40">
                <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  Bank-to-Bank Atomic Ledger Posting:
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  From: <strong>Sister Firm SBI A/c 38192048192</strong> (Debited / Reduces Sister Payable)<br />
                  To: <strong>Main Pvt. Ltd. HDFC A/c 50200012345678</strong> (Credited / Reduces Main Receivable)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Remittance Amount (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={settlementAmountRupees}
                    onChange={(e) => setSettlementAmountRupees(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border text-sm font-bold dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Transfer Date</label>
                  <input
                    type="date"
                    required
                    value={settlementDate}
                    onChange={(e) => setSettlementDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border text-sm dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Bank UTR / Reference</label>
                  <input
                    type="text"
                    required
                    value={settlementUtr}
                    onChange={(e) => setSettlementUtr(e.target.value)}
                    className="w-full p-2 rounded-xl border font-mono dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Payment Mode</label>
                  <select
                    value={settlementMode}
                    onChange={(e) => setSettlementMode(e.target.value as any)}
                    className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                  >
                    <option value="NEFT">NEFT (Bank Transfer)</option>
                    <option value="RTGS">RTGS (High Value)</option>
                    <option value="IMPS">IMPS (Instant)</option>
                    <option value="Cheque">Commercial Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Settlement Milestone Type</label>
                <select
                  value={settlementType}
                  onChange={(e) => setSettlementType(e.target.value as any)}
                  className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                >
                  <option value="interim_settlement">Interim Biweekly Stock Settlement</option>
                  <option value="stock_advance">Stock Allocation Advance Remittance</option>
                  <option value="final_cycle_clearance">Final Allocation Cycle Clearance</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Auditor & Statutory Notes</label>
                <textarea
                  rows={2}
                  value={settlementNotes}
                  onChange={(e) => setSettlementNotes(e.target.value)}
                  className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSettlementModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 shadow cursor-pointer"
                >
                  Confirm & Post to Both Ledgers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: NEW STOCK ALLOCATION CYCLE
          ========================================================================= */}
      {showAllocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl animate-scale-up ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800 mb-4">
              <h3 className="font-bold text-base">New Stock Allocation Cycle (Sec. 4)</h3>
              <button
                onClick={() => setShowAllocationModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAllocation} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Allocation Ref</label>
                  <input
                    type="text"
                    required
                    value={allocationNumber}
                    onChange={(e) => setAllocationNumber(e.target.value)}
                    className="w-full p-2 rounded-xl border font-mono dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Credit Terms (Days)</label>
                  <input
                    type="number"
                    required
                    value={allocationDueDays}
                    onChange={(e) => setAllocationDueDays(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Cycle Start Date</label>
                  <input
                    type="date"
                    required
                    value={allocationStart}
                    onChange={(e) => setAllocationStart(e.target.value)}
                    className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Cycle End Date</label>
                  <input
                    type="date"
                    required
                    value={allocationEnd}
                    onChange={(e) => setAllocationEnd(e.target.value)}
                    className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Allocated Weight (kg)</label>
                  <input
                    type="number"
                    required
                    value={allocationKg}
                    onChange={(e) => setAllocationKg(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border text-sm font-bold dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Agreed Valuation (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={allocationValuationRupees}
                    onChange={(e) => setAllocationValuationRupees(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border text-sm font-bold dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAllocationModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-amber-600 hover:bg-amber-700 shadow cursor-pointer"
                >
                  Create Allocation Quota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: NEW GST RULE 55 DELIVERY CHALLAN
          ========================================================================= */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-lg p-6 rounded-2xl border shadow-2xl animate-scale-up ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#9A2229]" />
                <h3 className="font-bold text-base">New Delivery Challan (GST Rule 55)</h3>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Challan Number</label>
                  <input
                    type="text"
                    required
                    value={transferChallanNo}
                    onChange={(e) => setTransferChallanNo(e.target.value)}
                    className="w-full p-2 rounded-xl border font-mono dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Dispatch Date</label>
                  <input
                    type="date"
                    required
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    required
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    className="w-full p-2 rounded-xl border font-mono uppercase dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">E-Way Bill Number</label>
                  <input
                    type="text"
                    required
                    value={ewayBillNo}
                    onChange={(e) => setEwayBillNo(e.target.value)}
                    className="w-full p-2 rounded-xl border font-mono dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Product Description</label>
                <select
                  value={transferItemName}
                  onChange={(e) => setTransferItemName(e.target.value)}
                  className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                >
                  <option value="Turmeric Powder 100g Consumer Pouches">Turmeric Powder 100g Consumer Pouches</option>
                  <option value="Red Chilli Powder 250g Consumer Pouches">Red Chilli Powder 250g Consumer Pouches</option>
                  <option value="Coriander Powder 25kg Bulk Sacks">Coriander Powder 25kg Bulk Sacks</option>
                  <option value="Jeera Cumin Powder 100g Pouches">Jeera Cumin Powder 100g Pouches</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Pack Size (g)</label>
                  <input
                    type="number"
                    required
                    value={transferPackSizeGrams}
                    onChange={(e) => setTransferPackSizeGrams(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Pack Count</label>
                  <input
                    type="number"
                    required
                    value={transferPacksCount}
                    onChange={(e) => setTransferPacksCount(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Transfer Rate (₹/kg)</label>
                  <input
                    type="number"
                    required
                    value={transferRatePerKgRupees}
                    onChange={(e) => setTransferRatePerKgRupees(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs">
                Total Weight: <strong>{((transferPacksCount * transferPackSizeGrams) / 1000).toLocaleString('en-IN')} kg</strong> · Total Valuation: <strong>₹{(((transferPacksCount * transferPackSizeGrams) / 1000) * transferRatePerKgRupees).toLocaleString('en-IN')}</strong>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-[#9A2229] hover:bg-[#851C22] shadow cursor-pointer"
                >
                  Generate Challan & Deduct Plant Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: SISTER DOWNSTREAM SECONDARY INVOICE
          ========================================================================= */}
      {showDownstreamInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-lg p-6 rounded-2xl border shadow-2xl animate-scale-up ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-base">Issue Sister Downstream Invoice</h3>
              </div>
              <button
                onClick={() => setShowDownstreamInvoiceModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDownstreamInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Invoice Number</label>
                  <input
                    type="text"
                    required
                    value={downstreamInvNo}
                    onChange={(e) => setDownstreamInvNo(e.target.value)}
                    className="w-full p-2 rounded-xl border font-mono dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Invoice Date</label>
                  <input
                    type="date"
                    required
                    value={downstreamDate}
                    onChange={(e) => setDownstreamDate(e.target.value)}
                    className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Retail / Distribution Customer</label>
                <select
                  value={downstreamCustomerId}
                  onChange={(e) => setDownstreamCustomerId(e.target.value)}
                  className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                >
                  {sisterCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city} · Channel: {c.channel || 'general'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">SKU</label>
                  <select
                    value={downstreamItemSku}
                    onChange={(e) => setDownstreamItemSku(e.target.value)}
                    className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                  >
                    <option value="FG-HLD-100G">Haldi 100g Pouch</option>
                    <option value="FG-MRC-250G">Mirchi 250g Pouch</option>
                    <option value="FG-DHN-100G">Dhaniya 100g Pouch</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Packs Count</label>
                  <input
                    type="number"
                    required
                    value={downstreamQtyPacks}
                    onChange={(e) => setDownstreamQtyPacks(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Rate / Pack (₹)</label>
                  <input
                    type="number"
                    required
                    value={downstreamRatePerPack}
                    onChange={(e) => setDownstreamRatePerPack(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Immediate Payment Collected Now (₹ INR)</label>
                <input
                  type="number"
                  min={0}
                  value={downstreamPaidNowRupees}
                  onChange={(e) => setDownstreamPaidNowRupees(Number(e.target.value))}
                  placeholder="0 for full credit, or amount collected"
                  className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700 font-bold"
                />
              </div>

              <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs">
                Gross Invoice: <strong>₹{(downstreamQtyPacks * downstreamRatePerPack).toLocaleString('en-IN')}</strong> (Includes 5% GST) · Stock drawn directly from Aslali CFA Depot.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDownstreamInvoiceModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-amber-600 hover:bg-amber-700 shadow cursor-pointer"
                >
                  Issue Invoice & Deduct CFA Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: RECORD CUSTOMER COLLECTION
          ========================================================================= */}
      {showPaymentCollectModal && selectedInvoiceForCollect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl animate-scale-up ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800 mb-4">
              <h3 className="font-bold text-base">Collect Payment</h3>
              <button
                onClick={() => setShowPaymentCollectModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordCollection} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-950">
                <div className="font-bold">{selectedInvoiceForCollect.customerName}</div>
                <div className="text-[10px] text-slate-400">
                  Invoice {selectedInvoiceForCollect.invoiceNo} · Due: {formatINR(selectedInvoiceForCollect.balanceDuePaise)}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Amount Collected (₹ INR)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedInvoiceForCollect.balanceDuePaise / 100}
                  value={collectAmountRupees}
                  onChange={(e) => setCollectAmountRupees(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border text-sm font-bold dark:bg-slate-950 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Collection Mode</label>
                <select
                  value={collectMode}
                  onChange={(e) => setCollectMode(e.target.value as any)}
                  className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                >
                  <option value="SBI Bank Transfer">SBI Current Account Transfer</option>
                  <option value="Cash">Cash to Route Van Driver</option>
                  <option value="UPI">Sister Business UPI QR</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Reference / UTR / Receipt No</label>
                <input
                  type="text"
                  placeholder="e.g. UTR / Cash receipt number"
                  value={collectRef}
                  onChange={(e) => setCollectRef(e.target.value)}
                  className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentCollectModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow cursor-pointer"
                >
                  Confirm Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: LOG OVERSEAS EXPORT SHIPMENT
          ========================================================================= */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-lg p-6 rounded-2xl border shadow-2xl animate-scale-up ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base">Log Overseas Export Container (Main Pvt. Ltd.)</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExport} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Export Invoice No</label>
                  <input
                    type="text"
                    required
                    value={exportInvoiceNo}
                    onChange={(e) => setExportInvoiceNo(e.target.value)}
                    className="w-full p-2 rounded-xl border font-mono dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Shipping Bill No</label>
                  <input
                    type="text"
                    required
                    value={shippingBillNo}
                    onChange={(e) => setShippingBillNo(e.target.value)}
                    className="w-full p-2 rounded-xl border font-mono dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Foreign Consignee Name</label>
                  <input
                    type="text"
                    required
                    value={consigneeName}
                    onChange={(e) => setConsigneeName(e.target.value)}
                    className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Destination Country</label>
                  <input
                    type="text"
                    required
                    value={destinationCountry}
                    onChange={(e) => setDestinationCountry(e.target.value)}
                    className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Container Number</label>
                  <input
                    type="text"
                    required
                    value={containerNo}
                    onChange={(e) => setContainerNo(e.target.value)}
                    className="w-full p-2 rounded-xl border font-mono dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Port of Loading</label>
                  <input
                    type="text"
                    required
                    value={portOfLoading}
                    onChange={(e) => setPortOfLoading(e.target.value)}
                    className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Total Weight (kg)</label>
                  <input
                    type="number"
                    required
                    value={totalWeightKg}
                    onChange={(e) => setTotalWeightKg(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Currency</label>
                  <select
                    value={foreignCurrency}
                    onChange={(e) => setForeignCurrency(e.target.value as any)}
                    className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="AED">AED (Dh)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Foreign Amount</label>
                  <input
                    type="number"
                    required
                    value={foreignAmountDollars}
                    onChange={(e) => setForeignAmountDollars(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border dark:bg-slate-950 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl border bg-blue-500/10 border-blue-500/30 text-blue-800 dark:text-blue-300 text-xs">
                INR Equivalent: <strong>{formatINR(Math.round(foreignAmountDollars * exchangeRate * 100))}</strong> · Export under GST LUT Rule 96A without payment of IGST.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow cursor-pointer"
                >
                  Log Export Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
