import { z } from "zod";

// ==================== PROJECT SCHEMAS (ERP bible Wave A) ====================

export const projectStatusSchema = z.enum([
  "needs_quote",
  "quoted",
  "demo",
  "advance_paid",
  "in_progress",
  "testing",
  "done",
  "on_hold",
  "cancelled",
  // Legacy aliases still accepted on input
  "planning",
  "active",
  "complete",
]);

export const productKeySchema = z.enum([
  "rancelab",
  "pelbu_pos",
  "website",
  "cctv",
  "networking",
]);

export const paymentMethodSchema = z.enum(["mbob", "cheque", "other"]);

export const createProjectSchema = z.object({
  clientId: z.number().int().positive("Client ID is required"),
  serviceId: z.number().int().positive().optional(),
  name: z.string().min(1, "Project name is required").max(255, "Project name too long"),
  description: z.string().max(5000, "Description too long").optional(),
  leadId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  budget: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid budget format").optional(),
  productKey: productKeySchema.optional(),
  /** Quoted amount in Nu. Omit → Needs quote (tech intake). */
  quotedAmount: z.number().positive().optional(),
  advancePercent: z.number().min(0).max(100).optional(),
  createInvoice: z.boolean().optional().default(true),
});

export const updateProjectSchema = z.object({
  serviceId: z.number().int().positive().optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  status: projectStatusSchema.optional(),
  leadId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  budget: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid budget format").optional(),
  productKey: productKeySchema.optional(),
  holdReason: z.string().max(2000).optional(),
  cancelReason: z.string().max(2000).optional(),
  refundStatus: z.enum(["refunded", "non_refundable", "none"]).optional(),
  overrideAdvanceGate: z.boolean().optional(),
  freeSupportDays: z.number().int().min(0).max(365).optional(),
  quotedAmount: z.number().positive().optional(),
  advancePercent: z.number().min(0).max(100).optional(),
  priceChangeReason: z.string().max(2000).optional(),
});

export const recordPaymentSchema = z.object({
  slot: z.enum(["advance", "balance"]),
  amount: z.number().positive(),
  method: paymentMethodSchema,
  proofUrl: z.string().url().optional().or(z.literal("")),
  paidAt: z.coerce.date().optional(),
});

export const writeOffSchema = z.object({
  amount: z.number().positive(),
  reason: z.string().min(1).max(2000),
});

export const projectQuerySchema = z.object({
  clientId: z.coerce.number().int().positive().optional(),
  status: projectStatusSchema.optional(),
  leadId: z.string().optional(),
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
  assignedTo: z.string().optional(),
  title: z.string().min(1, "Task title is required").max(255, "Title too long"),
  description: z.string().max(5000).optional(),
  priority: taskPrioritySchema.optional(),
  dueDate: z.coerce.date().optional(),
  estimatedHours: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid hours format").optional(),
});

export const updateTaskSchema = z.object({
  assignedTo: z.string().optional(),
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
      assignedTo: z.string().optional(),
      title: z.string().min(1).max(255),
      description: z.string().max(5000).optional(),
      priority: taskPrioritySchema.optional(),
      dueDate: z.coerce.date().optional(),
      estimatedHours: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
    })
  ).min(1, "At least one task required"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryInput = z.infer<typeof projectQuerySchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type BulkTaskUpdateInput = z.infer<typeof bulkTaskUpdateSchema>;
export type BulkCreateTasksInput = z.infer<typeof bulkCreateTasksSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type WriteOffInput = z.infer<typeof writeOffSchema>;
