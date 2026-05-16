-- Migration: 0011_profiles_schema_fix.sql
-- Purpose: Add missing columns to the profiles table
-- Date: 2026-04-21
-- Context: The profiles table needs all columns defined in db/schema.ts for proper user/role management

-- Add full_name column for user's display name
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name varchar(255);

-- Add role column with default value 'CLIENT' for RBAC
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role varchar(50) DEFAULT 'CLIENT';

-- Add created_at timestamp for record tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now();

-- Add comments for documentation
COMMENT ON COLUMN profiles.full_name IS 'Display name of the user (e.g., John Doe)';
COMMENT ON COLUMN profiles.role IS 'User role for RBAC: ADMIN, STAFF, or CLIENT (default: CLIENT)';
COMMENT ON COLUMN profiles.created_at IS 'Timestamp when the profile record was created';
