import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { assetService } from "@/lib/services/assetService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError } from "@/lib/errors";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/assets/depreciation - Get upcoming/pending depreciation
export async function GET(req: NextRequest) {
  try {
    console.log('[API /api/assets/depreciation] GET request received');

    // 🔒 Require authentication
    const authContext = await requireApiAuth(req);
    // 🔒 Require admin or staff role
    requireStaffOrAdmin(authContext.profile);

    const { searchParams } = req.nextUrl;
    const assetId = searchParams.get("assetId");

    if (assetId) {
      // Get depreciation for specific asset
      const assetIdNum = parseInt(assetId);
      const maintenance = await assetService.getMaintenanceByAssetId(assetIdNum);
      const movements = await assetService.getMovementsByAssetId(assetIdNum);

      return NextResponse.json({
        success: true,
        data: {
          maintenance,
          movements,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Use POST to run depreciation",
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error('[API /api/assets/depreciation] Error:', error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// POST /api/assets/depreciation - Run depreciation for assets
export async function POST(req: NextRequest) {
  try {
    console.log('[API /api/assets/depreciation] POST request received');

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
    // 🔒 Require admin role for depreciation
    if (authContext.profile.role !== 'ADMIN') {
      throw new Error("Only administrators can run depreciation");
    }

    const body = await req.json();
    const { assetId, schedule } = body;

    let result;

    if (schedule) {
      // Schedule depreciation for an asset
      if (!assetId) {
        throw new Error("assetId is required for scheduling");
      }
      await assetService.scheduleDepreciation(assetId);

      result = { message: "Depreciation scheduled successfully", assetId };
    } else if (assetId) {
      // Run depreciation for specific asset
      await assetService.runDepreciationForAsset(assetId);

      result = { message: "Depreciation run successfully for asset", assetId };
    } else {
      // Run depreciation for all pending assets
      result = await assetService.runDepreciationForAll();
    }

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "DEPRECIATION_RUN",
        entity_type: "ASSET",
        entity_id: assetId || null,
        operator_id: authContext.profile.userId,
        details: result,
      },
    ]);

    console.log('[API /api/assets/depreciation] Depreciation completed:', result);

    return NextResponse.json({
      success: true,
      message: "Depreciation completed successfully",
      data: result,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error('[API /api/assets/depreciation] Error:', error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
