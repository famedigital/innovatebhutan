-- Migration: AMC Schema Enhancement
-- Adds support for contract lifecycle management, renewal tracking, and service linking
-- Based on Backend Audit Report recommendations for HIGH PRIORITY AMC module

-- Add new columns to amcs table (only if they don't exist)
DO $$
BEGIN
    -- Add columns that don't exist yet
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'public_id'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "public_id" varchar(50);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'service_id'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "service_id" integer;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'contract_number'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "contract_number" varchar(100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'end_date'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "end_date" timestamp;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'amount'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "amount" numeric(12, 2);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'services_included'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "services_included" jsonb;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'renewed_from'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "renewed_from" integer;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'renewed_to'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "renewed_to" integer;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'notes'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "notes" text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "updated_at" timestamp DEFAULT now();
    END IF;
END $$;

-- Copy existing expiry_date values to end_date if end_date is null
UPDATE "amcs" SET "end_date" = "expiry_date" WHERE "end_date" IS NULL AND "expiry_date" IS NOT NULL;

-- Create indexes (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_amcs_client') THEN
        CREATE INDEX "idx_amcs_client" ON "amcs" USING btree ("client_id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_amcs_service') THEN
        CREATE INDEX "idx_amcs_service" ON "amcs" USING btree ("service_id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_amcs_status') THEN
        CREATE INDEX "idx_amcs_status" ON "amcs" USING btree ("status");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_amcs_end_date') THEN
        CREATE INDEX "idx_amcs_end_date" ON "amcs" USING btree ("end_date");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_amcs_public') THEN
        CREATE INDEX "idx_amcs_public" ON "amcs" USING btree ("public_id");
    END IF;
END $$;

-- Add unique constraint for public_id (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'amcs_public_id_unique'
    ) THEN
        ALTER TABLE "amcs" ADD CONSTRAINT "amcs_public_id_unique" UNIQUE("public_id");
    END IF;
END $$;

-- Add foreign key constraint for service_id (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'amcs_service_id_services_id_fk'
    ) THEN
        ALTER TABLE "amcs" ADD CONSTRAINT "amcs_service_id_services_id_fk"
        FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE no action ON UPDATE no action;
    END IF;
END $$;
