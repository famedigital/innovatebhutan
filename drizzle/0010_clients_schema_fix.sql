-- Migration: 0010_clients_schema_fix.sql
-- Purpose: Add missing columns to the clients table
-- Date: 2026-04-21
-- Context: The clients table was missing columns needed by the UI and API layers

-- Add email column for client email address
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email varchar(255);

-- Add phone column for client phone number (separate from whatsapp)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone varchar(50);

-- Add address column for physical address
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address text;

-- Add city column for city location
ALTER TABLE clients ADD COLUMN IF NOT EXISTS city varchar(100);

-- Add country column with default value 'Bhutan'
ALTER TABLE clients ADD COLUMN IF NOT EXISTS country varchar(100) DEFAULT 'Bhutan';

-- Add comments for documentation
COMMENT ON COLUMN clients.email IS 'Primary email contact for the client';
COMMENT ON COLUMN clients.phone IS 'Primary phone number for the client';
COMMENT ON COLUMN clients.address IS 'Physical address of the client';
COMMENT ON COLUMN clients.city IS 'City where the client is located';
COMMENT ON COLUMN clients.country IS 'Country where the client is located (default: Bhutan)';
