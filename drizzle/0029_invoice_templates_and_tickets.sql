-- Migration: invoice_templates + ticket call-centre fields + invoice template snapshot

-- invoice_templates
CREATE TABLE IF NOT EXISTS "invoice_templates" (
  "id" serial PRIMARY KEY NOT NULL,
  "product_key" varchar(50) NOT NULL,
  "name" varchar(255) NOT NULL,
  "version" integer NOT NULL DEFAULT 1,
  "is_active" boolean DEFAULT false,
  "design" jsonb NOT NULL,
  "created_by" text,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_invoice_templates_product" ON "invoice_templates" ("product_key");
CREATE INDEX IF NOT EXISTS "idx_invoice_templates_active" ON "invoice_templates" ("product_key", "is_active");

-- invoices: template snapshot + pdf
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='template_id') THEN
    ALTER TABLE "invoices" ADD COLUMN "template_id" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='template_snapshot') THEN
    ALTER TABLE "invoices" ADD COLUMN "template_snapshot" jsonb;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='pdf_url') THEN
    ALTER TABLE "invoices" ADD COLUMN "pdf_url" text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='product_key') THEN
    ALTER TABLE "invoices" ADD COLUMN "product_key" varchar(50);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "idx_invoices_product" ON "invoices" ("product_key");

-- tickets: call-centre fields
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='public_id') THEN
    ALTER TABLE "tickets" ADD COLUMN "public_id" varchar(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='product_key') THEN
    ALTER TABLE "tickets" ADD COLUMN "product_key" varchar(50);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='source') THEN
    ALTER TABLE "tickets" ADD COLUMN "source" varchar(50) DEFAULT 'call_centre';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='acknowledged_at') THEN
    ALTER TABLE "tickets" ADD COLUMN "acknowledged_at" timestamp;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='acknowledged_by') THEN
    ALTER TABLE "tickets" ADD COLUMN "acknowledged_by" integer;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='group_notified_at') THEN
    ALTER TABLE "tickets" ADD COLUMN "group_notified_at" timestamp;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tickets' AND column_name='resolve_notified_at') THEN
    ALTER TABLE "tickets" ADD COLUMN "resolve_notified_at" timestamp;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "idx_tickets_public" ON "tickets" ("public_id");
CREATE INDEX IF NOT EXISTS "idx_tickets_product" ON "tickets" ("product_key");
CREATE INDEX IF NOT EXISTS "idx_tickets_status" ON "tickets" ("status");
CREATE INDEX IF NOT EXISTS "idx_tickets_assigned" ON "tickets" ("assigned_to");
