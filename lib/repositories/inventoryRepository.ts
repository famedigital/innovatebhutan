import { db } from "@/db";
import { items, warehouses, bins, stockEntries, stockLedger } from "@/db/schema";
import { eq, and, desc, sql, count, isNull, like } from "drizzle-orm";

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
export type Warehouse = typeof warehouses.$inferSelect;
export type NewWarehouse = typeof warehouses.$inferInsert;
export type Bin = typeof bins.$inferSelect;
export type NewBin = typeof bins.$inferInsert;
export type StockEntry = typeof stockEntries.$inferSelect;
export type NewStockEntry = typeof stockEntries.$inferInsert;
export type StockLedger = typeof stockLedger.$inferSelect;

export interface InventoryFilters {
  search?: string;
  category?: string;
  isActive?: boolean;
  warehouseId?: number;
  lowStock?: boolean;
  limit?: number;
  offset?: number;
}

export interface StockLevel {
  itemId: number;
  itemName: string;
  sku: string;
  warehouseId: number;
  warehouseName: string;
  binId: number | null;
  binName: string | null;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  reorderLevel: number;
  isLowStock: boolean;
}

export class InventoryRepository {
  private db = db;

  // ==================== ITEMS CRUD ====================

  async createItem(data: NewItem): Promise<Item> {
    const [item] = await this.db.insert(items).values(data).returning();
    return item;
  }

  async getItemById(id: number): Promise<Item | null> {
    const [item] = await this.db.select().from(items).where(eq(items.id, id)).limit(1);
    return item || null;
  }

  async getItemByPublicId(publicId: string): Promise<Item | null> {
    const [item] = await this.db.select().from(items).where(eq(items.publicId, publicId)).limit(1);
    return item || null;
  }

  async updateItem(id: number, data: Partial<NewItem>): Promise<Item> {
    const [item] = await this.db
      .update(items)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(items.id, id))
      .returning();
    return item;
  }

  async deleteItem(id: number): Promise<void> {
    await this.db.delete(items).where(eq(items.id, id));
  }

  async listItems(filters: InventoryFilters = {}): Promise<{ items: Item[]; total: number }> {
    const conditions: any[] = [];

    if (filters.search) {
      conditions.push(
        sql`(${items.name} ILIKE ${'%' + filters.search + '%'} OR ${items.sku} ILIKE ${'%' + filters.search + '%'} OR ${items.description} ILIKE ${'%' + filters.search + '%'})`
      );
    }
    if (filters.category) {
      conditions.push(eq(items.category, filters.category));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(items.isActive, filters.isActive));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await this.db
      .select({ count: count() })
      .from(items)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const itemsData = await this.db
      .select()
      .from(items)
      .where(whereClause)
      .orderBy(desc(items.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return { items: itemsData, total };
  }

  // ==================== WAREHOUSES CRUD ====================

  async createWarehouse(data: NewWarehouse): Promise<Warehouse> {
    const [warehouse] = await this.db.insert(warehouses).values(data).returning();
    return warehouse;
  }

  async getWarehouseById(id: number): Promise<Warehouse | null> {
    const [warehouse] = await this.db.select().from(warehouses).where(eq(warehouses.id, id)).limit(1);
    return warehouse || null;
  }

  async getWarehouseByPublicId(publicId: string): Promise<Warehouse | null> {
    const [warehouse] = await this.db.select().from(warehouses).where(eq(warehouses.publicId, publicId)).limit(1);
    return warehouse || null;
  }

  async updateWarehouse(id: number, data: Partial<NewWarehouse>): Promise<Warehouse> {
    const [warehouse] = await this.db
      .update(warehouses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(warehouses.id, id))
      .returning();
    return warehouse;
  }

  async deleteWarehouse(id: number): Promise<void> {
    await this.db.delete(warehouses).where(eq(warehouses.id, id));
  }

  async listWarehouses(activeOnly = false): Promise<Warehouse[]> {
    const conditions = activeOnly ? [eq(warehouses.isActive, true)] : [];
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return await this.db
      .select()
      .from(warehouses)
      .where(whereClause)
      .orderBy(desc(warehouses.createdAt));
  }

  // ==================== BINS CRUD ====================

  async createBin(data: NewBin): Promise<Bin> {
    const [bin] = await this.db.insert(bins).values(data).returning();
    return bin;
  }

  async getBinById(id: number): Promise<Bin | null> {
    const [bin] = await this.db.select().from(bins).where(eq(bins.id, id)).limit(1);
    return bin || null;
  }

  async getBinsByWarehouse(warehouseId: number): Promise<Bin[]> {
    return await this.db
      .select()
      .from(bins)
      .where(and(eq(bins.warehouseId, warehouseId), eq(bins.isActive, true)))
      .orderBy(bins.name);
  }

  async updateBin(id: number, data: Partial<NewBin>): Promise<Bin> {
    const [bin] = await this.db
      .update(bins)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bins.id, id))
      .returning();
    return bin;
  }

  async deleteBin(id: number): Promise<void> {
    await this.db.delete(bins).where(eq(bins.id, id));
  }

  // ==================== STOCK ENTRIES ====================

  async createStockEntry(data: NewStockEntry): Promise<StockEntry> {
    return await this.db.transaction(async (tx) => {
      // Create the stock entry
      const [entry] = await tx.insert(stockEntries).values(data).returning();

      // Update or create stock ledger entry
      const existingLedger = await tx
        .select()
        .from(stockLedger)
        .where(
          and(
            eq(stockLedger.itemId, entry.itemId),
            eq(stockLedger.warehouseId, entry.warehouseId),
            entry.binId ? eq(stockLedger.binId, entry.binId) : isNull(stockLedger.binId)
          )
        )
        .limit(1);

      if (existingLedger[0]) {
        // Update existing ledger
        const newQuantity = Number(existingLedger[0].quantity) + Number(entry.quantity);
        await tx
          .update(stockLedger)
          .set({
            quantity: newQuantity,
            lastUpdated: new Date(),
          })
          .where(eq(stockLedger.id, existingLedger[0].id));
      } else {
        // Create new ledger entry
        await tx.insert(stockLedger).values({
          itemId: entry.itemId,
          warehouseId: entry.warehouseId,
          binId: entry.binId || null,
          quantity: entry.quantity,
          reservedQuantity: 0,
          valuationRate: entry.rate || "0",
        });
      }

      return entry;
    });
  }

  async getStockEntries(filters: {
    itemId?: number;
    warehouseId?: number;
    type?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ entries: StockEntry[]; total: number }> {
    const conditions: any[] = [];

    if (filters.itemId) {
      conditions.push(eq(stockEntries.itemId, filters.itemId));
    }
    if (filters.warehouseId) {
      conditions.push(eq(stockEntries.warehouseId, filters.warehouseId));
    }
    if (filters.type) {
      conditions.push(eq(stockEntries.type, filters.type));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await this.db
      .select({ count: count() })
      .from(stockEntries)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const entriesData = await this.db
      .select()
      .from(stockEntries)
      .where(whereClause)
      .orderBy(desc(stockEntries.postingDate))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return { entries: entriesData, total };
  }

  // ==================== STOCK LEVELS ====================

  async getStockLevels(filters: { warehouseId?: number; lowStock?: boolean } = {}): Promise<StockLevel[]> {
    const conditions: any[] = [];

    if (filters.warehouseId) {
      conditions.push(eq(stockLedger.warehouseId, filters.warehouseId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await this.db
      .select({
        itemId: stockLedger.itemId,
        itemName: items.name,
        sku: items.sku,
        warehouseId: stockLedger.warehouseId,
        warehouseName: warehouses.name,
        binId: stockLedger.binId,
        binName: bins.name,
        quantity: stockLedger.quantity,
        reservedQuantity: stockLedger.reservedQuantity,
        reorderLevel: items.reorderLevel,
      })
      .from(stockLedger)
      .leftJoin(items, eq(stockLedger.itemId, items.id))
      .leftJoin(warehouses, eq(stockLedger.warehouseId, warehouses.id))
      .leftJoin(bins, eq(stockLedger.binId, bins.id))
      .where(whereClause)
      .orderBy(desc(items.name));

    const stockLevels: StockLevel[] = result.map((row) => {
      const qty = Number(row.quantity);
      const reserved = Number(row.reservedQuantity || 0);
      const reorderLevel = Number(row.reorderLevel || 0);
      const availableQty = qty - reserved;

      return {
        itemId: row.itemId,
        itemName: row.itemName || "",
        sku: row.sku || "",
        warehouseId: row.warehouseId,
        warehouseName: row.warehouseName || "",
        binId: row.binId,
        binName: row.binName,
        quantity: qty,
        reservedQuantity: reserved,
        availableQuantity: availableQty,
        reorderLevel: reorderLevel,
        isLowStock: availableQty <= reorderLevel,
      };
    });

    // Filter low stock if requested
    if (filters.lowStock) {
      return stockLevels.filter((sl) => sl.isLowStock);
    }

    return stockLevels;
  }

  async getLowStockItems(threshold?: number): Promise<StockLevel[]> {
    const result = await this.db
      .select({
        itemId: stockLedger.itemId,
        itemName: items.name,
        sku: items.sku,
        warehouseId: stockLedger.warehouseId,
        warehouseName: warehouses.name,
        binId: stockLedger.binId,
        binName: bins.name,
        quantity: stockLedger.quantity,
        reservedQuantity: stockLedger.reservedQuantity,
        reorderLevel: items.reorderLevel,
      })
      .from(stockLedger)
      .leftJoin(items, eq(stockLedger.itemId, items.id))
      .leftJoin(warehouses, eq(stockLedger.warehouseId, warehouses.id))
      .leftJoin(bins, eq(stockLedger.binId, bins.id))
      .where(sql`${stockLedger.quantity} - COALESCE(${stockLedger.reservedQuantity}, 0) <= COALESCE(${items.reorderLevel}, 0)`)
      .orderBy(items.name);

    return result.map((row) => {
      const qty = Number(row.quantity);
      const reserved = Number(row.reservedQuantity || 0);

      return {
        itemId: row.itemId,
        itemName: row.itemName || "",
        sku: row.sku || "",
        warehouseId: row.warehouseId,
        warehouseName: row.warehouseName || "",
        binId: row.binId,
        binName: row.binName,
        quantity: qty,
        reservedQuantity: reserved,
        availableQuantity: qty - reserved,
        reorderLevel: Number(row.reorderLevel || 0),
        isLowStock: true,
      };
    });
  }
}

// Singleton instance
export const inventoryRepository = new InventoryRepository();
