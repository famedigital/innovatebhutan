/**
 * Payroll Validation Schema Tests
 *
 * Tests for Zod validation schemas ensuring data integrity:
 * - Employee data validation
 * - Payslip generation validation
 * - Status enum validation
 */

import { describe, it, expect } from 'vitest';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeQuerySchema,
  generatePayrollSchema,
  batchPayrollSchema,
  approvePayrollSchema,
  markPaidPayrollSchema,
  updatePayslipSchema,
  payslipQuerySchema,
  employeeStatusSchema,
  payslipStatusSchema,
  paymentMethodSchema,
  allowancesSchema,
  deductionsSchema,
} from '@/lib/validations/payroll';

describe('Payroll Validation Schemas', () => {
  describe('Employee Status Schema', () => {
    it('should accept valid employee statuses', () => {
      const validStatuses = ['active', 'inactive', 'terminated', 'on_leave'];

      validStatuses.forEach((status) => {
        const result = employeeStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid employee statuses', () => {
      const invalidStatuses = ['pending', 'suspended', 'active_state', ''];

      invalidStatuses.forEach((status) => {
        const result = employeeStatusSchema.safeParse(status);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Payslip Status Schema', () => {
    it('should accept valid payslip statuses', () => {
      const validStatuses = ['draft', 'approved', 'paid', 'cancelled'];

      validStatuses.forEach((status) => {
        const result = payslipStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid payslip statuses', () => {
      const invalidStatuses = ['pending', 'processing', 'draft_state', ''];

      invalidStatuses.forEach((status) => {
        const result = payslipStatusSchema.safeParse(status);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Payment Method Schema', () => {
    it('should accept valid payment methods', () => {
      const validMethods = ['bank', 'cash', 'cheque'];

      validMethods.forEach((method) => {
        const result = paymentMethodSchema.safeParse(method);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid payment methods', () => {
      const invalidMethods = ['card', 'upi', 'transfer', ''];

      invalidMethods.forEach((method) => {
        const result = paymentMethodSchema.safeParse(method);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Allowances Schema', () => {
    it('should accept valid allowances', () => {
      const allowances = {
        rent: 5000,
        transport: 2000,
        entertainment: 1000,
        medical: 1500,
        other: 500,
      };

      const result = allowancesSchema.safeParse(allowances);
      expect(result.success).toBe(true);
    });

    it('should accept partial allowances', () => {
      const partialAllowances = {
        rent: 5000,
        transport: 2000,
      };

      const result = allowancesSchema.safeParse(partialAllowances);
      expect(result.success).toBe(true);
    });

    it('should reject negative allowances', () => {
      const invalidAllowances = {
        rent: -5000,
        transport: 2000,
      };

      const result = allowancesSchema.safeParse(invalidAllowances);
      expect(result.success).toBe(false);
    });
  });

  describe('Deductions Schema', () => {
    it('should accept valid deductions', () => {
      const deductions = {
        advance: 10000,
        loan: 5000,
        other: 1000,
      };

      const result = deductionsSchema.safeParse(deductions);
      expect(result.success).toBe(true);
    });

    it('should accept partial deductions', () => {
      const partialDeductions = {
        advance: 5000,
      };

      const result = deductionsSchema.safeParse(partialDeductions);
      expect(result.success).toBe(true);
    });

    it('should reject negative deductions', () => {
      const invalidDeductions = {
        advance: -5000,
      };

      const result = deductionsSchema.safeParse(invalidDeductions);
      expect(result.success).toBe(false);
    });
  });

  describe('Create Employee Schema', () => {
    it('should accept valid employee data', () => {
      const validData = {
        profileId: 1,
        designation: 'Software Engineer',
        baseSalary: '50000.00',
        department: 'Engineering',
        phone: '+975-17-123456',
        email: 'test@example.com',
        tin: '123456789',
        pfNumber: 'PF123456',
        joinDate: '2024-01-01',
      };

      const result = createEmployeeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require profileId', () => {
      const invalidData = {
        designation: 'Software Engineer',
      };

      const result = createEmployeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require designation', () => {
      const invalidData = {
        profileId: 1,
      };

      const result = createEmployeeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate salary format', () => {
      const validSalaries = ['50000', '50000.00', '50000.50', '123456.78'];

      validSalaries.forEach((salary) => {
        const result = createEmployeeSchema.safeParse({
          profileId: 1,
          designation: 'Engineer',
          baseSalary: salary,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid salary format', () => {
      const invalidSalaries = ['50,000', '50000.123', 'abc', '50.000.00'];

      invalidSalaries.forEach((salary) => {
        const result = createEmployeeSchema.safeParse({
          profileId: 1,
          designation: 'Engineer',
          baseSalary: salary,
        });
        expect(result.success).toBe(false);
      });
    });

    it('should validate email format', () => {
      const validEmails = ['test@example.com', 'user.name@domain.co.bt'];

      validEmails.forEach((email) => {
        const result = createEmployeeSchema.safeParse({
          profileId: 1,
          designation: 'Engineer',
          email,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid email format', () => {
      const invalidEmails = ['invalid', 'test@', '@example.com', 'test .com'];

      invalidEmails.forEach((email) => {
        const result = createEmployeeSchema.safeParse({
          profileId: 1,
          designation: 'Engineer',
          email,
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Generate Payroll Schema', () => {
    it('should accept valid payslip generation data', () => {
      const validData = {
        employeeId: 1,
        month: 1,
        year: 2026,
        allowances: {
          rent: 5000,
          transport: 2000,
        },
        bonuses: 10000,
        workingDays: 22,
        paidLeaveDays: 2,
        unpaidLeaveDays: 0,
      };

      const result = generatePayrollSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require employeeId', () => {
      const invalidData = {
        month: 1,
        year: 2026,
      };

      const result = generatePayrollSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate month range (1-12)', () => {
      const validMonths = [1, 6, 12];

      validMonths.forEach((month) => {
        const result = generatePayrollSchema.safeParse({
          employeeId: 1,
          month,
          year: 2026,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid month values', () => {
      const invalidMonths = [0, 13, -1, 24];

      invalidMonths.forEach((month) => {
        const result = generatePayrollSchema.safeParse({
          employeeId: 1,
          month,
          year: 2026,
        });
        expect(result.success).toBe(false);
      });
    });

    it('should validate year range (2020-2100)', () => {
      const validYears = [2020, 2024, 2050, 2100];

      validYears.forEach((year) => {
        const result = generatePayrollSchema.safeParse({
          employeeId: 1,
          month: 1,
          year,
        });
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid year values', () => {
      const invalidYears = [2019, 2101, 1900, 3000];

      invalidYears.forEach((year) => {
        const result = generatePayrollSchema.safeParse({
          employeeId: 1,
          month: 1,
          year,
        });
        expect(result.success).toBe(false);
      });
    });

    it('should reject negative bonuses', () => {
      const invalidData = {
        employeeId: 1,
        month: 1,
        year: 2026,
        bonuses: -5000,
      };

      const result = generatePayrollSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate working days are positive', () => {
      const result = generatePayrollSchema.safeParse({
        employeeId: 1,
        month: 1,
        year: 2026,
        workingDays: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('Batch Payroll Schema', () => {
    it('should accept valid batch payroll data with employee IDs', () => {
      const validData = {
        month: 1,
        year: 2026,
        employeeIds: [1, 2, 3],
        skipExisting: true,
      };

      const result = batchPayrollSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept generateForAll flag', () => {
      const validData = {
        month: 1,
        year: 2026,
        generateForAll: true,
      };

      const result = batchPayrollSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require at least one employee ID when not using generateForAll', () => {
      const invalidData = {
        month: 1,
        year: 2026,
        employeeIds: [],
      };

      const result = batchPayrollSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should default skipExisting to true', () => {
      const data = {
        month: 1,
        year: 2026,
        employeeIds: [1],
      };

      const result = batchPayrollSchema.safeParse(data);
      if (result.success) {
        expect(result.data.skipExisting).toBe(true);
      }
    });

    it('should default generateForAll to false', () => {
      const data = {
        month: 1,
        year: 2026,
        employeeIds: [1],
      };

      const result = batchPayrollSchema.safeParse(data);
      if (result.success) {
        expect(result.data.generateForAll).toBe(false);
      }
    });
  });

  describe('Approve Payroll Schema', () => {
    it('should accept valid approval data', () => {
      const validData = {
        payslipId: 1,
        approverId: 'user-123',
        notes: 'Approved after review',
      };

      const result = approvePayrollSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require payslipId', () => {
      const invalidData = {
        approverId: 'user-123',
      };

      const result = approvePayrollSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require approverId', () => {
      const invalidData = {
        payslipId: 1,
      };

      const result = approvePayrollSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should limit notes length', () => {
      const invalidData = {
        payslipId: 1,
        approverId: 'user-123',
        notes: 'a'.repeat(1001), // Exceeds 1000 character limit
      };

      const result = approvePayrollSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Mark Paid Payroll Schema', () => {
    it('should accept valid payment data', () => {
      const validData = {
        payslipId: 1,
        paymentMethod: 'bank',
        paymentDate: '2024-01-15',
        transactionReference: 'TXN123456',
        notes: 'Paid via bank transfer',
      };

      const result = markPaidPayrollSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require payslipId', () => {
      const invalidData = {
        paymentMethod: 'bank',
      };

      const result = markPaidPayrollSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require valid payment method', () => {
      const invalidData = {
        payslipId: 1,
        paymentMethod: 'crypto',
      };

      const result = markPaidPayrollSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should accept date string for paymentDate', () => {
      const validData = {
        payslipId: 1,
        paymentMethod: 'bank',
        paymentDate: '2024-01-15',
      };

      const result = markPaidPayrollSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should make paymentDate optional', () => {
      const validData = {
        payslipId: 1,
        paymentMethod: 'cash',
      };

      const result = markPaidPayrollSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('Query Schema Defaults', () => {
    it('should default page to 1', () => {
      const data = {};

      const result = employeeQuerySchema.safeParse(data);
      if (result.success) {
        expect(result.data.page).toBe(1);
      }
    });

    it('should default limit to 20 for employee query', () => {
      const data = {};

      const result = employeeQuerySchema.safeParse(data);
      if (result.success) {
        expect(result.data.limit).toBe(20);
      }
    });

    it('should default limit to 20 for payslip query', () => {
      const data = {};

      const result = payslipQuerySchema.safeParse(data);
      if (result.success) {
        expect(result.data.limit).toBe(20);
      }
    });

    it('should enforce maximum limit of 100 for employee query', () => {
      const data = { limit: 150 };

      const result = employeeQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should enforce maximum limit of 100 for payslip query', () => {
      const data = { limit: 150 };

      const result = payslipQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
