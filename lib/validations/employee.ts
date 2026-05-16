import { z } from "zod";

// ==================== EMPLOYEE STATUS ENUM ====================

export const employeeStatusSchema = z.enum(["active", "inactive", "terminated", "on_leave"]);
export type EmployeeStatus = z.infer<typeof employeeStatusSchema>;

// ==================== EMPLOYEE SCHEMAS ====================

export const createEmployeeSchema = z.object({
  profileId: z.number().int().positive("Profile ID is required"),
  designation: z.string().min(1, "Designation is required").max(100, "Designation too long"),
  baseSalary: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid salary format").optional(),
  department: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email("Invalid email format").optional(),
  tin: z.string().max(20, "TIN too long").optional(),
  pfNumber: z.string().max(30, "PF number too long").optional(),
  bankAccountNumber: z.string().max(30, "Account number too long").optional(),
  bankName: z.string().max(100).optional(),
  bankBranch: z.string().max(100).optional(),
  status: employeeStatusSchema.optional(),
  joinDate: z.coerce.date().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  nationalIdMasked: z.string().max(20).optional(),
  interviewScore: z.number().int().min(0).max(100).optional(),
  agreementsDocUrl: z.string().url().optional().or(z.literal("")),
  joiningLetterUrl: z.string().url().optional().or(z.literal("")),
});

export const updateEmployeeSchema = z.object({
  designation: z.string().min(1).max(100).optional(),
  baseSalary: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid salary format").optional(),
  department: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email("Invalid email format").optional(),
  tin: z.string().max(20).optional(),
  pfNumber: z.string().max(30).optional(),
  bankAccountNumber: z.string().max(30).optional(),
  bankName: z.string().max(100).optional(),
  bankBranch: z.string().max(100).optional(),
  status: employeeStatusSchema.optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  nationalIdMasked: z.string().max(20).optional(),
  interviewScore: z.number().int().min(0).max(100).optional(),
  agreementsDocUrl: z.string().url().optional().or(z.literal("")),
  joiningLetterUrl: z.string().url().optional().or(z.literal("")),
});

export const employeeQuerySchema = z.object({
  status: employeeStatusSchema.optional(),
  department: z.string().max(100).optional(),
  designation: z.string().max(100).optional(),
  search: z.string().max(255).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const employeeStatusTransitionSchema = z.object({
  status: employeeStatusSchema,
  reason: z.string().max(500).optional(),
});

// ==================== EXPORT TYPES ====================

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type EmployeeQueryInput = z.infer<typeof employeeQuerySchema>;
export type EmployeeStatusTransitionInput = z.infer<typeof employeeStatusTransitionSchema>;
