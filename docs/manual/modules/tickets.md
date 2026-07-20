# Tickets

**Route:** `/admin/tickets`

## Purpose

System of record for support. WhatsApp/phone remains intake; tickets track work.

## Workflow

`open` → `started` → `in_progress` → `resolved` → `closed`

Any staff can create and assign. Assign before start when using group notify.

## SLA (Wave B)

| Priority | Deadline |
|----------|----------|
| High | 4 hours |
| Medium | 24 hours |
| Low | 72 hours |

- Stored on ticket as `sla_due_at`
- Job `ticket-sla-breach` marks breach + notifies assignee and money people
- Hub shows SLA breached count

## Billable

Flag **Billable** on create for non-AMC chargeable support (invoice link later).

## Portal

Invited clients open/reply on `/portal/tickets`. Staff see tickets in admin as usual (`source: portal`).

## Related

- [Wave B](/admin/manual/wave-b)
- [Client portal](/admin/manual/module-portal)
