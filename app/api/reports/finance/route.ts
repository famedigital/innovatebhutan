import { NextRequest, NextResponse } from "next/server";
import { reportService } from "@/lib/services/reportService";

// GET /api/reports/finance - Get finance KPIs and metrics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters from query parameters
    const filters = {
      clientId: searchParams.get("clientId") ? Number(searchParams.get("clientId")) : undefined,
      status: searchParams.get("status") || undefined,
      category: searchParams.get("category") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    };

    // Check what type of report is requested
    const reportType = searchParams.get("type") || "kpis";

    let data;
    switch (reportType) {
      case "summary":
        data = await reportService.getFinanceSummary(filters);
        break;
      case "cashflow":
        data = await reportService.getCashFlowStatement(filters);
        break;
      case "kpis":
      default:
        data = await reportService.getFinanceKPIs(filters);
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
    console.error("Error generating finance report:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate finance report",
      },
      { status: 500 }
    );
  }
}
