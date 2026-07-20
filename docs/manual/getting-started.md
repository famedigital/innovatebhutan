# Getting started

## Login

1. Open `/login`
2. Choose **Staff / Admin**
3. Sign in with your company email

Clients use the **Client** tab only after an invite (see [Client portal](/admin/manual/module-portal)).

## First-day checklist (staff)

1. Install the **PWA** (Install app button in admin header) on your phone.
2. Open **Dashboard** — check Needs quote / Unpaid / AMC 30d widgets.
3. Confirm you can open **Clients**, **Tickets**, **Projects**.
4. If you sell: ask owner to grant `see_money` (or ADMIN role). Without it you will not see prices or invoices.
5. Read [Projects & money](/admin/manual/module-projects) before recording payments.

## Roles & capabilities

| Capability | Meaning |
|------------|---------|
| `see_money` | Quotes, invoices, payment panel, finance routes |
| `cancel_project` | Cancel jobs with reason / refund status |
| `write_off` | Write off remaining balance |
| `provision_users` | Invite portal users, create staff (as configured) |
| `adjust_stock` | Stock adjustments |

ADMIN / SUPERADMIN receive all capabilities automatically.

Grant sales head (SQL example):

```sql
UPDATE profiles
SET capabilities = '["see_money","cancel_project","write_off","provision_users"]'::jsonb
WHERE id = <sales_head_id>;
```

## Where work happens

| Job | Screen |
|-----|--------|
| Daily support | Tickets / My Queue |
| New sale / install | Clients → Project (create job) |
| Collect money | Project detail → Money & status |
| AMC renew | Client hub or RanceLab AMC desk |
| Field update | PWA → Projects (status can queue offline) |
| Client self-serve | Portal invite from Client → Portal invite |

## Need help?

- Demo walkthrough: [Senior demo path](/admin/manual/senior-demo)
- Business rules: [How the company runs](/admin/manual/bible-os)
- After deploy: [Migrations](/admin/manual/migrations)
