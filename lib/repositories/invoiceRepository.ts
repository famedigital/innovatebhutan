import { db } from "@/db";
import { invoices, clients, orders } from "@/db/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";

type Invoice = typeof invoices.$inferSelect;
type NewInvoice = typeof invoices.$inferInsert;

export interface InvoiceFilters {
  clientId?: number;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface InvoiceStats {
  total: number;
  totalAmount: number;
  paidCount: number;
  paidAmount: number;
  overdueCount: number;
  overdueAmount: number;
  sentCount: number;
  sentAmount: number;
}

export class InvoiceRepository {
  private db = db;

  // ==================== INVOICE CRUD ====================

  async createInvoice(data: NewInvoice): Promise<Invoice> {
    const [invoice] = await this.db.insert(invoices).values(data).returning();
    return invoice;
  }

  async getInvoiceById(id: number): Promise<Invoice | null> {
    const [invoice] = await this.db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
    return invoice || null;
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
    const [invoice] = await this.db.select()
      .from(invoices)
      .where(eq(invoices.invoiceNumber, invoiceNumber))
      .limit(1);
    return invoice || null;
  }

  async updateInvoice(id: number, data: Partial<NewInvoice>): Promise<Invoice> {
    const [invoice] = await this.db.update(invoices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async updateInvoiceStatus(id: number, status: string): Promise<Invoice> {
    const [invoice] = await this.db.update(invoices)
      .set({ status, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async deleteInvoice(id: number): Promise<void> {
    await this.db.delete(invoices).where(eq(invoices.id, id));
  }

  // ==================== QUERY METHODS ====================

  async listInvoices(filters: InvoiceFilters = {}): Promise<{ invoices: Invoice[]; total: number }> {
    const conditions = [];

    if (filters.clientId) {
      conditions.push(eq(invoices.clientId, filters.clientId));
    }
    if (filters.status) {
      conditions.push(eq(invoices.status, filters.status));
    }
    if (filters.search) {
      conditions.push(
        sql`(${invoices.invoiceNumber} ILIKE ${'%' + filters.search + '%'})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(invoices)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Fetch invoices
    const invoicesData = await this.db
      .select()
      .from(invoices)
      .where(whereClause)
      .orderBy(desc(invoices.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return { invoices: invoicesData, total };
  }

  async listInvoicesWithDetails(filters: InvoiceFilters = {}) {
    const conditions = [];

    if (filters.clientId) {
      conditions.push(eq(invoices.clientId, filters.clientId));
    }
    if (filters.status) {
      conditions.push(eq(invoices.status, filters.status));
    }
    if (filters.search) {
      conditions.push(
        sql`(${invoices.invoiceNumber} ILIKE ${'%' + filters.search + '%'})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const invoicesData = await this.db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        clientId: invoices.clientId,
        orderId: invoices.orderId,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        total: invoices.total,
        status: invoices.status,
        items: invoices.items,
        notes: invoices.notes,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
        clientName: clients.name,
        clientLogo: clients.logoUrl,
        clientWhatsapp: clients.whatsapp,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(whereClause)
      .orderBy(desc(invoices.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(invoices)
      .where(whereClause);

    return {
      invoices: invoicesData,
      total: totalResult[0]?.count || 0,
    };
  }

  // ==================== DASHBOARD STATS ====================

  async getDashboardStats(): Promise<InvoiceStats> {
    const [totalResult, paidResult, overdueResult, sentResult] = await Promise.all([
      this.db
        .select({ count: count(), totalAmount: sql<number>`COALESCE(SUM(${invoices.total}), 0)` })
        .from(invoices),
      this.db
        .select({ count: count(), totalAmount: sql<number>`COALESCE(SUM(${invoices.total}), 0)` })
        .from(invoices)
        .where(eq(invoices.status, 'paid')),
      this.db
        .select({ count: count(), totalAmount: sql<number>`COALESCE(SUM(${invoices.total}), 0)` })
        .from(invoices)
        .where(eq(invoices.status, 'overdue')),
      this.db
        .select({ count: count(), totalAmount: sql<number>`COALESCE(SUM(${invoices.total}), 0)` })
        .from(invoices)
        .where(eq(invoices.status, 'sent')),
    ]);

    return {
      total: Number(totalResult[0]?.count || 0),
      totalAmount: Number(totalResult[0]?.totalAmount || 0),
      paidCount: Number(paidResult[0]?.count || 0),
      paidAmount: Number(paidResult[0]?.totalAmount || 0),
      overdueCount: Number(overdueResult[0]?.count || 0),
      overdueAmount: Number(overdueResult[0]?.totalAmount || 0),
      sentCount: Number(sentResult[0]?.count || 0),
      sentAmount: Number(sentResult[0]?.totalAmount || 0),
    };
  }

  // ==================== CLIENT METHODS ====================

  async getInvoicesByClientId(clientId: number): Promise<Invoice[]> {
    return await this.db
      .select()
      .from(invoices)
      .where(eq(invoices.clientId, clientId))
      .orderBy(desc(invoices.createdAt));
  }

  // ==================== OVERDUE DETECTION ====================

  async getOverdueInvoices(): Promise<Invoice[]> {
    const now = new Date();

    return await this.db
      .select()
      .from(invoices)
      .where(
        and(
          sql`${invoices.dueDate} < ${now}`,
          eq(invoices.status, 'sent')
        )
      )
      .orderBy(invoices.dueDate);
  }

  /**
   * Update all sent invoices that are past due date to overdue status
   * Uses a transaction for atomicity
   */
  async markOverdueInvoices(): Promise<Invoice[]> {
    return await this.db.transaction(async (tx) => {
      const now = new Date();

      const overdueInvoices = await tx
        .select()
        .from(invoices)
        .where(
          and(
            sql`${invoices.dueDate} < ${now}`,
            eq(invoices.status, 'sent')
          )
        );

      const updated: Invoice[] = [];
      for (const invoice of overdueInvoices) {
        const [updatedInvoice] = await tx.update(invoices)
          .set({ status: 'overdue', updatedAt: new Date() })
          .where(eq(invoices.id, invoice.id))
          .returning();
        updated.push(updatedInvoice);
      }

      return updated;
    });
  }
}

// Singleton instance
export const invoiceRepository = new InvoiceRepository();
