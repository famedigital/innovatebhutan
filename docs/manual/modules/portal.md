# Client portal

**Routes:** `/portal` (clients) · invite from `/admin/clients/[id]`

## Purpose

Invite-only self-service: project status, invoices, tickets, AMC renew, M-BoB proof upload.

## Invite (staff)

1. Open client → **Portal invite**
2. Enter email → Create invite → **copy link**
3. Client opens `/portal/accept?token=…` → sets password

Requires capability `provision_users` (ADMIN has it).

## Client login

`/login` → **Client** tab → email/password. Self-signup is **disabled**.

## What clients can do

| Feature | Notes |
|---------|-------|
| Projects | Status only (no staff money internals) |
| Invoices | Amounts + status + PDF if `pdfUrl` set |
| Pay proof | Upload screenshot (Cloudinary) |
| Tickets | Open + reply |
| AMC | See expiry · request renew |
| Chat | Existing portal chat |

## Migration

Requires `0033_wave_c_portal.sql` — see [Migrations](/admin/manual/migrations).

## Related

- [Wave C notes](/admin/manual/wave-c)
- [Clients](/admin/manual/module-clients)
