import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { amcService } from "@/lib/services/amcService";
import { renewAMCSchema } from "@/lib/validations/amc";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError, NotFoundError, ConflictError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * POST /api/amc/[id]/renew - Renew an AMC contract
 *
 * Body (validated against renewAMCSchema):
 * - startDate: New contract start date (required)
 * - endDate: New contract end date (required)
 * - amount: New contract amount as string (required)
 * - copyHardwareDetails: Copy hardware details from old contract (default: true)
 * - copyServicesIncluded: Copy services from old contract (default: true)
 * - notes: Notes for the renewal (optional)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("[API /api/amc/[id]/renew] POST request received for id:", id);

    // Rate limiting
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(
      clientIp,
      rateLimitPresets.default.maxRequests,
      rateLimitPresets.default.windowMs
    );

    if (!rateLimitResult.allowed) {
      console.warn("[API /api/amc/[id]/renew] Rate limit exceeded for IP:", clientIp);
      throw new RateLimitError(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
    }

    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    const amcId = validateId(id, "AMC ID");

    // Check if original AMC exists and is renewable
    const existingAMC = await amcService.getAMCById(amcId);
    if (!existingAMC) {
      console.log("[API /api/amc/[id]/renew] AMC not found:", amcId);
      throw new NotFoundError("AMC");
    }

    if (!amcService.isAMCRenewable(existingAMC)) {
      console.log("[API /api/amc/[id]/renew] AMC not renewable:", amcId, "status:", existingAMC.status);
      throw new ConflictError("This AMC cannot be renewed. It may be cancelled or already renewed.");
    }

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(renewAMCSchema, body);

    // Create renewal (requires paid quotation + RanceLab remittance)
    const newAMC = await amcService.renewAMC(amcId, validatedData);
    console.log("[API /api/amc/[id]/renew] AMC renewed successfully:", amcId, "->", newAMC.id);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "RENEW",
        entity_type: "AMC",
        entity_id: newAMC.id,
        operator_id: authContext.profile.userId,
        details: {
          old_amc_id: amcId,
          old_contract_number: existingAMC.contractNumber,
          new_contract_number: newAMC.contractNumber,
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "AMC renewed successfully",
        data: newAMC,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      !isApiError(error) &&
      (error.message.includes("before") ||
        error.message.includes("Create and send") ||
        error.message.includes("Receive client") ||
        error.message.includes("Record RanceLab") ||
        error.message.includes("must be"))
    ) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    const { id } = await params;
    console.error("[API /api/amc/[id]/renew] AMC renewal error:", {
      id,
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
