-- Migration 0004: Dual Legal Entities, Customer Channel Classifications, Stock Allocations, Downstream Secondary Invoicing, and Inter-Entity Settlements
-- Database: adalaj-erp-db

-- 1. Entities Configuration Table
CREATE TABLE IF NOT EXISTS entities_config (
  id TEXT PRIMARY KEY, -- 'pvt_ltd', 'sister_prop'
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  legal_type TEXT NOT NULL,
  trade_name TEXT NOT NULL,
  cin_or_reg TEXT NOT NULL,
  gstin TEXT NOT NULL,
  pan TEXT NOT NULL,
  address TEXT NOT NULL,
  state_code TEXT NOT NULL DEFAULT '24',
  bank_account TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  ifsc TEXT NOT NULL,
  role_description TEXT NOT NULL,
  credit_limit_with_parent_paise INTEGER DEFAULT 0,
  default_credit_period_days INTEGER DEFAULT 30,
  color_code TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Inter-Entity Stock Allocations (Periodic Cycles: Biweekly / Monthly)
CREATE TABLE IF NOT EXISTS inter_entity_stock_allocations (
  id TEXT PRIMARY KEY,
  allocation_number TEXT NOT NULL UNIQUE,
  cycle TEXT CHECK(cycle IN ('biweekly', 'monthly')) NOT NULL,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  credit_due_date TEXT NOT NULL,
  source_entity_id TEXT NOT NULL REFERENCES entities_config(id),
  destination_entity_id TEXT NOT NULL REFERENCES entities_config(id),
  total_allocated_grams INTEGER NOT NULL DEFAULT 0,
  total_valuation_paise INTEGER NOT NULL DEFAULT 0,
  settled_amount_paise INTEGER NOT NULL DEFAULT 0,
  balance_outstanding_paise INTEGER NOT NULL DEFAULT 0,
  status TEXT CHECK(status IN ('active', 'partially_settled', 'fully_settled', 'closed')) NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS alloc_status_idx ON inter_entity_stock_allocations(status);
CREATE INDEX IF NOT EXISTS alloc_due_date_idx ON inter_entity_stock_allocations(credit_due_date);

-- 3. Sister Downstream Secondary Invoices (Gujarat Distribution & Secondary Trade)
CREATE TABLE IF NOT EXISTS sister_downstream_invoices (
  id TEXT PRIMARY KEY,
  invoice_no TEXT NOT NULL UNIQUE,
  date TEXT NOT NULL,
  channel TEXT NOT NULL,
  customer_id TEXT NOT NULL REFERENCES parties(id),
  customer_name TEXT NOT NULL,
  customer_gstin TEXT,
  customer_city TEXT NOT NULL,
  customer_phone TEXT,
  payment_due_date TEXT NOT NULL,
  payment_status TEXT CHECK(payment_status IN ('unpaid', 'part_paid', 'paid')) NOT NULL DEFAULT 'unpaid',
  total_grams INTEGER NOT NULL DEFAULT 0,
  taxable_amount_paise INTEGER NOT NULL DEFAULT 0,
  cgst_paise INTEGER NOT NULL DEFAULT 0,
  sgst_paise INTEGER NOT NULL DEFAULT 0,
  total_paise INTEGER NOT NULL DEFAULT 0,
  paid_amount_paise INTEGER NOT NULL DEFAULT 0,
  balance_due_paise INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS sis_inv_channel_idx ON sister_downstream_invoices(channel);
CREATE INDEX IF NOT EXISTS sis_inv_payment_status_idx ON sister_downstream_invoices(payment_status);

-- 4. Sister Downstream Invoice Line Items
CREATE TABLE IF NOT EXISTS sister_downstream_invoice_items (
  id TEXT PRIMARY KEY,
  invoice_id TEXT NOT NULL REFERENCES sister_downstream_invoices(id),
  item_id TEXT NOT NULL REFERENCES items(id),
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  pack_size_grams INTEGER NOT NULL,
  batch_no TEXT NOT NULL,
  qty_packs INTEGER NOT NULL,
  total_grams INTEGER NOT NULL,
  rate_per_pack_paise INTEGER NOT NULL,
  taxable_amount_paise INTEGER NOT NULL,
  gst_rate_pct INTEGER NOT NULL DEFAULT 5,
  cgst_paise INTEGER NOT NULL DEFAULT 0,
  sgst_paise INTEGER NOT NULL DEFAULT 0,
  total_paise INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS sis_inv_items_idx ON sister_downstream_invoice_items(invoice_id);

-- 5. Inter-Entity Settlements (Remittances & Vouchers)
CREATE TABLE IF NOT EXISTS inter_entity_settlements (
  id TEXT PRIMARY KEY,
  settlement_no TEXT NOT NULL UNIQUE,
  date TEXT NOT NULL,
  amount_paise INTEGER NOT NULL,
  remitted_from_account_id TEXT NOT NULL REFERENCES accounts(id),
  deposited_to_account_id TEXT NOT NULL REFERENCES accounts(id),
  payment_mode TEXT CHECK(payment_mode IN ('NEFT', 'RTGS', 'IMPS', 'Cheque')) NOT NULL,
  bank_utr_ref TEXT NOT NULL,
  settlement_type TEXT CHECK(settlement_type IN ('stock_advance', 'interim_settlement', 'final_cycle_clearance')) NOT NULL,
  linked_allocation_id TEXT,
  notes TEXT,
  verified_by_auditor INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ies_utr_idx ON inter_entity_settlements(bank_utr_ref);
CREATE INDEX IF NOT EXISTS ies_date_idx ON inter_entity_settlements(date);
