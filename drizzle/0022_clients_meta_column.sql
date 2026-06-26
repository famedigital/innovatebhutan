-- Migration: Add meta column to clients table
-- This adds a JSONB column for storing flexible client metadata like yearsWithUs and totalPaid

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clients' AND column_name = 'meta'
    ) THEN
        ALTER TABLE "clients" ADD COLUMN "meta" jsonb;
    END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN "clients"."meta" IS 'Flexible JSON storage for client metadata like yearsWithUs, totalPaid, custom fields, etc.';

-- Create index for faster queries on meta data (optional, for GIN index on JSONB)
CREATE INDEX IF NOT EXISTS "idx_clients_meta" ON "clients" USING GIN ("meta");

-- Verify the migration
SELECT
    'meta column added to clients table' as status,
    column_name,
    data_type
FROM
    information_schema.columns
WHERE
    table_name = 'clients' AND column_name = 'meta';
