import { NextRequest, NextResponse } from "next/server";
import { quotationService } from "@/lib/services/quotationService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { validateId } from "@/lib/validations/validation";
import { NotFoundError } from "@/lib/errors";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const { id } = await params;
    const quotationId = validateId(id, "Quotation ID");

    const result = await quotationService.convertToProject(
      quotationId,
      authContext.user.id
    );
    if (!result) throw new NotFoundError("Quotation");

    // UI expects a single quotation object (with projectId), not { quotation, project }
    return NextResponse.json({
      success: true,
      data: result.quotation,
      message: "Quotation converted to project",
    });
  } catch (error) {
    console.error("[API /api/quotations/[id]/convert] POST error:", error);
    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500,
    });
  }
}
