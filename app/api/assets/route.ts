import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { assetService } from "@/lib/services/assetService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError } from "@/lib/errors";
import { validateQueryParams } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/assets - List assets with filters
export async function GET(req: NextRequest) {
  try {
    console.log('[API /api/assets] GET request received');

    // 🔒 Require authentication
    const authContext = await requireApiAuth(req);
    console.log('[API /api/assets] Auth successful:', {
      userId: authContext.user.id,
      role: authContext.profile.role,
    });

    // 🔒 Require admin or staff role
    requireStaffOrAdmin(authContext.profile);
    console.log('[API /api/assets] Role check passed');

    const searchParams = req.nextUrl.searchParams;

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    const filters: Record<string, any> = {};
    if (searchParams.get("categoryId")) filters.categoryId = parseInt(searchParams.get("categoryId")!);
    if (searchParams.get("status")) filters.status = searchParams.get("status")!;
    if (searchParams.get("location")) filters.location = searchParams.get("location")!;
    if (searchParams.get("search")) filters.search = searchParams.get("search")!;

    const result = await assetService.listAssets({
      ...filters,
      limit,
      offset,
    });

    console.log('[API /api/assets] Assets fetched successfully:', {
      count: result.assets.length,
      total: result.total,
    });

    return NextResponse.json({
      success: true,
      data: result.assets,
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
    console.error('[API /api/assets] Error:', {
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// POST /api/assets - Create a new asset
export async function POST(req: NextRequest) {
  try {
    console.log('[API /api/assets] POST request received');

    // 🔒 Rate limiting
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(
      clientIp,
      rateLimitPresets.strict.maxRequests,
      rateLimitPresets.strict.windowMs
    );

    if (!rateLimitResult.allowed) {
      throw new RateLimitError(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
    }

    // 🔒 Require authentication
    const authContext = await requireApiAuth(req);
    console.log('[API /api/assets] Auth successful:', {
      userId: authContext.user.id,
      role: authContext.profile.role,
    });

    // 🔒 Require admin or staff role
    requireStaffOrAdmin(authContext.profile);
    console.log('[API /api/assets] Role check passed');

    const body = await req.json();

    const asset = await assetService.createAsset(body, authContext.profile.userId);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CREATE",
        entity_type: "ASSET",
        entity_id: asset.id,
        operator_id: authContext.profile.userId,
        details: { asset_name: asset.name, asset_number: asset.assetNumber },
      },
    ]);

    console.log('[API /api/assets] Asset created successfully:', {
      assetId: asset.id,
      assetName: asset.name,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Asset created successfully",
        data: asset,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error('[API /api/assets] Error:', {
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
