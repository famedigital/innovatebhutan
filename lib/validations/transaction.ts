import { z } from "zod";

// ==================== TRANSACTION SCHEMAS ====================

export const transactionTypeSchema = z.enum(["INCOME", "EXPENSE"]);

export const transactionCategorySchema = z.enum([
  // Income categories
  "service_revenue",
  "product_sales",
  "consulting_fees",
  "amc_payment",
  "project_payment",
  "other_income",
  // Expense categories
  "salary",
  "rent",
  "utilities",
  "supplies",
  "equipment",
  "travel",
  "marketing",
  "software",
  "insurance",
  "taxes",
  "other_expense",
]);

export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format").min(0.01, "Amount must be greater than 0"),
  category: transactionCategorySchema,
  referenceId: z.string().max(255).optional(),
  notes: z.string().max(2000).optional(),
  date: z.coerce.date().optional(),
});

export const updateTransactionSchema = z.object({
  type: transactionTypeSchema.optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format").min(0.01).optional(),
  category: transactionCategorySchema.optional(),
  referenceId: z.string().max(255).optional(),
  notes: z.string().max(2000).optional(),
  date: z.coerce.date().optional(),
});

export const transactionQuerySchema = z.object({
  type: transactionTypeSchema.optional(),
  category: transactionCategorySchema.optional(),
  search: z.string().max(255).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const reconcileTransactionSchema = z.object({
  action: z.enum(["reconcile", "unreconcile"]),
  notes: z.string().max(500).optional(),
});

// ==================== EXPORT TYPES ====================

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>;
export type ReconcileTransactionInput = z.infer<typeof reconcileTransactionSchema>;
export type TransactionType = z.infer<typeof transactionTypeSchema>;
export type TransactionCategory = z.infer<typeof transactionCategorySchema>;
