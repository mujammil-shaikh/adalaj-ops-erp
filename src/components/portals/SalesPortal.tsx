import React, { useState } from 'react';
import {
  Calculator,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  Building2,
  Globe,
  ArrowRight,
  ShieldAlert,
  Percent,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  AuthUser,
  SalesQuotation,
  SalesInvoice,
  BlendedCostCalculation,
  MandiSpotRateRecord,
  PaymentCreditTerm,
} from '../../types';
import { db } from '../../lib/storage';
import { formatINR } from '../../lib/format';
import { RoleTodoAndReportBar } from './RoleTodoAndReportBar';

interface SalesPortalProps {
  currentUser: AuthUser;
  onNavigateModule: (module: string) => void;
}

export const SalesPortal: React.FC<SalesPortalProps> = ({
  currentUser,
  onNavigateModule,
}) => {
  const [quotations, setQuotations] = useState<SalesQuotation[]>(() => db.getSalesQuotations());
  const [invoices, setInvoices] = useState<SalesInvoice[]>(() => db.getSalesInvoices());
  const mandiRates = db.getMandiSpotRates();

  // Blended Cost Calculator States
  const [calcSpice, setCalcSpice] = useState('Chilli');
  const [calcTotalKg, setCalcTotalKg] = useState(18000); // 1 container = 18,000 kg
  const [calcStockOnHandKg, setCalcStockOnHandKg] = useState(10800); // 60%
  const [calcHistoricalCostRupees, setCalcHistoricalCostRupees] = useState(180);
  const [calcSpotRateRupees, setCalcSpotRateRupees] = useState(220); // Guntur spot
  const [calcMillingShrinkagePct, setCalcMillingShrinkagePct] = useState(2.0);
  const [calcPackagingCostRupees, setCalcPackagingCostRupees] = useState(8.5); // Tier 1 + 2 + 3
  const [calcOpexRupees, setCalcOpexRupees] = useState(12.0);
  const [calcMarginPct, setCalcMarginPct] = useState(15.0);
  const [calcExchangeRate, setCalcExchangeRate] = useState(83.5);

  // Live calculation
  const blendResult: BlendedCostCalculation = db.calculateBlendedCost({
    spiceName: calcSpice,
    totalRequiredKg: Number(calcTotalKg) || 1,
    stockOnHandKg: Number(calcStockOnHandKg) || 0,
    stockHistoricalCostRupees: Number(calcHistoricalCostRupees) || 0,
    spotMarketRateRupees: Number(calcSpotRateRupees) || 0,
    millingShrinkagePct: Number(calcMillingShrinkagePct) || 2.0,
    packagingCostPerKg: Number(calcPackagingCostRupees) || 8.0,
    opexAllocationPerKg: Number(calcOpexRupees) || 12.0,
    targetProfitMarginPct: Number(calcMarginPct) || 15.0,
    exchangeRateUsd: Number(calcExchangeRate) || 83.5,
  });

  const stockRatioPct = Math.round((blendResult.stockOnHandKg / (blendResult.totalRequiredKg || 1)) * 100);
  const deficitRatioPct = 100 - stockRatioPct;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-blue-900/10 dark:border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent backdrop-blur-sm shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Sales & Client Quotation Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Commercial CRM, 60/40 blended cost ratio engine, advance payment verification & dispatch clearance
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateModule('invoices')}
          className="px-4 py-2 rounded-xl bg-[#9E1C23] hover:bg-[#83161C] text-white text-xs font-bold flex items-center gap-2 shadow cursor-pointer"
        >
          <FileText className="w-4 h-4" />
          <span>Open Full Invoices Engine</span>
        </button>
      </div>

      {/* 2. Pinned Universal Daily TO-DO Stack */}
      <RoleTodoAndReportBar
        currentRole="salesman"
        currentUserName={currentUser.name}
        onNavigateModule={onNavigateModule}
      />

      {/* 3. BLENDED COST RATIO CALCULATOR (60% STORED / 40% SPOT ENGINE) */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Blended Cost Ratio Calculator (Warehouse Stock vs Spot Mandi Purchases)
              </h2>
              <p className="text-[11px] text-slate-500">
                Calculates weighted procurement cost when order exceeds inventory on hand (e.g. 60% stored @ historical rate + 40% spot purchase).
              </p>
            </div>
          </div>

          <span className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            Real-Time Formula: (Stock% × Old) + (Deficit% × Spot)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Column */}
          <div className="lg:col-span-2 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1">Spice Commodity</label>
                <select
                  value={calcSpice}
                  onChange={(e) => {
                    setCalcSpice(e.target.value);
                    const matchingRate = mandiRates.find((r) => r.spiceName === e.target.value);
                    if (matchingRate) setCalcSpotRateRupees(matchingRate.spotRatePerKgRupees);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                >
                  <option value="Chilli">Red Chilli Powder (Mirch)</option>
                  <option value="Turmeric">Turmeric Powder (Haldi)</option>
                  <option value="Coriander">Coriander Powder (Dhanya)</option>
                  <option value="Cumin">Cumin Powder (Jeera)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Total Target Order (kg)</label>
                <input
                  type="number"
                  min="1"
                  value={calcTotalKg}
                  onChange={(e) => {
                    const total = Number(e.target.value) || 1;
                    setCalcTotalKg(total);
                    // auto-calibrate 60% default
                    setCalcStockOnHandKg(Math.round(total * 0.6));
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Exchange Rate (₹ / USD)</label>
                <input
                  type="number"
                  step="0.1"
                  value={calcExchangeRate}
                  onChange={(e) => setCalcExchangeRate(Number(e.target.value) || 83.5)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Split Weights Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Existing Stock on Hand: {stockRatioPct}%
                  </span>
                  <span className="text-[10px] text-slate-400">Historical Cost</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={calcStockOnHandKg}
                    onChange={(e) => setCalcStockOnHandKg(Number(e.target.value) || 0)}
                    placeholder="Stock kg"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-slate-400">₹</span>
                    <input
                      type="number"
                      value={calcHistoricalCostRupees}
                      onChange={(e) => setCalcHistoricalCostRupees(Number(e.target.value) || 0)}
                      placeholder="Cost / kg"
                      className="w-full pl-6 pr-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Deficit to Buy from Spot: {deficitRatioPct}%
                  </span>
                  <span className="text-[10px] text-slate-400">Current Mandi Rate</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    disabled
                    value={blendResult.deficitToProcureKg}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 font-mono text-slate-500 cursor-not-allowed"
                  />
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-slate-400">₹</span>
                    <input
                      type="number"
                      value={calcSpotRateRupees}
                      onChange={(e) => setCalcSpotRateRupees(Number(e.target.value) || 0)}
                      placeholder="Spot / kg"
                      className="w-full pl-6 pr-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-emerald-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Overheads & Margin Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold mb-1">Milling Loss %</label>
                <input
                  type="number"
                  step="0.5"
                  value={calcMillingShrinkagePct}
                  onChange={(e) => setCalcMillingShrinkagePct(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Packaging (T1+2+3) ₹/kg</label>
                <input
                  type="number"
                  step="0.5"
                  value={calcPackagingCostRupees}
                  onChange={(e) => setCalcPackagingCostRupees(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Factory OPEX ₹/kg</label>
                <input
                  type="number"
                  step="0.5"
                  value={calcOpexRupees}
                  onChange={(e) => setCalcOpexRupees(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Profit Margin %</label>
                <input
                  type="number"
                  step="1"
                  value={calcMarginPct}
                  onChange={(e) => setCalcMarginPct(Number(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 pb-2 border-b border-slate-700">
                <span>Weighted Landed Pricing</span>
                <span className="font-mono text-emerald-400">
                  {stockRatioPct}% Stored / {deficitRatioPct}% Spot
                </span>
              </div>

              <div className="space-y-2 mt-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Blended Base Raw Cost:</span>
                  <span className="font-mono font-bold">₹{blendResult.blendedRawCostPerKg.toFixed(2)}/kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">After Grinding (2% Loss):</span>
                  <span className="font-mono font-bold">₹{blendResult.milledCostPerKg.toFixed(2)}/kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Factory Landed (with OPEX & Pkg):</span>
                  <span className="font-mono font-bold text-amber-300">₹{blendResult.totalLandedCostPerKg.toFixed(2)}/kg</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700 space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Recommended Quote Price (+{calcMarginPct}% Margin)
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    ₹{blendResult.recommendedQuotedPricePerKg.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-300">/ kg</span>
                </div>
                <div className="text-xs font-mono text-slate-300 mt-0.5">
                  USD: <strong className="text-white">${blendResult.recommendedQuotedPriceUSD.toFixed(2)}</strong> / kg (FOB Mundra)
                </div>
              </div>

              <button
                onClick={() => onNavigateModule('invoices')}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Quotation with this Cost</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ACTIVE SALES QUOTATIONS & COMMERCIAL CONTRACTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#9E1C23] dark:text-amber-400" />
            <span>Active Quotations & Commercial Proposals ({quotations.length})</span>
          </h3>
          <span className="text-slate-500">
            Terms: Advance / On-Dispatch standard · +2.0% credit markup
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotations.map((quo) => (
            <div
              key={quo.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {quo.quotationNo}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    quo.status === 'accepted'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  {quo.status}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {quo.buyerName}
                </h4>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>Valid until: {quo.validUntilDate}</span>
                  <span>·</span>
                  <span>Credit: {quo.creditTerms.replace('_', ' ').toUpperCase()}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between">
                <span>Total Quotation Value:</span>
                <strong className="text-sm font-black text-slate-900 dark:text-white">
                  {formatINR(quo.grandTotalPaise)}
                </strong>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[11px] text-slate-400">
                  Items: {quo.items.map((i) => i.name).join(', ')}
                </span>
                <button
                  onClick={() => onNavigateModule('invoices')}
                  className="text-xs font-bold text-[#9E1C23] dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  View Details ➔
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
