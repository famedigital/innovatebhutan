# Projects Module — Complete Flow, Schema, DB Analysis (Done vs To-Do)

**Scope:** Projects + Project Tasks (admin ERP).  
**Layers:** UI (`app/admin/projects/*`) → API (`app/api/projects/*`, `app/api/tasks/*`) → Service (`lib/services/projectService.ts`) → Repository (`lib/repositories/projectRepository.ts`) → DB (`db/schema.ts`, `drizzle/*`).

## 1) Current module map (what exists)

### UI (Admin)
- `app/admin/projects/page.tsx` (route entry)
- `app/admin/projects/project-hub.tsx` (listing, filters, delete, opens modals)
- `app/admin/projects/create-project-modal.tsx` (create project)
- `app/admin/projects/project-detail-modal.tsx` (task board + quick project edits)

### API
- `GET/POST /api/projects` → `app/api/projects/route.ts`
- `GET/PATCH/DELETE /api/projects/[id]` → `app/api/projects/[id]/route.ts`
- `GET/POST/PATCH /api/projects/[id]/tasks` → `app/api/projects/[id]/tasks/route.ts`
- `GET /api/projects/[id]/progress` → `app/api/projects/[id]/progress/route.ts`
- Task single updates/deletes used by UI: `PATCH/DELETE /api/tasks/[taskId]` (implementation exists elsewhere; UI depends on it)

### Service/Repository/Validation
- `lib/services/projectService.ts`
- `lib/repositories/projectRepository.ts`
- `lib/validations/project.ts`
- Caching: `lib/cache/project-cache.ts`

## 2) Canonical workflows (how it works end-to-end today)

### 2.1 List projects (hub)
1. UI: `ProjectHub.fetchProjects()` calls `GET /api/projects?page&limit&status&search`.
2. API: `app/api/projects/route.ts`:
   - **AuthN/AuthZ:** `requireApiAuth(req)` + `requireStaffOrAdmin(profile)`
   - Validates query via `projectQuerySchema`
   - Calls `projectService.listProjects({ ...filters, limit, offset })`
3. Service: `ProjectService.listProjects()` delegates to repository
4. Repo: `listProjectsWithDetails()` performs joins:
   - `projects` ← `clients` (name/logo)
   - `projects.leadId` ← `profiles.userId` (text join)
   - `projects.serviceId` ← `services`
5. Response: `{ data, pagination }` used by table and stats.

### 2.2 Create project
1. UI: `CreateProjectModal` submits to `POST /api/projects` with:
   - `clientId` (required), optional `serviceId`, optional `leadId` (user id string), dates, budget.
2. API: validates with `createProjectSchema`, then `projectService.createProject(input, profile.userId)`; writes `audit_logs` (service-role Supabase client).
3. Service: `createProject()` generates `publicId = proj_*` and inserts:
   - `status = planning`, `progress = 0`
4. Repo: `createProject()` inserts `projects` row.

**Invariant enforced (partially):**
- Status initial is `planning` (service enforces).
- Audit log exists at API layer for CREATE.

### 2.3 View project details + tasks
1. UI opens `ProjectDetailModal`, fetches:
   - `GET /api/projects/[id]/tasks`
   - `GET /api/projects/[id]/progress`
2. API:
   - Both endpoints require `requireApiAuth` + staff/admin.
   - Tasks endpoint returns tasks for the project.
   - Progress endpoint recalculates progress (see §6.4 issue: reaches into service internals).
3. UI “enriches” tasks by calling `/api/profiles/${task.assignedTo}` per task to display name (N+1).

### 2.4 Create task
1. UI submits `POST /api/projects/[id]/tasks` with title/priority, optional assignedTo (string user id), dueDate, estimate.
2. API validates `createTaskSchema` and calls `projectService.createTask()`.
3. Service inserts task (`status = todo`) then calls `repository.updateProjectProgress(projectId)`.
4. Repo:
   - `createTask()` inserts task and invalidates progress cache
   - `updateProjectProgress()` uses SQL aggregation via `getProjectStats()` and updates `projects.progress` and in-memory cache.
5. API writes audit log for `TASK` create.

### 2.5 Update task status / edit / delete task
1. UI calls `PATCH /api/tasks/[taskId]` (single-task endpoint) to update status.
2. Service/Repo update task and recompute project progress.
3. UI calls `DELETE /api/tasks/[taskId]` for deletion; progress recalculated.

### 2.6 Update project (inline edits)
1. UI calls `PATCH /api/projects/[id]` with partial fields (ex: status).
2. API validates `updateProjectSchema` and calls `projectService.updateProject(projectId, data, profile.userId, profile.role)`.
3. Service:
   - Checks authorization using `canUserModifyProject()` **if** userId+role provided
   - Blocks setting status `complete` unless all tasks are done
4. Repo updates `projects` row.
5. API writes audit log for UPDATE.

### 2.7 Delete project
1. UI calls `DELETE /api/projects/[id]`.
2. API requires auth; explicitly enforces admin-only delete.
3. Service currently hard-deletes tasks then project (not transactional).
4. API writes audit log for DELETE.

## 3) Database schema (current `db/schema.ts`)

### 3.1 `projects` (current reality)
- `id` serial PK
- `public_id` varchar(50) unique (nullable in schema)
- `client_id` integer **NOT NULL**
- `service_id` integer nullable
- `name` varchar(255) **NOT NULL**
- `description` text
- `status` varchar default **`planning`**
- `lead_id` **text** (intended to reference `profiles.user_id` / Supabase Auth user UUID)
- `start_date`, `end_date` timestamps
- `budget` numeric(15,2)
- `progress` int default 0
- timestamps `created_at`, `updated_at`

**Indexes in Drizzle schema**
- `idx_projects_client` on `client_id`
- `idx_projects_status` on `status`
- `idx_projects_public` on `public_id`

### 3.2 `project_tasks`
- `id` serial PK
- `project_id` int **NOT NULL** references `projects.id`
- `assigned_to` text (intended to be `profiles.user_id`)
- `title` varchar(255) **NOT NULL**
- `description` text
- `status` varchar default `todo` (todo/in_progress/done/blocked)
- `priority` varchar default `medium`
- `due_date` timestamp
- `estimated_hours`, `actual_hours` numeric(10,2)
- `created_at` timestamp default now()

**Indexes in Drizzle schema**
- `idx_tasks_project` on `project_id`
- `idx_tasks_status` on `status`
- `idx_tasks_due` on `due_date`

### 3.3 Migration reality vs Drizzle reality (important)
`drizzle/0004_create_projects_tables.sql` defines:
- `projects.lead_id` as **integer references profiles(id)**
- `project_tasks.assigned_to` as **integer references profiles(id)**
- also creates indexes `idx_projects_lead` and `idx_tasks_assigned`

But current app code treats:
- `projects.leadId` as **string** (`profiles.userId`)
- `project_tasks.assignedTo` as **string** (`profiles.userId`)

**This is a critical mismatch to resolve** (see §6.1).

## 4) State machines & invariants (intended vs enforced)

### 4.1 Project status state machine (intended)
`planning → active → testing → complete` plus `on_hold`, `cancelled` (terminal).

**Enforced in code**
- `ProjectService.transitionProjectStatus()` defines valid transitions (but UI uses direct PATCH update, not this method).
- `ProjectService.updateProject()` enforces the completion invariant (cannot set `complete` if tasks incomplete).

### 4.2 Task state machine (intended)
`todo → in_progress → done` with `blocked` as side state.

**Enforced in code**
- No explicit transition guard for task status (any status accepted if it passes Zod enum).

### 4.3 Progress invariant
- `projects.progress` is a cached 0–100 derived from tasks.

**Enforced in code**
- Repo computes progress via aggregation (`getProjectStats`) and updates `projects.progress`.
- Cache exists (`project-cache.ts`); invalidation occurs on create/update/delete task.

## 5) What’s DONE (as of current code)

### Done — core functionality
- **Projects CRUD**: list/create/update/delete via API + service + repository
- **Tasks CRUD**: create/list; single task update/delete via `/api/tasks/[taskId]` (UI integrated)
- **Progress**: derived from tasks; aggregation query (no full row scans)
- **Filtering/search/pagination** on projects list
- **Joins for “details” list** (client/service/lead name)

### Done — security baseline (partial)
- **API AuthN/AuthZ** present for Projects endpoints:
  - `requireApiAuth` + `requireStaffOrAdmin` in `/api/projects*`
- **Audit logs** written for create/update/delete + task create (API layer)

## 6) What NEEDS TO BE DONE (gaps, bugs, and production hardening)

### 6.1 Critical: schema + migration + validation mismatches (must fix)
- **`leadId` / `assignedTo` type mismatch**
  - App code expects `text` user ids (Supabase Auth UUIDs, `profiles.userId`)
  - `drizzle/0004_create_projects_tables.sql` created `lead_id`/`assigned_to` as **integer profile ids**
  - Drizzle schema currently defines them as `text` (so the DB must match or runtime will break)

- **Zod mismatch: `projectQuerySchema.leadId`**
  - `lib/validations/project.ts` has `leadId: z.coerce.number()` but **repo expects string leadId**
  - This makes filtering by `leadId` incorrect or impossible.

- **Zod mismatch: `bulkCreateTasksSchema.tasks[].assignedTo`**
  - schema uses `z.number()` but UI/service uses string user id.

### 6.2 Critical: soft delete not implemented in code
- Migration `drizzle/0010_projects_soft_delete.sql` introduces `deleted_at` + views.
- But `db/schema.ts` **does not define `deletedAt`**, and repository queries do not exclude deleted rows.
- Delete endpoints currently **hard delete** (data loss + audit limitations).

### 6.3 High: missing indexes in Drizzle schema + unclear migration application
- Migrations exist:
  - `drizzle/0008_projects_missing_indexes.sql` (lead + composite indexes + dates)
  - `drizzle/0009_projects_constraints.sql` (progress/status/priority checks)
- But `db/schema.ts` currently lacks:
  - `leadId` index
  - composite indexes (client+status, lead+status, dates)
- If migrations were not applied to Supabase, performance will degrade quickly.

### 6.4 High: progress endpoint breaks layering
`app/api/projects/[id]/progress/route.ts` does:
- `projectService["repository"].getProjectStats(projectId)` (reaches into a private field)

**Fix:** expose a proper service method like `getProjectStats(projectId)` and call it.

### 6.5 High: missing transactions for multi-write operations
Examples:
- delete project (delete tasks + delete project)
- create task + update project progress

**Risk:** partial updates on failure; inconsistent progress.

### 6.6 Medium: UI N+1 profile lookups
`ProjectDetailModal` fetches assignee profile per task via `/api/profiles/:id`.
**Fix options:**
- include assignee fullName in `/api/projects/[id]/tasks` response (join to profiles)
- or batch endpoint `/api/profiles?userIds=...`

### 6.7 Medium: task status transition rules missing
Currently any status enum value can be set at any time.
**Fix:** enforce valid transitions in `ProjectService.updateTask()`.

### 6.8 Medium: testing and regression protection
- No unit/integration tests around:
  - completion invariant
  - progress aggregation correctness
  - auth enforcement

## 7) Recommended “production-ready” backlog (prioritized)

### P0 (blockers)
1. Unify DB schema for `lead_id` and `assigned_to` (text user id vs int profile id) and fix Zod schemas accordingly.
2. Implement soft delete end-to-end (schema + repo filters + API behavior).
3. Remove service internals access in progress endpoint; expose proper service method.
4. Add transactions to multi-write operations.

### P1
1. Ensure missing indexes/constraints migrations are applied (and reflect in Drizzle schema for visibility).
2. Add join/batch profile lookup for tasks to remove N+1 UI fetches.
3. Enforce task transition rules.

### P2
1. Add test suite for project/task flows.
2. Improve UX: error boundary + skeletons + optimistic updates.

