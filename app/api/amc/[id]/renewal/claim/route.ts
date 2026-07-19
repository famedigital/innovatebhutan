import { NextRequest, NextResponse } from "next/server";
import { amcService } from "@/lib/services/amcService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError, NotFoundError } from "@/lib/errors";
import { validateId } from "@/lib/validations/validation";
import {
  claimClientOwnership,
  getEmployeeIdByProfileId,
  getClientFocalEmployeeId,
} from "@/lib/amc/ownership";
import { getRenewalPipeline, withRenewalPipeline } from "@/lib/amc/renewal";
import { amcRepository } from "@/lib/repositories/amcRepository";

/**
 * POST /api/amc/[id]/renewal/claim — claim client ownership for this AMC
 */
export async function POST(
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

    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    const amcId = validateId(id, "AMC ID");

    const amc = await amcService.getAMCById(amcId);
    if (!amc || !amc.clientId) throw new NotFoundError("AMC");

    const employeeId = await getEmployeeIdByProfileId(authContext.profile.id);
    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: "No employee record linked to your profile. Ask admin to set up HR employee." },
        { status: 400 }
      );
    }

    await claimClientOwnership(amc.clientId, employeeId);

    const pipeline = getRenewalPipeline(amc.meta);
    await amcRepository.updateAMC(amcId, {
      meta: withRenewalPipeline(amc.meta, {
        ...pipeline,
        claimedByEmployeeId: employeeId,
      }),
    });

    const focal = await getClientFocalEmployeeId(amc.clientId);

    return NextResponse.json({
      success: true,
      message: "Client claimed — you are now the focal person",
      data: { clientId: amc.clientId, focalEmployeeId: focal },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as { statusCode?: number }).statusCode || 500 : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
