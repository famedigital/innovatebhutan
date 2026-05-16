import { assetRepository, type AssetFilters, type AssetStats } from "@/lib/repositories/assetRepository";
import type { Asset, AssetCategory, MaintenanceEntry, AssetMovement } from "@/lib/repositories/assetRepository";
import { AuthorizationError } from "@/lib/errors/auth-error";

export type AssetStatus = "active" | "sold" | "scrapped" | "written_off" | "maintenance";
export type MaintenanceType = "preventive" | "corrective" | "upgrade";
export type MovementType = "transfer_in" | "transfer_out" | "issue" | "return";

export interface CreateAssetDTO {
  name: string;
  description?: string;
  categoryId: number;
  itemId?: number;
  purchaseDate?: Date;
  purchaseValue?: number;
  salvageValue?: number;
  location?: string;
  warehouseId?: number;
  assignedTo?: number;
  serialNumber?: string;
  barcode?: string;
  warrantyExpiry?: Date;
  imageUrl?: string;
  purchaseInvoiceId?: number;
  supplierId?: number;
  metadata?: Record<string, any>;
}

export interface UpdateAssetDTO {
  name?: string;
  description?: string;
  categoryId?: number;
  purchaseDate?: Date;
  purchaseValue?: number;
  currentValue?: number;
  salvageValue?: number;
  location?: string;
  warehouseId?: number;
  assignedTo?: number;
  status?: AssetStatus;
  serialNumber?: string;
  barcode?: string;
  warrantyExpiry?: Date;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  parentId?: number;
  depreciationRate?: number;
  depreciationMethod?: "straight_line" | "reducing_balance";
  usefulLife?: number;
  isFixedAsset?: boolean;
}

export interface CreateMaintenanceDTO {
  assetId: number;
  maintenanceDate: Date;
  maintenanceType: MaintenanceType;
  description: string;
  cost?: number;
  performedBy?: string;
  vendorId?: number;
  nextMaintenanceDate?: Date;
  notes?: string;
}

export interface CreateMovementDTO {
  assetId: number;
  movementDate: Date;
  movementType: MovementType;
  fromLocation?: string;
  toLocation?: string;
  fromWarehouseId?: number;
  toWarehouseId?: number;
  fromEmployeeId?: number;
  toEmployeeId?: number;
  reason?: string;
  remarks?: string;
  createdBy: number;
}

export class AssetService {
  private repository = assetRepository;

  // ==================== ASSET CATEGORIES ====================

  async createCategory(data: CreateCategoryDTO, userId?: string): Promise<AssetCategory> {
    const publicId = `cat_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    return await this.repository.createCategory({
      publicId,
      name: data.name,
      description: data.description,
      parentId: data.parentId,
      depreciationRate: data.depreciationRate,
      depreciationMethod: data.depreciationMethod,
      usefulLife: data.usefulLife,
      isFixedAsset: data.isFixedAsset ?? true,
      isActive: true,
    });
  }

  async getCategories(): Promise<AssetCategory[]> {
    return await this.repository.getCategories();
  }

  async getCategoryById(id: number): Promise<AssetCategory | null> {
    return await this.repository.getCategoryById(id);
  }

  async updateCategory(id: number, data: Partial<CreateCategoryDTO>, userRole?: string): Promise<AssetCategory> {
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("Only administrators and staff can update categories");
    }

    return await this.repository.updateCategory(id, data);
  }

  async deleteCategory(id: number, userRole?: string): Promise<void> {
    if (userRole !== "ADMIN") {
      throw new AuthorizationError("Only administrators can delete categories");
    }

    await this.repository.deleteCategory(id);
  }

  // ==================== ASSETS CRUD ====================

  async createAsset(data: CreateAssetDTO, userId?: string): Promise<Asset> {
    // Generate asset number
    const year = new Date().getFullYear();
    const count = await this.getAssetCountForYear(year);
    const assetNumber = `AST-${year}-${String(count + 1).padStart(4, "0")}`;
    const publicId = `${assetNumber}_${Math.random().toString(36).substring(2, 8)}`;

    // Calculate initial values
    const purchaseValue = data.purchaseValue || 0;
    const currentValue = data.purchaseValue;
    const netBookValue = purchaseValue;

    return await this.repository.createAsset({
      publicId,
      assetNumber,
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      itemId: data.itemId,
      purchaseDate: data.purchaseDate || new Date(),
      purchaseValue: data.purchaseValue?.toString(),
      currentValue: currentValue?.toString(),
      salvageValue: data.salvageValue?.toString(),
      accumulatedDepreciation: "0",
      netBookValue: netBookValue.toString(),
      location: data.location,
      warehouseId: data.warehouseId,
      assignedTo: data.assignedTo,
      status: "active",
      serialNumber: data.serialNumber,
      barcode: data.barcode,
      warrantyExpiry: data.warrantyExpiry,
      imageUrl: data.imageUrl,
      purchaseInvoiceId: data.purchaseInvoiceId,
      supplierId: data.supplierId,
      metadata: data.metadata as any,
    });
  }

  async getAssetById(id: number): Promise<Asset | null> {
    return await this.repository.getAssetById(id);
  }

  async getAssetByPublicId(publicId: string): Promise<Asset | null> {
    return await this.repository.getAssetByPublicId(publicId);
  }

  async updateAsset(id: number, data: UpdateAssetDTO, userId?: string, userRole?: string): Promise<Asset> {
    const asset = await this.repository.getAssetById(id);
    if (!asset) {
      throw new Error("Asset not found");
    }

    // Only admin/staff can modify assets
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("Only administrators and staff can modify assets");
    }

    return await this.repository.updateAsset(id, data);
  }

  async deleteAsset(id: number, userRole?: string): Promise<void> {
    if (userRole !== "ADMIN") {
      throw new AuthorizationError("Only administrators can delete assets");
    }

    await this.repository.deleteAsset(id);
  }

  async listAssets(filters: AssetFilters = {}) {
    return await this.repository.listAssetsWithDetails(filters);
  }

  // ==================== ASSET STATUS TRANSITIONS ====================

  async transitionAssetStatus(assetId: number, newStatus: AssetStatus): Promise<Asset> {
    const asset = await this.repository.getAssetById(assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    const validTransitions: Record<AssetStatus, AssetStatus[]> = {
      active: ["maintenance", "sold", "scrapped", "written_off"],
      sold: [],
      scrapped: [],
      written_off: [],
      maintenance: ["active"],
    };

    const currentStatus = asset.status as AssetStatus;
    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(
        `Cannot transition from ${currentStatus} to ${newStatus}. Valid transitions: ${validTransitions[currentStatus]?.join(", ") || "none"}`
      );
    }

    return await this.repository.updateAsset(assetId, { status: newStatus });
  }

  // ==================== DEPRECIATION ====================

  async runDepreciationForAsset(assetId: number): Promise<void> {
    const calculation = await this.repository.calculateDepreciation(assetId);
    if (!calculation) {
      throw new Error("Cannot calculate depreciation for this asset");
    }

    const asset = await this.repository.getAssetById(assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    // Create depreciation entry
    const entry = await this.repository.createDepreciationEntry({
      assetId,
      date: new Date(),
      amount: calculation.annualDepreciation.toString(),
      accumulatedDepreciation: calculation.accumulatedDepreciation.toString(),
      netBookValue: calculation.netBookValue.toString(),
      fiscalYear: this.getCurrentFiscalYear(),
      status: "posted",
    });

    // Update asset values
    await this.repository.updateAsset(assetId, {
      accumulatedDepreciation: calculation.accumulatedDepreciation.toString(),
      netBookValue: calculation.netBookValue.toString(),
    });
  }

  async runDepreciationForAll(): Promise<{ processed: number; skipped: number }> {
    const pendingEntries = await this.repository.getPendingDepreciation(new Date());
    let processed = 0;
    let skipped = 0;

    for (const entry of pendingEntries) {
      try {
        await this.runDepreciationForAsset(entry.assetId);
        processed++;
      } catch (error) {
        console.error(`Failed to run depreciation for asset ${entry.assetId}:`, error);
        skipped++;
      }
    }

    return { processed, skipped };
  }

  async scheduleDepreciation(assetId: number): Promise<void> {
    const asset = await this.repository.getAssetById(assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    const category = await this.repository.getCategoryById(asset.categoryId);
    if (!category?.usefulLife) {
      throw new Error("Asset category must have useful life defined");
    }

    const purchaseDate = asset.purchaseDate ? new Date(asset.purchaseDate) : new Date();
    const usefulLife = category.usefulLife;

    // Schedule annual depreciation entries
    for (let year = 0; year < usefulLife; year++) {
      const depreciationDate = new Date(purchaseDate);
      depreciationDate.setFullYear(depreciationDate.getFullYear() + year + 1);
      depreciationDate.setMonth(3, 1); // April 1st (start of fiscal year in Bhutan)

      await this.repository.createDepreciationEntry({
        assetId,
        date: depreciationDate,
        amount: "0", // Will be calculated when posted
        accumulatedDepreciation: "0",
        netBookValue: "0",
        fiscalYear: `${depreciationDate.getFullYear()}-${depreciationDate.getFullYear() + 1}`,
        status: "scheduled",
      });
    }
  }

  // ==================== MAINTENANCE ====================

  async createMaintenance(data: CreateMaintenanceDTO, userRole?: string): Promise<MaintenanceEntry> {
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("Only administrators and staff can create maintenance records");
    }

    const entry = await this.repository.createMaintenanceEntry({
      assetId: data.assetId,
      maintenanceDate: data.maintenanceDate,
      maintenanceType: data.maintenanceType,
      description: data.description,
      cost: data.cost?.toString(),
      performedBy: data.performedBy,
      vendorId: data.vendorId,
      nextMaintenanceDate: data.nextMaintenanceDate,
      notes: data.notes,
    });

    // If maintenance puts asset in maintenance status, update it
    if (data.maintenanceType === "corrective") {
      await this.repository.updateAsset(data.assetId, { status: "maintenance" });
    }

    return entry;
  }

  async getMaintenanceByAssetId(assetId: number): Promise<MaintenanceEntry[]> {
    return await this.repository.getMaintenanceByAssetId(assetId);
  }

  async getUpcomingMaintenance(): Promise<Array<MaintenanceEntry & { assetName: string }>> {
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    return await this.repository.getUpcomingMaintenance(oneMonthFromNow);
  }

  async completeMaintenance(assetId: number): Promise<Asset> {
    return await this.repository.updateAsset(assetId, { status: "active" });
  }

  // ==================== MOVEMENTS ====================

  async createMovement(data: CreateMovementDTO, userRole?: string): Promise<AssetMovement> {
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("Only administrators and staff can create asset movements");
    }

    const movement = await this.repository.createMovement({
      assetId: data.assetId,
      movementDate: data.movementDate,
      movementType: data.movementType,
      fromLocation: data.fromLocation,
      toLocation: data.toLocation,
      fromWarehouseId: data.fromWarehouseId,
      toWarehouseId: data.toWarehouseId,
      fromEmployeeId: data.fromEmployeeId,
      toEmployeeId: data.toEmployeeId,
      reason: data.reason,
      remarks: data.remarks,
      createdBy: data.createdBy,
    });

    // Update asset location based on movement
    const updateData: Partial<UpdateAssetDTO> = {};
    if (data.toLocation) {
      updateData.location = data.toLocation;
    }
    if (data.toWarehouseId) {
      updateData.warehouseId = data.toWarehouseId;
    }
    if (data.toEmployeeId) {
      updateData.assignedTo = data.toEmployeeId;
    }

    if (Object.keys(updateData).length > 0) {
      await this.repository.updateAsset(data.assetId, updateData);
    }

    return movement;
  }

  async getMovementsByAssetId(assetId: number): Promise<AssetMovement[]> {
    return await this.repository.getMovementsByAssetId(assetId);
  }

  // ==================== STATS & ANALYTICS ====================

  async getAssetStats(): Promise<AssetStats> {
    return await this.repository.getAssetStats();
  }

  async getAssetsByCategory(categoryId: number): Promise<Asset[]> {
    return await this.repository.getAssetsByCategory(categoryId);
  }

  async getAssetsByLocation(location: string): Promise<Asset[]> {
    return await this.repository.getAssetsByLocation(location);
  }

  async getAssetsByEmployee(employeeId: number): Promise<Asset[]> {
    return await this.repository.getAssetsByEmployee(employeeId);
  }

  // ==================== HELPERS ====================

  private async getAssetCountForYear(year: number): Promise<number> {
    const { assets } = await this.repository.listAssets({
      limit: 10000,
    });

    const yearPrefix = `AST-${year}`;
    return assets.filter(a => a.assetNumber?.startsWith(yearPrefix)).length;
  }

  private getCurrentFiscalYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Bhutan fiscal year: July to June
    // If month is before July (0-6), fiscal year is (year-1)-year
    // If month is July or later (7-11), fiscal year is year-(year+1)
    if (month < 6) {
      return `${year - 1}-${year}`;
    }
    return `${year}-${year + 1}`;
  }
}

// Singleton instance
export const assetService = new AssetService();
