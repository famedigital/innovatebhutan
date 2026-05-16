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

/**
 * GET /api/amc/[id] - Get a single AMC
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("[API /api/amc/[id]] GET request received for id:", id);
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    const amcId = validateId(id, "AMC ID");

    const amc = await amcService.getAMCById(amcId);
    if (!amc) {
      console.log("[API /api/amc/[id]] AMC not found:", amcId);
      throw new NotFoundError("AMC");
    }

    console.log("[API /api/amc/[id]] Returning AMC:", amcId);
    return NextResponse.json({
      success: true,
      data: amc,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    const { id } = await params.catch(() => ({ id: 'unknown' }));
    console.error("[API /api/amc/[id]] AMC fetch error:", {
      id,
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * PUT /api/amc/[id] - Update an AMC
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("[API /api/amc/[id]] PUT request received for id:", id);

    // Rate limiting
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(
      clientIp,
      rateLimitPresets.default.maxRequests,
      rateLimitPresets.default.windowMs
    );

    if (!rateLimitResult.allowed) {
      console.warn("[API /api/amc/[id]] Rate limit exceeded for IP:", clientIp);
      throw new RateLimitError(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
    }

    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    const amcId = validateId(id, "AMC ID");

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(updateAMCSchema, body);

    const amc = await amcService.updateAMC(amcId, validatedData);
    console.log("[API /api/amc/[id]] AMC updated successfully:", amcId);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "UPDATE",
        entity_type: "AMC",
        entity_id: amc.id,
        operator_id: authContext.profile.userId,
        details: { contract_number: amc.contractNumber },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "AMC updated successfully",
      data: amc,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    const { id } = await params.catch(() => ({ id: 'unknown' }));
    console.error("[API /api/amc/[id]] AMC update error:", {
      id,
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * DELETE /api/amc/[id] - Delete an AMC
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("[API /api/amc/[id]] DELETE request received for id:", id);

    // Rate limiting
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(
      clientIp,
      rateLimitPresets.default.maxRequests,
      rateLimitPresets.default.windowMs
    );

    if (!rateLimitResult.allowed) {
      console.warn("[API /api/amc/[id]] Rate limit exceeded for IP:", clientIp);
      throw new RateLimitError(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
    }

    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    const amcId = validateId(id, "AMC ID");

    await amcService.deleteAMC(amcId);
    console.log("[API /api/amc/[id]] AMC deleted successfully:", amcId);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "DELETE",
        entity_type: "AMC",
        entity_id: amcId,
        operator_id: authContext.profile.userId,
        details: {},
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "AMC deleted successfully",
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    const { id } = await params.catch(() => ({ id: 'unknown' }));
    console.error("[API /api/amc/[id]] AMC deletion error:", {
      id,
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * PATCH /api/amc/[id] - Update AMC status
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("[API /api/amc/[id]] PATCH request received for id:", id);

    // Rate limiting
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(
      clientIp,
      rateLimitPresets.default.maxRequests,
      rateLimitPresets.default.windowMs
    );

    if (!rateLimitResult.allowed) {
      console.warn("[API /api/amc/[id]] Rate limit exceeded for IP:", clientIp);
      throw new RateLimitError(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
    }

    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    const amcId = validateId(id, "AMC ID");

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(updateAMCStatusSchema, body);

    // Log to audit - fetch old AMC before update
    const oldAMC = await amcService.getAMCById(amcId);

    const amc = await amcService.updateAMCStatus(amcId, validatedData.status);
    console.log("[API /api/amc/[id]] AMC status updated:", amcId, "from", oldAMC?.status, "to", validatedData.status);

    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "STATUS_UPDATE",
        entity_type: "AMC",
        entity_id: amc.id,
        operator_id: authContext.profile.userId,
        details: { old_status: oldAMC?.status, new_status: validatedData.status },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "AMC status updated successfully",
      data: amc,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    const { id } = await params.catch(() => ({ id: 'unknown' }));
    console.error("[API /api/amc/[id]] AMC status update error:", {
      id,
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
