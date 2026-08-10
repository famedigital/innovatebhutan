import { NextRequest, NextResponse } from "next/server";
import { quotationService } from "@/lib/services/quotationService";
import {
  updateQuotationSchema,
  updateQuotationStatusSchema,
} from "@/lib/validations/quotation";
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
    const quotationId = validateId(id, "Quotation ID");
    const quotation = await quotationService.getByIdWithLiveDepositQr(quotationId);
    if (!quotation) throw new NotFoundError("Quotation");

    return NextResponse.json({ success: true, data: quotation });
  } catch (error) {
    console.error("[API /api/quotations/[id]] GET error:", error);
    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500,
    });
  }
}

/** Full quotation edit (customer, lines, advance %) */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const { id } = await params;
    const quotationId = validateId(id, "Quotation ID");
    const body = await req.json();
    const validated = validateRequest(updateQuotationSchema, body);

    const quotation = await quotationService.update(quotationId, validated);
    if (!quotation) throw new NotFoundError("Quotation");

    const withQr = await quotationService.getByIdWithLiveDepositQr(quotationId);

    return NextResponse.json({
      success: true,
      data: withQr || quotation,
      message: "Quotation updated successfully",
    });
  } catch (error) {
    console.error("[API /api/quotations/[id]] PUT error:", error);
    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500,
    });
  }
}

/** Status-only update */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const { id } = await params;
    const quotationId = validateId(id, "Quotation ID");
    const body = await req.json();
    const validated = validateRequest(updateQuotationStatusSchema, body);

    const quotation = await quotationService.updateStatus(
      quotationId,
      validated.status
    );
    if (!quotation) throw new NotFoundError("Quotation");

    return NextResponse.json({
      success: true,
      data: quotation,
      message: "Quotation status updated successfully",
    });
  } catch (error) {
    console.error("[API /api/quotations/[id]] PATCH error:", error);
    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500,
    });
  }
}
