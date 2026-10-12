-- Initial D1 SQLite Schema for Adalaj Operations ERP
-- Database: adalaj-erp-db

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('bank', 'cash_safe', 'petty_cash', 'upi_wallet')) NOT NULL,
  account_no_masked TEXT,
  ifsc_code TEXT,
  branch TEXT,
  balance_paise INTEGER NOT NULL DEFAULT 0,
  is_default INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS parties (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('supplier', 'customer', 'job_worker', 'transporter', 'service_provider')) NOT NULL,
  phone TEXT,
  email TEXT,
  gstin TEXT,
  pan TEXT,
  msme_reg_no TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Gujarat',
  credit_days INTEGER DEFAULT 30,
  outstanding_paise INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS party_type_idx ON parties(type);
CREATE INDEX IF NOT EXISTS gstin_idx ON parties(gstin);

CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  sku_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT CHECK(type IN ('raw_material', 'packing_material', 'wip_powder', 'finished_good')) NOT NULL,
  unit TEXT CHECK(unit IN ('kg', 'gram', 'piece', 'roll', 'carton')) NOT NULL,
  hsn_code TEXT NOT NULL,
  gst_rate_pct REAL NOT NULL DEFAULT 5.0,
  reorder_level_base INTEGER NOT NULL DEFAULT 0,
  current_stock_base INTEGER NOT NULL DEFAULT 0,
  average_cost_paise INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS item_type_idx ON items(type);
CREATE INDEX IF NOT EXISTS sku_idx ON items(sku_code);

CREATE TABLE IF NOT EXISTS stock_lots (
  id TEXT PRIMARY KEY,
  lot_no TEXT NOT NULL UNIQUE,
  item_id TEXT NOT NULL REFERENCES items(id),
  item_name TEXT NOT NULL,
  supplier_party_id TEXT REFERENCES parties(id),
  supplier_name TEXT NOT NULL,
  supplier_lot_no TEXT,
  inward_date TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  location_id TEXT NOT NULL DEFAULT 'loc_adalaj_godown',
  qty_base INTEGER NOT NULL,
  initial_qty_base INTEGER NOT NULL,
  landed_cost_per_kg_paise INTEGER NOT NULL,
  status TEXT CHECK(status IN ('available', 'hold', 'exhausted', 'rejected')) NOT NULL DEFAULT 'available',
  qc_remarks TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS lot_status_idx ON stock_lots(status);
CREATE INDEX IF NOT EXISTS lot_item_idx ON stock_lots(item_id);

CREATE TABLE IF NOT EXISTS stock_movements (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  item_id TEXT NOT NULL REFERENCES items(id),
  item_name TEXT NOT NULL,
  lot_id TEXT REFERENCES stock_lots(id),
  lot_no TEXT,
  type TEXT CHECK(type IN ('grn_inward', 'issue_batch', 'production_yield', 'dispatch_job_work', 'receipt_job_work', 'sales_dispatch', 'adjustment', 'waste_scrap')) NOT NULL,
  location_id TEXT NOT NULL,
  location_name TEXT NOT NULL,
  qty_base INTEGER NOT NULL,
  unit TEXT NOT NULL,
  reference TEXT NOT NULL,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS mov_item_idx ON stock_movements(item_id);
CREATE INDEX IF NOT EXISTS mov_date_idx ON stock_movements(date);
CREATE INDEX IF NOT EXISTS mov_ref_idx ON stock_movements(reference);

CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  product_line TEXT CHECK(product_line IN ('line_a_own', 'line_b_jobwork')) NOT NULL,
  pack_size_grams INTEGER NOT NULL,
  target_finished_item_id TEXT NOT NULL REFERENCES items(id),
  raw_powder_item_id TEXT NOT NULL REFERENCES items(id),
  pouch_item_id TEXT NOT NULL REFERENCES items(id),
  sticker_item_id TEXT REFERENCES items(id),
  carton_item_id TEXT REFERENCES items(id),
  packs_per_carton INTEGER NOT NULL DEFAULT 50,
  standard_speed_packs_per_hour INTEGER NOT NULL DEFAULT 600,
  is_current_line_machine INTEGER DEFAULT 1,
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS packing_batches (
  id TEXT PRIMARY KEY,
  batch_no TEXT NOT NULL UNIQUE,
  recipe_id TEXT NOT NULL REFERENCES recipes(id),
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  shift TEXT CHECK(shift IN ('Day Shift', 'Night Shift')) NOT NULL,
  machine_id TEXT NOT NULL,
  machine_name TEXT NOT NULL,
  product_line TEXT CHECK(product_line IN ('line_a_own', 'line_b_jobwork')) NOT NULL,
  raw_lot_id TEXT NOT NULL REFERENCES stock_lots(id),
  raw_lot_no TEXT NOT NULL,
  raw_issued_grams INTEGER NOT NULL,
  raw_consumed_grams INTEGER NOT NULL,
  baking_weight_loss_grams INTEGER NOT NULL DEFAULT 0,
  floor_spill_grams INTEGER NOT NULL DEFAULT 0,
  damaged_packaging_qty INTEGER NOT NULL DEFAULT 0,
  target_packs INTEGER NOT NULL,
  actual_packs_produced INTEGER NOT NULL,
  yield_percentage REAL NOT NULL,
  cost_per_pack_paise INTEGER NOT NULL,
  status TEXT CHECK(status IN ('running', 'completed', 'voided')) NOT NULL DEFAULT 'running',
  supervisor_name TEXT NOT NULL,
  workers_assigned TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS batch_status_idx ON packing_batches(status);
CREATE INDEX IF NOT EXISTS batch_no_idx ON packing_batches(batch_no);
CREATE INDEX IF NOT EXISTS batch_date_idx ON packing_batches(date);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  txn_no TEXT NOT NULL UNIQUE,
  date TEXT NOT NULL,
  direction TEXT CHECK(direction IN ('in', 'out')) NOT NULL,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  account_name TEXT NOT NULL,
  party_id TEXT REFERENCES parties(id),
  party_name TEXT NOT NULL,
  amount_paise INTEGER NOT NULL,
  head_category TEXT NOT NULL,
  product_line TEXT CHECK(product_line IN ('line_a', 'line_b', 'shared')) NOT NULL DEFAULT 'shared',
  batch_id TEXT REFERENCES packing_batches(id),
  mode TEXT NOT NULL,
  reference TEXT NOT NULL,
  status TEXT CHECK(status IN ('posted', 'pending_approval', 'reconciled', 'voided')) NOT NULL DEFAULT 'posted',
  has_attachment INTEGER DEFAULT 0,
  attachment_r2_key TEXT,
  notes TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS txn_date_idx ON transactions(date);
CREATE INDEX IF NOT EXISTS txn_account_idx ON transactions(account_id);
CREATE INDEX IF NOT EXISTS txn_head_idx ON transactions(head_category);

CREATE TABLE IF NOT EXISTS bills (
  id TEXT PRIMARY KEY,
  bill_no TEXT NOT NULL,
  party_id TEXT NOT NULL REFERENCES parties(id),
  party_name TEXT NOT NULL,
  date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  subtotal_paise INTEGER NOT NULL,
  gst_paise INTEGER NOT NULL,
  total_paise INTEGER NOT NULL,
  paid_paise INTEGER NOT NULL DEFAULT 0,
  status TEXT CHECK(status IN ('pending', 'part_paid', 'paid', 'cancelled')) NOT NULL DEFAULT 'pending',
  items_description TEXT,
  attachment_r2_key TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS bill_party_idx ON bills(party_id);
CREATE INDEX IF NOT EXISTS bill_due_date_idx ON bills(due_date);
CREATE INDEX IF NOT EXISTS bill_status_idx ON bills(status);

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  pay_type TEXT CHECK(pay_type IN ('monthly', 'daily', 'piece_rate')) NOT NULL,
  rate_paise INTEGER NOT NULL,
  phone TEXT NOT NULL,
  uan TEXT,
  esic_no TEXT,
  bank_account_no TEXT,
  bank_ifsc TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS machines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  serial_no TEXT NOT NULL UNIQUE,
  purchase_date TEXT NOT NULL,
  cost_paise INTEGER NOT NULL,
  depreciation_rate_pct REAL NOT NULL,
  current_book_value_paise INTEGER NOT NULL,
  total_batch_hours REAL DEFAULT 0,
  last_service_date TEXT,
  next_service_date TEXT,
  status TEXT CHECK(status IN ('operational', 'maintenance', 'idle')) NOT NULL DEFAULT 'operational',
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY,
  lender_name TEXT NOT NULL,
  kind TEXT CHECK(kind IN ('machinery', 'working_capital', 'unsecured', 'partner')) NOT NULL,
  principal_paise INTEGER NOT NULL,
  balance_paise INTEGER NOT NULL,
  rate_annual_pct REAL NOT NULL,
  emi_paise INTEGER NOT NULL,
  next_due_date TEXT NOT NULL,
  tenure_months_remaining INTEGER NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS outbox_events (
  id TEXT PRIMARY KEY,
  action TEXT CHECK(action IN ('create', 'update', 'delete', 'void')) NOT NULL,
  entity TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  device_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT CHECK(status IN ('pending', 'synced', 'conflict')) NOT NULL DEFAULT 'pending',
  synced_at TEXT
);
CREATE INDEX IF NOT EXISTS outbox_status_idx ON outbox_events(status);
