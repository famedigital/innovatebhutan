/**
 * 📞 COMMUNICATION REPOSITORY
 * Database operations for unified client communication timeline
 */

import { db } from "@/db";
import { clientCommunications, clients, employees, problems } from "@/db/schema";
import { eq, desc, and, or, sql, gte, lte } from "drizzle-orm";

export type Communication = typeof clientCommunications.$inferSelect;
export type NewCommunication = typeof clientCommunications.$inferInsert;

/**
 * Get client communication timeline
 */
export async function getClientCommunications(
  clientId: number,
  limit: number = 100
): Promise<Communication[]> {
  try {
    return await db
      .select()
      .from(clientCommunications)
      .where(eq(clientCommunications.clientId, clientId))
      .orderBy(desc(clientCommunications.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("Error fetching client communications:", error);
    return [];
  }
}

/**
 * Get communications by type
 */
export async function getCommunicationsByType(
  type: string,
  limit: number = 50
): Promise<Communication[]> {
  try {
    return await db
      .select()
      .from(clientCommunications)
      .where(eq(clientCommunications.type, type))
      .orderBy(desc(clientCommunications.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("Error fetching communications by type:", error);
    return [];
  }
}

/**
 * Get scheduled communications requiring follow-up
 */
export async function getScheduledCommunications(): Promise<Communication[]> {
  try {
    return await db
      .select()
      .from(clientCommunications)
      .where(and(
        eq(clientCommunications.status, 'pending'),
        sql`${clientCommunications.scheduledFor} <= NOW()`
      ))
      .orderBy(clientCommunications.scheduledFor);
  } catch (error) {
    console.error("Error fetching scheduled communications:", error);
    return [];
  }
}

/**
 * Get communications requiring follow-up
 */
export async function getCommunicationsRequiringFollowUp(): Promise<Communication[]> {
  try {
    return await db
      .select()
      .from(clientCommunications)
      .where(and(
        eq(clientCommunications.requiresFollowUp, true),
        sql`${clientCommunications.status} != 'completed'`
      ))
      .orderBy(desc(clientCommunications.createdAt))
      .limit(50);
  } catch (error) {
    console.error("Error fetching communications requiring follow-up:", error);
    return [];
  }
}

/**
 * Get problem-related communications
 */
export async function getProblemCommunications(problemId: number): Promise<Communication[]> {
  try {
    return await db
      .select()
      .from(clientCommunications)
      .where(eq(clientCommunications.problemId, problemId))
      .orderBy(desc(clientCommunications.createdAt));
  } catch (error) {
    console.error("Error fetching problem communications:", error);
    return [];
  }
}

/**
 * Get focal person's communications
 */
export async function getFocalPersonCommunications(
  focalPersonId: number,
  limit: number = 100
): Promise<Communication[]> {
  try {
    return await db
      .select()
      .from(clientCommunications)
      .where(eq(clientCommunications.focalPersonId, focalPersonId))
      .orderBy(desc(clientCommunications.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("Error fetching focal person communications:", error);
    return [];
  }
}

/**
 * Create new communication
 */
export async function createCommunication(data: NewCommunication): Promise<Communication | null> {
  try {
    const result = await db.insert(clientCommunications).values(data).returning();
    return result[0] || null;
  } catch (error) {
    console.error("Error creating communication:", error);
    return null;
  }
}

/**
 * Update communication
 */
export async function updateCommunication(
  id: number,
  data: Partial<NewCommunication>
): Promise<Communication | null> {
  try {
    const result = await db
      .update(clientCommunications)
      .set(data)
      .where(eq(clientCommunications.id, id))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error("Error updating communication:", error);
    return null;
  }
}

/**
 * Complete communication
 */
export async function completeCommunication(
  id: number,
  outcome: string,
  nextAction?: string
): Promise<Communication | null> {
  try {
    const result = await db
      .update(clientCommunications)
      .set({
        status: 'completed',
        completedAt: new Date(),
        outcome,
        nextAction
      })
      .where(eq(clientCommunications.id, id))
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error("Error completing communication:", error);
    return null;
  }
}

/**
 * Get communication statistics
 */
export async function getCommunicationStatistics(): Promise<{
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  pendingFollowUp: number;
  averageResponseTime: number;
}> {
  try {
    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(clientCommunications);

    const byTypeResult = await db
      .select({ type: clientCommunications.type, count: sql<number>`count(*)` })
      .from(clientCommunications)
      .groupBy(clientCommunications.type);

    const byStatusResult = await db
      .select({ status: clientCommunications.status, count: sql<number>`count(*)` })
      .from(clientCommunications)
      .groupBy(clientCommunications.status);

    const pendingFollowUpResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(clientCommunications)
      .where(eq(clientCommunications.requiresFollowUp, true));

    const byType: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    byTypeResult.forEach(item => {
      byType[item.type] = item.count;
    });

    byStatusResult.forEach(item => {
      byStatus[item.status] = item.count;
    });

    return {
      total: totalResult[0]?.count || 0,
      byType,
      byStatus,
      pendingFollowUp: pendingFollowUpResult[0]?.count || 0,
      averageResponseTime: 0 // Can be calculated from completion times
    };
  } catch (error) {
    console.error("Error fetching communication statistics:", error);
    return {
      total: 0,
      byType: {},
      byStatus: {},
      pendingFollowUp: 0,
      averageResponseTime: 0
    };
  }
}

/**
 * Delete communication
 */
export async function deleteCommunication(id: number): Promise<boolean> {
  try {
    await db.delete(clientCommunications).where(eq(clientCommunications.id, id));
    return true;
  } catch (error) {
    console.error("Error deleting communication:", error);
    return false;
  }
}