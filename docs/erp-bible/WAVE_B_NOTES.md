# Wave B — Ops harden (applied)

Patches landed against the ERP bible Wave B list.

## What shipped

1. **AMC 30-day bell** — `getAdminProfileIds()` now resolves ADMIN / SUPERADMIN / `see_money` profiles; expiry notifications include client name. Job: `POST /api/jobs/run/amc-expiry-check`.
2. **Notification bell** — unread badge + dropdown in admin header (`NotificationBell`); offline queue badge when mutations are pending.
3. **Ticket SLA** — persist `sla_due_at` / `sla_breached_at` / `billable`; set due on create (4h / 24h / 72h); assign + breach notifications; job `ticket-sla-breach`.
4. **Offline queue** — IndexedDB queue (`lib/pwa/offline-queue.ts`); project status PATCH queues when offline; SW sync tag + flush on online.
5. **Work-order PDF** — no prices; **Work order** button on project detail.
6. **Dashboard** — Needs quote · Unpaid invoices · AMC 30d widgets; summary API counts updated for bible statuses.
7. **Inventory issue** — optional Project ID + serial on issue stock.

## Migration (required)

Run on Supabase SQL editor:

`[drizzle/0032_wave_b_ticket_sla.sql](../../drizzle/0032_wave_b_ticket_sla.sql)`

(Also ensure Wave A `[0031_wave_a_erp_bible.sql](../../drizzle/0031_wave_a_erp_bible.sql)` is applied.)

## Jobs to schedule


| Job ID                  | Suggested   |
| ----------------------- | ----------- |
| `amc-expiry-check`      | Daily 08:00 |
| `ticket-sla-breach`     | Hourly      |
| `invoice-overdue-check` | Daily 09:00 |


Trigger: `POST /api/jobs/run/<jobId>` (auth required).

## Still later / light

- Full CSV export + weekly runbook
- Archive semantics polish
- Low-stock → notification job
- Photo enqueue in offline queue

