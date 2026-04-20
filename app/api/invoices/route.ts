import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { invoiceService } from "@/lib/services/invoiceService";
import { createInvoiceSchema, invoiceQuerySchema } from "@/lib/validations/invoice";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError } from "@/lib/errors";
import { validateRequest, validateQueryParams } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/invoices - List invoices with filters
export async function GET(req: NextRequest) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);
    const searchParams = req.nextUrl.searchParams;

    // Parse and validate query parameters
    const { page, limit, ...filters } = validateQueryParams(invoiceQuerySchema, searchParams);
    const offset = (page - 1) * limit;

    const result = await invoiceService.listInvoices({
      ...filters,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: result.invoices,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Invoices fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(req: NextRequest) {
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
    const validatedData = validateRequest(createInvoiceSchema, body);

    const invoice = await invoiceService.generateInvoice(validatedData);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CREATE",
        entity_type: "INVOICE",
        entity_id: invoice.id,
        operator_id: profile.userId,
        details: { invoice_number: invoice.invoiceNumber, client_id: invoice.clientId },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Invoice created successfully",
        data: invoice,
      },
      { status: 201 }
    );
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json(formatAuthError(error), { status: (error as any).statusCode });
    }
    console.error("Invoice creation error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create invoice" },
      { status: 500 }
    );
  }
}
