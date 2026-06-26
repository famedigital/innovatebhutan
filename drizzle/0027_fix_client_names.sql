-- Fix: Check and fix client_id mismatches in AMC table
-- This will help identify why client names are showing as undefined

-- First, let's see what we have
SELECT 'Current AMC data:' as info;
SELECT
  a.id as amc_id,
  a.contract_number,
  a.client_id,
  (SELECT name FROM clients WHERE id = a.client_id) as client_name_check,
  a.start_date,
  a.end_date,
  a.amount
FROM "amcs" a
ORDER BY a.id;

-- Check all clients
SELECT 'All clients:' as info;
SELECT id, name FROM "clients" ORDER BY id;

-- If there are AMCs with invalid client_ids, here's a fix to update them
-- Uncomment and modify the values below if needed:

-- UPDATE "amcs" SET client_id = 1 WHERE client_id IS NULL;
-- UPDATE "amcs" SET client_id = 2 WHERE id = 1;

-- Alternative: If you want to see which clients have names but aren't being matched
SELECT
  a.id,
  a.contract_number,
  a.client_id,
  c.name,
  c.whatsapp,
  a.start_date,
  a.end_date
FROM "amcs" a
LEFT JOIN "clients" c ON a.client_id = c.id
ORDER BY a.id;
