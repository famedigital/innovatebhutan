import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { assetService } from "@/lib/services/assetService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError, NotFoundError } from "@/lib/errors";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/assets/maintenance - Get maintenance records
export async function GET(req: NextRequest) {
  try {
    console.log('[API /api/assets/maintenance] GET request received');

    // 🔒 Require authentication
    const authContext = await requireApiAuth(req);
    // 🔒 Require admin or staff role
    requireStaffOrAdmin(authContext.profile);

    const { searchParams } = req.nextUrl;
    const assetId = searchParams.get("assetId");
    const upcoming = searchParams.get("upcoming") === "true";

    if (upcoming) {
      const upcomingMaintenance = await assetService.getUpcomingMaintenance();
      return NextResponse.json({
        success: true,
        data: upcomingMaintenance,
      });
    }

    if (assetId) {
      const assetIdNum = parseInt(assetId);
      const maintenance = await assetService.getMaintenanceByAssetId(assetIdNum);
      return NextResponse.json({
        success: true,
        data: maintenance,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Specify assetId or upcoming=true",
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error('[API /api/assets/maintenance] Error:', error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// POST /api/assets/maintenance - Create maintenance record or complete maintenance
export async function POST(req: NextRequest) {
  try {
    console.log('[API /api/assets/maintenance] POST request received');

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
    // 🔒 Require admin or staff role
    requireStaffOrAdmin(authContext.profile);

    const body = await req.json();
    const { action, assetId } = body;

    if (action === 'complete' && assetId) {
      // Complete maintenance - return asset to active status
      const asset = await assetService.completeMaintenance(assetId);

      // Log to audit
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("audit_logs").insert([
        {
          action: "MAINTENANCE_COMPLETE",
          entity_type: "ASSET",
          entity_id: assetId,
          operator_id: authContext.profile.userId,
          details: { asset_id: assetId },
        },
      ]);

      return NextResponse.json({
        success: true,
        message: "Maintenance completed successfully",
        data: asset,
      });
    }

    // Create new maintenance record
    const maintenance = await assetService.createMaintenance(body, authContext.profile.role);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "MAINTENANCE_CREATE",
        entity_type: "ASSET",
        entity_id: maintenance.assetId,
        operator_id: authContext.profile.userId,
        details: { maintenance_type: body.maintenanceType },
      },
    ]);

    console.log('[API /api/assets/maintenance] Maintenance created:', {
      maintenanceId: maintenance.id,
      assetId: maintenance.assetId,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Maintenance record created successfully",
        data: maintenance,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error('[API /api/assets/maintenance] Error:', error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
