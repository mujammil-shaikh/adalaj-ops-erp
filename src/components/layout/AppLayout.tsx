import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  Wallet,
  Wrench,
  Users,
  Landmark,
  Database,
  QrCode,
  PlusCircle,
  Menu,
  X,
  ChevronRight,
  Shield,
  ShieldCheck,
  Megaphone,
  Sun,
  Moon,
  FileText,
  FileSpreadsheet,
  Truck,
  LogOut,
  Download,
  UserCheck,
  Building2,
  Scale,
  Cpu,
  TrendingUp,
} from 'lucide-react';
import { UserRole, AuthUser, ROLE_PERMISSIONS, BusinessEntityId } from '../../types';
import { db } from '../../lib/storage';
import { PWAInstallButton } from './PWAInstallButton';
import { OfflineIndicator } from './OfflineIndicator';
import { useDeviceAdaptive } from '../../hooks/useDeviceAdaptive';
import { AdalajLogo } from '../common/AdalajLogo';
import { useTheme } from '../../context/ThemeContext';
import { triggerAutomaticJsonBackup } from '../../lib/backup';

interface AppLayoutProps {
  activeModule: string;
  onSelectModule: (module: string) => void;
  onOpenQuickAdd: () => void;
  currentUser: AuthUser | null;
  onLogout: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeModule,
  onSelectModule,
  onOpenQuickAdd,
  currentUser,
  onLogout,
  children,
}) => {
  const { isPhonePortrait, isPhoneLandscape, isSquare } = useDeviceAdaptive();
  const { toggleTheme, isDark } = useTheme();

  const activeRole: UserRole = currentUser?.role || 'owner';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backupToast, setBackupToast] = useState<string | null>(null);
  const [activeEntity, setActiveEntity] = useState<BusinessEntityId | 'all'>(() => db.getActiveEntityId());

  const handleSelectEntity = (id: BusinessEntityId | 'all') => {
    setActiveEntity(id);
    db.setActiveEntityId(id);
    window.dispatchEvent(new CustomEvent('adalaj:entity_changed', { detail: { entityId: id } }));
  };

  const handleQuickBackup = () => {
    const res = triggerAutomaticJsonBackup(currentUser?.name);
    if (res.success) {
      setBackupToast(`Backup JSON saved: ${res.filename}`);
      setTimeout(() => setBackupToast(null), 4000);
    }
  };

  // Master List of Modules with Dedicated Role Portals
  const allNavItems = [
    { id: 'portal_admin', label: '👑 Super Admin Master', icon: Shield, highlight: true },
    { id: 'portal_sales', label: '💼 Sales & CRM Portal', icon: FileText, highlight: true },
    { id: 'portal_procurement', label: '🌾 Mandi Procurement', icon: TrendingUp, highlight: true },
    { id: 'portal_store', label: '📦 Store & Warehouse', icon: Boxes, highlight: true },
    { id: 'portal_floor', label: '🏭 Factory Floor Kiosk', icon: Cpu, highlight: true },
    { id: 'portal_finance', label: '💰 Finance & Accounts', icon: Landmark, highlight: true },
    { id: 'portal_marketing', label: '📣 Marketing & Growth', icon: Megaphone, highlight: true },
    { id: 'dashboard', label: 'Where Is My Money', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices & Quotations', icon: FileSpreadsheet },
    { id: 'batches', label: 'Packing Batches', icon: Package },
    { id: 'inventory', label: 'Stock & Lots', icon: Boxes },
    { id: 'pos', label: 'Purchase Orders (POs)', icon: FileText },
    { id: 'expenses', label: 'Expenses & Bills', icon: Wallet },
    { id: 'interfirm_export', label: 'Entities & Reconciliation', icon: Scale },
    { id: 'advertising', label: 'Ads & E-Commerce', icon: Megaphone },
    { id: 'licences', label: 'Licences & Compliance', icon: ShieldCheck },
    { id: 'floor_mode', label: 'Factory Floor Mode', icon: QrCode },
    { id: 'payroll', label: 'Payroll & Wages', icon: Users },
    { id: 'debt', label: 'Loans & EMI', icon: Landmark },
    { id: 'machines', label: 'Plant Machines', icon: Wrench },
    { id: 'backup', label: 'Backup & Tally Export', icon: Database },
  ];

  // RBAC Filter: Only show modules the active role has permission to access!
  const allowedModuleIds = ROLE_PERMISSIONS[activeRole]?.allowedModules || [];
  const navItems = allNavItems.filter((item) => allowedModuleIds.includes(item.id));

  // Mobile Bottom Tab Navigation items (dynamically filtered)
  const bottomTabs = [
    { id: 'dashboard', label: 'Money', icon: LayoutDashboard },
    { id: 'batches', label: 'Batches', icon: Package },
    { id: 'quick_add', label: 'Add', icon: PlusCircle, isAction: true },
    { id: 'inventory', label: 'Stock', icon: Boxes },
    { id: 'more', label: 'Menu', icon: Menu, isMenu: true },
  ].filter((tab) => tab.isAction || tab.isMenu || allowedModuleIds.includes(tab.id));

  return (
    <div
      className={`min-h-screen transition-colors duration-200 flex flex-col font-sans ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#FAF8F5] text-slate-900'
      }`}
    >
      {/* Backup Notification Toast */}
      {backupToast && (
        <div className="fixed top-3 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-2xl animate-bounce">
          <Download className="w-4 h-4 flex-shrink-0" />
          <span>{backupToast}</span>
        </div>
      )}

      {/* 1. Header Bar: Features the Adalaj Brand Emblem, Theme Toggle, Role Switcher & PWA Tools */}
      <header
        className={`px-3 sm:px-5 py-2.5 flex items-center justify-between sticky top-0 z-30 select-none border-b transition-colors ${
          isDark
            ? 'bg-slate-900/95 border-slate-800/90 text-white'
            : 'bg-white/95 border-amber-900/10 text-slate-900 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Drawer Hamburger */}
          {(isPhonePortrait || isSquare) && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          {/* Adalaj Brand Logo */}
          <div
            onClick={() => onSelectModule(allowedModuleIds[0] || 'dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <AdalajLogo variant={isPhonePortrait ? 'compact' : 'full'} height={isPhonePortrait ? 30 : 36} />
            <div className="hidden sm:block border-l pl-2.5 border-slate-700/40">
              <span
                className={`text-[11px] font-bold tracking-wider uppercase block leading-none ${
                  isDark ? 'text-amber-400' : 'text-[#9A2229]'
                }`}
              >
                Operations ERP
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                Adalaj · Gujarat
              </span>
            </div>
          </div>

          {/* Dual Legal Entity Architecture Switcher (Section 1 & 7) */}
          <div className="hidden md:flex items-center p-0.5 rounded-xl border bg-slate-100/90 dark:bg-slate-950/80 dark:border-slate-800 text-xs font-semibold ml-2">
            <button
              onClick={() => handleSelectEntity('pvt_ltd')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] font-bold ${
                activeEntity === 'pvt_ltd'
                  ? 'bg-[#9A2229] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title="Adalaj Food Products Pvt. Ltd. (Main Company · Strategic B2B & Modern Trade)"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Main Pvt. Ltd.</span>
            </button>
            <button
              onClick={() => handleSelectEntity('sister_prop')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] font-bold ${
                activeEntity === 'sister_prop'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title="Adalaj Distribution & Trading Co. (Sister Firm · Routine Gujarat Distribution)"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Sister Depot</span>
            </button>
            <button
              onClick={() => handleSelectEntity('all')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] font-bold ${
                activeEntity === 'all'
                  ? 'bg-indigo-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title="Consolidated Multi-Entity Audit & Reconciliation Cockpit"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Reconciliation</span>
            </button>
          </div>
        </div>

        {/* Right Header Controls: Theme Switcher, Quick Backup, Role Selector, User Chip & Sign Out */}
        <div className="flex items-center gap-2">
          {/* Quick Auto-Backup JSON Button */}
          <button
            onClick={handleQuickBackup}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-emerald-400 hover:bg-slate-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
            }`}
            title="Download Instant Full Database Backup JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xl:inline text-[11px]">Save Backup</span>
          </button>

          {/* Light / Dark Mode Switcher */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-amber-300 hover:bg-slate-700'
                : 'bg-amber-50/80 border-amber-200/80 text-amber-900 hover:bg-amber-100'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle light or dark theme"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline text-[11px]">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700" />
                <span className="hidden md:inline text-[11px]">Dark</span>
              </>
            )}
          </button>

          {/* Verified Role Badge (Strict Read-Only) */}
          <div
            className={`hidden lg:flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-xs select-none ${
              isDark ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#9A2229] dark:text-amber-400" />
            <span className="font-bold text-[11px]">
              Role: {ROLE_PERMISSIONS[activeRole]?.name.split('/')[0]}
            </span>
          </div>


          {/* User Profile Chip */}
          {currentUser && (
            <div
              className={`hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl border text-xs ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-[#9A2229] text-white flex items-center justify-center font-bold text-[10px]">
                {currentUser.name.charAt(0)}
              </div>
              <div className="truncate max-w-[110px]">
                <div className="font-semibold truncate text-[11px] leading-tight">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[9px] text-slate-400 capitalize">
                  {ROLE_PERMISSIONS[activeRole]?.name.split('/')[0]}
                </div>
              </div>
            </div>
          )}

          {/* Sign Out Button */}
          <button
            onClick={onLogout}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border text-xs font-semibold transition active:scale-95 cursor-pointer flex items-center gap-1.5 ${
              isDark
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
            }`}
            title="Sign out of ERP workspace"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Sign Out</span>
          </button>

          {/* Offline Sync Outbox Status */}
          <OfflineIndicator />

          {/* In-App PWA Install Button */}
          <PWAInstallButton compact={isPhonePortrait} />
        </div>
      </header>

      {/* 2. Main Body: Fully Fluid & Native Responsive across any screen aspect ratio */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop / Tablet / Landscape Icon Rail or Sidebar */}
        {!isPhonePortrait && (
          <aside
            className={`${
              isPhoneLandscape ? 'w-16' : isSquare ? 'w-52' : 'w-64'
            } border-r flex flex-col justify-between p-2 flex-shrink-0 select-none overflow-y-auto transition-colors ${
              isDark ? 'bg-slate-900/70 border-slate-800/80' : 'bg-white border-amber-900/10'
            }`}
          >
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Authorized Modules ({navItems.length})
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectModule(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#9A2229] text-white font-bold shadow-sm'
                        : item.highlight
                        ? isDark
                          ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                          : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300/60'
                        : isDark
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                    }`}
                    title={item.label}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                    {!isPhoneLandscape && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>

            {/* Sidebar Bottom: Business Identification & Active Role */}
            {!isPhoneLandscape && (
              <div
                className={`mt-4 pt-3 border-t text-[11px] space-y-1 px-1.5 ${
                  isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
                }`}
              >
                <div className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                  Adalaj Operations Base
                </div>
                <div className="font-mono text-[10px] opacity-75">
                  GSTIN: 24AAGCS9412F1Z4
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>RBAC Session: {ROLE_PERMISSIONS[activeRole]?.name.split('/')[0]}</span>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* 3. Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 pb-24 sm:pb-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* 4. Native Vertical Phone Bottom Navigation */}
      {isPhonePortrait && (
        <nav
          className={`fixed bottom-0 inset-x-0 z-40 px-2 py-1.5 flex items-center justify-around select-none border-t transition-colors shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeModule === tab.id;

            if (tab.isAction) {
              return (
                <button
                  key={tab.id}
                  onClick={onOpenQuickAdd}
                  className="flex flex-col items-center justify-center -mt-6 active:scale-95 transition-transform cursor-pointer"
                >
                  <div className="w-13 h-13 rounded-full bg-[#9A2229] text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[10px] font-bold mt-0.5 ${
                      isDark ? 'text-amber-400' : 'text-[#9A2229]'
                    }`}
                  >
                    Quick Add
                  </span>
                </button>
              );
            }

            if (tab.isMenu) {
              return (
                <button
                  key={tab.id}
                  onClick={() => setMobileMenuOpen(true)}
                  className={`flex flex-col items-center justify-center py-1 cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => onSelectModule(tab.id)}
                className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'text-[#F59E0B] font-bold'
                      : 'text-[#9A2229] font-bold'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5 font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* 5. Mobile Slide-Over Drawer for remaining modules */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-950/80 backdrop-blur-sm">
          <div
            className={`w-4/5 max-w-xs h-full p-4 flex flex-col justify-between border-r shadow-2xl overflow-y-auto ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="space-y-4">
              <div
                className={`flex items-center justify-between pb-3 border-b ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}
              >
                <AdalajLogo variant="full" height={32} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User info in drawer */}
              {currentUser && (
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-bold">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-400">{currentUser.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Mobile Entity Switcher */}
              <div
                className={`p-2.5 rounded-xl border text-xs ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Operating Entity Context
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => handleSelectEntity('pvt_ltd')}
                    className={`p-1.5 rounded-lg text-[10px] font-bold text-center transition ${
                      activeEntity === 'pvt_ltd'
                        ? 'bg-[#9A2229] text-white'
                        : 'bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Main Pvt Ltd
                  </button>
                  <button
                    onClick={() => handleSelectEntity('sister_prop')}
                    className={`p-1.5 rounded-lg text-[10px] font-bold text-center transition ${
                      activeEntity === 'sister_prop'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Sister Depot
                  </button>
                  <button
                    onClick={() => handleSelectEntity('all')}
                    className={`p-1.5 rounded-lg text-[10px] font-bold text-center transition ${
                      activeEntity === 'all'
                        ? 'bg-indigo-700 text-white'
                        : 'bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Combined
                  </button>
                </div>
              </div>

              {/* Quick backup button in drawer */}
              <button
                onClick={handleQuickBackup}
                className="w-full py-2 px-3 rounded-xl border text-xs font-bold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Save Database Backup JSON</span>
              </button>

              {/* Theme toggle inside drawer */}
              <div
                className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <span className="text-xs font-semibold">Appearance Theme</span>
                <button
                  onClick={toggleTheme}
                  className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
                    isDark ? 'bg-slate-800 text-amber-300' : 'bg-white shadow-sm text-slate-900'
                  }`}
                >
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>

              {/* Verified RBAC Role in Drawer (Strict Read-Only) */}
              <div
                className={`p-2.5 rounded-lg border text-xs select-none ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span
                  className={`text-[10px] block mb-0.5 font-bold uppercase tracking-wider ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Verified Security Role
                </span>
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="truncate">{ROLE_PERMISSIONS[activeRole]?.name}</span>
                </div>
              </div>

              {/* Drawer Links */}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectModule(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        isActive
                          ? 'bg-[#9A2229] text-white font-bold'
                          : isDark
                          ? 'text-slate-300 hover:bg-slate-800'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-40" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className={`pt-4 border-t text-xs space-y-2 ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}
            >
              <PWAInstallButton />
              <div className="text-[10px] opacity-75">
                Adalaj Operations ERP · PWA Standalone
              </div>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
    </div>
  );
};
