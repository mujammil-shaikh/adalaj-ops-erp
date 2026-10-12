import React, { useState } from 'react';
import {
  Users,
  Calendar,
  CheckCircle,
  FileText,
  DollarSign,
  ShieldCheck,
  Download,
  Plus,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import { db } from '../../lib/storage';
import { Employee } from '../../types';
import { formatINR, formatQty } from '../../lib/format';

export const PayrollModule: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(db.getEmployees());
  const [month, setMonth] = useState('October 2026');

  // Employee Modal (Create / Edit)
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [empCode, setEmpCode] = useState('');
  const [empName, setEmpName] = useState('');
  const [empDesignation, setEmpDesignation] = useState('Packaging Operator');
  const [empPayType, setEmpPayType] = useState<Employee['payType']>('monthly');
  const [empRateRupees, setEmpRateRupees] = useState(18000);
  const [empPhone, setEmpPhone] = useState('+91 98250 00000');
  const [empUan, setEmpUan] = useState('');
  const [empEsic, setEmpEsic] = useState('');
  const [empDays, setEmpDays] = useState(24);
  const [empPieces, setEmpPieces] = useState(0);

  const reload = () => {
    setEmployees(db.getEmployees());
  };

  // Open Create Employee
  const handleOpenCreateEmp = () => {
    setEditingEmp(null);
    setEmpCode(`EMP-0${employees.length + 1}`);
    setEmpName('');
    setEmpDesignation('Packaging Line Worker');
    setEmpPayType('monthly');
    setEmpRateRupees(18000);
    setEmpPhone('+91 98250 12345');
    setEmpUan('101239845120');
    setEmpEsic('241289451010');
    setEmpDays(26);
    setEmpPieces(0);
    setShowEmpModal(true);
  };

  // Open Edit Employee
  const handleOpenEditEmp = (emp: Employee) => {
    setEditingEmp(emp);
    setEmpCode(emp.code);
    setEmpName(emp.name);
    setEmpDesignation(emp.designation);
    setEmpPayType(emp.payType);
    setEmpRateRupees(
      emp.payType === 'piece_rate' ? (emp.ratePaise * 100) / 100 : emp.ratePaise / 100
    );
    setEmpPhone(emp.phone);
    setEmpUan(emp.uan || '');
    setEmpEsic(emp.esicNo || '');
    setEmpDays(emp.attendancePresentDaysThisMonth);
    setEmpPieces(emp.pieceCountThisMonth);
    setShowEmpModal(true);
  };

  // Save Employee
  const handleSaveEmp = (e: React.FormEvent) => {
    e.preventDefault();
    const ratePaise =
      empPayType === 'piece_rate' ? Math.round(empRateRupees) : Math.round(empRateRupees * 100);

    const empData: Employee = {
      id: editingEmp ? editingEmp.id : `emp_${Date.now()}`,
      code: empCode,
      name: empName,
      designation: empDesignation,
      payType: empPayType,
      ratePaise,
      phone: empPhone,
      uan: empUan || undefined,
      esicNo: empEsic || undefined,
      active: true,
      attendancePresentDaysThisMonth: empDays,
      pieceCountThisMonth: empPieces,
    };

    if (editingEmp) {
      db.updateEmployee(empData);
    } else {
      db.addEmployee(empData);
    }

    setShowEmpModal(false);
    reload();
  };

  // Delete Employee
  const handleDeleteEmp = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove / deactivate employee "${name}"?`)) {
      db.deleteEmployee(id);
      reload();
    }
  };

  // Compute payroll numbers
  const payrollDetails = employees.map((emp) => {
    let grossPaise = 0;
    if (emp.payType === 'monthly') {
      grossPaise = emp.ratePaise;
    } else if (emp.payType === 'piece_rate') {
      grossPaise = emp.pieceCountThisMonth * emp.ratePaise;
    } else if (emp.payType === 'daily') {
      grossPaise = emp.attendancePresentDaysThisMonth * emp.ratePaise;
    }

    const pfPaise = emp.uan ? Math.round(grossPaise * 0.12) : 0;
    const esicPaise = emp.esicNo ? Math.round(grossPaise * 0.0075) : 0;
    const ptPaise = grossPaise > 1200000 ? 20000 : 0;
    const netPaise = grossPaise - pfPaise - esicPaise - ptPaise;

    return {
      ...emp,
      grossPaise,
      pfPaise,
      esicPaise,
      ptPaise,
      netPaise,
    };
  });

  const totalGross = payrollDetails.reduce((s, e) => s + e.grossPaise, 0);
  const totalNet = payrollDetails.reduce((s, e) => s + e.netPaise, 0);
  const totalPF = payrollDetails.reduce((s, e) => s + e.pfPaise, 0);
  const totalESIC = payrollDetails.reduce((s, e) => s + e.esicPaise, 0);
  const totalPT = payrollDetails.reduce((s, e) => s + e.ptPaise, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E1C23] dark:text-amber-400">
            <span>Module M7</span>
            <span>·</span>
            <span>Adalaj People, Piece-Rate &amp; Statutory Dues</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Factory Payroll &amp; Compliance ({month})
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
            Automatic piece-rate calculation from batch output, monthly staff salaries, PF, ESIC and Gujarat PT.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenCreateEmp}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold text-xs transition shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Employee</span>
          </button>
          <button
            onClick={() => alert(`Bank salary disbursement sheet for ${month} exported!`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition shadow-sm"
          >
            <Download className="w-4 h-4 text-[#9E1C23] dark:text-amber-400" />
            <span>Export Bank Sheet</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 shadow-sm">
          <span className="text-slate-600 dark:text-slate-400 text-[11px] block font-medium">Total Gross Wages</span>
          <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">{formatINR(totalGross)}</span>
        </div>
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 shadow-sm">
          <span className="text-slate-600 dark:text-slate-400 text-[11px] block font-medium">Net Payable to Staff</span>
          <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">{formatINR(totalNet)}</span>
        </div>
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 shadow-sm">
          <span className="text-slate-600 dark:text-slate-400 text-[11px] block font-medium">PF Liability (Employee)</span>
          <span className="text-lg font-bold font-mono text-sky-700 dark:text-sky-400">{formatINR(totalPF)}</span>
        </div>
        <div className="p-3.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 shadow-sm">
          <span className="text-slate-600 dark:text-slate-400 text-[11px] block font-medium">ESIC &amp; PT Dues</span>
          <span className="text-lg font-bold font-mono text-violet-700 dark:text-violet-400">{formatINR(totalESIC + totalPT)}</span>
        </div>
      </div>

      {/* Employee Table with Edit & Delete Actions */}
      <div className="rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Emp Code</th>
                <th className="py-2.5 px-3">Name &amp; Role</th>
                <th className="py-2.5 px-3">Pay Type</th>
                <th className="py-2.5 px-3 text-right">Production Output</th>
                <th className="py-2.5 px-3 text-right">Gross Wages</th>
                <th className="py-2.5 px-3 text-right">PF (12%)</th>
                <th className="py-2.5 px-3 text-right">ESIC &amp; PT</th>
                <th className="py-2.5 px-3 text-right">Net Take Home</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {payrollDetails.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#9E1C23] dark:text-amber-400">{emp.code}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900 dark:text-white block">{emp.name}</span>
                    <span className="text-slate-600 dark:text-slate-400 text-[11px]">{emp.designation}</span>
                  </td>
                  <td className="py-2.5 px-3 capitalize font-medium text-slate-700 dark:text-slate-300">
                    {emp.payType.replace('_', ' ')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-800 dark:text-slate-200 font-medium">
                    {emp.payType === 'piece_rate'
                      ? `${formatQty(emp.pieceCountThisMonth)} cans`
                      : `${emp.attendancePresentDaysThisMonth} days`}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatINR(emp.grossPaise)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {emp.pfPaise > 0 ? formatINR(emp.pfPaise) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                    {emp.esicPaise + emp.ptPaise > 0 ? formatINR(emp.esicPaise + emp.ptPaise) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {formatINR(emp.netPaise)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditEmp(emp)}
                        title="Edit Employee / Attendance"
                        className="p-1 rounded text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmp(emp.id, emp.name)}
                        title="Delete Employee"
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

      {/* Employee Modal (Create & Edit) */}
      {showEmpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 p-5 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingEmp ? 'Edit Employee Details & Attendance' : 'Add New Factory Employee'}
              </h3>
              <button
                onClick={() => setShowEmpModal(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEmp} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Employee Code
                  </label>
                  <input
                    type="text"
                    required
                    value={empCode}
                    onChange={(e) => setEmpCode(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={empName}
                    onChange={(e) => setEmpName(e.target.value)}
                    placeholder="e.g. Ramesh Prajapati"
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Designation
                  </label>
                  <input
                    type="text"
                    required
                    value={empDesignation}
                    onChange={(e) => setEmpDesignation(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Pay Type
                  </label>
                  <select
                    value={empPayType}
                    onChange={(e) => setEmpPayType(e.target.value as any)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="monthly">Monthly Fixed Salary</option>
                    <option value="piece_rate">Piece Rate (Per Can/Pouch)</option>
                    <option value="daily">Daily Wage Worker</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    {empPayType === 'piece_rate' ? 'Rate/Can (Paise)' : 'Monthly/Daily (₹)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={empRateRupees}
                    onChange={(e) => setEmpRateRupees(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Attendance (Days)
                  </label>
                  <input
                    type="number"
                    value={empDays}
                    onChange={(e) => setEmpDays(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Piece Count (Packs)
                  </label>
                  <input
                    type="number"
                    value={empPieces}
                    onChange={(e) => setEmpPieces(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    UAN (PF Number)
                  </label>
                  <input
                    type="text"
                    value={empUan}
                    onChange={(e) => setEmpUan(e.target.value)}
                    placeholder="12 digit UAN"
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    ESIC Number
                  </label>
                  <input
                    type="text"
                    value={empEsic}
                    onChange={(e) => setEmpEsic(e.target.value)}
                    placeholder="17 digit ESIC"
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEmpModal(false)}
                  className="w-1/3 py-2.5 rounded-lg border bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold transition shadow-sm"
                >
                  {editingEmp ? 'Save Employee Changes' : 'Register Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
