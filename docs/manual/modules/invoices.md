# Invoices & payments

**Route:** `/admin/invoice` (requires `see_money` / ADMIN)

## Purpose

Commercial documents: quote-time invoices, tax invoices, AMC quotations. Payments are recorded on the **project money panel** (advance + balance) or AMC renewal desk — not as free-form cash.

## Rules (bible)

- Quote invoice first when price is known.
- Methods: **M-BoB** or **Cheque** (+ screenshot proof). **No cash.**
- GST default **~5%** (configurable on templates).
- Letterhead: **Innovate Bhutan**, GST/TIN **P10285932** (address/bank TBD).
- Numbers: prefer `INV-YYYY-####` style where templates allow.

## How to use

1. Create job with quote → system creates draft invoice (Wave A).
2. Open Invoices → review, send, mark paid/overdue as needed.
3. Client portal: client sees invoice list + PDF link + upload payment proof.
4. Staff confirms proof from notifications / invoice desk.

## Templates

Invoice design editor supports product letterheads (RanceLab T&Cs, website, etc.).

## Related

- [Projects & money](/admin/manual/module-projects)
- [Client portal](/admin/manual/module-portal)
