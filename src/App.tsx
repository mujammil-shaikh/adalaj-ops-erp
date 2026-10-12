/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardWhereIsMyMoney } from './components/modules/DashboardWhereIsMyMoney';
import { BatchesModule } from './components/modules/BatchesModule';
import { InventoryModule } from './components/modules/InventoryModule';
import { ExpensesModule } from './components/modules/ExpensesModule';
import { FactoryFloorMode } from './components/modules/FactoryFloorMode';
import { PayrollModule } from './components/modules/PayrollModule';
import { DebtModule } from './components/modules/DebtModule';
import { MachinesModule } from './components/modules/MachinesModule';
import { DataBackupModule } from './components/modules/DataBackupModule';

function AppContent() {
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [showQuickExpense, setShowQuickExpense] = useState<boolean>(false);

  const handleOpenQuickAdd = () => {
    setActiveModule('expenses');
    setShowQuickExpense(true);
  };

  const renderModule = () => {
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
      case 'batches':
        return (
          <BatchesModule
            onNavigateToFloor={() => setActiveModule('floor_mode')}
          />
        );
      case 'inventory':
        return <InventoryModule />;
      case 'expenses':
        return <ExpensesModule initialShowQuickAdd={showQuickExpense} />;
      case 'floor_mode':
        return (
          <FactoryFloorMode
            onBackToDashboard={() => setActiveModule('dashboard')}
          />
        );
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
