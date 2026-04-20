import { payrollRepository } from "@/lib/repositories/payrollRepository";
import {
  TAX_RATES,
  PIT_SLABS,
  PIT_THRESHOLD,
  MONTHS_PER_YEAR,
  PAYSLIP_STATUS,
  PAYSLIP_STATUS_TRANSITIONS,
  PAYMENT_METHODS,
  EMPLOYEE_STATUS,
  type Allowances,
  type AdditionalDeductions,
  type PayslipBreakdown,
  type PayslipStatus,
  type PaymentMethod,
} from "@/lib/config/taxConstants";
import type { Payslip, Employee } from "@/lib/repositories/payrollRepository";

// ==================== DTOs & INPUT TYPES ====================

export interface GeneratePayslipOptions {
  allowances?: Allowances;
  bonuses?: number;
  deductions?: AdditionalDeductions;
  workingDays?: number;
  paidLeaveDays?: number;
  unpaidLeaveDays?: number;
  overtimeHours?: number;
}

export interface GeneratedPayslip extends PayslipBreakdown {
  employeeId: number;
  employeeName?: string;
  employeeDesignation?: string;
  month: number;
  year: number;
  status: PayslipStatus;
  createdAt: Date;
}

export interface BatchPayrollResult {
  successful: GeneratedPayslip[];
  failed: Array<{ employeeId: number; error: string }>;
  skipped: Array<{ employeeId: number; reason: string }>;
  summary: {
    totalRequested: number;
    totalGenerated: number;
    totalNetSalary: number;
  };
}

export interface PeriodPayrollSummary {
  month: number;
  year: number;
  totalEmployees: number;
  processedCount: number;
  pendingCount: number;
  totalNetSalary: number;
  totalPFDeduction: number;
  totalPIT: number;
}

export interface PayslipUpdateData {
  basicSalary?: number;
  allowances?: Allowances;
  bonuses?: number;
  deductions?: AdditionalDeductions;
  status?: PayslipStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: Date;
  notes?: string;
}

// ==================== SERVICE CLASS ====================

export class PayrollService {
  private repository = payrollRepository;

  // ==================== MAIN CALCULATION ENGINE ====================

  /**
   * Generate a complete payslip with all calculations
   * @param employeeId - Employee database ID
   * @param month - Month (1-12)
   * @param year - Year (e.g., 2026)
   * @param options - Optional allowances, bonuses, deductions
   * @returns Complete payslip with all breakdowns
   */
  async generatePayslip(
    employeeId: number,
    month: number,
    year: number,
    options: GeneratePayslipOptions = {}
  ): Promise<GeneratedPayslip> {
    // Step 1: Fetch employee data
    const employee = await this.repository.getEmployeeById(employeeId);
    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    // Step 2: Check if employee is active
    const employeeStatus = (employee.additionalDocs as any)?.status || EMPLOYEE_STATUS.ACTIVE;
    if (employeeStatus !== EMPLOYEE_STATUS.ACTIVE) {
      throw new Error(`Cannot generate payslip for non-active employee (status: ${employeeStatus})`);
    }

    // Step 3: Check if payslip already exists
    const existing = await this.repository.getPayslipByEmployeeAndMonth(employeeId, month, year);
    if (existing && existing.status !== PAYSLIP_STATUS.DRAFT) {
      throw new Error(`Payslip already exists for ${this.formatPeriod(month, year)} with status: ${existing.status}`);
    }

    // Step 4: Get base salary (convert decimal to number)
    const baseSalary = Number(employee.baseSalary) || 0;

    // Step 5: Calculate all components
    const breakdown = this.calculatePayslipBreakdown(baseSalary, options);

    // Step 6: Validate totals
    if (!this.validatePayslipTotals(breakdown)) {
      throw new Error("Payslip calculation validation failed: totals do not match");
    }

    // Step 7: Save to database (or update if draft exists)
    const payslipData = {
      employeeId,
      month,
      year,
      netSalary: breakdown.netSalary.toString(),
      status: PAYSLIP_STATUS.DRAFT,
      // Additional fields will be added after migration
      // For now, store breakdown in a way that survives migration
      ...((existing?.id ? {} : { createdAt: new Date() })),
    };

    let savedPayslip: Payslip;
    if (existing?.id) {
      savedPayslip = await this.repository.updatePayslip(existing.id, payslipData);
    } else {
      savedPayslip = await this.repository.createPayslip(payslipData);
    }

    // Step 8: Return complete payslip with employee details
    return {
      ...breakdown,
      employeeId: savedPayslip.employeeId,
      employeeName: (employee as any).fullName || undefined,
      employeeDesignation: employee.designation || undefined,
      month: savedPayslip.month,
      year: savedPayslip.year,
      status: savedPayslip.status as PayslipStatus,
      createdAt: savedPayslip.createdAt,
    };
  }

  /**
   * Calculate the complete payslip breakdown
   * This is the core calculation engine
   */
  private calculatePayslipBreakdown(baseSalary: number, options: GeneratePayslipOptions = {}): PayslipBreakdown {
    // Extract options with defaults
    const allowances = options.allowances || {};
    const bonuses = options.bonuses || 0;
    const deductions = options.deductions || {};

    // Step 1: Calculate basic salary (prorated if needed)
    const workingDays = options.workingDays || 22; // Standard working days
    const paidLeaveDays = options.paidLeaveDays || 0;
    const unpaidLeaveDays = options.unpaidLeaveDays || 0;

    const effectiveWorkingDays = workingDays + paidLeaveDays;
    const dailyRate = baseSalary / workingDays;
    const basicSalary = baseSalary - (unpaidLeaveDays * dailyRate);

    // Step 2: Calculate total allowances
    const totalAllowances = Object.values(allowances).reduce((sum, value) => sum + (value || 0), 0);

    // Step 3: Calculate gross salary
    const grossSalary = this.calculateGrossSalary(basicSalary, allowances, bonuses);

    // Step 4: Calculate PF deductions
    const pfDeduction = this.calculatePFDeduction(grossSalary);

    // Step 5: Calculate GIS deduction (flat rate)
    const gisDeduction = TAX_RATES.GIS_MONTHLY;

    // Step 6: Calculate taxable income
    const taxableIncome = this.calculateTaxableIncome(grossSalary, pfDeduction.employee, gisDeduction);

    // Step 7: Calculate PIT (progressive slab)
    const annualTaxableIncome = taxableIncome * MONTHS_PER_YEAR;
    const annualPIT = this.calculatePIT(annualTaxableIncome);
    const monthlyPIT = annualPIT / MONTHS_PER_YEAR;

    // Step 8: Calculate additional deductions
    const totalAdditionalDeductions = Object.values(deductions).reduce((sum, value) => sum + (value || 0), 0);

    // Step 9: Calculate total deductions
    const totalDeductions = pfDeduction.employee + gisDeduction + monthlyPIT + totalAdditionalDeductions;

    // Step 10: Calculate net salary
    const netSalary = this.calculateNetSalary(grossSalary, totalDeductions);

    return {
      basicSalary,
      allowances,
      grossSalary,
      pfEmployee: pfDeduction.employee,
      pfEmployer: pfDeduction.employer,
      gisDeduction,
      taxableIncome,
      pitDeduction: monthlyPIT,
      additionalDeductions: deductions,
      totalDeductions,
      netSalary,
    };
  }

  // ==================== CALCULATION HELPERS ====================

  /**
   * Calculate gross salary from basic salary + allowances + bonuses
   */
  private calculateGrossSalary(basicSalary: number, allowances: Allowances, bonuses: number): number {
    const totalAllowances = Object.values(allowances).reduce((sum, value) => sum + (value || 0), 0);
    return basicSalary + totalAllowances + bonuses;
  }

  /**
   * Calculate PF deduction (5% employee + 5% employer)
   * PF is calculated on gross salary
   */
  private calculatePFDeduction(grossSalary: number): { employee: number; employer: number } {
    const employee = grossSalary * TAX_RATES.PF_EMPLOYEE_RATE;
    const employer = grossSalary * TAX_RATES.PF_EMPLOYER_RATE;
    return { employee, employer };
  }

  /**
   * Calculate taxable income after PF and GIS deductions
   * Taxable income = Gross - PF Employee - GIS
   */
  private calculateTaxableIncome(grossSalary: number, pfEmployee: number, gis: number): number {
    return Math.max(0, grossSalary - pfEmployee - gis);
  }

  /**
   * Calculate Personal Income Tax using progressive slabs
   * This implements the cumulative slab approach for Bhutan PIT
   *
   * Example: Annual taxable income of Nu. 600,000
   * - First 300,000 @ 0% = Nu. 0
   * - Next 200,000 (300k-500k) @ 10% = Nu. 20,000
   * - Remaining 100,000 (500k-600k) @ 15% = Nu. 15,000
   * - Total PIT = Nu. 35,000
   */
  private calculatePIT(annualTaxableIncome: number): number {
    // If income is below threshold, no tax
    if (annualTaxableIncome <= PIT_THRESHOLD) {
      return 0;
    }

    let tax = 0;
    let previousLimit = 0;

    for (const slab of PIT_SLABS) {
      if (annualTaxableIncome <= previousLimit) {
        break;
      }

      // Calculate taxable amount within this slab
      const slabUpperLimit = slab.limit === Infinity ? annualTaxableIncome : Math.min(annualTaxableIncome, slab.limit);
      const taxableInSlab = slabUpperLimit - previousLimit;

      if (taxableInSlab > 0) {
        tax += taxableInSlab * slab.rate;
      }

      previousLimit = slab.limit === Infinity ? previousLimit : slab.limit;
    }

    return tax;
  }

  /**
   * Calculate net salary (take-home pay)
   * Net = Gross - (PF Employee + GIS + PIT + Other Deductions)
   */
  private calculateNetSalary(grossSalary: number, totalDeductions: number): number {
    return Math.max(0, grossSalary - totalDeductions);
  }

  /**
   * Validate that payslip calculations are consistent
   * Ensures: gross - deductions == net (within rounding tolerance)
   */
  private validatePayslipTotals(breakdown: PayslipBreakdown, tolerance = 0.05): boolean {
    const calculatedDeductions =
      breakdown.pfEmployee + breakdown.gisDeduction + breakdown.pitDeduction +
      Object.values(breakdown.additionalDeductions).reduce((sum, v) => sum + (v || 0), 0);

    const expectedNet = breakdown.grossSalary - calculatedDeductions;
    const difference = Math.abs(breakdown.netSalary - expectedNet);

    return difference <= tolerance;
  }

  // ==================== STATUS MANAGEMENT ====================

  /**
   * Transition payslip to a new status with validation
   */
  async transitionPayslipStatus(payslipId: number, newStatus: PayslipStatus): Promise<Payslip> {
    const payslip = await this.repository.getPayslipById(payslipId);
    if (!payslip) {
      throw new Error(`Payslip with ID ${payslipId} not found`);
    }

    const currentStatus = payslip.status as PayslipStatus;
    const allowedTransitions = PAYSLIP_STATUS_TRANSITIONS[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Cannot transition payslip from ${currentStatus} to ${newStatus}. Allowed: ${allowedTransitions.join(", ")}`
      );
    }

    return await this.repository.updatePayslip(payslipId, { status: newStatus });
  }

  /**
   * Approve a payslip (draft -> approved)
   */
  async approvePayslip(payslipId: number, approverId: string, notes?: string): Promise<Payslip> {
    return await this.transitionPayslipStatus(payslipId, PAYSLIP_STATUS.APPROVED);
  }

  /**
   * Mark payslip as paid (approved -> paid)
   */
  async markAsPaid(payslipId: number, paymentMethod: PaymentMethod, paymentDate?: Date): Promise<Payslip> {
    const payslip = await this.transitionPayslipStatus(payslipId, PAYSLIP_STATUS.PAID);

    // Update with payment details
    return await this.repository.updatePayslip(payslipId, {
      // Payment details will be stored in additional fields after migration
    });
  }

  /**
   * Cancel a payslip
   */
  async cancelPayslip(payslipId: number, reason?: string): Promise<Payslip> {
    return await this.transitionPayslipStatus(payslipId, PAYSLIP_STATUS.CANCELLED);
  }

  // ==================== BULK OPERATIONS ====================

  /**
   * Generate payslips for multiple employees in batch
   */
  async generateBatchPayroll(
    month: number,
    year: number,
    employeeIds?: number[],
    options?: GeneratePayslipOptions
  ): Promise<BatchPayrollResult> {
    // Get employees to process
    let employeesToProcess: Employee[];

    if (employeeIds && employeeIds.length > 0) {
      // Process specific employees
      const employeePromises = employeeIds.map((id) => this.repository.getEmployeeById(id));
      employeesToProcess = (await Promise.all(employeePromises)).filter((e) => e !== null) as Employee[];
    } else {
      // Process all active employees
      employeesToProcess = await this.repository.getActiveEmployees();
    }

    const result: BatchPayrollResult = {
      successful: [],
      failed: [],
      skipped: [],
      summary: {
        totalRequested: employeesToProcess.length,
        totalGenerated: 0,
        totalNetSalary: 0,
      },
    };

    for (const employee of employeesToProcess) {
      try {
        // Check if payslip already exists
        const existing = await this.repository.getPayslipByEmployeeAndMonth(employee.id, month, year);

        if (existing && existing.status !== PAYSLIP_STATUS.DRAFT) {
          result.skipped.push({
            employeeId: employee.id,
            reason: `Payslip already exists with status: ${existing.status}`,
          });
          continue;
        }

        // Generate payslip
        const payslip = await this.generatePayslip(employee.id, month, year, options);
        result.successful.push(payslip);
        result.summary.totalGenerated++;
        result.summary.totalNetSalary += payslip.netSalary;
      } catch (error: any) {
        result.failed.push({
          employeeId: employee.id,
          error: error.message || "Unknown error",
        });
      }
    }

    return result;
  }

  /**
   * Get summary of payroll for a specific period
   */
  async getPeriodSummary(month: number, year: number): Promise<PeriodPayrollSummary> {
    return await this.repository.getPayrollPeriodSummary(month, year);
  }

  // ==================== QUERY OPERATIONS ====================

  async getPayslipById(id: number): Promise<Payslip | null> {
    return await this.repository.getPayslipById(id);
  }

  async listPayslips(filters: any = {}) {
    return await this.repository.listPayslipsWithDetails(filters);
  }

  async getEmployeePayslips(employeeId: number, limit = 12): Promise<Payslip[]> {
    return await this.repository.getPayslipsByEmployee(employeeId, limit);
  }

  async getDashboardStats() {
    return await this.repository.getDashboardStats();
  }

  async listEmployees(filters: any = {}) {
    return await this.repository.listEmployeesWithDetails(filters);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Format month/year for display
   */
  private formatPeriod(month: number, year: number): string {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${monthNames[month - 1]} ${year}`;
  }

  /**
   * Calculate year-to-date tax for an employee
   * Useful for mid-year hiring or adjustments
   */
  async calculateYearToDateTax(employeeId: number, currentMonth: number, year: number): Promise<number> {
    const payslips = await this.repository.getPayslipsByEmployee(employeeId);

    let ytdTax = 0;
    for (const payslip of payslips) {
      if (payslip.year === year && payslip.month <= currentMonth && payslip.status !== PAYSLIP_STATUS.CANCELLED) {
        // PIT will be stored in database after migration
        // For now, we'll recalculate from stored data
        ytdTax += 0; // Placeholder - will be updated after migration
      }
    }

    return ytdTax;
  }

  /**
   * Verify if payslip is ready for payment
   */
  async isReadyForPayment(payslipId: number): Promise<boolean> {
    const payslip = await this.repository.getPayslipById(payslipId);
    return payslip?.status === PAYSLIP_STATUS.APPROVED || false;
  }
}

// Singleton instance
export const payrollService = new PayrollService();
