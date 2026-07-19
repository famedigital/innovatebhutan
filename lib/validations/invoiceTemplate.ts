import { z } from "zod";

export const productKeySchema = z.enum(["rancelab", "website", "cctv"]);

export const invoiceTemplateDesignSchema = z.object({
  logoUrl: z.string().nullable().optional(),
  companyName: z.string().min(1).max(255),
  companyAddress: z.string().min(1).max(1000),
  companyPhone: z.string().max(50).optional(),
  companyEmail: z.string().max(255).optional(),
  gstTin: z.string().max(100).optional(),
  documentTitle: z.string().min(1).max(100),
  accentColor: z.string().min(1).max(30),
  numberPrefix: z.string().min(1).max(40),
  numberPattern: z.string().min(1).max(80),
  gstRate: z.number().min(0).max(1),
  dealerNotice: z.string().max(2000),
  paymentTerms: z.string().max(2000),
  termsAndConditions: z.array(z.string().max(500)).min(1).max(30),
  footerNote: z.string().max(500).optional(),
});

export const createInvoiceTemplateSchema = z.object({
  productKey: productKeySchema,
  name: z.string().min(1).max(255).optional(),
  design: invoiceTemplateDesignSchema,
  activate: z.boolean().default(true),
});

export const activateTemplateSchema = z.object({
  activate: z.literal(true),
});

export type InvoiceTemplateDesignInput = z.infer<typeof invoiceTemplateDesignSchema>;
export type CreateInvoiceTemplateInput = z.infer<typeof createInvoiceTemplateSchema>;
