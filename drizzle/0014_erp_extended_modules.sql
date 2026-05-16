-- ============================================================================
-- 0014_erp_extended_modules.sql
-- ERP Extended Modules: Inventory, Procurement, Accounts, Assets
-- ============================================================================

-- ============================================================================
-- INVENTORY MODULE
-- ============================================================================

-- Items table
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    brand VARCHAR(100),
    manufacturer VARCHAR(255),
    image_url TEXT,
    reorder_level INTEGER DEFAULT 10,
    lead_time_days INTEGER DEFAULT 7,
    cost_price DECIMAL(12, 2),
    selling_price DECIMAL(12, 2),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_sku ON items(sku);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_active ON items(is_active);

-- Warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    location TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    coordinates JSONB,
    manager_id INTEGER REFERENCES employees(id),
    capacity DECIMAL(15, 2),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_warehouses_active ON warehouses(is_active);
CREATE INDEX IF NOT EXISTS idx_warehouses_district ON warehouses(district);

-- Bins table
CREATE TABLE IF NOT EXISTS bins (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    warehouse_id INTEGER REFERENCES warehouses(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    location TEXT,
    capacity DECIMAL(15, 2),
    current_capacity DECIMAL(15, 2) DEFAULT '0',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bins_warehouse ON bins(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_bins_active ON bins(is_active);

-- Stock Entries table
CREATE TABLE IF NOT EXISTS stock_entries (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    item_id INTEGER REFERENCES items(id) NOT NULL,
    warehouse_id INTEGER REFERENCES warehouses(id) NOT NULL,
    bin_id INTEGER REFERENCES bins(id),
    quantity INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_type VARCHAR(50),
    reference_id INTEGER,
    batch_no VARCHAR(100),
    serial_no VARCHAR(100),
    rate DECIMAL(12, 2),
    amount DECIMAL(15, 2),
    remarks TEXT,
    posting_date TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_entries_item ON stock_entries(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_entries_warehouse ON stock_entries(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_entries_type ON stock_entries(type);
CREATE INDEX IF NOT EXISTS idx_stock_entries_posting_date ON stock_entries(posting_date);
CREATE INDEX IF NOT EXISTS idx_stock_entries_reference ON stock_entries(reference_type, reference_id);

-- Stock Ledger table
CREATE TABLE IF NOT EXISTS stock_ledger (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(id) NOT NULL,
    warehouse_id INTEGER REFERENCES warehouses(id) NOT NULL,
    bin_id INTEGER REFERENCES bins(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    valuation_rate DECIMAL(12, 2),
    last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stock_ledger_item_warehouse ON stock_ledger(item_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_bin ON stock_ledger(bin_id);

-- ============================================================================
-- PROCUREMENT MODULE
-- ============================================================================

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Bhutan',
    tax_id VARCHAR(50),
    pan VARCHAR(50),
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(15, 2),
    credit_days INTEGER DEFAULT 0,
    bank_name VARCHAR(100),
    bank_account_no VARCHAR(50),
    bank_branch VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    is_preferred BOOLEAN DEFAULT false,
    rating VARCHAR(20),
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_city ON suppliers(city);

-- Purchase Orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INTEGER REFERENCES suppliers(id) NOT NULL,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    order_date TIMESTAMP NOT NULL DEFAULT NOW(),
    expected_date TIMESTAMP,
    received_date TIMESTAMP,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT '0',
    total_tax DECIMAL(12, 2) DEFAULT '0',
    total_discount DECIMAL(12, 2) DEFAULT '0',
    grand_total DECIMAL(15, 2) DEFAULT '0',
    currency VARCHAR(10) DEFAULT 'Nu.',
    terms TEXT,
    notes TEXT,
    approved_by INTEGER REFERENCES employees(id),
    approved_at TIMESTAMP,
    rejected_by INTEGER REFERENCES employees(id),
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    warehouse_id INTEGER REFERENCES warehouses(id),
    project_id INTEGER REFERENCES projects(id),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_po_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_order_date ON purchase_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_po_number ON purchase_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_po_project ON purchase_orders(project_id);

-- Purchase Order Items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id SERIAL PRIMARY KEY,
    purchase_order_id INTEGER REFERENCES purchase_orders(id) NOT NULL,
    item_id INTEGER REFERENCES items(id) NOT NULL,
    description VARCHAR(500),
    quantity INTEGER NOT NULL DEFAULT 1,
    received_quantity INTEGER DEFAULT 0,
    rejected_quantity INTEGER DEFAULT 0,
    rate DECIMAL(12, 2) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT '0',
    tax_amount DECIMAL(12, 2) DEFAULT '0',
    discount_rate DECIMAL(5, 2) DEFAULT '0',
    discount_amount DECIMAL(12, 2) DEFAULT '0',
    net_amount DECIMAL(15, 2),
    warehouse_id INTEGER REFERENCES warehouses(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_po_items_po ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_po_items_item ON purchase_order_items(item_id);

-- Request for Quotations table
CREATE TABLE IF NOT EXISTS request_for_quotations (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    rfq_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    required_by TIMESTAMP,
    valid_until TIMESTAMP,
    terms TEXT,
    notes TEXT,
    project_id INTEGER REFERENCES projects(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    created_by INTEGER REFERENCES employees(id),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rfq_status ON request_for_quotations(status);
CREATE INDEX IF NOT EXISTS idx_rfq_number ON request_for_quotations(rfq_number);
CREATE INDEX IF NOT EXISTS idx_rfq_required_by ON request_for_quotations(required_by);

-- RFQ Suppliers table
CREATE TABLE IF NOT EXISTS rfq_suppliers (
    id SERIAL PRIMARY KEY,
    rfq_id INTEGER REFERENCES request_for_quotations(id) NOT NULL,
    supplier_id INTEGER REFERENCES suppliers(id) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    quoted_amount DECIMAL(15, 2),
    quoted_date TIMESTAMP,
    notes TEXT,
    is_awarded BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rfq_suppliers_rfq ON rfq_suppliers(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_suppliers_supplier ON rfq_suppliers(supplier_id);

-- RFQ Items table
CREATE TABLE IF NOT EXISTS rfq_items (
    id SERIAL PRIMARY KEY,
    rfq_id INTEGER REFERENCES request_for_quotations(id) NOT NULL,
    item_id INTEGER REFERENCES items(id),
    description VARCHAR(500) NOT NULL,
    quantity INTEGER NOT NULL,
    unit VARCHAR(50) NOT NULL,
    specifications TEXT,
    estimated_cost DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rfq_items_rfq ON rfq_items(rfq_id);

-- ============================================================================
-- ACCOUNTS MODULE
-- ============================================================================

-- Parties table
CREATE TABLE IF NOT EXISTS parties (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    party_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    taxpayer_id VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Bhutan',
    phone VARCHAR(50),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_parties_type ON parties(party_type);
CREATE INDEX IF NOT EXISTS idx_parties_name ON parties(name);
CREATE INDEX IF NOT EXISTS idx_parties_active ON parties(is_active);

-- Accounts table (Chart of Accounts)
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    root_type VARCHAR(50) NOT NULL,
    parent_id INTEGER REFERENCES accounts(id),
    is_group BOOLEAN DEFAULT false,
    balance DECIMAL(15, 2) DEFAULT '0',
    currency VARCHAR(10) DEFAULT 'Nu.',
    is_active BOOLEAN DEFAULT true,
    tax_rate DECIMAL(5, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounts_number ON accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_accounts_root_type ON accounts(root_type);
CREATE INDEX IF NOT EXISTS idx_accounts_parent ON accounts(parent_id);
CREATE INDEX IF NOT EXISTS idx_accounts_active ON accounts(is_active);

-- Payment Entries table
CREATE TABLE IF NOT EXISTS payment_entries (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    payment_number VARCHAR(100) UNIQUE NOT NULL,
    payment_type VARCHAR(50) NOT NULL,
    party_type VARCHAR(50) NOT NULL,
    party_id INTEGER REFERENCES parties(id) NOT NULL,
    party_name VARCHAR(255),
    amount DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(15, 2) NOT NULL,
    outstanding_amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'Nu.',
    payment_method VARCHAR(50),
    reference_no VARCHAR(100),
    reference_date TIMESTAMP,
    reference_type VARCHAR(50),
    reference_id INTEGER,
    bank_account_id INTEGER REFERENCES accounts(id),
    status VARCHAR(50) DEFAULT 'draft',
    posting_date TIMESTAMP NOT NULL DEFAULT NOW(),
    cleared_date TIMESTAMP,
    remarks TEXT,
    approved_by INTEGER REFERENCES employees(id),
    approved_at TIMESTAMP,
    project_id INTEGER REFERENCES projects(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_entries_number ON payment_entries(payment_number);
CREATE INDEX IF NOT EXISTS idx_payment_entries_party ON payment_entries(party_type, party_id);
CREATE INDEX IF NOT EXISTS idx_payment_entries_status ON payment_entries(status);
CREATE INDEX IF NOT EXISTS idx_payment_entries_posting_date ON payment_entries(posting_date);
CREATE INDEX IF NOT EXISTS idx_payment_entries_reference ON payment_entries(reference_type, reference_id);

-- Journal Entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    voucher_no VARCHAR(100) UNIQUE NOT NULL,
    voucher_type VARCHAR(50) NOT NULL,
    posting_date TIMESTAMP NOT NULL,
    total_debit DECIMAL(15, 2) NOT NULL,
    total_credit DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    remarks TEXT,
    user_remark TEXT,
    fiscal_year VARCHAR(20),
    submitted_by INTEGER REFERENCES employees(id),
    submitted_at TIMESTAMP,
    approved_by INTEGER REFERENCES employees(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_voucher ON journal_entries(voucher_no);
CREATE INDEX IF NOT EXISTS idx_journal_entries_posting_date ON journal_entries(posting_date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_entries_fiscal_year ON journal_entries(fiscal_year);

-- Journal Entry Accounts table
CREATE TABLE IF NOT EXISTS journal_entry_accounts (
    id SERIAL PRIMARY KEY,
    journal_entry_id INTEGER REFERENCES journal_entries(id) NOT NULL,
    account_id INTEGER REFERENCES accounts(id) NOT NULL,
    debit DECIMAL(15, 2) NOT NULL DEFAULT '0',
    credit DECIMAL(15, 2) NOT NULL DEFAULT '0',
    party_type VARCHAR(50),
    party_id INTEGER REFERENCES parties(id),
    reference_type VARCHAR(50),
    reference_id INTEGER,
    cost_center VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_je_accounts_journal ON journal_entry_accounts(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_je_accounts_account ON journal_entry_accounts(account_id);
CREATE INDEX IF NOT EXISTS idx_je_accounts_party ON journal_entry_accounts(party_type, party_id);

-- GL Entries table
CREATE TABLE IF NOT EXISTS gl_entries (
    id SERIAL PRIMARY KEY,
    posting_date TIMESTAMP NOT NULL,
    account INTEGER REFERENCES accounts(id) NOT NULL,
    party_type VARCHAR(50),
    party_id INTEGER REFERENCES parties(id),
    voucher_type VARCHAR(50) NOT NULL,
    voucher_no VARCHAR(100) NOT NULL,
    against_voucher_type VARCHAR(50),
    against_voucher_no VARCHAR(100),
    debit DECIMAL(15, 2) NOT NULL DEFAULT '0',
    credit DECIMAL(15, 2) NOT NULL DEFAULT '0',
    is_cancelled BOOLEAN DEFAULT false,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gl_entries_account ON gl_entries(account);
CREATE INDEX IF NOT EXISTS idx_gl_entries_voucher ON gl_entries(voucher_type, voucher_no);
CREATE INDEX IF NOT EXISTS idx_gl_entries_posting_date ON gl_entries(posting_date);
CREATE INDEX IF NOT EXISTS idx_gl_entries_party ON gl_entries(party_type, party_id);

-- Accounts Receivable table
CREATE TABLE IF NOT EXISTS accounts_receivable (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    party_id INTEGER REFERENCES parties(id) NOT NULL,
    invoice_id INTEGER REFERENCES invoices(id),
    reference_type VARCHAR(50),
    reference_id INTEGER,
    amount DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) DEFAULT '0',
    outstanding_amount DECIMAL(15, 2) NOT NULL,
    due_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'overdue',
    age INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ar_party ON accounts_receivable(party_id);
CREATE INDEX IF NOT EXISTS idx_ar_status ON accounts_receivable(status);
CREATE INDEX IF NOT EXISTS idx_ar_due_date ON accounts_receivable(due_date);

-- Accounts Payable table
CREATE TABLE IF NOT EXISTS accounts_payable (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    party_id INTEGER REFERENCES parties(id) NOT NULL,
    purchase_order_id INTEGER REFERENCES purchase_orders(id),
    reference_type VARCHAR(50),
    reference_id INTEGER,
    amount DECIMAL(15, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) DEFAULT '0',
    outstanding_amount DECIMAL(15, 2) NOT NULL,
    due_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'unpaid',
    age INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ap_party ON accounts_payable(party_id);
CREATE INDEX IF NOT EXISTS idx_ap_status ON accounts_payable(status);
CREATE INDEX IF NOT EXISTS idx_ap_due_date ON accounts_payable(due_date);

-- Bank Accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    bank_name VARCHAR(100),
    account_no VARCHAR(100),
    iban VARCHAR(50),
    swift_code VARCHAR(20),
    branch VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'Nu.',
    balance DECIMAL(15, 2) DEFAULT '0',
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_active ON bank_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_default ON bank_accounts(is_default);

-- ============================================================================
-- ASSETS MODULE
-- ============================================================================

-- Asset Categories table
CREATE TABLE IF NOT EXISTS asset_categories (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES asset_categories(id),
    depreciation_rate DECIMAL(5, 2),
    depreciation_method VARCHAR(50),
    useful_life INTEGER,
    is_fixed_asset BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_categories_parent ON asset_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_asset_categories_active ON asset_categories(is_active);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) UNIQUE NOT NULL,
    asset_number VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES asset_categories(id) NOT NULL,
    item_id INTEGER REFERENCES items(id),
    purchase_date TIMESTAMP,
    purchase_value DECIMAL(15, 2),
    current_value DECIMAL(15, 2),
    salvage_value DECIMAL(12, 2),
    accumulated_depreciation DECIMAL(15, 2) DEFAULT '0',
    net_book_value DECIMAL(15, 2),
    location VARCHAR(255),
    warehouse_id INTEGER REFERENCES warehouses(id),
    assigned_to INTEGER REFERENCES employees(id),
    status VARCHAR(50) DEFAULT 'active',
    serial_number VARCHAR(100),
    barcode VARCHAR(100),
    warranty_expiry TIMESTAMP,
    last_audit_date TIMESTAMP,
    next_audit_date TIMESTAMP,
    image_url TEXT,
    purchase_invoice_id INTEGER,
    supplier_id INTEGER REFERENCES suppliers(id),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_number ON assets(asset_number);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_location ON assets(location);
CREATE INDEX IF NOT EXISTS idx_assets_assigned_to ON assets(assigned_to);

-- Depreciation Schedule table
CREATE TABLE IF NOT EXISTS depreciation_schedule (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id) NOT NULL,
    date TIMESTAMP NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    accumulated_depreciation DECIMAL(15, 2),
    net_book_value DECIMAL(15, 2),
    journal_entry_id INTEGER REFERENCES journal_entries(id),
    fiscal_year VARCHAR(20),
    status VARCHAR(50) DEFAULT 'scheduled',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_depreciation_asset ON depreciation_schedule(asset_id);
CREATE INDEX IF NOT EXISTS idx_depreciation_date ON depreciation_schedule(date);
CREATE INDEX IF NOT EXISTS idx_depreciation_fiscal_year ON depreciation_schedule(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_depreciation_status ON depreciation_schedule(status);

-- Asset Maintenance table
CREATE TABLE IF NOT EXISTS asset_maintenance (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id) NOT NULL,
    maintenance_date TIMESTAMP NOT NULL,
    maintenance_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    cost DECIMAL(12, 2),
    performed_by INTEGER REFERENCES employees(id),
    next_maintenance_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asset_maintenance_asset ON asset_maintenance(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_maintenance_date ON asset_maintenance(maintenance_date);

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Sample Items
INSERT INTO items (public_id, name, sku, unit, category, cost_price, selling_price, reorder_level) VALUES
('item_001', 'Cat6 Cable (305m)', 'CAT6-305', 'rolls', 'Cables', 1500.00, 2200.00, 5),
('item_002', 'Network Switch 24-Port', 'SW-24P', 'pcs', 'Networking', 4500.00, 6500.00, 3),
('item_003', 'CCTV Camera 4MP', 'CCTV-4MP', 'pcs', 'Security', 1200.00, 1800.00, 10),
('item_004', 'Server Rack 42U', 'RACK-42U', 'pcs', 'Infrastructure', 8500.00, 12000.00, 2)
ON CONFLICT (sku) DO NOTHING;

-- Sample Warehouse
INSERT INTO warehouses (public_id, name, location, city, is_active) VALUES
('wh_001', 'Main Warehouse', 'Thimphu Tech Park', 'Thimphu', true)
ON CONFLICT (public_id) DO NOTHING;

-- Sample Suppliers
INSERT INTO suppliers (public_id, name, city, phone, email, is_active) VALUES
('sup_001', 'Tech Supplies Bhutan', 'Thimphu', '+975-2-12345', 'tech@supplies.bt', true),
('sup_002', 'Network Solutions', 'Paro', '+975-8-54321', 'info@network.bt', true)
ON CONFLICT (public_id) DO NOTHING;

-- Sample Parties
INSERT INTO parties (public_id, party_type, name, city, phone, is_active) VALUES
('pty_001', 'customer', 'ABC Corporation', 'Thimphu', '+975-2-99999', true),
('pty_002', 'supplier', 'XYZ Trading', 'Phuentsholing', '+975-5-88888', true)
ON CONFLICT (public_id) DO NOTHING;

-- Sample Asset Categories (must exist before assets)
INSERT INTO asset_categories (public_id, name, description, depreciation_rate, useful_life) VALUES
('cat_001', 'Buildings', 'Real estate and office buildings', 5.00, 40),
('cat_002', 'Equipment', 'Office equipment and machinery', 20.00, 5),
('cat_003', 'Vehicles', 'Company vehicles', 25.00, 8),
('cat_004', 'Furniture', 'Office furniture and fixtures', 15.00, 10)
ON CONFLICT (public_id) DO NOTHING;

-- Sample Assets
INSERT INTO assets (public_id, asset_number, name, category_id, purchase_value, current_value, accumulated_depreciation, status, location) VALUES
('ast_001', 'AST-2024-001', 'Office Building', 1, 2500000.00, 2375000.00, 125000.00, 'active', 'Thimphu'),
('ast_002', 'AST-2024-002', 'Server Equipment', 2, 450000.00, 405000.00, 45000.00, 'active', 'Server Room'),
('ast_003', 'Office Furniture', 4, 150000.00, 135000.00, 15000.00, 'active', 'Thimphu Office')
ON CONFLICT (asset_number) DO NOTHING;
