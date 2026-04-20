import { db } from "@/db";
import { projectMembers, projects, profiles } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

type ProjectMember = typeof projectMembers.$inferSelect;
type NewProjectMember = typeof projectMembers.$inferInsert;

export interface ProjectMemberWithProfile extends ProjectMember {
  profileName?: string;
  profileEmail?: string;
}

export type ProjectMemberRole = "owner" | "lead" | "member" | "viewer" | "client_viewer";

/**
 * Repository for project members (RBAC)
 */
export class ProjectMemberRepository {
  private db = db;

  // ==================== CRUD OPERATIONS ====================

  async addMember(data: NewProjectMember): Promise<ProjectMember> {
    const [member] = await this.db.insert(projectMembers).values(data).returning();
    return member;
  }

  async removeMember(projectId: number, userId: string): Promise<void> {
    await this.db
      .delete(projectMembers)
      .where(and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      ));
  }

  async updateMemberRole(projectId: number, userId: string, role: ProjectMemberRole): Promise<ProjectMember> {
    const [member] = await this.db
      .update(projectMembers)
      .set({ role })
      .where(and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      ))
      .returning();
    return member;
  }

  async getMember(projectId: number, userId: string): Promise<ProjectMember | null> {
    const [member] = await this.db
      .select()
      .from(projectMembers)
      .where(and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      ))
      .limit(1);
    return member || null;
  }

  async getMembersByProject(projectId: number): Promise<ProjectMemberWithProfile[]> {
    return await this.db
      .select({
        id: projectMembers.id,
        projectId: projectMembers.projectId,
        userId: projectMembers.userId,
        role: projectMembers.role,
        joinedAt: projectMembers.joinedAt,
        profileName: profiles.fullName,
        profileEmail: profiles.userId, // Using userId as email placeholder since we may not have email in profiles
      })
      .from(projectMembers)
      .leftJoin(profiles, eq(projectMembers.userId, profiles.userId))
      .where(eq(projectMembers.projectId, projectId))
      .orderBy(desc(projectMembers.joinedAt));
  }

  async getProjectsByUser(userId: string): Promise<number[]> {
    const members = await this.db
      .select({ projectId: projectMembers.projectId })
      .from(projectMembers)
      .where(eq(projectMembers.userId, userId));

    return members.map(m => m.projectId);
  }

  // ==================== AUTHORIZATION HELPERS ====================

  /**
   * Check if a user has a specific role or higher in a project
   * Role hierarchy: owner > lead > member > viewer > client_viewer
   */
  async hasRole(projectId: number, userId: string, minRole: ProjectMemberRole): Promise<boolean> {
    const member = await this.getMember(projectId, userId);
    if (!member) return false;

    const roleHierarchy: Record<ProjectMemberRole, number> = {
      owner: 5,
      lead: 4,
      member: 3,
      viewer: 2,
      client_viewer: 1,
    };

    return roleHierarchy[member.role as ProjectMemberRole] >= roleHierarchy[minRole];
  }

  /**
   * Check if a user is a member of a project
   */
  async isMember(projectId: number, userId: string): Promise<boolean> {
    const member = await this.getMember(projectId, userId);
    return member !== null;
  }

  /**
   * Check if a user can modify a project based on their role
   */
  async canModifyProject(projectId: number, userId: string): Promise<boolean> {
    // Users with owner, lead, or member roles can modify
    return await this.hasRole(projectId, userId, "member");
  }

  /**
   * Check if a user can view a project based on their role
   */
  async canViewProject(projectId: number, userId: string): Promise<boolean> {
    // All members including viewers and client_viewers can view
    return await this.hasRole(projectId, userId, "client_viewer");
  }

  /**
   * Check if a user can manage project members (add/remove/update roles)
   */
  async canManageMembers(projectId: number, userId: string): Promise<boolean> {
    // Only owners and leads can manage members
    return await this.hasRole(projectId, userId, "lead");
  }

  // ==================== BULK OPERATIONS ====================

  async addMembers(projectId: number, members: Array<{ userId: string; role: ProjectMemberRole }>): Promise<ProjectMember[]> {
    const added: ProjectMember[] = [];

    for (const member of members) {
      try {
        const addedMember = await this.addMember({
          projectId,
          userId: member.userId,
          role: member.role,
        });
        added.push(addedMember);
      } catch (error) {
        // Skip duplicates (constraint violation)
        console.warn(`Failed to add member ${member.userId}:`, error);
      }
    }

    return added;
  }

  async removeMembers(projectId: number, userIds: string[]): Promise<void> {
    await this.db
      .delete(projectMembers)
      .where(and(
        eq(projectMembers.projectId, projectId),
        sql`${projectMembers.userId} = ANY(${userIds})`
      ));
  }
}

// Singleton instance
export const projectMemberRepository = new ProjectMemberRepository();
