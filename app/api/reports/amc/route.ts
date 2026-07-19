import { NextRequest, NextResponse } from "next/server";
import { reportService } from "@/lib/services/reportService";
import {
  requireApiAuth,
  requireStaffOrAdmin,
  formatApiError,
} from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

// GET /api/reports/amc - Get AMC KPIs and metrics
export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request);
    requireStaffOrAdmin(auth.profile);

    const searchParams = request.nextUrl.searchParams;

    const filters = {
      clientId: searchParams.get("clientId")
        ? Number(searchParams.get("clientId"))
        : undefined,
      serviceId: searchParams.get("serviceId")
        ? Number(searchParams.get("serviceId"))
        : undefined,
      status: searchParams.get("status") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    };

    const summary = searchParams.get("summary") === "true";

    const data = summary
      ? await reportService.getAMCSummary(filters)
      : await reportService.getAMCKPIs(filters);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        filters,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error generating AMC report:", error);

    const statusCode = isApiError(error)
      ? (error as { statusCode: number }).statusCode
      : error instanceof Error && "statusCode" in error
        ? Number((error as { statusCode: number }).statusCode) || 500
        : 500;

    return NextResponse.json(formatApiError(error), { status: statusCode });
  }
}
