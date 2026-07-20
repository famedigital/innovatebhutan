# SQL migrations to run

Apply on **Supabase SQL editor** (or your migration pipeline) in order after deploying Waves A–C.

## Required (Jul 2026)

| File | Purpose |
|------|---------|
| `drizzle/0031_wave_a_erp_bible.sql` | `profiles.capabilities`, `projects.product_key`, `money_meta`, status remap |
| `drizzle/0032_wave_b_ticket_sla.sql` | `tickets.sla_due_at`, `sla_breached_at`, `billable` |
| `drizzle/0033_wave_c_portal.sql` | Portal invite columns + `portal_payment_proofs` |

## After migrate

1. Grant sales head capabilities (see [Getting started](/admin/manual/getting-started)).
2. Smoke [Senior demo](/admin/manual/senior-demo).
3. Schedule or manually run jobs:

```http
POST /api/jobs/run/amc-expiry-check
POST /api/jobs/run/ticket-sla-breach
POST /api/jobs/run/invoice-overdue-check
```

## Older migrations

Invoice/payroll schema docs: `drizzle/0006_*`, `drizzle/0007_*` — already assumed in prod for earlier modules. Do not re-run casually without backup.
