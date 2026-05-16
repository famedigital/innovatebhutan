import { NextRequest, NextResponse } from "next/server";
import { reportService } from "@/lib/services/reportService";

// GET /api/reports/amc - Get AMC KPIs and metrics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters from query parameters
    const filters = {
      clientId: searchParams.get("clientId") ? Number(searchParams.get("clientId")) : undefined,
      serviceId: searchParams.get("serviceId") ? Number(searchParams.get("serviceId")) : undefined,
      status: searchParams.get("status") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    };

    // Check if summary is requested
    const summary = searchParams.get("summary") === "true";

    let data;
    if (summary) {
      data = await reportService.getAMCSummary(filters);
    } else {
      data = await reportService.getAMCKPIs(filters);
    }

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

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate AMC report",
      },
      { status: 500 }
    );
  }
}
