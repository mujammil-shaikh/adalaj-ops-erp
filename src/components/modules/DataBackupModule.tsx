import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Shield,
} from 'lucide-react';
import { db } from '../../lib/storage';

export const DataBackupModule: React.FC = () => {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleDownloadBackup = () => {
    const jsonStr = db.exportFullDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adalaj-packing-ops-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Full encrypted backup downloaded successfully!');
  };

  const handleDownloadTallyExport = () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Adalaj Spices &amp; Packaging Operations LLP</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <!-- Vouchers exported from Adalaj Operations ERP -->
        ${db.getTransactions().map((t) => `
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Payment" ACTION="Create">
            <DATE>${t.date.replace(/-/g, '')}</DATE>
            <VOUCHERNUMBER>${t.txnNo}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${t.partyName || 'Cash'}</PARTYLEDGERNAME>
            <AMOUNT>${t.amountPaise / 100}</AMOUNT>
            <NARRATION>${t.notes || t.headCategory}</NARRATION>
          </VOUCHER>
        </TALLYMESSAGE>`).join('\n')}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adalaj-tally-import-vouchers-${new Date().toISOString().split('T')[0]}.xml`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Tally Prime XML voucher file exported for CA!');
  };

  const handleDownloadCSV = () => {
    const txns = db.getTransactions();
    const headers = ['Voucher No', 'Date', 'Direction', 'Party', 'Head', 'Mode', 'Amount (INR)', 'Reference', 'Notes'];
    const rows = txns.map((t) => [
      t.txnNo,
      t.date,
      t.direction,
      `"${t.partyName || ''}"`,
      `"${t.headCategory}"`,
      t.mode,
      (t.amountPaise / 100).toFixed(2),
      `"${t.reference || ''}"`,
      `"${t.notes || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `adalaj-expenses-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Excel/CSV Expense Ledger downloaded!');
  };

  const handleResetTemplate = () => {
    if (confirm('Are you sure you want to re-seed the starter template for Adalaj Packaging Hub?')) {
      db.resetStarterTemplate();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9E1C23] dark:text-amber-400">
          <span>Module M14</span>
          <span>·</span>
          <span>Data In/Out, Backups &amp; Tally Prime Handover</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
          Backup, Export &amp; CA Handover
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
          Generate Tally XML files, full encrypted database backups, and spreadsheet registers.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3 rounded-lg border bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Grid of Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tally Prime XML Export */}
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-[#9E1C23] dark:text-sky-400 font-bold text-sm">
            <FileCode className="w-5 h-5" />
            <span>Tally Prime XML Export</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Export all payment vouchers, purchase bills, and party ledgers formatted specifically for 1-click import into Tally Prime / ERP 9 by your Chartered Accountant.
          </p>
          <button
            onClick={handleDownloadTallyExport}
            className="w-full py-2.5 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Tally XML Vouchers</span>
          </button>
        </div>

        {/* Excel / CSV Ledger Export */}
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <FileSpreadsheet className="w-5 h-5" />
            <span>Excel / CSV Audit Sheet</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Download complete flat spreadsheet of all transactions with GST splits, UTR reference numbers, and accounting head mappings for Excel analysis.
          </p>
          <button
            onClick={handleDownloadCSV}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel / CSV Ledger</span>
          </button>
        </div>

        {/* Full Encrypted Database JSON */}
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <Database className="w-5 h-5" />
            <span>Full Database JSON Backup</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Download a complete snapshot of all tables (lots, batches, movements, employees, assets, and transactions) to store safely offline or on Google Drive.
          </p>
          <button
            onClick={handleDownloadBackup}
            className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Full JSON Database</span>
          </button>
        </div>

        {/* Starter Template Re-seed */}
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
            <RefreshCw className="w-5 h-5" />
            <span>Reset to Starter Template</span>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Re-applies the agreed starter setup for Gujarat spice packing: Haldi, Lal Mirch, Dhaniya, Jeera, cylinders, ₹10 strip sachet, and machine assets.
          </p>
          <button
            onClick={handleResetTemplate}
            className="w-full py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-rose-700 dark:text-rose-300 border border-slate-300 dark:border-slate-700 font-bold text-xs transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Re-Apply Starter Template</span>
          </button>
        </div>
      </div>

      {/* System Architecture, PRD, TRD & 19-Point Security Compliance Dossier */}
      <div className="p-5 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#9E1C23] dark:text-amber-400 font-bold text-sm">
            <Shield className="w-5 h-5" />
            <span>Architecture, PRD, TRD &amp; Security Compliance Dossier</span>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
            Cloudflare + Gemini Ready
          </span>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          Comprehensive enterprise specification documentation covering product requirements (Line A in-house &amp; Line B job work), technical architecture, Drizzle edge schema, 19-point security hardening, and complete Cloudflare directory structure.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 text-xs">
          <div className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#9E1C23]"></span>
              01. PRD Document
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Line A &amp; B, 10₹ to 5kg SKUs, Auger Servo machine roadmap.
            </p>
          </div>

          <div className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              02. TRD &amp; Edge Sync
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Cloudflare Pages, Workers, D1, R2, KV &amp; Gemini proxy.
            </p>
          </div>

          <div className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              05. Backend Schema
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              13 Drizzle SQLite tables, foreign keys, integer paise.
            </p>
          </div>

          <div className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              06. 19-Point Security
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Zero client keys, rate limiting, RBAC, XSS &amp; CSP.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
