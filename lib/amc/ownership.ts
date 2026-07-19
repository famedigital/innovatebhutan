import { db } from "@/db";
import { employees, clientWhatsappGroups, teamAssignments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  createTeamAssignment,
  getTeamAssignments,
  setFocalPerson,
} from "@/lib/repositories/teamAssignmentRepository";

/** Resolve employees.id from profiles.id */
export async function getEmployeeIdByProfileId(
  profileId: number
): Promise<number | null> {
  const [row] = await db
    .select({ id: employees.id })
    .from(employees)
    .where(eq(employees.profileId, profileId))
    .limit(1);
  return row?.id ?? null;
}

/**
 * Claim client as focal person and sync WhatsApp group focal.
 */
export async function claimClientOwnership(
  clientId: number,
  employeeId: number
): Promise<void> {
  const existing = await getTeamAssignments({
    clientId,
    teamMemberId: employeeId,
    isActive: true,
  });

  if (existing.length === 0) {
    await createTeamAssignment({
      clientId,
      teamMemberId: employeeId,
      role: "focal-person",
      isFocalPerson: true,
      isActive: true,
    });
  } else {
    await setFocalPerson(clientId, employeeId);
  }

  await db
    .update(clientWhatsappGroups)
    .set({ focalPersonId: employeeId, updatedAt: new Date() })
    .where(eq(clientWhatsappGroups.clientId, clientId));
}

export async function getClientFocalEmployeeId(
  clientId: number
): Promise<number | null> {
  const [row] = await db
    .select({ teamMemberId: teamAssignments.teamMemberId })
    .from(teamAssignments)
    .where(
      and(
        eq(teamAssignments.clientId, clientId),
        eq(teamAssignments.isFocalPerson, true),
        eq(teamAssignments.isActive, true)
      )
    )
    .limit(1);
  return row?.teamMemberId ?? null;
}
