import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { invoiceService } from "@/lib/services/invoiceService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, NotFoundError, RateLimitError } from "@/lib/errors";
import { validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * GET /api/invoices/[id] - Get a single invoice
 * @description Fetches a single invoice by ID
 * @requires ADMIN or STAFF role
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('[API /api/invoices/[id]] GET request received for invoice:', id);
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    console.log('[API /api/invoices/[id]] Auth check passed for user:', authContext.user.id);

    const invoiceId = validateId(id, "invoice ID");
    const invoice = await invoiceService.getInvoiceById(invoiceId);
    if (!invoice) {
      console.log('[API /api/invoices/[id]] Invoice not found:', invoiceId);
      throw new NotFoundError("Invoice");
    }

    console.log('[API /api/invoices/[id]] Invoice fetched successfully:', { id: invoice.id, invoiceNumber: invoice.invoiceNumber });

    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    const { id } = await params.catch(() => ({ id: 'unknown' }));
    console.error('[API /api/invoices/[id]] GET error:', {
      invoiceId: id,
      error,
      statusCode,
      response: errorResponse
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * PATCH /api/invoices/[id] - Update an invoice
 * @description Updates an existing invoice (only draft invoices can be edited)
 * @requires ADMIN or STAFF role
 * @rateLimit Standard rate limits apply
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('[API /api/invoices/[id]] PATCH request received for invoice:', id);
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(
      clientIp,
      rateLimitPresets.default.maxRequests,
      rateLimitPresets.default.windowMs
    );

    if (!rateLimitResult.allowed) {
      console.log('[API /api/invoices/[id]] Rate limit exceeded for IP:', clientIp);
      throw new RateLimitError(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
    }

    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    console.log('[API /api/invoices/[id]] Auth check passed for user:', authContext.user.id);

    const body = await req.json();
    const invoiceId = validateId(id, "invoice ID");
    console.log('[API /api/invoices/[id]] Updating invoice:', invoiceId);

    const invoice = await invoiceService.updateInvoice(invoiceId, body);

    console.log('[API /api/invoices/[id]] Invoice updated successfully:', { id: invoice.id, invoiceNumber: invoice.invoiceNumber });

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "UPDATE",
        entity_type: "INVOICE",
        entity_id: invoiceId,
        operator_id: authContext.profile.userId,
        details: { changes: body },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    const { id } = await params.catch(() => ({ id: 'unknown' }));
    console.error('[API /api/invoices/[id]] PATCH error:', {
      invoiceId: id,
      error,
      statusCode,
      response: errorResponse
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * DELETE /api/invoices/[id] - Delete an invoice
 * @description Deletes an invoice (only draft invoices can be deleted)
 * @requires ADMIN or STAFF role
 * @rateLimit Standard rate limits apply
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('[API /api/invoices/[id]] DELETE request received for invoice:', id);
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(
      clientIp,
      rateLimitPresets.default.maxRequests,
      rateLimitPresets.default.windowMs
    );

    if (!rateLimitResult.allowed) {
      console.log('[API /api/invoices/[id]] Rate limit exceeded for IP:', clientIp);
      throw new RateLimitError(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
    }

    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    console.log('[API /api/invoices/[id]] Auth check passed for user:', authContext.user.id);

    const invoiceId = validateId(id, "invoice ID");
    console.log('[API /api/invoices/[id]] Deleting invoice:', invoiceId);

    await invoiceService.deleteInvoice(invoiceId);

    console.log('[API /api/invoices/[id]] Invoice deleted successfully:', invoiceId);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "DELETE",
        entity_type: "INVOICE",
        entity_id: invoiceId,
        operator_id: authContext.profile.userId,
        details: {},
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    const { id } = await params.catch(() => ({ id: 'unknown' }));
    console.error('[API /api/invoices/[id]] DELETE error:', {
      invoiceId: id,
      error,
      statusCode,
      response: errorResponse
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
