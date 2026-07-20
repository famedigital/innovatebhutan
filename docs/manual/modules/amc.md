# AMC

**Routes:** `/admin/amc`, product hubs (e.g. RanceLab), client hub AMC tab

## Purpose

Annual maintenance for **software-first** contracts (RanceLab strong path). Hardware AMC is secondary.

## Lifecycle

- Status: `active` → `expiring` (≤30 days) → `expired` / renewed / cancelled
- Daily job: `amc-expiry-check` updates status and notifies ADMIN / `see_money` people

## How to renew (staff)

1. Open client or RanceLab AMC desk.
2. Run renewal pipeline (quotation → share → payment proof → activate next year).
3. Keep yearly history on the client hub.

## Portal renew

Client can **Request renew** on `/portal/amc`. Staff get a notification (`portal_amc_renew`) and complete the desk flow.

## Alerts

- Dashboard widget **AMC · 30 days**
- Notification bell when status flips to expiring/expired

## Related

- [Wave B](/admin/manual/wave-b)
- [Client portal](/admin/manual/module-portal)
