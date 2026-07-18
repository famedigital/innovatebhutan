import { invoiceRepository } from "@/lib/repositories/invoiceRepository";
import type { CreateInvoiceInput, UpdateInvoiceInput, InvoiceStatus } from "@/lib/validations/invoice";
import { notificationService } from "@/lib/services/notificationService";

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
    // Collision-safe invoice number: INV-YYYYMMDD-<seq>-<shortId>
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const existing = await this.repository.listInvoices({ limit: 1, offset: 0 });
    const seq = String((existing.total || 0) + 1).padStart(4, "0");
    const shortId = Date.now().toString(36).slice(-4).toUpperCase();
    let invoiceNumber = `INV-${dateStr}-${seq}-${shortId}`;

    // Retry once if rare collision
    const clash = await this.repository.getInvoiceByNumber(invoiceNumber);
    if (clash) {
      invoiceNumber = `INV-${dateStr}-${seq}-${Date.now().toString(36).toUpperCase()}`;
    }

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
    let items = invoice.items as InvoiceItem[];

    if (data.items) {
      items = data.items.map(item => ({
        ...item,
        amount: item.quantity * item.rate,
      }));
      total = items.reduce((sum: number, item: InvoiceItem) => sum + item.amount, 0);
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

    // Send payment notification to admins
    const adminProfileIds = await this.getAdminProfileIds();
    await notificationService.notifyInvoicePaid(
      adminProfileIds,
      invoice.invoiceNumber,
      `Client #${invoice.clientId}`,
      Number(invoice.total) || 0
    );

    return invoice;
  }

  async markInvoiceAsCancelled(id: number) {
    return await this.updateInvoiceStatus(id, "cancelled");
  }

  // ==================== OVERDUE MANAGEMENT ====================

  async markOverdueInvoices() {
    const result = await this.repository.markOverdueInvoices();

    // Send notifications for newly overdue invoices
    const overdueInvoices = await this.repository.getOverdueInvoices();
    const adminProfileIds = await this.getAdminProfileIds();

    for (const invoice of overdueInvoices) {
      await notificationService.notifyInvoiceOverdue(
        adminProfileIds,
        invoice.invoiceNumber,
        `Client #${invoice.clientId}`,
        Number(invoice.total) || 0,
        new Date(invoice.dueDate)
      );
    }

    return result;
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

  /**
   * Get profile IDs of admin users who should receive invoice notifications
   */
  private async getAdminProfileIds(): Promise<number[]> {
    // TODO: Implement actual admin profile lookup
    return [];
  }
}

// Singleton instance
export const invoiceService = new InvoiceService();
