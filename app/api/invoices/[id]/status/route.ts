import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { invoiceService } from "@/lib/services/invoiceService";
import { updateInvoiceStatusSchema } from "@/lib/validations/invoice";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError, NotFoundError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * PUT /api/invoices/[id]/status - Update invoice status
 * @description Updates the status of an invoice (draft -> sent -> paid/overdue/cancelled)
 * @requires ADMIN or STAFF role
 * @rateLimit Standard rate limits apply
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('[API /api/invoices/[id]/status] PUT request received for invoice:', id);
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(
      clientIp,
      rateLimitPresets.default.maxRequests,
      rateLimitPresets.default.windowMs
    );

    if (!rateLimitResult.allowed) {
      console.log('[API /api/invoices/[id]/status] Rate limit exceeded for IP:', clientIp);
      throw new RateLimitError(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
    }

    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    console.log('[API /api/invoices/[id]/status] Auth check passed for user:', authContext.user.id);

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(updateInvoiceStatusSchema, body);
    const invoiceId = validateId(id, "invoice ID");
    const newStatus = validatedData.status;

    console.log('[API /api/invoices/[id]/status] Updating invoice status:', { invoiceId, newStatus });

    // Get current invoice for audit logging
    const currentInvoice = await invoiceService.getInvoiceById(invoiceId);
    if (!currentInvoice) {
      throw new NotFoundError("Invoice");
    }

    const invoice = await invoiceService.updateInvoiceStatus(invoiceId, newStatus);

    console.log('[API /api/invoices/[id]/status] Invoice status updated successfully:', { id: invoice.id, oldStatus: currentInvoice.status, newStatus });

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "STATUS_CHANGE",
        entity_type: "INVOICE",
        entity_id: invoiceId,
        operator_id: authContext.profile.userId,
        details: { old_status: currentInvoice.status, new_status: newStatus },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: `Invoice status updated to ${newStatus}`,
      data: invoice,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    const { id } = await params.catch(() => ({ id: 'unknown' }));
    console.error('[API /api/invoices/[id]/status] PUT error:', {
      invoiceId: id,
      error,
      statusCode,
      response: errorResponse
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
