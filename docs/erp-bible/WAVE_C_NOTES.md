# Wave C — Client portal (applied)

Invite-only portal matching the ERP bible checklist.

## What shipped

1. **Invite model** — `client_portal_access` + `invite_email` / `invite_token` / `auth_user_id` / `profile_id`; table `portal_payment_proofs`.
2. **Admin invite** — Client detail → **Portal invite** → copy link (`POST /api/portal/invite`, needs `provision_users`).
3. **Accept** — `/portal/accept?token=…` sets password, creates `CLIENT` profile, activates access.
4. **Unified portal** — `/portal` (legacy `/client` redirects here):
  - Home dashboard
  - Projects (status, no money)
  - Invoices + PDF link + M-BoB/cheque proof upload
  - Tickets open + reply
  - AMC expiry + renew request (notifies money people)
  - Chat kept
5. **Login** — Client self-signup removed; Client tab requires active invite.
6. **APIs** — `/api/portal/`* scoped to invited `client_id`.

## Migration (required)

Run on Supabase:

`[drizzle/0033_wave_c_portal.sql](../../drizzle/0033_wave_c_portal.sql)`

Also ensure Wave A `0031` + Wave B `0032` are applied.

## How to invite a client

1. Open **Admin → Clients → [client] → Portal invite**
2. Enter email → Create invite → copy link
3. Client opens link → sets password → lands on `/portal`
4. Later: Login → **Client** tab → same email/password

## Notes

- Bank / M-BoB account numbers still **TBD** in pay instructions (bible).
- Invoice PDF uses existing `pdfUrl` when present.
- Cloudinary required for payment screenshot upload.
- Staff can preview portal APIs with `?clientId=` while logged in as ADMIN/STAFF.

