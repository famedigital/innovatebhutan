/**
 * Capability-based access (ERP bible Wave A).
 * Roles remain ADMIN/STAFF/CLIENT; money and sensitive ops use capabilities.
 */

export type Capability =
  | "see_money"
  | "cancel_project"
  | "write_off"
  | "provision_users"
  | "adjust_stock";

export const ALL_CAPABILITIES: Capability[] = [
  "see_money",
  "cancel_project",
  "write_off",
  "provision_users",
  "adjust_stock",
];

export type ProfileLike = {
  role: string;
  capabilities?: string[] | null;
};

function normalizeCaps(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((c) => String(c).toLowerCase().trim());
  }
  return [];
}

/** ADMIN / SUPERADMIN always have full commercial capabilities. */
export function resolveCapabilities(profile: ProfileLike): Capability[] {
  const role = (profile.role || "").toUpperCase().trim();
  if (role === "ADMIN" || role === "SUPERADMIN") {
    return [...ALL_CAPABILITIES];
  }
  const fromDb = normalizeCaps(profile.capabilities);
  return ALL_CAPABILITIES.filter((c) => fromDb.includes(c));
}

export function hasCapability(
  profile: ProfileLike,
  capability: Capability
): boolean {
  return resolveCapabilities(profile).includes(capability);
}

export function canSeeMoney(profile: ProfileLike): boolean {
  return hasCapability(profile, "see_money");
}

/** Strip commercial fields from a project (or list item) for non-money users. */
export function redactProjectMoney<T extends Record<string, unknown>>(
  project: T
): T {
  const next = { ...project };
  delete (next as Record<string, unknown>).budget;
  delete (next as Record<string, unknown>).moneyMeta;
  delete (next as Record<string, unknown>).money_meta;
  return next;
}

export function redactProjectsMoney<T extends Record<string, unknown>>(
  projects: T[]
): T[] {
  return projects.map((p) => redactProjectMoney(p));
}
