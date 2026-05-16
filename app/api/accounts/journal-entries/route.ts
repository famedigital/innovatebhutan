import { NextRequest, NextResponse } from "next/server";
import { accountsService } from "@/lib/services/accountsService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    const filters: any = { limit, offset };
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;
    if (searchParams.get("fromDate")) filters.fromDate = new Date(searchParams.get("fromDate")!);
    if (searchParams.get("toDate")) filters.toDate = new Date(searchParams.get("toDate")!);
    if (searchParams.get("fiscalYear")) filters.fiscalYear = searchParams.get("fiscalYear")!;

    const result = await accountsService.listJournalEntries(filters);

    return NextResponse.json({
      success: true,
      data: result.journalEntries,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const body = await req.json();

    const journalEntry = await accountsService.createJournalEntry(body);

    return NextResponse.json(
      {
        success: true,
        message: "Journal entry created successfully",
        data: journalEntry,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
