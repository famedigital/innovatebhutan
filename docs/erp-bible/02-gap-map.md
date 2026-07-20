# Gap Map — Bible vs Current Codebase

**Date:** 2026-07-21  
**Method:** Owner bible (`[00](00-company-operating-system.md)`, `[01](01-module-requirements.md)`) vs static review of `app/admin`, `app/api`, `lib/services`, `db/schema.ts`, PWA, portal.  
**Legend:** Exists · Partial · Missing · Wrong  

Priority: **P0** blocks senior demo · **P1** v1 required · **P2** portal/stock polish · **P3** later.

---

## Executive summary

The repo already has Projects, Clients, AMC (incl. RanceLab GST quotation path), Invoices/templates, Tickets, Inventory tables, PWA shell, and a thin portal. It does **not** yet match the bible’s **money-linked project stages**, **capability-based money hiding**, **offline mutation queue**, or **invite-only full portal**. Patch in place; do not greenfield.

---

## Priority backlog (patch order)


| Pri | Item                                                         | Status                   |
| --- | ------------------------------------------------------------ | ------------------------ |
| P0  | Capability RBAC (`see_money`, cancel, write-off, provision)  | Partial / Wrong          |
| P0  | Project stages + advance/balance gates + Needs quote         | Wrong / Missing          |
| P0  | Job money panel (quote · advance · balance) + proof/method   | Partial                  |
| P0  | Quote-time invoice + GST settings + letterhead TBD           | Partial                  |
| P0  | Hide money from STAFF without capability (API + UI)          | Missing / Wrong          |
| P1  | AMC 30-day expiring list + bell notifications                | Partial                  |
| P1  | Tickets SLA 4/24/72 + breach alerts + billable flag          | Partial / Missing        |
| P1  | Mobile-first UX + offline queue (status/notes/photos)        | Partial (PWA shell only) |
| P1  | Work-order PDF (no prices)                                   | Missing                  |
| P1  | Doc numbering `INV/AMC-YYYY-####` atomic                     | Partial / risk           |
| P1  | Soft archive (no hard delete) on core entities               | Partial / Missing        |
| P1  | Audit all v1 mutations                                       | Partial                  |
| P1  | Dashboard widgets (needs quote, unpaid, AMC 30d)             | Missing / Wrong          |
| P1  | Reports: receivables, AMC pipeline, ticket aging             | Partial                  |
| P1  | CSV export + weekly export runbook                           | Missing                  |
| P1  | Inventory: one warehouse UX, project issue, serials, min qty | Partial (schema exists)  |
| P2  | Website Demo stage                                           | Missing                  |
| P2  | Free support days on project                                 | Missing                  |
| P2  | Client portal invite-only full feature set                   | Partial / Missing        |
| P2  | Digest email                                                 | Missing                  |
| P3  | WhatsApp alert channel                                       | Out                      |
| P3  | Formal PO / full GL / payroll depth                          | Out                      |


---

## Module-by-module

### Auth / RBAC


| Bible rule                                         | Code                                                               | Gap                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------- |
| Capability `see_money` for owner + sales head only | `lib/auth/rbac-rules.ts` — ADMIN vs STAFF nav; no `see_money` flag | **Wrong** — money likely visible to all STAFF on finance routes |
| Multi-role sales                                   | profiles.role coarse                                               | **Partial** — need flags or sales_head marker                   |
| provision_users owner + sales head                 | admin users UI                                                     | **Partial** — verify gates                                      |
| CLIENT cannot /admin                               | proxy/middleware role gate                                         | **Partial** — confirm enforced                                  |


**Files:** `lib/auth/rbac-rules.ts`, `lib/auth/api-auth.ts`, `lib/config/navigation.ts`, `proxy.ts`.

---

### Clients


| Bible rule            | Code                                   | Gap                                                |
| --------------------- | -------------------------------------- | -------------------------------------------------- |
| Required name + phone | clients schema has email/phone/address | **Partial** — enforce required phone in validation |
| Phone not unique      | likely no unique constraint            | **Exists** (verify)                                |
| Archive not delete    | soft delete unclear                    | **Missing**                                        |
| Tech can create       | API auth roles                         | **Partial**                                        |


**Files:** `db/schema.ts` clients, `app/api/clients`, `app/admin/clients`.

---

### Projects / stages / money


| Bible rule                              | Code                                              | Gap         |
| --------------------------------------- | ------------------------------------------------- | ----------- |
| Stages Quoted → Advance paid → … → Done | `ProjectStatus`: planning/active/testing/complete | **Wrong**   |
| Needs quote                             | absent                                            | **Missing** |
| Website Demo stage                      | absent                                            | **Missing** |
| Soft advance gate                       | absent                                            | **Missing** |
| Hard Done requires balance/write-off    | complete checks tasks only                        | **Wrong**   |
| On hold + reason                        | on_hold exists; reason?                           | **Partial** |
| Cancel + refund/non-refundable          | cancelled exists; money handling?                 | **Missing** |
| Free support days                       | absent                                            | **Missing** |
| Manual assignment                       | project members/tasks                             | **Partial** |


**Files:** `lib/services/projectService.ts`, `db/schema.ts` projects, `app/admin/projects`.

---

### Invoices / payments / GST


| Bible rule                                 | Code                                                   | Gap                                    |
| ------------------------------------------ | ------------------------------------------------------ | -------------------------------------- |
| Invoice at quote time linked to project    | invoices module + templates                            | **Partial** — wire to project create   |
| GST default 5% configurable                | `templateDefaults` gstRate 0.05; invoice design editor | **Partial** — global settings          |
| RanceLab special PDF/T&Cs                  | `lib/amc/quotationPdf.ts`, AMC renewal desk            | **Partial** — extend to install quotes |
| Letterhead Innovate Bhutan + P10285932     | templates                                              | **Partial** — fill TBD fields          |
| One advance + one balance + proof + method | AMC pipeline has proof; projects lack unified model    | **Missing** on projects                |
| Invoice PDF only see_money                 | unclear                                                | **Missing**                            |
| Work-order PDF                             | absent                                                 | **Missing**                            |
| Safe numbering                             | known race risk in audits                              | **Partial** → P0 fix                   |
| Price change + reason + audit              | unclear                                                | **Missing**                            |


**Files:** `lib/services/invoiceService.ts`, `lib/invoices/`*, `components/admin/amc-renewal-desk.tsx`, `app/admin/invoice`.

---

### AMC


| Bible rule                  | Code                                            | Gap                                           |
| --------------------------- | ----------------------------------------------- | --------------------------------------------- |
| Software-first AMC          | products.supportsAmc; RanceLab desk strong      | **Partial** — de-emphasize hardware AMC in UX |
| 30-day expiring + bell      | status expiring logic; notifications incomplete | **Partial**                                   |
| Optional create at Done     | absent                                          | **Missing**                                   |
| Portal renew → auto invoice | absent                                          | **Missing**                                   |
| RanceLab T&Cs PDF           | quotation PDF + renewal                         | **Exists** (align branding Innovate Bhutan)   |


**Files:** `lib/services/amcService.ts`, `lib/amc/`*, `app/admin/amc`.

---

### Tickets


| Bible rule                   | Code                        | Gap                         |
| ---------------------------- | --------------------------- | --------------------------- |
| Always system of record      | tickets API + hub           | **Partial**                 |
| Any staff create/assign      | check auth                  | **Partial**                 |
| billable flag                | ?                           | **Missing** (verify schema) |
| SLA 4/24/72 + breach alerts  | absent or thin              | **Missing**                 |
| Single thread + portal reply | messages exist; portal thin | **Partial**                 |


**Files:** `app/admin` tickets, `app/api/tickets`, `app/portal`.

---

### Inventory


| Bible rule                    | Code                  | Gap                       |
| ----------------------------- | --------------------- | ------------------------- |
| Schema items/warehouses/stock | `db/schema.ts`        | **Exists**                |
| One warehouse UX              | admin inventory pages | **Partial**               |
| Issue must link project       | verify service rules  | **Partial** / **Missing** |
| Serials on install            | ?                     | **Partial** / **Missing** |
| Min qty alerts                | ?                     | **Missing**               |
| Simple purchase inbound       | stock entries         | **Partial**               |
| adjust_stock RBAC             | ?                     | **Missing**               |


**Files:** `app/admin` inventory, stock services/repos if present.

---

### PWA / offline


| Bible rule                | Code                                                | Gap         |
| ------------------------- | --------------------------------------------------- | ----------- |
| Installable PWA           | `app/manifest.ts`, `public/sw.js`, `components/pwa` | **Exists**  |
| Offline page              | `app/offline`                                       | **Exists**  |
| Queue mutations offline   | SW ignores non-GET; no IndexedDB queue              | **Missing** |
| Money-free mobile tech UX | admin not optimized; money not stripped             | **Missing** |


**Files:** `public/sw.js`, `components/pwa/pwa-provider.tsx`.

---

### Portal


| Bible rule                                      | Code                             | Gap                     |
| ----------------------------------------------- | -------------------------------- | ----------------------- |
| Invite-only client                              | `client_portal_access` + invite token + `/portal/accept` | **Exists** (Wave C)     |
| Projects / invoices / tickets / AMC / pay proof | `/portal/*` + `/api/portal/*`                            | **Exists** (Wave C)     |
| Email/password                                  | Supabase auth via invite accept                          | **Exists**              |


**Files:** `app/portal/`*.

---

### Dashboard / reports / notifications / audit


| Bible rule                                | Code                           | Gap                       |
| ----------------------------------------- | ------------------------------ | ------------------------- |
| Needs quote + unpaid + AMC 30d            | admin dashboard often stubby   | **Wrong** / **Missing**   |
| Receivables / AMC pipeline / ticket aging | finance reports partial        | **Partial**               |
| Bell + digest                             | notifications table/UI partial | **Partial** / **Missing** |
| Audit all mutations                       | incomplete per PROJECT_BRAIN   | **Partial**               |
| CSV export                                | ?                              | **Missing**               |


---

## Suggested implementation waves

### Wave A — Senior demo (P0)

| # | Item | Status (2026-07-21) |
|---|------|---------------------|
| 1 | Capabilities + hide money in API/UI | **Partial** — `lib/auth/capabilities.ts`, `requireSeeMoney`, project list/detail redact, invoices gated. Run migration `0031`. Grant sales head `see_money` via profile.capabilities or ADMIN role. |
| 2 | Project status model + advance/balance | **Partial** — bible stages + soft advance / hard done gates in `projectService`; `money_meta`; `POST .../payments`. |
| 3 | Quote invoice on job create | **Partial** — create with `quotedAmount` generates draft invoice + links `invoiceId` in money_meta. |
| 4 | Needs quote + notifications | **Partial** — no-price create → `needs_quote` + notify ADMIN/see_money profiles. |
| 5 | Done/cancel/write-off rules | **Partial** — enforced in service; write-off via payments API. |

**Apply DB:** run [`drizzle/0031_wave_a_erp_bible.sql`](../../drizzle/0031_wave_a_erp_bible.sql) on Supabase.

**Still UI:** project hub may still show legacy labels — wire forms to new statuses + payment panel next.

### Wave B — Ops harden (P1)

1. AMC 30d + ticket SLA — **Partial / Done** — see [`WAVE_B_NOTES.md`](WAVE_B_NOTES.md).
2. Offline queue PWA + work-order PDF — **Partial / Done**.
3. Inventory project issue + serials + min qty — **Partial** (issue UI + serials; min-qty alerts still light).
4. Dashboard + three reports + CSV — **Partial** (dashboard widgets; CSV later).
5. Archive semantics + audit completeness — **Partial**.

**Apply DB:** run [`drizzle/0032_wave_b_ticket_sla.sql`](../../drizzle/0032_wave_b_ticket_sla.sql).

### Wave C — Portal (P2)

1. Invite-only portal: projects, invoices, tickets, AMC renew, M-BoB + screenshot — **Partial / Done** — see [`WAVE_C_NOTES.md`](WAVE_C_NOTES.md).

**Apply DB:** run [`drizzle/0033_wave_c_portal.sql`](../../drizzle/0033_wave_c_portal.sql).

---

## Data strategy

**Clean operational start:** do not bulk-migrate untrusted history. Re-enter important clients/AMCs after Wave A is trustworthy.

---

## Sign-off


| Role              | Name | Date | Notes                                            |
| ----------------- | ---- | ---- | ------------------------------------------------ |
| Owner             |      |      | Review `00` + `01`; confirm TBD letterhead later |
| Senior (optional) |      |      | Accept Wave A demo bar                           |


When signing off, treat this gap-map as the patch checklist — update statuses here as items close.