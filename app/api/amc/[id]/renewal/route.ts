import { NextRequest, NextResponse } from "next/server";
import { amcService } from "@/lib/services/amcService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError, NotFoundError } from "@/lib/errors";
import { validateId } from "@/lib/validations/validation";

/**
 * GET /api/amc/[id]/renewal — renewal pipeline status
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(
      clientIp,
      rateLimitPresets.default.maxRequests,
      rateLimitPresets.default.windowMs
    );
    if (!rateLimitResult.allowed) {
      throw new RateLimitError(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
    }

    await requireApiAuth(req).then((ctx) => requireStaffOrAdmin(ctx.profile));
    const amcId = validateId(id, "AMC ID");

    const status = await amcService.getRenewalStatus(amcId);
    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as { statusCode?: number }).statusCode || 500 : 500;
    if (error instanceof Error && error.message === "AMC not found") {
      return NextResponse.json(formatApiError(new NotFoundError("AMC")), { status: 404 });
    }
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
