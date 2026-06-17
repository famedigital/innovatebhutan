-- Migration: 0008_google_oauth_tokens.sql
-- Description: Add Google OAuth token storage to employees table
-- Created: 2026-06-01
-- Purpose: Fix "Invalid Refresh Token: Refresh Token Not Found" error

-- ============================================
-- ADD GOOGLE OAUTH TOKEN FIELDS TO EMPLOYEES TABLE
-- ============================================

-- Add OAuth token fields to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS auth_id TEXT UNIQUE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS google_access_token TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS google_refresh_token TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS google_token_expiry TIMESTAMP;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS google_connected_at TIMESTAMP;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS google_scopes JSONB;

-- Create index for efficient auth lookups
CREATE INDEX IF NOT EXISTS idx_employees_auth_id ON employees(auth_id);

-- Add comments for documentation
COMMENT ON COLUMN employees.auth_id IS 'Supabase Auth user ID reference for OAuth linking';
COMMENT ON COLUMN employees.google_access_token IS 'Google OAuth access token (short-lived, ~1 hour)';
COMMENT ON COLUMN employees.google_refresh_token IS 'Google OAuth refresh token (long-lived, used to get new access tokens)';
COMMENT ON COLUMN employees.google_token_expiry IS 'Expiration time of current Google access token';
COMMENT ON COLUMN employees.google_connected_at IS 'Timestamp when Google OAuth connection was established';
COMMENT ON COLUMN employees.google_scopes IS 'JSON array of granted OAuth scopes (e.g., ["drive", "drive.file", "drive.metadata"])';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- To verify the migration ran successfully:
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'employees'
-- AND column_name IN ('auth_id', 'google_access_token', 'google_refresh_token', 'google_token_expiry', 'google_connected_at', 'google_scopes')
-- ORDER BY column_name;

-- To verify the index was created:
-- SELECT indexname, tablename
-- FROM pg_indexes
-- WHERE tablename = 'employees'
-- AND indexname = 'idx_employees_auth_id';