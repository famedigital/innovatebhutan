-- Products catalog + services product_key / billing_type
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  billing_types JSONB DEFAULT '[]'::jsonb,
  supports_amc BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_key ON products(key);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

ALTER TABLE services ADD COLUMN IF NOT EXISTS product_key VARCHAR(50);
ALTER TABLE services ADD COLUMN IF NOT EXISTS billing_type VARCHAR(50) DEFAULT 'one_time';

ALTER TABLE amcs ADD COLUMN IF NOT EXISTS product_key VARCHAR(50);

-- Existing contracts predate multi-product; treat as RanceLab
UPDATE amcs SET product_key = 'rancelab' WHERE product_key IS NULL;

INSERT INTO products (key, name, description, billing_types, supports_amc, sort_order)
VALUES
  ('rancelab', 'RanceLab', 'POS & retail AMC', '["amc","training","one_time"]'::jsonb, true, 1),
  ('pelbu_pos', 'Pelbu POS', 'Pelbu point-of-sale', '["amc","training","one_time"]'::jsonb, true, 2),
  ('website', 'Website Design', 'Websites & hosting', '["development","amc","one_time"]'::jsonb, true, 3),
  ('cctv', 'CCTV', 'CCTV install & AMC', '["one_time","amc","development"]'::jsonb, true, 4),
  ('networking', 'Networking', 'Network setup & AMC', '["development","amc","one_time"]'::jsonb, true, 5)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  billing_types = EXCLUDED.billing_types,
  supports_amc = EXCLUDED.supports_amc,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
