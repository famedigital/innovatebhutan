# Senior demo path

Definition of done for the first senior / owner slice (ERP bible §12), updated for Waves A–C.

## Prerequisites

- Migrations `0031`, `0032`, `0033` applied on Supabase ([Migrations](/admin/manual/migrations))
- Demo user with `see_money` (ADMIN or capabilities)
- One test client with phone

## Walkthrough

1. **Create client** — name + phone (required).
2. **Create job** — product (e.g. RanceLab / CCTV / website), description, **quoted amount**.
   - With quote → status `quoted` + draft invoice.
   - Without quote → `needs_quote` + bell for money people.
3. **Issue / open quote invoice** — confirm GST ~5% and letterhead fields (TIN `P10285932`).
4. **Record advance** (30–50%) — method M-BoB or cheque + proof URL if available → stage `advance_paid`.
5. **Move stages** — `in_progress` → `testing` → attempt `done`.
   - Soft gate: advance recommended before in_progress (override with see_money).
   - Hard gate: Done needs balance paid or write-off.
6. **Record balance** → mark Done.
7. **Open ticket** — assign staff; confirm SLA label (4h / 24h / 72h).
8. **AMC** — ensure an AMC ending within 30 days shows on dashboard / notifications (run `amc-expiry-check` job if needed).
9. **Tech check** — STAFF without `see_money` must **not** see Nu. amounts; can change status.
10. **PWA** — install app; toggle airplane mode; change project status → queued → back online syncs.
11. **Portal (optional Wave C)** — Client → Portal invite → accept link → client sees projects/invoices/tickets.

## Pass / fail

| Check | Pass when |
|-------|-----------|
| Money hidden | Staff cannot open invoice money routes / project money panel |
| Gates | Cannot Done without balance/write-off |
| Bell | Needs quote / AMC / ticket events appear |
| Portal | Invite-only; no open client signup |

If any step fails, note the screen + error and check [Debugs](/admin/manual/debugs).
