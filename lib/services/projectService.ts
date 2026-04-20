import { projectRepository, type ProjectFilters, type ProjectStats } from "@/lib/repositories/projectRepository";
import type { Project, ProjectTask } from "@/lib/repositories/projectRepository";
import { AuthorizationError } from "@/lib/errors/auth-error";
import { projectMemberService } from "@/lib/services/projectMemberService";

export type ProjectStatus = "planning" | "active" | "testing" | "complete" | "on_hold" | "cancelled";
export type TaskStatus = "todo" | "in_progress" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface CreateProjectDTO {
  clientId: number;
  serviceId?: number;
  name: string;
  description?: string;
  leadId?: string; // User ID (string) from Supabase Auth
  startDate?: Date;
  endDate?: Date;
  budget?: string;
}

export interface UpdateProjectDTO {
  serviceId?: number;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  leadId?: string; // User ID (string) from Supabase Auth
  startDate?: Date;
  endDate?: Date;
  budget?: string;
}

export interface CreateTaskDTO {
  projectId: number;
  assignedTo?: string; // User ID (string) from Supabase Auth
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  estimatedHours?: string;
}

export interface UpdateTaskDTO {
  assignedTo?: string; // User ID (string) from Supabase Auth
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  estimatedHours?: string;
  actualHours?: string;
}

export class ProjectService {
  private repository = projectRepository;

  // ==================== PROJECT OPERATIONS ====================

  async createProject(data: CreateProjectDTO, userId?: string): Promise<Project> {
    // Generate public ID
    const publicId = `proj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

    const project = await this.repository.createProject({
      publicId,
      clientId: data.clientId,
      serviceId: data.serviceId,
      name: data.name,
      description: data.description,
      leadId: data.leadId,
      startDate: data.startDate,
      endDate: data.endDate,
      budget: data.budget,
      status: "planning",
      progress: 0,
    });

    // Add the creator as the project owner
    if (userId) {
      await projectMemberService.addCreatorAsOwner(project.id, userId);
    }

    return project;
  }

  async getProjectById(id: number): Promise<Project | null> {
    return await this.repository.getProjectById(id);
  }

  async getProjectByPublicId(publicId: string): Promise<Project | null> {
    return await this.repository.getProjectByPublicId(publicId);
  }

  async updateProject(id: number, data: UpdateProjectDTO, userId?: string, userRole?: string): Promise<Project> {
    const project = await this.repository.getProjectById(id);
    if (!project) {
      throw new Error("Project not found");
    }

    // 🔒 Authorization check - check both RBAC membership and legacy lead check
    let canModify = false;
    if (userId) {
      // Check new RBAC membership
      canModify = await projectMemberService.canModifyProject(id, userId);
      // Fall back to legacy check if not a member but is the lead
      if (!canModify && userRole) {
        canModify = this.canUserModifyProject(project, userId, userRole);
      }
      // Admin/Staff can always modify
      if (!canModify && (userRole === "ADMIN" || userRole === "STAFF")) {
        canModify = true;
      }
    }

    if (!canModify) {
      throw new AuthorizationError("You do not have permission to modify this project");
    }

    // If status is being changed to 'complete', validate all tasks are done
    if (data.status === "complete") {
      const isValid = await this.validateProjectCanBeCompleted(id);
      if (!isValid) {
        throw new Error("Cannot mark project as complete: there are incomplete tasks");
      }
    }

    return await this.repository.updateProject(id, data);
  }

  async deleteProject(id: number, userId?: string, userRole?: string): Promise<void> {
    const project = await this.repository.getProjectById(id);
    if (!project) {
      throw new Error("Project not found");
    }

    // 🔒 Only admins can delete projects
    if (userRole !== "ADMIN") {
      throw new AuthorizationError("Only administrators can delete projects");
    }

    // Soft delete the project (also cascades to tasks)
    await this.repository.softDeleteProject(id);
  }

  async restoreProject(id: number, userId?: string, userRole?: string): Promise<void> {
    const project = await this.repository.getProjectById(id);
    if (!project) {
      throw new Error("Project not found (including soft deleted)");
    }

    // 🔒 Only admins can restore projects
    if (userRole !== "ADMIN") {
      throw new AuthorizationError("Only administrators can restore projects");
    }

    await this.repository.restoreProject(id);
  }

  async listProjects(filters: ProjectFilters = {}) {
    return await this.repository.listProjectsWithDetails(filters);
  }

  // ==================== STATUS TRANSITIONS ====================

  async transitionProjectStatus(projectId: number, newStatus: ProjectStatus): Promise<Project> {
    const project = await this.repository.getProjectById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Validate status transition
    const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      planning: ["active", "on_hold", "cancelled"],
      active: ["testing", "on_hold", "cancelled"],
      testing: ["active", "complete", "on_hold"],
      complete: [], // Terminal state
      on_hold: ["active", "cancelled"],
      cancelled: [], // Terminal state
    };

    const currentStatus = project.status as ProjectStatus;
    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(
        `Cannot transition from ${currentStatus} to ${newStatus}. Valid transitions: ${validTransitions[currentStatus]?.join(", ") || "none"}`
      );
    }

    return await this.repository.updateProject(projectId, { status: newStatus });
  }

  async validateProjectCanBeCompleted(projectId: number): Promise<boolean> {
    const stats = await this.repository.getProjectStats(projectId);
    return stats.totalTasks === 0 || stats.totalTasks === stats.completedTasks;
  }

  async calculateProjectProgress(projectId: number): Promise<number> {
    const stats = await this.repository.getProjectStats(projectId);
    await this.repository.updateProjectProgress(projectId);
    return stats.progressPercentage;
  }

  /**
   * Get project stats - proper method to expose repository method
   * This fixes the layering issue where progress endpoint was accessing repository directly
   */
  async getProjectStats(projectId: number): Promise<ProjectStats> {
    return await this.repository.getProjectStats(projectId);
  }

  // ==================== TASK OPERATIONS ====================

  async createTask(data: CreateTaskDTO, userId?: string, userRole?: string): Promise<ProjectTask> {
    const task = await this.repository.createTaskWithProgressUpdate({
      projectId: data.projectId,
      assignedTo: data.assignedTo,
      title: data.title,
      description: data.description,
      priority: data.priority || "medium",
      dueDate: data.dueDate,
      estimatedHours: data.estimatedHours,
      status: "todo",
    });

    return task;
  }

  async getTaskById(id: number): Promise<ProjectTask | null> {
    return await this.repository.getTaskById(id);
  }

  async getTasksByProjectId(projectId: number): Promise<ProjectTask[]> {
    return await this.repository.getTasksByProjectId(projectId);
  }

  /**
   * Get tasks with assignee profile information (eliminates N+1 queries)
   */
  async getTasksWithProfiles(projectId: number): Promise<Array<ProjectTask & { assigneeName?: string; assigneeEmail?: string }>> {
    return await this.repository.getTasksWithProfiles(projectId);
  }

  async updateTask(id: number, data: UpdateTaskDTO, userId?: string, userRole?: string): Promise<ProjectTask> {
    const task = await this.repository.getTaskById(id);
    if (!task) {
      throw new Error("Task not found");
    }

    // 🔒 Authorization check
    if (userId && userRole && !this.canUserModifyTask(task, userId, userRole)) {
      throw new AuthorizationError("You do not have permission to modify this task");
    }

    // Use transactional update to ensure progress is updated atomically
    const updatedTask = await this.repository.updateTaskWithProgressUpdate(id, data);

    return updatedTask;
  }

  async deleteTask(id: number, userId?: string, userRole?: string): Promise<void> {
    const task = await this.repository.getTaskById(id);
    if (!task) {
      throw new Error("Task not found");
    }

    // 🔒 Authorization check
    if (userId && userRole && !this.canUserModifyTask(task, userId, userRole)) {
      throw new AuthorizationError("You do not have permission to delete this task");
    }

    const projectId = task.projectId;
    await this.repository.deleteTaskWithProgressUpdate(id);
  }

  async restoreTask(id: number, userId?: string, userRole?: string): Promise<void> {
    // Check if task exists (even if soft deleted)
    const task = await this.repository.getTaskById(id);
    if (!task) {
      throw new Error("Task not found (including soft deleted)");
    }

    // 🔒 Authorization check
    if (userId && userRole && !this.canUserModifyTask(task, userId, userRole)) {
      throw new AuthorizationError("You do not have permission to restore this task");
    }

    await this.repository.restoreTask(id);
    await this.repository.updateProjectProgress(task.projectId);
  }

  async assignTask(taskId: number, userId: string): Promise<ProjectTask> {
    return await this.repository.updateTask(taskId, { assignedTo: userId });
  }

  // ==================== BULK OPERATIONS ====================

  async bulkCreateTasks(
    projectId: number,
    tasks: Omit<CreateTaskDTO, "projectId">[],
    userId?: string,
    userRole?: string
  ): Promise<ProjectTask[]> {
    const createdTasks: ProjectTask[] = [];

    for (const task of tasks) {
      const created = await this.createTask({ ...task, projectId });
      createdTasks.push(created);
    }

    return createdTasks;
  }

  async bulkUpdateTaskStatus(taskIds: number[], newStatus: TaskStatus): Promise<ProjectTask[]> {
    const updatedTasks: ProjectTask[] = [];
    const projectIds = new Set<number>();

    for (const taskId of taskIds) {
      const task = await this.repository.getTaskById(taskId);
      if (task) {
        projectIds.add(task.projectId);
        const updated = await this.repository.updateTask(taskId, { status: newStatus });
        updatedTasks.push(updated);
      }
    }

    // Update progress for all affected projects
    for (const projectId of projectIds) {
      await this.repository.updateProjectProgress(projectId);
    }

    return updatedTasks;
  }

  // ==================== DASHBOARD & ANALYTICS ====================

  async getDashboardStats() {
    return await this.repository.getDashboardStats();
  }

  async getProjectWithTasks(projectId: number, userId?: string) {
    // Check if user can view the project
    if (userId) {
      const canView = await projectMemberService.canViewProject(projectId, userId);
      if (!canView) {
        throw new AuthorizationError("You do not have permission to view this project");
      }
    }

    const [project, tasks, stats] = await Promise.all([
      this.repository.getProjectById(projectId),
      this.repository.getTasksByProjectId(projectId),
      this.repository.getProjectStats(projectId),
    ]);

    if (!project) {
      return null;
    }

    return {
      project,
      tasks,
      stats,
    };
  }

  async getProjectsByClientId(clientId: number): Promise<Project[]> {
    return await this.repository.getProjectsByClientId(clientId);
  }

  async getProjectsByLeadId(leadId: string): Promise<Project[]> {
    return await this.repository.getProjectsByLeadId(leadId);
  }

  // ==================== BUSINESS RULES ====================

  /**
   * Check if a user can modify a task based on assignment
   */
  canUserModifyTask(task: ProjectTask, userId: string, userRole: string): boolean {
    // Admins and staff can modify any task
    if (userRole === "ADMIN" || userRole === "STAFF") {
      return true;
    }

    // User can modify if they are assigned to the task
    if (task.assignedTo === userId) {
      return true;
    }

    return false;
  }

  /**
   * Check if a user can modify a project
   */
  canUserModifyProject(project: Project, userId: string, userRole: string): boolean {
    // Admins can modify any project
    if (userRole === "ADMIN") {
      return true;
    }

    // Staff can modify any project
    if (userRole === "STAFF") {
      return true;
    }

    // User can modify if they are the project lead
    if (project.leadId === userId) {
      return true;
    }

    return false;
  }

  /**
   * Check if a project is overdue based on end date
   */
  isProjectOverdue(project: Project): boolean {
    if (!project.endDate || project.status === "complete" || project.status === "cancelled") {
      return false;
    }
    return new Date(project.endDate) < new Date();
  }

  /**
   * Get tasks that are due soon (within 7 days)
   */
  async getUpcomingTasks(projectId: number): Promise<ProjectTask[]> {
    const tasks = await this.repository.getTasksByProjectId(projectId);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return tasks.filter(
      (task) =>
        task.dueDate &&
        task.status !== "done" &&
        new Date(task.dueDate) >= now &&
        new Date(task.dueDate) <= weekFromNow
    );
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(projectId: number): Promise<ProjectTask[]> {
    const tasks = await this.repository.getTasksByProjectId(projectId);
    const now = new Date();

    return tasks.filter(
      (task) => task.dueDate && task.status !== "done" && new Date(task.dueDate) < now
    );
  }
}

// Singleton instance
export const projectService = new ProjectService();
