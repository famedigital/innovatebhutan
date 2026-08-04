import { db } from "@/db";
import { productMaster } from "@/db/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";

export type ProductMaster = typeof productMaster.$inferSelect;
export type NewProductMaster = typeof productMaster.$inferInsert;

export interface ProductMasterFilters {
  category?: string;
  search?: string;
  active?: boolean;
  limit?: number;
  offset?: number;
}

export class ProductMasterRepository {
  private db = db;

  async list(filters: ProductMasterFilters = {}): Promise<{ items: ProductMaster[]; total: number }> {
    const conditions: any[] = [];

    if (filters.category) {
      conditions.push(eq(productMaster.category, filters.category));
    }
    if (filters.active !== undefined) {
      conditions.push(eq(productMaster.isActive, filters.active));
    }
    if (filters.search) {
      conditions.push(
        sql`(${productMaster.name} ILIKE ${"%" + filters.search + "%"} OR ${productMaster.sku} ILIKE ${"%" + filters.search + "%"} OR ${productMaster.brand} ILIKE ${"%" + filters.search + "%"})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      this.db
        .select()
        .from(productMaster)
        .where(whereClause)
        .orderBy(productMaster.sortOrder, desc(productMaster.createdAt))
        .limit(filters.limit || 100)
        .offset(filters.offset || 0),
      this.db.select({ count: count() }).from(productMaster).where(whereClause),
    ]);

    return { items, total: Number(totalResult[0]?.count || 0) };
  }

  async getById(id: number): Promise<ProductMaster | null> {
    const [row] = await this.db
      .select()
      .from(productMaster)
      .where(eq(productMaster.id, id))
      .limit(1);
    return row || null;
  }

  async create(data: NewProductMaster): Promise<ProductMaster> {
    const [row] = await this.db.insert(productMaster).values(data).returning();
    return row;
  }

  async update(id: number, data: Partial<NewProductMaster>): Promise<ProductMaster> {
    const [row] = await this.db
      .update(productMaster)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(productMaster.id, id))
      .returning();
    return row;
  }

  /** Soft-deactivate: keep historical quotation/purchase links intact. */
  async softDeactivate(id: number): Promise<ProductMaster | null> {
    const [row] = await this.db
      .update(productMaster)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(productMaster.id, id))
      .returning();
    return row || null;
  }
}

export const productMasterRepository = new ProductMasterRepository();
