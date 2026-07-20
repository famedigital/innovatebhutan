# Wave A — Applied (backend)

Patches landed 2026-07-21 against the ERP bible.

## What shipped

1. **Capabilities** — `[lib/auth/capabilities.ts](../../lib/auth/capabilities.ts)`; `profiles.capabilities`; `requireSeeMoney` / `requireCapability` in `[lib/auth/api-auth.ts](../../lib/auth/api-auth.ts)`.
2. **Money redaction** — `/api/projects` list/detail strip `budget` / `moneyMeta` unless `see_money`. `/api/invoices` requires `see_money`.
3. **Project stages** — `needs_quote | quoted | demo | advance_paid | in_progress | testing | done | on_hold | cancelled` (+ legacy normalize).
4. **money_meta** — quote, advance/balance slots, write-off, cancel/hold reasons.
5. **Create job** — with `quotedAmount` → quoted + draft invoice; without → `needs_quote` + bell to money people.
6. **Payments API** — `POST /api/projects/[id]/payments` (advance/balance or `action: write_off`).
7. **Gates** — soft advance→in_progress (override with see_money); hard done needs balance/write-off; cancel needs reason + refundStatus if advance paid.

## Migration (required)

Run on Supabase SQL editor (or drizzle):

`[drizzle/0031_wave_a_erp_bible.sql](../../drizzle/0031_wave_a_erp_bible.sql)`

## Grant sales head money access

Either:

- Set their `profiles.role = 'ADMIN'`, or  
- `UPDATE profiles SET capabilities = '["see_money","cancel_project","write_off","provision_users"]'::jsonb WHERE id = <sales_head_id>;`

## Example API calls

```http
POST /api/projects
{ "clientId": 1, "name": "Shop POS", "productKey": "rancelab", "quotedAmount": 10000, "description": "Install" }
```

```http
POST /api/projects
{ "clientId": 1, "name": "Field job", "productKey": "cctv", "description": "4 cameras" }
→ status needs_quote
```

```http
POST /api/projects/12/payments
{ "slot": "advance", "amount": 4000, "method": "mbob", "proofUrl": "https://..." }
```

## UI (2026-07-21)

- Create job modal: product + quote (or Needs quote for non-money users)
- Project hub: bible status filters/labels; money hidden without `see_money`
- Detail modal: **Money & status panel** (payments, write-off, transitions)

See also `[WAVE_A_NOTES.md](WAVE_A_NOTES.md)`.