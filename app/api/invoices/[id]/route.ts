import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { invoiceService } from "@/lib/services/invoiceService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, NotFoundError, RateLimitError } from "@/lib/errors";
import { validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/invoices/[id] - Get a single invoice
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);
    const invoice = await invoiceService.getInvoiceById(validateId(params.id, "invoice ID"));
    if (!invoice) {
      throw new NotFoundError("Invoice");
    }

    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Invoice fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// PATCH /api/invoices/[id] - Update an invoice
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
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
    const invoice = await invoiceService.updateInvoice(parseInt(params.id), body);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "UPDATE",
        entity_type: "INVOICE",
        entity_id: parseInt(params.id),
        operator_id: profile.userId,
        details: { changes: body },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json(formatAuthError(error), { status: (error as any).statusCode });
    }
    console.error("Invoice update error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update invoice" },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id] - Delete an invoice
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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
    await invoiceService.deleteInvoice(parseInt(params.id));

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "DELETE",
        entity_type: "INVOICE",
        entity_id: parseInt(params.id),
        operator_id: profile.userId,
        details: {},
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json(formatAuthError(error), { status: (error as any).statusCode });
    }
    console.error("Invoice deletion error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
