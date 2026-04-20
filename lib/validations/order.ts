import { z } from "zod";

// ==================== ORDER SCHEMAS ====================

export const orderStatusSchema = z.enum(["pending", "deploying", "complete", "cancelled"]);

export const createOrderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required").max(255, "Customer name too long"),
  customerPhone: z.string().min(1, "Customer phone is required").max(50, "Phone number too long"),
  customerLocation: z.string().max(255).optional(),
  status: orderStatusSchema.optional(),
  totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format").optional(),
  meta: z.record(z.any()).optional(),
  items: z.array(z.object({
    serviceId: z.number().int().positive("Service ID is required"),
    quantity: z.number().int().positive("Quantity must be positive").default(1),
    unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid unit price format"),
  })).min(1, "At least one item is required"),
});

export const updateOrderSchema = z.object({
  customerName: z.string().min(1).max(255).optional(),
  customerPhone: z.string().min(1).max(50).optional(),
  customerLocation: z.string().max(255).optional(),
  status: orderStatusSchema.optional(),
  totalAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format").optional(),
  meta: z.record(z.any()).optional(),
});

export const orderQuerySchema = z.object({
  status: orderStatusSchema.optional(),
  search: z.string().max(255).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ==================== ORDER ITEM SCHEMAS ====================

export const createOrderItemSchema = z.object({
  orderId: z.number().int().positive("Order ID is required"),
  serviceId: z.number().int().positive("Service ID is required"),
  quantity: z.number().int().positive("Quantity must be positive").default(1),
  unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid unit price format"),
});

export const updateOrderItemSchema = z.object({
  serviceId: z.number().int().positive().optional(),
  quantity: z.number().int().positive().optional(),
  unitPrice: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
});

// ==================== EXPORT TYPES ====================

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;
export type UpdateOrderItemInput = z.infer<typeof updateOrderItemSchema>;
