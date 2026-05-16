import { taskCommentRepository, type TaskCommentWithProfile, type TaskComment } from "@/lib/repositories/taskCommentRepository";
import { projectRepository } from "@/lib/repositories/projectRepository";
import { projectMemberService } from "@/lib/services/projectMemberService";
import { AuthorizationError } from "@/lib/errors/auth-error";
import { db } from "@/db";
import { projectMembers, projectTasks, taskComments } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";

export interface CreateCommentDTO {
  taskId: number;
  content: string;
  parentId?: number;
}

export interface UpdateCommentDTO {
  content: string;
}

/**
 * Service for task comments
 */
export class TaskCommentService {
  private repository = taskCommentRepository;
  private projectRepo = projectRepository;

  // ==================== CRUD OPERATIONS ====================

  async createComment(
    data: CreateCommentDTO,
    userId: string,
    userRole: string
  ): Promise<TaskCommentWithProfile> {
    // Get the task to find the project
    const task = await this.projectRepo.getTaskById(data.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Check if user can view the project (and thus the task)
    const canView = await projectMemberService.canViewProject(task.projectId, userId);
    if (!canView && userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("You do not have permission to comment on this task");
    }

    // Validate parent comment if provided
    if (data.parentId) {
      const parentComment = await this.repository.getCommentById(data.parentId);
      if (!parentComment || parentComment.taskId !== data.taskId) {
        throw new Error("Invalid parent comment");
      }
    }

    const comment = await this.repository.createComment({
      taskId: data.taskId,
      userId,
      content: data.content,
      parentId: data.parentId,
    });

    return {
      ...comment,
      profileName: undefined, // Will be populated by getCommentsByTask
    };
  }

  async getCommentById(id: number): Promise<TaskCommentWithProfile | null> {
    const comment = await this.repository.getCommentById(id);
    if (!comment) return null;

    return {
      ...comment,
      profileName: undefined,
    };
  }

  async getCommentsByTask(taskId: number, requestUserId: string, userRole: string): Promise<TaskCommentWithProfile[]> {
    // Get the task to find the project
    const task = await this.projectRepo.getTaskById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Check if user can view the project
    const canView = await projectMemberService.canViewProject(task.projectId, requestUserId);
    if (!canView && userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("You do not have permission to view comments on this task");
    }

    return await this.repository.getCommentsByTask(taskId);
  }

  async updateComment(
    id: number,
    data: UpdateCommentDTO,
    userId: string,
    userRole: string
  ): Promise<TaskCommentWithProfile> {
    const comment = await this.repository.getCommentById(id);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check if user is the comment author or has admin/staff role
    if (comment.userId !== userId && userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("You can only edit your own comments");
    }

    const updated = await this.repository.updateComment(id, data.content);

    return {
      ...updated,
      profileName: undefined,
    };
  }

  async deleteComment(id: number, userId: string, userRole: string): Promise<void> {
    const comment = await this.repository.getCommentById(id);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check if user is the comment author or has admin/staff role
    if (comment.userId !== userId && userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("You can only delete your own comments");
    }

    await this.repository.softDeleteComment(id);
  }

  async restoreComment(id: number, userId: string, userRole: string): Promise<void> {
    const comment = await this.repository.getCommentById(id);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Only admins and staff can restore comments
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("Only administrators can restore comments");
    }

    await this.repository.restoreComment(id);
  }

  // ==================== AGGREGATION ====================

  async getCommentCount(taskId: number): Promise<number> {
    return await this.repository.getCommentCount(taskId);
  }

  async getCommentsByUser(userId: string): Promise<TaskComment[]> {
    return await this.repository.getCommentsByUser(userId);
  }

  /**
   * Get all comments for tasks that a user is assigned to
   * Useful for notification purposes
   */
  async getRecentCommentsForUser(userId: string, limit: number = 20): Promise<TaskComment[]> {
    // Get projects where user is a member
    const memberProjects = await db
      .select()
      .from(projectMembers)
      .where(eq(projectMembers.userId, userId))
      .limit(100);

    const projectIds = [...new Set(memberProjects.map(pm => pm.projectId))];

    if (projectIds.length === 0) {
      return [];
    }

    // Get all tasks for these projects
    const tasks = await db
      .select({ id: projectTasks.id })
      .from(projectTasks)
      .where(inArray(projectTasks.projectId, projectIds))
      .limit(500);

    const taskIds = tasks.map(t => t.id);

    if (taskIds.length === 0) {
      return [];
    }

    // Get recent comments for these tasks
    const comments = await db
      .select()
      .from(taskComments)
      .where(inArray(taskComments.taskId, taskIds))
      .orderBy(desc(taskComments.createdAt))
      .limit(limit);

    return comments;
  }
}

// Singleton instance
export const taskCommentService = new TaskCommentService();
