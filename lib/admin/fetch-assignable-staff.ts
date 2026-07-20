/**
 * Load staff that can be assigned as focal/backup (employees.id).
 * Prefers /api/team?view=members, falls back to /api/employees.
 */
export async function fetchAssignableStaff(): Promise<
  Array<{ teamMemberId: number; teamMemberName: string }>
> {
  const membersRes = await fetch("/api/team?view=members");
  const membersJson = await membersRes.json().catch(() => ({}));

  if (
    membersRes.ok &&
    membersJson.success &&
    Array.isArray(membersJson.data) &&
    membersJson.data.length > 0
  ) {
    return membersJson.data.map(
      (s: { teamMemberId: number; teamMemberName: string }) => ({
        teamMemberId: s.teamMemberId,
        teamMemberName: s.teamMemberName || "Staff",
      })
    );
  }

  const empRes = await fetch("/api/employees?limit=100");
  const empJson = await empRes.json().catch(() => ({}));
  if (!empRes.ok || !empJson.success || !Array.isArray(empJson.data)) {
    return [];
  }

  return empJson.data
    .filter(
      (e: { status?: string | null }) =>
        !e.status ||
        !["terminated", "inactive"].includes(String(e.status).toLowerCase())
    )
    .map(
      (e: {
        id: number;
        fullName?: string | null;
        designation?: string | null;
        email?: string | null;
      }) => ({
        teamMemberId: e.id,
        teamMemberName:
          e.fullName || e.designation || e.email || `Staff #${e.id}`,
      })
    );
}
