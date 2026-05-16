/**
 * Invoice Service Status Transition Tests
 *
 * Tests for invoice workflows:
 * - Status transitions (draft, sent, paid, overdue, cancelled)
 * - Invoice numbering generation
 * - Overdue detection
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InvoiceService } from '@/lib/services/invoiceService';
import { invoiceRepository } from '@/lib/repositories/invoiceRepository';

// Mock dependencies
vi.mock('@/lib/repositories/invoiceRepository', () => ({
  invoiceRepository: {
    getInvoiceById: vi.fn(),
    getInvoiceByNumber: vi.fn(),
    createInvoice: vi.fn(),
    updateInvoice: vi.fn(),
    updateInvoiceStatus: vi.fn(),
    deleteInvoice: vi.fn(),
    listInvoicesWithDetails: vi.fn(),
    getInvoicesByClientId: vi.fn(),
    getOverdueInvoices: vi.fn(),
    markOverdueInvoices: vi.fn(),
    getDashboardStats: vi.fn(),
  },
}));

vi.mock('@/lib/services/notificationService', () => ({
  notificationService: {
    notifyInvoicePaid: vi.fn(),
    notifyInvoiceOverdue: vi.fn(),
  },
}));

describe('InvoiceService - Status Transitions', () => {
  let invoiceService: InvoiceService;
  let mockInvoice: any;

  beforeEach(() => {
    invoiceService = new InvoiceService();
    const today = new Date();
    const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    mockInvoice = {
      id: 1,
      invoiceNumber: 'INV-20240101-ABCD',
      clientId: 1,
      issueDate: today,
      dueDate: futureDate,
      total: '50000',
      status: 'draft',
      items: [
        { description: 'Service A', quantity: 1, rate: 30000, amount: 30000 },
        { description: 'Service B', quantity: 1, rate: 20000, amount: 20000 },
      ],
      createdAt: new Date(),
    };
  });

  describe('Invoice Status Workflow', () => {
    it('should allow transition from draft to sent', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'draft',
      } as any);

      vi.mocked(invoiceRepository.updateInvoiceStatus).mockResolvedValue({
        ...mockInvoice,
        status: 'sent',
      } as any);

      const result = await invoiceService.updateInvoiceStatus(1, 'sent');

      expect(result.status).toBe('sent');
    });

    it('should allow transition from draft to cancelled', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'draft',
      } as any);

      vi.mocked(invoiceRepository.updateInvoiceStatus).mockResolvedValue({
        ...mockInvoice,
        status: 'cancelled',
      } as any);

      const result = await invoiceService.updateInvoiceStatus(1, 'cancelled');

      expect(result.status).toBe('cancelled');
    });

    it('should allow transition from sent to paid', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'sent',
      } as any);

      vi.mocked(invoiceRepository.updateInvoiceStatus).mockResolvedValue({
        ...mockInvoice,
        status: 'paid',
      } as any);

      const result = await invoiceService.updateInvoiceStatus(1, 'paid');

      expect(result.status).toBe('paid');
    });

    it('should allow transition from sent to overdue', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'sent',
      } as any);

      vi.mocked(invoiceRepository.updateInvoiceStatus).mockResolvedValue({
        ...mockInvoice,
        status: 'overdue',
      } as any);

      const result = await invoiceService.updateInvoiceStatus(1, 'overdue');

      expect(result.status).toBe('overdue');
    });

    it('should allow transition from sent to cancelled', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'sent',
      } as any);

      vi.mocked(invoiceRepository.updateInvoiceStatus).mockResolvedValue({
        ...mockInvoice,
        status: 'cancelled',
      } as any);

      const result = await invoiceService.updateInvoiceStatus(1, 'cancelled');

      expect(result.status).toBe('cancelled');
    });

    it('should allow transition from overdue to paid', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'overdue',
      } as any);

      vi.mocked(invoiceRepository.updateInvoiceStatus).mockResolvedValue({
        ...mockInvoice,
        status: 'paid',
      } as any);

      const result = await invoiceService.updateInvoiceStatus(1, 'paid');

      expect(result.status).toBe('paid');
    });

    it('should allow transition from overdue to cancelled', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'overdue',
      } as any);

      vi.mocked(invoiceRepository.updateInvoiceStatus).mockResolvedValue({
        ...mockInvoice,
        status: 'cancelled',
      } as any);

      const result = await invoiceService.updateInvoiceStatus(1, 'cancelled');

      expect(result.status).toBe('cancelled');
    });

    it('should reject transition from paid (terminal state)', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'paid',
      } as any);

      await expect(
        invoiceService.updateInvoiceStatus(1, 'sent')
      ).rejects.toThrow('Cannot transition from paid to sent');
    });

    it('should reject transition from cancelled (terminal state)', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'cancelled',
      } as any);

      await expect(
        invoiceService.updateInvoiceStatus(1, 'sent')
      ).rejects.toThrow('Cannot transition from cancelled to sent');
    });

    it('should reject direct transition from draft to paid', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'draft',
      } as any);

      await expect(
        invoiceService.updateInvoiceStatus(1, 'paid')
      ).rejects.toThrow('Cannot transition from draft to paid');
    });

    it('should reject direct transition from draft to overdue', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'draft',
      } as any);

      await expect(
        invoiceService.updateInvoiceStatus(1, 'overdue')
      ).rejects.toThrow('Cannot transition from draft to overdue');
    });
  });

  describe('Invoice Editing Restrictions', () => {
    it('should allow editing draft invoices', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'draft',
      } as any);

      const newItems = [
        { description: 'Updated Service', quantity: 2, rate: 25000 },
      ];

      vi.mocked(invoiceRepository.updateInvoice).mockResolvedValue({
        ...mockInvoice,
        items: newItems.map(i => ({ ...i, amount: i.quantity * i.rate })),
        total: '50000',
      } as any);

      await expect(
        invoiceService.updateInvoice(1, { items: newItems })
      ).resolves.toBeDefined();
    });

    it('should reject editing sent invoices', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'sent',
      } as any);

      await expect(
        invoiceService.updateInvoice(1, { items: [] })
      ).rejects.toThrow('Only draft invoices can be edited');
    });

    it('should reject editing paid invoices', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'paid',
      } as any);

      await expect(
        invoiceService.updateInvoice(1, { items: [] })
      ).rejects.toThrow('Only draft invoices can be edited');
    });

    it('should reject editing overdue invoices', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'overdue',
      } as any);

      await expect(
        invoiceService.updateInvoice(1, { items: [] })
      ).rejects.toThrow('Only draft invoices can be edited');
    });
  });

  describe('Invoice Deletion Restrictions', () => {
    it('should allow deleting draft invoices', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'draft',
      } as any);

      vi.mocked(invoiceRepository.deleteInvoice).mockResolvedValue(undefined);

      await expect(
        invoiceService.deleteInvoice(1)
      ).resolves.toBeUndefined();
    });

    it('should reject deleting sent invoices', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'sent',
      } as any);

      await expect(
        invoiceService.deleteInvoice(1)
      ).rejects.toThrow('Only draft invoices can be deleted');
    });

    it('should reject deleting paid invoices', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'paid',
      } as any);

      await expect(
        invoiceService.deleteInvoice(1)
      ).rejects.toThrow('Only draft invoices can be deleted');
    });
  });

  describe('Overdue Detection', () => {
    it('should identify sent invoice as overdue when due date passes', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const invoice = {
        ...mockInvoice,
        status: 'sent',
        dueDate: pastDate,
      };

      const isOverdue = invoiceService.isInvoiceOverdue(invoice);

      expect(isOverdue).toBe(true);
    });

    it('should not identify paid invoice as overdue even with past due date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const invoice = {
        ...mockInvoice,
        status: 'paid',
        dueDate: pastDate,
      };

      const isOverdue = invoiceService.isInvoiceOverdue(invoice);

      expect(isOverdue).toBe(false);
    });

    it('should not identify cancelled invoice as overdue', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const invoice = {
        ...mockInvoice,
        status: 'cancelled',
        dueDate: pastDate,
      };

      const isOverdue = invoiceService.isInvoiceOverdue(invoice);

      expect(isOverdue).toBe(false);
    });

    it('should not identify draft invoice as overdue', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 10);

      const invoice = {
        ...mockInvoice,
        status: 'draft',
        dueDate: pastDate,
      };

      const isOverdue = invoiceService.isInvoiceOverdue(invoice);

      expect(isOverdue).toBe(false);
    });

    it('should not identify future due date as overdue', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const invoice = {
        ...mockInvoice,
        status: 'sent',
        dueDate: futureDate,
      };

      const isOverdue = invoiceService.isInvoiceOverdue(invoice);

      expect(isOverdue).toBe(false);
    });
  });

  describe('Days Until Due Calculation', () => {
    it('should calculate positive days for future due dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const days = invoiceService.getDaysUntilDue(futureDate);

      expect(days).toBe(10);
    });

    it('should calculate negative days for past due dates (overdue)', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      const days = invoiceService.getDaysUntilDue(pastDate);

      expect(days).toBe(-5);
    });

    it('should return 0 for due date today', () => {
      const today = new Date();

      const days = invoiceService.getDaysUntilDue(today);

      // Should be close to 0 (within 1 day due to time differences)
      expect(Math.abs(days)).toBeLessThanOrEqual(1);
    });
  });

  describe('Invoice Generation', () => {
    it('should generate unique invoice number with date prefix', async () => {
      const items = [
        { description: 'Service A', quantity: 1, rate: 30000 },
      ];

      vi.mocked(invoiceRepository.createInvoice).mockImplementation((data: any) => {
        return Promise.resolve({
          id: 1,
          ...data,
        } as any);
      });

      const result = await invoiceService.generateInvoice({
        clientId: 1,
        issueDate: new Date('2024-01-15'),
        dueDate: new Date('2024-02-15'),
        items,
      });

      // Check that invoice number starts with INV- and has correct structure
      expect(result.invoiceNumber).toMatch(/^INV-\d{8}-[A-Z0-9]{4}$/);
    });

    it('should calculate total from items', async () => {
      const items = [
        { description: 'Service A', quantity: 2, rate: 15000 },
        { description: 'Service B', quantity: 1, rate: 20000 },
      ];

      vi.mocked(invoiceRepository.createInvoice).mockImplementation((data: any) => {
        return Promise.resolve({
          id: 1,
          ...data,
        } as any);
      });

      const result = await invoiceService.generateInvoice({
        clientId: 1,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items,
      });

      expect(result.total).toBe('50000');
    });

    it('should include amount in each item', async () => {
      const items = [
        { description: 'Service A', quantity: 2, rate: 15000 },
      ];

      vi.mocked(invoiceRepository.createInvoice).mockImplementation((data: any) => {
        return Promise.resolve({
          id: 1,
          ...data,
        } as any);
      });

      const result = await invoiceService.generateInvoice({
        clientId: 1,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items,
      });

      expect(result.items[0].amount).toBe(30000);
    });
  });

  describe('Helper Methods', () => {
    it('should mark invoice as sent', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'draft',
      } as any);

      vi.mocked(invoiceRepository.updateInvoiceStatus).mockResolvedValue({
        ...mockInvoice,
        status: 'sent',
      } as any);

      const result = await invoiceService.markInvoiceAsSent(1);

      expect(result.status).toBe('sent');
    });

    it('should mark invoice as paid with notifications', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'sent',
        clientName: 'Test Client',
      } as any);

      vi.mocked(invoiceRepository.updateInvoiceStatus).mockResolvedValue({
        ...mockInvoice,
        status: 'paid',
        clientName: 'Test Client',
      } as any);

      const result = await invoiceService.markInvoiceAsPaid(1);

      expect(result.status).toBe('paid');
    });

    it('should mark invoice as cancelled', async () => {
      vi.mocked(invoiceRepository.getInvoiceById).mockResolvedValue({
        ...mockInvoice,
        status: 'sent',
      } as any);

      vi.mocked(invoiceRepository.updateInvoiceStatus).mockResolvedValue({
        ...mockInvoice,
        status: 'cancelled',
      } as any);

      const result = await invoiceService.markInvoiceAsCancelled(1);

      expect(result.status).toBe('cancelled');
    });
  });
});
