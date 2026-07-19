-- Migration: Add meta column to amcs for renewal pipeline / remittance tracking

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'meta'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "meta" jsonb;
    END IF;
END $$;

COMMENT ON COLUMN "amcs"."meta" IS 'Flexible JSON for AMC renewal pipeline, RanceLab remittance, and ops metadata';

CREATE INDEX IF NOT EXISTS "idx_amcs_meta" ON "amcs" USING GIN ("meta");
