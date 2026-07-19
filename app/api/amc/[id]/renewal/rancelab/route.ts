import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { amcService } from "@/lib/services/amcService";
import { rancelabRemittanceSchema } from "@/lib/validations/amc";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError, NotFoundError, ConflictError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * POST /api/amc/[id]/renewal/rancelab — Step 3: record remittance to RanceLab
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

    const existing = await amcService.getAMCById(amcId);
    if (!existing) throw new NotFoundError("AMC");
    if (!amcService.isAMCRenewable(existing)) {
      throw new ConflictError("This AMC cannot be renewed.");
    }

    const body = await req.json();
    const validated = validateRequest(rancelabRemittanceSchema, body);
    const result = await amcService.saveRancelabRemittance(amcId, validated);

    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "RENEWAL_RANCELAB",
        entity_type: "AMC",
        entity_id: amcId,
        operator_id: authContext.profile.userId,
        details: validated,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "RanceLab remittance saved",
      data: result,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as { statusCode?: number }).statusCode || 500 : 500;
    // Business rule errors from service come as generic Error → 500; map message to 400
    if (
      error instanceof Error &&
      !isApiError(error) &&
      (error.message.includes("before") ||
        error.message.includes("required") ||
        error.message.includes("Create a quotation"))
    ) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
