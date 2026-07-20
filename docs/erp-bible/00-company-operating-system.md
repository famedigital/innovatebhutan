# Innovate Bhutan — Company Operating System

**Status:** Business source of truth (owner interview, Jul 2026)  
**Strategy:** Approach 3 — keep the existing Next.js/Supabase codebase; patch module-by-module to match this bible.  
**When code and this bible disagree, change the code** (or explicitly amend this file).

Technical map of the repo remains in `[PROJECT_BRAIN.md](../../PROJECT_BRAIN.md)`.  
Module field/stage detail: `[01-module-requirements.md](01-module-requirements.md)`.  
Code gaps: `[02-gap-map.md](02-gap-map.md)`.

---

## 1. Why this exists

The current ERP has many screens but large gaps versus how Innovate Bhutan actually runs. Senior feedback: rewrite from the drawing board — quality, process mismatch, and scope chaos. This bible captures **how the business runs** so patches have a single approved target.

**Company pain today:** client/project details live nowhere reliable; information is lost; there is no proper system of record.

---

## 2. Who uses the system


| Role (business)                              | Approx. count    | ERP access                                            |
| -------------------------------------------- | ---------------- | ----------------------------------------------------- |
| Owner (also developer)                       | 1–2 with website | Full; sees money; provisions users                    |
| Marketing & sales head                       | 1                | Full ops + money; green-lights jobs; provisions users |
| Sales (multi-role: sell + implement/support) | ~5               | Ops; **no money**; can create tickets/jobs            |
| CCTV technicians                             | ~2               | Ops; **no money**; field PWA                          |
| Clients (portal)                             | Invite-only      | Portal only                                           |


**Total staff logins (first 6 months):** ~9–15.

**Capabilities (not job-title-only):**

- `see_money` — owner + Marketing & sales head only  
- `cancel_project` / `write_off` — owner + sales head  
- `provision_users` — owner + sales head  
- `adjust_stock` — owner + sales head  
- Techs/sales without `see_money` never see prices, advances, balances, or invoice PDFs

---

## 3. Products sold


| Key          | Name           | Notes                                                      |
| ------------ | -------------- | ---------------------------------------------------------- |
| `rancelab`   | RanceLab       | Software; AMC common; **special quotation/AMC PDF + T&Cs** |
| `pelbu_pos`  | Pelbu POS      | Software; AMC common                                       |
| `website`    | Website Design | Extra **Demo** stage before advance                        |
| `cctv`       | CCTV           | Hardware; AMC rare; stock/serials matter                   |
| `networking` | Networking     | Hardware; AMC rare; stock/serials matter                   |


AMC focus: **software** (RanceLab, Pelbu, Website). Hardware AMC is uncommon.

---

## 4. End-to-end operating loop

```text
WhatsApp / phone / walk-in
  → Marketing & sales head captures job
  → Client + Project (quote)
  → Quote-time invoice (GST)
  → Advance (30–50%) + proof
  → Delivery (project stages)
  → Testing / handover
  → Balance + proof → Done
  → Optional software AMC
  → Support as Tickets forever
```

### 4.1 Intake

- Main path: walk-in / phone / WhatsApp → notes → work.  
- **Marketing & sales head** is the front door and green-light.  
- Minimum before work: business name, phone, product, short description, quoted price.  
- Assignment of who does the work: **always manual** (no auto-routing).

### 4.2 Selling & money (non-website)

1. Formal **quote invoice** at quote time.
2. **Advance** (typically 30–50%; store agreed amount).
3. Work.
4. **Balance** on completion.

### 4.3 Website path

Meet → discuss → approx quote → **demo/prototype** → yes → advance → complete → full payment.

### 4.4 Payments

- Methods: **M-BoB** or **Cheque** (no cash — aligns with RanceLab dealer terms).  
- Record: amount, date, method, **proof upload**.  
- Structure: **one advance + one balance** record per job (not many partials).  
- Job money panel must show: quoted total · advance due/paid · balance due/paid · linked project.

### 4.5 Project stages (delivery board)

Default (all products except website extra stage):

1. Quoted
2. Advance paid
3. In progress
4. Testing / handover
5. Done
6. Balance paid *(money completion; may align with Done gate below)*

Plus: **On hold** (reason required), **Cancelled**, **Needs quote** (tech-created job with no price).

**Website:** insert **Demo** between Quoted and Advance paid.

**Gates:**

- Advance → In progress: **Soft** for all products (warn; override allowed).  
- **Done:** hard gate — balance recorded **or** write-off first.  
- Write-off: owner + sales head only.  
- Cancel: owner + sales head; if advance paid → refund **or** mark non-refundable.

### 4.6 AMC (software)

- Package: WhatsApp/phone support, on-site visits, updates, training refreshers, response expectation, “peace of mind.”  
- RanceLab T&Cs: copy dealer quotation PDF (renew ~10 days early, non-refundable, M-BoB/Cheque, suspension language).  
- Other products: qualitative soft text until SLA package numbers are defined.  
- Create: **optional prompt at project Done** (start date + first-year fee).  
- Renewal: ~**30 days** before expiry → Expiring list + **notification bell** → staff contact client → renew.  
- Portal renew request: **auto-draft renewal invoice**.  
- No auto-freeze of support in v1 (manual process).

### 4.7 Support tickets

- Every client problem becomes a **ticket** (AMC or not).  
- Any staff can create and assign.  
- Non-AMC billable work: stay on ticket; **billable?** flag; staff decide goodwill vs charge.  
- Single thread (client-visible); no separate private staff notes channel in v1.  
- SLA by priority with breach alerts: **High 4h / Med 24h / Low 72h**.

### 4.8 After install

- Staff set a **free support window (days)** on the project; tickets in that window are complimentary.

---

## 5. Tax, documents, letterhead

- **GST:** configurable in settings; default **5%**; applies to all products.  
- Company on PDFs: **Innovate Bhutan**, GST **P10285932**.  
- Address / phone / email / bank: **TBD before go-live**.  
- Doc numbers: auto per year — `INV-YYYY-####`, `AMC-YYYY-####`.  
- RanceLab: special template + dealer notice + AMC T&Cs.  
- Others: simpler tax layout, same GST math.  
- Invoice PDF download: owner + sales head.  
- Techs: **work-order PDF** (no prices): client, phone, address, product, description, notes/photos, assigned tech.  
- Price change after quote sent: allowed with **reason + audit log**.  
- Quote expiry: soft reminder only (no hard void).

---

## 6. Clients

- Required: business/shop name, phone.  
- GST/tax ID when known (especially on invoice).  
- Nice: contact person, address/dzongkhag, email, notes, WhatsApp link, focal staff.  
- Phone **not unique**; identity primarily by **business name**; duplicate names allowed.  
- No hard delete — **Cancel / Archive only**.  
- Photos/files retained **forever**.

---

## 7. Mobile / PWA (mandatory)

- Mobile-first installable **PWA**.  
- Techs see **all company jobs/tickets except money**.  
- Can: update status, notes/photos, create tickets, create clients/jobs **without prices**.  
- No-price jobs → **Needs quote** + notify sales head.  
- **Offline required:** queue status / notes / photos; sync when online.  
- UI language: **English only**.

---

## 8. Inventory (v1)

- CCTV / networking first; other products later.  
- One store room.  
- Stock issue **must** link to a project.  
- Low-stock min-qty alerts.  
- Purchasing: simple “bought X” (no formal PO).  
- Track **serial numbers** on install.  
- Count adjustments: owner + sales head.  
- Techs deduct via job issue flow as designed with RBAC.

---

## 9. Client portal (v1, cuttable)

**Invite-only** (explicit invite per client business).

Client can:

- See project status  
- See invoices + payment status  
- Open/reply to tickets  
- Download invoice PDF  
- Pay: **M-BoB instructions + upload payment screenshot** (no card gateway)  
- See AMC expiry / request renew

Auth: **email + password**.

**Priority:** if v1 is overloaded, **cut portal first** (keep core ops + PWA + stock).

---

## 10. Dashboards, reports, notifications

**Owner + sales head home:**

1. Needs quote + unpaid balances
2. Open projects / tickets
3. AMC expiring in 30 days

**v1 reports:** receivables; AMC renewal pipeline; open ticket aging.

**Notification bell + daily digest email:** Needs quote, AMC expiry, ticket assigned, SLA breach, portal renew request, payment screenshot submitted.

**Audit:** all creates/updates/deletes on v1 modules.

**CSV export:** clients, invoices, AMC.

**Backup:** weekly owner export of critical tables (in addition to platform backups).

---

## 11. Explicitly out of v1 (or leave alone)

- Greenfield rewrite / bulk migrate all historical DB junk (clean re-entry of important clients/AMCs).  
- Full accounting suite / payroll depth.  
- Formal procurement PO module.  
- WhatsApp as ERP chat replacement (WhatsApp stays intake; ERP is system of record).  
- Website/CMS admin: **leave as-is**; do not block ERP patches.  
- Dzongkha UI.  
- Card payment gateway.

---

## 12. Senior acceptance demo (definition of done for first slice)

A sales person (with money rights) can:

1. Create client + job (name, phone, product, description, quote).
2. Issue quote-time invoice (RanceLab or default + GST).
3. Record advance → move stages → record balance (proof + method).
4. Open/assign a support ticket; SLA visible.
5. See AMC expiring in ~30 days (software).
6. Techs use PWA without seeing money; offline queue works for status/notes/photos.

Stock and portal follow when capacity allows; portal is first to defer.

---

## 13. TBD before go-live

- Full letterhead (address, phone, email, bank / M-BoB / cheque payee).  
- Soft AMC package text for non-RanceLab products (visit counts if ever needed).  
- Exact digest email address(es).

---

## 14. Amendment log


| Date       | Change                             | By             |
| ---------- | ---------------------------------- | -------------- |
| 2026-07-21 | Initial bible from owner interview | Cursor session |


