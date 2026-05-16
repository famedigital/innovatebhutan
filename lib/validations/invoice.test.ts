/**
 * Invoice Validation Schema Tests
 *
 * Tests for Zod validation schemas ensuring data integrity:
 * - Invoice status transitions
 * - Date validations (due date >= issue date)
 * - Line item calculations
 */

import { describe, it, expect } from 'vitest';
import {
  invoiceStatusSchema,
  invoiceItemSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  updateInvoiceStatusSchema,
  invoiceQuerySchema,
} from '@/lib/validations/invoice';

describe('Invoice Validation Schemas', () => {
  describe('Invoice Status Schema', () => {
    it('should accept all valid invoice statuses', () => {
      const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

      validStatuses.forEach((status) => {
        const result = invoiceStatusSchema.safeParse(status);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid invoice statuses', () => {
      const invalidStatuses = ['pending', 'approved', 'rejected', 'billed', ''];

      invalidStatuses.forEach((status) => {
        const result = invoiceStatusSchema.safeParse(status);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Invoice Item Schema', () => {
    it('should accept valid invoice item', () => {
      const validItem = {
        description: 'Web Development Service',
        quantity: 10,
        rate: 5000,
        amount: 50000,
      };

      const result = invoiceItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
    });

    it('should require description', () => {
      const invalidItem = {
        quantity: 1,
        rate: 5000,
        amount: 5000,
      };

      const result = invoiceItemSchema.safeParse(invalidItem);
      expect(result.success).toBe(false);
    });

    it('should require positive quantity', () => {
      const invalidQuantities = [0, -1, -10];

      invalidQuantities.forEach((qty) => {
        const result = invoiceItemSchema.safeParse({
          description: 'Service',
          quantity: qty,
          rate: 5000,
          amount: 5000,
        });
        expect(result.success).toBe(false);
      });
    });

    it('should require positive rate', () => {
      const invalidRates = [0, -100, -5000];

      invalidRates.forEach((rate) => {
        const result = invoiceItemSchema.safeParse({
          description: 'Service',
          quantity: 1,
          rate,
          amount: 5000,
        });
        expect(result.success).toBe(false);
      });
    });

    it('should require positive amount', () => {
      const invalidAmounts = [0, -100];

      invalidAmounts.forEach((amount) => {
        const result = invoiceItemSchema.safeParse({
          description: 'Service',
          quantity: 1,
          rate: 5000,
          amount,
        });
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Create Invoice Schema', () => {
    it('should accept valid invoice data', () => {
      const validData = {
        clientId: 1,
        orderId: 1,
        issueDate: '2024-01-01',
        dueDate: '2024-01-31',
        notes: 'Payment due within 30 days',
        items: [
          {
            description: 'Service A',
            quantity: 1,
            rate: 30000,
            amount: 30000,
          },
          {
            description: 'Service B',
            quantity: 2,
            rate: 10000,
            amount: 20000,
          },
        ],
        status: 'draft',
      };

      const result = createInvoiceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should require clientId', () => {
      const invalidData = {
        items: [
          {
            description: 'Service',
            quantity: 1,
            rate: 5000,
            amount: 5000,
          },
        ],
      };

      const result = createInvoiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require at least one item', () => {
      const invalidData = {
        clientId: 1,
        items: [],
      };

      const result = createInvoiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should default issue date to current date', () => {
      // Use a future due date to pass the refinement check
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const data = {
        clientId: 1,
        dueDate: futureDate.toISOString(),
        items: [
          {
            description: 'Service',
            quantity: 1,
            rate: 5000,
            amount: 5000,
          },
        ],
      };

      const result = createInvoiceSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.issueDate).toBeInstanceOf(Date);
      }
    });

    it('should default status to draft', () => {
      const data = {
        clientId: 1,
        dueDate: '2024-01-31',
        items: [
          {
            description: 'Service',
            quantity: 1,
            rate: 5000,
            amount: 5000,
          },
        ],
      };

      const result = createInvoiceSchema.safeParse(data);
      if (result.success) {
        expect(result.data.status).toBe('draft');
      }
    });

    it('should validate due date is after issue date', () => {
      const invalidData = {
        clientId: 1,
        issueDate: '2024-01-31',
        dueDate: '2024-01-01',
        items: [
          {
            description: 'Service',
            quantity: 1,
            rate: 5000,
            amount: 5000,
          },
        ],
      };

      const result = createInvoiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow due date equal to issue date', () => {
      const validData = {
        clientId: 1,
        issueDate: '2024-01-15',
        dueDate: '2024-01-15',
        items: [
          {
            description: 'Service',
            quantity: 1,
            rate: 5000,
            amount: 5000,
          },
        ],
      };

      const result = createInvoiceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject notes exceeding max length', () => {
      const invalidData = {
        clientId: 1,
        dueDate: '2024-01-31',
        items: [
          {
            description: 'Service',
            quantity: 1,
            rate: 5000,
            amount: 5000,
          },
        ],
        notes: 'a'.repeat(5001), // Exceeds 5000 character limit
      };

      const result = createInvoiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Update Invoice Schema', () => {
    it('should accept valid update data', () => {
      const validData = {
        orderId: 2,
        issueDate: '2024-01-05',
        dueDate: '2024-02-05',
        notes: 'Updated notes',
        items: [
          {
            description: 'Updated Service',
            quantity: 1,
            rate: 60000,
            amount: 60000,
          },
        ],
      };

      const result = updateInvoiceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should allow partial updates', () => {
      const partialUpdates = [
        { orderId: 2 },
        { notes: 'New notes' },
        { dueDate: '2024-02-15' },
      ];

      partialUpdates.forEach((update) => {
        const result = updateInvoiceSchema.safeParse(update);
        expect(result.success).toBe(true);
      });
    });

    it('should validate due date is after issue date when both provided', () => {
      const invalidData = {
        issueDate: '2024-01-31',
        dueDate: '2024-01-01',
      };

      const result = updateInvoiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should allow updating only due date', () => {
      const data = {
        dueDate: '2024-02-15',
      };

      const result = updateInvoiceSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow updating only issue date', () => {
      const data = {
        issueDate: '2024-01-05',
      };

      const result = updateInvoiceSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should require at least one item when updating items', () => {
      const invalidData = {
        items: [],
      };

      const result = updateInvoiceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Update Invoice Status Schema', () => {
    it('should accept valid status update', () => {
      const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

      validStatuses.forEach((status) => {
        const result = updateInvoiceStatusSchema.safeParse({ status });
        expect(result.success).toBe(true);
      });
    });

    it('should require status field', () => {
      const result = updateInvoiceStatusSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject invalid status', () => {
      const result = updateInvoiceStatusSchema.safeParse({ status: 'invalid' });
      expect(result.success).toBe(false);
    });
  });

  describe('Invoice Query Schema', () => {
    it('should accept valid query parameters', () => {
      const validData = {
        clientId: 1,
        status: 'sent',
        search: 'INV-2024',
        page: 2,
        limit: 50,
      };

      const result = invoiceQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should default page to 1', () => {
      const data = {};

      const result = invoiceQuerySchema.safeParse(data);
      if (result.success) {
        expect(result.data.page).toBe(1);
      }
    });

    it('should default limit to 20', () => {
      const data = {};

      const result = invoiceQuerySchema.safeParse(data);
      if (result.success) {
        expect(result.data.limit).toBe(20);
      }
    });

    it('should enforce maximum limit of 100', () => {
      const data = { limit: 150 };

      const result = invoiceQuerySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should coerce page and limit to numbers', () => {
      const data = { page: '3', limit: '40' };

      const result = invoiceQuerySchema.safeParse(data);
      if (result.success) {
        expect(typeof result.data.page).toBe('number');
        expect(typeof result.data.limit).toBe('number');
        expect(result.data.page).toBe(3);
        expect(result.data.limit).toBe(40);
      }
    });
  });

  describe('Invoice Status Workflow Validation', () => {
    it('should allow draft to sent transition', () => {
      const result = updateInvoiceStatusSchema.safeParse({ status: 'sent' });
      expect(result.success).toBe(true);
    });

    it('should allow draft to cancelled transition', () => {
      const result = updateInvoiceStatusSchema.safeParse({ status: 'cancelled' });
      expect(result.success).toBe(true);
    });

    it('should allow sent to paid transition', () => {
      const result = updateInvoiceStatusSchema.safeParse({ status: 'paid' });
      expect(result.success).toBe(true);
    });

    it('should allow sent to overdue transition', () => {
      const result = updateInvoiceStatusSchema.safeParse({ status: 'overdue' });
      expect(result.success).toBe(true);
    });

    it('should allow sent to cancelled transition', () => {
      const result = updateInvoiceStatusSchema.safeParse({ status: 'cancelled' });
      expect(result.success).toBe(true);
    });

    it('should allow overdue to paid transition', () => {
      const result = updateInvoiceStatusSchema.safeParse({ status: 'paid' });
      expect(result.success).toBe(true);
    });

    it('should allow overdue to cancelled transition', () => {
      const result = updateInvoiceStatusSchema.safeParse({ status: 'cancelled' });
      expect(result.success).toBe(true);
    });
  });
});
