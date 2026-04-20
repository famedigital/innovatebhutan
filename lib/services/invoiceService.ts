import { invoiceRepository } from "@/lib/repositories/invoiceRepository";
import type { CreateInvoiceInput, UpdateInvoiceInput, InvoiceStatus } from "@/lib/validations/invoice";

export interface CreateInvoiceDTO {
  clientId: number;
  orderId?: number;
  issueDate: Date;
  dueDate: Date;
  items: Array<{ description: string; quantity: number; rate: number }>;
  notes?: string;
}

export interface UpdateInvoiceDTO {
  orderId?: number;
  issueDate?: Date;
  dueDate?: Date;
  items?: Array<{ description: string; quantity: number; rate: number }>;
  notes?: string;
}

export interface InvoiceListItem {
  id: number;
  invoiceNumber: string;
  clientId: number;
  issueDate: Date;
  dueDate: Date;
  total: string;
  status: InvoiceStatus;
  clientName?: string;
  clientLogo?: string;
}

export class InvoiceService {
  private repository = invoiceRepository;

  // ==================== INVOICE GENERATION ====================

  async generateInvoice(data: CreateInvoiceDTO) {
    // Generate invoice number: INV-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const invoiceNumber = `INV-${dateStr}-${randomSuffix}`;

    // Calculate total
    const total = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const itemsWithAmount = data.items.map(item => ({
      ...item,
      amount: item.quantity * item.rate,
    }));

    return await this.repository.createInvoice({
      invoiceNumber,
      clientId: data.clientId,
      orderId: data.orderId,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      total: total.toString(),
      items: itemsWithAmount,
      notes: data.notes,
      status: "draft",
    });
  }

  // ==================== INVOICE CRUD ====================

  async getInvoiceById(id: number) {
    return await this.repository.getInvoiceById(id);
  }

  async getInvoiceByNumber(invoiceNumber: string) {
    return await this.repository.getInvoiceByNumber(invoiceNumber);
  }

  async updateInvoice(id: number, data: UpdateInvoiceDTO) {
    const invoice = await this.repository.getInvoiceById(id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Only allow editing draft invoices
    if (invoice.status !== "draft") {
      throw new Error("Only draft invoices can be edited");
    }

    // Recalculate total if items changed
    let total = Number(invoice.total);
    let items = invoice.items;

    if (data.items) {
      items = data.items.map(item => ({
        ...item,
        amount: item.quantity * item.rate,
      }));
      total = items.reduce((sum, item) => sum + item.amount, 0);
    }

    return await this.repository.updateInvoice(id, {
      ...data,
      total: total.toString(),
      items,
    });
  }

  async deleteInvoice(id: number) {
    const invoice = await this.repository.getInvoiceById(id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Only allow deletion of draft invoices
    if (invoice.status !== "draft") {
      throw new Error("Only draft invoices can be deleted");
    }

    await this.repository.deleteInvoice(id);
  }

  async listInvoices(filters: any = {}) {
    return await this.repository.listInvoicesWithDetails(filters);
  }

  // ==================== STATUS MANAGEMENT ====================

  async updateInvoiceStatus(id: number, status: InvoiceStatus) {
    const invoice = await this.repository.getInvoiceById(id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Validate status transitions
    const validTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
      draft: ["sent", "cancelled"],
      sent: ["paid", "overdue", "cancelled"],
      paid: [], // Terminal state
      overdue: ["paid", "cancelled"],
      cancelled: [], // Terminal state
    };

    const currentStatus = invoice.status as InvoiceStatus;
    if (!validTransitions[currentStatus]?.includes(status)) {
      throw new Error(
        `Cannot transition from ${currentStatus} to ${status}. Valid transitions: ${validTransitions[currentStatus]?.join(", ") || "none"}`
      );
    }

    return await this.repository.updateInvoiceStatus(id, status);
  }

  async markInvoiceAsSent(id: number) {
    return await this.updateInvoiceStatus(id, "sent");
  }

  async markInvoiceAsPaid(id: number) {
    const invoice = await this.updateInvoiceStatus(id, "paid");

    // TODO: Create transaction record in transactions table
    // TODO: Update order status if linked to an order

    return invoice;
  }

  async markInvoiceAsCancelled(id: number) {
    return await this.updateInvoiceStatus(id, "cancelled");
  }

  // ==================== OVERDUE MANAGEMENT ====================

  async markOverdueInvoices() {
    return await this.repository.markOverdueInvoices();
  }

  async getOverdueInvoices() {
    return await this.repository.getOverdueInvoices();
  }

  // ==================== CLIENT METHODS ====================

  async getInvoicesByClientId(clientId: number) {
    return await this.repository.getInvoicesByClientId(clientId);
  }

  // ==================== DASHBOARD STATS ====================

  async getDashboardStats() {
    const stats = await this.repository.getDashboardStats();

    // Calculate pending amount (sent + overdue)
    const pendingCount = stats.sentCount + stats.overdueCount;
    const pendingAmount = stats.sentAmount + stats.overdueAmount;

    return {
      ...stats,
      pendingCount,
      pendingAmount,
    };
  }

  // ==================== BUSINESS RULES ====================

  /**
   * Check if an invoice is overdue based on due date
   */
  isInvoiceOverdue(invoice: { dueDate: Date; status: string }): boolean {
    if (invoice.status === "paid" || invoice.status === "cancelled" || invoice.status === "draft") {
      return false;
    }
    return new Date(invoice.dueDate) < new Date();
  }

  /**
   * Get days until due date (negative if overdue)
   */
  getDaysUntilDue(dueDate: Date): number {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

// Singleton instance
export const invoiceService = new InvoiceService();
