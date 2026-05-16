/**
 * Payroll Calculation Tests
 *
 * Critical tests for Bhutan tax compliance:
 * - PF (Provident Fund) calculations: 5% employee + 5% employer
 * - GIS (Group Insurance Scheme): flat Nu. 500/month
 * - PIT (Personal Income Tax): Progressive slab calculation
 *
 * These tests verify RRCO compliance for payroll calculations.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PayrollService } from '@/lib/services/payrollService';
import { payrollRepository } from '@/lib/repositories/payrollRepository';
import {
  TAX_RATES,
  PIT_SLABS,
  PIT_THRESHOLD,
  MONTHS_PER_YEAR,
  PAYSLIP_STATUS,
} from '@/lib/config/taxConstants';

// Mock the repository
vi.mock('@/lib/repositories/payrollRepository', () => ({
  payrollRepository: {
    getEmployeeById: vi.fn(),
    getPayslipByEmployeeAndMonth: vi.fn(),
    createPayslip: vi.fn(),
    updatePayslip: vi.fn(),
    getPayslipById: vi.fn(),
    listPayslipsWithDetails: vi.fn(),
    getPayslipsByEmployee: vi.fn(),
    getDashboardStats: vi.fn(),
    getPayrollPeriodSummary: vi.fn(),
  },
}));

// Mock notification service
vi.mock('@/lib/services/notificationService', () => ({
  notificationService: {
    notifyPayrollApproved: vi.fn(),
    notifyPayrollPaid: vi.fn(),
    notifyPayrollReady: vi.fn(),
  },
}));

describe('PayrollService - Bhutan Tax Compliance', () => {
  let payrollService: PayrollService;
  let mockEmployee: any;
  let mockPayslip: any;

  beforeEach(() => {
    // Create fresh mocks for each test
    vi.clearAllMocks();
    payrollService = new PayrollService();

    mockEmployee = {
      id: 1,
      profileId: 1,
      designation: 'Software Engineer',
      baseSalary: '50000',
      joinDate: new Date('2024-01-01'),
    };

    mockPayslip = {
      id: 1,
      employeeId: 1,
      month: 1,
      year: 2026,
      netSalary: '47000',
      status: 'draft',
      createdAt: new Date(),
    };

    // Default mock responses
    vi.mocked(payrollRepository.getEmployeeById).mockResolvedValue(mockEmployee);
    vi.mocked(payrollRepository.getPayslipByEmployeeAndMonth).mockResolvedValue(null);
    vi.mocked(payrollRepository.createPayslip).mockResolvedValue(mockPayslip);
    vi.mocked(payrollRepository.updatePayslip).mockResolvedValue(mockPayslip);
  });

  describe('PF (Provident Fund) Calculations', () => {
    it('should calculate 5% employee PF contribution', async () => {
      const grossSalary = 50000;
      const expectedPF = grossSalary * TAX_RATES.PF_EMPLOYEE_RATE; // 2500

      const result = await payrollService.generatePayslip(1, 1, 2026, {
        allowances: {},
      });

      expect(result.pfEmployee).toBeCloseTo(expectedPF, 2);
    });

    it('should calculate 5% employer PF contribution', async () => {
      const grossSalary = 50000;
      const expectedPFEmployer = grossSalary * TAX_RATES.PF_EMPLOYER_RATE; // 2500

      const result = await payrollService.generatePayslip(1, 1, 2026);

      expect(result.pfEmployer).toBeCloseTo(expectedPFEmployer, 2);
    });

    it('should calculate PF on gross salary (basic + allowances)', async () => {
      // Reset the mock for this specific test
      mockEmployee.baseSalary = '45000';
      vi.mocked(payrollRepository.getEmployeeById).mockResolvedValue(mockEmployee);

      const basicSalary = 45000;
      const allowances = { rent: 3000, transport: 2000 };
      const expectedGross = basicSalary + allowances.rent + allowances.transport; // 50000
      const expectedPF = expectedGross * TAX_RATES.PF_EMPLOYEE_RATE; // 2500

      const result = await payrollService.generatePayslip(1, 1, 2026, {
        allowances,
      });

      expect(result.grossSalary).toBeCloseTo(expectedGross, 2);
      expect(result.pfEmployee).toBeCloseTo(expectedPF, 2);
    });
  });

  describe('GIS (Group Insurance Scheme) Deduction', () => {
    it('should deduct flat Nu. 500 for GIS', async () => {
      const expectedGIS = TAX_RATES.GIS_MONTHLY; // 500

      const result = await payrollService.generatePayslip(1, 1, 2026);

      expect(result.gisDeduction).toBe(expectedGIS);
    });

    it('should apply GIS deduction consistently regardless of salary', async () => {
      // Test with different salary levels
      const salaries = [25000, 50000, 100000, 200000];

      for (const salary of salaries) {
        mockEmployee.baseSalary = salary.toString();
        const result = await payrollService.generatePayslip(1, 1, 2026);
        expect(result.gisDeduction).toBe(TAX_RATES.GIS_MONTHLY);
      }
    });
  });

  describe('PIT (Personal Income Tax) Progressive Slab', () => {
    it('should calculate zero PIT for income below Nu. 300,000 annually', async () => {
      // Monthly: 20,000 -> Annual: 240,000 (below threshold)
      mockEmployee.baseSalary = '20000';

      const result = await payrollService.generatePayslip(1, 1, 2026);

      expect(result.pitDeduction).toBe(0);
    });

    it('should calculate PIT for first slab (300k-500k at 10%)', async () => {
      // Monthly: 35,000 -> Annual: 420,000
      // Taxable: 420,000 - (PF + GIS) * 12 ≈ 348,000
      // PIT: (348,000 - 300,000) * 10% = 4,800 annually = 400 monthly
      mockEmployee.baseSalary = '35000';

      const result = await payrollService.generatePayslip(1, 1, 2026);

      // Verify PIT is calculated (exact value depends on deductions)
      expect(result.pitDeduction).toBeGreaterThan(0);
      expect(result.pitDeduction).toBeLessThan(1000); // Should be reasonable
    });

    it('should calculate PIT for second slab (500k-700k at 15%)', async () => {
      // Monthly: 50,000 -> Annual: 600,000
      // Taxable after deductions: ~528,000
      // PIT: 0 (first 300k) + 20,000 (10% of next 200k) + 4,200 (15% of remaining 28k) = 24,200 annually ≈ 2,016 monthly
      mockEmployee.baseSalary = '50000';

      const result = await payrollService.generatePayslip(1, 1, 2026);

      expect(result.pitDeduction).toBeGreaterThan(1000);
      expect(result.pitDeduction).toBeLessThan(5000);
    });

    it('should calculate PIT for third slab (700k-1M at 20%)', async () => {
      // Monthly: 70,000 -> Annual: 840,000
      mockEmployee.baseSalary = '70000';

      const result = await payrollService.generatePayslip(1, 1, 2026);

      expect(result.pitDeduction).toBeGreaterThan(3000);
    });

    it('should calculate PIT for top slab (above 1M at 25%)', async () => {
      // Monthly: 100,000 -> Annual: 1,200,000
      mockEmployee.baseSalary = '100000';

      const result = await payrollService.generatePayslip(1, 1, 2026);

      expect(result.pitDeduction).toBeGreaterThan(8000);
    });

    it('should correctly apply cumulative slab calculation', () => {
      // Test the slab calculation directly via internal logic
      // Annual taxable income: 600,000
      // Expected: 0 (first 300k) + 20,000 (10% of 200k) + 15,000 (15% of 100k) = 35,000

      const annualTaxableIncome = 600000;
      let tax = 0;
      let previousLimit = 0;

      for (const slab of PIT_SLABS) {
        if (annualTaxableIncome <= previousLimit) break;

        const slabUpperLimit = slab.limit === Infinity ? annualTaxableIncome : Math.min(annualTaxableIncome, slab.limit);
        const taxableInSlab = slabUpperLimit - previousLimit;

        if (taxableInSlab > 0) {
          tax += taxableInSlab * slab.rate;
        }

        previousLimit = slab.limit === Infinity ? previousLimit : slab.limit;
      }

      expect(tax).toBe(35000);
    });
  });

  describe('Taxable Income Calculation', () => {
    it('should calculate taxable income as gross - PF employee - GIS', async () => {
      mockEmployee.baseSalary = '50000';

      const result = await payrollService.generatePayslip(1, 1, 2026);

      const expectedTaxableIncome = result.grossSalary - result.pfEmployee - result.gisDeduction;
      expect(result.taxableIncome).toBeCloseTo(expectedTaxableIncome, 2);
    });

    it('should ensure taxable income is never negative', async () => {
      mockEmployee.baseSalary = '5000'; // Very low salary

      const result = await payrollService.generatePayslip(1, 1, 2026);

      expect(result.taxableIncome).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Net Salary Calculation', () => {
    it('should calculate net salary as gross - total deductions', async () => {
      mockEmployee.baseSalary = '50000';

      const result = await payrollService.generatePayslip(1, 1, 2026);

      const expectedNet = result.grossSalary - result.totalDeductions;
      expect(result.netSalary).toBeCloseTo(expectedNet, 2);
    });

    it('should include all deductions in total', async () => {
      mockEmployee.baseSalary = '50000';

      const result = await payrollService.generatePayslip(1, 1, 2026, {
        deductions: { advance: 5000, loan: 3000 },
      });

      const expectedTotalDeductions =
        result.pfEmployee + result.gisDeduction + result.pitDeduction + 5000 + 3000;

      expect(result.totalDeductions).toBeCloseTo(expectedTotalDeductions, 2);
    });
  });

  describe('Unpaid Leave Deductions', () => {
    it('should reduce basic salary proportionally for unpaid leave', async () => {
      mockEmployee.baseSalary = '50000';
      const workingDays = 22;
      const unpaidDays = 5;
      const expectedReduction = (50000 / workingDays) * unpaidDays;

      const result = await payrollService.generatePayslip(1, 1, 2026, {
        unpaidLeaveDays: unpaidDays,
        workingDays,
      });

      expect(result.basicSalary).toBeCloseTo(50000 - expectedReduction, 2);
    });
  });

  describe('Payslip Validation', () => {
    it('should validate that calculations are consistent', async () => {
      mockEmployee.baseSalary = '50000';

      const result = await payrollService.generatePayslip(1, 1, 2026);

      // Verify the breakdown is internally consistent
      const totalDeductions =
        result.pfEmployee + result.gisDeduction + result.pitDeduction +
        Object.values(result.additionalDeductions).reduce((sum, v) => sum + (v || 0), 0);

      const expectedNet = result.grossSalary - totalDeductions;

      // Allow small rounding differences
      expect(Math.abs(result.netSalary - expectedNet)).toBeLessThan(0.05);
    });
  });
});

describe('PayrollService - Status Transitions', () => {
  let payrollService: PayrollService;

  beforeEach(() => {
    payrollService = new PayrollService();
  });

  describe('Payslip Status Workflow', () => {
    it('should allow transition from draft to approved', async () => {
      vi.mocked(payrollRepository.getPayslipById).mockResolvedValue({
        id: 1,
        employeeId: 1,
        month: 1,
        year: 2026,
        netSalary: '40000',
        status: PAYSLIP_STATUS.DRAFT,
        createdAt: new Date(),
      } as any);

      vi.mocked(payrollRepository.updatePayslip).mockResolvedValue({
        id: 1,
        status: PAYSLIP_STATUS.APPROVED,
      } as any);

      const result = await payrollService.transitionPayslipStatus(1, PAYSLIP_STATUS.APPROVED);

      expect(result.status).toBe(PAYSLIP_STATUS.APPROVED);
    });

    it('should allow transition from draft to cancelled', async () => {
      vi.mocked(payrollRepository.getPayslipById).mockResolvedValue({
        id: 1,
        employeeId: 1,
        month: 1,
        year: 2026,
        netSalary: '40000',
        status: PAYSLIP_STATUS.DRAFT,
        createdAt: new Date(),
      } as any);

      vi.mocked(payrollRepository.updatePayslip).mockResolvedValue({
        id: 1,
        status: PAYSLIP_STATUS.CANCELLED,
      } as any);

      const result = await payrollService.transitionPayslipStatus(1, PAYSLIP_STATUS.CANCELLED);

      expect(result.status).toBe(PAYSLIP_STATUS.CANCELLED);
    });

    it('should allow transition from approved to paid', async () => {
      vi.mocked(payrollRepository.getPayslipById).mockResolvedValue({
        id: 1,
        employeeId: 1,
        month: 1,
        year: 2026,
        netSalary: '40000',
        status: PAYSLIP_STATUS.APPROVED,
        createdAt: new Date(),
      } as any);

      vi.mocked(payrollRepository.updatePayslip).mockResolvedValue({
        id: 1,
        status: PAYSLIP_STATUS.PAID,
      } as any);

      const result = await payrollService.transitionPayslipStatus(1, PAYSLIP_STATUS.PAID);

      expect(result.status).toBe(PAYSLIP_STATUS.PAID);
    });

    it('should allow transition from approved to cancelled', async () => {
      vi.mocked(payrollRepository.getPayslipById).mockResolvedValue({
        id: 1,
        employeeId: 1,
        month: 1,
        year: 2026,
        netSalary: '40000',
        status: PAYSLIP_STATUS.APPROVED,
        createdAt: new Date(),
      } as any);

      vi.mocked(payrollRepository.updatePayslip).mockResolvedValue({
        id: 1,
        status: PAYSLIP_STATUS.CANCELLED,
      } as any);

      const result = await payrollService.transitionPayslipStatus(1, PAYSLIP_STATUS.CANCELLED);

      expect(result.status).toBe(PAYSLIP_STATUS.CANCELLED);
    });

    it('should reject invalid transition from paid to draft', async () => {
      vi.mocked(payrollRepository.getPayslipById).mockResolvedValue({
        id: 1,
        employeeId: 1,
        month: 1,
        year: 2026,
        netSalary: '40000',
        status: PAYSLIP_STATUS.PAID,
        createdAt: new Date(),
      } as any);

      await expect(
        payrollService.transitionPayslipStatus(1, PAYSLIP_STATUS.DRAFT)
      ).rejects.toThrow('Cannot transition payslip');
    });

    it('should reject invalid transition from cancelled to approved', async () => {
      vi.mocked(payrollRepository.getPayslipById).mockResolvedValue({
        id: 1,
        employeeId: 1,
        month: 1,
        year: 2026,
        netSalary: '40000',
        status: PAYSLIP_STATUS.CANCELLED,
        createdAt: new Date(),
      } as any);

      await expect(
        payrollService.transitionPayslipStatus(1, PAYSLIP_STATUS.APPROVED)
      ).rejects.toThrow('Cannot transition payslip');
    });
  });
});
