/**
 * 🎯 PROBLEM TRACKING REPOSITORY
 * Database operations for next-generation problem tracking
 */

import { db } from "@/db";
import { problems, clients, employees } from "@/db/schema";
import { eq, desc, and, or, sql, gte, lte, inArray } from "drizzle-orm";

export type Problem = typeof problems.$inferSelect;
export type NewProblem = typeof problems.$inferInsert;

/**
 * Get all problems with optional filters
 */
export async function getProblems(filters: {
  clientId?: number;
  status?: string;
  severity?: string;
  assignedTo?: number;
  limit?: number;
  offset?: number;
} = {}): Promise<Problem[]> {
  try {
    const { clientId, status, severity, assignedTo, limit = 100, offset = 0 } = filters;

    const conditions = [];
    if (clientId) conditions.push(eq(problems.clientId, clientId));
    if (status) conditions.push(eq(problems.status, status));
    if (severity) conditions.push(eq(problems.severity, severity));
    if (assignedTo) conditions.push(eq(problems.assignedTo, assignedTo));

    const result = await db
      .select({
        ...problems,
        clientName: clients.name,
        assignedToName: sql<string>`COALESCE(${employees.designation}, 'Unassigned')`,
      })
      .from(problems)
      .leftJoin(clients, eq(problems.clientId, clients.id))
      .leftJoin(employees, eq(problems.assignedTo, employees.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(problems.createdAt))
      .limit(limit)
      .offset(offset);

    return result as Problem[];
  } catch (error) {
    console.error("Error fetching problems:", error);
    return [];
  }
}

/**
 * Get problem by ID
 */
export async function getProblemById(id: number): Promise<Problem | null> {
  try {
    const result = await db
      .select()
      .from(problems)
      .where(eq(problems.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching problem by ID:", error);
    return null;
  }
}

/**
 * Get client problem history
 */
export async function getClientProblems(clientId: number, limit: number = 50): Promise<Problem[]> {
  try {
    return await db
      .select()
      .from(problems)
      .where(eq(problems.clientId, clientId))
      .orderBy(desc(problems.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("Error fetching client problems:", error);
    return [];
  }
}

/**
 * Get team member's active problems
 */
export async function getTeamMemberProblems(teamMemberId: number): Promise<Problem[]> {
  try {
    return await db
      .select()
      .from(problems)
      .where(and(eq(problems.assignedTo, teamMemberId), sql`${problems.status} != 'closed'`))
      .orderBy(desc(problems.severity));
  } catch (error) {
    console.error("Error fetching team member problems:", error);
    return [];
  }
}

/**
 * Get problems by severity
 */
export async function getProblemsBySeverity(severity: string): Promise<Problem[]> {
  try {
    return await db
      .select()
      .from(problems)
      .where(and(eq(problems.severity, severity), sql`${problems.status} != 'closed'`))
      .orderBy(desc(problems.createdAt));
  } catch (error) {
    console.error("Error fetching problems by severity:", error);
    return [];
  }
}

/**
 * Get problem statistics
 */
export async function getProblemStatistics(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  averageResolutionTime: number;
  openProblems: number;
}> {
  try {
    const total = await db.select({ count: sql<number>`count(*)` }).from(problems);

    const byStatusResult = await db
      .select({ status: problems.status, count: sql<number>`count(*)` })
      .from(problems)
      .groupBy(problems.status);

    const bySeverityResult = await db
      .select({ severity: problems.severity, count: sql<number>`count(*)` })
      .from(problems)
      .groupBy(problems.severity);

    const avgResolutionResult = await db
      .select({ avg: sql<number>`AVG(resolution_time)` })
      .from(problems)
      .where(sql`${problems.resolutionTime} IS NOT NULL`);

    const openProblemsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(problems)
      .where(sql`${problems.status} != 'closed'`);

    const byStatus: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    byStatusResult.forEach(item => {
      byStatus[item.status] = item.count;
    });

    bySeverityResult.forEach(item => {
      bySeverity[item.severity] = item.count;
    });

    return {
      total: total[0]?.count || 0,
      byStatus,
      bySeverity,
      averageResolutionTime: Math.round(avgResolutionResult[0]?.avg || 0),
      openProblems: openProblemsResult[0]?.count || 0
    };
  } catch (error) {
    console.error("Error fetching problem statistics:", error);
    return {
      total: 0,
      byStatus: {},
      bySeverity: {},
      averageResolutionTime: 0,
      openProblems: 0
    };
  }
}

/**
 * Create new problem
 */
export async function createProblem(data: NewProblem): Promise<Problem | null> {
  try {
    const result = await db.insert(problems).values(data).returning();
    return result[0] || null;
  } catch (error) {
    console.error("Error creating problem:", error);
    return null;
  }
}

/**
 * Update problem
 */
export async function updateProblem(id: number, data: Partial<NewProblem>): Promise<Problem | null> {
  try {
    const result = await db
      .update(problems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(problems.id, id))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error("Error updating problem:", error);
    return null;
  }
}

/**
 * Resolve problem
 */
export async function resolveProblem(
  id: number,
  resolutionData: {
    rootCause: string;
    preventionMeasures: string;
    lessonsLearned: string;
    resolutionTime: number;
    resolvedById: number;
  }
): Promise<Problem | null> {
  try {
    const result = await db
      .update(problems)
      .set({
        status: 'resolved',
        resolvedAt: new Date(),
        updatedAt: new Date(),
        ...resolutionData
      })
      .where(eq(problems.id, id))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error("Error resolving problem:", error);
    return null;
  }
}

/**
 * Delete problem
 */
export async function deleteProblem(id: number): Promise<boolean> {
  try {
    await db.delete(problems).where(eq(problems.id, id));
    return true;
  } catch (error) {
    console.error("Error deleting problem:", error);
    return false;
  }
}

/**
 * Get critical problems requiring immediate attention
 */
export async function getCriticalProblems(): Promise<Problem[]> {
  try {
    return await db
      .select()
      .from(problems)
      .where(and(
        eq(problems.severity, 'critical'),
        sql`${problems.status} != 'closed'`
      ))
      .orderBy(desc(problems.createdAt))
      .limit(20);
  } catch (error) {
    console.error("Error fetching critical problems:", error);
    return [];
  }
}

/**
 * Get problems requiring follow-up
 */
export async function getProblemsRequiringFollowUp(): Promise<Problem[]> {
  try {
    return await db
      .select()
      .from(problems)
      .where(and(
        sql`${problems.status} != 'closed'`,
        sql`${problems.updatedAt} < NOW() - INTERVAL '7 days'`
      ))
      .orderBy(desc(problems.updatedAt))
      .limit(50);
  } catch (error) {
    console.error("Error fetching problems requiring follow-up:", error);
    return [];
  }
}