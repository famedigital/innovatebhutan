-- Migration: 0018_support_system_enhancements.sql
-- Description: Add next-generation support system tables with AI and analytics
-- Created: 2026-05-25

-- ============================================
-- ENHANCED CLIENTS TABLE
-- ============================================
-- Add new columns to existing clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS industry VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company_size VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tier VARCHAR(20) DEFAULT 'bronze';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(50) DEFAULT 'whatsapp';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Thimphu';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS sla_level VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS response_time_target INTEGER;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tags JSONB;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_health_score INTEGER DEFAULT 80;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_communication_date TIMESTAMP;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS next_follow_up_date TIMESTAMP;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add indexes for enhanced clients
CREATE INDEX IF NOT EXISTS idx_clients_tier ON clients(tier);
CREATE INDEX IF NOT EXISTS idx_clients_health_score ON clients(client_health_score);
CREATE INDEX IF NOT EXISTS idx_clients_next_followup ON clients(next_follow_up_date) WHERE next_follow_up_date IS NOT NULL;

-- ============================================
-- ENHANCED EMPLOYEES TABLE
-- ============================================
-- Add new columns to existing employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS skills JSONB;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS specializations JSONB;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS certifications JSONB;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS max_concurrent_problems INTEGER DEFAULT 5;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS current_workload INTEGER DEFAULT 0;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS performance_metrics JSONB;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS availability VARCHAR(20) DEFAULT 'available';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS average_response_time INTEGER;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS average_resolution_time INTEGER;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS client_satisfaction_score INTEGER DEFAULT 80;

-- Add indexes for enhanced employees
CREATE INDEX IF NOT EXISTS idx_employees_availability ON employees(availability);
CREATE INDEX IF NOT EXISTS idx_employees_workload ON employees(current_workload);

-- ============================================
-- NEW PROBLEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS problems (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new',

    -- Client and assignment
    client_id INTEGER REFERENCES clients(id),
    assigned_team_id INTEGER REFERENCES employees(id),
    assigned_to INTEGER REFERENCES employees(id),

    -- Root cause analysis
    root_cause TEXT,
    prevention_measures TEXT,
    lessons_learned TEXT,
    resolution_time INTEGER,
    client_impact VARCHAR(50),

    -- Communication and AI
    communication_log JSONB,
    linked_ticket_id INTEGER,
    ai_suggested_category VARCHAR(100),
    ai_suggested_resolution TEXT,

    -- Status tracking
    created_by_id INTEGER REFERENCES employees(id),
    resolved_by_id INTEGER REFERENCES employees(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for problems
CREATE INDEX IF NOT EXISTS idx_problems_client ON problems(client_id);
CREATE INDEX IF NOT EXISTS idx_problems_status ON problems(status);
CREATE INDEX IF NOT EXISTS idx_problems_severity ON problems(severity);
CREATE INDEX IF NOT EXISTS idx_problems_assigned ON problems(assigned_to);
CREATE INDEX IF NOT EXISTS idx_problems_created_at ON problems(created_at DESC);

-- ============================================
-- NEW CLIENT COMMUNICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS client_communications (
    id SERIAL PRIMARY KEY,

    -- Communication details
    client_id INTEGER NOT NULL REFERENCES clients(id),
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    outcome TEXT,
    next_action TEXT,

    -- Team members involved
    focal_person_id INTEGER REFERENCES employees(id),
    team_member_id INTEGER REFERENCES employees(id),
    problem_id INTEGER REFERENCES problems(id),

    -- Communication tracking
    direction VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    importance VARCHAR(20) DEFAULT 'normal',

    -- AI analysis
    sentiment VARCHAR(20),
    ai_summary TEXT,
    requires_follow_up BOOLEAN DEFAULT false,

    -- Timing
    scheduled_for TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for client communications
CREATE INDEX IF NOT EXISTS idx_communications_client ON client_communications(client_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON client_communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_scheduled ON client_communications(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_communications_problem ON client_communications(problem_id);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON client_communications(created_at DESC);

-- ============================================
-- NEW TEAM ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS team_assignments (
    id SERIAL PRIMARY KEY,

    -- Assignment details
    client_id INTEGER NOT NULL REFERENCES clients(id),
    team_member_id INTEGER NOT NULL REFERENCES employees(id),
    role VARCHAR(50) NOT NULL,

    -- Focal person system
    is_focal_person BOOLEAN DEFAULT false,
    is_primary_backup BOOLEAN DEFAULT false,

    -- Workload and performance
    workload INTEGER DEFAULT 0,
    performance_score INTEGER DEFAULT 80,
    skills JSONB,

    -- Assignment period
    valid_from TIMESTAMP DEFAULT NOW(),
    valid_to TIMESTAMP,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for team assignments
CREATE INDEX IF NOT EXISTS idx_team_assignments_client ON team_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_team_assignments_team ON team_assignments(team_member_id);
CREATE INDEX IF NOT EXISTS idx_team_assignments_active ON team_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_team_assignments_focal ON team_assignments(is_focal_person);

-- ============================================
-- NEW CLIENT PORTAL ACCESS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS client_portal_access (
    id SERIAL PRIMARY KEY,

    -- Access details
    client_id INTEGER NOT NULL REFERENCES clients(id),
    user_id INTEGER,
    access_level VARCHAR(50) DEFAULT 'basic',

    -- Features and permissions
    features JSONB,
    allowed_actions JSONB,

    -- Portal activity
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT false,

    -- Invitation tracking
    invited_by INTEGER REFERENCES employees(id),
    invited_at TIMESTAMP,
    activated_at TIMESTAMP,

    -- Security
    last_password_change TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT false,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for client portal access
CREATE INDEX IF NOT EXISTS idx_client_portal_client ON client_portal_access(client_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_user ON client_portal_access(user_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_active ON client_portal_access(is_active);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update client health score
CREATE OR REPLACE FUNCTION update_client_health_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Simple health score calculation based on recent problems and communications
    UPDATE clients c
    SET client_health_score = GREATEST(0, LEAST(100,
        80 -
        (SELECT COUNT(*) FROM problems WHERE client_id = c.id AND status != 'closed' AND created_at > NOW() - INTERVAL '30 days') * 5 -
        (SELECT COUNT(*) FROM problems WHERE client_id = c.id AND severity = 'critical' AND created_at > NOW() - INTERVAL '90 days') * 10
    ))
    WHERE c.id = NEW.client_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update client health score
CREATE TRIGGER update_client_health_on_problem
AFTER INSERT OR UPDATE ON problems
FOR EACH ROW
EXECUTE FUNCTION update_client_health_score();

-- Function to update employee workload
CREATE OR REPLACE FUNCTION update_employee_workload()
RETURNS TRIGGER AS $$
BEGIN
    -- Update workload count when problem is assigned
    IF NEW.status != 'closed' AND (OLD.status IS NULL OR OLD.status = 'closed') THEN
        UPDATE employees SET current_workload = current_workload + 1 WHERE id = NEW.assigned_to;
    ELSIF NEW.status = 'closed' AND (OLD.status IS NULL OR OLD.status != 'closed') THEN
        UPDATE employees SET current_workload = GREATEST(0, current_workload - 1) WHERE id = NEW.assigned_to;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update employee workload
CREATE TRIGGER update_workload_on_problem_status
AFTER INSERT OR UPDATE ON problems
FOR EACH ROW
EXECUTE FUNCTION update_employee_workload();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE problems IS 'Enhanced problem tracking with AI and root cause analysis';
COMMENT ON TABLE client_communications IS 'Unified communication timeline across all channels';
COMMENT ON TABLE team_assignments IS 'Client-to-team mapping with workload management';
COMMENT ON TABLE client_portal_access IS 'Client portal access and permissions';

COMMENT ON COLUMN clients.client_health_score IS '0-100 score calculated from recent problems and communications';
COMMENT ON COLUMN employees.current_workload IS 'Current number of active problem assignments';
COMMENT ON COLUMN employees.availability IS 'Real-time availability: available/busy/offline';

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Insert sample problems for testing (if problems table exists and is empty)
INSERT INTO problems (title, description, severity, category, client_id, assigned_to, status)
SELECT
    'Sample Network Issue',
    'Client experiencing intermittent network connectivity affecting POS operations',
    'high',
    'networking',
    1,
    1,
    'in-progress'
WHERE NOT EXISTS (SELECT 1 FROM problems LIMIT 1);

-- Insert sample team assignments
INSERT INTO team_assignments (client_id, team_member_id, role, is_focal_person, workload)
SELECT
    c.id,
    e.id,
    'focal-person',
    true,
    3
FROM clients c
CROSS JOIN employees e
WHERE c.id = 1 AND e.id = 1
AND NOT EXISTS (SELECT 1 FROM team_assignments WHERE client_id = 1 AND team_member_id = 1);