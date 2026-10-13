/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardWhereIsMyMoney } from './components/modules/DashboardWhereIsMyMoney';
import { BatchesModule } from './components/modules/BatchesModule';
import { InventoryModule } from './components/modules/InventoryModule';
import { PurchaseOrdersModule } from './components/modules/PurchaseOrdersModule';
import { ExpensesModule } from './components/modules/ExpensesModule';
import { InterFirmAndExportModule } from './components/modules/InterFirmAndExportModule';
import { FactoryFloorMode } from './components/modules/FactoryFloorMode';
import { PayrollModule } from './components/modules/PayrollModule';
import { DebtModule } from './components/modules/DebtModule';
import { MachinesModule } from './components/modules/MachinesModule';
import { AdvertisingModule } from './components/modules/AdvertisingModule';
import { LicencesModule } from './components/modules/LicencesModule';
import { DataBackupModule } from './components/modules/DataBackupModule';
import { InvoicesAndQuotationsModule } from './components/modules/InvoicesAndQuotationsModule';
import { SuperAdminCockpit } from './components/portals/SuperAdminCockpit';
import { SalesPortal } from './components/portals/SalesPortal';
import { ProcurementPortal } from './components/portals/ProcurementPortal';
import { StorePortal } from './components/portals/StorePortal';
import { FactoryFloorPortal } from './components/portals/FactoryFloorPortal';
import { FinancePortal } from './components/portals/FinancePortal';
import { MarketingPortal } from './components/portals/MarketingPortal';
import { LoginScreen } from './components/auth/LoginScreen';
import { db } from './lib/storage';
import { AuthUser, UserRole, ROLE_PERMISSIONS } from './types';

const getDefaultModuleForRole = (role: UserRole): string => {
  switch (role) {
    case 'owner':
      return 'portal_admin';
    case 'salesman':
      return 'portal_sales';
    case 'procurement':
      return 'portal_procurement';
    case 'store_keeper':
      return 'portal_store';
    case 'supervisor':
      return 'portal_floor';
    case 'accountant':
      return 'portal_finance';
    case 'marketing':
      return 'portal_marketing';
    case 'ca_auditor':
    default:
      return 'dashboard';
  }
};

function AppContent() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => db.getAuthUser());
  const [activeModule, setActiveModule] = useState<string>(() => {
    const user = db.getAuthUser();
    return user ? getDefaultModuleForRole(user.role) : 'dashboard';
  });
  const [showQuickExpense, setShowQuickExpense] = useState<boolean>(false);
  const [teleportActive, setTeleportActive] = useState<boolean>(false);
  const [originalAdminUser, setOriginalAdminUser] = useState<AuthUser | null>(null);

  // Enforce RBAC guard on activeModule
  useEffect(() => {
    if (!currentUser) return;
    const allowed = ROLE_PERMISSIONS[currentUser.role]?.allowedModules || ['dashboard'];
    if (!allowed.includes(activeModule)) {
      setActiveModule(allowed[0] || 'dashboard');
    }
  }, [currentUser, activeModule]);

  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          const defaultMod = getDefaultModuleForRole(user.role);
          setActiveModule(defaultMod);
        }}
      />
    );
  }

  // Super Admin 1-Click Role Teleportation
  const handleTeleportToRole = (targetRole: UserRole) => {
    if (currentUser.role === 'owner' && !originalAdminUser) {
      setOriginalAdminUser(currentUser);
    }
    const switchedUser = db.teleportToRole(targetRole);
    setCurrentUser(switchedUser);
    setTeleportActive(targetRole !== 'owner');
    const targetMod = getDefaultModuleForRole(targetRole);
    setActiveModule(targetMod);
  };

  const handleReturnToAdmin = () => {
    const adminUser = originalAdminUser || db.teleportToRole('owner');
    db.setAuthUser(adminUser);
    setCurrentUser(adminUser);
    setTeleportActive(false);
    setActiveModule('portal_admin');
  };

  const handleOpenQuickAdd = () => {
    setActiveModule('expenses');
    setShowQuickExpense(true);
  };

  const handleLogout = () => {
    db.logout();
    setCurrentUser(null);
    setTeleportActive(false);
    setOriginalAdminUser(null);
  };

  const renderModule = () => {
    // RBAC validation: only render if authorized
    const allowed = ROLE_PERMISSIONS[currentUser.role]?.allowedModules || [];
    if (!allowed.includes(activeModule)) {
      return (
        <div className="p-8 text-center max-w-md mx-auto space-y-3">
          <div className="text-rose-500 font-bold text-base">Access Restricted by RBAC Policy</div>
          <p className="text-xs text-slate-500">
            Your assigned role ({ROLE_PERMISSIONS[currentUser.role]?.name}) does not have permission to view this operational module.
          </p>
          <button
            onClick={() => setActiveModule(allowed[0] || 'dashboard')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#9A2229]"
          >
            Return to Default Module
          </button>
        </div>
      );
    }

    switch (activeModule) {
      // --- DEDICATED ROLE PORTALS ---
      case 'portal_admin':
        return (
          <SuperAdminCockpit
            currentUser={currentUser}
            onTeleportToRole={handleTeleportToRole}
            onNavigateModule={(mod) => setActiveModule(mod)}
          />
        );
      case 'portal_sales':
        return (
          <SalesPortal
            currentUser={currentUser}
            onNavigateModule={(mod) => setActiveModule(mod)}
          />
        );
      case 'portal_procurement':
        return (
          <ProcurementPortal
            currentUser={currentUser}
            onNavigateModule={(mod) => setActiveModule(mod)}
          />
        );
      case 'portal_store':
        return (
          <StorePortal
            currentUser={currentUser}
            onNavigateModule={(mod) => setActiveModule(mod)}
          />
        );
      case 'portal_floor':
        return (
          <FactoryFloorPortal
            currentUser={currentUser}
            onNavigateModule={(mod) => setActiveModule(mod)}
          />
        );
      case 'portal_finance':
        return (
          <FinancePortal
            currentUser={currentUser}
            onNavigateModule={(mod) => setActiveModule(mod)}
          />
        );
      case 'portal_marketing':
        return (
          <MarketingPortal
            currentUser={currentUser}
            onNavigateModule={(mod) => setActiveModule(mod)}
          />
        );

      // --- STANDARD MODULES ---
      case 'dashboard':
        return (
          <DashboardWhereIsMyMoney
            onNavigate={(mod) => {
              setActiveModule(mod);
            }}
            onOpenQuickAdd={handleOpenQuickAdd}
          />
        );
      case 'invoices':
        return <InvoicesAndQuotationsModule />;
      case 'batches':
        return (
          <BatchesModule
            onNavigateToFloor={() => setActiveModule('floor_mode')}
          />
        );
      case 'inventory':
        return <InventoryModule />;
      case 'pos':
        return <PurchaseOrdersModule />;
      case 'expenses':
        return <ExpensesModule initialShowQuickAdd={showQuickExpense} />;
      case 'interfirm_export':
        return <InterFirmAndExportModule />;
      case 'floor_mode':
        return (
          <FactoryFloorMode
            onBackToDashboard={() => setActiveModule('dashboard')}
          />
        );
      case 'advertising':
        return <AdvertisingModule />;
      case 'licences':
        return <LicencesModule />;
      case 'payroll':
        return <PayrollModule />;
      case 'debt':
        return <DebtModule />;
      case 'machines':
        return <MachinesModule />;
      case 'backup':
        return <DataBackupModule />;
      default:
        return (
          <DashboardWhereIsMyMoney
            onNavigate={(mod) => setActiveModule(mod)}
            onOpenQuickAdd={handleOpenQuickAdd}
          />
        );
    }
  };

  return (
    <AppLayout
      activeModule={activeModule}
      currentUser={currentUser}
      onLogout={handleLogout}
      onSelectModule={(mod) => {
        setActiveModule(mod);
        setShowQuickExpense(false);
      }}
      onOpenQuickAdd={handleOpenQuickAdd}
    >
      {/* Floating Teleport Indicator when Super Admin is inspecting an anonymized portal */}
      {teleportActive && (
        <div className="mb-4 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black flex flex-wrap items-center justify-between gap-2 shadow-lg animate-fade-in border border-amber-300">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-black text-amber-300 text-[10px] uppercase font-mono tracking-wider">
              Teleport Mode Active
            </span>
            <span>
              Inspecting as <strong>{currentUser.name}</strong> ({currentUser.role.toUpperCase()})
            </span>
          </div>
          <button
            onClick={handleReturnToAdmin}
            className="px-3.5 py-1 rounded-xl bg-black hover:bg-slate-900 text-amber-300 font-bold transition-all shadow cursor-pointer flex items-center gap-1.5"
          >
            <span>Return to Super Admin Cockpit</span>
            <span>👑</span>
          </button>
        </div>
      )}

      {renderModule()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
