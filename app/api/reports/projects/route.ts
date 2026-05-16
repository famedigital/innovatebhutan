import { NextRequest, NextResponse } from "next/server";
import { reportService } from "@/lib/services/reportService";

// GET /api/reports/projects - Get project KPIs and metrics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filters from query parameters
    const filters = {
      clientId: searchParams.get("clientId") ? Number(searchParams.get("clientId")) : undefined,
      status: searchParams.get("status") || undefined,
      leadId: searchParams.get("leadId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    };

    // Check if summary is requested
    const summary = searchParams.get("summary") === "true";

    let data;
    if (summary) {
      data = await reportService.getProjectSummary(filters);
    } else {
      data = await reportService.getProjectKPIs(filters);
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
    console.error("Error generating project report:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate project report",
      },
      { status: 500 }
    );
  }
}
