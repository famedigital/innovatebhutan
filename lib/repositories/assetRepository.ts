import { db } from "@/db";
import {
  assets,
  assetCategories,
  depreciationSchedule,
  assetMaintenance,
  assetMovements,
  items,
  warehouses,
  employees,
  suppliers,
} from "@/db/schema";
import { eq, and, desc, sql, count, isNull, like } from "drizzle-orm";

export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type AssetCategory = typeof assetCategories.$inferSelect;
export type NewAssetCategory = typeof assetCategories.$inferInsert;
export type DepreciationEntry = typeof depreciationSchedule.$inferSelect;
export type NewDepreciationEntry = typeof depreciationSchedule.$inferInsert;
export type MaintenanceEntry = typeof assetMaintenance.$inferSelect;
export type NewMaintenanceEntry = typeof assetMaintenance.$inferInsert;
export type AssetMovement = typeof assetMovements.$inferSelect;
export type NewAssetMovement = typeof assetMovements.$inferInsert;

export interface AssetFilters {
  categoryId?: number;
  status?: string;
  location?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AssetStats {
  totalAssets: number;
  activeAssets: number;
  totalValue: number;
  accumulatedDepreciation: number;
  netBookValue: number;
}

export class AssetRepository {
  private db = db;

  // ==================== ASSET CATEGORIES ====================

  async createCategory(data: NewAssetCategory): Promise<AssetCategory> {
    const [category] = await this.db.insert(assetCategories).values(data).returning();
    return category;
  }

  async getCategories(): Promise<AssetCategory[]> {
    return await this.db
      .select()
      .from(assetCategories)
      .where(eq(assetCategories.isActive, true))
      .orderBy(assetCategories.name);
  }

  async getCategoryById(id: number): Promise<AssetCategory | null> {
    const [category] = await this.db
      .select()
      .from(assetCategories)
      .where(eq(assetCategories.id, id))
      .limit(1);
    return category || null;
  }

  async updateCategory(id: number, data: Partial<NewAssetCategory>): Promise<AssetCategory> {
    const [category] = await this.db
      .update(assetCategories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(assetCategories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    await this.db.delete(assetCategories).where(eq(assetCategories.id, id));
  }

  // ==================== ASSETS CRUD ====================

  async createAsset(data: NewAsset): Promise<Asset> {
    const [asset] = await this.db.insert(assets).values(data).returning();
    return asset;
  }

  async getAssetById(id: number): Promise<Asset | null> {
    const [asset] = await this.db.select().from(assets).where(eq(assets.id, id)).limit(1);
    return asset || null;
  }

  async getAssetByPublicId(publicId: string): Promise<Asset | null> {
    const [asset] = await this.db
      .select()
      .from(assets)
      .where(eq(assets.publicId, publicId))
      .limit(1);
    return asset || null;
  }

  async getAssetByNumber(assetNumber: string): Promise<Asset | null> {
    const [asset] = await this.db
      .select()
      .from(assets)
      .where(eq(assets.assetNumber, assetNumber))
      .limit(1);
    return asset || null;
  }

  async updateAsset(id: number, data: Partial<NewAsset>): Promise<Asset> {
    const [asset] = await this.db
      .update(assets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(assets.id, id))
      .returning();
    return asset;
  }

  async deleteAsset(id: number): Promise<void> {
    await this.db.delete(assets).where(eq(assets.id, id));
  }

  async listAssets(filters: AssetFilters = {}): Promise<{ assets: Asset[]; total: number }> {
    const conditions: any[] = [];

    if (filters.categoryId) {
      conditions.push(eq(assets.categoryId, filters.categoryId));
    }
    if (filters.status) {
      conditions.push(eq(assets.status, filters.status));
    }
    if (filters.location) {
      conditions.push(eq(assets.location, filters.location));
    }
    if (filters.search) {
      conditions.push(
        sql`(${assets.name} ILIKE ${'%' + filters.search + '%'} OR ${assets.assetNumber} ILIKE ${'%' + filters.search + '%'} OR ${assets.description} ILIKE ${'%' + filters.search + '%'})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(assets)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Fetch assets
    const assetsData = await this.db
      .select()
      .from(assets)
      .where(whereClause)
      .orderBy(desc(assets.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return { assets: assetsData, total };
  }

  async listAssetsWithDetails(filters: AssetFilters = {}) {
    const conditions: any[] = [];

    if (filters.categoryId) {
      conditions.push(eq(assets.categoryId, filters.categoryId));
    }
    if (filters.status) {
      conditions.push(eq(assets.status, filters.status));
    }
    if (filters.location) {
      conditions.push(eq(assets.location, filters.location));
    }
    if (filters.search) {
      conditions.push(
        sql`(${assets.name} ILIKE ${'%' + filters.search + '%'} OR ${assets.assetNumber} ILIKE ${'%' + filters.search + '%'})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [assetsData, totalResult] = await Promise.all([
      this.db
        .select({
          id: assets.id,
          publicId: assets.publicId,
          assetNumber: assets.assetNumber,
          name: assets.name,
          description: assets.description,
          categoryId: assets.categoryId,
          categoryName: assetCategories.name,
          purchaseDate: assets.purchaseDate,
          purchaseValue: assets.purchaseValue,
          currentValue: assets.currentValue,
          netBookValue: assets.netBookValue,
          location: assets.location,
          status: assets.status,
          assignedTo: assets.assignedTo,
          serialNumber: assets.serialNumber,
          warrantyExpiry: assets.warrantyExpiry,
          imageUrl: assets.imageUrl,
          createdAt: assets.createdAt,
        })
        .from(assets)
        .leftJoin(assetCategories, eq(assets.categoryId, assetCategories.id))
        .where(whereClause)
        .orderBy(desc(assets.createdAt))
        .limit(filters.limit || 50)
        .offset(filters.offset || 0),

      this.db
        .select({ count: count() })
        .from(assets)
        .where(whereClause),
    ]);

    return {
      assets: assetsData,
      total: Number(totalResult[0]?.count || 0),
    };
  }

  // ==================== DEPRECIATION ====================

  async createDepreciationEntry(data: NewDepreciationEntry): Promise<DepreciationEntry> {
    const [entry] = await this.db.insert(depreciationSchedule).values(data).returning();
    return entry;
  }

  async getDepreciationByAssetId(assetId: number): Promise<DepreciationEntry[]> {
    return await this.db
      .select()
      .from(depreciationSchedule)
      .where(eq(depreciationSchedule.assetId, assetId))
      .orderBy(depreciationSchedule.date);
  }

  async getPendingDepreciation(date: Date): Promise<DepreciationEntry[]> {
    return await this.db
      .select()
      .from(depreciationSchedule)
      .where(
        and(
          eq(depreciationSchedule.status, "scheduled"),
          sql`${depreciationSchedule.date} <= ${date}`
        )
      )
      .orderBy(depreciationSchedule.date);
  }

  async updateDepreciationEntry(id: number, data: Partial<NewDepreciationEntry>): Promise<DepreciationEntry> {
    const [entry] = await this.db
      .update(depreciationSchedule)
      .set(data)
      .where(eq(depreciationSchedule.id, id))
      .returning();
    return entry;
  }

  async calculateDepreciation(assetId: number): Promise<{
    annualDepreciation: number;
    accumulatedDepreciation: number;
    netBookValue: number;
  } | null> {
    const asset = await this.getAssetById(assetId);
    if (!asset || !asset.purchaseValue) return null;

    const category = await this.getCategoryById(asset.categoryId);
    if (!category?.depreciationRate || !category.usefulLife) {
      return null;
    }

    const purchaseValue = Number(asset.purchaseValue);
    const salvageValue = Number(asset.salvageValue || 0);
    const depreciationRate = Number(category.depreciationRate);
    const usefulLife = category.usefulLife;

    let annualDepreciation = 0;

    if (category.depreciationMethod === "straight_line") {
      annualDepreciation = (purchaseValue - salvageValue) / usefulLife;
    } else if (category.depreciationMethod === "reducing_balance") {
      annualDepreciation = purchaseValue * (depreciationRate / 100);
    }

    // Get existing accumulated depreciation
    const existingEntries = await this.getDepreciationByAssetId(assetId);
    const accumulatedDepreciation = existingEntries.reduce(
      (sum, entry) => sum + Number(entry.amount || 0),
      0
    );

    const netBookValue = purchaseValue - accumulatedDepreciation;

    return {
      annualDepreciation,
      accumulatedDepreciation,
      netBookValue,
    };
  }

  // ==================== MAINTENANCE ====================

  async createMaintenanceEntry(data: NewMaintenanceEntry): Promise<MaintenanceEntry> {
    const [entry] = await this.db.insert(assetMaintenance).values(data).returning();
    return entry;
  }

  async getMaintenanceByAssetId(assetId: number): Promise<MaintenanceEntry[]> {
    return await this.db
      .select()
      .from(assetMaintenance)
      .where(eq(assetMaintenance.assetId, assetId))
      .orderBy(desc(assetMaintenance.maintenanceDate));
  }

  async getUpcomingMaintenance(date: Date): Promise<Array<MaintenanceEntry & { assetName: string }>> {
    return await this.db
      .select({
        id: assetMaintenance.id,
        assetId: assetMaintenance.assetId,
        maintenanceDate: assetMaintenance.maintenanceDate,
        maintenanceType: assetMaintenance.maintenanceType,
        description: assetMaintenance.description,
        cost: assetMaintenance.cost,
        performedBy: assetMaintenance.performedBy,
        nextMaintenanceDate: assetMaintenance.nextMaintenanceDate,
        notes: assetMaintenance.notes,
        createdAt: assetMaintenance.createdAt,
        assetName: assets.name,
      })
      .from(assetMaintenance)
      .innerJoin(assets, eq(assetMaintenance.assetId, assets.id))
      .where(
        and(
          sql`${assetMaintenance.nextMaintenanceDate} <= ${date}`,
          sql`${assetMaintenance.nextMaintenanceDate} >= ${new Date()}`
        )
      )
      .orderBy(assetMaintenance.nextMaintenanceDate);
  }

  // ==================== MOVEMENTS ====================

  async createMovement(data: NewAssetMovement): Promise<AssetMovement> {
    const [movement] = await this.db.insert(assetMovements).values(data).returning();
    return movement;
  }

  async getMovementsByAssetId(assetId: number): Promise<AssetMovement[]> {
    return await this.db
      .select()
      .from(assetMovements)
      .where(eq(assetMovements.assetId, assetId))
      .orderBy(desc(assetMovements.movementDate));
  }

  // ==================== STATS ====================

  async getAssetStats(): Promise<AssetStats> {
    const result = await this.db
      .select({
        total: count(),
        active: count(sql`CASE WHEN ${assets.status} = 'active' THEN 1 END`),
        totalValue: sql<string>`COALESCE(SUM(${assets.purchaseValue}), 0)`,
        accumulatedDepreciation: sql<string>`COALESCE(SUM(${assets.accumulatedDepreciation}), 0)`,
        netBookValue: sql<string>`COALESCE(SUM(${assets.netBookValue}), 0)`,
      })
      .from(assets);

    const row = result[0] || { total: 0, active: 0, totalValue: "0", accumulatedDepreciation: "0", netBookValue: "0" };

    return {
      totalAssets: Number(row.total),
      activeAssets: Number(row.active),
      totalValue: Number(row.totalValue),
      accumulatedDepreciation: Number(row.accumulatedDepreciation),
      netBookValue: Number(row.netBookValue),
    };
  }

  async getAssetsByCategory(categoryId: number): Promise<Asset[]> {
    return await this.db
      .select()
      .from(assets)
      .where(eq(assets.categoryId, categoryId))
      .orderBy(desc(assets.createdAt));
  }

  async getAssetsByLocation(location: string): Promise<Asset[]> {
    return await this.db
      .select()
      .from(assets)
      .where(eq(assets.location, location))
      .orderBy(desc(assets.createdAt));
  }

  async getAssetsByEmployee(employeeId: number): Promise<Asset[]> {
    return await this.db
      .select()
      .from(assets)
      .where(eq(assets.assignedTo, employeeId))
      .orderBy(desc(assets.createdAt));
  }
}

// Singleton instance
export const assetRepository = new AssetRepository();
