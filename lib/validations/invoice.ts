import { z } from "zod";

// ==================== INVOICE SCHEMAS ====================

export const invoiceStatusSchema = z.enum(["draft", "sent", "paid", "overdue", "cancelled"]);

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  rate: z.number().positive("Rate must be positive"),
  amount: z.number().positive(), // Calculated field (quantity × rate)
});

export const createInvoiceSchema = z.object({
  clientId: z.number().int().positive("Client ID is required"),
  orderId: z.number().int().positive().optional(),
  issueDate: z.coerce.date().default(new Date()),
  dueDate: z.coerce.date({ required_error: "Due date is required" }),
  notes: z.string().max(5000, "Notes too long").optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item required"),
  status: invoiceStatusSchema.default("draft"),
}).refine(
  (data) => new Date(data.dueDate) >= new Date(data.issueDate),
  { message: "Due date must be on or after issue date" }
);

export const updateInvoiceSchema = z.object({
  orderId: z.number().int().positive().optional(),
  issueDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  notes: z.string().max(5000).optional(),
  items: z.array(invoiceItemSchema).min(1).optional(),
}).refine(
  (data) => {
    if (data.issueDate && data.dueDate) {
      return new Date(data.dueDate) >= new Date(data.issueDate);
    }
    return true;
  },
  { message: "Due date must be on or after issue date" }
);

export const updateInvoiceStatusSchema = z.object({
  status: invoiceStatusSchema,
});

export const invoiceQuerySchema = z.object({
  clientId: z.coerce.number().int().positive().optional(),
  status: invoiceStatusSchema.optional(),
  search: z.string().max(255).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ==================== EXPORT TYPES ====================

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type UpdateInvoiceStatusInput = z.infer<typeof updateInvoiceStatusSchema>;
export type InvoiceQueryInput = z.infer<typeof invoiceQuerySchema>;
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
