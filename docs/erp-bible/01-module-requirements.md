# Module Requirements — Innovate Bhutan ERP v1

Companion to `[00-company-operating-system.md](00-company-operating-system.md)`.  
Engineers implement these rules in services (not only UI).

---

## Shared conventions


| Topic        | Rule                                                                  |
| ------------ | --------------------------------------------------------------------- |
| Soft delete  | Archive/Cancel only — no hard delete of clients/projects/invoices/AMC |
| Audit        | Every create/update/delete + money/status transitions → `audit_logs`  |
| Money fields | Visible only if actor has `see_money`                                 |
| Numbering    | `INV-YYYY-####`, `AMC-YYYY-####` (atomic, unique)                     |
| GST          | Settings default 5%; overridable                                      |
| Files        | Retain forever (Cloudinary or equivalent)                             |


---

## 1. Clients

### Fields


| Field               | Required | Notes                          |
| ------------------- | -------- | ------------------------------ |
| businessName        | Yes      | Primary identity               |
| phone               | Yes      | Not unique                     |
| email               | No       |                                |
| address / dzongkhag | No       |                                |
| contactPerson       | No       |                                |
| gstTin              | No       | Required on invoice when known |
| notes               | No       |                                |
| whatsappLink        | No       |                                |
| focalStaffId        | No       | Manual ownership               |
| archived            | —        | Soft archive                   |


### Permissions

- Create: any staff (including techs).  
- Edit: any staff.  
- Archive: owner + sales head (recommended).  
- See money-related client totals: `see_money` only.

### Behaviors

- Duplicate phone: allowed.  
- Duplicate business name: allowed.  
- Search by name first, phone second.

---

## 2. Selling / New job (Projects intake)

### Create job (sales head / sales with price)

Required: client (existing or create), productKey, description, quotedAmount.

Creates:

1. Project in **Quoted** (website may move toward Demo).
2. Quote-time invoice (draft/sent as per UI) with GST.
3. Money summary: advance due = agreed % or amount; balance = remainder.

### Create job (tech, no price)

Required: client, productKey, description.  
Status: **Needs quote**.  
Notify: sales head (bell + digest).  
No invoice until price set.

### Assignment

Manual assignee(s) only.

---

## 3. Projects

### Status machine

**Standard products:**

```text
needs_quote → quoted → advance_paid → in_progress → testing → done
                ↕ on_hold (reason)
                → cancelled
```

Money completion: balance payment recorded (or write-off) **before** `done`.

**Website:**

```text
needs_quote → quoted → demo → advance_paid → in_progress → testing → done
```

### Legacy mapping (current code)

Today’s code uses `planning | active | testing | complete | on_hold | cancelled`.  
Patch must map or migrate enums to the bible stages above (document mapping in gap-map).


| Bible        | Suggested legacy map      |
| ------------ | ------------------------- |
| needs_quote  | new                       |
| quoted       | planning                  |
| demo         | new (website)             |
| advance_paid | new (or flag on planning) |
| in_progress  | active                    |
| testing      | testing                   |
| done         | complete                  |
| on_hold      | on_hold                   |
| cancelled    | cancelled                 |


### Gates


| Transition                       | Rule                                                      |
| -------------------------------- | --------------------------------------------------------- |
| → in_progress without advance    | Soft warn + override (`see_money` or sales head)          |
| → done without balance/write-off | **Blocked**                                               |
| → cancelled                      | Owner or sales head; handle advance refund/non-refundable |
| → on_hold                        | Reason required                                           |


### Free support window

Optional integer `freeSupportDays` + `freeSupportEndsAt` set at Done (or earlier).  
Tickets within window marked complimentary by default.

### Multi-product

Staff may use one project with multiple line items **or** separate projects — both allowed.

### Work-order PDF

Generated for assignees; strips all money fields.

---

## 4. Invoices & payments

### Invoice

- Created at **quote time**.  
- Line items, taxable, GST, total.  
- Templates: `rancelab` vs `default`.  
- Letterhead: Innovate Bhutan + GST P10285932 + TBD address/bank.  
- Download: `see_money` only.

### Payments on a job


| Slot    | Cardinality | Fields                                                         |
| ------- | ----------- | -------------------------------------------------------------- |
| Advance | 0..1        | amount, date, method (mbob|cheque|other), proofUrl, recordedBy |
| Balance | 0..1        | same                                                           |


Portal: client uploads screenshot → staff confirms → fills payment slot.

### Price change

Allowed after issue: new amounts + **reason** + audit entry; regenerate/revise PDF per policy.

---

## 5. AMC

### Scope

Primary: `rancelab`, `pelbu_pos`, `website`.  
CCTV/networking: allowed but not primary UX.

### Fields

clientId, productKey, startDate, endDate, amount, status (`active|expiring|expired|cancelled`), renewedFrom/To, serial/meta as needed.

### Lifecycle

- Optional create from project Done.  
- Expiring: endDate within 30 days → status/list + notification.  
- Renew: new contract row + chain; RanceLab uses dealer T&Cs PDF.  
- Portal renew request → auto-draft invoice.

### Permissions

Manage AMC money: `see_money`.  
View list: staff.  
Renewal desk: sales head + owner.

---

## 6. Tickets

### Fields

clientId, productKey, subject, description, priority (`high|medium|low`), status (`open|in_progress|resolved`), assigneeId, billable (bool), projectId (optional), slaDueAt, breached (bool).

### Rules

- Any staff create/assign.  
- Messages: single thread; portal clients can reply if invited.  
- SLA due = createdAt + priority hours (4 / 24 / 72).  
- Breach → notification + report aging.  
- billable + no AMC → staff may attach/create invoice later (v1: flag + manual link OK).

---

## 7. Inventory

### Scope v1

Items + one warehouse; stock ledger; issue to **project**; serials for cameras/NVRs/etc.; min qty alerts; purchase as simple inbound entry (no PO entity required).

### Permissions


| Action           | Who                                          |
| ---------------- | -------------------------------------------- |
| Adjust counts    | Owner + sales head                           |
| Issue to project | Staff with stock access (include CCTV techs) |
| Create items     | Owner + sales head                           |


---

## 8. Users & RBAC

### Roles (profiles)

Keep `ADMIN` / `STAFF` / `CLIENT` but enforce **capabilities**:


| Capability       | ADMIN (owner) | Sales head* | Other STAFF | CLIENT               |
| ---------------- | ------------- | ----------- | ----------- | -------------------- |
| see_money        | Yes           | Yes         | No          | Portal invoices only |
| provision_users  | Yes           | Yes         | No          | No                   |
| cancel/write_off | Yes           | Yes         | No          | No                   |
| adjust_stock     | Yes           | Yes         | No          | No                   |
| admin ERP        | Yes           | Yes         | Limited nav | No                   |


Sales head may be `ADMIN` or `STAFF` + capability flags — prefer explicit flags in profile/settings over magic titles.

### Portal users

`CLIENT` role; must be **explicitly invited** and linked to `client_id`.

---

## 9. Notifications

### In-app bell + daily digest

- Needs quote  
- AMC expiring (30d)  
- Ticket assigned  
- SLA breach  
- Portal AMC renew request  
- Payment screenshot submitted

---

## 10. Reports & export


| Report                  | Audience                      |
| ----------------------- | ----------------------------- |
| Receivables             | see_money                     |
| AMC renewal pipeline    | staff + see_money for amounts |
| Ticket aging / breaches | staff                         |


CSV export: clients, invoices, AMC — `see_money` for money columns.

Weekly owner export checklist: clients, projects, invoices, payments, amcs, tickets, stock_ledger.

---

## 11. Portal module checklist


| Feature                           | v1                        |
| --------------------------------- | ------------------------- |
| Invite client                     | Yes                       |
| Email/password auth               | Yes                       |
| Project status                    | Yes                       |
| Invoices + pay status             | Yes                       |
| Ticket open/reply                 | Yes                       |
| Invoice PDF                       | Yes                       |
| M-BoB instructions + proof upload | Yes                       |
| AMC expiry + renew request        | Yes                       |
| Card gateway                      | No                        |
| Cut priority                      | **First module to defer** |


---

## 12. PWA / offline


| Feature                       | v1                                                  |
| ----------------------------- | --------------------------------------------------- |
| Installable manifest          | Yes (exists — harden)                               |
| My work / all jobs sans money | Yes                                                 |
| Offline queue mutations       | Yes — status, notes, photos                         |
| Offline create client/job     | Best-effort; must sync without money fields         |
| Conflict resolution           | Last-write with server validation; surface failures |


---

## 13. Website / CMS

No v1 ERP work required. Leave existing admin CMS alone.