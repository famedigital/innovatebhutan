import { db } from "@/db";
import { projectMilestones } from "@/db/schema";
import { eq, and, desc, isNull, sql } from "drizzle-orm";

type ProjectMilestone = typeof projectMilestones.$inferSelect;
type NewProjectMilestone = typeof projectMilestones.$inferInsert;

export type MilestoneStatus = "pending" | "in_progress" | "complete" | "cancelled";

export interface MilestoneFilters {
  projectId?: number;
  status?: MilestoneStatus;
}

/**
 * Repository for project milestones
 */
export class MilestoneRepository {
  private db = db;

  // ==================== CRUD OPERATIONS ====================

  async createMilestone(data: NewProjectMilestone): Promise<ProjectMilestone> {
    const [milestone] = await this.db.insert(projectMilestones).values(data).returning();
    return milestone;
  }

  async getMilestoneById(id: number): Promise<ProjectMilestone | null> {
    const [milestone] = await this.db
      .select()
      .from(projectMilestones)
      .where(and(eq(projectMilestones.id, id), isNull(projectMilestones.deletedAt)))
      .limit(1);
    return milestone || null;
  }

  async updateMilestone(id: number, data: Partial<NewProjectMilestone>): Promise<ProjectMilestone> {
    const [milestone] = await this.db
      .update(projectMilestones)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projectMilestones.id, id))
      .returning();
    return milestone;
  }

  async softDeleteMilestone(id: number): Promise<void> {
    await this.db
      .update(projectMilestones)
      .set({ deletedAt: new Date() })
      .where(eq(projectMilestones.id, id));
  }

  async restoreMilestone(id: number): Promise<void> {
    await this.db
      .update(projectMilestones)
      .set({ deletedAt: null })
      .where(eq(projectMilestones.id, id));
  }

  async getMilestonesByProject(projectId: number, filters: MilestoneFilters = {}): Promise<ProjectMilestone[]> {
    const conditions = [isNull(projectMilestones.deletedAt)];

    if (filters.status) {
      conditions.push(eq(projectMilestones.status, filters.status));
    }

    return await this.db
      .select()
      .from(projectMilestones)
      .where(and(...conditions, eq(projectMilestones.projectId, projectId)))
      .orderBy(projectMilestones.position, desc(projectMilestones.createdAt));
  }

  // ==================== AGGREGATION ====================

  async getMilestoneStats(projectId: number): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    complete: number;
    cancelled: number;
  }> {
    const stats = await this.db
      .select({
        total: sql<number>`count(*)`,
        pending: sql<number>`count(*) FILTER (WHERE status = 'pending')`,
        inProgress: sql<number>`count(*) FILTER (WHERE status = 'in_progress')`,
        complete: sql<number>`count(*) FILTER (WHERE status = 'complete')`,
        cancelled: sql<number>`count(*) FILTER (WHERE status = 'cancelled')`,
      })
      .from(projectMilestones)
      .where(and(eq(projectMilestones.projectId, projectId), isNull(projectMilestones.deletedAt)));

    return stats[0] || { total: 0, pending: 0, inProgress: 0, complete: 0, cancelled: 0 };
  }

  /**
   * Calculate project progress based on completed milestones
   */
  async calculateProgressFromMilestones(projectId: number): Promise<number> {
    const stats = await this.getMilestoneStats(projectId);
    if (stats.total === 0) return 0;
    return Math.round((stats.complete / stats.total) * 100);
  }
}

// Singleton instance
export const milestoneRepository = new MilestoneRepository();
