-- Migration: Project Management Module Enhancements
-- Adds membership, milestones, comments, checklists, and activity feed
-- Date: 2026-04-20

-- ============================================
-- PROJECT MEMBERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "project_members" (
  "id" serial PRIMARY KEY,
  "project_id" integer NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL,
  "role" varchar(50) NOT NULL DEFAULT 'member', -- owner, lead, member, viewer, client_viewer
  "joined_at" timestamp DEFAULT now(),
  CONSTRAINT "project_members_unique" UNIQUE ("project_id", "user_id")
);

-- Indexes for project_members
CREATE INDEX IF NOT EXISTS "idx_project_members_project_user" ON "project_members" ("project_id", "user_id");
CREATE INDEX IF NOT EXISTS "idx_project_members_user" ON "project_members" ("user_id");

-- ============================================
-- PROJECT MILESTONES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "project_milestones" (
  "id" serial PRIMARY KEY,
  "project_id" integer NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "name" varchar(255) NOT NULL,
  "description" text,
  "status" varchar(50) DEFAULT 'pending', -- pending, in_progress, complete, cancelled
  "due_date" timestamp,
  "completed_at" timestamp,
  "position" integer DEFAULT 0,
  "deleted_at" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Indexes for milestones
CREATE INDEX IF NOT EXISTS "idx_milestones_project" ON "project_milestones" ("project_id");
CREATE INDEX IF NOT EXISTS "idx_milestones_status" ON "project_milestones" ("status");
CREATE INDEX IF NOT EXISTS "idx_milestones_due_date" ON "project_milestones" ("due_date");
CREATE INDEX IF NOT EXISTS "idx_milestones_deleted_at" ON "project_milestones" ("deleted_at");

-- ============================================
-- TASK COMMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "task_comments" (
  "id" serial PRIMARY KEY,
  "task_id" integer NOT NULL REFERENCES "project_tasks"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL,
  "content" text NOT NULL,
  "parent_id" integer REFERENCES "task_comments"("id") ON DELETE CASCADE,
  "deleted_at" timestamp,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Indexes for task_comments
CREATE INDEX IF NOT EXISTS "idx_task_comments_task" ON "task_comments" ("task_id");
CREATE INDEX IF NOT EXISTS "idx_task_comments_user" ON "task_comments" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_task_comments_parent" ON "task_comments" ("parent_id");
CREATE INDEX IF NOT EXISTS "idx_task_comments_deleted_at" ON "task_comments" ("deleted_at");

-- ============================================
-- TASK CHECKLIST ITEMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "task_checklist_items" (
  "id" serial PRIMARY KEY,
  "task_id" integer NOT NULL REFERENCES "project_tasks"("id") ON DELETE CASCADE,
  "title" varchar(255) NOT NULL,
  "is_completed" boolean DEFAULT false,
  "position" integer DEFAULT 0,
  "deleted_at" timestamp,
  "created_at" timestamp DEFAULT now(),
  "completed_at" timestamp
);

-- Indexes for checklist items
CREATE INDEX IF NOT EXISTS "idx_checklist_items_task" ON "task_checklist_items" ("task_id");
CREATE INDEX IF NOT EXISTS "idx_checklist_items_deleted_at" ON "task_checklist_items" ("deleted_at");

-- ============================================
-- ACTIVITY EVENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "activity_events" (
  "id" serial PRIMARY KEY,
  "project_id" integer REFERENCES "projects"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL,
  "event_type" varchar(50) NOT NULL, -- task_created, task_updated, task_completed, milestone_completed, comment_added, etc.
  "entity_type" varchar(50), -- project, task, milestone, comment
  "entity_id" integer,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now()
);

-- Indexes for activity_events
CREATE INDEX IF NOT EXISTS "idx_activity_events_project" ON "activity_events" ("project_id");
CREATE INDEX IF NOT EXISTS "idx_activity_events_user" ON "activity_events" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_activity_events_created" ON "activity_events" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_activity_events_entity_type" ON "activity_events" ("entity_type", "entity_id");

-- ============================================
-- ENHANCE NOTIFICATIONS TABLE
-- ============================================

-- Add new columns to notifications if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'category'
    ) THEN
        ALTER TABLE "notifications" ADD COLUMN "category" varchar(50);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'entity_type'
    ) THEN
        ALTER TABLE "notifications" ADD COLUMN "entity_type" varchar(50);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications' AND column_name = 'entity_id'
    ) THEN
        ALTER TABLE "notifications" ADD COLUMN "entity_id" integer;
    END IF;
END $$;

-- Add indexes for notifications
CREATE INDEX IF NOT EXISTS "idx_notifications_user" ON "notifications" ("user_id");
CREATE INDEX IF NOT EXISTS "idx_notifications_read" ON "notifications" ("read");
CREATE INDEX IF NOT EXISTS "idx_notifications_entity_type" ON "notifications" ("entity_type", "entity_id");
CREATE INDEX IF NOT EXISTS "idx_notifications_created" ON "notifications" ("created_at" DESC);

-- ============================================
-- ENHANCE PROJECT_TASKS WITH POSITION
-- ============================================

-- Add position column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'project_tasks' AND column_name = 'position'
    ) THEN
        ALTER TABLE "project_tasks" ADD COLUMN "position" integer DEFAULT 0;
    END IF;
END $$;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE "project_members" IS 'Per-project access control and membership';
COMMENT ON COLUMN "project_members"."role" IS 'Roles: owner (full access), lead (manage tasks), member (edit tasks), viewer (read-only), client_viewer (limited read-only)';

COMMENT ON TABLE "project_milestones" IS 'Project phases/gates for tracking';
COMMENT ON COLUMN "project_milestones"."status" IS 'Status: pending, in_progress, complete, cancelled';

COMMENT ON TABLE "task_comments" IS 'Threaded comments on tasks';
COMMENT ON COLUMN "task_comments"."parent_id" IS 'For threaded/nested replies';

COMMENT ON TABLE "task_checklist_items" IS 'Checklist items within tasks (subtasks alternative)';

COMMENT ON TABLE "activity_events" IS 'Activity feed for project-related events (UX-focused, separate from audit_logs)';
COMMENT ON COLUMN "activity_events"."event_type" IS 'Event types: task_created, task_updated, task_completed, milestone_completed, comment_added, member_added, status_changed, etc.';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify all tables were created
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('project_members', 'project_milestones', 'task_comments', 'task_checklist_items', 'activity_events')
ORDER BY table_name, ordinal_position;

-- Verify indexes
SELECT
    tablename,
    indexname
FROM pg_indexes
WHERE tablename IN ('project_members', 'project_milestones', 'task_comments', 'task_checklist_items', 'activity_events', 'notifications')
ORDER BY tablename, indexname;
