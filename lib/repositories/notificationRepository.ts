import { db } from "@/db";
import { notifications, profiles } from "@/db/schema";
import { eq, and, desc, sql, count, or } from "drizzle-orm";

type Notification = typeof notifications.$inferSelect;
type NewNotification = typeof notifications.$inferInsert;

export interface NotificationFilters {
  userId?: number;
  unreadOnly?: boolean;
  type?: string;
  category?: string;
  entityType?: string;
  limit?: number;
  offset?: number;
}

export class NotificationRepository {
  private db = db;

  // ==================== CRUD OPERATIONS ====================

  async createNotification(data: NewNotification): Promise<Notification> {
    const [notification] = await this.db
      .insert(notifications)
      .values(data)
      .returning();
    return notification;
  }

  async getNotificationById(id: number): Promise<Notification | null> {
    const [notification] = await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);
    return notification || null;
  }

  async updateNotification(id: number, data: Partial<NewNotification>): Promise<Notification> {
    const [notification] = await this.db
      .update(notifications)
      .set(data)
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async deleteNotification(id: number): Promise<void> {
    await this.db.delete(notifications).where(eq(notifications.id, id));
  }

  async deleteAllNotifications(userId: number): Promise<void> {
    await this.db.delete(notifications).where(eq(notifications.userId, userId));
  }

  async deleteAllReadNotifications(userId: number): Promise<void> {
    await this.db
      .delete(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, true)));
  }

  // ==================== MARK AS READ OPERATIONS ====================

  async markAsRead(id: number): Promise<Notification> {
    const [notification] = await this.db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async markAsUnread(id: number): Promise<Notification> {
    const [notification] = await this.db
      .update(notifications)
      .set({ read: false })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
  }

  async markAllAsUnread(userId: number): Promise<void> {
    await this.db
      .update(notifications)
      .set({ read: false })
      .where(eq(notifications.userId, userId));
  }

  // ==================== QUERY OPERATIONS ====================

  async listNotifications(filters: NotificationFilters = {}): Promise<{
    notifications: Notification[];
    total: number;
  }> {
    const conditions = [];

    if (filters.userId) {
      conditions.push(eq(notifications.userId, filters.userId));
    }
    if (filters.unreadOnly) {
      conditions.push(eq(notifications.read, false));
    }
    if (filters.type) {
      conditions.push(eq(notifications.type, filters.type));
    }
    if (filters.category) {
      conditions.push(eq(notifications.category, filters.category));
    }
    if (filters.entityType) {
      conditions.push(eq(notifications.entityType, filters.entityType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(notifications)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Fetch notifications
    const notificationsData = await this.db
      .select()
      .from(notifications)
      .where(whereClause)
      .orderBy(desc(notifications.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return { notifications: notificationsData, total };
  }

  async listNotificationsWithDetails(filters: NotificationFilters = {}) {
    const conditions = [];

    if (filters.userId) {
      conditions.push(eq(notifications.userId, filters.userId));
    }
    if (filters.unreadOnly) {
      conditions.push(eq(notifications.read, false));
    }
    if (filters.type) {
      conditions.push(eq(notifications.type, filters.type));
    }
    if (filters.category) {
      conditions.push(eq(notifications.category, filters.category));
    }
    if (filters.entityType) {
      conditions.push(eq(notifications.entityType, filters.entityType));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const notificationsData = await this.db
      .select({
        id: notifications.id,
        userId: notifications.userId,
        title: notifications.title,
        message: notifications.message,
        type: notifications.type,
        category: notifications.category,
        entityType: notifications.entityType,
        entityId: notifications.entityId,
        read: notifications.read,
        link: notifications.link,
        createdAt: notifications.createdAt,
        recipientName: profiles.fullName,
        recipientEmail: profiles.userId,
      })
      .from(notifications)
      .leftJoin(profiles, eq(notifications.userId, profiles.id))
      .where(whereClause)
      .orderBy(desc(notifications.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(notifications)
      .where(whereClause);

    return {
      notifications: notificationsData,
      total: totalResult[0]?.count || 0,
    };
  }

  async getUnreadCount(userId: number): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

    return result?.count || 0;
  }

  // ==================== BATCH OPERATIONS ====================

  /**
   * Create multiple notifications in a single transaction
   */
  async createBulkNotifications(userId: number, notificationsData: Omit<NewNotification, "userId">[]): Promise<Notification[]> {
    const notificationsToInsert = notificationsData.map(data => ({
      ...data,
      userId,
    }));

    return await this.db
      .insert(notifications)
      .values(notificationsToInsert)
      .returning();
  }

  /**
   * Mark multiple notifications as read by IDs
   */
  async markMultipleAsRead(ids: number[]): Promise<void> {
    if (ids.length === 0) return;

    await this.db
      .update(notifications)
      .set({ read: true })
      .where(or(...ids.map(id => eq(notifications.id, id))));
  }

  // ==================== CLEANUP OPERATIONS ====================

  /**
   * Delete old read notifications (older than specified days)
   */
  async deleteOldReadNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.db
      .delete(notifications)
      .where(
        and(
          eq(notifications.read, true),
          sql`${notifications.createdAt} < ${cutoffDate}`
        )
      );

    return result.rowCount || 0;
  }

  /**
   * Get statistics for a user's notifications
   */
  async getNotificationStats(userId: number): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    const [totalResult, unreadResult, typeStats, categoryStats] = await Promise.all([
      this.db.select({ count: count() }).from(notifications).where(eq(notifications.userId, userId)),
      this.db.select({ count: count() }).from(notifications).where(
        and(eq(notifications.userId, userId), eq(notifications.read, false))
      ),
      this.db
        .select({ type: notifications.type, count: count() })
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .groupBy(notifications.type),
      this.db
        .select({ category: notifications.category, count: count() })
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .groupBy(notifications.category),
    ]);

    const byType: Record<string, number> = {};
    typeStats.forEach(stat => {
      if (stat.type) byType[stat.type] = Number(stat.count);
    });

    const byCategory: Record<string, number> = {};
    categoryStats.forEach(stat => {
      if (stat.category) byCategory[stat.category] = Number(stat.count);
    });

    return {
      total: Number(totalResult[0]?.count || 0),
      unread: Number(unreadResult[0]?.count || 0),
      byType,
      byCategory,
    };
  }
}

// Singleton instance
export const notificationRepository = new NotificationRepository();
