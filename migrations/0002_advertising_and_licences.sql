-- Section 13.3 Advertising & Section 13.4 Licences Tables
-- Database: adalaj-erp-db

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT CHECK(platform IN ('meta_ads', 'google_ads', 'amazon_ads', 'blinkit_zepto', 'creative_production', 'offline_marketing', 'influencer', 'trade_fair')) NOT NULL,
  status TEXT CHECK(status IN ('active', 'completed', 'draft', 'paused')) NOT NULL DEFAULT 'active',
  start_date TEXT NOT NULL,
  end_date TEXT,
  budget_paise INTEGER NOT NULL DEFAULT 0,
  actual_spend_paise INTEGER NOT NULL DEFAULT 0,
  gst_paise INTEGER NOT NULL DEFAULT 0,
  product_line TEXT CHECK(product_line IN ('line_a', 'line_b', 'shared')) NOT NULL DEFAULT 'line_a',
  target_sku_code TEXT,
  attribution_channel TEXT NOT NULL,
  impressions INTEGER,
  clicks INTEGER,
  conversions INTEGER,
  roas REAL,
  vendor_name TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS camp_platform_idx ON campaigns(platform);
CREATE INDEX IF NOT EXISTS camp_status_idx ON campaigns(status);

CREATE TABLE IF NOT EXISTS marketplace_settlements (
  id TEXT PRIMARY KEY,
  marketplace TEXT CHECK(marketplace IN ('amazon', 'flipkart', 'blinkit', 'zepto', 'instamart', 'other')) NOT NULL,
  statement_period TEXT NOT NULL,
  order_count INTEGER NOT NULL DEFAULT 0,
  gross_sales_paise INTEGER NOT NULL,
  referral_fees_paise INTEGER NOT NULL DEFAULT 0,
  closing_fees_paise INTEGER NOT NULL DEFAULT 0,
  fulfillment_fees_paise INTEGER NOT NULL DEFAULT 0,
  shipping_fees_paise INTEGER NOT NULL DEFAULT 0,
  returns_rto_paise INTEGER NOT NULL DEFAULT 0,
  ads_deduction_paise INTEGER NOT NULL DEFAULT 0,
  gst_on_fees_paise INTEGER NOT NULL DEFAULT 0,
  tcs_paise INTEGER NOT NULL DEFAULT 0,
  net_bank_payout_paise INTEGER NOT NULL,
  bank_credit_date TEXT NOT NULL,
  status TEXT CHECK(status IN ('reconciled', 'pending', 'disputed')) NOT NULL DEFAULT 'reconciled',
  linked_account_name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS mkt_settle_period_idx ON marketplace_settlements(statement_period);

CREATE TABLE IF NOT EXISTS licences (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT CHECK(category IN ('fssai', 'gst', 'weights_measures', 'udyam', 'trademark', 'pollution_control', 'factory_permit', 'fire_noc', 'gs1_barcode', 'lab_test', 'other')) NOT NULL,
  registration_no TEXT NOT NULL,
  issuing_authority TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  renewal_cadence TEXT CHECK(renewal_cadence IN ('annual', '3_year', '5_year', '10_year', 'permanent', 'quarterly')) NOT NULL DEFAULT 'annual',
  status TEXT CHECK(status IN ('active', 'expiring_soon', 'expired', 'in_renewal')) NOT NULL DEFAULT 'active',
  annual_cost_paise INTEGER NOT NULL DEFAULT 0,
  last_renewal_date TEXT,
  penalty_paise INTEGER NOT NULL DEFAULT 0,
  responsible_person TEXT NOT NULL,
  document_ref TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS lic_category_idx ON licences(category);
CREATE INDEX IF NOT EXISTS lic_expiry_idx ON licences(expiry_date);

CREATE TABLE IF NOT EXISTS licence_events (
  id TEXT PRIMARY KEY,
  licence_id TEXT NOT NULL REFERENCES licences(id),
  date TEXT NOT NULL,
  action TEXT NOT NULL,
  fee_paise INTEGER NOT NULL DEFAULT 0,
  reference TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
