import { notificationRepository } from "@/lib/repositories/notificationRepository";
import type { Notification } from "@/lib/repositories/notificationRepository";

export type NotificationCategory =
  | "task_assigned"
  | "mentioned"
  | "due_soon"
  | "overdue"
  | "milestone_completed"
  | "comment_added"
  | "project_updated"
  | "amc_expiring"
  | "amc_expired"
  | "invoice_overdue"
  | "invoice_paid"
  | "payroll_ready"
  | "payroll_approved"
  | "payroll_paid"
  | "ticket_assigned"
  | "ticket_sla_breach"
  | "needs_quote"
  | "portal_amc_renew"
  | "portal_payment_proof"
  | "system";

export type NotificationType = "info" | "warning" | "critical" | "success";

export interface CreateNotificationDTO {
  profileId: number;
  title: string;
  message: string;
  type?: NotificationType;
  category?: NotificationCategory;
  entityType?: string;
  entityId?: number;
  link?: string;
}

/**
 * Service for in-app notifications
 */
export class NotificationService {
  private repository = notificationRepository;

  // ==================== CRUD OPERATIONS ====================

  /**
   * Create a notification
   */
  async createNotification(data: CreateNotificationDTO): Promise<Notification> {
    return await this.repository.createNotification({
      userId: data.profileId,
      title: data.title,
      message: data.message,
      type: data.type || "info",
      category: data.category,
      entityType: data.entityType,
      entityId: data.entityId,
      link: data.link,
      read: false,
    });
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(
    profileId: number,
    limit: number = 50,
    unreadOnly: boolean = false
  ): Promise<{ notifications: Notification[]; total: number }> {
    return await this.repository.listNotifications({
      userId: profileId,
      limit,
      unreadOnly,
    });
  }

  /**
   * Get notifications with details
   */
  async getUserNotificationsWithDetails(
    profileId: number,
    filters?: { type?: string; category?: string; unreadOnly?: boolean; limit?: number }
  ) {
    return await this.repository.listNotificationsWithDetails({
      userId: profileId,
      ...filters,
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number): Promise<Notification> {
    return await this.repository.markAsRead(notificationId);
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: number[]): Promise<void> {
    await this.repository.markMultipleAsRead(notificationIds);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(profileId: number): Promise<void> {
    await this.repository.markAllAsRead(profileId);
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: number): Promise<void> {
    await this.repository.deleteNotification(notificationId);
  }

  /**
   * Delete all notifications for a user
   */
  async deleteAllNotifications(profileId: number): Promise<void> {
    await this.repository.deleteAllNotifications(profileId);
  }

  /**
   * Delete all read notifications for a user
   */
  async deleteAllReadNotifications(profileId: number): Promise<void> {
    await this.repository.deleteAllReadNotifications(profileId);
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(profileId: number): Promise<number> {
    return await this.repository.getUnreadCount(profileId);
  }

  /**
   * Get notification statistics for a user
   */
  async getNotificationStats(profileId: number) {
    return await this.repository.getNotificationStats(profileId);
  }

  // ==================== PROJECT NOTIFICATIONS ====================

  /**
   * Notify user about task assignment
   */
  async notifyTaskAssigned(
    profileId: number,
    taskTitle: string,
    projectId: number,
    taskId: number
  ): Promise<void> {
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
  async notifyMentioned(
    profileId: number,
    commenterName: string,
    taskTitle: string,
    projectId: number
  ): Promise<void> {
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
  async notifyDueSoon(
    profileId: number,
    taskTitle: string,
    dueDate: Date,
    projectId: number
  ): Promise<void> {
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
  async notifyTaskOverdue(
    profileId: number,
    taskTitle: string,
    projectId: number
  ): Promise<void> {
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
  async notifyMilestoneCompleted(
    profileId: number,
    milestoneName: string,
    projectName: string,
    projectId: number
  ): Promise<void> {
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

  /**
   * Notify about project update
   */
  async notifyProjectUpdated(
    profileId: number,
    projectName: string,
    updateType: string,
    projectId: number
  ): Promise<void> {
    await this.createNotification({
      profileId,
      title: "Project Updated",
      message: `${updateType}: ${projectName}`,
      type: "info",
      category: "project_updated",
      entityType: "project",
      entityId: projectId,
      link: `/admin/projects?projectId=${projectId}`,
    });
  }

  // ==================== AMC NOTIFICATIONS ====================

  /**
   * Notify about AMC expiring soon
   */
  async notifyAMCExpiring(
    profileIds: number[],
    clientName: string,
    contractNumber: string,
    expiryDate: Date,
    daysUntilExpiry: number
  ): Promise<void> {
    for (const profileId of profileIds) {
      await this.createNotification({
        profileId,
        title: "AMC Expiring Soon",
        message: `AMC contract ${contractNumber} for ${clientName} expires in ${daysUntilExpiry} days (${expiryDate.toLocaleDateString()})`,
        type: "warning",
        category: "amc_expiring",
        entityType: "amc",
        link: "/admin/amc",
      });
    }
  }

  /**
   * Notify about AMC expired
   */
  async notifyAMCExpired(
    profileIds: number[],
    clientName: string,
    contractNumber: string,
    expiryDate: Date
  ): Promise<void> {
    for (const profileId of profileIds) {
      await this.createNotification({
        profileId,
        title: "AMC Contract Expired",
        message: `AMC contract ${contractNumber} for ${clientName} has expired on ${expiryDate.toLocaleDateString()}`,
        type: "critical",
        category: "amc_expired",
        entityType: "amc",
        link: "/admin/amc",
      });
    }
  }

  // ==================== INVOICE NOTIFICATIONS ====================

  /**
   * Notify about invoice overdue
   */
  async notifyInvoiceOverdue(
    profileIds: number[],
    invoiceNumber: string,
    clientName: string,
    amount: number,
    dueDate: Date
  ): Promise<void> {
    for (const profileId of profileIds) {
      await this.createNotification({
        profileId,
        title: "Invoice Overdue",
        message: `Invoice ${invoiceNumber} for ${clientName} (Nu. ${amount.toLocaleString()}) is overdue. Due: ${dueDate.toLocaleDateString()}`,
        type: "critical",
        category: "invoice_overdue",
        entityType: "invoice",
        link: "/admin/invoice",
      });
    }
  }

  /**
   * Notify about invoice paid
   */
  async notifyInvoicePaid(
    profileIds: number[],
    invoiceNumber: string,
    clientName: string,
    amount: number
  ): Promise<void> {
    for (const profileId of profileIds) {
      await this.createNotification({
        profileId,
        title: "Invoice Paid",
        message: `Invoice ${invoiceNumber} for ${clientName} (Nu. ${amount.toLocaleString()}) has been paid`,
        type: "success",
        category: "invoice_paid",
        entityType: "invoice",
        link: "/admin/invoice",
      });
    }
  }

  // ==================== PAYROLL NOTIFICATIONS ====================

  /**
   * Notify about payroll ready for review
   */
  async notifyPayrollReady(
    profileIds: number[],
    month: number,
    year: number
  ): Promise<void> {
    for (const profileId of profileIds) {
      await this.createNotification({
        profileId,
        title: "Payroll Ready for Review",
        message: `Payroll for ${new Date(year, month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })} is ready for approval`,
        type: "info",
        category: "payroll_ready",
        entityType: "payroll",
        link: "/admin/hr",
      });
    }
  }

  /**
   * Notify about payroll approved
   */
  async notifyPayrollApproved(
    profileIds: number[],
    month: number,
    year: number
  ): Promise<void> {
    for (const profileId of profileIds) {
      await this.createNotification({
        profileId,
        title: "Payroll Approved",
        message: `Payroll for ${new Date(year, month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })} has been approved`,
        type: "success",
        category: "payroll_approved",
        entityType: "payroll",
        link: "/admin/hr",
      });
    }
  }

  /**
   * Notify about payroll paid
   */
  async notifyPayrollPaid(
    profileIds: number[],
    month: number,
    year: number
  ): Promise<void> {
    for (const profileId of profileIds) {
      await this.createNotification({
        profileId,
        title: "Payroll Paid",
        message: `Payroll for ${new Date(year, month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })} has been processed`,
        type: "success",
        category: "payroll_paid",
        entityType: "payroll",
        link: "/admin/hr",
      });
    }
  }

  // ==================== TICKET NOTIFICATIONS ====================

  async notifyTicketAssigned(
    profileId: number,
    ticketId: number,
    publicId: string,
    subject: string
  ): Promise<void> {
    await this.createNotification({
      profileId,
      title: "Ticket assigned",
      message: `${publicId}: ${subject}`,
      type: "info",
      category: "ticket_assigned",
      entityType: "ticket",
      entityId: ticketId,
      link: `/admin/tickets?ticketId=${ticketId}`,
    });
  }

  async notifyTicketSlaBreach(
    profileIds: number[],
    ticketId: number,
    publicId: string,
    subject: string,
    priority: string
  ): Promise<void> {
    for (const profileId of profileIds) {
      await this.createNotification({
        profileId,
        title: "Ticket SLA breached",
        message: `${publicId} (${priority}): ${subject}`,
        type: "critical",
        category: "ticket_sla_breach",
        entityType: "ticket",
        entityId: ticketId,
        link: `/admin/tickets?ticketId=${ticketId}`,
      });
    }
  }

  async notifyPortalAmcRenew(
    profileId: number,
    clientName: string,
    contractNumber: string,
    amcId: number
  ): Promise<void> {
    await this.createNotification({
      profileId,
      title: "Portal AMC renew request",
      message: `${clientName} requested renewal for ${contractNumber}`,
      type: "warning",
      category: "portal_amc_renew",
      entityType: "amc",
      entityId: amcId,
      link: "/admin/amc",
    });
  }

  async notifyPortalPaymentProof(
    profileId: number,
    clientName: string,
    invoiceNumber: string,
    invoiceId: number
  ): Promise<void> {
    await this.createNotification({
      profileId,
      title: "Payment screenshot submitted",
      message: `${clientName} uploaded proof for ${invoiceNumber}`,
      type: "info",
      category: "portal_payment_proof",
      entityType: "invoice",
      entityId: invoiceId,
      link: "/admin/invoice",
    });
  }

  // ==================== SYSTEM NOTIFICATIONS ====================

  /**
   * Send a general system notification
   */
  async notifySystem(
    profileIds: number[],
    title: string,
    message: string,
    type: NotificationType = "info"
  ): Promise<void> {
    for (const profileId of profileIds) {
      await this.createNotification({
        profileId,
        title,
        message,
        type,
        category: "system",
        link: "/admin/notifications",
      });
    }
  }

  /**
   * Send notification to all admins
   */
  async notifyAdmins(
    title: string,
    message: string,
    type: NotificationType = "info"
  ): Promise<void> {
    // This would typically fetch all admin profile IDs
    // For now, this is a placeholder that would be implemented with a profile lookup
    // await this.notifySystem(adminProfileIds, title, message, type);
  }
}

// Singleton instance
export const notificationService = new NotificationService();
