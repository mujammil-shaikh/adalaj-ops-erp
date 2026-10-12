import React, { useState } from 'react';
import {
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Calendar,
  CheckCircle2,
  XCircle,
  FileText,
  Building,
  User,
  History,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { LicenceCompliance, LicenceCategory } from '../../types';
import { db } from '../../lib/storage';
import { formatCurrency, formatPaiseToRupees } from '../../lib/format';
import { useTheme } from '../../context/ThemeContext';

export const LicencesModule: React.FC = () => {
  const { isDark } = useTheme();
  const [licences, setLicences] = useState<LicenceCompliance[]>(db.getLicences());

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Copy registration feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedLicence, setSelectedLicence] = useState<LicenceCompliance | null>(null);

  // Form State for Add / Edit
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<LicenceCategory>('fssai');
  const [formRegNo, setFormRegNo] = useState('');
  const [formAuthority, setFormAuthority] = useState('');
  const [formIssueDate, setFormIssueDate] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [formCostRupees, setFormCostRupees] = useState('');
  const [formCadence, setFormCadence] = useState<'annual' | '3_year' | '5_year' | '10_year' | 'permanent' | 'quarterly'>('annual');
  const [formPerson, setFormPerson] = useState('');
  const [formDocument, setFormDocument] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Renewal Form State
  const [renewalFeeRupees, setRenewalFeeRupees] = useState('');
  const [renewalNewExpiry, setRenewalNewExpiry] = useState('');
  const [renewalReference, setRenewalReference] = useState('');

  // Calculate days remaining
  const getDaysRemaining = (expiryDate: string) => {
    if (!expiryDate || expiryDate.startsWith('2099')) return 9999; // permanent
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // KPIs
  const totalLicencesCount = licences.length;
  const expiringSoonCount = licences.filter((l) => {
    const days = getDaysRemaining(l.expiryDate);
    return days >= 0 && days <= 60;
  }).length;
  const expiredCount = licences.filter((l) => getDaysRemaining(l.expiryDate) < 0).length;
  const annualComplianceCostPaise = licences.reduce((acc, l) => acc + l.annualCostPaise, 0);

  const handleCopy = (regNo: string, id: string) => {
    navigator.clipboard.writeText(regNo);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAdd = () => {
    setSelectedLicence(null);
    setFormName('');
    setFormCategory('fssai');
    setFormRegNo('');
    setFormAuthority('');
    setFormIssueDate(new Date().toISOString().split('T')[0]);
    setFormExpiryDate('');
    setFormCostRupees('');
    setFormCadence('annual');
    setFormPerson('Rajesh Patel (Plant Head)');
    setFormDocument('Certificate.pdf');
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const handleSaveLicence = (e: React.FormEvent) => {
    e.preventDefault();
    const annualCostPaise = Math.round(parseFloat(formCostRupees || '0') * 100);
    const days = getDaysRemaining(formExpiryDate);
    const status: LicenceCompliance['status'] =
      days < 0 ? 'expired' : days <= 60 ? 'expiring_soon' : 'active';

    const newLicence: LicenceCompliance = {
      id: selectedLicence ? selectedLicence.id : `lic_${Date.now()}`,
      name: formName || 'Regulatory Licence',
      category: formCategory,
      registrationNo: formRegNo,
      issuingAuthority: formAuthority,
      issueDate: formIssueDate,
      expiryDate: formExpiryDate || '2099-12-31',
      renewalCadence: formCadence,
      status,
      annualCostPaise,
      penaltyPaise: 0,
      responsiblePerson: formPerson || 'Compliance Lead',
      documentRef: formDocument,
      notes: formNotes,
    };

    if (selectedLicence) {
      db.updateLicence(newLicence);
    } else {
      db.addLicence(newLicence);
    }

    setLicences(db.getLicences());
    setIsAddModalOpen(false);
  };

  const handleOpenRenewal = (l: LicenceCompliance) => {
    setSelectedLicence(l);
    setRenewalFeeRupees((l.annualCostPaise / 100).toString());
    const currentExp = new Date(l.expiryDate);
    currentExp.setFullYear(currentExp.getFullYear() + 1);
    setRenewalNewExpiry(currentExp.toISOString().split('T')[0]);
    setRenewalReference(`Challan-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setIsRenewalModalOpen(true);
  };

  const handleConfirmRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLicence) return;

    const feePaise = Math.round(parseFloat(renewalFeeRupees || '0') * 100);
    db.recordLicenceRenewal(selectedLicence.id, feePaise, renewalReference);

    // Update expiration date
    const updated = db.getLicences().map((l) =>
      l.id === selectedLicence.id
        ? {
            ...l,
            expiryDate: renewalNewExpiry,
            status: 'active' as const,
          }
        : l
    );
    db.saveLicences(updated);
    setLicences(updated);
    setIsRenewalModalOpen(false);
  };

  const filteredLicences = licences.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.registrationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.issuingAuthority.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || l.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#9A2229]/20 text-[#9A2229] dark:text-rose-400 border border-[#9A2229]/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Licences, Certificates & Compliance Vault
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Section 13.4 · FSSAI, Weights & Measures, GPCB, Udyam, Trademarks & Automated Expiry Alerts
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#9A2229] hover:bg-[#7F191F] text-white text-xs font-medium shadow-sm transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Licence</span>
        </button>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 rounded-xl border transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Total Active Licences</span>
            <FileCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100">
            {totalLicencesCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Food safety, GST, Trademark, Weights & Measures
          </div>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Due in &lt; 60 Days</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-amber-500">
            {expiringSoonCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            GS1 Barcodes & NABL Lab Report renewal
          </div>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Expired / Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-emerald-500">
            {expiredCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Zero regulatory default or penalty
          </div>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Annual Statutory Fees</span>
            <RefreshCw className="w-4 h-4 text-[#9A2229]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[#9A2229] dark:text-rose-400">
            {formatPaiseToRupees(annualComplianceCostPaise)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Budgeted across all departments
          </div>
        </div>
      </div>

      {/* 3. Register Table */}
      <div className={`rounded-xl border overflow-hidden ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Filter Bar */}
        <div className="p-3.5 border-b flex flex-col sm:flex-row items-center justify-between gap-3 border-slate-200 dark:border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search licence, reg number or authority..."
              className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border outline-none transition-all ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 text-slate-100 focus:border-amber-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#9A2229]'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['all', 'fssai', 'weights_measures', 'trademark', 'gs1_barcode', 'lab_test'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap transition-all ${
                  categoryFilter === cat
                    ? 'bg-slate-800 text-white dark:bg-slate-700 font-semibold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {cat === 'all'
                  ? 'All Licences'
                  : cat === 'fssai'
                  ? 'FSSAI'
                  : cat === 'weights_measures'
                  ? 'Weights & Measures'
                  : cat === 'trademark'
                  ? 'Trademark'
                  : cat === 'gs1_barcode'
                  ? 'Barcodes'
                  : 'Lab Tests'}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b ${
              isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <tr>
                <th className="py-3 px-4 font-semibold">Licence / Registration</th>
                <th className="py-3 px-4 font-semibold">Reg / Certificate No</th>
                <th className="py-3 px-4 font-semibold">Issuing Authority</th>
                <th className="py-3 px-4 font-semibold">Valid Until</th>
                <th className="py-3 px-4 font-semibold text-right">Fee / Cost</th>
                <th className="py-3 px-4 font-semibold">Responsible Owner</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredLicences.map((l) => {
                const days = getDaysRemaining(l.expiryDate);
                const isExpiring = days <= 60 && days >= 0;
                const isExpired = days < 0;

                return (
                  <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-[#9A2229]" />
                        {l.name}
                      </div>
                      <div className="text-[11px] text-slate-500 capitalize mt-0.5">
                        {l.renewalCadence.replace('_', ' ')} cycle · {l.documentRef || 'Attachment stored in R2'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span>{l.registrationNo}</span>
                        <button
                          onClick={() => handleCopy(l.registrationNo, l.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          title="Copy Registration Number"
                        >
                          {copiedId === l.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {l.issuingAuthority}
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      {l.expiryDate.startsWith('2099') ? (
                        <span className="text-slate-500">Permanent</span>
                      ) : (
                        <div>
                          <span className={isExpiring ? 'text-amber-500 font-bold' : isExpired ? 'text-rose-500 font-bold' : ''}>
                            {l.expiryDate}
                          </span>
                          {isExpiring && (
                            <span className="block text-[10px] text-amber-500 font-semibold">
                              ({days} days remaining)
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-medium">
                      {l.annualCostPaise > 0 ? formatPaiseToRupees(l.annualCostPaise) : 'Nil'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {l.responsiblePerson}
                    </td>

                    <td className="py-3.5 px-4">
                      {isExpired ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3 h-3" />
                          <span>Expired</span>
                        </span>
                      ) : isExpiring ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3" />
                          <span>Expiring Soon</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!l.expiryDate.startsWith('2099') && (
                          <button
                            onClick={() => handleOpenRenewal(l)}
                            className="px-2 py-1 rounded text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                          >
                            Renew
                          </button>
                        )}
                        {l.history && l.history.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedLicence(l);
                              setIsHistoryModalOpen(true);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-slate-200"
                            title="View History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Renewal Modal */}
      {isRenewalModalOpen && selectedLicence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`w-full max-w-md rounded-xl border p-5 sm:p-6 shadow-2xl transition-all ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-base font-bold mb-2 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-500" />
              Record Licence Renewal
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {selectedLicence.name} ({selectedLicence.registrationNo})
            </p>

            <form onSubmit={handleConfirmRenewal} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Renewal Fee Paid (₹)</label>
                <input
                  type="number"
                  required
                  value={renewalFeeRupees}
                  onChange={(e) => setRenewalFeeRupees(e.target.value)}
                  className={`w-full p-2 rounded-lg border outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">New Validity / Expiry Date</label>
                <input
                  type="date"
                  required
                  value={renewalNewExpiry}
                  onChange={(e) => setRenewalNewExpiry(e.target.value)}
                  className={`w-full p-2 rounded-lg border outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Govt Challan / Receipt Reference</label>
                <input
                  type="text"
                  required
                  value={renewalReference}
                  onChange={(e) => setRenewalReference(e.target.value)}
                  className={`w-full p-2 rounded-lg border outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRenewalModalOpen(false)}
                  className="px-4 py-2 rounded-lg border text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium shadow-sm transition-all"
                >
                  Confirm & Update Expiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add Licence Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`w-full max-w-lg rounded-xl border p-5 sm:p-6 shadow-2xl transition-all ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#9A2229]" />
              Register Statutory Licence / Permit
            </h3>

            <form onSubmit={handleSaveLicence} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Licence / Certificate Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. FSSAI Central Manufacturing Licence"
                  className={`w-full p-2 rounded-lg border outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as LicenceCategory)}
                    className={`w-full p-2 rounded-lg border outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="fssai">FSSAI Food Safety</option>
                    <option value="weights_measures">Legal Metrology (Packaged Commodities)</option>
                    <option value="gst">GST Registration</option>
                    <option value="udyam">Udyam MSME</option>
                    <option value="trademark">Trademark Registration</option>
                    <option value="pollution_control">Pollution Board (GPCB)</option>
                    <option value="factory_permit">Factory Permit (DISH)</option>
                    <option value="gs1_barcode">GS1 Barcode Allocation</option>
                    <option value="lab_test">NABL Lab Test Report</option>
                    <option value="other">Other Regulatory Permit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Registration Number</label>
                  <input
                    type="text"
                    required
                    value={formRegNo}
                    onChange={(e) => setFormRegNo(e.target.value)}
                    placeholder="e.g. 10722026000412"
                    className={`w-full p-2 rounded-lg border outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Issuing Authority</label>
                <input
                  type="text"
                  required
                  value={formAuthority}
                  onChange={(e) => setFormAuthority(e.target.value)}
                  placeholder="e.g. Food & Drugs Control Administration Gujarat"
                  className={`w-full p-2 rounded-lg border outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={formIssueDate}
                    onChange={(e) => setFormIssueDate(e.target.value)}
                    className={`w-full p-2 rounded-lg border outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Expiry Date (Leave empty if permanent)</label>
                  <input
                    type="date"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className={`w-full p-2 rounded-lg border outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Renewal Cost (₹)</label>
                  <input
                    type="number"
                    value={formCostRupees}
                    onChange={(e) => setFormCostRupees(e.target.value)}
                    placeholder="e.g. 7500"
                    className={`w-full p-2 rounded-lg border outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Responsible Owner</label>
                  <input
                    type="text"
                    value={formPerson}
                    onChange={(e) => setFormPerson(e.target.value)}
                    placeholder="e.g. Rajesh Patel (Plant Head)"
                    className={`w-full p-2 rounded-lg border outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#9A2229] hover:bg-[#7F191F] text-white font-medium shadow-sm transition-all"
                >
                  Save Licence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. History Modal */}
      {isHistoryModalOpen && selectedLicence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`w-full max-w-md rounded-xl border p-5 shadow-2xl transition-all ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-base font-bold mb-1 flex items-center gap-2">
              <History className="w-5 h-5 text-[#9A2229]" />
              Renewal & Event Audit Trail
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {selectedLicence.name}
            </p>

            <div className="space-y-2 text-xs">
              {selectedLicence.history?.map((h, i) => (
                <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between font-semibold">
                    <span>{h.action}</span>
                    <span className="font-mono text-[#9A2229] dark:text-rose-400">
                      {formatPaiseToRupees(h.feePaise)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Date: {h.date}</span>
                    <span>Ref: {h.reference}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-right">
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-1.5 rounded-lg border text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
