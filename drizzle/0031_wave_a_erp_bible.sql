-- Wave A (ERP bible): capabilities + project commercial fields
-- Safe to re-run (IF NOT EXISTS / additive)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS capabilities jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN profiles.capabilities IS
  'Capability flags e.g. ["see_money","cancel_project","write_off","provision_users","adjust_stock"]. ADMIN/SUPERADMIN always get see_money.';

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS product_key varchar(50);

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS money_meta jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN projects.money_meta IS
  'Commercial pipeline: quotedAmount, advance, balance, writeOff, holdReason, cancelReason, invoiceId, freeSupportDays';

COMMENT ON COLUMN projects.status IS
  'needs_quote|quoted|demo|advance_paid|in_progress|testing|done|on_hold|cancelled (legacy planning/active/complete accepted)';

-- Map legacy statuses toward bible stages (idempotent-ish)
UPDATE projects SET status = 'quoted' WHERE status = 'planning';
UPDATE projects SET status = 'in_progress' WHERE status = 'active';
UPDATE projects SET status = 'done' WHERE status = 'complete';

CREATE INDEX IF NOT EXISTS idx_projects_product_key ON projects(product_key);
CREATE INDEX IF NOT EXISTS idx_profiles_capabilities ON profiles USING gin (capabilities);
