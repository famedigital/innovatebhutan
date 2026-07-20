import { db } from "@/db";
import { sql } from "drizzle-orm";
import { insertEmployeeMinimal } from "@/lib/admin/employee-insert";

export type AssignableStaffRow = {
  teamMemberId: number;
  teamMemberName: string;
};

type SqlRow = Record<string, unknown>;

async function rawQuery<T extends SqlRow>(query: ReturnType<typeof sql>) {
  const result = await db.execute(query);
  // postgres-js / drizzle may return array or { rows }
  if (Array.isArray(result)) return result as unknown as T[];
  if (result && typeof result === "object" && "rows" in result) {
    return (result as { rows: T[] }).rows;
  }
  return [] as T[];
}

/**
 * Sync missing employee rows for STAFF/ADMIN, then list assignable staff.
 * Uses raw SQL with only base columns — prod DB often lacks later migration cols,
 * and Drizzle insert() emits every schema column (which breaks on older tables).
 */
export async function listAssignableStaff(): Promise<{
  data: AssignableStaffRow[];
  backfilled: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let backfilled = 0;

  // Profiles that look like staff but have no employee.profile_id link
  try {
    const missing = await rawQuery<{
      id: number;
      full_name: string | null;
      role: string | null;
    }>(sql`
      SELECT p.id, p.full_name, p.role
      FROM profiles p
      LEFT JOIN employees e ON e.profile_id = p.id
      WHERE UPPER(TRIM(COALESCE(p.role, ''))) IN ('STAFF', 'ADMIN', 'SUPERADMIN')
        AND e.id IS NULL
    `);

    for (const profile of missing) {
      const role = String(profile.role || "").toUpperCase();
      const designation =
        role === "ADMIN" || role === "SUPERADMIN" ? "Administrator" : "Staff";

      try {
        await insertEmployeeMinimal({
          profileId: profile.id,
          designation,
          status: "active",
        });
        backfilled += 1;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`profile ${profile.id}: ${msg}`);
        console.error("[assignable] insert failed", profile.id, err);
      }
    }
  } catch (syncErr) {
    const msg = syncErr instanceof Error ? syncErr.message : String(syncErr);
    errors.push(`sync: ${msg}`);
    console.error("[assignable] sync failed", syncErr);
  }

  // List employees — prefer status filter when column exists
  let data: AssignableStaffRow[] = [];

  try {
    const rows = await rawQuery<{
      team_member_id: number;
      team_member_name: string;
    }>(sql`
      SELECT
        e.id AS team_member_id,
        COALESCE(p.full_name, e.designation, e.email, 'Staff') AS team_member_name
      FROM employees e
      LEFT JOIN profiles p ON p.id = e.profile_id
      WHERE COALESCE(LOWER(e.status), 'active') NOT IN ('terminated', 'inactive')
      ORDER BY e.id
    `);
    data = rows.map((r) => ({
      teamMemberId: Number(r.team_member_id),
      teamMemberName: String(r.team_member_name || "Staff"),
    }));
  } catch {
    try {
      const rows = await rawQuery<{
        team_member_id: number;
        team_member_name: string;
      }>(sql`
        SELECT
          e.id AS team_member_id,
          COALESCE(p.full_name, e.designation, 'Staff') AS team_member_name
        FROM employees e
        LEFT JOIN profiles p ON p.id = e.profile_id
        ORDER BY e.id
      `);
      data = rows.map((r) => ({
        teamMemberId: Number(r.team_member_id),
        teamMemberName: String(r.team_member_name || "Staff"),
      }));
    } catch (listErr) {
      const msg = listErr instanceof Error ? listErr.message : String(listErr);
      errors.push(`list: ${msg}`);
      console.error("[assignable] list failed", listErr);
    }
  }

  return {
    data: data.filter((d) => Number.isFinite(d.teamMemberId) && d.teamMemberId > 0),
    backfilled,
    errors,
  };
}
