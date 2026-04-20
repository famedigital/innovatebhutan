-- Migration: Payroll Schema Enhancement
-- Enhances employees and payslips tables for complete payroll functionality
-- Adds support for RRCO compliance: PF, GIS, PIT calculations

-- First, let's see what we're working with
-- Run this diagnostic query first if needed:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'employees';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'payslips';

-- ============================================
-- EMPLOYEES TABLE ENHANCEMENTS
-- ============================================

DO $$
BEGIN
    -- Add tin column (Tax Identification Number)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'tin'
    ) THEN
        ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "tin" varchar(20);
        RAISE NOTICE 'Added employees.tin column';
    ELSE
        RAISE NOTICE 'employees.tin column already exists';
    END IF;

    -- Add pf_number column (Provident Fund Number)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'pf_number'
    ) THEN
        ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "pf_number" varchar(30);
        RAISE NOTICE 'Added employees.pf_number column';
    ELSE
        RAISE NOTICE 'employees.pf_number column already exists';
    END IF;

    -- Add bank_account_number column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'bank_account_number'
    ) THEN
        ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "bank_account_number" varchar(30);
        RAISE NOTICE 'Added employees.bank_account_number column';
    ELSE
        RAISE NOTICE 'employees.bank_account_number column already exists';
    END IF;

    -- Add bank_name column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'bank_name'
    ) THEN
        ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "bank_name" varchar(100);
        RAISE NOTICE 'Added employees.bank_name column';
    ELSE
        RAISE NOTICE 'employees.bank_name column already exists';
    END IF;

    -- Add bank_branch column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'bank_branch'
    ) THEN
        ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "bank_branch" varchar(100);
        RAISE NOTICE 'Added employees.bank_branch column';
    ELSE
        RAISE NOTICE 'employees.bank_branch column already exists';
    END IF;

    -- Add status column (active/inactive/terminated/on_leave)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'status'
    ) THEN
        ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'active';
        RAISE NOTICE 'Added employees.status column';
    ELSE
        RAISE NOTICE 'employees.status column already exists';
    END IF;

    -- Add department column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'department'
    ) THEN
        ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "department" varchar(100);
        RAISE NOTICE 'Added employees.department column';
    ELSE
        RAISE NOTICE 'employees.department column already exists';
    END IF;

    -- Add phone column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'phone'
    ) THEN
        ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "phone" varchar(20);
        RAISE NOTICE 'Added employees.phone column';
    ELSE
        RAISE NOTICE 'employees.phone column already exists';
    END IF;

    -- Add email column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'email'
    ) THEN
        ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "email" varchar(255);
        RAISE NOTICE 'Added employees.email column';
    ELSE
        RAISE NOTICE 'employees.email column already exists';
    END IF;

END $$;

-- ============================================
-- PAYSLIPS TABLE ENHANCEMENTS
-- ============================================

DO $$
BEGIN
    -- Add gross_salary column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payslips' AND column_name = 'gross_salary'
    ) THEN
        ALTER TABLE "payslips" ADD COLUMN IF NOT EXISTS "gross_salary" decimal(12, 2);
        RAISE NOTICE 'Added payslips.gross_salary column';
    ELSE
        RAISE NOTICE 'payslips.gross_salary column already exists';
    END IF;

    -- Add basic_salary column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payslips' AND column_name = 'basic_salary'
    ) THEN
        ALTER TABLE "payslips" ADD COLUMN IF NOT EXISTS "basic_salary" decimal(12, 2);
        RAISE NOTICE 'Added payslips.basic_salary column';
    ELSE
        RAISE NOTICE 'payslips.basic_salary column already exists';
    END IF;

    -- Add allowances column (jsonb for structured allowance data)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payslips' AND column_name = 'allowances'
    ) THEN
        ALTER TABLE "payslips" ADD COLUMN IF NOT EXISTS "allowances" jsonb;
        RAISE NOTICE 'Added payslips.allowances column';
    ELSE
        RAISE NOTICE 'payslips.allowances column already exists';
    END IF;

    -- Add pf_employee column (5% employee contribution)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payslips' AND column_name = 'pf_employee'
    ) THEN
        ALTER TABLE "payslips" ADD COLUMN IF NOT EXISTS "pf_employee" decimal(12, 2);
        RAISE NOTICE 'Added payslips.pf_employee column';
    ELSE
        RAISE NOTICE 'payslips.pf_employee column already exists';
    END IF;

    -- Add pf_employer column (5% employer contribution)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payslips' AND column_name = 'pf_employer'
    ) THEN
        ALTER TABLE "payslips" ADD COLUMN IF NOT EXISTS "pf_employer" decimal(12, 2);
        RAISE NOTICE 'Added payslips.pf_employer column';
    ELSE
        RAISE NOTICE 'payslips.pf_employer column already exists';
    END IF;

    -- Add gis_deduction column (flat rate)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payslips' AND column_name = 'gis_deduction'
    ) THEN
        ALTER TABLE "payslips" ADD COLUMN IF NOT EXISTS "gis_deduction" decimal(12, 2);
        RAISE NOTICE 'Added payslips.gis_deduction column';
    ELSE
        RAISE NOTICE 'payslips.gis_deduction column already exists';
    END IF;

    -- Add taxable_income column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payslips' AND column_name = 'taxable_income'
    ) THEN
        ALTER TABLE "payslips" ADD COLUMN IF NOT EXISTS "taxable_income" decimal(12, 2);
        RAISE NOTICE 'Added payslips.taxable_income column';
    ELSE
        RAISE NOTICE 'payslips.taxable_income column already exists';
    END IF;

    -- Add pit_deduction column (Personal Income Tax - progressive slab)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payslips' AND column_name = 'pit_deduction'
    ) THEN
        ALTER TABLE "payslips" ADD COLUMN IF NOT EXISTS "pit_deduction" decimal(12, 2);
        RAISE NOTICE 'Added payslips.pit_deduction column';
    ELSE
        RAISE NOTICE 'payslips.pit_deduction column already exists';
    END IF;

    -- Add bonuses column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payslips' AND column_name = 'bonuses'
    ) THEN
        ALTER TABLE "payslips" ADD COLUMN IF NOT EXISTS "bonuses" decimal(12, 2);
        RAISE NOTICE 'Added payslips.bonuses column';
    ELSE
        RAISE NOTICE 'payslips.bonuses column already exists';
    END IF;

    -- Add additional_deductions column (jsonb for advance, loan, etc.)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payslips' AND column_name = 'additional_deductions'
    ) THEN
        ALTER TABLE "payslips" ADD COLUMN IF NOT EXISTS "additional_deductions" jsonb;
        RAISE NOTICE 'Added payslips.additional_deductions column';
    ELSE
        RAISE NOTICE 'payslips.additional_deductions column already exists';
    END IF;

    -- Add payment_date column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payslips' AND column_name = 'payment_date'
    ) THEN
        ALTER TABLE "payslips" ADD COLUMN IF NOT EXISTS "payment_date" timestamp;
        RAISE NOTICE 'Added payslips.payment_date column';
    ELSE
        RAISE NOTICE 'payslips.payment_date column already exists';
    END IF;

    -- Add payment_method column (bank/cash/cheque)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payslips' AND column_name = 'payment_method'
    ) THEN
        ALTER TABLE "payslips" ADD COLUMN IF NOT EXISTS "payment_method" varchar(20);
        RAISE NOTICE 'Added payslips.payment_method column';
    ELSE
        RAISE NOTICE 'payslips.payment_method column already exists';
    END IF;

    -- Add generated_at column (when calculation was performed)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payslips' AND column_name = 'generated_at'
    ) THEN
        ALTER TABLE "payslips" ADD COLUMN IF NOT EXISTS "generated_at" timestamp DEFAULT now();
        RAISE NOTICE 'Added payslips.generated_at column';
    ELSE
        RAISE NOTICE 'payslips.generated_at column already exists';
    END IF;

    -- Add notes column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payslips' AND column_name = 'notes'
    ) THEN
        ALTER TABLE "payslips" ADD COLUMN IF NOT EXISTS "notes" text;
        RAISE NOTICE 'Added payslips.notes column';
    ELSE
        RAISE NOTICE 'payslips.notes column already exists';
    END IF;

END $$;

-- ============================================
-- INDEXES
-- ============================================

-- Employees indexes
CREATE INDEX IF NOT EXISTS "idx_employees_status" ON "employees" ("status");
CREATE INDEX IF NOT EXISTS "idx_employees_department" ON "employees" ("department");
CREATE INDEX IF NOT EXISTS "idx_employees_designation" ON "employees" ("designation");

-- Payslips indexes
CREATE INDEX IF NOT EXISTS "idx_payslips_employee_month_year" ON "payslips" ("employee_id", "month", "year");
CREATE INDEX IF NOT EXISTS "idx_payslips_status" ON "payslips" ("status");
CREATE INDEX IF NOT EXISTS "idx_payslips_payment_date" ON "payslips" ("payment_date");

-- ============================================
-- CONSTRAINTS & VALIDATIONS
-- ============================================

-- Ensure payment_method is one of the allowed values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'payslips_payment_method_check'
    ) THEN
        ALTER TABLE "payslips" ADD CONSTRAINT "payslips_payment_method_check"
        CHECK ("payment_method" IN ('bank', 'cash', 'cheque'));
        RAISE NOTICE 'Added payslips payment_method check constraint';
    END IF;
END $$;

-- Ensure employee status is one of the allowed values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'employees_status_check'
    ) THEN
        ALTER TABLE "employees" ADD CONSTRAINT "employees_status_check"
        CHECK ("status" IN ('active', 'inactive', 'terminated', 'on_leave'));
        RAISE NOTICE 'Added employees status check constraint';
    END IF;
END $$;

-- Ensure payslip status is one of the allowed values
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'payslips_status_check'
    ) THEN
        ALTER TABLE "payslips" ADD CONSTRAINT "payslips_status_check"
        CHECK ("status" IN ('draft', 'approved', 'paid', 'cancelled'));
        RAISE NOTICE 'Added payslips status check constraint';
    END IF;
END $$;

-- ============================================
-- UNIQUE CONSTRAINTS
-- ============================================

-- Enable btree_gist extension for EXCLUDE constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Prevent duplicate payslips for same employee, month, year (unless cancelled)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'payslips_unique_period_per_employee'
    ) THEN
        ALTER TABLE "payslips" ADD CONSTRAINT "payslips_unique_period_per_employee"
        EXCLUDE USING gist ("employee_id" WITH =, "month" WITH =, "year" WITH =)
        WHERE ("status" != 'cancelled');
        RAISE NOTICE 'Added unique constraint for payslips period per employee';
    END IF;
END $$;

-- Fallback: If the above fails, use a partial unique index instead
CREATE UNIQUE INDEX IF NOT EXISTS "idx_payslips_unique_period"
ON "payslips" ("employee_id", "month", "year")
WHERE "status" != 'cancelled';

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify employees table
SELECT
    'employees' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'employees'
    AND column_name IN ('tin', 'pf_number', 'bank_account_number', 'bank_name', 'bank_branch', 'status', 'department', 'phone', 'email')
ORDER BY column_name;

-- Verify payslips table
SELECT
    'payslips' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'payslips'
    AND column_name IN ('gross_salary', 'basic_salary', 'allowances', 'pf_employee', 'pf_employer', 'gis_deduction', 'taxable_income', 'pit_deduction', 'bonuses', 'additional_deductions', 'payment_date', 'payment_method', 'generated_at', 'notes')
ORDER BY column_name;
