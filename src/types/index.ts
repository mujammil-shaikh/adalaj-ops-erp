export type UserRole =
  | 'owner'
  | 'accountant'
  | 'store_keeper'
  | 'supervisor'
  | 'salesman'
  | 'procurement'
  | 'marketing'
  | 'ca_auditor';

export type BusinessEntityId = 'pvt_ltd' | 'sister_prop';

export interface BusinessEntityConfig {
  id: BusinessEntityId;
  name: string;
  shortName: string;
  legalType: 'Private Limited Company' | 'Sole Proprietorship';
  tradeName: string;
  cinOrReg: string;
  gstin: string;
  pan: string;
  address: string;
  stateCode: string; // "24"
  bankAccount: string;
  bankName: string;
  ifsc: string;
  roleDescription: string;
  creditLimitWithParentPaise?: number; // e.g. ₹50,00,000
  defaultCreditPeriodDays?: number;    // e.g. 45 days (up to 90 days)
  colorCode: string;
}

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

// Customer Channel Classifications (Sections 2 & 3 of Business Structure)
export type CustomerChannel =
  // Main Pvt. Ltd. (Exclusive Strategic Accounts)
  | 'hq_depot'            // Headquarters & Home-State Depot
  | 'export'              // Direct Exports & International Buyers
  | 'modern_trade'        // Modern Trade Supermarkets & Regional Chains
  | 'institutional_large' // Large Institutional Consumers
  | 'fmcg_chain'          // Large FMCG & Multi-outlet Restaurant Chains
  | 'horeca_large'        // Large HORECA Groups & Multi-property Hotel Chains
  | 'industrial_mfg'      // Industrial & Ingredient Manufacturing (ITC, Haldiram's scale)
  | 'private_label'       // Private-Label & Contract Manufacturing
  // Sister Proprietorship (Exclusive Gujarat Routine Distribution)
  | 'cfa_distributor'     // CFA Operations & Downstream Distributors
  | 'super_stockist'      // Super-Stockists (SS) & Stockists
  | 'small_retailer'      // Small & Medium Kirana Retailers
  | 'quick_commerce'      // E-Commerce & Quick-Commerce (Zepto, Blinkit, Instamart)
  | 'd2c'                 // Direct-to-Consumer
  | 'horeca_small'        // Independent Restaurants, Cafés & Small Food-service
  | 'regional_trade';     // General Secondary Regional Wholesale

export interface Party {
  id: string;
  name: string;
  type: 'supplier' | 'packer' | 'customer' | 'lender' | 'employee' | 'landlord';
  phone: string;
  gstin?: string;
  city: string;
  creditDays: number;
  outstandingPaise: number; // positive = we owe them, negative = they owe us
  channel?: CustomerChannel;
  assignedEntityId?: BusinessEntityId;
  pan?: string;
  state?: string;
  creditLimitPaise?: number;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'upi' | 'petty_cash';
  accountNoMasked?: string;
  balancePaise: number;
  entityId?: BusinessEntityId; // 'pvt_ltd' or 'sister_prop'
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
  entityId?: BusinessEntityId; // 'pvt_ltd' or 'sister_prop'
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
  entityId?: BusinessEntityId; // 'pvt_ltd' or 'sister_prop'
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

export interface SystemUserCredential {
  email: string;
  password: string;
  user: AuthUser;
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
      'portal_admin',
      'portal_sales',
      'portal_procurement',
      'portal_store',
      'portal_floor',
      'portal_finance',
      'portal_marketing',
      'dashboard',
      'invoices',
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
    description: 'Access to Expenses, Bills, Invoices, POs, GST ITC, Part-payments, Payroll, Debt, Licences, and Tally Export',
    allowedModules: [
      'portal_finance',
      'dashboard',
      'invoices',
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
      'portal_floor',
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
      'portal_store',
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
    description: 'Customer Invoices, Quotations, Finished goods dispatch, CFA Depot transfers, Export shipments, Ads and E-commerce',
    allowedModules: [
      'portal_sales',
      'dashboard',
      'invoices',
      'interfirm_export',
      'advertising',
      'inventory',
      'licences',
    ],
    canWrite: true,
  },
  procurement: {
    name: 'Raw Material Procurement Manager',
    description: 'Daily Mandi spot rates (Unjha, Gondal, Guntur), spot POs, blend cost inputs, and supplier part-payments',
    allowedModules: [
      'portal_procurement',
      'pos',
      'inventory',
      'interfirm_export',
      'backup',
    ],
    canWrite: true,
  },
  marketing: {
    name: 'Advertising & Marketing Lead',
    description: 'Digital campaigns, physical signage/banners, marketplace fee bridges, and lead generation',
    allowedModules: [
      'portal_marketing',
      'advertising',
      'invoices',
      'expenses',
      'interfirm_export',
    ],
    canWrite: true,
  },
  ca_auditor: {
    name: 'Statutory CA / Auditor (Read-Only)',
    description: 'Read-only audit view for books, Invoices, GST claimable vs blocked ITC, tax ledgers, and compliance',
    allowedModules: [
      'dashboard',
      'invoices',
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

// Channel Assignment Definitions and Helper functions (Sections 2 & 3)
export const CHANNEL_DETAILS: Record<
  CustomerChannel,
  {
    name: string;
    entityId: BusinessEntityId;
    entityName: string;
    description: string;
    defaultCreditDays: number;
    badgeColor: string;
  }
> = {
  hq_depot: {
    name: 'Headquarters & Home-State Depot',
    entityId: 'pvt_ltd',
    entityName: 'Main Pvt. Ltd.',
    description: 'Direct company billing for internal depot replenishment and corporate supplies',
    defaultCreditDays: 15,
    badgeColor: 'blue',
  },
  export: {
    name: 'Exports & International Buyers',
    entityId: 'pvt_ltd',
    entityName: 'Main Pvt. Ltd.',
    description: 'FOB/CIF international shipments via Mundra Port under GST LUT Rule 96A',
    defaultCreditDays: 30,
    badgeColor: 'indigo',
  },
  modern_trade: {
    name: 'Modern Trade Supermarket Chains',
    entityId: 'pvt_ltd',
    entityName: 'Main Pvt. Ltd.',
    description: 'National and regional organized retail chains (DMart, Reliance Retail, Star Bazaar)',
    defaultCreditDays: 45,
    badgeColor: 'purple',
  },
  institutional_large: {
    name: 'Large Institutional Customers',
    entityId: 'pvt_ltd',
    entityName: 'Main Pvt. Ltd.',
    description: 'High-consumption corporate canteens, railways, airlines, defense, hospitals',
    defaultCreditDays: 30,
    badgeColor: 'cyan',
  },
  fmcg_chain: {
    name: 'Large FMCG & Food-Service Chains',
    entityId: 'pvt_ltd',
    entityName: 'Main Pvt. Ltd.',
    description: 'Multi-outlet quick-service restaurants, state-wide food franchise groups',
    defaultCreditDays: 30,
    badgeColor: 'teal',
  },
  horeca_large: {
    name: 'Large HORECA Accounts',
    entityId: 'pvt_ltd',
    entityName: 'Main Pvt. Ltd.',
    description: 'Star hotel chains, national resort chains, large-scale luxury catering companies',
    defaultCreditDays: 30,
    badgeColor: 'emerald',
  },
  industrial_mfg: {
    name: 'Industrial & Manufacturing (Ingredients)',
    entityId: 'pvt_ltd',
    entityName: 'Main Pvt. Ltd.',
    description: 'Large food manufacturers using our spices as bulk ingredients (ITC, Haldiram scale)',
    defaultCreditDays: 45,
    badgeColor: 'amber',
  },
  private_label: {
    name: 'Private-Label & Contract Manufacturing',
    entityId: 'pvt_ltd',
    entityName: 'Main Pvt. Ltd.',
    description: 'OEM contract manufacturing and customised packaging under external brands',
    defaultCreditDays: 30,
    badgeColor: 'violet',
  },

  // Sister Proprietorship Channels
  cfa_distributor: {
    name: 'CFA Operations & Distributors',
    entityId: 'sister_prop',
    entityName: 'Sister Proprietorship',
    description: 'Primary carrying & forwarding agent dispatches and wholesale distributor billing',
    defaultCreditDays: 21,
    badgeColor: 'amber',
  },
  super_stockist: {
    name: 'Super-Stockists (SS) & Stockists',
    entityId: 'sister_prop',
    entityName: 'Sister Proprietorship',
    description: 'District and taluka level super-stockists holding secondary buffer inventory',
    defaultCreditDays: 21,
    badgeColor: 'orange',
  },
  small_retailer: {
    name: 'Small & Medium Retailers (Kirana)',
    entityId: 'sister_prop',
    entityName: 'Sister Proprietorship',
    description: 'Independent grocery stores, provision shops, neighborhood spices retailers',
    defaultCreditDays: 14,
    badgeColor: 'rose',
  },
  quick_commerce: {
    name: 'E-Commerce & Quick-Commerce',
    entityId: 'sister_prop',
    entityName: 'Sister Proprietorship',
    description: 'Dark store fulfillment centers (Blinkit, Zepto, Swiggy Instamart, Amazon)',
    defaultCreditDays: 15,
    badgeColor: 'pink',
  },
  d2c: {
    name: 'Direct-to-Consumer (D2C)',
    entityId: 'sister_prop',
    entityName: 'Sister Proprietorship',
    description: 'Direct retail website orders, factory-outlet retail buyers, telephone deliveries',
    defaultCreditDays: 0,
    badgeColor: 'emerald',
  },
  horeca_small: {
    name: 'Independent Cafés & Local HORECA',
    entityId: 'sister_prop',
    entityName: 'Sister Proprietorship',
    description: 'Standalone restaurants, sweet shops, street-food kitchens, local party caterers',
    defaultCreditDays: 7,
    badgeColor: 'yellow',
  },
  regional_trade: {
    name: 'Regional Gujarat Secondary Trade',
    entityId: 'sister_prop',
    entityName: 'Sister Proprietorship',
    description: 'Route-van cash/credit trade, rural haat wholesalers, semi-bulk trade packs',
    defaultCreditDays: 14,
    badgeColor: 'lime',
  },
};

export const isMainCompanyChannel = (channel: CustomerChannel): boolean => {
  return CHANNEL_DETAILS[channel]?.entityId === 'pvt_ltd';
};

export const isSisterCompanyChannel = (channel: CustomerChannel): boolean => {
  return CHANNEL_DETAILS[channel]?.entityId === 'sister_prop';
};

// Inter-Entity Periodic Stock Allocation Engine (Section 4)
export type AllocationCycleType = 'biweekly' | 'monthly';

export interface InterEntityStockAllocation {
  id: string;
  allocationNumber: string; // e.g. ALC-2026-10-C1
  cycle: AllocationCycleType;
  periodStart: string;
  periodEnd: string;
  creditDueDate: string; // Agreed settlement date (up to 90 days)
  sourceEntityId: 'pvt_ltd';
  destinationEntityId: 'sister_prop';
  totalAllocatedGrams: number;
  totalValuationPaise: number;
  challanIds: string[]; // Delivery Challans linked
  status: 'active' | 'partially_settled' | 'fully_settled' | 'closed';
  settledAmountPaise: number;
  balanceOutstandingPaise: number;
  notes?: string;
}

// Sister Downstream Secondary Billing (Customer Invoices - Section 3)
export interface SisterDownstreamInvoiceItem {
  itemId: string;
  sku: string;
  name: string;
  packSizeGrams: number;
  batchNo: string;
  qtyPacks: number;
  totalGrams: number;
  ratePerPackPaise: number;
  taxableAmountPaise: number;
  gstRatePct: number;
  cgstPaise: number;
  sgstPaise: number;
  totalPaise: number;
}

export interface SisterDownstreamInvoice {
  id: string;
  invoiceNo: string; // e.g. DIS-2026-10-001
  date: string;
  channel: CustomerChannel;
  customerId: string;
  customerName: string;
  customerGstin?: string;
  customerCity: string;
  customerPhone?: string;
  paymentDueDate: string;
  paymentStatus: 'unpaid' | 'part_paid' | 'paid';
  items: SisterDownstreamInvoiceItem[];
  totalGrams: number;
  taxableAmountPaise: number;
  cgstPaise: number;
  sgstPaise: number;
  totalPaise: number;
  paidAmountPaise: number;
  balanceDuePaise: number;
  payments?: {
    id: string;
    date: string;
    amountPaise: number;
    mode: string;
    reference: string;
  }[];
  notes?: string;
}

// Inter-Entity Financial Settlement Voucher (Section 4 & 5)
export interface InterEntitySettlement {
  id: string;
  settlementNo: string; // e.g. IES-2026-10-001
  date: string;
  amountPaise: number;
  remittedFromAccountId: string; // Sister Bank (e.g. SBI)
  depositedToAccountId: string;   // Main Bank (e.g. HDFC)
  paymentMode: 'NEFT' | 'RTGS' | 'IMPS' | 'Cheque';
  bankUtrRef: string;
  settlementType: 'stock_advance' | 'interim_settlement' | 'final_cycle_clearance';
  linkedAllocationIds?: string[];
  linkedChallanIds?: string[];
  notes?: string;
  verifiedByAuditor: boolean;
}

// Complete Dual-Entity Ledger & Physical Stock Reconciliation State (Section 5)
export interface StockFlowReconciliation {
  periodLabel: string;
  openingDepotStockGrams: number;
  suppliedByMainGrams: number;
  receivedAtSisterGrams: number;
  inTransitGrams: number;
  soldDownstreamGrams: number;
  closingDepotStockGrams: number;
  damagedOrReturnedGrams: number;
  discrepancyGrams: number; // Received - (Sold + Closing + Damaged)
  status: 'balanced' | 'variance_detected';
}

export interface InterEntityLedgerReconciliation {
  periodLabel: string;
  mainReceivableFromSisterPaise: number;  // Sundry Debtor in Main Books
  sisterPayableToMainPaise: number;        // Sundry Creditor in Sister Books
  netDiscrepancyPaise: number;             // Must be 0 in balanced state
  inTransitDispatchesPaise: number;        // Challans not yet acknowledged
  uncreditedSettlementsPaise: number;       // Remittances in transit
  creditLimitPaise: number;               // Agreed limit (e.g. ₹50L)
  creditUtilizationPct: number;
  status: 'matched' | 'unmatched_discrepancy';
  alerts: {
    type: 'warning' | 'error' | 'info';
    code: string;
    message: string;
    referenceId?: string;
  }[];
}

// ============================================================================
// 3-TIER PACKAGING HIERARCHY & SHOP FLOOR FULFILLMENT TYPES
// ============================================================================
export type PrimaryPackTier =
  | 'pouch_10rs'   // ₹10 pouch (18g-25g flexible printed pouch)
  | 'pouch_50g'    // 50g consumer pouch / PP bag
  | 'pouch_100g'   // 100g consumer pouch
  | 'pouch_200g'   // 200g consumer pouch
  | 'pouch_500g'   // 500g consumer pouch
  | 'bag_1kg'      // 1 kg consumer pack
  | 'bag_2kg'      // 2 kg consumer pack
  | 'bag_5kg'      // 5 kg consumer pack
  | 'bulk_10kg'    // 10 kg bulk industrial PP bag (direct loose)
  | 'bulk_25kg'    // 25 kg bulk industrial PP bag (direct loose)
  | 'bulk_50kg';   // 50 kg bulk industrial PP bag (direct loose)

export type SecondaryPackTier =
  | 'strip_10pcs'   // 10 pcs hanging strip
  | 'bundle_30pcs'  // 3 strips x 10 pcs = 30 pcs over-wrap bundle
  | 'pack_10pcs'    // 10 pcs outer pack (for 100g -> 1kg bundle)
  | 'pack_5pcs'     // 5 pcs outer pack (for 200g -> 1kg bundle)
  | 'pack_2pcs'     // 2 pcs outer pack (for 500g -> 1kg bundle)
  | 'none_direct';  // Direct to tertiary (1kg, 2kg, 5kg, bulk bags)

export type TertiaryShipperTier =
  | 'pp_bag_15kg'    // 15 kg woven PP bag shipper
  | 'pp_bag_25kg'    // 25 kg woven PP bag shipper
  | 'pp_bag_50kg'    // 50 kg heavy-duty woven PP bag shipper
  | 'jute_bag_25kg'  // 25 kg food-grade jute bag
  | 'box_20kg'       // 20 kg 5-ply corrugated shipper box
  | 'box_25kg'       // 25 kg 5-ply corrugated shipper box
  | 'box_custom';    // Custom institutional / mixed assorted shipper box

export interface PackingFloorFulfillmentJob {
  id: string;
  jobNo: string;
  date: string;
  customerName: string;
  orderRef: string;
  spiceName: string;
  targetGrams: number;
  targetPacks: number;
  primaryTier: PrimaryPackTier;
  secondaryTier: SecondaryPackTier;
  tertiaryTier: TertiaryShipperTier;
  isMixedAssortedShipper: boolean;
  mixedContentsDesc?: string;
  dailyPackQuotaUnits: number;
  packedGramsCompleted: number;
  packedUnitsCompleted: number;
  deficitGrams: number;
  deficitUnits: number;
  fulfillmentPct: number;
  dailyProgressRecords: {
    date: string;
    shift: 'morning' | 'evening' | 'night';
    supervisor: string;
    packedUnits: number;
    packedGrams: number;
    spillWastageGrams: number;
  }[];
  status: 'grinding_ready' | 'primary_packing' | 'secondary_bundling' | 'tertiary_boxed' | 'staged_for_dispatch';
  lotTraceability: {
    rawSpiceSupplierLot: string;
    grindingBatchNo: string;
    primaryPackLotNo: string;
    tertiaryShipperBoxBarcodes: string[];
    dispatchInvoiceRef?: string;
  };
}

// ============================================================================
// DYNAMIC SALES INVOICE & QUOTATION ENGINE TYPES
// ============================================================================
export type SalesDocumentType =
  | 'domestic_tax_invoice'
  | 'export_commercial'
  | 'formal_quotation'
  | 'proforma_invoice';

export type PaymentCreditTerm =
  | 'advance'          // 100% advance before production
  | 'on_dispatch'      // Payment on vehicle loading / dispatch (standard)
  | 'credit_30'        // 30 days credit (+2% surcharge)
  | 'credit_60'        // 60 days credit (+2% surcharge)
  | 'credit_extended'  // >180 days extended credit (+2% surcharge + commercial finance charge)
  | 'sister_revolving'; // Sister firm continuous unblocked revolving credit (exempt from surcharges)

export interface SalesInvoiceItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  hsnCode: string; // 0910, 0904, 0909, 2103
  packSizeGrams: number;
  quantityUnits: number;
  unitType: 'pouches' | 'strips' | 'bundles' | 'boxes' | 'kg';
  ratePerUnitPaise: number;
  taxableAmountPaise: number;
  gstRatePct: number; // 5% for spices, 12% for blended mix, 0% for LUT export
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalPaise: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNo: string; // e.g. ADL-INV-2026-0001 or ADL-EXP-2026-0001
  invoiceType: SalesDocumentType;
  entityId: BusinessEntityId;
  date: string;
  dueDate: string;
  buyerPartyId?: string;
  buyerName: string;
  buyerGstin?: string;
  buyerPan?: string;
  buyerAddress: string;
  buyerState: string;
  buyerStateCode: string; // 24 = Gujarat (Intra-state CGST+SGST), Others = Inter-state (IGST)
  buyerCountry: string;
  items: SalesInvoiceItem[];
  subtotalTaxablePaise: number;
  creditTerms: PaymentCreditTerm;
  creditDays: number;
  creditSurchargeRatePct: number; // 2.0% for credit scenarios (0 for sister / advance)
  creditSurchargePaise: number;
  extendedCreditInterestPaise: number; // For >6 months credit
  totalTaxablePaise: number; // subtotal + credit surcharge
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalTaxPaise: number;
  roundOffPaise: number;
  grandTotalPaise: number;
  paidAmountPaise: number;
  balanceDuePaise: number;
  status: 'draft' | 'issued' | 'part_paid' | 'paid' | 'voided';
  voidReason?: string;
  voidedAt?: string;
  eWayBillNo?: string;
  irn?: string;
  qrCodeString?: string;
  // Global Export fields (200 Countries compliance)
  isExport: boolean;
  currency: 'INR' | 'USD' | 'EUR' | 'AED' | 'GBP' | 'SAR';
  exchangeRate: number;
  foreignAmount: number;
  incoterms?: 'FOB' | 'CIF' | 'CFR' | 'EXW';
  portOfLoading?: string; // INMUN1 Mundra Port
  portOfDischarge?: string;
  destinationCountry?: string;
  iecNo?: string; // 2418002931
  lutArn?: string; // AD240426001928K (Rule 96A zero tax)
  cresNo?: string; // Spices Board Registration
  swiftBic?: string;
  adCode?: string;
  notes?: string;
  createdAt: string;
}

export interface SalesQuotation {
  id: string;
  quotationNo: string; // e.g. ADL-QUO-2026-0001
  date: string;
  validUntilDate: string;
  entityId: BusinessEntityId;
  buyerName: string;
  buyerGstin?: string;
  buyerAddress: string;
  buyerCountry: string;
  items: SalesInvoiceItem[];
  subtotalTaxablePaise: number;
  creditTerms: PaymentCreditTerm;
  creditSurchargeRatePct: number;
  creditSurchargePaise: number;
  estimatedTaxPaise: number;
  grandTotalPaise: number;
  termsAndConditions: string[];
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted';
  convertedInvoiceId?: string;
  createdAt: string;
}

export interface VoidedInvoiceAudit {
  id: string;
  originalInvoiceNo: string;
  invoiceType: SalesDocumentType;
  voidedAt: string;
  voidedBy: string;
  reason: string;
  originalGrandTotalPaise: number;
  originalDataJson: string;
}

// ============================================================================
// FINANCIAL INTELLIGENCE & MULTI-PERIOD EXECUTIVE REPORT TYPES
// ============================================================================
export type FinancialHorizon = 'daily_dod' | 'monthly_mom' | 'specific_month' | 'annual_yoy';

export interface FinancialIntelligenceMetrics {
  periodLabel: string;
  horizon: FinancialHorizon;
  entityScope: BusinessEntityId | 'all';
  // P&L Absolute Amounts (Paise)
  revenuePaise: number;
  cogsPaise: number;
  grossProfitPaise: number;
  opexPaise: number;
  ebitdaPaise: number;
  depreciationPaise: number;
  ebitPaise: number;
  financeCostPaise: number;
  pbtPaise: number;
  taxProvisionPaise: number;
  patPaise: number;
  // Margins in %
  cogsPct: number;
  gpMarginPct: number;
  opexPct: number;
  ebitdaMarginPct: number;
  ebitMarginPct: number;
  pbtMarginPct: number;
  patMarginPct: number;
  // Statutory GST Compliance
  eligibleItcPaise: number;
  outputGstLiabilityPaise: number;
  netGstPositionPaise: number; // positive = net payable, negative = surplus credit carried forward
  // Factory Floor Per KG Unit Economics
  totalKilogramsPacked: number;
  opexPerKgPaise: number;
  cogsPerKgPaise: number;
  totalCostPerKgPaise: number;
  realizationPerKgPaise: number;
  markupPerKgPaise: number;
  markupPct: number;
  // Variance vs Previous Period (DoD / MoM / YoY)
  previousRevenuePaise: number;
  revenueGrowthPct: number;
  gpGrowthPct: number;
  patGrowthPct: number;
}

// ============================================================================
// DYNAMIC PACKAGING SPECIFICATION CRUD TYPES (TIER 1, TIER 2, TIER 3)
// ============================================================================
export type PackagingTierLevel = 1 | 2 | 3;

export interface PackagingTierSpec {
  id: string;
  tierLevel: PackagingTierLevel;
  code: string;                 // e.g. 'pouch_sachet_10rs', 'pouch_100g', 'bundle_100g_10pcs', 'carton_20kg'
  displayName: string;          // e.g. '₹10 Sachet Pouch (18g - 25g)'
  category: 'primary' | 'secondary' | 'tertiary';
  netCapacityGrams: number;     // e.g. 20 for ₹10 pouch, 1000 for 1kg bundle, 25000 for 25kg carton
  tareWeightGrams: number;      // weight of packaging material itself
  materialType: string;         // 'BOPP / MET-PET 3-Ply Foil', 'Heat Shrink Film', '5-Ply Corrugated Kraft'
  machineTypeRequired?: string; // 'Form-Fill-Seal (FFS)', 'Band Sealer', 'Carton Taper'
  unitsPerParent?: number;      // e.g. 10 pouches in secondary bundle, 20 bundles in tertiary carton
  isExportCompliant: boolean;
  isActive: boolean;
  costPaisePerUnit: number;     // Material cost per pouch/bundle/carton in integer paise
  notes?: string;
}

// ============================================================================
// DAILY MANDI SPOT RATES & BLENDED COST RATIO ENGINE TYPES
// ============================================================================
export interface MandiSpotRateRecord {
  id: string;
  date: string;
  spiceName: 'Chilli' | 'Turmeric' | 'Coriander' | 'Cumin' | 'Blended Mix' | string;
  mandiLocation: 'Unjha Mandi' | 'Gondal Yard' | 'Guntur Mandi' | 'Sangli Yard' | 'Ramganj Mandi' | string;
  grade: 'Whole Premium' | 'Medium / Commercial' | 'Standard Powder Grade' | string;
  spotRatePerKgRupees: number;
  dailyChangeRupees: number; // e.g. +5 or -3
  arrivalBags: number;       // mandi arrival volume
  reportedBy: string;
  notes?: string;
}

export interface BlendedCostCalculation {
  spiceName: string;
  totalRequiredKg: number;
  stockOnHandKg: number;
  stockHistoricalCostRupees: number;
  deficitToProcureKg: number;
  spotMarketRateRupees: number;
  blendedRawCostPerKg: number; // weighted average
  millingShrinkagePct: number; // default 2%
  milledCostPerKg: number;
  packagingCostPerKg: number;  // Tier 1 + 2 + 3
  opexAllocationPerKg: number; // factory opex
  totalLandedCostPerKg: number;
  targetProfitMarginPct: number; // e.g. 15%
  recommendedQuotedPricePerKg: number;
  recommendedQuotedPriceUSD: number; // with exchange rate
}

// ============================================================================
// UNIVERSAL DEPARTMENTAL TO-DO STACK & DAY-END REPORTING TYPES
// ============================================================================
export interface DailyTodoItem {
  id: string;
  role: UserRole;
  title: string;
  description?: string;
  priority: 'urgent' | 'high' | 'normal';
  dueDate: string;
  isCompleted: boolean;
  completedAt?: string;
  assignedBy?: string;
  actionModule?: string;
}

export interface DayEndReport {
  id: string;
  date: string;
  shift: 'morning' | 'evening' | 'general' | 'night';
  role: UserRole;
  submittedBy: string;
  primaryMetricLabel: string;
  primaryMetricValue: string;
  summaryNotes: string;
  blockersOrWastage?: string;
  tasksCompletedCount: number;
  timestamp: string;
}

// ============================================================================
// ROLE-TAILORED ENTERPRISE PORTAL IDENTIFIERS
// ============================================================================
export type PortalId =
  | 'admin'
  | 'sales'
  | 'procurement'
  | 'store'
  | 'floor'
  | 'finance'
  | 'marketing'
  | 'auditor';

