import { randomUUID } from "crypto";
import {
  purchaseMasterRepository,
  type PurchaseMasterFilters,
} from "@/lib/repositories/purchaseMasterRepository";
import type {
  CreatePurchaseMasterInput,
  UpdatePurchaseMasterInput,
} from "@/lib/validations/purchaseMaster";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeLandedCost(input: {
  totalPurchaseAmount?: number;
  gstPaid?: number;
  declarationFees?: number;
  freightCharges?: number;
  totalFreightCharges?: number;
}): number {
  return round2(
    (input.totalPurchaseAmount || 0) +
      (input.gstPaid || 0) +
      (input.declarationFees || 0) +
      (input.freightCharges || 0) +
      (input.totalFreightCharges || 0)
  );
}

export class PurchaseMasterService {
  private repository = purchaseMasterRepository;

  list(filters: PurchaseMasterFilters = {}) {
    return this.repository.list(filters);
  }

  getById(id: number) {
    return this.repository.getById(id);
  }

  async create(data: CreatePurchaseMasterInput, createdBy?: string) {
    const itemsFromBody = data.items;
    let totalPurchaseAmount = data.totalPurchaseAmount ?? 0;
    if (!totalPurchaseAmount && itemsFromBody.length > 0) {
      totalPurchaseAmount = round2(
        itemsFromBody.reduce((sum, item) => sum + item.quantity * item.costPrice, 0)
      );
    }

    const totalLandedCost = computeLandedCost({
      totalPurchaseAmount,
      gstPaid: data.gstPaid,
      declarationFees: data.declarationFees,
      freightCharges: data.freightCharges,
      totalFreightCharges: data.totalFreightCharges,
    });

    const lineItems = itemsFromBody.map((item, index) => {
      const tax = item.taxAmount ?? 0;
      const finalCost = round2(item.quantity * item.costPrice + tax);
      return {
        productName: item.productName,
        productMasterId: item.productMasterId ?? null,
        quantity: item.quantity,
        costPrice: String(item.costPrice),
        taxAmount: String(tax),
        finalCost: String(finalCost),
        mrp: item.mrp != null ? String(item.mrp) : null,
        sortOrder: index,
      };
    });

    return this.repository.createWithItems(
      {
        publicId: `pur-${randomUUID().slice(0, 8)}`,
        supplierName: data.supplierName,
        supplierId: data.supplierId ?? null,
        billReferenceNo: data.billReferenceNo ?? null,
        purchaseDate: data.purchaseDate ?? new Date(),
        paymentTimeline: data.paymentTimeline ?? "cash",
        creditDays: data.creditDays ?? 0,
        advancePayment: String(data.advancePayment ?? 0),
        totalPurchaseAmount: String(totalPurchaseAmount),
        gstPaid: String(data.gstPaid ?? 0),
        declarationFees: String(data.declarationFees ?? 0),
        freightCharges: String(data.freightCharges ?? 0),
        totalFreightCharges: String(data.totalFreightCharges ?? 0),
        totalLandedCost: String(totalLandedCost),
        salesRate: data.salesRate != null ? String(data.salesRate) : null,
        status: data.status ?? "draft",
        invoiceUploadUrl: data.invoiceUploadUrl ?? null,
        notes: data.notes ?? null,
        createdBy: createdBy ?? null,
      },
      lineItems
    );
  }

  async update(id: number, data: UpdatePurchaseMasterInput) {
    const existing = await this.repository.getById(id);
    if (!existing) return null;

    const totalPurchaseAmount =
      data.totalPurchaseAmount ?? Number(existing.totalPurchaseAmount || 0);
    const gstPaid = data.gstPaid ?? Number(existing.gstPaid || 0);
    const declarationFees =
      data.declarationFees ?? Number(existing.declarationFees || 0);
    const freightCharges =
      data.freightCharges ?? Number(existing.freightCharges || 0);
    const totalFreightCharges =
      data.totalFreightCharges ?? Number(existing.totalFreightCharges || 0);

    const totalLandedCost = computeLandedCost({
      totalPurchaseAmount,
      gstPaid,
      declarationFees,
      freightCharges,
      totalFreightCharges,
    });

    const patch: Record<string, unknown> = {
      totalLandedCost: String(totalLandedCost),
    };
    if (data.supplierName !== undefined) patch.supplierName = data.supplierName;
    if (data.supplierId !== undefined) patch.supplierId = data.supplierId;
    if (data.billReferenceNo !== undefined) patch.billReferenceNo = data.billReferenceNo;
    if (data.purchaseDate !== undefined) patch.purchaseDate = data.purchaseDate;
    if (data.paymentTimeline !== undefined) patch.paymentTimeline = data.paymentTimeline;
    if (data.creditDays !== undefined) patch.creditDays = data.creditDays;
    if (data.advancePayment !== undefined) patch.advancePayment = String(data.advancePayment);
    if (data.totalPurchaseAmount !== undefined) {
      patch.totalPurchaseAmount = String(data.totalPurchaseAmount);
    }
    if (data.gstPaid !== undefined) patch.gstPaid = String(data.gstPaid);
    if (data.declarationFees !== undefined) patch.declarationFees = String(data.declarationFees);
    if (data.freightCharges !== undefined) patch.freightCharges = String(data.freightCharges);
    if (data.totalFreightCharges !== undefined) {
      patch.totalFreightCharges = String(data.totalFreightCharges);
    }
    if (data.salesRate !== undefined) {
      patch.salesRate = data.salesRate != null ? String(data.salesRate) : null;
    }
    if (data.status !== undefined) patch.status = data.status;
    if (data.invoiceUploadUrl !== undefined) patch.invoiceUploadUrl = data.invoiceUploadUrl;
    if (data.notes !== undefined) patch.notes = data.notes;

    await this.repository.update(id, patch);

    if (data.items) {
      const lineItems = data.items.map((item, index) => {
        const tax = item.taxAmount ?? 0;
        const finalCost = round2(item.quantity * item.costPrice + tax);
        return {
          productName: item.productName,
          productMasterId: item.productMasterId ?? null,
          quantity: item.quantity,
          costPrice: String(item.costPrice),
          taxAmount: String(tax),
          finalCost: String(finalCost),
          mrp: item.mrp != null ? String(item.mrp) : null,
          sortOrder: index,
        };
      });
      await this.repository.replaceItems(id, lineItems);
    }

    return this.repository.getById(id);
  }

  async delete(id: number) {
    return this.repository.delete(id);
  }
}

export const purchaseMasterService = new PurchaseMasterService();
