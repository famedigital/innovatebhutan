import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { employeeService } from "@/lib/services/employeeService";
import { updateEmployeeSchema } from "@/lib/validations/employee";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, NotFoundError, RateLimitError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/employees/[id] - Get employee by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const { id } = await params;
    const employeeId = validateId(id, "employee ID");

    const employee = await employeeService.getEmployeeById(employeeId);

    if (!employee) {
      throw new NotFoundError("Employee");
    }

    return NextResponse.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Employee fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// PATCH /api/employees/[id] - Update employee
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { id } = await params;
    const employeeId = validateId(id, "employee ID");

    const body = await req.json();
    const validatedData = validateRequest(updateEmployeeSchema, body);

    const existing = await employeeService.getEmployeeById(employeeId);
    if (!existing) {
      throw new NotFoundError("Employee");
    }

    const updated = await employeeService.updateEmployee(employeeId, validatedData);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "UPDATE",
        entity_type: "EMPLOYEE",
        entity_id: employeeId,
        operator_id: profile.id,
        details: { changes: validatedData, updatedById: profile.userId },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Employee updated successfully",
      data: updated,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Employee update error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// DELETE /api/employees/[id] - Delete/terminate employee
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { id } = await params;
    const employeeId = validateId(id, "employee ID");

    const existing = await employeeService.getEmployeeById(employeeId);
    if (!existing) {
      throw new NotFoundError("Employee");
    }

    // If active, terminate instead of delete
    if (existing.status === "active") {
      await employeeService.terminateEmployee(employeeId);

      // Log to audit
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("audit_logs").insert([
        {
          action: "UPDATE",
          entity_type: "EMPLOYEE",
          entity_id: employeeId,
          operator_id: profile.id,
          details: { action: "terminate", previousStatus: "active", terminatedById: profile.userId },
        },
      ]);

      return NextResponse.json({
        success: true,
        message: "Employee terminated successfully",
      });
    }

    // Hard delete for non-active employees
    await employeeService.deleteEmployee(employeeId);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "DELETE",
        entity_type: "EMPLOYEE",
        entity_id: employeeId,
        operator_id: profile.id,
        details: { deletedById: profile.userId },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Employee delete error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
