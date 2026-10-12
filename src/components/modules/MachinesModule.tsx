import React, { useState } from 'react';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  PenTool,
} from 'lucide-react';
import { db } from '../../lib/storage';
import { MachineAsset } from '../../types';
import { formatINR, formatDate } from '../../lib/format';

export const MachinesModule: React.FC = () => {
  const [assets, setAssets] = useState<MachineAsset[]>(db.getAssets());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'operational' | 'maintenance' | 'idle'>('all');

  // Modal State for Create & Edit Machine
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<MachineAsset | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [serialNo, setSerialNo] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [costRupees, setCostRupees] = useState(350000);
  const [bookValueRupees, setBookValueRupees] = useState(280000);
  const [depreciationRatePct, setDepreciationRatePct] = useState(15);
  const [status, setStatus] = useState<'operational' | 'maintenance' | 'idle'>('operational');
  const [totalBatchHours, setTotalBatchHours] = useState(120);
  const [lastServiceDate, setLastServiceDate] = useState(new Date().toISOString().split('T')[0]);

  // Service Log Modal
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [servicingAsset, setServicingAsset] = useState<MachineAsset | null>(null);
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [serviceNotes, setServiceNotes] = useState('');

  const reload = () => {
    setAssets(db.getAssets());
  };

  const handleOpenCreate = () => {
    setEditingAsset(null);
    setName('');
    setSerialNo(`MCH-${Math.floor(1000 + Math.random() * 9000)}`);
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setCostRupees(250000);
    setBookValueRupees(250000);
    setDepreciationRatePct(15);
    setStatus('operational');
    setTotalBatchHours(0);
    setLastServiceDate(new Date().toISOString().split('T')[0]);
    setShowModal(true);
  };

  const handleOpenEdit = (mach: MachineAsset) => {
    setEditingAsset(mach);
    setName(mach.name);
    setSerialNo(mach.serialNo);
    setPurchaseDate(mach.purchaseDate);
    setCostRupees(mach.costPaise / 100);
    setBookValueRupees(mach.currentBookValuePaise / 100);
    setDepreciationRatePct(mach.depreciationRatePct);
    setStatus(mach.status);
    setTotalBatchHours(mach.totalBatchHours);
    setLastServiceDate(mach.lastServiceDate);
    setShowModal(true);
  };

  const handleSaveMachine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const assetData: MachineAsset = {
      id: editingAsset ? editingAsset.id : `mach_${Date.now()}`,
      name: name.trim(),
      serialNo: serialNo.trim(),
      purchaseDate,
      costPaise: Math.round(costRupees * 100),
      currentBookValuePaise: Math.round(bookValueRupees * 100),
      depreciationRatePct: Number(depreciationRatePct) || 15,
      status,
      totalBatchHours: Number(totalBatchHours) || 0,
      lastServiceDate,
    };

    if (editingAsset) {
      db.updateAsset(assetData);
    } else {
      db.addAsset(assetData);
    }

    setShowModal(false);
    reload();
  };

  const handleDeleteMachine = (id: string, machName: string) => {
    if (confirm(`Are you sure you want to remove machine asset "${machName}"?`)) {
      db.deleteAsset(id);
      reload();
    }
  };

  const handleOpenService = (mach: MachineAsset) => {
    setServicingAsset(mach);
    setServiceDate(new Date().toISOString().split('T')[0]);
    setServiceNotes('Routine preventative check, blade alignment, sensor calibration, lubrication');
    setShowServiceModal(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!servicingAsset) return;

    const updated: MachineAsset = {
      ...servicingAsset,
      lastServiceDate: serviceDate,
      status: 'operational',
    };

    db.updateAsset(updated);
    setShowServiceModal(false);
    reload();
  };

  const totalCost = assets.reduce((s, a) => s + a.costPaise, 0);
  const totalBookValue = assets.reduce((s, a) => s + a.currentBookValuePaise, 0);

  const filteredAssets = assets.filter((mach) => {
    if (statusFilter !== 'all' && mach.status !== statusFilter) return false;
    if (
      searchQuery &&
      !mach.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !mach.serialNo.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header with High-Contrast Theming */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E1C23] dark:text-amber-400">
            <span>Module M6</span>
            <span>·</span>
            <span>Adalaj Fixed Assets &amp; Plant Equipment</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Plant Machine Register &amp; Depreciation
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
            Manage factory equipment, machinery log books, WDV depreciation calculations, and maintenance schedules.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#9E1C23] hover:bg-[#83161C] text-white font-semibold text-xs transition shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Machine</span>
        </button>
      </div>

      {/* Asset Valuation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-600 dark:text-slate-400 text-xs font-medium block">
            Total Asset Capital Cost
          </span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 block">
            {formatINR(totalCost)}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
            Across {assets.length} registered production units
          </span>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-600 dark:text-slate-400 text-xs font-medium block">
            Current Net Book Value
          </span>
          <span className="text-xl font-bold font-mono text-teal-700 dark:text-teal-400 mt-1 block">
            {formatINR(totalBookValue)}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
            Audited WDV for Balance Sheet
          </span>
        </div>

        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-slate-600 dark:text-slate-400 text-xs font-medium block">
            Depreciation Method &amp; Norms
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 block">
            WDV (IT Act Norms)
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
            Plant &amp; Machinery 15% Written Down Value
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm text-xs">
        <div className="flex items-center gap-2 flex-1">
          <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 ml-1 shrink-0" />
          <input
            type="text"
            placeholder="Search machine name or serial number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-600 dark:text-slate-400 font-medium">Status:</span>
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100 dark:bg-slate-800">
            {(['all', 'operational', 'maintenance', 'idle'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Machines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredAssets.map((mach) => (
          <div
            key={mach.id}
            className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug">
                    {mach.name}
                  </h3>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                    S/N: {mach.serialNo}
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase ${
                    mach.status === 'operational'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/60'
                      : mach.status === 'maintenance'
                      ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/60'
                      : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                  }`}
                >
                  {mach.status}
                </span>
              </div>

              {/* Specs & Values */}
              <div className="mt-3.5 space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Purchase Cost:</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                    {formatINR(mach.costPaise)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Current Book Value (WDV):</span>
                  <span className="font-mono font-bold text-teal-700 dark:text-teal-300">
                    {formatINR(mach.currentBookValuePaise)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Total Run Time:</span>
                  <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                    {mach.totalBatchHours} hours
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Last Serviced:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {formatDate(mach.lastServiceDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">Deprec. Rate:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {mach.depreciationRatePct}% p.a.
                  </span>
                </div>
              </div>
            </div>

            {/* Actions: Edit, Delete, Service Log */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenService(mach)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:hover:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 text-xs font-semibold transition"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Log Service</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(mach)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition"
                  title="Edit Machine Details"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteMachine(mach.id, mach.name)}
                  className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/40 transition"
                  title="Delete Machine"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs">
          No machinery matching your filter or query found.
        </div>
      )}

      {/* Modal: Create or Edit Machine */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-4 sm:p-6 space-y-4 my-8 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#9E1C23]/10 dark:bg-[#9E1C23]/20 text-[#9E1C23] dark:text-amber-400">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {editingAsset ? 'Edit Machine Asset' : 'Register New Machine / Equipment'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Adalaj Spice Packing Plant Asset Register
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMachine} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Machine / Equipment Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Auger Servo Filling Machine #2"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#9E1C23]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Serial / Tag No *
                  </label>
                  <input
                    type="text"
                    required
                    value={serialNo}
                    onChange={(e) => setSerialNo(e.target.value)}
                    placeholder="e.g. AUG-2024-001"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Cost (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={costRupees}
                    onChange={(e) => setCostRupees(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Book Value (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={bookValueRupees}
                    onChange={(e) => setBookValueRupees(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deprec. Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={depreciationRatePct}
                    onChange={(e) => setDepreciationRatePct(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Operational Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="operational">Operational</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="idle">Idle</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Run Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={totalBatchHours}
                    onChange={(e) => setTotalBatchHours(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Last Service / Calibration Date
                </label>
                <input
                  type="date"
                  value={lastServiceDate}
                  onChange={(e) => setLastServiceDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold shadow-sm"
                >
                  {editingAsset ? 'Update Machine Asset' : 'Save & Register Machine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Service Log */}
      {showServiceModal && servicingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Log Service &amp; Maintenance
                </h3>
              </div>
              <button
                onClick={() => setShowServiceModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300">
              Machine: <strong className="text-slate-900 dark:text-white">{servicingAsset.name}</strong> ({servicingAsset.serialNo})
            </p>

            <form onSubmit={handleSaveService} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service Date *
                </label>
                <input
                  type="date"
                  required
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Maintenance / Calibration Notes
                </label>
                <textarea
                  rows={3}
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Confirm Service Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
