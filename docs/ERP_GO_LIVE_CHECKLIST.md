# ERP go-live smoke checklist (post P0–P4)

Apply migration: `drizzle/0030_products_catalog.sql` on Supabase.

## Shell
- [ ] `/admin` loads once ( `/admin/dashboard` redirects )
- [ ] Sidebar groups: Work, Products, Commercial, Finance, People, Stock, System
- [ ] Breadcrumbs appear on Clients, Tickets, AMC, Users

## Clients & ownership
- [ ] Multi-select clients → Assign focal / backup
- [ ] Filter Unassigned / by staff
- [ ] Client hub tabs: Overview, Ownership, AMC, Tickets, Invoices, Comms
- [ ] Renew AMC from hub without losing client context

## Ops
- [ ] `/admin/amc` opens shared desk; `?productKey=` filters
- [ ] Tickets `?clientId=` and `?scope=mine` work
- [ ] Support problems/team/communications redirect to Tickets/Clients/WhatsApp

## Products
- [ ] `/admin/products` lists RanceLab, Pelbu POS, Website, CCTV, Networking
- [ ] Product hubs open shared AMC/Tickets/Invoices links

## People / Stock / System
- [ ] HR Add Employee uses `/api/employees` (profile required)
- [ ] Inventory stock entry posts to `/api/inventory/stock/entry`
- [ ] `/admin/users` invite + role change (ADMIN only)
- [ ] CLIENT role cannot open `/admin/*`

## Auth note
- DEV API bypass only when `ALLOW_DEV_AUTH_BYPASS=true`
