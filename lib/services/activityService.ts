import { activityRepository, type CreateActivityEventDTO, type ActivityEventType, type ActivityEventWithProfile } from "@/lib/repositories/activityRepository";

/**
 * Service for activity events (project feed)
 * This is separate from audit_logs - activity is for UX, audit_logs is for compliance
 */
export class ActivityService {
  private repository = activityRepository;

  /**
   * Record an activity event
   */
  async recordEvent(data: CreateActivityEventDTO): Promise<void> {
    await this.repository.createEvent({
      projectId: data.projectId,
      userId: data.userId,
      eventType: data.eventType,
      entityType: data.entityType,
      entityId: data.entityId,
      metadata: data.metadata,
    });
  }

  /**
   * Get recent activity for a project
   */
  async getProjectActivity(projectId: number, limit: number = 50): Promise<ActivityEventWithProfile[]> {
    return await this.repository.getEventsByProject(projectId, limit);
  }

  /**
   * Get activity for a specific user
   */
  async getUserActivity(userId: string, limit: number = 50) {
    return await this.repository.getEventsByUser(userId, limit);
  }

  /**
   * Get activity for a specific entity (e.g., a task)
   */
  async getEntityActivity(entityType: string, entityId: number, limit: number = 20) {
    return await this.repository.getEventsByEntity(entityType, entityId, limit);
  }

  // ==================== CONVENIENCE METHODS ====================

  /**
   * Record project creation
   */
  async recordProjectCreated(projectId: number, userId: string, projectName: string): Promise<void> {
    await this.recordEvent({
      projectId,
      userId,
      eventType: "project_created",
      entityType: "project",
      entityId: projectId,
      metadata: { project_name: projectName },
    });
  }

  /**
   * Record task creation
   */
  async recordTaskCreated(projectId: number, taskId: number, userId: string, taskTitle: string): Promise<void> {
    await this.recordEvent({
      projectId,
      userId,
      eventType: "task_created",
      entityType: "task",
      entityId: taskId,
      metadata: { task_title: taskTitle },
    });
  }

  /**
   * Record task completion
   */
  async recordTaskCompleted(projectId: number, taskId: number, userId: string, taskTitle: string): Promise<void> {
    await this.recordEvent({
      projectId,
      userId,
      eventType: "task_completed",
      entityType: "task",
      entityId: taskId,
      metadata: { task_title: taskTitle },
    });
  }

  /**
   * Record task assignment
   */
  async recordTaskAssigned(projectId: number, taskId: number, userId: string, assignedToUserId: string, taskTitle: string): Promise<void> {
    await this.recordEvent({
      projectId,
      userId,
      eventType: "task_assigned",
      entityType: "task",
      entityId: taskId,
      metadata: {
        task_title: taskTitle,
        assigned_to: assignedToUserId,
      },
    });
  }

  /**
   * Record comment added
   */
  async recordCommentAdded(projectId: number, taskId: number, commentId: number, userId: string): Promise<void> {
    await this.recordEvent({
      projectId,
      userId,
      eventType: "comment_added",
      entityType: "comment",
      entityId: commentId,
      metadata: { task_id: taskId },
    });
  }

  /**
   * Record milestone completed
   */
  async recordMilestoneCompleted(projectId: number, milestoneId: number, userId: string, milestoneName: string): Promise<void> {
    await this.recordEvent({
      projectId,
      userId,
      eventType: "milestone_completed",
      entityType: "milestone",
      entityId: milestoneId,
      metadata: { milestone_name: milestoneName },
    });
  }

  /**
   * Record status change
   */
  async recordStatusChanged(
    projectId: number,
    entityType: string,
    entityId: number,
    userId: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    await this.recordEvent({
      projectId,
      userId,
      eventType: "status_changed",
      entityType,
      entityId,
      metadata: { old_status: oldStatus, new_status: newStatus },
    });
  }

  /**
   * Record member added
   */
  async recordMemberAdded(projectId: number, userId: string, addedUserId: string, role: string): Promise<void> {
    await this.recordEvent({
      projectId,
      userId,
      eventType: "member_added",
      metadata: { added_user: addedUserId, role },
    });
  }

  /**
   * Clean up old activity events
   */
  async cleanupOldEvents(daysOld: number = 90): Promise<number> {
    return await this.repository.deleteOldEvents(daysOld);
  }
}

// Singleton instance
export const activityService = new ActivityService();
