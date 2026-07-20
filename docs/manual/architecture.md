# Architecture notes

## Stack

- **Next.js 16** App Router
- **Supabase** Auth + PostgreSQL
- **Drizzle ORM** (`db/schema.ts`, `drizzle/*.sql`)
- **Tailwind v4** + **shadcn/ui** (Radix)
- **Vercel** deploy · **Cloudinary** media

## Layers

```
app/admin|portal|api  →  lib/services  →  lib/repositories  →  db (Drizzle)
```

Auth helpers: `lib/auth/api-auth.ts`, capabilities: `lib/auth/capabilities.ts`.

## Key modules (code map)

| Module | Service / UI |
|--------|----------------|
| Projects | `projectService`, `/admin/projects` |
| Invoices | `invoiceService`, `/admin/invoice` |
| AMC | `amcService`, renewal desk |
| Tickets | `ticketService`, `/admin/tickets` |
| Portal | `portalService`, `/api/portal/*` |
| Notifications | `notificationService` + bell |
| Jobs | `lib/jobs/scheduler.ts` |

## Security baseline

- Staff APIs: `requireStaffOrAdmin` / capability gates
- Portal APIs: invite-bound `clientId` scope
- CLIENT role redirected away from `/admin` → `/portal`
- Prefer server-side Drizzle over client Supabase for money tables

## Docs index

- Brain: `PROJECT_BRAIN.md`
- Bible: `docs/erp-bible/`
- Schema/UML: [Database schema](/admin/manual/schema), [UML](/admin/manual/uml)
- Codebase guide: `CODEBASE.md` (repo root)
