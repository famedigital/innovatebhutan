ALTER TABLE "project_tasks" ADD COLUMN "due_date" timestamp;--> statement-breakpoint
ALTER TABLE "project_tasks" ADD COLUMN "estimated_hours" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "project_tasks" ADD COLUMN "actual_hours" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "public_id" varchar(50);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "budget" numeric(15, 2);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "progress" integer DEFAULT 0;--> statement-breakpoint
CREATE INDEX "idx_tasks_project" ON "project_tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_tasks_assigned" ON "project_tasks" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "idx_tasks_status" ON "project_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tasks_due" ON "project_tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_projects_client" ON "projects" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_projects_status" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_projects_lead" ON "projects" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "idx_projects_public" ON "projects" USING btree ("public_id");--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_public_id_unique" UNIQUE("public_id");