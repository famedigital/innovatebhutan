# Innovate Bhutan ERP — Project Brain (Single Source of Truth)

This file is the **canonical, high-signal map** of the Innovate Bhutan ERP. Any engineer/agent should read this first to understand **what exists**, **where it lives**, and **how workflows are supposed to work**.

## What this repo is
- **Product**: ERP/Admin system for Innovate Bhutan (plus public website + directory).
- **Frontend**: Next.js App Router (admin UI under `/admin`).
- **Backend**: Next.js Route Handlers under `/api/*`.
- **Database**: Supabase Postgres.
- **ORM/Migrations**: Drizzle ORM + `drizzle-kit` (`db/schema.ts`, `drizzle/*.sql`).
- **Integrations**: Supabase Auth, Realtime, WhatsApp, Gemini (AI/OCR), Cloudinary, external webhooks.

## Where the ERP lives (navigation map)
- **Admin UI (ERP screens)**: `app/admin/**`
  - Layout shell: `app/admin/layout.tsx`
  - Dashboard: `app/admin/page.tsx`
- **API routes (backend entrypoints)**: `app/api/**/route.ts`
- **Business logic**: `lib/services/**`
- **Data access (Drizzle queries)**: `lib/repositories/**`
- **Validation (Zod)**: `lib/validations/**`
- **Schema (Drizzle)**: `db/schema.ts`
- **Migrations**: `drizzle/*.sql` (+ some `.md` notes)

## Non-negotiable architecture contract
### Layering
All ERP features should follow:

```text
UI (app/admin/*)
  -> API (app/api/*)
    -> Service (lib/services/*)
      -> Repository (lib/repositories/*)
        -> DB (Supabase Postgres via Drizzle; schema in db/schema.ts)
```

### Rules of thumb
- **No direct DB writes from UI** for ERP entities (avoid bypassing validation, workflow rules, audit logging).
- **All API inputs validated** with Zod schemas in `lib/validations/*`.
- **Workflows enforced in services** (status transitions, invariants).
- **Repositories are pure data access** (queries + transactions), no business rules.

## Core data model (mental model, not exhaustive)
The schema is intentionally broad; the key ERP “spine” is:

- **Identity & access**
  - `profiles` (RBAC roles: `ADMIN`, `STAFF`, `CLIENT`)
  - Supabase Auth users (linked via `profiles.user_id`)
- **Commercial & operations**
  - `clients` (partners/customers)
  - `services` (catalog)
  - `orders`, `order_items` (deployments / order tracking; realtime updates)
- **Projects**
  - `projects` (client/service/lead linkage, status, progress cache)
  - `project_tasks` (task workflow; assigned user; drives project progress)
- **Support**
  - `tickets`, `ticket_messages`
- **Finance & billing**
  - `transactions` (ledger)
  - `invoices` (billing; line items; lifecycle)
  - `expenses` (expense reporting)
- **HR & payroll**
  - `employees`, `attendance`, `payslips`
- **Governance**
  - `audit_logs` (mutation tracking)
  - `settings` (app config)
  - `notifications` (planned/partial)

## Route + module map (how to find things fast)
### Admin pages (UI)
See `app/admin/*` and the inventory in `ERP_ROUTES.md`.

Examples:
- Projects UI: `app/admin/projects/project-hub.tsx` (+ modals)
- Finance UI: `app/admin/finance/finance-hub.tsx`
- AMC UI: `app/admin/amc/page.tsx`
- Invoices UI: `app/admin/invoice/page.tsx`
- HR UI: `app/admin/hr/*`

### API routes (backend)
Inventory references:
- `ERP_ROUTES.md` (high-level)
- `CODEBASE.md` (architecture + examples)

ERP APIs that exist in repo (representative):
- Projects: `app/api/projects/*`
- Tasks: `app/api/tasks/*`
- AMC: `app/api/amc/*`
- Invoices: `app/api/invoices/*`
- Payroll: `app/api/payroll/*`
- Profiles: `app/api/profiles/route.ts`
- Clients/services: `app/api/clients/route.ts`, `app/api/services/route.ts`
- Integrations: `app/api/whatsapp/route.ts`, `app/api/gemini/route.ts`, `app/api/ocr/route.ts`, `app/api/media/upload/route.ts`

## Canonical workflows (the “ERP brain”)
These workflows define how data moves and what invariants must hold. If code diverges, **code should be changed to match the workflow** (unless you explicitly change the workflow here).

### Projects workflow
**Entities**: `projects`, `project_tasks`

**Lifecycle (project status)**:
- `planning` → `active` → `testing` → `complete`
- plus: `on_hold`, `cancelled` (terminal)

**Task workflow**:
- `todo` → `in_progress` → `done` (plus `blocked`)

**Progress rule (source of truth)**:
- `projects.progress` is a **cached** 0–100 derived from tasks.
- When tasks change, progress should be recomputed efficiently (prefer DB aggregation over fetching all tasks).

**Key invariants**:
- Completing a project should require **no incomplete tasks**.
- Mutations should be **atomic** where multiple writes occur (use transactions).

Reference: `docs/projects-module-deep-scan.md`

### AMC workflow (Annual Maintenance Contracts)
**Entity**: `amcs`

**Lifecycle**:
- `active` → `expiring` → `expired`
- Renewal creates a new contract and links renewal chain (e.g. `renewed_from` / `renewed_to`).

**Expiry handling**:
- System should surface “expiring soon” (typically 30 days) and prevent renewal-chain corruption (renewal must be atomic).

Reference: `audit2.md` (issues + missing features)

### Invoices workflow
**Entity**: `invoices`

**Lifecycle (typical)**:
- `draft` → `sent` → `paid`
- `sent` → `overdue` (time-based or manual)
- `draft|sent` → `cancelled` (terminal)

**Invoice numbering**:
- Must be **unique** and **non-predictable collision-safe**.
- DB has a unique constraint on `invoice_number` (see migration notes).

**Line items**:
- Stored as JSON (`items`) in the invoices table (schema enhancement aligns to UI needs).

Reference: `drizzle/0006_invoice_schema_enhancement.md` and `audit2.md` (calls out insecure number generation + UI bypass risk).

### Payroll workflow (RRCO Bhutan compliant)
**Entities**: `employees`, `payslips`

**Lifecycle**:
- `draft` → `approved` → `paid`
- `draft|approved` → `cancelled`

**Calculation source of truth**:
- Tax constants: `lib/config/taxConstants.ts` (PF employee/employer, GIS, PIT slabs).
- Engine: `lib/services/payrollService.ts`

**Payroll invariants**:
- One payslip per (employee, month, year) (enforce via uniqueness).
- PIT computed using progressive slabs; PF/GIS deductions applied consistently.

Reference: `docs/payroll-module-implementation.md` (detailed API + examples).

### Finance workflow
**Entity**: `transactions` (+ bank reconciliation tables if present)

**Ledger basics**:
- Every income/expense becomes a `transactions` row.
- OCR ingestion should create **reviewable** transactions (often `pending` → `complete`).

Reference: `app/admin/finance/finance-hub.tsx` (OCR upload → `/api/ocr` → insert transaction).

### Support workflow
**Entities**: `tickets`, `ticket_messages`

**Ticket lifecycle**:
- `open` → `in_progress` → `resolved`

**Messaging**:
- Ticket messages should append to `ticket_messages` with sender identity.

## Integrations (what connects to what)
- **Supabase Auth**: session/user identity for `/admin/*` routes; profile role stored in `profiles`.
- **Supabase Realtime**: used for live updates (e.g. orders).
- **WhatsApp**: webhook + message dispatch via `/api/whatsapp`.
- **Gemini AI**: used for content generation and OCR support (via `/api/gemini` and `/api/ocr`).
- **Cloudinary**: media upload via `/api/media/upload`.
- **External automation**: generic webhooks (`/api/webhook`, `/api/leads/webhook`) for Make.com/Zapier-like flows.

## Security baseline (must be true for “production ERP”)
The audits repeatedly flag that some of these are missing or inconsistent. The ERP’s security definition of done requires:
- **RLS policies** in Supabase for sensitive ERP tables.
- **API authentication**: API routes must verify user/session (page middleware alone is not sufficient).
- **RBAC authorization**: services must enforce role-based permissions (ADMIN/STAFF/CLIENT).
- **Rate limiting** on APIs (especially public/external endpoints).
- **Audit logging** for all mutations (create/update/delete + key workflow transitions).
- **Input validation** (Zod) and consistent API error formatting.

## Current “known gaps” (from audits)
These are intentionally listed so future work stays coherent:
- **API auth/authz** gaps across ERP APIs (must enforce, not just UI middleware).
- **Transactions/atomicity** missing in multi-write operations (projects, AMC renewals, invoices).
- **Invoice risks**: insecure invoice numbering and UI patterns that may bypass service layer.
- **Projects performance**: progress calculation inefficiency; missing indexes; missing soft delete.
- **Background jobs/notifications**: needed for AMC expiry alerts, payroll reminders, invoice overdue handling.
- **Testing**: currently minimal/absent; high regression risk.

References: `audit.md`, `audit2.md`

## “How to add a new ERP module” (repeatable recipe)
1. **Model**: add table(s) + relations in `db/schema.ts`.
2. **Migration**: generate/apply a `drizzle/*.sql` migration.
3. **Validation**: add Zod schemas in `lib/validations/<module>.ts`.
4. **Repository**: add `lib/repositories/<module>Repository.ts` with Drizzle queries (use transactions where needed).
5. **Service**: add `lib/services/<module>Service.ts` to implement workflows/invariants + authorization checks.
6. **API**: implement `app/api/<module>/**/route.ts` handlers that call the service layer and never “skip layers”.
7. **UI**: implement `app/admin/<module>/*` screens that call the API routes.
8. **Audit logs**: ensure all mutations write to `audit_logs`.
9. **Security**: ensure RLS policies + API auth + rate limiting for new endpoints.

## Pointers to deeper docs (read next when needed)
- `CODEBASE.md` — architecture guide + module catalog
- `ERP_ROUTES.md` — route inventory
- `docs/erp-flows.md` — canonical end-to-end ERP flows (UI → API → Service → Repo → DB)
- `docs/projects-module-complete-flow-schema-analysis.md` — projects module flow + schema + done vs to-do
- `audit.md` / `audit2.md` — security + completeness audits and priorities
- `docs/payroll-module-implementation.md` — payroll engine + endpoints
- `docs/projects-module-deep-scan.md` — projects layer-by-layer scan + issues

