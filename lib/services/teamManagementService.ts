/**
 * 👥 TEAM MANAGEMENT SERVICE
 * Business logic for AI-optimized team routing and workload management
 */

import * as repo from "@/lib/repositories/teamAssignmentRepository";
import type { TeamAssignment, NewTeamAssignment } from "@/lib/repositories/teamAssignmentRepository";

export interface TeamMemberWorkload {
  teamMemberId: number;
  teamMemberName: string;
  currentWorkload: number;
  maxCapacity: number;
  utilizationRate: number;
}

export interface TeamPerformance {
  totalProblems: number;
  averageResolutionTime: number;
  clientSatisfaction: number;
  utilizationRate: number;
}

/**
 * Team Management Service Class
 */
export class TeamManagementService {
  private repository = repo;

  // ==================== Team Assignment ====================

  async assignBestTeamMember(clientId: number, problemSeverity: string): Promise<{
    success: boolean;
    teamMemberId?: number;
    reason?: string;
  }> {
    try {
      // Get available team members
      const availableMembers = await this.repository.getAvailableTeamMembers();

      if (availableMembers.length === 0) {
        return {
          success: false,
          reason: "No available team members with capacity"
        };
      }

      // AI-optimized assignment logic
      let bestMember = availableMembers[0];
      let bestScore = 0;

      for (const member of availableMembers) {
        let score = 0;

        // Prioritize members with lower utilization
        score += (100 - member.utilizationRate) * 0.4;

        // Prioritize members with relevant skills
        if (member.skills && Array.isArray(member.skills)) {
          const hasSkill = member.skills.some((skill: string) =>
            skill.toLowerCase().includes(problemSeverity.toLowerCase())
          );
          if (hasSkill) score += 30;
        }

        // Prioritize members who are already assigned to this client
        const clientAssignments = await this.repository.getClientTeamMembers(clientId);
        const existingAssignment = clientAssignments.find(a => a.teamMemberId === member.teamMemberId);
        if (existingAssignment) score += 20;

        if (score > bestScore) {
          bestScore = score;
          bestMember = member;
        }
      }

      // Create assignment
      const assignment: NewTeamAssignment = {
        clientId,
        teamMemberId: bestMember.teamMemberId,
        role: 'team-member',
        isFocalPerson: false,
        workload: bestMember.currentWorkload + 1,
        performanceScore: 80,
        skills: bestMember.skills || []
      };

      await this.repository.createTeamAssignment(assignment);

      return {
        success: true,
        teamMemberId: bestMember.teamMemberId,
        reason: "Assigned based on skills, workload, and client familiarity"
      };
    } catch (error) {
      console.error("Service error assigning team member:", error);
      return { success: false, reason: "Assignment failed" };
    }
  }

  async setFocalPerson(clientId: number, teamMemberId: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const success = await this.repository.setFocalPerson(clientId, teamMemberId);

      if (!success) {
        return { success: false, error: "Failed to set focal person" };
      }

      return { success: true };
    } catch (error) {
      console.error("Service error setting focal person:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  /**
   * Assign one staff member to many clients as focal or backup.
   */
  async bulkAssignClients(
    clientIds: number[],
    teamMemberId: number,
    role: repo.AssignmentRole
  ): Promise<{ success: boolean; assigned: number; error?: string }> {
    try {
      if (!clientIds.length) {
        return { success: false, assigned: 0, error: "No clients selected" };
      }
      if (!teamMemberId) {
        return { success: false, assigned: 0, error: "Staff member required" };
      }

      let assigned = 0;
      for (const clientId of clientIds) {
        const row = await this.repository.upsertClientAssignment(
          clientId,
          teamMemberId,
          role
        );
        if (row) assigned += 1;
      }

      return { success: assigned > 0, assigned };
    } catch (error) {
      console.error("Service error bulk assigning:", error);
      return { success: false, assigned: 0, error: "Bulk assignment failed" };
    }
  }

  async clearAssignments(
    clientIds: number[]
  ): Promise<{ success: boolean; cleared: number }> {
    const cleared = await this.repository.clearClientAssignments(clientIds);
    return { success: true, cleared };
  }

  async getOwnershipForClients(clientIds: number[]) {
    return this.repository.getOwnershipForClients(clientIds);
  }

  async getClientTeamMembers(clientId: number): Promise<TeamAssignment[]> {
    return await this.repository.getClientTeamMembers(clientId);
  }

  async getClientFocalPerson(clientId: number): Promise<TeamAssignment | null> {
    return await this.repository.getClientFocalPerson(clientId);
  }

  // ==================== Workload Management ====================

  async getTeamWorkloadOverview(): Promise<TeamMemberWorkload[]> {
    return await this.repository.getTeamWorkloadOverview();
  }

  async getAvailableTeamMembers(skill?: string): Promise<{
    teamMemberId: number;
    teamMemberName: string;
    currentWorkload: number;
    maxCapacity: number;
    skills: string[];
    specializations: string[];
  }[]> {
    return await this.repository.getAvailableTeamMembers(skill);
  }

  // ==================== Performance Analytics ====================

  async getTeamPerformanceMetrics(teamMemberId?: number): Promise<TeamPerformance[]> {
    return await this.repository.getTeamPerformanceMetrics(teamMemberId);
  }

  // ==================== AI-Optimized Routing ====================

  /**
   * Calculate optimal team assignment based on multiple factors
   */
  async calculateOptimalAssignment(
    clientId: number,
    problemData: {
      category?: string;
      severity?: string;
      estimatedDuration?: number;
    }
  ): Promise<{
    recommendedTeamMemberId?: number;
    confidence: number;
    factors: {
      workloadBalance: number;
      skillMatch: number;
      clientRelationship: number;
      availability: number;
    };
  }> {
    try {
      const availableMembers = await this.repository.getAvailableTeamMembers(problemData.category);
      const clientAssignments = await this.repository.getClientTeamMembers(clientId);

      let bestMemberId: number | undefined;
      let bestScore = 0;
      let bestFactors = {
        workloadBalance: 0,
        skillMatch: 0,
        clientRelationship: 0,
        availability: 0
      };

      for (const member of availableMembers) {
        const factors = {
          workloadBalance: 0,
          skillMatch: 0,
          clientRelationship: 0,
          availability: 0
        };

        // Workload balance factor (40% weight)
        factors.workloadBalance = Math.max(0, 100 - member.utilizationRate) * 0.4;

        // Skill match factor (30% weight)
        if (member.skills && Array.isArray(member.skills)) {
          const hasSkill = member.skills.some((skill: string) =>
            problemData.category && skill.toLowerCase().includes(problemData.category.toLowerCase())
          );
          factors.skillMatch = hasSkill ? 30 : 0;
        }

        // Client relationship factor (20% weight)
        const existingAssignment = clientAssignments.find(a => a.teamMemberId === member.teamMemberId);
        factors.clientRelationship = existingAssignment ? 20 : 0;

        // Availability factor (10% weight)
        factors.availability = member.currentWorkload < member.maxCapacity ? 10 : 0;

        const totalScore = Object.values(factors).reduce((sum, val) => sum + val, 0);

        if (totalScore > bestScore) {
          bestScore = totalScore;
          bestMemberId = member.teamMemberId;
          bestFactors = factors;
        }
      }

      return {
        recommendedTeamMemberId: bestMemberId,
        confidence: bestScore / 100,
        factors: bestFactors
      };
    } catch (error) {
      console.error("Service error calculating optimal assignment:", error);
      return {
        confidence: 0,
        factors: {
          workloadBalance: 0,
          skillMatch: 0,
          clientRelationship: 0,
          availability: 0
        }
      };
    }
  }

  /**
   * Predict team member availability based on current workload
   */
  async predictAvailability(teamMemberId: number, daysAhead: number = 7): Promise<{
    availableSlots: number;
    utilizationForecast: number;
    recommendation: string;
  }> {
    try {
      const memberAssignments = await this.repository.getTeamMemberAssignments(teamMemberId);
      const activeMember = memberAssignments.find(a => a.isActive);

      if (!activeMember) {
        return {
          availableSlots: 0,
          utilizationForecast: 0,
          recommendation: "Team member not found or inactive"
        };
      }

      const currentWorkload = activeMember.workload || 0;
      const maxCapacity = 5; // Default capacity

      // Simple prediction: assume current workload persists
      const utilizationForecast = (currentWorkload / maxCapacity) * 100;
      const availableSlots = Math.max(0, maxCapacity - currentWorkload);

      let recommendation = "Available for new assignments";
      if (utilizationForecast > 80) {
        recommendation = "At capacity - consider reassignment";
      } else if (utilizationForecast > 60) {
        recommendation = "Approaching capacity - monitor closely";
      }

      return {
        availableSlots,
        utilizationForecast,
        recommendation
      };
    } catch (error) {
      console.error("Service error predicting availability:", error);
      return {
        availableSlots: 0,
        utilizationForecast: 0,
        recommendation: "Unable to predict availability"
      };
    }
  }
}

export const teamManagementService = new TeamManagementService();