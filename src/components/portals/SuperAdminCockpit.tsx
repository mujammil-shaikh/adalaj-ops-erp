import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Layers,
  TrendingUp,
  Boxes,
  Package,
  Wrench,
  DollarSign,
  Plus,
  Key,
  Trash2,
  Edit2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Lock,
  Sparkles,
  X,
  Eye,
  Activity,
  ShoppingBag,
  Truck,
  Cpu,
} from 'lucide-react';
import {
  UserRole,
  AuthUser,
  SystemUserCredential,
  PackagingTierSpec,
  PackagingTierLevel,
  MandiSpotRateRecord,
  ROLE_PERMISSIONS,
} from '../../types';
import { db } from '../../lib/storage';
import { formatINR } from '../../lib/format';
import { RoleTodoAndReportBar } from './RoleTodoAndReportBar';
import { useTheme } from '../../context/ThemeContext';

interface SuperAdminCockpitProps {
  currentUser: AuthUser;
  onTeleportToRole: (role: UserRole) => void;
  onNavigateModule: (module: string) => void;
}

export const SuperAdminCockpit: React.FC<SuperAdminCockpitProps> = ({
  currentUser,
  onTeleportToRole,
  onNavigateModule,
}) => {
  const { isDark } = useTheme();

  // Tab Navigation
  const [activeTab, setActiveTab] = useState<'overview' | 'rbac_users' | 'packaging_specs' | 'mandi_desk' | 'audit_log'>('overview');

  // Master Data States
  const [systemUsers, setSystemUsers] = useState<SystemUserCredential[]>(() => db.getAllSystemUsers());
  const [packagingSpecs, setPackagingSpecs] = useState<PackagingTierSpec[]>(() => db.getPackagingSpecs());
  const [mandiRates, setMandiRates] = useState<MandiSpotRateRecord[]>(() => db.getMandiSpotRates());
  const [selectedTierFilter, setSelectedTierFilter] = useState<0 | 1 | 2 | 3>(0); // 0 = all

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const [showAddSpecModal, setShowAddSpecModal] = useState(false);
  const [editingSpec, setEditingSpec] = useState<PackagingTierSpec | null>(null);

  const [showAddMandiRateModal, setShowAddMandiRateModal] = useState(false);

  // Form States - Add User
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('salesman');
  const [newUserDept, setNewUserDept] = useState('Sales & Distribution');
  const [newUserPhone, setNewUserPhone] = useState('+91 98250 ');

  // Form States - Packaging Spec
  const [specTierLevel, setSpecTierLevel] = useState<PackagingTierLevel>(1);
  const [specCode, setSpecCode] = useState('');
  const [specDisplayName, setSpecDisplayName] = useState('');
  const [specCategory, setSpecCategory] = useState<'primary' | 'secondary' | 'tertiary'>('primary');
  const [specNetCapacityGrams, setSpecNetCapacityGrams] = useState(100);
  const [specTareWeightGrams, setSpecTareWeightGrams] = useState(3.5);
  const [specMaterialType, setSpecMaterialType] = useState('BOPP / MET-PET 3-Ply Foil');
  const [specMachineType, setSpecMachineType] = useState('Auger Servo Filler');
  const [specUnitsPerParent, setSpecUnitsPerParent] = useState(10);
  const [specCostRupees, setSpecCostRupees] = useState(1.2);
  const [specIsExport, setSpecIsExport] = useState(true);
  const [specNotes, setSpecNotes] = useState('');

  // Form States - Mandi Spot Rate
  const [mandiSpice, setMandiSpice] = useState('Chilli');
  const [mandiLocation, setMandiLocation] = useState('Guntur Mandi');
  const [mandiGrade, setMandiGrade] = useState('Teja S17 Stemless (Premium)');
  const [mandiRatePerKg, setMandiRatePerKg] = useState(220);
  const [mandiDailyChange, setMandiDailyChange] = useState(3);
  const [mandiArrivalBags, setMandiArrivalBags] = useState(45000);
  const [mandiNotes, setMandiNotes] = useState('Spot arrivals holding steady');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const refreshAll = () => {
    setSystemUsers(db.getAllSystemUsers());
    setPackagingSpecs(db.getPackagingSpecs());
    setMandiRates(db.getMandiSpotRates());
  };

  // User Actions
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim() || !newUserPassword.trim()) return;

    const cred: SystemUserCredential = {
      email: newUserEmail.trim(),
      password: newUserPassword.trim(),
      user: {
        id: `usr_${Date.now()}`,
        email: newUserEmail.trim(),
        name: newUserName.trim() || newUserEmail.split('@')[0],
        role: newUserRole,
        department: newUserDept,
        phone: newUserPhone,
        lastLoginAt: new Date().toISOString(),
      },
    };

    db.addSystemUser(cred);
    refreshAll();
    setShowAddUserModal(false);
    setNewUserEmail('');
    setNewUserPassword('');
    setNewUserName('');
    showNotification(`Created authorized enterprise account for ${cred.email}`);
  };

  const handleUpdateUserRole = (email: string, role: UserRole) => {
    db.updateSystemUserRole(email, role);
    refreshAll();
    showNotification(`Updated ${email} role to ${role.toUpperCase()}`);
  };

  const handleDeleteUser = (email: string) => {
    if (confirm(`Are you sure you want to revoke enterprise access for ${email}?`)) {
      db.deleteSystemUser(email);
      refreshAll();
      showNotification(`Account revoked for ${email}`);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput.trim() || !selectedUserEmail) return;

    db.resetUserPassword(selectedUserEmail, newPasswordInput.trim());
    refreshAll();
    setShowResetPasswordModal(false);
    setNewPasswordInput('');
    showNotification(`Password successfully updated for ${selectedUserEmail}`);
  };

  // Packaging Spec Actions
  const handleSavePackagingSpec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specDisplayName.trim() || !specCode.trim()) return;

    const newSpec: PackagingTierSpec = {
      id: editingSpec ? editingSpec.id : `spec_${Date.now()}`,
      tierLevel: specTierLevel,
      code: specCode.trim(),
      displayName: specDisplayName.trim(),
      category: specCategory,
      netCapacityGrams: Number(specNetCapacityGrams) || 0,
      tareWeightGrams: Number(specTareWeightGrams) || 0,
      materialType: specMaterialType.trim(),
      machineTypeRequired: specMachineType.trim() || undefined,
      unitsPerParent: Number(specUnitsPerParent) || 1,
      isExportCompliant: specIsExport,
      isActive: true,
      costPaisePerUnit: Math.round(Number(specCostRupees) * 100),
      notes: specNotes.trim() || undefined,
    };

    if (editingSpec) {
      db.updatePackagingSpec(newSpec);
      showNotification(`Updated Packaging Spec: ${newSpec.displayName}`);
    } else {
      db.addPackagingSpec(newSpec);
      showNotification(`Added Packaging Spec: ${newSpec.displayName}`);
    }

    refreshAll();
    setShowAddSpecModal(false);
    setEditingSpec(null);
  };

  const handleDeleteSpec = (id: string, name: string) => {
    if (confirm(`Archive packaging specification: "${name}"?`)) {
      db.deletePackagingSpec(id);
      refreshAll();
      showNotification(`Archived packaging spec: ${name}`);
    }
  };

  const handleResetDefaultSpecs = () => {
    if (confirm('Reset packaging specifications to factory seed templates?')) {
      db.resetPackagingSpecs();
      refreshAll();
      showNotification('Restored packaging specifications to standard factory templates.');
    }
  };

  // Mandi Rate Actions
  const handleAddMandiRate = (e: React.FormEvent) => {
    e.preventDefault();
    const rateRec: MandiSpotRateRecord = {
      id: `mandi_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      spiceName: mandiSpice,
      mandiLocation,
      grade: mandiGrade,
      spotRatePerKgRupees: Number(mandiRatePerKg) || 0,
      dailyChangeRupees: Number(mandiDailyChange) || 0,
      arrivalBags: Number(mandiArrivalBags) || 0,
      reportedBy: `${currentUser.name} (Super Admin)`,
      notes: mandiNotes,
    };

    db.addMandiSpotRate(rateRec);
    refreshAll();
    setShowAddMandiRateModal(false);
    showNotification(`Logged spot rate for ${mandiSpice} @ ₹${rateRec.spotRatePerKgRupees}/kg`);
  };

  const filteredSpecs = selectedTierFilter === 0
    ? packagingSpecs
    : packagingSpecs.filter((s) => s.tierLevel === selectedTierFilter);

  // Financial snapshot
  const fin = db.getFinancialIntelligence('all', 'monthly_mom');

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. ROLE TELEPORTATION SWITCHER STRIP (1-Click Portal Jump) */}
      <div className="p-4 rounded-2xl border border-amber-900/15 dark:border-amber-400/20 bg-gradient-to-r from-amber-500/10 via-[#9E1C23]/10 to-transparent backdrop-blur-sm shadow-sm space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#9E1C23] text-white">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                1-Click Role Teleportation Bar (View App as Any Role)
              </span>
              <p className="text-[11px] text-slate-500">
                Instantly switch your perspective to inspect anonymized departmental portals without logging out.
              </p>
            </div>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
            Super Admin Override Active
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => onTeleportToRole('owner')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#9E1C23] text-white shadow flex items-center gap-1.5 cursor-pointer"
          >
            👑 Super Admin Master
          </button>

          <button
            onClick={() => onTeleportToRole('salesman')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            💼 Sales & Clients (/portal/sales)
          </button>

          <button
            onClick={() => onTeleportToRole('procurement')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            🌾 RM Procurement & Mandi (/portal/procurement)
          </button>

          <button
            onClick={() => onTeleportToRole('store_keeper')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            📦 Store & Warehouse (/portal/store)
          </button>

          <button
            onClick={() => onTeleportToRole('supervisor')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            🏭 Factory Floor Mode (/portal/floor)
          </button>

          <button
            onClick={() => onTeleportToRole('accountant')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            💰 Finance & Accounts (/portal/finance)
          </button>

          <button
            onClick={() => onTeleportToRole('marketing')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            📣 Ads & Marketing (/portal/marketing)
          </button>

          <button
            onClick={() => onTeleportToRole('ca_auditor')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            ⚖️ Statutory CA (/portal/auditor)
          </button>
        </div>
      </div>

      {/* 2. Pinned Universal Daily TO-DO Stack for Super Admin */}
      <RoleTodoAndReportBar
        currentRole="owner"
        currentUserName={currentUser.name}
        onNavigateModule={onNavigateModule}
      />

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 sm:gap-4 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 pt-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[#9E1C23] text-[#9E1C23] dark:border-amber-400 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Plant Health & P&L Cockpit</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac_users')}
          className={`pb-3 pt-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'rbac_users'
              ? 'border-[#9E1C23] text-[#9E1C23] dark:border-amber-400 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>RBAC Users & Credentials ({systemUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('packaging_specs')}
          className={`pb-3 pt-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'packaging_specs'
              ? 'border-[#9E1C23] text-[#9E1C23] dark:border-amber-400 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Packaging Specs CRUD (Tiers 1, 2, 3)</span>
        </button>

        <button
          onClick={() => setActiveTab('mandi_desk')}
          className={`pb-3 pt-1 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'mandi_desk'
              ? 'border-[#9E1C23] text-[#9E1C23] dark:border-amber-400 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Mandi Spot Rates Master</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: PLANT HEALTH & FINANCIAL COCKPIT OVERVIEW                      */}
      {/* ===================================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive P&L Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Revenue (Oct)</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatINR(fin.revenuePaise)}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">
                +{fin.revenueGrowthPct}% vs Last Month
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EBITDA Margin</span>
              <div className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {formatINR(fin.ebitdaPaise)}
              </div>
              <span className="text-[10px] text-slate-500 font-semibold mt-1 inline-block">
                {fin.ebitdaMarginPct}% EBITDA
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Profit / PAT</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {formatINR(fin.patPaise)}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold mt-1 inline-block">
                {fin.patMarginPct}% Net Margin
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Per-KG OPEX</span>
              <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                ₹{(fin.opexPerKgPaise / 100).toFixed(2)}/kg
              </div>
              <span className="text-[10px] text-slate-500 font-semibold mt-1 inline-block">
                Realization: ₹{(fin.realizationPerKgPaise / 100).toFixed(2)}/kg
              </span>
            </div>
          </div>

          {/* Quick Action Portals Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => onTeleportToRole('salesman')}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#9E1C23] dark:hover:border-amber-400 shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#9E1C23] dark:group-hover:text-amber-400 transition-colors" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3">
                Sales & Blended Quoting Engine
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                60/40 weighted cost calculator, B2B proformas, customer credit surcharges (+2%).
              </p>
            </div>

            <div
              onClick={() => onTeleportToRole('procurement')}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#9E1C23] dark:hover:border-amber-400 shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#9E1C23] dark:group-hover:text-amber-400 transition-colors" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3">
                RM Mandi Sourcing & Spot POs
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Unjha, Gondal, Guntur daily yard rates, spot order issuance, part-payment releases.
              </p>
            </div>

            <div
              onClick={() => onTeleportToRole('supervisor')}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#9E1C23] dark:hover:border-amber-400 shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                  <Cpu className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#9E1C23] dark:group-hover:text-amber-400 transition-colors" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-3">
                Factory Floor Mode (Anonymized)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Job orders without customer pricing, 3-tier packaging output, scrap logs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: RBAC CREDENTIALS & SYSTEM USERS CRUD                           */}
      {/* ===================================================================== */}
      {activeTab === 'rbac_users' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Authorized Enterprise Users</h3>
              <p className="text-[11px] text-slate-500">
                Manage login credentials, departmental RBAC roles, and individual module permissions.
              </p>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Enterprise Account</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Employee / Name</th>
                  <th className="px-4 py-3">Email (Login ID)</th>
                  <th className="px-4 py-3">Assigned RBAC Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Teleport View</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {systemUsers.map((item) => (
                  <tr key={item.email} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 font-sans">
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {item.user.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 dark:text-slate-300">
                      {item.email}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.user.role}
                        onChange={(e) => handleUpdateUserRole(item.email, e.target.value as any)}
                        className="px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                      >
                        <option value="owner">Super Admin / Owner</option>
                        <option value="salesman">Sales & Dispatch</option>
                        <option value="procurement">RM Procurement Buyer</option>
                        <option value="store_keeper">Store & Warehouse</option>
                        <option value="supervisor">Plant Supervisor</option>
                        <option value="accountant">Chief Accountant</option>
                        <option value="marketing">Ads & Marketing Lead</option>
                        <option value="ca_auditor">Statutory CA (Audit)</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">
                      {item.user.department || 'Operations'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onTeleportToRole(item.user.role)}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-[10px] font-bold hover:bg-amber-200 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect Portal</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUserEmail(item.email);
                          setShowResetPasswordModal(true);
                        }}
                        className="p-1 rounded text-slate-500 hover:text-indigo-600"
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>

                      {item.email !== 'admin@adalajfoods.com' && (
                        <button
                          onClick={() => handleDeleteUser(item.email)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600"
                          title="Revoke User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: MASTER PACKAGING SPECIFICATIONS CRUD (TIERS 1, 2, 3)          */}
      {/* ===================================================================== */}
      {activeTab === 'packaging_specs' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Dynamic 3-Tier Packaging Architecture CRUD</h3>
              <p className="text-[11px] text-slate-500">
                Configure primary filling, secondary bundling, and tertiary shipping containers. Zero hardcoded sizes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetDefaultSpecs}
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Factory Seeds</span>
              </button>

              <button
                onClick={() => {
                  setEditingSpec(null);
                  setShowAddSpecModal(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Packaging Spec</span>
              </button>
            </div>
          </div>

          {/* Tier Level Filter Tabs */}
          <div className="flex gap-2">
            {[
              { id: 0, label: 'All Tiers' },
              { id: 1, label: 'Tier 1: Primary (Filling)' },
              { id: 2, label: 'Tier 2: Secondary (Bundling)' },
              { id: 3, label: 'Tier 3: Tertiary (Shippers)' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTierFilter(t.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTierFilter === t.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSpecs.map((spec) => (
              <div
                key={spec.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      spec.tierLevel === 1
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200'
                        : spec.tierLevel === 2
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200'
                        : 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-200'
                    }`}
                  >
                    Tier {spec.tierLevel} · {spec.category.toUpperCase()}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingSpec(spec);
                        setSpecTierLevel(spec.tierLevel);
                        setSpecCode(spec.code);
                        setSpecDisplayName(spec.displayName);
                        setSpecCategory(spec.category);
                        setSpecNetCapacityGrams(spec.netCapacityGrams);
                        setSpecTareWeightGrams(spec.tareWeightGrams);
                        setSpecMaterialType(spec.materialType);
                        setSpecMachineType(spec.machineTypeRequired || '');
                        setSpecUnitsPerParent(spec.unitsPerParent || 1);
                        setSpecCostRupees(spec.costPaisePerUnit / 100);
                        setSpecIsExport(spec.isExportCompliant);
                        setSpecNotes(spec.notes || '');
                        setShowAddSpecModal(true);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSpec(spec.id, spec.displayName)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {spec.displayName}
                  </h4>
                  <div className="font-mono text-[10px] text-slate-400">
                    Code: {spec.code}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Net Capacity</span>
                    <strong className="font-mono">
                      {spec.netCapacityGrams >= 1000 ? `${spec.netCapacityGrams / 1000} kg` : `${spec.netCapacityGrams} g`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase">Packaging Material Cost</span>
                    <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{(spec.costPaisePerUnit / 100).toFixed(2)}/unit
                    </strong>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Material: </span>
                  {spec.materialType}
                </div>

                {spec.machineTypeRequired && (
                  <div className="text-[10px] text-slate-400 font-mono">
                    Machine: {spec.machineTypeRequired}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: DAILY MANDI SPOT RATES MASTER DESK                             */}
      {/* ===================================================================== */}
      {activeTab === 'mandi_desk' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Live Mandi Yard Spot Rates Tracker</h3>
              <p className="text-[11px] text-slate-500">
                Official APMC mandi prices used by Sales & Procurement to calculate 60/40 blended order costs.
              </p>
            </div>

            <button
              onClick={() => setShowAddMandiRateModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold flex items-center gap-1.5 shadow cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Today's Mandi Price</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mandiRates.map((rate) => (
              <div
                key={rate.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    {rate.mandiLocation}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{rate.date}</span>
                </div>

                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white">
                    {rate.spiceName} — {rate.grade}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      ₹{rate.spotRatePerKgRupees}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">/ kg</span>
                    {rate.dailyChangeRupees !== 0 && (
                      <span
                        className={`text-xs font-bold ${
                          rate.dailyChangeRupees > 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {rate.dailyChangeRupees > 0 ? `+₹${rate.dailyChangeRupees}` : `-₹${Math.abs(rate.dailyChangeRupees)}`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>Arrival Volume: <strong>{rate.arrivalBags.toLocaleString()} bags</strong></span>
                  <span className="text-[10px] text-slate-400">By: {rate.reportedBy.split(' ')[0]}</span>
                </div>

                {rate.notes && (
                  <p className="text-[10px] text-slate-400 italic">
                    {rate.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD ENTERPRISE USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#9E1C23] dark:text-amber-400" />
                <h3 className="font-bold text-sm">Add Enterprise User Account</h3>
              </div>
              <button onClick={() => setShowAddUserModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Patel"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Login Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. anand@adalajfoods.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Secure password..."
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">RBAC Role *</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="owner">Super Admin</option>
                    <option value="salesman">Sales & Dispatch</option>
                    <option value="procurement">RM Procurement Buyer</option>
                    <option value="store_keeper">Store & Warehouse</option>
                    <option value="supervisor">Plant Supervisor</option>
                    <option value="accountant">Chief Accountant</option>
                    <option value="marketing">Ads & Marketing Lead</option>
                    <option value="ca_auditor">Statutory CA Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#9E1C23] text-white font-bold shadow"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESET PASSWORD */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#9E1C23] dark:text-amber-400" />
                <h3 className="font-bold text-sm">Reset Password</h3>
              </div>
              <button onClick={() => setShowResetPasswordModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <p className="text-slate-500">
                Enter a new password for <strong>{selectedUserEmail}</strong>.
              </p>

              <div>
                <label className="block font-semibold mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password..."
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#9E1C23] text-white font-bold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT PACKAGING SPECIFICATION */}
      {showAddSpecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4 my-8 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#9E1C23] dark:text-amber-400" />
                <h3 className="font-bold text-sm">
                  {editingSpec ? 'Edit Packaging Specification' : 'Add Packaging Specification'}
                </h3>
              </div>
              <button onClick={() => setShowAddSpecModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSavePackagingSpec} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tier Level *</label>
                  <select
                    value={specTierLevel}
                    onChange={(e) => {
                      const lvl = Number(e.target.value) as PackagingTierLevel;
                      setSpecTierLevel(lvl);
                      setSpecCategory(lvl === 1 ? 'primary' : lvl === 2 ? 'secondary' : 'tertiary');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value={1}>Tier 1: Primary (Filling)</option>
                    <option value={2}>Tier 2: Secondary (Bundling)</option>
                    <option value={3}>Tier 3: Tertiary (Logistics Shipper)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">System Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. pouch_750g or carton_30kg"
                    value={specCode}
                    onChange={(e) => setSpecCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Display Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 750g Consumer Pouch (MET-PET Foil)"
                  value={specDisplayName}
                  onChange={(e) => setSpecDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Net Capacity (g) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={specNetCapacityGrams}
                    onChange={(e) => setSpecNetCapacityGrams(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Tare Weight (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={specTareWeightGrams}
                    onChange={(e) => setSpecTareWeightGrams(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Material Cost (₹) *</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={specCostRupees}
                    onChange={(e) => setSpecCostRupees(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Material Type</label>
                  <input
                    type="text"
                    placeholder="e.g. 3-Ply Barrier Laminate"
                    value={specMaterialType}
                    onChange={(e) => setSpecMaterialType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Machine Required</label>
                  <input
                    type="text"
                    placeholder="e.g. Auger Servo Filler #1"
                    value={specMachineType}
                    onChange={(e) => setSpecMachineType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Notes / Plant Guidance</label>
                <input
                  type="text"
                  placeholder="e.g. Nitrogen flushed, suitable for high humidity storage"
                  value={specNotes}
                  onChange={(e) => setSpecNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSpecModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#9E1C23] text-white font-bold"
                >
                  Save Specification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: LOG TODAY'S MANDI SPOT RATE */}
      {showAddMandiRateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#9E1C23] dark:text-amber-400" />
                <h3 className="font-bold text-sm">Log Mandi Yard Spot Price</h3>
              </div>
              <button onClick={() => setShowAddMandiRateModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleAddMandiRate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Spice Commodity *</label>
                  <select
                    value={mandiSpice}
                    onChange={(e) => setMandiSpice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="Chilli">Chilli (Mirch)</option>
                    <option value="Turmeric">Turmeric (Haldi)</option>
                    <option value="Coriander">Coriander (Dhanya)</option>
                    <option value="Cumin">Cumin (Jeera)</option>
                    <option value="Fennel">Fennel (Variyali)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Mandi / Yard *</label>
                  <select
                    value={mandiLocation}
                    onChange={(e) => setMandiLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="Unjha Mandi">Unjha Mandi (Gujarat)</option>
                    <option value="Gondal Yard">Gondal Yard (Saurashtra)</option>
                    <option value="Guntur Mandi">Guntur Yard (Andhra Pradesh)</option>
                    <option value="Sangli Yard">Sangli Mandi (Maharashtra)</option>
                    <option value="Ramganj Mandi">Ramganj Mandi (Rajasthan)</option>
                    <option value="Nizamabad Yard">Nizamabad Yard (Telangana)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Grade / Quality Specification *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Teja Stemless S17 Export Quality"
                  value={mandiGrade}
                  onChange={(e) => setMandiGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Rate (₹ / kg) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={mandiRatePerKg}
                    onChange={(e) => setMandiRatePerKg(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Daily Change (₹)</label>
                  <input
                    type="number"
                    step="1"
                    value={mandiDailyChange}
                    onChange={(e) => setMandiDailyChange(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Arrival Bags</label>
                  <input
                    type="number"
                    value={mandiArrivalBags}
                    onChange={(e) => setMandiArrivalBags(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Notes / Market Sentiment</label>
                <input
                  type="text"
                  placeholder="e.g. Strong European export demand, arrivals light"
                  value={mandiNotes}
                  onChange={(e) => setMandiNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddMandiRateModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#9E1C23] text-white font-bold"
                >
                  Save Spot Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
