import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { invoiceService } from "@/lib/services/invoiceService";
import { updateInvoiceStatusSchema } from "@/lib/validations/invoice";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// PUT /api/invoices/[id]/status - Update invoice status
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(updateInvoiceStatusSchema, body);

    const invoice = await invoiceService.updateInvoiceStatus(
      validateId(params.id, "invoice ID"),
      validatedData.status
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "STATUS_CHANGE",
        entity_type: "INVOICE",
        entity_id: parseInt(params.id),
        operator_id: profile.userId,
        details: { old_status: invoice.status, new_status: validationResult.data.status },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: `Invoice status updated to ${validationResult.data.status}`,
      data: invoice,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Invoice status update error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
