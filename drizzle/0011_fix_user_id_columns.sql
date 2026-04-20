-- Migration: Fix user ID columns in Projects and Project_Tasks
-- Changes lead_id and assigned_to from integer (profiles.id) to text (profiles.user_id / Supabase Auth UUID)
-- Date: 2026-04-20

-- ============================================
-- STEP 1: ADD NEW TEXT COLUMNS
-- ============================================

-- Add new text columns to projects table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'lead_id_new'
    ) THEN
        ALTER TABLE "projects" ADD COLUMN "lead_id_new" text;
        RAISE NOTICE 'Added projects.lead_id_new column';
    ELSE
        RAISE NOTICE 'projects.lead_id_new column already exists';
    END IF;
END $$;

-- Add new text columns to project_tasks table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'project_tasks' AND column_name = 'assigned_to_new'
    ) THEN
        ALTER TABLE "project_tasks" ADD COLUMN "assigned_to_new" text;
        RAISE NOTICE 'Added project_tasks.assigned_to_new column';
    ELSE
        RAISE NOTICE 'project_tasks.assigned_to_new column already exists';
    END IF;
END $$;

-- ============================================
-- STEP 2: MIGRATE DATA FROM INTEGER TO TEXT
-- ============================================

-- Migrate projects.lead_id (integer profiles.id) -> lead_id_new (text profiles.user_id)
-- For rows where lead_id references a valid profile, copy the user_id
UPDATE "projects"
SET "lead_id_new" = p.user_id
FROM "profiles" p
WHERE "projects"."lead_id" = p.id
  AND "projects"."lead_id_new" IS NULL;

-- Migrate project_tasks.assigned_to (integer profiles.id) -> assigned_to_new (text profiles.user_id)
UPDATE "project_tasks"
SET "assigned_to_new" = p.user_id
FROM "profiles" p
WHERE "project_tasks"."assigned_to" = p.id
  AND "project_tasks"."assigned_to_new" IS NULL;

-- ============================================
-- STEP 3: DROP OLD COLUMNS AND CONSTRAINTS
-- ============================================

-- Drop foreign key constraint on projects.lead_id if exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'projects' AND constraint_name = 'projects_lead_id_fkey'
    ) THEN
        ALTER TABLE "projects" DROP CONSTRAINT "projects_lead_id_fkey";
        RAISE NOTICE 'Dropped projects_lead_id_fkey constraint';
    END IF;
END $$;

-- Drop foreign key constraint on project_tasks.assigned_to if exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'project_tasks' AND constraint_name = 'project_tasks_assigned_to_fkey'
    ) THEN
        ALTER TABLE "project_tasks" DROP CONSTRAINT "project_tasks_assigned_to_fkey";
        RAISE NOTICE 'Dropped project_tasks_assigned_to_fkey constraint';
    END IF;
END $$;

-- Drop old columns
ALTER TABLE "projects" DROP COLUMN IF EXISTS "lead_id";
ALTER TABLE "project_tasks" DROP COLUMN IF EXISTS "assigned_to";

-- ============================================
-- STEP 4: RENAME NEW COLUMNS TO ORIGINAL NAMES
-- ============================================

ALTER TABLE "projects" RENAME COLUMN "lead_id_new" TO "lead_id";
ALTER TABLE "project_tasks" RENAME COLUMN "assigned_to_new" TO "assigned_to";

-- ============================================
-- STEP 5: ADD COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN "projects"."lead_id" IS 'References profiles.user_id (Supabase Auth UUID)';
COMMENT ON COLUMN "project_tasks"."assigned_to" IS 'References profiles.user_id (Supabase Auth UUID)';

-- ============================================
-- STEP 6: CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Create index on lead_id for filtering
CREATE INDEX IF NOT EXISTS "idx_projects_lead_id" ON "projects" ("lead_id");

-- Create index on assigned_to for filtering
CREATE INDEX IF NOT EXISTS "idx_project_tasks_assigned_to" ON "project_tasks" ("assigned_to");

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify the columns are now text type
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('projects', 'project_tasks')
    AND column_name IN ('lead_id', 'assigned_to');

-- Verify indexes exist
SELECT
    tablename,
    indexname
FROM pg_indexes
WHERE indexname IN ('idx_projects_lead_id', 'idx_project_tasks_assigned_to');

-- Show sample data to verify migration worked
SELECT
    p.id,
    p."lead_id",
    p.name,
    pr.user_id as original_profile_user_id,
    pr.full_name as lead_name
FROM "projects" p
LEFT JOIN "profiles" pr ON p."lead_id" = pr.user_id
LIMIT 5;

SELECT
    pt.id,
    pt."assigned_to",
    pt.title,
    pr.user_id as original_profile_user_id,
    pr.full_name as assignee_name
FROM "project_tasks" pt
LEFT JOIN "profiles" pr ON pt."assigned_to" = pr.user_id
LIMIT 5;

-- ============================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================

-- To rollback this migration:
-- 1. Add back integer columns: ALTER TABLE "projects" ADD COLUMN "lead_id_old" integer;
-- 2. Migrate data back using the mapping table if you saved it
-- 3. Drop constraints and rename columns back
-- 4. Restore foreign key constraints

-- Note: This migration assumes that all lead_id and assigned_to values
-- had valid corresponding profiles entries. If there were orphaned references,
-- those values will be NULL after this migration.
