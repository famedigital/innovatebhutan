-- Step-by-step fix for audit_logs table
-- Run this first to fix the immediate issue

-- Check current structure of audit_logs
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'audit_logs'
ORDER BY ordinal_position;

-- Step 1: Add the missing operator_id column to audit_logs
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS operator_id integer;

-- Step 2: Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'audit_logs' AND column_name = 'operator_id';

-- Step 3: Create the foreign key constraint
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_operator_id_profiles_id_fk
FOREIGN KEY (operator_id) REFERENCES profiles(id) ON DELETE no action ON UPDATE no action;

-- Success message
SELECT '✅ audit_logs table fixed!' as status;