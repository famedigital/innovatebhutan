import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { attendanceService } from "@/lib/services/attendanceService";
import { updateAttendanceSchema } from "@/lib/validations/attendance";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, NotFoundError, RateLimitError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/attendance/[id] - Get attendance record by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const { id } = await params;
    const attendanceId = validateId(id, "attendance ID");

    const attendance = await attendanceService.getAttendanceById(attendanceId);

    if (!attendance) {
      throw new NotFoundError("Attendance record");
    }

    return NextResponse.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Attendance fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// PATCH /api/attendance/[id] - Update attendance record
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
    const attendanceId = validateId(id, "attendance ID");

    const body = await req.json();
    const validatedData = validateRequest(updateAttendanceSchema, body);

    const existing = await attendanceService.getAttendanceById(attendanceId);
    if (!existing) {
      throw new NotFoundError("Attendance record");
    }

    const updated = await attendanceService.updateAttendance(attendanceId, validatedData);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "UPDATE",
        entity_type: "ATTENDANCE",
        entity_id: attendanceId,
        operator_id: profile.id,
        details: { changes: validatedData, updatedById: profile.userId },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Attendance updated successfully",
      data: updated,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Attendance update error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// DELETE /api/attendance/[id] - Delete attendance record
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
    const attendanceId = validateId(id, "attendance ID");

    const existing = await attendanceService.getAttendanceById(attendanceId);
    if (!existing) {
      throw new NotFoundError("Attendance record");
    }

    await attendanceService.deleteAttendance(attendanceId);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "DELETE",
        entity_type: "ATTENDANCE",
        entity_id: attendanceId,
        operator_id: profile.id,
        details: { deletedById: profile.userId },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Attendance delete error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
