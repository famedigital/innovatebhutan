import { NextRequest, NextResponse } from "next/server";
import { attendanceService } from "@/lib/services/attendanceService";
import { attendanceReportSchema } from "@/lib/validations/attendance";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";
import { validateRequest, validateQueryParams } from "@/lib/validations/validation";

// GET /api/attendance/report - Get monthly attendance report
export async function GET(req: NextRequest) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const queryParams = validateQueryParams(attendanceReportSchema, req.nextUrl.searchParams);

    const report = await attendanceService.getAttendanceReport(queryParams);

    return NextResponse.json({
      success: true,
      data: report,
      meta: {
        month: queryParams.month,
        year: queryParams.year,
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Attendance report error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
