import { milestoneRepository, type MilestoneStatus, type ProjectMilestone } from "@/lib/repositories/milestoneRepository";
import { projectMemberService } from "@/lib/services/projectMemberService";
import { AuthorizationError } from "@/lib/errors/auth-error";

export interface CreateMilestoneDTO {
  projectId: number;
  name: string;
  description?: string;
  status?: MilestoneStatus;
  dueDate?: Date;
  position?: number;
}

export interface UpdateMilestoneDTO {
  name?: string;
  description?: string;
  status?: MilestoneStatus;
  dueDate?: Date;
  position?: number;
}

/**
 * Service for project milestones
 */
export class MilestoneService {
  private repository = milestoneRepository;

  // ==================== STATUS TRANSITIONS ====================

  /**
   * Valid milestone status transitions
   * pending -> in_progress, cancelled
   * in_progress -> complete, cancelled
   * complete -> in_progress (reopened)
   * cancelled -> pending (reopened)
   */
  private readonly validMilestoneTransitions: Record<MilestoneStatus, MilestoneStatus[]> = {
    pending: ["in_progress", "cancelled"],
    in_progress: ["complete", "cancelled"],
    complete: ["in_progress"], // Allow reopening
    cancelled: ["pending"], // Allow reopening
  };

  /**
   * Validate milestone status transition
   */
  private validateMilestoneStatusTransition(currentStatus: MilestoneStatus, newStatus: MilestoneStatus): boolean {
    if (currentStatus === newStatus) return true; // No-op is allowed
    return this.validMilestoneTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  // ==================== CRUD OPERATIONS ====================

  async createMilestone(
    data: CreateMilestoneDTO,
    operatorUserId: string,
    operatorRole: string
  ): Promise<ProjectMilestone> {
    // Check permissions
    const canModify = await projectMemberService.canModifyProject(data.projectId, operatorUserId);
    if (!canModify && operatorRole !== "ADMIN" && operatorRole !== "STAFF") {
      throw new AuthorizationError("You do not have permission to add milestones to this project");
    }

    return await this.repository.createMilestone({
      ...data,
      status: data.status || "pending",
    });
  }

  async getMilestoneById(id: number): Promise<ProjectMilestone | null> {
    return await this.repository.getMilestoneById(id);
  }

  async getMilestonesByProject(projectId: number, operatorUserId?: string): Promise<ProjectMilestone[]> {
    // Check permissions if userId provided
    if (operatorUserId) {
      const canView = await projectMemberService.canViewProject(projectId, operatorUserId);
      if (!canView) {
        throw new AuthorizationError("You do not have permission to view this project");
      }
    }

    return await this.repository.getMilestonesByProject(projectId);
  }

  async updateMilestone(
    id: number,
    data: UpdateMilestoneDTO,
    operatorUserId: string,
    operatorRole: string
  ): Promise<ProjectMilestone> {
    const milestone = await this.repository.getMilestoneById(id);
    if (!milestone) {
      throw new Error("Milestone not found");
    }

    // Check permissions
    const canModify = await projectMemberService.canModifyProject(milestone.projectId, operatorUserId);
    if (!canModify && operatorRole !== "ADMIN" && operatorRole !== "STAFF") {
      throw new AuthorizationError("You do not have permission to modify this milestone");
    }

    // Validate status transition if status is being changed
    if (data.status && milestone.status !== data.status) {
      const currentStatus = milestone.status as MilestoneStatus;
      const newStatus = data.status;
      if (!this.validateMilestoneStatusTransition(currentStatus, newStatus)) {
        throw new Error(
          `Cannot transition milestone from ${currentStatus} to ${newStatus}. Valid transitions: ${this.validMilestoneTransitions[currentStatus]?.join(", ") || "none"}`
        );
      }
    }

    // If status is being changed to 'complete', set the completedAt timestamp
    const updateData: UpdateMilestoneDTO & { completedAt?: Date } = { ...data };
    if (data.status === "complete" && milestone.status !== "complete") {
      updateData.completedAt = new Date();
    } else if (data.status && data.status !== "complete") {
      updateData.completedAt = null;
    }

    return await this.repository.updateMilestone(id, updateData);
  }

  async deleteMilestone(id: number, operatorUserId: string, operatorRole: string): Promise<void> {
    const milestone = await this.repository.getMilestoneById(id);
    if (!milestone) {
      throw new Error("Milestone not found");
    }

    // Check permissions
    const canModify = await projectMemberService.canModifyProject(milestone.projectId, operatorUserId);
    if (!canModify && operatorRole !== "ADMIN" && operatorRole !== "STAFF") {
      throw new AuthorizationError("You do not have permission to delete this milestone");
    }

    await this.repository.softDeleteMilestone(id);
  }

  async restoreMilestone(id: number, operatorUserId: string, operatorRole: string): Promise<void> {
    const milestone = await this.repository.getMilestoneById(id);
    if (!milestone) {
      throw new Error("Milestone not found (including soft deleted)");
    }

    // Check permissions
    const canModify = await projectMemberService.canModifyProject(milestone.projectId, operatorUserId);
    if (!canModify && operatorRole !== "ADMIN" && operatorRole !== "STAFF") {
      throw new AuthorizationError("You do not have permission to restore this milestone");
    }

    await this.repository.restoreMilestone(id);
  }

  // ==================== AGGREGATION ====================

  async getMilestoneStats(projectId: number) {
    return await this.repository.getMilestoneStats(projectId);
  }

  /**
   * Calculate project progress from milestones
   * This is an alternative to task-based progress calculation
   */
  async calculateProgressFromMilestones(projectId: number): Promise<number> {
    return await this.repository.calculateProgressFromMilestones(projectId);
  }
}

// Singleton instance
export const milestoneService = new MilestoneService();
