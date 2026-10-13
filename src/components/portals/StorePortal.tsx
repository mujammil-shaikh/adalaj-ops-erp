import React, { useState } from 'react';
import {
  Boxes,
  Package,
  Truck,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  FileText,
  Printer,
  X,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  AuthUser,
  StockLot,
  InventoryItem,
  StockMovement,
  PackagingTierSpec,
} from '../../types';
import { db } from '../../lib/storage';
import { formatINR } from '../../lib/format';
import { RoleTodoAndReportBar } from './RoleTodoAndReportBar';

interface StorePortalProps {
  currentUser: AuthUser;
  onNavigateModule: (module: string) => void;
}

export const StorePortal: React.FC<StorePortalProps> = ({
  currentUser,
  onNavigateModule,
}) => {
  const [items, setItems] = useState<InventoryItem[]>(() => db.getItems());
  const [lots, setLots] = useState<StockLot[]>(() => db.getLots());
  const [packagingSpecs] = useState<PackagingTierSpec[]>(() => db.getPackagingSpecs());

  // Modals
  const [showGRNModal, setShowGRNModal] = useState(false);
  const [showGatePassModal, setShowGatePassModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form states - GRN
  const [grnSupplierLot, setGrnSupplierLot] = useState('GNT-TEJA-332');
  const [grnSupplierName, setGrnSupplierName] = useState('Shree Balaji Spice Mills');
  const [grnItemName, setGrnItemName] = useState('Red Chilli Whole (Teja Stemless)');
  const [grnWeightKg, setGrnWeightKg] = useState(14400);
  const [grnMoisturePct, setGrnMoisturePct] = useState(9.2);
  const [grnBinLocation, setGrnBinLocation] = useState('Raw Spices Inward Bay 1');

  // Form states - Dispatch Gate Pass
  const [gpVehicleNo, setGpVehicleNo] = useState('GJ-18-AZ-9921');
  const [gpDriverName, setGpDriverName] = useState('Suresh Solanki');
  const [gpDestination, setGpDestination] = useState('Mundra Port CFS / Sister CFA Depot');
  const [gpShipperType, setGpShipperType] = useState('25kg Heavy PP Woven Bags');
  const [gpTotalUnits, setGpTotalUnits] = useState(600);
  const [gpTotalWeightKg, setGpTotalWeightKg] = useState(15000);

  const refreshAll = () => {
    setItems(db.getItems());
    setLots(db.getLots());
  };

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateGRN = (e: React.FormEvent) => {
    e.preventDefault();
    const newLot: StockLot = {
      id: `lot_grn_${Date.now()}`,
      lotNo: `LOT-GRN-${Date.now().toString().slice(-4)}`,
      itemId: 'item_raw_chilli',
      itemName: grnItemName,
      supplierLotNo: grnSupplierLot,
      supplierName: grnSupplierName,
      receivedOn: new Date().toISOString().split('T')[0],
      expiryOn: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      qtyBase: Number(grnWeightKg) * 1000, // grams
      landedCostPerKgPaise: 21500, // ₹215/kg
      status: 'available',
      locationId: 'loc_raw_adalaj',
    };

    db.addLot(newLot);
    refreshAll();
    setShowGRNModal(false);
    showNotification(`Created Inward GRN for ${grnWeightKg.toLocaleString()} kg (${newLot.lotNo})`);
  };

  const handleGenerateGatePass = (e: React.FormEvent) => {
    e.preventDefault();
    setShowGatePassModal(false);
    showNotification(`Generated Official Dispatch Gate Pass for Vehicle ${gpVehicleNo} (${gpTotalWeightKg.toLocaleString()} kg)`);
  };

  // Split inventory by raw vs packaging materials
  const rawItems = items.filter((i) => i.type === 'raw_material');
  const packagingItems = items.filter((i) => i.type === 'packing_material');

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
      <div className="p-4 sm:p-5 rounded-2xl border border-teal-900/10 dark:border-teal-500/20 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent backdrop-blur-sm shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Store & Warehouse Logistics Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Inward goods receipt (GRN), packaging materials bin tracking, production issue & dispatch gate pass
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGRNModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#9E1C23]" />
            <span>Inward Goods Receipt (GRN)</span>
          </button>

          <button
            onClick={() => setShowGatePassModal(true)}
            className="px-4 py-2 rounded-xl bg-[#9E1C23] hover:bg-[#83161C] text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Generate Dispatch Gate Pass</span>
          </button>
        </div>
      </div>

      {/* 2. Pinned Universal Daily TO-DO Stack */}
      <RoleTodoAndReportBar
        currentRole="store_keeper"
        currentUserName={currentUser.name}
        onNavigateModule={onNavigateModule}
      />

      {/* 3. PHYSICAL WAREHOUSE BIN STOCK STATUS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Raw Spices Inward Bay</span>
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <Boxes className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {lots.reduce((acc, l) => acc + (l.qtyBase / 1000), 0).toLocaleString()} kg
          </div>
          <span className="text-xs text-slate-500">
            {lots.length} active lots with moisture & aflatoxin compliance
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Packaging Materials Bins</span>
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {packagingSpecs.length} Active Specs
          </div>
          <span className="text-xs text-slate-500">
            Tiers 1, 2, 3: Pouches, hanging strips, cartons & sacks
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outward Dispatch Staging</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <Truck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            3 Active Shipments
          </div>
          <span className="text-xs text-slate-500">
            Ready for container stuffing & CFA delivery loading
          </span>
        </div>
      </div>

      {/* 4. ACTIVE STOCK LOTS & INWARD TRACEABILITY */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-4 h-4 text-[#9E1C23] dark:text-amber-400" />
            <span>Active Raw Spice Lots & Physical Bin Stock</span>
          </h3>
          <button
            onClick={() => onNavigateModule('inventory')}
            className="text-xs font-bold text-[#9E1C23] dark:text-amber-400 hover:underline"
          >
            Open Full Inventory ➔
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {lots.slice(0, 6).map((lot) => (
            <div
              key={lot.id}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  {lot.lotNo}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {lot.status}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {lot.itemName}
                </h4>
                <div className="text-[11px] text-slate-500">
                  Supplier Ref: <strong>{lot.supplierLotNo || 'Direct Mandi'}</strong> ({lot.supplierName || 'Mandi Yard'})
                </div>
              </div>

              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Available Weight</span>
                  <strong>{(lot.qtyBase / 1000).toLocaleString()} kg</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Received On</span>
                  <span>{lot.receivedOn}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: INWARD GOODS RECEIPT NOTE (GRN) */}
      {showGRNModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#9E1C23] dark:text-amber-400" />
                <h3 className="font-bold text-sm">Inward Goods Receipt Note (GRN)</h3>
              </div>
              <button onClick={() => setShowGRNModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateGRN} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Commodity / Item *</label>
                <input
                  type="text"
                  required
                  value={grnItemName}
                  onChange={(e) => setGrnItemName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Supplier Lot / Bag Code *</label>
                  <input
                    type="text"
                    required
                    value={grnSupplierLot}
                    onChange={(e) => setGrnSupplierLot(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Supplier Name *</label>
                  <input
                    type="text"
                    required
                    value={grnSupplierName}
                    onChange={(e) => setGrnSupplierName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Net Weight Inward (kg) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={grnWeightKg}
                    onChange={(e) => setGrnWeightKg(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Moisture Inspection %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={grnMoisturePct}
                    onChange={(e) => setGrnMoisturePct(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Storage Physical Bin Location</label>
                <input
                  type="text"
                  value={grnBinLocation}
                  onChange={(e) => setGrnBinLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGRNModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#9E1C23] text-white font-bold"
                >
                  Confirm GRN Inward
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DISPATCH GATE PASS */}
      {showGatePassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#9E1C23] dark:text-amber-400" />
                <h3 className="font-bold text-sm">Generate Dispatch Vehicle Gate Pass</h3>
              </div>
              <button onClick={() => setShowGatePassModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleGenerateGatePass} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Vehicle Truck No *</label>
                  <input
                    type="text"
                    required
                    value={gpVehicleNo}
                    onChange={(e) => setGpVehicleNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Driver Name & Phone *</label>
                  <input
                    type="text"
                    required
                    value={gpDriverName}
                    onChange={(e) => setGpDriverName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Destination / Depot *</label>
                <input
                  type="text"
                  required
                  value={gpDestination}
                  onChange={(e) => setGpDestination(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Tertiary Shipper Packaging Format *</label>
                <select
                  value={gpShipperType}
                  onChange={(e) => setGpShipperType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                >
                  <option value="25kg Heavy PP Woven Bags">25kg Heavy PP Woven Bags (Logistics Shipper)</option>
                  <option value="20kg 5-Ply Corrugated Cartons">20kg 5-Ply Corrugated Master Cartons</option>
                  <option value="25kg Food-Grade Jute Sacks">25kg Food-Grade Jute Export Sacks</option>
                  <option value="50kg Bulk Industrial Woven Sacks">50kg Bulk Industrial Woven Sacks</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Number of Shippers *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={gpTotalUnits}
                    onChange={(e) => setGpTotalUnits(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Gross Dispatch Weight (kg) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={gpTotalWeightKg}
                    onChange={(e) => setGpTotalWeightKg(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowGatePassModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#9E1C23] text-white font-bold"
                >
                  Issue Gate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
