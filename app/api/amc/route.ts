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

/**
 * GET /api/amc - List AMCs with filters
 *
 * Query params:
 * - clientId: Filter by client ID
 * - serviceId: Filter by service ID
 * - status: Filter by status (active, expiring, expired, cancelled)
 * - search: Search in contract number and notes
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 */
export async function GET(req: NextRequest) {
  try {
    console.log("[API /api/amc] GET request received");
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    console.log("[API /api/amc] Auth successful for user:", authContext.profile.userId);

    const searchParams = req.nextUrl.searchParams;

    // Parse and validate query parameters
    const queryParams = validateQueryParams(amcQuerySchema, searchParams);
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 20;
    const { page: _, limit: __, owner, ...filters } = queryParams;
    const offset = (page - 1) * limit;

    let focalEmployeeId: number | undefined;
    if (owner && owner !== "all") {
      const { getEmployeeIdByProfileId } = await import("@/lib/amc/ownership");
      const empId = await getEmployeeIdByProfileId(authContext.profile.id);
      if (empId) focalEmployeeId = empId;
    }

    const result = await amcService.listAMCs({
      ...filters,
      owner: owner || "all",
      focalEmployeeId,
      limit,
      offset,
    });

    console.log("[API /api/amc] Returning", result.amcs.length, "AMCs, total:", result.total);

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
    console.error("[API /api/amc] AMCs fetch error:", {
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * POST /api/amc - Create a new AMC
 *
 * Body (validated against createAMCSchema):
 * - clientId: Client ID (required)
 * - serviceId: Service ID (optional)
 * - contractNumber: Contract number (required)
 * - startDate: Contract start date (required)
 * - endDate: Contract end date (required)
 * - amount: Contract amount as string (required)
 * - hardwareDetails: Hardware details object (optional)
 * - servicesIncluded: Array of service names (optional)
 * - notes: Additional notes (optional)
 */
export async function POST(req: NextRequest) {
  try {
    console.log("[API /api/amc] POST request received");

    // Rate limiting
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(
      clientIp,
      rateLimitPresets.default.maxRequests,
      rateLimitPresets.default.windowMs
    );

    if (!rateLimitResult.allowed) {
      console.warn("[API /api/amc] Rate limit exceeded for IP:", clientIp);
      throw new RateLimitError(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
    }

    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    console.log("[API /api/amc] Auth successful for user:", authContext.profile.userId);

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(createAMCSchema, body);

    const amc = await amcService.createAMC(validatedData);
    console.log("[API /api/amc] AMC created successfully:", amc.id);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CREATE",
        entity_type: "AMC",
        entity_id: amc.id,
        operator_id: authContext.profile.userId,
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
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("[API /api/amc] AMC creation error:", {
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
