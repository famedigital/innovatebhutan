# Innovate Bhutan ERP - UML Class Diagram

## Core Entities

```
┌────────────────────────────────────────────────────────────────────┐
│                           USER (Supabase Auth)                          │
└──────────────────────────────┬─────────────────────────────────────┘
                               │
                               │ has
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         PROFILE                                  │
├─────────────────────────────────────────────────────────────────────┤
│ - id: number (PK)                                                        │
│ - userId: string (unique) ← Supabase Auth UUID                             │
│ - fullName: string                                                      │
│ - role: ADMIN | STAFF | CLIENT                                              │
│ - createdAt: timestamp                                                  │
└──────────────────────────────────┬────────────────────────────────────┘
                                   │
                 ┌──────────────────┴───────────────────┐
                 │                                      │
    ┌────────────┴────────────┐        ┌────────────┴────────────┐
    ▼                         ▼        ▼                         ▼
┌────────┐              ┌────────┐ ┌─────────┐    ┌──────────┐
│ CLIENT │              │PROJECT│ │  AMC    │    │  TICKET  │
└────────┘              └────────┘ └─────────┘    └──────────┘
     │                       │          │            │
     │ pays                 │ uses    │ renews    │ handled by │
     │                      │          │           │
     ▼                      ▼          ▼            ▼
┌─────────┐            ┌──────────┐ ┌──────────┐  ┌────────────┐
│ INVOICE │            │TASK      │ │PAYSLIP  │  │MESSAGE    │
└─────────┘            └──────────┘ └──────────┘  └────────────┘
```

## Inventory Module

```
┌─────────────────────────────────────────────────────────────────────┐
│                              ITEM                                  │
├─────────────────────────────────────────────────────────────────────┤
│ - id: number (PK)                                                        │
│ - publicId: string (unique)                                               │
│ - name: string                                                           │
│ - sku: string (unique)                                                    │
│ - category: string                                                        │
│ - unit: string (pcs, kg, meters)                                            │
│ - costPrice: decimal                                                       │
│ - sellingPrice: decimal                                                    │
│ - reorderLevel: integer                                                   │
│ - isActive: boolean                                                      │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ stored in
                            ▼
                   ┌─────────────────┐
                   │    WAREHOUSE     │
                   ├─────────────────┤
                   │ - id: number    │
                   │ - name: string  │
                   │ - location: text │
                   │ - managerId → EMPLOYEE
                   └───────┬─────────┘
                           │
                           │ contains
                           ▼
                   ┌─────────────────┐
                   │      BIN         │
                   ├─────────────────┤
                   │ - warehouseId   │
                   │ - name: string   │
                   │ - capacity      │
                   └─────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         STOCK_ENTRY                               │
├─────────────────────────────────────────────────────────────────────┤
│ - id: number (PK)                                                        │
│ - itemId → ITEM                                                         │
│ - warehouseId → WAREHOUSE                                                 │
│ - binId → BIN                                                           │
│ - quantity: integer                                                      │
│ - type: receipt | issue | transfer | adjustment                             │
│ - referenceType: purchase_order | project | etc.                            │
│ - referenceId: integer                                                   │
│ - postingDate: timestamp                                                  │
└─────────────────────────────────────────────────────────────────────┘
                            │
                            │ updates
                            ▼
                   ┌─────────────────┐
                   │   STOCK_LEDGER   │
                   ├─────────────────┤
                   │ - itemId → ITEM   │
                   │ - warehouseId → WAREHOUSE
                   │ - quantity        │
                   │ - reservedQty     │
                   └─────────────────┘
```

## Procurement Module

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SUPPLIER                                │
├─────────────────────────────────────────────────────────────────────┤
│ - id: number (PK)                                                        │
│ - publicId: string (unique)                                               │
│ - name: string                                                           │
│ - email: string                                                          │
│ - phone: string                                                           │
│ - taxId: string                                                           │
│ - paymentTerms: string                                                   │
│ - creditLimit: decimal                                                     │
│ - isActive: boolean                                                      │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ supplies
                            ▼
                   ┌─────────────────────────────────────────┐
                   │         PURCHASE_ORDER                  │
                   ├─────────────────────────────────────────┤
                   │ - id: number (PK)                         │
                   │ - publicId: string (unique)                │
                   │ - supplierId → SUPPLIER                  │
                   │ - orderNumber: string (unique)             │
                   │ - status: draft | submitted | approved | issued | received
                   │ - totalAmount: decimal                     │
                   │ - warehouseId → WAREHOUSE (optional)        │
                   │ - projectId → PROJECT (optional)           │
                   └─────────────────┬───────────────────────┘
                                   │ contains
                                   ▼
                   ┌─────────────────────────────────────────┐
                   │      PURCHASE_ORDER_ITEM                 │
                   ├─────────────────────────────────────────┤
                   │ - purchaseOrderId → PURCHASE_ORDER         │
                   │ - itemId → ITEM                           │
                   │ - quantity: integer                       │
                   │ - rate: decimal                           │
                   │ - amount: decimal                          │
                   └─────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   REQUEST_FOR_QUOTATION                            │
├─────────────────────────────────────────────────────────────────────┤
│ - id: number (PK)                                                        │
│ - rfqNumber: string (unique)                                               │
│ - status: draft | sent | received | awarded                                   │
│ - title: string                                                          │
│ - requiredBy: timestamp                                                   │
│ - warehouseId → WAREHOUSE (optional)                                     │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ has many
                            ▼
                   ┌─────────────────────────────────────────┐
                   │          RFQ_ITEM                      │
                   ├─────────────────────────────────────────┤
                   │ - rfqId → REQUEST_FOR_QUOTATION          │
                   │ - itemId → ITEM (optional)               │
                   │ - description: text                     │
                   │ - quantity: integer                       │
                   └─────────────────────────────────────────┘
```

## Accounts Module

```
┌─────────────────────────────────────────────────────────────────────┐
│                          PARTY                                  │
├─────────────────────────────────────────────────────────────────────┤
│ - id: number (PK)                                                        │
│ - publicId: string (unique)                                               │
│ - partyType: customer | supplier | employee                                 │
│ - name: string                                                           │
│ - taxpayerId: string                                                       │
│ - isActive: boolean                                                      │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌───────────────┐                     ┌─────────────────────────┐
│ ACCOUNT       │                     │    PAYMENT_ENTRY        │
├───────────────┤                     ├─────────────────────────┤
│ - id: number  │                     │ - id: number           │
│ - accountNum  │                     │ - paymentNumber       │
│ - name: string│                     │ - partyType           │
│ - accountType:│                     │ - partyId → PARTY      │
│   asset |                         │ - amount              │
│   liability│                      │ - paidAmount          │
│   equity |                          │ - status              │
│   income |                          │ - postingDate         │
│   expense  │                         │ - referenceId          │
│ - parentId → ACCOUNT                  │ - bankAccountId → BANK_ACCOUNT
└───────┬────────┘                     └───────────┬─────────────┘
        │                                         │
        ▼                                         │
┌───────────────────┐                     │
│  JOURNAL_ENTRY     │                     │
├───────────────────┤                     │
│ - id: number  │                     │
│ - voucherNo: string                     │
│ - postingDate                         │
│ - totalDebit   │                     │
│ - totalCredit                         │
│ - status: draft | submitted              │
└───────┬──────────┘                     │
        │                                  │
        ▼                                  ▼
┌───────────────────────────┐    ┌─────────────────────────┐
│  JOURNAL_ENTRY_ACCOUNT     │    │   GL_ENTRY                │
├───────────────────────────┤    ├─────────────────────────┤
│ - journalEntryId → JOURNAL   │    │ - postingDate             │
│ - accountId → ACCOUNT      │    │ - account → ACCOUNT       │
│ - debit: decimal             │    │ - debit                   │
│ - credit: decimal            │    │ - credit                  │
│ - partyId → PARTY (optional)│    │ - partyType               │
└──────────────────────────────┘    └──────────────────────────────┘
                                                    │
                                                    ▼
                                         ┌───────────────────────────┐
                                         │    ACCOUNTS_RECEIVABLE     │
│  ┌──────────────────────────────────┴────────┐
│  │         ACCOUNTS_PAYABLE             │    ├───────────────────────────┤
│  ├─────────────────────────────────────┤    │ - partyId → PARTY        │
│  │ - partyId → PARTY                     │    │ - invoiceId → INVOICE    │
│  │ - purchaseOrderId → PURCHASE_ORDER   │    │ - amount                 │
│  │ - amount                             │    │ - dueDate                │
│  │ - dueDate                            │    │ - status: current | 30 | 60 | 90+
│  │ - status                             │    └────────────────────────────┘
│  └─────────────────────────────────────┘
```

## Assets Module

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ASSET_CATEGORY                               │
├─────────────────────────────────────────────────────────────────────┤
│ - id: number (PK)                                                        │
│ - name: string                                                           │
│ - depreciationRate: decimal                                               │
│ - usefulLife: integer                                                    │
│ - parentId → ASSET_CATEGORY                                             │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ categorizes
                            ▼
                   ┌─────────────────────────────────────────┐
                   │            ASSET                        │
                   ├─────────────────────────────────────────┤
                   │ - id: number (PK)                         │
                   │ - assetNumber: string (unique)             │
                   │ - name: string                            │
                   │ - categoryId → ASSET_CATEGORY             │
                   │ - itemId → ITEM (optional)                │
                   │ - purchaseValue: decimal                   │
                   │ - currentValue: decimal                   │
                   │ - accumulatedDepreciation: decimal          │
                   │ - status: active | sold | scrapped            │
                   │ - warehouseId → WAREHOUSE (location)       │
                   │ - assignedTo → EMPLOYEE (optional)          │
                   └───────────────────┬───────────────────────┘
                                       │
                                       │ tracked by
                                       ▼
                   ┌─────────────────────────────────────────┐
                   │     DEPRECIATION_SCHEDULE                │
                   ├─────────────────────────────────────────┤
                   │ - assetId → ASSET                        │
                   │ - date: timestamp                          │
                   │ - amount: decimal                          │
                   │ - accumulatedDepreciation: decimal         │
                   │ - netBookValue: decimal                    │
                   │ - fiscalYear: string                       │
                   └─────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                  ASSET_MOVEMENT                                 │
├─────────────────────────────────────────────────────────────────────┤
│ - assetId → ASSET                                                        │
│ - movementType: transfer_in | transfer_out | issue | return                    │
│ - fromWarehouseId → WAREHOUSE                                            │
│ - toWarehouseId → WAREHOUSE                                              │
│ - fromEmployeeId → EMPLOYEE                                              │
│ - toEmployeeId → EMPLOYEE                                                │
│ - movementDate: timestamp                                                │
└─────────────────────────────────────────────────────────────────────┘
```

## Relationships Summary

```
CLIENT ──────► PROJECT ──────► TASK
 │                     │
 │                     ▼
 │                PROJECT_MEMBER (profileId → PROFILE.userId)
 │
 ├─────────────────────┬─────────────┬──────────────┐
 │                     │             │              │
 ▼                     ▼             ▼              ▼
INVOICE               ORDER         TICKET        PAYSLIP
 │                     │             │
 │                     │             ▼
 │                     │          EMPLOYEE
 │                     │             │
 │                     ▼             ▼
 │                  EXPENSE      ATTENDANCE
 │
 ▼
TRANSACTION ──────────► PROJECT (expense tracking)
```

## Module Interactions

```
┌──────────────┐    ┌─────────────┐    ┌─────────────┐
│  Inventory  │    │ Procurement │    │  Accounts   │
└──────┬───────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                 │
       │                  │                 │
       │           ┌────▼────────┐    ┌───▼──────────┐
       │           │   PROJECT   │    │   ASSET     │
       │           └────────────┘    └─────────────┘
       │                  │                 │
       └──────────────────┴─────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  DASHBOARD   │
                    └──────────────┘
```

## Access Control (RBAC)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ROLE                                    │
└─────────────────────────────────────────────────────────────────────┘

     ADMIN                         STAFF                      CLIENT
  │                            │                           │
  ├─► All modules               ├─► Projects                 ├─► Own Profile
  ├─► Settings                 ├─► Tasks                   ├─► Assigned Tasks
  ├─► Users                     ├─► Timesheets              ├─► Timesheets (view)
  ├─► Audit Logs                ├─► Invoices (create)      │
  ├─► API Keys                  ├─► Expenses (create)      │
  └─► System Config             └─► Inventory (view)        │
                                ├─► Purchasing (view)    │
                                └─► Reports (view)        │
```

## Data Flow

```
┌──────────┐      ┌─────────┐      ┌────────┐      ┌──────┐
│   UI     │ ────► │ SERVICE │ ────► │REPO   │ ────► │  DB  │
└──────────┘      └─────────┘      └────────┘      └──────┘
     ▲                ▲               ▲              ▲
     │                │               │              │
┌──────────────────────────────────────────────────────────────────┐
│                      API ROUTE (auth check)                       │
└──────────────────────────────────────────────────────────────────┘
```

## Key Features by Module

### Inventory
- Multi-warehouse support
- Stock level tracking with low stock alerts
- Stock movements (receipts, issues, transfers)
- Item categorization with SKU management
- Bin-level tracking

### Procurement
- Supplier management with credit tracking
- Purchase order lifecycle (draft → approved → received)
- Request for Quotation (RFQ) for price comparison
- PO line items with tax calculations

### Accounts
- Double-entry bookkeeping validation
- Chart of Accounts (hierarchical)
- Payment entry workflow with reconciliation
- Aged receivables/payables reporting
- Journal entries with approval workflow
- General ledger auto-generation

### Assets
- Fixed asset register with valuation
- Depreciation calculation (straight-line, reducing balance)
- Maintenance scheduling and tracking
- Asset movements and assignments
- Net book value tracking

### Dashboard
- Real-time KPIs from all modules
- Revenue/expenses chart (6-month trend)
- Activity feed (recent actions)
- Date range filtering
- CSV export functionality
