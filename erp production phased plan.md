# Innovate Bhutan ERP - Full Production Plan (Phase-wise, Claude-Optimized)

## Objective
Deliver a fully production-ready ERP with controlled scope per phase so Claude can execute reliably within context limits (max ~170k tokens) and minimal chat overhead.

## Claude Autopilot Start Instructions (Run Immediately)

If this file is provided to Claude, Claude should **immediately start execution** using agents/subagents and should not wait for broad planning prompts.

### Mandatory startup behavior
1. Read only:
   - `PROJECT_BRAIN.md`
   - `erp production phased plan.md` (this file)
2. Ask only one question if absolutely required:
   - "Which packet should I execute first?"  
   If no answer is provided, default to `P1-A`.
3. Immediately dispatch agent(s) for the selected packet.
4. Follow packet allowlist strictly (no full repo scans).
5. Implement end-to-end (code + basic verification).

### Agent dispatch policy
- Use **one primary implementation agent** per packet.
- Use **parallel support agents** only when safe:
  - API + UI can run in parallel if file scopes do not overlap.
  - Schema/migration changes must run in a single sequential agent.
- Merge outputs only after checks pass.

### Required output format after each packet
Return only:
- `Done`
- `Packet`
- `Model used`
- `Files changed`
- `Verification run`
- `Next packet`
- `Blockers` (only if any)

### Default packet execution order (if user does not specify)
`P1-A -> P1-B -> P1-C -> P2-A -> P2-B -> P3-A -> P3-B -> P3-C -> P4-A -> P4-B -> P4-C -> P5-A -> P5-B -> P6-A -> P6-B -> P7-A -> P7-B -> P8-A`

### Hard constraints
- Do not edit this plan file during packet execution.
- Do not perform unrelated refactors.
- Do not change tools/framework choices unless blocked and approved.
- Keep replies concise; no chain-of-thought.

## Execution Policy (Token-Saving, Execute-Only)
- Do not ask for long explanations unless blocked.
- Do not print chain-of-thought.
- Keep updates short: status + files changed + blockers only.
- Execute phase tasks directly; stop only on hard blockers.
- Keep each phase context isolated (load only required docs/files).

## Context Budget Strategy (Per Phase)
- Target per phase prompt+code context: **60k-120k tokens** max.
- Never load full repo in one run.
- Use this loading order:
  1. `PROJECT_BRAIN.md`
  2. This file (`erp production phased plan.md`)
  3. Module-specific files only
  4. Related APIs + schema segments only
- Use one phase per chat/session where possible.

---

## Phase 0 - Baseline Lock (2-3 days)
### Goal
Stabilize architecture guardrails before feature expansion.

### Tasks
1. Enforce architecture contract: UI -> API -> Service -> Repository -> DB.
2. Remove/replace direct UI-to-DB mutation patterns.
3. Add common API response/error format utilities.
4. Add global error boundary and API error handling conventions.

### Deliverables
- Shared API response helper.
- Shared error helper.
- No direct admin UI writes bypassing services for ERP modules.

### Exit Criteria
- All modified modules follow layered architecture.
- Build passes.

---

## Phase 1 - Security Foundation (1-2 weeks)
### Goal
Close critical security gaps for production.

### Tasks
1. API auth middleware for all protected `/api/*`.
2. RBAC authorization checks in services (`ADMIN/STAFF/CLIENT`).
3. RLS policy verification/enforcement for critical tables.
4. Add rate limiting to mutation and public webhook routes.
5. Ensure audit log writes on all critical mutations.

### Deliverables
- `lib/auth/api-auth.ts` (or equivalent auth guard).
- `lib/rate-limit/*` applied to core routes.
- RLS SQL policy set documented.

### Exit Criteria
- Unauthorized requests blocked.
- Role violations blocked.
- Mutation routes rate-limited and audited.

---

## Phase 2 - Data Integrity & Schema Hardening (1 week)
### Goal
Guarantee consistent domain data and safe transitions.

### Tasks
1. Add/verify CHECK constraints (status enums, progress bounds).
2. Add missing indexes for high-frequency filters and joins.
3. Enforce unique constraints where business-critical.
4. Standardize soft-delete behavior where required.
5. Add transaction wrappers for multi-write flows.

### Deliverables
- New Drizzle migrations (`drizzle/*.sql`).
- Updated `db/schema.ts` alignment.

### Exit Criteria
- Migrations apply cleanly.
- No invalid status/progress states can be inserted.

---

## Phase 3 - Core Missing Modules (2-3 weeks)
### Goal
Implement missing operational pages/APIs blocking ERP completeness.

### Modules to complete
1. Orders (`/admin/orders`, `/api/orders*`)
2. Expenses (`/admin/expenses`, `/api/expenses*`)
3. Transactions (`/admin/transactions`, `/api/transactions*`)
4. Employees (`/admin/employees`, `/api/employees*`)
5. Attendance (`/admin/attendance`, `/api/attendance*`)
6. Audit Logs (`/admin/audit`, `/api/audit`)
7. Admin masters: Businesses + Locations pages

### Deliverables
- Main pages + key subpages live.
- CRUD + status/action APIs for each module.

### Exit Criteria
- Navigation has no broken links.
- Each module has list/detail/create/edit path and API parity.

---

## Phase 4 - Workflow Completion in Existing Modules (2 weeks)
### Goal
Finish deep workflow coverage for already-existing modules.

### Areas
1. Projects: members, milestones, activity, robust task lifecycle.
2. AMC: expiring dashboard, renew flow hardening, alerts.
3. Invoices: send/pay/overdue lifecycle, secure numbering, payment tracking.
4. Payroll: full HR UI flows for generate/approve/pay/batch.
5. Tickets: SLA/dispatch/thread completeness.

### Deliverables
- End-to-end status machines implemented in service layer.
- UI subpages for workflow steps.

### Exit Criteria
- All canonical workflows in `PROJECT_BRAIN.md` are fully represented in UI+API.

---

## Phase 5 - Notifications, Jobs, Automation (1-2 weeks)
### Goal
Automate time-based and event-based operations.

### Tasks
1. Background jobs for:
   - AMC expiry reminders
   - Invoice overdue marking
   - Payroll cycle reminders
2. Notification service + user inbox.
3. Webhook reliability improvements (idempotency, retries).

### Deliverables
- Job scheduler/runner setup.
- Notification APIs + UI center.

### Exit Criteria
- Time-based workflows run without manual intervention.

---

## Phase 6 - Reporting & Exports (1 week)
### Goal
Give leadership and operations actionable reporting.

### Tasks
1. Module reports pages (projects/finance/hr/support/amc).
2. Export CSV/XLS/PDF where needed.
3. KPI aggregation endpoints and dashboard drilldowns.

### Deliverables
- `/admin/*/reports` subpages.
- `/api/reports/*` endpoints.

### Exit Criteria
- Core business reports available with date-range filters and exports.

---

## Phase 7 - QA, Performance, and Production Hardening (1-2 weeks)
### Goal
Reduce regressions and ensure stable production behavior.

### Tasks
1. Add tests:
   - Unit (services/validators)
   - Integration (APIs)
   - Critical E2E flows
2. Query/performance optimization.
3. Observability:
   - structured logs
   - error tracking
   - health checks
4. CI/CD quality gates.

### Deliverables
- Test suites + CI checks.
- Performance baseline report.

### Exit Criteria
- Release candidate passes build, tests, and smoke checks.

---

## Phase 8 - Go-Live & Hypercare (1 week)
### Goal
Safe cutover and monitored stabilization.

### Tasks
1. Production migration runbook + backup/rollback plan.
2. Seed/role/bootstrap verification.
3. Controlled release + monitoring.
4. Hypercare fixes for first week.

### Deliverables
- Go-live checklist signed off.
- Hypercare issue log + resolved actions.

### Exit Criteria
- Production stable with no critical open incidents.

---

## Module-to-Phase Mapping
- **Security/Auth/RLS**: Phases 1-2
- **Projects/AMC/Invoices/Payroll deepening**: Phase 4
- **Missing main routes**: Phase 3
- **Notifications/automation**: Phase 5
- **Reports**: Phase 6
- **Tests/perf/release**: Phases 7-8

---

## Work Packet Format for Claude (Use Per Session)
For each session, provide:
1. Phase ID + exact task subset (max 3-6 tasks).
2. File scope list (strict).
3. Definition of done.
4. Command/tests to run.
5. Output format: changed files + verification.

### Example session instruction
"Execute Phase 3, Packet A: Orders module only. Touch only `app/admin/orders/*`, `app/api/orders/*`, `lib/services/orderService.ts`, `lib/repositories/orderRepository.ts`, `lib/validations/order.ts`, and related schema migration if needed. Do not explain thought process. Return changed files and test results only."

---

## Production Definition of Done (Global)
- No broken admin routes in navigation.
- All critical modules have complete list/detail/create/update/action workflows.
- AuthN/AuthZ/RLS/rate-limit/audit coverage on protected operations.
- Stable schema with migrations and constraints.
- Reports + export availability for key departments.
- Test coverage on critical paths and green CI pipeline.
- Observability and rollback plan ready.

---

## Direct Execute Packets (Strict, No Unwanted Scanning)

Use these packets exactly. Each packet has a hard file allowlist and explicit output.

### Packet Rules (apply to all packets)
- Read only files in the packet allowlist.
- Do not scan the full repo.
- Do not refactor outside packet scope.
- Do not change package manager or project config unless listed in packet scope.
- Output format must be:
  - `Done`
  - `Files changed`
  - `Verification run`
  - `Blockers` (only if any)

---

## Phase 0 Packets - Baseline Lock

### P0-A: API response/error foundation
**Scope**
- `lib/errors/*`
- `lib/utils.ts`
- `app/api/**/route.ts` (touch only shared pattern updates)

**Tasks**
1. Add standard response helpers (`success`, `failure`, HTTP mapping).
2. Add standard API error type(s).
3. Update 3-5 representative API routes to use standard format.

**Done When**
- Response envelope is consistent on updated routes.
- No TypeScript errors introduced.

---

### P0-B: Remove direct UI->DB writes in critical modules
**Scope**
- `app/admin/invoice/page.tsx`
- `app/admin/finance/finance-hub.tsx`
- `app/admin/projects/*`
- related `app/api/*` routes for those modules only

**Tasks**
1. Replace direct Supabase mutations in UI with API calls.
2. Ensure all writes happen through API/service/repository.

**Done When**
- No direct write mutation from the above UI files.
- Existing user flows still work (create/update/delete actions).

---

## Phase 1 Packets - Security

### P1-A: API auth guard + RBAC primitives
**Scope**
- `lib/auth/*`
- `lib/errors/*`
- `app/api/projects/**`
- `app/api/amc/**`
- `app/api/invoices/**`
- `app/api/payroll/**`

**Tasks**
1. Add request auth helper (`requireUser`).
2. Add role-check helper (`requireRole` / `hasPermission`).
3. Apply guards to all listed APIs.

**Done When**
- Protected routes reject unauthenticated requests.
- Role failures return 403.

---

### P1-B: Rate limiting
**Scope**
- `lib/rate-limit/*`
- `app/api/webhook/route.ts`
- `app/api/leads/webhook/route.ts`
- `app/api/whatsapp/route.ts`
- mutation routes under projects/amc/invoices/payroll

**Tasks**
1. Add reusable limiter utility.
2. Apply limits to listed routes.
3. Return HTTP 429 with retry metadata.

**Done When**
- Rate limit hit path is tested on at least one route.

---

### P1-C: Audit logging consistency
**Scope**
- `app/api/projects/**`
- `app/api/amc/**`
- `app/api/invoices/**`
- `app/api/payroll/**`
- `lib/services/*Service.ts` (only for above modules)

**Tasks**
1. Ensure every mutation logs audit event (CREATE/UPDATE/DELETE/STATUS/PAY/APPROVE).
2. Include actor, entity type, entity id, and metadata.

**Done When**
- No mutation endpoint in scope skips audit logging.

---

## Phase 2 Packets - Data Integrity

### P2-A: Schema constraints + indexes
**Scope**
- `db/schema.ts`
- `drizzle/*.sql`
- `drizzle/meta/*`

**Tasks**
1. Add missing CHECK constraints for status/progress.
2. Add missing indexes for lead/status/filter-heavy queries.
3. Add/verify unique constraints for business-critical identifiers.

**Done When**
- Migration generated and applies cleanly.
- Schema and migration are aligned.

---

### P2-B: Transaction safety wrappers
**Scope**
- `lib/repositories/projectRepository.ts`
- `lib/repositories/amcRepository.ts`
- `lib/repositories/invoiceRepository.ts`
- `lib/repositories/payrollRepository.ts`

**Tasks**
1. Wrap multi-step writes in DB transactions.
2. Prevent partial writes on renewals/status workflows.

**Done When**
- Multi-write flows in scope are atomic.

---

## Phase 3 Packets - Missing Modules

### P3-A: Orders module
**Scope**
- `app/admin/orders/**`
- `app/api/orders/**`
- `lib/repositories/orderRepository.ts`
- `lib/services/orderService.ts`
- `lib/validations/order.ts`

**Tasks**
1. Build list/create/detail/edit UI routes.
2. Build collection/item/action APIs.
3. Wire validation + service + repository.

**Done When**
- `/admin/orders` and `/api/orders*` complete for CRUD + item actions.

---

### P3-B: Expenses + Transactions modules
**Scope**
- `app/admin/expenses/**`
- `app/admin/transactions/**`
- `app/api/expenses/**`
- `app/api/transactions/**`
- `lib/repositories/expenseRepository.ts`
- `lib/repositories/transactionRepository.ts`
- `lib/services/expenseService.ts`
- `lib/services/transactionService.ts`
- `lib/validations/expense.ts`
- `lib/validations/transaction.ts`

**Tasks**
1. Build pages and APIs for expenses and transactions.
2. Include approval/reconciliation actions.

**Done When**
- Navigation routes resolve and full CRUD/actions work.

---

### P3-C: Employees + Attendance + Audit pages
**Scope**
- `app/admin/employees/**`
- `app/admin/attendance/**`
- `app/admin/audit/**`
- `app/api/employees/**`
- `app/api/attendance/**`
- `app/api/audit/**`
- `lib/repositories/employeeRepository.ts`
- `lib/repositories/attendanceRepository.ts`
- `lib/services/employeeService.ts`
- `lib/services/attendanceService.ts`
- `lib/validations/employee.ts`
- `lib/validations/attendance.ts`

**Tasks**
1. Implement employee and attendance operational flows.
2. Implement audit log read UI/API with admin-only access.

**Done When**
- `/admin/employees`, `/admin/attendance`, `/admin/audit` are live and secured.

---

## Phase 4 Packets - Existing Module Workflow Completion

### P4-A: Projects deep workflow
**Scope**
- `app/admin/projects/**`
- `app/api/projects/**`
- `app/api/tasks/**`
- `lib/services/projectService.ts`
- `lib/repositories/projectRepository.ts`
- `lib/validations/project.ts`

**Tasks**
1. Complete members/milestones/activity subflows.
2. Enforce status transition checks and completion invariants.
3. Optimize progress recompute queries.

**Done When**
- Project lifecycle and task lifecycle are fully enforced.

---

### P4-B: AMC deep workflow
**Scope**
- `app/admin/amc/**`
- `app/api/amc/**`
- `lib/services/amcService.ts`
- `lib/repositories/amcRepository.ts`
- `lib/validations/amc.ts`

**Tasks**
1. Complete expiring/renew/report UI subflows.
2. Harden renewal chain transaction integrity.
3. Add expiry-alert-ready query endpoints.

**Done When**
- Renewal and expiry lifecycle is complete and safe.

---

### P4-C: Invoices + Payroll + Tickets deep workflow
**Scope**
- `app/admin/invoice/**`
- `app/admin/hr/**`
- `app/admin/tickets/**`
- `app/api/invoices/**`
- `app/api/payroll/**`
- `app/api/tickets/**` (if introduced)
- `lib/services/invoiceService.ts`
- `lib/services/payrollService.ts`
- `lib/services/ticketService.ts` (if introduced)

**Tasks**
1. Finalize invoice send/pay/overdue/cancel flows.
2. Finalize payroll run/approve/pay/batch UI.
3. Finalize ticket dispatch/thread/SLA views.

**Done When**
- All three modules have end-to-end operational completeness.

---

## Phase 5 Packets - Jobs + Notifications

### P5-A: Job scheduler and workers
**Scope**
- `lib/jobs/**` (new)
- `app/api/jobs/**` (if needed)
- `lib/services/amcService.ts`
- `lib/services/invoiceService.ts`
- `lib/services/payrollService.ts`

**Tasks**
1. Add recurring jobs for AMC expiry reminders, invoice overdue updates, payroll reminders.
2. Add idempotency protections.

**Done When**
- Jobs run safely and can be re-run without duplication.

---

### P5-B: Notifications center
**Scope**
- `app/admin/notifications/**`
- `app/api/notifications/**`
- `lib/services/notificationService.ts`
- `lib/repositories/notificationRepository.ts`

**Tasks**
1. Build inbox UI and read/mark-read flows.
2. Wire event producers from core modules.

**Done When**
- Users receive and manage actionable notifications.

---

## Phase 6 Packets - Reports

### P6-A: Reports API foundation
**Scope**
- `app/api/reports/**`
- `lib/services/reportService.ts`
- `lib/repositories/reportRepository.ts`

**Tasks**
1. Add KPI endpoints by module (projects/finance/hr/support/amc).
2. Add date range and filter support.

**Done When**
- Reports endpoints return normalized metric payloads.

---

### P6-B: Report UI + export
**Scope**
- `app/admin/projects/reports/**`
- `app/admin/finance/reports/**`
- `app/admin/hr/reports/**`
- `app/admin/tickets/reports/**`
- `app/admin/amc/reports/**`

**Tasks**
1. Build module report pages.
2. Add CSV export first; optionally PDF later.

**Done When**
- Leadership can view and export core reports.

---

## Phase 7 Packets - QA + Perf + CI

### P7-A: Unit + integration test coverage
**Scope**
- `lib/services/**/*.test.*`
- `app/api/**/*.test.*`
- test config files only if required

**Tasks**
1. Add tests for status transitions, payroll calculations, auth/rate-limit behavior.
2. Add integration tests for core mutation endpoints.

**Done When**
- Critical flows are covered and passing in CI.

---

### P7-B: Performance pass
**Scope**
- Query-heavy repositories only
- targeted UI tables with large lists

**Tasks**
1. Optimize heavy queries and pagination.
2. Remove obvious N+1 patterns.
3. Add caching only where safe.

**Done When**
- Measurable response time improvement on top heavy endpoints.

---

## Phase 8 Packets - Go-Live

### P8-A: Release readiness pack
**Scope**
- `docs/release/**` (new)
- migration scripts and runbooks

**Tasks**
1. Add migration runbook + rollback steps.
2. Add smoke checklist and hypercare playbook.

**Done When**
- Team can execute cutover and rollback with documented steps.

---

## Copy/Paste Session Prompts (Use Directly)

### Prompt Template
`Execute <PACKET_ID> from "erp production phased plan.md". Strictly follow packet allowlist. Do not scan outside listed files. Do not explain thinking. Return only: Done, Files changed, Verification run, Blockers.`

### Example 1
`Execute P1-A from "erp production phased plan.md". Strictly follow packet allowlist. Do not scan outside listed files. Do not explain thinking. Return only: Done, Files changed, Verification run, Blockers.`

### Example 2
`Execute P3-B from "erp production phased plan.md". Strictly follow packet allowlist. Do not scan outside listed files. Do not explain thinking. Return only: Done, Files changed, Verification run, Blockers.`

---

## Model Selection (Which Model To Run)

Use this default model policy for fastest reliable execution:

- **Default for most packets**: `claude-4.6-sonnet-medium-thinking`
- **Use high-reasoning only for hard architecture/security packets**: `claude-opus-4-7-thinking-high`
- **Use fastest model only for narrow mechanical edits**: `composer-2-fast`

### Recommended model by phase
- **Phase 0 (baseline patterns)**: `claude-4.6-sonnet-medium-thinking`
- **Phase 1 (security/auth/rbac/ratelimit)**: `claude-opus-4-7-thinking-high`
- **Phase 2 (schema/migrations/constraints)**: `claude-opus-4-7-thinking-high`
- **Phase 3 (new modules CRUD)**: `claude-4.6-sonnet-medium-thinking`
- **Phase 4 (complex workflow completion)**: `claude-opus-4-7-thinking-high`
- **Phase 5 (jobs/automation/notifications)**: `claude-4.6-sonnet-medium-thinking`
- **Phase 6 (reports/exports)**: `claude-4.6-sonnet-medium-thinking`
- **Phase 7 (tests/performance/ci)**: `claude-4.6-sonnet-medium-thinking`
- **Phase 8 (go-live docs/checklists)**: `claude-4.6-sonnet-medium-thinking`

### Recommended model by packet type
- **Security-critical packets (P1-A, P1-B, P1-C, P2-A)**: `claude-opus-4-7-thinking-high`
- **Heavy multi-file feature packets (P3-*, P4-*)**: `claude-4.6-sonnet-medium-thinking`
- **Pure docs/runbook packets (P8-A)**: `composer-2-fast`

### Failover policy
If a packet fails twice with the default model:
1. Retry once with `claude-opus-4-7-thinking-high` for diagnosis/fix.
2. If still blocked, split packet into smaller file-scoped sub-packets and rerun with `claude-4.6-sonnet-medium-thinking`.



