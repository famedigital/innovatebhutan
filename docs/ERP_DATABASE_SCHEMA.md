# ERP Database Schema Reference

**Date**: 2026-04-21
**Schema File**: `db/schema.ts`
**Migrations**: `drizzle/*.sql`

---

## Overview

This document provides a comprehensive reference of the Innovate Bhutan ERP database schema, showing what's defined in code (`db/schema.ts`) versus what exists in the database. It serves as a quick lookup for schema structure and highlights discrepancies.

---

## Schema Tables by Module

### Core Identity & Access

#### profiles
**Purpose**: User profiles with RBAC roles

**Code Definition** (`db/schema.ts:73-79`):
```typescript
{
  id: serial (PK)
  userId: text (unique, not null) - Supabase Auth UUID
  fullName: varchar(255)
  role: varchar(50, default 'CLIENT') - ADMIN, STAFF, CLIENT
  createdAt: timestamp (default now())
}
```

**Database Status**: 
- Missing columns (before fix): `full_name`, `role`, `created_at`
- **Migration**: `drizzle/0011_profiles_schema_fix.sql`
- **RLS**: Enabled via `drizzle/0012_add_rls_policies.sql`

---

### Commercial & Operations

#### clients
**Purpose**: Enterprise partners/customers

**Code Definition** (`db/schema.ts:24-39`):
```typescript
{
  id: serial (PK)
  name: varchar(255, not null)
  active: boolean (default true)
  contactPerson: varchar(255)
  email: varchar(255)
  phone: varchar(50)
  whatsapp: varchar(50)
  whatsappGroupId: varchar(100)
  whatsappGroupLink: text
  logoUrl: text
  address: text
  city: varchar(100)
  country: varchar(100, default 'Bhutan')
  createdAt: timestamp (default now())
}
```

**Database Status**:
- Missing columns (before fix): `email`, `phone`, `address`, `city`, `country`
- **Migration**: `drizzle/0010_clients_schema_fix.sql`
- **RLS**: Enabled via `drizzle/0012_add_rls_policies.sql`

#### services
**Purpose**: Service catalog

**Code Definition** (`db/schema.ts:7-18`):
```typescript
{
  id: serial (PK)
  publicId: varchar(50, unique, not null)
  name: varchar(255, not null)
  category: varchar(100, not null)
  tagline: text
  description: text
  price: decimal(12, 2)
  currency: varchar(10, default 'Nu.')
  imageUrl: text
  createdAt: timestamp (default now())
}
```

**Database Status**: Assumed in sync
**RLS**: Not explicitly configured (public catalog)

#### orders
**Purpose**: Infrastructure deployment tracking

**Code Definition** (`db/schema.ts:45-55`):
```typescript
{
  id: serial (PK)
  customerName: varchar(255, not null)
  customerPhone: varchar(50, not null)
  customerLocation: varchar(255)
  status: varchar(50, default 'pending')
  totalAmount: decimal(15, 2, not null)
  meta: jsonb
  createdAt: timestamp (default now())
  updatedAt: timestamp (default now())
}
```

**Database Status**: Assumed in sync
**RLS**: Not explicitly configured

#### order_items
**Purpose**: Order line items

**Code Definition** (`db/schema.ts:61-67`):
```typescript
{
  id: serial (PK)
  orderId: integer (FK -> orders.id)
  serviceId: integer (FK -> services.id)
  quantity: integer (default 1)
  unitPrice: decimal(12, 2, not null)
}
```

**Database Status**: Assumed in sync

---

### Projects Module

#### projects
**Purpose**: Master project tracking

**Code Definition** (`db/schema.ts:269-291`):
```typescript
{
  id: serial (PK)
  publicId: varchar(50, unique)
  clientId: integer (FK -> clients.id, not null)
  serviceId: integer (FK -> services.id)
  name: varchar(255, not null)
  description: text
  status: varchar(50, default 'planning') // planning, active, testing, complete, on_hold, cancelled
  leadId: text - references profiles.user_id
  startDate: timestamp
  endDate: timestamp
  budget: decimal(15, 2)
  progress: integer (default 0) - cached 0-100
  deletedAt: timestamp - soft delete
  createdAt: timestamp (default now())
  updatedAt: timestamp (default now())
}
```

**Indexes**:
- `idx_projects_client` on clientId
- `idx_projects_status` on status
- `idx_projects_public` on publicId
- `idx_projects_lead_id` on leadId
- `idx_projects_deleted_at` on deletedAt

**Database Status**: Assumed in sync
**RLS**: Enabled via `drizzle/0012_add_rls_policies.sql`

#### project_tasks
**Purpose**: Task-level tracking

**Code Definition** (`db/schema.ts:297-317`):
```typescript
{
  id: serial (PK)
  projectId: integer (FK -> projects.id, not null)
  assignedTo: text - references profiles.user_id
  title: varchar(255, not null)
  description: text
  status: varchar(50, default 'todo') // todo, in_progress, done, blocked
  priority: varchar(50, default 'medium')
  dueDate: timestamp
  estimatedHours: decimal(10, 2)
  actualHours: decimal(10, 2)
  position: integer (default 0)
  deletedAt: timestamp - soft delete
  createdAt: timestamp (default now())
}
```

**Indexes**:
- `idx_tasks_project` on projectId
- `idx_tasks_status` on status
- `idx_tasks_due` on dueDate
- `idx_tasks_assigned_to` on assignedTo
- `idx_project_tasks_deleted_at` on deletedAt

**Database Status**: Assumed in sync
**RLS**: Enabled via `drizzle/0012_add_rls_policies.sql`

#### project_members
**Purpose**: Project access control

**Code Definition** (`db/schema.ts:323-332`):
```typescript
{
  id: serial (PK)
  projectId: integer (FK -> projects.id, not null)
  userId: text (not null) - references profiles.user_id
  role: varchar(50, default 'member') // owner, lead, member, viewer, client_viewer
  joinedAt: timestamp (default now())
}
```

**Indexes**:
- `idx_project_members_project_user` on (projectId, userId)
- `idx_project_members_user` on userId

**Database Status**: Assumed in sync
**RLS**: Enabled via `drizzle/0012_add_rls_policies.sql`

#### project_milestones
**Purpose**: Project phases/gates

**Code Definition** (`db/schema.ts:338-355`):
```typescript
{
  id: serial (PK)
  projectId: integer (FK -> projects.id, not null)
  name: varchar(255, not null)
  description: text
  status: varchar(50, default 'pending')
  dueDate: timestamp
  completedAt: timestamp
  position: integer (default 0)
  deletedAt: timestamp - soft delete
  createdAt: timestamp (default now())
  updatedAt: timestamp (default now())
}
```

**Database Status**: Assumed in sync
**RLS**: Enabled via `drizzle/0012_add_rls_policies.sql`

#### task_comments
**Purpose**: Threaded task comments

**Code Definition** (`db/schema.ts:361-375`):
```typescript
{
  id: serial (PK)
  taskId: integer (FK -> project_tasks.id, not null)
  userId: text (not null) - references profiles.user_id
  content: text (not null)
  parentId: integer - self-reference for threading
  deletedAt: timestamp - soft delete
  createdAt: timestamp (default now())
  updatedAt: timestamp (default now())
}
```

**Database Status**: Assumed in sync
**RLS**: Enabled via `drizzle/0012_add_rls_policies.sql`

#### task_checklist_items
**Purpose**: Task sub-items

**Code Definition** (`db/schema.ts:381-393`):
```typescript
{
  id: serial (PK)
  taskId: integer (FK -> project_tasks.id, not null)
  title: varchar(255, not null)
  isCompleted: boolean (default false)
  position: integer (default 0)
  deletedAt: timestamp - soft delete
  createdAt: timestamp (default now())
  completedAt: timestamp
}
```

**Database Status**: Assumed in sync
**RLS**: Enabled via `drizzle/0012_add_rls_policies.sql`

#### activity_events
**Purpose**: Project activity feed

**Code Definition** (`db/schema.ts:399-413`):
```typescript
{
  id: serial (PK)
  projectId: integer (FK -> projects.id)
  userId: text (not null) - references profiles.user_id
  eventType: varchar(50, not null)
  entityType: varchar(50)
  entityId: integer
  metadata: jsonb
  createdAt: timestamp (default now())
}
```

**Database Status**: Assumed in sync
**RLS**: Enabled via `drizzle/0012_add_rls_policies.sql`

---

### Support Module

#### tickets
**Purpose**: Support ticket tracking

**Code Definition** (`db/schema.ts:114-124`):
```typescript
{
  id: serial (PK)
  clientId: integer (FK -> clients.id)
  assignedTo: integer (FK -> profiles.id)
  subject: varchar(255, not null)
  description: text
  status: varchar(50, default 'open') // open, in_progress, resolved
  priority: varchar(50, default 'medium') // low, medium, high
  createdAt: timestamp (default now())
  updatedAt: timestamp (default now())
}
```

**Database Status**: Assumed in sync
**RLS**: Enabled via `drizzle/0012_add_rls_policies.sql`

#### ticket_messages
**Purpose**: Ticket message history

**Code Definition** (`db/schema.ts:130-137`):
```typescript
{
  id: serial (PK)
  ticketId: integer (FK -> tickets.id, not null)
  senderId: integer (FK -> profiles.id, not null)
  message: text (not null)
  isSystem: boolean (default false)
  createdAt: timestamp (default now())
}
```

**Database Status**: Assumed in sync
**RLS**: Enabled via `drizzle/0012_add_rls_policies.sql`

---

### AMC Module

#### amcs
**Purpose**: Annual Maintenance Contracts

**Code Definition** (`db/schema.ts:85-108`):
```typescript
{
  id: serial (PK)
  publicId: varchar(50, unique) - external reference
  clientId: integer (FK -> clients.id)
  serviceId: integer (FK -> services.id)
  contractNumber: varchar(100)
  startDate: timestamp (not null)
  endDate: timestamp (not null)
  amount: decimal(12, 2)
  hardwareDetails: jsonb
  servicesIncluded: jsonb
  renewedFrom: integer (FK -> amcs.id) - previous contract
  renewedTo: integer (FK -> amcs.id) - next contract
  status: varchar(50, default 'active') // active, expiring, expired, cancelled
  notes: text
  createdAt: timestamp (default now())
  updatedAt: timestamp (default now())
}
```

**Indexes**:
- `idx_amcs_client` on clientId
- `idx_amcs_service` on serviceId
- `idx_amcs_status` on status
- `idx_amcs_end_date` on endDate
- `idx_amcs_public` on publicId

**Database Status**: Assumed in sync
**RLS**: Enabled via `drizzle/0012_add_rls_policies.sql`

---

### Finance Module

#### invoices
**Purpose**: Customer billing

**Code Definition** (`db/schema.ts:245-263`):
```typescript
{
  id: serial (PK)
  invoiceNumber: varchar(50, unique, not null)
  clientId: integer (FK -> clients.id, not null)
  orderId: integer (FK -> orders.id)
  issueDate: timestamp (not null, default now())
  dueDate: timestamp (not null)
  total: decimal(15, 2, not null)
  status: varchar(50, default 'draft') // draft, sent, paid, overdue, cancelled
  items: jsonb - line items array
  notes: text
  createdAt: timestamp (default now())
  updatedAt: timestamp (default now())
}
```

**Indexes**:
- `idx_invoices_client` on clientId
- `idx_invoices_status` on status
- `idx_invoices_number` on invoiceNumber
- `idx_invoices_due` on dueDate

**Migration**: `drizzle/0006_invoice_schema_enhancement.md`
**Database Status**: Assumed in sync after migration
**RLS**: Enabled via `drizzle/0012_add_rls_policies.sql`

#### transactions
**Purpose**: Unified financial ledger

**Code Definition** (`db/schema.ts:218-226`):
```typescript
{
  id: serial (PK)
  type: varchar(20, not null) // INCOME, EXPENSE
  amount: decimal(15, 2, not null)
  category: varchar(100, not null)
  referenceId: text - link to Invoice/Expense ID
  notes: text
  date: timestamp (default now())
}
```

**Database Status**: Assumed in sync
**RLS**: Strict - ADMIN only via `drizzle/0012_add_rls_policies.sql`

#### expenses
**Purpose**: Expense reporting

**Code Definition** (`db/schema.ts:231-240`):
```typescript
{
  id: serial (PK)
  employeeId: integer (FK -> employees.id)
  amount: decimal(12, 2, not null)
  category: varchar(100, not null)
  description: text
  receiptUrl: text
  status: varchar(50, default 'pending') // pending, approved, rejected
  createdAt: timestamp (default now())
}
```

**Database Status**: Assumed in sync
**RLS**: Enabled via `drizzle/0012_add_rls_policies.sql`

---

### HR & Payroll Module

#### employees
**Purpose**: Employee records

**Code Definition** (`db/schema.ts:142-168`):
```typescript
{
  id: serial (PK)
  profileId: integer (FK -> profiles.id, not null)
  designation: varchar(100)
  baseSalary: decimal(12, 2)
  joinDate: timestamp (default now())
  photoUrl: text
  nationalIdMasked: varchar(20) - CID in Bhutan
  interviewScore: integer
  agreementsDocUrl: text
  joiningLetterUrl: text
  additionalDocs: jsonb - includes status, department
  // Payroll & Tax fields
  tin: varchar(20) - Tax Identification Number
  pfNumber: varchar(30) - Provident Fund Number
  bankAccountNumber: varchar(30)
  bankName: varchar(100)
  bankBranch: varchar(100)
  status: varchar(20, default 'active') // active, inactive, terminated, on_leave
  department: varchar(100)
  phone: varchar(20)
  email: varchar(255)
}
```

**Indexes**:
- `idx_employees_status` on status
- `idx_employees_department` on department
- `idx_employees_designation` on designation

**Migration**: `drizzle/0007_payroll_schema_enhancement.sql`
**Database Status**: Assumed in sync after migration
**RLS**: HR restricted via `drizzle/0012_add_rls_policies.sql`

#### attendance
**Purpose**: Employee attendance

**Code Definition** (`db/schema.ts:173-180`):
```typescript
{
  id: serial (PK)
  employeeId: integer (FK -> employees.id)
  date: timestamp (default now())
  checkIn: timestamp
  checkOut: timestamp
  location: jsonb - GPS/IP data
}
```

**Database Status**: Assumed in sync
**RLS**: Enabled via `drizzle/0012_add_rls_policies.sql`

#### payslips
**Purpose**: Payroll records

**Code Definition** (`db/schema.ts:185-213`):
```typescript
{
  id: serial (PK)
  employeeId: integer (FK -> employees.id)
  month: integer (not null)
  year: integer (not null)
  netSalary: decimal(12, 2)
  status: varchar(50, default 'draft') // draft, approved, paid, cancelled
  pdfUrl: text
  createdAt: timestamp (default now())
  // Payroll breakdown
  basicSalary: decimal(12, 2)
  grossSalary: decimal(12, 2)
  allowances: jsonb - { rent, transport, entertainment, medical, other }
  bonuses: decimal(12, 2)
  pfEmployee: decimal(12, 2) - 5% employee
  pfEmployer: decimal(12, 2) - 5% employer
  gisDeduction: decimal(12, 2) - flat rate
  taxableIncome: decimal(12, 2)
  pitDeduction: decimal(12, 2) - progressive slab
  additionalDeductions: jsonb - { advance, loan, other }
  paymentDate: timestamp
  paymentMethod: varchar(20) - bank, cash, cheque
  generatedAt: timestamp (default now())
  notes: text
}
```

**Indexes**:
- `idx_payslips_employee_month_year` on (employeeId, month, year)
- `idx_payslips_status` on status
- `idx_payslips_payment_date` on paymentDate

**Migration**: `drizzle/0007_payroll_schema_enhancement.sql`
**Database Status**: Assumed in sync after migration
**RLS**: Highly restricted - ADMIN only via `drizzle/0012_add_rls_policies.sql`

---

### Governance & Notifications

#### audit_logs
**Purpose**: Compliance tracking

**Code Definition** (`db/schema.ts:419-427`):
```typescript
{
  id: serial (PK)
  operatorId: integer (FK -> profiles.id)
  action: varchar(100, not null) // CREATE, UPDATE, DELETE, DISPATCH
  entityType: varchar(50, not null)
  entityId: integer
  details: jsonb - before/after state
  createdAt: timestamp (default now())
}
```

**Database Status**: Assumed in sync
**RLS**: Immutable (no UPDATE/DELETE policies) via `drizzle/0012_add_rls_policies.sql`

#### notifications
**Purpose**: Real-time alerts

**Code Definition** (`db/schema.ts:433-450`):
```typescript
{
  id: serial (PK)
  userId: integer (FK -> profiles.id, not null)
  title: varchar(255, not null)
  message: text (not null)
  type: varchar(50, default 'info') // info, warning, critical, success
  category: varchar(50)
  entityType: varchar(50)
  entityId: integer
  read: boolean (default false)
  link: text - URL to entity
  createdAt: timestamp (default now())
}
```

**Indexes**:
- `idx_notifications_user` on userId
- `idx_notifications_read` on read
- `idx_notifications_entity_type` on entityType
- `idx_notifications_created` on createdAt

**Database Status**: Assumed in sync
**RLS**: Enabled via `drizzle/0012_add_rls_policies.sql`

#### settings
**Purpose**: Application configuration

**Code Definition** (`db/schema.ts:595-601`):
```typescript
{
  id: serial (PK)
  key: varchar(100, unique, not null)
  value: jsonb (not null)
  description: text
  updatedAt: timestamp (default now())
}
```

**Database Status**: Assumed in sync

---

### Business Directory Module

#### locations
**Purpose**: Bhutanese locations

**Code Definition** (`db/schema.ts:456-468`):
```typescript
{
  id: serial (PK)
  publicId: varchar(50, unique, not null)
  name: varchar(100, not null)
  district: varchar(100)
  dzongkhag: varchar(100)
  thromde: varchar(100)
  description: text
  coordinates: jsonb - { lat, lng }
  isActive: boolean (default true)
  displayOrder: integer (default 0)
  createdAt: timestamp (default now())
}
```

**Database Status**: Assumed in sync

#### business_categories
**Purpose**: Business category hierarchy

**Code Definition** (`db/schema.ts:474-485`):
```typescript
{
  id: serial (PK)
  publicId: varchar(50, unique, not null)
  name: varchar(100, not null)
  slug: varchar(100, unique, not null)
  icon: varchar(50) - Lucide icon name
  description: text
  parentId: integer (FK -> business_categories.id)
  displayOrder: integer (default 0)
  isActive: boolean (default true)
  createdAt: timestamp (default now())
}
```

**Database Status**: Assumed in sync

#### businesses
**Purpose**: Business directory listings

**Code Definition** (`db/schema.ts:491-539`):
```typescript
{
  id: serial (PK)
  publicId: varchar(50, unique, not null)
  slug: varchar(100, unique, not null)
  name: varchar(255, not null)
  tagline: varchar(255)
  description: text
  categoryId: integer (FK -> business_categories.id)
  locationId: integer (FK -> locations.id)
  phone: varchar(50)
  whatsapp: varchar(50)
  email: varchar(100)
  website: text
  address: text
  coordinates: jsonb - { lat, lng }
  logoUrl: text
  coverImageUrl: text
  galleryUrls: jsonb - image array
  ownerId: integer (FK -> profiles.id)
  clientId: integer (FK -> clients.id)
  status: varchar(50, default 'active')
  type: varchar(50, default 'external')
  isVerified: boolean (default false)
  isFeatured: boolean (default false)
  rating: decimal(3, 2, default '0')
  reviewCount: integer (default 0)
  metaTitle: varchar(100)
  metaDescription: text
  keywords: jsonb
  createdAt: timestamp (default now())
  updatedAt: timestamp (default now())
}
```

**Database Status**: Assumed in sync

#### business_reviews
**Purpose**: Customer reviews

**Code Definition** (`db/schema.ts:545-573`):
```typescript
{
  id: serial (PK)
  publicId: varchar(50, unique, not null)
  businessId: integer (FK -> businesses.id, not null)
  customerName: varchar(255, not null)
  customerEmail: varchar(100)
  orderId: integer (FK -> orders.id)
  projectId: integer (FK -> projects.id)
  isVerified: boolean (default false)
  rating: integer (not null) - 1-5 stars
  title: varchar(255)
  comment: text (not null)
  response: text
  respondedAt: timestamp
  status: varchar(50, default 'published')
  createdAt: timestamp (default now())
  updatedAt: timestamp (default now())
}
```

**Database Status**: Assumed in sync

#### business_hours
**Purpose**: Operating hours

**Code Definition** (`db/schema.ts:579-589`):
```typescript
{
  id: serial (PK)
  businessId: integer (FK -> businesses.id, not null)
  dayOfWeek: integer (not null) - 0 = Sunday, 6 = Saturday
  openTime: varchar(10) - "09:00"
  closeTime: varchar(10) - "18:00"
  isClosed: boolean (default false)
  createdAt: timestamp (default now())
}
```

**Database Status**: Assumed in sync

#### business_amenities
**Purpose**: Business features

**Code Definition** (`db/schema.ts:607-615`):
```typescript
{
  id: serial (PK)
  businessId: integer (FK -> businesses.id, not null)
  amenityType: varchar(50, not null)
  amenityValue: varchar(255, not null)
  createdAt: timestamp (default now())
}
```

**Database Status**: Assumed in sync

---

## Migration Status

| Migration | Description | Status |
|-----------|-------------|--------|
| `0006_invoice_schema_enhancement.md` | Invoice items as JSON, status workflow | Applied |
| `0007_payroll_schema_enhancement.sql` | Payroll breakdown fields | Applied |
| `0010_clients_schema_fix.sql` | Add email, phone, address, city, country to clients | Pending |
| `0011_profiles_schema_fix.sql` | Add full_name, role, created_at to profiles | Pending |
| `0012_add_rls_policies.sql` | Enable RLS on 21 tables + 80+ policies | Pending |

---

## RLS Policy Summary

| Table | RLS Enabled | Policy Count | Access Pattern |
|-------|-------------|--------------|----------------|
| profiles | Pending | 6 | User's own + ADMIN all |
| clients | Pending | 4 | ADMIN/STAFF all |
| projects | Pending | 5 | ADMIN/STAFF all + project members |
| project_tasks | Pending | 4 | Project members + ADMIN/STAFF |
| project_members | Pending | 2 | Public read + ADMIN/STAFF write |
| project_milestones | Pending | 3 | Project members + ADMIN/STAFF |
| task_comments | Pending | 3 | Project members + own comments |
| task_checklist_items | Pending | 2 | Project members |
| activity_events | Pending | 1 | Project members |
| amcs | Pending | 4 | ADMIN/STAFF all |
| invoices | Pending | 4 | ADMIN/STAFF all |
| transactions | Pending | 3 | ADMIN only |
| expenses | Pending | 4 | ADMIN/STAFF + own expenses |
| employees | Pending | 4 | ADMIN/STAFF all + own record |
| attendance | Pending | 4 | ADMIN/STAFF all + own attendance |
| payslips | Pending | 5 | ADMIN only + own payslips |
| tickets | Pending | 4 | ADMIN/STAFF + assigned |
| ticket_messages | Pending | 3 | ADMIN/STAFF + own tickets |
| notifications | Pending | 3 | Own notifications |
| audit_logs | Pending | 1 | ADMIN read only (immutable) |

---

## Verification Queries

### Check RLS Status
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### Check Policies on Specific Table
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles';
```

### Check All Policies
```sql
SELECT tablename, policyname 
FROM pg_policies 
ORDER BY tablename, policyname;
```

---

**Last Updated**: 2026-04-21
**Schema Version**: db/schema.ts (current)
