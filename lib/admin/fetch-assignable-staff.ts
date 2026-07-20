/**
 * Load staff that can be assigned as focal/backup (employees.id).
 * Prefers /api/team?view=members (backfills missing employee rows),
 * falls back to /api/employees.
 */
export async function fetchAssignableStaff(): Promise<
  Array<{ teamMemberId: number; teamMemberName: string }>
> {
  const tryMembers = async () => {
    const membersRes = await fetch("/api/team/?view=members");
    const membersJson = await membersRes.json().catch(() => ({}));
    if (
      membersRes.ok &&
      membersJson.success &&
      Array.isArray(membersJson.data)
    ) {
      return membersJson.data.map(
        (s: { teamMemberId: number; teamMemberName: string }) => ({
          teamMemberId: s.teamMemberId,
          teamMemberName: s.teamMemberName || "Staff",
        })
      );
    }
    return null;
  };

  const tryEmployees = async () => {
    const empRes = await fetch("/api/employees/?limit=100");
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
  };

  const fromMembers = await tryMembers();
  if (fromMembers && fromMembers.length > 0) return fromMembers;

  const fromEmployees = await tryEmployees();
  if (fromEmployees.length > 0) return fromEmployees;

  // Members may be empty before backfill finished — retry once
  if (fromMembers && fromMembers.length === 0) {
    const retry = await tryMembers();
    if (retry && retry.length > 0) return retry;
  }

  return fromMembers || fromEmployees;
}
