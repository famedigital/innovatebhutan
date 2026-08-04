import { NextRequest, NextResponse } from "next/server";
import { productMasterService } from "@/lib/services/productMasterService";
import { updateProductMasterSchema } from "@/lib/validations/productMaster";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { validateRequest, validateId } from "@/lib/validations/validation";
import { NotFoundError } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const { id } = await params;
    const productId = validateId(id, "Product Master ID");
    const item = await productMasterService.getById(productId);
    if (!item) throw new NotFoundError("Product master");

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("[API /api/product-master/[id]] GET error:", error);
    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500,
    });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const { id } = await params;
    const productId = validateId(id, "Product Master ID");
    const body = await req.json();
    const validated = validateRequest(updateProductMasterSchema, body);

    const item = await productMasterService.update(productId, validated);
    if (!item) throw new NotFoundError("Product master");

    return NextResponse.json({
      success: true,
      data: item,
      message: "Product master updated successfully",
    });
  } catch (error) {
    console.error("[API /api/product-master/[id]] PATCH error:", error);
    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500,
    });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const { id } = await params;
    const productId = validateId(id, "Product Master ID");
    const item = await productMasterService.softDeactivate(productId);
    if (!item) throw new NotFoundError("Product master");

    return NextResponse.json({
      success: true,
      data: item,
      message: "Product master deactivated successfully",
    });
  } catch (error) {
    console.error("[API /api/product-master/[id]] DELETE error:", error);
    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500,
    });
  }
}
