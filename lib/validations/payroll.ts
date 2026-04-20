import { z } from "zod";
import {
  PAYSLIP_STATUS,
  PAYMENT_METHODS,
  EMPLOYEE_STATUS,
  type PayslipStatus,
  type PaymentMethod,
  type EmployeeStatus,
} from "@/lib/config/taxConstants";

// ==================== EMPLOYEE SCHEMAS ====================

export const employeeStatusSchema: z.ZodEnum<[EmployeeStatus, EmployeeStatus, EmployeeStatus, EmployeeStatus]> =
  z.enum(["active", "inactive", "terminated", "on_leave"]);

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
  agreementsDocUrl: z.string().url().optional().or(z.literal("")),
  joiningLetterUrl: z.string().url().optional().or(z.literal("")),
});

export const employeeQuerySchema = z.object({
  status: employeeStatusSchema.optional(),
  department: z.string().max(100).optional(),
  search: z.string().max(255).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ==================== PAYSLIP SCHEMAS ====================

export const payslipStatusSchema: z.ZodEnum<[PayslipStatus, PayslipStatus, PayslipStatus, PayslipStatus]> =
  z.enum(["draft", "approved", "paid", "cancelled"]);

export const paymentMethodSchema: z.ZodEnum<[PaymentMethod, PaymentMethod, PaymentMethod]> =
  z.enum(["bank", "cash", "cheque"]);

// Allowance breakdown schema
export const allowancesSchema = z.object({
  rent: z.number().nonnegative().optional(),
  transport: z.number().nonnegative().optional(),
  entertainment: z.number().nonnegative().optional(),
  medical: z.number().nonnegative().optional(),
  other: z.number().nonnegative().optional(),
});

// Additional deductions schema
export const deductionsSchema = z.object({
  advance: z.number().nonnegative().optional(),
  loan: z.number().nonnegative().optional(),
  other: z.number().nonnegative().optional(),
});

// Generate payslip for an employee
export const generatePayrollSchema = z.object({
  employeeId: z.number().int().positive("Employee ID is required"),
  month: z.number().int().min(1, "Month must be between 1 and 12").max(12, "Month must be between 1 and 12"),
  year: z.number().int().min(2020, "Year must be 2020 or later").max(2100, "Invalid year"),
  allowances: allowancesSchema.optional(),
  bonuses: z.number().nonnegative("Bonus cannot be negative").optional(),
  deductions: deductionsSchema.optional(),
  workingDays: z.number().int().positive().max(31).optional(),
  paidLeaveDays: z.number().int().nonnegative().max(31).optional(),
  unpaidLeaveDays: z.number().int().nonnegative().max(31).optional(),
  overtimeHours: z.number().nonnegative().optional(),
});

// Generate payroll for multiple employees (batch)
export const batchPayrollSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  employeeIds: z.array(z.number().int().positive()).min(1, "At least one employee ID required").optional(),
  generateForAll: z.boolean().default(false),
  skipExisting: z.boolean().default(true),
});

// Approve payslip
export const approvePayrollSchema = z.object({
  payslipId: z.number().int().positive("Payslip ID is required"),
  approverId: z.string().min(1, "Approver ID is required"),
  notes: z.string().max(1000).optional(),
});

// Mark payslip as paid
export const markPaidPayrollSchema = z.object({
  payslipId: z.number().int().positive("Payslip ID is required"),
  paymentMethod: paymentMethodSchema,
  paymentDate: z.coerce.date().optional(),
  transactionReference: z.string().max(100).optional(),
  notes: z.string().max(1000).optional(),
});

// Update payslip
export const updatePayslipSchema = z.object({
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2020).max(2100).optional(),
  basicSalary: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid salary format").optional(),
  allowances: allowancesSchema.optional(),
  bonuses: z.number().nonnegative().optional(),
  deductions: deductionsSchema.optional(),
  status: payslipStatusSchema.optional(),
  paymentMethod: paymentMethodSchema.optional(),
  paymentDate: z.coerce.date().optional(),
  notes: z.string().max(2000).optional(),
});

// Query payslips
export const payslipQuerySchema = z.object({
  employeeId: z.coerce.number().int().positive().optional(),
  status: payslipStatusSchema.optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  department: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Payslip summary calculation
export const payslipSummarySchema = z.object({
  employeeId: z.number().int().positive(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// ==================== EXPORT TYPES ====================

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type EmployeeQueryInput = z.infer<typeof employeeQuerySchema>;

export type GeneratePayrollInput = z.infer<typeof generatePayrollSchema>;
export type BatchPayrollInput = z.infer<typeof batchPayrollSchema>;
export type ApprovePayrollInput = z.infer<typeof approvePayrollSchema>;
export type MarkPaidPayrollInput = z.infer<typeof markPaidPayrollSchema>;
export type UpdatePayslipInput = z.infer<typeof updatePayslipSchema>;
export type PayslipQueryInput = z.infer<typeof payslipQuerySchema>;
export type PayslipSummaryInput = z.infer<typeof payslipSummarySchema>;

// Re-export types from config for convenience
export type { Allowances, AdditionalDeductions, PayslipBreakdown } from "@/lib/config/taxConstants";
