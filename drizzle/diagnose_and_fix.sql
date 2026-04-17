-- Diagnostic and Fix Script for Migration Conflicts
-- This script will help us understand the current state and fix it

-- Step 1: Check what columns currently exist in the audit_logs table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;

-- Step 2: Check if audit_logs table has any data
SELECT COUNT(*) as row_count FROM audit_logs;

-- Step 3: Show the current structure of audit_logs table
\d audit_logs;

-- Step 4: Fix the audit_logs table structure
-- First, drop any existing foreign key constraints on operator_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'audit_logs_operator_id_profiles_id_fk'
    ) THEN
        ALTER TABLE audit_logs DROP CONSTRAINT audit_logs_operator_id_profiles_id_fk;
    END IF;
END $$;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Check and add operator_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_logs' AND column_name = 'operator_id'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN operator_id integer;
    END IF;

    -- Check and add action column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_logs' AND column_name = 'action'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN action varchar(100) NOT NULL DEFAULT 'CREATE';
    END IF;

    -- Check and add entity_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_logs' AND column_name = 'entity_type'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN entity_type varchar(50) NOT NULL DEFAULT 'UNKNOWN';
    END IF;

    -- Check and add entity_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_logs' AND column_name = 'entity_id'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN entity_id integer;
    END IF;

    -- Check and add details column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_logs' AND column_name = 'details'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN details jsonb;
    END IF;

    -- Check and add created_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_logs' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN created_at timestamp DEFAULT now();
    END IF;
END $$;

-- Step 5: Now create the foreign key constraint
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_operator_id_profiles_id_fk
FOREIGN KEY (operator_id) REFERENCES profiles(id) ON DELETE no action ON UPDATE no action;

-- Step 6: Verify the fixed structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;

-- Success message
SELECT 'Migration fix applied successfully!' as status;