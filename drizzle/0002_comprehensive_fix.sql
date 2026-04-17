-- Comprehensive Migration Fix for Innovate Bhutan ERP
-- This script handles the migration conflict by:
-- 1. Fixing existing tables with incomplete structures
-- 2. Creating missing tables
-- 3. Adding all necessary foreign key constraints

-- ============================================
-- PART 1: FIX EXISTING TABLES
-- ============================================

-- Fix audit_logs table structure
DO $$
BEGIN
    -- Drop any existing foreign key constraints first
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'audit_logs_operator_id_profiles_id_fk'
    ) THEN
        ALTER TABLE audit_logs DROP CONSTRAINT audit_logs_operator_id_profiles_id_fk;
    END IF;

    -- Add missing columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_logs' AND column_name = 'operator_id'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN operator_id integer;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_logs' AND column_name = 'action'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN action varchar(100) NOT NULL DEFAULT 'CREATE';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_logs' AND column_name = 'entity_type'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN entity_type varchar(50) NOT NULL DEFAULT 'UNKNOWN';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_logs' AND column_name = 'entity_id'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN entity_id integer;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_logs' AND column_name = 'details'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN details jsonb;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_logs' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE audit_logs ADD COLUMN created_at timestamp DEFAULT now();
    END IF;
END $$;

-- ============================================
-- PART 2: CREATE MISSING TABLES
-- ============================================

-- Create business_amenities table
CREATE TABLE IF NOT EXISTS business_amenities (
    id serial PRIMARY KEY NOT NULL,
    business_id integer NOT NULL,
    amenity_type varchar(50) NOT NULL,
    amenity_value varchar(255) NOT NULL,
    created_at timestamp DEFAULT now()
);

-- Create business_categories table
CREATE TABLE IF NOT EXISTS business_categories (
    id serial PRIMARY KEY NOT NULL,
    public_id varchar(50) NOT NULL,
    name varchar(100) NOT NULL,
    slug varchar(100) NOT NULL,
    icon varchar(50),
    description text,
    parent_id integer,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp DEFAULT now(),
    CONSTRAINT business_categories_public_id_unique UNIQUE(public_id),
    CONSTRAINT business_categories_slug_unique UNIQUE(slug)
);

-- Create business_hours table
CREATE TABLE IF NOT EXISTS business_hours (
    id serial PRIMARY KEY NOT NULL,
    business_id integer NOT NULL,
    day_of_week integer NOT NULL,
    open_time varchar(10),
    close_time varchar(10),
    is_closed boolean DEFAULT false,
    created_at timestamp DEFAULT now()
);

-- Create business_reviews table
CREATE TABLE IF NOT EXISTS business_reviews (
    id serial PRIMARY KEY NOT NULL,
    public_id varchar(50) NOT NULL,
    business_id integer NOT NULL,
    customer_name varchar(255) NOT NULL,
    customer_email varchar(100),
    order_id integer,
    project_id integer,
    is_verified boolean DEFAULT false,
    rating integer NOT NULL,
    title varchar(255),
    comment text NOT NULL,
    response text,
    responded_at timestamp,
    status varchar(50) DEFAULT 'published',
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    CONSTRAINT business_reviews_public_id_unique UNIQUE(public_id)
);

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id serial PRIMARY KEY NOT NULL,
    public_id varchar(50) NOT NULL,
    slug varchar(100) NOT NULL,
    name varchar(255) NOT NULL,
    tagline varchar(255),
    description text,
    category_id integer,
    location_id integer,
    phone varchar(50),
    whatsapp varchar(50),
    email varchar(100),
    website text,
    address text,
    coordinates jsonb,
    logo_url text,
    cover_image_url text,
    gallery_urls jsonb,
    owner_id integer,
    client_id integer,
    status varchar(50) DEFAULT 'active',
    type varchar(50) DEFAULT 'external',
    is_verified boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    rating numeric(3, 2) DEFAULT '0',
    review_count integer DEFAULT 0,
    meta_title varchar(100),
    meta_description text,
    keywords jsonb,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    CONSTRAINT businesses_public_id_unique UNIQUE(public_id),
    CONSTRAINT businesses_slug_unique UNIQUE(slug)
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
    id serial PRIMARY KEY NOT NULL,
    public_id varchar(50) NOT NULL,
    name varchar(100) NOT NULL,
    district varchar(100),
    dzongkhag varchar(100),
    thromde varchar(100),
    description text,
    coordinates jsonb,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp DEFAULT now(),
    CONSTRAINT locations_public_id_unique UNIQUE(public_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id serial PRIMARY KEY NOT NULL,
    user_id integer NOT NULL,
    title varchar(255) NOT NULL,
    message text NOT NULL,
    type varchar(50) DEFAULT 'info',
    read boolean DEFAULT false,
    link text,
    created_at timestamp DEFAULT now()
);

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
    id serial PRIMARY KEY NOT NULL,
    project_id integer NOT NULL,
    assigned_to integer,
    title varchar(255) NOT NULL,
    description text,
    status varchar(50) DEFAULT 'todo',
    priority varchar(50) DEFAULT 'medium',
    created_at timestamp DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id serial PRIMARY KEY NOT NULL,
    client_id integer NOT NULL,
    service_id integer,
    name varchar(255) NOT NULL,
    description text,
    status varchar(50) DEFAULT 'planning',
    lead_id integer,
    start_date timestamp,
    end_date timestamp,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

-- Create ticket_messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
    id serial PRIMARY KEY NOT NULL,
    ticket_id integer NOT NULL,
    sender_id integer NOT NULL,
    message text NOT NULL,
    is_system boolean DEFAULT false,
    created_at timestamp DEFAULT now()
);

-- ============================================
-- PART 3: ADD COLUMNS TO EXISTING TABLES
-- ============================================

-- Add new columns to clients table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clients' AND column_name = 'whatsapp_group_id'
    ) THEN
        ALTER TABLE clients ADD COLUMN whatsapp_group_id varchar(100);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'clients' AND column_name = 'whatsapp_group_link'
    ) THEN
        ALTER TABLE clients ADD COLUMN whatsapp_group_link text;
    END IF;
END $$;

-- Add new columns to employees table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'photo_url'
    ) THEN
        ALTER TABLE employees ADD COLUMN photo_url text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'national_id_masked'
    ) THEN
        ALTER TABLE employees ADD COLUMN national_id_masked varchar(20);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'interview_score'
    ) THEN
        ALTER TABLE employees ADD COLUMN interview_score integer;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'agreements_doc_url'
    ) THEN
        ALTER TABLE employees ADD COLUMN agreements_doc_url text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'joining_letter_url'
    ) THEN
        ALTER TABLE employees ADD COLUMN joining_letter_url text;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employees' AND column_name = 'additional_docs'
    ) THEN
        ALTER TABLE employees ADD COLUMN additional_docs jsonb;
    END IF;
END $$;

-- ============================================
-- PART 4: CREATE FOREIGN KEY CONSTRAINTS
-- ============================================

-- Create all foreign key constraints
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_operator_id_profiles_id_fk
FOREIGN KEY (operator_id) REFERENCES profiles(id) ON DELETE no action ON UPDATE no action;

ALTER TABLE business_amenities ADD CONSTRAINT business_amenities_business_id_businesses_id_fk
FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE no action ON UPDATE no action;

ALTER TABLE business_categories ADD CONSTRAINT business_categories_parent_id_business_categories_id_fk
FOREIGN KEY (parent_id) REFERENCES business_categories(id) ON DELETE no action ON UPDATE no action;

ALTER TABLE business_hours ADD CONSTRAINT business_hours_business_id_businesses_id_fk
FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE no action ON UPDATE no action;

ALTER TABLE business_reviews ADD CONSTRAINT business_reviews_business_id_businesses_id_fk
FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE no action ON UPDATE no action;

ALTER TABLE business_reviews ADD CONSTRAINT business_reviews_order_id_orders_id_fk
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE no action ON UPDATE no action;

ALTER TABLE business_reviews ADD CONSTRAINT business_reviews_project_id_projects_id_fk
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE no action ON UPDATE no action;

ALTER TABLE businesses ADD CONSTRAINT businesses_category_id_business_categories_id_fk
FOREIGN KEY (category_id) REFERENCES business_categories(id) ON DELETE no action ON UPDATE no action;

ALTER TABLE businesses ADD CONSTRAINT businesses_location_id_locations_id_fk
FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE no action ON UPDATE no action;

ALTER TABLE businesses ADD CONSTRAINT businesses_owner_id_profiles_id_fk
FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE no action ON UPDATE no action;

ALTER TABLE businesses ADD CONSTRAINT businesses_client_id_clients_id_fk
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE no action ON UPDATE no action;

ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_profiles_id_fk
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE no action ON UPDATE no action;

ALTER TABLE project_tasks ADD CONSTRAINT project_tasks_project_id_projects_id_fk
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE no action ON UPDATE no action;

ALTER TABLE project_tasks ADD CONSTRAINT project_tasks_assigned_to_profiles_id_fk
FOREIGN KEY (assigned_to) REFERENCES profiles(id) ON DELETE no action ON UPDATE no action;

ALTER TABLE projects ADD CONSTRAINT projects_client_id_clients_id_fk
FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE no action ON UPDATE no action;

ALTER TABLE projects ADD CONSTRAINT projects_service_id_services_id_fk
FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE no action ON UPDATE no action;

ALTER TABLE projects ADD CONSTRAINT projects_lead_id_profiles_id_fk
FOREIGN KEY (lead_id) REFERENCES profiles(id) ON DELETE no action ON UPDATE no action;

ALTER TABLE ticket_messages ADD CONSTRAINT ticket_messages_ticket_id_tickets_id_fk
FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE no action ON UPDATE no action;

ALTER TABLE ticket_messages ADD CONSTRAINT ticket_messages_sender_id_profiles_id_fk
FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE no action ON UPDATE no action;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Show all tables that should now exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'audit_logs', 'business_amenities', 'business_categories', 'business_hours',
    'business_reviews', 'businesses', 'locations', 'notifications',
    'project_tasks', 'projects', 'ticket_messages'
)
ORDER BY table_name;

-- Success message
SELECT '✅ Migration fix completed successfully!' as status,
       'All tables have been created or fixed and foreign keys added.' as message;