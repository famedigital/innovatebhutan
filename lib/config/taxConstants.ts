/**
 * Tax Constants for Bhutan Payroll (RRCO Compliance)
 *
 * References:
 * - RRCO (Revenue and Customs Division of Bhutan)
 * - PF (Provident Fund)
 * - GIS (Group Insurance Scheme)
 * - PIT (Personal Income Tax)
 */

/**
 * Statutory contribution rates for Bhutan
 */
export const TAX_RATES = {
  /** Employee Provident Fund contribution rate (5%) */
  PF_EMPLOYEE_RATE: 0.05,

  /** Employer Provident Fund contribution rate (5%) */
  PF_EMPLOYER_RATE: 0.05,

  /** Monthly GIS deduction (flat rate in Ngultrum) */
  GIS_MONTHLY: 500,
} as const;

/**
 * Personal Income Tax (PIT) Progressive Slabs
 *
 * Annual taxable income brackets and corresponding tax rates.
 * Tax is calculated cumulatively across applicable slabs.
 *
 * Example: Annual taxable income of Nu. 600,000
 * - First 300,000 @ 0% = Nu. 0
 * - Next 200,000 (300k-500k) @ 10% = Nu. 20,000
 * - Remaining 100,000 (500k-600k) @ 15% = Nu. 15,000
 * - Total PIT = Nu. 35,000 (Monthly = Nu. 2,916.67)
 */
export const PIT_SLABS = [
  { limit: 300000, rate: 0 },
  { limit: 500000, rate: 0.10 },
  { limit: 700000, rate: 0.15 },
  { limit: 1000000, rate: 0.20 },
  { limit: Infinity, rate: 0.25 },
] as const;

/**
 * Minimum taxable income threshold (annual)
 * Below this amount, no PIT is payable
 */
export const PIT_THRESHOLD = 300000;

/**
 * Standard months in a year for payroll calculations
 */
export const MONTHS_PER_YEAR = 12;

/**
 * Payment methods for payroll disbursement
 */
export const PAYMENT_METHODS = {
  BANK_TRANSFER: "bank",
  CASH: "cash",
  CHEQUE: "cheque",
} as const;

/**
 * Employee status types
 */
export const EMPLOYEE_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  TERMINATED: "terminated",
  ON_LEAVE: "on_leave",
} as const;

/**
 * Payslip status workflow
 */
export const PAYSLIP_STATUS = {
  DRAFT: "draft",
  APPROVED: "approved",
  PAID: "paid",
  CANCELLED: "cancelled",
} as const;

/**
 * Valid payslip status transitions
 * From status -> [allowed to statuses]
 */
export const PAYSLIP_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ["approved", "cancelled"],
  approved: ["paid", "cancelled"],
  paid: [],
  cancelled: [],
};

/**
 * Types for type safety
 */
export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
export type EmployeeStatus = (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];
export type PayslipStatus = (typeof PAYSLIP_STATUS)[keyof typeof PAYSLIP_STATUS];

/**
 * Allowance types (stored as JSONB in database)
 */
export interface Allowances {
  rent?: number;
  transport?: number;
  entertainment?: number;
  medical?: number;
  other?: number;
}

/**
 * Additional deductions (stored as JSONB in database)
 */
export interface AdditionalDeductions {
  advance?: number;
  loan?: number;
  other?: number;
}

/**
 * Complete payslip breakdown for calculations
 */
export interface PayslipBreakdown {
  basicSalary: number;
  allowances: Allowances;
  grossSalary: number;
  pfEmployee: number;
  pfEmployer: number;
  gisDeduction: number;
  taxableIncome: number;
  pitDeduction: number;
  additionalDeductions: AdditionalDeductions;
  totalDeductions: number;
  netSalary: number;
}

/**
 * PIT slab definition
 */
export interface PITSlab {
  limit: number;
  rate: number;
}
