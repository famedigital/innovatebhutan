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
    if (searchParams.get("partyType")) filters.partyType = searchParams.get("partyType")!;
    if (searchParams.get("search")) filters.search = searchParams.get("search")!;
    if (searchParams.get("isActive")) filters.isActive = searchParams.get("isActive") === "true";

    const result = await accountsService.listParties(filters);

    return NextResponse.json({
      success: true,
      data: result.parties,
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

    const party = await accountsService.createParty(body);

    return NextResponse.json(
      {
        success: true,
        message: "Party created successfully",
        data: party,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
