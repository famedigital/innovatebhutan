-- Migration to fix existing audit_logs table conflict
-- This migration safely handles the case where audit_logs table already exists

-- Check if audit_logs table exists and create it only if it doesn't exist
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"operator_id" integer,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" integer,
	"details" jsonb,
	"created_at" timestamp DEFAULT now()
);

-- Continue with other tables from migration 0002
CREATE TABLE IF NOT EXISTS "business_amenities" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"amenity_type" varchar(50) NOT NULL,
	"amenity_value" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "business_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"icon" varchar(50),
	"description" text,
	"parent_id" integer,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "business_categories_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "business_categories_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "business_hours" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"open_time" varchar(10),
	"close_time" varchar(10),
	"is_closed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "business_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(50) NOT NULL,
	"business_id" integer NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_email" varchar(100),
	"order_id" integer,
	"project_id" integer,
	"is_verified" boolean DEFAULT false,
	"rating" integer NOT NULL,
	"title" varchar(255),
	"comment" text NOT NULL,
	"response" text,
	"responded_at" timestamp,
	"status" varchar(50) DEFAULT 'published',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "business_reviews_public_id_unique" UNIQUE("public_id")
);

CREATE TABLE IF NOT EXISTS "businesses" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(50) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"tagline" varchar(255),
	"description" text,
	"category_id" integer,
	"location_id" integer,
	"phone" varchar(50),
	"whatsapp" varchar(50),
	"email" varchar(100),
	"website" text,
	"address" text,
	"coordinates" jsonb,
	"logo_url" text,
	"cover_image_url" text,
	"gallery_urls" jsonb,
	"owner_id" integer,
	"client_id" integer,
	"status" varchar(50) DEFAULT 'active',
	"type" varchar(50) DEFAULT 'external',
	"is_verified" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"meta_title" varchar(100),
	"meta_description" text,
	"keywords" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "businesses_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "businesses_slug_unique" UNIQUE("slug")
);

CREATE TABLE IF NOT EXISTS "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" varchar(50) NOT NULL,
	"name" varchar(100) NOT NULL,
	"district" varchar(100),
	"dzongkhag" varchar(100),
	"thromde" varchar(100),
	"description" text,
	"coordinates" jsonb,
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "locations_public_id_unique" UNIQUE("public_id")
);

CREATE TABLE IF NOT EXISTS "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"type" varchar(50) DEFAULT 'info',
	"read" boolean DEFAULT false,
	"link" text,
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "project_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"assigned_to" integer,
	"title" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'todo',
	"priority" varchar(50) DEFAULT 'medium',
	"created_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"service_id" integer,
	"name" varchar(255) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'planning',
	"lead_id" integer,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "ticket_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"message" text NOT NULL,
	"is_system" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);

-- Add new columns to existing tables (IF NOT EXISTS pattern for ALTER TABLE)
-- Check if columns exist before adding them to avoid errors
DO $$
BEGIN
    -- Add columns to clients table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'whatsapp_group_id') THEN
        ALTER TABLE "clients" ADD COLUMN "whatsapp_group_id" varchar(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'whatsapp_group_link') THEN
        ALTER TABLE "clients" ADD COLUMN "whatsapp_group_link" text;
    END IF;

    -- Add columns to employees table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'photo_url') THEN
        ALTER TABLE "employees" ADD COLUMN "photo_url" text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'national_id_masked') THEN
        ALTER TABLE "employees" ADD COLUMN "national_id_masked" varchar(20);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'interview_score') THEN
        ALTER TABLE "employees" ADD COLUMN "interview_score" integer;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'agreements_doc_url') THEN
        ALTER TABLE "employees" ADD COLUMN "agreements_doc_url" text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'joining_letter_url') THEN
        ALTER TABLE "employees" ADD COLUMN "joining_letter_url" text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'additional_docs') THEN
        ALTER TABLE "employees" ADD COLUMN "additional_docs" jsonb;
    END IF;
END $$;

-- Add foreign key constraints (IF NOT EXISTS pattern)
-- Drop existing constraints if they exist, then recreate them
DO $$
BEGIN
    -- Drop foreign keys if they exist
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_logs_operator_id_profiles_id_fk') THEN
        ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_operator_id_profiles_id_fk";
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'business_amenities_business_id_businesses_id_fk') THEN
        ALTER TABLE "business_amenities" DROP CONSTRAINT "business_amenities_business_id_businesses_id_fk";
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'business_categories_parent_id_business_categories_id_fk') THEN
        ALTER TABLE "business_categories" DROP CONSTRAINT "business_categories_parent_id_business_categories_id_fk";
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'business_hours_business_id_businesses_id_fk') THEN
        ALTER TABLE "business_hours" DROP CONSTRAINT "business_hours_business_id_businesses_id_fk";
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'business_reviews_business_id_businesses_id_fk') THEN
        ALTER TABLE "business_reviews" DROP CONSTRAINT "business_reviews_business_id_businesses_id_fk";
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'business_reviews_order_id_orders_id_fk') THEN
        ALTER TABLE "business_reviews" DROP CONSTRAINT "business_reviews_order_id_orders_id_fk";
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'business_reviews_project_id_projects_id_fk') THEN
        ALTER TABLE "business_reviews" DROP CONSTRAINT "business_reviews_project_id_projects_id_fk";
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'businesses_category_id_business_categories_id_fk') THEN
        ALTER TABLE "businesses" DROP CONSTRAINT "businesses_category_id_business_categories_id_fk";
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'businesses_location_id_locations_id_fk') THEN
        ALTER TABLE "businesses" DROP CONSTRAINT "businesses_location_id_locations_id_fk";
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'businesses_owner_id_profiles_id_fk') THEN
        ALTER TABLE "businesses" DROP CONSTRAINT "businesses_owner_id_profiles_id_fk";
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'businesses_client_id_clients_id_fk') THEN
        ALTER TABLE "businesses" DROP CONSTRAINT "businesses_client_id_clients_id_fk";
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_user_id_profiles_id_fk') THEN
        ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_profiles_id_fk";
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_tasks_project_id_projects_id_fk') THEN
        ALTER TABLE "project_tasks" DROP CONSTRAINT "project_tasks_project_id_projects_id_fk";
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_tasks_assigned_to_profiles_id_fk') THEN
        ALTER TABLE "project_tasks" DROP CONSTRAINT "project_tasks_assigned_to_profiles_id_fk";
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_client_id_clients_id_fk') THEN
        ALTER TABLE "projects" DROP CONSTRAINT "projects_client_id_clients_id_fk";
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_service_id_services_id_fk') THEN
        ALTER TABLE "projects" DROP CONSTRAINT "projects_service_id_services_id_fk";
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_lead_id_profiles_id_fk') THEN
        ALTER TABLE "projects" DROP CONSTRAINT "projects_lead_id_profiles_id_fk";
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_messages_ticket_id_tickets_id_fk') THEN
        ALTER TABLE "ticket_messages" DROP CONSTRAINT "ticket_messages_ticket_id_tickets_id_fk";
    END IF;

    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ticket_messages_sender_id_profiles_id_fk') THEN
        ALTER TABLE "ticket_messages" DROP CONSTRAINT "ticket_messages_sender_id_profiles_id_fk";
    END IF;
END $$;

-- Now add all the foreign key constraints
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_operator_id_profiles_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "business_amenities" ADD CONSTRAINT "business_amenities_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "business_categories" ADD CONSTRAINT "business_categories_parent_id_business_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."business_categories"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "business_reviews" ADD CONSTRAINT "business_reviews_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "business_reviews" ADD CONSTRAINT "business_reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "business_reviews" ADD CONSTRAINT "business_reviews_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "businesses" ADD CONSTRAINT "businesses_category_id_business_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."business_categories"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "businesses" ADD CONSTRAINT "businesses_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "businesses" ADD CONSTRAINT "businesses_owner_id_profiles_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "businesses" ADD CONSTRAINT "businesses_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "project_tasks" ADD CONSTRAINT "project_tasks_assigned_to_profiles_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "projects" ADD CONSTRAINT "projects_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "projects" ADD CONSTRAINT "projects_lead_id_profiles_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_sender_id_profiles_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;