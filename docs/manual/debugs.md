# Debugs & fixes log

Recurring production issues and how they were fixed (curated).

## Admin shell / navigation

| Symptom | Fix theme | Commits / notes |
|---------|-----------|-----------------|
| Sidebar blink / dead clicks | Standard shadcn sidebar; avoid nested Link/asChild traps | `86b928c`, `02fcfa9` |
| Breadcrumbs / mobile projects | Admin shell polish | `08d8771` |
| Staff not in assign picker | Employee backfill API + resilient queries | `01751bb`–`a8cb316` |

## AMC

| Symptom | Fix |
|---------|-----|
| List 504 / timeouts | Remove N+1; stop blocking status writes (`c9c9ab3`) |
| Build crashes | Restore missing icon imports (`c756d13`) |
| Expiry notifications never sent | `getAdminProfileIds()` was empty — Wave B queries ADMIN/`see_money` |

## Tickets / invoices / PDF

| Symptom | Fix |
|---------|-----|
| Tickets build crash | Restore Card/Clock imports (`e88157c`) |
| Invoice camelCase crash | PWA/manifest + invoice field mapping (`8f27c6d`) |
| jsPDF on server | Force browser jspdf + lazy load (`94a8bff`) |

## Money / RBAC (Wave A)

| Symptom | Fix |
|---------|-----|
| All staff saw money | `see_money` capability + API redaction + invoice gate |
| Done without balance | Hard gate in `projectService` |
| Needs quote invisible | Status + dashboard widget + notify |

## Portal (pre–Wave C)

| Symptom | Fix (Wave C) |
|---------|----------------|
| Open client signup / broken `client_portal_access` insert | Invite token flow; `/client` → `/portal` |
| Dead nav (tickets/orders) | Real portal module pages + `/api/portal/*` |

## Checklist when something breaks

1. Confirm migrations `0031`–`0033` applied.
2. Check role + `capabilities` on `profiles`.
3. Check browser console + `/api/...` JSON error.
4. For jobs: `POST /api/jobs/run/<id>` (auth required).
5. See [Known issues](/admin/manual/known-issues).
