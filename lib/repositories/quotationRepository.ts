import { db } from "@/db";
import { salesQuotations, salesQuotationItems } from "@/db/schema";
import { eq, and, desc, sql, count, inArray } from "drizzle-orm";

export type SalesQuotation = typeof salesQuotations.$inferSelect;
export type NewSalesQuotation = typeof salesQuotations.$inferInsert;
export type SalesQuotationItem = typeof salesQuotationItems.$inferSelect;
export type NewSalesQuotationItem = typeof salesQuotationItems.$inferInsert;

export interface QuotationFilters {
  category?: string;
  status?: string;
  clientId?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface QuotationWithItems extends SalesQuotation {
  items: SalesQuotationItem[];
}

export class QuotationRepository {
  private db = db;

  async list(filters: QuotationFilters = {}): Promise<{ quotations: QuotationWithItems[]; total: number }> {
    const conditions: any[] = [];

    if (filters.category) {
      conditions.push(eq(salesQuotations.category, filters.category));
    }
    if (filters.status) {
      conditions.push(eq(salesQuotations.status, filters.status));
    }
    if (filters.clientId) {
      conditions.push(eq(salesQuotations.clientId, filters.clientId));
    }
    if (filters.search) {
      conditions.push(
        sql`(${salesQuotations.quotationNumber} ILIKE ${"%" + filters.search + "%"} OR ${salesQuotations.businessName} ILIKE ${"%" + filters.search + "%"} OR ${salesQuotations.customerName} ILIKE ${"%" + filters.search + "%"})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(salesQuotations)
        .where(whereClause)
        .orderBy(desc(salesQuotations.createdAt))
        .limit(filters.limit || 50)
        .offset(filters.offset || 0),
      this.db.select({ count: count() }).from(salesQuotations).where(whereClause),
    ]);

    const ids = rows.map((r) => r.id);
    let items: SalesQuotationItem[] = [];
    if (ids.length > 0) {
      items = await this.db
        .select()
        .from(salesQuotationItems)
        .where(inArray(salesQuotationItems.quotationId, ids))
        .orderBy(salesQuotationItems.sortOrder);
    }

    const itemsByQuotation = new Map<number, SalesQuotationItem[]>();
    for (const item of items) {
      const list = itemsByQuotation.get(item.quotationId) || [];
      list.push(item);
      itemsByQuotation.set(item.quotationId, list);
    }

    return {
      quotations: rows.map((q) => ({
        ...q,
        items: itemsByQuotation.get(q.id) || [],
      })),
      total: Number(totalResult[0]?.count || 0),
    };
  }

  async getById(id: number): Promise<QuotationWithItems | null> {
    const [row] = await this.db
      .select()
      .from(salesQuotations)
      .where(eq(salesQuotations.id, id))
      .limit(1);
    if (!row) return null;

    const items = await this.db
      .select()
      .from(salesQuotationItems)
      .where(eq(salesQuotationItems.quotationId, id))
      .orderBy(salesQuotationItems.sortOrder);

    return { ...row, items };
  }

  async getByPublicId(publicId: string): Promise<QuotationWithItems | null> {
    const [row] = await this.db
      .select()
      .from(salesQuotations)
      .where(eq(salesQuotations.publicId, publicId))
      .limit(1);
    if (!row) return null;

    const items = await this.db
      .select()
      .from(salesQuotationItems)
      .where(eq(salesQuotationItems.quotationId, row.id))
      .orderBy(salesQuotationItems.sortOrder);

    return { ...row, items };
  }

  async createWithItems(
    data: NewSalesQuotation,
    items: Array<Omit<NewSalesQuotationItem, "quotationId">>
  ): Promise<QuotationWithItems> {
    return await this.db.transaction(async (tx) => {
      const [quotation] = await tx.insert(salesQuotations).values(data).returning();
      const createdItems =
        items.length > 0
          ? await tx
              .insert(salesQuotationItems)
              .values(
                items.map((item, index) => ({
                  ...item,
                  quotationId: quotation.id,
                  sortOrder: item.sortOrder ?? index,
                }))
              )
              .returning()
          : [];
      return { ...quotation, items: createdItems };
    });
  }

  async updateStatus(id: number, status: string): Promise<SalesQuotation | null> {
    const [row] = await this.db
      .update(salesQuotations)
      .set({ status, updatedAt: new Date() })
      .where(eq(salesQuotations.id, id))
      .returning();
    return row || null;
  }

  async markAdvancePaid(
    id: number,
    data: { depositProofUrl?: string | null; advancePaidAt?: Date }
  ): Promise<SalesQuotation | null> {
    const [row] = await this.db
      .update(salesQuotations)
      .set({
        status: "advance_paid",
        advancePaidAt: data.advancePaidAt || new Date(),
        depositProofUrl: data.depositProofUrl ?? null,
        updatedAt: new Date(),
      })
      .where(eq(salesQuotations.id, id))
      .returning();
    return row || null;
  }

  async update(id: number, data: Partial<NewSalesQuotation>): Promise<SalesQuotation | null> {
    const [row] = await this.db
      .update(salesQuotations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(salesQuotations.id, id))
      .returning();
    return row || null;
  }

  async updateWithItems(
    id: number,
    data: Partial<NewSalesQuotation>,
    items: Array<Omit<NewSalesQuotationItem, "quotationId">>
  ): Promise<QuotationWithItems | null> {
    return await this.db.transaction(async (tx) => {
      const [quotation] = await tx
        .update(salesQuotations)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(salesQuotations.id, id))
        .returning();
      if (!quotation) return null;

      await tx
        .delete(salesQuotationItems)
        .where(eq(salesQuotationItems.quotationId, id));

      const createdItems =
        items.length > 0
          ? await tx
              .insert(salesQuotationItems)
              .values(
                items.map((item, index) => ({
                  ...item,
                  quotationId: id,
                  sortOrder: item.sortOrder ?? index,
                }))
              )
              .returning()
          : [];

      return { ...quotation, items: createdItems };
    });
  }

  async countByYearPrefix(prefix: string): Promise<number> {
    const result = await this.db
      .select({ count: count() })
      .from(salesQuotations)
      .where(sql`${salesQuotations.quotationNumber} LIKE ${prefix + "%"}`);
    return Number(result[0]?.count || 0);
  }
}

export const quotationRepository = new QuotationRepository();
