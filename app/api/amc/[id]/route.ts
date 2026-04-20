import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { amcService } from "@/lib/services/amcService";
import { updateAMCSchema, updateAMCStatusSchema } from "@/lib/validations/amc";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError, NotFoundError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/amc/[id] - Get a single AMC
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);
    const id = validateId(params.id, "AMC ID");

    const amc = await amcService.getAMCById(id);
    if (!amc) {
      throw new NotFoundError("AMC");
    }

    return NextResponse.json({
      success: true,
      data: amc,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("AMC fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// PUT /api/amc/[id] - Update an AMC
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const id = validateId(params.id, "AMC ID");

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(updateAMCSchema, body);

    const amc = await amcService.updateAMC(id, validatedData);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "UPDATE",
        entity_type: "AMC",
        entity_id: amc.id,
        operator_id: profile.userId,
        details: { contract_number: amc.contractNumber },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "AMC updated successfully",
      data: amc,
    });
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json(formatAuthError(error), { status: (error as any).statusCode });
    }
    console.error("AMC update error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update AMC" },
      { status: 500 }
    );
  }
}

// DELETE /api/amc/[id] - Delete an AMC
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const id = validateId(params.id, "AMC ID");

    await amcService.deleteAMC(id);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "DELETE",
        entity_type: "AMC",
        entity_id: id,
        operator_id: profile.userId,
        details: {},
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "AMC deleted successfully",
    });
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json(formatAuthError(error), { status: (error as any).statusCode });
    }
    console.error("AMC deletion error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete AMC" },
      { status: 500 }
    );
  }
}

// PATCH /api/amc/[id] - Update AMC status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const id = validateId(params.id, "AMC ID");

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(updateAMCStatusSchema, body);

    const amc = await amcService.updateAMCStatus(id, validatedData.status);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "STATUS_UPDATE",
        entity_type: "AMC",
        entity_id: amc.id,
        operator_id: profile.userId,
        details: { old_status: amc.status, new_status: validationResult.data.status },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "AMC status updated successfully",
      data: amc,
    });
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json(formatAuthError(error), { status: (error as any).statusCode });
    }
    console.error("AMC status update error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update AMC status" },
      { status: 500 }
    );
  }
}
