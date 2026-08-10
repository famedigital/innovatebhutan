import { z } from "zod";

export const productCategorySchema = z.enum([
  "software",
  "hardware",
  "supply",
  "services",
]);

export const productMasterStatusSchema = z.enum(["pending", "completed"]);

export const createProductMasterSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  category: productCategorySchema,
  brand: z.string().max(100).optional().nullable(),
  sku: z.string().max(100).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  unitPrice: z.coerce.number().min(0).default(0),
  unit: z.string().max(50).optional().default("pcs"),
  masterStatus: productMasterStatusSchema.optional().default("pending"),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.coerce.number().int().optional().default(0),
});

export const updateProductMasterSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: productCategorySchema.optional(),
  brand: z.string().max(100).optional().nullable(),
  sku: z.string().max(100).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  unitPrice: z.coerce.number().min(0).optional(),
  unit: z.string().max(50).optional(),
  masterStatus: productMasterStatusSchema.optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional(),
});

export const productMasterQuerySchema = z.object({
  category: productCategorySchema.optional(),
  search: z.string().max(255).optional(),
  active: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  limit: z.coerce.number().int().min(1).max(1000).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export type CreateProductMasterInput = z.infer<typeof createProductMasterSchema>;
export type UpdateProductMasterInput = z.infer<typeof updateProductMasterSchema>;
export type ProductMasterQueryInput = z.infer<typeof productMasterQuerySchema>;
export type ProductCategory = z.infer<typeof productCategorySchema>;
