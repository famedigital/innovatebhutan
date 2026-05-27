/**
 * 👥 TEAM ASSIGNMENT REPOSITORY
 * Database operations for client-to-team mapping and workload management
 */

import { db } from "@/db";
import { teamAssignments, clients, employees, problems } from "@/db/schema";
import { eq, desc, and, or, sql, gte, lte } from "drizzle-orm";

export type TeamAssignment = typeof teamAssignments.$inferSelect;
export type NewTeamAssignment = typeof teamAssignments.$inferInsert;

/**
 * Get all team assignments with optional filters
 */
export async function getTeamAssignments(filters: {
  clientId?: number;
  teamMemberId?: number;
  isActive?: boolean;
  isFocalPerson?: boolean;
} = {}): Promise<TeamAssignment[]> {
  try {
    const { clientId, teamMemberId, isActive, isFocalPerson } = filters;

    const conditions = [];
    if (clientId !== undefined) conditions.push(eq(teamAssignments.clientId, clientId));
    if (teamMemberId !== undefined) conditions.push(eq(teamAssignments.teamMemberId, teamMemberId));
    if (isActive !== undefined) conditions.push(eq(teamAssignments.isActive, isActive));
    if (isFocalPerson !== undefined) conditions.push(eq(teamAssignments.isFocalPerson, isFocalPerson));

    return await db
      .select()
      .from(teamAssignments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(teamAssignments.validFrom));
  } catch (error) {
    console.error("Error fetching team assignments:", error);
    return [];
  }
}

/**
 * Get client team members
 */
export async function getClientTeamMembers(clientId: number): Promise<TeamAssignment[]> {
  try {
    return await db
      .select()
      .from(teamAssignments)
      .where(and(eq(teamAssignments.clientId, clientId), eq(teamAssignments.isActive, true)))
      .orderBy(teamAssignments.isFocalPerson ? desc(teamAssignments.isFocalPerson) : teamAssignments.validFrom);
  } catch (error) {
    console.error("Error fetching client team members:", error);
    return [];
  }
}

/**
 * Get client focal person
 */
export async function getClientFocalPerson(clientId: number): Promise<TeamAssignment | null> {
  try {
    const result = await db
      .select()
      .from(teamAssignments)
      .where(and(
        eq(teamAssignments.clientId, clientId),
        eq(teamAssignments.isFocalPerson, true),
        eq(teamAssignments.isActive, true)
      ))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching client focal person:", error);
    return null;
  }
}

/**
 * Get team member's assignments
 */
export async function getTeamMemberAssignments(teamMemberId: number): Promise<TeamAssignment[]> {
  try {
    return await db
      .select()
      .from(teamAssignments)
      .where(and(eq(teamAssignments.teamMemberId, teamMemberId), eq(teamAssignments.isActive, true)))
      .orderBy(desc(teamAssignments.validFrom));
  } catch (error) {
    console.error("Error fetching team member assignments:", error);
    return [];
  }
}

/**
 * Get team workload overview
 */
export async function getTeamWorkloadOverview(): Promise<Array<{
  teamMemberId: number;
  teamMemberName: string;
  currentWorkload: number;
  maxCapacity: number;
  utilizationRate: number;
}>> {
  try {
    const result = await db
      .select({
        teamMemberId: employees.id,
        teamMemberName: sql<string>`COALESCE(${employees.designation}, 'Team Member')`,
        currentWorkload: employees.currentWorkload,
        maxCapacity: employees.maxConcurrentProblems,
      })
      .from(employees)
      .where(eq(employees.status, 'active'));

    return result.map(member => ({
      ...member,
      utilizationRate: member.currentWorkload > 0
        ? Math.round((member.currentWorkload / member.maxCapacity) * 100)
        : 0
    }));
  } catch (error) {
    console.error("Error fetching team workload overview:", error);
    return [];
  }
}

/**
 * Get available team members for assignment
 */
export async function getAvailableTeamMembers(skill?: string): Promise<Array<{
  teamMemberId: number;
  teamMemberName: string;
  currentWorkload: number;
  maxCapacity: number;
  skills: string[];
  specializations: string[];
}>> {
  try {
    let query = db
      .select({
        teamMemberId: employees.id,
        teamMemberName: sql<string>`COALESCE(${employees.designation}, 'Team Member')`,
        currentWorkload: employees.currentWorkload,
        maxCapacity: employees.maxConcurrentProblems,
        skills: employees.skills,
        specializations: employees.specializations,
      })
      .from(employees)
      .where(and(
        eq(employees.status, 'active'),
        eq(employees.availability, 'available'),
        sql`${employees.currentWorkload} < ${employees.maxConcurrentProblems}`
      ));

    // Add skill filter if provided
    if (skill) {
      query = query.where(sql`${employees.skills} @> ${JSON.stringify([skill])}`);
    }

    return await query.order(employees.currentWorkload);
  } catch (error) {
    console.error("Error fetching available team members:", error);
    return [];
  }
}

/**
 * Create team assignment
 */
export async function createTeamAssignment(data: NewTeamAssignment): Promise<TeamAssignment | null> {
  try {
    const result = await db.insert(teamAssignments).values(data).returning();
    return result[0] || null;
  } catch (error) {
    console.error("Error creating team assignment:", error);
    return null;
  }
}

/**
 * Update team assignment
 */
export async function updateTeamAssignment(
  id: number,
  data: Partial<NewTeamAssignment>
): Promise<TeamAssignment | null> {
  try {
    const result = await db
      .update(teamAssignments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(teamAssignments.id, id))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error("Error updating team assignment:", error);
    return null;
  }
}

/**
 * Set focal person for client
 */
export async function setFocalPerson(
  clientId: number,
  teamMemberId: number
): Promise<boolean> {
  try {
    // Remove existing focal person
    await db
      .update(teamAssignments)
      .set({ isFocalPerson: false, updatedAt: new Date() })
      .where(and(
        eq(teamAssignments.clientId, clientId),
        eq(teamAssignments.isFocalPerson, true)
      ));

    // Set new focal person
    await db
      .update(teamAssignments)
      .set({ isFocalPerson: true, updatedAt: new Date() })
      .where(and(
        eq(teamAssignments.clientId, clientId),
        eq(teamAssignments.teamMemberId, teamMemberId)
      ));

    return true;
  } catch (error) {
    console.error("Error setting focal person:", error);
    return false;
  }
}

/**
 * Delete team assignment
 */
export async function deleteTeamAssignment(id: number): Promise<boolean> {
  try {
    await db.delete(teamAssignments).where(eq(teamAssignments.id, id));
    return true;
  } catch (error) {
    console.error("Error deleting team assignment:", error);
    return false;
  }
}

/**
 * Get team performance metrics
 */
export async function getTeamPerformanceMetrics(teamMemberId?: number): Promise<{
  totalProblems: number;
  averageResolutionTime: number;
  clientSatisfaction: number;
  utilizationRate: number;
}[]> {
  try {
    const teamMembers = teamMemberId
      ? [teamMemberId]
      : (await db.select({ id: employees.id }).from(employees).where(eq(employees.status, 'active'))).map(e => e.id);

    const metrics = await Promise.all(
      teamMembers.map(async (id) => {
        const problemsSolved = await db
          .select({ count: sql<number>`count(*)`, avgTime: sql<number>`AVG(resolution_time)` })
          .from(problems)
          .where(and(
            eq(problems.assignedTo, id),
            eq(problems.status, 'resolved')
          ));

        const member = await db
          .select({
            currentWorkload: employees.currentWorkload,
            maxCapacity: employees.maxConcurrentProblems,
            satisfactionScore: employees.clientSatisfactionScore
          })
          .from(employees)
          .where(eq(employees.id, id))
          .limit(1);

        return {
          totalProblems: problemsSolved[0]?.count || 0,
          averageResolutionTime: Math.round(problemsSolved[0]?.avgTime || 0),
          clientSatisfaction: member[0]?.satisfactionScore || 80,
          utilizationRate: member[0]
            ? Math.round((member[0].currentWorkload / member[0].maxCapacity) * 100)
            : 0
        };
      })
    );

    return metrics;
  } catch (error) {
    console.error("Error fetching team performance metrics:", error);
    return [];
  }
}