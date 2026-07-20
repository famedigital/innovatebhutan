import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  requireApiAuth,
  requireStaffOrAdmin,
  formatApiError,
} from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

/**
 * GET /api/profiles/[userId] — profile by Supabase Auth UUID
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await requireApiAuth(req);
    requireStaffOrAdmin(auth.profile);

    const { userId } = await context.params;
    if (!userId || userId.length < 8) {
      return NextResponse.json(
        { success: false, error: "Invalid user id" },
        { status: 400 }
      );
    }

    const [row] = await db
      .select({
        id: profiles.id,
        userId: profiles.userId,
        fullName: profiles.fullName,
        role: profiles.role,
        createdAt: profiles.createdAt,
      })
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!row) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: row });
  } catch (error) {
    const status = isApiError(error)
      ? (error as { statusCode?: number }).statusCode || 500
      : 500;
    return NextResponse.json(formatApiError(error), { status });
  }
}
