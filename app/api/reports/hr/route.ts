import { NextRequest, NextResponse } from "next/server";
import { reportService } from "@/lib/services/reportService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from '@/lib/auth/api-auth';
import { isApiError } from '@/lib/errors';

// GET /api/reports/hr - Get HR KPIs and metrics
export async function GET(request: NextRequest) {
  try {
    const _auth = await requireApiAuth(request);
    requireStaffOrAdmin(_auth.profile);
    const searchParams = request.nextUrl.searchParams;

    // Parse filters from query parameters
    const filters = {
      department: searchParams.get("department") || undefined,
      designation: searchParams.get("designation") || undefined,
      status: searchParams.get("status") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    };

    // Check what type of report is requested
    const reportType = searchParams.get("type") || "kpis";

    let data;
    switch (reportType) {
      case "summary":
        data = await reportService.getHRSummary(filters);
        break;
      case "payroll":
        data = await reportService.getPayrollSummary(filters);
        break;
      case "kpis":
      default:
        data = await reportService.getHRKPIs(filters);
        break;
    }

    return NextResponse.json({
      success: true,
      data,
      meta: {
        reportType,
        filters,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error generating HR report:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate HR report",
      },
      { status: 500 }
    );
  }
}
