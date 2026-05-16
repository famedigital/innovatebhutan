import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { sql, eq, or } from "drizzle-orm";
import { requireApiAuth, requireStaffOrAdmin, requireAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { rateLimit, RateLimitPresets, addRateLimitHeaders } from "@/lib/middleware/rate-limit";
import { createProfileSchema, UserRoleEnum } from "@/lib/validations/api";
import { ZodError } from "zod";

/**
 * GET /api/profiles - List profiles with optional role filter
 *
 * Query params:
 * - role: Comma-separated list of roles to filter (e.g., "ADMIN,STAFF")
 *
 * Returns:
 * - success: boolean
 * - data: Array of profile objects
 * - count: Number of profiles returned
 *
 * SECURITY: Requires authenticated user with ADMIN or STAFF role
 * RATE LIMIT: 20 requests per minute
 */
export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIp(req);
    const rateLimitResult = rateLimit({ ...RateLimitPresets.standard, key: clientId });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter || 60),
          },
        }
      );
    }

    // Authenticate and authorize
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role");

    // Build the base query
    const query = db
      .select({
        id: profiles.id,
        userId: profiles.userId,
        fullName: profiles.fullName,
        role: profiles.role,
        createdAt: profiles.createdAt,
      })
      .from(profiles);

    // Apply role filter if provided
    if (roleFilter) {
      const roles = roleFilter.split(",").map((r) => r.trim()).filter(Boolean);
      if (roles.length === 1) {
        query.where(eq(profiles.role, roles[0]));
      } else if (roles.length > 1) {
        const roleConditions = roles.map(role => eq(profiles.role, role));
        query.where(or(...roleConditions));
      }
    }

    // Order by full name (nulls last) then by id
    const allProfiles = await query.orderBy(
      sql`COALESCE(${profiles.fullName}, '')`
    );

    const response = NextResponse.json({
      success: true,
      data: allProfiles,
      count: allProfiles.length,
    });

    // Add rate limit headers
    return addRateLimitHeaders(response, RateLimitPresets.standard, rateLimitResult);
  } catch (error) {
    console.error("[API /api/profiles] Fetch error:", error);

    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as any).statusCode
        : 500
    });
  }
}

/**
 * POST /api/profiles - Create a new profile
 *
 * Body:
 * - userId: string (required) - Supabase Auth UUID
 * - fullName: string (optional)
 * - role: string (default: 'CLIENT') - ADMIN, STAFF, or CLIENT
 *
 * Returns:
 * - success: boolean
 * - data: Created profile object
 *
 * SECURITY: Requires authenticated user with ADMIN role (STAFF can only create CLIENT profiles)
 * RATE LIMIT: 10 requests per minute (stricter for writes)
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting (stricter for write operations)
    const clientId = getClientIp(req);
    const rateLimitResult = rateLimit({ ...RateLimitPresets.strict, key: clientId });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter || 60),
          },
        }
      );
    }

    // Authenticate and authorize
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    // Parse and validate request body using Zod
    const body = await req.json();
    const validationResult = createProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { userId, fullName, role } = validationResult.data;

    // Only ADMIN can create ADMIN or STAFF profiles
    if (role !== 'CLIENT' && authContext.profile.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'Only ADMIN users can create STAFF or ADMIN profiles',
        },
        { status: 403 }
      );
    }

    // Check if profile already exists
    const existing = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Profile already exists for this user',
        },
        { status: 409 }
      );
    }

    // Create the profile
    const [newProfile] = await db
      .insert(profiles)
      .values({
        userId,
        fullName: fullName || null,
        role,
      })
      .returning();

    const response = NextResponse.json({
      success: true,
      data: newProfile,
    });

    // Add rate limit headers
    return addRateLimitHeaders(response, RateLimitPresets.strict, rateLimitResult);
  } catch (error) {
    console.error('[API /api/profiles] Create error:', error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && 'statusCode' in error
        ? (error as any).statusCode
        : 500
    });
  }
}
