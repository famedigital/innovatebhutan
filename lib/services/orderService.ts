import { orderRepository, type OrderFilters } from "@/lib/repositories/orderRepository";
import type { Order, OrderItem } from "@/lib/repositories/orderRepository";
import { AuthorizationError } from "@/lib/errors/auth-error";

export type OrderStatus = "pending" | "deploying" | "complete" | "cancelled";

export interface CreateOrderDTO {
  customerName: string;
  customerPhone: string;
  customerLocation?: string;
  status?: OrderStatus;
  totalAmount?: string;
  meta?: Record<string, any>;
  items: Array<{
    serviceId: number;
    quantity: number;
    unitPrice: string;
  }>;
}

export interface UpdateOrderDTO {
  customerName?: string;
  customerPhone?: string;
  customerLocation?: string;
  status?: OrderStatus;
  totalAmount?: string;
  meta?: Record<string, any>;
}

export class OrderService {
  private repository = orderRepository;

  // ==================== ORDER OPERATIONS ====================

  async createOrder(data: CreateOrderDTO, userId?: string): Promise<Order> {
    // Calculate total amount if not provided
    let totalAmount = data.totalAmount;
    if (!totalAmount && data.items) {
      totalAmount = data.items
        .reduce((sum, item) => sum + parseFloat(item.unitPrice || "0") * item.quantity, 0)
        .toFixed(2);
    }

    // Create order with items in a transaction-like approach
    const order = await this.repository.createOrder({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerLocation: data.customerLocation,
      status: data.status || "pending",
      totalAmount: totalAmount || "0",
      meta: data.meta,
    });

    // Create order items
    if (data.items && data.items.length > 0) {
      const items = data.items.map(item => ({
        orderId: order.id,
        serviceId: item.serviceId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }));
      await this.repository.createOrderItems(items);
    }

    return order;
  }

  async getOrderById(id: number): Promise<Order | null> {
    return await this.repository.getOrderById(id);
  }

  async getOrderWithItems(id: number): Promise<{ order: Order | null; items: Array<OrderItem & { serviceName?: string }> }> {
    const [order, items] = await Promise.all([
      this.repository.getOrderById(id),
      this.repository.getOrderItemsByOrderId(id),
    ]);

    return { order, items };
  }

  async updateOrder(id: number, data: UpdateOrderDTO, userId?: string, userRole?: string): Promise<Order> {
    const order = await this.repository.getOrderById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    // 🔒 Authorization check - only admin/staff can modify orders
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("You do not have permission to modify this order");
    }

    // Validate status transitions
    if (data.status && data.status !== order.status) {
      this.validateStatusTransition(order.status as OrderStatus, data.status);
    }

    return await this.repository.updateOrder(id, data);
  }

  async deleteOrder(id: number, userId?: string, userRole?: string): Promise<void> {
    const order = await this.repository.getOrderById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    // 🔒 Only admins can delete orders
    if (userRole !== "ADMIN") {
      throw new AuthorizationError("Only administrators can delete orders");
    }

    // Delete associated items first
    await this.repository.deleteOrderItemsByOrderId(id);
    await this.repository.deleteOrder(id);
  }

  async listOrders(filters: OrderFilters = {}) {
    return await this.repository.listOrdersWithDetails(filters);
  }

  // ==================== STATUS TRANSITIONS ====================

  async transitionOrderStatus(orderId: number, newStatus: OrderStatus): Promise<Order> {
    const order = await this.repository.getOrderById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    // Validate status transition
    this.validateStatusTransition(order.status as OrderStatus, newStatus);

    return await this.repository.updateOrder(orderId, { status: newStatus });
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ["deploying", "cancelled"],
      deploying: ["complete", "cancelled"],
      complete: [], // Terminal state
      cancelled: [], // Terminal state
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Cannot transition from ${currentStatus} to ${newStatus}. Valid transitions: ${allowed.join(", ") || "none"}`
      );
    }
  }

  // ==================== ORDER ITEM OPERATIONS ====================

  async addOrderItem(orderId: number, serviceId: number, quantity: number, unitPrice: string): Promise<OrderItem> {
    const order = await this.repository.getOrderById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const item = await this.repository.createOrderItem({
      orderId,
      serviceId,
      quantity,
      unitPrice,
    });

    // Recalculate total
    await this.recalculateOrderTotal(orderId);

    return item;
  }

  async removeOrderItem(itemId: number): Promise<void> {
    const item = await this.repository.getOrderItemById(itemId);
    if (!item) {
      throw new Error("Order item not found");
    }

    await this.repository.deleteOrderItem(itemId);
    await this.recalculateOrderTotal(item.orderId);
  }

  async updateOrderItem(itemId: number, data: { quantity?: number; unitPrice?: string }): Promise<OrderItem> {
    const item = await this.repository.getOrderItemById(itemId);
    if (!item) {
      throw new Error("Order item not found");
    }

    const updated = await this.repository.updateOrderItem(itemId, data);
    await this.recalculateOrderTotal(item.orderId);

    return updated;
  }

  private async recalculateOrderTotal(orderId: number): Promise<void> {
    const items = await this.repository.getOrderItemsByOrderId(orderId);
    const total = items
      .reduce((sum, item) => sum + parseFloat(item.unitPrice || "0") * item.quantity, 0)
      .toFixed(2);

    await this.repository.updateOrder(orderId, { totalAmount: total });
  }

  // ==================== DASHBOARD STATS ====================

  async getDashboardStats() {
    return await this.repository.getOrderStats();
  }

  // ==================== BUSINESS RULES ====================

  /**
   * Check if an order can be modified
   */
  canModifyOrder(order: Order, userRole: string): boolean {
    // Admins and staff can modify any order
    if (userRole === "ADMIN" || userRole === "STAFF") {
      return true;
    }

    // Completed or cancelled orders cannot be modified
    if (order.status === "complete" || order.status === "cancelled") {
      return false;
    }

    return false;
  }

  /**
   * Check if an order is overdue
   */
  isOrderOverdue(order: Order): boolean {
    // Orders don't have due dates, but we could check SLA based on status and creation time
    return false;
  }
}

// Singleton instance
export const orderService = new OrderService();
