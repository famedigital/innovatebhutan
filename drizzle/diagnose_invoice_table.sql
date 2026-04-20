-- Diagnostic: Check current state of invoices table
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'invoices'
ORDER BY ordinal_position;
