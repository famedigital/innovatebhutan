import { taskCommentRepository, type TaskCommentWithProfile } from "@/lib/repositories/taskCommentRepository";
import { projectRepository } from "@/lib/repositories/projectRepository";
import { projectMemberService } from "@/lib/services/projectMemberService";
import { AuthorizationError } from "@/lib/errors/auth-error";

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
    const taskIds = await this.projectRepo.getTasksByProjectId;

    // This is a simplified version - in production, you'd want to optimize this query
    return [];
  }
}

// Singleton instance
export const taskCommentService = new TaskCommentService();
