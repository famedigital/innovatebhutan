# Project Overview

**Innovate Bhutan** - Next.js 16 ERP system with Supabase backend

## Agent Onboarding (Must Read First)

Before making changes, **always read**:
- [`PROJECT_BRAIN.md`](PROJECT_BRAIN.md) — **single source of truth** for architecture, module map, workflows, integrations, security baseline, and known gaps

Then (as needed), read:
- [`CODEBASE.md`](CODEBASE.md) — architecture guide + module catalog
- [`ERP_ROUTES.md`](ERP_ROUTES.md) — route inventory
- [`audit.md`](audit.md) / [`audit2.md`](audit2.md) — audits + priorities
- [`docs/payroll-module-implementation.md`](docs/payroll-module-implementation.md) — payroll engine + endpoints
- [`docs/projects-module-deep-scan.md`](docs/projects-module-deep-scan.md) — projects deep scan + issues

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL) + Drizzle ORM
- **Styling**: Tailwind CSS v4 + Radix UI
- **Validation**: React Hook Form + Zod
- **Deployment**: Vercel
- **Media**: Cloudinary

## Project Structure

- `app/` - Next.js app router pages
- `components/` - React components (ui/, forms/)
- `lib/` - Utilities, database clients
- `supabase/` - Supabase functions & migrations
- `drizzle/` - Database schema & migrations

## Database

- Use Drizzle ORM for all queries
- Schema in `db/schema.ts`
- Migrations via `drizzle-kit`
- **Migration docs**:
  - Invoice: [`drizzle/0006_invoice_schema_enhancement.md`](drizzle/0006_invoice_schema_enhancement.md)
  - Payroll: [`drizzle/0007_payroll_schema_enhancement.sql`](drizzle/0007_payroll_schema_enhancement.sql)

## Documentation

- [`docs/payroll-module-implementation.md`](docs/payroll-module-implementation.md) - Complete HR & Payroll module guide (API endpoints, PIT calculations, usage examples)
- [`audit.md`](audit.md) - Initial system audit (2026-04-19)
- [`audit2.md`](audit2.md) - Comprehensive module audit (Projects, AMC, Invoices, Payroll, Admin, Mobile)
- [`CODEBASE.md`](CODEBASE.md) - Complete architecture guide

## Authentication

- Supabase Auth
- Server-side: `@supabase/ssr`
- Middleware: `middleware.ts`

## Component Patterns

- Use shadcn/ui components from `components/ui/`
- Follow Radix UI patterns
- Client components: `'use client'` directive

## Implemented Modules

### Projects Module ✅
- Repository: `lib/repositories/projectRepository.ts`
- Service: `lib/services/projectService.ts`
- API: `app/api/projects/`
- UI: `app/admin/projects/project-hub.tsx`

### AMC Module ✅ (2026-04-19)
- Repository: `lib/repositories/amcRepository.ts`
- Service: `lib/services/amcService.ts`
- API: `app/api/amc/`
- UI: `app/admin/amc/page.tsx`
- Features: Contract lifecycle, renewal tracking, 30-day expiry alerts

### Invoices Module ✅ (2026-04-19)
- Repository: `lib/repositories/invoiceRepository.ts`
- Service: `lib/services/invoiceService.ts`
- API: `app/api/invoices/`
- UI: `app/admin/invoice/page.tsx`
- Features: Invoice generation, line items, status transitions (draft/sent/paid/overdue/cancelled), auto-numbering
- Migration: [`drizzle/0006_invoice_schema_enhancement.md`](drizzle/0006_invoice_schema_enhancement.md)

### Payroll Module ✅ (2026-04-19)
- Repository: `lib/repositories/payrollRepository.ts`
- Service: `lib/services/payrollService.ts`
- API: `app/api/payroll/`
- Config: `lib/config/taxConstants.ts` (Bhutan tax rates: PF 5%, GIS Nu.500, PIT progressive slabs)
- Features: Payslip generation, RRCO-compliant calculations (PF, GIS, PIT), batch payroll, status workflow (draft/approved/paid)
- Migration: [`drizzle/0007_payroll_schema_enhancement.sql`](drizzle/0007_payroll_schema_enhancement.sql)

## Rules

- Prefer server components by default
- Use TypeScript strict mode
- Follow existing code patterns
- Test builds before deploying