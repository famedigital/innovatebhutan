import { db } from "@/db";
import { notifications, profiles } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

type Notification = typeof notifications.$inferSelect;
type NewNotification = typeof notifications.$inferInsert;

export type NotificationCategory = "task_assigned" | "mentioned" | "due_soon" | "overdue" | "milestone_completed" | "comment_added" | "project_updated";

export interface CreateNotificationDTO {
  profileId: number; // Integer ID from profiles table
  title: string;
  message: string;
  type?: "info" | "warning" | "critical" | "success";
  category?: NotificationCategory;
  entityType?: string;
  entityId?: number;
  link?: string;
}

/**
 * Service for in-app notifications
 */
export class NotificationService {
  private db = db;

  /**
   * Create a notification
   */
  async createNotification(data: CreateNotificationDTO): Promise<Notification> {
    const [notification] = await this.db
      .insert(notifications)
      .values({
        userId: data.profileId,
        title: data.title,
        message: data.message,
        type: data.type || "info",
        category: data.category,
        entityType: data.entityType,
        entityId: data.entityId,
        link: data.link,
        read: false,
      })
      .returning();

    return notification;
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(profileId: number, limit: number = 50, unreadOnly: boolean = false): Promise<Notification[]> {
    const conditions = [eq(notifications.userId, profileId)];

    if (unreadOnly) {
      conditions.push(eq(notifications.read, false));
    }

    return await this.db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number): Promise<void> {
    await this.db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, notificationId));
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(profileId: number): Promise<void> {
    await this.db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, profileId), eq(notifications.read, false)));
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: number): Promise<void> {
    await this.db.delete(notifications).where(eq(notifications.id, notificationId));
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(profileId: number): Promise<number> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(eq(notifications.userId, profileId), eq(notifications.read, false)));

    return result?.count || 0;
  }

  // ==================== CONVENIENCE METHODS ====================

  /**
   * Notify user about task assignment
   */
  async notifyTaskAssigned(profileId: number, taskTitle: string, projectId: number, taskId: number): Promise<void> {
    await this.createNotification({
      profileId,
      title: "Task Assigned",
      message: `You have been assigned to task: ${taskTitle}`,
      type: "info",
      category: "task_assigned",
      entityType: "task",
      entityId: taskId,
      link: `/admin/projects?projectId=${projectId}`,
    });
  }

  /**
   * Notify user about mention in comment
   */
  async notifyMentioned(profileId: number, commenterName: string, taskTitle: string, projectId: number): Promise<void> {
    await this.createNotification({
      profileId,
      title: "You were mentioned",
      message: `${commenterName} mentioned you in a comment on "${taskTitle}"`,
      type: "info",
      category: "mentioned",
      entityType: "comment",
      link: `/admin/projects?projectId=${projectId}`,
    });
  }

  /**
   * Notify user about task due soon
   */
  async notifyDueSoon(profileId: number, taskTitle: string, dueDate: Date, projectId: number): Promise<void> {
    await this.createNotification({
      profileId,
      title: "Task Due Soon",
      message: `"${taskTitle}" is due on ${dueDate.toLocaleDateString()}`,
      type: "warning",
      category: "due_soon",
      entityType: "task",
      link: `/admin/projects?projectId=${projectId}`,
    });
  }

  /**
   * Notify user about overdue task
   */
  async notifyOverdue(profileId: number, taskTitle: string, projectId: number): Promise<void> {
    await this.createNotification({
      profileId,
      title: "Task Overdue",
      message: `"${taskTitle}" is overdue`,
      type: "critical",
      category: "overdue",
      entityType: "task",
      link: `/admin/projects?projectId=${projectId}`,
    });
  }

  /**
   * Notify user about milestone completion
   */
  async notifyMilestoneCompleted(profileId: number, milestoneName: string, projectName: string, projectId: number): Promise<void> {
    await this.createNotification({
      profileId,
      title: "Milestone Completed",
      message: `Milestone "${milestoneName}" in "${projectName}" has been completed`,
      type: "success",
      category: "milestone_completed",
      entityType: "milestone",
      link: `/admin/projects?projectId=${projectId}`,
    });
  }

  /**
   * Notify project members about comment
   */
  async notifyCommentAdded(
    profileIds: number[],
    commenterName: string,
    taskTitle: string,
    projectId: number
  ): Promise<void> {
    for (const profileId of profileIds) {
      await this.createNotification({
        profileId,
        title: "New Comment",
        message: `${commenterName} commented on "${taskTitle}"`,
        type: "info",
        category: "comment_added",
        entityType: "comment",
        link: `/admin/projects?projectId=${projectId}`,
      });
    }
  }
}

// Import sql helper
import { sql } from "drizzle-orm";

// Singleton instance
export const notificationService = new NotificationService();
