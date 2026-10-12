import {
  BusinessEntity,
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
} from '../types';

const STORAGE_KEYS = {
  ENTITY: 'packing_ops_entity_v1',
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
};

// Initial Seed Data
const initialEntity: BusinessEntity = {
  id: 'ent_adalaj_01',
  name: 'Shree Krishna Packaging & Spice Hub',
  location: 'Sarkhej-Gandhinagar Highway, Near Adalaj, Gujarat 382421',
  gstin: '24AAGCS9412F1Z4',
  pan: 'AAGCS9412F',
  financialYearStart: '04-01',
  currency: 'INR',
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
  {
    id: 'party_unjha_mandi',
    name: 'Unjha Mandi Spice Traders',
    type: 'supplier',
    phone: '+91 98250 11234',
    gstin: '24AACFU8821B1Z2',
    city: 'Unjha, Mehsana',
    creditDays: 30,
    outstandingPaise: 14500000, // ₹1,45,000 we owe them
  },
  {
    id: 'party_polyfilms',
    name: 'Gujarat Polyfilms Packaging Ltd',
    type: 'supplier',
    phone: '+91 97240 55678',
    gstin: '24AAACG3312Q1Z9',
    city: 'Changodar, Ahmedabad',
    creditDays: 21,
    outstandingPaise: 6800000, // ₹68,000 we owe
  },
  {
    id: 'party_mahavir_packer',
    name: 'Mahavir Packaging & Job Works (Sanand)',
    type: 'packer',
    phone: '+91 94260 99811',
    gstin: '24AAGFM5519J1ZY',
    city: 'Sanand GIDC, Ahmedabad',
    creditDays: 15,
    outstandingPaise: 2450000, // ₹24,500 payable for job work
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
  },
  {
    id: 'party_dist_shivam',
    name: 'Shivam Super Kirana & FMCG Distributors',
    type: 'customer',
    phone: '+91 98241 87654',
    gstin: '24ABGFS1190L1ZO',
    city: 'Kalol & Gandhinagar',
    creditDays: 15,
    outstandingPaise: -38500000, // -₹3,85,000 they owe us (receivable)
  },
];

const initialAccounts: Account[] = [
  {
    id: 'acc_cash_safe',
    name: 'Factory Cash in Safe',
    type: 'cash',
    balancePaise: 4520000, // ₹45,200
  },
  {
    id: 'acc_hdfc_curr',
    name: 'HDFC Current A/c (Adalaj Branch - 50200088)',
    type: 'bank',
    accountNoMasked: 'HDFC •••• 8824',
    balancePaise: 84215000, // ₹8,42,150
  },
  {
    id: 'acc_sbi_mach',
    name: 'SBI Machinery & Packing CC A/c (3918002)',
    type: 'bank',
    accountNoMasked: 'SBI •••• 8002',
    balancePaise: 31560000, // ₹3,15,600
  },
  {
    id: 'acc_petty',
    name: 'Petty Cash Floor Register (Supervisor)',
    type: 'petty_cash',
    balancePaise: 1280000, // ₹12,800
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

  // Reset to initial starter template
  resetStarterTemplate(): void {
    this.set(STORAGE_KEYS.ENTITY, initialEntity);
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
    this.set(STORAGE_KEYS.OUTBOX, []);
  }

  // Export full backup
  exportFullDatabaseJSON(): string {
    return JSON.stringify(
      {
        entity: this.getEntity(),
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
        exportedAt: new Date().toISOString(),
        version: '1.1.0',
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
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

export const db = new StorageEngine();
