-- Fix AMC column names to match schema expectations
-- This ensures all required columns exist with correct names

DO $$
BEGIN
    -- Ensure start_date column exists and is NOT NULL
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'start_date'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "start_date" timestamp NOT NULL DEFAULT now();
    END IF;

    -- Ensure end_date column exists and is NOT NULL
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'end_date'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "end_date" timestamp NOT NULL DEFAULT (now() + interval '1 year');
    END IF;

    -- Update any NULL end_date values
    UPDATE "amcs" SET "end_date" = "start_date" + interval '1 year'
    WHERE "end_date" IS NULL;

    -- Update any NULL start_date values
    UPDATE "amcs" SET "start_date" = "created_at"
    WHERE "start_date" IS NULL;
END $$;

-- Check what columns actually exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'amcs'
ORDER BY ordinal_position;

-- Show sample data to debug
SELECT
    id,
    client_id,
    contract_number,
    start_date,
    end_date,
    amount,
    status
FROM "amcs"
LIMIT 5;
