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

// POST /api/amc/[id]/renew - Renew an AMC contract
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(
      clientIp,
      rateLimitPresets.default.maxRequests,
      rateLimitPresets.default.windowMs
    );

    if (!rateLimitResult.allowed) {
      throw new RateLimitError(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
    }

    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);
    const id = validateId(params.id, "AMC ID");

    // Check if original AMC exists and is renewable
    const existingAMC = await amcService.getAMCById(id);
    if (!existingAMC) {
      throw new NotFoundError("AMC");
    }

    if (!amcService.isAMCRenewable(existingAMC)) {
      throw new ConflictError("This AMC cannot be renewed. It may be cancelled or already renewed.");
    }

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(renewAMCSchema, body);

    // Create renewal
    const newAMC = await amcService.renewAMC(id, validatedData);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "RENEW",
        entity_type: "AMC",
        entity_id: newAMC.id,
        operator_id: profile.userId,
        details: {
          old_amc_id: id,
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
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("AMC renewal error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
