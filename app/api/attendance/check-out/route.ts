import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { attendanceService } from "@/lib/services/attendanceService";
import { checkOutSchema } from "@/lib/validations/attendance";
import { requireApiAuth, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError } from "@/lib/errors";
import { validateRequest } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// POST /api/attendance/check-out - Check out an employee
export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(
      clientIp,
      rateLimitPresets.strict.maxRequests,
      rateLimitPresets.strict.windowMs
    );

    if (!rateLimitResult.allowed) {
      throw new RateLimitError(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
    }

    const { profile } = await requireApiAuth(req);

    const body = await req.json();
    const validatedData = validateRequest(checkOutSchema, body);

    const result = await attendanceService.checkOut(validatedData);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CHECK_OUT",
        entity_type: "ATTENDANCE",
        entity_id: result.attendance.id,
        operator_id: profile.id,
        details: {
          attendanceId: validatedData.attendanceId,
          location: validatedData.location,
          workHours: result.workHours,
          checkedOutById: profile.userId
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        attendance: result.attendance,
        workHours: result.workHours,
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Check-out error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
