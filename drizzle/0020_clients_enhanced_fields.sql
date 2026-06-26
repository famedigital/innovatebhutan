-- Migration: 0020_clients_enhanced_fields.sql
-- Purpose: Add enhanced fields and enterprise support columns to clients table
-- Date: 2026-06-19
-- Context: The clients table was missing columns defined in the schema that are needed for
--          the next-generation support system and enterprise client management

-- ============================================================================
-- ENHANCED CLIENT FIELDS
-- ============================================================================

-- Industry classification
ALTER TABLE clients ADD COLUMN IF NOT EXISTS industry varchar(100);
COMMENT ON COLUMN clients.industry IS 'Industry sector the client belongs to';

-- Company size classification
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company_size varchar(50);
COMMENT ON COLUMN clients.company_size IS 'Company size: small/medium/large';

-- Client tier (gold/silver/bronze)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tier varchar(20) DEFAULT 'bronze';
COMMENT ON COLUMN clients.tier IS 'Client tier: gold/silver/bronze';

-- Preferred contact method
ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferred_contact_method varchar(50) DEFAULT 'whatsapp';
COMMENT ON COLUMN clients.preferred_contact_method IS 'Preferred communication channel';

-- Client timezone
ALTER TABLE clients ADD COLUMN IF NOT EXISTS timezone varchar(50) DEFAULT 'Asia/Thimphu';
COMMENT ON COLUMN clients.timezone IS 'Client timezone for scheduling';

-- Service level agreement
ALTER TABLE clients ADD COLUMN IF NOT EXISTS sla_level varchar(50);
COMMENT ON COLUMN clients.sla_level IS 'SLA level: standard/premium/enterprise';

-- Response time target (in minutes)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS response_time_target integer;
COMMENT ON COLUMN clients.response_time_target IS 'Target response time in minutes';

-- Additional notes
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes text;
COMMENT ON COLUMN clients.notes IS 'Additional notes about the client';

-- Custom tags (JSON array)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tags jsonb;
COMMENT ON COLUMN clients.tags IS 'Array of custom tags for categorization';

-- Client health score (0-100)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_health_score integer DEFAULT 80;
COMMENT ON COLUMN clients.client_health_score IS 'Client relationship health score (0-100)';

-- Last communication date
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_communication_date timestamp;
COMMENT ON COLUMN clients.last_communication_date IS 'Date of last communication with client';

-- Next follow-up date
ALTER TABLE clients ADD COLUMN IF NOT EXISTS next_follow_up_date timestamp;
COMMENT ON COLUMN clients.next_follow_up_date IS 'Date for next scheduled follow-up';

-- ============================================================================
-- ENTERPRISE SUPPORT SYSTEM FIELDS
-- ============================================================================

-- Rancelab client code (unique identifier)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ralcodelab_code varchar(50) UNIQUE;
COMMENT ON COLUMN clients.ralcodelab_code IS 'Unique client code in Rancelab system';

-- Rancelab system URL
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ralcodelab_url text;
COMMENT ON COLUMN clients.ralcodelab_url IS 'URL to client in Rancelab system';

-- Google Drive folder ID
ALTER TABLE clients ADD COLUMN IF NOT EXISTS google_drive_folder_id varchar(255);
COMMENT ON COLUMN clients.google_drive_folder_id IS 'Root folder ID in Google Drive';

-- Support expiry date (AMC end date)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS support_expiry_date timestamp;
COMMENT ON COLUMN clients.support_expiry_date IS 'Date when support/AMC expires';

-- Days remaining for support
ALTER TABLE clients ADD COLUMN IF NOT EXISTS days_remaining_for_support integer;
COMMENT ON COLUMN clients.days_remaining_for_support IS 'Computed days until support expiry';

-- Account active status
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
COMMENT ON COLUMN clients.is_active IS 'Whether the client account is active';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Create index on tier for filtering
CREATE INDEX IF NOT EXISTS idx_clients_tier ON clients(tier);

-- Create index on industry for filtering
CREATE INDEX IF NOT EXISTS idx_clients_industry ON clients(industry);

-- Create index on support expiry date for alerts
CREATE INDEX IF NOT EXISTS idx_clients_support_expiry ON clients(support_expiry_date);

-- Create index on active status
CREATE INDEX IF NOT EXISTS idx_clients_active ON clients(is_active);

-- Create index on health score
CREATE INDEX IF NOT EXISTS idx_clients_health ON clients(client_health_score);
