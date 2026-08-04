import { NextRequest, NextResponse } from "next/server";
import { quotationService } from "@/lib/services/quotationService";
import {
  createQuotationSchema,
  quotationQuerySchema,
} from "@/lib/validations/quotation";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { validateRequest, validateQueryParams } from "@/lib/validations/validation";

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const query = validateQueryParams(quotationQuerySchema, req.nextUrl.searchParams);
    const result = await quotationService.list({
      category: query.category,
      status: query.status,
      clientId: query.clientId,
      search: query.search,
    });

    return NextResponse.json({
      success: true,
      data: result.quotations,
      count: result.total,
    });
  } catch (error) {
    console.error("[API /api/quotations] GET error:", error);
    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const body = await req.json();
    const validated = validateRequest(createQuotationSchema, body);
    const quotation = await quotationService.create(
      validated,
      authContext.user.id
    );

    return NextResponse.json(
      {
        success: true,
        data: quotation,
        message: "Quotation created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /api/quotations] POST error:", error);
    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500,
    });
  }
}
