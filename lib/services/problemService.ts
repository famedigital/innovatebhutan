/**
 * 🎯 PROBLEM TRACKING SERVICE
 * Business logic for next-generation problem tracking
 */

import * as repo from "@/lib/repositories/problemRepository";
import type { Problem, NewProblem } from "@/lib/repositories/problemRepository";

export type ProblemStatus = "new" | "in-progress" | "resolved" | "prevention" | "closed";
export type ProblemSeverity = "low" | "medium" | "high" | "critical";

export interface CreateProblemDTO {
  title: string;
  description: string;
  severity: ProblemSeverity;
  category?: string;
  clientId?: number;
  assignedTo?: number;
}

export interface UpdateProblemDTO {
  title?: string;
  description?: string;
  severity?: ProblemSeverity;
  category?: string;
  status?: ProblemStatus;
  assignedTo?: number;
  clientId?: number;
}

export interface ResolveProblemDTO {
  rootCause: string;
  preventionMeasures: string;
  lessonsLearned: string;
  resolutionTime: number;
  resolvedById: number;
}

/**
 * Problem Service Class
 */
export class ProblemService {
  private repository = repo;

  // ==================== Problem CRUD ====================

  async createProblem(data: CreateProblemDTO, createdById?: number): Promise<{
    success: boolean;
    data?: Problem;
    error?: string;
  }> {
    try {
      // Validate required fields
      if (!data.title?.trim()) {
        return { success: false, error: "Problem title is required" };
      }
      if (!data.description?.trim()) {
        return { success: false, error: "Problem description is required" };
      }

      // Auto-assign to available team member if not specified
      let assignedTo = data.assignedTo;
      if (!assignedTo && data.clientId) {
        // Could implement auto-assignment logic here
        assignedTo = undefined;
      }

      const newProblem: NewProblem = {
        title: data.title.trim(),
        description: data.description.trim(),
        severity: data.severity,
        category: data.category,
        clientId: data.clientId,
        assignedTo: assignedTo,
        status: 'new',
        createdById: createdById
      };

      const result = await this.repository.createProblem(newProblem);

      if (!result) {
        return { success: false, error: "Failed to create problem" };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error("Service error creating problem:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  async updateProblem(id: number, data: UpdateProblemDTO): Promise<{
    success: boolean;
    data?: Problem;
    error?: string;
  }> {
    try {
      // Check if problem exists
      const existing = await this.repository.getProblemById(id);
      if (!existing) {
        return { success: false, error: "Problem not found" };
      }

      // Validate status transitions
      if (data.status && existing.status === 'closed') {
        return { success: false, error: "Cannot modify closed problem" };
      }

      const result = await this.repository.updateProblem(id, data);

      if (!result) {
        return { success: false, error: "Failed to update problem" };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error("Service error updating problem:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  async resolveProblem(id: number, resolutionData: ResolveProblemDTO): Promise<{
    success: boolean;
    data?: Problem;
    error?: string;
  }> {
    try {
      const existing = await this.repository.getProblemById(id);
      if (!existing) {
        return { success: false, error: "Problem not found" };
      }

      if (existing.status === 'closed' || existing.status === 'resolved') {
        return { success: false, error: "Problem is already resolved" };
      }

      // Update resolution time tracking
      const createdTime = existing.createdAt ? new Date(existing.createdAt).getTime() : Date.now();
      const resolutionTime = resolutionData.resolutionTime || Math.round((Date.now() - createdTime) / (1000 * 60));

      const result = await this.repository.resolveProblem(id, {
        ...resolutionData,
        resolutionTime
      });

      if (!result) {
        return { success: false, error: "Failed to resolve problem" };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error("Service error resolving problem:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  async deleteProblem(id: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const existing = await this.repository.getProblemById(id);
      if (!existing) {
        return { success: false, error: "Problem not found" };
      }

      // Don't allow deletion of critical or high severity problems
      if (existing.severity === 'critical' || existing.severity === 'high') {
        return { success: false, error: "Cannot delete critical or high severity problems" };
      }

      const success = await this.repository.deleteProblem(id);

      if (!success) {
        return { success: false, error: "Failed to delete problem" };
      }

      return { success: true };
    } catch (error) {
      console.error("Service error deleting problem:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  }

  // ==================== Problem Queries ====================

  async getProblems(filters?: Parameters<typeof repo.getProblems>[0]): Promise<Problem[]> {
    return await this.repository.getProblems(filters);
  }

  async getProblemById(id: number): Promise<Problem | null> {
    return await this.repository.getProblemById(id);
  }

  async getClientProblems(clientId: number): Promise<Problem[]> {
    return await this.repository.getClientProblems(clientId);
  }

  async getCriticalProblems(): Promise<Problem[]> {
    return await this.repository.getCriticalProblems();
  }

  async getProblemsRequiringFollowUp(): Promise<Problem[]> {
    return await this.repository.getProblemsRequiringFollowUp();
  }

  // ==================== Analytics ====================

  async getProblemStatistics(): Promise<ReturnType<typeof repo.getProblemStatistics>> {
    return await this.repository.getProblemStatistics();
  }

  async getTeamMemberProblems(teamMemberId: number): Promise<Problem[]> {
    return await this.repository.getTeamMemberProblems(teamMemberId);
  }

  // ==================== AI Features ====================

  /**
   * Categorize problem using AI-like logic
   * This can be enhanced with actual ML later
   */
  async categorizeProblem(description: string): Promise<{
    suggestedCategory: string;
    suggestedSeverity: ProblemSeverity;
    confidence: number;
  }> {
    const desc = description.toLowerCase();

    // Simple keyword-based categorization
    if (desc.includes('network') || desc.includes('connection') || desc.includes('internet')) {
      return {
        suggestedCategory: 'networking',
        suggestedSeverity: desc.includes('down') || desc.includes('critical') ? 'critical' : 'high',
        confidence: 0.7
      };
    }

    if (desc.includes('cctv') || desc.includes('camera') || desc.includes('security')) {
      return {
        suggestedCategory: 'security',
        suggestedSeverity: desc.includes('not working') ? 'high' : 'medium',
        confidence: 0.75
      };
    }

    if (desc.includes('pos') || desc.includes('payment') || desc.includes('billing')) {
      return {
        suggestedCategory: 'pos-systems',
        suggestedSeverity: desc.includes('not working') ? 'critical' : 'high',
        confidence: 0.8
      };
    }

    return {
      suggestedCategory: 'general',
      suggestedSeverity: 'medium',
      confidence: 0.5
    };
  }

  /**
   * Suggest resolution based on problem category
   */
  async suggestResolution(problem: Problem): Promise<string> {
    const category = problem.category?.toLowerCase() || '';

    if (category.includes('network')) {
      return "1. Check network connectivity\\n2. Restart router/modem\\n3. Check with ISP\\n4. Update network drivers\\n5. Escalate to network specialist";
    }

    if (category.includes('security') || category.includes('cctv')) {
      return "1. Check power supply to cameras\\n2. Verify network connection to DVR\\n3. Check camera settings and configuration\\n4. Test camera functionality\\n5. Contact vendor if hardware issue";
    }

    if (category.includes('pos')) {
      return "1. Restart POS system\\n2. Check internet connectivity\\n3. Verify payment gateway status\\n4. Check for software updates\\n5. Contact technical support";
    }

    return "1. Gather more information about the issue\\n2. Check system logs\\n3. Try basic troubleshooting\\n4. Escalate to specialist if needed\\n5. Document solution for knowledge base";
  }
}

// Export singleton instance
export const problemService = new ProblemService();