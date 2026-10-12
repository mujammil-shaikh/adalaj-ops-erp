import React, { useState } from 'react';
import {
  Wallet,
  PlusCircle,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle,
  Camera,
  ArrowRight,
  TrendingDown,
  Building,
  Edit,
  Trash2,
  X,
  Plus,
} from 'lucide-react';
import { db } from '../../lib/storage';
import { Transaction, Account, Bill, Party } from '../../types';
import { formatINR, formatDate } from '../../lib/format';

export const ExpensesModule: React.FC<{ initialShowQuickAdd?: boolean }> = ({
  initialShowQuickAdd = false,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>(db.getTransactions());
  const [accounts, setAccounts] = useState<Account[]>(db.getAccounts());
  const [bills, setBills] = useState<Bill[]>(db.getBills());
  const [parties, setParties] = useState<Party[]>(db.getParties());

  const [activeTab, setActiveTab] = useState<'vouchers' | 'bills' | 'accounts' | 'parties'>('vouchers');

  // Expense Modal (Create & Edit)
  const [showExpenseModal, setShowExpenseModal] = useState(initialShowQuickAdd);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [amountRupees, setAmountRupees] = useState('');
  const [partyName, setPartyName] = useState('');
  const [headCategory, setHeadCategory] = useState('Raw Material Purchase');
  const [mode, setMode] = useState<Transaction['mode']>('HDFC NetBanking');
  const [accountId, setAccountId] = useState(accounts[1]?.id || 'acc_hdfc_curr');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Bill Modal (Create & Edit)
  const [showBillModal, setShowBillModal] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [billNo, setBillNo] = useState('');
  const [billPartyName, setBillPartyName] = useState('');
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [billDueDate, setBillDueDate] = useState('');
  const [billSubtotalRupees, setBillSubtotalRupees] = useState(50000);
  const [billGstRupees, setBillGstRupees] = useState(2500);
  const [billPaidRupees, setBillPaidRupees] = useState(0);
  const [billDesc, setBillDesc] = useState('');

  // Account Modal (Create & Edit)
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<Account['type']>('bank');
  const [accNoMasked, setAccNoMasked] = useState('');
  const [accBalanceRupees, setAccBalanceRupees] = useState(50000);

  // Party Modal (Create & Edit)
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [pName, setPName] = useState('');
  const [pType, setPType] = useState<Party['type']>('supplier');
  const [pPhone, setPPhone] = useState('+91 98250 11111');
  const [pGstin, setPGstin] = useState('24AAGCS9412F1Z4');
  const [pCity, setPCity] = useState('Unjha');
  const [pCreditDays, setPCreditDays] = useState(30);
  const [pOutstandingRupees, setPOutstandingRupees] = useState(0);

  const reload = () => {
    setTransactions(db.getTransactions());
    setAccounts(db.getAccounts());
    setBills(db.getBills());
    setParties(db.getParties());
  };

  // Open Create Expense
  const handleOpenCreateExpense = () => {
    setEditingTxn(null);
    setAmountRupees('');
    setPartyName('');
    setHeadCategory('Raw Material Purchase');
    setMode('HDFC NetBanking');
    setAccountId(accounts[1]?.id || accounts[0]?.id || '');
    setDate(new Date().toISOString().split('T')[0]);
    setReference('');
    setNotes('');
    setHasPhoto(false);
    setDuplicateWarning(null);
    setShowExpenseModal(true);
  };

  // Open Edit Expense
  const handleOpenEditExpense = (txn: Transaction) => {
    setEditingTxn(txn);
    setAmountRupees((txn.amountPaise / 100).toString());
    setPartyName(txn.partyName || '');
    setHeadCategory(txn.headCategory);
    setMode(txn.mode);
    setAccountId(txn.accountId);
    setDate(txn.date);
    setReference(txn.reference || '');
    setNotes(txn.notes || '');
    setHasPhoto(!!txn.hasAttachment);
    setDuplicateWarning(null);
    setShowExpenseModal(true);
  };

  // Check duplicate
  const checkDuplicate = (amount: number, pName: string, dt: string) => {
    const paise = Math.round(amount * 100);
    const dup = transactions.find(
      (t) =>
        t.id !== editingTxn?.id &&
        t.amountPaise === paise &&
        t.partyName?.toLowerCase() === pName.toLowerCase() &&
        t.date === dt
    );
    if (dup) {
      setDuplicateWarning(
        `Warning: An identical payment of ${formatINR(paise)} to "${pName}" on ${dt} already exists (${dup.txnNo})!`
      );
    } else {
      setDuplicateWarning(null);
    }
  };

  // Save Expense
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(amountRupees);
    if (!amountVal || amountVal <= 0) return;

    const amountPaise = Math.round(amountVal * 100);
    const selectedAcc = accounts.find((a) => a.id === accountId) || accounts[0];

    const txnData: Transaction = {
      id: editingTxn ? editingTxn.id : `txn_${Date.now()}`,
      txnNo: editingTxn ? editingTxn.txnNo : `TXN-2026-${Math.floor(100 + Math.random() * 900)}`,
      date,
      direction: 'out',
      accountId: selectedAcc.id,
      accountName: selectedAcc.name,
      partyName: partyName || 'Miscellaneous Expense',
      amountPaise,
      headCategory,
      mode,
      reference: reference || 'Voucher',
      status: amountPaise > 5000000 ? 'pending_approval' : 'posted',
      notes,
      hasAttachment: hasPhoto,
    };

    if (editingTxn) {
      db.updateTransaction(txnData);
    } else {
      db.addTransaction(txnData);
    }

    setShowExpenseModal(false);
    reload();
  };

  // Delete Expense
  const handleDeleteExpense = (id: string, txnNo: string) => {
    if (confirm(`Are you sure you want to delete / void voucher "${txnNo}"?`)) {
      db.deleteTransaction(id);
      reload();
    }
  };

  // Open Create Bill
  const handleOpenCreateBill = () => {
    setEditingBill(null);
    setBillNo(`BILL-${Math.floor(1000 + Math.random() * 9000)}`);
    setBillPartyName(parties[0]?.name || 'Unjha Mandi Spice Traders');
    setBillDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setBillDueDate(d.toISOString().split('T')[0]);
    setBillSubtotalRupees(50000);
    setBillGstRupees(2500);
    setBillPaidRupees(0);
    setBillDesc('Bulk spices and packing materials invoice');
    setShowBillModal(true);
  };

  // Open Edit Bill
  const handleOpenEditBill = (bill: Bill) => {
    setEditingBill(bill);
    setBillNo(bill.billNo);
    setBillPartyName(bill.partyName);
    setBillDate(bill.date);
    setBillDueDate(bill.dueDate);
    setBillSubtotalRupees(bill.subtotalPaise / 100);
    setBillGstRupees(bill.gstPaise / 100);
    setBillPaidRupees(bill.paidPaise / 100);
    setBillDesc(bill.itemsDescription);
    setShowBillModal(true);
  };

  // Save Bill
  const handleSaveBill = (e: React.FormEvent) => {
    e.preventDefault();
    const subtotalPaise = Math.round(billSubtotalRupees * 100);
    const gstPaise = Math.round(billGstRupees * 100);
    const totalPaise = subtotalPaise + gstPaise;
    const paidPaise = Math.round(billPaidRupees * 100);
    let status: Bill['status'] = 'pending';
    if (paidPaise >= totalPaise) status = 'paid';
    else if (paidPaise > 0) status = 'part_paid';

    const billData: Bill = {
      id: editingBill ? editingBill.id : `bill_${Date.now()}`,
      billNo,
      partyId: `party_${Date.now()}`,
      partyName: billPartyName,
      date: billDate,
      dueDate: billDueDate,
      subtotalPaise,
      gstPaise,
      totalPaise,
      paidPaise,
      status,
      itemsDescription: billDesc,
    };

    if (editingBill) {
      db.updateBill(billData);
    } else {
      db.addBill(billData);
    }

    setShowBillModal(false);
    reload();
  };

  // Delete Bill
  const handleDeleteBill = (id: string, bNo: string) => {
    if (confirm(`Are you sure you want to delete vendor bill "${bNo}"?`)) {
      db.deleteBill(id);
      reload();
    }
  };

  // Open Create Account
  const handleOpenCreateAccount = () => {
    setEditingAccount(null);
    setAccName('');
    setAccType('bank');
    setAccNoMasked('•••• 1234');
    setAccBalanceRupees(50000);
    setShowAccountModal(true);
  };

  // Open Edit Account
  const handleOpenEditAccount = (acc: Account) => {
    setEditingAccount(acc);
    setAccName(acc.name);
    setAccType(acc.type);
    setAccNoMasked(acc.accountNoMasked || '');
    setAccBalanceRupees(acc.balancePaise / 100);
    setShowAccountModal(true);
  };

  // Save Account
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const balancePaise = Math.round(accBalanceRupees * 100);
    const accData: Account = {
      id: editingAccount ? editingAccount.id : `acc_${Date.now()}`,
      name: accName,
      type: accType,
      accountNoMasked: accNoMasked || undefined,
      balancePaise,
    };

    if (editingAccount) {
      db.updateAccount(accData);
    } else {
      db.addAccount(accData);
    }

    setShowAccountModal(false);
    reload();
  };

  // Delete Account
  const handleDeleteAccount = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete account "${name}"?`)) {
      db.deleteAccount(id);
      reload();
    }
  };

  // Open Create Party
  const handleOpenCreateParty = () => {
    setEditingParty(null);
    setPName('');
    setPType('supplier');
    setPPhone('+91 98250 12345');
    setPGstin('24AAGCS9412F1Z4');
    setPCity('Unjha');
    setPCreditDays(30);
    setPOutstandingRupees(0);
    setShowPartyModal(true);
  };

  // Open Edit Party
  const handleOpenEditParty = (party: Party) => {
    setEditingParty(party);
    setPName(party.name);
    setPType(party.type);
    setPPhone(party.phone);
    setPGstin(party.gstin || '');
    setPCity(party.city);
    setPCreditDays(party.creditDays);
    setPOutstandingRupees(party.outstandingPaise / 100);
    setShowPartyModal(true);
  };

  // Save Party
  const handleSaveParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim()) return;

    const partyData: Party = {
      id: editingParty ? editingParty.id : `party_${Date.now()}`,
      name: pName.trim(),
      type: pType,
      phone: pPhone.trim(),
      gstin: pGstin.trim() || undefined,
      city: pCity.trim(),
      creditDays: Number(pCreditDays) || 0,
      outstandingPaise: Math.round(pOutstandingRupees * 100),
    };

    if (editingParty) {
      db.updateParty(partyData);
    } else {
      db.addParty(partyData);
    }

    setShowPartyModal(false);
    reload();
  };

  // Delete Party
  const handleDeleteParty = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete vendor / party "${name}"?`)) {
      db.deleteParty(id);
      reload();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E1C23] dark:text-amber-400">
            <span>Module M2 &amp; M3</span>
            <span>·</span>
            <span>Adalaj Disbursements, Bills &amp; Vendor Directory</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Expenses, Bills, Accounts &amp; Vendors
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
            Quick 5-field recording, payable vendor bills, duplicate alerts, cash/bank balances, and vendor directory.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'vouchers' && (
            <button
              onClick={handleOpenCreateExpense}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold text-xs transition shadow-sm active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Record Expense</span>
            </button>
          )}
          {activeTab === 'bills' && (
            <button
              onClick={handleOpenCreateBill}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold text-xs transition shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Vendor Bill</span>
            </button>
          )}
          {activeTab === 'accounts' && (
            <button
              onClick={handleOpenCreateAccount}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold text-xs transition shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Account</span>
            </button>
          )}
          {activeTab === 'parties' && (
            <button
              onClick={handleOpenCreateParty}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold text-xs transition shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Vendor / Party</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg border bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs w-fit">
        <button
          onClick={() => setActiveTab('vouchers')}
          className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
            activeTab === 'vouchers'
              ? 'bg-[#9E1C23] text-white'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          Expense Vouchers ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('bills')}
          className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
            activeTab === 'bills'
              ? 'bg-[#9E1C23] text-white'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          Vendor Bills &amp; Payables ({bills.length})
        </button>
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
            activeTab === 'accounts'
              ? 'bg-[#9E1C23] text-white'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          Cash &amp; Bank Accounts ({accounts.length})
        </button>
        <button
          onClick={() => setActiveTab('parties')}
          className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
            activeTab === 'parties'
              ? 'bg-[#9E1C23] text-white'
              : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          Parties &amp; Vendors ({parties.length})
        </button>
      </div>

      {/* Tab 1: Expense Vouchers Table with Edit/Delete */}
      {activeTab === 'vouchers' && (
        <div className="rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-3 border-b bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">All Recorded Disbursements</span>
            <span className="text-slate-600 dark:text-slate-400 text-[11px]">Sorted by latest date</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Voucher #</th>
                  <th className="py-2.5 px-3">Paid To / Party</th>
                  <th className="py-2.5 px-3">Expense Head</th>
                  <th className="py-2.5 px-3">Mode &amp; Account</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {formatDate(t.date)}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#9E1C23] dark:text-amber-400">
                      {t.txnNo}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      {t.partyName || '-'}
                      {t.hasAttachment && (
                        <span className="ml-1.5 text-[10px] text-sky-700 dark:text-sky-400 font-mono font-bold">
                          📎 Bill
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">{t.headCategory}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      <span>{t.mode}</span> · <span className="text-slate-900 dark:text-slate-200 font-medium">{t.accountName}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatINR(t.amountPaise)}
                    </td>
                    <td className="py-2.5 px-3">
                      {t.status === 'posted' ? (
                        <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Posted
                        </span>
                      ) : (
                        <span className="text-amber-700 dark:text-amber-400 text-[11px] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Awaiting Owner
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditExpense(t)}
                          title="Edit Voucher"
                          className="p-1 rounded text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(t.id, t.txnNo)}
                          title="Delete Voucher"
                          className="p-1 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Vendor Bills Table with Edit/Delete */}
      {activeTab === 'bills' && (
        <div className="rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Bill No</th>
                  <th className="py-2.5 px-3">Supplier Name</th>
                  <th className="py-2.5 px-3">Bill Date</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3 text-right">Total Bill</th>
                  <th className="py-2.5 px-3 text-right">Paid</th>
                  <th className="py-2.5 px-3 text-right">Outstanding</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {bills.map((b) => {
                  const pending = b.totalPaise - b.paidPaise;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">{b.billNo}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{b.partyName}</td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-400">{formatDate(b.date)}</td>
                      <td className="py-2.5 px-3 text-[#9E1C23] dark:text-amber-300 font-bold">{formatDate(b.dueDate)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatINR(b.totalPaise)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                        {formatINR(b.paidPaise)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700 dark:text-rose-400">
                        {formatINR(pending)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                          {b.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditBill(b)}
                            title="Edit / Record Payment"
                            className="p-1 rounded text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBill(b.id, b.billNo)}
                            title="Delete Bill"
                            className="p-1 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Accounts Cards with Edit/Delete */}
      {activeTab === 'accounts' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {accounts.map((a) => (
            <div
              key={a.id}
              className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">{a.name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditAccount(a)}
                    className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(a.id, a.name)}
                    className="p-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                {formatINR(a.balancePaise)}
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                Type: <span className="capitalize font-bold text-slate-900 dark:text-slate-200">{a.type.replace('_', ' ')}</span>
                {a.accountNoMasked && <div className="mt-0.5 font-mono text-slate-500">{a.accountNoMasked}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Parties & Vendors Directory with Edit/Delete */}
      {activeTab === 'parties' && (
        <div className="rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-3 border-b bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
            <span>Suppliers, Third-Party Packers &amp; Customer Ledger Directory</span>
            <span className="text-[11px] font-normal text-slate-600 dark:text-slate-400">Total: {parties.length} registered parties</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Party Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3 font-mono">GSTIN</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3 text-right">Credit Terms</th>
                  <th className="py-2.5 px-3 text-right">Outstanding Balance</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {parties.map((p) => {
                  const isPayable = p.outstandingPaise > 0;
                  const isReceivable = p.outstandingPaise < 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                        {p.name}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                          {p.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{p.city}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {p.gstin || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-mono">{p.phone}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-800 dark:text-slate-200">
                        {p.creditDays} days
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-bold ${
                          isPayable
                            ? 'text-rose-700 dark:text-rose-400'
                            : isReceivable
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {formatINR(Math.abs(p.outstandingPaise))}
                        {isPayable && ' (Dr)'}
                        {isReceivable && ' (Cr)'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditParty(p)}
                            className="p-1 rounded text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                            title="Edit Party Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteParty(p.id, p.name)}
                            className="p-1 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition"
                            title="Delete Party"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expense Modal (Create & Edit) */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 p-5 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTxn ? 'Edit Expense Voucher' : 'Record Expense Voucher'}
              </h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {duplicateWarning && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-300 dark:border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{duplicateWarning}</span>
              </div>
            )}

            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Amount (₹ Rupees) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amountRupees}
                    onChange={(e) => {
                      setAmountRupees(e.target.value);
                      checkDuplicate(parseFloat(e.target.value) || 0, partyName, date);
                    }}
                    placeholder="e.g. 15400"
                    className="w-full pl-7 pr-3 py-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold font-mono focus:border-[#9E1C23]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Paid To / Party <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={partyName}
                  onChange={(e) => {
                    setPartyName(e.target.value);
                    checkDuplicate(parseFloat(amountRupees) || 0, e.target.value, date);
                  }}
                  placeholder="e.g. Torrent Power / Unjha Traders / Patel Spares"
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-[#9E1C23]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Expense Head <span className="text-rose-500">*</span>
                </label>
                <select
                  value={headCategory}
                  onChange={(e) => setHeadCategory(e.target.value)}
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                >
                  <option value="Raw Material Purchase">Raw Material (Haldi, Mirch, Spices)</option>
                  <option value="Packing Foil & Cylinders">Packing Foil, Cylinders &amp; Cartons</option>
                  <option value="Third-Party Job Work">Third-Party Packing Charge (Sanand)</option>
                  <option value="Factory Electricity & Power">Factory Electricity &amp; Power</option>
                  <option value="Machine Maintenance & Consumables">Machine Maintenance &amp; Spares</option>
                  <option value="Staff Wages & Salaries">Staff Wages &amp; Salaries</option>
                  <option value="Freight & Transport">Freight &amp; Transport Inward/Outward</option>
                  <option value="Office & Tea Refreshment">Office &amp; Tea Refreshment</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Payment Mode
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as any)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="Cash">Cash</option>
                    <option value="HDFC NetBanking">HDFC NetBanking / NEFT</option>
                    <option value="SBI Transfer">SBI Transfer</option>
                    <option value="UPI">UPI / QR</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Debited Account
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({formatINR(a.balancePaise)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    checkDuplicate(parseFloat(amountRupees) || 0, partyName, e.target.value);
                  }}
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Reference / Notes
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. UTR # or Invoice #"
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setHasPhoto(!hasPhoto)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition ${
                    hasPhoto
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{hasPhoto ? 'Bill Photo Attached' : 'Attach Bill Photo'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="w-1/3 py-2.5 rounded-lg border bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold text-xs transition shadow-md active:scale-95"
                >
                  {editingTxn ? 'Save Voucher Changes' : 'Save Voucher & Update Ledger'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill Modal (Create & Edit) */}
      {showBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 p-5 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingBill ? 'Edit Vendor Bill' : 'Record New Vendor Bill'}
              </h3>
              <button
                onClick={() => setShowBillModal(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBill} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Bill / Invoice #
                  </label>
                  <input
                    type="text"
                    required
                    value={billNo}
                    onChange={(e) => setBillNo(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Vendor / Supplier
                  </label>
                  <input
                    type="text"
                    required
                    value={billPartyName}
                    onChange={(e) => setBillPartyName(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Bill Date
                  </label>
                  <input
                    type="date"
                    required
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Payment Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={billDueDate}
                    onChange={(e) => setBillDueDate(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Subtotal (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={billSubtotalRupees}
                    onChange={(e) => setBillSubtotalRupees(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    GST (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={billGstRupees}
                    onChange={(e) => setBillGstRupees(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Paid So Far (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={billPaidRupees}
                    onChange={(e) => setBillPaidRupees(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Item Description
                </label>
                <input
                  type="text"
                  value={billDesc}
                  onChange={(e) => setBillDesc(e.target.value)}
                  placeholder="e.g. 500 kg Turmeric powder and 2000 cans"
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBillModal(false)}
                  className="w-1/3 py-2.5 rounded-lg border bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold transition shadow-sm"
                >
                  {editingBill ? 'Save Bill Changes' : 'Record Vendor Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Modal (Create & Edit) */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 p-5 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingAccount ? 'Edit Account' : 'Add Cash or Bank Account'}
              </h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder="e.g. SBI Current Account #2"
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Account Type
                  </label>
                  <select
                    value={accType}
                    onChange={(e) => setAccType(e.target.value as any)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="bank">Bank Current / Savings</option>
                    <option value="cash">Cash in Factory Safe</option>
                    <option value="petty_cash">Petty Cash Register</option>
                    <option value="upi">UPI / Payment Gateway</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Account # (Masked)
                  </label>
                  <input
                    type="text"
                    value={accNoMasked}
                    onChange={(e) => setAccNoMasked(e.target.value)}
                    placeholder="e.g. •••• 8824"
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Opening Balance (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={accBalanceRupees}
                  onChange={(e) => setAccBalanceRupees(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="w-1/3 py-2.5 rounded-lg border bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold transition shadow-sm"
                >
                  {editingAccount ? 'Save Account Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Party Modal (Create & Edit) */}
      {showPartyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 p-5 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingParty ? 'Edit Vendor / Party' : 'Register New Vendor / Party'}
              </h3>
              <button
                onClick={() => setShowPartyModal(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveParty} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Party / Firm Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="e.g. Unjha APMC Spice Syndicate"
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Party Classification
                  </label>
                  <select
                    value={pType}
                    onChange={(e) => setPType(e.target.value as any)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="supplier">Raw Spice / Packaging Supplier</option>
                    <option value="packer">Third-Party Job Worker / Packer</option>
                    <option value="customer">Distributor / Retail Buyer</option>
                    <option value="lender">Bank / Financial Lender</option>
                    <option value="landlord">Factory Landlord</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Phone / Mobile <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={pPhone}
                    onChange={(e) => setPPhone(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={pGstin}
                    onChange={(e) => setPGstin(e.target.value)}
                    placeholder="24AAGCS9412F1Z4"
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    City / Mandi
                  </label>
                  <input
                    type="text"
                    required
                    value={pCity}
                    onChange={(e) => setPCity(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Credit Period (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={pCreditDays}
                    onChange={(e) => setPCreditDays(parseInt(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Opening Outstanding (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={pOutstandingRupees}
                    onChange={(e) => setPOutstandingRupees(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPartyModal(false)}
                  className="w-1/3 py-2.5 rounded-lg border bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold transition shadow-sm"
                >
                  {editingParty ? 'Save Party Changes' : 'Register Party'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
