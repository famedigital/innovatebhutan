/**
 * API Authentication and Authorization helpers
 * Provides middleware functions for protecting API routes
 */

import { createClient } from '@/utils/supabase/server';
import { AuthError, AuthorizationError } from '@/lib/errors';
import { isApiError } from '@/lib/errors';

/**
 * User profile structure from database
 */
export interface UserProfile {
  id: number;
  userId: string;
  fullName?: string | null;
  role: string; // 'ADMIN' | 'STAFF' | 'CLIENT'
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
  const supabase = await createClient();

  // Step 1: Get authenticated user from Supabase Auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    console.error('[API Auth] Supabase auth error:', authError.message, authError);
    throw new AuthError(`Authentication error: ${authError.message}`);
  }

  if (!user) {
    console.error('[API Auth] No user found in session');
    // Development mode fallback for testing (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[API Auth] DEV MODE: Using fallback admin user');
      return {
        user: { id: 'dev-admin-id', email: 'dev@innovates.bt' },
        profile: {
          id: 1,
          userId: 'dev-admin-id',
          fullName: 'Development Admin',
          role: 'ADMIN',
          createdAt: new Date(),
        },
      };
    }
    throw new AuthError('Authentication required - no valid session');
  }

  console.log('[API Auth] User authenticated:', { id: user.id, email: user.email });

  // Step 2: Fetch user profile from database
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (profileError) {
    console.error('[API Auth] Profile fetch error:', {
      userId: user.id,
      error: profileError.message,
      code: profileError.code,
      details: profileError,
      hint: 'This usually means the user profile does not exist or RLS policies are blocking access'
    });

    // Development mode fallback for testing (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[API Auth] DEV MODE: Profile not found, using fallback');
      return {
        user: { id: user.id, email: user.email },
        profile: {
          id: 1,
          userId: user.id,
          fullName: 'Development Admin',
          role: 'ADMIN',
          createdAt: new Date(),
        },
      };
    }

    throw new AuthError(`User profile not found: ${profileError.message}`);
  }

  if (!profile) {
    console.error('[API Auth] Profile is null for user:', user.id);

    // Development mode fallback for testing (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[API Auth] DEV MODE: Profile is null, using fallback');
      return {
        user: { id: user.id, email: user.email },
        profile: {
          id: 1,
          userId: user.id,
          fullName: 'Development Admin',
          role: 'ADMIN',
          createdAt: new Date(),
        },
      };
    }

    throw new AuthError('User profile not found - please contact administrator');
  }

  // Normalize role value (handle case sensitivity and whitespace)
  const normalizedProfile: UserProfile = {
    ...profile,
    role: (profile.role || 'CLIENT').toString().toUpperCase().trim(),
  };

  console.log('[API Auth] Profile loaded:', {
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
  requireRole(profile, ['ADMIN']);
}

/**
 * Check if user is admin or staff
 * Convenience wrapper for requireRole
 */
export function requireStaffOrAdmin(profile: UserProfile): void {
  requireRole(profile, ['ADMIN', 'STAFF']);
}

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
