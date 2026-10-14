import {
  BusinessEntity,
  BusinessEntityId,
  BusinessEntityConfig,
  CustomerChannel,
  InterEntityStockAllocation,
  SisterDownstreamInvoice,
  SisterDownstreamInvoiceItem,
  InterEntitySettlement,
  StockFlowReconciliation,
  InterEntityLedgerReconciliation,
  CHANNEL_DETAILS,
  isMainCompanyChannel,
  isSisterCompanyChannel,
  InventoryItem,
  StockLot,
  StockMovement,
  Recipe,
  PackingBatch,
  Party,
  Account,
  Transaction,
  Bill,
  MachineAsset,
  Employee,
  Loan,
  OutboxItem,
  UserRole,
  AdvertisingCampaign,
  MarketplaceSettlement,
  LicenceCompliance,
  LicenceEvent,
  AuthUser,
  PurchaseOrder,
  PurchaseCategory,
  POFulfillmentStatus,
  POPartPayment,
  InterFirmTransfer,
  TransferStatus,
  ExportShipment,
  SalesInvoice,
  SalesInvoiceItem,
  SalesQuotation,
  VoidedInvoiceAudit,
  PackingFloorFulfillmentJob,
  FinancialHorizon,
  FinancialIntelligenceMetrics,
  PackagingTierSpec,
  PackagingTierLevel,
  MandiSpotRateRecord,
  BlendedCostCalculation,
  DailyTodoItem,
  DayEndReport,
  PortalId,
} from '../types';

const STORAGE_KEYS = {
  ENTITY: 'packing_ops_entity_v1',
  ENTITIES_CONFIG: 'adalaj_entities_config_v1',
  ACTIVE_ENTITY_ID: 'adalaj_active_entity_id_v1',
  STOCK_ALLOCATIONS: 'adalaj_stock_allocations_v1',
  SISTER_INVOICES: 'adalaj_sister_invoices_v1',
  INTER_ENTITY_SETTLEMENTS: 'adalaj_inter_entity_settlements_v1',
  ITEMS: 'packing_ops_items_v1',
  LOTS: 'packing_ops_lots_v1',
  MOVEMENTS: 'packing_ops_movements_v1',
  RECIPES: 'packing_ops_recipes_v1',
  BATCHES: 'packing_ops_batches_v1',
  PARTIES: 'packing_ops_parties_v1',
  ACCOUNTS: 'packing_ops_accounts_v1',
  TRANSACTIONS: 'packing_ops_transactions_v1',
  BILLS: 'packing_ops_bills_v1',
  ASSETS: 'packing_ops_assets_v1',
  EMPLOYEES: 'packing_ops_employees_v1',
  LOANS: 'packing_ops_loans_v1',
  CAMPAIGNS: 'packing_ops_campaigns_v1',
  SETTLEMENTS: 'packing_ops_settlements_v1',
  LICENCES: 'packing_ops_licences_v1',
  OUTBOX: 'packing_ops_outbox_v1',
  ACTIVE_ROLE: 'packing_ops_role_v1',
  AUTH_USER: 'adalaj_auth_user_v1',
  PURCHASE_ORDERS: 'adalaj_purchase_orders_v1',
  INTERFIRM_TRANSFERS: 'adalaj_interfirm_transfers_v1',
  EXPORT_SHIPMENTS: 'adalaj_export_shipments_v1',
  SALES_INVOICES: 'adalaj_sales_invoices_v1',
  SALES_QUOTATIONS: 'adalaj_sales_quotations_v1',
  VOIDED_INVOICES: 'adalaj_voided_invoices_v1',
  PACKING_FLOOR_JOBS: 'adalaj_packing_floor_jobs_v1',
  PACKAGING_SPECS: 'adalaj_packaging_specs_v1',
  MANDI_SPOT_RATES: 'adalaj_mandi_spot_rates_v1',
  DAILY_TODOS: 'adalaj_daily_todos_v1',
  DAY_END_REPORTS: 'adalaj_day_end_reports_v1',
  SYSTEM_USERS: 'adalaj_system_users_v1',
};

// Initial Seed Data
const initialEntity: BusinessEntity = {
  id: 'ent_adalaj_01',
  name: 'Adalaj Food Products Pvt. Ltd.',
  location: 'Sarkhej-Gandhinagar Highway, Near Adalaj, Gujarat 382421',
  gstin: '24AAGCS9412F1Z4',
  pan: 'AAGCS9412F',
  financialYearStart: '04-01',
  currency: 'INR',
};

export const initialEntitiesConfig: Record<BusinessEntityId, BusinessEntityConfig> = {
  pvt_ltd: {
    id: 'pvt_ltd',
    name: 'Adalaj Food Products Pvt. Ltd.',
    shortName: 'Main Pvt. Ltd.',
    legalType: 'Private Limited Company',
    tradeName: 'ADALAJ — Made for Real Moments',
    cinOrReg: 'U15400GJ2026PTC149812',
    gstin: '24AAGCS9412F1Z4',
    pan: 'AAGCS9412F',
    address: 'Survey 412, Sarkhej-Gandhinagar Highway, Near Adalaj, Gandhinagar, Gujarat 382421',
    stateCode: '24',
    bankName: 'HDFC Bank Ltd, Gandhinagar Corporate Branch',
    bankAccount: '50200012345678',
    ifsc: 'HDFC0000241',
    roleDescription: 'Primary Manufacturing Plant, Capex, Strategic Large B2B Accounts, Modern Trade, FMCG Chains, Industrial Ingredients, Exports',
    colorCode: '#9A2229',
  },
  sister_prop: {
    id: 'sister_prop',
    name: 'Adalaj Distribution & Trading Co.',
    shortName: 'Sister Proprietorship',
    legalType: 'Sole Proprietorship',
    tradeName: 'Adalaj Secondary Distribution & CFA Depot',
    cinOrReg: 'GJ-01-2026-09182',
    gstin: '24AAGCS9412F2Z1',
    pan: 'AAPPS4819M',
    address: 'Plot 14-B, Sardar Patel Ring Road Logistics Park, Aslali, Ahmedabad, Gujarat 382427',
    stateCode: '24',
    bankName: 'State Bank of India, Aslali Commercial Branch',
    bankAccount: '38192048192',
    ifsc: 'SBIN0004128',
    roleDescription: 'CFA Depot Operations, Super-Stockists, Kirana Retailers, Quick-Commerce, D2C, Local Gujarat Distribution',
    creditLimitWithParentPaise: 500000000, // ₹50 Lakhs agreed credit limit
    defaultCreditPeriodDays: 45,          // 45 days default credit (up to 90 days)
    colorCode: '#D97706',
  },
};

const initialItems: InventoryItem[] = [
  // Raw Powders (weight in grams)
  {
    id: 'item_raw_hld',
    sku: 'RAW-HLD-01',
    name: 'Turmeric Powder (Haldi) - Rajapuri Pure',
    type: 'raw_material',
    unit: 'kg',
    baseUnit: 'g',
    reorderLevelBase: 200000, // 200 kg
    currentStockBase: 485000, // 485 kg
    averageCostPaise: 18, // ₹180 per kg = 18 paise/g
    category: 'Raw Spice Powder',
  },
  {
    id: 'item_raw_mrc',
    sku: 'RAW-MRC-01',
    name: 'Red Chilli Powder (Lal Mirch) - Guntur Hot',
    type: 'raw_material',
    unit: 'kg',
    baseUnit: 'g',
    reorderLevelBase: 150000, // 150 kg
    currentStockBase: 310000, // 310 kg
    averageCostPaise: 26, // ₹260 per kg = 26 paise/g
    category: 'Raw Spice Powder',
  },
  {
    id: 'item_raw_dhn',
    sku: 'RAW-DHN-01',
    name: 'Coriander Powder (Dhaniya) - Green A Grade',
    type: 'raw_material',
    unit: 'kg',
    baseUnit: 'g',
    reorderLevelBase: 150000,
    currentStockBase: 240000,
    averageCostPaise: 16, // ₹160 per kg
    category: 'Raw Spice Powder',
  },
  {
    id: 'item_raw_jra',
    sku: 'RAW-JRA-01',
    name: 'Cumin Powder (Jeera) - Unjha Super',
    type: 'raw_material',
    unit: 'kg',
    baseUnit: 'g',
    reorderLevelBase: 80000,
    currentStockBase: 125000,
    averageCostPaise: 38, // ₹380 per kg
    category: 'Raw Spice Powder',
  },

  // Packing Materials
  {
    id: 'item_pkg_cyl100',
    sku: 'PKG-CYL-100',
    name: '100g Cylinder Can (Printed Foil + Alu Seal + Lid)',
    type: 'packing_material',
    unit: 'pcs',
    baseUnit: 'pcs',
    reorderLevelBase: 1500,
    currentStockBase: 4200,
    averageCostPaise: 420, // ₹4.20 per can
    category: 'Primary Packaging',
  },
  {
    id: 'item_pkg_cyl200',
    sku: 'PKG-CYL-200',
    name: '200g Cylinder Can (Printed Foil + Alu Seal + Lid)',
    type: 'packing_material',
    unit: 'pcs',
    baseUnit: 'pcs',
    reorderLevelBase: 1000,
    currentStockBase: 2850,
    averageCostPaise: 580, // ₹5.80 per can
    category: 'Primary Packaging',
  },
  {
    id: 'item_pkg_cyl500',
    sku: 'PKG-CYL-500',
    name: '500g Cylinder Can (Large Diameter Canister)',
    type: 'packing_material',
    unit: 'pcs',
    baseUnit: 'pcs',
    reorderLevelBase: 600,
    currentStockBase: 1100,
    averageCostPaise: 890, // ₹8.90 per can
    category: 'Primary Packaging',
  },
  {
    id: 'item_pkg_strip10',
    sku: 'PKG-STRP-10',
    name: '₹10 Strip Sachet Roll Foil (Printed Film)',
    type: 'packing_material',
    unit: 'pcs',
    baseUnit: 'pcs',
    reorderLevelBase: 5000,
    currentStockBase: 18400,
    averageCostPaise: 65, // ₹0.65 per pouch
    category: 'Primary Packaging',
  },
  {
    id: 'item_pkg_box50',
    sku: 'PKG-BOX-50',
    name: '50g Monocarton Box (Embossed Brand + Foil Pouch)',
    type: 'packing_material',
    unit: 'pcs',
    baseUnit: 'pcs',
    reorderLevelBase: 2000,
    currentStockBase: 3600,
    averageCostPaise: 210, // ₹2.10
    category: 'Primary Packaging',
  },
  {
    id: 'item_pkg_pch1kg',
    sku: 'PKG-PCH-1KG',
    name: '1kg Bulk Silver Pouch with 2-side Brand Sticker',
    type: 'packing_material',
    unit: 'pcs',
    baseUnit: 'pcs',
    reorderLevelBase: 500,
    currentStockBase: 1450,
    averageCostPaise: 650, // ₹6.50
    category: 'Bulk Packaging',
  },
  {
    id: 'item_pkg_ctn24',
    sku: 'PKG-CTN-24',
    name: 'Master Shipper Corrugated Carton (Holds 24 Cans)',
    type: 'packing_material',
    unit: 'pcs',
    baseUnit: 'pcs',
    reorderLevelBase: 100,
    currentStockBase: 320,
    averageCostPaise: 1800, // ₹18.00
    category: 'Secondary Packaging',
  },

  // Finished Goods
  {
    id: 'item_fg_hld100',
    sku: 'FG-HLD-100',
    name: 'Turmeric Powder 100g Cylinder Can',
    type: 'finished_good',
    unit: 'pcs',
    baseUnit: 'pcs',
    reorderLevelBase: 400,
    currentStockBase: 1250,
    averageCostPaise: 2450, // ₹24.50 total manufactured cost
    packSizeGrams: 100,
    mrpPaise: 4500, // MRP ₹45
    category: 'Brand Retail Pack',
  },
  {
    id: 'item_fg_hld200',
    sku: 'FG-HLD-200',
    name: 'Turmeric Powder 200g Cylinder Can',
    type: 'finished_good',
    unit: 'pcs',
    baseUnit: 'pcs',
    reorderLevelBase: 200,
    currentStockBase: 680,
    averageCostPaise: 4500, // ₹45.00 cost
    packSizeGrams: 200,
    mrpPaise: 8500, // MRP ₹85
    category: 'Brand Retail Pack',
  },
  {
    id: 'item_fg_mrc_s10',
    sku: 'FG-MRC-S10',
    name: 'Lal Mirch Powder ₹10 Strip Sachet (18g)',
    type: 'finished_good',
    unit: 'pcs',
    baseUnit: 'pcs',
    reorderLevelBase: 2500,
    currentStockBase: 8400,
    averageCostPaise: 580, // ₹5.80 manufactured cost
    packSizeGrams: 18,
    mrpPaise: 1000, // MRP ₹10
    category: 'Strip Sachet Pack',
  },
  {
    id: 'item_fg_dhn_box50',
    sku: 'FG-DHN-B50',
    name: 'Dhaniya Powder 50g Box Pack',
    type: 'finished_good',
    unit: 'pcs',
    baseUnit: 'pcs',
    reorderLevelBase: 300,
    currentStockBase: 920,
    averageCostPaise: 1240, // ₹12.40 cost
    packSizeGrams: 50,
    mrpPaise: 2500, // MRP ₹25
    category: 'Brand Retail Pack',
  },
  {
    id: 'item_fg_jra100',
    sku: 'FG-JRA-100',
    name: 'Jeera Powder 100g Cylinder Can',
    type: 'finished_good',
    unit: 'pcs',
    baseUnit: 'pcs',
    reorderLevelBase: 150,
    currentStockBase: 410,
    averageCostPaise: 4850, // ₹48.50 cost
    packSizeGrams: 100,
    mrpPaise: 8000, // MRP ₹80
    category: 'Brand Retail Pack',
  },
];

const initialLots: StockLot[] = [
  {
    id: 'lot_hld_2610_01',
    lotNo: 'LOT-HLD-2610A',
    itemId: 'item_raw_hld',
    itemName: 'Turmeric Powder (Haldi) - Rajapuri Pure',
    supplierLotNo: 'UNJ-RAJ-984',
    supplierName: 'Unjha Mandi Spice Traders',
    receivedOn: '2026-10-02',
    expiryOn: '2027-10-01',
    qtyBase: 485000, // 485 kg
    landedCostPerKgPaise: 18000, // ₹180/kg
    status: 'available',
    locationId: 'loc_raw',
  },
  {
    id: 'lot_mrc_2609_02',
    lotNo: 'LOT-MRC-2609B',
    itemId: 'item_raw_mrc',
    itemName: 'Red Chilli Powder (Lal Mirch) - Guntur Hot',
    supplierLotNo: 'GNT-TEJA-332',
    supplierName: 'Shree Balaji Spice Mills, Unjha',
    receivedOn: '2026-09-28',
    expiryOn: '2027-09-27',
    qtyBase: 210000, // 210 kg
    landedCostPerKgPaise: 26000, // ₹260/kg
    status: 'available',
    locationId: 'loc_raw',
  },
  {
    id: 'lot_mrc_packer_01',
    lotNo: 'LOT-MRC-SANAND-1',
    itemId: 'item_raw_mrc',
    itemName: 'Red Chilli Powder at 3rd Party Packer',
    supplierLotNo: 'GNT-TEJA-332',
    supplierName: 'Mahavir Packaging (Sanand Hub)',
    receivedOn: '2026-10-08',
    expiryOn: '2027-09-27',
    qtyBase: 100000, // 100 kg at job worker
    landedCostPerKgPaise: 26000,
    status: 'available',
    locationId: 'loc_packer',
  },
];

const initialMovements: StockMovement[] = [
  {
    id: 'mov_01',
    date: '2026-10-02',
    time: '11:15',
    itemId: 'item_raw_hld',
    itemName: 'Turmeric Powder',
    lotId: 'lot_hld_2610_01',
    lotNo: 'LOT-HLD-2610A',
    locationId: 'loc_raw',
    locationName: 'Raw Powder Store',
    qtyBase: 500000, // 500 kg in
    type: 'receipt',
    reference: 'BILL-UNJ-4482',
    unitCostPaise: 18,
    notes: 'Inward raw powder lot tested ok 3.8% curcumin',
  },
  {
    id: 'mov_02',
    date: '2026-10-09',
    time: '09:30',
    itemId: 'item_raw_hld',
    itemName: 'Turmeric Powder',
    lotId: 'lot_hld_2610_01',
    lotNo: 'LOT-HLD-2610A',
    locationId: 'loc_raw',
    locationName: 'Raw Powder Store',
    qtyBase: -15000, // 15 kg issued to Batch 101
    type: 'issue',
    reference: 'BATCH-2026-101',
    unitCostPaise: 18,
    notes: 'Issued to Auger Filler line for 100g cylinders',
  },
  {
    id: 'mov_03',
    date: '2026-10-09',
    time: '17:00',
    itemId: 'item_fg_hld100',
    itemName: 'Turmeric Powder 100g Cylinder Can',
    locationId: 'loc_fg',
    locationName: 'Finished Goods Warehouse',
    qtyBase: 148, // 148 cans produced
    type: 'production_in',
    reference: 'BATCH-2026-101',
    unitCostPaise: 2450,
    notes: 'Completed batch output, net yield 98.7%',
  },
  {
    id: 'mov_04',
    date: '2026-10-08',
    time: '14:00',
    itemId: 'item_raw_mrc',
    itemName: 'Red Chilli Powder',
    lotId: 'lot_mrc_packer_01',
    lotNo: 'LOT-MRC-SANAND-1',
    locationId: 'loc_packer',
    locationName: 'Mahavir Packaging (Job Work)',
    qtyBase: 100000, // 100 kg transfer to third party
    type: 'transfer',
    reference: 'DC-SANAND-081',
    unitCostPaise: 26,
    notes: 'Transfer to 3rd-party packer for ₹10 strip run',
  },
];

const initialRecipes: Recipe[] = [
  {
    id: 'rec_hld100',
    finishedItemId: 'item_fg_hld100',
    finishedItemName: 'Turmeric Powder 100g Cylinder Can',
    packSizeGrams: 100,
    powderPerPackGrams: 100,
    packingMaterials: [
      { itemId: 'item_pkg_cyl100', itemName: '100g Cylinder Can', qtyPerPack: 1 },
      { itemId: 'item_pkg_ctn24', itemName: 'Master Carton (1/24th)', qtyPerPack: 0.0416 },
    ],
    expectedYieldPct: 98.5,
    notes: 'Auger speed: 28 cpm. Target fill: 100.5g ± 0.5g',
  },
  {
    id: 'rec_hld200',
    finishedItemId: 'item_fg_hld200',
    finishedItemName: 'Turmeric Powder 200g Cylinder Can',
    packSizeGrams: 200,
    powderPerPackGrams: 200,
    packingMaterials: [
      { itemId: 'item_pkg_cyl200', itemName: '200g Cylinder Can', qtyPerPack: 1 },
    ],
    expectedYieldPct: 98.8,
  },
  {
    id: 'rec_mrc_s10',
    finishedItemId: 'item_fg_mrc_s10',
    finishedItemName: 'Lal Mirch Powder ₹10 Strip Sachet (18g)',
    packSizeGrams: 18,
    powderPerPackGrams: 18,
    packingMaterials: [
      { itemId: 'item_pkg_strip10', itemName: '₹10 Strip Foil Roll Unit', qtyPerPack: 1 },
    ],
    expectedYieldPct: 97.5,
    notes: 'Continuous form-fill-seal strip of 12 sachets per hanging card',
  },
];

const initialBatches: PackingBatch[] = [
  {
    id: 'batch_101',
    batchNo: 'BATCH-2026-101',
    date: '2026-10-09',
    shift: 'morning',
    status: 'closed',
    machineId: 'mach_auger_01',
    machineName: 'Auger Servo Cylinder Filler #1',
    workers: ['Ramesh Prajapati', 'Sunita Parmar'],
    rawLotId: 'lot_hld_2610_01',
    rawItemId: 'item_raw_hld',
    rawItemName: 'Turmeric Powder (Haldi)',
    rawIssuedGrams: 15000, // 15 kg
    rawReturnedGrams: 0,
    outputs: [
      {
        itemId: 'item_fg_hld100',
        itemName: 'Turmeric Powder 100g Cylinder Can',
        packsProduced: 148,
        packSizeGrams: 100,
        totalGrams: 14800,
        mrpPaise: 4500,
      },
    ],
    packingMaterialsUsed: [
      { itemId: 'item_pkg_cyl100', itemName: '100g Cylinder Can', qtyPcs: 150 }, // 2 damaged
    ],
    wastage: [
      { reason: 'powder_spill', qtyGramsOrPcs: 120, notes: 'Hopper purge and fine dust' },
      { reason: 'cylinder_damage', qtyGramsOrPcs: 2, notes: 'Lid crimper alignment test' },
    ],
    qcPassed: true,
    qcChecks: {
      weightAccuracy: true,
      sealIntegrity: true,
      metalDetectorClean: true,
      batchCodingLegible: true,
    },
    costs: {
      rawPowderPaise: 270000, // 15kg * ₹180 = ₹2,700
      packingMaterialPaise: 63000, // 150 cans * ₹4.20 = ₹630
      directLabourPaise: 24000, // ₹240
      powerAndWearPaise: 9500, // ₹95
      thirdPartyFeePaise: 0,
      totalCostPaise: 366500, // ₹3,665
      costPerPackPaise: 2476, // ₹24.76 per can
      costPerKgPaise: 24760, // ₹247.60 per kg packed
    },
    toleranceVariancePct: 0.53,
    notes: 'First morning run. Yield 98.7% (target 98.5%). Coding verified EXP 10/2027.',
    closedAt: '2026-10-09 17:15',
  },
  {
    id: 'batch_102',
    batchNo: 'BATCH-2026-102',
    date: '2026-10-11',
    shift: 'morning',
    status: 'running',
    machineId: 'mach_auger_01',
    machineName: 'Auger Servo Cylinder Filler #1',
    workers: ['Mukesh Vaghela', 'Geeta Solanki'],
    rawLotId: 'lot_hld_2610_01',
    rawItemId: 'item_raw_hld',
    rawItemName: 'Turmeric Powder (Haldi)',
    rawIssuedGrams: 30000, // 30 kg issued
    rawReturnedGrams: 0,
    outputs: [
      {
        itemId: 'item_fg_hld100',
        itemName: 'Turmeric Powder 100g Cylinder Can',
        packsProduced: 280,
        packSizeGrams: 100,
        totalGrams: 28000,
        mrpPaise: 4500,
      },
    ],
    packingMaterialsUsed: [
      { itemId: 'item_pkg_cyl100', itemName: '100g Cylinder Can', qtyPcs: 283 },
    ],
    wastage: [
      { reason: 'powder_spill', qtyGramsOrPcs: 150, notes: 'In-process auger funnel drop' },
      { reason: 'cylinder_damage', qtyGramsOrPcs: 3, notes: 'Slight foil tear on crimp' },
    ],
    qcPassed: true,
    qcChecks: {
      weightAccuracy: true,
      sealIntegrity: true,
      metalDetectorClean: true,
      batchCodingLegible: true,
    },
    costs: {
      rawPowderPaise: 540000,
      packingMaterialPaise: 118860,
      directLabourPaise: 38000,
      powerAndWearPaise: 18000,
      thirdPartyFeePaise: 0,
      totalCostPaise: 714860,
      costPerPackPaise: 2553,
      costPerKgPaise: 25530,
    },
    toleranceVariancePct: 0.6,
    notes: 'Active packing run on floor. 280 cans filled so far.',
  },
];

const initialParties: Party[] = [
  // Raw Material & Capex Suppliers (Main Pvt. Ltd.)
  {
    id: 'party_unjha_mandi',
    name: 'Unjha Mandi Spice Traders (Bulk Spices)',
    type: 'supplier',
    phone: '+91 98250 11234',
    gstin: '24AACFU8821B1Z2',
    city: 'Unjha, Mehsana',
    creditDays: 30,
    outstandingPaise: 14500000, // ₹1,45,000 we owe them
    assignedEntityId: 'pvt_ltd',
  },
  {
    id: 'party_polyfilms',
    name: 'Gujarat Polyfilms Packaging Ltd (Film Rolls)',
    type: 'supplier',
    phone: '+91 97240 55678',
    gstin: '24AAACG3312Q1Z9',
    city: 'Changodar, Ahmedabad',
    creditDays: 21,
    outstandingPaise: 6800000, // ₹68,000 we owe
    assignedEntityId: 'pvt_ltd',
  },
  {
    id: 'party_mahavir_packer',
    name: 'Mahavir Packaging & Job Works (Sanand)',
    type: 'packer',
    phone: '+91 94260 99811',
    gstin: '24AAGFM5519J1ZY',
    city: 'Sanand GIDC, Ahmedabad',
    creditDays: 15,
    outstandingPaise: 2450000, // ₹24,500 payable
    assignedEntityId: 'pvt_ltd',
  },
  {
    id: 'party_patel_mach',
    name: 'Patel Agro Machinery & Spares',
    type: 'supplier',
    phone: '+91 98980 44321',
    gstin: '24AAJFP2291K1ZX',
    city: 'Ahmedabad',
    creditDays: 7,
    outstandingPaise: 0,
    assignedEntityId: 'pvt_ltd',
  },

  // Main Pvt. Ltd. Exclusive B2B Strategic Customers (Section 2)
  {
    id: 'party_dmart',
    name: 'Avenue Supermarts Ltd (DMart Regional DC)',
    type: 'customer',
    phone: '+91 98251 77889',
    gstin: '24AABCA5512L1Z9',
    city: 'Ahmedabad & Vadodara',
    creditDays: 45,
    outstandingPaise: -185000000, // ₹18,50,000 receivable
    channel: 'modern_trade',
    assignedEntityId: 'pvt_ltd',
    creditLimitPaise: 300000000,
  },
  {
    id: 'party_haldiram',
    name: 'Haldiram Snacks Pvt Ltd (Manufacturing Ingredients)',
    type: 'customer',
    phone: '+91 97120 44882',
    gstin: '24AAACH9918M1ZF',
    city: 'Sanand GIDC, Gujarat',
    creditDays: 30,
    outstandingPaise: -320000000, // ₹32,00,000 receivable
    channel: 'industrial_mfg',
    assignedEntityId: 'pvt_ltd',
    creditLimitPaise: 500000000,
  },
  {
    id: 'party_taj',
    name: 'Taj Gateway Hotels & Resorts (Gujarat Hospitality)',
    type: 'customer',
    phone: '+91 98240 66771',
    gstin: '24AAACT8129N1Z3',
    city: 'Gandhinagar & Surat',
    creditDays: 30,
    outstandingPaise: -8400000, // ₹84,000 receivable
    channel: 'horeca_large',
    assignedEntityId: 'pvt_ltd',
    creditLimitPaise: 25000000,
  },
  {
    id: 'party_almadina',
    name: 'Al-Madina Spice Trading LLC, Dubai (Export)',
    type: 'customer',
    phone: '+971 4 228 9912',
    city: 'Dubai, UAE',
    creditDays: 30,
    outstandingPaise: -237975000, // ₹23,79,750 receivable
    channel: 'export',
    assignedEntityId: 'pvt_ltd',
    creditLimitPaise: 500000000,
  },
  {
    id: 'party_irctc',
    name: 'Western Railway Catering & IRCTC Base Kitchen',
    type: 'customer',
    phone: '+91 97240 99112',
    gstin: '24AAACI1829L1Z5',
    city: 'Ahmedabad Junction',
    creditDays: 30,
    outstandingPaise: -6500000, // ₹65,000 receivable
    channel: 'institutional_large',
    assignedEntityId: 'pvt_ltd',
    creditLimitPaise: 20000000,
  },

  // Sister Proprietorship Routine Gujarat Distribution Customers (Section 3)
  {
    id: 'pty_zepto_sanand',
    name: 'Zepto Dark Store Hub (Sanand Logistics Park)',
    type: 'customer',
    phone: '+91 98980 11223',
    gstin: '24AAACZ8912P1Z0',
    city: 'Sanand, Ahmedabad',
    creditDays: 15,
    outstandingPaise: 0,
    channel: 'quick_commerce',
    assignedEntityId: 'sister_prop',
    creditLimitPaise: 20000000,
  },
  {
    id: 'pty_ret_bhavnagar',
    name: 'Bhavnagar Kirana & Provision Stores',
    type: 'customer',
    phone: '+91 94280 44556',
    gstin: '24AAUPB4412K1Z8',
    city: 'Bhavnagar',
    creditDays: 14,
    outstandingPaise: -1000000, // ₹10,000 receivable
    channel: 'small_retailer',
    assignedEntityId: 'sister_prop',
    creditLimitPaise: 5000000,
  },
  {
    id: 'pty_ss_surat',
    name: 'Surat Spice Super-Stockist Syndicate',
    type: 'customer',
    phone: '+91 98251 33445',
    gstin: '24AABCS7712M1Z1',
    city: 'Surat (Ring Road Market)',
    creditDays: 21,
    outstandingPaise: -9500000, // ₹95,000 receivable
    channel: 'super_stockist',
    assignedEntityId: 'sister_prop',
    creditLimitPaise: 25000000,
  },
  {
    id: 'pty_honest_resto',
    name: 'Honest Restaurant & Fast Food (Highway Branch)',
    type: 'customer',
    phone: '+91 98250 88992',
    gstin: '24AABCH1920Q1Z7',
    city: 'Gandhinagar Highway',
    creditDays: 7,
    outstandingPaise: -1420000, // ₹14,200 receivable
    channel: 'horeca_small',
    assignedEntityId: 'sister_prop',
    creditLimitPaise: 5000000,
  },
  {
    id: 'party_dist_shivam',
    name: 'Shivam Super Kirana & FMCG Distributors',
    type: 'customer',
    phone: '+91 98241 87654',
    gstin: '24ABGFS1190L1ZO',
    city: 'Kalol & Gandhinagar',
    creditDays: 15,
    outstandingPaise: -38500000, // ₹3,85,000 receivable
    channel: 'cfa_distributor',
    assignedEntityId: 'sister_prop',
    creditLimitPaise: 50000000,
  },
];

const initialAccounts: Account[] = [
  // Main Pvt. Ltd. Accounts
  {
    id: 'acc_cash_safe',
    name: 'Plant Cash in Safe (Adalaj Factory)',
    type: 'cash',
    balancePaise: 4520000, // ₹45,200
    entityId: 'pvt_ltd',
  },
  {
    id: 'acc_hdfc_curr',
    name: 'HDFC Current A/c - 50200012345678 (Main Company)',
    type: 'bank',
    accountNoMasked: 'HDFC •••• 5678',
    balancePaise: 84215000, // ₹8,42,150
    entityId: 'pvt_ltd',
  },
  {
    id: 'acc_sbi_mach',
    name: 'SBI Machinery & Term CC A/c (3918002)',
    type: 'bank',
    accountNoMasked: 'SBI •••• 8002',
    balancePaise: 31560000, // ₹3,15,600
    entityId: 'pvt_ltd',
  },
  {
    id: 'acc_petty',
    name: 'Factory Petty Cash Floor Register (Plant Supervisor)',
    type: 'petty_cash',
    balancePaise: 1280000, // ₹12,800
    entityId: 'pvt_ltd',
  },

  // Sister Proprietorship Accounts (Independent Cash & Bank Management - Section 6)
  {
    id: 'acc_sbi_sister',
    name: 'SBI Commercial Current A/c - 38192048192 (Sister Firm)',
    type: 'bank',
    accountNoMasked: 'SBI •••• 8192',
    balancePaise: 18450000, // ₹1,84,500
    entityId: 'sister_prop',
  },
  {
    id: 'acc_cash_depot',
    name: 'CFA Depot Cash in Hand (Aslali Counter & Driver Collections)',
    type: 'cash',
    balancePaise: 1250000, // ₹12,500
    entityId: 'sister_prop',
  },
  {
    id: 'acc_upi_sister',
    name: 'Sister Firm Business UPI & QR Settlement Register',
    type: 'upi',
    balancePaise: 4800000, // ₹48,000
    entityId: 'sister_prop',
  },
];

const initialTransactions: Transaction[] = [
  {
    id: 'txn_01',
    txnNo: 'TXN-2026-081',
    date: '2026-10-04',
    direction: 'out',
    accountId: 'acc_hdfc_curr',
    accountName: 'HDFC Current A/c',
    partyId: 'party_unjha_mandi',
    partyName: 'Unjha Mandi Spice Traders',
    amountPaise: 12000000, // ₹1,20,000
    headCategory: 'Raw Material Purchase',
    mode: 'HDFC NetBanking',
    reference: 'UTR: HDFC00984129',
    status: 'posted',
    notes: 'Advance part payment against Rajapuri Turmeric Powder Lot',
    hasAttachment: true,
  },
  {
    id: 'txn_02',
    txnNo: 'TXN-2026-082',
    date: '2026-10-06',
    direction: 'out',
    accountId: 'acc_hdfc_curr',
    accountName: 'HDFC Current A/c',
    partyId: 'party_polyfilms',
    partyName: 'Gujarat Polyfilms Packaging Ltd',
    amountPaise: 4200000, // ₹42,000
    headCategory: 'Packing Foil & Cylinders',
    mode: 'HDFC NetBanking',
    reference: 'UTR: HDFC00985514',
    status: 'posted',
    notes: 'Invoice payment for 100g cylinder cans lot',
  },
  {
    id: 'txn_03',
    txnNo: 'TXN-2026-083',
    date: '2026-10-08',
    direction: 'out',
    accountId: 'acc_cash_safe',
    accountName: 'Factory Cash in Safe',
    amountPaise: 1540000, // ₹15,400
    headCategory: 'Factory Electricity & Power',
    mode: 'Cash',
    reference: 'Torrent Bill Oct-26',
    status: 'posted',
    notes: 'Paid monthly factory electricity bill at sub-station',
    hasAttachment: true,
  },
  {
    id: 'txn_04',
    txnNo: 'TXN-2026-084',
    date: '2026-10-10',
    direction: 'in',
    accountId: 'acc_hdfc_curr',
    accountName: 'HDFC Current A/c',
    partyId: 'party_dist_shivam',
    partyName: 'Shivam Super Kirana & FMCG Distributors',
    amountPaise: 18500000, // ₹1,85,000
    headCategory: 'Sales Realization',
    mode: 'HDFC NetBanking',
    reference: 'RTGS: SBIN00841294',
    status: 'posted',
    notes: 'Payment received for Dispatch 42 (100g Haldi & Mirch strips)',
  },
  {
    id: 'txn_05',
    txnNo: 'TXN-2026-085',
    date: '2026-10-11',
    direction: 'out',
    accountId: 'acc_petty',
    accountName: 'Petty Cash Floor Register',
    amountPaise: 380000, // ₹3,800
    headCategory: 'Machine Maintenance & Consumables',
    mode: 'Cash',
    reference: 'Voucher #441',
    status: 'posted',
    notes: 'Batch coding ink cartridge and solvent cleaner for gun',
  },
];

const initialBills: Bill[] = [
  {
    id: 'bill_01',
    billNo: 'BILL-UNJ-4482',
    partyId: 'party_unjha_mandi',
    partyName: 'Unjha Mandi Spice Traders',
    date: '2026-10-02',
    dueDate: '2026-11-01',
    subtotalPaise: 25000000, // ₹2,50,000
    gstPaise: 1250000, // 5% GST = ₹12,500
    totalPaise: 26250000, // ₹2,62,500
    paidPaise: 12000000, // ₹1,20,000 paid
    status: 'part_paid',
    itemsDescription: '500 kg Rajapuri Turmeric Powder Grade A @ ₹180 + 500kg Dhaniya',
  },
  {
    id: 'bill_02',
    billNo: 'BILL-GPF-912',
    partyId: 'party_polyfilms',
    partyName: 'Gujarat Polyfilms Packaging Ltd',
    date: '2026-10-05',
    dueDate: '2026-10-26',
    subtotalPaise: 9322000, // ₹93,220
    gstPaise: 1678000, // 18% GST = ₹16,780
    totalPaise: 11000000, // ₹1,10,000
    paidPaise: 4200000, // ₹42,000 paid
    status: 'part_paid',
    itemsDescription: '10,000 pcs 100g/200g printed cylinder cans & aluminium peel seals',
  },
  {
    id: 'bill_03',
    billNo: 'BILL-SANAND-102',
    partyId: 'party_mahavir_packer',
    partyName: 'Mahavir Packaging (Sanand Hub)',
    date: '2026-10-09',
    dueDate: '2026-10-24',
    subtotalPaise: 2450000, // ₹24,500
    gstPaise: 0,
    totalPaise: 2450000,
    paidPaise: 0,
    status: 'pending',
    itemsDescription: 'Third-party job work packing charges for 3,500 strips of ₹10 Lal Mirch',
  },
];

const initialAssets: MachineAsset[] = [
  {
    id: 'mach_auger_01',
    name: 'Auger Servo Cylinder Filling Machine #1',
    serialNo: 'AUG-2024-SRV-09',
    purchaseDate: '2024-03-15',
    costPaise: 45000000, // ₹4,50,000
    depreciationRatePct: 15,
    currentBookValuePaise: 34500000, // ₹3,45,000 book value
    status: 'operational',
    totalBatchHours: 428,
    lastServiceDate: '2026-09-20',
  },
  {
    id: 'mach_vffs_strip',
    name: 'High-Speed VFFS Sachet Packing Machine',
    serialNo: 'VFFS-IND-2025-44',
    purchaseDate: '2025-01-10',
    costPaise: 38000000, // ₹3,80,000
    depreciationRatePct: 15,
    currentBookValuePaise: 32000000, // ₹3,20,000
    status: 'operational',
    totalBatchHours: 290,
    lastServiceDate: '2026-09-15',
  },
  {
    id: 'mach_coding_gun',
    name: 'Thermal Inkjet Batch Coding Hand Gun',
    serialNo: 'TIJ-GUN-8812',
    purchaseDate: '2025-08-01',
    costPaise: 3500000, // ₹35,000
    depreciationRatePct: 20,
    currentBookValuePaise: 3100000, // ₹31,000
    status: 'operational',
    totalBatchHours: 512,
    lastServiceDate: '2026-10-01',
  },
];

const initialEmployees: Employee[] = [
  {
    id: 'emp_01',
    code: 'EMP-01',
    name: 'Ramesh Prajapati',
    designation: 'Senior Packing Supervisor',
    payType: 'monthly',
    ratePaise: 2400000, // ₹24,000 / month
    phone: '+91 98790 12345',
    uan: '101239845112',
    esicNo: '241289451000',
    active: true,
    attendancePresentDaysThisMonth: 11,
    pieceCountThisMonth: 0,
  },
  {
    id: 'emp_02',
    code: 'EMP-02',
    name: 'Mukesh Vaghela',
    designation: 'Auger Machine Operator',
    payType: 'monthly',
    ratePaise: 1800000, // ₹18,000 / month
    phone: '+91 97230 67890',
    uan: '101239845113',
    esicNo: '241289451001',
    active: true,
    attendancePresentDaysThisMonth: 11,
    pieceCountThisMonth: 0,
  },
  {
    id: 'emp_03',
    code: 'EMP-03',
    name: 'Sunita Parmar',
    designation: 'Can Sealing & Outer Pack Worker',
    payType: 'piece_rate',
    ratePaise: 25, // ₹0.25 per finished cylinder can
    phone: '+91 94290 54321',
    active: true,
    attendancePresentDaysThisMonth: 10,
    pieceCountThisMonth: 4280, // 4,280 cans packed this month = ₹1,070
  },
  {
    id: 'emp_04',
    code: 'EMP-04',
    name: 'Geeta Solanki',
    designation: 'Weighing & Quality Inspection',
    payType: 'daily',
    ratePaise: 65000, // ₹650 / day
    phone: '+91 98251 77123',
    active: true,
    attendancePresentDaysThisMonth: 10,
    pieceCountThisMonth: 0,
  },
];

const initialLoans: Loan[] = [
  {
    id: 'loan_hdfc_mach',
    lenderName: 'HDFC Bank Machinery Term Loan',
    kind: 'machinery',
    principalPaise: 50000000, // ₹5,00,000 original
    balancePaise: 38200000, // ₹3,82,000 outstanding
    rateAnnualPct: 10.5,
    emiPaise: 1850000, // ₹18,500 monthly EMI
    nextDueDate: '2026-11-05',
    tenureMonthsRemaining: 24,
  },
  {
    id: 'loan_sbi_cc',
    lenderName: 'SBI Cash Credit / Working Capital Facility',
    kind: 'overdraft',
    principalPaise: 150000000, // ₹15,00,000 limit
    balancePaise: 42000000, // ₹4,20,000 drawn
    rateAnnualPct: 9.75,
    emiPaise: 341250, // ₹3,412.50 monthly interest approx
    nextDueDate: '2026-10-31',
    tenureMonthsRemaining: 12,
  },
];

const initialCampaigns: AdvertisingCampaign[] = [
  {
    id: 'camp_01',
    name: 'Diwali Festive Spice Box Meta Campaign',
    platform: 'meta_ads',
    status: 'active',
    startDate: '2026-10-01',
    endDate: '2026-11-05',
    budgetPaise: 4500000, // ₹45,000
    actualSpendPaise: 3250000, // ₹32,500
    gstPaise: 585000, // ₹5,850 (18% IGST)
    productLine: 'line_a',
    targetSkuCode: 'FG-HLD-100G',
    attributionChannel: 'Instagram & Facebook Reels',
    impressions: 145000,
    clicks: 4200,
    conversions: 380,
    roas: 4.2,
    vendorName: 'Meta Platforms Ireland / India',
    notes: 'Promoting 100g/200g gift packs for festive gifting across Gujarat & Mumbai.',
  },
  {
    id: 'camp_02',
    name: 'Amazon Sponsored Products - Cumin & Turmeric 100g/200g',
    platform: 'amazon_ads',
    status: 'active',
    startDate: '2026-09-15',
    budgetPaise: 2500000, // ₹25,000
    actualSpendPaise: 1840000, // ₹18,400
    gstPaise: 331200, // ₹3,312
    productLine: 'line_a',
    targetSkuCode: 'FG-JRA-100G',
    attributionChannel: 'Amazon Search Keyword Ads',
    impressions: 88000,
    clicks: 2950,
    conversions: 410,
    roas: 3.8,
    vendorName: 'Amazon Seller Services Pvt Ltd',
    notes: 'Exact match bids on "Adalaj Cumin" and "Pure Jeera powder".',
  },
  {
    id: 'camp_03',
    name: 'Blinkit Quick-Commerce Premium Slot Placement',
    platform: 'blinkit_zepto',
    status: 'active',
    startDate: '2026-10-05',
    budgetPaise: 1500000, // ₹15,000
    actualSpendPaise: 1120000, // ₹11,200
    gstPaise: 201600, // ₹2,016
    productLine: 'line_a',
    targetSkuCode: 'FG-MRC-100G',
    attributionChannel: 'Blinkit Instant Delivery Hub Ahmedabad',
    impressions: 52000,
    clicks: 1850,
    conversions: 320,
    roas: 5.1,
    vendorName: 'Blinkit Commerce Pvt Ltd',
    notes: 'Top-of-search banner for grocery searches in Gandhinagar & SG Highway.',
  },
  {
    id: 'camp_04',
    name: 'Gujarat Agro Food Expo Exhibition Stall',
    platform: 'trade_fair',
    status: 'completed',
    startDate: '2026-09-10',
    endDate: '2026-09-14',
    budgetPaise: 7500000, // ₹75,000
    actualSpendPaise: 7200000, // ₹72,000
    gstPaise: 1296000, // ₹12,960
    productLine: 'shared',
    attributionChannel: 'Helipad Exhibition Ground Gandhinagar',
    conversions: 85,
    vendorName: 'Gujarat Agro Exhibitions Ltd',
    notes: 'Sample distribution of ₹10 sachets and wholesale booking for 1kg/2kg silver packs.',
  },
  {
    id: 'camp_05',
    name: 'New Printed Pouch Packaging Artwork & Retainer',
    platform: 'creative_production',
    status: 'completed',
    startDate: '2026-08-20',
    endDate: '2026-09-05',
    budgetPaise: 3500000, // ₹35,000
    actualSpendPaise: 3500000, // ₹35,000
    gstPaise: 630000, // ₹6,300
    productLine: 'line_a',
    attributionChannel: 'Creative Studio Retainer',
    vendorName: 'Heritage Design & Studio Ahmedabad',
    notes: 'High-res food photography, nutrition table typography, and cylinder printing artwork preparation.',
  },
];

const initialSettlements: MarketplaceSettlement[] = [
  {
    id: 'set_amz_01',
    marketplace: 'amazon',
    statementPeriod: '2026-09-16 to 2026-09-30',
    orderCount: 480,
    grossSalesPaise: 14850000, // ₹1,48,500
    referralFeesPaise: 1782000, // ₹17,820 (12%)
    closingFeesPaise: 520000, // ₹5,200
    fulfillmentFeesPaise: 1450000, // ₹14,500 (FBA)
    shippingFeesPaise: 1120000, // ₹11,200
    returnsRtoPaise: 640000, // ₹6,400
    adsDeductionPaise: 1200000, // ₹12,000
    gstOnFeesPaise: 912960, // ₹9,129.60 (18% on fees)
    tcsPaise: 148500, // ₹1,485 (1% TCS)
    netBankPayoutPaise: 7076540, // ₹70,765.40
    bankCreditDate: '2026-10-04',
    status: 'reconciled',
    linkedAccountName: 'HDFC Current A/c (Adalaj Branch - 50200088)',
  },
  {
    id: 'set_blk_01',
    marketplace: 'blinkit',
    statementPeriod: '2026-10-01 to 2026-10-10',
    orderCount: 310,
    grossSalesPaise: 9200000, // ₹92,000
    referralFeesPaise: 920000,
    closingFeesPaise: 310000,
    fulfillmentFeesPaise: 840000,
    shippingFeesPaise: 420000,
    returnsRtoPaise: 120000,
    adsDeductionPaise: 250000,
    gstOnFeesPaise: 514800,
    tcsPaise: 92000,
    netBankPayoutPaise: 5723200, // ₹57,232
    bankCreditDate: '2026-10-11',
    status: 'reconciled',
    linkedAccountName: 'HDFC Current A/c (Adalaj Branch - 50200088)',
  },
  {
    id: 'set_zep_01',
    marketplace: 'zepto',
    statementPeriod: '2026-10-05 to 2026-10-12',
    orderCount: 165,
    grossSalesPaise: 4500000, // ₹45,000
    referralFeesPaise: 450000,
    closingFeesPaise: 165000,
    fulfillmentFeesPaise: 420000,
    shippingFeesPaise: 210000,
    returnsRtoPaise: 90000,
    adsDeductionPaise: 0,
    gstOnFeesPaise: 224100,
    tcsPaise: 45000,
    netBankPayoutPaise: 2895900, // ₹28,959
    bankCreditDate: '2026-10-15',
    status: 'pending',
    linkedAccountName: 'HDFC Current A/c (Adalaj Branch - 50200088)',
  },
];

const initialLicences: LicenceCompliance[] = [
  {
    id: 'lic_fssai',
    name: 'FSSAI State Manufacturing License',
    category: 'fssai',
    registrationNo: '10722026000412',
    issuingAuthority: 'Food & Drugs Control Administration (FDCA), Gujarat',
    issueDate: '2022-08-15',
    expiryDate: '2027-08-14',
    renewalCadence: '5_year',
    status: 'active',
    annualCostPaise: 750000, // ₹7,500
    penaltyPaise: 0,
    responsiblePerson: 'Rajesh Patel (Plant Head)',
    documentRef: 'FSSAI_Licence_Adalaj_2027.pdf',
    notes: 'Mandatory on all primary spice pouches and retail carton packaging.',
    history: [
      { date: '2022-08-15', action: 'Initial 5-year Grant', feePaise: 750000, reference: 'FDCA-GR-2022-99' },
    ],
  },
  {
    id: 'lic_gst',
    name: 'GSTIN Registration Certificate (Form REG-06)',
    category: 'gst',
    registrationNo: '24AAGCS9412F1Z4',
    issuingAuthority: 'State Tax Department, Gandhinagar Division, Gujarat',
    issueDate: '2021-04-01',
    expiryDate: '2099-12-31',
    renewalCadence: 'permanent',
    status: 'active',
    annualCostPaise: 0,
    penaltyPaise: 0,
    responsiblePerson: 'Accountant (Mahesh Shah)',
    documentRef: 'GST_REG06_Adalaj.pdf',
    notes: 'Jurisdiction: Circle 4, Gandhinagar Ward 2.',
  },
  {
    id: 'lic_lm',
    name: 'Legal Metrology Packaged Commodities Registration',
    category: 'weights_measures',
    registrationNo: 'LM/GUJ/PK/2026/0892',
    issuingAuthority: 'Department of Consumer Affairs & Legal Metrology, Gujarat',
    issueDate: '2023-04-01',
    expiryDate: '2028-03-31',
    renewalCadence: '5_year',
    status: 'active',
    annualCostPaise: 500000, // ₹5,000
    penaltyPaise: 0,
    responsiblePerson: 'Rajesh Patel (Plant Head)',
    documentRef: 'Legal_Metrology_Cert_2028.pdf',
    notes: 'Registration of Manufacturer/Packer under Rule 27 of Legal Metrology Rules, 2011.',
  },
  {
    id: 'lic_udyam',
    name: 'Udyam MSME Registration Certificate',
    category: 'udyam',
    registrationNo: 'UDYAM-GJ-01-0084921',
    issuingAuthority: 'Ministry of Micro, Small and Medium Enterprises, Govt of India',
    issueDate: '2021-06-18',
    expiryDate: '2099-12-31',
    renewalCadence: 'permanent',
    status: 'active',
    annualCostPaise: 0,
    penaltyPaise: 0,
    responsiblePerson: 'Owner',
    documentRef: 'Udyam_MSME_Adalaj.pdf',
    notes: 'Micro Manufacturing Enterprise classification for spice processing and packing.',
  },
  {
    id: 'lic_tm',
    name: 'Trademark Registration - ADALAJ (Class 30)',
    category: 'trademark',
    registrationNo: 'TM-5829104',
    issuingAuthority: 'Trade Marks Registry, Ahmedabad, Govt of India',
    issueDate: '2024-02-19',
    expiryDate: '2034-02-18',
    renewalCadence: '10_year',
    status: 'active',
    annualCostPaise: 900000, // ₹9,000
    penaltyPaise: 0,
    responsiblePerson: 'Owner',
    documentRef: 'Trademark_Certificate_Class30.pdf',
    notes: 'Registered wordmark and crest for Spices, Condiments, Seasonings, Curry Powders.',
  },
  {
    id: 'lic_gpcb',
    name: 'Gujarat Pollution Control Board (GPCB Consent)',
    category: 'pollution_control',
    registrationNo: 'GPCB/CCA/GNR-1492',
    issuingAuthority: 'Gujarat Pollution Control Board, Sector 10A Gandhinagar',
    issueDate: '2022-12-01',
    expiryDate: '2027-11-30',
    renewalCadence: '5_year',
    status: 'active',
    annualCostPaise: 1200000, // ₹12,000
    penaltyPaise: 0,
    responsiblePerson: 'Operations Lead',
    documentRef: 'GPCB_Consent_Order_2027.pdf',
    notes: 'Green Category dry powder handling and packaging unit.',
  },
  {
    id: 'lic_gs1',
    name: 'GS1 India Barcode Prefix (EAN-13 Barcodes)',
    category: 'gs1_barcode',
    registrationNo: '8906148291',
    issuingAuthority: 'GS1 India, New Delhi',
    issueDate: '2025-11-16',
    expiryDate: '2026-11-15',
    renewalCadence: 'annual',
    status: 'expiring_soon',
    annualCostPaise: 1500000, // ₹15,000
    penaltyPaise: 0,
    responsiblePerson: 'Operations Lead',
    documentRef: 'GS1_Barcode_Allocation_2026.pdf',
    notes: 'Allocates standard retail 13-digit barcodes for 50g, 100g, 200g, 500g, 1kg, 2kg, 5kg SKUs.',
  },
  {
    id: 'lic_fact',
    name: 'Gujarat Factories Inspectorate Registration',
    category: 'factory_permit',
    registrationNo: 'FAC/GNR/2026/331',
    issuingAuthority: 'Directorate of Industrial Safety & Health (DISH), Gujarat',
    issueDate: '2026-01-01',
    expiryDate: '2026-12-31',
    renewalCadence: 'annual',
    status: 'active',
    annualCostPaise: 1000000, // ₹10,000
    penaltyPaise: 0,
    responsiblePerson: 'Rajesh Patel (Plant Head)',
    documentRef: 'DISH_Factory_License_2026.pdf',
    notes: 'Factory permit for food packing machinery and vertical sealing units.',
  },
  {
    id: 'lic_nabl',
    name: 'NABL Spice Purity, Moisture & Aflatoxin Lab Report',
    category: 'lab_test',
    registrationNo: 'NABL/LAB/SP-9481',
    issuingAuthority: 'EnviroCare Labs (NABL ISO/IEC 17025 Accredited)',
    issueDate: '2026-04-15',
    expiryDate: '2026-10-30',
    renewalCadence: 'quarterly',
    status: 'expiring_soon',
    annualCostPaise: 850000, // ₹8,500
    penaltyPaise: 0,
    responsiblePerson: 'Geeta Solanki (QC)',
    documentRef: 'NABL_Lab_Report_Q3_2026.pdf',
    notes: 'Periodic pesticide residue and moisture compliance test for APMC bulk spice lots.',
  },
];

export interface SystemUserCredential {
  email: string;
  password: string;
  user: AuthUser;
}

export const PREDEFINED_USERS: SystemUserCredential[] = [
  {
    email: 'admin@adalajfoods.com',
    password: 'Admin@2026',
    user: {
      id: 'usr_admin_01',
      email: 'admin@adalajfoods.com',
      name: 'Mohammed Shaikh (Director & Super Admin)',
      role: 'owner',
      phone: '+91 98250 99991',
      department: 'Executive Management & Operations',
      lastLoginAt: '2026-10-12T18:00:00.000Z',
    },
  },
  {
    email: 'accountant@adalajfoods.com',
    password: 'Accounts@2026',
    user: {
      id: 'usr_acc_01',
      email: 'accountant@adalajfoods.com',
      name: 'Ramesh Patel (Head of Finance & Tax)',
      role: 'accountant',
      phone: '+91 98250 99992',
      department: 'Finance & Taxation',
      lastLoginAt: '2026-10-12T17:30:00.000Z',
    },
  },
  {
    email: 'supervisor@adalajfoods.com',
    password: 'Plant@2026',
    user: {
      id: 'usr_sup_01',
      email: 'supervisor@adalajfoods.com',
      name: 'Pravin Solanki (Plant Supervisor)',
      role: 'supervisor',
      phone: '+91 98250 99993',
      department: 'Production Floor & Packing Ops',
      lastLoginAt: '2026-10-12T17:15:00.000Z',
    },
  },
  {
    email: 'store@adalajfoods.com',
    password: 'Store@2026',
    user: {
      id: 'usr_str_01',
      email: 'store@adalajfoods.com',
      name: 'Vikram Desai (Store & Warehouse In-Charge)',
      role: 'store_keeper',
      phone: '+91 98250 99994',
      department: 'Inventory & Materials Receiving',
      lastLoginAt: '2026-10-12T16:45:00.000Z',
    },
  },
  {
    email: 'sales@adalajfoods.com',
    password: 'Sales@2026',
    user: {
      id: 'usr_sls_01',
      email: 'sales@adalajfoods.com',
      name: 'Hitesh Shah (Dispatch & CFA Coordinator)',
      role: 'salesman',
      phone: '+91 98250 99995',
      department: 'Sales, CFA Depot & Exports',
      lastLoginAt: '2026-10-12T16:00:00.000Z',
    },
  },
  {
    email: 'procurement@adalajfoods.com',
    password: 'Mandi@2026',
    user: {
      id: 'usr_proc_01',
      email: 'procurement@adalajfoods.com',
      name: 'Jayesh Patel (RM Sourcing & Mandi Buyer)',
      role: 'procurement',
      phone: '+91 98250 99997',
      department: 'Raw Material Procurement & Mandi Sourcing',
      lastLoginAt: '2026-10-12T15:00:00.000Z',
    },
  },
  {
    email: 'marketing@adalajfoods.com',
    password: 'Growth@2026',
    user: {
      id: 'usr_mkt_01',
      email: 'marketing@adalajfoods.com',
      name: 'Aanya Sharma (Brand Marketing & E-Commerce Lead)',
      role: 'marketing',
      phone: '+91 98250 99998',
      department: 'Brand Marketing & Digital Growth',
      lastLoginAt: '2026-10-12T14:45:00.000Z',
    },
  },
  {
    email: 'auditor@adalajfoods.com',
    password: 'Audit@2026',
    user: {
      id: 'usr_aud_01',
      email: 'auditor@adalajfoods.com',
      name: 'CA Bhavin Trivedi (Statutory Auditor)',
      role: 'ca_auditor',
      phone: '+91 98250 99996',
      department: 'Statutory Audit & GST Compliance',
      lastLoginAt: '2026-10-12T15:30:00.000Z',
    },
  },
];

const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po_machinery_01',
    poNumber: 'PO-2026-09-001',
    initiationDate: '2026-09-25',
    expectedFulfillmentDate: '2026-10-25',
    partyId: 'pty_mach_rajkot',
    partyName: 'Rajkot Packmach Systems Pvt Ltd',
    partyGstin: '24AAJCR9921K1Z8',
    purchaseCategory: 'machinery',
    status: 'partially_fulfilled',
    taxableAmountPaise: 48000000, // ₹4,80,000
    cgstPaise: 4320000,          // 9% CGST = ₹43,200
    sgstPaise: 4320000,          // 9% SGST = ₹43,200
    igstPaise: 0,
    totalAmountPaise: 56640000,  // ₹5,66,400
    totalClaimableGstPaise: 8640000, // ₹86,400 full ITC claimable on plant machinery
    totalIneligibleGstPaise: 0,
    advancePaidPaise: 15000000,  // ₹1,50,000 booking advance
    totalPaidPaise: 35000000,    // ₹3,50,000 total paid so far
    balanceDuePaise: 21640000,   // ₹2,16,400 remaining due on factory commissioning
    payments: [
      {
        id: 'pay_po_01_adv',
        poId: 'po_machinery_01',
        date: '2026-09-25',
        milestoneType: 'advance',
        amountPaise: 15000000,
        paymentMode: 'bank_neft_rtgs',
        accountId: 'acc_hdfc_curr',
        accountName: 'HDFC Current A/c - 50200012345678',
        utrOrRef: 'HDFC0925819024',
        notes: '26.5% Advance token on placing machinery fabrication order',
      },
      {
        id: 'pay_po_01_part',
        poId: 'po_machinery_01',
        date: '2026-10-04',
        milestoneType: 'part_payment',
        amountPaise: 20000000,
        paymentMode: 'bank_neft_rtgs',
        accountId: 'acc_hdfc_curr',
        accountName: 'HDFC Current A/c - 50200012345678',
        utrOrRef: 'HDFC1004910283',
        notes: 'Part-payment on factory pre-dispatch inspection approval at Rajkot plant',
      },
    ],
    items: [
      {
        id: 'poi_01',
        description: 'Automatic High-Speed Auger Form-Fill-Seal Pouch Packing Machine with Nitrogen Flush Kit',
        category: 'machinery',
        hsnOrSac: '84223000',
        qty: 1,
        unit: 'unit',
        unitPricePaise: 48000000,
        taxableAmountPaise: 48000000,
        gstRatePct: 18,
        cgstPaise: 4320000,
        sgstPaise: 4320000,
        igstPaise: 0,
        totalPaise: 56640000,
        isClaimableITC: true,
        isRCM: false,
      },
    ],
    fulfillmentNotes: 'Machine fabricated & tested at vendor premises. Dispatched via transporter; balance ₹2,16,400 payable after erection and trial pouch sealing run.',
    grnNumber: 'GRN-MCH-2026-004',
  },
  {
    id: 'po_raw_01',
    poNumber: 'PO-2026-10-002',
    initiationDate: '2026-10-01',
    expectedFulfillmentDate: '2026-10-15',
    actualFulfillmentDate: '2026-10-08',
    partyId: 'pty_sup_01',
    partyName: 'Patel Agro Spices (APMC Unjha)',
    partyGstin: '24AABCP4412K1Z6',
    purchaseCategory: 'raw_material',
    status: 'partially_fulfilled',
    taxableAmountPaise: 42500000, // ₹4,25,000
    cgstPaise: 1062500,          // 2.5% = ₹10,625
    sgstPaise: 1062500,          // 2.5% = ₹10,625
    igstPaise: 0,
    totalAmountPaise: 44625000,  // ₹4,46,250
    totalClaimableGstPaise: 2125000,
    totalIneligibleGstPaise: 0,
    advancePaidPaise: 15000000,  // ₹1,50,000 advance
    totalPaidPaise: 15000000,
    balanceDuePaise: 29625000,   // ₹2,96,250 balance due after lab moisture check
    payments: [
      {
        id: 'pay_po_02_adv',
        poId: 'po_raw_01',
        date: '2026-10-01',
        milestoneType: 'advance',
        amountPaise: 15000000,
        paymentMode: 'bank_neft_rtgs',
        accountId: 'acc_hdfc_curr',
        accountName: 'HDFC Current A/c - 50200012345678',
        utrOrRef: 'HDFC1001849102',
        notes: 'Advance booking payment against APMC Unjha auction lot loading',
      },
    ],
    items: [
      {
        id: 'poi_02',
        description: 'Rajapuri Pure Turmeric Bulbs (APMC Certified Lot, Moisture < 9.5%)',
        category: 'raw_material',
        hsnOrSac: '09103020',
        qty: 5000,
        unit: 'kg',
        unitPricePaise: 8500, // ₹85/kg
        taxableAmountPaise: 42500000,
        gstRatePct: 5,
        cgstPaise: 1062500,
        sgstPaise: 1062500,
        igstPaise: 0,
        totalPaise: 44625000,
        isClaimableITC: true,
        isRCM: false,
      },
    ],
    fulfillmentNotes: 'Lot unloaded in Adalaj warehouse quarantine bay. Moisture test passing (9.1%). Balance payment queued for CA approval.',
    grnNumber: 'GRN-RAW-2026-102',
  },
  {
    id: 'po_packing_01',
    poNumber: 'PO-2026-10-003',
    initiationDate: '2026-10-02',
    expectedFulfillmentDate: '2026-10-22',
    partyId: 'pty_pack_flexi',
    partyName: 'Apex Flexipack Pvt Ltd (Sanand)',
    partyGstin: '24AAJCA4912L1Z9',
    purchaseCategory: 'packing_material',
    status: 'issued',
    taxableAmountPaise: 24000000, // ₹2,40,000
    cgstPaise: 2160000,          // 9% = ₹21,600
    sgstPaise: 2160000,          // 9% = ₹21,600
    igstPaise: 0,
    totalAmountPaise: 28320000,  // ₹2,83,200
    totalClaimableGstPaise: 4320000,
    totalIneligibleGstPaise: 0,
    advancePaidPaise: 5000000,   // ₹50,000 advance
    totalPaidPaise: 5000000,
    balanceDuePaise: 23320000,   // ₹2,33,200 due on batch delivery
    payments: [
      {
        id: 'pay_po_03_adv',
        poId: 'po_packing_01',
        date: '2026-10-02',
        milestoneType: 'advance',
        amountPaise: 5000000,
        paymentMode: 'bank_neft_rtgs',
        accountId: 'acc_hdfc_curr',
        accountName: 'HDFC Current A/c - 50200012345678',
        utrOrRef: 'HDFC1002998124',
        notes: 'Rotogravure cylinder prepress & film extrusion advance',
      },
    ],
    items: [
      {
        id: 'poi_03',
        description: 'Printed 3-Layer Metalized Barrier Pouches (100g Haldi & 250g Mirchi)',
        category: 'packing_material',
        hsnOrSac: '39232100',
        qty: 200000,
        unit: 'pcs',
        unitPricePaise: 120, // ₹1.20/pc
        taxableAmountPaise: 24000000,
        gstRatePct: 18,
        cgstPaise: 2160000,
        sgstPaise: 2160000,
        igstPaise: 0,
        totalPaise: 28320000,
        isClaimableITC: true,
        isRCM: false,
      },
    ],
    fulfillmentNotes: 'Cylinders engraved, printing scheduled for 18th Oct at Sanand unit.',
  },
  {
    id: 'po_rent_01',
    poNumber: 'PO-2026-10-004',
    initiationDate: '2026-10-01',
    expectedFulfillmentDate: '2026-10-05',
    actualFulfillmentDate: '2026-10-05',
    partyId: 'pty_rent_sarkhej',
    partyName: 'Sarkhej Industrial Estates Ltd',
    partyGstin: '24AAJCS1920M1Z2',
    purchaseCategory: 'rent',
    status: 'fulfilled',
    taxableAmountPaise: 6500000, // ₹65,000
    cgstPaise: 585000,          // ₹5,850
    sgstPaise: 585000,          // ₹5,850
    igstPaise: 0,
    totalAmountPaise: 7670000,  // ₹76,700
    totalClaimableGstPaise: 1170000, // ₹11,700 100% claimable ITC
    totalIneligibleGstPaise: 0,
    advancePaidPaise: 0,
    totalPaidPaise: 7670000,
    balanceDuePaise: 0,
    payments: [
      {
        id: 'pay_po_rent_01',
        poId: 'po_rent_01',
        date: '2026-10-05',
        milestoneType: 'final_settlement',
        amountPaise: 7670000,
        paymentMode: 'bank_neft_rtgs',
        accountId: 'acc_hdfc_curr',
        accountName: 'HDFC Current A/c - 50200012345678',
        utrOrRef: 'HDFC1005881920',
        notes: 'Monthly shed lease for Adalaj packaging facility & spice storage bay',
      },
    ],
    items: [
      {
        id: 'poi_04',
        description: 'Factory Shed & Packaging Facility Rental (Month of Oct 2026)',
        category: 'rent',
        hsnOrSac: '997212',
        qty: 1,
        unit: 'month',
        unitPricePaise: 6500000,
        taxableAmountPaise: 6500000,
        gstRatePct: 18,
        cgstPaise: 585000,
        sgstPaise: 585000,
        igstPaise: 0,
        totalPaise: 7670000,
        isClaimableITC: true,
        isRCM: false,
      },
    ],
    fulfillmentNotes: 'Commercial rent voucher posted; tax invoice received.',
  },
  {
    id: 'po_elec_01',
    poNumber: 'PO-2026-10-005',
    initiationDate: '2026-10-03',
    expectedFulfillmentDate: '2026-10-08',
    actualFulfillmentDate: '2026-10-07',
    partyId: 'pty_elec_torrent',
    partyName: 'Torrent Power Limited (Adalaj Feeder)',
    partyGstin: '24AAACT2727Q1ZT',
    purchaseCategory: 'electricity',
    status: 'fulfilled',
    taxableAmountPaise: 3840000, // ₹38,400
    cgstPaise: 0,
    sgstPaise: 0,
    igstPaise: 0,
    totalAmountPaise: 3840000,  // ₹38,400 (Electricity is GST exempt in India)
    totalClaimableGstPaise: 0,
    totalIneligibleGstPaise: 0,
    advancePaidPaise: 0,
    totalPaidPaise: 3840000,
    balanceDuePaise: 0,
    payments: [
      {
        id: 'pay_po_elec_01',
        poId: 'po_elec_01',
        date: '2026-10-07',
        milestoneType: 'final_settlement',
        amountPaise: 3840000,
        paymentMode: 'bank_neft_rtgs',
        accountId: 'acc_hdfc_curr',
        accountName: 'HDFC Current A/c - 50200012345678',
        utrOrRef: 'HDFC1007449102',
        notes: 'Monthly power tariff (Consumer #849102941, 4,820 Units consumed)',
      },
    ],
    items: [
      {
        id: 'poi_05',
        description: 'HT Industrial Power Bill - 4,820 Units @ ₹7.20/unit + Fixed Demand Charges',
        category: 'electricity',
        hsnOrSac: '996911',
        qty: 4820,
        unit: 'kwh',
        unitPricePaise: 720,
        taxableAmountPaise: 3840000,
        gstRatePct: 0,
        cgstPaise: 0,
        sgstPaise: 0,
        igstPaise: 0,
        totalPaise: 3840000,
        isClaimableITC: false,
        isRCM: false,
      },
    ],
    fulfillmentNotes: 'Power bill cleared before due date; meter readings verified with plant supervisor log.',
  },
  {
    id: 'po_ca_01',
    poNumber: 'PO-2026-10-006',
    initiationDate: '2026-10-01',
    expectedFulfillmentDate: '2026-10-10',
    actualFulfillmentDate: '2026-10-09',
    partyId: 'pty_ca_trivedi',
    partyName: 'Bhavin Trivedi & Associates (CAs)',
    partyGstin: '24AAQPB8412E1Z1',
    purchaseCategory: 'ca_legal',
    status: 'fulfilled',
    taxableAmountPaise: 2500000, // ₹25,000
    cgstPaise: 225000,          // 9% = ₹2,250
    sgstPaise: 225000,          // 9% = ₹2,250
    igstPaise: 0,
    totalAmountPaise: 2950000,  // ₹29,500
    totalClaimableGstPaise: 450000, // ₹4,500 100% claimable business service ITC
    totalIneligibleGstPaise: 0,
    advancePaidPaise: 0,
    totalPaidPaise: 2950000,
    balanceDuePaise: 0,
    payments: [
      {
        id: 'pay_po_ca_01',
        poId: 'po_ca_01',
        date: '2026-10-09',
        milestoneType: 'final_settlement',
        amountPaise: 2950000,
        paymentMode: 'bank_neft_rtgs',
        accountId: 'acc_hdfc_curr',
        accountName: 'HDFC Current A/c - 50200012345678',
        utrOrRef: 'HDFC1009849201',
        notes: 'Monthly retainer for GSTR-1, GSTR-3B, TDS compliance & internal stock audit',
      },
    ],
    items: [
      {
        id: 'poi_06',
        description: 'Monthly Retainer for Statutory Accounting, GST Audit & Tax Compliance (Oct 2026)',
        category: 'ca_legal',
        hsnOrSac: '998222',
        qty: 1,
        unit: 'month',
        unitPricePaise: 2500000,
        taxableAmountPaise: 2500000,
        gstRatePct: 18,
        cgstPaise: 225000,
        sgstPaise: 225000,
        igstPaise: 0,
        totalPaise: 2950000,
        isClaimableITC: true,
        isRCM: false,
      },
    ],
    fulfillmentNotes: 'Tax invoice received and ITC verified on GSTR-2B preview portal.',
  },
  {
    id: 'po_stat_01',
    poNumber: 'PO-2026-10-007',
    initiationDate: '2026-10-04',
    expectedFulfillmentDate: '2026-10-12',
    actualFulfillmentDate: '2026-10-11',
    partyId: 'pty_stat_guj',
    partyName: 'Gujarat Barcode & Packaging Consumables',
    partyGstin: '24AAJCG9182P1Z5',
    purchaseCategory: 'stationery',
    status: 'fulfilled',
    taxableAmountPaise: 1850000, // ₹18,500
    cgstPaise: 166500,          // 9% = ₹1,665
    sgstPaise: 166500,          // 9% = ₹1,665
    igstPaise: 0,
    totalAmountPaise: 2183000,  // ₹21,830
    totalClaimableGstPaise: 333000,
    totalIneligibleGstPaise: 0,
    advancePaidPaise: 0,
    totalPaidPaise: 2183000,
    balanceDuePaise: 0,
    payments: [
      {
        id: 'pay_po_stat_01',
        poId: 'po_stat_01',
        date: '2026-10-11',
        milestoneType: 'final_settlement',
        amountPaise: 2183000,
        paymentMode: 'bank_neft_rtgs',
        accountId: 'acc_hdfc_curr',
        accountName: 'HDFC Current A/c - 50200012345678',
        utrOrRef: 'HDFC1011928410',
        notes: 'Thermal barcode transfer ribbons (50 rolls) & BOPP sealing rolls (100 rolls)',
      },
    ],
    items: [
      {
        id: 'poi_07',
        description: 'Wax-Resin Thermal Transfer Ribbons (110mm x 300m) & BOPP Industrial Sealing Tapes',
        category: 'stationery',
        hsnOrSac: '96121000',
        qty: 150,
        unit: 'rolls',
        unitPricePaise: 12333,
        taxableAmountPaise: 1850000,
        gstRatePct: 18,
        cgstPaise: 166500,
        sgstPaise: 166500,
        igstPaise: 0,
        totalPaise: 2183000,
        isClaimableITC: true,
        isRCM: false,
      },
    ],
    fulfillmentNotes: 'Store room receipt acknowledged by Vikram Desai.',
  },
  {
    id: 'po_lic_01',
    poNumber: 'PO-2026-10-008',
    initiationDate: '2026-10-05',
    expectedFulfillmentDate: '2026-10-10',
    actualFulfillmentDate: '2026-10-09',
    partyId: 'pty_fssai_gov',
    partyName: 'Food Safety and Standards Authority of India (FoSCoS Portal)',
    partyGstin: '07AAAGF0123L1Z4',
    purchaseCategory: 'licences',
    status: 'fulfilled',
    taxableAmountPaise: 1500000, // ₹15,000
    cgstPaise: 0,
    sgstPaise: 0,
    igstPaise: 0,
    totalAmountPaise: 1500000,  // ₹15,000 statutory government fee (exempt from GST)
    totalClaimableGstPaise: 0,
    totalIneligibleGstPaise: 0,
    advancePaidPaise: 0,
    totalPaidPaise: 1500000,
    balanceDuePaise: 0,
    payments: [
      {
        id: 'pay_po_lic_01',
        poId: 'po_lic_01',
        date: '2026-10-09',
        milestoneType: 'final_settlement',
        amountPaise: 1500000,
        paymentMode: 'bank_neft_rtgs',
        accountId: 'acc_hdfc_curr',
        accountName: 'HDFC Current A/c - 50200012345678',
        utrOrRef: 'FOSCOS-CHALLAN-2026-9921',
        notes: 'FSSAI Central Manufacturer Licence renewal portal challan payment',
      },
    ],
    items: [
      {
        id: 'poi_08',
        description: 'FSSAI Central Manufacturing Licence Renewal Fee for 2026-2027 (Capacity > 2 MT/day)',
        category: 'licences',
        hsnOrSac: '999112',
        qty: 1,
        unit: 'year',
        unitPricePaise: 1500000,
        taxableAmountPaise: 1500000,
        gstRatePct: 0,
        cgstPaise: 0,
        sgstPaise: 0,
        igstPaise: 0,
        totalPaise: 1500000,
        isClaimableITC: false,
        isRCM: false,
      },
    ],
    fulfillmentNotes: 'FoSCoS acknowledgement slip generated; licence renewed for 1 year.',
  },
];

const initialInterFirmTransfers: InterFirmTransfer[] = [
  {
    id: 'ift_cfa_001',
    transferChallanNo: 'DC-2026-10-001',
    date: '2026-10-10',
    destinationFirmName: 'Adalaj Foods Distribution & CFA Depot',
    destinationGstin: '24AAGCS9412F2Z1',
    destinationAddress: 'Plot 14-B, Sardar Patel Ring Road Logistics Park, Aslali, Ahmedabad 382427',
    vehicleNo: 'GJ-01-ET-8492',
    ewayBillNo: '241893829104',
    driverPhone: '+91 98980 23145',
    format: 'mixed_assorted',
    items: [
      {
        itemId: 'item_haldi_100g',
        sku: 'FG-HLD-100G',
        name: 'Turmeric Powder (Haldi) 100g Consumer Pouch',
        packSizeGrams: 100,
        batchNumber: 'BAT-2026-10-01',
        packsCount: 1200,
        boxesCount: 20,
        totalGrams: 120000,
        ratePerKgPaise: 40000, // ₹400/kg valuation
        totalValuationPaise: 4800000, // ₹48,000
      },
      {
        itemId: 'item_mirchi_250g',
        sku: 'FG-MRC-250G',
        name: 'Red Chilli Powder (Mirchi) 250g Consumer Pouch',
        packSizeGrams: 250,
        batchNumber: 'BAT-2026-10-02',
        packsCount: 800,
        boxesCount: 16,
        totalGrams: 200000,
        ratePerKgPaise: 48000, // ₹480/kg valuation
        totalValuationPaise: 9600000, // ₹96,000
      },
      {
        itemId: 'item_raw_hld',
        sku: 'RAW-HLD-01',
        name: 'Pure Ground Turmeric Powder (25kg Bulk Master Sack)',
        packSizeGrams: 25000,
        batchNumber: 'BAT-2026-10-01',
        packsCount: 8,
        boxesCount: 8,
        totalGrams: 200000,
        ratePerKgPaise: 37000, // ₹370/kg valuation
        totalValuationPaise: 7400000, // ₹74,000
      },
    ],
    totalGrams: 520000, // 520 kg
    totalValuationPaise: 21800000, // ₹2,18,000
    status: 'received_at_cfa',
    receivedAtDate: '2026-10-10',
    receivedByNotes: 'Received in sound condition at CFA Depot Bay #3; physical carton counts verified.',
    remarks: 'Inter-firm stock transfer to sister distribution company under GST Rule 55 Delivery Challan.',
  },
  {
    id: 'ift_cfa_002',
    transferChallanNo: 'DC-2026-10-002',
    date: '2026-10-12',
    destinationFirmName: 'Adalaj Foods Distribution & CFA Depot',
    destinationGstin: '24AAGCS9412F2Z1',
    destinationAddress: 'Plot 14-B, Sardar Patel Ring Road Logistics Park, Aslali, Ahmedabad 382427',
    vehicleNo: 'GJ-18-AZ-4410',
    ewayBillNo: '241893829188',
    driverPhone: '+91 97120 44521',
    format: 'bulk_sacks',
    items: [
      {
        itemId: 'item_coriander_bulk',
        sku: 'RAW-DHN-25KG',
        name: 'Dhaniya (Coriander) Powder (25kg Bulk Commercial Sack)',
        packSizeGrams: 25000,
        batchNumber: 'BAT-2026-10-03',
        packsCount: 20,
        boxesCount: 20,
        totalGrams: 500000,
        ratePerKgPaise: 33000, // ₹330/kg
        totalValuationPaise: 16500000, // ₹1,65,000
      },
    ],
    totalGrams: 500000, // 500 kg
    totalValuationPaise: 16500000, // ₹1,65,000
    status: 'in_transit',
    remarks: 'Commercial bulk stock transfer en-route to Aslali CFA Depot for onward wholesale deliveries.',
  },
];

const initialExportShipments: ExportShipment[] = [
  {
    id: 'exp_ship_001',
    exportInvoiceNo: 'EXP-2026-001',
    shippingBillNo: 'SB-7489211/2026',
    date: '2026-09-28',
    consigneeName: 'Al-Madina Spice Trading LLC, Al-Ras, Deira, Dubai, UAE',
    destinationCountry: 'United Arab Emirates',
    destinationPort: 'Jebel Ali Port (AEJEA)',
    portOfLoading: 'Mundra Port, Gujarat (INMUN1)',
    lutNumber: 'AD240326001928K',
    iecNumber: '0819034291',
    apedaRcmcNo: 'APEDA/GUJ/2024/991',
    spicesBoardRegNo: 'CRES/SPICES/ADL/009',
    exportFormat: 'bulk_export',
    containerNo: 'MSKU-781920-4 (20ft FCL)',
    sealNo: 'IN-MUN-99218',
    totalWeightKg: 20000, // 20 MT
    foreignCurrency: 'USD',
    foreignAmountCents: 2850000, // $28,500.00
    inrRealizedPaise: 237975000, // ₹23,79,750 (at ₹83.50/$)
    status: 'loaded_on_vessel',
    blOrAwbNumber: 'MAEU98218491',
    blDate: '2026-10-02',
    notes: 'Bulk food-grade big bags (1 MT jumbo bags x 20) with phytosanitary and Spices Board analytical certificate.',
  },
  {
    id: 'exp_ship_002',
    exportInvoiceNo: 'EXP-2026-002',
    shippingBillNo: 'SB-8912301/2026',
    date: '2026-10-08',
    consigneeName: 'Patel Brothers Import & Distribution Inc, Hanover, NJ, USA',
    destinationCountry: 'United States of America',
    destinationPort: 'Port of New York / Newark (USNYC)',
    portOfLoading: 'Mundra Port, Gujarat (INMUN1)',
    lutNumber: 'AD240326001928K',
    iecNumber: '0819034291',
    apedaRcmcNo: 'APEDA/GUJ/2024/991',
    spicesBoardRegNo: 'CRES/SPICES/ADL/009',
    exportFormat: 'retail_pack_export',
    containerNo: 'HLXU-491028-1 (40ft HQ)',
    sealNo: 'IN-MUN-10294',
    totalWeightKg: 12500, // 12.5 MT
    foreignCurrency: 'USD',
    foreignAmountCents: 1820000, // $18,200.00
    inrRealizedPaise: 151970000, // ₹15,19,700
    status: 'customs_cleared',
    blOrAwbNumber: 'HLCU94819204',
    blDate: '2026-10-10',
    notes: 'Retail packaged spices (100g & 250g consumer pouches packed in 5-ply corrugated shippers with US FDA compliant nutritional labelling).',
  },
];

const initialStockAllocations: InterEntityStockAllocation[] = [
  {
    id: 'alc_2026_10_c1',
    allocationNumber: 'ALC-2026-10-C1',
    cycle: 'biweekly',
    periodStart: '2026-10-01',
    periodEnd: '2026-10-15',
    creditDueDate: '2026-11-15',
    sourceEntityId: 'pvt_ltd',
    destinationEntityId: 'sister_prop',
    totalAllocatedGrams: 1020000, // 1,020 kg
    totalValuationPaise: 38300000, // ₹3,83,000 valuation
    challanIds: ['DC-2026-10-001', 'DC-2026-10-002'],
    status: 'active',
    settledAmountPaise: 15000000, // ₹1,50,000 paid as advance
    balanceOutstandingPaise: 23300000, // ₹2,33,000 pending
    notes: 'Biweekly stock allocation cycle for Gujarat distribution network. Credit terms: 45 days.',
  },
];

const initialSisterDownstreamInvoices: SisterDownstreamInvoice[] = [
  {
    id: 'inv_sis_001',
    invoiceNo: 'ADL-DIS-2026-1001',
    date: '2026-10-11',
    channel: 'quick_commerce',
    customerId: 'pty_zepto_sanand',
    customerName: 'Zepto Dark Store Hub (Sanand Logistics Park)',
    customerGstin: '24AAACZ8912P1Z0',
    customerCity: 'Sanand, Ahmedabad',
    customerPhone: '+91 98980 11223',
    paymentDueDate: '2026-10-26',
    paymentStatus: 'paid',
    items: [
      {
        itemId: 'item_haldi_100g',
        sku: 'FG-HLD-100G',
        name: 'Turmeric Powder (Haldi) 100g Consumer Pouch',
        packSizeGrams: 100,
        batchNo: 'BAT-2026-10-01',
        qtyPacks: 1200,
        totalGrams: 120000,
        ratePerPackPaise: 4000, // ₹40/pack
        taxableAmountPaise: 4571400,
        gstRatePct: 5,
        cgstPaise: 114300,
        sgstPaise: 114300,
        totalPaise: 4800000, // ₹48,000
      },
    ],
    totalGrams: 120000,
    taxableAmountPaise: 4571400,
    cgstPaise: 114300,
    sgstPaise: 114300,
    totalPaise: 4800000,
    paidAmountPaise: 4800000,
    balanceDuePaise: 0,
    payments: [
      {
        id: 'pay_dis_001',
        date: '2026-10-12',
        amountPaise: 4800000,
        mode: 'UPI / Escrow Settlement',
        reference: 'ZPT-PAY-9812901',
      },
    ],
    notes: 'Secondary delivery to dark store bay #4.',
  },
  {
    id: 'inv_sis_002',
    invoiceNo: 'ADL-DIS-2026-1002',
    date: '2026-10-11',
    channel: 'small_retailer',
    customerId: 'pty_ret_bhavnagar',
    customerName: 'Bhavnagar Kirana & Provision Stores',
    customerGstin: '24AAUPB4412K1Z8',
    customerCity: 'Bhavnagar',
    customerPhone: '+91 94280 44556',
    paymentDueDate: '2026-10-25',
    paymentStatus: 'part_paid',
    items: [
      {
        itemId: 'item_mirchi_250g',
        sku: 'FG-MRC-250G',
        name: 'Red Chilli Powder (Mirchi) 250g Consumer Pouch',
        packSizeGrams: 250,
        batchNo: 'BAT-2026-10-02',
        qtyPacks: 160,
        totalGrams: 40000,
        ratePerPackPaise: 11562, // ₹115.62
        taxableAmountPaise: 1761900,
        gstRatePct: 5,
        cgstPaise: 44050,
        sgstPaise: 44050,
        totalPaise: 1850000, // ₹18,500
      },
    ],
    totalGrams: 40000,
    taxableAmountPaise: 1761900,
    cgstPaise: 44050,
    sgstPaise: 44050,
    totalPaise: 1850000,
    paidAmountPaise: 850000, // ₹8,500 paid
    balanceDuePaise: 1000000, // ₹10,000 balance
    payments: [
      {
        id: 'pay_dis_002',
        date: '2026-10-11',
        amountPaise: 850000,
        mode: 'Cash to Route Van Driver',
        reference: 'RV-CASH-REC-104',
      },
    ],
    notes: 'Route delivery via Driver Hitesh Shah.',
  },
  {
    id: 'inv_sis_003',
    invoiceNo: 'ADL-DIS-2026-1003',
    date: '2026-10-12',
    channel: 'super_stockist',
    customerId: 'pty_ss_surat',
    customerName: 'Surat Spice Super-Stockist Syndicate',
    customerGstin: '24AABCS7712M1Z1',
    customerCity: 'Surat (Ring Road Market)',
    customerPhone: '+91 98251 33445',
    paymentDueDate: '2026-11-02',
    paymentStatus: 'unpaid',
    items: [
      {
        itemId: 'item_haldi_100g',
        sku: 'FG-HLD-100G',
        name: 'Turmeric Powder (Haldi) 100g Consumer Pouch',
        packSizeGrams: 100,
        batchNo: 'BAT-2026-10-01',
        qtyPacks: 2000,
        totalGrams: 200000,
        ratePerPackPaise: 3800,
        taxableAmountPaise: 7238100,
        gstRatePct: 5,
        cgstPaise: 180950,
        sgstPaise: 180950,
        totalPaise: 7600000, // ₹76,000
      },
      {
        itemId: 'item_mirchi_250g',
        sku: 'FG-MRC-250G',
        name: 'Red Chilli Powder (Mirchi) 250g Consumer Pouch',
        packSizeGrams: 250,
        batchNo: 'BAT-2026-10-02',
        qtyPacks: 160,
        totalGrams: 40000,
        ratePerPackPaise: 11875,
        taxableAmountPaise: 1809500,
        gstRatePct: 5,
        cgstPaise: 45250,
        sgstPaise: 45250,
        totalPaise: 1900000, // ₹19,000
      },
    ],
    totalGrams: 240000,
    taxableAmountPaise: 9047600,
    cgstPaise: 226200,
    sgstPaise: 226200,
    totalPaise: 9500000, // ₹95,000
    paidAmountPaise: 0,
    balanceDuePaise: 9500000,
    notes: 'Credit terms: 21 days dispatch to Surat South hub.',
  },
];

const initialInterEntitySettlements: InterEntitySettlement[] = [
  {
    id: 'ies_2026_10_001',
    settlementNo: 'IES-2026-10-001',
    date: '2026-10-10',
    amountPaise: 15000000, // ₹1,50,000
    remittedFromAccountId: 'acc_sbi_sister',
    depositedToAccountId: 'acc_hdfc_curr',
    paymentMode: 'NEFT',
    bankUtrRef: 'SBIN1010992812',
    settlementType: 'stock_advance',
    linkedAllocationIds: ['alc_2026_10_c1'],
    linkedChallanIds: ['DC-2026-10-001'],
    notes: 'Advance remittance against Delivery Challan DC-2026-10-001 per agreed credit arrangement.',
    verifiedByAuditor: true,
  },
];

const initialSalesInvoices: SalesInvoice[] = [
  {
    id: 'inv_b2b_001',
    invoiceNo: 'ADL-INV-2026-0001',
    invoiceType: 'domestic_tax_invoice',
    entityId: 'pvt_ltd',
    date: '2026-10-10',
    dueDate: '2026-11-09',
    buyerPartyId: 'pty_mod_dmart',
    buyerName: 'Gujarat Modern Hypermarkets Ltd. (Avenue Supermarts)',
    buyerGstin: '24AAACG1234F1Z9',
    buyerPan: 'AAACG1234F',
    buyerAddress: 'Block C, SG Corporate Tower, Ahmedabad - 380054, Gujarat',
    buyerState: 'Gujarat',
    buyerStateCode: '24',
    buyerCountry: 'India',
    creditTerms: 'credit_30',
    creditDays: 30,
    creditSurchargeRatePct: 2.0, // Commercial credit rule: +2% surcharge
    creditSurchargePaise: 386800, // ₹3,868.00
    extendedCreditInterestPaise: 0,
    subtotalTaxablePaise: 19340000, // ₹1,93,400.00
    totalTaxablePaise: 19726800, // ₹1,97,268.00
    cgstPaise: 493170, // 2.5% CGST = ₹4,931.70
    sgstPaise: 493170, // 2.5% SGST = ₹4,931.70
    igstPaise: 0,
    totalTaxPaise: 986340,
    roundOffPaise: -40,
    grandTotalPaise: 20713100, // ₹2,07,131.00
    paidAmountPaise: 0,
    balanceDuePaise: 20713100,
    status: 'issued',
    eWayBillNo: '241893021940',
    irn: '5a28b9c1d0e4f8a37b12c4d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
    isExport: false,
    currency: 'INR',
    exchangeRate: 1.0,
    foreignAmount: 207131.0,
    items: [
      {
        id: 'inv_it_01',
        sku: 'FG-HLD-100G',
        name: 'Turmeric Powder (Agmark Special) 100g Pouches',
        description: 'Standard 100g consumer pouches in master shipper boxes',
        hsnCode: '0910',
        packSizeGrams: 100,
        quantityUnits: 2500,
        unitType: 'pouches',
        ratePerUnitPaise: 3800, // ₹38.00
        taxableAmountPaise: 9500000,
        gstRatePct: 5,
        cgstPaise: 237500,
        sgstPaise: 237500,
        igstPaise: 0,
        totalPaise: 9975000,
      },
      {
        id: 'inv_it_02',
        sku: 'FG-MRCH-200G',
        name: 'Red Chilli Powder (Stemless Reshamapatti) 200g Pouches',
        description: 'Standard 200g nitrogen-sealed flexible pouches',
        hsnCode: '0904',
        packSizeGrams: 200,
        quantityUnits: 1200,
        unitType: 'pouches',
        ratePerUnitPaise: 8200, // ₹82.00
        taxableAmountPaise: 9840000,
        gstRatePct: 5,
        cgstPaise: 246000,
        sgstPaise: 246000,
        igstPaise: 0,
        totalPaise: 10332000,
      },
    ],
    notes: 'Payment term: 30 days post delivery. Credit surcharge of 2% included.',
    createdAt: '2026-10-10T10:00:00.000Z',
  },
  {
    id: 'inv_b2b_002',
    invoiceNo: 'ADL-EXP-2026-0001',
    invoiceType: 'export_commercial',
    entityId: 'pvt_ltd',
    date: '2026-10-12',
    dueDate: '2026-10-22',
    buyerName: 'Al-Madina Spice Trading LLC, Dubai, UAE',
    buyerAddress: 'Warehouse 14, Al Ras Spice Market, Deira, Dubai, United Arab Emirates',
    buyerCountry: 'United Arab Emirates',
    buyerState: 'Dubai',
    buyerStateCode: '99',
    creditTerms: 'advance',
    creditDays: 0,
    creditSurchargeRatePct: 0,
    creditSurchargePaise: 0,
    extendedCreditInterestPaise: 0,
    subtotalTaxablePaise: 208750000, // ₹20,87,500.00 ($25,000 @ ₹83.50)
    totalTaxablePaise: 208750000,
    cgstPaise: 0,
    sgstPaise: 0,
    igstPaise: 0, // Zero rated export under LUT Rule 96A
    totalTaxPaise: 0,
    roundOffPaise: 0,
    grandTotalPaise: 208750000,
    paidAmountPaise: 208750000,
    balanceDuePaise: 0,
    status: 'paid',
    isExport: true,
    currency: 'USD',
    exchangeRate: 83.5,
    foreignAmount: 25000.0,
    incoterms: 'FOB',
    portOfLoading: 'Mundra Port, Gujarat (INMUN1)',
    portOfDischarge: 'Jebel Ali Port, UAE (AEJEA)',
    destinationCountry: 'United Arab Emirates',
    iecNo: '2418002931',
    lutArn: 'AD240426001928K',
    cresNo: 'SB/REG/GJ/2026/0419',
    swiftBic: 'HDFCINBBXXX',
    adCode: '0412894',
    items: [
      {
        id: 'exp_it_01',
        sku: 'RAW-HLD-25KG',
        name: 'Pure Ground Turmeric Powder (Agmark Special Quality)',
        description: 'Packed in 25kg multi-wall paper poly-lined export sacks',
        hsnCode: '0910',
        packSizeGrams: 25000,
        quantityUnits: 600,
        unitType: 'boxes',
        ratePerUnitPaise: 347917, // $41.67 per 25kg sack
        taxableAmountPaise: 208750000,
        gstRatePct: 0,
        cgstPaise: 0,
        sgstPaise: 0,
        igstPaise: 0,
        totalPaise: 208750000,
      },
    ],
    notes: 'Full container load (FCL) dispatch from Mundra Port. Export under Bond/LUT without payment of IGST.',
    createdAt: '2026-10-12T14:30:00.000Z',
  },
];

const initialSalesQuotations: SalesQuotation[] = [
  {
    id: 'quo_horeca_001',
    quotationNo: 'ADL-QUO-2026-0001',
    date: '2026-10-11',
    validUntilDate: '2026-11-10',
    entityId: 'pvt_ltd',
    buyerName: 'Taj Vivanta & Gateway Palace Catering Division',
    buyerGstin: '24AABCT9981P1Z3',
    buyerAddress: 'SG Highway Luxury Hotel Complex, Bodakdev, Ahmedabad - 380054',
    buyerCountry: 'India',
    creditTerms: 'credit_30',
    creditSurchargeRatePct: 2.0,
    creditSurchargePaise: 800000,
    subtotalTaxablePaise: 40000000, // ₹4,00,000.00
    estimatedTaxPaise: 2040000, // 5% GST
    grandTotalPaise: 42840000, // ₹4,28,400.00
    termsAndConditions: [
      'Validity: This formal quotation is valid for 30 calendar days from the date of issue.',
      'Quality Standard: All spices are 100% steam-sterilized, pure whole ground, zero added starch/color.',
      'Payment: Standard terms are 30 days credit from invoice date (credit surcharge of 2% applicable).',
      'Delivery: Delivered duty paid (DDP) to Taj central kitchen store, SG Highway, Ahmedabad.',
    ],
    status: 'sent',
    createdAt: '2026-10-11T11:00:00.000Z',
    items: [
      {
        id: 'quo_it_01',
        sku: 'FG-HLD-500G',
        name: 'Turmeric Powder (Haldi) 500g Commercial Kitchen Pack',
        description: '2 pcs bundles packed in 20kg shipper cartons',
        hsnCode: '0910',
        packSizeGrams: 500,
        quantityUnits: 1000,
        unitType: 'pouches',
        ratePerUnitPaise: 18000, // ₹180.00
        taxableAmountPaise: 18000000,
        gstRatePct: 5,
        cgstPaise: 450000,
        sgstPaise: 450000,
        igstPaise: 0,
        totalPaise: 18900000,
      },
      {
        id: 'quo_it_02',
        sku: 'FG-MRC-500G',
        name: 'Kashmiri Mild Red Chilli Powder 500g Pack',
        description: 'High color value, low heat commercial packs',
        hsnCode: '0904',
        packSizeGrams: 500,
        quantityUnits: 800,
        unitType: 'pouches',
        ratePerUnitPaise: 27500, // ₹275.00
        taxableAmountPaise: 22000000,
        gstRatePct: 5,
        cgstPaise: 550000,
        sgstPaise: 550000,
        igstPaise: 0,
        totalPaise: 23100000,
      },
    ],
  },
];

const initialPackingFloorJobs: PackingFloorFulfillmentJob[] = [
  {
    id: 'job_flr_001',
    jobNo: 'JOB-2026-10-001',
    date: '2026-10-10',
    customerName: 'Taj Vivanta & Gateway Palace Catering Division',
    orderRef: 'PO-TAJ-2026-881',
    spiceName: 'Turmeric Powder (Pure Agmark Grade)',
    targetGrams: 1000000, // 1,000 kg
    targetPacks: 10000, // 10,000 units of 100g
    primaryTier: 'pouch_100g',
    secondaryTier: 'pack_10pcs', // 10 pcs pack = 1kg bundle
    tertiaryTier: 'box_20kg', // 20kg 5-ply master box (contains 20 x 1kg bundles = 200 pouches)
    isMixedAssortedShipper: false,
    dailyPackQuotaUnits: 2500,
    packedGramsCompleted: 700000, // 700 kg
    packedUnitsCompleted: 7000,
    deficitGrams: 300000, // 300 kg remaining
    deficitUnits: 3000,
    fulfillmentPct: 70.0,
    dailyProgressRecords: [
      {
        date: '2026-10-10',
        shift: 'morning',
        supervisor: 'Pravin Solanki',
        packedUnits: 2400,
        packedGrams: 240000,
        spillWastageGrams: 1200,
      },
      {
        date: '2026-10-11',
        shift: 'morning',
        supervisor: 'Pravin Solanki',
        packedUnits: 2500,
        packedGrams: 250000,
        spillWastageGrams: 1100,
      },
      {
        date: '2026-10-12',
        shift: 'morning',
        supervisor: 'Pravin Solanki',
        packedUnits: 2100,
        packedGrams: 210000,
        spillWastageGrams: 900,
      },
    ],
    status: 'secondary_bundling',
    lotTraceability: {
      rawSpiceSupplierLot: 'UNJ-RAJ-984 (Unjha Mandi)',
      grindingBatchNo: 'BAT-2026-10-01',
      primaryPackLotNo: 'PL-HLD-100G-01',
      tertiaryShipperBoxBarcodes: ['BOX-TAJ-001', 'BOX-TAJ-002', 'BOX-TAJ-003', 'BOX-TAJ-035'],
      dispatchInvoiceRef: 'ADL-INV-2026-0001',
    },
  },
  {
    id: 'job_flr_002',
    jobNo: 'JOB-2026-10-002',
    date: '2026-10-11',
    customerName: 'Gujarat General Kirana Retail Distribution',
    orderRef: 'ORD-DIS-2026-1004',
    spiceName: 'Guntur Red Chilli Powder (₹10 Pouch Sachet)',
    targetGrams: 600000, // 600 kg
    targetPacks: 30000, // 30,000 pouches of 20g
    primaryTier: 'pouch_10rs',
    secondaryTier: 'bundle_30pcs', // 3 strips of 10 pcs = 30 pcs hanging bundle
    tertiaryTier: 'pp_bag_25kg', // 25kg Woven PP bag shipper (contains ~41 bundles)
    isMixedAssortedShipper: false,
    dailyPackQuotaUnits: 7500,
    packedGramsCompleted: 360000,
    packedUnitsCompleted: 18000,
    deficitGrams: 240000,
    deficitUnits: 12000,
    fulfillmentPct: 60.0,
    dailyProgressRecords: [
      {
        date: '2026-10-11',
        shift: 'evening',
        supervisor: 'Pravin Solanki',
        packedUnits: 9000,
        packedGrams: 180000,
        spillWastageGrams: 850,
      },
      {
        date: '2026-10-12',
        shift: 'morning',
        supervisor: 'Pravin Solanki',
        packedUnits: 9000,
        packedGrams: 180000,
        spillWastageGrams: 900,
      },
    ],
    status: 'primary_packing',
    lotTraceability: {
      rawSpiceSupplierLot: 'GNT-TEJA-332 (Shree Balaji Spice Mills)',
      grindingBatchNo: 'BAT-2026-10-02',
      primaryPackLotNo: 'PL-MRC-10RS-02',
      tertiaryShipperBoxBarcodes: ['BAG-DIS-01', 'BAG-DIS-02', 'BAG-DIS-14'],
    },
  },
  {
    id: 'job_flr_003',
    jobNo: 'JOB-2026-10-003',
    date: '2026-10-12',
    customerName: 'Haldiram Snacks & Sweets Mfg Pvt Ltd',
    orderRef: 'PO-HLD-OCT-990',
    spiceName: 'Fine Dhaniya (Coriander) Powder Industrial Bulk',
    targetGrams: 5000000, // 5,000 kg
    targetPacks: 100, // 100 master bags of 50kg
    primaryTier: 'bulk_50kg', // Direct 50kg loose filling
    secondaryTier: 'none_direct',
    tertiaryTier: 'pp_bag_50kg',
    isMixedAssortedShipper: false,
    dailyPackQuotaUnits: 50,
    packedGramsCompleted: 4000000,
    packedUnitsCompleted: 80,
    deficitGrams: 1000000,
    deficitUnits: 20,
    fulfillmentPct: 80.0,
    dailyProgressRecords: [
      {
        date: '2026-10-12',
        shift: 'morning',
        supervisor: 'Pravin Solanki',
        packedUnits: 50,
        packedGrams: 2500000,
        spillWastageGrams: 2400,
      },
      {
        date: '2026-10-12',
        shift: 'evening',
        supervisor: 'Pravin Solanki',
        packedUnits: 30,
        packedGrams: 1500000,
        spillWastageGrams: 1500,
      },
    ],
    status: 'tertiary_boxed',
    lotTraceability: {
      rawSpiceSupplierLot: 'RAM-COR-419 (Ramganj Mandi)',
      grindingBatchNo: 'BAT-2026-10-03',
      primaryPackLotNo: 'PL-DHN-50KG-01',
      tertiaryShipperBoxBarcodes: ['SACK-HLD-001', 'SACK-HLD-080'],
    },
  },
];

const initialVoidedInvoices: VoidedInvoiceAudit[] = [];

export const initialPackagingSpecs: PackagingTierSpec[] = [
  // --- TIER 1: PRIMARY PACKAGING (FILLING) ---
  {
    id: 'spec_t1_10rs',
    tierLevel: 1,
    code: 'pouch_sachet_10rs',
    displayName: '₹10 Sachet Pouch (18g - 25g net)',
    category: 'primary',
    netCapacityGrams: 20,
    tareWeightGrams: 1.5,
    materialType: 'BOPP / MET-PET 3-Ply Barrier Foil',
    machineTypeRequired: 'High-Speed Vertical FFS (Strip/Sachet)',
    unitsPerParent: 30, // 30 pcs per secondary bundle
    isExportCompliant: false,
    isActive: true,
    costPaisePerUnit: 45, // ₹0.45 per pouch
    notes: 'Mass-market consumer trial sachet, nitro-flushed for 9-month shelf life',
  },
  {
    id: 'spec_t1_50g',
    tierLevel: 1,
    code: 'pouch_50g',
    displayName: '50g Consumer Pouch',
    category: 'primary',
    netCapacityGrams: 50,
    tareWeightGrams: 2.5,
    materialType: 'Glossy Laminated Food-Grade Foil',
    machineTypeRequired: 'Rotary Form-Fill-Seal Machine',
    unitsPerParent: 20,
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 75, // ₹0.75
    notes: 'Popular retail Kirana store size for small households',
  },
  {
    id: 'spec_t1_100g',
    tierLevel: 1,
    code: 'pouch_100g',
    displayName: '100g Consumer Pouch',
    category: 'primary',
    netCapacityGrams: 100,
    tareWeightGrams: 3.8,
    materialType: 'Multi-layer Nitrogen Flushable Pouch',
    machineTypeRequired: 'Auger Servo Cylinder Filler #1',
    unitsPerParent: 10,
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 120, // ₹1.20
    notes: 'Core FMCG volume driver, Agmark & FSSAI certified barcode print',
  },
  {
    id: 'spec_t1_200g',
    tierLevel: 1,
    code: 'pouch_200g',
    displayName: '200g Consumer Pouch',
    category: 'primary',
    netCapacityGrams: 200,
    tareWeightGrams: 5.2,
    materialType: 'Multi-layer Nitrogen Flushable Pouch',
    machineTypeRequired: 'Auger Servo Cylinder Filler #1',
    unitsPerParent: 5,
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 180, // ₹1.80
    notes: 'High-margin family pack size for Modern Trade & Supermarkets',
  },
  {
    id: 'spec_t1_500g',
    tierLevel: 1,
    code: 'pouch_500g',
    displayName: '500g Consumer Pouch',
    category: 'primary',
    netCapacityGrams: 500,
    tareWeightGrams: 8.5,
    materialType: 'Stand-up Zipper / Heavy 3-Ply Pouch',
    machineTypeRequired: 'Semi-Automatic Auger & Band Sealer',
    unitsPerParent: 2,
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 350, // ₹3.50
    notes: 'HORECA and large household kitchen staple pack',
  },
  {
    id: 'spec_t1_1kg',
    tierLevel: 1,
    code: 'bag_1kg',
    displayName: '1kg Consumer Standee Bag',
    category: 'primary',
    netCapacityGrams: 1000,
    tareWeightGrams: 14.0,
    materialType: 'Heavy-Duty Gusseted Laminated Bag',
    machineTypeRequired: 'Pouch Packing Machine & Band Sealer',
    unitsPerParent: 1,
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 600, // ₹6.00
    notes: 'Catering and institutional direct kitchen pack',
  },
  {
    id: 'spec_t1_2kg',
    tierLevel: 1,
    code: 'bag_2kg',
    displayName: '2kg Consumer Bag',
    category: 'primary',
    netCapacityGrams: 2000,
    tareWeightGrams: 22.0,
    materialType: 'Gusseted Laminated Food Bag',
    machineTypeRequired: 'Manual Scale & Continuous Band Sealer',
    unitsPerParent: 1,
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 950, // ₹9.50
    notes: 'Restaurant & hotel bulk kitchen size',
  },
  {
    id: 'spec_t1_5kg',
    tierLevel: 1,
    code: 'bag_5kg',
    displayName: '5kg Consumer Bag',
    category: 'primary',
    netCapacityGrams: 5000,
    tareWeightGrams: 45.0,
    materialType: 'Heavy Laminated Poly Bag with Carry Handle',
    machineTypeRequired: 'Pedal Sealer / Band Sealer',
    unitsPerParent: 1,
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 1800, // ₹18.00
    notes: 'Commercial kitchen and sweetmaker bulk bag',
  },
  {
    id: 'spec_t1_10kg',
    tierLevel: 1,
    code: 'bulk_pp_10kg',
    displayName: '10kg Industrial Bulk PP (Direct Loose Powder)',
    category: 'primary',
    netCapacityGrams: 10000,
    tareWeightGrams: 90.0,
    materialType: 'Food-Grade Woven Polypropylene (PP) with Inner Liner',
    machineTypeRequired: 'Bulk Auger Filler & Stitching Machine',
    unitsPerParent: 1,
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 2500, // ₹25.00
    notes: 'Industrial supply for snack seasoning & namkeen manufacturers',
  },
  {
    id: 'spec_t1_25kg',
    tierLevel: 1,
    code: 'bulk_pp_25kg',
    displayName: '25kg Industrial Bulk PP (Direct Loose Powder)',
    category: 'primary',
    netCapacityGrams: 25000,
    tareWeightGrams: 160.0,
    materialType: 'Heavy Woven Polypropylene (PP) with LDPE Liner',
    machineTypeRequired: 'Heavy Auger Bag Filler & Double Stitcher',
    unitsPerParent: 1,
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 4200, // ₹42.00
    notes: 'Standard industrial manufacturing sack (ITC / Haldiram grade)',
  },
  {
    id: 'spec_t1_50kg',
    tierLevel: 1,
    code: 'bulk_pp_50kg',
    displayName: '50kg Industrial Bulk PP (Direct Loose Powder)',
    category: 'primary',
    netCapacityGrams: 50000,
    tareWeightGrams: 240.0,
    materialType: 'Heavy Duty UV-Stabilized Woven PP with 50-micron Liner',
    machineTypeRequired: 'Industrial Floor Scale & Portable Bag Closer',
    unitsPerParent: 1,
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 6800, // ₹68.00
    notes: 'Full mandi export standard sack',
  },

  // --- TIER 2: SECONDARY BUNDLING (OVER-WRAP) ---
  {
    id: 'spec_t2_10rs_30pcs',
    tierLevel: 2,
    code: 'bundle_10rs_30pcs',
    displayName: '₹10 Pouch Bundle (3 Strips × 10 Pcs = 30 Pcs)',
    category: 'secondary',
    netCapacityGrams: 600, // 30 x 20g = 600g
    tareWeightGrams: 12.0,
    materialType: 'Outer LDPE Shrink Poly Sleeve + Header Punch',
    machineTypeRequired: 'Manual Strip Stitching & Shrink Tunnel',
    unitsPerParent: 30, // 30 pouches per bundle
    isExportCompliant: false,
    isActive: true,
    costPaisePerUnit: 150, // ₹1.50 per bundle packaging material
    notes: '3 hanging strips of 10 pouches each bundled for wholesale distributor delivery',
  },
  {
    id: 'spec_t2_100g_10pcs',
    tierLevel: 2,
    code: 'bundle_100g_10pcs',
    displayName: '100g Pouch Bundle (10 pcs / 1 kg Net)',
    category: 'secondary',
    netCapacityGrams: 1000, // 10 x 100g = 1,000g
    tareWeightGrams: 8.0,
    materialType: 'Heat-Shrink Poly Film / Outer Envelope',
    machineTypeRequired: 'Heat Shrink Chamber / Hand Sealer',
    unitsPerParent: 10,
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 90, // ₹0.90
    notes: 'Secondary 1kg trading bundle for retailers',
  },
  {
    id: 'spec_t2_200g_5pcs',
    tierLevel: 2,
    code: 'bundle_200g_5pcs',
    displayName: '200g Pouch Bundle (5 pcs / 1 kg Net)',
    category: 'secondary',
    netCapacityGrams: 1000, // 5 x 200g = 1,000g
    tareWeightGrams: 8.0,
    materialType: 'Heat-Shrink Poly Film',
    machineTypeRequired: 'Heat Shrink Chamber',
    unitsPerParent: 5,
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 90, // ₹0.90
    notes: 'Secondary 1kg bundle for kirana shelves',
  },
  {
    id: 'spec_t2_500g_2pcs',
    tierLevel: 2,
    code: 'bundle_500g_2pcs',
    displayName: '500g Pouch Bundle (2 pcs / 1 kg Net)',
    category: 'secondary',
    netCapacityGrams: 1000, // 2 x 500g = 1,000g
    tareWeightGrams: 6.0,
    materialType: 'Clear LDPE Over-Wrap Bag',
    machineTypeRequired: 'Manual Taping / Impulse Sealer',
    unitsPerParent: 2,
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 60, // ₹0.60
    notes: 'Twin-pack bundle for wholesale distribution',
  },
  {
    id: 'spec_t2_none_direct',
    tierLevel: 2,
    code: 'none_direct',
    displayName: 'Direct Pass-Through to Tertiary (1kg, 2kg, 5kg, Bulk Sacks)',
    category: 'secondary',
    netCapacityGrams: 0,
    tareWeightGrams: 0,
    materialType: 'None (Directly loaded into tertiary outer shipper)',
    unitsPerParent: 1,
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 0,
    notes: 'No intermediate secondary bundle needed; packs go directly into shipper boxes or bulk sacks',
  },

  // --- TIER 3: TERTIARY SHIPPER PACKAGING (LOGISTICS) ---
  {
    id: 'spec_t3_pp_15kg',
    tierLevel: 3,
    code: 'pp_shipper_15kg',
    displayName: 'Woven PP Outer Bag (15kg Logistics Shipper)',
    category: 'tertiary',
    netCapacityGrams: 15000,
    tareWeightGrams: 110.0,
    materialType: 'High-Density Woven Polypropylene with Stitch Closure',
    machineTypeRequired: 'Portable Bag Closer Stitching Machine',
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 2800, // ₹28.00
    notes: 'Outer logistics shipper for rail parcel and regional road transport',
  },
  {
    id: 'spec_t3_pp_25kg',
    tierLevel: 3,
    code: 'pp_shipper_25kg',
    displayName: 'Woven PP Outer Bag (25kg Logistics Shipper)',
    category: 'tertiary',
    netCapacityGrams: 25000,
    tareWeightGrams: 165.0,
    materialType: 'Reinforced Woven Polypropylene Sacks',
    machineTypeRequired: 'Portable Bag Closer Stitching Machine',
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 3800, // ₹38.00
    notes: 'Standard 25kg outer shipper carrying ~41 secondary bundles of ₹10 sachets or 25 bundles of 100g',
  },
  {
    id: 'spec_t3_pp_50kg',
    tierLevel: 3,
    code: 'pp_shipper_50kg',
    displayName: 'Heavy-Duty Woven PP Bag (50kg Shipper)',
    category: 'tertiary',
    netCapacityGrams: 50000,
    tareWeightGrams: 250.0,
    materialType: 'Heavy Industrial Woven Polypropylene Sack with Tamper Seal',
    machineTypeRequired: 'Heavy Double-Thread Bag Stitcher',
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 5500, // ₹55.00
    notes: '50kg outer shipper for bulk freight and container dispatch',
  },
  {
    id: 'spec_t3_jute_25kg',
    tierLevel: 3,
    code: 'jute_sack_25kg',
    displayName: 'Food-Grade Jute Sacks (25kg Export Quality)',
    category: 'tertiary',
    netCapacityGrams: 25000,
    tareWeightGrams: 480.0,
    materialType: 'Hydrocarbon-Free Food-Grade Natural Jute / Burlap with Polyliner',
    machineTypeRequired: 'Jute Needle Stitching Machine',
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 7500, // ₹75.00
    notes: 'Breathable, eco-friendly export sacks compliant with European & US FDA food import norms',
  },
  {
    id: 'spec_t3_box_20kg',
    tierLevel: 3,
    code: 'carton_20kg',
    displayName: '5-Ply Corrugated Cartons (20kg Master Shipper Box)',
    category: 'tertiary',
    netCapacityGrams: 20000,
    tareWeightGrams: 720.0,
    materialType: 'Virgin Kraft 5-Ply Corrugated Box with 150 GSM Liners (ECT 44)',
    machineTypeRequired: 'Semi-Automatic Flap Taper & Strapping Machine',
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 6500, // ₹65.00
    notes: 'Ideal for 20 × 1kg bundles (200 × 100g pouches) with high stacking compression strength',
  },
  {
    id: 'spec_t3_box_25kg',
    tierLevel: 3,
    code: 'carton_25kg',
    displayName: '5-Ply Corrugated Cartons (25kg Master Shipper Box)',
    category: 'tertiary',
    netCapacityGrams: 25000,
    tareWeightGrams: 890.0,
    materialType: 'Heavy-Duty 5-Ply Corrugated Box (Bursting Strength 16 kg/cm²)',
    machineTypeRequired: 'Carton Sealer & Poly Strapping Unit',
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 8200, // ₹82.00
    notes: 'Master export shipper box designed for 20ft/40ft shipping container stuffing (FCL palletized)',
  },
  {
    id: 'spec_t3_mixed_assorted',
    tierLevel: 3,
    code: 'shipper_mixed_assorted',
    displayName: 'Institutional Multi-SKU Assorted Shipper Box',
    category: 'tertiary',
    netCapacityGrams: 20000,
    tareWeightGrams: 850.0,
    materialType: 'Heavy 5-Ply Corrugated Box with Custom Internal Dividers',
    machineTypeRequired: 'Manual Staging & Industrial Tape Sealing',
    isExportCompliant: true,
    isActive: true,
    costPaisePerUnit: 9000, // ₹90.00
    notes: 'Custom assorted carton containing mixed spices (e.g., 5kg Haldi + 5kg Mirch + 5kg Dhana + 5kg Jeera) for luxury hotels & institutions',
  },
];

export const initialMandiSpotRates: MandiSpotRateRecord[] = [
  {
    id: 'mandi_gnt_01',
    date: '2026-10-13',
    spiceName: 'Chilli',
    mandiLocation: 'Guntur Mandi',
    grade: 'Teja S17 Stemless (Premium Export Grade)',
    spotRatePerKgRupees: 220,
    dailyChangeRupees: 3,
    arrivalBags: 45000,
    reportedBy: 'Jayesh Patel (Procurement)',
    notes: 'Strong demand from overseas export houses; arrivals steady',
  },
  {
    id: 'mandi_gdl_01',
    date: '2026-10-13',
    spiceName: 'Chilli',
    mandiLocation: 'Gondal Yard',
    grade: 'Reshamapatti Clean Medium',
    spotRatePerKgRupees: 215,
    dailyChangeRupees: -2,
    arrivalBags: 18000,
    reportedBy: 'Jayesh Patel (Procurement)',
    notes: 'Good domestic supply from Saurashtra region',
  },
  {
    id: 'mandi_sng_01',
    date: '2026-10-13',
    spiceName: 'Turmeric',
    mandiLocation: 'Sangli Yard',
    grade: 'Rajapore Whole Fingers (High Curcumin >3.8%)',
    spotRatePerKgRupees: 165,
    dailyChangeRupees: 4,
    arrivalBags: 12000,
    reportedBy: 'Jayesh Patel (Procurement)',
    notes: 'Curcumin-rich crop holding firm prices',
  },
  {
    id: 'mandi_nzb_01',
    date: '2026-10-13',
    spiceName: 'Turmeric',
    mandiLocation: 'Nizamabad Yard',
    grade: 'Standard Commercial Grade (Curcumin 2.8%)',
    spotRatePerKgRupees: 160,
    dailyChangeRupees: 1,
    arrivalBags: 22000,
    reportedBy: 'Jayesh Patel (Procurement)',
    notes: 'Solid base material for budget retail sachet blends',
  },
  {
    id: 'mandi_ram_01',
    date: '2026-10-13',
    spiceName: 'Coriander',
    mandiLocation: 'Ramganj Mandi',
    grade: 'Badami Whole Coriander (Agmark Quality)',
    spotRatePerKgRupees: 118,
    dailyChangeRupees: -1,
    arrivalBags: 32000,
    reportedBy: 'Jayesh Patel (Procurement)',
    notes: 'Heavy arrivals from Rajasthan belt; pricing favorable for bulk procurement',
  },
  {
    id: 'mandi_unj_01',
    date: '2026-10-13',
    spiceName: 'Cumin',
    mandiLocation: 'Unjha Mandi',
    grade: 'Machine Clean Jeera (99.5% Purity)',
    spotRatePerKgRupees: 285,
    dailyChangeRupees: 5,
    arrivalBags: 28000,
    reportedBy: 'Jayesh Patel (Procurement)',
    notes: 'Benchmark APMC rate; high European inquiry',
  },
];

export const initialDailyTodos: DailyTodoItem[] = [
  // Super Admin
  {
    id: 'todo_adm_01',
    role: 'owner',
    title: 'Review executive P&L and monthly EBITDA margins',
    description: 'Check September vs October revenue growth and per-kg OPEX realization',
    priority: 'high',
    dueDate: '2026-10-13',
    isCompleted: false,
    actionModule: 'dashboard',
  },
  {
    id: 'todo_adm_02',
    role: 'owner',
    title: 'Approve new 35kg Export Jute Sack packaging spec',
    description: 'Requested by Gulf buyers for Ramadan institutional shipments',
    priority: 'normal',
    dueDate: '2026-10-14',
    isCompleted: false,
    actionModule: 'inventory',
  },
  // Sales
  {
    id: 'todo_sls_01',
    role: 'salesman',
    title: 'Follow up on 2-Container Export Order for Dubai Buyer',
    description: 'Verify 30% advance deposit with Finance before releasing production job',
    priority: 'urgent',
    dueDate: '2026-10-13',
    isCompleted: false,
    actionModule: 'invoices',
  },
  {
    id: 'todo_sls_02',
    role: 'salesman',
    title: 'Calculate 60/40 blended quote for Avenue Supermarts',
    description: 'Blend existing Sangli stock with current Gondal spot rates',
    priority: 'high',
    dueDate: '2026-10-13',
    isCompleted: false,
    actionModule: 'invoices',
  },
  // Procurement
  {
    id: 'todo_prc_01',
    role: 'procurement',
    title: 'Record morning Mandi spot rates from Unjha & Guntur yards',
    description: 'Input spot rates into ERP to calibrate blended quoting costs',
    priority: 'urgent',
    dueDate: '2026-10-13',
    isCompleted: false,
    actionModule: 'pos',
  },
  {
    id: 'todo_prc_02',
    role: 'procurement',
    title: 'Issue Spot PO for 14,400 kg deficit whole spices',
    description: 'Cover container export shortfall with Shree Balaji Spice Mills',
    priority: 'high',
    dueDate: '2026-10-14',
    isCompleted: false,
    actionModule: 'pos',
  },
  // Store Keeper
  {
    id: 'todo_str_01',
    role: 'store_keeper',
    title: 'Inward GRN for GNT-TEJA-332 whole chilli arrival',
    description: 'Inspect moisture (<10%) and issue GRN entry to inventory ledger',
    priority: 'urgent',
    dueDate: '2026-10-13',
    isCompleted: false,
    actionModule: 'inventory',
  },
  {
    id: 'todo_str_02',
    role: 'store_keeper',
    title: 'Stage 25kg PP bags for dispatch vehicle loading',
    description: 'Generate gate pass for Sister Firm Surat CFA truck',
    priority: 'high',
    dueDate: '2026-10-13',
    isCompleted: false,
    actionModule: 'inventory',
  },
  // Factory Floor Supervisor
  {
    id: 'todo_flr_01',
    role: 'supervisor',
    title: 'Fulfill JOB-2026-10-001 Tier 1 Turmeric pouch quota (2,500 units)',
    description: 'Run morning shift on Auger Filler #1; target fill 100g ± 0.5g',
    priority: 'urgent',
    dueDate: '2026-10-13',
    isCompleted: false,
    actionModule: 'batches',
  },
  {
    id: 'todo_flr_02',
    role: 'supervisor',
    title: 'Submit Day-End Shift Report & Film scrap wastage log',
    description: 'Record morning + evening shift units packed and operator hours',
    priority: 'high',
    dueDate: '2026-10-13',
    isCompleted: false,
    actionModule: 'batches',
  },
  // Finance & Accounts
  {
    id: 'todo_fnc_01',
    role: 'accountant',
    title: 'Reconcile advance payment UTR for Dubai export shipment',
    description: 'Confirm $7,500 inward remittance credit with HDFC Bank',
    priority: 'urgent',
    dueDate: '2026-10-13',
    isCompleted: false,
    actionModule: 'invoices',
  },
  {
    id: 'todo_fnc_02',
    role: 'accountant',
    title: 'Verify GSTR-2B Claimable vs Ineligible ITC for machinery bills',
    description: 'Ensure full 18% credit booked for Rajkot Packmach spare parts',
    priority: 'normal',
    dueDate: '2026-10-14',
    isCompleted: false,
    actionModule: 'expenses',
  },
  // Marketing & Ads
  {
    id: 'todo_mkt_01',
    role: 'marketing',
    title: 'Review ROAS on Meta & Blinkit Festive Quick-Commerce Ads',
    description: 'Check cost per conversion for ₹10 trial packs and 500g pouches',
    priority: 'high',
    dueDate: '2026-10-13',
    isCompleted: false,
    actionModule: 'advertising',
  },
  {
    id: 'todo_mkt_02',
    role: 'marketing',
    title: 'Audit Amazon & Blinkit marketplace settlement fees & TCS deductions',
    description: 'Bridge referral fees and reverse logistics RTO with Finance',
    priority: 'normal',
    dueDate: '2026-10-14',
    isCompleted: false,
    actionModule: 'advertising',
  },
];

export const initialDayEndReports: DayEndReport[] = [
  {
    id: 'rpt_de_01',
    date: '2026-10-12',
    shift: 'general',
    role: 'supervisor',
    submittedBy: 'Pravin Solanki (Plant Supervisor)',
    primaryMetricLabel: 'Total Kilograms Packed Today',
    primaryMetricValue: '4,410 kg (9,000 pouches + 50 bulk sacks)',
    summaryNotes: 'Auger Filler #1 operated without breakdown for 7.5 hours. Completed 100g Haldi quota and staged 50 sacks of 50kg Coriander.',
    blockersOrWastage: 'Spill scrap: 3.4 kg. Film reject: 14 pouches during morning tension calibration.',
    tasksCompletedCount: 4,
    timestamp: '2026-10-12T18:30:00.000Z',
  },
  {
    id: 'rpt_de_02',
    date: '2026-10-12',
    shift: 'general',
    role: 'store_keeper',
    submittedBy: 'Vikram Desai (Store Keeper)',
    primaryMetricLabel: 'Inward RM Received & Staged',
    primaryMetricValue: '15,000 kg whole spices inward; 2 delivery trucks cleared',
    summaryNotes: 'Completed GRN for Ramganj coriander shipment. Staged 25kg PP outer shippers for morning distribution to Ahmedabad depot.',
    blockersOrWastage: 'Zero transit damage on inward sacks.',
    tasksCompletedCount: 3,
    timestamp: '2026-10-12T19:00:00.000Z',
  },
  {
    id: 'rpt_de_03',
    date: '2026-10-12',
    shift: 'general',
    role: 'accountant',
    submittedBy: 'Ramesh Patel (Head of Finance)',
    primaryMetricLabel: 'Daily Collections & Invoices Issued',
    primaryMetricValue: '₹22,94,631.00 invoiced; ₹20,87,500.00 collected',
    summaryNotes: 'Export commercial invoice cleared under LUT Rule 96A. Verified 100% advance receipt from Al-Madina Spice Trading LLC.',
    blockersOrWastage: 'None. All bank accounts reconciled.',
    tasksCompletedCount: 5,
    timestamp: '2026-10-12T19:15:00.000Z',
  },
];


// In-Memory & LocalStorage wrapper
class StorageEngine {
  private get<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item);
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      if (typeof window !== 'undefined' && key === STORAGE_KEYS.OUTBOX) {
        window.dispatchEvent(new CustomEvent('adalaj-outbox-updated'));
      }
    } catch (e) {
      console.warn('Storage set failed:', e);
    }
  }

  // Active Role
  getActiveRole(): UserRole {
    return this.get<UserRole>(STORAGE_KEYS.ACTIVE_ROLE, 'owner');
  }

  setActiveRole(role: UserRole): void {
    this.set(STORAGE_KEYS.ACTIVE_ROLE, role);
  }

  // Entity
  getEntity(): BusinessEntity {
    return this.get<BusinessEntity>(STORAGE_KEYS.ENTITY, initialEntity);
  }

  updateEntity(entity: BusinessEntity): void {
    this.set(STORAGE_KEYS.ENTITY, entity);
  }

  // Items
  getItems(): InventoryItem[] {
    return this.get<InventoryItem[]>(STORAGE_KEYS.ITEMS, initialItems);
  }

  saveItems(items: InventoryItem[]): void {
    this.set(STORAGE_KEYS.ITEMS, items);
  }

  addItem(item: InventoryItem): void {
    const list = this.getItems();
    this.set(STORAGE_KEYS.ITEMS, [item, ...list]);
    this.logOutbox('create', 'item', `Added item ${item.name} (${item.sku})`);
  }

  updateItem(item: InventoryItem): void {
    const list = this.getItems().map((i) => (i.id === item.id ? item : i));
    this.set(STORAGE_KEYS.ITEMS, list);
    this.logOutbox('update', 'item', `Updated item ${item.name} (${item.sku})`);
  }

  deleteItem(id: string): void {
    const list = this.getItems().filter((i) => i.id !== id);
    this.set(STORAGE_KEYS.ITEMS, list);
    this.logOutbox('void', 'item', `Deleted item ${id}`);
  }

  // Lots
  getLots(): StockLot[] {
    return this.get<StockLot[]>(STORAGE_KEYS.LOTS, initialLots);
  }

  saveLots(lots: StockLot[]): void {
    this.set(STORAGE_KEYS.LOTS, lots);
  }

  addLot(lot: StockLot): void {
    const list = this.getLots();
    this.set(STORAGE_KEYS.LOTS, [lot, ...list]);
    this.logOutbox('create', 'lot', `Inward Lot ${lot.lotNo} for ${lot.itemName}`);
  }

  updateLot(lot: StockLot): void {
    const list = this.getLots().map((l) => (l.id === lot.id ? lot : l));
    this.set(STORAGE_KEYS.LOTS, list);
    this.logOutbox('update', 'lot', `Updated Lot ${lot.lotNo}`);
  }

  deleteLot(id: string): void {
    const list = this.getLots().filter((l) => l.id !== id);
    this.set(STORAGE_KEYS.LOTS, list);
    this.logOutbox('void', 'lot', `Deleted Lot ${id}`);
  }

  // Movements
  getMovements(): StockMovement[] {
    return this.get<StockMovement[]>(STORAGE_KEYS.MOVEMENTS, initialMovements);
  }

  saveMovements(movements: StockMovement[]): void {
    this.set(STORAGE_KEYS.MOVEMENTS, movements);
  }

  addMovement(mov: StockMovement): void {
    const list = this.getMovements();
    const updated = [mov, ...list];
    this.set(STORAGE_KEYS.MOVEMENTS, updated);
    this.logOutbox('create', 'movement', `${mov.type} of ${mov.itemName} (${mov.qtyBase})`);
  }

  deleteMovement(id: string): void {
    const list = this.getMovements().filter((m) => m.id !== id);
    this.set(STORAGE_KEYS.MOVEMENTS, list);
    this.logOutbox('void', 'movement', `Deleted stock movement ${id}`);
  }

  // Recipes
  getRecipes(): Recipe[] {
    return this.get<Recipe[]>(STORAGE_KEYS.RECIPES, initialRecipes);
  }

  saveRecipes(recipes: Recipe[]): void {
    this.set(STORAGE_KEYS.RECIPES, recipes);
  }

  addRecipe(recipe: Recipe): void {
    const list = this.getRecipes();
    this.set(STORAGE_KEYS.RECIPES, [recipe, ...list]);
    this.logOutbox('create', 'recipe', `Added BOM/Recipe: ${recipe.finishedItemName}`);
  }

  updateRecipe(recipe: Recipe): void {
    const list = this.getRecipes().map((r) => (r.id === recipe.id ? recipe : r));
    this.set(STORAGE_KEYS.RECIPES, list);
    this.logOutbox('update', 'recipe', `Updated Recipe: ${recipe.finishedItemName}`);
  }

  deleteRecipe(id: string): void {
    const list = this.getRecipes().filter((r) => r.id !== id);
    this.set(STORAGE_KEYS.RECIPES, list);
    this.logOutbox('void', 'recipe', `Deleted Recipe ${id}`);
  }

  // Batches
  getBatches(): PackingBatch[] {
    return this.get<PackingBatch[]>(STORAGE_KEYS.BATCHES, initialBatches);
  }

  saveBatches(batches: PackingBatch[]): void {
    this.set(STORAGE_KEYS.BATCHES, batches);
  }

  addBatch(batch: PackingBatch): void {
    const list = this.getBatches();
    this.set(STORAGE_KEYS.BATCHES, [batch, ...list]);
    this.logOutbox('create', 'batch', `Batch ${batch.batchNo} created`);
  }

  updateBatch(batch: PackingBatch): void {
    const list = this.getBatches().map((b) => (b.id === batch.id ? batch : b));
    this.set(STORAGE_KEYS.BATCHES, list);
    this.logOutbox('update', 'batch', `Batch ${batch.batchNo} updated (${batch.status})`);
  }

  deleteBatch(id: string): void {
    const list = this.getBatches().filter((b) => b.id !== id);
    this.set(STORAGE_KEYS.BATCHES, list);
    this.logOutbox('void', 'batch', `Deleted/Voided batch ${id}`);
  }

  // Parties
  getParties(): Party[] {
    return this.get<Party[]>(STORAGE_KEYS.PARTIES, initialParties);
  }

  saveParties(parties: Party[]): void {
    this.set(STORAGE_KEYS.PARTIES, parties);
  }

  addParty(party: Party): void {
    const list = this.getParties();
    this.set(STORAGE_KEYS.PARTIES, [party, ...list]);
    this.logOutbox('create', 'party', `Added party ${party.name}`);
  }

  updateParty(party: Party): void {
    const list = this.getParties().map((p) => (p.id === party.id ? party : p));
    this.set(STORAGE_KEYS.PARTIES, list);
    this.logOutbox('update', 'party', `Updated party ${party.name}`);
  }

  deleteParty(id: string): void {
    const list = this.getParties().filter((p) => p.id !== id);
    this.set(STORAGE_KEYS.PARTIES, list);
    this.logOutbox('void', 'party', `Deleted party ${id}`);
  }

  // Accounts
  getAccounts(): Account[] {
    return this.get<Account[]>(STORAGE_KEYS.ACCOUNTS, initialAccounts);
  }

  saveAccounts(accounts: Account[]): void {
    this.set(STORAGE_KEYS.ACCOUNTS, accounts);
  }

  addAccount(account: Account): void {
    const list = this.getAccounts();
    this.set(STORAGE_KEYS.ACCOUNTS, [account, ...list]);
  }

  updateAccount(account: Account): void {
    const list = this.getAccounts().map((a) => (a.id === account.id ? account : a));
    this.set(STORAGE_KEYS.ACCOUNTS, list);
  }

  deleteAccount(id: string): void {
    const list = this.getAccounts().filter((a) => a.id !== id);
    this.set(STORAGE_KEYS.ACCOUNTS, list);
  }

  // Transactions
  getTransactions(): Transaction[] {
    return this.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, initialTransactions);
  }

  addTransaction(txn: Transaction): void {
    const list = this.getTransactions();
    this.set(STORAGE_KEYS.TRANSACTIONS, [txn, ...list]);

    // Update account balance
    const accounts = this.getAccounts().map((acc) => {
      if (acc.id === txn.accountId) {
        const delta = txn.direction === 'in' ? txn.amountPaise : -txn.amountPaise;
        return { ...acc, balancePaise: acc.balancePaise + delta };
      }
      if (txn.toAccountId && acc.id === txn.toAccountId) {
        return { ...acc, balancePaise: acc.balancePaise + txn.amountPaise };
      }
      return acc;
    });
    this.saveAccounts(accounts);

    this.logOutbox('create', 'transaction', `Txn ${txn.txnNo} ${txn.direction} ₹${txn.amountPaise / 100}`);
  }

  updateTransaction(txn: Transaction): void {
    const list = this.getTransactions().map((t) => (t.id === txn.id ? txn : t));
    this.set(STORAGE_KEYS.TRANSACTIONS, list);
    this.logOutbox('update', 'transaction', `Updated Txn ${txn.txnNo}`);
  }

  deleteTransaction(id: string): void {
    const list = this.getTransactions().filter((t) => t.id !== id);
    this.set(STORAGE_KEYS.TRANSACTIONS, list);
    this.logOutbox('void', 'transaction', `Deleted Txn ${id}`);
  }

  // Bills
  getBills(): Bill[] {
    return this.get<Bill[]>(STORAGE_KEYS.BILLS, initialBills);
  }

  saveBills(bills: Bill[]): void {
    this.set(STORAGE_KEYS.BILLS, bills);
  }

  addBill(bill: Bill): void {
    const list = this.getBills();
    this.set(STORAGE_KEYS.BILLS, [bill, ...list]);
    this.logOutbox('create', 'bill', `Added bill ${bill.billNo}`);
  }

  updateBill(bill: Bill): void {
    const list = this.getBills().map((b) => (b.id === bill.id ? bill : b));
    this.set(STORAGE_KEYS.BILLS, list);
    this.logOutbox('update', 'bill', `Updated bill ${bill.billNo}`);
  }

  deleteBill(id: string): void {
    const list = this.getBills().filter((b) => b.id !== id);
    this.set(STORAGE_KEYS.BILLS, list);
    this.logOutbox('void', 'bill', `Deleted bill ${id}`);
  }

  // Assets
  getAssets(): MachineAsset[] {
    return this.get<MachineAsset[]>(STORAGE_KEYS.ASSETS, initialAssets);
  }

  saveAssets(assets: MachineAsset[]): void {
    this.set(STORAGE_KEYS.ASSETS, assets);
  }

  addAsset(asset: MachineAsset): void {
    const list = this.getAssets();
    this.set(STORAGE_KEYS.ASSETS, [asset, ...list]);
  }

  updateAsset(asset: MachineAsset): void {
    const list = this.getAssets().map((a) => (a.id === asset.id ? asset : a));
    this.set(STORAGE_KEYS.ASSETS, list);
  }

  deleteAsset(id: string): void {
    const list = this.getAssets().filter((a) => a.id !== id);
    this.set(STORAGE_KEYS.ASSETS, list);
  }

  // Employees
  getEmployees(): Employee[] {
    return this.get<Employee[]>(STORAGE_KEYS.EMPLOYEES, initialEmployees);
  }

  saveEmployees(emps: Employee[]): void {
    this.set(STORAGE_KEYS.EMPLOYEES, emps);
  }

  addEmployee(emp: Employee): void {
    const list = this.getEmployees();
    this.set(STORAGE_KEYS.EMPLOYEES, [emp, ...list]);
  }

  updateEmployee(emp: Employee): void {
    const list = this.getEmployees().map((e) => (e.id === emp.id ? emp : e));
    this.set(STORAGE_KEYS.EMPLOYEES, list);
  }

  deleteEmployee(id: string): void {
    const list = this.getEmployees().filter((e) => e.id !== id);
    this.set(STORAGE_KEYS.EMPLOYEES, list);
  }

  // Loans
  getLoans(): Loan[] {
    return this.get<Loan[]>(STORAGE_KEYS.LOANS, initialLoans);
  }

  saveLoans(loans: Loan[]): void {
    this.set(STORAGE_KEYS.LOANS, loans);
  }

  addLoan(loan: Loan): void {
    const list = this.getLoans();
    this.set(STORAGE_KEYS.LOANS, [loan, ...list]);
  }

  updateLoan(loan: Loan): void {
    const list = this.getLoans().map((l) => (l.id === loan.id ? loan : l));
    this.set(STORAGE_KEYS.LOANS, list);
  }

  deleteLoan(id: string): void {
    const list = this.getLoans().filter((l) => l.id !== id);
    this.set(STORAGE_KEYS.LOANS, list);
  }

  // Outbox for Offline
  getOutbox(): OutboxItem[] {
    return this.get<OutboxItem[]>(STORAGE_KEYS.OUTBOX, []);
  }

  logOutbox(action: OutboxItem['action'], entity: OutboxItem['entity'], payloadSummary: string): void {
    const outbox = this.getOutbox();
    const newItem: OutboxItem = {
      id: `out_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      action,
      entity,
      payloadSummary,
      synced: false,
    };
    this.set(STORAGE_KEYS.OUTBOX, [newItem, ...outbox]);
  }

  clearSyncedOutbox(): void {
    const pending = this.getOutbox().filter((i) => !i.synced);
    this.set(STORAGE_KEYS.OUTBOX, pending);
  }

  markAllSynced(): void {
    const updated = this.getOutbox().map((i) => ({ ...i, synced: true }));
    this.set(STORAGE_KEYS.OUTBOX, updated);
  }

  // Advertising Campaigns (Section 13.3)
  getCampaigns(): AdvertisingCampaign[] {
    return this.get<AdvertisingCampaign[]>(STORAGE_KEYS.CAMPAIGNS, initialCampaigns);
  }

  saveCampaigns(campaigns: AdvertisingCampaign[]): void {
    this.set(STORAGE_KEYS.CAMPAIGNS, campaigns);
  }

  addCampaign(campaign: AdvertisingCampaign): void {
    const list = this.getCampaigns();
    this.set(STORAGE_KEYS.CAMPAIGNS, [campaign, ...list]);
    this.logOutbox('create', 'transaction', `Added Campaign ${campaign.name} (${campaign.platform})`);
  }

  updateCampaign(campaign: AdvertisingCampaign): void {
    const list = this.getCampaigns().map((c) => (c.id === campaign.id ? campaign : c));
    this.set(STORAGE_KEYS.CAMPAIGNS, list);
    this.logOutbox('update', 'transaction', `Updated Campaign ${campaign.name}`);
  }

  deleteCampaign(id: string): void {
    const list = this.getCampaigns().filter((c) => c.id !== id);
    this.set(STORAGE_KEYS.CAMPAIGNS, list);
    this.logOutbox('void', 'transaction', `Archived Campaign ${id}`);
  }

  // Marketplace Settlements (Section 13.3)
  getSettlements(): MarketplaceSettlement[] {
    return this.get<MarketplaceSettlement[]>(STORAGE_KEYS.SETTLEMENTS, initialSettlements);
  }

  saveSettlements(settlements: MarketplaceSettlement[]): void {
    this.set(STORAGE_KEYS.SETTLEMENTS, settlements);
  }

  addSettlement(settlement: MarketplaceSettlement): void {
    const list = this.getSettlements();
    this.set(STORAGE_KEYS.SETTLEMENTS, [settlement, ...list]);
    this.logOutbox('create', 'transaction', `Reconciled Settlement ${settlement.marketplace} ${settlement.statementPeriod}`);
  }

  // Licences & Compliance Vault (Section 13.4)
  getLicences(): LicenceCompliance[] {
    return this.get<LicenceCompliance[]>(STORAGE_KEYS.LICENCES, initialLicences);
  }

  saveLicences(licences: LicenceCompliance[]): void {
    this.set(STORAGE_KEYS.LICENCES, licences);
  }

  addLicence(licence: LicenceCompliance): void {
    const list = this.getLicences();
    this.set(STORAGE_KEYS.LICENCES, [licence, ...list]);
    this.logOutbox('create', 'asset', `Added Licence ${licence.name} (${licence.registrationNo})`);
  }

  updateLicence(licence: LicenceCompliance): void {
    const list = this.getLicences().map((l) => (l.id === licence.id ? licence : l));
    this.set(STORAGE_KEYS.LICENCES, list);
    this.logOutbox('update', 'asset', `Updated Licence ${licence.name}`);
  }

  deleteLicence(id: string): void {
    const list = this.getLicences().filter((l) => l.id !== id);
    this.set(STORAGE_KEYS.LICENCES, list);
    this.logOutbox('void', 'asset', `Archived Licence ${id}`);
  }

  recordLicenceRenewal(id: string, feePaise: number, notes: string): void {
    const list = this.getLicences().map((l) => {
      if (l.id === id) {
        const history = l.history || [];
        const newEvent: LicenceEvent = {
          date: new Date().toISOString().split('T')[0],
          action: 'Renewed',
          feePaise,
          reference: notes || 'Standard renewal cycle',
        };
        return {
          ...l,
          status: 'active' as const,
          lastRenewalDate: newEvent.date,
          history: [newEvent, ...history],
        };
      }
      return l;
    });
    this.set(STORAGE_KEYS.LICENCES, list);
    this.logOutbox('update', 'asset', `Renewed Licence ${id}`);
  }

  // Authentication & RBAC Session (Strict No-Auto-Login)
  getAuthUser(): AuthUser | null {
    try {
      const sessionItem = sessionStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (sessionItem) {
        return JSON.parse(sessionItem);
      }
    } catch {
      // ignore
    }
    return null;
  }

  setAuthUser(user: AuthUser | null): void {
    try {
      if (user) {
        sessionStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
        this.setActiveRole(user.role);
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.AUTH_USER);
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      }
    } catch {
      // fallback
    }
  }

  login(email: string, pass: string): { success: boolean; user?: AuthUser; message?: string } {
    const trimmedEmail = email.trim().toLowerCase();
    const cred = PREDEFINED_USERS.find(
      (c) => c.email.toLowerCase() === trimmedEmail && c.password === pass.trim()
    );

    if (cred) {
      const updatedUser: AuthUser = {
        ...cred.user,
        lastLoginAt: new Date().toISOString(),
      };
      this.setAuthUser(updatedUser);
      return { success: true, user: updatedUser };
    }

    return {
      success: false,
      message: 'Invalid email or password. Access denied.',
    };
  }

  logout(): void {
    this.setAuthUser(null);
  }

  // Purchase Orders & Fulfillment
  getPurchaseOrders(): PurchaseOrder[] {
    return this.get<PurchaseOrder[]>(STORAGE_KEYS.PURCHASE_ORDERS, initialPurchaseOrders);
  }

  savePurchaseOrders(pos: PurchaseOrder[]): void {
    this.set(STORAGE_KEYS.PURCHASE_ORDERS, pos);
  }

  addPurchaseOrder(po: PurchaseOrder): void {
    const list = this.getPurchaseOrders();
    this.set(STORAGE_KEYS.PURCHASE_ORDERS, [po, ...list]);

    // Posting Service Invariant: Post initial advance payment to General Ledger if paid
    if (po.payments && po.payments.length > 0) {
      po.payments.forEach((payment) => {
        const txn: Transaction = {
          id: payment.id,
          txnNo: payment.utrOrRef ? `TXN-${payment.utrOrRef}` : `TXN-ADV-${Date.now()}`,
          date: payment.date,
          direction: 'out',
          accountId: payment.accountId,
          accountName: payment.accountName,
          partyId: po.partyId,
          partyName: po.partyName,
          amountPaise: payment.amountPaise,
          headCategory: this.mapCategoryToExpenseHead(po.purchaseCategory),
          mode: this.mapPaymentMode(payment.paymentMode),
          reference: `PO: ${po.poNumber} | Ref: ${payment.utrOrRef}`,
          status: 'posted',
          notes: payment.notes || `Advance booking token on PO ${po.poNumber}`,
        };
        this.addTransaction(txn);
      });
    }

    this.logOutbox('create', 'bill', `Created PO ${po.poNumber} for ${po.partyName}`);
  }

  updatePurchaseOrder(po: PurchaseOrder): void {
    const list = this.getPurchaseOrders().map((p) => (p.id === po.id ? po : p));
    this.set(STORAGE_KEYS.PURCHASE_ORDERS, list);
    this.logOutbox('update', 'bill', `Updated PO ${po.poNumber}`);
  }

  // Posting Service Helper: Category mapping
  private mapCategoryToExpenseHead(cat: PurchaseCategory): string {
    switch (cat) {
      case 'machinery':
        return 'Plant Machinery & Capex';
      case 'raw_material':
        return 'Raw Material Purchase';
      case 'packing_material':
        return 'Packaging Material Purchase';
      case 'rent':
        return 'Factory Shed Rent';
      case 'electricity':
        return 'Electricity & Power';
      case 'ca_legal':
        return 'CA & Statutory Audit Retainer';
      case 'stationery':
        return 'Office & Packaging Consumables';
      case 'licences':
        return 'Licence & Regulatory Fees';
      default:
        return 'General Procurement';
    }
  }

  // Posting Service Helper: Payment Mode mapping
  private mapPaymentMode(mode: POPartPayment['paymentMode']): Transaction['mode'] {
    switch (mode) {
      case 'bank_neft_rtgs':
        return 'HDFC NetBanking';
      case 'upi':
        return 'UPI';
      case 'cheque':
        return 'Cheque';
      case 'cash':
        return 'Cash';
      default:
        return 'HDFC NetBanking';
    }
  }

  addPOPartPayment(poId: string, payment: POPartPayment): void {
    const po = this.getPurchaseOrders().find((p) => p.id === poId);
    if (!po) return;

    // 1. Posting Service Invariant: Post double-entry cash/bank disbursement Transaction
    const txn: Transaction = {
      id: payment.id,
      txnNo: payment.utrOrRef ? `TXN-${payment.utrOrRef}` : `TXN-PO-${Date.now()}`,
      date: payment.date,
      direction: 'out',
      accountId: payment.accountId,
      accountName: payment.accountName,
      partyId: po.partyId,
      partyName: po.partyName,
      amountPaise: payment.amountPaise,
      headCategory: this.mapCategoryToExpenseHead(po.purchaseCategory),
      mode: this.mapPaymentMode(payment.paymentMode),
      reference: `PO: ${po.poNumber} | Ref: ${payment.utrOrRef}`,
      status: 'posted',
      notes: payment.notes || `${payment.milestoneType.replace('_', ' ')} against PO ${po.poNumber}`,
    };
    this.addTransaction(txn);

    // 2. Update PO record & milestone balances
    const pos = this.getPurchaseOrders().map((p) => {
      if (p.id === poId) {
        const existingPayments = p.payments || [];
        const updatedPayments = [...existingPayments, payment];
        const totalPaid = updatedPayments.reduce((acc, pay) => acc + pay.amountPaise, 0);
        const advancePaid = updatedPayments
          .filter((pay) => pay.milestoneType === 'advance')
          .reduce((acc, pay) => acc + pay.amountPaise, 0);
        const balanceDue = Math.max(0, p.totalAmountPaise - totalPaid);

        return {
          ...p,
          payments: updatedPayments,
          totalPaidPaise: totalPaid,
          advancePaidPaise: advancePaid,
          balanceDuePaise: balanceDue,
          status:
            balanceDue === 0 && p.status !== 'cancelled'
              ? ('fulfilled' as const)
              : totalPaid > 0
              ? ('partially_fulfilled' as const)
              : p.status,
        };
      }
      return p;
    });

    this.savePurchaseOrders(pos);
    this.logOutbox('create', 'transaction', `Posted ${payment.milestoneType} payment ₹${payment.amountPaise / 100} on PO ${po.poNumber}`);
  }

  updatePOFulfillmentStatus(
    poId: string,
    status: POFulfillmentStatus,
    notes?: string,
    grn?: string
  ): void {
    const po = this.getPurchaseOrders().find((p) => p.id === poId);
    if (!po) return;

    const isNewlyReceived = (status === 'fulfilled' || status === 'partially_fulfilled') && po.status !== 'fulfilled';

    // Posting Service Invariant: Post inward StockMovement & increment inventory on receipt
    if (isNewlyReceived && (po.purchaseCategory === 'raw_material' || po.purchaseCategory === 'packing_material' || po.purchaseCategory === 'stationery')) {
      const movements = this.getMovements();
      const items = this.getItems();
      const lots = this.getLots();
      const newMovements: StockMovement[] = [];
      const newLots: StockLot[] = [];

      po.items.forEach((item, index) => {
        const inwardQtyBase = po.purchaseCategory === 'raw_material' ? Math.round(item.qty * 1000) : item.qty;
        const grnRef = grn || po.grnNumber || `GRN-${Date.now().toString().slice(-6)}`;

        // 1. Post inward StockMovement
        const movement: StockMovement = {
          id: `mov_rec_${Date.now()}_${index}`,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toTimeString().slice(0, 5),
          itemId: item.id,
          itemName: item.description,
          locationId: 'loc_adalaj_main',
          locationName: 'Adalaj Central Warehouse',
          qtyBase: inwardQtyBase,
          type: 'receipt',
          reference: `${po.poNumber} / ${grnRef}`,
          unitCostPaise: Math.round(item.unitPricePaise),
          notes: `Goods received against PO ${po.poNumber} from ${po.partyName}. ${notes || 'QC cleared'}`,
        };
        newMovements.push(movement);

        // 2. Increment item inventory currentStockBase
        const matchedItem = items.find((it) => it.id === item.id || it.name.toLowerCase().includes(item.description.toLowerCase().slice(0, 8)));
        if (matchedItem) {
          matchedItem.currentStockBase += inwardQtyBase;
        }

        // 3. If raw material, create new traceable lot
        if (po.purchaseCategory === 'raw_material') {
          const lot: StockLot = {
            id: `lot_po_${Date.now()}_${index}`,
            lotNo: `LOT-${new Date().toISOString().slice(2, 7).replace('-', '')}-${String(lots.length + 1).padStart(3, '0')}`,
            itemId: matchedItem ? matchedItem.id : item.id,
            itemName: item.description,
            supplierLotNo: grnRef,
            supplierName: po.partyName,
            receivedOn: new Date().toISOString().split('T')[0],
            expiryOn: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
            qtyBase: inwardQtyBase,
            landedCostPerKgPaise: Math.round(item.unitPricePaise),
            status: 'available',
            locationId: 'loc_adalaj_main',
          };
          newLots.push(lot);
        }
      });

      this.saveMovements([...newMovements, ...movements]);
      this.saveItems(items);
      if (newLots.length > 0) {
        this.saveLots([...newLots, ...lots]);
      }
    }

    // Update PO record
    const pos = this.getPurchaseOrders().map((p) => {
      if (p.id === poId) {
        return {
          ...p,
          status,
          actualFulfillmentDate:
            status === 'fulfilled' ? new Date().toISOString().split('T')[0] : p.actualFulfillmentDate,
          fulfillmentNotes: notes || p.fulfillmentNotes,
          grnNumber: grn || p.grnNumber,
        };
      }
      return p;
    });
    this.savePurchaseOrders(pos);
    this.logOutbox('update', 'bill', `Updated PO fulfillment status ${poId} to ${status}`);
  }

  // Inter-Firm Finished Goods Transfers (CFA Depot)
  getInterFirmTransfers(): InterFirmTransfer[] {
    return this.get<InterFirmTransfer[]>(STORAGE_KEYS.INTERFIRM_TRANSFERS, initialInterFirmTransfers);
  }

  saveInterFirmTransfers(transfers: InterFirmTransfer[]): void {
    this.set(STORAGE_KEYS.INTERFIRM_TRANSFERS, transfers);
  }

  addInterFirmTransfer(transfer: InterFirmTransfer): void {
    const list = this.getInterFirmTransfers();
    this.set(STORAGE_KEYS.INTERFIRM_TRANSFERS, [transfer, ...list]);

    // Posting Service Invariant: Post outward StockMovement & decrement warehouse inventory
    const movements = this.getMovements();
    const items = this.getItems();
    const newMovements: StockMovement[] = [];

    transfer.items.forEach((item, index) => {
      // 1. Post outward StockMovement (transfer)
      const movement: StockMovement = {
        id: `mov_tr_${Date.now()}_${index}`,
        date: transfer.date,
        time: new Date().toTimeString().slice(0, 5),
        itemId: item.itemId,
        itemName: item.name,
        locationId: 'loc_adalaj_main',
        locationName: 'Adalaj Manufacturing Unit',
        qtyBase: -item.totalGrams, // negative = transfer out
        type: 'transfer',
        reference: transfer.transferChallanNo,
        unitCostPaise: Math.round(item.ratePerKgPaise / 1000),
        notes: `Transfer to CFA Depot (${transfer.destinationFirmName}) via Vehicle ${transfer.vehicleNo} (E-Way: ${transfer.ewayBillNo || 'Portal'})`,
      };
      newMovements.push(movement);

      // 2. Decrement inventory currentStockBase
      const matchedItem = items.find((it) => it.id === item.itemId || it.sku === item.sku || it.name.toLowerCase().includes(item.name.toLowerCase().slice(0, 8)));
      if (matchedItem) {
        matchedItem.currentStockBase = Math.max(0, matchedItem.currentStockBase - item.totalGrams);
      }
    });

    this.saveMovements([...newMovements, ...movements]);
    this.saveItems(items);
    this.logOutbox('create', 'movement', `Dispatched Delivery Challan ${transfer.transferChallanNo} (${transfer.items.length} items, ${transfer.totalGrams / 1000} kg) to ${transfer.destinationFirmName}`);
  }

  updateTransferStatus(id: string, status: TransferStatus, notes?: string): void {
    const list = this.getInterFirmTransfers().map((t) => {
      if (t.id === id) {
        return {
          ...t,
          status,
          receivedAtDate: status === 'received_at_cfa' ? new Date().toISOString().split('T')[0] : t.receivedAtDate,
          receivedByNotes: notes || t.receivedByNotes,
        };
      }
      return t;
    });
    this.saveInterFirmTransfers(list);
    this.logOutbox('update', 'movement', `Updated Transfer Challan ${id} to ${status}`);
  }

  // Export Shipments & Licences
  getExportShipments(): ExportShipment[] {
    return this.get<ExportShipment[]>(STORAGE_KEYS.EXPORT_SHIPMENTS, initialExportShipments);
  }

  saveExportShipments(shipments: ExportShipment[]): void {
    this.set(STORAGE_KEYS.EXPORT_SHIPMENTS, shipments);
  }

  addExportShipment(shipment: ExportShipment): void {
    const list = this.getExportShipments();
    this.set(STORAGE_KEYS.EXPORT_SHIPMENTS, [shipment, ...list]);
    this.logOutbox('create', 'movement', `Logged Export Shipment ${shipment.exportInvoiceNo} to ${shipment.destinationCountry}`);
  }

  updateExportShipment(shipment: ExportShipment): void {
    const list = this.getExportShipments().map((s) => (s.id === shipment.id ? shipment : s));
    this.saveExportShipments(list);
    this.logOutbox('update', 'movement', `Updated Export Shipment ${shipment.exportInvoiceNo}`);
  }

  // Business Entities Multi-Company Configuration (Section 1)
  getEntitiesConfig(): Record<BusinessEntityId, BusinessEntityConfig> {
    return this.get<Record<BusinessEntityId, BusinessEntityConfig>>(
      STORAGE_KEYS.ENTITIES_CONFIG,
      initialEntitiesConfig
    );
  }

  saveEntitiesConfig(cfg: Record<BusinessEntityId, BusinessEntityConfig>): void {
    this.set(STORAGE_KEYS.ENTITIES_CONFIG, cfg);
  }

  getActiveEntityId(): BusinessEntityId | 'all' {
    return this.get<BusinessEntityId | 'all'>(STORAGE_KEYS.ACTIVE_ENTITY_ID, 'all');
  }

  setActiveEntityId(id: BusinessEntityId | 'all'): void {
    this.set(STORAGE_KEYS.ACTIVE_ENTITY_ID, id);
  }

  // Stock Allocations (Section 4)
  getStockAllocations(): InterEntityStockAllocation[] {
    return this.get<InterEntityStockAllocation[]>(
      STORAGE_KEYS.STOCK_ALLOCATIONS,
      initialStockAllocations
    );
  }

  saveStockAllocations(allocations: InterEntityStockAllocation[]): void {
    this.set(STORAGE_KEYS.STOCK_ALLOCATIONS, allocations);
  }

  addStockAllocation(allocation: InterEntityStockAllocation): void {
    const list = this.getStockAllocations();
    this.saveStockAllocations([allocation, ...list]);
    this.logOutbox('create', 'movement', `Created Stock Allocation ${allocation.allocationNumber}`);
  }

  updateStockAllocation(allocation: InterEntityStockAllocation): void {
    const list = this.getStockAllocations().map((a) => (a.id === allocation.id ? allocation : a));
    this.saveStockAllocations(list);
    this.logOutbox('update', 'movement', `Updated Stock Allocation ${allocation.allocationNumber}`);
  }

  // Sister Downstream Invoices (Section 3)
  getSisterDownstreamInvoices(): SisterDownstreamInvoice[] {
    return this.get<SisterDownstreamInvoice[]>(
      STORAGE_KEYS.SISTER_INVOICES,
      initialSisterDownstreamInvoices
    );
  }

  saveSisterDownstreamInvoices(invoices: SisterDownstreamInvoice[]): void {
    this.set(STORAGE_KEYS.SISTER_INVOICES, invoices);
  }

  addSisterDownstreamInvoice(invoice: SisterDownstreamInvoice): void {
    const list = this.getSisterDownstreamInvoices();
    this.saveSisterDownstreamInvoices([invoice, ...list]);

    // Posting Service Invariant: Post secondary stock decrement
    const movements = this.getMovements();
    const newMovements: StockMovement[] = [];

    invoice.items.forEach((item, index) => {
      const mov: StockMovement = {
        id: `mov_sec_${Date.now()}_${index}`,
        date: invoice.date,
        time: new Date().toTimeString().slice(0, 5),
        itemId: item.itemId,
        itemName: item.name,
        locationId: 'loc_cfa_aslali',
        locationName: 'Sister CFA Depot (Aslali)',
        qtyBase: -item.totalGrams, // negative = secondary sales out
        type: 'issue',
        reference: invoice.invoiceNo,
        unitCostPaise: Math.round(item.taxableAmountPaise / (item.totalGrams || 1)),
        notes: `Secondary sales dispatch to ${invoice.customerName} (${invoice.channel})`,
      };
      newMovements.push(mov);
    });

    this.saveMovements([...newMovements, ...movements]);

    // If payment was made immediately at invoice time
    if (invoice.paidAmountPaise > 0) {
      const txn: Transaction = {
        id: `txn_sec_col_${Date.now()}`,
        txnNo: `TXN-INV-${invoice.invoiceNo}`,
        date: invoice.date,
        direction: 'in',
        accountId: 'acc_cash_depot',
        accountName: 'CFA Depot Cash in Hand',
        partyId: invoice.customerId,
        partyName: invoice.customerName,
        amountPaise: invoice.paidAmountPaise,
        headCategory: 'Secondary Sales Revenue (Gujarat)',
        mode: 'Cash',
        reference: invoice.invoiceNo,
        status: 'posted',
        entityId: 'sister_prop',
        notes: `Customer collection against invoice ${invoice.invoiceNo}`,
      };
      this.addTransaction(txn);
    }

    this.logOutbox('create', 'bill', `Issued Secondary Invoice ${invoice.invoiceNo} to ${invoice.customerName}`);
  }

  recordSisterInvoicePayment(
    invoiceId: string,
    amountPaise: number,
    mode: string,
    ref: string
  ): void {
    const invoices = this.getSisterDownstreamInvoices().map((inv) => {
      if (inv.id === invoiceId) {
        const newPaid = inv.paidAmountPaise + amountPaise;
        const newBalance = Math.max(0, inv.totalPaise - newPaid);
        const payments = inv.payments || [];
        const newPayment = {
          id: `pay_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          amountPaise,
          mode,
          reference: ref,
        };

        return {
          ...inv,
          paidAmountPaise: newPaid,
          balanceDuePaise: newBalance,
          paymentStatus: (newBalance === 0 ? 'paid' : 'part_paid') as 'paid' | 'part_paid',
          payments: [...payments, newPayment],
        };
      }
      return inv;
    });

    this.saveSisterDownstreamInvoices(invoices);

    // Posting Service Invariant: Debit Sister bank/cash
    const txn: Transaction = {
      id: `txn_col_${Date.now()}`,
      txnNo: ref ? `TXN-${ref}` : `TXN-COL-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      direction: 'in',
      accountId: mode.toLowerCase().includes('bank') ? 'acc_sbi_sister' : 'acc_cash_depot',
      accountName: mode.toLowerCase().includes('bank') ? 'SBI Commercial Current A/c' : 'CFA Depot Cash in Hand',
      amountPaise,
      headCategory: 'Secondary Sales Collection',
      mode: mode.toLowerCase().includes('bank') ? 'SBI Transfer' : 'Cash',
      reference: ref,
      status: 'posted',
      entityId: 'sister_prop',
      notes: `Payment collected against invoice ${invoiceId}`,
    };
    this.addTransaction(txn);
    this.logOutbox('create', 'transaction', `Recorded customer payment ₹${amountPaise / 100} on invoice ${invoiceId}`);
  }

  // Inter-Entity Settlements (Sections 4 & 5)
  getInterEntitySettlements(): InterEntitySettlement[] {
    return this.get<InterEntitySettlement[]>(
      STORAGE_KEYS.INTER_ENTITY_SETTLEMENTS,
      initialInterEntitySettlements
    );
  }

  saveInterEntitySettlements(settlements: InterEntitySettlement[]): void {
    this.set(STORAGE_KEYS.INTER_ENTITY_SETTLEMENTS, settlements);
  }

  addInterEntitySettlement(settlement: InterEntitySettlement): void {
    const list = this.getInterEntitySettlements();
    this.saveInterEntitySettlements([settlement, ...list]);

    // Posting Service Invariant: Post dual-entry transactions in both entity ledgers
    // 1. In Sister Books: Bank Outflow
    const sisterTxn: Transaction = {
      id: `txn_ies_out_${Date.now()}`,
      txnNo: `TXN-IES-OUT-${settlement.bankUtrRef}`,
      date: settlement.date,
      direction: 'out',
      accountId: settlement.remittedFromAccountId,
      accountName: 'SBI Commercial Current A/c (Sister Firm)',
      amountPaise: settlement.amountPaise,
      headCategory: 'Inter-Firm Settlement Remittance',
      mode: 'SBI Transfer',
      reference: `UTR: ${settlement.bankUtrRef}`,
      status: 'posted',
      entityId: 'sister_prop',
      notes: `Remittance to Main Pvt. Ltd. (Ref: ${settlement.settlementNo})`,
    };
    this.addTransaction(sisterTxn);

    // 2. In Main Books: Bank Inflow
    const mainTxn: Transaction = {
      id: `txn_ies_in_${Date.now()}`,
      txnNo: `TXN-IES-IN-${settlement.bankUtrRef}`,
      date: settlement.date,
      direction: 'in',
      accountId: settlement.depositedToAccountId,
      accountName: 'HDFC Current A/c (Main Company)',
      amountPaise: settlement.amountPaise,
      headCategory: 'Inter-Firm Settlement Receipt',
      mode: 'HDFC NetBanking',
      reference: `UTR: ${settlement.bankUtrRef}`,
      status: 'posted',
      entityId: 'pvt_ltd',
      notes: `Received from Sister Proprietorship (Ref: ${settlement.settlementNo})`,
    };
    this.addTransaction(mainTxn);

    // 3. Update Allocation Settled Balances
    const allocations = this.getStockAllocations().map((alc) => {
      if (settlement.linkedAllocationIds?.includes(alc.id)) {
        const settled = alc.settledAmountPaise + settlement.amountPaise;
        const balance = Math.max(0, alc.totalValuationPaise - settled);
        return {
          ...alc,
          settledAmountPaise: settled,
          balanceOutstandingPaise: balance,
          status: (balance === 0 ? 'fully_settled' : 'partially_settled') as 'fully_settled' | 'partially_settled',
        };
      }
      return alc;
    });
    this.saveStockAllocations(allocations);

    this.logOutbox('create', 'transaction', `Executed Inter-Entity Settlement ${settlement.settlementNo} of ₹${settlement.amountPaise / 100}`);
  }

  // Reconciliation Engine (Section 5)
  getInterEntityReconciliationReport(): InterEntityLedgerReconciliation {
    const allocations = this.getStockAllocations();
    const challans = this.getInterFirmTransfers();
    const settlements = this.getInterEntitySettlements();
    const entityConfig = this.getEntitiesConfig();

    // 1. Total Dispatched / Supplied from Main Pvt. Ltd. to Sister Firm
    const totalDispatchedValuationPaise = challans.reduce((sum, c) => sum + c.totalValuationPaise, 0);

    // 2. Total Acknowledged Received at Sister CFA Depot
    const totalReceivedValuationPaise = challans
      .filter((c) => c.status === 'received_at_cfa')
      .reduce((sum, c) => sum + c.totalValuationPaise, 0);

    // 3. In-Transit Dispatches (Dispatched by Main, but not yet received by Sister)
    const inTransitDispatchesPaise = challans
      .filter((c) => c.status === 'in_transit' || c.status === 'dispatched')
      .reduce((sum, c) => sum + c.totalValuationPaise, 0);

    // 4. Total Settlements Remitted by Sister to Main
    const totalSettledPaise = settlements.reduce((sum, s) => sum + s.amountPaise, 0);

    // 5. Uncredited Settlements (in-transit remittances)
    const uncreditedSettlementsPaise = settlements
      .filter((s) => !s.verifiedByAuditor)
      .reduce((sum, s) => sum + s.amountPaise, 0);

    // In Main Books: Main Receivable = Total Dispatched - Total Settled
    const mainReceivableFromSisterPaise = Math.max(0, totalDispatchedValuationPaise - totalSettledPaise);

    // In Sister Books: Sister Payable = Total Received - Total Settled
    const sisterPayableToMainPaise = Math.max(0, totalReceivedValuationPaise - totalSettledPaise);

    // Net Discrepancy = Difference between Main Receivable and (Sister Payable + In-Transit Dispatches)
    const netDiscrepancyPaise = Math.abs(
      mainReceivableFromSisterPaise - (sisterPayableToMainPaise + inTransitDispatchesPaise)
    );

    const creditLimitPaise = entityConfig.sister_prop?.creditLimitWithParentPaise || 500000000;
    const creditUtilizationPct = Math.round((mainReceivableFromSisterPaise / creditLimitPaise) * 100);

    const alerts: InterEntityLedgerReconciliation['alerts'] = [];

    // Alert: In-transit Challans
    const inTransitChallans = challans.filter((c) => c.status === 'in_transit');
    if (inTransitChallans.length > 0) {
      alerts.push({
        type: 'warning',
        code: 'IN_TRANSIT_STOCK',
        message: `${inTransitChallans.length} delivery challan(s) totaling ₹${inTransitDispatchesPaise / 100} currently in transit to Aslali CFA Depot.`,
        referenceId: inTransitChallans.map((c) => c.transferChallanNo).join(', '),
      });
    }

    // Alert: Credit Limit Threshold
    if (creditUtilizationPct > 80) {
      alerts.push({
        type: 'warning',
        code: 'CREDIT_LIMIT_HIGH',
        message: `Sister firm credit exposure is at ${creditUtilizationPct}% of approved ₹${creditLimitPaise / 100} limit. Outstanding: ₹${mainReceivableFromSisterPaise / 100}.`,
      });
    }

    // Alert: Aging / Overdue Allocations
    const today = new Date().toISOString().split('T')[0];
    allocations.forEach((alc) => {
      if (alc.balanceOutstandingPaise > 0 && alc.creditDueDate < today) {
        alerts.push({
          type: 'error',
          code: 'ALLOCATION_OVERDUE',
          message: `Allocation ${alc.allocationNumber} is past credit due date (${alc.creditDueDate}). Balance due: ₹${alc.balanceOutstandingPaise / 100}.`,
          referenceId: alc.allocationNumber,
        });
      }
    });

    if (netDiscrepancyPaise === 0) {
      alerts.push({
        type: 'info',
        code: 'LEDGER_BALANCED',
        message: `Books in perfect parity. Main debits match Sister credits accounting for in-transit logistics.`,
      });
    }

    return {
      periodLabel: 'October 2026 Fiscal Cycle',
      mainReceivableFromSisterPaise,
      sisterPayableToMainPaise,
      netDiscrepancyPaise,
      inTransitDispatchesPaise,
      uncreditedSettlementsPaise,
      creditLimitPaise,
      creditUtilizationPct,
      status: netDiscrepancyPaise === 0 ? 'matched' : 'unmatched_discrepancy',
      alerts,
    };
  }

  getStockFlowReconciliation(): StockFlowReconciliation {
    const challans = this.getInterFirmTransfers();
    const sisterInvoices = this.getSisterDownstreamInvoices();

    const suppliedByMainGrams = challans.reduce((sum, c) => sum + c.totalGrams, 0);
    const receivedAtSisterGrams = challans
      .filter((c) => c.status === 'received_at_cfa')
      .reduce((sum, c) => sum + c.totalGrams, 0);
    const inTransitGrams = challans
      .filter((c) => c.status === 'in_transit' || c.status === 'dispatched')
      .reduce((sum, c) => sum + c.totalGrams, 0);

    const soldDownstreamGrams = sisterInvoices.reduce((sum, inv) => sum + inv.totalGrams, 0);
    const openingDepotStockGrams = 80000; // 80 kg buffer
    const damagedOrReturnedGrams = 2000;  // 2 kg seals verification
    const closingDepotStockGrams = Math.max(
      0,
      openingDepotStockGrams + receivedAtSisterGrams - soldDownstreamGrams - damagedOrReturnedGrams
    );

    const calculatedRemaining = openingDepotStockGrams + receivedAtSisterGrams - (soldDownstreamGrams + damagedOrReturnedGrams);
    const discrepancyGrams = Math.abs(calculatedRemaining - closingDepotStockGrams);

    return {
      periodLabel: 'October 2026',
      openingDepotStockGrams,
      suppliedByMainGrams,
      receivedAtSisterGrams,
      inTransitGrams,
      soldDownstreamGrams,
      closingDepotStockGrams,
      damagedOrReturnedGrams,
      discrepancyGrams,
      status: discrepancyGrams === 0 ? 'balanced' : 'variance_detected',
    };
  }

  // Filtered queries by Entity ID
  getPartiesByEntity(entityId?: BusinessEntityId | 'all'): Party[] {
    const list = this.getParties();
    if (!entityId || entityId === 'all') return list;
    return list.filter((p) => p.assignedEntityId === entityId || !p.assignedEntityId);
  }

  getAccountsByEntity(entityId?: BusinessEntityId | 'all'): Account[] {
    const list = this.getAccounts();
    if (!entityId || entityId === 'all') return list;
    return list.filter((a) => a.entityId === entityId || !a.entityId);
  }

  getTransactionsByEntity(entityId?: BusinessEntityId | 'all'): Transaction[] {
    const list = this.getTransactions();
    if (!entityId || entityId === 'all') return list;
    return list.filter((t) => t.entityId === entityId || !t.entityId);
  }

  getBillsByEntity(entityId?: BusinessEntityId | 'all'): Bill[] {
    const list = this.getBills();
    if (!entityId || entityId === 'all') return list;
    return list.filter((b) => b.entityId === entityId || !b.entityId);
  }

  // ============================================================================
  // SALES INVOICES & QUOTATIONS (DOMESTIC & EXPORT B2B)
  // ============================================================================
  getSalesInvoices(): SalesInvoice[] {
    return this.get<SalesInvoice[]>(STORAGE_KEYS.SALES_INVOICES, initialSalesInvoices);
  }

  getSalesInvoicesByEntity(entityId: BusinessEntityId | 'all'): SalesInvoice[] {
    const list = this.getSalesInvoices();
    if (entityId === 'all') return list;
    return list.filter((inv) => inv.entityId === entityId);
  }

  addSalesInvoice(inv: SalesInvoice): void {
    const list = this.getSalesInvoices();
    this.set(STORAGE_KEYS.SALES_INVOICES, [inv, ...list]);
    this.logOutbox('create', 'bill', `Issued Sales Invoice ${inv.invoiceNo} (₹${(inv.grandTotalPaise / 100).toFixed(2)})`);

    // If buyer is an existing party, update party outstanding balance
    if (inv.buyerPartyId) {
      const parties = this.getParties();
      const p = parties.find((pt) => pt.id === inv.buyerPartyId);
      if (p) {
        // Party owes us: negative outstanding
        p.outstandingPaise = (p.outstandingPaise || 0) - inv.grandTotalPaise;
        this.saveParties(parties);
      }
    }
  }

  voidSalesInvoice(invoiceNo: string, reason: string, voidedBy = 'Admin'): void {
    const list = this.getSalesInvoices();
    const inv = list.find((i) => i.invoiceNo === invoiceNo);
    if (!inv) return;

    inv.status = 'voided';
    inv.voidReason = reason;
    inv.voidedAt = new Date().toISOString();
    this.set(STORAGE_KEYS.SALES_INVOICES, list);

    // Record non-destructive audit
    const auditList = this.getVoidedInvoicesAudit();
    const auditRecord: VoidedInvoiceAudit = {
      id: `void_${Date.now()}`,
      originalInvoiceNo: inv.invoiceNo,
      invoiceType: inv.invoiceType,
      voidedAt: inv.voidedAt,
      voidedBy,
      reason,
      originalGrandTotalPaise: inv.grandTotalPaise,
      originalDataJson: JSON.stringify(inv),
    };
    this.set(STORAGE_KEYS.VOIDED_INVOICES, [auditRecord, ...auditList]);
    this.logOutbox('void', 'bill', `Voided invoice ${invoiceNo}: ${reason}`);
  }

  recordInvoicePayment(invoiceNo: string, amountPaise: number, mode: string, reference: string): void {
    const list = this.getSalesInvoices();
    const inv = list.find((i) => i.invoiceNo === invoiceNo);
    if (!inv) return;

    inv.paidAmountPaise = (inv.paidAmountPaise || 0) + amountPaise;
    inv.balanceDuePaise = Math.max(0, inv.grandTotalPaise - inv.paidAmountPaise);
    if (inv.balanceDuePaise === 0) {
      inv.status = 'paid';
    } else {
      inv.status = 'part_paid';
    }
    this.set(STORAGE_KEYS.SALES_INVOICES, list);
    this.logOutbox('update', 'bill', `Recorded payment of ₹${(amountPaise / 100).toFixed(2)} on invoice ${invoiceNo}`);
  }

  // Formal Quotations
  getSalesQuotations(): SalesQuotation[] {
    return this.get<SalesQuotation[]>(STORAGE_KEYS.SALES_QUOTATIONS, initialSalesQuotations);
  }

  addSalesQuotation(quo: SalesQuotation): void {
    const list = this.getSalesQuotations();
    this.set(STORAGE_KEYS.SALES_QUOTATIONS, [quo, ...list]);
    this.logOutbox('create', 'bill', `Generated Quotation ${quo.quotationNo} for ${quo.buyerName}`);
  }

  convertQuotationToInvoice(quotationNo: string): SalesInvoice | null {
    const quotations = this.getSalesQuotations();
    const quo = quotations.find((q) => q.quotationNo === quotationNo);
    if (!quo) return null;

    const invoices = this.getSalesInvoices();
    const nextSeq = invoices.length + 1;
    const invNo = `ADL-INV-2026-${String(nextSeq).padStart(4, '0')}`;

    const newInvoice: SalesInvoice = {
      id: `inv_conv_${Date.now()}`,
      invoiceNo: invNo,
      invoiceType: 'domestic_tax_invoice',
      entityId: quo.entityId,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      buyerName: quo.buyerName,
      buyerGstin: quo.buyerGstin,
      buyerAddress: quo.buyerAddress,
      buyerCountry: quo.buyerCountry || 'India',
      buyerState: 'Gujarat',
      buyerStateCode: '24',
      items: quo.items,
      subtotalTaxablePaise: quo.subtotalTaxablePaise,
      creditTerms: quo.creditTerms || 'on_dispatch',
      creditDays: quo.creditTerms === 'credit_30' ? 30 : 0,
      creditSurchargeRatePct: quo.creditSurchargeRatePct || 0,
      creditSurchargePaise: quo.creditSurchargePaise || 0,
      extendedCreditInterestPaise: 0,
      totalTaxablePaise: quo.subtotalTaxablePaise + (quo.creditSurchargePaise || 0),
      cgstPaise: Math.round(quo.estimatedTaxPaise / 2),
      sgstPaise: quo.estimatedTaxPaise - Math.round(quo.estimatedTaxPaise / 2),
      igstPaise: 0,
      totalTaxPaise: quo.estimatedTaxPaise,
      roundOffPaise: 0,
      grandTotalPaise: quo.grandTotalPaise,
      paidAmountPaise: 0,
      balanceDuePaise: quo.grandTotalPaise,
      status: 'issued',
      isExport: false,
      currency: 'INR',
      exchangeRate: 1.0,
      foreignAmount: quo.grandTotalPaise / 100,
      createdAt: new Date().toISOString(),
    };

    this.addSalesInvoice(newInvoice);
    quo.status = 'converted';
    quo.convertedInvoiceId = newInvoice.id;
    this.set(STORAGE_KEYS.SALES_QUOTATIONS, quotations);
    return newInvoice;
  }

  getVoidedInvoicesAudit(): VoidedInvoiceAudit[] {
    return this.get<VoidedInvoiceAudit[]>(STORAGE_KEYS.VOIDED_INVOICES, initialVoidedInvoices);
  }

  // ============================================================================
  // 3-TIER PACKAGING & FLOOR FULFILLMENT JOBS
  // ============================================================================
  getPackingFloorJobs(): PackingFloorFulfillmentJob[] {
    return this.get<PackingFloorFulfillmentJob[]>(STORAGE_KEYS.PACKING_FLOOR_JOBS, initialPackingFloorJobs);
  }

  addPackingFloorJob(job: PackingFloorFulfillmentJob): void {
    const list = this.getPackingFloorJobs();
    this.set(STORAGE_KEYS.PACKING_FLOOR_JOBS, [job, ...list]);
    this.logOutbox('create', 'batch', `Staged Floor Packing Job ${job.jobNo} for ${job.customerName}`);
  }

  updatePackingFloorJob(job: PackingFloorFulfillmentJob): void {
    const list = this.getPackingFloorJobs().map((j) => (j.id === job.id ? job : j));
    this.set(STORAGE_KEYS.PACKING_FLOOR_JOBS, list);
    this.logOutbox('update', 'batch', `Updated Floor Packing Job ${job.jobNo}`);
  }

  recordPackingDailyProgress(
    jobId: string,
    shift: 'morning' | 'evening' | 'night',
    supervisor: string,
    unitsProduced: number,
    gramsProduced: number,
    spillWastageGrams: number
  ): void {
    const list = this.getPackingFloorJobs();
    const job = list.find((j) => j.id === jobId);
    if (!job) return;

    job.dailyProgressRecords.push({
      date: new Date().toISOString().split('T')[0],
      shift,
      supervisor,
      packedUnits: unitsProduced,
      packedGrams: gramsProduced,
      spillWastageGrams,
    });

    job.packedUnitsCompleted += unitsProduced;
    job.packedGramsCompleted += gramsProduced;
    job.deficitUnits = Math.max(0, job.targetPacks - job.packedUnitsCompleted);
    job.deficitGrams = Math.max(0, job.targetGrams - job.packedGramsCompleted);
    job.fulfillmentPct = Math.min(100, Number(((job.packedUnitsCompleted / job.targetPacks) * 100).toFixed(1)));

    if (job.fulfillmentPct >= 100) {
      job.status = 'tertiary_boxed';
    }

    this.set(STORAGE_KEYS.PACKING_FLOOR_JOBS, list);
    this.logOutbox('update', 'batch', `Logged progress on job ${job.jobNo}: +${unitsProduced} units packed`);
  }

  // ============================================================================
  // ADVANCED FINANCIAL INTELLIGENCE & MULTI-PERIOD EXECUTIVE REPORT ENGINE
  // ============================================================================
  getFinancialIntelligence(
    entityScope: BusinessEntityId | 'all' = 'all',
    horizon: FinancialHorizon = 'monthly_mom',
    monthStr = '2026-10'
  ): FinancialIntelligenceMetrics {
    // 1. Determine period factor
    let scaleMultiplier = 1.0;
    let periodLabel = 'October 2026 (Month-to-Date)';

    if (horizon === 'daily_dod') {
      scaleMultiplier = 1 / 25; // 1 operational day
      periodLabel = 'Today vs Yesterday (Daily Operational DoD)';
    } else if (horizon === 'annual_yoy') {
      scaleMultiplier = 12.0;
      periodLabel = 'FY 2026-2027 Annualized Forecast (YoY)';
    } else if (horizon === 'specific_month') {
      periodLabel = `Financial Year 2026-27 · Month: ${monthStr}`;
    }

    // 2. Base Turnovers (in Paise)
    let pvtRevenue = 864000000;  // ₹86,40,000 Main Pvt. Ltd. (B2B + Export + Modern Trade)
    let sisterRevenue = 381000000; // ₹38,10,000 Sister CFA & Downstream Secondary Sales

    let revenuePaise = 0;
    if (entityScope === 'pvt_ltd') {
      revenuePaise = Math.round(pvtRevenue * scaleMultiplier);
    } else if (entityScope === 'sister_prop') {
      revenuePaise = Math.round(sisterRevenue * scaleMultiplier);
    } else {
      // Consolidated
      revenuePaise = Math.round((pvtRevenue + sisterRevenue) * scaleMultiplier);
    }

    // 3. COGS Breakdown (Raw spices + packaging foils/pouches + floor labor wages) ~66%
    const cogsPct = entityScope === 'sister_prop' ? 78.0 : 66.0;
    const cogsPaise = Math.round((revenuePaise * cogsPct) / 100);

    // 4. Gross Profit (GP)
    const grossProfitPaise = revenuePaise - cogsPaise;
    const gpMarginPct = Number(((grossProfitPaise / revenuePaise) * 100).toFixed(2));

    // 5. OPEX (Operating Expenses: Rent, Power, Machine Spares, Logistics, Admin, CA) ~12%
    const opexPct = entityScope === 'sister_prop' ? 8.5 : 12.0;
    const opexPaise = Math.round((revenuePaise * opexPct) / 100);

    // 6. EBITDA (Earnings Before Interest, Tax, Depreciation & Amortization)
    const ebitdaPaise = grossProfitPaise - opexPaise;
    const ebitdaMarginPct = Number(((ebitdaPaise / revenuePaise) * 100).toFixed(2));

    // 7. Depreciation (Machinery & Plant Fixtures WDV) ~2.2%
    const depreciationPaise = Math.round(28000000 * scaleMultiplier);

    // 8. EBIT (Operating Profit)
    const ebitPaise = ebitdaPaise - depreciationPaise;
    const ebitMarginPct = Number(((ebitPaise / revenuePaise) * 100).toFixed(2));

    // 9. Finance Cost (Interest on term loan & working capital) ~1.5%
    const financeCostPaise = Math.round(18500000 * scaleMultiplier);

    // 10. PBT (Profit Before Tax)
    const pbtPaise = ebitPaise - financeCostPaise;
    const pbtMarginPct = Number(((pbtPaise / revenuePaise) * 100).toFixed(2));

    // 11. Income Tax Provision (25% for Pvt Ltd / 30% for Proprietorship)
    const taxRatePct = entityScope === 'sister_prop' ? 30.0 : 25.0;
    const taxProvisionPaise = Math.max(0, Math.round((pbtPaise * taxRatePct) / 100));

    // 12. PAT / Net Profit (NP)
    const patPaise = pbtPaise - taxProvisionPaise;
    const patMarginPct = Number(((patPaise / revenuePaise) * 100).toFixed(2));

    // 13. Statutory GST Position
    const eligibleItcPaise = Math.round(98540000 * scaleMultiplier);
    const outputGstLiabilityPaise = Math.round(62250000 * scaleMultiplier);
    const netGstPositionPaise = outputGstLiabilityPaise - eligibleItcPaise; // negative = surplus ITC

    // 14. Unit Economics per Kilogram Packed
    const baseKg = entityScope === 'pvt_ltd' ? 34000 : entityScope === 'sister_prop' ? 14000 : 48000;
    const totalKilogramsPacked = Math.round(baseKg * scaleMultiplier);

    const opexPerKgPaise = totalKilogramsPacked > 0 ? Math.round(opexPaise / totalKilogramsPacked) : 0;
    const cogsPerKgPaise = totalKilogramsPacked > 0 ? Math.round(cogsPaise / totalKilogramsPacked) : 0;
    const totalCostPerKgPaise = opexPerKgPaise + cogsPerKgPaise;
    const realizationPerKgPaise = totalKilogramsPacked > 0 ? Math.round(revenuePaise / totalKilogramsPacked) : 0;
    const markupPerKgPaise = realizationPerKgPaise - totalCostPerKgPaise;
    const markupPct = totalCostPerKgPaise > 0 ? Number(((markupPerKgPaise / totalCostPerKgPaise) * 100).toFixed(1)) : 0;

    // 15. Period Comparison Variances
    const previousRevenuePaise = Math.round(revenuePaise * 0.885); // +13% growth
    const revenueGrowthPct = 13.0;
    const gpGrowthPct = 15.2;
    const patGrowthPct = 18.4;

    return {
      periodLabel,
      horizon,
      entityScope,
      revenuePaise,
      cogsPaise,
      grossProfitPaise,
      opexPaise,
      ebitdaPaise,
      depreciationPaise,
      ebitPaise,
      financeCostPaise,
      pbtPaise,
      taxProvisionPaise,
      patPaise,
      cogsPct,
      gpMarginPct,
      opexPct,
      ebitdaMarginPct,
      ebitMarginPct,
      pbtMarginPct,
      patMarginPct,
      eligibleItcPaise,
      outputGstLiabilityPaise,
      netGstPositionPaise,
      totalKilogramsPacked,
      opexPerKgPaise,
      cogsPerKgPaise,
      totalCostPerKgPaise,
      realizationPerKgPaise,
      markupPerKgPaise,
      markupPct,
      previousRevenuePaise,
      revenueGrowthPct,
      gpGrowthPct,
      patGrowthPct,
    };
  }

  // --- PACKAGING TIER SPECS (TIER 1, 2, 3 CRUD) ---
  getPackagingSpecs(): PackagingTierSpec[] {
    return this.get<PackagingTierSpec[]>(STORAGE_KEYS.PACKAGING_SPECS, initialPackagingSpecs);
  }

  savePackagingSpecs(specs: PackagingTierSpec[]): void {
    this.set(STORAGE_KEYS.PACKAGING_SPECS, specs);
  }

  addPackagingSpec(spec: PackagingTierSpec): void {
    const list = this.getPackagingSpecs();
    this.savePackagingSpecs([...list, spec]);
    this.logOutbox('create', 'asset', `Added Packaging Tier ${spec.tierLevel} Spec: ${spec.displayName}`);
  }

  updatePackagingSpec(spec: PackagingTierSpec): void {
    const list = this.getPackagingSpecs().map((s) => (s.id === spec.id ? spec : s));
    this.savePackagingSpecs(list);
    this.logOutbox('update', 'asset', `Updated Packaging Spec: ${spec.displayName}`);
  }

  deletePackagingSpec(id: string): void {
    const list = this.getPackagingSpecs().filter((s) => s.id !== id);
    this.savePackagingSpecs(list);
    this.logOutbox('void', 'asset', `Archived Packaging Spec ${id}`);
  }

  resetPackagingSpecs(): void {
    this.savePackagingSpecs(initialPackagingSpecs);
  }

  // --- DAILY MANDI SPOT RATES & BLENDED COST RATIO ENGINE ---
  getMandiSpotRates(): MandiSpotRateRecord[] {
    return this.get<MandiSpotRateRecord[]>(STORAGE_KEYS.MANDI_SPOT_RATES, initialMandiSpotRates);
  }

  saveMandiSpotRates(rates: MandiSpotRateRecord[]): void {
    this.set(STORAGE_KEYS.MANDI_SPOT_RATES, rates);
  }

  addMandiSpotRate(rate: MandiSpotRateRecord): void {
    const list = this.getMandiSpotRates();
    this.saveMandiSpotRates([rate, ...list]);
    this.logOutbox('create', 'bill', `Recorded Mandi Spot Rate for ${rate.spiceName} @ ₹${rate.spotRatePerKgRupees}/kg`);
  }

  calculateBlendedCost(params: {
    spiceName: string;
    totalRequiredKg: number;
    stockOnHandKg: number;
    stockHistoricalCostRupees: number;
    spotMarketRateRupees: number;
    millingShrinkagePct?: number; // default 2%
    packagingCostPerKg?: number;  // default ₹8
    opexAllocationPerKg?: number; // default ₹12
    targetProfitMarginPct?: number; // default 15%
    exchangeRateUsd?: number;     // default 83.5
  }): BlendedCostCalculation {
    const {
      spiceName,
      totalRequiredKg,
      stockOnHandKg,
      stockHistoricalCostRupees,
      spotMarketRateRupees,
      millingShrinkagePct = 2.0,
      packagingCostPerKg = 8.0,
      opexAllocationPerKg = 12.0,
      targetProfitMarginPct = 15.0,
      exchangeRateUsd = 83.5,
    } = params;

    const actualStockKg = Math.min(totalRequiredKg, Math.max(0, stockOnHandKg));
    const deficitKg = Math.max(0, totalRequiredKg - actualStockKg);

    // Weighted average raw cost
    const blendedRawCostPerKg =
      totalRequiredKg > 0
        ? (actualStockKg * stockHistoricalCostRupees + deficitKg * spotMarketRateRupees) / totalRequiredKg
        : spotMarketRateRupees;

    // After grinding / milling shrinkage adjustment
    const shrinkageRatio = 1 - millingShrinkagePct / 100;
    const milledCostPerKg = shrinkageRatio > 0 ? blendedRawCostPerKg / shrinkageRatio : blendedRawCostPerKg;

    // Total factory landed cost per kg
    const totalLandedCostPerKg = milledCostPerKg + packagingCostPerKg + opexAllocationPerKg;

    // Quoted price factoring in margin
    const marginRatio = 1 - targetProfitMarginPct / 100;
    const recommendedQuotedPricePerKg = marginRatio > 0 ? totalLandedCostPerKg / marginRatio : totalLandedCostPerKg * 1.15;
    const recommendedQuotedPriceUSD = exchangeRateUsd > 0 ? recommendedQuotedPricePerKg / exchangeRateUsd : 0;

    return {
      spiceName,
      totalRequiredKg,
      stockOnHandKg: actualStockKg,
      stockHistoricalCostRupees,
      deficitToProcureKg: deficitKg,
      spotMarketRateRupees,
      blendedRawCostPerKg: Math.round(blendedRawCostPerKg * 100) / 100,
      millingShrinkagePct,
      milledCostPerKg: Math.round(milledCostPerKg * 100) / 100,
      packagingCostPerKg,
      opexAllocationPerKg,
      totalLandedCostPerKg: Math.round(totalLandedCostPerKg * 100) / 100,
      targetProfitMarginPct,
      recommendedQuotedPricePerKg: Math.round(recommendedQuotedPricePerKg * 100) / 100,
      recommendedQuotedPriceUSD: Math.round(recommendedQuotedPriceUSD * 100) / 100,
    };
  }

  // --- UNIVERSAL DEPARTMENTAL TO-DO STACK ---
  getDailyTodos(role?: UserRole): DailyTodoItem[] {
    const list = this.get<DailyTodoItem[]>(STORAGE_KEYS.DAILY_TODOS, initialDailyTodos);
    if (role && role !== 'owner') {
      return list.filter((t) => t.role === role);
    }
    return list;
  }

  saveDailyTodos(todos: DailyTodoItem[]): void {
    this.set(STORAGE_KEYS.DAILY_TODOS, todos);
  }

  addDailyTodo(todo: DailyTodoItem): void {
    const list = this.get<DailyTodoItem[]>(STORAGE_KEYS.DAILY_TODOS, initialDailyTodos);
    this.saveDailyTodos([todo, ...list]);
  }

  toggleDailyTodo(id: string): void {
    const list = this.get<DailyTodoItem[]>(STORAGE_KEYS.DAILY_TODOS, initialDailyTodos);
    const updated = list.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          isCompleted: !t.isCompleted,
          completedAt: !t.isCompleted ? new Date().toISOString() : undefined,
        };
      }
      return t;
    });
    this.saveDailyTodos(updated);
  }

  deleteDailyTodo(id: string): void {
    const list = this.get<DailyTodoItem[]>(STORAGE_KEYS.DAILY_TODOS, initialDailyTodos);
    this.saveDailyTodos(list.filter((t) => t.id !== id));
  }

  // --- DAY-END REPORT SUBMISSIONS ---
  getDayEndReports(role?: UserRole): DayEndReport[] {
    const list = this.get<DayEndReport[]>(STORAGE_KEYS.DAY_END_REPORTS, initialDayEndReports);
    if (role && role !== 'owner') {
      return list.filter((r) => r.role === role);
    }
    return list;
  }

  saveDayEndReports(reports: DayEndReport[]): void {
    this.set(STORAGE_KEYS.DAY_END_REPORTS, reports);
  }

  submitDayEndReport(report: DayEndReport): void {
    const list = this.getDayEndReports();
    this.saveDayEndReports([report, ...list]);
    this.logOutbox('create', 'bill', `Submitted Day-End Report for ${report.role} (${report.primaryMetricValue})`);
  }

  // --- SYSTEM USERS & SUPER ADMIN RBAC CRUD ---
  getAllSystemUsers(): SystemUserCredential[] {
    return this.get<SystemUserCredential[]>(STORAGE_KEYS.SYSTEM_USERS, PREDEFINED_USERS);
  }

  saveSystemUsers(users: SystemUserCredential[]): void {
    this.set(STORAGE_KEYS.SYSTEM_USERS, users);
  }

  addSystemUser(cred: SystemUserCredential): void {
    const list = this.getAllSystemUsers();
    this.saveSystemUsers([...list, cred]);
    this.logOutbox('create', 'employee', `Created enterprise account for ${cred.email} (${cred.user.role})`);
  }

  updateSystemUserRole(email: string, newRole: UserRole): boolean {
    const list = this.getAllSystemUsers();
    let found = false;
    const updated = list.map((u) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        found = true;
        return {
          ...u,
          user: { ...u.user, role: newRole },
        };
      }
      return u;
    });
    if (found) {
      this.saveSystemUsers(updated);
      this.logOutbox('update', 'employee', `Updated role of ${email} to ${newRole}`);
    }
    return found;
  }

  deleteSystemUser(email: string): boolean {
    const list = this.getAllSystemUsers();
    const filtered = list.filter((u) => u.email.toLowerCase() !== email.toLowerCase());
    if (filtered.length < list.length) {
      this.saveSystemUsers(filtered);
      this.logOutbox('void', 'employee', `Deleted enterprise account for ${email}`);
      return true;
    }
    return false;
  }

  resetUserPassword(email: string, newPass: string): boolean {
    const list = this.getAllSystemUsers();
    let found = false;
    const updated = list.map((u) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        found = true;
        return { ...u, password: newPass };
      }
      return u;
    });
    if (found) {
      this.saveSystemUsers(updated);
      this.logOutbox('update', 'employee', `Reset password for ${email}`);
    }
    return found;
  }

  // Super Admin 1-Click Role Teleportation
  teleportToRole(targetRole: UserRole): AuthUser {
    const users = this.getAllSystemUsers();
    const matching = users.find((u) => u.user.role === targetRole);
    if (matching) {
      this.set(STORAGE_KEYS.AUTH_USER, matching.user);
      this.setActiveRole(targetRole);
      return matching.user;
    }
    // Fallback virtual user for role
    const virtualUser: AuthUser = {
      id: `usr_teleport_${targetRole}`,
      email: `${targetRole}@adalajfoods.com`,
      name: `Teleport: ${targetRole.toUpperCase()}`,
      role: targetRole,
      department: `${targetRole} Department`,
      lastLoginAt: new Date().toISOString(),
    };
    this.set(STORAGE_KEYS.AUTH_USER, virtualUser);
    this.setActiveRole(targetRole);
    return virtualUser;
  }

  // Reset starter template to initial state
  resetStarterTemplate(): void {
    this.set(STORAGE_KEYS.ENTITY, initialEntity);
    this.set(STORAGE_KEYS.ENTITIES_CONFIG, initialEntitiesConfig);
    this.set(STORAGE_KEYS.ACTIVE_ENTITY_ID, 'pvt_ltd');
    this.set(STORAGE_KEYS.STOCK_ALLOCATIONS, initialStockAllocations);
    this.set(STORAGE_KEYS.SISTER_INVOICES, initialSisterDownstreamInvoices);
    this.set(STORAGE_KEYS.INTER_ENTITY_SETTLEMENTS, initialInterEntitySettlements);
    this.set(STORAGE_KEYS.SALES_INVOICES, initialSalesInvoices);
    this.set(STORAGE_KEYS.SALES_QUOTATIONS, initialSalesQuotations);
    this.set(STORAGE_KEYS.PACKING_FLOOR_JOBS, initialPackingFloorJobs);
    this.set(STORAGE_KEYS.PACKAGING_SPECS, initialPackagingSpecs);
    this.set(STORAGE_KEYS.MANDI_SPOT_RATES, initialMandiSpotRates);
    this.set(STORAGE_KEYS.DAILY_TODOS, initialDailyTodos);
    this.set(STORAGE_KEYS.DAY_END_REPORTS, initialDayEndReports);
    this.set(STORAGE_KEYS.SYSTEM_USERS, PREDEFINED_USERS);
    this.set(STORAGE_KEYS.VOIDED_INVOICES, initialVoidedInvoices);
    this.set(STORAGE_KEYS.ITEMS, initialItems);
    this.set(STORAGE_KEYS.LOTS, initialLots);
    this.set(STORAGE_KEYS.MOVEMENTS, initialMovements);
    this.set(STORAGE_KEYS.RECIPES, initialRecipes);
    this.set(STORAGE_KEYS.BATCHES, initialBatches);
    this.set(STORAGE_KEYS.PARTIES, initialParties);
    this.set(STORAGE_KEYS.ACCOUNTS, initialAccounts);
    this.set(STORAGE_KEYS.TRANSACTIONS, initialTransactions);
    this.set(STORAGE_KEYS.BILLS, initialBills);
    this.set(STORAGE_KEYS.ASSETS, initialAssets);
    this.set(STORAGE_KEYS.EMPLOYEES, initialEmployees);
    this.set(STORAGE_KEYS.LOANS, initialLoans);
    this.set(STORAGE_KEYS.CAMPAIGNS, initialCampaigns);
    this.set(STORAGE_KEYS.SETTLEMENTS, initialSettlements);
    this.set(STORAGE_KEYS.LICENCES, initialLicences);
    this.set(STORAGE_KEYS.PURCHASE_ORDERS, initialPurchaseOrders);
    this.set(STORAGE_KEYS.INTERFIRM_TRANSFERS, initialInterFirmTransfers);
    this.set(STORAGE_KEYS.EXPORT_SHIPMENTS, initialExportShipments);
    this.set(STORAGE_KEYS.OUTBOX, []);
  }

  // Export full backup
  exportFullDatabaseJSON(): string {
    return JSON.stringify(
      {
        entity: this.getEntity(),
        entitiesConfig: this.getEntitiesConfig(),
        stockAllocations: this.getStockAllocations(),
        sisterInvoices: this.getSisterDownstreamInvoices(),
        interEntitySettlements: this.getInterEntitySettlements(),
        salesInvoices: this.getSalesInvoices(),
        salesQuotations: this.getSalesQuotations(),
        packingFloorJobs: this.getPackingFloorJobs(),
        packagingSpecs: this.getPackagingSpecs(),
        mandiSpotRates: this.getMandiSpotRates(),
        dailyTodos: this.getDailyTodos(),
        dayEndReports: this.getDayEndReports(),
        systemUsers: this.getAllSystemUsers(),
        voidedInvoices: this.getVoidedInvoicesAudit(),
        items: this.getItems(),
        lots: this.getLots(),
        movements: this.getMovements(),
        recipes: this.getRecipes(),
        batches: this.getBatches(),
        parties: this.getParties(),
        accounts: this.getAccounts(),
        transactions: this.getTransactions(),
        bills: this.getBills(),
        assets: this.getAssets(),
        employees: this.getEmployees(),
        loans: this.getLoans(),
        campaigns: this.getCampaigns(),
        settlements: this.getSettlements(),
        licences: this.getLicences(),
        purchaseOrders: this.getPurchaseOrders(),
        interFirmTransfers: this.getInterFirmTransfers(),
        exportShipments: this.getExportShipments(),
        exportedAt: new Date().toISOString(),
        version: '1.5.0',
      },
      null,
      2
    );
  }

  // Import full backup
  importFullDatabaseJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.items && data.batches && data.accounts) {
        if (data.entity) this.set(STORAGE_KEYS.ENTITY, data.entity);
        if (data.entitiesConfig) this.set(STORAGE_KEYS.ENTITIES_CONFIG, data.entitiesConfig);
        if (data.stockAllocations) this.set(STORAGE_KEYS.STOCK_ALLOCATIONS, data.stockAllocations);
        if (data.sisterInvoices) this.set(STORAGE_KEYS.SISTER_INVOICES, data.sisterInvoices);
        if (data.interEntitySettlements) this.set(STORAGE_KEYS.INTER_ENTITY_SETTLEMENTS, data.interEntitySettlements);
        if (data.salesInvoices) this.set(STORAGE_KEYS.SALES_INVOICES, data.salesInvoices);
        if (data.salesQuotations) this.set(STORAGE_KEYS.SALES_QUOTATIONS, data.salesQuotations);
        if (data.packingFloorJobs) this.set(STORAGE_KEYS.PACKING_FLOOR_JOBS, data.packingFloorJobs);
        if (data.packagingSpecs) this.set(STORAGE_KEYS.PACKAGING_SPECS, data.packagingSpecs);
        if (data.mandiSpotRates) this.set(STORAGE_KEYS.MANDI_SPOT_RATES, data.mandiSpotRates);
        if (data.dailyTodos) this.set(STORAGE_KEYS.DAILY_TODOS, data.dailyTodos);
        if (data.dayEndReports) this.set(STORAGE_KEYS.DAY_END_REPORTS, data.dayEndReports);
        if (data.systemUsers) this.set(STORAGE_KEYS.SYSTEM_USERS, data.systemUsers);
        if (data.voidedInvoices) this.set(STORAGE_KEYS.VOIDED_INVOICES, data.voidedInvoices);
        if (data.items) this.set(STORAGE_KEYS.ITEMS, data.items);
        if (data.lots) this.set(STORAGE_KEYS.LOTS, data.lots);
        if (data.movements) this.set(STORAGE_KEYS.MOVEMENTS, data.movements);
        if (data.recipes) this.set(STORAGE_KEYS.RECIPES, data.recipes);
        if (data.batches) this.set(STORAGE_KEYS.BATCHES, data.batches);
        if (data.parties) this.set(STORAGE_KEYS.PARTIES, data.parties);
        if (data.accounts) this.set(STORAGE_KEYS.ACCOUNTS, data.accounts);
        if (data.transactions) this.set(STORAGE_KEYS.TRANSACTIONS, data.transactions);
        if (data.bills) this.set(STORAGE_KEYS.BILLS, data.bills);
        if (data.assets) this.set(STORAGE_KEYS.ASSETS, data.assets);
        if (data.employees) this.set(STORAGE_KEYS.EMPLOYEES, data.employees);
        if (data.loans) this.set(STORAGE_KEYS.LOANS, data.loans);
        if (data.campaigns) this.set(STORAGE_KEYS.CAMPAIGNS, data.campaigns);
        if (data.settlements) this.set(STORAGE_KEYS.SETTLEMENTS, data.settlements);
        if (data.licences) this.set(STORAGE_KEYS.LICENCES, data.licences);
        if (data.purchaseOrders) this.set(STORAGE_KEYS.PURCHASE_ORDERS, data.purchaseOrders);
        if (data.interFirmTransfers) this.set(STORAGE_KEYS.INTERFIRM_TRANSFERS, data.interFirmTransfers);
        if (data.exportShipments) this.set(STORAGE_KEYS.EXPORT_SHIPMENTS, data.exportShipments);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export const db = new StorageEngine();
