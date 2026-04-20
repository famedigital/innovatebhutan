import { db } from "@/db";
import { orders, orderItems, services } from "@/db/schema";
import { eq, and, desc, sql, count, like, or } from "drizzle-orm";

type Order = typeof orders.$inferSelect;
type NewOrder = typeof orders.$inferInsert;
type OrderItem = typeof orderItems.$inferSelect;
type NewOrderItem = typeof orderItems.$inferInsert;

export interface OrderFilters {
  status?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export class OrderRepository {
  private db = db;

  // ==================== ORDER CRUD ====================

  async createOrder(data: NewOrder): Promise<Order> {
    const [order] = await this.db.insert(orders).values(data).returning();
    return order;
  }

  async getOrderById(id: number): Promise<Order | null> {
    const [order] = await this.db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return order || null;
  }

  async updateOrder(id: number, data: Partial<NewOrder>): Promise<Order> {
    const [order] = await this.db
      .update(orders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async deleteOrder(id: number): Promise<void> {
    await this.db.delete(orders).where(eq(orders.id, id));
  }

  async listOrders(filters: OrderFilters = {}): Promise<{ orders: Order[]; total: number }> {
    const conditions: any[] = [];

    if (filters.status) {
      conditions.push(eq(orders.status, filters.status));
    }
    if (filters.search) {
      conditions.push(
        or(
          like(orders.customerName, `%${filters.search}%`),
          like(orders.customerPhone, `%${filters.search}%`),
          like(orders.customerLocation || '', `%${filters.search}%`)
        )
      );
    }
    if (filters.dateFrom) {
      conditions.push(sql`${orders.createdAt} >= ${filters.dateFrom}`);
    }
    if (filters.dateTo) {
      conditions.push(sql`${orders.createdAt} <= ${filters.dateTo}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(orders)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Fetch orders
    const ordersData = await this.db
      .select()
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(filters.limit || 20)
      .offset(filters.offset || 0);

    return { orders: ordersData, total };
  }

  async listOrdersWithDetails(filters: OrderFilters = {}) {
    const conditions: any[] = [];

    if (filters.status) {
      conditions.push(eq(orders.status, filters.status));
    }
    if (filters.search) {
      conditions.push(
        or(
          like(orders.customerName, `%${filters.search}%`),
          like(orders.customerPhone, `%${filters.search}%`),
          like(orders.customerLocation || '', `%${filters.search}%`)
        )
      );
    }
    if (filters.dateFrom) {
      conditions.push(sql`${orders.createdAt} >= ${filters.dateFrom}`);
    }
    if (filters.dateTo) {
      conditions.push(sql`${orders.createdAt} <= ${filters.dateTo}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const ordersData = await this.db
      .select({
        id: orders.id,
        customerName: orders.customerName,
        customerPhone: orders.customerPhone,
        customerLocation: orders.customerLocation,
        status: orders.status,
        totalAmount: orders.totalAmount,
        meta: orders.meta,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(filters.limit || 20)
      .offset(filters.offset || 0);

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(orders)
      .where(whereClause);

    // Get item counts for each order
    const orderIds = ordersData.map(o => o.id);
    const itemCounts = await this.db
      .select({
        orderId: orderItems.orderId,
        itemCount: count(),
      })
      .from(orderItems)
      .where(sql`${orderItems.orderId} = ANY(${orderIds})`)
      .groupBy(orderItems.orderId);

    const itemCountMap = new Map(itemCounts.map(ic => [ic.orderId, ic.itemCount]));

    const ordersWithCounts = ordersData.map(order => ({
      ...order,
      itemCount: itemCountMap.get(order.id) || 0,
    }));

    return {
      orders: ordersWithCounts,
      total: totalResult[0]?.count || 0,
    };
  }

  // ==================== ORDER ITEM CRUD ====================

  async createOrderItem(data: NewOrderItem): Promise<OrderItem> {
    const [item] = await this.db.insert(orderItems).values(data).returning();
    return item;
  }

  async createOrderItems(items: NewOrderItem[]): Promise<OrderItem[]> {
    const result = await this.db.insert(orderItems).values(items).returning();
    return result;
  }

  async getOrderItemById(id: number): Promise<OrderItem | null> {
    const [item] = await this.db.select().from(orderItems).where(eq(orderItems.id, id)).limit(1);
    return item || null;
  }

  async getOrderItemsByOrderId(orderId: number): Promise<Array<OrderItem & { serviceName?: string }>> {
    return await this.db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        serviceId: orderItems.serviceId,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        serviceName: services.name,
      })
      .from(orderItems)
      .leftJoin(services, eq(orderItems.serviceId, services.id))
      .where(eq(orderItems.orderId, orderId));
  }

  async updateOrderItem(id: number, data: Partial<NewOrderItem>): Promise<OrderItem> {
    const [item] = await this.db.update(orderItems).set(data).where(eq(orderItems.id, id)).returning();
    return item;
  }

  async deleteOrderItem(id: number): Promise<void> {
    await this.db.delete(orderItems).where(eq(orderItems.id, id));
  }

  async deleteOrderItemsByOrderId(orderId: number): Promise<void> {
    await this.db.delete(orderItems).where(eq(orderItems.orderId, orderId));
  }

  // ==================== STATS ====================

  async getOrderStats() {
    const [statusStats, totalOrders, totalAmount] = await Promise.all([
      this.db
        .select({
          status: orders.status,
          count: count(),
        })
        .from(orders)
        .groupBy(orders.status),

      this.db.select({ count: count() }).from(orders),

      this.db
        .select({
          total: sql<number>`SUM(COALESCE(${orders.totalAmount}, 0))`,
        })
        .from(orders),
    ]);

    const totalOrdersCount = totalOrders[0]?.count || 0;
    const totalAmountValue = totalAmount[0]?.total || "0";

    return {
      byStatus: statusStats.reduce((acc, item) => {
        acc[item.status || 'unknown'] = Number(item.count);
        return acc;
      }, {} as Record<string, number>),
      totalOrders: Number(totalOrdersCount),
      totalAmount: totalAmountValue,
    };
  }
}

// Singleton instance
export const orderRepository = new OrderRepository();
