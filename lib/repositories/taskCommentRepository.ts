import { db } from "@/db";
import { taskComments, profiles } from "@/db/schema";
import { eq, and, desc, isNull } from "drizzle-orm";

type TaskComment = typeof taskComments.$inferSelect;
type NewTaskComment = typeof taskComments.$inferInsert;

export interface TaskCommentWithProfile extends TaskComment {
  profileName?: string;
  replies?: TaskCommentWithProfile[];
}

/**
 * Repository for task comments
 */
export class TaskCommentRepository {
  private db = db;

  // ==================== CRUD OPERATIONS ====================

  async createComment(data: NewTaskComment): Promise<TaskComment> {
    const [comment] = await this.db.insert(taskComments).values(data).returning();
    return comment;
  }

  async getCommentById(id: number): Promise<TaskComment | null> {
    const [comment] = await this.db
      .select()
      .from(taskComments)
      .where(and(eq(taskComments.id, id), isNull(taskComments.deletedAt)))
      .limit(1);
    return comment || null;
  }

  async updateComment(id: number, content: string): Promise<TaskComment> {
    const [comment] = await this.db
      .update(taskComments)
      .set({ content, updatedAt: new Date() })
      .where(eq(taskComments.id, id))
      .returning();
    return comment;
  }

  async softDeleteComment(id: number): Promise<void> {
    await this.db
      .update(taskComments)
      .set({ deletedAt: new Date() })
      .where(eq(taskComments.id, id));
  }

  async restoreComment(id: number): Promise<void> {
    await this.db
      .update(taskComments)
      .set({ deletedAt: null })
      .where(eq(taskComments.id, id));
  }

  /**
   * Get all comments for a task with profile information
   * Returns flat structure with parent/child relationships
   */
  async getCommentsByTask(taskId: number): Promise<TaskCommentWithProfile[]> {
    const comments = await this.db
      .select({
        id: taskComments.id,
        taskId: taskComments.taskId,
        userId: taskComments.userId,
        content: taskComments.content,
        parentId: taskComments.parentId,
        createdAt: taskComments.createdAt,
        updatedAt: taskComments.updatedAt,
        profileName: profiles.fullName,
      })
      .from(taskComments)
      .leftJoin(profiles, eq(taskComments.userId, profiles.userId))
      .where(and(eq(taskComments.taskId, taskId), isNull(taskComments.deletedAt)))
      .orderBy(desc(taskComments.createdAt));

    // Build tree structure
    const commentMap = new Map<number, TaskCommentWithProfile>();
    const rootComments: TaskCommentWithProfile[] = [];

    // First pass: create map
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: build tree
    comments.forEach(comment => {
      const enriched = commentMap.get(comment.id)!;
      if (comment.parentId && commentMap.has(comment.parentId)) {
        const parent = commentMap.get(comment.parentId)!;
        parent.replies!.push(enriched);
      } else {
        rootComments.push(enriched);
      }
    });

    return rootComments;
  }

  /**
   * Get all comments by a user
   */
  async getCommentsByUser(userId: string): Promise<TaskComment[]> {
    return await this.db
      .select()
      .from(taskComments)
      .where(and(eq(taskComments.userId, userId), isNull(taskComments.deletedAt)))
      .orderBy(desc(taskComments.createdAt));
  }

  /**
   * Get comment count for a task
   */
  async getCommentCount(taskId: number): Promise<number> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(taskComments)
      .where(and(eq(taskComments.taskId, taskId), isNull(taskComments.deletedAt)));

    return result?.count || 0;
  }
}

// Import sql helper
import { sql } from "drizzle-orm";

// Singleton instance
export const taskCommentRepository = new TaskCommentRepository();
