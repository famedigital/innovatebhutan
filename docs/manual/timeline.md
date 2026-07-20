# Timeline & commits

Curated history of Innovate Bhutan ERP (not every website commit).

## Era map

| Period | Focus |
|--------|--------|
| Early | Public site / Netlify / marketing heroes |
| 2026-04 | Core ERP modules: Projects, AMC, Invoices, Payroll (audits + migrations 0006/0007) |
| 2026-05 | Production readiness, security fixes, PWA/admin mobile, UML & schema docs |
| 2026-06–07 | Product hubs (RanceLab), renewal desk, tickets call-centre, invoice templates, staff UX |
| **2026-07-21** | **Owner interview → ERP bible**; Waves **A / B / C** ship (`9072fc9`) |

## Drawing board → bible (Jul 2026)

Owner (business) interview captured in `docs/erp-bible/`:

- Company operating system (intake, money, stages, AMC, tickets, portal, PWA)
- Module requirements + RBAC (`see_money`)
- Gap map vs codebase
- Patch strategy (not greenfield); portal cuttable if overloaded — shipped as Wave C anyway

## Major commits (engineering)

| Commit | Summary |
|--------|---------|
| `9072fc9` | **Waves A–C** — money stages, SLA/offline, invite portal + docs |
| `a8cb316` … `01751bb` | Staff assign / employee backfill fixes |
| `32aa108` | Yearly AMC renewal history on client hub |
| `2e29bcd` | Invoice templates + call-centre ticket desk |
| `6d1d3c1` | RanceLab hub + Renewal Desk |
| `f934021` | Harden admin ERP + staff mobile PWA |
| `0903a52` | Migration sync + AMC enhancement |
| `eb78c45` | Early “complete ERP” with WhatsApp bot + portal shell |
| `62abdf0` | Initial Innovate Bhutan cyber portal |

## Wave ships (same day: 2026-07-21)

1. **Wave A** — capabilities, project stages, payments API, money redaction  
2. **Wave B** — AMC notify fix, ticket SLA, offline queue, work-order PDF, dashboard widgets  
3. **Wave C** — invite portal APIs + `/portal` modules  

See [Wave A](/admin/manual/wave-a) · [Wave B](/admin/manual/wave-b) · [Wave C](/admin/manual/wave-c).

## Interviews & decisions

| Date | Artifact | Outcome |
|------|----------|---------|
| 2026-07-21 | Owner interview | Bible `00`/`01`/`02`; Approach 3 patch-in-place |
| 2026-07-21 | Senior demo bar | Documented in bible §12 + [Senior demo](/admin/manual/senior-demo) |

Older progress notes live under `docs/enterprise-support-system-*.md` and `docs/release/`.
