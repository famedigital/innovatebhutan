# Migration: Invoice Schema Enhancement

**Purpose**: Aligns `invoices` table with UI expectations and N-Tier Architecture

**Date**: 2026-04-19

## Changes

### New Columns Added
| Column | Type | Description |
|--------|------|-------------|
| `invoice_number` | varchar(50) | Human-readable invoice identifier (unique) |
| `issue_date` | timestamp | When invoice was issued |
| `items` | jsonb | Line items stored as JSON |
| `notes` | text | Additional notes |
| `updated_at` | timestamp | Last modification timestamp |

### Column Renames
- `amount` → `total` (numeric(15, 2))

### Constraints Added
- Unique constraint on `invoice_number`
- NOT NULL on: `invoice_number`, `issue_date`, `total`, `due_date`

### Indexes Created
- `idx_invoices_client` on `client_id`
- `idx_invoices_status` on `status`
- `idx_invoices_number` on `invoice_number`
- `idx_invoices_due` on `due_date`

## SQL Migration

```sql
-- Migration: Invoice Schema Enhancement
-- Aligns invoices table with UI expectations and N-Tier Architecture
-- Adds: invoice_number, issue_date, items, notes, updated_at
-- Renames: amount -> total

-- First, let's see what we're working with
-- Run this diagnostic query first if needed:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'invoices';

-- Add new columns to invoices table (only if they don't exist)
DO $$
BEGIN
    -- Add invoice_number column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'invoice_number'
    ) THEN
        ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "invoice_number" varchar(50);
        RAISE NOTICE 'Added invoice_number column';
    ELSE
        RAISE NOTICE 'invoice_number column already exists';
    END IF;

    -- Add issue_date column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'issue_date'
    ) THEN
        ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "issue_date" timestamp DEFAULT now();
        RAISE NOTICE 'Added issue_date column';
    ELSE
        RAISE NOTICE 'issue_date column already exists';
    END IF;

    -- Add items column (jsonb for line items)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'items'
    ) THEN
        ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "items" jsonb;
        RAISE NOTICE 'Added items column';
    ELSE
        RAISE NOTICE 'items column already exists';
    END IF;

    -- Add notes column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'notes'
    ) THEN
        ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "notes" text;
        RAISE NOTICE 'Added notes column';
    ELSE
        RAISE NOTICE 'notes column already exists';
    END IF;

    -- Add updated_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now();
        RAISE NOTICE 'Added updated_at column';
    ELSE
        RAISE NOTICE 'updated_at column already exists';
    END IF;

    -- Rename amount column to total if it exists and total doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'amount'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'total'
    ) THEN
        ALTER TABLE "invoices" RENAME COLUMN "amount" TO "total";
        RAISE NOTICE 'Renamed amount to total';
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'total'
    ) THEN
        ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "total" numeric(15, 2) DEFAULT 0;
        RAISE NOTICE 'Added total column';
    ELSE
        RAISE NOTICE 'total column already exists';
    END IF;
END $$;

-- Create indexes (only if they don't exist) - using IF NOT EXISTS syntax
CREATE INDEX IF NOT EXISTS "idx_invoices_client" ON "invoices" ("client_id");
CREATE INDEX IF NOT EXISTS "idx_invoices_status" ON "invoices" ("status");
CREATE INDEX IF NOT EXISTS "idx_invoices_number" ON "invoices" ("invoice_number");

-- Due date index - only if column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'due_date'
    ) THEN
        CREATE INDEX IF NOT EXISTS "idx_invoices_due" ON "invoices" ("due_date");
        RAISE NOTICE 'Created idx_invoices_due index';
    ELSE
        RAISE NOTICE 'due_date column does not exist, skipping index';
    END IF;
END $$;

-- Add unique constraint for invoice_number (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'invoices_invoice_number_unique'
    ) THEN
        -- Generate invoice numbers for existing records that don't have one
        UPDATE "invoices" SET "invoice_number" = 'INV-LEGACY-' || id::text
        WHERE "invoice_number" IS NULL OR "invoice_number" = '';

        -- Add the constraint
        ALTER TABLE "invoices" ADD CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number");
        RAISE NOTICE 'Added unique constraint for invoice_number';
    ELSE
        RAISE NOTICE 'invoice_number unique constraint already exists';
    END IF;
END $$;

-- Ensure due_date exists and is not null (if it doesn't exist, add it)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'due_date'
    ) THEN
        ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "due_date" timestamp DEFAULT now() + INTERVAL '30 days';
        RAISE NOTICE 'Added due_date column';

        -- Create the index now that the column exists
        CREATE INDEX IF NOT EXISTS "idx_invoices_due" ON "invoices" ("due_date");
        RAISE NOTICE 'Created idx_invoices_due index';
    END IF;
END $$;

-- Make due_date not null if it currently allows null
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'due_date' AND is_nullable = 'YES'
    ) THEN
        UPDATE "invoices" SET "due_date" = now() + INTERVAL '30 days' WHERE "due_date" IS NULL;
        ALTER TABLE "invoices" ALTER COLUMN "due_date" SET NOT NULL;
        RAISE NOTICE 'Made due_date NOT NULL';
    END IF;
END $$;

-- Make total not null if it currently allows null
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'total' AND is_nullable = 'YES'
    ) THEN
        UPDATE "invoices" SET "total" = '0' WHERE "total" IS NULL;
        ALTER TABLE "invoices" ALTER COLUMN "total" SET NOT NULL;
        RAISE NOTICE 'Made total NOT NULL';
    END IF;
END $$;

-- Make issue_date not null if it currently allows null
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'issue_date' AND is_nullable = 'YES'
    ) THEN
        UPDATE "invoices" SET "issue_date" = now() WHERE "issue_date" IS NULL;
        ALTER TABLE "invoices" ALTER COLUMN "issue_date" SET NOT NULL;
        RAISE NOTICE 'Made issue_date NOT NULL';
    END IF;
END $$;

-- Make invoice_number not null if it currently allows null
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'invoices' AND column_name = 'invoice_number' AND is_nullable = 'YES'
    ) THEN
        UPDATE "invoices" SET "invoice_number" = 'INV-LEGACY-' || id::text WHERE "invoice_number" IS NULL OR "invoice_number" = '';
        ALTER TABLE "invoices" ALTER COLUMN "invoice_number" SET NOT NULL;
        RAISE NOTICE 'Made invoice_number NOT NULL';
    END IF;
END $$;

-- Verify the migration
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'invoices'
ORDER BY ordinal_position;
```

## Post-Migration Schema

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | serial | NO | nextval() |
| client_id | integer | YES | - |
| order_id | integer | YES | - |
| invoice_number | varchar(50) | NO | - |
| total | numeric(15,2) | NO | 0 |
| issue_date | timestamp | NO | now() |
| due_date | timestamp | NO | now() + 30 days |
| items | jsonb | YES | - |
| notes | text | YES | - |
| status | varchar(50) | YES | 'unpaid' |
| created_at | timestamp | YES | now() |
| updated_at | timestamp | YES | now() |
