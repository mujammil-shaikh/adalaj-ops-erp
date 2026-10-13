import React, { useState } from 'react';
import {
  DollarSign,
  FileText,
  CreditCard,
  Scale,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Building2,
  Landmark,
  Receipt,
  Sparkles,
} from 'lucide-react';
import {
  AuthUser,
  SalesInvoice,
  Bill,
  FinancialHorizon,
} from '../../types';
import { db } from '../../lib/storage';
import { formatINR } from '../../lib/format';
import { RoleTodoAndReportBar } from './RoleTodoAndReportBar';

interface FinancePortalProps {
  currentUser: AuthUser;
  onNavigateModule: (module: string) => void;
}

export const FinancePortal: React.FC<FinancePortalProps> = ({
  currentUser,
  onNavigateModule,
}) => {
  const [invoices, setInvoices] = useState<SalesInvoice[]>(() => db.getSalesInvoices());
  const [bills, setBills] = useState<Bill[]>(() => db.getBills());
  const fin = db.getFinancialIntelligence('all', 'monthly_mom');

  const pendingCollectionInvoices = invoices.filter((i) => i.balanceDuePaise > 0);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-indigo-900/10 dark:border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent backdrop-blur-sm shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Chief Accountant & Finance Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Advance payment verification, Section 31 tax invoices, statutory GST ITC reconciliation & cash flow clearance
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateModule('invoices')}
          className="px-4 py-2 rounded-xl bg-[#9E1C23] hover:bg-[#83161C] text-white text-xs font-bold flex items-center gap-2 shadow cursor-pointer"
        >
          <Receipt className="w-4 h-4" />
          <span>New Invoice / Export Bill</span>
        </button>
      </div>

      {/* 2. Pinned Universal Daily TO-DO Stack */}
      <RoleTodoAndReportBar
        currentRole="accountant"
        currentUserName={currentUser.name}
        onNavigateModule={onNavigateModule}
      />

      {/* 3. EXECUTIVE FINANCIAL CASH POSITION STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Monthly Invoiced</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatINR(fin.revenuePaise)}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">
            {invoices.length} invoices issued
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eligible Input GST (ITC)</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatINR(fin.eligibleItcPaise)}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 inline-block">
            Claimable vs Raw/PM bills
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Output GST Liability</span>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {formatINR(fin.outputGstLiabilityPaise)}
          </div>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 inline-block">
            Net Surplus: {formatINR(Math.abs(fin.netGstPositionPaise))}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Receivables</span>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatINR(pendingCollectionInvoices.reduce((acc, i) => acc + i.balanceDuePaise, 0))}
          </div>
          <span className="text-[10px] text-amber-600 font-semibold mt-1 inline-block">
            {pendingCollectionInvoices.length} open customer balances
          </span>
        </div>
      </div>

      {/* 4. ADVANCE PAYMENT VERIFICATION & CLEARANCE QUEUE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Advance Payment Verification Queue (Before Dispatch / Production)</span>
          </h3>
          <span className="text-[11px] text-slate-400">
            Export orders require verified advance before releasing factory floor batches
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {inv.invoiceNo}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    inv.status === 'paid'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  {inv.status}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {inv.buyerName}
                </h4>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Credit Terms: <strong>{inv.creditTerms.replace('_', ' ').toUpperCase()}</strong>
                  {inv.creditSurchargeRatePct > 0 && ` (+${inv.creditSurchargeRatePct}% surcharge)`}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Grand Total</span>
                  <strong>{formatINR(inv.grandTotalPaise)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-600 block font-sans">Paid</span>
                  <strong className="text-emerald-600">{formatINR(inv.paidAmountPaise)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-rose-600 block font-sans">Balance Due</span>
                  <strong className="text-rose-600">{formatINR(inv.balanceDuePaise)}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[10px] text-slate-400 font-mono">
                  {inv.isExport ? `Export LUT · Mundra Port (INMUN1)` : `GST State Code: ${inv.buyerStateCode}`}
                </span>
                <button
                  onClick={() => onNavigateModule('invoices')}
                  className="text-xs font-bold text-[#9E1C23] dark:text-amber-400 hover:underline"
                >
                  Manage Invoice ➔
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
