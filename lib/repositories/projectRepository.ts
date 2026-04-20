import { db } from "@/db";
import { projects, projectTasks, clients, profiles, services } from "@/db/schema";
import { eq, and, desc, sql, count, isNotNull, isNull } from "drizzle-orm";
import { getCachedProgress, setCachedProgress, invalidateProgress } from "@/lib/cache/project-cache";

type Project = typeof projects.$inferSelect;
type NewProject = typeof projects.$inferInsert;
type ProjectTask = typeof projectTasks.$inferSelect;
type NewProjectTask = typeof projectTasks.$inferInsert;

export interface ProjectFilters {
  clientId?: number;
  status?: string;
  leadId?: string; // User ID (text) from Supabase Auth
  search?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  progressPercentage: number;
}

export class ProjectRepository {
  private db = db;

  // ==================== PROJECT CRUD ====================

  async createProject(data: NewProject): Promise<Project> {
    const [project] = await this.db.insert(projects).values(data).returning();
    return project;
  }

  async getProjectById(id: number): Promise<Project | null> {
    const [project] = await this.db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
      .limit(1);
    return project || null;
  }

  async getProjectByPublicId(publicId: string): Promise<Project | null> {
    const [project] = await this.db
      .select()
      .from(projects)
      .where(and(eq(projects.publicId, publicId), isNull(projects.deletedAt)))
      .limit(1);
    return project || null;
  }

  async updateProject(id: number, data: Partial<NewProject>): Promise<Project> {
    const [project] = await this.db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: number): Promise<void> {
    await this.db.delete(projects).where(eq(projects.id, id));
  }

  async listProjects(filters: ProjectFilters = {}): Promise<{ projects: Project[]; total: number }> {
    const conditions = [isNull(projects.deletedAt)]; // Exclude soft-deleted

    if (filters.clientId) {
      conditions.push(eq(projects.clientId, filters.clientId));
    }
    if (filters.status) {
      conditions.push(eq(projects.status, filters.status));
    }
    if (filters.leadId) {
      conditions.push(eq(projects.leadId, filters.leadId));
    }
    if (filters.search) {
      conditions.push(
        sql`(${projects.name} ILIKE ${'%' + filters.search + '%'} OR ${projects.description} ILIKE ${'%' + filters.search + '%'})`
      );
    }
    if (filters.startDateFrom) {
      conditions.push(sql`${projects.startDate} >= ${filters.startDateFrom}`);
    }
    if (filters.startDateTo) {
      conditions.push(sql`${projects.startDate} <= ${filters.startDateTo}`);
    }

    const whereClause = and(...conditions);

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(projects)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Fetch projects
    const projectsData = await this.db
      .select()
      .from(projects)
      .where(whereClause)
      .orderBy(desc(projects.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return { projects: projectsData, total };
  }

  async listProjectsWithDetails(filters: ProjectFilters = {}) {
    const conditions = [isNull(projects.deletedAt)]; // Exclude soft-deleted

    if (filters.clientId) {
      conditions.push(eq(projects.clientId, filters.clientId));
    }
    if (filters.status) {
      conditions.push(eq(projects.status, filters.status));
    }
    if (filters.leadId) {
      conditions.push(eq(projects.leadId, filters.leadId));
    }
    if (filters.search) {
      conditions.push(
        sql`(${projects.name} ILIKE ${'%' + filters.search + '%'} OR ${projects.description} ILIKE ${'%' + filters.search + '%'})`
      );
    }
    if (filters.startDateFrom) {
      conditions.push(sql`${projects.startDate} >= ${filters.startDateFrom}`);
    }
    if (filters.startDateTo) {
      conditions.push(sql`${projects.startDate} <= ${filters.startDateTo}`);
    }

    const whereClause = and(...conditions);

    const projectsData = await this.db
      .select({
        id: projects.id,
        publicId: projects.publicId,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        budget: projects.budget,
        progress: projects.progress,
        startDate: projects.startDate,
        endDate: projects.endDate,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        clientName: clients.name,
        clientLogo: clients.logoUrl,
        leadName: profiles.fullName,
        serviceName: services.name,
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .leftJoin(profiles, eq(projects.leadId, profiles.userId)) // leadId is text, matches profiles.userId
      .leftJoin(services, eq(projects.serviceId, services.id))
      .where(whereClause)
      .orderBy(desc(projects.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(projects)
      .where(whereClause);

    return {
      projects: projectsData,
      total: totalResult[0]?.count || 0,
    };
  }

  // ==================== TASK CRUD ====================

  async createTask(data: NewProjectTask): Promise<ProjectTask> {
    const [task] = await this.db.insert(projectTasks).values(data).returning();

    // Invalidate progress cache when new task is created
    invalidateProgress(task.projectId);

    return task;
  }

  /**
   * Create task and update project progress in a single transaction
   * This ensures atomicity - both operations succeed or both fail
   */
  async createTaskWithProgressUpdate(data: NewProjectTask): Promise<ProjectTask> {
    return await this.db.transaction(async (tx) => {
      const [task] = await tx.insert(projectTasks).values(data).returning();

      // Get stats and calculate progress within the same transaction
      const stats = await tx
        .select({
          total: count(),
          completed: count(sql`CASE WHEN ${projectTasks.status} = 'done' THEN 1 END`),
        })
        .from(projectTasks)
        .where(and(eq(projectTasks.projectId, data.projectId), isNull(projectTasks.deletedAt)));

      const progress = stats[0] && Number(stats[0].total) > 0
        ? Math.round((Number(stats[0].completed) / Number(stats[0].total)) * 100)
        : 0;

      // Update project progress
      await tx
        .update(projects)
        .set({ progress, updatedAt: new Date() })
        .where(eq(projects.id, data.projectId));

      // Update cache
      setCachedProgress(data.projectId, progress);
      invalidateProgress(data.projectId);

      return task;
    });
  }

  async getTaskById(id: number): Promise<ProjectTask | null> {
    const [task] = await this.db
      .select()
      .from(projectTasks)
      .where(and(eq(projectTasks.id, id), isNull(projectTasks.deletedAt)))
      .limit(1);
    return task || null;
  }

  async getTasksByProjectId(projectId: number): Promise<ProjectTask[]> {
    return await this.db
      .select()
      .from(projectTasks)
      .where(and(eq(projectTasks.projectId, projectId), isNull(projectTasks.deletedAt)))
      .orderBy(projectTasks.position, desc(projectTasks.createdAt));
  }

  /**
   * Get tasks with assignee profile information (eliminates N+1 queries)
   */
  async getTasksWithProfiles(projectId: number): Promise<Array<ProjectTask & { assigneeName?: string; assigneeEmail?: string }>> {
    return await this.db
      .select({
        id: projectTasks.id,
        projectId: projectTasks.projectId,
        assignedTo: projectTasks.assignedTo,
        title: projectTasks.title,
        description: projectTasks.description,
        status: projectTasks.status,
        priority: projectTasks.priority,
        dueDate: projectTasks.dueDate,
        estimatedHours: projectTasks.estimatedHours,
        actualHours: projectTasks.actualHours,
        position: projectTasks.position,
        createdAt: projectTasks.createdAt,
        assigneeName: profiles.fullName,
        assigneeEmail: profiles.userId, // Using userId as email placeholder
      })
      .from(projectTasks)
      .leftJoin(profiles, eq(projectTasks.assignedTo, profiles.userId))
      .where(and(eq(projectTasks.projectId, projectId), isNull(projectTasks.deletedAt)))
      .orderBy(projectTasks.position, desc(projectTasks.createdAt));
  }

  async updateTask(id: number, data: Partial<NewProjectTask>): Promise<ProjectTask> {
    const [task] = await this.db.update(projectTasks).set(data).where(eq(projectTasks.id, id)).returning();

    // Invalidate progress cache when task is updated
    invalidateProgress(task.projectId);

    return task;
  }

  /**
   * Update task and update project progress in a single transaction
   */
  async updateTaskWithProgressUpdate(id: number, data: Partial<NewProjectTask>): Promise<ProjectTask> {
    return await this.db.transaction(async (tx) => {
      const [task] = await tx.update(projectTasks).set(data).where(eq(projectTasks.id, id)).returning();

      // Get stats and calculate progress within the same transaction
      const stats = await tx
        .select({
          total: count(),
          completed: count(sql`CASE WHEN ${projectTasks.status} = 'done' THEN 1 END`),
        })
        .from(projectTasks)
        .where(and(eq(projectTasks.projectId, task.projectId), isNull(projectTasks.deletedAt)));

      const progress = stats[0] && Number(stats[0].total) > 0
        ? Math.round((Number(stats[0].completed) / Number(stats[0].total)) * 100)
        : 0;

      // Update project progress
      await tx
        .update(projects)
        .set({ progress, updatedAt: new Date() })
        .where(eq(projects.id, task.projectId));

      // Update cache
      setCachedProgress(task.projectId, progress);
      invalidateProgress(task.projectId);

      return task;
    });
  }

  async deleteTask(id: number): Promise<void> {
    // Get task first to invalidate its project's cache
    const task = await this.getTaskById(id);
    if (task) {
      invalidateProgress(task.projectId);
    }

    await this.db.delete(projectTasks).where(eq(projectTasks.id, id));
  }

  /**
   * Delete task and update project progress in a single transaction
   */
  async deleteTaskWithProgressUpdate(id: number): Promise<void> {
    await this.db.transaction(async (tx) => {
      // Get the task first to get the projectId
      const [task] = await tx
        .select()
        .from(projectTasks)
        .where(eq(projectTasks.id, id))
        .limit(1);

      if (!task) {
        throw new Error("Task not found");
      }

      // Delete the task
      await tx.delete(projectTasks).where(eq(projectTasks.id, id));

      // Get stats and calculate progress within the same transaction
      const stats = await tx
        .select({
          total: count(),
          completed: count(sql`CASE WHEN ${projectTasks.status} = 'done' THEN 1 END`),
        })
        .from(projectTasks)
        .where(and(eq(projectTasks.projectId, task.projectId), isNull(projectTasks.deletedAt)));

      const progress = stats[0] && Number(stats[0].total) > 0
        ? Math.round((Number(stats[0].completed) / Number(stats[0].total)) * 100)
        : 0;

      // Update project progress
      await tx
        .update(projects)
        .set({ progress, updatedAt: new Date() })
        .where(eq(projects.id, task.projectId));

      // Update cache
      setCachedProgress(task.projectId, progress);
      invalidateProgress(task.projectId);
    });
  }

  async deleteTasksByProjectId(projectId: number): Promise<void> {
    await this.db.delete(projectTasks).where(eq(projectTasks.projectId, projectId));
  }

  // ==================== AGGREGATION QUERIES ====================

  async getProjectStats(projectId: number): Promise<ProjectStats> {
    const stats = await this.db
      .select({
        total: count(),
        completed: count(sql`CASE WHEN ${projectTasks.status} = 'done' THEN 1 END`),
        inProgress: count(sql`CASE WHEN ${projectTasks.status} = 'in_progress' THEN 1 END`),
        todo: count(sql`CASE WHEN ${projectTasks.status} = 'todo' THEN 1 END`),
      })
      .from(projectTasks)
      .where(and(eq(projectTasks.projectId, projectId), isNull(projectTasks.deletedAt)));

    const result = stats[0] || { total: 0, completed: 0, inProgress: 0, todo: 0 };
    const progressPercentage = result.total > 0
      ? Math.round((Number(result.completed) / Number(result.total)) * 100)
      : 0;

    return {
      totalTasks: Number(result.total),
      completedTasks: Number(result.completed),
      inProgressTasks: Number(result.inProgress),
      todoTasks: Number(result.todo),
      progressPercentage,
    };
  }

  async updateProjectProgress(projectId: number): Promise<void> {
    // Check cache first to avoid unnecessary database query
    const cachedProgress = getCachedProgress(projectId);
    if (cachedProgress !== null) {
      await this.db
        .update(projects)
        .set({ progress: cachedProgress, updatedAt: new Date() })
        .where(eq(projects.id, projectId));
      return;
    }

    const stats = await this.getProjectStats(projectId);

    await this.db
      .update(projects)
      .set({ progress: stats.progressPercentage, updatedAt: new Date() })
      .where(eq(projects.id, projectId));

    // Update cache
    setCachedProgress(projectId, stats.progressPercentage);
  }

  /**
   * Get project progress percentage with caching
   * Uses SQL aggregation for efficiency (not fetching all rows)
   */
  async getProjectProgress(projectId: number): Promise<number> {
    // Check cache first
    const cached = getCachedProgress(projectId);
    if (cached !== null) {
      return cached;
    }

    // Use efficient SQL aggregation query
    const [result] = await this.db
      .select({
        total: count(),
        completed: count(sql`CASE WHEN ${projectTasks.status} = 'done' THEN 1 END`),
      })
      .from(projectTasks)
      .where(and(eq(projectTasks.projectId, projectId), isNull(projectTasks.deletedAt)));

    if (!result || Number(result.total) === 0) {
      return 0;
    }

    const progress = Math.round((Number(result.completed) / Number(result.total)) * 100);
    setCachedProgress(projectId, progress);
    return progress;
  }

  // ==================== SOFT DELETE OPERATIONS ====================

  /**
   * Soft delete a project atomically - marks project and all tasks as deleted
   */
  async softDeleteProject(id: number): Promise<void> {
    await this.db.transaction(async (tx) => {
      // Mark project as deleted
      await tx
        .update(projects)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(projects.id, id));

      // Also soft delete all associated tasks
      await tx
        .update(projectTasks)
        .set({ deletedAt: new Date() })
        .where(eq(projectTasks.projectId, id));
    });
  }

  /**
   * Restore a soft deleted project atomically - restores project and all tasks
   */
  async restoreProject(id: number): Promise<void> {
    await this.db.transaction(async (tx) => {
      // Restore project
      await tx
        .update(projects)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(eq(projects.id, id));

      // Also restore all associated tasks
      await tx
        .update(projectTasks)
        .set({ deletedAt: null })
        .where(eq(projectTasks.projectId, id));
    });
  }

  /**
   * Soft delete a task
   */
  async softDeleteTask(id: number): Promise<void> {
    await this.db
      .update(projectTasks)
      .set({ deletedAt: new Date() })
      .where(eq(projectTasks.id, id));
  }

  /**
   * Restore a soft deleted task
   */
  async restoreTask(id: number): Promise<void> {
    await this.db
      .update(projectTasks)
      .set({ deletedAt: null })
      .where(eq(projectTasks.id, id));
  }

  /**
   * Permanently delete old soft-deleted projects (cleanup)
   */
  async permanentlyDeleteOldProjects(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.db
      .delete(projects)
      .where(sql`${projects.deletedAt} < ${cutoffDate}`);

    return result.rowCount || 0;
  }

  // ==================== DASHBOARD STATS ====================

  async getDashboardStats() {
    const [statusStats, totalProjects, activeTasks] = await Promise.all([
      this.db
        .select({
          status: projects.status,
          count: count(),
        })
        .from(projects)
        .groupBy(projects.status),

      this.db.select({ count: count() }).from(projects),

      this.db
        .select({ count: count() })
        .from(projectTasks)
        .where(eq(projectTasks.status, 'in_progress')),
    ]);

    const totalProjectsCount = totalProjects[0]?.count || 0;
    const activeTasksCount = activeTasks[0]?.count || 0;

    return {
      byStatus: statusStats.reduce((acc, item) => {
        acc[item.status || 'unknown'] = Number(item.count);
        return acc;
      }, {} as Record<string, number>),
      totalProjects: Number(totalProjectsCount),
      activeTasks: Number(activeTasksCount),
    };
  }

  async getProjectsByClientId(clientId: number): Promise<Project[]> {
    return await this.db
      .select()
      .from(projects)
      .where(eq(projects.clientId, clientId))
      .orderBy(desc(projects.createdAt));
  }

  async getProjectsByLeadId(leadId: string): Promise<Project[]> {
    return await this.db
      .select()
      .from(projects)
      .where(eq(projects.leadId, leadId))
      .orderBy(desc(projects.createdAt));
  }
}

// Singleton instance
export const projectRepository = new ProjectRepository();
