import React, { useState } from 'react';
import { Landmark, Calendar, AlertCircle, Percent, ArrowRight, Plus, Edit, Trash2, X } from 'lucide-react';
import { db } from '../../lib/storage';
import { Loan } from '../../types';
import { formatINR, formatDate } from '../../lib/format';

export const DebtModule: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>(db.getLoans());

  // Loan Modal (Create & Edit)
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [lenderName, setLenderName] = useState('');
  const [loanKind, setLoanKind] = useState<Loan['kind']>('machinery');
  const [principalRupees, setPrincipalRupees] = useState(500000);
  const [balanceRupees, setBalanceRupees] = useState(380000);
  const [ratePct, setRatePct] = useState(10.5);
  const [emiRupees, setEmiRupees] = useState(18500);
  const [nextDueDate, setNextDueDate] = useState('2026-11-05');
  const [tenureMonths, setTenureMonths] = useState(24);

  // Repayment Modal
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [payingLoan, setPayingLoan] = useState<Loan | null>(null);
  const [repayAmountRupees, setRepayAmountRupees] = useState(18500);
  const [repayAccountId, setRepayAccountId] = useState('acc_hdfc_curr');

  const reload = () => {
    setLoans(db.getLoans());
  };

  const handleOpenRepay = (loan: Loan) => {
    setPayingLoan(loan);
    setRepayAmountRupees(loan.emiPaise / 100);
    const accounts = db.getAccounts();
    setRepayAccountId(accounts.find((a) => a.type === 'bank')?.id || accounts[0]?.id || '');
    setShowRepayModal(true);
  };

  const handleSaveRepay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingLoan) return;

    const repayPaise = Math.round(repayAmountRupees * 100);
    const accounts = db.getAccounts();
    const account = accounts.find((a) => a.id === repayAccountId) || accounts[0];

    // Deduct loan balance
    const updatedLoan: Loan = {
      ...payingLoan,
      balancePaise: Math.max(0, payingLoan.balancePaise - repayPaise),
      tenureMonthsRemaining: Math.max(0, payingLoan.tenureMonthsRemaining - 1),
    };
    db.updateLoan(updatedLoan);

    // Create financial transaction
    db.addTransaction({
      id: `txn_emi_${Date.now()}`,
      txnNo: `EMI-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      direction: 'out',
      accountId: account.id,
      accountName: account.name,
      partyName: payingLoan.lenderName,
      amountPaise: repayPaise,
      headCategory: 'Bank Loan Repayment',
      mode: 'HDFC NetBanking',
      reference: `EMI / Principle Paydown`,
      status: 'posted',
      notes: `Loan EMI / Paydown for ${payingLoan.lenderName}`,
    });

    setShowRepayModal(false);
    reload();
  };

  // Open Create Loan
  const handleOpenCreateLoan = () => {
    setEditingLoan(null);
    setLenderName('');
    setLoanKind('machinery');
    setPrincipalRupees(500000);
    setBalanceRupees(500000);
    setRatePct(10.5);
    setEmiRupees(18500);
    setNextDueDate('2026-11-05');
    setTenureMonths(24);
    setShowLoanModal(true);
  };

  // Open Edit Loan
  const handleOpenEditLoan = (loan: Loan) => {
    setEditingLoan(loan);
    setLenderName(loan.lenderName);
    setLoanKind(loan.kind);
    setPrincipalRupees(loan.principalPaise / 100);
    setBalanceRupees(loan.balancePaise / 100);
    setRatePct(loan.rateAnnualPct);
    setEmiRupees(loan.emiPaise / 100);
    setNextDueDate(loan.nextDueDate);
    setTenureMonths(loan.tenureMonthsRemaining);
    setShowLoanModal(true);
  };

  // Save Loan
  const handleSaveLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const loanData: Loan = {
      id: editingLoan ? editingLoan.id : `loan_${Date.now()}`,
      lenderName,
      kind: loanKind,
      principalPaise: Math.round(principalRupees * 100),
      balancePaise: Math.round(balanceRupees * 100),
      rateAnnualPct: ratePct,
      emiPaise: Math.round(emiRupees * 100),
      nextDueDate,
      tenureMonthsRemaining: tenureMonths,
    };

    if (editingLoan) {
      db.updateLoan(loanData);
    } else {
      db.addLoan(loanData);
    }

    setShowLoanModal(false);
    reload();
  };

  // Delete Loan
  const handleDeleteLoan = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete loan facility "${name}"?`)) {
      db.deleteLoan(id);
      reload();
    }
  };

  const totalOutstanding = loans.reduce((s, l) => s + l.balancePaise, 0);
  const totalMonthlyEmi = loans.reduce((s, l) => s + l.emiPaise, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E1C23] dark:text-amber-400">
            <span>Module M8</span>
            <span>·</span>
            <span>Adalaj Borrowings, Machinery Loans &amp; Cash Credit</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Debt &amp; EMI Schedule
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
            Track outstanding bank principal, interest burden, and upcoming monthly repayments.
          </p>
        </div>

        <button
          onClick={handleOpenCreateLoan}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold text-xs transition shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Loan / Facility</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 shadow-sm">
          <span className="text-slate-600 dark:text-slate-400 text-[11px] block font-medium">Total Outstanding Debt</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 block">
            {formatINR(totalOutstanding)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Across active bank credit facilities</span>
        </div>
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 shadow-sm">
          <span className="text-slate-600 dark:text-slate-400 text-[11px] block font-medium">Monthly EMI Commitment</span>
          <span className="text-xl font-bold font-mono text-[#9E1C23] dark:text-amber-300 mt-1 block">
            {formatINR(totalMonthlyEmi)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Principal repayment + interest</span>
        </div>
        <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 shadow-sm">
          <span className="text-slate-600 dark:text-slate-400 text-[11px] block font-medium">Average Borrowing Cost</span>
          <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1 block">
            10.1% p.a.
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Weighted annual bank interest</span>
        </div>
      </div>

      {/* Loans Grid with Edit & Delete */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loans.map((loan) => (
          <div key={loan.id} className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-sm">{loan.lenderName}</span>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                  {loan.kind}
                </span>
                <button
                  onClick={() => handleOpenEditLoan(loan)}
                  className="p-1 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  title="Edit Loan"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteLoan(loan.id, loan.lenderName)}
                  className="p-1 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  title="Delete Loan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs p-3 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800">
              <div>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] block font-medium">Sanctioned Limit:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatINR(loan.principalPaise)}</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] block font-medium">Current Balance Drawn:</span>
                <span className="font-mono font-bold text-rose-700 dark:text-rose-400">{formatINR(loan.balancePaise)}</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] block font-medium">Interest Rate:</span>
                <span className="font-mono text-[#9E1C23] dark:text-amber-300 font-bold">{loan.rateAnnualPct}% p.a.</span>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 text-[11px] block font-medium">Monthly EMI:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{formatINR(loan.emiPaise)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
              <span>Next Due Date: <strong className="text-slate-900 dark:text-white font-bold">{formatDate(loan.nextDueDate)}</strong></span>
              <span>Tenure Remaining: <strong className="text-slate-800 dark:text-slate-200 font-bold">{loan.tenureMonthsRemaining} mos</strong></span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => handleOpenRepay(loan)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 font-semibold text-xs transition"
              >
                <span>Record EMI Repayment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Loan Modal (Create & Edit) */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 p-5 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingLoan ? 'Edit Loan Facility' : 'Add New Bank Loan / Credit Facility'}
              </h3>
              <button
                onClick={() => setShowLoanModal(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLoan} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Lender / Facility Name
                </label>
                <input
                  type="text"
                  required
                  value={lenderName}
                  onChange={(e) => setLenderName(e.target.value)}
                  placeholder="e.g. HDFC Machinery Term Loan #2"
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-[#9E1C23]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Loan Kind
                  </label>
                  <select
                    value={loanKind}
                    onChange={(e) => setLoanKind(e.target.value as any)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="machinery">Machinery Term Loan</option>
                    <option value="overdraft">Cash Credit / Overdraft</option>
                    <option value="credit_card">Business Credit Card</option>
                    <option value="personal">Director / Unsecured Loan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Interest Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={ratePct}
                    onChange={(e) => setRatePct(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Sanctioned Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={principalRupees}
                    onChange={(e) => setPrincipalRupees(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Outstanding Balance (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={balanceRupees}
                    onChange={(e) => setBalanceRupees(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Monthly EMI (₹)
                  </label>
                  <input
                    type="number"
                    required
                    value={emiRupees}
                    onChange={(e) => setEmiRupees(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Tenure (Months)
                  </label>
                  <input
                    type="number"
                    required
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLoanModal(false)}
                  className="w-1/3 py-2.5 rounded-lg border bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold transition shadow-sm"
                >
                  {editingLoan ? 'Save Loan Changes' : 'Record Loan Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Repayment Modal */}
      {showRepayModal && payingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 p-5 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Record EMI Repayment
              </h3>
              <button
                onClick={() => setShowRepayModal(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300">
              Paying down loan facility: <strong className="text-slate-900 dark:text-white">{payingLoan.lenderName}</strong>
            </p>

            <form onSubmit={handleSaveRepay} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Repayment / EMI Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={repayAmountRupees}
                  onChange={(e) => setRepayAmountRupees(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold font-mono focus:border-[#9E1C23]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Pay From Bank Account *
                </label>
                <select
                  value={repayAccountId}
                  onChange={(e) => setRepayAccountId(e.target.value)}
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                >
                  {db.getAccounts().map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Balance: {formatINR(a.balancePaise)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-300 text-xs font-medium">
                This transaction will deduct {formatINR(Math.round(repayAmountRupees * 100))} from your bank balance and reduce outstanding debt on this loan.
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRepayModal(false)}
                  className="w-1/3 py-2.5 rounded-lg border bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
                >
                  Confirm &amp; Post Repayment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
