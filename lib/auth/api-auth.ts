/**
 * API Authentication and Authorization helpers
 * Provides middleware functions for protecting API routes
 */

import { eq } from 'drizzle-orm';
import { createClient } from '@/utils/supabase/server';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { AuthError } from '@/lib/errors/auth-error';
import { AuthorizationError } from '@/lib/errors/auth-error';
import { isApiError } from '@/lib/errors/api-error';
import {
  canSeeMoney,
  hasCapability,
  type Capability,
} from '@/lib/auth/capabilities';

/**
 * User profile structure from database
 */
export interface UserProfile {
  id: number;
  userId: string;
  fullName?: string | null;
  role: string; // 'ADMIN' | 'STAFF' | 'CLIENT'
  capabilities?: string[] | null;
  createdAt: Date;
}

/**
 * Authenticated user context
 */
export interface AuthContext {
  user: {
    id: string;
    email?: string;
  };
  profile: UserProfile;
}

/**
 * Require authentication for API routes
 * Throws AuthError if not authenticated
 *
 * @param request - The incoming request object
 * @returns AuthContext containing user and profile
 * @throws AuthError if authentication fails
 */
export async function requireApiAuth(request: Request): Promise<AuthContext> {
  // Prefer Bearer token when present (FormData uploads / mobile / SSR mismatches)
  const authHeader = request.headers.get("authorization");
  const bearer =
    authHeader?.startsWith("Bearer ") || authHeader?.startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : null;

  let user: { id: string; email?: string } | null = null;

  if (bearer) {
    const { createClient: createJsClient } = await import("@supabase/supabase-js");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";
    const tokenClient = createJsClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const {
      data: { user: bearerUser },
      error: bearerError,
    } = await tokenClient.auth.getUser(bearer);
    if (bearerError) {
      console.error("[API Auth] Bearer auth error:", bearerError.message);
    }
    if (bearerUser) {
      user = { id: bearerUser.id, email: bearerUser.email };
    }
  }

  if (!user) {
    const cookieClient = await createClient();
    const {
      data: { user: cookieUser },
      error: authError,
    } = await cookieClient.auth.getUser();

    if (authError) {
      console.error("[API Auth] Supabase auth error:", authError.message, authError);
      throw new AuthError(`Authentication error: ${authError.message}`);
    }

    if (cookieUser) {
      user = { id: cookieUser.id, email: cookieUser.email };
    }
  }

  if (!user) {
    console.error("[API Auth] No user found in session");
    // Explicit opt-in only — never auto-elevate in production-like environments
    if (
      process.env.NODE_ENV === "development" &&
      process.env.ALLOW_DEV_AUTH_BYPASS === "true"
    ) {
      console.warn("[API Auth] DEV MODE: Using fallback admin user (ALLOW_DEV_AUTH_BYPASS)");
      return {
        user: { id: "dev-admin-id", email: "dev@innovates.bt" },
        profile: {
          id: 1,
          userId: "dev-admin-id",
          fullName: "Development Admin",
          role: "ADMIN",
          createdAt: new Date(),
        },
      };
    }
    throw new AuthError("Authentication required - no valid session");
  }

  console.log("[API Auth] User authenticated:", { id: user.id, email: user.email });

  // Step 2: Fetch profile via Drizzle (bypasses RLS; JWT already verified above)
  let profileRow: typeof profiles.$inferSelect | undefined;
  try {
    const rows = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);
    profileRow = rows[0];
  } catch (profileError) {
    console.error("[API Auth] Profile fetch error:", {
      userId: user.id,
      error: profileError instanceof Error ? profileError.message : profileError,
    });
    throw new AuthError(
      `User profile not found: ${
        profileError instanceof Error ? profileError.message : "query failed"
      }`
    );
  }

  if (!profileRow) {
    console.error("[API Auth] Profile is null for user:", user.id);

    if (
      process.env.NODE_ENV === "development" &&
      process.env.ALLOW_DEV_AUTH_BYPASS === "true"
    ) {
      console.warn(
        "[API Auth] DEV MODE: Profile is null, using fallback (ALLOW_DEV_AUTH_BYPASS)"
      );
      return {
        user: { id: user.id, email: user.email },
        profile: {
          id: 1,
          userId: user.id,
          fullName: "Development Admin",
          role: "ADMIN",
          createdAt: new Date(),
        },
      };
    }

    throw new AuthError("User profile not found - please contact administrator");
  }

  const normalizedProfile: UserProfile = {
    id: profileRow.id,
    userId: profileRow.userId,
    fullName: profileRow.fullName,
    role: (profileRow.role || "CLIENT").toString().toUpperCase().trim(),
    capabilities: Array.isArray(profileRow.capabilities)
      ? (profileRow.capabilities as string[])
      : [],
    createdAt: profileRow.createdAt || new Date(),
  };

  console.log("[API Auth] Profile loaded:", {
    profileId: normalizedProfile.id,
    userId: normalizedProfile.userId,
    role: normalizedProfile.role,
    fullName: normalizedProfile.fullName,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile: normalizedProfile,
  };
}

/**
 * Check if user has required role
 * Throws AuthorizationError if not authorized
 *
 * @param profile - User profile from auth context
 * @param allowedRoles - Array of roles that are allowed
 * @throws AuthorizationError if role is not allowed
 */
export function requireRole(
  profile: UserProfile,
  allowedRoles: string[]
): void {
  // Normalize both sides for comparison
  const normalizedProfileRole = profile.role.toUpperCase().trim();
  const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase().trim());

  console.log('[API Auth] Role check:', {
    userRole: normalizedProfileRole,
    allowedRoles: normalizedAllowedRoles,
    hasAccess: normalizedAllowedRoles.includes(normalizedProfileRole)
  });

  if (!normalizedAllowedRoles.includes(normalizedProfileRole)) {
    throw new AuthorizationError(
      `Insufficient permissions. Your role: ${normalizedProfileRole}, Required: ${allowedRoles.join(' or ')}`
    );
  }
}

/**
 * Check if user is admin
 * Convenience wrapper for requireRole
 */
export function requireAdmin(profile: UserProfile): void {
  requireRole(profile, ["ADMIN", "SUPERADMIN"]);
}

/**
 * Check if user is admin or staff
 * Convenience wrapper for requireRole
 */
export function requireStaffOrAdmin(profile: UserProfile): void {
  requireRole(profile, ["ADMIN", "STAFF", "SUPERADMIN"]);
}

/**
 * ERP bible: commercial money visibility (owner + sales head via ADMIN or see_money cap).
 */
export function requireSeeMoney(profile: UserProfile): void {
  if (!canSeeMoney(profile)) {
    throw new AuthorizationError(
      "Insufficient permissions: see_money required (prices, invoices, payments)"
    );
  }
}

export function requireCapability(
  profile: UserProfile,
  capability: Capability
): void {
  if (!hasCapability(profile, capability)) {
    throw new AuthorizationError(
      `Insufficient permissions: ${capability} required`
    );
  }
}

export { canSeeMoney, hasCapability };

/**
 * Check if user owns the resource or is admin
 * Useful for client-specific resources
 */
export function requireOwnershipOrAdmin(
  profile: UserProfile,
  resourceUserId: string
): void {
  if (profile.role === 'ADMIN') {
    return; // Admins can access anything
  }

  if (profile.userId !== resourceUserId) {
    throw new AuthorizationError('You do not have permission to access this resource');
  }
}

/**
 * Extract client IP from request headers
 * Used for rate limiting
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Standardized API error response shape
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
  retryAfter?: number;
}

/**
 * Format any error for API response
 * Handles ApiError, AuthError, AuthorizationError, and generic errors
 */
export function formatApiError(error: unknown): ApiErrorResponse {
  // Import at function level to avoid circular dependency issues
  if (isApiError(error)) {
    const apiError = error as any;
    const response: ApiErrorResponse = {
      success: false,
      error: apiError.message,
      code: apiError.code,
    };

    if (apiError.details) {
      response.details = apiError.details;
    }

    // Add retryAfter for rate limit errors
    if (apiError.code === 'RATE_LIMIT_EXCEEDED' && apiError.details?.retryAfter) {
      response.retryAfter = apiError.details.retryAfter;
    }

    return response;
  }

  if (error instanceof AuthError || error instanceof AuthorizationError) {
    return {
      success: false,
      error: error.message,
      code: error instanceof AuthError ? 'UNAUTHORIZED' : 'FORBIDDEN',
    };
  }

  return {
    success: false,
    error: error instanceof Error ? error.message : 'An unexpected error occurred',
  };
}

/**
 * Format auth error for API response
 * @deprecated Use formatApiError instead for consistency
 */
export function formatAuthError(error: unknown): ApiErrorResponse {
  return formatApiError(error);
}
