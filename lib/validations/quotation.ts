import { z } from "zod";
import { productCategorySchema } from "@/lib/validations/productMaster";

export const quotationStatusSchema = z.enum([
  "draft",
  "sent",
  "advance_paid",
  "converted",
  "cancelled",
]);

export const quotationItemSchema = z.object({
  productMasterId: z.number().int().positive().optional().nullable(),
  name: z.string().min(1, "Item name is required").max(255),
  brand: z.string().max(100).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  quantity: z.coerce.number().int().positive("Quantity must be positive"),
  unitPrice: z.coerce.number().min(0, "Unit price must be >= 0"),
});

export const createQuotationSchema = z.object({
  category: productCategorySchema,
  clientId: z.number().int().positive().optional().nullable(),
  customerName: z.string().max(255).optional().nullable(),
  businessName: z.string().max(255).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z
    .union([z.string().email(), z.literal("")])
    .optional()
    .nullable(),
  address: z.string().optional().nullable(),
  address2: z.string().optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  quotationFor: z.string().optional().nullable(),
  validityDays: z.coerce.number().int().positive().optional().default(15),
  advancePercent: z.coerce.number().min(0).max(100).optional().default(50),
  notes: z.string().max(5000).optional().nullable(),
  items: z.array(quotationItemSchema).min(1, "At least one item is required"),
});

export const updateQuotationStatusSchema = z.object({
  status: quotationStatusSchema,
});

export const markAdvancePaidSchema = z.object({
  proofUrl: z.string().url().optional().nullable(),
});

export const quotationQuerySchema = z.object({
  category: productCategorySchema.optional(),
  status: quotationStatusSchema.optional(),
  clientId: z.coerce.number().int().positive().optional(),
  search: z.string().max(255).optional(),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationStatusInput = z.infer<typeof updateQuotationStatusSchema>;
export type MarkAdvancePaidInput = z.infer<typeof markAdvancePaidSchema>;
export type QuotationQueryInput = z.infer<typeof quotationQuerySchema>;
export type QuotationStatus = z.infer<typeof quotationStatusSchema>;
export type QuotationItemInput = z.infer<typeof quotationItemSchema>;
