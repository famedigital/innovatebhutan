-- Diagnostic script to understand current database state
-- Run this first to see what we're working with

-- Check all current tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check audit_logs structure specifically
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;

-- Check if there are any rows in audit_logs
SELECT COUNT(*) as audit_logs_count FROM audit_logs;

-- Check what other migration 0002 tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'business_amenities', 'business_categories', 'business_hours',
    'business_reviews', 'businesses', 'locations', 'notifications',
    'project_tasks', 'projects', 'ticket_messages'
)
ORDER BY table_name;