# Admin smoke checklist

Run while logged in as ADMIN (then spot-check as STAFF / CLIENT).

## Auth

- [ ] Unauthenticated `/admin` → `/login`
- [ ] CLIENT user `/admin` → redirected to `/client`
- [ ] STAFF cannot open `/admin/settings` or `/admin/invoice`
- [ ] Without `ALLOW_DEV_AUTH_BYPASS=true`, unauthenticated API calls return 401

## Navigation

- [ ] No Businesses / Locations / Docs menu items
- [ ] Problems, Communications, Support Team, Finance Reports, HR Reports open
- [ ] Accounts → New Payment / New Entry opens dialogs (not 404)
- [ ] Procurement → New PO / New RFQ opens dialogs (not 404)
- [ ] `/admin/finance` redirects to `/admin/transactions`

## Core modules (live data)

- [ ] Dashboard metrics load (prefer `/api/reports/summary`)
- [ ] Projects, Orders, AMC list
- [ ] Tickets create / status / messages via `/api/tickets`
- [ ] Invoices create (number format `INV-YYYYMMDD-####-XXXX`)
- [ ] Clients / Services via API
- [ ] Payroll, Employees, Attendance
- [ ] Jobs API requires auth: `GET /api/jobs`

## Background jobs

- [ ] `POST /api/jobs/run/amc-expiry-check` (staff/admin session)
- [ ] `POST /api/jobs/run/invoice-overdue-check`

## UI tokens

- [ ] Primary buttons use emerald token (not `#3ECF8E` chrome on patched pages)
- [ ] Dark mode toggle does not break sidebar chrome
