import { NextRequest, NextResponse } from "next/server";
import { listAssignableStaff } from "@/lib/admin/assignable-staff-server";
import {
  requireApiAuth,
  requireStaffOrAdmin,
  formatApiError,
} from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

/**
 * GET /api/team/assignable
 * Staff that can be assigned as focal/backup (employees.id).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request);
    requireStaffOrAdmin(auth.profile);

    const result = await listAssignableStaff();

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        count: result.data.length,
        backfilled: result.backfilled,
        errors: result.errors.length ? result.errors : undefined,
      },
    });
  } catch (error) {
    console.error("[assignable] error:", error);
    const status = isApiError(error)
      ? (error as { statusCode?: number }).statusCode || 500
      : 500;
    return NextResponse.json(formatApiError(error), { status });
  }
}
