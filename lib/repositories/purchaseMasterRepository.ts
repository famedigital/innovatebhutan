import { db } from "@/db";
import { purchaseMasters, purchaseMasterItems } from "@/db/schema";
import { eq, and, desc, sql, count, inArray } from "drizzle-orm";

export type PurchaseMaster = typeof purchaseMasters.$inferSelect;
export type NewPurchaseMaster = typeof purchaseMasters.$inferInsert;
export type PurchaseMasterItem = typeof purchaseMasterItems.$inferSelect;
export type NewPurchaseMasterItem = typeof purchaseMasterItems.$inferInsert;

export interface PurchaseMasterFilters {
  status?: string;
  search?: string;
  supplierId?: number;
  limit?: number;
  offset?: number;
}

export interface PurchaseMasterWithItems extends PurchaseMaster {
  items: PurchaseMasterItem[];
}

export class PurchaseMasterRepository {
  private db = db;

  async list(
    filters: PurchaseMasterFilters = {}
  ): Promise<{ purchases: PurchaseMasterWithItems[]; total: number }> {
    const conditions: ReturnType<typeof eq>[] = [];

    if (filters.status) {
      conditions.push(eq(purchaseMasters.status, filters.status));
    }
    if (filters.supplierId) {
      conditions.push(eq(purchaseMasters.supplierId, filters.supplierId));
    }
    if (filters.search) {
      conditions.push(
        sql`(${purchaseMasters.supplierName} ILIKE ${"%" + filters.search + "%"} OR ${purchaseMasters.billReferenceNo} ILIKE ${"%" + filters.search + "%"} OR ${purchaseMasters.publicId} ILIKE ${"%" + filters.search + "%"})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(purchaseMasters)
        .where(whereClause)
        .orderBy(desc(purchaseMasters.createdAt))
        .limit(filters.limit || 50)
        .offset(filters.offset || 0),
      this.db.select({ count: count() }).from(purchaseMasters).where(whereClause),
    ]);

    const ids = rows.map((r) => r.id);
    let items: PurchaseMasterItem[] = [];
    if (ids.length > 0) {
      items = await this.db
        .select()
        .from(purchaseMasterItems)
        .where(inArray(purchaseMasterItems.purchaseId, ids))
        .orderBy(purchaseMasterItems.sortOrder);
    }

    const itemsByPurchase = new Map<number, PurchaseMasterItem[]>();
    for (const item of items) {
      const list = itemsByPurchase.get(item.purchaseId) || [];
      list.push(item);
      itemsByPurchase.set(item.purchaseId, list);
    }

    return {
      purchases: rows.map((p) => ({
        ...p,
        items: itemsByPurchase.get(p.id) || [],
      })),
      total: Number(totalResult[0]?.count || 0),
    };
  }

  async getById(id: number): Promise<PurchaseMasterWithItems | null> {
    const [row] = await this.db
      .select()
      .from(purchaseMasters)
      .where(eq(purchaseMasters.id, id))
      .limit(1);
    if (!row) return null;

    const items = await this.db
      .select()
      .from(purchaseMasterItems)
      .where(eq(purchaseMasterItems.purchaseId, id))
      .orderBy(purchaseMasterItems.sortOrder);

    return { ...row, items };
  }

  async createWithItems(
    data: NewPurchaseMaster,
    items: Array<Omit<NewPurchaseMasterItem, "purchaseId">>
  ): Promise<PurchaseMasterWithItems> {
    return await this.db.transaction(async (tx) => {
      const [purchase] = await tx.insert(purchaseMasters).values(data).returning();
      const createdItems =
        items.length > 0
          ? await tx
              .insert(purchaseMasterItems)
              .values(
                items.map((item, index) => ({
                  ...item,
                  purchaseId: purchase.id,
                  sortOrder: item.sortOrder ?? index,
                }))
              )
              .returning()
          : [];
      return { ...purchase, items: createdItems };
    });
  }

  async update(id: number, data: Partial<NewPurchaseMaster>): Promise<PurchaseMaster | null> {
    const [row] = await this.db
      .update(purchaseMasters)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(purchaseMasters.id, id))
      .returning();
    return row || null;
  }

  /** Soft cancel: set status to cancelled (keep line items / history). */
  async softCancel(id: number): Promise<PurchaseMaster | null> {
    const [row] = await this.db
      .update(purchaseMasters)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(purchaseMasters.id, id))
      .returning();
    return row || null;
  }
}

export const purchaseMasterRepository = new PurchaseMasterRepository();
