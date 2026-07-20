-- Wave B: ticket SLA persistence + billable
ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS sla_due_at timestamp;

ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS sla_breached_at timestamp;

ALTER TABLE tickets
  ADD COLUMN IF NOT EXISTS billable boolean DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_tickets_sla_due_at ON tickets(sla_due_at);
COMMENT ON COLUMN tickets.sla_due_at IS 'Deadline from priority: high 4h, medium 24h, low 72h';
COMMENT ON COLUMN tickets.billable IS 'Non-AMC support may be charged';
