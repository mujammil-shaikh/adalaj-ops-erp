import React, { useState } from 'react';
import {
  TrendingUp,
  Package,
  Plus,
  FileText,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ShoppingBag,
  Truck,
  X,
  CreditCard,
} from 'lucide-react';
import {
  AuthUser,
  MandiSpotRateRecord,
  PurchaseOrder,
  PackingFloorFulfillmentJob,
} from '../../types';
import { db } from '../../lib/storage';
import { formatINR } from '../../lib/format';
import { RoleTodoAndReportBar } from './RoleTodoAndReportBar';

interface ProcurementPortalProps {
  currentUser: AuthUser;
  onNavigateModule: (module: string) => void;
}

export const ProcurementPortal: React.FC<ProcurementPortalProps> = ({
  currentUser,
  onNavigateModule,
}) => {
  const [mandiRates, setMandiRates] = useState<MandiSpotRateRecord[]>(() => db.getMandiSpotRates());
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => db.getPurchaseOrders());
  const [floorJobs, setFloorJobs] = useState<PackingFloorFulfillmentJob[]>(() => db.getPackingFloorJobs());

  // Modal
  const [showAddRateModal, setShowAddRateModal] = useState(false);
  const [showCreatePOModal, setShowCreatePOModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form states - Mandi Rate
  const [mandiSpice, setMandiSpice] = useState('Chilli');
  const [mandiLocation, setMandiLocation] = useState('Guntur Mandi');
  const [mandiGrade, setMandiGrade] = useState('Teja S17 Stemless (Premium Export)');
  const [mandiRatePerKg, setMandiRatePerKg] = useState(220);
  const [mandiDailyChange, setMandiDailyChange] = useState(3);
  const [mandiArrivalBags, setMandiArrivalBags] = useState(45000);
  const [mandiNotes, setMandiNotes] = useState('Heavy export demand; arrivals firm');

  // Form states - Quick Spot PO
  const [poSupplierName, setPoSupplierName] = useState('Shree Balaji Spice Mills & Commission Agent');
  const [poSpiceName, setPoSpiceName] = useState('Whole Stemless Teja Red Chilli');
  const [poQuantityKg, setPoQuantityKg] = useState(14400); // 14,400 kg deficit
  const [poRatePerKg, setPoRatePerKg] = useState(215);
  const [poAdvancePct, setPoAdvancePct] = useState(25);

  const refreshAll = () => {
    setMandiRates(db.getMandiSpotRates());
    setPurchaseOrders(db.getPurchaseOrders());
    setFloorJobs(db.getPackingFloorJobs());
  };

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleLogMandiRate = (e: React.FormEvent) => {
    e.preventDefault();
    const rateRec: MandiSpotRateRecord = {
      id: `mandi_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      spiceName: mandiSpice,
      mandiLocation,
      grade: mandiGrade,
      spotRatePerKgRupees: Number(mandiRatePerKg) || 0,
      dailyChangeRupees: Number(mandiDailyChange) || 0,
      arrivalBags: Number(mandiArrivalBags) || 0,
      reportedBy: `${currentUser.name} (Procurement)`,
      notes: mandiNotes,
    };

    db.addMandiSpotRate(rateRec);
    refreshAll();
    setShowAddRateModal(false);
    showNotification(`Recorded spot mandi rate for ${mandiSpice} @ ₹${rateRec.spotRatePerKgRupees}/kg`);
  };

  const handleCreateSpotPO = (e: React.FormEvent) => {
    e.preventDefault();
    const totalPaise = Number(poQuantityKg) * Number(poRatePerKg) * 100;
    const advancePaise = Math.round((totalPaise * Number(poAdvancePct)) / 100);
    const balancePaise = totalPaise - advancePaise;

    const newPO: PurchaseOrder = {
      id: `po_spot_${Date.now()}`,
      poNumber: `PO-SPOT-${Date.now().toString().slice(-4)}`,
      initiationDate: new Date().toISOString().split('T')[0],
      expectedFulfillmentDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      partyId: 'pty_balaji_guntur',
      partyName: poSupplierName,
      partyGstin: '37AAGCS9412F1Z1',
      purchaseCategory: 'raw_material',
      status: 'issued',
      taxableAmountPaise: totalPaise,
      cgstPaise: 0,
      sgstPaise: 0,
      igstPaise: Math.round((totalPaise * 5) / 100), // 5% IGST on inter-state raw spices
      totalAmountPaise: totalPaise + Math.round((totalPaise * 5) / 100),
      totalClaimableGstPaise: Math.round((totalPaise * 5) / 100),
      totalIneligibleGstPaise: 0,
      advancePaidPaise: advancePaise,
      totalPaidPaise: advancePaise,
      balanceDuePaise: balancePaise + Math.round((totalPaise * 5) / 100),
      payments: [
        {
          id: `pay_adv_${Date.now()}`,
          poId: `po_spot_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          milestoneType: 'advance',
          amountPaise: advancePaise,
          paymentMode: 'bank_neft_rtgs',
          accountId: 'acc_hdfc_curr',
          accountName: 'HDFC Current A/c',
          utrOrRef: `ADV-${Date.now().toString().slice(-6)}`,
          notes: `${poAdvancePct}% booking advance to secure spot delivery`,
        },
      ],
      items: [
        {
          id: `poi_spot_${Date.now()}`,
          description: poSpiceName,
          category: 'raw_material',
          hsnOrSac: '0904',
          qty: Number(poQuantityKg),
          unit: 'kg',
          unitPricePaise: Number(poRatePerKg) * 100,
          taxableAmountPaise: totalPaise,
          gstRatePct: 5,
          cgstPaise: 0,
          sgstPaise: 0,
          igstPaise: Math.round((totalPaise * 5) / 100),
          totalPaise: totalPaise + Math.round((totalPaise * 5) / 100),
          isClaimableITC: true,
          isRCM: false,
        },
      ],
      fulfillmentNotes: 'Spot market procurement to cover customer container export job deficit.',
    };

    db.addPurchaseOrder(newPO);
    refreshAll();
    setShowCreatePOModal(false);
    showNotification(`Generated Spot PO ${newPO.poNumber} for ${poQuantityKg.toLocaleString()} kg`);
  };

  // Calculate total raw material deficit across active jobs
  const totalDeficitKg = floorJobs.reduce((acc, job) => acc + (job.deficitGrams / 1000), 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-amber-900/15 dark:border-amber-400/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent backdrop-blur-sm shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Raw Material Procurement & Mandi Desk
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daily spot rates from Unjha, Gondal, Guntur & Ramganj · Spot POs with part-payment schedules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddRateModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#9E1C23]" />
            <span>Log Daily Mandi Rate</span>
          </button>

          <button
            onClick={() => setShowCreatePOModal(true)}
            className="px-4 py-2 rounded-xl bg-[#9E1C23] hover:bg-[#83161C] text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Spot PO</span>
          </button>
        </div>
      </div>

      {/* 2. Pinned Universal Daily TO-DO Stack */}
      <RoleTodoAndReportBar
        currentRole="procurement"
        currentUserName={currentUser.name}
        onNavigateModule={onNavigateModule}
      />

      {/* 3. DEFICIT ALERT STRIP: Plant Shortfall vs Market Sourcing */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Active Plant Shortfall: {totalDeficitKg.toLocaleString()} kg Required
            </div>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
              Floor fulfillment jobs currently pending spice milling. Issue spot POs at current mandi rates to prevent production stall.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreatePOModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow cursor-pointer"
        >
          Cover Deficit via Spot PO ➔
        </button>
      </div>

      {/* 4. DAILY MANDI BENCHMARK SPOT RATES TICKER */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#9E1C23] dark:text-amber-400" />
            <span>Official APMC Mandi Benchmark Rates</span>
          </h3>
          <span className="text-slate-400 text-[11px]">
            Calibrates Sales Blended Cost Engine & Store Valuations
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mandiRates.map((rate) => (
            <div
              key={rate.id}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {rate.mandiLocation}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{rate.date}</span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {rate.spiceName} — {rate.grade}
                </h4>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    ₹{rate.spotRatePerKgRupees}
                  </span>
                  <span className="text-xs text-slate-400">/ kg</span>
                  {rate.dailyChangeRupees !== 0 && (
                    <span
                      className={`text-xs font-bold ${
                        rate.dailyChangeRupees > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {rate.dailyChangeRupees > 0 ? `+₹${rate.dailyChangeRupees}` : `-₹${Math.abs(rate.dailyChangeRupees)}`}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>Arrival: {rate.arrivalBags.toLocaleString()} bags</span>
                <span>By: {rate.reportedBy.split(' ')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. RECENT PURCHASE ORDERS & PART-PAYMENT STATUS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-[#9E1C23] dark:text-amber-400" />
            <span>Raw Spice Purchase Orders & Part-Payment Milestones</span>
          </h3>
          <button
            onClick={() => onNavigateModule('pos')}
            className="text-xs font-bold text-[#9E1C23] dark:text-amber-400 hover:underline"
          >
            View All POs ➔
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {purchaseOrders
            .filter((po) => po.purchaseCategory === 'raw_material')
            .slice(0, 4)
            .map((po) => (
              <div
                key={po.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                    {po.poNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      po.status === 'fulfilled'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {po.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {po.partyName}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {po.items.map((i) => `${i.description} (${i.qty} ${i.unit})`).join(', ')}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-sans">Total Order</span>
                    <strong className="text-slate-900 dark:text-white">{formatINR(po.totalAmountPaise)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600 uppercase block font-sans">Advance Paid</span>
                    <strong className="text-emerald-600">{formatINR(po.advancePaidPaise)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-600 uppercase block font-sans">Balance Due</span>
                    <strong className="text-rose-600">{formatINR(po.balanceDuePaise)}</strong>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                  <span>Initiated: {po.initiationDate}</span>
                  <span>Due: {po.expectedFulfillmentDate}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* MODAL 1: LOG DAILY MANDI RATE */}
      {showAddRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#9E1C23] dark:text-amber-400" />
                <h3 className="font-bold text-sm">Log APMC Mandi Spot Rate</h3>
              </div>
              <button onClick={() => setShowAddRateModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleLogMandiRate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Spice Commodity *</label>
                  <select
                    value={mandiSpice}
                    onChange={(e) => setMandiSpice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="Chilli">Chilli (Mirch)</option>
                    <option value="Turmeric">Turmeric (Haldi)</option>
                    <option value="Coriander">Coriander (Dhanya)</option>
                    <option value="Cumin">Cumin (Jeera)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Mandi / Yard *</label>
                  <select
                    value={mandiLocation}
                    onChange={(e) => setMandiLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="Unjha Mandi">Unjha Mandi (Gujarat)</option>
                    <option value="Gondal Yard">Gondal Yard (Saurashtra)</option>
                    <option value="Guntur Mandi">Guntur Yard (Andhra)</option>
                    <option value="Sangli Yard">Sangli Mandi (Maharashtra)</option>
                    <option value="Ramganj Mandi">Ramganj Mandi (Rajasthan)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Grade / Quality Specification *</label>
                <input
                  type="text"
                  required
                  value={mandiGrade}
                  onChange={(e) => setMandiGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Spot Rate (₹/kg) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={mandiRatePerKg}
                    onChange={(e) => setMandiRatePerKg(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Daily Change (₹)</label>
                  <input
                    type="number"
                    value={mandiDailyChange}
                    onChange={(e) => setMandiDailyChange(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Arrival Bags</label>
                  <input
                    type="number"
                    value={mandiArrivalBags}
                    onChange={(e) => setMandiArrivalBags(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Market Sentiment / Notes</label>
                <input
                  type="text"
                  value={mandiNotes}
                  onChange={(e) => setMandiNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddRateModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#9E1C23] text-white font-bold"
                >
                  Save Mandi Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ISSUE QUICK SPOT PO */}
      {showCreatePOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#9E1C23] dark:text-amber-400" />
                <h3 className="font-bold text-sm">Issue Spot Purchase Order (PO)</h3>
              </div>
              <button onClick={() => setShowCreatePOModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateSpotPO} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Mandi Supplier / Commission Agent *</label>
                <input
                  type="text"
                  required
                  value={poSupplierName}
                  onChange={(e) => setPoSupplierName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Commodity Item Description *</label>
                <input
                  type="text"
                  required
                  value={poSpiceName}
                  onChange={(e) => setPoSpiceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Quantity (kg) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={poQuantityKg}
                    onChange={(e) => setPoQuantityKg(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Agreed Rate (₹/kg)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={poRatePerKg}
                    onChange={(e) => setPoRatePerKg(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Advance Part %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={poAdvancePct}
                    onChange={(e) => setPoAdvancePct(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-blue-600"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Total PO Value:</span>
                  <strong>₹{((poQuantityKg * poRatePerKg) * 1.05).toLocaleString()}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-600 block font-sans">Advance to Release:</span>
                  <strong className="text-emerald-600">
                    ₹{Math.round((poQuantityKg * poRatePerKg * poAdvancePct) / 100).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreatePOModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#9E1C23] text-white font-bold shadow"
                >
                  Generate Spot PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
