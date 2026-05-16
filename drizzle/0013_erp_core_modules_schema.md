# Migration 0013: ERP Core Modules Schema

**Date:** 2026-05-14
**Modules:** Inventory, Procurement, Accounts, Assets
**Status:** Schema Definition Complete

---

## Overview

This migration adds comprehensive database schema for four core ERP modules:
1. **Inventory Module** - Stock/warehouse management
2. **Procurement Module** - Purchase orders and supplier management
3. **Accounts Module** - General ledger, payments, and financial tracking
4. **Assets Module** - Fixed assets register and depreciation

---

## Table of Contents

1. [Inventory Module](#inventory-module)
2. [Procurement Module](#procurement-module)
3. [Accounts Module](#accounts-module)
4. [Assets Module](#assets-module)
5. [Indexes](#indexes)
6. [Relationships](#relationships)

---

## Inventory Module

### Tables

#### `items` (📦 Items Catalog)
Products/materials catalog for inventory management.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| public_id | varchar(50) | Public reference ID |
| name | varchar(255) | Item name |
| sku | varchar(100) | Stock Keeping Unit (unique) |
| description | text | Item description |
| unit | varchar(50) | Unit of measure (pcs, kg, meters) |
| category | varchar(100) | Item category |
| brand | varchar(100) | Brand/manufacturer |
| manufacturer | varchar(255) | Manufacturer name |
| image_url | text | Product image URL |
| reorder_level | integer | Alert level for restocking |
| lead_time_days | integer | Days to restock |
| cost_price | decimal(12,2) | Purchase cost |
| selling_price | decimal(12,2) | Selling price |
| is_active | boolean | Active status |
| metadata | jsonb | Additional specifications |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `idx_items_sku` on sku
- `idx_items_category` on category
- `idx_items_active` on is_active

---

#### `warehouses` (🏭 Warehouses)
Storage locations for inventory.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| public_id | varchar(50) | Public reference ID |
| name | varchar(255) | Warehouse name |
| location | text | Full address |
| city | varchar(100) | City |
| district | varchar(100) | District |
| coordinates | jsonb | GPS coordinates |
| manager_id | integer | FK: employees.id |
| capacity | decimal(15,2) | Maximum capacity |
| is_active | boolean | Active status |
| notes | text | Additional notes |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `idx_warehouses_active` on is_active
- `idx_warehouses_district` on district

---

#### `bins` (📊 Storage Bins)
Storage locations within warehouses (shelves, zones).

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| public_id | varchar(50) | Public reference ID |
| warehouse_id | integer | FK: warehouses.id |
| name | varchar(255) | Bin name/location |
| location | text | Detailed location |
| capacity | decimal(15,2) | Maximum capacity |
| current_capacity | decimal(15,2) | Current usage |
| is_active | boolean | Active status |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `idx_bins_warehouse` on warehouse_id
- `idx_bins_active` on is_active

---

#### `stock_entries` (📝 Stock Movements)
Record of all stock movements (in/out/transfers).

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| public_id | varchar(50) | Public reference ID |
| item_id | integer | FK: items.id |
| warehouse_id | integer | FK: warehouses.id |
| bin_id | integer | FK: bins.id |
| quantity | integer | Movement quantity (+/-) |
| type | varchar(50) | receipt, issue, transfer, adjustment |
| reference_type | varchar(50) | Reference document type |
| reference_id | integer | Reference document ID |
| batch_no | varchar(100) | Batch tracking |
| serial_no | varchar(100) | Serial tracking |
| rate | decimal(12,2) | Unit rate |
| amount | decimal(15,2) | Total value |
| remarks | text | Notes |
| posting_date | timestamp | Transaction date |
| created_at | timestamp | Creation timestamp |

**Indexes:**
- `idx_stock_entries_item` on item_id
- `idx_stock_entries_warehouse` on warehouse_id
- `idx_stock_entries_type` on type
- `idx_stock_entries_posting_date` on posting_date
- `idx_stock_entries_reference` on (reference_type, reference_id)

---

#### `stock_ledger` (📊 Stock Ledger)
Current stock levels per item per warehouse.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| item_id | integer | FK: items.id |
| warehouse_id | integer | FK: warehouses.id |
| bin_id | integer | FK: bins.id |
| quantity | integer | Current available quantity |
| reserved_quantity | integer | Reserved for orders |
| valuation_rate | decimal(12,2) | Average valuation rate |
| last_updated | timestamp | Last update timestamp |

**Indexes:**
- `idx_stock_ledger_item_warehouse` on (item_id, warehouse_id)
- `idx_stock_ledger_bin` on bin_id

---

## Procurement Module

### Tables

#### `suppliers` (🏢 Suppliers)
Vendor management for procurement.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| public_id | varchar(50) | Public reference ID |
| name | varchar(255) | Supplier name |
| display_name | varchar(255) | Display name |
| contact_person | varchar(255) | Primary contact |
| email | varchar(255) | Email |
| phone | varchar(50) | Phone |
| mobile | varchar(50) | Mobile |
| address | text | Address |
| city | varchar(100) | City |
| district | varchar(100) | District |
| country | varchar(100) | Country (default: Bhutan) |
| tax_id | varchar(50) | Taxpayer ID |
| pan | varchar(50) | PAN number |
| payment_terms | varchar(100) | Payment terms |
| credit_limit | decimal(15,2) | Credit limit |
| credit_days | integer | Credit days |
| bank_name | varchar(100) | Bank name |
| bank_account_no | varchar(50) | Bank account |
| bank_branch | varchar(100) | Bank branch |
| is_active | boolean | Active status |
| is_preferred | boolean | Preferred supplier |
| rating | varchar(20) | A, B, C rating |
| notes | text | Notes |
| metadata | jsonb | Additional details |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `idx_suppliers_active` on is_active
- `idx_suppliers_name` on name
- `idx_suppliers_city` on city

---

#### `purchase_orders` (📋 Purchase Orders)
Purchase orders to suppliers.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| public_id | varchar(50) | Public reference ID |
| supplier_id | integer | FK: suppliers.id |
| order_number | varchar(100) | PO number (unique) |
| status | varchar(50) | draft, submitted, approved, rejected, issued, received |
| order_date | timestamp | Order date |
| expected_date | timestamp | Expected delivery |
| received_date | timestamp | Actual delivery |
| total_amount | decimal(15,2) | Subtotal |
| total_tax | decimal(12,2) | Total tax |
| total_discount | decimal(12,2) | Total discount |
| grand_total | decimal(15,2) | Grand total |
| currency | varchar(10) | Currency (default: Nu.) |
| terms | text | Payment terms |
| notes | text | Notes |
| approved_by | integer | FK: employees.id |
| approved_at | timestamp | Approval timestamp |
| rejected_by | integer | FK: employees.id |
| rejected_at | timestamp | Rejection timestamp |
| rejection_reason | text | Rejection reason |
| warehouse_id | integer | FK: warehouses.id |
| project_id | integer | FK: projects.id |
| metadata | jsonb | Additional details |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `idx_po_supplier` on supplier_id
- `idx_po_status` on status
- `idx_po_order_date` on order_date
- `idx_po_number` on order_number
- `idx_po_project` on project_id

---

#### `purchase_order_items` (📦 PO Items)
Line items in purchase orders.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| purchase_order_id | integer | FK: purchase_orders.id |
| item_id | integer | FK: items.id |
| description | varchar(500) | Item description |
| quantity | integer | Order quantity |
| received_quantity | integer | Received quantity |
| rejected_quantity | integer | Rejected quantity |
| rate | decimal(12,2) | Unit price |
| amount | decimal(15,2) | Line amount |
| tax_rate | decimal(5,2) | Tax percentage |
| tax_amount | decimal(12,2) | Tax amount |
| discount_rate | decimal(5,2) | Discount percentage |
| discount_amount | decimal(12,2) | Discount amount |
| net_amount | decimal(15,2) | Net amount |
| warehouse_id | integer | FK: warehouses.id |
| notes | text | Notes |
| created_at | timestamp | Creation timestamp |

**Indexes:**
- `idx_po_items_po` on purchase_order_id
- `idx_po_items_item` on item_id

---

#### `request_for_quotations` (📄 RFQ)
RFQ sent to suppliers for price comparison.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| public_id | varchar(50) | Public reference ID |
| rfq_number | varchar(100) | RFQ number (unique) |
| status | varchar(50) | draft, sent, received, awarded, cancelled |
| title | varchar(255) | RFQ title |
| description | text | Description |
| required_by | timestamp | Required date |
| valid_until | timestamp | Quote validity |
| terms | text | Terms |
| notes | text | Notes |
| project_id | integer | FK: projects.id |
| warehouse_id | integer | FK: warehouses.id |
| created_by | integer | FK: employees.id |
| metadata | jsonb | Additional details |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `idx_rfq_status` on status
- `idx_rfq_number` on rfq_number
- `idx_rfq_required_by` on required_by

---

#### `rfq_suppliers` (📋 RFQ Suppliers)
Suppliers invited to quote.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| rfq_id | integer | FK: request_for_quotations.id |
| supplier_id | integer | FK: suppliers.id |
| status | varchar(50) | pending, quoted, not_responded |
| quoted_amount | decimal(15,2) | Quoted amount |
| quoted_date | timestamp | Quote date |
| notes | text | Notes |
| is_awarded | boolean | If awarded |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `idx_rfq_suppliers_rfq` on rfq_id
- `idx_rfq_suppliers_supplier` on supplier_id

---

#### `rfq_items` (📦 RFQ Items)
Items in an RFQ.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| rfq_id | integer | FK: request_for_quotations.id |
| item_id | integer | FK: items.id |
| description | varchar(500) | Item description |
| quantity | integer | Required quantity |
| unit | varchar(50) | Unit of measure |
| specifications | text | Detailed specs |
| estimated_cost | decimal(12,2) | Estimated cost |
| created_at | timestamp | Creation timestamp |

**Indexes:**
- `idx_rfq_items_rfq` on rfq_id

---

## Accounts Module

### Tables

#### `parties` (🏛️ Parties)
Unified parties (customers, suppliers) for accounting.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| public_id | varchar(50) | Public reference ID |
| party_type | varchar(50) | customer, supplier, employee |
| name | varchar(255) | Party name |
| taxpayer_id | varchar(50) | TIN/PAN |
| address | text | Address |
| city | varchar(100) | City |
| country | varchar(100) | Country (default: Bhutan) |
| phone | varchar(50) | Phone |
| email | varchar(255) | Email |
| is_active | boolean | Active status |
| metadata | jsonb | Additional details |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `idx_parties_type` on party_type
- `idx_parties_name` on name
- `idx_parties_active` on is_active

---

#### `accounts` (📒 Chart of Accounts)
General ledger accounts.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| public_id | varchar(50) | Public reference ID |
| account_number | varchar(50) | Account number (unique) |
| name | varchar(255) | Account name |
| account_type | varchar(50) | asset, liability, equity, income, expense |
| root_type | varchar(50) | asset, liability, equity, income, expense |
| parent_id | integer | FK: accounts.id (self) |
| is_group | boolean | If true, is a group account |
| balance | decimal(15,2) | Current balance |
| currency | varchar(10) | Currency (default: Nu.) |
| is_active | boolean | Active status |
| tax_rate | decimal(5,2) | Tax rate for tax accounts |
| notes | text | Notes |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `idx_accounts_number` on account_number
- `idx_accounts_type` on account_type
- `idx_accounts_root_type` on root_type
- `idx_accounts_parent` on parent_id
- `idx_accounts_active` on is_active

---

#### `payment_entries` (💳 Payment Entries)
Record of payments received and made.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| public_id | varchar(50) | Public reference ID |
| payment_number | varchar(100) | PAY number (unique) |
| payment_type | varchar(50) | receive, pay |
| party_type | varchar(50) | customer, supplier |
| party_id | integer | FK: parties.id |
| party_name | varchar(255) | Denormalized name |
| amount | decimal(15,2) | Total amount |
| paid_amount | decimal(15,2) | Amount paid |
| outstanding_amount | decimal(15,2) | Outstanding |
| currency | varchar(10) | Currency (default: Nu.) |
| payment_method | varchar(50) | cash, bank, cheque, card, upi |
| reference_no | varchar(100) | Reference number |
| reference_date | timestamp | Reference date |
| reference_type | varchar(50) | Reference document type |
| reference_id | integer | Reference document ID |
| bank_account_id | integer | FK: accounts.id |
| status | varchar(50) | draft, submitted, reconciled, cancelled |
| posting_date | timestamp | Posting date |
| cleared_date | timestamp | Cleared date |
| remarks | text | Remarks |
| approved_by | integer | FK: employees.id |
| approved_at | timestamp | Approval timestamp |
| project_id | integer | FK: projects.id |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `idx_payment_entries_number` on payment_number
- `idx_payment_entries_party` on (party_type, party_id)
- `idx_payment_entries_status` on status
- `idx_payment_entries_posting_date` on posting_date
- `idx_payment_entries_reference` on (reference_type, reference_id)

---

#### `journal_entries` (📔 Journal Entries)
Manual journal entries for accounting adjustments.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| public_id | varchar(50) | Public reference ID |
| voucher_no | varchar(100) | JV number (unique) |
| voucher_type | varchar(50) | journal_entry, bank_entry |
| posting_date | timestamp | Posting date |
| total_debit | decimal(15,2) | Total debit |
| total_credit | decimal(15,2) | Total credit |
| status | varchar(50) | draft, submitted, cancelled |
| remarks | text | Remarks |
| user_remark | text | User's note |
| fiscal_year | varchar(20) | Fiscal year |
| submitted_by | integer | FK: employees.id |
| submitted_at | timestamp | Submission timestamp |
| approved_by | integer | FK: employees.id |
| approved_at | timestamp | Approval timestamp |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `idx_journal_entries_voucher` on voucher_no
- `idx_journal_entries_posting_date` on posting_date
- `idx_journal_entries_status` on status
- `idx_journal_entries_fiscal_year` on fiscal_year

---

#### `journal_entry_accounts` (📝 JV Accounts)
Line items in journal entries.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| journal_entry_id | integer | FK: journal_entries.id |
| account_id | integer | FK: accounts.id |
| debit | decimal(15,2) | Debit amount |
| credit | decimal(15,2) | Credit amount |
| party_type | varchar(50) | customer, supplier |
| party_id | integer | FK: parties.id |
| reference_type | varchar(50) | Reference type |
| reference_id | integer | Reference ID |
| cost_center | varchar(100) | Cost center |
| remarks | text | Remarks |
| created_at | timestamp | Creation timestamp |

**Indexes:**
- `idx_je_accounts_journal` on journal_entry_id
- `idx_je_accounts_account` on account_id
- `idx_je_accounts_party` on (party_type, party_id)

---

#### `gl_entries` (📊 General Ledger)
GL entries (auto-generated from invoices, payments, journals).

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| posting_date | timestamp | Posting date |
| account | integer | FK: accounts.id |
| party_type | varchar(50) | customer, supplier |
| party_id | integer | FK: parties.id |
| voucher_type | varchar(50) | invoice, payment, journal |
| voucher_no | varchar(100) | Voucher number |
| against_voucher_type | varchar(50) | Against voucher type |
| against_voucher_no | varchar(100) | Against voucher number |
| debit | decimal(15,2) | Debit amount |
| credit | decimal(15,2) | Credit amount |
| is_cancelled | boolean | Cancelled status |
| remarks | text | Remarks |
| created_at | timestamp | Creation timestamp |

**Indexes:**
- `idx_gl_entries_account` on account
- `idx_gl_entries_voucher` on (voucher_type, voucher_no)
- `idx_gl_entries_posting_date` on posting_date
- `idx_gl_entries_party` on (party_type, party_id)

---

#### `accounts_receivable` (📋 AR)
Money owed by customers.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| public_id | varchar(50) | Public reference ID |
| party_id | integer | FK: parties.id |
| invoice_id | integer | FK: invoices.id |
| reference_type | varchar(50) | Reference type |
| reference_id | integer | Reference ID |
| amount | decimal(15,2) | Original amount |
| paid_amount | decimal(15,2) | Amount paid |
| outstanding_amount | decimal(15,2) | Outstanding |
| due_date | timestamp | Due date |
| status | varchar(50) | overdue, unpaid, paid |
| age | integer | Days since due |
| notes | text | Notes |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `idx_ar_party` on party_id
- `idx_ar_status` on status
- `idx_ar_due_date` on due_date

---

#### `accounts_payable` (📋 AP)
Money owed to suppliers.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| public_id | varchar(50) | Public reference ID |
| party_id | integer | FK: parties.id |
| purchase_order_id | integer | FK: purchase_orders.id |
| reference_type | varchar(50) | Reference type |
| reference_id | integer | Reference ID |
| amount | decimal(15,2) | Original amount |
| paid_amount | decimal(15,2) | Amount paid |
| outstanding_amount | decimal(15,2) | Outstanding |
| due_date | timestamp | Due date |
| status | varchar(50) | unpaid, partially_paid, paid, overdue |
| age | integer | Days since due |
| notes | text | Notes |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `idx_ap_party` on party_id
- `idx_ap_status` on status
- `idx_ap_due_date` on due_date

---

#### `bank_accounts` (🏦 Bank Accounts)
Bank and cash accounts for payment processing.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| public_id | varchar(50) | Public reference ID |
| account_name | varchar(255) | Account name |
| account_type | varchar(50) | bank, cash, card |
| bank_name | varchar(100) | Bank name |
| account_no | varchar(100) | Account number |
| iban | varchar(50) | IBAN |
| swift_code | varchar(20) | SWIFT code |
| branch | varchar(100) | Branch |
| currency | varchar(10) | Currency (default: Nu.) |
| balance | decimal(15,2) | Current balance |
| is_active | boolean | Active status |
| is_default | boolean | Default account |
| metadata | jsonb | Additional details |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `idx_bank_accounts_active` on is_active
- `idx_bank_accounts_default` on is_default

---

## Assets Module

### Tables

#### `asset_categories` (📂 Asset Categories)
Categories for asset classification.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| public_id | varchar(50) | Public reference ID |
| name | varchar(255) | Category name |
| description | text | Description |
| parent_id | integer | FK: asset_categories.id (self) |
| depreciation_rate | decimal(5,2) | Annual depreciation % |
| depreciation_method | varchar(50) | straight_line, reducing_balance |
| useful_life | integer | Useful life (years) |
| is_fixed_asset | boolean | If true, capitalizes to asset |
| is_active | boolean | Active status |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `idx_asset_categories_parent` on parent_id
- `idx_asset_categories_active` on is_active

---

#### `assets` (🏢 Fixed Assets)
Fixed assets register.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| public_id | varchar(50) | Public reference ID |
| asset_number | varchar(100) | AST number (unique) |
| name | varchar(255) | Asset name |
| description | text | Description |
| category_id | integer | FK: asset_categories.id |
| item_id | integer | FK: items.id |
| purchase_date | timestamp | Purchase date |
| purchase_value | decimal(15,2) | Original cost |
| current_value | decimal(15,2) | After depreciation |
| salvage_value | decimal(12,2) | Residual value |
| accumulated_depreciation | decimal(15,2) | Total depreciation |
| net_book_value | decimal(15,2) | Current book value |
| location | varchar(255) | Physical location |
| warehouse_id | integer | FK: warehouses.id |
| assigned_to | integer | FK: employees.id |
| status | varchar(50) | active, sold, scrapped, written_off |
| serial_number | varchar(100) | Serial number |
| barcode | varchar(100) | Barcode |
| warranty_expiry | timestamp | Warranty expiry |
| last_audit_date | timestamp | Last audit |
| next_audit_date | timestamp | Next audit |
| image_url | text | Asset image |
| purchase_invoice_id | integer | Purchase invoice reference |
| supplier_id | integer | FK: suppliers.id |
| metadata | jsonb | Additional specs |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

**Indexes:**
- `idx_assets_number` on asset_number
- `idx_assets_category` on category_id
- `idx_assets_status` on status
- `idx_assets_location` on location
- `idx_assets_assigned_to` on assigned_to

---

#### `depreciation_schedule` (📅 Depreciation Schedule)
Scheduled depreciation entries.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| asset_id | integer | FK: assets.id |
| date | timestamp | Depreciation date |
| amount | decimal(12,2) | Depreciation amount |
| accumulated_depreciation | decimal(15,2) | Running total |
| net_book_value | decimal(15,2) | Value after depreciation |
| journal_entry_id | integer | FK: journal_entries.id |
| fiscal_year | varchar(20) | Fiscal year |
| status | varchar(50) | scheduled, posted, skipped |
| remarks | text | Remarks |
| created_at | timestamp | Creation timestamp |

**Indexes:**
- `idx_depreciation_asset` on asset_id
- `idx_depreciation_date` on date
- `idx_depreciation_fiscal_year` on fiscal_year
- `idx_depreciation_status` on status

---

#### `asset_maintenance` (🔧 Asset Maintenance)
Maintenance history for assets.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| asset_id | integer | FK: assets.id |
| maintenance_date | timestamp | Maintenance date |
| maintenance_type | varchar(50) | preventive, corrective, upgrade |
| description | text | Description |
| cost | decimal(12,2) | Maintenance cost |
| performed_by | varchar(255) | Performed by |
| vendor_id | integer | FK: suppliers.id |
| next_maintenance_date | timestamp | Next maintenance |
| notes | text | Notes |
| created_at | timestamp | Creation timestamp |

**Indexes:**
- `idx_asset_maintenance_asset` on asset_id
- `idx_asset_maintenance_date` on maintenance_date

---

#### `asset_movements` (📤 Asset Movements)
Track asset location transfers.

| Column | Type | Description |
|--------|------|-------------|
| id | serial | Primary key |
| asset_id | integer | FK: assets.id |
| movement_date | timestamp | Movement date |
| movement_type | varchar(50) | transfer_in, transfer_out, issue |
| from_location | varchar(255) | From location |
| to_location | varchar(255) | To location |
| from_warehouse_id | integer | FK: warehouses.id |
| to_warehouse_id | integer | FK: warehouses.id |
| from_employee_id | integer | FK: employees.id |
| to_employee_id | integer | FK: employees.id |
| reason | text | Reason |
| remarks | text | Remarks |
| created_by | integer | FK: employees.id |
| created_at | timestamp | Creation timestamp |

**Indexes:**
- `idx_asset_movements_asset` on asset_id
- `idx_asset_movements_date` on movement_date
- `idx_asset_movements_type` on movement_type

---

## Relationships Summary

### Inventory
- `warehouses.manager_id` → `employees.id`
- `bins.warehouse_id` → `warehouses.id`
- `stock_entries.item_id` → `items.id`
- `stock_entries.warehouse_id` → `warehouses.id`
- `stock_entries.bin_id` → `bins.id`
- `stock_ledger.item_id` → `items.id`
- `stock_ledger.warehouse_id` → `warehouses.id`
- `stock_ledger.bin_id` → `bins.id`

### Procurement
- `purchase_orders.supplier_id` → `suppliers.id`
- `purchase_orders.warehouse_id` → `warehouses.id`
- `purchase_orders.project_id` → `projects.id`
- `purchase_order_items.purchase_order_id` → `purchase_orders.id`
- `purchase_order_items.item_id` → `items.id`
- `rfq_suppliers.rfq_id` → `request_for_quotations.id`
- `rfq_suppliers.supplier_id` → `suppliers.id`
- `rfq_items.rfq_id` → `request_for_quotations.id`
- `rfq_items.item_id` → `items.id`

### Accounts
- `payment_entries.party_id` → `parties.id`
- `payment_entries.bank_account_id` → `accounts.id`
- `payment_entries.project_id` → `projects.id`
- `journal_entry_accounts.journal_entry_id` → `journal_entries.id`
- `journal_entry_accounts.account_id` → `accounts.id`
- `journal_entry_accounts.party_id` → `parties.id`
- `gl_entries.account` → `accounts.id`
- `gl_entries.party_id` → `parties.id`
- `accounts_receivable.party_id` → `parties.id`
- `accounts_receivable.invoice_id` → `invoices.id`
- `accounts_payable.party_id` → `parties.id`
- `accounts_payable.purchase_order_id` → `purchase_orders.id`

### Assets
- `asset_categories.parent_id` → `asset_categories.id` (self)
- `assets.category_id` → `asset_categories.id`
- `assets.item_id` → `items.id`
- `assets.warehouse_id` → `warehouses.id`
- `assets.assigned_to` → `employees.id`
- `assets.supplier_id` → `suppliers.id`
- `depreciation_schedule.asset_id` → `assets.id`
- `depreciation_schedule.journal_entry_id` → `journal_entries.id`
- `asset_maintenance.asset_id` → `assets.id`
- `asset_maintenance.vendor_id` → `suppliers.id`
- `asset_movements.asset_id` → `assets.id`
- `asset_movements.from_warehouse_id` → `warehouses.id`
- `asset_movements.to_warehouse_id` → `warehouses.id`
- `asset_movements.from_employee_id` → `employees.id`
- `asset_movements.to_employee_id` → `employees.id`

---

## Notes

1. **Naming Convention**: All column names use snake_case for PostgreSQL compatibility
2. **Timestamps**: All tables use `timestamp` type with `defaultNow()` for created_at
3. **Decimal Precision**: Financial amounts use `decimal(15,2)` for large values, `decimal(12,2)` for medium
4. **Indexes**: Indexes added on frequently queried columns (foreign keys, status, dates)
5. **Self-References**: `accounts` and `asset_categories` support hierarchical structures
6. **Soft Delete**: `assets` uses `status` field for soft delete (written_off)
7. **JSONB**: Flexible fields use `jsonb` for extensibility

---

## Migration Commands

```bash
# Generate migration
npx drizzle-kit generate:pg

# Push to database (development)
npx drizzle-kit push:pg

# Drop and recreate (WARNING: destructive)
npx drizzle-kit drop
```

---

## References

- ERPNext Schema: https://github.com/frappe/erpnext
- Drizzle ORM: https://orm.drizzle.team/
- PostgreSQL: https://www.postgresql.org/docs/
