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

// Section 13.3 Advertising, Marketing & E-Commerce Types
export type AdPlatform =
  | 'meta_ads'
  | 'google_ads'
  | 'amazon_ads'
  | 'blinkit_zepto'
  | 'creative_production'
  | 'offline_marketing'
  | 'influencer'
  | 'trade_fair';

export interface AdvertisingCampaign {
  id: string;
  name: string;
  platform: AdPlatform;
  status: 'active' | 'completed' | 'draft' | 'paused';
  startDate: string;
  endDate?: string;
  budgetPaise: number;
  actualSpendPaise: number;
  gstPaise: number;
  productLine: 'line_a' | 'line_b' | 'shared';
  targetSkuCode?: string;
  attributionChannel: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  roas?: number;
  vendorName: string;
  notes?: string;
}

export interface MarketplaceSettlement {
  id: string;
  marketplace: 'amazon' | 'flipkart' | 'blinkit' | 'zepto' | 'instamart' | 'other';
  statementPeriod: string;
  orderCount: number;
  grossSalesPaise: number;
  referralFeesPaise: number;
  closingFeesPaise: number;
  fulfillmentFeesPaise: number;
  shippingFeesPaise: number;
  returnsRtoPaise: number;
  adsDeductionPaise: number;
  gstOnFeesPaise: number;
  tcsPaise: number;
  netBankPayoutPaise: number;
  bankCreditDate: string;
  status: 'reconciled' | 'pending' | 'disputed';
  linkedAccountName: string;
}

// Section 13.4 Licences, Certificates & Compliance Types
export type LicenceCategory =
  | 'fssai'
  | 'gst'
  | 'weights_measures'
  | 'udyam'
  | 'trademark'
  | 'pollution_control'
  | 'factory_permit'
  | 'fire_noc'
  | 'gs1_barcode'
  | 'lab_test'
  | 'other';

export interface LicenceEvent {
  date: string;
  action: string;
  feePaise: number;
  reference: string;
}

export interface LicenceCompliance {
  id: string;
  name: string;
  category: LicenceCategory;
  registrationNo: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  renewalCadence: 'annual' | '3_year' | '5_year' | '10_year' | 'permanent' | 'quarterly';
  status: 'active' | 'expiring_soon' | 'expired' | 'in_renewal';
  annualCostPaise: number;
  lastRenewalDate?: string;
  penaltyPaise: number;
  responsiblePerson: string;
  documentRef?: string;
  notes?: string;
  history?: LicenceEvent[];
}

// User Authentication & RBAC Types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  department: string;
  lastLoginAt?: string;
}

export const ROLE_PERMISSIONS: Record<
  UserRole,
  {
    name: string;
    description: string;
    allowedModules: string[];
    canWrite: boolean;
  }
> = {
  owner: {
    name: 'Super Admin / Owner',
    description: 'Full administrative access across all plant, operational, and financial modules',
    allowedModules: [
      'dashboard',
      'batches',
      'inventory',
      'pos',
      'expenses',
      'interfirm_export',
      'advertising',
      'licences',
      'floor_mode',
      'payroll',
      'debt',
      'machines',
      'backup',
    ],
    canWrite: true,
  },
  accountant: {
    name: 'Chief Accountant & Finance',
    description: 'Access to Expenses, Bills, POs, GST ITC, Part-payments, Payroll, Debt, Licences, and Tally Export',
    allowedModules: [
      'dashboard',
      'pos',
      'expenses',
      'interfirm_export',
      'payroll',
      'debt',
      'advertising',
      'licences',
      'backup',
    ],
    canWrite: true,
  },
  supervisor: {
    name: 'Plant & Production Supervisor',
    description: 'Production batches, floor kiosk mode, machine maintenance, and stock issue tracking',
    allowedModules: [
      'batches',
      'floor_mode',
      'inventory',
      'machines',
      'interfirm_export',
    ],
    canWrite: true,
  },
  store_keeper: {
    name: 'Store & Warehouse Keeper',
    description: 'Stock lots, PO material receipts/GRN, and delivery challans to CFA Depot',
    allowedModules: [
      'inventory',
      'pos',
      'batches',
      'interfirm_export',
      'machines',
    ],
    canWrite: true,
  },
  salesman: {
    name: 'Sales & Dispatch Manager',
    description: 'Finished goods dispatch, CFA Depot transfers, Export shipments, Ads and E-commerce',
    allowedModules: [
      'dashboard',
      'interfirm_export',
      'advertising',
      'inventory',
      'licences',
    ],
    canWrite: true,
  },
  ca_auditor: {
    name: 'Statutory CA / Auditor (Read-Only)',
    description: 'Read-only audit view for books, GST claimable vs blocked ITC, tax ledgers, and compliance',
    allowedModules: [
      'dashboard',
      'pos',
      'expenses',
      'interfirm_export',
      'licences',
      'debt',
      'backup',
    ],
    canWrite: false,
  },
};

// Purchase Orders (POs) & Fulfillment Engine Types
export type PurchaseCategory =
  | 'raw_material'         // Bulk whole spices, haldi, mirchi, dhana, jeera
  | 'packing_material'     // Printed 3-layer pouches, roll film reels, cartons, labels
  | 'machinery'            // Augers, band sealers, nitrogen flushers, capex equipment
  | 'rent'                 // Factory shed & warehouse rent
  | 'electricity'          // Torrent Power / UGVCL bills (meter units, demand)
  | 'ca_legal'             // CA retainers, statutory auditor fees, legal
  | 'stationery'           // Ribbons, barcode labels, strapping tapes, lab bags
  | 'licences'             // Regulatory renewal fees & challans
  | 'other_services';

export type POFulfillmentStatus =
  | 'draft'
  | 'issued'
  | 'partially_fulfilled'
  | 'fulfilled'
  | 'cancelled';

export type PaymentMilestoneType =
  | 'advance'              // Token / advance paid before work/dispatch
  | 'part_payment'         // Partial instalment on loading/delivery
  | 'final_settlement';    // Final clearance after acceptance

export interface POPartPayment {
  id: string;
  poId: string;
  date: string;
  milestoneType: PaymentMilestoneType;
  amountPaise: number;
  paymentMode: 'bank_neft_rtgs' | 'upi' | 'cheque' | 'cash';
  accountId: string;
  accountName: string;
  utrOrRef: string;
  notes?: string;
}

export interface POItemLine {
  id: string;
  description: string;
  category: PurchaseCategory;
  hsnOrSac: string;
  qty: number;
  unit: string;
  unitPricePaise: number;
  taxableAmountPaise: number;
  gstRatePct: number; // 0, 5, 12, 18, 28
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalPaise: number;
  isClaimableITC: boolean; // Claimable GST input credit vs blocked 17(5)
  isRCM: boolean;          // Reverse charge mechanism
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;               // e.g. PO-2026-10-001
  initiationDate: string;         // Date of PO Initiation
  expectedFulfillmentDate: string;// Expected Delivery / Due Date
  actualFulfillmentDate?: string; // Date of Actual Fulfillment
  partyId: string;
  partyName: string;
  partyGstin?: string;
  purchaseCategory: PurchaseCategory;
  status: POFulfillmentStatus;
  
  // Financials in integer paise
  taxableAmountPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalAmountPaise: number;       // Gross total
  
  // GST ITC classification
  totalClaimableGstPaise: number;
  totalIneligibleGstPaise: number;
  
  // Advance & Part Payments
  advancePaidPaise: number;
  totalPaidPaise: number;
  balanceDuePaise: number;
  payments: POPartPayment[];
  
  // Line items
  items: POItemLine[];
  
  // Delivery & fulfillment logs
  fulfillmentNotes?: string;
  grnNumber?: string;
  billId?: string;
}

// Inter-Firm Finished Goods Transfers to Sister Concern / CFA Depot Types
export type TransferStatus = 'dispatched' | 'in_transit' | 'received_at_cfa' | 'cancelled';
export type TransferFormat = 'bulk_sacks' | 'retail_pouches' | 'mixed_assorted';

export interface InterFirmTransferItem {
  itemId: string;
  sku: string;
  name: string;
  packSizeGrams: number;
  batchId?: string;
  batchNumber: string;
  packsCount: number;
  boxesCount: number;
  totalGrams: number;
  ratePerKgPaise: number;
  totalValuationPaise: number;
}

export interface InterFirmTransfer {
  id: string;
  transferChallanNo: string;      // Delivery Challan under GST Rule 55
  date: string;
  destinationFirmName: string;     // e.g. "Adalaj Foods Distribution & CFA Depot"
  destinationGstin: string;
  destinationAddress: string;
  vehicleNo: string;
  ewayBillNo?: string;
  driverPhone?: string;
  format: TransferFormat;
  items: InterFirmTransferItem[];
  totalGrams: number;
  totalValuationPaise: number;
  status: TransferStatus;
  receivedAtDate?: string;
  receivedByNotes?: string;
  remarks?: string;
}

// Export Licences & Shipments Types
export type ExportFormat = 'bulk_export' | 'retail_pack_export';
export type ExportShipmentStatus = 'booking' | 'customs_cleared' | 'loaded_on_vessel' | 'dispatched_in_transit' | 'delivered';

export interface ExportShipment {
  id: string;
  exportInvoiceNo: string;
  shippingBillNo: string;
  date: string;
  consigneeName: string;
  destinationCountry: string;
  destinationPort: string;
  portOfLoading: string;           // e.g. "Mundra Port, Gujarat (INMUN1)"
  lutNumber: string;               // Letter of Undertaking under GST Rule 96A
  iecNumber: string;               // Import Export Code
  apedaRcmcNo?: string;            // APEDA Registration-cum-Membership Certificate
  spicesBoardRegNo?: string;       // Spices Board India CRES
  exportFormat: ExportFormat;
  containerNo: string;
  sealNo: string;
  totalWeightKg: number;
  foreignCurrency: 'USD' | 'AED' | 'EUR' | 'GBP';
  foreignAmountCents: number;      // e.g. 1250000 = $12,500.00
  inrRealizedPaise: number;        // integer paise
  status: ExportShipmentStatus;
  blOrAwbNumber?: string;
  blDate?: string;
  notes?: string;
}

