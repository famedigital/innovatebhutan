import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { amcService } from "@/lib/services/amcService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError, NotFoundError } from "@/lib/errors";
import { validateId, validateRequest } from "@/lib/validations/validation";
import { getRenewalPipeline, withRenewalPipeline } from "@/lib/amc/renewal";
import { amcRepository } from "@/lib/repositories/amcRepository";

const renewalMetaSchema = z
  .object({
    quotationPdfUrl: z.string().url().optional(),
    markShared: z.boolean().optional(),
  })
  .refine((d) => !!d.quotationPdfUrl || d.markShared === true, {
    message: "Provide quotationPdfUrl or markShared",
  });

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

/**
 * PATCH /api/amc/[id]/renewal — store quotation PDF URL after client upload
 */
export async function PATCH(
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
    const amc = await amcService.getAMCById(amcId);
    if (!amc) throw new NotFoundError("AMC");

    const body = await req.json();
    const validated = validateRequest(renewalMetaSchema, body);
    const pipeline = getRenewalPipeline(amc.meta);

    const updated = await amcRepository.updateAMC(amcId, {
      meta: withRenewalPipeline(amc.meta, {
        ...pipeline,
        ...(validated.quotationPdfUrl
          ? { quotationPdfUrl: validated.quotationPdfUrl }
          : {}),
        quotationSharedAt: new Date().toISOString(),
      }),
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as { statusCode?: number }).statusCode || 500 : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
