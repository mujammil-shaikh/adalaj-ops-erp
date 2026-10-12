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
  Sun,
  Moon,
} from 'lucide-react';
import { UserRole } from '../../types';
import { db } from '../../lib/storage';
import { PWAInstallButton } from './PWAInstallButton';
import { OfflineIndicator } from './OfflineIndicator';
import { useDeviceAdaptive } from '../../hooks/useDeviceAdaptive';
import { AdalajLogo } from '../common/AdalajLogo';
import { useTheme } from '../../context/ThemeContext';

interface AppLayoutProps {
  activeModule: string;
  onSelectModule: (module: string) => void;
  onOpenQuickAdd: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeModule,
  onSelectModule,
  onOpenQuickAdd,
  children,
}) => {
  const { isPhonePortrait, isPhoneLandscape, isSquare } = useDeviceAdaptive();
  const { theme, toggleTheme, isDark } = useTheme();

  const [activeRole, setActiveRole] = useState<UserRole>(db.getActiveRole());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    db.setActiveRole(role);
  };

  const navItems = [
    { id: 'dashboard', label: 'Where Is My Money', icon: LayoutDashboard },
    { id: 'batches', label: 'Packing Batches', icon: Package },
    { id: 'inventory', label: 'Stock & Lots', icon: Boxes },
    { id: 'expenses', label: 'Expenses & Bills', icon: Wallet },
    { id: 'floor_mode', label: 'Factory Floor Mode', icon: QrCode, highlight: true },
    { id: 'payroll', label: 'Payroll & Wages', icon: Users },
    { id: 'debt', label: 'Loans & EMI', icon: Landmark },
    { id: 'machines', label: 'Plant Machines', icon: Wrench },
    { id: 'backup', label: 'Backup & Tally Export', icon: Database },
  ];

  // Mobile Bottom Tab Navigation items (for vertical phones)
  const bottomTabs = [
    { id: 'dashboard', label: 'Money', icon: LayoutDashboard },
    { id: 'batches', label: 'Batches', icon: Package },
    { id: 'quick_add', label: 'Add', icon: PlusCircle, isAction: true },
    { id: 'inventory', label: 'Stock', icon: Boxes },
    { id: 'more', label: 'Menu', icon: Menu, isMenu: true },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-200 flex flex-col font-sans ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#FAF8F5] text-slate-900'
    }`}>
      {/* 1. Header Bar: Features the Adalaj Brand Emblem, Theme Toggle, Role Switcher & PWA Tools */}
      <header className={`px-3 sm:px-5 py-2.5 flex items-center justify-between sticky top-0 z-30 select-none border-b transition-colors ${
        isDark
          ? 'bg-slate-900/95 border-slate-800/90 text-white'
          : 'bg-white/95 border-amber-900/10 text-slate-900 shadow-sm'
      }`}>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Drawer Hamburger */}
          {(isPhonePortrait || isSquare) && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          {/* Adalaj Brand Logo */}
          <div
            onClick={() => onSelectModule('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <AdalajLogo variant={isPhonePortrait ? 'compact' : 'full'} height={isPhonePortrait ? 30 : 36} />
            <div className="hidden sm:block border-l pl-2.5 border-slate-700/40">
              <span className={`text-[11px] font-bold tracking-wider uppercase block leading-none ${
                isDark ? 'text-amber-400' : 'text-[#9A2229]'
              }`}>
                Operations ERP
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                Adalaj · Gujarat
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Controls: Theme Switcher, Role Switcher, Offline Sync & PWA Install */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Switcher */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-95 ${
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

          {/* User Role Selector */}
          <div className={`hidden lg:flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-xs ${
            isDark ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            <Shield className="w-3.5 h-3.5 text-[#9E1C23]" />
            <select
              value={activeRole}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              className="bg-transparent font-medium text-xs focus:outline-none cursor-pointer"
            >
              <option value="owner" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Role: Owner (Full Access)</option>
              <option value="accountant" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Role: Accountant</option>
              <option value="supervisor" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Role: Floor Supervisor</option>
              <option value="store_keeper" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Role: Store Keeper</option>
              <option value="ca_auditor" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>Role: CA / Auditor (Read-Only)</option>
            </select>
          </div>

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
              isDark
                ? 'bg-slate-900/70 border-slate-800/80'
                : 'bg-white border-amber-900/10'
            }`}
          >
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectModule(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#9E1C23] text-white font-bold shadow-sm'
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

            {/* Sidebar Bottom: Business Identification */}
            {!isPhoneLandscape && (
              <div className={`mt-4 pt-3 border-t text-[11px] space-y-1 px-1.5 ${
                isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'
              }`}>
                <div className={`font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                  Adalaj Operations Base
                </div>
                <div className="font-mono text-[10px] opacity-75">
                  GSTIN: 24AAGCS9412F1Z4
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>PWA Offline Cache Active</span>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* 3. Main Workspace Area: Pure Native Fluid Layout */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 pb-24 sm:pb-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* 4. Native Vertical Phone Bottom Navigation */}
      {isPhonePortrait && (
        <nav className={`fixed bottom-0 inset-x-0 z-40 px-2 py-1.5 flex items-center justify-around select-none border-t transition-colors shadow-2xl ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeModule === tab.id;

            if (tab.isAction) {
              return (
                <button
                  key={tab.id}
                  onClick={onOpenQuickAdd}
                  className="flex flex-col items-center justify-center -mt-6 active:scale-95 transition-transform"
                >
                  <div className="w-13 h-13 rounded-full bg-[#9E1C23] text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-bold mt-0.5 ${
                    isDark ? 'text-amber-400' : 'text-[#9E1C23]'
                  }`}>
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
                  className={`flex flex-col items-center justify-center py-1 ${
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
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  isActive
                    ? isDark
                      ? 'text-[#F59E0B] font-bold'
                      : 'text-[#9E1C23] font-bold'
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
          <div className={`w-4/5 max-w-xs h-full p-4 flex flex-col justify-between border-r shadow-2xl overflow-y-auto ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="space-y-4">
              <div className={`flex items-center justify-between pb-3 border-b ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <AdalajLogo variant="full" height={32} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-1.5 rounded-lg ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Theme toggle inside drawer */}
              <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <span className="text-xs font-semibold">Appearance Theme</span>
                <button
                  onClick={toggleTheme}
                  className={`px-3 py-1 rounded text-xs font-bold transition ${
                    isDark ? 'bg-slate-800 text-amber-300' : 'bg-white shadow-sm text-slate-900'
                  }`}
                >
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>

              {/* Role Switcher in Drawer */}
              <div className={`p-2.5 rounded-lg border text-xs ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={`text-[11px] block mb-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Active Role
                </span>
                <select
                  value={activeRole}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className={`w-full border rounded p-1.5 text-xs font-medium ${
                    isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="owner">Owner (Full Access)</option>
                  <option value="accountant">Accountant</option>
                  <option value="supervisor">Floor Supervisor</option>
                  <option value="store_keeper">Store Keeper</option>
                  <option value="ca_auditor">CA / Auditor</option>
                </select>
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
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold ${
                        isActive
                          ? 'bg-[#9E1C23] text-white font-bold'
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

            <div className={`pt-4 border-t text-xs space-y-2 ${
              isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
            }`}>
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
