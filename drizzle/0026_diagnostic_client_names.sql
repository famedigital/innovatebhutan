-- Diagnostic: Check AMC and Client data
SELECT
  a.id,
  a.contract_number,
  a.client_id,
  c.name as client_name,
  c.whatsapp,
  a.start_date,
  a.end_date,
  a.amount
FROM "amcs" a
LEFT JOIN "clients" c ON a.client_id = c.id
ORDER BY a.created_at DESC
LIMIT 5;

-- Check if clients actually exist
SELECT id, name, whatsapp FROM "clients" LIMIT 5;

-- Check AMCs without client names
SELECT id, contract_number, client_id FROM "amcs" LIMIT 5;