# Backend Schema & Database Architecture
## Project Name: Adalaj Packing Ops & Financial Intelligence System
**Document Version:** 1.0.0  
**Database Technology:** Cloudflare D1 (Edge SQLite Relational Engine) / PostgreSQL via Drizzle ORM  
**Data Integrity:** Foreign Key Enforcements, Strict Typing, Atomic Transactions, Append-Only Ledgers  

---

### 1. Entity Relationship Overview

```
 [ Parties ] (Vendors, Job Workers, Customers)
     |
     +---< [ Inward Lots (GRN) ] >---+ [ Inventory Items / SKUs ]
     |                               |
     +---< [ Vendor Bills ]          +---< [ Stock Movements ]
     |                               |
     +---< [ Transactions (Ledger) ] |
                                     +---< [ Recipes / BOMs ]
 [ Plant Machines ]                  |           |
     |                               |           v
     +---< [ Packing Batches ] >-----+---< [ Batch BOM Outputs ]
                 |
                 +---< [ Batch Workers / Shifts ]

 [ Bank & Cash Accounts ]
     |
     +---< [ Transactions (Ledger) ]
     |
     +---< [ Loan Repayments ] >--- [ Debt & Loans ]

 [ Employees ]
     |
     +---< [ Payroll Ledger / Slips ]
```

---

### 2. Drizzle ORM Schema Definitions (TypeScript)

```typescript
import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

// 1. Accounts Master (Cash Safe, HDFC Bank, UPI)
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['bank', 'cash_safe', 'petty_cash', 'upi_wallet'] }).notNull(),
  accountNoMasked: text('account_no_masked'),
  ifscCode: text('ifsc_code'),
  branch: text('branch'),
  balancePaise: integer('balance_paise').notNull().default(0), // All currency in integer paise (₹ 1 = 100 paise)
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 2. Parties Master (Suppliers, Transporters, Job Workers, Customers)
export const parties = sqliteTable('parties', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type', { enum: ['supplier', 'customer', 'job_worker', 'transporter', 'service_provider'] }).notNull(),
  phone: text('phone'),
  email: text('email'),
  gstin: text('gstin'),
  pan: text('pan'),
  msmeRegNo: text('msme_reg_no'), // Crucial for 45-day payment tracking
  city: text('city').notNull(),
  state: text('state').notNull().default('Gujarat'),
  creditDays: integer('credit_days').default(30),
  outstandingPaise: integer('outstanding_paise').notNull().default(0), // Positive: We owe them; Negative: They owe us
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  partyTypeIdx: index('party_type_idx').on(table.type),
  gstinIdx: index('gstin_idx').on(table.gstin),
}));

// 3. Inventory Items / SKUs Master
export const items = sqliteTable('items', {
  id: text('id').primaryKey(),
  skuCode: text('sku_code').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  type: text('type', { enum: ['raw_material', 'packing_material', 'wip_powder', 'finished_good'] }).notNull(),
  unit: text('unit', { enum: ['kg', 'gram', 'piece', 'roll', 'carton'] }).notNull(),
  hsnCode: text('hsn_code').notNull(),
  gstRatePct: real('gst_rate_pct').notNull().default(5.0),
  reorderLevelBase: integer('reorder_level_base').notNull().default(0),
  currentStockBase: integer('current_stock_base').notNull().default(0), // In grams for powder, pieces for pouches
  averageCostPaise: integer('average_cost_paise').notNull().default(0), // Weighted moving average cost per base unit
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  itemTypeIdx: index('item_type_idx').on(table.type),
  skuIdx: index('sku_idx').on(table.skuCode),
}));

// 4. Inward Stock Lots (GRN for Powder & Foils)
export const stockLots = sqliteTable('stock_lots', {
  id: text('id').primaryKey(),
  lotNo: text('lot_no').notNull().unique(),
  itemId: text('item_id').notNull().references(() => items.id),
  itemName: text('item_name').notNull(),
  supplierPartyId: text('supplier_party_id').references(() => parties.id),
  supplierName: text('supplier_name').notNull(),
  supplierLotNo: text('supplier_lot_no'),
  inwardDate: text('inward_date').notNull(),
  expiryDate: text('expiry_date').notNull(),
  locationId: text('location_id').notNull().default('loc_adalaj_godown'), // 'loc_adalaj_godown' or 'loc_packer'
  qtyBase: integer('qty_base').notNull(), // Available balance in grams or pieces
  initialQtyBase: integer('initial_qty_base').notNull(),
  landedCostPerKgPaise: integer('landed_cost_per_kg_paise').notNull(),
  status: text('status', { enum: ['available', 'hold', 'exhausted', 'rejected'] }).notNull().default('available'),
  qcRemarks: text('qc_remarks'),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  lotStatusIdx: index('lot_status_idx').on(table.status),
  lotItemIdx: index('lot_item_idx').on(table.itemId),
}));

// 5. Stock Movement Ledger (Append-Only)
export const stockMovements = sqliteTable('stock_movements', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  itemId: text('item_id').notNull().references(() => items.id),
  itemName: text('item_name').notNull(),
  lotId: text('lot_id').references(() => stockLots.id),
  lotNo: text('lot_no'),
  type: text('type', { enum: ['grn_inward', 'issue_batch', 'production_yield', 'dispatch_job_work', 'receipt_job_work', 'sales_dispatch', 'adjustment', 'waste_scrap'] }).notNull(),
  locationId: text('location_id').notNull(),
  locationName: text('location_name').notNull(),
  qtyBase: integer('qty_base').notNull(), // Signed integer (+ received, - consumed)
  unit: text('unit').notNull(),
  reference: text('reference').notNull(), // Batch # or Bill # or Challan #
  notes: text('notes'),
  createdBy: text('created_by').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  movItemIdx: index('mov_item_idx').on(table.itemId),
  movDateIdx: index('mov_date_idx').on(table.date),
  movRefIdx: index('mov_ref_idx').on(table.reference),
}));

// 6. Recipe Master & Bills of Materials (BOM)
export const recipes = sqliteTable('recipes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  productLine: text('product_line', { enum: ['line_a_own', 'line_b_jobwork'] }).notNull(),
  packSizeGrams: integer('pack_size_grams').notNull(),
  targetFinishedItemId: text('target_finished_item_id').notNull().references(() => items.id),
  rawPowderItemId: text('raw_powder_item_id').notNull().references(() => items.id),
  pouchItemId: text('pouch_item_id').notNull().references(() => items.id),
  stickerItemId: text('sticker_item_id').references(() => items.id),
  cartonItemId: text('carton_item_id').references(() => items.id),
  packsPerCarton: integer('packs_per_carton').notNull().default(50),
  standardSpeedPacksPerHour: integer('standard_speed_packs_per_hour').notNull().default(600),
  isCurrentLineMachine: integer('is_current_line_machine', { mode: 'boolean' }).default(true),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

// 7. Packing Batches (BMR - Batch Manufacturing Records)
export const packingBatches = sqliteTable('packing_batches', {
  id: text('id').primaryKey(),
  batchNo: text('batch_no').notNull().unique(),
  recipeId: text('recipe_id').notNull().references(() => recipes.id),
  date: text('date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  shift: text('shift', { enum: ['Day Shift', 'Night Shift'] }).notNull(),
  machineId: text('machine_id').notNull(),
  machineName: text('machine_name').notNull(),
  productLine: text('product_line', { enum: ['line_a_own', 'line_b_jobwork'] }).notNull(),
  rawLotId: text('raw_lot_id').notNull().references(() => stockLots.id),
  rawLotNo: text('raw_lot_no').notNull(),
  rawIssuedGrams: integer('raw_issued_grams').notNull(),
  rawConsumedGrams: integer('raw_consumed_grams').notNull(),
  bakingWeightLossGrams: integer('baking_weight_loss_grams').notNull().default(0),
  floorSpillGrams: integer('floor_spill_grams').notNull().default(0),
  damagedPackagingQty: integer('damaged_packaging_qty').notNull().default(0),
  targetPacks: integer('target_packs').notNull(),
  actualPacksProduced: integer('actual_packs_produced').notNull(),
  yieldPercentage: real('yield_percentage').notNull(),
  costPerPackPaise: integer('cost_per_pack_paise').notNull(),
  status: text('status', { enum: ['running', 'completed', 'voided'] }).notNull().default('running'),
  supervisorName: text('supervisor_name').notNull(),
  workersAssigned: text('workers_assigned'), // JSON array of worker names
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  batchStatusIdx: index('batch_status_idx').on(table.status),
  batchNoIdx: index('batch_no_idx').on(table.batchNo),
  batchDateIdx: index('batch_date_idx').on(table.date),
}));

// 8. Financial Transactions Ledger (Vouchers)
export const transactions = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  txnNo: text('txn_no').notNull().unique(),
  date: text('date').notNull(),
  direction: text('direction', { enum: ['in', 'out'] }).notNull(),
  accountId: text('account_id').notNull().references(() => accounts.id),
  accountName: text('account_name').notNull(),
  partyId: text('party_id').references(() => parties.id),
  partyName: text('party_name').notNull(),
  amountPaise: integer('amount_paise').notNull(),
  headCategory: text('head_category').notNull(),
  productLine: text('product_line', { enum: ['line_a', 'line_b', 'shared'] }).notNull().default('shared'),
  batchId: text('batch_id').references(() => packingBatches.id),
  mode: text('mode').notNull(),
  reference: text('reference').notNull(),
  status: text('status', { enum: ['posted', 'pending_approval', 'reconciled', 'voided'] }).notNull().default('posted'),
  hasAttachment: integer('has_attachment', { mode: 'boolean' }).default(false),
  attachmentR2Key: text('attachment_r2_key'),
  notes: text('notes'),
  createdBy: text('created_by').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  txnDateIdx: index('txn_date_idx').on(table.date),
  txnAccountIdx: index('txn_account_idx').on(table.accountId),
  txnHeadIdx: index('txn_head_idx').on(table.headCategory),
}));

// 9. Vendor Bills (Purchases & Overheads Invoices)
export const bills = sqliteTable('bills', {
  id: text('id').primaryKey(),
  billNo: text('bill_no').notNull(),
  partyId: text('party_id').notNull().references(() => parties.id),
  partyName: text('party_name').notNull(),
  date: text('date').notNull(),
  dueDate: text('due_date').notNull(),
  subtotalPaise: integer('subtotal_paise').notNull(),
  gstPaise: integer('gst_paise').notNull(),
  totalPaise: integer('total_paise').notNull(),
  paidPaise: integer('paid_paise').notNull().default(0),
  status: text('status', { enum: ['pending', 'part_paid', 'paid', 'cancelled'] }).notNull().default('pending'),
  itemsDescription: text('items_description'),
  attachmentR2Key: text('attachment_r2_key'),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  billPartyIdx: index('bill_party_idx').on(table.partyId),
  billDueDateIdx: index('bill_due_date_idx').on(table.dueDate),
  billStatusIdx: index('bill_status_idx').on(table.status),
}));

// 10. Employees & Payroll Register
export const employees = sqliteTable('employees', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  designation: text('designation').notNull(),
  payType: text('pay_type', { enum: ['monthly', 'daily', 'piece_rate'] }).notNull(),
  ratePaise: integer('rate_paise').notNull(), // Monthly base paise, or daily rate paise, or paise per piece
  phone: text('phone').notNull(),
  uan: text('uan'), // Universal Account Number for EPF
  esicNo: text('esic_no'),
  bankAccountNo: text('bank_account_no'),
  bankIfsc: text('bank_ifsc'),
  active: integer('active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').notNull(),
});

// 11. Plant Machinery & Fixed Assets
export const machines = sqliteTable('machines', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  serialNo: text('serial_no').notNull().unique(),
  purchaseDate: text('purchase_date').notNull(),
  costPaise: integer('cost_paise').notNull(),
  depreciationRatePct: real('depreciation_rate_pct').notNull(),
  currentBookValuePaise: integer('current_book_value_paise').notNull(),
  totalBatchHours: real('total_batch_hours').default(0),
  lastServiceDate: text('last_service_date'),
  nextServiceDate: text('next_service_date'),
  status: text('status', { enum: ['operational', 'maintenance', 'idle'] }).notNull().default('operational'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

// 12. Loans & Borrowings Register
export const loans = sqliteTable('loans', {
  id: text('id').primaryKey(),
  lenderName: text('lender_name').notNull(),
  kind: text('kind', { enum: ['machinery', 'working_capital', 'unsecured', 'partner'] }).notNull(),
  principalPaise: integer('principal_paise').notNull(),
  balancePaise: integer('balance_paise').notNull(),
  rateAnnualPct: real('rate_annual_pct').notNull(),
  emiPaise: integer('emi_paise').notNull(),
  nextDueDate: text('next_due_date').notNull(),
  tenureMonthsRemaining: integer('tenure_months_remaining').notNull(),
  createdAt: text('created_at').notNull(),
});

// 13. Offline Outbox Event Ledger
export const outboxEvents = sqliteTable('outbox_events', {
  id: text('id').primaryKey(),
  action: text('action', { enum: ['create', 'update', 'delete', 'void'] }).notNull(),
  entity: text('entity').notNull(), // 'batch', 'transaction', 'lot', etc.
  payloadJson: text('payload_json').notNull(),
  deviceId: text('device_id').notNull(),
  createdAt: text('created_at').notNull(),
  status: text('status', { enum: ['pending', 'synced', 'conflict'] }).notNull().default('pending'),
  syncedAt: text('synced_at'),
}, (table) => ({
  outboxStatusIdx: index('outbox_status_idx').on(table.status),
}));
```

---

### 3. Database Indexes & Query Optimizations
- **Composite Index on Transactions:** `(accountId, date)` for sub-millisecond bank balance ledger calculations.
- **Index on Stock Lots:** `(status, itemId)` for immediate selection of active, approved powder batches.
- **Index on MSME Bills:** `(status, dueDate)` for instant alert generation for payments approaching the statutory 45-day window.
