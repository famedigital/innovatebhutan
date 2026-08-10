import { NextRequest, NextResponse } from "next/server";
import { quotationService } from "@/lib/services/quotationService";
import { markAdvancePaidSchema } from "@/lib/validations/quotation";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { validateRequest, validateId } from "@/lib/validations/validation";
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

    let proofUrl: string | null | undefined;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const text = await req.text();
      if (text.trim()) {
        const validated = validateRequest(markAdvancePaidSchema, JSON.parse(text));
        proofUrl = validated.proofUrl;
      }
    }

    const quotation = await quotationService.markAdvancePaid(quotationId, proofUrl);
    if (!quotation) throw new NotFoundError("Quotation");

    return NextResponse.json({
      success: true,
      data: quotation,
      message: "Advance marked as paid",
    });
  } catch (error) {
    console.error("[API /api/quotations/[id]/advance] POST error:", error);
    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500,
    });
  }
}
