import { NextRequest, NextResponse } from "next/server";
import { purchaseMasterService } from "@/lib/services/purchaseMasterService";
import { updatePurchaseMasterSchema } from "@/lib/validations/purchaseMaster";
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
    const purchaseId = validateId(id, "Purchase ID");
    const purchase = await purchaseMasterService.getById(purchaseId);
    if (!purchase) throw new NotFoundError("Purchase");

    return NextResponse.json({ success: true, data: purchase });
  } catch (error) {
    console.error("[API /api/purchases/[id]] GET error:", error);
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
    const purchaseId = validateId(id, "Purchase ID");
    const body = await req.json();
    const validated = validateRequest(updatePurchaseMasterSchema, body);

    const purchase = await purchaseMasterService.update(purchaseId, validated);
    if (!purchase) throw new NotFoundError("Purchase");

    return NextResponse.json({
      success: true,
      data: purchase,
      message: "Purchase updated successfully",
    });
  } catch (error) {
    console.error("[API /api/purchases/[id]] PATCH error:", error);
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
    const purchaseId = validateId(id, "Purchase ID");
    const deleted = await purchaseMasterService.delete(purchaseId);
    if (!deleted) throw new NotFoundError("Purchase");

    return NextResponse.json({
      success: true,
      message: "Purchase deleted successfully",
    });
  } catch (error) {
    console.error("[API /api/purchases/[id]] DELETE error:", error);
    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500,
    });
  }
}
