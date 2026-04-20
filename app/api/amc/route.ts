import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { amcService } from "@/lib/services/amcService";
import { createAMCSchema, amcQuerySchema } from "@/lib/validations/amc";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError } from "@/lib/errors";
import { validateRequest, validateQueryParams } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/amc - List AMCs with filters
export async function GET(req: NextRequest) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);
    const searchParams = req.nextUrl.searchParams;

    // Parse and validate query parameters
    const { page, limit, ...filters } = validateQueryParams(amcQuerySchema, searchParams);
    const offset = (page - 1) * limit;

    const result = await amcService.listAMCs({
      ...filters,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: result.amcs,
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
    console.error("AMCs fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// POST /api/amc - Create a new AMC
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
    const validatedData = validateRequest(createAMCSchema, body);

    const amc = await amcService.createAMC(validatedData);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CREATE",
        entity_type: "AMC",
        entity_id: amc.id,
        operator_id: profile.userId,
        details: {
          contract_number: amc.contractNumber,
          client_id: amc.clientId,
          amount: amc.amount,
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "AMC created successfully",
        data: amc,
      },
      { status: 201 }
    );
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json(formatAuthError(error), { status: (error as any).statusCode });
    }
    console.error("AMC creation error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create AMC" },
      { status: 500 }
    );
  }
}
