# HR & Payroll Module - Implementation Documentation

**Implemented:** 2026-04-19
**Architecture:** N-Tier (Repository → Service → API)
**Compliance:** RRCO Bhutan (PF, GIS, PIT)

---

## Overview

Complete Payroll Calculation Engine for the Innovate Bhutan ERP system. Handles employee salary processing with statutory compliance for Bhutan's tax regulations including Provident Fund (PF), Group Insurance Scheme (GIS), and Personal Income Tax (PIT) with progressive slab calculations.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│           API Layer (Next.js Route Handlers)    │
│  app/api/payroll/                               │
├─────────────────────────────────────────────────┤
│           Service Layer (Business Logic)        │
│  lib/services/payrollService.ts                 │
│  - PIT Calculation Engine                       │
│  - PF/GIS Deductions                           │
│  - Status Workflows                            │
├─────────────────────────────────────────────────┤
│           Repository Layer (Data Access)        │
│  lib/repositories/payrollRepository.ts          │
│  - Drizzle ORM Queries                         │
├─────────────────────────────────────────────────┤
│           Database Layer (Supabase PostgreSQL)  │
│  employees, payslips tables                     │
└─────────────────────────────────────────────────┘
```

---

## File Structure

```
innovate-bhutan/
├── app/api/payroll/
│   ├── generate/
│   │   └── route.ts          # Generate/list payslips
│   ├── [id]/
│   │   ├── route.ts          # GET/PATCH/DELETE individual payslip
│   │   ├── approve/route.ts  # Approve payslip
│   │   └── pay/route.ts      # Mark as paid
│   └── batch/
│       └── route.ts          # Batch generation, period summary
├── lib/
│   ├── config/
│   │   └── taxConstants.ts   # Bhutan tax rates & PIT slabs
│   ├── repositories/
│   │   └── payrollRepository.ts
│   ├── services/
│   │   └── payrollService.ts # Calculation engine
│   └── validations/
│       └── payroll.ts        # Zod schemas
├── drizzle/
│   └── 0007_payroll_schema_enhancement.sql
└── db/
    └── schema.ts             # Updated with payroll fields
```

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payroll/generate` | POST | Generate payslip for employee |
| `/api/payroll/generate` | GET | List payslips with filters |
| `/api/payroll/[id]` | GET | Get specific payslip |
| `/api/payroll/[id]` | PATCH | Update payslip |
| `/api/payroll/[id]` | DELETE | Cancel payslip |
| `/api/payroll/[id]/approve` | POST | Approve payslip (draft→approved) |
| `/api/payroll/[id]/pay` | POST | Mark as paid (approved→paid) |
| `/api/payroll/batch` | POST | Generate batch payroll |
| `/api/payroll/batch` | GET | Get period summary |

---

## Tax Constants (Bhutan RRCO)

**Location:** [`lib/config/taxConstants.ts`](lib/config/taxConstants.ts)

```typescript
// Provident Fund: 5% employee + 5% employer
PF_EMPLOYEE_RATE: 0.05
PF_EMPLOYER_RATE: 0.05

// GIS: Flat rate per month
GIS_MONTHLY: 500

// PIT Progressive Slabs (Annual)
┌─────────────────────────┬───────┬──────────────────┐
│ Taxable Income Range    │ Rate  │ Tax Amount       │
├─────────────────────────┼───────┼──────────────────┤
│ Nu. 0 - 300,000         │ 0%    │ Nu. 0            │
│ Nu. 300,001 - 500,000   │ 10%   │ Up to Nu. 20,000 │
│ Nu. 500,001 - 700,000   │ 15%   │ Up to Nu. 50,000 │
│ Nu. 700,001 - 1,000,000 │ 20%   │ Up to Nu. 110,000│
│ Above Nu. 1,000,000     │ 25%   │ -                │
└─────────────────────────┴───────┴──────────────────┘
```

### PIT Calculation Example

**Scenario:** Annual taxable income of Nu. 600,000

```
First 300,000     @ 0%   = Nu.      0
Next 200,000      @ 10%  = Nu. 20,000
Remaining 100,000 @ 15%  = Nu. 15,000
────────────────────────────────────
Annual PIT        = Nu. 35,000
Monthly PIT       = Nu. 2,916.67
```

---

## Database Schema

### Employees Table (New Fields)

| Column | Type | Description |
|--------|------|-------------|
| `tin` | varchar(20) | Tax Identification Number |
| `pf_number` | varchar(30) | Provident Fund Number |
| `bank_account_number` | varchar(30) | Bank account |
| `bank_name` | varchar(100) | Bank name |
| `bank_branch` | varchar(100) | Branch name |
| `status` | varchar(20) | active/inactive/terminated/on_leave |
| `department` | varchar(100) | Department |
| `phone` | varchar(20) | Phone number |
| `email` | varchar(255) | Email address |

### Payslips Table (New Fields)

| Column | Type | Description |
|--------|------|-------------|
| `basic_salary` | decimal(12,2) | Base salary |
| `gross_salary` | decimal(12,2) | Total before deductions |
| `allowances` | jsonb | {rent, transport, entertainment, medical, other} |
| `bonuses` | decimal(12,2) | Bonus amount |
| `pf_employee` | decimal(12,2) | 5% employee PF contribution |
| `pf_employer` | decimal(12,2) | 5% employer PF contribution |
| `gis_deduction` | decimal(12,2) | Flat Nu. 500 GIS |
| `taxable_income` | decimal(12,2) | After PF+GIS deductions |
| `pit_deduction` | decimal(12,2) | Progressive PIT amount |
| `additional_deductions` | jsonb | {advance, loan, other} |
| `payment_date` | timestamp | Payment date |
| `payment_method` | varchar(20) | bank/cash/cheque |
| `generated_at` | timestamp | Calculation timestamp |
| `notes` | text | Notes |

---

## Usage Examples

### Generate a Single Payslip

```typescript
POST /api/payroll/generate

{
  "employeeId": 1,
  "month": 4,
  "year": 2026,
  "allowances": {
    "rent": 5000,
    "transport": 2000
  },
  "bonuses": 10000,
  "deductions": {
    "advance": 5000
  }
}
```

### Batch Payroll Generation

```typescript
POST /api/payroll/batch

{
  "month": 4,
  "year": 2026,
  "employeeIds": [1, 2, 3, 4, 5],
  "skipExisting": true
}
```

### Approve Payslip

```typescript
POST /api/payroll/123/approve

{
  "payslipId": 123,
  "approverId": "user-uuid",
  "notes": "Approved for April 2026"
}
```

### Mark as Paid

```typescript
POST /api/payroll/123/pay

{
  "payslipId": 123,
  "paymentMethod": "bank",
  "paymentDate": "2026-04-30",
  "transactionReference": "TXN123456"
}
```

---

## Status Workflow

```
┌─────────┐      ┌──────────┐      ┌──────┐
│  DRAFT  │ ───> │ APPROVED │ ───> │ PAID │
└─────────┘      └──────────┘      └──────┘
     │                 │
     │                 │
     v                 v
┌─────────┐      ┌──────────┐
│CANCELLED│      │CANCELLED │
└─────────┘      └──────────┘
```

**Allowed Transitions:**
- draft → approved, cancelled
- approved → paid, cancelled
- paid → (no transitions)
- cancelled → (no transitions)

---

## Validation Schemas

All inputs validated using Zod:

- `generatePayrollSchema` - Payslip generation
- `batchPayrollSchema` - Batch operations
- `approvePayrollSchema` - Approval
- `markPaidPayrollSchema` - Payment
- `payslipQuerySchema` - List/filter
- `updatePayslipSchema` - Updates

---

## Migration

**File:** [`drizzle/0007_payroll_schema_enhancement.sql`](drizzle/0007_payroll_schema_enhancement.sql)

Run the migration to add payroll fields to existing tables:

```bash
# Apply migration
psql -U postgres -d your_database -f drizzle/0007_payroll_schema_enhancement.sql

# Or via Supabase dashboard
# Run the SQL in the SQL editor
```

---

## Calculation Engine Details

**Location:** [`lib/services/payrollService.ts`](lib/services/payrollService.ts)

### Gross Salary Calculation
```
gross_salary = basic_salary + allowances_total + bonuses
```

### PF Deduction (5% each)
```
pf_employee = gross_salary × 0.05
pf_employer = gross_salary × 0.05
```

### Taxable Income
```
taxable_income = gross_salary - pf_employee - gis_deduction
```

### PIT (Progressive Slab)
```typescript
calculatePIT(annualTaxableIncome: number): number {
  let tax = 0;
  let previousLimit = 0;

  for (const slab of PIT_SLABS) {
    const taxableInSlab = Math.min(income, slab.limit) - previousLimit;
    if (taxableInSlab > 0) {
      tax += taxableInSlab * slab.rate;
    }
    previousLimit = slab.limit;
  }

  return tax / 12; // Monthly PIT
}
```

### Net Salary
```
net_salary = gross_salary - (pf_employee + gis + pit + other_deductions)
```

---

## Testing

### Test Cases for PIT Calculation

| Annual Income | Expected Annual PIT | Monthly PIT |
|---------------|---------------------|-------------|
| Nu. 250,000 | Nu. 0 | Nu. 0 |
| Nu. 300,000 | Nu. 0 | Nu. 0 |
| Nu. 350,000 | Nu. 5,000 | Nu. 416.67 |
| Nu. 500,000 | Nu. 20,000 | Nu. 1,666.67 |
| Nu. 600,000 | Nu. 35,000 | Nu. 2,916.67 |
| Nu. 850,000 | Nu. 80,000 | Nu. 6,666.67 |
| Nu. 1,200,000 | Nu. 185,000 | Nu. 15,416.67 |

---

## Security & Compliance

- **RLS Enabled:** All queries respect Row Level Security
- **Audit Logging:** All mutations logged to `audit_logs` table
- **Input Validation:** Zod schemas on all API endpoints
- **Status Validation:** Workflow prevents invalid state transitions
- **Duplicate Prevention:** Unique constraint on (employee, month, year)

---

## Next Steps

1. **UI Implementation:** Build HR dashboard at [`app/admin/hr/`](app/admin/hr/)
2. **PDF Generation:** Add payslip PDF generation
3. **Email Notifications:** Send payslip emails to employees
4. **Reports:** Build payroll reports and summaries
5. **YTD Tracking:** Year-to-date tax and earnings tracking

---

## Dependencies

No new npm packages required. Uses existing:
- `drizzle-orm` - Database queries
- `@supabase/supabase-js` - Audit logging
- `zod` - Input validation
- `next` - API routes

---

## Support

For issues or questions, refer to:
- [`CLAUDE.md`](CLAUDE.md) - Project overview
- [`CODEBASE.md`](CODEBASE.md) - Architecture guide
- [`audit.md`](audit.md) - System audit
