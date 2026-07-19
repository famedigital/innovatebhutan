import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { amcService } from "@/lib/services/amcService";
import { renewalQuotationSchema } from "@/lib/validations/amc";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError, NotFoundError, ConflictError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * POST /api/amc/[id]/renewal/quotation — Step 1: send quotation invoice
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
    const validated = validateRequest(renewalQuotationSchema, body);
    const result = await amcService.createRenewalQuotation(amcId, validated);

    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "RENEWAL_QUOTATION",
        entity_type: "AMC",
        entity_id: amcId,
        operator_id: authContext.profile.userId,
        details: {
          invoice_id: result.invoice.id,
          invoice_number: result.invoice.invoiceNumber,
          amount: validated.amount,
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Quotation invoice created and marked as sent",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      !isApiError(error) &&
      (error.message.includes("already") ||
        error.message.includes("greater") ||
        error.message.includes("cannot be renewed") ||
        error.message.includes("no client"))
    ) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as { statusCode?: number }).statusCode || 500 : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
