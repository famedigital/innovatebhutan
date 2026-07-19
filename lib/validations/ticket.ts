import { z } from "zod";

export const ticketStatusSchema = z.enum([
  "open",
  "started",
  "in_progress",
  "resolved",
  "closed",
]);
export const ticketPrioritySchema = z.enum(["low", "medium", "high"]);
export const ticketProductSchema = z.enum(["rancelab", "website", "cctv"]);
export const ticketSourceSchema = z.enum(["call_centre", "whatsapp", "portal"]);

export const createTicketSchema = z.object({
  clientId: z.number().int().positive(),
  subject: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  priority: ticketPrioritySchema.default("medium"),
  assignedTo: z.number().int().positive().optional(),
  productKey: ticketProductSchema.optional(),
  source: ticketSourceSchema.optional(),
  /** After create: assign + start + return WA group notify payload */
  startAndNotify: z.boolean().optional(),
});

export const updateTicketSchema = z.object({
  subject: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  assignedTo: z.number().int().positive().nullable().optional(),
  productKey: ticketProductSchema.optional(),
});

export const createTicketMessageSchema = z.object({
  message: z.string().min(1).max(5000),
});

export const ticketQuerySchema = z.object({
  status: ticketStatusSchema.optional(),
  priority: ticketPrioritySchema.optional(),
  clientId: z.coerce.number().int().positive().optional(),
  assignedTo: z.coerce.number().int().positive().optional(),
  productKey: ticketProductSchema.optional(),
  queue: z
    .enum(["mine", "unassigned", "started", "in_progress", "resolved", "all"])
    .optional(),
  search: z.string().max(255).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
