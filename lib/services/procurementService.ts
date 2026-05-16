import { procurementRepository, type SupplierFilters, type POFilters, type NewSupplier, type NewPurchaseOrder, type NewRFQ, type NewRFQSupplier, type NewRFQItem } from "@/lib/repositories/procurementRepository";
import type { Supplier, PurchaseOrder, RFQ, PurchaseOrderItem, RFQSupplier, RFQItem } from "@/lib/repositories/procurementRepository";
import { AuthorizationError } from "@/lib/errors/auth-error";

export type POStatus = "draft" | "submitted" | "approved" | "rejected" | "issued" | "received" | "cancelled";
export type RFQStatus = "draft" | "sent" | "received" | "awarded" | "cancelled";
export type RFQSupplierStatus = "pending" | "quoted" | "not_responded";

export interface CreateSupplierDTO {
  name: string;
  displayName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  district?: string;
  country?: string;
  taxId?: string;
  pan?: string;
  paymentTerms?: string;
  creditLimit?: string;
  creditDays?: number;
  bankName?: string;
  bankAccountNo?: string;
  bankBranch?: string;
  notes?: string;
}

export interface UpdateSupplierDTO {
  displayName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  city?: string;
  district?: string;
  country?: string;
  taxId?: string;
  pan?: string;
  paymentTerms?: string;
  creditLimit?: string;
  creditDays?: number;
  bankName?: string;
  bankAccountNo?: string;
  bankBranch?: string;
  isActive?: boolean;
  isPreferred?: boolean;
  rating?: string;
  notes?: string;
}

export interface CreatePurchaseOrderDTO {
  supplierId: number;
  orderDate?: Date;
  expectedDate?: Date;
  warehouseId?: number;
  projectId?: number;
  items: Array<{
    itemId: number;
    description?: string;
    quantity: number;
    rate: string;
    taxRate?: string;
    discountRate?: string;
    warehouseId?: number;
    notes?: string;
  }>;
  terms?: string;
  notes?: string;
}

export interface UpdatePurchaseOrderDTO {
  supplierId?: number;
  orderDate?: Date;
  expectedDate?: Date;
  warehouseId?: number;
  projectId?: number;
  terms?: string;
  notes?: string;
}

export interface CreateRFQDTO {
  title: string;
  description?: string;
  requiredBy?: Date;
  validUntil?: Date;
  terms?: string;
  notes?: string;
  projectId?: number;
  warehouseId?: number;
  suppliers: Array<{ supplierId: number }>;
  items: Array<{
    itemId?: number;
    description: string;
    quantity: number;
    unit: string;
    specifications?: string;
    estimatedCost?: string;
  }>;
}

export class ProcurementService {
  private repository = procurementRepository;

  // ==================== SUPPLIER OPERATIONS ====================

  async createSupplier(data: CreateSupplierDTO, userId?: string): Promise<Supplier> {
    const publicId = `supp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    return await this.repository.createSupplier({
      publicId,
      name: data.name,
      displayName: data.displayName,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      mobile: data.mobile,
      address: data.address,
      city: data.city,
      district: data.district,
      country: data.country || "Bhutan",
      taxId: data.taxId,
      pan: data.pan,
      paymentTerms: data.paymentTerms,
      creditLimit: data.creditLimit,
      creditDays: data.creditDays,
      bankName: data.bankName,
      bankAccountNo: data.bankAccountNo,
      bankBranch: data.bankBranch,
      isActive: true,
      isPreferred: false,
      notes: data.notes,
    });
  }

  async getSupplierById(id: number): Promise<Supplier | null> {
    return await this.repository.getSupplierById(id);
  }

  async getSupplierByPublicId(publicId: string): Promise<Supplier | null> {
    return await this.repository.getSupplierByPublicId(publicId);
  }

  async updateSupplier(id: number, data: UpdateSupplierDTO, userId?: string, userRole?: string): Promise<Supplier> {
    const supplier = await this.repository.getSupplierById(id);
    if (!supplier) {
      throw new Error("Supplier not found");
    }

    // Only admins can modify suppliers
    if (userRole !== "ADMIN") {
      throw new AuthorizationError("Only administrators can modify suppliers");
    }

    return await this.repository.updateSupplier(id, data);
  }

  async deleteSupplier(id: number, userId?: string, userRole?: string): Promise<void> {
    const supplier = await this.repository.getSupplierById(id);
    if (!supplier) {
      throw new Error("Supplier not found");
    }

    // Only admins can delete suppliers
    if (userRole !== "ADMIN") {
      throw new AuthorizationError("Only administrators can delete suppliers");
    }

    await this.repository.deleteSupplier(id);
  }

  async listSuppliers(filters: SupplierFilters = {}) {
    return await this.repository.listSuppliers(filters);
  }

  // ==================== PURCHASE ORDER OPERATIONS ====================

  async createPurchaseOrder(data: CreatePurchaseOrderDTO, userId?: string): Promise<PurchaseOrder> {
    // Generate public ID and order number
    const publicId = `po_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    const year = new Date().getFullYear();
    const orderNumber = `PO-${year}-${Date.now().toString(36).toUpperCase()}`;

    // Calculate totals
    let totalAmount = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    const items = data.items.map(item => {
      const amount = Number(item.quantity) * Number(item.rate);
      const taxRate = Number(item.taxRate || 0);
      const discountRate = Number(item.discountRate || 0);
      const taxAmount = amount * (taxRate / 100);
      const discountAmount = amount * (discountRate / 100);
      const netAmount = amount + taxAmount - discountAmount;

      totalAmount += amount;
      totalTax += taxAmount;
      totalDiscount += discountAmount;

      return {
        ...item,
        amount: amount.toString(),
        taxAmount: taxAmount.toString(),
        discountAmount: discountAmount.toString(),
        netAmount: netAmount.toString(),
      };
    });

    const grandTotal = totalAmount + totalTax - totalDiscount;

    return await this.repository.createPurchaseOrder({
      publicId,
      supplierId: data.supplierId,
      orderNumber,
      status: "draft",
      orderDate: data.orderDate || new Date(),
      expectedDate: data.expectedDate,
      totalAmount: totalAmount.toString(),
      totalTax: totalTax.toString(),
      totalDiscount: totalDiscount.toString(),
      grandTotal: grandTotal.toString(),
      currency: "Nu.",
      terms: data.terms,
      notes: data.notes,
      warehouseId: data.warehouseId,
      projectId: data.projectId,
    });
  }

  async getPurchaseOrderById(id: number): Promise<(PurchaseOrder & { items?: Array<PurchaseOrderItem & { itemName?: string }> }) | null> {
    return await this.repository.getPurchaseOrderWithItems(id);
  }

  async getPurchaseOrderByPublicId(publicId: string): Promise<PurchaseOrder | null> {
    return await this.repository.getPurchaseOrderByPublicId(publicId);
  }

  async updatePurchaseOrder(id: number, data: UpdatePurchaseOrderDTO, userId?: string, userRole?: string): Promise<PurchaseOrder> {
    const po = await this.repository.getPurchaseOrderById(id);
    if (!po) {
      throw new Error("Purchase Order not found");
    }

    // Only admins and staff can modify POs
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("Only administrators and staff can modify purchase orders");
    }

    return await this.repository.updatePurchaseOrder(id, data);
  }

  async deletePurchaseOrder(id: number, userId?: string, userRole?: string): Promise<void> {
    const po = await this.repository.getPurchaseOrderById(id);
    if (!po) {
      throw new Error("Purchase Order not found");
    }

    // Only admins can delete POs
    if (userRole !== "ADMIN") {
      throw new AuthorizationError("Only administrators can delete purchase orders");
    }

    await this.repository.deletePurchaseOrder(id);
  }

  async listPurchaseOrders(filters: POFilters = {}) {
    return await this.repository.listPurchaseOrders(filters);
  }

  // ==================== PO STATUS TRANSITIONS ====================

  async transitionPOStatus(poId: number, newStatus: POStatus, userId?: string, userRole?: string): Promise<PurchaseOrder> {
    const po = await this.repository.getPurchaseOrderById(poId);
    if (!po) {
      throw new Error("Purchase Order not found");
    }

    // Validate status transition
    const validTransitions: Record<POStatus, POStatus[]> = {
      draft: ["submitted", "cancelled"],
      submitted: ["approved", "rejected"],
      approved: ["issued", "cancelled"],
      rejected: [],
      issued: ["received", "cancelled"],
      received: [],
      cancelled: [],
    };

    const currentStatus = po.status as POStatus;
    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(
        `Cannot transition from ${currentStatus} to ${newStatus}. Valid transitions: ${validTransitions[currentStatus]?.join(", ") || "none"}`
      );
    }

    // Authorization checks for specific transitions
    if (newStatus === "approved" || newStatus === "rejected") {
      if (userRole !== "ADMIN" && userRole !== "STAFF") {
        throw new AuthorizationError("Only administrators and staff can approve/reject purchase orders");
      }
    }

    const updateData: Partial<any> = { status: newStatus };

    if (newStatus === "approved") {
      updateData.approvedBy = userId;
      updateData.approvedAt = new Date();
    } else if (newStatus === "rejected") {
      updateData.rejectedBy = userId;
      updateData.rejectedAt = new Date();
    } else if (newStatus === "received") {
      updateData.receivedDate = new Date();
    }

    return await this.repository.updatePurchaseOrder(poId, updateData);
  }

  // ==================== RFQ OPERATIONS ====================

  async createRFQ(data: CreateRFQDTO, userId?: string, employeeId?: number): Promise<RFQ> {
    const publicId = `rfq_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    const year = new Date().getFullYear();
    const rfqNumber = `RFQ-${year}-${Date.now().toString(36).toUpperCase()}`;

    return await this.repository.createRFQ({
      publicId,
      rfqNumber,
      status: "draft",
      title: data.title,
      description: data.description,
      requiredBy: data.requiredBy,
      validUntil: data.validUntil,
      terms: data.terms,
      notes: data.notes,
      projectId: data.projectId,
      createdBy: employeeId,
    });
  }

  async getRFQById(id: number): Promise<RFQ | null> {
    return await this.repository.getRFQById(id);
  }

  async getRFQByPublicId(publicId: string): Promise<RFQ | null> {
    return await this.repository.getRFQByPublicId(publicId);
  }

  async updateRFQ(id: number, data: Partial<NewRFQ>, userId?: string, userRole?: string): Promise<RFQ> {
    const rfq = await this.repository.getRFQById(id);
    if (!rfq) {
      throw new Error("RFQ not found");
    }

    // Only admins and staff can modify RFQs
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("Only administrators and staff can modify RFQs");
    }

    return await this.repository.updateRFQ(id, data);
  }

  async deleteRFQ(id: number, userId?: string, userRole?: string): Promise<void> {
    const rfq = await this.repository.getRFQById(id);
    if (!rfq) {
      throw new Error("RFQ not found");
    }

    // Only admins can delete RFQs
    if (userRole !== "ADMIN") {
      throw new AuthorizationError("Only administrators can delete RFQs");
    }

    await this.repository.deleteRFQ(id);
  }

  async listRFQs(filters: { status?: string; projectId?: number; limit?: number; offset?: number } = {}) {
    return await this.repository.listRFQs(filters);
  }

  // ==================== RFQ SUPPLIER OPERATIONS ====================

  async addSupplierToRFQ(rfqId: number, supplierId: number, userId?: string, userRole?: string): Promise<RFQSupplier> {
    const rfq = await this.repository.getRFQById(rfqId);
    if (!rfq) {
      throw new Error("RFQ not found");
    }

    // Only admins and staff can add suppliers
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("Only administrators and staff can add suppliers to RFQs");
    }

    return await this.repository.addSupplierToRFQ({
      rfqId,
      supplierId,
      status: "pending",
    });
  }

  async updateRFQSupplierQuote(
    rfqSupplierId: number,
    quotedAmount: string,
    userId?: string,
    userRole?: string
  ): Promise<RFQSupplier> {
    // Only admins and staff can update quotes
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("Only administrators and staff can update RFQ quotes");
    }

    return await this.repository.updateRFQSupplier(rfqSupplierId, {
      quotedAmount,
      quotedDate: new Date(),
      status: "quoted",
    });
  }

  async awardRFQ(rfqId: number, rfqSupplierId: number, userId?: string, userRole?: string): Promise<RFQ> {
    const rfq = await this.repository.getRFQById(rfqId);
    if (!rfq) {
      throw new Error("RFQ not found");
    }

    // Only admins and staff can award RFQs
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("Only administrators and staff can award RFQs");
    }

    // Mark supplier as awarded
    await this.repository.updateRFQSupplier(rfqSupplierId, { isAwarded: true });

    // Update RFQ status
    return await this.repository.updateRFQ(rfqId, { status: "awarded" });
  }

  async getRFQSuppliers(rfqId: number): Promise<Array<RFQSupplier & { supplierName?: string; supplierEmail?: string }>> {
    return await this.repository.getRFQSuppliers(rfqId);
  }

  // ==================== RFQ ITEM OPERATIONS ====================

  async addRFQItem(rfqId: number, data: Omit<NewRFQItem, "rfqId">, userId?: string, userRole?: string): Promise<RFQItem> {
    const rfq = await this.repository.getRFQById(rfqId);
    if (!rfq) {
      throw new Error("RFQ not found");
    }

    // Only admins and staff can add items
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("Only administrators and staff can add items to RFQs");
    }

    return await this.repository.addRFQItem({
      rfqId,
      ...data,
    });
  }

  async getRFQItems(rfqId: number): Promise<RFQItem[]> {
    return await this.repository.getRFQItems(rfqId);
  }

  // ==================== DASHBOARD STATS ====================

  async getDashboardStats() {
    return await this.repository.getProcurementDashboardStats();
  }
}

// Singleton instance
export const procurementService = new ProcurementService();
