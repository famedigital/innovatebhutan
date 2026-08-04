-- 0034_admin_portal_modules.sql
-- Product Master, Sales Quotations, Purchase Master, project ops fields, client extras

ALTER TABLE clients ADD COLUMN IF NOT EXISTS address_2 text;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS state varchar(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS business_name varchar(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS business_type varchar(100);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS category_type varchar(50);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS referred_by varchar(255);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS total_commission numeric(15, 2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS preferred_install_date timestamp;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS assignee_role varchar(50);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS product_master_status varchar(50) DEFAULT 'pending';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS training_plan jsonb DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS quotation_id integer;

CREATE TABLE IF NOT EXISTS product_master (
  id serial PRIMARY KEY,
  public_id varchar(50) NOT NULL UNIQUE,
  name varchar(255) NOT NULL,
  category varchar(50) NOT NULL,
  brand varchar(100),
  sku varchar(100),
  description text,
  unit_price numeric(15, 2) DEFAULT 0,
  unit varchar(50) DEFAULT 'pcs',
  master_status varchar(50) DEFAULT 'pending',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_master_category ON product_master(category);
CREATE INDEX IF NOT EXISTS idx_product_master_active ON product_master(is_active);
CREATE INDEX IF NOT EXISTS idx_product_master_status ON product_master(master_status);
CREATE INDEX IF NOT EXISTS idx_product_master_name ON product_master(name);

CREATE TABLE IF NOT EXISTS sales_quotations (
  id serial PRIMARY KEY,
  public_id varchar(50) NOT NULL UNIQUE,
  quotation_number varchar(50) NOT NULL UNIQUE,
  category varchar(50) NOT NULL,
  client_id integer REFERENCES clients(id),
  customer_name varchar(255),
  business_name varchar(255),
  phone varchar(50),
  email varchar(255),
  address text,
  address_2 text,
  state varchar(100),
  country varchar(100) DEFAULT 'Bhutan',
  quotation_for text,
  validity_days integer DEFAULT 15,
  subtotal numeric(15, 2) DEFAULT 0,
  tax_amount numeric(15, 2) DEFAULT 0,
  total_amount numeric(15, 2) DEFAULT 0,
  advance_percent numeric(5, 2) DEFAULT 50,
  advance_amount numeric(15, 2) DEFAULT 0,
  status varchar(50) DEFAULT 'draft',
  deposit_qr_payload text,
  deposit_proof_url text,
  advance_paid_at timestamp,
  project_id integer REFERENCES projects(id),
  notes text,
  created_by text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_quotations_number ON sales_quotations(quotation_number);
CREATE INDEX IF NOT EXISTS idx_sales_quotations_status ON sales_quotations(status);
CREATE INDEX IF NOT EXISTS idx_sales_quotations_category ON sales_quotations(category);
CREATE INDEX IF NOT EXISTS idx_sales_quotations_client ON sales_quotations(client_id);

CREATE TABLE IF NOT EXISTS sales_quotation_items (
  id serial PRIMARY KEY,
  quotation_id integer NOT NULL REFERENCES sales_quotations(id) ON DELETE CASCADE,
  product_master_id integer REFERENCES product_master(id),
  name varchar(255) NOT NULL,
  brand varchar(100),
  description text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(15, 2) NOT NULL DEFAULT 0,
  amount numeric(15, 2) NOT NULL DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sales_quotation_items_quotation ON sales_quotation_items(quotation_id);

CREATE TABLE IF NOT EXISTS purchase_masters (
  id serial PRIMARY KEY,
  public_id varchar(50) NOT NULL UNIQUE,
  supplier_name varchar(255) NOT NULL,
  supplier_id integer REFERENCES suppliers(id),
  bill_reference_no varchar(100),
  purchase_date timestamp DEFAULT now(),
  payment_timeline varchar(50) DEFAULT 'cash',
  credit_days integer DEFAULT 0,
  advance_payment numeric(15, 2) DEFAULT 0,
  total_purchase_amount numeric(15, 2) DEFAULT 0,
  gst_paid numeric(15, 2) DEFAULT 0,
  declaration_fees numeric(15, 2) DEFAULT 0,
  freight_charges numeric(15, 2) DEFAULT 0,
  total_freight_charges numeric(15, 2) DEFAULT 0,
  total_landed_cost numeric(15, 2) DEFAULT 0,
  sales_rate numeric(15, 2),
  status varchar(50) DEFAULT 'draft',
  invoice_upload_url text,
  notes text,
  created_by text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchase_masters_supplier_name ON purchase_masters(supplier_name);
CREATE INDEX IF NOT EXISTS idx_purchase_masters_status ON purchase_masters(status);
CREATE INDEX IF NOT EXISTS idx_purchase_masters_date ON purchase_masters(purchase_date);

CREATE TABLE IF NOT EXISTS purchase_master_items (
  id serial PRIMARY KEY,
  purchase_id integer NOT NULL REFERENCES purchase_masters(id) ON DELETE CASCADE,
  product_name varchar(255) NOT NULL,
  product_master_id integer REFERENCES product_master(id),
  quantity integer NOT NULL DEFAULT 1,
  cost_price numeric(15, 2) NOT NULL DEFAULT 0,
  tax_amount numeric(15, 2) DEFAULT 0,
  final_cost numeric(15, 2) DEFAULT 0,
  mrp numeric(15, 2),
  sort_order integer DEFAULT 0,
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchase_master_items_purchase ON purchase_master_items(purchase_id);

CREATE INDEX IF NOT EXISTS idx_projects_assignee_role ON projects(assignee_role);

-- Seed Product Master (idempotent by name+category)
INSERT INTO product_master (public_id, name, category, brand, unit_price, master_status, is_active, sort_order)
SELECT v.public_id, v.name, v.category, v.brand, v.unit_price, 'completed', true, v.sort_order
FROM (VALUES
  ('pm-rl-online', 'Rancelab Online', 'software', 'Rancelab', 55000, 1),
  ('pm-rl-offline', 'Rancelab Offline', 'software', 'Rancelab', 55000, 2),
  ('pm-rl-enterprise', 'Rancelab Enterprise', 'software', 'Rancelab', 85000, 3),
  ('pm-pelbu-pos', 'Pelbu POS', 'software', 'Pelbu', 45000, 4),
  ('pm-pelbu-hotel', 'Pelbu Hotel ERP', 'software', 'Pelbu', 60000, 5),
  ('pm-websites', 'Websites', 'software', 'Innovates', 35000, 6),
  ('pm-cpplus-2mp', 'CP Plus 2MP Camera', 'hardware', 'CP Plus', 4500, 1),
  ('pm-dell-aio', 'Dell All in One', 'hardware', 'Dell', 55000, 2),
  ('pm-touch-pos', '15\" POS Touch Terminal', 'hardware', 'Innovates', 35000, 3),
  ('pm-nvr-4ch', '4-Channel NVR System', 'hardware', 'CP Plus', 25000, 4),
  ('pm-cat6', 'Cat6 Cable (box)', 'supply', 'Generic', 3500, 1),
  ('pm-ups-1kva', '1KVA UPS', 'supply', 'Generic', 8500, 2),
  ('pm-tv-mount', 'TV Mounting', 'services', 'Innovates', 2500, 1),
  ('pm-wifi-install', 'Wifi Installation', 'services', 'Innovates', 5000, 2),
  ('pm-starlink', 'Starlink Installation', 'services', 'Innovates', 15000, 3),
  ('pm-antivirus', 'Anti-Virus Installation', 'services', 'Innovates', 1500, 4),
  ('pm-it-visit', 'Personnel Visit for IT Services', 'services', 'Innovates', 3000, 5)
) AS v(public_id, name, category, brand, unit_price, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM product_master pm WHERE pm.public_id = v.public_id
);
