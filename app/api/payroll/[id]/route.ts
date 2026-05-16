import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { payrollService } from "@/lib/services/payrollService";
import { updatePayslipSchema } from "@/lib/validations/payroll";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, NotFoundError, RateLimitError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/payroll/[id] - Get a specific payslip
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("[API /api/payroll/[id]] Fetching payslip by ID");

    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    console.log("[API /api/payroll/[id]] Auth verified for user:", authContext.profile.userId);

    const { id } = await params;
    const payslipId = validateId(id, "payslip ID");

    console.log("[API /api/payroll/[id]] Fetching payslip:", payslipId);
    const payslip = await payrollService.getPayslipById(payslipId);

    if (!payslip) {
      throw new NotFoundError("Payslip");
    }

    return NextResponse.json({
      success: true,
      data: payslip,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("[API /api/payroll/[id]] Payslip fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// PATCH /api/payroll/[id] - Update a payslip
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("[API /api/payroll/[id]] Updating payslip");

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

    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    console.log("[API /api/payroll/[id]] Auth verified for user:", authContext.profile.userId);

    const { id } = await params;
    const payslipId = validateId(id, "payslip ID");

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(updatePayslipSchema, body);

    // Check if payslip exists
    const existing = await payrollService.getPayslipById(payslipId);
    if (!existing) {
      throw new NotFoundError("Payslip");
    }

    console.log("[API /api/payroll/[id]] Updating payslip:", payslipId, "with data:", validatedData);

    // Note: Full update functionality will be available after schema migration
    // For now, status transitions are supported
    let updatedPayslip;
    if (validatedData.status) {
      updatedPayslip = await payrollService.transitionPayslipStatus(payslipId, validatedData.status);
      console.log("[API /api/payroll/[id]] Status transitioned to:", validatedData.status);
    } else {
      updatedPayslip = existing;
    }

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "UPDATE",
        entity_type: "PAYSLIP",
        entity_id: payslipId,
        operator_id: authContext.profile.userId,
        details: validatedData,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Payslip updated successfully",
      data: updatedPayslip,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("[API /api/payroll/[id]] Payslip update error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// DELETE /api/payroll/[id] - Delete/cancel a payslip
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log("[API /api/payroll/[id]] Deleting/cancelling payslip");

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

    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    console.log("[API /api/payroll/[id]] Auth verified for user:", authContext.profile.userId);

    const { id } = await params;
    const payslipId = validateId(id, "payslip ID");

    // Check if payslip exists
    const existing = await payrollService.getPayslipById(payslipId);
    if (!existing) {
      throw new NotFoundError("Payslip");
    }

    console.log("[API /api/payroll/[id]] Payslip status:", existing.status);

    // Only draft payslips can be deleted, others must be cancelled
    if (existing.status === "draft") {
      // TODO: Implement delete after migration
      // await payrollRepository.deletePayslip(payslipId);
      console.log("[API /api/payroll/[id]] Delete functionality pending migration");
      return NextResponse.json(
        { success: false, error: "Delete functionality pending migration" },
        { status: 501 }
      );
    } else {
      // Cancel instead
      console.log("[API /api/payroll/[id]] Cancelling payslip:", payslipId);
      const cancelled = await payrollService.cancelPayslip(payslipId);

      // Log to audit
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("audit_logs").insert([
        {
          action: "DELETE",
          entity_type: "PAYSLIP",
          entity_id: payslipId,
          operator_id: authContext.profile.userId,
          details: { cancelled: true, previous_status: existing.status },
        },
      ]);

      return NextResponse.json({
        success: true,
        message: "Payslip cancelled successfully",
        data: cancelled,
      });
    }
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("[API /api/payroll/[id]] Payslip delete error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
