# Projects & money

**Route:** `/admin/projects`

## Purpose

Delivery jobs linked to a client and product. Money is tracked on the project (`money_meta`) with bible stages.

## Stages

`needs_quote` → `quoted` → (`demo` for website) → `advance_paid` → `in_progress` → `testing` → `done`

Also: `on_hold`, `cancelled`.

## Create a job

1. Projects → Create (or from client).
2. Fill: client, name, **product**, description.
3. Enter **quoted amount** if you have price (requires `see_money` for full flow).
   - With amount → `quoted` + draft invoice.
   - Without → `needs_quote`.

## Money panel (see_money only)

On project detail:

- Quote total, advance due/paid, balance due/paid
- Record **advance** or **balance** (method: M-BoB / cheque + proof)
- **Write-off** remaining (capability `write_off`)
- Move status with gates

### Gates

| Move | Rule |
|------|------|
| → `in_progress` | Soft: advance preferred; money users can override |
| → `done` | Hard: balance paid **or** write-off |
| → `cancelled` | Reason required; if advance paid, set refund / non-refundable |

## Work order PDF

Project detail → **Work order** — field sheet **without prices**.

## Offline

Status changes from PWA/mobile can queue offline and sync when online (Wave B).

## Related

- [Invoices](/admin/manual/module-invoices)
- [Wave A notes](/admin/manual/wave-a)
