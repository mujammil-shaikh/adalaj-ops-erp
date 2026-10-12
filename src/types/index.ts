export type UserRole = 'owner' | 'accountant' | 'store_keeper' | 'supervisor' | 'salesman' | 'ca_auditor';

export interface BusinessEntity {
  id: string;
  name: string;
  location: string;
  gstin: string;
  pan: string;
  financialYearStart: string; // "04-01"
  currency: string;
}

export type ItemType = 'raw_material' | 'packing_material' | 'finished_good' | 'consumable';

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  baseFactor: number; // e.g. 1000 for kg -> g
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  type: ItemType;
  unit: string; // 'kg' | 'g' | 'pcs' | 'box'
  baseUnit: string; // 'g' or 'pcs'
  reorderLevelBase: number;
  currentStockBase: number;
  averageCostPaise: number; // cost per base unit
  packSizeGrams?: number;
  mrpPaise?: number;
  category: string;
}

export interface StockLot {
  id: string;
  lotNo: string;
  itemId: string;
  itemName: string;
  supplierLotNo?: string;
  supplierName?: string;
  receivedOn: string;
  expiryOn: string;
  qtyBase: number;
  landedCostPerKgPaise: number;
  status: 'available' | 'hold' | 'exhausted' | 'rejected';
  locationId: string;
}

export interface StockMovement {
  id: string;
  date: string;
  time: string;
  itemId: string;
  itemName: string;
  lotId?: string;
  lotNo?: string;
  locationId: string;
  locationName: string;
  qtyBase: number; // positive = in, negative = out
  type: 'receipt' | 'issue' | 'production_in' | 'production_out' | 'transfer' | 'wastage' | 'adjustment';
  reference: string;
  unitCostPaise: number;
  notes?: string;
}

export interface Recipe {
  id: string;
  finishedItemId: string;
  finishedItemName: string;
  packSizeGrams: number;
  powderPerPackGrams: number;
  packingMaterials: {
    itemId: string;
    itemName: string;
    qtyPerPack: number;
  }[];
  expectedYieldPct: number;
  notes?: string;
}

export interface BatchWastage {
  reason: 'powder_spill' | 'film_reject' | 'cylinder_damage' | 'weight_trim' | 'machine_jam';
  qtyGramsOrPcs: number;
  notes?: string;
}

export interface BatchOutputItem {
  itemId: string;
  itemName: string;
  packsProduced: number;
  packSizeGrams: number;
  totalGrams: number;
  mrpPaise: number;
}

export interface BatchCostBreakdown {
  rawPowderPaise: number;
  packingMaterialPaise: number;
  directLabourPaise: number;
  powerAndWearPaise: number;
  thirdPartyFeePaise: number;
  totalCostPaise: number;
  costPerPackPaise: number;
  costPerKgPaise: number;
}

export interface PackingBatch {
  id: string;
  batchNo: string;
  date: string;
  shift: 'morning' | 'evening' | 'night';
  status: 'planned' | 'running' | 'completed' | 'closed';
  machineId: string;
  machineName: string;
  workers: string[]; // employee names
  rawLotId: string;
  rawItemId: string;
  rawItemName: string;
  rawIssuedGrams: number;
  rawReturnedGrams: number;
  outputs: BatchOutputItem[];
  packingMaterialsUsed: {
    itemId: string;
    itemName: string;
    qtyPcs: number;
  }[];
  wastage: BatchWastage[];
  qcPassed: boolean;
  qcChecks: {
    weightAccuracy: boolean;
    sealIntegrity: boolean;
    metalDetectorClean: boolean;
    batchCodingLegible: boolean;
  };
  costs: BatchCostBreakdown;
  toleranceVariancePct: number;
  notes?: string;
  closedAt?: string;
}

export interface Party {
  id: string;
  name: string;
  type: 'supplier' | 'packer' | 'customer' | 'lender' | 'employee' | 'landlord';
  phone: string;
  gstin?: string;
  city: string;
  creditDays: number;
  outstandingPaise: number; // positive = we owe them, negative = they owe us
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'upi' | 'petty_cash';
  accountNoMasked?: string;
  balancePaise: number;
}

export interface Transaction {
  id: string;
  txnNo: string;
  date: string;
  direction: 'in' | 'out' | 'transfer';
  accountId: string;
  accountName: string;
  toAccountId?: string;
  partyId?: string;
  partyName?: string;
  amountPaise: number;
  headCategory: string;
  mode: 'Cash' | 'HDFC NetBanking' | 'SBI Transfer' | 'UPI' | 'Cheque';
  reference?: string;
  status: 'draft' | 'pending_approval' | 'posted' | 'void';
  batchId?: string;
  notes?: string;
  hasAttachment?: boolean;
}

export interface Bill {
  id: string;
  billNo: string;
  partyId: string;
  partyName: string;
  date: string;
  dueDate: string;
  subtotalPaise: number;
  gstPaise: number;
  totalPaise: number;
  paidPaise: number;
  status: 'pending' | 'part_paid' | 'paid';
  itemsDescription: string;
}

export interface MachineAsset {
  id: string;
  name: string;
  serialNo: string;
  purchaseDate: string;
  costPaise: number;
  depreciationRatePct: number;
  currentBookValuePaise: number;
  status: 'operational' | 'maintenance' | 'idle';
  totalBatchHours: number;
  lastServiceDate: string;
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  designation: string;
  payType: 'monthly' | 'daily' | 'piece_rate';
  ratePaise: number;
  phone: string;
  uan?: string;
  esicNo?: string;
  active: boolean;
  attendancePresentDaysThisMonth: number;
  pieceCountThisMonth: number;
}

export interface Loan {
  id: string;
  lenderName: string;
  kind: 'machinery' | 'overdraft' | 'credit_card' | 'personal';
  principalPaise: number;
  balancePaise: number;
  rateAnnualPct: number;
  emiPaise: number;
  nextDueDate: string;
  tenureMonthsRemaining: number;
}

export interface OutboxItem {
  id: string;
  timestamp: string;
  action: 'create' | 'update' | 'void';
  entity:
    | 'batch'
    | 'transaction'
    | 'movement'
    | 'lot'
    | 'item'
    | 'recipe'
    | 'party'
    | 'bill'
    | 'asset'
    | 'employee'
    | 'loan';
  payloadSummary: string;
  synced: boolean;
}
