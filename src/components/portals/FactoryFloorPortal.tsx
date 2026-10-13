import React, { useState } from 'react';
import {
  Cpu,
  Package,
  Layers,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  QrCode,
  X,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import {
  AuthUser,
  PackingFloorFulfillmentJob,
  MachineAsset,
  PackagingTierSpec,
} from '../../types';
import { db } from '../../lib/storage';
import { RoleTodoAndReportBar } from './RoleTodoAndReportBar';

interface FactoryFloorPortalProps {
  currentUser: AuthUser;
  onNavigateModule: (module: string) => void;
}

export const FactoryFloorPortal: React.FC<FactoryFloorPortalProps> = ({
  currentUser,
  onNavigateModule,
}) => {
  const [jobs, setJobs] = useState<PackingFloorFulfillmentJob[]>(() => db.getPackingFloorJobs());
  const [machines, setMachines] = useState<MachineAsset[]>(() => db.getAssets());
  const [packagingSpecs] = useState<PackagingTierSpec[]>(() => db.getPackagingSpecs());

  // Modal
  const [selectedJob, setSelectedJob] = useState<PackingFloorFulfillmentJob | null>(null);
  const [showLogOutputModal, setShowLogOutputModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form states - Shift Output
  const [shiftType, setShiftType] = useState<'morning' | 'evening' | 'night'>('morning');
  const [outputUnits, setOutputUnits] = useState(2500);
  const [outputKg, setOutputKg] = useState(250);
  const [scrapKg, setScrapKg] = useState(1.2);

  const refreshAll = () => {
    setJobs(db.getPackingFloorJobs());
    setMachines(db.getAssets());
  };

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleLogShiftOutput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    db.recordPackingDailyProgress(
      selectedJob.id,
      shiftType,
      currentUser.name,
      Number(outputUnits) || 0,
      (Number(outputKg) || 0) * 1000,
      Math.round((Number(scrapKg) || 0) * 1000)
    );

    refreshAll();
    setShowLogOutputModal(false);
    showNotification(`Recorded ${outputUnits.toLocaleString()} units (${outputKg} kg) for ${selectedJob.jobNo}`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Banner with Strict Anonymization Badge */}
      <div className="p-4 sm:p-5 rounded-2xl border border-emerald-900/15 dark:border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent backdrop-blur-sm shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Factory Floor & Packaging Kiosk Mode
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Data Anonymized
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Operational job orders, grinding recipes, 3-tier packaging output quotas & shift scrap tracking
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateModule('floor_mode')}
          className="px-4 py-2 rounded-xl bg-[#9E1C23] hover:bg-[#83161C] text-white text-xs font-bold flex items-center gap-2 shadow cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
          <span>Full Kiosk Fullscreen Mode</span>
        </button>
      </div>

      {/* 2. Pinned Universal Daily TO-DO Stack */}
      <RoleTodoAndReportBar
        currentRole="supervisor"
        currentUserName={currentUser.name}
        onNavigateModule={onNavigateModule}
      />

      {/* 3. MACHINE FLEET RUNNING STATUS */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Packaging Machine Fleet Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {machines.map((mach) => (
            <div
              key={mach.id}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white">
                  {mach.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    mach.status === 'operational'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {mach.status}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 font-mono">
                S/N: {mach.serialNo} · Total Hours: {mach.totalBatchHours} hrs
              </div>

              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>Last Service: {mach.lastServiceDate}</span>
                <span className="text-emerald-600 font-bold">Ready</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. ANONYMIZED PRODUCTION JOBS QUEUE (CUSTOMER-ANONYMIZED) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-[#9E1C23] dark:text-amber-400" />
              <span>Active Packaging Order Queue (Customer Data Anonymized)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Plant operators focus strictly on recipe, target weights, mesh size, and packaging tier specifications.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {job.jobNo}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  {job.status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {job.spiceName}
                </h4>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Batch Lot: <strong className="font-mono">{job.lotTraceability.grindingBatchNo}</strong>
                </div>
              </div>

              {/* 3-Tier Packaging Hierarchy Details */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tier 1 Primary:</span>
                  <strong className="font-mono text-slate-800 dark:text-slate-200">{job.primaryTier}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tier 2 Bundling:</span>
                  <strong className="font-mono text-slate-800 dark:text-slate-200">{job.secondaryTier}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tier 3 Shipper:</span>
                  <strong className="font-mono text-slate-800 dark:text-slate-200">{job.tertiaryTier}</strong>
                </div>
              </div>

              {/* Progress Bar & Deficit */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Packed: {(job.packedGramsCompleted / 1000).toLocaleString()} / {(job.targetGrams / 1000).toLocaleString()} kg
                  </span>
                  <span className="font-bold font-mono text-[#9E1C23] dark:text-amber-400">
                    {job.fulfillmentPct.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#9E1C23] dark:bg-amber-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, job.fulfillmentPct)}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                  <span>Deficit: {(job.deficitGrams / 1000).toLocaleString()} kg ({job.deficitUnits.toLocaleString()} units)</span>
                  <span>Quota: {job.dailyPackQuotaUnits.toLocaleString()}/day</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  {job.dailyProgressRecords.length} shifts logged
                </span>

                <button
                  onClick={() => {
                    setSelectedJob(job);
                    setShowLogOutputModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Shift Output</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: LOG SHIFT OUTPUT */}
      {showLogOutputModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#9E1C23] dark:text-amber-400" />
                <h3 className="font-bold text-sm">
                  Log Shift Output: {selectedJob.jobNo}
                </h3>
              </div>
              <button onClick={() => setShowLogOutputModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleLogShiftOutput} className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                <strong>Spice:</strong> {selectedJob.spiceName} <br />
                <strong>Packaging Spec:</strong> {selectedJob.primaryTier} ➔ {selectedJob.secondaryTier} ➔ {selectedJob.tertiaryTier}
              </div>

              <div>
                <label className="block font-semibold mb-1">Shift</label>
                <select
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                >
                  <option value="morning">Morning Shift (08:00 - 16:00)</option>
                  <option value="evening">Evening Shift (16:00 - 00:00)</option>
                  <option value="night">Night Shift (00:00 - 08:00)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Packed Units Completed *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={outputUnits}
                    onChange={(e) => setOutputUnits(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Net Kilograms Packed *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={outputKg}
                    onChange={(e) => setOutputKg(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Spill / Film Scrap Wastage (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={scrapKg}
                  onChange={(e) => setScrapKg(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogOutputModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#9E1C23] text-white font-bold"
                >
                  Save Shift Output
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
