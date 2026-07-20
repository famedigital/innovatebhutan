# Mobile PWA

## Purpose

Field staff use the ERP as an installed app: tickets, projects, AMC desks, offline status queue.

## Install

1. Sign in on phone Chrome/Safari.
2. Header → **Install app** (or browser Install).
3. Open from home screen (standalone).

## Offline queue (Wave B)

- Status PATCH while offline is stored in IndexedDB.
- Header shows **Offline / queue count**.
- Back online → auto flush; or tap badge to sync.

## Rules

- Techs should **not** see money (no `see_money`).
- Prefer work-order PDF over invoice PDF in the field.
- Photos in queue: planned; status/notes first.

## Related

- [Ops PWA notes](/admin/manual/pwa-ops)
- [Wave B](/admin/manual/wave-b)
