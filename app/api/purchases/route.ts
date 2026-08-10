import { NextRequest, NextResponse } from "next/server";
import { purchaseMasterService } from "@/lib/services/purchaseMasterService";
import {
  createPurchaseMasterSchema,
  purchaseMasterQuerySchema,
} from "@/lib/validations/purchaseMaster";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { validateRequest, validateQueryParams } from "@/lib/validations/validation";

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const query = validateQueryParams(purchaseMasterQuerySchema, req.nextUrl.searchParams);
    const result = await purchaseMasterService.list({
      status: query.status,
      search: query.search,
      supplierId: query.supplierId,
    });

    return NextResponse.json({
      success: true,
      data: result.purchases,
      count: result.total,
    });
  } catch (error) {
    console.error("[API /api/purchases] GET error:", error);
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
    const validated = validateRequest(createPurchaseMasterSchema, body);
    const purchase = await purchaseMasterService.create(
      validated,
      authContext.user.id
    );

    return NextResponse.json(
      {
        success: true,
        data: purchase,
        message: "Purchase created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /api/purchases] POST error:", error);
    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500,
    });
  }
}
