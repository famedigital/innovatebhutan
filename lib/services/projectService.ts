import { projectRepository, type ProjectFilters, type ProjectStats } from "@/lib/repositories/projectRepository";
import type { Project, ProjectTask } from "@/lib/repositories/projectRepository";
import { AuthorizationError } from "@/lib/errors/auth-error";
import { projectMemberService } from "@/lib/services/projectMemberService";
import { invoiceService } from "@/lib/services/invoiceService";
import { notificationService } from "@/lib/services/notificationService";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq, or, sql } from "drizzle-orm";
import { canSeeMoney } from "@/lib/auth/capabilities";
import {
  buildInitialMoneyMeta,
  isAdvanceRecorded,
  isBalanceSettled,
  moneySummary,
  parseMoneyMeta,
  type PaymentMethod,
  type ProjectMoneyMeta,
} from "@/lib/projects/moneyMeta";
import type { ProductKey } from "@/lib/config/products";

/** Bible stages + legacy aliases normalized in normalizeStatus */
export type ProjectStatus =
  | "needs_quote"
  | "quoted"
  | "demo"
  | "advance_paid"
  | "in_progress"
  | "testing"
  | "done"
  | "on_hold"
  | "cancelled"
  | "planning"
  | "active"
  | "complete";

export type TaskStatus = "todo" | "in_progress" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface CreateProjectDTO {
  clientId: number;
  serviceId?: number;
  name: string;
  description?: string;
  leadId?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: string;
  productKey?: ProductKey;
  quotedAmount?: number;
  advancePercent?: number;
  createInvoice?: boolean;
}

export interface UpdateProjectDTO {
  serviceId?: number;
  name?: string;
  description?: string;
  status?: ProjectStatus;
  leadId?: string;
  startDate?: Date;
  endDate?: Date;
  budget?: string;
  productKey?: ProductKey;
  holdReason?: string;
  cancelReason?: string;
  refundStatus?: "refunded" | "non_refundable" | "none";
  overrideAdvanceGate?: boolean;
  freeSupportDays?: number;
  quotedAmount?: number;
  advancePercent?: number;
  priceChangeReason?: string;
}

export interface CreateTaskDTO {
  projectId: number;
  assignedTo?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  estimatedHours?: string;
}

export interface UpdateTaskDTO {
  assignedTo?: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  estimatedHours?: string;
  actualHours?: string;
}

export function normalizeStatus(status: string | null | undefined): ProjectStatus {
  const s = (status || "quoted").toLowerCase();
  if (s === "planning") return "quoted";
  if (s === "active") return "in_progress";
  if (s === "complete") return "done";
  return s as ProjectStatus;
}

export class ProjectService {
  private repository = projectRepository;

  // Allow any non-self jump so kanban/select UI can move columns freely
  private readonly validTaskTransitions: Record<TaskStatus, TaskStatus[]> = {
    todo: ["in_progress", "done", "blocked"],
    in_progress: ["done", "blocked", "todo"],
    blocked: ["todo", "in_progress", "done"],
    done: ["todo", "in_progress", "blocked"],
  };

  private validateTaskStatusTransition(currentStatus: TaskStatus, newStatus: TaskStatus): boolean {
    if (currentStatus === newStatus) return true;
    return this.validTaskTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  private validProjectTransitions: Record<string, string[]> = {
    needs_quote: ["quoted", "cancelled"],
    quoted: ["demo", "advance_paid", "in_progress", "on_hold", "cancelled"],
    demo: ["advance_paid", "quoted", "on_hold", "cancelled"],
    advance_paid: ["in_progress", "on_hold", "cancelled"],
    in_progress: ["testing", "on_hold", "cancelled"],
    testing: ["in_progress", "done", "on_hold"],
    done: [],
    on_hold: ["quoted", "demo", "advance_paid", "in_progress", "cancelled"],
    cancelled: [],
  };

  // ==================== PROJECT OPERATIONS ====================

  async createProject(
    data: CreateProjectDTO,
    userId?: string,
    opts?: { profileId?: number; role?: string; capabilities?: string[] | null }
  ): Promise<Project & { invoiceId?: number }> {
    const publicId = `proj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    const hasQuote =
      typeof data.quotedAmount === "number" && data.quotedAmount > 0;
    const actorCanPrice = opts
      ? canSeeMoney({ role: opts.role || "STAFF", capabilities: opts.capabilities })
      : true;

    let status: ProjectStatus = "quoted";
    let moneyMeta: ProjectMoneyMeta = {};

    if (!hasQuote || !actorCanPrice) {
      status = "needs_quote";
    } else {
      status =
        data.productKey === "website" ? "quoted" : "quoted";
      moneyMeta = buildInitialMoneyMeta({
        quotedAmount: data.quotedAmount!,
        advancePercent: data.advancePercent,
      });
      if (data.budget === undefined) {
        data.budget = String(data.quotedAmount);
      }
    }

    const insert = {
      publicId,
      clientId: data.clientId,
      serviceId: data.serviceId,
      name: data.name,
      description: data.description,
      leadId: data.leadId,
      startDate: data.startDate,
      endDate: data.endDate,
      budget: data.budget,
      productKey: data.productKey,
      moneyMeta,
      status,
      progress: 0,
    };

    const project = userId
      ? await this.repository.createProjectWithOwner(insert, userId)
      : await this.repository.createProject(insert);

    if (status === "needs_quote") {
      await this.notifyNeedsQuote(project);
      return project;
    }

    let invoiceId: number | undefined;
    if (data.createInvoice !== false && hasQuote && actorCanPrice) {
      try {
        const due = new Date();
        due.setDate(due.getDate() + 14);
        const invoice = await invoiceService.generateInvoice({
          clientId: data.clientId,
          issueDate: new Date(),
          dueDate: due,
          productKey: (data.productKey || "rancelab") as any,
          notes: `Quote for project: ${data.name}`,
          items: [
            {
              description: data.description || data.name,
              quantity: 1,
              rate: data.quotedAmount!,
            },
          ],
        });
        invoiceId = invoice.id;
        moneyMeta = { ...moneyMeta, invoiceId };
        await this.repository.updateProject(project.id, {
          moneyMeta,
        });
      } catch (err) {
        console.error("[ProjectService] Quote invoice failed:", err);
      }
    }

    return { ...project, moneyMeta, invoiceId };
  }

  private async notifyNeedsQuote(project: Project): Promise<void> {
    try {
      const moneyPeople = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(
          or(
            eq(profiles.role, "ADMIN"),
            eq(profiles.role, "SUPERADMIN"),
            sql`${profiles.capabilities}::jsonb ? 'see_money'`
          )
        );
      for (const p of moneyPeople) {
        await notificationService.createNotification({
          profileId: p.id,
          title: "Needs quote",
          message: `Project "${project.name}" is waiting for a quoted price`,
          type: "warning",
          category: "project_updated",
          entityType: "project",
          entityId: project.id,
          link: `/admin/projects?projectId=${project.id}`,
        });
      }
    } catch (err) {
      console.error("[ProjectService] Needs quote notify failed:", err);
    }
  }

  async getProjectById(id: number): Promise<Project | null> {
    return await this.repository.getProjectById(id);
  }

  async getProjectByPublicId(publicId: string): Promise<Project | null> {
    return await this.repository.getProjectByPublicId(publicId);
  }

  async updateProject(
    id: number,
    data: UpdateProjectDTO,
    userId?: string,
    userRole?: string,
    opts?: { capabilities?: string[] | null; overrideAdvanceGate?: boolean }
  ): Promise<Project> {
    const project = await this.repository.getProjectById(id);
    if (!project) {
      throw new Error("Project not found");
    }

    let canModify = false;
    if (userId) {
      canModify = await projectMemberService.canModifyProject(id, userId);
      if (!canModify && userRole) {
        canModify = this.canUserModifyProject(project, userId, userRole);
      }
      if (!canModify && (userRole === "ADMIN" || userRole === "STAFF" || userRole === "SUPERADMIN")) {
        canModify = true;
      }
    }

    if (!canModify) {
      throw new AuthorizationError("You do not have permission to modify this project");
    }

    const meta = parseMoneyMeta(project.moneyMeta);
    const patch: Record<string, unknown> = { ...data };
    delete patch.holdReason;
    delete patch.cancelReason;
    delete patch.refundStatus;
    delete patch.overrideAdvanceGate;
    delete patch.freeSupportDays;
    delete patch.quotedAmount;
    delete patch.advancePercent;
    delete patch.priceChangeReason;

    // Apply money / quote updates
    if (typeof data.quotedAmount === "number") {
      if (!canSeeMoney({ role: userRole || "STAFF", capabilities: opts?.capabilities })) {
        throw new AuthorizationError("see_money required to set quote");
      }
      const nextMeta = buildInitialMoneyMeta({
        quotedAmount: data.quotedAmount,
        advancePercent: data.advancePercent,
      });
      nextMeta.invoiceId = meta.invoiceId;
      if (data.priceChangeReason) nextMeta.priceChangeReason = data.priceChangeReason;
      patch.moneyMeta = nextMeta;
      patch.budget = String(data.quotedAmount);
      if (normalizeStatus(project.status) === "needs_quote") {
        patch.status = project.productKey === "website" || data.productKey === "website"
          ? "quoted"
          : "quoted";
      }
    }

    if (typeof data.freeSupportDays === "number") {
      patch.moneyMeta = {
        ...parseMoneyMeta((patch.moneyMeta as ProjectMoneyMeta) || meta),
        freeSupportDays: data.freeSupportDays,
      };
    }

    if (data.status) {
      const target = normalizeStatus(data.status);
      await this.assertStatusTransition(project, target, {
        role: userRole,
        capabilities: opts?.capabilities,
        overrideAdvanceGate: data.overrideAdvanceGate || opts?.overrideAdvanceGate,
        holdReason: data.holdReason,
        cancelReason: data.cancelReason,
        refundStatus: data.refundStatus,
      });
      patch.status = target;

      if (target === "on_hold") {
        patch.moneyMeta = {
          ...parseMoneyMeta((patch.moneyMeta as ProjectMoneyMeta) || meta),
          holdReason: data.holdReason || meta.holdReason || "On hold",
        };
      }
      if (target === "cancelled") {
        patch.moneyMeta = {
          ...parseMoneyMeta((patch.moneyMeta as ProjectMoneyMeta) || meta),
          cancelReason: data.cancelReason || meta.cancelReason || "Cancelled",
          refundStatus: data.refundStatus || meta.refundStatus || "none",
        };
      }
    }

    return await this.repository.updateProject(id, patch as any);
  }

  private async assertStatusTransition(
    project: Project,
    newStatus: ProjectStatus,
    ctx: {
      role?: string;
      capabilities?: string[] | null;
      overrideAdvanceGate?: boolean;
      holdReason?: string;
      cancelReason?: string;
      refundStatus?: string;
    }
  ): Promise<void> {
    const current = normalizeStatus(project.status);
    if (current === newStatus) return;

    const allowed = this.validProjectTransitions[current] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Cannot transition from ${current} to ${newStatus}. Valid: ${allowed.join(", ") || "none"}`
      );
    }

    const meta = parseMoneyMeta(project.moneyMeta);
    const moneyActor = canSeeMoney({
      role: ctx.role || "STAFF",
      capabilities: ctx.capabilities,
    });

    if (newStatus === "in_progress" && !isAdvanceRecorded(meta)) {
      if (!(ctx.overrideAdvanceGate && moneyActor)) {
        throw new Error(
          "Advance not recorded. Record advance, or override with see_money (soft gate)."
        );
      }
    }

    if (newStatus === "done") {
      const tasksOk = await this.validateProjectCanBeCompleted(project.id);
      if (!tasksOk) {
        throw new Error("Cannot mark done: incomplete tasks remain");
      }
      if (!isBalanceSettled(meta)) {
        throw new Error(
          "Cannot mark done: record balance payment or write-off first"
        );
      }
    }

    if (newStatus === "on_hold" && !ctx.holdReason && !meta.holdReason) {
      throw new Error("On hold requires a reason");
    }

    if (newStatus === "cancelled") {
      if (!moneyActor) {
        throw new AuthorizationError("Only owner/sales head can cancel projects");
      }
      if (!ctx.cancelReason && !meta.cancelReason) {
        throw new Error("Cancel requires a reason");
      }
      if (isAdvanceRecorded(meta) && !ctx.refundStatus && !meta.refundStatus) {
        throw new Error(
          "Advance was paid: set refundStatus to refunded or non_refundable"
        );
      }
    }
  }

  async deleteProject(id: number, userId?: string, userRole?: string): Promise<void> {
    const project = await this.repository.getProjectById(id);
    if (!project) {
      throw new Error("Project not found");
    }
    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      throw new AuthorizationError("Only administrators can archive projects");
    }
    await this.repository.softDeleteProject(id);
  }

  async restoreProject(id: number, userId?: string, userRole?: string): Promise<void> {
    const project = await this.repository.getProjectById(id);
    if (!project) {
      throw new Error("Project not found (including soft deleted)");
    }
    if (userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
      throw new AuthorizationError("Only administrators can restore projects");
    }
    await this.repository.restoreProject(id);
  }

  async listProjects(filters: ProjectFilters = {}) {
    return await this.repository.listProjectsWithDetails(filters);
  }

  async transitionProjectStatus(
    projectId: number,
    newStatus: ProjectStatus,
    ctx?: {
      userId?: string;
      role?: string;
      capabilities?: string[] | null;
      overrideAdvanceGate?: boolean;
      holdReason?: string;
      cancelReason?: string;
      refundStatus?: "refunded" | "non_refundable" | "none";
    }
  ): Promise<Project> {
    return await this.updateProject(
      projectId,
      {
        status: newStatus,
        overrideAdvanceGate: ctx?.overrideAdvanceGate,
        holdReason: ctx?.holdReason,
        cancelReason: ctx?.cancelReason,
        refundStatus: ctx?.refundStatus,
      },
      ctx?.userId,
      ctx?.role,
      { capabilities: ctx?.capabilities, overrideAdvanceGate: ctx?.overrideAdvanceGate }
    );
  }

  async recordPayment(
    projectId: number,
    input: {
      slot: "advance" | "balance";
      amount: number;
      method: PaymentMethod;
      proofUrl?: string;
      paidAt?: Date;
      recordedBy?: string;
    },
    actor: { role: string; capabilities?: string[] | null }
  ): Promise<Project> {
    if (!canSeeMoney(actor)) {
      throw new AuthorizationError("see_money required to record payments");
    }
    const project = await this.repository.getProjectById(projectId);
    if (!project) throw new Error("Project not found");

    const meta = parseMoneyMeta(project.moneyMeta);
    const slot: ProjectMoneyMeta["advance"] = {
      amount: input.amount,
      method: input.method,
      proofUrl: input.proofUrl || null,
      paidAt: (input.paidAt || new Date()).toISOString(),
      recordedBy: input.recordedBy || null,
    };

    if (input.slot === "advance") {
      meta.advance = slot;
    } else {
      meta.balance = slot;
    }

    let status = normalizeStatus(project.status);
    if (input.slot === "advance" && (status === "quoted" || status === "demo")) {
      status = "advance_paid";
    }

    return await this.repository.updateProject(projectId, {
      moneyMeta: meta,
      status,
    });
  }

  async writeOffBalance(
    projectId: number,
    input: { amount: number; reason: string; by?: string },
    actor: { role: string; capabilities?: string[] | null }
  ): Promise<Project> {
    if (
      !canSeeMoney(actor) ||
      (actor.role !== "ADMIN" &&
        actor.role !== "SUPERADMIN" &&
        !(actor.capabilities || []).includes("write_off"))
    ) {
      // ADMIN always can; STAFF needs write_off (sales head)
      if (!canSeeMoney(actor)) {
        throw new AuthorizationError("write_off / see_money required");
      }
    }
    const project = await this.repository.getProjectById(projectId);
    if (!project) throw new Error("Project not found");
    const meta = parseMoneyMeta(project.moneyMeta);
    meta.writeOff = {
      amount: input.amount,
      reason: input.reason,
      at: new Date().toISOString(),
      by: input.by || null,
    };
    return await this.repository.updateProject(projectId, { moneyMeta: meta });
  }

  getMoneySummary(project: Project) {
    return moneySummary(parseMoneyMeta(project.moneyMeta));
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

  async transitionTaskStatus(taskId: number, newStatus: TaskStatus): Promise<ProjectTask> {
    const task = await this.repository.getTaskById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const currentStatus = task.status as TaskStatus;
    if (!this.validateTaskStatusTransition(currentStatus, newStatus)) {
      throw new Error(
        `Cannot transition task from ${currentStatus} to ${newStatus}. Valid transitions: ${this.validTaskTransitions[currentStatus]?.join(", ") || "none"}`
      );
    }

    return await this.repository.updateTaskWithProgressUpdate(taskId, { status: newStatus });
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

  async getMyTasks(userId: string) {
    return await this.repository.getTasksAssignedToUser(userId);
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

    // Validate status transition if status is being changed
    if (data.status && task.status !== data.status) {
      const currentStatus = task.status as TaskStatus;
      const newStatus = data.status;
      if (!this.validateTaskStatusTransition(currentStatus, newStatus)) {
        throw new Error(
          `Cannot transition task from ${currentStatus} to ${newStatus}. Valid transitions: ${this.validTaskTransitions[currentStatus]?.join(", ") || "none"}`
        );
      }
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
    // Check authorization first
    if (userId && userRole && userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("Only ADMIN and STAFF can bulk create tasks");
    }

    // Prepare task data
    const taskData = tasks.map(task => ({
      projectId,
      assignedTo: task.assignedTo,
      title: task.title,
      description: task.description,
      priority: task.priority || "medium" as TaskPriority,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours,
      status: "todo" as TaskStatus,
      position: 0, // Will be updated later if needed
    }));

    // Use atomic transaction - either all tasks succeed or none do
    return await this.repository.bulkCreateTasks(projectId, taskData);
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

  async getProjectWithTasks(projectId: number, userId?: string, opts?: { bypassAcl?: boolean }) {
    // Admin API already gates STAFF/ADMIN; membership ACL is for portal/client scopes
    if (userId && !opts?.bypassAcl) {
      const canView = await projectMemberService.canViewProject(projectId, userId);
      if (!canView) {
        // Fall through if user is staff/admin — checked at API layer for /admin routes
        const { db } = await import("@/db");
        const { profiles } = await import("@/db/schema");
        const { eq } = await import("drizzle-orm");
        const rows = await db
          .select({ role: profiles.role })
          .from(profiles)
          .where(eq(profiles.userId, userId))
          .limit(1);
        const role = (rows[0]?.role || "").toUpperCase();
        if (role !== "ADMIN" && role !== "STAFF" && role !== "SUPERADMIN") {
          throw new AuthorizationError("You do not have permission to view this project");
        }
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
    if (!project.endDate || project.status === "done" || project.status === "complete" || project.status === "cancelled") {
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
