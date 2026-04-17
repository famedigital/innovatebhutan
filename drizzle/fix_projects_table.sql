-- Fix projects table structure
-- Run this to fix the missing service_id column

-- Check current structure of projects table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- Add missing columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS service_id integer;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_id integer NOT NULL DEFAULT 1;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS name varchar(255) NOT NULL DEFAULT 'Default Project';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status varchar(50) DEFAULT 'planning';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS lead_id integer;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date timestamp;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date timestamp;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now();
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'projects'
ORDER BY ordinal_position;

-- Success message
SELECT '✅ projects table columns added!' as status;