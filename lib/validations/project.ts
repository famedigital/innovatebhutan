import { z } from "zod";

// ==================== PROJECT SCHEMAS ====================

export const projectStatusSchema = z.enum(["planning", "active", "testing", "complete", "on_hold", "cancelled"]);

export const createProjectSchema = z.object({
  clientId: z.number().int().positive("Client ID is required"),
  serviceId: z.number().int().positive().optional(),
  name: z.string().min(1, "Project name is required").max(255, "Project name too long"),
  description: z.string().max(5000, "Description too long").optional(),
  leadId: z.string().optional(), // User ID (string) from Supabase Auth
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  budget: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid budget format").optional(),
});

export const updateProjectSchema = z.object({
  serviceId: z.number().int().positive().optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  status: projectStatusSchema.optional(),
  leadId: z.string().optional(), // User ID (string) from Supabase Auth
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  budget: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid budget format").optional(),
});

export const projectQuerySchema = z.object({
  clientId: z.coerce.number().int().positive().optional(),
  status: projectStatusSchema.optional(),
  leadId: z.string().optional(), // User ID (string) from Supabase Auth
  search: z.string().max(255).optional(),
  startDateFrom: z.coerce.date().optional(),
  startDateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ==================== TASK SCHEMAS ====================

export const taskStatusSchema = z.enum(["todo", "in_progress", "done", "blocked"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

export const createTaskSchema = z.object({
  projectId: z.number().int().positive("Project ID is required"),
  assignedTo: z.string().optional(), // User ID (string) from Supabase Auth
  title: z.string().min(1, "Task title is required").max(255, "Title too long"),
  description: z.string().max(5000).optional(),
  priority: taskPrioritySchema.optional(),
  dueDate: z.coerce.date().optional(),
  estimatedHours: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid hours format").optional(),
});

export const updateTaskSchema = z.object({
  assignedTo: z.string().optional(), // User ID (string) from Supabase Auth
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  dueDate: z.coerce.date().optional(),
  estimatedHours: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid hours format").optional(),
  actualHours: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid hours format").optional(),
});

export const bulkTaskUpdateSchema = z.object({
  taskIds: z.array(z.number().int().positive()).min(1, "At least one task ID required"),
  status: taskStatusSchema,
});

export const bulkCreateTasksSchema = z.object({
  tasks: z.array(
    z.object({
      assignedTo: z.string().optional(), // User ID (string) from Supabase Auth
      title: z.string().min(1).max(255),
      description: z.string().max(5000).optional(),
      priority: taskPrioritySchema.optional(),
      dueDate: z.coerce.date().optional(),
      estimatedHours: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    })
  ).min(1, "At least one task required"),
});

// ==================== EXPORT TYPES ====================

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type BulkTaskUpdateInput = z.infer<typeof bulkTaskUpdateSchema>;
export type BulkCreateTasksInput = z.infer<typeof bulkCreateTasksSchema>;
