import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { attendanceService } from "@/lib/services/attendanceService";
import { checkInSchema } from "@/lib/validations/attendance";
import { requireApiAuth, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError } from "@/lib/errors";
import { validateRequest } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// POST /api/attendance/check-in - Check in an employee
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
    const validatedData = validateRequest(checkInSchema, body);

    const result = await attendanceService.checkIn(validatedData);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CHECK_IN",
        entity_type: "ATTENDANCE",
        entity_id: result.attendance.id,
        operator_id: profile.id,
        details: { employeeId: validatedData.employeeId, location: validatedData.location, checkedInById: profile.userId },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result.attendance,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Check-in error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
