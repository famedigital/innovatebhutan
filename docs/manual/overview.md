# Overview

**Innovate Bhutan ERP Manual** — staff-only operating guide.

This manual is the single place to read:

- How the **company** runs (owner interview / ERP bible)
- How to use each **module** day-to-day
- What **Waves A–C** shipped (Jul 2026) and which **SQL migrations** to run
- **Timeline**, major **commits**, recurring **debugs**, and older runbooks

## Product

Innovate Bhutan ERP is a Next.js + Supabase system for:

| Area | Use |
|------|-----|
| Work | Clients, projects, tickets |
| Commercial | Quotes/invoices, AMC renewals |
| Stock | Inventory issue to projects |
| Portal | Invite-only client self-service |
| Field | Mobile PWA + offline queue |

**Strategy (locked Jul 2026):** patch the existing codebase module-by-module — do **not** greenfield rewrite. Re-enter important clients/AMCs cleanly; do not bulk-migrate untrusted history.

## Who this is for

| Role | Sees money? | Typical use |
|------|-------------|-------------|
| Owner / ADMIN | Yes | Full ERP, invites, write-offs |
| Sales head | Yes (`see_money`) | Quotes, advances, AMC |
| Field STAFF | No | Status, tickets, stock issue, PWA |
| CLIENT | Portal only | Own invoices, tickets, AMC renew |

## How to navigate

Use the left menu. Prefer:

1. [Getting started](/admin/manual/getting-started)
2. [Senior demo path](/admin/manual/senior-demo)
3. Module guides under **How to use modules**
4. [Migrations](/admin/manual/migrations) after any deploy that includes Waves A–C

## Source of truth

| Doc set | Path |
|---------|------|
| Business bible | `docs/erp-bible/` |
| Wave notes | `docs/erp-bible/WAVE_*.md` |
| This manual’s how-tos | `docs/manual/` |
| Project brain | `PROJECT_BRAIN.md` |

_Last curated: 2026-07-21._
