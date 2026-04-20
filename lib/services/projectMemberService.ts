import { projectMemberRepository, type ProjectMemberRole, type ProjectMemberWithProfile } from "@/lib/repositories/projectMemberRepository";
import { projectService } from "@/lib/services/projectService";
import { AuthorizationError } from "@/lib/errors/auth-error";

/**
 * Service for project membership and RBAC
 */
export class ProjectMemberService {
  private repository = projectMemberRepository;

  // ==================== MEMBER MANAGEMENT ====================

  async addMember(
    projectId: number,
    userId: string,
    role: ProjectMemberRole,
    operatorUserId: string,
    operatorRole: string
  ): Promise<ProjectMemberWithProfile> {
    // Verify project exists
    const project = await projectService.getProjectById(projectId);
    if (!project) {
      throw new Error("Project not found");
    }

    // Check if operator can manage members
    const canManage = await this.repository.canManageMembers(projectId, operatorUserId);
    if (!canManage && operatorRole !== "ADMIN") {
      throw new AuthorizationError("You do not have permission to manage project members");
    }

    // Check if user is already a member
    const existing = await this.repository.getMember(projectId, userId);
    if (existing) {
      throw new Error("User is already a member of this project");
    }

    return await this.repository.addMember({
      projectId,
      userId,
      role,
    });
  }

  async removeMember(
    projectId: number,
    userId: string,
    operatorUserId: string,
    operatorRole: string
  ): Promise<void> {
    // Check if operator can manage members
    const canManage = await this.repository.canManageMembers(projectId, operatorUserId);
    if (!canManage && operatorRole !== "ADMIN") {
      throw new AuthorizationError("You do not have permission to manage project members");
    }

    // Prevent removing the last owner
    const member = await this.repository.getMember(projectId, userId);
    if (member?.role === "owner") {
      const owners = await this.repository.getMembersByProject(projectId);
      const ownerCount = owners.filter(m => m.role === "owner").length;
      if (ownerCount <= 1) {
        throw new Error("Cannot remove the last owner of a project");
      }
    }

    await this.repository.removeMember(projectId, userId);
  }

  async updateMemberRole(
    projectId: number,
    userId: string,
    newRole: ProjectMemberRole,
    operatorUserId: string,
    operatorRole: string
  ): Promise<ProjectMemberWithProfile> {
    // Check if operator can manage members
    const canManage = await this.repository.canManageMembers(projectId, operatorUserId);
    if (!canManage && operatorRole !== "ADMIN") {
      throw new AuthorizationError("You do not have permission to manage project members");
    }

    // Prevent demoting the last owner
    const member = await this.repository.getMember(projectId, userId);
    if (member?.role === "owner" && newRole !== "owner") {
      const owners = await this.repository.getMembersByProject(projectId);
      const ownerCount = owners.filter(m => m.role === "owner").length;
      if (ownerCount <= 1) {
        throw new Error("Cannot demote the last owner of a project");
      }
    }

    return await this.repository.updateMemberRole(projectId, userId, newRole);
  }

  async getMembers(projectId: number): Promise<ProjectMemberWithProfile[]> {
    return await this.repository.getMembersByProject(projectId);
  }

  async getMember(projectId: number, userId: string) {
    return await this.repository.getMember(projectId, userId);
  }

  // ==================== AUTHORIZATION ====================

  async canViewProject(projectId: number, userId: string): Promise<boolean> {
    return await this.repository.canViewProject(projectId, userId);
  }

  async canModifyProject(projectId: number, userId: string): Promise<boolean> {
    return await this.repository.canModifyProject(projectId, userId);
  }

  async canManageMembers(projectId: number, userId: string): Promise<boolean> {
    return await this.repository.canManageMembers(projectId, userId);
  }

  /**
   * Get all projects a user has access to
   */
  async getUserAccessibleProjects(userId: string): Promise<number[]> {
    return await this.repository.getProjectsByUser(userId);
  }

  /**
   * Add the project creator as the first owner
   * Called automatically when a project is created
   */
  async addCreatorAsOwner(projectId: number, creatorUserId: string): Promise<void> {
    await this.repository.addMember({
      projectId,
      userId: creatorUserId,
      role: "owner",
    });
  }

  /**
   * Add a client as a viewer to a project
   */
  async addClientViewer(projectId: number, clientUserId: string): Promise<void> {
    const existing = await this.repository.getMember(projectId, clientUserId);
    if (!existing) {
      await this.repository.addMember({
        projectId,
        userId: clientUserId,
        role: "client_viewer",
      });
    }
  }
}

// Singleton instance
export const projectMemberService = new ProjectMemberService();
