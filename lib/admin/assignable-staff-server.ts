import { db } from "@/db";
import { employees, profiles } from "@/db/schema";
import { and, eq, isNull, sql } from "drizzle-orm";

export type AssignableStaffRow = {
  teamMemberId: number;
  teamMemberName: string;
};

/**
 * Sync missing employee rows for STAFF/ADMIN, then list assignable staff.
 * Uses minimal columns so older DBs without optional migrations still work.
 */
export async function listAssignableStaff(): Promise<{
  data: AssignableStaffRow[];
  backfilled: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let backfilled = 0;

  try {
    const missing = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        role: profiles.role,
        userId: profiles.userId,
      })
      .from(profiles)
      .leftJoin(employees, eq(employees.profileId, profiles.id))
      .where(
        and(
          sql`UPPER(TRIM(COALESCE(${profiles.role}, ''))) IN ('STAFF', 'ADMIN', 'SUPERADMIN')`,
          isNull(employees.id)
        )
      );

    for (const profile of missing) {
      try {
        const role = String(profile.role || "").toUpperCase();
        await db.insert(employees).values({
          profileId: profile.id,
          designation:
            role === "ADMIN" || role === "SUPERADMIN"
              ? "Administrator"
              : "Staff",
          status: "active",
          authId: profile.userId || undefined,
        });
        backfilled += 1;
      } catch (insertErr) {
        // Retry without authId if unique/column issue
        try {
          const role = String(profile.role || "").toUpperCase();
          await db.insert(employees).values({
            profileId: profile.id,
            designation:
              role === "ADMIN" || role === "SUPERADMIN"
                ? "Administrator"
                : "Staff",
            status: "active",
          });
          backfilled += 1;
        } catch (retryErr) {
          const msg =
            retryErr instanceof Error ? retryErr.message : String(retryErr);
          errors.push(`profile ${profile.id}: ${msg}`);
          console.error("[assignable] insert failed", profile.id, insertErr, retryErr);
        }
      }
    }
  } catch (syncErr) {
    const msg = syncErr instanceof Error ? syncErr.message : String(syncErr);
    errors.push(`sync: ${msg}`);
    console.error("[assignable] sync failed", syncErr);
  }

  let data: AssignableStaffRow[] = [];

  try {
    const rows = await db
      .select({
        teamMemberId: employees.id,
        teamMemberName: sql<string>`COALESCE(${profiles.fullName}, ${employees.designation}, ${employees.email}, 'Staff')`,
        status: employees.status,
      })
      .from(employees)
      .leftJoin(profiles, eq(employees.profileId, profiles.id))
      .where(
        sql`COALESCE(LOWER(${employees.status}), 'active') NOT IN ('terminated', 'inactive')`
      )
      .orderBy(employees.id);

    data = rows.map((r) => ({
      teamMemberId: r.teamMemberId,
      teamMemberName: r.teamMemberName || "Staff",
    }));
  } catch (listErr) {
    console.error("[assignable] join list failed", listErr);
    try {
      const bare = await db
        .select({
          teamMemberId: employees.id,
          designation: employees.designation,
          email: employees.email,
          status: employees.status,
        })
        .from(employees);

      data = bare
        .filter(
          (e) =>
            !e.status ||
            !["terminated", "inactive"].includes(String(e.status).toLowerCase())
        )
        .map((e) => ({
          teamMemberId: e.teamMemberId,
          teamMemberName:
            e.designation || e.email || `Staff #${e.teamMemberId}`,
        }));
    } catch (bareErr) {
      const msg = bareErr instanceof Error ? bareErr.message : String(bareErr);
      errors.push(`list: ${msg}`);
      console.error("[assignable] bare list failed", bareErr);
    }
  }

  return { data, backfilled, errors };
}
