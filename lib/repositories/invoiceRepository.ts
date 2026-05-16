import { db } from "@/db";
import { invoices, clients, orders } from "@/db/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { dashboardCache, withCache, hashFilters, listCache } from "@/lib/cache/repository-cache";

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;

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
    // Don't cache lists with search (too many permutations)
    const cacheKey = filters.search
      ? null
      : `invoices:list:${hashFilters(filters)}`;

    if (cacheKey) {
      const cached = listCache.get<{ invoices: any[]; total: number }>(cacheKey, 5000); // 5 seconds
      if (cached) {
        return cached;
      }
    }

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

    // Run both queries in parallel
    const [invoicesData, totalResult] = await Promise.all([
      this.db
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
        .offset(filters.offset || 0),

      this.db
        .select({ count: count() })
        .from(invoices)
        .where(whereClause),
    ]);

    const result = {
      invoices: invoicesData,
      total: Number(totalResult[0]?.count || 0),
    };

    if (cacheKey) {
      listCache.set(cacheKey, result);
    }

    return result;
  }

  // ==================== DASHBOARD STATS ====================

  /**
   * Get dashboard stats with caching (30 second TTL)
   * Single aggregation query instead of 4 parallel queries
   */
  async getDashboardStats(): Promise<InvoiceStats> {
    return withCache(
      'invoice:dashboard',
      () => this.computeDashboardStats(),
      dashboardCache,
      30000 // 30 seconds
    );
  }

  /**
   * Internal method to compute dashboard stats
   * Uses single aggregation query for better performance
   */
  private async computeDashboardStats(): Promise<InvoiceStats> {
    const [statsResult] = await this.db
      .select({
        total: count(),
        totalAmount: sql<number>`COALESCE(SUM(${invoices.total}), 0)`,
        paidCount: count(sql`CASE WHEN ${invoices.status} = 'paid' THEN 1 END`),
        paidAmount: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.total} ELSE 0 END), 0)`,
        overdueCount: count(sql`CASE WHEN ${invoices.status} = 'overdue' THEN 1 END`),
        overdueAmount: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'overdue' THEN ${invoices.total} ELSE 0 END), 0)`,
        sentCount: count(sql`CASE WHEN ${invoices.status} = 'sent' THEN 1 END`),
        sentAmount: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'sent' THEN ${invoices.total} ELSE 0 END), 0)`,
      })
      .from(invoices);

    return {
      total: Number(statsResult.total),
      totalAmount: Number(statsResult.totalAmount || 0),
      paidCount: Number(statsResult.paidCount),
      paidAmount: Number(statsResult.paidAmount || 0),
      overdueCount: Number(statsResult.overdueCount),
      overdueAmount: Number(statsResult.overdueAmount || 0),
      sentCount: Number(statsResult.sentCount),
      sentAmount: Number(statsResult.sentAmount || 0),
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
   * Optimized: Single bulk UPDATE instead of loop
   */
  async markOverdueInvoices(): Promise<Invoice[]> {
    const now = new Date();

    // Single bulk UPDATE - much faster than looping
    const updated = await this.db
      .update(invoices)
      .set({ status: 'overdue', updatedAt: now })
      .where(
        and(
          sql`${invoices.dueDate} < ${now}`,
          eq(invoices.status, 'sent')
        )
      )
      .returning();

    return updated;
  }
}

// Singleton instance
export const invoiceRepository = new InvoiceRepository();
