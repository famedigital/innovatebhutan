/**
 * API Authentication and Authorization helpers
 * Provides middleware functions for protecting API routes
 */

import { createClient } from '@/utils/supabase/server';
import { AuthError, AuthorizationError } from '@/lib/errors';

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

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new AuthError('Authentication required');
  }

  // Fetch user profile from database
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    throw new AuthError('User profile not found');
  }

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    profile: profile as UserProfile,
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
  if (!allowedRoles.includes(profile.role)) {
    throw new AuthorizationError(
      `Insufficient permissions. Required role: ${allowedRoles.join(' or ')}`
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
  const { getStatusCode, isApiError } = require('@/lib/errors');

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
