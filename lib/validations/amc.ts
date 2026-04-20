import { z } from "zod";

// ==================== AMC SCHEMAS ====================

export const amcStatusSchema = z.enum(["active", "expiring", "expired", "cancelled"]);

export const createAMCSchema = z.object({
  clientId: z.number().int().positive("Client ID is required"),
  serviceId: z.number().int().positive().optional(),
  contractNumber: z.string().min(1, "Contract number is required").max(100, "Contract number too long"),
  startDate: z.coerce.date({ required_error: "Start date is required" }),
  endDate: z.coerce.date({ required_error: "End date is required" }),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format. Use format: 50000 or 50000.50"),
  hardwareDetails: z.record(z.any()).optional(),
  servicesIncluded: z.array(z.string()).optional(),
  notes: z.string().max(5000, "Notes too long").optional(),
  status: amcStatusSchema.optional(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: "End date must be after start date", path: ["endDate"] }
);

export const updateAMCSchema = z.object({
  serviceId: z.number().int().positive().optional(),
  contractNumber: z.string().min(1).max(100).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format").optional(),
  hardwareDetails: z.record(z.any()).optional(),
  servicesIncluded: z.array(z.string()).optional(),
  notes: z.string().max(5000).optional(),
  status: amcStatusSchema.optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  { message: "End date must be after start date", path: ["endDate"] }
);

export const renewAMCSchema = z.object({
  startDate: z.coerce.date({ required_error: "Start date is required" }),
  endDate: z.coerce.date({ required_error: "End date is required" }),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format"),
  copyHardwareDetails: z.boolean().default(true),
  copyServicesIncluded: z.boolean().default(true),
  notes: z.string().max(5000).optional(),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: "End date must be after start date", path: ["endDate"] }
);

export const amcQuerySchema = z.object({
  clientId: z.coerce.number().int().positive().optional(),
  serviceId: z.coerce.number().int().positive().optional(),
  status: amcStatusSchema.optional(),
  search: z.string().max(255).optional(),
  expiringWithinDays: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const updateAMCStatusSchema = z.object({
  status: amcStatusSchema,
});

// ==================== EXPORT TYPES ====================

export type CreateAMCInput = z.infer<typeof createAMCSchema>;
export type UpdateAMCInput = z.infer<typeof updateAMCSchema>;
export type RenewAMCInput = z.infer<typeof renewAMCSchema>;
export type AMCQueryInput = z.infer<typeof amcQuerySchema>;
export type UpdateAMCStatusInput = z.infer<typeof updateAMCStatusSchema>;
export type AMCStatus = z.infer<typeof amcStatusSchema>;
