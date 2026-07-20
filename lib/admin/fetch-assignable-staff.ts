/**
 * Load staff that can be assigned as focal/backup (employees.id).
 */
export async function fetchAssignableStaff(): Promise<
  Array<{ teamMemberId: number; teamMemberName: string }>
> {
  const mapRows = (
    data: Array<{ teamMemberId?: number; id?: number; teamMemberName?: string; fullName?: string | null; designation?: string | null; email?: string | null }>
  ) =>
    data.map((s) => ({
      teamMemberId: Number(s.teamMemberId ?? s.id),
      teamMemberName:
        s.teamMemberName ||
        s.fullName ||
        s.designation ||
        s.email ||
        "Staff",
    })).filter((s) => Number.isFinite(s.teamMemberId) && s.teamMemberId > 0);

  // Primary: dedicated assignable endpoint (syncs missing employee rows)
  try {
    const res = await fetch("/api/team/assignable/");
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
      return mapRows(json.data);
    }
    if (json?.meta?.errors?.length) {
      console.warn("[assignable staff]", json.meta.errors);
    }
  } catch (e) {
    console.warn("[assignable staff] /api/team/assignable failed", e);
  }

  // Fallback: legacy members view
  try {
    const res = await fetch("/api/team/?view=members");
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
      return mapRows(json.data);
    }
  } catch (e) {
    console.warn("[assignable staff] /api/team members failed", e);
  }

  // Fallback: employees list
  try {
    const res = await fetch("/api/employees/?limit=100");
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
      return mapRows(json.data).filter(Boolean);
    }
  } catch (e) {
    console.warn("[assignable staff] /api/employees failed", e);
  }

  // Last resort: profiles with STAFF/ADMIN (cannot assign without employee id —
  // but surfaces that accounts exist). Try assignable once more after profiles load.
  try {
    const res = await fetch("/api/profiles/?role=ADMIN,STAFF,SUPERADMIN");
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.success && Array.isArray(json.data) && json.data.length > 0) {
      // Profiles exist — force another assignable sync
      const retry = await fetch("/api/team/assignable/");
      const retryJson = await retry.json().catch(() => ({}));
      if (
        retry.ok &&
        retryJson.success &&
        Array.isArray(retryJson.data) &&
        retryJson.data.length > 0
      ) {
        return mapRows(retryJson.data);
      }
      console.warn(
        "[assignable staff] profiles exist but no employees:",
        json.data.length,
        retryJson?.meta
      );
    }
  } catch (e) {
    console.warn("[assignable staff] profiles fallback failed", e);
  }

  return [];
}
