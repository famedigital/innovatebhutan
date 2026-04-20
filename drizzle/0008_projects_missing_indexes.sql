-- Migration: Projects Missing Indexes
-- Adds critical indexes for performance optimization on projects table
-- Date: 2026-04-20

-- ============================================
-- PROJECTS TABLE INDEXES
-- ============================================

-- Missing index on leadId (CRITICAL for performance)
-- This index is essential for queries filtering by lead/assigned user
CREATE INDEX IF NOT EXISTS "idx_projects_lead_id" ON "projects" ("lead_id");

-- Composite index for common queries (clientId + status)
-- Optimizes queries showing projects per client filtered by status
CREATE INDEX IF NOT EXISTS "idx_projects_client_status" ON "projects" ("client_id", "status");

-- Composite index for lead dashboards (leadId + status)
-- Optimizes lead dashboard queries showing active/pending projects
CREATE INDEX IF NOT EXISTS "idx_projects_lead_status" ON "projects" ("lead_id", "status");

-- Index for date range queries (using start_date and end_date)
-- Optimizes queries filtering by start_date and end_date ranges
CREATE INDEX IF NOT EXISTS "idx_projects_dates" ON "projects" ("start_date", "end_date");

-- ============================================
-- VERIFICATION
-- ============================================

-- List all indexes on projects table
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'projects'
ORDER BY indexname;

-- Expected output should include:
-- - idx_projects_client (existing)
-- - idx_projects_status (existing)
-- - idx_projects_public (existing)
-- - idx_projects_lead_id (NEW)
-- - idx_projects_client_status (NEW)
-- - idx_projects_lead_status (NEW)
-- - idx_projects_dates (NEW)
