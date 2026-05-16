/**
 * Push Schema Script - Creates all tables from schema.ts
 */

const postgres = require('postgres');
require('dotenv').config();

async function pushSchema() {
  console.log('🔄 Pushing schema to database...\n');

  const sql = postgres(process.env.DATABASE_URL, {
    max: 1,
  });

  try {
    // Create all tables in order (respecting foreign key dependencies)
    console.log('📋 Creating tables...\n');

    // Level 1: No dependencies
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "services" (
        "id" serial PRIMARY KEY,
        "public_id" varchar(50) NOT NULL UNIQUE,
        "name" varchar(255) NOT NULL,
        "category" varchar(100) NOT NULL,
        "tagline" text,
        "description" text,
        "price" numeric(12, 2),
        "currency" varchar(10) DEFAULT 'Nu.',
        "image_url" text,
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ services');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "profiles" (
        "id" serial PRIMARY KEY,
        "user_id" text NOT NULL UNIQUE,
        "full_name" varchar(255),
        "role" varchar(50) DEFAULT 'CLIENT' NOT NULL,
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ profiles');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "locations" (
        "id" serial PRIMARY KEY,
        "public_id" varchar(50) NOT NULL UNIQUE,
        "name" varchar(100) NOT NULL,
        "district" varchar(100),
        "dzongkhag" varchar(100),
        "thromde" varchar(100),
        "description" text,
        "coordinates" jsonb,
        "is_active" boolean DEFAULT true,
        "display_order" integer DEFAULT 0,
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ locations');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "business_categories" (
        "id" serial PRIMARY KEY,
        "public_id" varchar(50) NOT NULL UNIQUE,
        "name" varchar(100) NOT NULL,
        "slug" varchar(100) NOT NULL UNIQUE,
        "icon" varchar(50),
        "description" text,
        "parent_id" integer,
        "display_order" integer DEFAULT 0,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ business_categories');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "settings" (
        "id" serial PRIMARY KEY,
        "key" varchar(100) NOT NULL UNIQUE,
        "value" jsonb NOT NULL,
        "description" text,
        "updated_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ settings');

    // Level 2: Depends on profiles
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "clients" (
        "id" serial PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "active" boolean DEFAULT true,
        "contact_person" varchar(255),
        "email" varchar(255),
        "phone" varchar(50),
        "whatsapp" varchar(50),
        "whatsapp_group_id" varchar(100),
        "whatsapp_group_link" text,
        "logo_url" text,
        "address" text,
        "city" varchar(100),
        "country" varchar(100) DEFAULT 'Bhutan',
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ clients');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "employees" (
        "id" serial PRIMARY KEY,
        "profile_id" integer NOT NULL REFERENCES profiles(id),
        "designation" varchar(100),
        "base_salary" numeric(12, 2),
        "join_date" timestamp DEFAULT now(),
        "photo_url" text,
        "national_id_masked" varchar(20),
        "interview_score" integer,
        "agreements_doc_url" text,
        "joining_letter_url" text,
        "additional_docs" jsonb,
        "tin" varchar(20),
        "pf_number" varchar(30),
        "bank_account_number" varchar(30),
        "bank_name" varchar(100),
        "bank_branch" varchar(100),
        "status" varchar(20) DEFAULT 'active',
        "department" varchar(100),
        "phone" varchar(20),
        "email" varchar(255)
      );
    `);
    console.log('   ✓ employees');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id" serial PRIMARY KEY,
        "operator_id" integer REFERENCES profiles(id),
        "action" varchar(100) NOT NULL,
        "entity_type" varchar(50) NOT NULL,
        "entity_id" integer,
        "details" jsonb,
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ audit_logs');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" serial PRIMARY KEY,
        "user_id" integer NOT NULL REFERENCES profiles(id),
        "title" varchar(255) NOT NULL,
        "message" text NOT NULL,
        "type" varchar(50) DEFAULT 'info',
        "category" varchar(50),
        "entity_type" varchar(50),
        "entity_id" integer,
        "read" boolean DEFAULT false,
        "link" text,
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ notifications');

    // Level 3: Depends on clients, services
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" serial PRIMARY KEY,
        "customer_name" varchar(255) NOT NULL,
        "customer_phone" varchar(50) NOT NULL,
        "customer_location" varchar(255),
        "status" varchar(50) DEFAULT 'pending',
        "total_amount" numeric(15, 2) NOT NULL,
        "meta" jsonb,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ orders');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "order_items" (
        "id" serial PRIMARY KEY,
        "order_id" integer REFERENCES orders(id),
        "service_id" integer REFERENCES services(id),
        "quantity" integer DEFAULT 1,
        "unit_price" numeric(12, 2) NOT NULL
      );
    `);
    console.log('   ✓ order_items');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "amcs" (
        "id" serial PRIMARY KEY,
        "public_id" varchar(50) UNIQUE,
        "client_id" integer REFERENCES clients(id),
        "service_id" integer REFERENCES services(id),
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
    `);
    console.log('   ✓ amcs');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "tickets" (
        "id" serial PRIMARY KEY,
        "client_id" integer REFERENCES clients(id),
        "assigned_to" integer REFERENCES profiles(id),
        "subject" varchar(255) NOT NULL,
        "description" text,
        "status" varchar(50) DEFAULT 'open',
        "priority" varchar(50) DEFAULT 'medium',
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ tickets');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "ticket_messages" (
        "id" serial PRIMARY KEY,
        "ticket_id" integer NOT NULL REFERENCES tickets(id),
        "sender_id" integer NOT NULL REFERENCES profiles(id),
        "message" text NOT NULL,
        "is_system" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ ticket_messages');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "invoices" (
        "id" serial PRIMARY KEY,
        "invoice_number" varchar(50) NOT NULL UNIQUE,
        "client_id" integer NOT NULL REFERENCES clients(id),
        "order_id" integer REFERENCES orders(id),
        "issue_date" timestamp DEFAULT now() NOT NULL,
        "due_date" timestamp NOT NULL,
        "total" numeric(15, 2) NOT NULL,
        "status" varchar(50) DEFAULT 'draft',
        "items" jsonb,
        "notes" text,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ invoices');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "projects" (
        "id" serial PRIMARY KEY,
        "public_id" varchar(50) UNIQUE,
        "client_id" integer NOT NULL REFERENCES clients(id),
        "service_id" integer REFERENCES services(id),
        "name" varchar(255) NOT NULL,
        "description" text,
        "status" varchar(50) DEFAULT 'planning',
        "lead_id" text,
        "start_date" timestamp,
        "end_date" timestamp,
        "budget" numeric(15, 2),
        "progress" integer DEFAULT 0,
        "deleted_at" timestamp,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ projects');

    // Level 4: Depends on employees
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "attendance" (
        "id" serial PRIMARY KEY,
        "employee_id" integer REFERENCES employees(id),
        "date" timestamp DEFAULT now(),
        "check_in" timestamp,
        "check_out" timestamp,
        "location" jsonb
      );
    `);
    console.log('   ✓ attendance');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "expenses" (
        "id" serial PRIMARY KEY,
        "employee_id" integer REFERENCES employees(id),
        "amount" numeric(12, 2) NOT NULL,
        "category" varchar(100) NOT NULL,
        "description" text,
        "receipt_url" text,
        "status" varchar(50) DEFAULT 'pending',
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ expenses');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "payslips" (
        "id" serial PRIMARY KEY,
        "employee_id" integer REFERENCES employees(id),
        "month" integer NOT NULL,
        "year" integer NOT NULL,
        "net_salary" numeric(12, 2),
        "status" varchar(50) DEFAULT 'draft',
        "pdf_url" text,
        "created_at" timestamp DEFAULT now(),
        "basic_salary" numeric(12, 2),
        "gross_salary" numeric(12, 2),
        "allowances" jsonb,
        "bonuses" numeric(12, 2),
        "pf_employee" numeric(12, 2),
        "pf_employer" numeric(12, 2),
        "gis_deduction" numeric(12, 2),
        "taxable_income" numeric(12, 2),
        "pit_deduction" numeric(12, 2),
        "additional_deductions" jsonb,
        "payment_date" timestamp,
        "payment_method" varchar(20),
        "generated_at" timestamp DEFAULT now(),
        "notes" text
      );
    `);
    console.log('   ✓ payslips');

    // Level 5: Depends on projects
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "project_tasks" (
        "id" serial PRIMARY KEY,
        "project_id" integer NOT NULL REFERENCES projects(id),
        "assigned_to" text,
        "title" varchar(255) NOT NULL,
        "description" text,
        "status" varchar(50) DEFAULT 'todo',
        "priority" varchar(50) DEFAULT 'medium',
        "due_date" timestamp,
        "estimated_hours" numeric(10, 2),
        "actual_hours" numeric(10, 2),
        "position" integer DEFAULT 0,
        "deleted_at" timestamp,
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ project_tasks');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "project_members" (
        "id" serial PRIMARY KEY,
        "project_id" integer NOT NULL REFERENCES projects(id),
        "user_id" text NOT NULL,
        "role" varchar(50) DEFAULT 'member' NOT NULL,
        "joined_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ project_members');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "project_milestones" (
        "id" serial PRIMARY KEY,
        "project_id" integer NOT NULL REFERENCES projects(id),
        "name" varchar(255) NOT NULL,
        "description" text,
        "status" varchar(50) DEFAULT 'pending',
        "due_date" timestamp,
        "completed_at" timestamp,
        "position" integer DEFAULT 0,
        "deleted_at" timestamp,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ project_milestones');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "task_comments" (
        "id" serial PRIMARY KEY,
        "task_id" integer NOT NULL REFERENCES project_tasks(id),
        "user_id" text NOT NULL,
        "content" text NOT NULL,
        "parent_id" integer,
        "deleted_at" timestamp,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ task_comments');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "task_checklist_items" (
        "id" serial PRIMARY KEY,
        "task_id" integer NOT NULL REFERENCES project_tasks(id),
        "title" varchar(255) NOT NULL,
        "is_completed" boolean DEFAULT false,
        "position" integer DEFAULT 0,
        "deleted_at" timestamp,
        "created_at" timestamp DEFAULT now(),
        "completed_at" timestamp
      );
    `);
    console.log('   ✓ task_checklist_items');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "activity_events" (
        "id" serial PRIMARY KEY,
        "project_id" integer REFERENCES projects(id),
        "user_id" text NOT NULL,
        "event_type" varchar(50) NOT NULL,
        "entity_type" varchar(50),
        "entity_id" integer,
        "metadata" jsonb,
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ activity_events');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "transactions" (
        "id" serial PRIMARY KEY,
        "type" varchar(20) NOT NULL,
        "amount" numeric(15, 2) NOT NULL,
        "category" varchar(100) NOT NULL,
        "reference_id" text,
        "notes" text,
        "date" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ transactions');

    // Level 6: Depends on business_categories, locations, profiles, clients
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "businesses" (
        "id" serial PRIMARY KEY,
        "public_id" varchar(50) NOT NULL UNIQUE,
        "slug" varchar(100) NOT NULL UNIQUE,
        "name" varchar(255) NOT NULL,
        "tagline" varchar(255),
        "description" text,
        "category_id" integer REFERENCES business_categories(id),
        "location_id" integer REFERENCES locations(id),
        "phone" varchar(50),
        "whatsapp" varchar(50),
        "email" varchar(100),
        "website" text,
        "address" text,
        "coordinates" jsonb,
        "logo_url" text,
        "cover_image_url" text,
        "gallery_urls" jsonb,
        "owner_id" integer REFERENCES profiles(id),
        "client_id" integer REFERENCES clients(id),
        "status" varchar(50) DEFAULT 'active',
        "type" varchar(50) DEFAULT 'external',
        "is_verified" boolean DEFAULT false,
        "is_featured" boolean DEFAULT false,
        "rating" numeric(3, 2) DEFAULT 0,
        "review_count" integer DEFAULT 0,
        "meta_title" varchar(100),
        "meta_description" text,
        "keywords" jsonb,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ businesses');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "business_reviews" (
        "id" serial PRIMARY KEY,
        "public_id" varchar(50) NOT NULL UNIQUE,
        "business_id" integer NOT NULL REFERENCES businesses(id),
        "customer_name" varchar(255) NOT NULL,
        "customer_email" varchar(100),
        "order_id" integer REFERENCES orders(id),
        "project_id" integer REFERENCES projects(id),
        "is_verified" boolean DEFAULT false,
        "rating" integer NOT NULL,
        "title" varchar(255),
        "comment" text NOT NULL,
        "response" text,
        "responded_at" timestamp,
        "status" varchar(50) DEFAULT 'published',
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ business_reviews');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "business_hours" (
        "id" serial PRIMARY KEY,
        "business_id" integer NOT NULL REFERENCES businesses(id),
        "day_of_week" integer NOT NULL,
        "open_time" varchar(10),
        "close_time" varchar(10),
        "is_closed" boolean DEFAULT false,
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ business_hours');

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS "business_amenities" (
        "id" serial PRIMARY KEY,
        "business_id" integer NOT NULL REFERENCES businesses(id),
        "amenity_type" varchar(50) NOT NULL,
        "amenity_value" varchar(255) NOT NULL,
        "created_at" timestamp DEFAULT now()
      );
    `);
    console.log('   ✓ business_amenities');

    // Create indexes
    console.log('\n📊 Creating indexes...');

    const indexes = [
      // AMC indexes
      'CREATE INDEX IF NOT EXISTS idx_amcs_client ON amcs(client_id)',
      'CREATE INDEX IF NOT EXISTS idx_amcs_service ON amcs(service_id)',
      'CREATE INDEX IF NOT EXISTS idx_amcs_status ON amcs(status)',
      'CREATE INDEX IF NOT EXISTS idx_amcs_end_date ON amcs(end_date)',
      'CREATE INDEX IF NOT EXISTS idx_amcs_public ON amcs(public_id)',

      // Employee indexes
      'CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status)',
      'CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department)',
      'CREATE INDEX IF NOT EXISTS idx_employees_designation ON employees(designation)',

      // Invoice indexes
      'CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id)',
      'CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)',
      'CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number)',
      'CREATE INDEX IF NOT EXISTS idx_invoices_due ON invoices(due_date)',

      // Payslip indexes
      'CREATE INDEX IF NOT EXISTS idx_payslips_employee_month_year ON payslips(employee_id, month, year)',
      'CREATE INDEX IF NOT EXISTS idx_payslips_status ON payslips(status)',
      'CREATE INDEX IF NOT EXISTS idx_payslips_payment_date ON payslips(payment_date)',

      // Notification indexes
      'CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_entity_type ON notifications(entity_type)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at)',

      // Project indexes
      'CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client_id)',
      'CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)',
      'CREATE INDEX IF NOT EXISTS idx_projects_public ON projects(public_id)',
      'CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON projects(lead_id)',
      'CREATE INDEX IF NOT EXISTS idx_projects_deleted_at ON projects(deleted_at)',

      // Project tasks indexes
      'CREATE INDEX IF NOT EXISTS idx_tasks_project ON project_tasks(project_id)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_status ON project_tasks(status)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_due ON project_tasks(due_date)',
      'CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON project_tasks(assigned_to)',
      'CREATE INDEX IF NOT EXISTS idx_project_tasks_deleted_at ON project_tasks(deleted_at)',

      // Project members indexes
      'CREATE INDEX IF NOT EXISTS idx_project_members_project_user ON project_members(project_id, user_id)',
      'CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id)',

      // Milestones indexes
      'CREATE INDEX IF NOT EXISTS idx_milestones_project ON project_milestones(project_id)',
      'CREATE INDEX IF NOT EXISTS idx_milestones_status ON project_milestones(status)',
      'CREATE INDEX IF NOT EXISTS idx_milestones_due_date ON project_milestones(due_date)',
      'CREATE INDEX IF NOT EXISTS idx_milestones_deleted_at ON project_milestones(deleted_at)',

      // Task comments indexes
      'CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id)',
      'CREATE INDEX IF NOT EXISTS idx_task_comments_user ON task_comments(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_task_comments_parent ON task_comments(parent_id)',
      'CREATE INDEX IF NOT EXISTS idx_task_comments_deleted_at ON task_comments(deleted_at)',

      // Checklist items indexes
      'CREATE INDEX IF NOT EXISTS idx_checklist_items_task ON task_checklist_items(task_id)',
      'CREATE INDEX IF NOT EXISTS idx_checklist_items_deleted_at ON task_checklist_items(deleted_at)',

      // Activity events indexes
      'CREATE INDEX IF NOT EXISTS idx_activity_events_project ON activity_events(project_id)',
      'CREATE INDEX IF NOT EXISTS idx_activity_events_user ON activity_events(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_activity_events_created ON activity_events(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_activity_events_entity_type ON activity_events(entity_type)',
    ];

    for (const idx of indexes) {
      await sql.unsafe(idx);
    }
    console.log('   ✓ Indexes created');

    // Verify
    const tables = await sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log('\n✅ Schema push complete!');
    console.log(`📊 Total tables: ${tables.length}`);
    console.log('Tables:', tables.map(t => t.tablename).join(', '));

    console.log('\n📝 Next steps:');
    console.log('   1. Run: npm run db:rls (to add RLS policies)');
    console.log('   2. Run: npm run db:migrate (if using seed data)');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await sql.end();
  }
}

pushSchema();
