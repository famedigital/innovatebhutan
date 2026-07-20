/**
 * Portal auth helpers — invite-only CLIENT scoped to a client_id.
 */

import { and, eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { clientPortalAccess, clients, profiles } from "@/db/schema";
import {
  requireApiAuth,
  type AuthContext,
  type UserProfile,
} from "@/lib/auth/api-auth";
import { AuthorizationError } from "@/lib/errors/auth-error";

export type PortalAccessRow = typeof clientPortalAccess.$inferSelect;

export type PortalContext = AuthContext & {
  clientId: number;
  access: PortalAccessRow;
  clientName?: string | null;
};

export async function findPortalAccessByAuth(
  authUserId: string,
  email?: string | null
): Promise<PortalAccessRow | null> {
  const byAuth = await db
    .select()
    .from(clientPortalAccess)
    .where(
      and(
        eq(clientPortalAccess.authUserId, authUserId),
        eq(clientPortalAccess.isActive, true)
      )
    )
    .limit(1);
  if (byAuth[0]) return byAuth[0];

  if (email) {
    const byEmail = await db
      .select()
      .from(clientPortalAccess)
      .where(
        and(
          eq(clientPortalAccess.inviteEmail, email.toLowerCase().trim()),
          eq(clientPortalAccess.isActive, true)
        )
      )
      .limit(1);
    if (byEmail[0]) return byEmail[0];
  }
  return null;
}

/** Staff preview: ADMIN/STAFF may pass ?clientId= for support; CLIENT must have invite. */
export async function requirePortalContext(
  request: Request,
  opts?: { allowStaffPreview?: boolean }
): Promise<PortalContext> {
  const auth = await requireApiAuth(request);
  const role = (auth.profile.role || "").toUpperCase();

  if (role === "CLIENT") {
    const access = await findPortalAccessByAuth(
      auth.user.id,
      auth.user.email
    );
    if (!access) {
      throw new AuthorizationError(
        "No active portal invite for this account. Ask Innovate Bhutan to invite you."
      );
    }
    const [client] = await db
      .select({ name: clients.name })
      .from(clients)
      .where(eq(clients.id, access.clientId))
      .limit(1);
    return {
      ...auth,
      clientId: access.clientId,
      access,
      clientName: client?.name,
    };
  }

  if (
    opts?.allowStaffPreview !== false &&
    (role === "ADMIN" || role === "STAFF" || role === "SUPERADMIN")
  ) {
    const url = new URL(request.url);
    const clientIdParam = url.searchParams.get("clientId");
    if (clientIdParam) {
      const clientId = parseInt(clientIdParam, 10);
      if (!Number.isFinite(clientId)) {
        throw new AuthorizationError("Invalid clientId");
      }
      const [client] = await db
        .select({ name: clients.name })
        .from(clients)
        .where(eq(clients.id, clientId))
        .limit(1);
      if (!client) throw new AuthorizationError("Client not found");
      return {
        ...auth,
        clientId,
        access: {
          id: 0,
          clientId,
          userId: null,
          authUserId: auth.user.id,
          profileId: auth.profile.id,
          accessLevel: "staff_preview",
          inviteEmail: auth.user.email || null,
          inviteToken: null,
          inviteExpiresAt: null,
          features: null,
          allowedActions: null,
          lastLogin: null,
          loginCount: 0,
          isActive: true,
          invitedBy: null,
          invitedAt: null,
          activatedAt: null,
          lastPasswordChange: null,
          twoFactorEnabled: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        clientName: client.name,
      };
    }
  }

  throw new AuthorizationError("Portal access denied");
}

export function requireClientRole(profile: UserProfile): void {
  const role = (profile.role || "").toUpperCase();
  if (role !== "CLIENT") {
    throw new AuthorizationError("Client portal role required");
  }
}

export async function getMoneyPeopleProfileIds(): Promise<number[]> {
  const rows = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(
      or(
        eq(profiles.role, "ADMIN"),
        eq(profiles.role, "SUPERADMIN"),
        sql`${profiles.capabilities}::jsonb ? 'see_money'`
      )
    );
  return rows.map((r) => r.id);
}
