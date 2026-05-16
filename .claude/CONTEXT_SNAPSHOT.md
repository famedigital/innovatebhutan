# Quick Context Snapshot

**Last Updated:** 2026-05-14

## Tech Stack (One-Liner)
- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (PostgreSQL) + Drizzle ORM
- **Styling:** Tailwind CSS v4 + Radix UI
- **Validation:** React Hook Form + Zod
- **Auth:** Supabase Auth + RLS
- **Deployment:** Vercel

## Database Schema
- **Tables:** 30 total
- **Schema File:** [`db/schema.ts`](../db/schema.ts)
- **Migrations:** [`drizzle/`](../drizzle/)
- **Connection:** Supabase (check `DATABASE_URL` in `.env`)

## Critical Files Map

### Authentication & Auth
- [`lib/auth/api-auth.ts`](../lib/auth/api-auth.ts) - API auth helpers (requireApiAuth, requireStaffOrAdmin)
- [`middleware.ts`](../middleware.ts) - Route protection
- [`hooks/use-user-profile.ts`](../hooks/use-user-profile.ts) - User profile hook with retry logic

### Services Layer
- [`lib/services/projectService.ts`](../lib/services/projectService.ts) - Projects
- [`lib/services/amcService.ts`](../lib/services/amcService.ts) - AMC contracts
- [`lib/services/invoiceService.ts`](../lib/services/invoiceService.ts) - Invoices
- [`lib/services/payrollService.ts`](../lib/services/payrollService.ts) - Payroll with Bhutan tax
- [`lib/services/notificationService.ts`](../lib/services/notificationService.ts) - Notifications

### Repositories Layer
- [`lib/repositories/projectRepository.ts`](../lib/repositories/projectRepository.ts)
- [`lib/repositories/amcRepository.ts`](../lib/repositories/amcRepository.ts)
- [`lib/repositories/invoiceRepository.ts`](../lib/repositories/invoiceRepository.ts)
- [`lib/repositories/payrollRepository.ts`](../lib/repositories/payrollRepository.ts)

### API Routes
- [`app/api/projects/`](../app/api/projects/) - Projects CRUD
- [`app/api/amc/`](../app/api/amc/) - AMC contracts
- [`app/api/invoices/`](../app/api/invoices/) - Invoice management
- [`app/api/payroll/`](../app/api/payroll/) - Payroll operations
- [`app/api/profiles/`](../app/api/profiles/) - User profiles

### Admin Pages
- [`app/admin/page.tsx`](../app/admin/page.tsx) - Main dashboard
- [`app/admin/projects/project-hub.tsx`](../app/admin/projects/project-hub.tsx) - Projects hub
- [`app/admin/amc/page.tsx`](../app/admin/amc/page.tsx) - AMC management
- [`app/admin/invoice/page.tsx`](../app/admin/invoice/page.tsx) - Invoice management
- [`app/admin/hr/hr-dashboard.tsx`](../app/admin/hr/hr-dashboard.tsx) - HR dashboard

## Essential Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run test` | Run all tests (Vitest) |
| `npm run db:push` | Push schema to database |
| `npm run db:rls` | Apply RLS policies |
| `npm run db:reset` | Reset database (dangerous!) |
| `npm run lint` | Run ESLint |

## Design Tokens

### Colors (from `docs/design-token-analysis.md`)
- **Primary:** `var(--primary)` - #ff6b35 (Innovate Orange)
- **Secondary:** `var(--secondary)` - #0047ab (Royal Blue)
- **Accent:** `var(--accent)` - #50c878 (Emerald Green)
- **Background:** Dark theme with `#0a0a0a` base
- **Surface:** `rgba(20, 20, 20, 0.8)` with backdrop-filter

### Animations
- **Fade In:** `fadeIn` (0.3s ease-out)
- **Slide Up:** `slideUp` (0.4s cubic-bezier)
- **Scale:** `scaleIn` (0.2s ease-out)
- **Glassmorphism:** `backdrop-blur-xl bg-white/5`

## Common Patterns

### API Route Pattern
```typescript
export async function GET(req: NextRequest) {
  const authContext = await requireApiAuth(req);
  requireStaffOrAdmin(authContext.profile);
  // ... your logic
}
```

### Next.js 16 Params Pattern
```typescript
// OLD (broken):
export default function Page({ params }: { params: { id: string } })

// NEW (correct):
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

### Repository Pattern
```typescript
// All repos follow: findById, findAll, create, update, delete
const item = await repository.findById(id);
```

## Known Issues

| Issue | Status | Fix |
|-------|--------|-----|
| RLS policies failing (attendance, payslips) | Open | Need user_id column |
| Next.js 16 params breaking | Fixed | Use `await params` |
| Test mock persistence | Fixed | Added beforeEach blocks |

## Project Modules Status

| Module | Status | Files |
|--------|--------|-------|
| Projects | ✅ Complete | `app/admin/projects/` |
| Clients | ✅ Complete | `app/admin/clients/` |
| HR/Payroll | ✅ Complete | `app/admin/hr/` |
| Finance | ✅ Complete | `app/admin/finance/` |
| AMC | ✅ Complete | `app/admin/amc/` |
| Support | ✅ Complete | `app/admin/tickets/` |
| Orders | ✅ Complete | `app/admin/orders/` |
| **Reporting Dashboard** | 🚧 In Progress | `app/admin/dashboard/` |
| Inventory | ❌ Missing | - |
| Procurement | ❌ Missing | - |
| Accounts | ❌ Missing | - |

## Quick Reference Links

- [Full Architecture](../CODEBASE.md)
- [Project Brain](../PROJECT_BRAIN.md)
- [ERP Routes](../ERP_ROUTES.md)
- [Payroll Module](../docs/payroll-module-implementation.md)
- [Design Token Analysis](../docs/design-token-analysis.md)
