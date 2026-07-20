import { inventoryRepository, type InventoryFilters, type StockLevel } from "@/lib/repositories/inventoryRepository";
import type { Item, Warehouse, Bin, NewItem, NewWarehouse, NewBin, StockEntry } from "@/lib/repositories/inventoryRepository";
import { AuthorizationError } from "@/lib/errors/auth-error";

export type StockEntryType = "receipt" | "issue" | "transfer" | "adjustment" | "manufacture";

export interface CreateItemDTO {
  name: string;
  sku: string;
  description?: string;
  unit: string;
  category?: string;
  brand?: string;
  manufacturer?: string;
  imageUrl?: string;
  reorderLevel?: number;
  leadTimeDays?: number;
  costPrice?: string;
  sellingPrice?: string;
  metadata?: Record<string, any>;
}

export interface UpdateItemDTO {
  name?: string;
  sku?: string;
  description?: string;
  unit?: string;
  category?: string;
  brand?: string;
  manufacturer?: string;
  imageUrl?: string;
  reorderLevel?: number;
  leadTimeDays?: number;
  costPrice?: string;
  sellingPrice?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface CreateWarehouseDTO {
  name: string;
  location?: string;
  city?: string;
  district?: string;
  coordinates?: { lat: number; lng: number };
  managerId?: number;
  capacity?: string;
  notes?: string;
}

export interface UpdateWarehouseDTO {
  name?: string;
  location?: string;
  city?: string;
  district?: string;
  coordinates?: { lat: number; lng: number };
  managerId?: number;
  capacity?: string;
  isActive?: boolean;
  notes?: string;
}

export interface CreateBinDTO {
  warehouseId: number;
  name: string;
  location?: string;
  capacity?: string;
}

export interface StockReceiptDTO {
  itemId: number;
  warehouseId: number;
  binId?: number;
  quantity: number;
  rate?: string;
  referenceType?: string;
  referenceId?: number;
  batchNo?: string;
  serialNo?: string;
  remarks?: string;
  postingDate?: Date;
}

export interface StockIssueDTO {
  itemId: number;
  warehouseId: number;
  binId?: number;
  quantity: number;
  rate?: string;
  referenceType?: string;
  referenceId?: number;
  serialNo?: string;
  remarks?: string;
  postingDate?: Date;
}

export interface StockTransferDTO {
  itemId: number;
  fromWarehouseId: number;
  toWarehouseId: number;
  fromBinId?: number;
  toBinId?: number;
  quantity: number;
  remarks?: string;
}

export class InventoryService {
  private repository = inventoryRepository;

  // ==================== ITEM OPERATIONS ====================

  async createItem(data: CreateItemDTO): Promise<Item> {
    // Check if SKU already exists
    const existing = await this.repository.getItemByPublicId(data.sku);
    if (existing) {
      throw new Error(`Item with SKU ${data.sku} already exists`);
    }

    // Generate public ID
    const publicId = `item_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    return await this.repository.createItem({
      publicId,
      name: data.name,
      sku: data.sku,
      description: data.description,
      unit: data.unit,
      category: data.category,
      brand: data.brand,
      manufacturer: data.manufacturer,
      imageUrl: data.imageUrl,
      reorderLevel: data.reorderLevel ?? 10,
      leadTimeDays: data.leadTimeDays ?? 7,
      costPrice: data.costPrice,
      sellingPrice: data.sellingPrice,
      isActive: true,
      metadata: data.metadata,
    });
  }

  async getItemById(id: number): Promise<Item | null> {
    return await this.repository.getItemById(id);
  }

  async getItemByPublicId(publicId: string): Promise<Item | null> {
    return await this.repository.getItemByPublicId(publicId);
  }

  async updateItem(id: number, data: UpdateItemDTO): Promise<Item> {
    const item = await this.repository.getItemById(id);
    if (!item) {
      throw new Error("Item not found");
    }

    return await this.repository.updateItem(id, data);
  }

  async deleteItem(id: number, userRole?: string): Promise<void> {
    const item = await this.repository.getItemById(id);
    if (!item) {
      throw new Error("Item not found");
    }

    // Only admins can delete items
    if (userRole !== "ADMIN") {
      throw new AuthorizationError("Only administrators can delete items");
    }

    await this.repository.deleteItem(id);
  }

  async listItems(filters: InventoryFilters = {}) {
    return await this.repository.listItems(filters);
  }

  // ==================== WAREHOUSE OPERATIONS ====================

  async createWarehouse(data: CreateWarehouseDTO): Promise<Warehouse> {
    const publicId = `wh_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    return await this.repository.createWarehouse({
      publicId,
      name: data.name,
      location: data.location,
      city: data.city,
      district: data.district,
      coordinates: data.coordinates,
      managerId: data.managerId,
      capacity: data.capacity,
      notes: data.notes,
      isActive: true,
    });
  }

  async getWarehouseById(id: number): Promise<Warehouse | null> {
    return await this.repository.getWarehouseById(id);
  }

  async updateWarehouse(id: number, data: UpdateWarehouseDTO): Promise<Warehouse> {
    const warehouse = await this.repository.getWarehouseById(id);
    if (!warehouse) {
      throw new Error("Warehouse not found");
    }

    return await this.repository.updateWarehouse(id, data);
  }

  async deleteWarehouse(id: number, userRole?: string): Promise<void> {
    const warehouse = await this.repository.getWarehouseById(id);
    if (!warehouse) {
      throw new Error("Warehouse not found");
    }

    // Only admins can delete warehouses
    if (userRole !== "ADMIN") {
      throw new AuthorizationError("Only administrators can delete warehouses");
    }

    await this.repository.deleteWarehouse(id);
  }

  async listWarehouses(activeOnly = false): Promise<Warehouse[]> {
    return await this.repository.listWarehouses(activeOnly);
  }

  // ==================== BIN OPERATIONS ====================

  async createBin(data: CreateBinDTO): Promise<Bin> {
    // Verify warehouse exists
    const warehouse = await this.repository.getWarehouseById(data.warehouseId);
    if (!warehouse) {
      throw new Error("Warehouse not found");
    }

    const publicId = `bin_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    return await this.repository.createBin({
      publicId,
      warehouseId: data.warehouseId,
      name: data.name,
      location: data.location,
      capacity: data.capacity,
      isActive: true,
    });
  }

  async getBinById(id: number): Promise<Bin | null> {
    return await this.repository.getBinById(id);
  }

  async getBinsByWarehouse(warehouseId: number): Promise<Bin[]> {
    return await this.repository.getBinsByWarehouse(warehouseId);
  }

  async updateBin(id: number, data: Partial<CreateBinDTO>): Promise<Bin> {
    const bin = await this.repository.getBinById(id);
    if (!bin) {
      throw new Error("Bin not found");
    }

    return await this.repository.updateBin(id, data);
  }

  async deleteBin(id: number, userRole?: string): Promise<void> {
    const bin = await this.repository.getBinById(id);
    if (!bin) {
      throw new Error("Bin not found");
    }

    // Only admins can delete bins
    if (userRole !== "ADMIN") {
      throw new AuthorizationError("Only administrators can delete bins");
    }

    await this.repository.deleteBin(id);
  }

  // ==================== STOCK OPERATIONS ====================

  /**
   * Process stock receipt (add stock to warehouse)
   */
  async receiveStock(data: StockReceiptDTO): Promise<StockEntry> {
    if (data.quantity <= 0) {
      throw new Error("Quantity must be positive for stock receipt");
    }

    // Verify item exists
    const item = await this.repository.getItemById(data.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Verify warehouse exists
    const warehouse = await this.repository.getWarehouseById(data.warehouseId);
    if (!warehouse) {
      throw new Error("Warehouse not found");
    }

    const publicId = `se_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    return await this.repository.createStockEntry({
      publicId,
      itemId: data.itemId,
      warehouseId: data.warehouseId,
      binId: data.binId,
      quantity: data.quantity,
      type: "receipt",
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      batchNo: data.batchNo,
      serialNo: data.serialNo,
      rate: data.rate,
      amount: data.rate && data.quantity
        ? (parseFloat(data.rate) * data.quantity).toString()
        : undefined,
      remarks: data.remarks,
      postingDate: data.postingDate || new Date(),
    });
  }

  /**
   * Process stock issue (remove stock from warehouse)
   */
  async issueStock(data: StockIssueDTO): Promise<StockEntry> {
    if (data.quantity <= 0) {
      throw new Error("Quantity must be positive for stock issue");
    }

    // Verify item exists
    const item = await this.repository.getItemById(data.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Verify warehouse exists
    const warehouse = await this.repository.getWarehouseById(data.warehouseId);
    if (!warehouse) {
      throw new Error("Warehouse not found");
    }

    // Check if sufficient stock is available
    const stockLevels = await this.repository.getStockLevels({
      warehouseId: data.warehouseId,
    });

    const itemStock = stockLevels.find(
      (sl) => sl.itemId === data.itemId && sl.warehouseId === data.warehouseId
    );

    if (!itemStock || itemStock.availableQuantity < data.quantity) {
      throw new Error(
        `Insufficient stock. Available: ${itemStock?.availableQuantity || 0}, Requested: ${data.quantity}`
      );
    }

    const publicId = `se_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    return await this.repository.createStockEntry({
      publicId,
      itemId: data.itemId,
      warehouseId: data.warehouseId,
      binId: data.binId,
      quantity: -data.quantity, // Negative for issue
      type: "issue",
      referenceType: data.referenceType || (data.referenceId ? "project" : undefined),
      referenceId: data.referenceId,
      serialNo: data.serialNo,
      rate: data.rate,
      amount: data.rate && data.quantity
        ? (parseFloat(data.rate) * data.quantity).toString()
        : undefined,
      remarks: data.remarks,
      postingDate: data.postingDate || new Date(),
    });
  }

  /**
   * Transfer stock between warehouses
   */
  async transferStock(data: StockTransferDTO): Promise<{ issue: StockEntry; receipt: StockEntry }> {
    if (data.quantity <= 0) {
      throw new Error("Quantity must be positive for transfer");
    }

    if (data.fromWarehouseId === data.toWarehouseId) {
      throw new Error("Source and destination warehouses cannot be the same");
    }

    // Issue from source warehouse
    const issue = await this.issueStock({
      itemId: data.itemId,
      warehouseId: data.fromWarehouseId,
      binId: data.fromBinId,
      quantity: data.quantity,
      remarks: data.remarks ? `Transfer: ${data.remarks}` : "Stock transfer out",
    });

    // Receive at destination warehouse
    const receipt = await this.receiveStock({
      itemId: data.itemId,
      warehouseId: data.toWarehouseId,
      binId: data.toBinId,
      quantity: data.quantity,
      remarks: data.remarks ? `Transfer: ${data.remarks}` : "Stock transfer in",
    });

    return { issue, receipt };
  }

  /**
   * Adjust stock (correction entry)
   */
  async adjustStock(
    data: {
      itemId: number;
      warehouseId: number;
      binId?: number;
      quantity: number; // Can be positive or negative
      reason: string;
    }
  ): Promise<StockEntry> {
    const item = await this.repository.getItemById(data.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    const warehouse = await this.repository.getWarehouseById(data.warehouseId);
    if (!warehouse) {
      throw new Error("Warehouse not found");
    }

    const publicId = `se_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    return await this.repository.createStockEntry({
      publicId,
      itemId: data.itemId,
      warehouseId: data.warehouseId,
      binId: data.binId,
      quantity: data.quantity,
      type: "adjustment",
      remarks: `Adjustment: ${data.reason}`,
      postingDate: new Date(),
    });
  }

  // ==================== STOCK LEVELS ====================

  async getStockLevels(filters: { warehouseId?: number; lowStock?: boolean } = {}): Promise<StockLevel[]> {
    return await this.repository.getStockLevels(filters);
  }

  async getLowStockItems(): Promise<StockLevel[]> {
    return await this.repository.getLowStockItems();
  }

  async getStockMovements(filters: {
    itemId?: number;
    warehouseId?: number;
    type?: string;
    limit?: number;
    offset?: number;
  }) {
    return await this.repository.getStockEntries(filters);
  }

  // ==================== DASHBOARD STATS ====================

  async getDashboardStats() {
    const [warehouses, lowStockItems] = await Promise.all([
      this.repository.listWarehouses(true),
      this.repository.getLowStockItems(),
    ]);

    return {
      totalWarehouses: warehouses.length,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems.slice(0, 10), // Top 10 low stock items
    };
  }
}

// Singleton instance
export const inventoryService = new InventoryService();
