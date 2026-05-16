import { NextRequest, NextResponse } from "next/server";
import { employeeService } from "@/lib/services/employeeService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

// GET /api/employees/stats - Get employee statistics
export async function GET(req: NextRequest) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const stats = await employeeService.getEmployeeStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Employee stats error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
