-- Diagnostic: Check current AMC table structure
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

-- Check if there's any data in the AMC table
SELECT COUNT(*) as total_amcs FROM "amcs";

-- If no AMCs exist, let's recreate the table with proper schema
-- This will only run if the table is empty to avoid data loss
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM "amcs") = 0 THEN
        -- Drop existing incomplete table
        DROP TABLE IF EXISTS "amcs" CASCADE;

        -- Create complete AMC table with all required columns
        CREATE TABLE "amcs" (
            "id" serial PRIMARY KEY NOT NULL,
            "public_id" varchar(50) UNIQUE,
            "client_id" integer,
            "service_id" integer,
            "contract_number" varchar(100),
            "start_date" timestamp NOT NULL,
            "end_date" timestamp NOT NULL,
            "amount" numeric(12, 2),
            "hardware_details" jsonb,
            "services_included" jsonb,
            "renewed_from" integer,
            "renewed_to" integer,
            "status" varchar(50) DEFAULT 'active',
            "notes" text,
            "created_at" timestamp DEFAULT now(),
            "updated_at" timestamp DEFAULT now()
        );

        -- Create indexes
        CREATE INDEX "idx_amcs_client" ON "amcs" ("client_id");
        CREATE INDEX "idx_amcs_service" ON "amcs" ("service_id");
        CREATE INDEX "idx_amcs_status" ON "amcs" ("status");
        CREATE INDEX "idx_amcs_end_date" ON "amcs" ("end_date");
        CREATE INDEX "idx_amcs_public" ON "amcs" ("public_id");

        -- Add foreign key constraints
        ALTER TABLE "amcs" ADD CONSTRAINT "amcs_client_id_clients_id_fk"
        FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE no action ON UPDATE no action;

        ALTER TABLE "amcs" ADD CONSTRAINT "amcs_service_id_services_id_fk"
        FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE no action ON UPDATE no action;

        ALTER TABLE "amcs" ADD CONSTRAINT "amcs_renewed_from_amcs_id_fk"
        FOREIGN KEY ("renewed_from") REFERENCES "amcs"("id") ON DELETE no action ON UPDATE no action;

        ALTER TABLE "amcs" ADD CONSTRAINT "amcs_renewed_to_amcs_id_fk"
        FOREIGN KEY ("renewed_to") REFERENCES "amcs"("id") ON DELETE no action ON UPDATE no action;

        RAISE NOTICE 'AMC table has been recreated with complete schema';
    ELSE
        RAISE NOTICE 'AMC table has data, skipping recreation. Please use selective column updates.';
    END IF;
END $$;

-- If table has data, selectively add missing columns
DO $$
BEGIN
    -- Add start_date if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'start_date'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "start_date" timestamp NOT NULL DEFAULT now();
    END IF;

    -- Add end_date if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'end_date'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "end_date" timestamp NOT NULL DEFAULT (now() + interval '1 year');
    END IF;

    -- Add amount if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'amount'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "amount" numeric(12, 2);
    END IF;

    -- Add other missing columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'public_id'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "public_id" varchar(50);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'amcs' AND column_name = 'contract_number'
    ) THEN
        ALTER TABLE "amcs" ADD COLUMN "contract_number" varchar(100);
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

-- Verify final structure
SELECT
    'Final AMC table structure' as info,
    column_name,
    data_type,
    is_nullable
FROM
    information_schema.columns
WHERE
    table_name = 'amcs'
ORDER BY
    ordinal_position;
