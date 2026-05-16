import { z } from "zod";

// ==================== EXPENSE SCHEMAS ====================

export const expenseStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const expenseCategorySchema = z.enum([
  "travel",
  "accommodation",
  "meals",
  "supplies",
  "equipment",
  "transportation",
  "utilities",
  "communication",
  "training",
  "entertainment",
  "medical",
  "other",
]);

export const createExpenseSchema = z.object({
  employeeId: z.number().int().positive("Employee ID is required").optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format").min(0.01, "Amount must be greater than 0"),
  category: expenseCategorySchema,
  description: z.string().min(1, "Description is required").max(1000, "Description too long"),
  receiptUrl: z.string().url("Invalid receipt URL").optional(),
  status: expenseStatusSchema.optional(),
  notes: z.string().max(2000).optional(),
});

export const updateExpenseSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format").min(0.01).optional(),
  category: expenseCategorySchema.optional(),
  description: z.string().min(1).max(1000).optional(),
  receiptUrl: z.string().url().optional(),
  status: expenseStatusSchema.optional(),
  notes: z.string().max(2000).optional(),
});

export const expenseQuerySchema = z.object({
  status: expenseStatusSchema.optional(),
  category: expenseCategorySchema.optional(),
  employeeId: z.coerce.number().int().positive().optional(),
  search: z.string().max(255).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const expenseActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  notes: z.string().max(500).optional(),
});

// ==================== EXPORT TYPES ====================

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseQueryInput = z.infer<typeof expenseQuerySchema>;
export type ExpenseActionInput = z.infer<typeof expenseActionSchema>;
export type ExpenseStatus = z.infer<typeof expenseStatusSchema>;
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;
