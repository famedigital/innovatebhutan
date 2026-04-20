-- Create projects table
CREATE TABLE IF NOT EXISTS "projects" (
  "id" serial PRIMARY KEY,
  "public_id" varchar(50) UNIQUE,
  "client_id" integer NOT NULL REFERENCES "clients"("id"),
  "service_id" integer REFERENCES "services"("id"),
  "name" varchar(255) NOT NULL,
  "description" text,
  "status" varchar(50) DEFAULT 'planning',
  "lead_id" integer REFERENCES "profiles"("id"),
  "start_date" timestamp,
  "end_date" timestamp,
  "budget" numeric(15, 2),
  "progress" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS "project_tasks" (
  "id" serial PRIMARY KEY,
  "project_id" integer NOT NULL REFERENCES "projects"("id"),
  "assigned_to" integer REFERENCES "profiles"("id"),
  "title" varchar(255) NOT NULL,
  "description" text,
  "status" varchar(50) DEFAULT 'todo',
  "priority" varchar(50) DEFAULT 'medium',
  "due_date" timestamp,
  "estimated_hours" numeric(10, 2),
  "actual_hours" numeric(10, 2),
  "created_at" timestamp DEFAULT now()
);

-- Create indexes for projects
CREATE INDEX IF NOT EXISTS "idx_projects_client" ON "projects" USING btree ("client_id");
CREATE INDEX IF NOT EXISTS "idx_projects_status" ON "projects" USING btree ("status");
CREATE INDEX IF NOT EXISTS "idx_projects_lead" ON "projects" USING btree ("lead_id");
CREATE INDEX IF NOT EXISTS "idx_projects_public" ON "projects" USING btree ("public_id");

-- Create indexes for project_tasks
CREATE INDEX IF NOT EXISTS "idx_tasks_project" ON "project_tasks" USING btree ("project_id");
CREATE INDEX IF NOT EXISTS "idx_tasks_assigned" ON "project_tasks" USING btree ("assigned_to");
CREATE INDEX IF NOT EXISTS "idx_tasks_status" ON "project_tasks" USING btree ("status");
CREATE INDEX IF NOT EXISTS "idx_tasks_due" ON "project_tasks" USING btree ("due_date");
