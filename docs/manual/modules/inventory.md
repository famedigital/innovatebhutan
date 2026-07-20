# Inventory

**Route:** `/admin/inventory`

## Purpose

One-store stock for CCTV/networking and related installs. Issue stock **to a project** with optional serial.

## How to use

1. **Add item** — SKU, name, unit, reorder level, costs (money users).
2. **Stock entry** — Receipt (in) or Issue (out).
3. On **Issue**: set **Project ID** and **Serial no.** when applicable.

## Rules (bible v1)

- One warehouse UX (warehouse id in form; keep it simple).
- Issue should link project for install traceability.
- Min-qty / low-stock notifications still light — watch reorder levels on the list.

## Related

- [Projects](/admin/manual/module-projects)
- [Wave B](/admin/manual/wave-b)
