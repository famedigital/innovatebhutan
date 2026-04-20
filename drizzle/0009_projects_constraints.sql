-- Migration: Projects Check Constraints
-- Adds data validation constraints to projects and project_tasks tables
-- Date: 2026-04-20

-- ============================================
-- PROJECTS TABLE CONSTRAINTS
-- ============================================

-- Ensure progress is between 0 and 100
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'projects_progress_check'
    ) THEN
        ALTER TABLE "projects" ADD CONSTRAINT "projects_progress_check"
        CHECK ("progress" >= 0 AND "progress" <= 100);
        RAISE NOTICE 'Added projects progress check constraint';
    ELSE
        RAISE NOTICE 'Projects progress check constraint already exists';
    END IF;
END $$;

-- Ensure valid status values for projects
-- Note: Default status in schema is 'planning'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'projects_status_check'
    ) THEN
        ALTER TABLE "projects" ADD CONSTRAINT "projects_status_check"
        CHECK ("status" IN ('planning', 'active', 'testing', 'complete', 'on_hold', 'cancelled'));
        RAISE NOTICE 'Added projects status check constraint';
    ELSE
        RAISE NOTICE 'Projects status check constraint already exists';
    END IF;
END $$;

-- ============================================
-- PROJECT_TASKS TABLE CONSTRAINTS
-- ============================================

-- Ensure valid status values for tasks
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'project_tasks_status_check'
    ) THEN
        ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_status_check"
        CHECK ("status" IN ('todo', 'in_progress', 'done', 'blocked'));
        RAISE NOTICE 'Added project_tasks status check constraint';
    ELSE
        RAISE NOTICE 'Project_tasks status check constraint already exists';
    END IF;
END $$;

-- Ensure valid priority values for tasks
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'project_tasks_priority_check'
    ) THEN
        ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_priority_check"
        CHECK ("priority" IN ('low', 'medium', 'high', 'urgent'));
        RAISE NOTICE 'Added project_tasks priority check constraint';
    ELSE
        RAISE NOTICE 'Project_tasks priority check constraint already exists';
    END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

-- List all check constraints on projects table
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'projects'::regclass
    AND contype = 'c'
ORDER BY conname;

-- List all check constraints on project_tasks table
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'project_tasks'::regclass
    AND contype = 'c'
ORDER BY conname;

-- Expected output for projects:
-- - projects_progress_check: CHECK ((progress >= 0 AND progress <= 100))
-- - projects_status_check: CHECK ((status = ANY (ARRAY['planning'::varchar ...

-- Expected output for project_tasks:
-- - project_tasks_status_check: CHECK ((status = ANY (ARRAY['todo'::varchar ...
-- - project_tasks_priority_check: CHECK ((priority = ANY (ARRAY['low'::varchar ...
