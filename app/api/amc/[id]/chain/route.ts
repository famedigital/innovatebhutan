import { NextRequest, NextResponse } from "next/server";
import { amcService } from "@/lib/services/amcService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError, NotFoundError } from "@/lib/errors";
import { validateId } from "@/lib/validations/validation";

/**
 * GET /api/amc/[id]/chain - Get renewal chain for an AMC
 * Shows all previous and linked renewals
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("[API /api/amc/[id]/chain] GET request received for id:", id);
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    const amcId = validateId(id, "AMC ID");

    // Verify AMC exists
    const amc = await amcService.getAMCById(amcId);
    if (!amc) {
      console.log("[API /api/amc/[id]/chain] AMC not found:", amcId);
      throw new NotFoundError("AMC");
    }

    const chain = await amcService.getRenewalChain(amcId);
    console.log("[API /api/amc/[id]/chain] Found chain of length:", chain.length);

    return NextResponse.json({
      success: true,
      data: chain,
      meta: {
        chainLength: chain.length,
        requestedId: amcId,
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    const { id } = await params.catch(() => ({ id: 'unknown' }));
    console.error("[API /api/amc/[id]/chain] AMC chain fetch error:", {
      id,
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
