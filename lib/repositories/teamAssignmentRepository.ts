/**
 * 👥 TEAM ASSIGNMENT REPOSITORY
 * Database operations for client-to-team mapping and workload management
 */

import { db } from "@/db";
import { teamAssignments, employees, problems, profiles } from "@/db/schema";
import { eq, desc, and, sql, inArray } from "drizzle-orm";

export type TeamAssignment = typeof teamAssignments.$inferSelect;
export type NewTeamAssignment = typeof teamAssignments.$inferInsert;

export type AssignmentRole = "focal-person" | "backup-team-member" | "specialist";

export type ClientOwnershipSummary = {
  clientId: number;
  focal?: { employeeId: number; name: string };
  backups: Array<{ employeeId: number; name: string }>;
};

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
        teamMemberName: sql<string>`COALESCE(${profiles.fullName}, ${employees.designation}, ${employees.email}, 'Staff')`,
        currentWorkload: employees.currentWorkload,
        maxCapacity: employees.maxConcurrentProblems,
      })
      .from(employees)
      .leftJoin(profiles, eq(employees.profileId, profiles.id))
      .where(eq(employees.status, "active"));

    return result.map((member) => ({
      teamMemberId: member.teamMemberId,
      teamMemberName: member.teamMemberName || "Staff",
      currentWorkload: member.currentWorkload ?? 0,
      maxCapacity: member.maxCapacity ?? 5,
      utilizationRate:
        (member.currentWorkload ?? 0) > 0
          ? Math.round(
              ((member.currentWorkload ?? 0) / (member.maxCapacity || 1)) * 100
            )
          : 0,
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
    const conditions = [eq(employees.status, "active")];
    if (skill) {
      conditions.push(sql`${employees.skills} @> ${JSON.stringify([skill])}`);
    }

    const rows = await db
      .select({
        teamMemberId: employees.id,
        teamMemberName: sql<string>`COALESCE(${profiles.fullName}, ${employees.designation}, ${employees.email}, 'Staff')`,
        currentWorkload: employees.currentWorkload,
        maxCapacity: employees.maxConcurrentProblems,
        skills: employees.skills,
        specializations: employees.specializations,
      })
      .from(employees)
      .leftJoin(profiles, eq(employees.profileId, profiles.id))
      .where(and(...conditions))
      .orderBy(employees.currentWorkload);

    return rows.map((r) => ({
      teamMemberId: r.teamMemberId,
      teamMemberName: r.teamMemberName || "Staff",
      currentWorkload: r.currentWorkload ?? 0,
      maxCapacity: r.maxCapacity ?? 5,
      skills: (r.skills as string[]) || [],
      specializations: (r.specializations as string[]) || [],
    }));
  } catch (error) {
    console.error("Error fetching available team members:", error);
    return [];
  }
}

/**
 * Ownership summary for many clients (focal + backups with names)
 */
export async function getOwnershipForClients(
  clientIds: number[]
): Promise<ClientOwnershipSummary[]> {
  if (clientIds.length === 0) return [];

  try {
    const rows = await db
      .select({
        clientId: teamAssignments.clientId,
        teamMemberId: teamAssignments.teamMemberId,
        role: teamAssignments.role,
        isFocalPerson: teamAssignments.isFocalPerson,
        isPrimaryBackup: teamAssignments.isPrimaryBackup,
        name: sql<string>`COALESCE(${profiles.fullName}, ${employees.designation}, ${employees.email}, 'Staff')`,
      })
      .from(teamAssignments)
      .innerJoin(employees, eq(teamAssignments.teamMemberId, employees.id))
      .leftJoin(profiles, eq(employees.profileId, profiles.id))
      .where(
        and(
          inArray(teamAssignments.clientId, clientIds),
          eq(teamAssignments.isActive, true)
        )
      );

    const map = new Map<number, ClientOwnershipSummary>();
    for (const id of clientIds) {
      map.set(id, { clientId: id, backups: [] });
    }

    for (const row of rows) {
      const entry = map.get(row.clientId)!;
      const person = { employeeId: row.teamMemberId, name: row.name || "Staff" };
      if (row.isFocalPerson || row.role === "focal-person") {
        entry.focal = person;
      } else if (
        row.isPrimaryBackup ||
        row.role === "backup-team-member" ||
        row.role === "specialist"
      ) {
        if (!entry.backups.some((b) => b.employeeId === person.employeeId)) {
          entry.backups.push(person);
        }
      }
    }

    return Array.from(map.values());
  } catch (error) {
    console.error("Error fetching client ownership:", error);
    return clientIds.map((clientId) => ({ clientId, backups: [] }));
  }
}

/**
 * Upsert assignment for one client; role focal-person clears other focals.
 */
export async function upsertClientAssignment(
  clientId: number,
  teamMemberId: number,
  role: AssignmentRole
): Promise<TeamAssignment | null> {
  try {
    const isFocal = role === "focal-person";
    const isBackup = role === "backup-team-member";

    if (isFocal) {
      await db
        .update(teamAssignments)
        .set({ isFocalPerson: false, updatedAt: new Date() })
        .where(
          and(
            eq(teamAssignments.clientId, clientId),
            eq(teamAssignments.isFocalPerson, true)
          )
        );
    }

    const existing = await db
      .select()
      .from(teamAssignments)
      .where(
        and(
          eq(teamAssignments.clientId, clientId),
          eq(teamAssignments.teamMemberId, teamMemberId)
        )
      )
      .limit(1);

    if (existing[0]) {
      const [updated] = await db
        .update(teamAssignments)
        .set({
          role,
          isFocalPerson: isFocal,
          isPrimaryBackup: isBackup,
          isActive: true,
          validTo: null,
          updatedAt: new Date(),
        })
        .where(eq(teamAssignments.id, existing[0].id))
        .returning();
      return updated || null;
    }

    const [created] = await db
      .insert(teamAssignments)
      .values({
        clientId,
        teamMemberId,
        role,
        isFocalPerson: isFocal,
        isPrimaryBackup: isBackup,
        isActive: true,
        workload: 1,
        performanceScore: 80,
      })
      .returning();
    return created || null;
  } catch (error) {
    console.error("Error upserting client assignment:", error);
    return null;
  }
}

/**
 * Deactivate all active assignments for clients
 */
export async function clearClientAssignments(clientIds: number[]): Promise<number> {
  if (clientIds.length === 0) return 0;
  try {
    const result = await db
      .update(teamAssignments)
      .set({ isActive: false, validTo: new Date(), updatedAt: new Date() })
      .where(
        and(
          inArray(teamAssignments.clientId, clientIds),
          eq(teamAssignments.isActive, true)
        )
      )
      .returning({ id: teamAssignments.id });
    return result.length;
  } catch (error) {
    console.error("Error clearing client assignments:", error);
    return 0;
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
 * Set focal person for client (creates assignment if missing)
 */
export async function setFocalPerson(
  clientId: number,
  teamMemberId: number
): Promise<boolean> {
  try {
    const row = await upsertClientAssignment(
      clientId,
      teamMemberId,
      "focal-person"
    );
    return !!row;
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