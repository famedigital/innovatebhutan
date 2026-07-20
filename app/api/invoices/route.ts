import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { invoiceService } from "@/lib/services/invoiceService";
import { createInvoiceSchema, invoiceQuerySchema } from "@/lib/validations/invoice";
import { requireApiAuth, requireStaffOrAdmin, requireSeeMoney, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError } from "@/lib/errors";
import { validateRequest, validateQueryParams } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * GET /api/invoices - List invoices with filters
 * @description Fetches invoices with pagination and optional filtering by client, status, or search term
 * @requires ADMIN or STAFF role
 */
export async function GET(req: NextRequest) {
  try {
    console.log('[API /api/invoices] GET request received');
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    requireSeeMoney(authContext.profile);
    console.log('[API /api/invoices] Auth check passed for user:', authContext.user.id, 'role:', authContext.profile.role);

    const searchParams = req.nextUrl.searchParams;

    // Parse and validate query parameters
    const queryParams = validateQueryParams(invoiceQuerySchema, searchParams);
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 20;
    const { page: _, limit: __, ...filters } = queryParams;
    const offset = (page - 1) * limit;

    console.log('[API /api/invoices] Fetching invoices with filters:', { page, limit, filters });

    const result = await invoiceService.listInvoices({
      ...filters,
      limit,
      offset,
    });

    console.log('[API /api/invoices] Successfully fetched invoices:', result.invoices.length, 'total:', result.total);

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
    console.error('[API /api/invoices] GET error:', {
      error,
      statusCode,
      response: errorResponse
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * POST /api/invoices - Create a new invoice
 * @description Creates a new invoice with auto-generated invoice number (INV-YYYYMMDD-XXXX)
 * @requires ADMIN or STAFF role
 * @rateLimit Standard rate limits apply
 */
export async function POST(req: NextRequest) {
  try {
    console.log('[API /api/invoices] POST request received');
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(
      clientIp,
      rateLimitPresets.default.maxRequests,
      rateLimitPresets.default.windowMs
    );

    if (!rateLimitResult.allowed) {
      console.log('[API /api/invoices] Rate limit exceeded for IP:', clientIp);
      throw new RateLimitError(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
    }

    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    requireSeeMoney(authContext.profile);
    console.log('[API /api/invoices] Auth check passed for user:', authContext.user.id, 'role:', authContext.profile.role);

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(createInvoiceSchema, body);
    console.log('[API /api/invoices] Validated invoice data:', { clientId: validatedData.clientId, itemCount: validatedData.items?.length });

    // Ensure issueDate is defined (has a default in schema but type inference doesn't account for it)
    const invoiceData = {
      ...validatedData,
      issueDate: validatedData.issueDate ?? new Date(),
    };

    const invoice = await invoiceService.generateInvoice(invoiceData);

    console.log('[API /api/invoices] Invoice created successfully:', { id: invoice.id, invoiceNumber: invoice.invoiceNumber });

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CREATE",
        entity_type: "INVOICE",
        entity_id: invoice.id,
        operator_id: authContext.profile.userId,
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
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error('[API /api/invoices] POST error:', {
      error,
      statusCode,
      response: errorResponse
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
