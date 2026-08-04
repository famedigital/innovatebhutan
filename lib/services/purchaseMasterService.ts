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

export class PurchaseMasterService {
  private repository = purchaseMasterRepository;

  list(filters: PurchaseMasterFilters = {}) {
    return this.repository.list(filters);
  }

  getById(id: number) {
    return this.repository.getById(id);
  }

  async create(data: CreatePurchaseMasterInput, createdBy?: string) {
    const lineItems = data.items.map((item, index) => {
      const finalCost = round2(item.quantity * item.costPrice + (item.taxAmount ?? 0));
      return {
        productName: item.productName,
        productMasterId: item.productMasterId ?? null,
        quantity: item.quantity,
        costPrice: String(item.costPrice),
        taxAmount: String(item.taxAmount ?? 0),
        finalCost: String(finalCost),
        mrp: item.mrp != null ? String(item.mrp) : null,
        sortOrder: item.sortOrder ?? index,
      };
    });

    const totalPurchaseAmount = round2(
      lineItems.reduce((sum, item) => sum + Number(item.finalCost), 0)
    );
    const gstPaid = data.gstPaid ?? 0;
    const declarationFees = data.declarationFees ?? 0;
    const freightCharges = data.freightCharges ?? 0;
    const totalFreightCharges = data.totalFreightCharges ?? 0;
    const totalLandedCost = round2(
      totalPurchaseAmount + gstPaid + declarationFees + freightCharges + totalFreightCharges
    );

    const publicId = `pur-${randomUUID()}`;

    return this.repository.createWithItems(
      {
        publicId,
        supplierName: data.supplierName,
        supplierId: data.supplierId ?? null,
        billReferenceNo: data.billReferenceNo ?? null,
        purchaseDate: data.purchaseDate ?? new Date(),
        paymentTimeline: data.paymentTimeline ?? "cash",
        creditDays: data.creditDays ?? 0,
        advancePayment: String(data.advancePayment ?? 0),
        totalPurchaseAmount: String(totalPurchaseAmount),
        gstPaid: String(gstPaid),
        declarationFees: String(declarationFees),
        freightCharges: String(freightCharges),
        totalFreightCharges: String(totalFreightCharges),
        totalLandedCost: String(totalLandedCost),
        salesRate: data.salesRate != null ? String(data.salesRate) : null,
        status: data.status ?? "saved",
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

    const patch: Record<string, unknown> = {};
    if (data.supplierName !== undefined) patch.supplierName = data.supplierName;
    if (data.supplierId !== undefined) patch.supplierId = data.supplierId;
    if (data.billReferenceNo !== undefined) patch.billReferenceNo = data.billReferenceNo;
    if (data.purchaseDate !== undefined) patch.purchaseDate = data.purchaseDate;
    if (data.paymentTimeline !== undefined) patch.paymentTimeline = data.paymentTimeline;
    if (data.creditDays !== undefined) patch.creditDays = data.creditDays;
    if (data.advancePayment !== undefined) patch.advancePayment = String(data.advancePayment);
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

    // Recalculate landed cost when cost components change
    const gstPaid =
      data.gstPaid !== undefined ? data.gstPaid : Number(existing.gstPaid || 0);
    const declarationFees =
      data.declarationFees !== undefined
        ? data.declarationFees
        : Number(existing.declarationFees || 0);
    const freightCharges =
      data.freightCharges !== undefined
        ? data.freightCharges
        : Number(existing.freightCharges || 0);
    const totalFreightCharges =
      data.totalFreightCharges !== undefined
        ? data.totalFreightCharges
        : Number(existing.totalFreightCharges || 0);
    const totalPurchaseAmount = Number(existing.totalPurchaseAmount || 0);

    if (
      data.gstPaid !== undefined ||
      data.declarationFees !== undefined ||
      data.freightCharges !== undefined ||
      data.totalFreightCharges !== undefined
    ) {
      patch.totalLandedCost = String(
        round2(
          totalPurchaseAmount + gstPaid + declarationFees + freightCharges + totalFreightCharges
        )
      );
    }

    return this.repository.update(id, patch);
  }

  softCancel(id: number) {
    return this.repository.softCancel(id);
  }
}

export const purchaseMasterService = new PurchaseMasterService();
