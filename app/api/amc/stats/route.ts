import { NextRequest, NextResponse } from "next/server";
import { amcService } from "@/lib/services/amcService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

/**
 * GET /api/amc/stats - Get AMC dashboard statistics
 * Used by dashboard widgets and reports
 */
export async function GET(req: NextRequest) {
  try {
    console.log("[API /api/amc/stats] GET request received");
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const stats = await amcService.getDashboardStats();
    console.log("[API /api/amc/stats] Dashboard stats:", stats);

    return NextResponse.json({
      success: true,
      data: stats,
      meta: {
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("[API /api/amc/stats] AMC stats fetch error:", {
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
