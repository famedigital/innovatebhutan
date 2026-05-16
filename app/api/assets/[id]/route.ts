import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { assetService } from "@/lib/services/assetService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, ForbiddenError, RateLimitError, NotFoundError } from "@/lib/errors";
import { validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/assets/[id] - Get a single asset
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔒 Require authentication
    const { profile } = await requireApiAuth(req);
    // 🔒 Require admin or staff role
    requireStaffOrAdmin(profile);

    const { id } = await params;
    const assetId = validateId(id, "asset ID");

    const asset = await assetService.getAssetById(assetId);

    if (!asset) {
      throw new NotFoundError("Asset");
    }

    // Get related data
    const [maintenance, movements] = await Promise.all([
      assetService.getMaintenanceByAssetId(assetId),
      assetService.getMovementsByAssetId(assetId),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        asset,
        maintenance,
        movements,
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Asset fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// PATCH /api/assets/[id] - Update an asset
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    const { profile } = await requireApiAuth(req);

    const { id } = await params;
    const assetId = validateId(id, "asset ID");

    const body = await req.json();

    // Check if this is a status transition request
    if (body.action === 'transition_status' && body.newStatus) {
      const asset = await assetService.transitionAssetStatus(assetId, body.newStatus);

      // Log to audit
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("audit_logs").insert([
        {
          action: "STATUS_TRANSITION",
          entity_type: "ASSET",
          entity_id: assetId,
          operator_id: profile.userId,
          details: { old_status: body.oldStatus, new_status: body.newStatus },
        },
      ]);

      return NextResponse.json({
        success: true,
        message: "Asset status updated successfully",
        data: asset,
      });
    }

    // Normal update path
    // 🔒 Require admin or staff role for updates
    requireStaffOrAdmin(profile);

    const asset = await assetService.updateAsset(
      assetId,
      body,
      profile.userId,
      profile.role
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "UPDATE",
        entity_type: "ASSET",
        entity_id: assetId,
        operator_id: profile.userId,
        details: { updates: body },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Asset updated successfully",
      data: asset,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Asset update error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// DELETE /api/assets/[id] - Delete an asset
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    const { profile } = await requireApiAuth(req);
    // 🔒 Require admin role for deletion
    if (profile.role !== 'ADMIN') {
      throw new ForbiddenError("Only administrators can delete assets");
    }

    const { id } = await params;
    const assetId = validateId(id, "asset ID");

    await assetService.deleteAsset(assetId, profile.role);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "DELETE",
        entity_type: "ASSET",
        entity_id: assetId,
        operator_id: profile.userId,
        details: { deleted_asset_id: assetId },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Asset deleted successfully",
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Asset deletion error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
