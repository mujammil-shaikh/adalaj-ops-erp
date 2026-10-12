-- Migration 0003: Purchase Orders, Part Payments, Inter-Firm CFA Transfers, and Export Shipments
-- Database: adalaj-erp-db

CREATE TABLE IF NOT EXISTS purchase_orders (
  id TEXT PRIMARY KEY,
  po_number TEXT NOT NULL UNIQUE,
  initiation_date TEXT NOT NULL,
  expected_fulfillment_date TEXT NOT NULL,
  actual_fulfillment_date TEXT,
  party_id TEXT NOT NULL REFERENCES parties(id),
  party_name TEXT NOT NULL,
  party_gstin TEXT,
  purchase_category TEXT CHECK(purchase_category IN ('raw_material', 'packing_material', 'machinery', 'rent', 'electricity', 'ca_legal', 'stationery', 'licences', 'other_services')) NOT NULL,
  status TEXT CHECK(status IN ('draft', 'issued', 'partially_fulfilled', 'fulfilled', 'cancelled')) NOT NULL DEFAULT 'issued',
  taxable_amount_paise INTEGER NOT NULL DEFAULT 0,
  cgst_paise INTEGER NOT NULL DEFAULT 0,
  sgst_paise INTEGER NOT NULL DEFAULT 0,
  igst_paise INTEGER NOT NULL DEFAULT 0,
  total_amount_paise INTEGER NOT NULL DEFAULT 0,
  total_claimable_gst_paise INTEGER NOT NULL DEFAULT 0,
  total_ineligible_gst_paise INTEGER NOT NULL DEFAULT 0,
  advance_paid_paise INTEGER NOT NULL DEFAULT 0,
  total_paid_paise INTEGER NOT NULL DEFAULT 0,
  balance_due_paise INTEGER NOT NULL DEFAULT 0,
  fulfillment_notes TEXT,
  grn_number TEXT,
  bill_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS po_category_idx ON purchase_orders(purchase_category);
CREATE INDEX IF NOT EXISTS po_status_idx ON purchase_orders(status);

CREATE TABLE IF NOT EXISTS po_items (
  id TEXT PRIMARY KEY,
  po_id TEXT NOT NULL REFERENCES purchase_orders(id),
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  hsn_sac TEXT NOT NULL,
  qty REAL NOT NULL,
  unit TEXT NOT NULL,
  unit_price_paise INTEGER NOT NULL,
  taxable_amount_paise INTEGER NOT NULL,
  gst_rate_pct INTEGER NOT NULL DEFAULT 0,
  cgst_paise INTEGER NOT NULL DEFAULT 0,
  sgst_paise INTEGER NOT NULL DEFAULT 0,
  igst_paise INTEGER NOT NULL DEFAULT 0,
  total_paise INTEGER NOT NULL,
  is_claimable_itc INTEGER NOT NULL DEFAULT 1,
  is_rcm INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS po_items_po_idx ON po_items(po_id);

CREATE TABLE IF NOT EXISTS po_part_payments (
  id TEXT PRIMARY KEY,
  po_id TEXT NOT NULL REFERENCES purchase_orders(id),
  date TEXT NOT NULL,
  milestone_type TEXT CHECK(milestone_type IN ('advance', 'part_payment', 'final_settlement')) NOT NULL,
  amount_paise INTEGER NOT NULL,
  payment_mode TEXT NOT NULL,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  account_name TEXT NOT NULL,
  utr_or_ref TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS po_payments_po_idx ON po_part_payments(po_id);

CREATE TABLE IF NOT EXISTS inter_firm_transfers (
  id TEXT PRIMARY KEY,
  transfer_challan_no TEXT NOT NULL UNIQUE,
  date TEXT NOT NULL,
  destination_firm_name TEXT NOT NULL,
  destination_gstin TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  vehicle_no TEXT NOT NULL,
  eway_bill_no TEXT,
  driver_phone TEXT,
  format TEXT CHECK(format IN ('bulk_sacks', 'retail_pouches', 'mixed_assorted')) NOT NULL,
  total_grams INTEGER NOT NULL,
  total_valuation_paise INTEGER NOT NULL,
  status TEXT CHECK(status IN ('dispatched', 'in_transit', 'received_at_cfa', 'cancelled')) NOT NULL DEFAULT 'dispatched',
  received_at_date TEXT,
  received_by_notes TEXT,
  remarks TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ift_status_idx ON inter_firm_transfers(status);

CREATE TABLE IF NOT EXISTS inter_firm_transfer_items (
  id TEXT PRIMARY KEY,
  transfer_id TEXT NOT NULL REFERENCES inter_firm_transfers(id),
  item_id TEXT NOT NULL,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  pack_size_grams INTEGER NOT NULL,
  batch_number TEXT NOT NULL,
  packs_count INTEGER NOT NULL,
  boxes_count INTEGER NOT NULL,
  total_grams INTEGER NOT NULL,
  rate_per_kg_paise INTEGER NOT NULL,
  total_valuation_paise INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS ift_items_transfer_idx ON inter_firm_transfer_items(transfer_id);

CREATE TABLE IF NOT EXISTS export_shipments (
  id TEXT PRIMARY KEY,
  export_invoice_no TEXT NOT NULL UNIQUE,
  shipping_bill_no TEXT NOT NULL UNIQUE,
  date TEXT NOT NULL,
  consignee_name TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  destination_port TEXT NOT NULL,
  port_of_loading TEXT NOT NULL,
  lut_number TEXT NOT NULL,
  iec_number TEXT NOT NULL,
  apeda_rcmc_no TEXT,
  spices_board_reg_no TEXT,
  export_format TEXT CHECK(export_format IN ('bulk_export', 'retail_pack_export')) NOT NULL,
  container_no TEXT NOT NULL,
  seal_no TEXT NOT NULL,
  total_weight_kg REAL NOT NULL,
  foreign_currency TEXT CHECK(foreign_currency IN ('USD', 'AED', 'EUR', 'GBP')) NOT NULL,
  foreign_amount_cents INTEGER NOT NULL,
  inr_realized_paise INTEGER NOT NULL,
  status TEXT CHECK(status IN ('booking', 'customs_cleared', 'loaded_on_vessel', 'dispatched_in_transit', 'delivered')) NOT NULL DEFAULT 'booking',
  bl_or_awb_number TEXT,
  bl_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS exp_ship_status_idx ON export_shipments(status);
