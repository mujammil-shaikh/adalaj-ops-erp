import React, { useState } from 'react';
import {
  Package,
  Plus,
  Minus,
  CheckCircle2,
  AlertOctagon,
  Scale,
  QrCode,
  Users,
  ArrowLeft,
  Flame,
  Volume2,
} from 'lucide-react';
import { db } from '../../lib/storage';
import { PackingBatch } from '../../types';
import { formatINR, formatGrams, formatQty } from '../../lib/format';
import { AdalajLogo } from '../common/AdalajLogo';

interface FactoryFloorModeProps {
  onBackToDashboard: () => void;
}

export const FactoryFloorMode: React.FC<FactoryFloorModeProps> = ({ onBackToDashboard }) => {
  const batches = db.getBatches();
  const activeBatch = batches.find((b) => b.status === 'running') || batches[0];

  const [currentPacks, setCurrentPacks] = useState(
    activeBatch?.outputs[0]?.packsProduced || 280
  );
  const [spillGrams, setSpillGrams] = useState(150);
  const [damagedCans, setDamagedCans] = useState(3);
  const [activeWorker, setActiveWorker] = useState('Mukesh Vaghela');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const addPacks = (delta: number) => {
    const updated = Math.max(0, currentPacks + delta);
    setCurrentPacks(updated);
    showToast(`Logged +${delta} packs (Total: ${updated})`);

    if (activeBatch) {
      const updatedBatch: PackingBatch = {
        ...activeBatch,
        outputs: [
          {
            ...activeBatch.outputs[0],
            packsProduced: updated,
            totalGrams: updated * (activeBatch.outputs[0]?.packSizeGrams || 100),
          },
        ],
      };
      db.updateBatch(updatedBatch);
    }
  };

  const addSpill = (grams: number) => {
    setSpillGrams((prev) => prev + grams);
    showToast(`Recorded ${grams}g spill powder`);
  };

  const addDamaged = (qty: number) => {
    setDamagedCans((prev) => prev + qty);
    showToast(`Recorded ${qty} damaged cylinder`);
  };

  return (
    <div className="min-h-[82vh] flex flex-col justify-between space-y-4 max-w-4xl mx-auto">
      {/* Top Floor Bar */}
      <div className="flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={onBackToDashboard}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Console</span>
        </button>

        <div className="flex items-center gap-2">
          <AdalajLogo variant="compact" height={28} />
          <div className="text-left hidden sm:block">
            <span className="text-[10px] text-[#9E1C23] dark:text-amber-400 font-bold uppercase tracking-wider block leading-none">
              Floor Touch Console · Machine #1
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">{activeBatch.batchNo}</span>
          </div>
        </div>

        {/* Worker Switcher */}
        <div className="flex items-center gap-1.5 border rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <Users className="w-4 h-4 text-[#9E1C23] dark:text-amber-400" />
          <select
            value={activeWorker}
            onChange={(e) => setActiveWorker(e.target.value)}
            className="bg-transparent font-semibold text-xs focus:outline-none text-slate-800 dark:text-white"
          >
            <option value="Mukesh Vaghela">Mukesh V. (Operator)</option>
            <option value="Ramesh Prajapati">Ramesh P. (Supervisor)</option>
            <option value="Sunita Parmar">Sunita P. (Packing)</option>
            <option value="Geeta Solanki">Geeta S. (QC)</option>
          </select>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-600 text-white font-bold text-center text-sm shadow-xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Main Big Output Counter */}
      <div className="p-6 rounded-2xl border-2 bg-gradient-to-b from-[#9E1C23] to-[#7F1D1D] text-white text-center space-y-3 shadow-xl border-[#B91C1C]">
        <span className="text-xs font-bold text-amber-200 uppercase tracking-widest">
          Finished Packs Produced (Turmeric 100g Cylinder Can)
        </span>
        <div className="text-6xl sm:text-7xl font-extrabold font-mono text-white tracking-tight">
          {currentPacks}
        </div>
        <p className="text-xs text-amber-100/90">
          Target: 300 Cans · Net Powder Packed: <strong className="text-white font-mono">{formatGrams(currentPacks * 100)}</strong>
        </p>

        {/* Large Increment Buttons - 56px minimum touch target */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
          <button
            onClick={() => addPacks(1)}
            className="h-16 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-lg border border-white/20 active:scale-95 transition shadow"
          >
            +1 Can
          </button>
          <button
            onClick={() => addPacks(5)}
            className="h-16 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-lg border border-white/20 active:scale-95 transition shadow"
          >
            +5 Cans
          </button>
          <button
            onClick={() => addPacks(10)}
            className="h-16 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xl active:scale-95 transition shadow-lg"
          >
            +10 Cans
          </button>
          <button
            onClick={() => addPacks(24)}
            className="h-16 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-lg active:scale-95 transition shadow-lg"
          >
            +1 Carton (24)
          </button>
        </div>
      </div>

      {/* Quick Wastage & Damage Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Powder Spill */}
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <Flame className="w-4 h-4" />
              Powder Spill Wastage
            </span>
            <span className="font-mono text-slate-900 dark:text-white font-bold">{spillGrams} grams</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => addSpill(10)}
              className="py-3 rounded-lg border bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-300 font-bold text-xs border-slate-200 dark:border-slate-700 active:scale-95"
            >
              +10g
            </button>
            <button
              onClick={() => addSpill(50)}
              className="py-3 rounded-lg border bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-300 font-bold text-xs border-slate-200 dark:border-slate-700 active:scale-95"
            >
              +50g
            </button>
            <button
              onClick={() => addSpill(100)}
              className="py-3 rounded-lg border bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-200 font-bold text-xs border-rose-200 dark:border-rose-800 active:scale-95"
            >
              +100g
            </button>
          </div>
        </div>

        {/* Can Damage */}
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <AlertOctagon className="w-4 h-4" />
              Damaged Cans / Foils
            </span>
            <span className="font-mono text-slate-900 dark:text-white font-bold">{damagedCans} cans</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => addDamaged(1)}
              className="py-3 rounded-lg border bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-300 font-bold text-xs border-slate-200 dark:border-slate-700 active:scale-95"
            >
              +1 Can
            </button>
            <button
              onClick={() => addDamaged(2)}
              className="py-3 rounded-lg border bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-300 font-bold text-xs border-slate-200 dark:border-slate-700 active:scale-95"
            >
              +2 Cans
            </button>
            <button
              onClick={() => addDamaged(5)}
              className="py-3 rounded-lg border bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-200 font-bold text-xs border-amber-200 dark:border-amber-800 active:scale-95"
            >
              +5 Cans
            </button>
          </div>
        </div>
      </div>

      {/* Finish Button */}
      <div className="p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
        <span className="text-xs text-slate-600 dark:text-slate-400">
          Operator active: <strong className="text-slate-900 dark:text-white">{activeWorker}</strong> · All actions saved locally offline.
        </span>
        <button
          onClick={() => {
            showToast('Batch recorded! Returning to dashboard.');
            setTimeout(onBackToDashboard, 600);
          }}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md active:scale-95"
        >
          Finish / Sync Run
        </button>
      </div>
    </div>
  );
};
