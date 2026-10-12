import React, { useState } from 'react';
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
} from '../../types';
import { formatINR, formatDate } from '../../lib/format';
import { useTheme } from '../../context/ThemeContext';

export const InterFirmAndExportModule: React.FC = () => {
  const { isDark } = useTheme();

  const [transfers, setTransfers] = useState<InterFirmTransfer[]>(db.getInterFirmTransfers());
  const [exports, setExports] = useState<ExportShipment[]>(db.getExportShipments());
  const [activeTab, setActiveTab] = useState<'cfa_transfers' | 'export_shipments' | 'export_licences'>('cfa_transfers');

  // New Transfer Modal state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferChallanNo, setTransferChallanNo] = useState(
    `DC-2026-10-${String(transfers.length + 1).padStart(3, '0')}`
  );
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [destinationFirmName, setDestinationFirmName] = useState('Adalaj Foods Distribution & CFA Depot');
  const [destinationGstin, setDestinationGstin] = useState('24AAGCS9412F2Z1');
  const [destinationAddress, setDestinationAddress] = useState(
    'Plot 14-B, Sardar Patel Ring Road Logistics Park, Aslali, Ahmedabad 382427'
  );
  const [vehicleNo, setVehicleNo] = useState('GJ-01-ET-8492');
  const [ewayBillNo, setEwayBillNo] = useState(`2418${Date.now().toString().slice(-8)}`);
  const [driverPhone, setDriverPhone] = useState('+91 98250 88123');
  const [transferFormat, setTransferFormat] = useState<TransferFormat>('mixed_assorted');
  const [itemName, setItemName] = useState('Turmeric Powder 100g Consumer Pouches');
  const [itemBatch, setItemBatch] = useState('BAT-2026-10-04');
  const [packsCount, setPacksCount] = useState(1000);
  const [packSizeGrams, setPackSizeGrams] = useState(100);
  const [ratePerKgRupees, setRatePerKgRupees] = useState(400);

  // New Export Shipment Modal state
  const [showExportModal, setShowExportModal] = useState(false);
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

  const reloadData = () => {
    setTransfers(db.getInterFirmTransfers());
    setExports(db.getExportShipments());
  };

  // Metrics
  const totalTransferredGrams = transfers.reduce((acc, t) => acc + t.totalGrams, 0);
  const totalTransferredValuationPaise = transfers.reduce((acc, t) => acc + t.totalValuationPaise, 0);
  const totalExportRealizedPaise = exports.reduce((acc, e) => acc + e.inrRealizedPaise, 0);
  const totalExportWeightKg = exports.reduce((acc, e) => acc + e.totalWeightKg, 0);

  // Handle Create Delivery Challan to CFA Depot
  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();

    const totalItemGrams = packsCount * packSizeGrams;
    const valuationPaise = Math.round((totalItemGrams / 1000) * ratePerKgRupees * 100);

    const newItem: InterFirmTransferItem = {
      itemId: `item_tr_${Date.now()}`,
      sku: 'FG-TR-DISPATCH',
      name: itemName,
      packSizeGrams,
      batchNumber: itemBatch,
      packsCount,
      boxesCount: Math.ceil(packsCount / 40),
      totalGrams: totalItemGrams,
      ratePerKgPaise: Math.round(ratePerKgRupees * 100),
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
      status: 'dispatched',
      remarks: 'Inter-firm stock delivery challan under GST Rule 55 generated.',
    };

    db.addInterFirmTransfer(newTransfer);
    reloadData();
    setShowTransferModal(false);
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
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Sister Concern CFA Depot & Exports
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#9A2229]/10 text-[#9A2229] dark:bg-amber-500/10 dark:text-amber-300 border border-[#9A2229]/20">
              Bulk & Retail Dispatches
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Finished goods transfers to Sister CFA Distribution Firm under GST Rule 55, plus LUT Overseas Export Shipments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'cfa_transfers' ? (
            <button
              onClick={() => setShowTransferModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-[#9A2229] hover:bg-[#851C22] shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>New CFA Transfer Challan</span>
            </button>
          ) : (
            <button
              onClick={() => setShowExportModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>Log Export Shipment</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          className={`p-4 rounded-xl border transition ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>CFA Depot Transfers</span>
            <Truck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatINR(totalTransferredValuationPaise)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {(totalTransferredGrams / 1000).toLocaleString('en-IN')} kg dispatched to CFA
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border transition ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Sister Concern Firm</span>
            <Building className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            Adalaj Foods Distribution
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-1">
            GSTIN: 24AAGCS9412F2Z1
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border transition ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Overseas Export Value</span>
            <Globe className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">
            {formatINR(totalExportRealizedPaise)}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400/80 mt-1">
            {(totalExportWeightKg / 1000).toFixed(1)} MT exported via Mundra Port
          </div>
        </div>

        <div
          className={`p-4 rounded-xl border transition ${
            isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Export Compliance Status</span>
            <ShieldCheck className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            LUT Active (Rule 96A)
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            IEC: 0819034291 · APEDA Reg
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('cfa_transfers')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'cfa_transfers'
              ? 'bg-[#9A2229] text-white'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Inter-Firm Transfers to CFA Depot ({transfers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('export_shipments')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'export_shipments'
              ? 'bg-[#9A2229] text-white'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Ship className="w-3.5 h-3.5" />
          <span>Export Shipments ({exports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('export_licences')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'export_licences'
              ? 'bg-[#9A2229] text-white'
              : isDark
              ? 'text-slate-400 hover:text-white'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Export Licences & Port Vault</span>
        </button>
      </div>

      {/* 4. Tab 1: Inter-Firm Transfers to CFA Depot */}
      {activeTab === 'cfa_transfers' && (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-xl border text-xs ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}
          >
            <div className="font-bold mb-1 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#9A2229] dark:text-amber-400" />
              <span>GST Rule 55 Delivery Challan Protocol</span>
            </div>
            <p>
              Adalaj Manufacturing Unit dispatches both bulk master sacks and retail consumer pouches to our sister firm <strong>Adalaj Foods Distribution & CFA Depot</strong> (Plot 14-B Aslali Logistics Hub). Goods move under statutory Delivery Challans with generated E-Way Bills.
            </p>
          </div>

          <div className="space-y-3">
            {transfers.map((tr) => (
              <div
                key={tr.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {tr.transferChallanNo}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          tr.status === 'received_at_cfa'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {tr.status === 'received_at_cfa' ? 'Received at CFA Depot' : 'In Transit'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 capitalize">
                        {tr.format.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      Destination: {tr.destinationFirmName}
                      <span className="ml-1.5 text-slate-400 font-mono text-[11px]">
                        ({tr.destinationGstin})
                      </span>
                    </div>
                  </div>

                  <div className="text-left lg:text-right">
                    <div className="text-xs text-slate-400">Transfer Valuation</div>
                    <div className="text-base font-black text-slate-900 dark:text-white">
                      {formatINR(tr.totalValuationPaise)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Total Weight: {(tr.totalGrams / 1000).toLocaleString('en-IN')} kg
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 py-3 text-xs border-b dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Transfer Date:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatDate(tr.date)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Vehicle Number:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {tr.vehicleNo}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">E-Way Bill No:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {tr.ewayBillNo || 'Generated on Portal'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Driver Contact:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {tr.driverPhone}
                    </span>
                  </div>
                </div>

                {/* Items list */}
                <div className="py-2 space-y-1.5">
                  {tr.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/40"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Package className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {it.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          (Batch: {it.batchNumber})
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-right flex-shrink-0">
                        <span className="text-slate-500">
                          {it.packsCount} packs ({it.boxesCount} shippers)
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatINR(it.totalValuationPaise)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 flex flex-wrap items-center justify-between gap-2 border-t dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 italic">
                    {tr.receivedByNotes || tr.remarks}
                  </div>

                  {tr.status !== 'received_at_cfa' && (
                    <button
                      onClick={() => {
                        db.updateTransferStatus(
                          tr.id,
                          'received_at_cfa',
                          'Received and verified by Aslali CFA Store In-Charge.'
                        );
                        reloadData();
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition cursor-pointer"
                    >
                      Acknowledge CFA Depot Receipt
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Tab 2: Export Shipments */}
      {activeTab === 'export_shipments' && (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-xl border text-xs ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-blue-50/70 border-blue-200 text-blue-900'
            }`}
          >
            <div className="font-bold mb-1 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>International Spice Export Operations</span>
            </div>
            <p>
              Direct overseas container dispatches from Mundra Port (INMUN1) under GST Letter of Undertaking (LUT Rule 96A). Covers bulk master sacks and retail pouch shipments with statutory shipping bills.
            </p>
          </div>

          <div className="space-y-3">
            {exports.map((exp) => (
              <div
                key={exp.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {exp.exportInvoiceNo}
                      </span>
                      <span className="font-mono text-xs text-slate-400">({exp.shippingBillNo})</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 capitalize">
                        {exp.status.replace(/_/g, ' ')}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 capitalize">
                        {exp.exportFormat.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                      Consignee: {exp.consigneeName} ({exp.destinationCountry})
                    </div>
                  </div>

                  <div className="text-left lg:text-right">
                    <div className="text-xs text-slate-400">Foreign Invoice Value</div>
                    <div className="text-base font-black text-blue-600 dark:text-blue-400">
                      ${(exp.foreignAmountCents / 100).toLocaleString('en-US')} {exp.foreignCurrency}
                    </div>
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white">
                      Realized: {formatINR(exp.inrRealizedPaise)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 text-xs border-b dark:border-slate-800 text-slate-600 dark:text-slate-400">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Port of Loading:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {exp.portOfLoading}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Destination Port:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {exp.destinationPort}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Container & Seal:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {exp.containerNo} (Seal: {exp.sealNo})
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Net Cargo Weight:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {(exp.totalWeightKg / 1000).toFixed(1)} MT ({exp.totalWeightKg.toLocaleString()} kg)
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{exp.notes}</span>
                  <span className="font-mono">LUT Reg: {exp.lutNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Tab 3: Export Licences & Port Vault */}
      {activeTab === 'export_licences' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                IEC
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Directorate General of Foreign Trade (DGFT)
                </h4>
                <p className="text-xs text-slate-400">Import Export Code (IEC License)</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b dark:border-slate-800">
                <span className="text-slate-400">IEC Number:</span>
                <span className="font-mono font-bold">0819034291</span>
              </div>
              <div className="flex justify-between py-1 border-b dark:border-slate-800">
                <span className="text-slate-400">Issuing Authority:</span>
                <span>DGFT Regional Authority, Ahmedabad</span>
              </div>
              <div className="flex justify-between py-1 border-b dark:border-slate-800">
                <span className="text-slate-400">Validity:</span>
                <span className="text-emerald-500 font-semibold">Lifetime (Annual DGFT KYC Valid)</span>
              </div>
            </div>
          </div>

          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                LUT
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  GST Letter of Undertaking (Rule 96A)
                </h4>
                <p className="text-xs text-slate-400">Zero-Rated Exports Without Payment of IGST</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b dark:border-slate-800">
                <span className="text-slate-400">LUT ARN Number:</span>
                <span className="font-mono font-bold">AD240326001928K</span>
              </div>
              <div className="flex justify-between py-1 border-b dark:border-slate-800">
                <span className="text-slate-400">Financial Year:</span>
                <span>2026-2027</span>
              </div>
              <div className="flex justify-between py-1 border-b dark:border-slate-800">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-500 font-semibold">Verified on GST Portal</span>
              </div>
            </div>
          </div>

          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                APEDA
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  APEDA Export Registration
                </h4>
                <p className="text-xs text-slate-400">Agricultural & Processed Food Products Export</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b dark:border-slate-800">
                <span className="text-slate-400">RCMC Certificate No:</span>
                <span className="font-mono font-bold">APEDA/GUJ/2024/991</span>
              </div>
              <div className="flex justify-between py-1 border-b dark:border-slate-800">
                <span className="text-slate-400">Commodity Category:</span>
                <span>Processed Spices, Condiments & Powders</span>
              </div>
              <div className="flex justify-between py-1 border-b dark:border-slate-800">
                <span className="text-slate-400">Validity:</span>
                <span className="text-emerald-500 font-semibold">Active through Dec 2029</span>
              </div>
            </div>
          </div>

          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-amber-900/10 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                SPICES
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Spices Board of India (CRES)
                </h4>
                <p className="text-xs text-slate-400">Certificate of Registration as Exporter of Spices</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b dark:border-slate-800">
                <span className="text-slate-400">CRES Registration:</span>
                <span className="font-mono font-bold">CRES/SPICES/ADL/009</span>
              </div>
              <div className="flex justify-between py-1 border-b dark:border-slate-800">
                <span className="text-slate-400">Quality Sampling:</span>
                <span>Mandatory NABL lab sampling for aflatoxin & pesticide residues</span>
              </div>
              <div className="flex justify-between py-1 border-b dark:border-slate-800">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-500 font-semibold">Approved for USA/EU/GCC Ports</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. New CFA Transfer Challan Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-900/10 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#9A2229]" />
                New Inter-Firm Delivery Challan (CFA Depot)
              </h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Delivery Challan No</label>
                  <input
                    type="text"
                    required
                    value={transferChallanNo}
                    onChange={(e) => setTransferChallanNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Transfer Date</label>
                  <input
                    type="date"
                    required
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Destination Firm Name</label>
                  <input
                    type="text"
                    required
                    value={destinationFirmName}
                    onChange={(e) => setDestinationFirmName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Destination GSTIN</label>
                  <input
                    type="text"
                    required
                    value={destinationGstin}
                    onChange={(e) => setDestinationGstin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Vehicle No</label>
                  <input
                    type="text"
                    required
                    value={vehicleNo}
                    onChange={(e) => setVehicleNo(e.target.value)}
                    placeholder="GJ-01-ET-8492"
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">E-Way Bill No</label>
                  <input
                    type="text"
                    required
                    value={ewayBillNo}
                    onChange={(e) => setEwayBillNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Driver Phone</label>
                  <input
                    type="text"
                    required
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Transfer Format</label>
                <select
                  value={transferFormat}
                  onChange={(e) => setTransferFormat(e.target.value as TransferFormat)}
                  className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                >
                  <option value="mixed_assorted">Mixed Assorted (Bulk Sacks + Retail Cartons)</option>
                  <option value="retail_pouches">Retail Consumer Pouches (100g / 250g / 500g)</option>
                  <option value="bulk_sacks">Commercial Bulk Master Sacks (25kg / 50kg)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl border dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-3">
                <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  Item Dispatch Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] mb-1">Product Name</label>
                    <input
                      type="text"
                      required
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border text-xs dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] mb-1">Production Batch</label>
                    <input
                      type="text"
                      required
                      value={itemBatch}
                      onChange={(e) => setItemBatch(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border text-xs font-mono dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] mb-1">Packs Count</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={packsCount}
                      onChange={(e) => setPacksCount(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border text-xs dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] mb-1">Pack Size (Grams)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={packSizeGrams}
                      onChange={(e) => setPackSizeGrams(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border text-xs dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] mb-1">Valuation (₹/kg)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={ratePerKgRupees}
                      onChange={(e) => setRatePerKgRupees(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border text-xs dark:bg-slate-900 dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#9A2229] hover:bg-[#851C22]"
                >
                  Issue Delivery Challan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. New Export Shipment Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-amber-900/10 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b dark:border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Log International Export Shipment
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExport} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Export Invoice No</label>
                  <input
                    type="text"
                    required
                    value={exportInvoiceNo}
                    onChange={(e) => setExportInvoiceNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Shipping Bill No</label>
                  <input
                    type="text"
                    required
                    value={shippingBillNo}
                    onChange={(e) => setShippingBillNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Consignee Name</label>
                  <input
                    type="text"
                    required
                    value={consigneeName}
                    onChange={(e) => setConsigneeName(e.target.value)}
                    placeholder="e.g. Al-Madina Trading LLC, Dubai"
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Destination Country</label>
                  <input
                    type="text"
                    required
                    value={destinationCountry}
                    onChange={(e) => setDestinationCountry(e.target.value)}
                    placeholder="e.g. United Arab Emirates or USA"
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Port of Loading</label>
                  <input
                    type="text"
                    required
                    value={portOfLoading}
                    onChange={(e) => setPortOfLoading(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Destination Port</label>
                  <input
                    type="text"
                    required
                    value={destinationPort}
                    onChange={(e) => setDestinationPort(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Export Format</label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  >
                    <option value="bulk_export">Bulk Export (Big Bags / Jumbo Sacks)</option>
                    <option value="retail_pack_export">Retail Pack Export (Consumer Pouches)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Container No</label>
                  <input
                    type="text"
                    required
                    value={containerNo}
                    onChange={(e) => setContainerNo(e.target.value)}
                    placeholder="MSKU-781920-4"
                    className="w-full px-3 py-2 rounded-xl border text-xs font-mono dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Total Weight (Kg)</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={totalWeightKg}
                    onChange={(e) => setTotalWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Foreign Currency</label>
                  <select
                    value={foreignCurrency}
                    onChange={(e) => setForeignCurrency(e.target.value as 'USD' | 'AED' | 'EUR')}
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="AED">AED (Dirhams)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Foreign Amount</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={foreignAmountDollars}
                    onChange={(e) => setForeignAmountDollars(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border text-xs font-bold dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Exch. Rate (₹/$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border text-xs dark:bg-slate-950 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700"
                >
                  Confirm Export Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
