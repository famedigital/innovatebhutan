-- Migration: Complete AMC Table Schema Update
-- This migration ensures the AMC table has all columns required by the current application schema
-- Run this in Supabase SQL Editor

-- First, let's check the current state and add missing columns
DO $$
BEGIN
    -- Add columns that don't exist yet

    -- public_id for external references
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'public_id'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "public_id" varchar(50);
    END IF;

    -- service_id for linking to services catalog
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'service_id'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "service_id" integer;
    END IF;

    -- contract_number for human-readable contract IDs
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'contract_number'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "contract_number" varchar(100);
    END IF;

    -- end_date (new name for expiry_date)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'end_date'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "end_date" timestamp;
    END IF;

    -- amount for contract value (CRITICAL - was missing)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'amount'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "amount" numeric(12, 2);
    END IF;

    -- services_included for JSON array of services
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'services_included'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "services_included" jsonb;
    END IF;

    -- renewed_from for tracking previous contract
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'renewed_from'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "renewed_from" integer;
    END IF;

    -- renewed_to for tracking next contract (renewal)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'renewed_to'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "renewed_to" integer;
    END IF;

    -- notes for additional information
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'notes'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "notes" text;
    END IF;

    -- updated_at for tracking modifications
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "updated_at" timestamp DEFAULT now();
    END IF;

END $$;

-- Migrate data from old columns to new ones (only if old column exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'expiry_date'
    ) THEN
        UPDATE "amcs" SET "end_date" = "expiry_date" WHERE "end_date" IS NULL AND "expiry_date" IS NOT NULL;
    END IF;
END $$;

-- Create indexes for better query performance
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_amcs_client') THEN
        CREATE INDEX "idx_amcs_client" ON "amcs" ("client_id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_amcs_service') THEN
        CREATE INDEX "idx_amcs_service" ON "amcs" ("service_id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_amcs_status') THEN
        CREATE INDEX "idx_amcs_status" ON "amcs" ("status");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_amcs_end_date') THEN
        CREATE INDEX "idx_amcs_end_date" ON "amcs" ("end_date");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_amcs_public') THEN
        CREATE INDEX "idx_amcs_public" ON "amcs" ("public_id");
    END IF;
END $$;

-- Add unique constraint for public_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'amcs_public_id_unique'
    ) THEN
        ALTER TABLE "amcs" ADD CONSTRAINT "amcs_public_id_unique" UNIQUE("public_id");
    END IF;
END $$;

-- Add foreign key constraint for service_id (only if services table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'services') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'amcs_service_id_services_id_fk'
        ) THEN
            ALTER TABLE "amcs" ADD CONSTRAINT "amcs_service_id_services_id_fk"
            FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE no action ON UPDATE no action;
        END IF;
    END IF;
END $$;

-- Add foreign key constraint for renewed_from (self-reference)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'amcs_renewed_from_amcs_id_fk'
    ) THEN
        ALTER TABLE "amcs" ADD CONSTRAINT "amcs_renewed_from_amcs_id_fk"
        FOREIGN KEY ("renewed_from") REFERENCES "amcs"("id") ON DELETE no action ON UPDATE no action;
    END IF;
END $$;

-- Add foreign key constraint for renewed_to (self-reference)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'amcs_renewed_to_amcs_id_fk'
    ) THEN
        ALTER TABLE "amcs" ADD CONSTRAINT "amcs_renewed_to_amcs_id_fk"
        FOREIGN KEY ("renewed_to") REFERENCES "amcs"("id") ON DELETE no action ON UPDATE no action;
    END IF;
END $$;

-- Verify the migration completed successfully
SELECT
    'AMC table migration completed' as status,
    COUNT(*) as total_amcs
FROM "amcs";

-- Show current columns in amcs table
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_name = 'amcs'
ORDER BY
    ordinal_position;
