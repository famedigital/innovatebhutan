-- Wave C: invite-only client portal
ALTER TABLE client_portal_access
  ADD COLUMN IF NOT EXISTS invite_email varchar(255);

ALTER TABLE client_portal_access
  ADD COLUMN IF NOT EXISTS invite_token varchar(64);

ALTER TABLE client_portal_access
  ADD COLUMN IF NOT EXISTS invite_expires_at timestamp;

ALTER TABLE client_portal_access
  ADD COLUMN IF NOT EXISTS auth_user_id text;

ALTER TABLE client_portal_access
  ADD COLUMN IF NOT EXISTS profile_id integer REFERENCES profiles(id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cpa_invite_token
  ON client_portal_access(invite_token) WHERE invite_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cpa_invite_email
  ON client_portal_access(invite_email);

CREATE INDEX IF NOT EXISTS idx_cpa_auth_user
  ON client_portal_access(auth_user_id);

CREATE TABLE IF NOT EXISTS portal_payment_proofs (
  id serial PRIMARY KEY,
  client_id integer NOT NULL REFERENCES clients(id),
  invoice_id integer REFERENCES invoices(id),
  method varchar(50) DEFAULT 'mbob',
  proof_url text NOT NULL,
  notes text,
  status varchar(50) DEFAULT 'submitted',
  submitted_by_profile_id integer REFERENCES profiles(id),
  created_at timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portal_proofs_client ON portal_payment_proofs(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_proofs_invoice ON portal_payment_proofs(invoice_id);

COMMENT ON COLUMN client_portal_access.invite_token IS 'One-time invite token for portal activation';
COMMENT ON TABLE portal_payment_proofs IS 'Client M-BoB/cheque payment screenshot submissions';
