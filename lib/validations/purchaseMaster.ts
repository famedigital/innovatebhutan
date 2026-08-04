import { z } from "zod";

export const purchasePaymentTimelineSchema = z.enum(["cash", "credit", "days"]);
export const purchaseStatusSchema = z.enum(["draft", "saved", "cancelled"]);

export const purchaseMasterItemSchema = z.object({
  productName: z.string().min(1, "Product name is required").max(255),
  productMasterId: z.number().int().positive().optional().nullable(),
  quantity: z.coerce.number().int().positive("Quantity must be positive"),
  costPrice: z.coerce.number().min(0),
  taxAmount: z.coerce.number().min(0).optional().default(0),
  mrp: z.coerce.number().min(0).optional().nullable(),
});

export const createPurchaseMasterSchema = z.object({
  supplierName: z.string().min(1, "Supplier name is required").max(255),
  supplierId: z.number().int().positive().optional().nullable(),
  billReferenceNo: z.string().max(100).optional().nullable(),
  purchaseDate: z.coerce.date().optional(),
  paymentTimeline: purchasePaymentTimelineSchema.optional().default("cash"),
  creditDays: z.coerce.number().int().min(0).optional().default(0),
  advancePayment: z.coerce.number().min(0).optional().default(0),
  totalPurchaseAmount: z.coerce.number().min(0).optional().default(0),
  gstPaid: z.coerce.number().min(0).optional().default(0),
  declarationFees: z.coerce.number().min(0).optional().default(0),
  freightCharges: z.coerce.number().min(0).optional().default(0),
  totalFreightCharges: z.coerce.number().min(0).optional().default(0),
  salesRate: z.coerce.number().min(0).optional().nullable(),
  status: purchaseStatusSchema.optional().default("draft"),
  invoiceUploadUrl: z.string().url().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  items: z.array(purchaseMasterItemSchema).min(1, "At least one item is required"),
});

export const updatePurchaseMasterSchema = z.object({
  supplierName: z.string().min(1).max(255).optional(),
  supplierId: z.number().int().positive().optional().nullable(),
  billReferenceNo: z.string().max(100).optional().nullable(),
  purchaseDate: z.coerce.date().optional(),
  paymentTimeline: purchasePaymentTimelineSchema.optional(),
  creditDays: z.coerce.number().int().min(0).optional(),
  advancePayment: z.coerce.number().min(0).optional(),
  totalPurchaseAmount: z.coerce.number().min(0).optional(),
  gstPaid: z.coerce.number().min(0).optional(),
  declarationFees: z.coerce.number().min(0).optional(),
  freightCharges: z.coerce.number().min(0).optional(),
  totalFreightCharges: z.coerce.number().min(0).optional(),
  salesRate: z.coerce.number().min(0).optional().nullable(),
  status: purchaseStatusSchema.optional(),
  invoiceUploadUrl: z.string().url().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  items: z.array(purchaseMasterItemSchema).min(1).optional(),
});

export const purchaseMasterQuerySchema = z.object({
  status: purchaseStatusSchema.optional(),
  search: z.string().max(255).optional(),
});

export type CreatePurchaseMasterInput = z.infer<typeof createPurchaseMasterSchema>;
export type UpdatePurchaseMasterInput = z.infer<typeof updatePurchaseMasterSchema>;
export type PurchaseMasterQueryInput = z.infer<typeof purchaseMasterQuerySchema>;
