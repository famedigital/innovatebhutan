# Innovate Bhutan ERP - Production Readiness Blueprint

## 1) Target Scope: How Many Pages Are Required

To make this ERP fully production-ready for Innovate, a practical target is:

- **16 main ERP modules/pages**
- **66 subpages** (list/detail/create/config/report views)
- **Total: 82 admin routes** (including module dashboards and operational subpages)

This gives complete operational coverage (Ops, Finance, HR, CRM, Support, Governance, CMS, Integrations) with proper workflows and controls.

## 2) Current vs Required (High Level)

### Currently present main admin routes (from `app/admin/**/page.tsx`)
- `/admin`
- `/admin/projects`
- `/admin/amc`
- `/admin/invoice`
- `/admin/finance`
- `/admin/hr`
- `/admin/clients`
- `/admin/services`
- `/admin/tickets`
- `/admin/whatsapp`
- `/admin/ai`
- `/admin/marketing`
- `/admin/website`
- `/admin/media`
- `/admin/settings`
- `/admin/blog`
- `/admin/support`
- `/admin/docs`

### Missing main routes referenced by navigation/business needs
- `/admin/orders`
- `/admin/expenses`
- `/admin/transactions`
- `/admin/employees`
- `/admin/attendance`
- `/admin/businesses`
- `/admin/locations`
- `/admin/audit`

## 3) Main Pages + Subpages Required (Detailed)

Status legend:
- `Live`: route exists now
- `Partial`: route exists but missing major workflow coverage
- `Missing`: route not implemented

### A. Overview & Control Center
1. **Dashboard** (`Live`)
   - Main: `/admin`
   - Subpages required:
     - `/admin/overview/kpis` (cross-module KPI drilldown) - `Missing`
     - `/admin/overview/activity` (global activity timeline) - `Missing`
     - `/admin/overview/alerts` (critical alerts) - `Missing`

### B. Operations
2. **Orders** (`Missing`)
   - Main: `/admin/orders`
   - Subpages:
     - `/admin/orders/new`
     - `/admin/orders/[id]`
     - `/admin/orders/[id]/items`
     - `/admin/orders/[id]/deployment`
     - `/admin/orders/calendar`

3. **Projects** (`Live/Partial`)
   - Main: `/admin/projects`
   - Subpages:
     - `/admin/projects/new`
     - `/admin/projects/[id]`
     - `/admin/projects/[id]/tasks`
     - `/admin/projects/[id]/members`
     - `/admin/projects/[id]/milestones`
     - `/admin/projects/[id]/activity`
     - `/admin/projects/kanban`
     - `/admin/projects/reports`

4. **AMC Contracts** (`Live/Partial`)
   - Main: `/admin/amc`
   - Subpages:
     - `/admin/amc/new`
     - `/admin/amc/[id]`
     - `/admin/amc/[id]/renew`
     - `/admin/amc/expiring`
     - `/admin/amc/reports`

5. **Support Tickets** (`Live/Partial`)
   - Main: `/admin/tickets`
   - Subpages:
     - `/admin/tickets/new`
     - `/admin/tickets/[id]`
     - `/admin/tickets/[id]/messages`
     - `/admin/tickets/dispatch`
     - `/admin/tickets/sla`
     - `/admin/tickets/reports`

### C. Financials
6. **Invoices** (`Live/Partial`)
   - Main: `/admin/invoice`
   - Subpages:
     - `/admin/invoice/new`
     - `/admin/invoice/[id]`
     - `/admin/invoice/[id]/send`
     - `/admin/invoice/[id]/payments`
     - `/admin/invoice/overdue`
     - `/admin/invoice/reports`

7. **Expenses** (`Missing`)
   - Main: `/admin/expenses`
   - Subpages:
     - `/admin/expenses/new`
     - `/admin/expenses/[id]`
     - `/admin/expenses/approvals`
     - `/admin/expenses/reimbursements`
     - `/admin/expenses/reports`

8. **Transactions/Ledger** (`Missing`)
   - Main: `/admin/transactions`
   - Subpages:
     - `/admin/transactions/new`
     - `/admin/transactions/[id]`
     - `/admin/transactions/reconciliation`
     - `/admin/transactions/export`

9. **Finance Hub** (`Live/Partial`)
   - Main: `/admin/finance`
   - Subpages:
     - `/admin/finance/summary`
     - `/admin/finance/cashflow`
     - `/admin/finance/tax`
     - `/admin/finance/ocr-review`

### D. Human Capital
10. **Employees** (`Missing`)
   - Main: `/admin/employees`
   - Subpages:
     - `/admin/employees/new`
     - `/admin/employees/[id]`
     - `/admin/employees/[id]/documents`
     - `/admin/employees/[id]/history`

11. **Attendance** (`Missing`)
   - Main: `/admin/attendance`
   - Subpages:
     - `/admin/attendance/checkins`
     - `/admin/attendance/regularization`
     - `/admin/attendance/reports`

12. **Payroll** (`Live/Partial`)
   - Main: `/admin/hr` (can be split later to `/admin/payroll`)
   - Subpages:
     - `/admin/hr/payroll-run`
     - `/admin/hr/payslips`
     - `/admin/hr/payslips/[id]`
     - `/admin/hr/approvals`
     - `/admin/hr/statutory`

### E. Master Data
13. **Clients** (`Live`)
   - Main: `/admin/clients`
   - Subpages:
     - `/admin/clients/new`
     - `/admin/clients/[id]`
     - `/admin/clients/[id]/amc`
     - `/admin/clients/[id]/invoices`
     - `/admin/clients/import`

14. **Services** (`Live`)
   - Main: `/admin/services`
   - Subpages:
     - `/admin/services/new`
     - `/admin/services/[id]`
     - `/admin/services/pricing`
     - `/admin/services/categories`

15. **Businesses Directory Admin** (`Missing`)
   - Main: `/admin/businesses`
   - Subpages:
     - `/admin/businesses/new`
     - `/admin/businesses/[id]`
     - `/admin/businesses/reviews`
     - `/admin/businesses/categories`

16. **Locations Admin** (`Missing`)
   - Main: `/admin/locations`
   - Subpages:
     - `/admin/locations/new`
     - `/admin/locations/[id]`
     - `/admin/locations/mapping`

### F. Governance & System
17. **Audit Logs** (`Missing`)
   - Main: `/admin/audit`
   - Subpages:
     - `/admin/audit/events`
     - `/admin/audit/security`
     - `/admin/audit/entity/[type]`

18. **Settings** (`Live/Partial`)
   - Main: `/admin/settings`
   - Subpages:
     - `/admin/settings/company`
     - `/admin/settings/users-roles`
     - `/admin/settings/integrations`
     - `/admin/settings/notifications`
     - `/admin/settings/api-keys`

### G. Channels, AI, Content (existing business scope)
19. **WhatsApp** (`Live/Partial`)
   - Main: `/admin/whatsapp`
   - Subpages:
     - `/admin/whatsapp/templates`
     - `/admin/whatsapp/campaigns`
     - `/admin/whatsapp/logs`

20. **AI Console** (`Live/Partial`)
   - Main: `/admin/ai`
   - Subpages:
     - `/admin/ai/bot-training`
     - `/admin/ai/prompts`
     - `/admin/ai/usage`

21. **Marketing** (`Live/Partial`)
   - Main: `/admin/marketing`
   - Subpages:
     - `/admin/marketing/leads`
     - `/admin/marketing/campaigns`
     - `/admin/marketing/attribution`

22. **Website CMS** (`Live/Partial`)
   - Main: `/admin/website`
   - Subpages:
     - `/admin/website/pages`
     - `/admin/website/menus`
     - `/admin/website/forms`

23. **Blog** (`Live/Partial`)
   - Main: `/admin/blog`
   - Subpages:
     - `/admin/blog/new`
     - `/admin/blog/[id]`
     - `/admin/blog/categories`

24. **Media Library** (`Live/Partial`)
   - Main: `/admin/media`
   - Subpages:
     - `/admin/media/upload`
     - `/admin/media/folders`
     - `/admin/media/usage`

25. **Docs & Help** (`Live`)
   - Main: `/admin/docs`, `/admin/support`
   - Subpages:
     - `/admin/docs/erp`
     - `/admin/docs/api`
     - `/admin/support/incidents`
     - `/admin/support/knowledge-base`

> Practical production target for ERP core can focus first on Modules 1-18; modules 19-25 can be phase-2 depending on org priorities.

## 4) Canonical Workflows (Module Flows + State Machines)

### 4.1 Projects Flow
- **Trigger**: create project for client/service
- **Flow**:
  1. Create project (`planning`)
  2. Add members/milestones/tasks
  3. Execute tasks (`todo -> in_progress -> done/blocked`)
  4. Auto-recompute progress
  5. Transition project (`planning -> active -> testing -> complete`)
  6. Archive via soft-delete (`deleted_at`) if needed
- **Core tables**: `projects`, `project_tasks`, `project_members`, `project_milestones`, `task_comments`, `task_checklist_items`, `activity_events`
- **APIs present**:
  - `/api/projects`
  - `/api/projects/[id]`
  - `/api/projects/[id]/tasks`
  - `/api/projects/[id]/progress`
  - `/api/tasks/[taskId]`

### 4.2 AMC Flow
- **Flow**:
  1. Create contract (`active`)
  2. Periodic expiry monitor (`expiring`)
  3. Renew (`/renew`) with lineage (`renewed_from`, `renewed_to`)
  4. Expire or cancel (`expired`/`cancelled`)
- **Core table**: `amcs`
- **APIs present**:
  - `/api/amc`
  - `/api/amc/[id]`
  - `/api/amc/[id]/renew`

### 4.3 Invoice Flow
- **Flow**:
  1. Draft invoice with items
  2. Send invoice
  3. Payment updates status to paid
  4. Due-date job marks overdue
  5. Cancellation when necessary
- **Status machine**: `draft -> sent -> paid|overdue|cancelled`
- **Core table**: `invoices`
- **APIs present**:
  - `/api/invoices`
  - `/api/invoices/[id]`
  - `/api/invoices/[id]/status`

### 4.4 Payroll Flow
- **Flow**:
  1. Generate single/batch payslips for month/year
  2. Review + approve
  3. Mark paid
- **Status machine**: `draft -> approved -> paid` (+ `cancelled`)
- **Core tables**: `employees`, `payslips`, `attendance`
- **APIs present**:
  - `/api/payroll/generate`
  - `/api/payroll/batch`
  - `/api/payroll/[id]`
  - `/api/payroll/[id]/approve`
  - `/api/payroll/[id]/pay`

### 4.5 Ticket Flow
- **Flow**:
  1. Open ticket
  2. Assign + dispatch
  3. Conversation in thread
  4. Resolve + capture audit trail
- **Status machine**: `open -> in_progress -> resolved`
- **Core tables**: `tickets`, `ticket_messages`
- **Needed API expansion**: dedicated ticket message/thread routes if not complete.

### 4.6 Finance Flow
- **Flow**:
  1. Expense/income captured into transactions
  2. OCR import for receipts/statements
  3. Reconciliation (bank vs ledger)
  4. Reporting/export
- **Core tables**: `transactions`, `expenses`, `invoices`
- **APIs present**:
  - `/api/ocr`
  - `/api/invoices/*`
  - (needs explicit `/api/expenses`, `/api/transactions`)

## 5) Data/Schema Coverage Required for 100%

## 5.1 Core schema already in place
From `db/schema.ts`, major production tables already exist:
- `services`, `clients`, `orders`, `order_items`
- `profiles`
- `amcs`
- `tickets`, `ticket_messages`
- `employees`, `attendance`, `payslips`
- `transactions`, `expenses`, `invoices`
- `projects`, `project_tasks`, `project_members`, `project_milestones`, `task_comments`, `task_checklist_items`, `activity_events`
- `audit_logs`, `notifications`
- `locations`, `business_categories`, `businesses`, `business_reviews`, `business_hours`, `business_amenities`
- `settings`

## 5.2 Schema hardening needed before production
- Add/verify **CHECK constraints** for status enums and numeric bounds (e.g., progress 0-100).
- Ensure all mutation-heavy entities use **soft delete** where business recovery is needed.
- Enforce **unique and indexed keys** for high-traffic search/filter patterns.
- Ensure FK cascades/restrict policies match business rules.
- Add/verify **RLS policies** per table by role (`ADMIN`, `STAFF`, `CLIENT`).

## 6) API Surface Required for 100%

### 6.1 APIs already present (major)
- Projects, tasks, AMC, invoices, payroll, clients, services, profiles.
- Integrations: whatsapp, gemini, ocr, media upload, webhooks, leads.
- Directory public APIs: locations/categories/businesses/search.

### 6.2 APIs still required (production completeness)
- `/api/orders` + `/api/orders/[id]` + `/api/orders/[id]/items`
- `/api/expenses` + `/api/expenses/[id]` + `/api/expenses/[id]/approve`
- `/api/transactions` + `/api/transactions/[id]` + `/api/transactions/reconcile`
- `/api/employees` + `/api/employees/[id]`
- `/api/attendance` + `/api/attendance/[id]`
- `/api/tickets/[id]/messages` (if not complete in current backend)
- `/api/notifications` + `/api/notifications/[id]/read`
- `/api/audit` (filtered read with strict ADMIN access)
- `/api/reports/*` (finance/project/hr/support analytics endpoints)

### 6.3 Production API standards (must apply to every route)
- AuthN on every protected route.
- RBAC authorization checks in service layer.
- Request validation (Zod).
- Rate limiting.
- Consistent response envelope + error codes.
- Audit log for all CREATE/UPDATE/DELETE/APPROVE/PAY actions.

## 7) Route Architecture Required

### 7.1 Frontend route conventions
- List views: `/admin/<module>`
- Create: `/admin/<module>/new`
- Detail: `/admin/<module>/[id]`
- Nested workflows: `/admin/<module>/[id]/<context>`
- Reporting: `/admin/<module>/reports`

### 7.2 Backend route conventions
- Collection: `/api/<resource>`
- Item: `/api/<resource>/[id]`
- Actions: `/api/<resource>/[id]/<action>`
- Keep route handlers thin; business logic in `lib/services/*`.

## 8) Production-Ready Progress Matrix

| Domain | Main Page Coverage | Subpage Coverage | API Coverage | Schema Coverage | Production Status |
|---|---:|---:|---:|---:|---|
| Dashboard/Overview | 1/1 | 0/3 | Partial | Good | Partial |
| Orders | 0/1 | 0/5 | Low | Good | Missing |
| Projects | 1/1 | 2/8 | Medium-High | High | Partial |
| AMC | 1/1 | 1/5 | Medium | Medium-High | Partial |
| Tickets | 1/1 | 1/6 | Medium | High | Partial |
| Invoices | 1/1 | 1/6 | Medium | High | Partial |
| Expenses | 0/1 | 0/5 | Low | Medium | Missing |
| Transactions | 0/1 | 0/4 | Low | Medium | Missing |
| Employees | 0/1 | 0/4 | Low | High | Missing |
| Attendance | 0/1 | 0/3 | Low | Medium | Missing |
| Payroll | 1/1 | 0/5 | High | High | Partial |
| Clients | 1/1 | 1/5 | Medium | High | Partial |
| Services | 1/1 | 1/4 | Medium | High | Partial |
| Businesses/Locations | 0/2 | 0/7 | Medium (public) | High | Missing (admin) |
| Audit/System | 0/1 | 0/3 | Low | Medium | Missing |
| Settings | 1/1 | 1/5 | Low-Med | High | Partial |

## 9) Final Answer to Your Question

For **100% production-ready ERP** in this project context, you should plan for:

- **16 core ERP main pages** (Modules 1-18 in this file, excluding optional content channels), plus
- **~50 core ERP subpages** for full workflows and controls.

If you include marketing/website/AI/channel operations as first-class admin domains too, target:

- **24-25 main admin domains total**
- **66+ subpages total**
- **82+ admin routes**

That is the realistic full-scope target for robust enterprise operations with proper workflow depth.

## 10) Implementation Order (Recommended)

1. Fill missing operational core routes: Orders, Expenses, Transactions, Employees, Attendance, Audit.
2. Complete workflow subpages for Projects/AMC/Invoices/Payroll/Tickets.
3. Add missing APIs for expenses, transactions, employees, attendance, notifications, reports.
4. Enforce security baseline on all APIs (AuthN/AuthZ/RLS/rate-limit/audit).
5. Add reporting and export pages per module.
6. Final hardening: tests, monitoring, background jobs, SLA alerts.

