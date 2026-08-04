import {
  productMasterRepository,
  type ProductMasterFilters,
} from "@/lib/repositories/productMasterRepository";
import type {
  CreateProductMasterInput,
  UpdateProductMasterInput,
} from "@/lib/validations/productMaster";
import { randomUUID } from "crypto";

export class ProductMasterService {
  private repository = productMasterRepository;

  list(filters: ProductMasterFilters = {}) {
    return this.repository.list(filters);
  }

  getById(id: number) {
    return this.repository.getById(id);
  }

  async create(data: CreateProductMasterInput) {
    const publicId = `pm-${randomUUID().slice(0, 8)}`;
    return this.repository.create({
      publicId,
      name: data.name,
      category: data.category,
      brand: data.brand ?? null,
      sku: data.sku ?? null,
      description: data.description ?? null,
      unitPrice: String(data.unitPrice ?? 0),
      unit: data.unit ?? "pcs",
      masterStatus: data.masterStatus ?? "pending",
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
    });
  }

  async update(id: number, data: UpdateProductMasterInput) {
    const existing = await this.repository.getById(id);
    if (!existing) return null;

    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.category !== undefined) patch.category = data.category;
    if (data.brand !== undefined) patch.brand = data.brand;
    if (data.sku !== undefined) patch.sku = data.sku;
    if (data.description !== undefined) patch.description = data.description;
    if (data.unitPrice !== undefined) patch.unitPrice = String(data.unitPrice);
    if (data.unit !== undefined) patch.unit = data.unit;
    if (data.masterStatus !== undefined) patch.masterStatus = data.masterStatus;
    if (data.isActive !== undefined) patch.isActive = data.isActive;
    if (data.sortOrder !== undefined) patch.sortOrder = data.sortOrder;

    return this.repository.update(id, patch);
  }

  softDeactivate(id: number) {
    return this.repository.softDeactivate(id);
  }
}

export const productMasterService = new ProductMasterService();
