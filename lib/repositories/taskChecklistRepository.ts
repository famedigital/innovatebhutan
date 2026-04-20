import { db } from "@/db";
import { taskChecklistItems } from "@/db/schema";
import { eq, and, desc, isNull, sql } from "drizzle-orm";

type TaskChecklistItem = typeof taskChecklistItems.$inferSelect;
type NewTaskChecklistItem = typeof taskChecklistItems.$inferInsert;

/**
 * Repository for task checklist items
 */
export class TaskChecklistRepository {
  private db = db;

  // ==================== CRUD OPERATIONS ====================

  async createChecklistItem(data: NewTaskChecklistItem): Promise<TaskChecklistItem> {
    const [item] = await this.db.insert(taskChecklistItems).values(data).returning();
    return item;
  }

  async getChecklistItemById(id: number): Promise<TaskChecklistItem | null> {
    const [item] = await this.db
      .select()
      .from(taskChecklistItems)
      .where(and(eq(taskChecklistItems.id, id), isNull(taskChecklistItems.deletedAt)))
      .limit(1);
    return item || null;
  }

  async updateChecklistItem(
    id: number,
    data: Partial<NewTaskChecklistItem>
  ): Promise<TaskChecklistItem> {
    const [item] = await this.db
      .update(taskChecklistItems)
      .set(data)
      .where(eq(taskChecklistItems.id, id))
      .returning();
    return item;
  }

  async softDeleteChecklistItem(id: number): Promise<void> {
    await this.db
      .update(taskChecklistItems)
      .set({ deletedAt: new Date() })
      .where(eq(taskChecklistItems.id, id));
  }

  async restoreChecklistItem(id: number): Promise<void> {
    await this.db
      .update(taskChecklistItems)
      .set({ deletedAt: null })
      .where(eq(taskChecklistItems.id, id));
  }

  async getChecklistItemsByTask(taskId: number): Promise<TaskChecklistItem[]> {
    return await this.db
      .select()
      .from(taskChecklistItems)
      .where(and(eq(taskChecklistItems.taskId, taskId), isNull(taskChecklistItems.deletedAt)))
      .orderBy(taskChecklistItems.position, desc(taskChecklistItems.createdAt));
  }

  async toggleChecklistItem(id: number, isCompleted: boolean): Promise<TaskChecklistItem> {
    const [item] = await this.db
      .update(taskChecklistItems)
      .set({
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      })
      .where(eq(taskChecklistItems.id, id))
      .returning();
    return item;
  }

  // ==================== BULK OPERATIONS ====================

  async deleteAllChecklistItems(taskId: number): Promise<void> {
    await this.db
      .delete(taskChecklistItems)
      .where(eq(taskChecklistItems.taskId, taskId));
  }

  async createBulkChecklistItems(taskId: number, items: Array<{ title: string; position?: number }>): Promise<TaskChecklistItem[]> {
    const created: TaskChecklistItem[] = [];

    for (const item of items) {
      const [newItem] = await this.db
        .insert(taskChecklistItems)
        .values({
          taskId,
          title: item.title,
          position: item.position ?? 0,
          isCompleted: false,
        })
        .returning();
      created.push(newItem);
    }

    return created;
  }

  // ==================== AGGREGATION ====================

  async getChecklistStats(taskId: number): Promise<{
    total: number;
    completed: number;
    percentage: number;
  }> {
    const stats = await this.db
      .select({
        total: sql<number>`count(*)::int`,
        completed: sql<number>`count(*) FILTER (WHERE is_completed = true)::int`,
      })
      .from(taskChecklistItems)
      .where(and(eq(taskChecklistItems.taskId, taskId), isNull(taskChecklistItems.deletedAt)));

    const result = stats[0] || { total: 0, completed: 0 };
    const percentage = result.total > 0 ? Math.round((result.completed / result.total) * 100) : 0;

    return {
      total: result.total,
      completed: result.completed,
      percentage,
    };
  }
}

// Singleton instance
export const taskChecklistRepository = new TaskChecklistRepository();
