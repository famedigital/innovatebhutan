import { taskChecklistRepository, type TaskChecklistItem } from "@/lib/repositories/taskChecklistRepository";
import { projectRepository } from "@/lib/repositories/projectRepository";
import { projectMemberService } from "@/lib/services/projectMemberService";
import { AuthorizationError } from "@/lib/errors/auth-error";

export interface CreateChecklistItemDTO {
  title: string;
  position?: number;
}

export interface UpdateChecklistItemDTO {
  title?: string;
  isCompleted?: boolean;
  position?: number;
}

/**
 * Service for task checklist items
 */
export class TaskChecklistService {
  private repository = taskChecklistRepository;
  private projectRepo = projectRepository;

  // ==================== CRUD OPERATIONS ====================

  async createChecklistItem(
    taskId: number,
    data: CreateChecklistItemDTO,
    userId: string,
    userRole: string
  ): Promise<TaskChecklistItem> {
    // Get the task to find the project
    const task = await this.projectRepo.getTaskById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Check if user can modify the project
    const canModify = await projectMemberService.canModifyProject(task.projectId, userId);
    if (!canModify && userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("You do not have permission to add checklist items to this task");
    }

    return await this.repository.createChecklistItem({
      taskId,
      title: data.title,
      position: data.position ?? 0,
      isCompleted: false,
    });
  }

  async getChecklistItemById(id: number): Promise<TaskChecklistItem | null> {
    return await this.repository.getChecklistItemById(id);
  }

  async getChecklistItemsByTask(taskId: number, requestUserId: string, userRole: string): Promise<TaskChecklistItem[]> {
    // Get the task to find the project
    const task = await this.projectRepo.getTaskById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Check if user can view the project
    const canView = await projectMemberService.canViewProject(task.projectId, requestUserId);
    if (!canView && userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("You do not have permission to view this task");
    }

    return await this.repository.getChecklistItemsByTask(taskId);
  }

  async updateChecklistItem(
    id: number,
    data: UpdateChecklistItemDTO,
    userId: string,
    userRole: string
  ): Promise<TaskChecklistItem> {
    const item = await this.repository.getChecklistItemById(id);
    if (!item) {
      throw new Error("Checklist item not found");
    }

    // Get the task to find the project
    const task = await this.projectRepo.getTaskById(item.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Check if user can modify the project
    const canModify = await projectMemberService.canModifyProject(task.projectId, userId);
    if (!canModify && userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("You do not have permission to modify this checklist item");
    }

    // If toggling completion, use the specialized method
    if (data.isCompleted !== undefined) {
      return await this.repository.toggleChecklistItem(id, data.isCompleted);
    }

    // Otherwise, update normally
    return await this.repository.updateChecklistItem(id, data);
  }

  async deleteChecklistItem(id: number, userId: string, userRole: string): Promise<void> {
    const item = await this.repository.getChecklistItemById(id);
    if (!item) {
      throw new Error("Checklist item not found");
    }

    // Get the task to find the project
    const task = await this.projectRepo.getTaskById(item.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Check if user can modify the project
    const canModify = await projectMemberService.canModifyProject(task.projectId, userId);
    if (!canModify && userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("You do not have permission to delete this checklist item");
    }

    await this.repository.softDeleteChecklistItem(id);
  }

  async restoreChecklistItem(id: number, userId: string, userRole: string): Promise<void> {
    const item = await this.repository.getChecklistItemById(id);
    if (!item) {
      throw new Error("Checklist item not found");
    }

    // Only admins and staff can restore
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("Only administrators can restore checklist items");
    }

    await this.repository.restoreChecklistItem(id);
  }

  // ==================== BULK OPERATIONS ====================

  async createBulkChecklistItems(
    taskId: number,
    items: CreateChecklistItemDTO[],
    userId: string,
    userRole: string
  ): Promise<TaskChecklistItem[]> {
    // Get the task to find the project
    const task = await this.projectRepo.getTaskById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Check if user can modify the project
    const canModify = await projectMemberService.canModifyProject(task.projectId, userId);
    if (!canModify && userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("You do not have permission to add checklist items to this task");
    }

    return await this.repository.createBulkChecklistItems(taskId, items);
  }

  async deleteAllChecklistItems(taskId: number, userId: string, userRole: string): Promise<void> {
    // Get the task to find the project
    const task = await this.projectRepo.getTaskById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Check if user can modify the project
    const canModify = await projectMemberService.canModifyProject(task.projectId, userId);
    if (!canModify && userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("You do not have permission to delete checklist items from this task");
    }

    await this.repository.deleteAllChecklistItems(taskId);
  }

  // ==================== AGGREGATION ====================

  async getChecklistStats(taskId: number) {
    return await this.repository.getChecklistStats(taskId);
  }
}

// Singleton instance
export const taskChecklistService = new TaskChecklistService();
