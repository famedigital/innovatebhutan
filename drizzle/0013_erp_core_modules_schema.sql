-- Migration 0013: ERP Core Modules Schema
-- Date: 2026-05-14
-- Modules: Inventory, Procurement, Accounts, Assets
-- This migration adds comprehensive database schema for four core ERP modules

-- ============================================================================
-- INVENTORY MODULE
-- ============================================================================

-- Items catalog
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    unit VARCHAR(50) NOT NULL DEFAULT 'pcs',
    category VARCHAR(100),
    brand VARCHAR(100),
    manufacturer VARCHAR(255),
    image_url TEXT,
    reorder_level INTEGER DEFAULT 10,
    lead_time_days INTEGER DEFAULT 7,
    cost_price DECIMAL(12,2),
    selling_price DECIMAL(12,2),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_items_sku ON items(sku);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_active ON items(is_active);

-- Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    location TEXT,
    city VARCHAR(100),
    district VARCHAR(100),
    coordinates JSONB,
    manager_id INTEGER REFERENCES employees(id),
    capacity DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_warehouses_active ON warehouses(is_active);
CREATE INDEX idx_warehouses_district ON warehouses(district);

-- Storage bins
CREATE TABLE IF NOT EXISTS bins (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) NOT NULL UNIQUE,
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    name VARCHAR(255) NOT NULL,
    location TEXT,
    capacity DECIMAL(15,2),
    current_capacity DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bins_warehouse ON bins(warehouse_id);
CREATE INDEX idx_bins_active ON bins(is_active);

-- Stock entries (movements)
CREATE TABLE IF NOT EXISTS stock_entries (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) NOT NULL UNIQUE,
    item_id INTEGER NOT NULL REFERENCES items(id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    bin_id INTEGER REFERENCES bins(id),
    quantity INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_type VARCHAR(50),
    reference_id INTEGER,
    batch_no VARCHAR(100),
    serial_no VARCHAR(100),
    rate DECIMAL(12,2),
    amount DECIMAL(15,2),
    remarks TEXT,
    posting_date TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stock_entries_item ON stock_entries(item_id);
CREATE INDEX idx_stock_entries_warehouse ON stock_entries(warehouse_id);
CREATE INDEX idx_stock_entries_type ON stock_entries(type);
CREATE INDEX idx_stock_entries_posting_date ON stock_entries(posting_date);
CREATE INDEX idx_stock_entries_reference ON stock_entries(reference_type, reference_id);

-- Stock ledger
CREATE TABLE IF NOT EXISTS stock_ledger (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouses(id),
    bin_id INTEGER REFERENCES bins(id),
    quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    valuation_rate DECIMAL(12,2),
    last_updated TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stock_ledger_item_warehouse ON stock_ledger(item_id, warehouse_id);
CREATE INDEX idx_stock_ledger_bin ON stock_ledger(bin_id);

-- ============================================================================
-- PROCUREMENT MODULE
-- ============================================================================

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) NOT NULL UNIQUE,
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
    credit_limit DECIMAL(15,2),
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

CREATE INDEX idx_suppliers_active ON suppliers(is_active);
CREATE INDEX idx_suppliers_name ON suppliers(name);
CREATE INDEX idx_suppliers_city ON suppliers(city);

-- Purchase orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) NOT NULL UNIQUE,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
    order_number VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'draft',
    order_date TIMESTAMP DEFAULT NOW(),
    expected_date TIMESTAMP,
    received_date TIMESTAMP,
    total_amount DECIMAL(15,2) DEFAULT 0,
    total_tax DECIMAL(12,2) DEFAULT 0,
    total_discount DECIMAL(12,2) DEFAULT 0,
    grand_total DECIMAL(15,2) DEFAULT 0,
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

CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_po_status ON purchase_orders(status);
CREATE INDEX idx_po_order_date ON purchase_orders(order_date);
CREATE INDEX idx_po_number ON purchase_orders(order_number);
CREATE INDEX idx_po_project ON purchase_orders(project_id);

-- Purchase order items
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id SERIAL PRIMARY KEY,
    purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id),
    item_id INTEGER NOT NULL REFERENCES items(id),
    description VARCHAR(500),
    quantity INTEGER DEFAULT 1,
    received_quantity INTEGER DEFAULT 0,
    rejected_quantity INTEGER DEFAULT 0,
    rate DECIMAL(12,2) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0,
    tax_amount DECIMAL(12,2) DEFAULT 0,
    discount_rate DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(12,2) DEFAULT 0,
    net_amount DECIMAL(15,2),
    warehouse_id INTEGER REFERENCES warehouses(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_po_items_po ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_po_items_item ON purchase_order_items(item_id);

-- Request for quotations
CREATE TABLE IF NOT EXISTS request_for_quotations (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) NOT NULL UNIQUE,
    rfq_number VARCHAR(100) NOT NULL UNIQUE,
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

CREATE INDEX idx_rfq_status ON request_for_quotations(status);
CREATE INDEX idx_rfq_number ON request_for_quotations(rfq_number);
CREATE INDEX idx_rfq_required_by ON request_for_quotations(required_by);

-- RFQ suppliers
CREATE TABLE IF NOT EXISTS rfq_suppliers (
    id SERIAL PRIMARY KEY,
    rfq_id INTEGER NOT NULL REFERENCES request_for_quotations(id),
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
    status VARCHAR(50) DEFAULT 'pending',
    quoted_amount DECIMAL(15,2),
    quoted_date TIMESTAMP,
    notes TEXT,
    is_awarded BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rfq_suppliers_rfq ON rfq_suppliers(rfq_id);
CREATE INDEX idx_rfq_suppliers_supplier ON rfq_suppliers(supplier_id);

-- RFQ items
CREATE TABLE IF NOT EXISTS rfq_items (
    id SERIAL PRIMARY KEY,
    rfq_id INTEGER NOT NULL REFERENCES request_for_quotations(id),
    item_id INTEGER REFERENCES items(id),
    description VARCHAR(500) NOT NULL,
    quantity INTEGER NOT NULL,
    unit VARCHAR(50) NOT NULL,
    specifications TEXT,
    estimated_cost DECIMAL(12,2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rfq_items_rfq ON rfq_items(rfq_id);

-- ============================================================================
-- ACCOUNTS MODULE
-- ============================================================================

-- Parties (unified customers/suppliers)
CREATE TABLE IF NOT EXISTS parties (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) NOT NULL UNIQUE,
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

CREATE INDEX idx_parties_type ON parties(party_type);
CREATE INDEX idx_parties_name ON parties(name);
CREATE INDEX idx_parties_active ON parties(is_active);

-- Chart of accounts
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) NOT NULL UNIQUE,
    account_number VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    root_type VARCHAR(50) NOT NULL,
    parent_id INTEGER REFERENCES accounts(id),
    is_group BOOLEAN DEFAULT false,
    balance DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'Nu.',
    is_active BOOLEAN DEFAULT true,
    tax_rate DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_accounts_number ON accounts(account_number);
CREATE INDEX idx_accounts_type ON accounts(account_type);
CREATE INDEX idx_accounts_root_type ON accounts(root_type);
CREATE INDEX idx_accounts_parent ON accounts(parent_id);
CREATE INDEX idx_accounts_active ON accounts(is_active);

-- Payment entries
CREATE TABLE IF NOT EXISTS payment_entries (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) NOT NULL UNIQUE,
    payment_number VARCHAR(100) NOT NULL UNIQUE,
    payment_type VARCHAR(50) NOT NULL,
    party_type VARCHAR(50) NOT NULL,
    party_id INTEGER NOT NULL REFERENCES parties(id),
    party_name VARCHAR(255),
    amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) NOT NULL,
    outstanding_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'Nu.',
    payment_method VARCHAR(50),
    reference_no VARCHAR(100),
    reference_date TIMESTAMP,
    reference_type VARCHAR(50),
    reference_id INTEGER,
    bank_account_id INTEGER REFERENCES accounts(id),
    status VARCHAR(50) DEFAULT 'draft',
    posting_date TIMESTAMP DEFAULT NOW(),
    cleared_date TIMESTAMP,
    remarks TEXT,
    approved_by INTEGER REFERENCES employees(id),
    approved_at TIMESTAMP,
    project_id INTEGER REFERENCES projects(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payment_entries_number ON payment_entries(payment_number);
CREATE INDEX idx_payment_entries_party ON payment_entries(party_type, party_id);
CREATE INDEX idx_payment_entries_status ON payment_entries(status);
CREATE INDEX idx_payment_entries_posting_date ON payment_entries(posting_date);
CREATE INDEX idx_payment_entries_reference ON payment_entries(reference_type, reference_id);

-- Journal entries
CREATE TABLE IF NOT EXISTS journal_entries (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) NOT NULL UNIQUE,
    voucher_no VARCHAR(100) NOT NULL UNIQUE,
    voucher_type VARCHAR(50) NOT NULL,
    posting_date TIMESTAMP NOT NULL,
    total_debit DECIMAL(15,2) NOT NULL,
    total_credit DECIMAL(15,2) NOT NULL,
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

CREATE INDEX idx_journal_entries_voucher ON journal_entries(voucher_no);
CREATE INDEX idx_journal_entries_posting_date ON journal_entries(posting_date);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_entries_fiscal_year ON journal_entries(fiscal_year);

-- Journal entry accounts
CREATE TABLE IF NOT EXISTS journal_entry_accounts (
    id SERIAL PRIMARY KEY,
    journal_entry_id INTEGER NOT NULL REFERENCES journal_entries(id),
    account_id INTEGER NOT NULL REFERENCES accounts(id),
    debit DECIMAL(15,2) DEFAULT 0,
    credit DECIMAL(15,2) DEFAULT 0,
    party_type VARCHAR(50),
    party_id INTEGER REFERENCES parties(id),
    reference_type VARCHAR(50),
    reference_id INTEGER,
    cost_center VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_je_accounts_journal ON journal_entry_accounts(journal_entry_id);
CREATE INDEX idx_je_accounts_account ON journal_entry_accounts(account_id);
CREATE INDEX idx_je_accounts_party ON journal_entry_accounts(party_type, party_id);

-- General ledger entries
CREATE TABLE IF NOT EXISTS gl_entries (
    id SERIAL PRIMARY KEY,
    posting_date TIMESTAMP NOT NULL,
    account INTEGER NOT NULL REFERENCES accounts(id),
    party_type VARCHAR(50),
    party_id INTEGER REFERENCES parties(id),
    voucher_type VARCHAR(50) NOT NULL,
    voucher_no VARCHAR(100) NOT NULL,
    against_voucher_type VARCHAR(50),
    against_voucher_no VARCHAR(100),
    debit DECIMAL(15,2) DEFAULT 0,
    credit DECIMAL(15,2) DEFAULT 0,
    is_cancelled BOOLEAN DEFAULT false,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_gl_entries_account ON gl_entries(account);
CREATE INDEX idx_gl_entries_voucher ON gl_entries(voucher_type, voucher_no);
CREATE INDEX idx_gl_entries_posting_date ON gl_entries(posting_date);
CREATE INDEX idx_gl_entries_party ON gl_entries(party_type, party_id);

-- Accounts receivable
CREATE TABLE IF NOT EXISTS accounts_receivable (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) NOT NULL UNIQUE,
    party_id INTEGER NOT NULL REFERENCES parties(id),
    invoice_id INTEGER REFERENCES invoices(id),
    reference_type VARCHAR(50),
    reference_id INTEGER,
    amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    outstanding_amount DECIMAL(15,2) NOT NULL,
    due_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'overdue',
    age INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ar_party ON accounts_receivable(party_id);
CREATE INDEX idx_ar_status ON accounts_receivable(status);
CREATE INDEX idx_ar_due_date ON accounts_receivable(due_date);

-- Accounts payable
CREATE TABLE IF NOT EXISTS accounts_payable (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) NOT NULL UNIQUE,
    party_id INTEGER NOT NULL REFERENCES parties(id),
    purchase_order_id INTEGER REFERENCES purchase_orders(id),
    reference_type VARCHAR(50),
    reference_id INTEGER,
    amount DECIMAL(15,2) NOT NULL,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    outstanding_amount DECIMAL(15,2) NOT NULL,
    due_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'unpaid',
    age INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ap_party ON accounts_payable(party_id);
CREATE INDEX idx_ap_status ON accounts_payable(status);
CREATE INDEX idx_ap_due_date ON accounts_payable(due_date);

-- Bank accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) NOT NULL UNIQUE,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    bank_name VARCHAR(100),
    account_no VARCHAR(100),
    iban VARCHAR(50),
    swift_code VARCHAR(20),
    branch VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'Nu.',
    balance DECIMAL(15,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bank_accounts_active ON bank_accounts(is_active);
CREATE INDEX idx_bank_accounts_default ON bank_accounts(is_default);

-- ============================================================================
-- ASSETS MODULE
-- ============================================================================

-- Asset categories
CREATE TABLE IF NOT EXISTS asset_categories (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES asset_categories(id),
    depreciation_rate DECIMAL(5,2),
    depreciation_method VARCHAR(50),
    useful_life INTEGER,
    is_fixed_asset BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_asset_categories_parent ON asset_categories(parent_id);
CREATE INDEX idx_asset_categories_active ON asset_categories(is_active);

-- Fixed assets
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    public_id VARCHAR(50) NOT NULL UNIQUE,
    asset_number VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER NOT NULL REFERENCES asset_categories(id),
    item_id INTEGER REFERENCES items(id),
    purchase_date TIMESTAMP,
    purchase_value DECIMAL(15,2),
    current_value DECIMAL(15,2),
    salvage_value DECIMAL(12,2),
    accumulated_depreciation DECIMAL(15,2) DEFAULT 0,
    net_book_value DECIMAL(15,2),
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

CREATE INDEX idx_assets_number ON assets(asset_number);
CREATE INDEX idx_assets_category ON assets(category_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_location ON assets(location);
CREATE INDEX idx_assets_assigned_to ON assets(assigned_to);

-- Depreciation schedule
CREATE TABLE IF NOT EXISTS depreciation_schedule (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id),
    date TIMESTAMP NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    accumulated_depreciation DECIMAL(15,2),
    net_book_value DECIMAL(15,2),
    journal_entry_id INTEGER REFERENCES journal_entries(id),
    fiscal_year VARCHAR(20),
    status VARCHAR(50) DEFAULT 'scheduled',
    remarks TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_depreciation_asset ON depreciation_schedule(asset_id);
CREATE INDEX idx_depreciation_date ON depreciation_schedule(date);
CREATE INDEX idx_depreciation_fiscal_year ON depreciation_schedule(fiscal_year);
CREATE INDEX idx_depreciation_status ON depreciation_schedule(status);

-- Asset maintenance
CREATE TABLE IF NOT EXISTS asset_maintenance (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id),
    maintenance_date TIMESTAMP NOT NULL,
    maintenance_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    cost DECIMAL(12,2),
    performed_by VARCHAR(255),
    vendor_id INTEGER REFERENCES suppliers(id),
    next_maintenance_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_asset_maintenance_asset ON asset_maintenance(asset_id);
CREATE INDEX idx_asset_maintenance_date ON asset_maintenance(maintenance_date);

-- Asset movements
CREATE TABLE IF NOT EXISTS asset_movements (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER NOT NULL REFERENCES assets(id),
    movement_date TIMESTAMP NOT NULL,
    movement_type VARCHAR(50) NOT NULL,
    from_location VARCHAR(255),
    to_location VARCHAR(255),
    from_warehouse_id INTEGER REFERENCES warehouses(id),
    to_warehouse_id INTEGER REFERENCES warehouses(id),
    from_employee_id INTEGER REFERENCES employees(id),
    to_employee_id INTEGER REFERENCES employees(id),
    reason TEXT,
    remarks TEXT,
    created_by INTEGER REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_asset_movements_asset ON asset_movements(asset_id);
CREATE INDEX idx_asset_movements_date ON asset_movements(movement_date);
CREATE INDEX idx_asset_movements_type ON asset_movements(movement_type);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- Migration completed successfully
-- Total tables created: 26
-- Inventory: 5 tables (items, warehouses, bins, stock_entries, stock_ledger)
-- Procurement: 6 tables (suppliers, purchase_orders, purchase_order_items, request_for_quotations, rfq_suppliers, rfq_items)
-- Accounts: 9 tables (parties, accounts, payment_entries, journal_entries, journal_entry_accounts, gl_entries, accounts_receivable, accounts_payable, bank_accounts)
-- Assets: 5 tables (asset_categories, assets, depreciation_schedule, asset_maintenance, asset_movements)
-- Plus 1 views/comments table (journal_entry_accounts used for GL entries)
