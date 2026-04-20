-- Migration: Projects Soft Delete Implementation
-- Adds soft delete capability to projects and project_tasks tables
-- Date: 2026-04-20

-- ============================================
-- ADD DELETED_AT COLUMNS
-- ============================================

-- Add deleted_at column to projects table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'projects' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE "projects" ADD COLUMN "deleted_at" timestamp;
        RAISE NOTICE 'Added projects.deleted_at column';
    ELSE
        RAISE NOTICE 'projects.deleted_at column already exists';
    END IF;
END $$;

-- Add deleted_at column to project_tasks table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'project_tasks' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE "project_tasks" ADD COLUMN "deleted_at" timestamp;
        RAISE NOTICE 'Added project_tasks.deleted_at column';
    ELSE
        RAISE NOTICE 'project_tasks.deleted_at column already exists';
    END IF;
END $$;

-- ============================================
-- CREATE INDEXES FOR SOFT DELETE QUERIES
-- ============================================

-- Index for soft delete queries on projects
-- Optimizes queries filtering for non-deleted projects
CREATE INDEX IF NOT EXISTS "idx_projects_deleted_at" ON "projects" ("deleted_at");

-- Index for soft delete queries on project_tasks
-- Optimizes queries filtering for non-deleted tasks
CREATE INDEX IF NOT EXISTS "idx_project_tasks_deleted_at" ON "project_tasks" ("deleted_at");

-- ============================================
-- UPDATE DEFAULT QUERIES TO EXCLUDE DELETED
-- ============================================

-- Create a view that excludes deleted records (optional convenience)
-- This allows applications to query projects_view instead of projects
CREATE OR REPLACE VIEW projects_active AS
SELECT * FROM projects
WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW project_tasks_active AS
SELECT * FROM project_tasks
WHERE deleted_at IS NULL;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify columns exist
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('projects', 'project_tasks')
    AND column_name = 'deleted_at';

-- Verify indexes exist
SELECT
    tablename,
    indexname
FROM pg_indexes
WHERE indexname IN ('idx_projects_deleted_at', 'idx_project_tasks_deleted_at');

-- ============================================
-- USAGE NOTES
-- ============================================

-- To soft delete a project:
-- UPDATE "projects" SET "deleted_at" = NOW() WHERE id = ?;

-- To restore a soft deleted project:
-- UPDATE "projects" SET "deleted_at" = NULL WHERE id = ?;

-- To permanently delete old soft-deleted records (run periodically):
-- DELETE FROM "projects" WHERE "deleted_at" < NOW() - INTERVAL '1 year';

-- Query for active projects (non-deleted):
-- SELECT * FROM projects WHERE deleted_at IS NULL;
-- -- or use the view:
-- SELECT * FROM projects_active;
