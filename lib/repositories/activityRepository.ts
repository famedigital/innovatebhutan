import { db } from "@/db";
import { activityEvents, profiles } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

type ActivityEvent = typeof activityEvents.$inferSelect;
type NewActivityEvent = typeof activityEvents.$inferInsert;

export type ActivityEventType =
  | "project_created"
  | "project_updated"
  | "project_deleted"
  | "task_created"
  | "task_updated"
  | "task_completed"
  | "task_deleted"
  | "task_assigned"
  | "milestone_created"
  | "milestone_updated"
  | "milestone_completed"
  | "comment_added"
  | "member_added"
  | "member_removed"
  | "status_changed";

export interface ActivityEventWithProfile extends ActivityEvent {
  userName?: string;
}

export interface CreateActivityEventDTO {
  projectId?: number;
  userId: string;
  eventType: ActivityEventType;
  entityType?: string;
  entityId?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Repository for activity events (UX-focused feed, separate from audit_logs)
 */
export class ActivityRepository {
  private db = db;

  // ==================== CRUD OPERATIONS ====================

  async createEvent(data: NewActivityEvent): Promise<ActivityEvent> {
    const [event] = await this.db.insert(activityEvents).values(data).returning();
    return event;
  }

  async getEventsByProject(projectId: number, limit: number = 50): Promise<ActivityEventWithProfile[]> {
    return await this.db
      .select({
        id: activityEvents.id,
        projectId: activityEvents.projectId,
        userId: activityEvents.userId,
        eventType: activityEvents.eventType,
        entityType: activityEvents.entityType,
        entityId: activityEvents.entityId,
        metadata: activityEvents.metadata,
        createdAt: activityEvents.createdAt,
        userName: profiles.fullName,
      })
      .from(activityEvents)
      .leftJoin(profiles, eq(activityEvents.userId, profiles.userId))
      .where(eq(activityEvents.projectId, projectId))
      .orderBy(desc(activityEvents.createdAt))
      .limit(limit);
  }

  async getEventsByUser(userId: string, limit: number = 50): Promise<ActivityEvent[]> {
    return await this.db
      .select()
      .from(activityEvents)
      .where(eq(activityEvents.userId, userId))
      .orderBy(desc(activityEvents.createdAt))
      .limit(limit);
  }

  async getEventsByEntity(entityType: string, entityId: number, limit: number = 20): Promise<ActivityEvent[]> {
    return await this.db
      .select()
      .from(activityEvents)
      .where(and(
        eq(activityEvents.entityType, entityType),
        eq(activityEvents.entityId, entityId)
      ))
      .orderBy(desc(activityEvents.createdAt))
      .limit(limit);
  }

  // ==================== CLEANUP ====================

  /**
   * Delete old activity events to keep the table size manageable
   * Activity events are for UX, not compliance, so old events can be purged
   */
  async deleteOldEvents(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.db
      .delete(activityEvents)
      .where(sql`${activityEvents.createdAt} < ${cutoffDate}`);

    return result.rowCount || 0;
  }
}

// Singleton instance
export const activityRepository = new ActivityRepository();
