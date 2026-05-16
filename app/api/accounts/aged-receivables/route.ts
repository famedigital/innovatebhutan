import { NextRequest, NextResponse } from "next/server";
import { accountsService } from "@/lib/services/accountsService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const searchParams = req.nextUrl.searchParams;
    const asOfDate = searchParams.get("asOfDate")
      ? new Date(searchParams.get("asOfDate")!)
      : new Date();

    const data = await accountsService.getAgedReceivables(asOfDate);

    return NextResponse.json({
      success: true,
      data,
      summary: {
        totalOutstanding: data.reduce((sum, row) => sum + row.outstandingAmount, 0),
        current: data.reduce((sum, row) => sum + row.current, 0),
        days30: data.reduce((sum, row) => sum + row.days30, 0),
        days60: data.reduce((sum, row) => sum + row.days60, 0),
        days90: data.reduce((sum, row) => sum + row.days90, 0),
        daysAbove90: data.reduce((sum, row) => sum + row.daysAbove90, 0),
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
