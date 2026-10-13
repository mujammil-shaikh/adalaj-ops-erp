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
import { LoginScreen } from './components/auth/LoginScreen';
import { db } from './lib/storage';
import { AuthUser, ROLE_PERMISSIONS } from './types';

function AppContent() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => db.getAuthUser());
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [showQuickExpense, setShowQuickExpense] = useState<boolean>(false);

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
          const allowed = ROLE_PERMISSIONS[user.role]?.allowedModules || ['dashboard'];
          setActiveModule(allowed[0] || 'dashboard');
        }}
      />
    );
  }

  const handleOpenQuickAdd = () => {
    setActiveModule('expenses');
    setShowQuickExpense(true);
  };

  const handleLogout = () => {
    db.logout();
    setCurrentUser(null);
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
