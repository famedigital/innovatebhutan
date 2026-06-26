-- DIAGNOSTIC: Check what's in your AMC table
SELECT * FROM "amcs" LIMIT 5;

-- Check column names
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'amcs'
ORDER BY ordinal_position;

-- Try to identify the issue - check if there's data but with wrong column structure
SELECT
    id,
    client_id,
    contract_number,
    start_date,
    end_date,
    amount,
    status,
    created_at
FROM "amcs"
LIMIT 5;

-- This will help us see what the actual structure is and fix the issue
