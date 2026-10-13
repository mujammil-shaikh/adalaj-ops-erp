import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Boxes,
  ArrowUpRight,
  ArrowDownLeft,
  Landmark,
  Wrench,
  FileText,
  TrendingDown,
  TrendingUp,
  PlusCircle,
  PackagePlus,
  QrCode,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Building2,
  Truck,
  Scale,
  BarChart3,
  Percent,
  Sparkles,
  Activity,
  Layers,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { db } from '../../lib/storage';
import { formatINR, formatGrams } from '../../lib/format';
import { BusinessEntityId, FinancialHorizon } from '../../types';

interface DashboardProps {
  onNavigate: (module: string) => void;
  onOpenQuickAdd: () => void;
}

export const DashboardWhereIsMyMoney: React.FC<DashboardProps> = ({
  onNavigate,
  onOpenQuickAdd,
}) => {
  const [activeEntity, setActiveEntity] = useState<BusinessEntityId | 'all'>(() => db.getActiveEntityId());
  const [financialHorizon, setFinancialHorizon] = useState<FinancialHorizon>('monthly_mom');
  const [specificMonth, setSpecificMonth] = useState<'2026-10' | '2026-09' | '2026-08'>('2026-10');
  const [showDetailedPnl, setShowDetailedPnl] = useState(true);

  useEffect(() => {
    const handler = () => {
      setActiveEntity(db.getActiveEntityId());
    };
    window.addEventListener('adalaj:entity_changed', handler);
    return () => window.removeEventListener('adalaj:entity_changed', handler);
  }, []);

  const accounts = db.getAccountsByEntity(activeEntity);
  const items = db.getItems();
  const lots = db.getLots();
  const parties = db.getPartiesByEntity(activeEntity);
  const loans = db.getLoans();
  const assets = db.getAssets();
  const transactions = db.getTransactionsByEntity(activeEntity);
  const batches = db.getBatches();
  const entitiesConfig = db.getEntitiesConfig();

  // 1. Cash & Bank total
  const totalCashAndBankPaise = accounts.reduce((sum, a) => sum + a.balancePaise, 0);

  // 2. Stock Values
  let rawStockValuePaise = 0;
  let packingStockValuePaise = 0;
  let finishedStockValuePaise = 0;
  let thirdPartyPackerStockValuePaise = 0;

  items.forEach((item) => {
    const val = item.currentStockBase * item.averageCostPaise;
    if (item.type === 'raw_material') rawStockValuePaise += val;
    else if (item.type === 'packing_material') packingStockValuePaise += val;
    else if (item.type === 'finished_good') finishedStockValuePaise += val;
  });

  // Calculate stock currently at 3rd party packer (Sanand)
  lots.forEach((lot) => {
    if (lot.locationId === 'loc_packer') {
      thirdPartyPackerStockValuePaise += (lot.qtyBase / 1000) * lot.landedCostPerKgPaise;
    }
  });

  const totalStockValuePaise = rawStockValuePaise + packingStockValuePaise + finishedStockValuePaise;

  // 3. Receivables & Payables
  let totalReceivablesPaise = 0;
  let totalPayablesPaise = 0;

  parties.forEach((p) => {
    if (p.outstandingPaise < 0) {
      totalReceivablesPaise += Math.abs(p.outstandingPaise);
    } else {
      totalPayablesPaise += p.outstandingPaise;
    }
  });

  // 4. Debt
  const totalDebtBalancePaise = loans.reduce((sum, l) => sum + l.balancePaise, 0);
  const totalMonthlyEmiPaise = loans.reduce((sum, l) => sum + l.emiPaise, 0);

  // 5. Fixed Assets book value
  const totalAssetsBookValuePaise = assets.reduce((sum, a) => sum + a.currentBookValuePaise, 0);

  // 6. Government / Statutory dues
  const statutoryDuesPaise = 8450000;

  // 7. This month spend
  const thisMonthExpenses = transactions.filter((t) => t.direction === 'out');
  const thisMonthTotalSpendPaise = thisMonthExpenses.reduce((sum, t) => sum + t.amountPaise, 0);

  // Spend breakdown by head
  const spendByHead: Record<string, number> = {};
  thisMonthExpenses.forEach((t) => {
    spendByHead[t.headCategory] = (spendByHead[t.headCategory] || 0) + t.amountPaise;
  });

  // Active / running batches
  const activeBatches = batches.filter((b) => b.status === 'running');

  // Net Liquid & Working Capital Position
  const netLiquidPaise =
    totalCashAndBankPaise + totalStockValuePaise + totalReceivablesPaise - totalPayablesPaise - totalDebtBalancePaise;

  const finMetrics = db.getFinancialIntelligence(activeEntity, financialHorizon, specificMonth);

  return (
    <div key={activeEntity} className="space-y-4">
      {/* Top Banner: Adalaj Themed Cockpit */}
      <div className="rounded-xl border p-4 sm:p-5 shadow-sm transition-colors bg-gradient-to-r from-[#8B1D24] via-[#9E1C23] to-[#7F1D1D] text-white border-[#B91C1C]/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-200">
              <span>Financial Cockpit</span>
              <span>·</span>
              <span className="opacity-90">
                {activeEntity === 'pvt_ltd'
                  ? 'Main Pvt. Ltd. (Strategic B2B & Modern Trade)'
                  : activeEntity === 'sister_prop'
                  ? 'Sister Proprietorship (Gujarat Distribution & CFA)'
                  : 'Consolidated Enterprise Cockpit'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Where Is My Money Today?
            </h1>
            <p className="text-xs text-amber-100/80 mt-0.5">
              Real-time audit across safe, bank balances, spice powder lots, packaging foils, and machines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigate('invoices')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md active:scale-95"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              <span>Invoices &amp; Quotes</span>
            </button>
            <button
              onClick={() => onNavigate('batches')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-md active:scale-95"
            >
              <PackagePlus className="w-4 h-4 text-slate-950" />
              <span>New Batch</span>
            </button>
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition backdrop-blur-sm"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>+ Quick Expense</span>
            </button>
            <button
              onClick={() => onNavigate('floor_mode')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition"
            >
              <QrCode className="w-4 h-4 text-amber-200" />
              <span>Floor Mode</span>
            </button>
          </div>
        </div>

        {/* Liquid & Net Worth Strip */}
        <div className="mt-4 pt-3.5 border-t border-white/15 grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-lg bg-black/20 border border-white/10 backdrop-blur-sm">
            <span className="text-amber-200/90 text-[11px] block">Cash &amp; Bank Balances</span>
            <span className="text-base sm:text-lg font-bold text-white font-mono">
              {formatINR(totalCashAndBankPaise)}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/20 border border-white/10 backdrop-blur-sm">
            <span className="text-amber-200/90 text-[11px] block">Total Inventory Value</span>
            <span className="text-base sm:text-lg font-bold text-amber-300 font-mono">
              {formatINR(totalStockValuePaise)}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/20 border border-white/10 backdrop-blur-sm">
            <span className="text-amber-200/90 text-[11px] block">Machinery Book Value</span>
            <span className="text-base sm:text-lg font-bold text-teal-200 font-mono">
              {formatINR(totalAssetsBookValuePaise)}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/20 border border-white/10 backdrop-blur-sm">
            <span className="text-amber-200/90 text-[11px] block">Net Operations Position</span>
            <span className="text-base sm:text-lg font-bold font-mono text-white">
              {formatINR(netLiquidPaise)}
            </span>
          </div>
        </div>
      </div>

      {/* Operating Legal Entity Context Banner (Sections 1 & 7) */}
      <div
        className={`rounded-xl border p-3 flex items-center justify-between gap-3 text-xs ${
          activeEntity === 'pvt_ltd'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
            : activeEntity === 'sister_prop'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
            : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-800 dark:text-indigo-300'
        }`}
      >
        <div className="flex items-center gap-2">
          {activeEntity === 'pvt_ltd' ? (
            <Building2 className="w-4 h-4 flex-shrink-0 text-[#9A2229] dark:text-rose-400" />
          ) : activeEntity === 'sister_prop' ? (
            <Truck className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          ) : (
            <Scale className="w-4 h-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
          )}
          <span>
            {activeEntity === 'pvt_ltd' ? (
              <>
                Operating as <strong>{entitiesConfig.pvt_ltd.name}</strong> (CIN: {entitiesConfig.pvt_ltd.cinOrReg} · GSTIN: {entitiesConfig.pvt_ltd.gstin})
              </>
            ) : activeEntity === 'sister_prop' ? (
              <>
                Operating as <strong>{entitiesConfig.sister_prop.name}</strong> (Trade Reg: {entitiesConfig.sister_prop.cinOrReg} · GSTIN: {entitiesConfig.sister_prop.gstin})
              </>
            ) : (
              <>
                <strong>Dual-Entity Consolidated Financial Cockpit</strong> · Intra-Company Balances Reconciled
              </>
            )}
          </span>
        </div>
        <button
          onClick={() => onNavigate('interfirm_export')}
          className="underline text-[11px] font-bold whitespace-nowrap cursor-pointer hover:opacity-80"
        >
          {activeEntity === 'pvt_ltd'
            ? 'Reconcile Sister Firm ➔'
            : activeEntity === 'sister_prop'
            ? 'Secondary Sales & Depot ➔'
            : 'Open Audit Ledger ➔'}
        </button>
      </div>

      {/* Active Floor Alerts */}
      {activeBatches.length > 0 && (
        <div className="rounded-xl border border-[#9E1C23]/30 bg-amber-50 dark:bg-[#9E1C23]/10 p-3.5 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9E1C23] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#9E1C23]"></span>
            </span>
            <div>
              <span className="font-bold text-[#9E1C23] dark:text-amber-300">
                Active Batch Running on Floor: {activeBatches[0].batchNo}
              </span>
              <span className="text-slate-600 dark:text-slate-300 block text-[11px]">
                {activeBatches[0].machineName} · {activeBatches[0].rawItemName} ({formatGrams(activeBatches[0].rawIssuedGrams)} issued)
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('batches')}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#9E1C23] hover:bg-[#83161C] text-white font-medium text-xs whitespace-nowrap shadow-sm"
          >
            <span>View Floor Live</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* EXECUTIVE FINANCIAL INTELLIGENCE & MULTI-PERIOD P&L COCKPIT          */}
      {/* ===================================================================== */}
      <div className="rounded-2xl border p-4 sm:p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Header with Multi-Horizon Interactive Slicers */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3 border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E1C23] dark:text-amber-400">
              <BarChart3 className="w-4 h-4" />
              <span>Financial Intelligence &amp; Multi-KPI Engine</span>
              <span>·</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">{finMetrics.periodLabel}</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              P&amp;L Waterfall, EBITDA, Margins &amp; Unit Economics
            </h2>
          </div>

          {/* Horizon Slicer Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFinancialHorizon('daily_dod')}
              className={`px-3 py-1.5 rounded-lg transition ${
                financialHorizon === 'daily_dod'
                  ? 'bg-white dark:bg-slate-900 text-[#9E1C23] dark:text-amber-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Daily (DoD)
            </button>
            <button
              onClick={() => setFinancialHorizon('monthly_mom')}
              className={`px-3 py-1.5 rounded-lg transition ${
                financialHorizon === 'monthly_mom'
                  ? 'bg-white dark:bg-slate-900 text-[#9E1C23] dark:text-amber-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly (MoM)
            </button>
            <button
              onClick={() => setFinancialHorizon('specific_month')}
              className={`px-3 py-1.5 rounded-lg transition ${
                financialHorizon === 'specific_month'
                  ? 'bg-white dark:bg-slate-900 text-[#9E1C23] dark:text-amber-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Oct 2026
            </button>
            <button
              onClick={() => setFinancialHorizon('annual_yoy')}
              className={`px-3 py-1.5 rounded-lg transition ${
                financialHorizon === 'annual_yoy'
                  ? 'bg-white dark:bg-slate-900 text-[#9E1C23] dark:text-amber-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Annual (YoY)
            </button>
          </div>
        </div>

        {/* 8 Primary P&L Hierarchy Cards (in ₹ and %) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs">
          {/* 1. Revenue */}
          <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block truncate">
              Turnover (Rev)
            </span>
            <div className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {formatINR(finMetrics.revenuePaise)}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+{finMetrics.revenueGrowthPct}%</span>
            </div>
          </div>

          {/* 2. COGS */}
          <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block truncate">
              COGS (Direct)
            </span>
            <div className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {formatINR(finMetrics.cogsPaise)}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
              {finMetrics.cogsPct}% of rev
            </div>
          </div>

          {/* 3. Gross Profit (GP) */}
          <div className="p-3 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/20">
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block truncate">
              Gross Profit (GP)
            </span>
            <div className="text-sm sm:text-base font-bold font-mono text-emerald-700 dark:text-emerald-300 mt-0.5">
              {formatINR(finMetrics.grossProfitPaise)}
            </div>
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {finMetrics.gpMarginPct}% Margin
            </div>
          </div>

          {/* 4. OPEX */}
          <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block truncate">
              OPEX (Indirect)
            </span>
            <div className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {formatINR(finMetrics.opexPaise)}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
              {finMetrics.opexPct}% of rev
            </div>
          </div>

          {/* 5. EBITDA */}
          <div className="p-3 rounded-xl border bg-amber-50/50 dark:bg-amber-950/20 border-amber-500/20">
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 block truncate">
              EBITDA
            </span>
            <div className="text-sm sm:text-base font-bold font-mono text-amber-700 dark:text-amber-300 mt-0.5">
              {formatINR(finMetrics.ebitdaPaise)}
            </div>
            <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1">
              {finMetrics.ebitdaMarginPct}% Margin
            </div>
          </div>

          {/* 6. EBIT */}
          <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 block truncate">
              EBIT (Op Profit)
            </span>
            <div className="text-sm sm:text-base font-bold font-mono text-teal-700 dark:text-teal-300 mt-0.5">
              {formatINR(finMetrics.ebitPaise)}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Depr: {formatINR(finMetrics.depreciationPaise)}
            </div>
          </div>

          {/* 7. PBT */}
          <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block truncate">
              PBT (Pre-Tax)
            </span>
            <div className="text-sm sm:text-base font-bold font-mono text-indigo-700 dark:text-indigo-300 mt-0.5">
              {formatINR(finMetrics.pbtPaise)}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
              {finMetrics.pbtMarginPct}% Margin
            </div>
          </div>

          {/* 8. PAT / NP */}
          <div className="p-3 rounded-xl border bg-blue-50/60 dark:bg-blue-950/30 border-blue-500/30">
            <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 block truncate">
              PAT / Net Profit
            </span>
            <div className="text-sm sm:text-base font-bold font-mono text-blue-700 dark:text-blue-200 mt-0.5">
              {formatINR(finMetrics.patPaise)}
            </div>
            <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1">
              {finMetrics.patMarginPct}% Net NP
            </div>
          </div>
        </div>

        {/* Unit Economics per Kilogram & Statutory GST Dual Strips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-xs pt-1">
          {/* Left Box: Per KG Unit Economics & Markups */}
          <div className="p-3.5 rounded-xl border bg-slate-50/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold">
              <span className="flex items-center gap-1.5 text-xs text-[#9E1C23] dark:text-amber-400">
                <Scale className="w-3.5 h-3.5" />
                <span>Unit Economics per Kilogram Packed</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                Volume: {finMetrics.totalKilogramsPacked.toLocaleString()} kg
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[9.5px] font-sans font-semibold text-slate-500 dark:text-slate-400 block">COGS / kg</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">₹{(finMetrics.cogsPerKgPaise / 100).toFixed(2)}</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[9.5px] font-sans font-semibold text-slate-500 dark:text-slate-400 block">OPEX / kg</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">₹{(finMetrics.opexPerKgPaise / 100).toFixed(2)}</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[9.5px] font-sans font-semibold text-slate-500 dark:text-slate-400 block">Total Cost / kg</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{(finMetrics.totalCostPerKgPaise / 100).toFixed(2)}</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[9.5px] font-sans font-semibold text-slate-500 dark:text-slate-400 block">Realization / kg</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">₹{(finMetrics.realizationPerKgPaise / 100).toFixed(2)}</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center col-span-2 sm:col-span-1">
                <span className="text-[9.5px] font-sans font-semibold text-emerald-700 dark:text-emerald-400 block">Markup / kg</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                  +₹{(finMetrics.markupPerKgPaise / 100).toFixed(2)} ({finMetrics.markupPct}%)
                </span>
              </div>
            </div>
          </div>

          {/* Right Box: Statutory GST Compliance & ITC Position */}
          <div className="p-3.5 rounded-xl border bg-slate-50/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-bold">
              <span className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>GST Statutory Compliance &amp; Claimable ITC</span>
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-bold">
                Net ITC Surplus
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[9.5px] font-sans font-semibold text-slate-500 dark:text-slate-400 block">Claimable Input ITC</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatINR(finMetrics.eligibleItcPaise)}</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[9.5px] font-sans font-semibold text-slate-500 dark:text-slate-400 block">Output GST Liability</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{formatINR(finMetrics.outputGstLiabilityPaise)}</span>
              </div>
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-center">
                <span className="text-[9.5px] font-sans font-semibold text-indigo-700 dark:text-indigo-400 block">Net Carry Forward</span>
                <span className="font-bold text-indigo-700 dark:text-indigo-300">
                  +{formatINR(Math.abs(finMetrics.netGstPositionPaise))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Waterfall Progression Bar */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
            <span>P&amp;L Value Conversion: Turnover (100%) ➔ Net Profit ({finMetrics.patMarginPct}%)</span>
            <span>Operating Leverage: EBITDA {finMetrics.ebitdaMarginPct}%</span>
          </div>

          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${finMetrics.cogsPct}%` }}
              title={`COGS: ${finMetrics.cogsPct}%`}
              className="bg-rose-500 h-full flex items-center justify-center text-[9px] font-bold text-white overflow-hidden"
            >
              COGS {finMetrics.cogsPct}%
            </div>
            <div
              style={{ width: `${finMetrics.opexPct}%` }}
              title={`OPEX: ${finMetrics.opexPct}%`}
              className="bg-amber-500 h-full flex items-center justify-center text-[9px] font-bold text-white overflow-hidden"
            >
              OPEX {finMetrics.opexPct}%
            </div>
            <div
              style={{ width: `3%` }}
              title={`Depr + Tax + Fin`}
              className="bg-slate-400 h-full"
            />
            <div
              style={{ width: `${finMetrics.patMarginPct}%` }}
              title={`PAT (Net Profit): ${finMetrics.patMarginPct}%`}
              className="bg-emerald-500 h-full flex items-center justify-center text-[9px] font-bold text-white overflow-hidden"
            >
              PAT {finMetrics.patMarginPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Main 8-Card Money Grid: Dual Light/Dark Theme, Pure Native Adaptive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {/* Card 1: Cash & Bank Accounts */}
        <div className="rounded-xl border p-4 space-y-3 transition flex flex-col justify-between bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 shadow-sm hover:shadow-md">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                <Wallet className="w-4 h-4" />
                <span>Cash &amp; Banks</span>
              </div>
              <button
                onClick={() => onNavigate('expenses')}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-[11px] font-medium flex items-center gap-0.5"
              >
                <span>Accounts</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-slate-900 dark:text-white">
              {formatINR(totalCashAndBankPaise)}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Total liquid balance across 4 accounts</p>

            <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              {accounts.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[150px]">{acc.name}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formatINR(acc.balancePaise)}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('expenses')}
            className="w-full text-center py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
          >
            View Account Ledgers
          </button>
        </div>

        {/* Card 2: Stock Value Breakdown */}
        <div className="rounded-xl border p-4 space-y-3 transition flex flex-col justify-between bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 shadow-sm hover:shadow-md">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#9E1C23] dark:text-amber-400 font-bold text-xs">
                <Boxes className="w-4 h-4" />
                <span>Warehouse Stock Value</span>
              </div>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-[11px] font-medium flex items-center gap-0.5"
              >
                <span>Lots</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-slate-900 dark:text-white">
              {formatINR(totalStockValuePaise)}
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Calculated at weighted landed cost</p>

            <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Raw Spice Powders:</span>
                <span className="font-mono font-bold text-[#9E1C23] dark:text-amber-300">{formatINR(rawStockValuePaise)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Cylinders &amp; Foils:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{formatINR(packingStockValuePaise)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Finished Packaged Goods:</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{formatINR(finishedStockValuePaise)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-sky-700 dark:text-sky-400">
                <span className="font-medium">With 3rd Party Packer:</span>
                <span className="font-mono font-bold">{formatINR(thirdPartyPackerStockValuePaise)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('inventory')}
            className="w-full text-center py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700"
          >
            Inspect Stock &amp; Lots
          </button>
        </div>

        {/* Card 3: Receivables */}
        <div className="rounded-xl border p-4 space-y-3 transition flex flex-col justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-semibold text-xs">
                <ArrowDownLeft className="w-4 h-4" />
                <span>Receivables (Owed to Us)</span>
              </div>
              <span className="text-[10px] text-slate-500">FMCG Dist.</span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatINR(totalReceivablesPaise)}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Pending collections from distributors</p>

            <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 dark:text-slate-300 truncate">Shivam Super Kirana:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">₹3,85,000</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Overdue (&gt; 15 days):</span>
                <span className="font-mono text-slate-400">₹0</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Credit period:</span>
                <span className="text-slate-700 dark:text-slate-300">15 days standard</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('expenses')}
            className="w-full text-center py-1.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
          >
            Party Ledger &amp; Ageing
          </button>
        </div>

        {/* Card 4: Payables */}
        <div className="rounded-xl border p-4 space-y-3 transition flex flex-col justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-xs">
                <ArrowUpRight className="w-4 h-4" />
                <span>Payables (We Owe)</span>
              </div>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">3 Bills Due</span>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {formatINR(totalPayablesPaise)}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Spices, cylinders &amp; third-party packer</p>

            <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 dark:text-slate-300 truncate">Unjha Mandi Spices:</span>
                <span className="font-mono text-slate-900 dark:text-slate-100">₹1,45,000</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 dark:text-slate-300 truncate">Gujarat Polyfilms:</span>
                <span className="font-mono text-slate-900 dark:text-slate-100">₹68,000</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 dark:text-slate-300 truncate">Mahavir (Strip Packer):</span>
                <span className="font-mono text-slate-900 dark:text-slate-100">₹24,500</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('expenses')}
            className="w-full text-center py-1.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
          >
            Record Supplier Payment
          </button>
        </div>

        {/* Card 5: Debt & Loans */}
        <div className="rounded-xl border p-4 space-y-3 transition flex flex-col justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs">
                <Landmark className="w-4 h-4" />
                <span>Debt &amp; Loan Facilities</span>
              </div>
              <button
                onClick={() => onNavigate('debt')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-[11px] flex items-center gap-0.5"
              >
                <span>Schedule</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-slate-900 dark:text-white">
              {formatINR(totalDebtBalancePaise)}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Total active debt balance</p>

            <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 dark:text-slate-300">HDFC Machinery Loan:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">₹3,82,000</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 dark:text-slate-300">SBI CC Drawn Balance:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">₹4,20,000</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#9E1C23] dark:text-amber-300 font-medium">
                <span>Next Month EMI Due:</span>
                <span className="font-mono">{formatINR(totalMonthlyEmiPaise)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('debt')}
            className="w-full text-center py-1.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
          >
            Inspect EMI Schedule
          </button>
        </div>

        {/* Card 6: Machines & Fixed Assets */}
        <div className="rounded-xl border p-4 space-y-3 transition flex flex-col justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-semibold text-xs">
                <Wrench className="w-4 h-4" />
                <span>Machines &amp; Fixed Assets</span>
              </div>
              <button
                onClick={() => onNavigate('machines')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-[11px] flex items-center gap-0.5"
              >
                <span>Assets</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-teal-700 dark:text-teal-300">
              {formatINR(totalAssetsBookValuePaise)}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Net book value after depreciation</p>

            <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              {assets.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300 truncate max-w-[170px]">{a.name}</span>
                  <span className="font-mono text-slate-800 dark:text-slate-300">{formatINR(a.currentBookValuePaise)}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('machines')}
            className="w-full text-center py-1.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
          >
            Machine Register &amp; Logs
          </button>
        </div>

        {/* Card 7: Government Statutory Dues */}
        <div className="rounded-xl border p-4 space-y-3 transition flex flex-col justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-semibold text-xs">
                <ShieldAlert className="w-4 h-4" />
                <span>Statutory Dues (Govt)</span>
              </div>
              <button
                onClick={() => onNavigate('payroll')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-[11px] flex items-center gap-0.5"
              >
                <span>Tax/PF</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-violet-700 dark:text-violet-300">
              {formatINR(statutoryDuesPaise)}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Due by 15th-20th of next month</p>

            <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 dark:text-slate-300">GST Input vs Output:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">₹58,200</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 dark:text-slate-300">PF + ESIC Liability:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">₹21,500</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 dark:text-slate-300">TDS / Prof. Tax:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">₹4,800</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('payroll')}
            className="w-full text-center py-1.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
          >
            View Statutory Challans
          </button>
        </div>

        {/* Card 8: This Month Spend Breakdown */}
        <div className="rounded-xl border p-4 space-y-3 transition flex flex-col justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#9E1C23] dark:text-amber-400 font-semibold text-xs">
                <TrendingDown className="w-4 h-4" />
                <span>This Month Expenses</span>
              </div>
              <button
                onClick={() => onNavigate('expenses')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-[11px] flex items-center gap-0.5"
              >
                <span>Vouchers</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="mt-2 text-xl font-bold font-mono text-slate-900 dark:text-white">
              {formatINR(thisMonthTotalSpendPaise)}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Oct 2026 recorded disbursements</p>

            <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              {Object.entries(spendByHead).slice(0, 3).map(([head, paise]) => (
                <div key={head} className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-300 truncate max-w-[160px]">{head}:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{formatINR(paise)}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('expenses')}
            className="w-full text-center py-1.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
          >
            All Expense Records
          </button>
        </div>
      </div>

      {/* Bottom Section: Traceability & Quick Action Bar */}
      <div className="rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#9E1C23]/10 text-[#9E1C23] dark:text-amber-400 border border-[#9E1C23]/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white">Need CA Audit Pack or Tally Export?</h4>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              Generate complete Tally-compatible XML, item stock registers, and GST input summaries in one tap.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('backup')}
          className="px-4 py-2 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-medium transition text-xs whitespace-nowrap shadow-sm"
        >
          Export CA Audit Pack
        </button>
      </div>
    </div>
  );
};
