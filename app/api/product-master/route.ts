import { NextRequest, NextResponse } from "next/server";
import { productMasterService } from "@/lib/services/productMasterService";
import {
  createProductMasterSchema,
  productMasterQuerySchema,
} from "@/lib/validations/productMaster";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { validateRequest, validateQueryParams } from "@/lib/validations/validation";

export async function GET(req: NextRequest) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const query = validateQueryParams(productMasterQuerySchema, req.nextUrl.searchParams);
    const result = await productMasterService.list({
      category: query.category,
      search: query.search,
      active: query.active,
    });

    return NextResponse.json({
      success: true,
      data: result.items,
      count: result.total,
    });
  } catch (error) {
    console.error("[API /api/product-master] GET error:", error);
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
    const validated = validateRequest(createProductMasterSchema, body);
    const item = await productMasterService.create(validated);

    return NextResponse.json(
      {
        success: true,
        data: item,
        message: "Product master created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /api/product-master] POST error:", error);
    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500,
    });
  }
}
