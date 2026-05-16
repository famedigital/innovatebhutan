import { db } from "@/db";
import { suppliers, purchaseOrders, purchaseOrderItems, requestForQuotations, rfqSuppliers, rfqItems, items, warehouses, employees, projects } from "@/db/schema";
import { eq, and, desc, sql, count, isNull, ilike } from "drizzle-orm";

export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type NewPurchaseOrder = typeof purchaseOrders.$inferInsert;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type NewPurchaseOrderItem = typeof purchaseOrderItems.$inferInsert;
export type RFQ = typeof requestForQuotations.$inferSelect;
export type NewRFQ = typeof requestForQuotations.$inferInsert;
export type RFQSupplier = typeof rfqSuppliers.$inferSelect;
export type NewRFQSupplier = typeof rfqSuppliers.$inferInsert;
export type RFQItem = typeof rfqItems.$inferSelect;
export type NewRFQItem = typeof rfqItems.$inferInsert;

export interface SupplierFilters {
  search?: string;
  city?: string;
  district?: string;
  isActive?: boolean;
  isPreferred?: boolean;
  limit?: number;
  offset?: number;
}

export interface POFilters {
  supplierId?: number;
  status?: string;
  projectId?: number;
  warehouseId?: number;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export class ProcurementRepository {
  private db = db;

  // ==================== SUPPLIER OPERATIONS ====================

  async createSupplier(data: NewSupplier): Promise<Supplier> {
    const [supplier] = await this.db.insert(suppliers).values(data).returning();
    return supplier;
  }

  async getSupplierById(id: number): Promise<Supplier | null> {
    const [supplier] = await this.db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id))
      .limit(1);
    return supplier || null;
  }

  async getSupplierByPublicId(publicId: string): Promise<Supplier | null> {
    const [supplier] = await this.db
      .select()
      .from(suppliers)
      .where(eq(suppliers.publicId, publicId))
      .limit(1);
    return supplier || null;
  }

  async updateSupplier(id: number, data: Partial<NewSupplier>): Promise<Supplier> {
    const [supplier] = await this.db
      .update(suppliers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();
    return supplier;
  }

  async deleteSupplier(id: number): Promise<void> {
    await this.db.delete(suppliers).where(eq(suppliers.id, id));
  }

  async listSuppliers(filters: SupplierFilters = {}): Promise<{ suppliers: Supplier[]; total: number }> {
    const conditions: any[] = [];

    if (filters.search) {
      conditions.push(
        sql`(${suppliers.name} ILIKE ${'%' + filters.search + '%'} OR ${suppliers.displayName} ILIKE ${'%' + filters.search + '%'} OR ${suppliers.email} ILIKE ${'%' + filters.search + '%'})`
      );
    }
    if (filters.city) {
      conditions.push(eq(suppliers.city, filters.city));
    }
    if (filters.district) {
      conditions.push(eq(suppliers.district, filters.district));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(suppliers.isActive, filters.isActive));
    }
    if (filters.isPreferred !== undefined) {
      conditions.push(eq(suppliers.isPreferred, filters.isPreferred));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(suppliers)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Fetch suppliers
    const suppliersData = await this.db
      .select()
      .from(suppliers)
      .where(whereClause)
      .orderBy(desc(suppliers.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return { suppliers: suppliersData, total };
  }

  // ==================== PURCHASE ORDER OPERATIONS ====================

  async createPurchaseOrder(data: NewPurchaseOrder): Promise<PurchaseOrder> {
    return await this.db.transaction(async (tx) => {
      const [po] = await tx.insert(purchaseOrders).values(data).returning();
      return po;
    });
  }

  async getPurchaseOrderById(id: number): Promise<PurchaseOrder | null> {
    const [po] = await this.db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.id, id))
      .limit(1);
    return po || null;
  }

  async getPurchaseOrderByPublicId(publicId: string): Promise<PurchaseOrder | null> {
    const [po] = await this.db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.publicId, publicId))
      .limit(1);
    return po || null;
  }

  async updatePurchaseOrder(id: number, data: Partial<NewPurchaseOrder>): Promise<PurchaseOrder> {
    const [po] = await this.db
      .update(purchaseOrders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(purchaseOrders.id, id))
      .returning();
    return po;
  }

  async deletePurchaseOrder(id: number): Promise<void> {
    await this.db.delete(purchaseOrders).where(eq(purchaseOrders.id, id));
  }

  async listPurchaseOrders(filters: POFilters = {}): Promise<{ purchaseOrders: PurchaseOrder[]; total: number }> {
    const conditions: any[] = [];

    if (filters.supplierId) {
      conditions.push(eq(purchaseOrders.supplierId, filters.supplierId));
    }
    if (filters.status) {
      conditions.push(eq(purchaseOrders.status, filters.status));
    }
    if (filters.projectId) {
      conditions.push(eq(purchaseOrders.projectId, filters.projectId));
    }
    if (filters.warehouseId) {
      conditions.push(eq(purchaseOrders.warehouseId, filters.warehouseId));
    }
    if (filters.fromDate) {
      conditions.push(sql`${purchaseOrders.orderDate} >= ${filters.fromDate}`);
    }
    if (filters.toDate) {
      conditions.push(sql`${purchaseOrders.orderDate} <= ${filters.toDate}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(purchaseOrders)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Fetch POs
    const poData = await this.db
      .select()
      .from(purchaseOrders)
      .where(whereClause)
      .orderBy(desc(purchaseOrders.orderDate))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return { purchaseOrders: poData, total };
  }

  async getPurchaseOrderWithItems(id: number): Promise<(PurchaseOrder & { items: Array<PurchaseOrderItem & { itemName?: string; itemSku?: string }> }) | null> {
    const [po] = await this.db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.id, id))
      .limit(1);

    if (!po) return null;

    const items = await this.db
      .select({
        id: purchaseOrderItems.id,
        purchaseOrderId: purchaseOrderItems.purchaseOrderId,
        itemId: purchaseOrderItems.itemId,
        description: purchaseOrderItems.description,
        quantity: purchaseOrderItems.quantity,
        receivedQuantity: purchaseOrderItems.receivedQuantity,
        rejectedQuantity: purchaseOrderItems.rejectedQuantity,
        rate: purchaseOrderItems.rate,
        amount: purchaseOrderItems.amount,
        taxRate: purchaseOrderItems.taxRate,
        taxAmount: purchaseOrderItems.taxAmount,
        discountRate: purchaseOrderItems.discountRate,
        discountAmount: purchaseOrderItems.discountAmount,
        netAmount: purchaseOrderItems.netAmount,
        warehouseId: purchaseOrderItems.warehouseId,
        notes: purchaseOrderItems.notes,
        createdAt: purchaseOrderItems.createdAt,
        itemName: items.name,
        itemSku: items.sku,
      })
      .from(purchaseOrderItems)
      .leftJoin(items, eq(purchaseOrderItems.itemId, items.id))
      .where(eq(purchaseOrderItems.purchaseOrderId, id));

    return { ...po, items };
  }

  // ==================== PO ITEM OPERATIONS ====================

  async createPOItem(data: NewPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const [item] = await this.db.insert(purchaseOrderItems).values(data).returning();
    return item;
  }

  async updatePOItem(id: number, data: Partial<NewPurchaseOrderItem>): Promise<PurchaseOrderItem> {
    const [item] = await this.db
      .update(purchaseOrderItems)
      .set(data)
      .where(eq(purchaseOrderItems.id, id))
      .returning();
    return item;
  }

  async deletePOItem(id: number): Promise<void> {
    await this.db.delete(purchaseOrderItems).where(eq(purchaseOrderItems.id, id));
  }

  async getPOItemsByPurchaseOrderId(purchaseOrderId: number): Promise<PurchaseOrderItem[]> {
    return await this.db
      .select()
      .from(purchaseOrderItems)
      .where(eq(purchaseOrderItems.purchaseOrderId, purchaseOrderId));
  }

  // ==================== RFQ OPERATIONS ====================

  async createRFQ(data: NewRFQ): Promise<RFQ> {
    return await this.db.transaction(async (tx) => {
      const [rfq] = await tx.insert(requestForQuotations).values(data).returning();
      return rfq;
    });
  }

  async getRFQById(id: number): Promise<RFQ | null> {
    const [rfq] = await this.db
      .select()
      .from(requestForQuotations)
      .where(eq(requestForQuotations.id, id))
      .limit(1);
    return rfq || null;
  }

  async getRFQByPublicId(publicId: string): Promise<RFQ | null> {
    const [rfq] = await this.db
      .select()
      .from(requestForQuotations)
      .where(eq(requestForQuotations.publicId, publicId))
      .limit(1);
    return rfq || null;
  }

  async updateRFQ(id: number, data: Partial<NewRFQ>): Promise<RFQ> {
    const [rfq] = await this.db
      .update(requestForQuotations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(requestForQuotations.id, id))
      .returning();
    return rfq;
  }

  async deleteRFQ(id: number): Promise<void> {
    await this.db.delete(requestForQuotations).where(eq(requestForQuotations.id, id));
  }

  async listRFQs(filters: { status?: string; projectId?: number; limit?: number; offset?: number } = {}): Promise<{ rfqs: RFQ[]; total: number }> {
    const conditions: any[] = [];

    if (filters.status) {
      conditions.push(eq(requestForQuotations.status, filters.status));
    }
    if (filters.projectId) {
      conditions.push(eq(requestForQuotations.projectId, filters.projectId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(requestForQuotations)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Fetch RFQs
    const rfqData = await this.db
      .select()
      .from(requestForQuotations)
      .where(whereClause)
      .orderBy(desc(requestForQuotations.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return { rfqs: rfqData, total };
  }

  // ==================== RFQ SUPPLIER OPERATIONS ====================

  async addSupplierToRFQ(data: NewRFQSupplier): Promise<RFQSupplier> {
    const [rfqSupplier] = await this.db.insert(rfqSuppliers).values(data).returning();
    return rfqSupplier;
  }

  async updateRFQSupplier(id: number, data: Partial<NewRFQSupplier>): Promise<RFQSupplier> {
    const [rfqSupplier] = await this.db
      .update(rfqSuppliers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(rfqSuppliers.id, id))
      .returning();
    return rfqSupplier;
  }

  async getRFQSuppliers(rfqId: number): Promise<Array<RFQSupplier & { supplierName?: string; supplierEmail?: string }>> {
    return await this.db
      .select({
        id: rfqSuppliers.id,
        rfqId: rfqSuppliers.rfqId,
        supplierId: rfqSuppliers.supplierId,
        status: rfqSuppliers.status,
        quotedAmount: rfqSuppliers.quotedAmount,
        quotedDate: rfqSuppliers.quotedDate,
        notes: rfqSuppliers.notes,
        isAwarded: rfqSuppliers.isAwarded,
        createdAt: rfqSuppliers.createdAt,
        updatedAt: rfqSuppliers.updatedAt,
        supplierName: suppliers.name,
        supplierEmail: suppliers.email,
      })
      .from(rfqSuppliers)
      .leftJoin(suppliers, eq(rfqSuppliers.supplierId, suppliers.id))
      .where(eq(rfqSuppliers.rfqId, rfqId));
  }

  // ==================== RFQ ITEM OPERATIONS ====================

  async addRFQItem(data: NewRFQItem): Promise<RFQItem> {
    const [rfqItem] = await this.db.insert(rfqItems).values(data).returning();
    return rfqItem;
  }

  async getRFQItems(rfqId: number): Promise<RFQItem[]> {
    return await this.db
      .select()
      .from(rfqItems)
      .where(eq(rfqItems.rfqId, rfqId));
  }

  async deleteRFQItem(id: number): Promise<void> {
    await this.db.delete(rfqItems).where(eq(rfqItems.id, id));
  }

  // ==================== DASHBOARD STATS ====================

  async getProcurementDashboardStats() {
    const [supplierStats, poStats, rfqStats] = await Promise.all([
      this.db
        .select({
          active: count(sql`CASE WHEN ${suppliers.isActive} = true THEN 1 END`),
          preferred: count(sql`CASE WHEN ${suppliers.isPreferred} = true THEN 1 END`),
        })
        .from(suppliers),
      this.db
        .select({
          draft: count(sql`CASE WHEN ${purchaseOrders.status} = 'draft' THEN 1 END`),
          submitted: count(sql`CASE WHEN ${purchaseOrders.status} = 'submitted' THEN 1 END`),
          approved: count(sql`CASE WHEN ${purchaseOrders.status} = 'approved' THEN 1 END`),
          issued: count(sql`CASE WHEN ${purchaseOrders.status} = 'issued' THEN 1 END`),
          received: count(sql`CASE WHEN ${purchaseOrders.status} = 'received' THEN 1 END`),
        })
        .from(purchaseOrders),
      this.db
        .select({
          draft: count(sql`CASE WHEN ${requestForQuotations.status} = 'draft' THEN 1 END`),
          sent: count(sql`CASE WHEN ${requestForQuotations.status} = 'sent' THEN 1 END`),
          received: count(sql`CASE WHEN ${requestForQuotations.status} = 'received' THEN 1 END`),
        })
        .from(requestForQuotations),
    ]);

    return {
      suppliers: {
        active: Number(supplierStats[0]?.active || 0),
        preferred: Number(supplierStats[0]?.preferred || 0),
      },
      purchaseOrders: {
        draft: Number(poStats[0]?.draft || 0),
        submitted: Number(poStats[0]?.submitted || 0),
        approved: Number(poStats[0]?.approved || 0),
        issued: Number(poStats[0]?.issued || 0),
        received: Number(poStats[0]?.received || 0),
      },
      rfqs: {
        draft: Number(rfqStats[0]?.draft || 0),
        sent: Number(rfqStats[0]?.sent || 0),
        received: Number(rfqStats[0]?.received || 0),
      },
    };
  }
}

// Singleton instance
export const procurementRepository = new ProcurementRepository();
