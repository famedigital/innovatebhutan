import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { attendanceService } from "@/lib/services/attendanceService";
import { createAttendanceSchema, attendanceQuerySchema } from "@/lib/validations/attendance";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError } from "@/lib/errors";
import { validateRequest, validateQueryParams } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/attendance - List attendance records
export async function GET(req: NextRequest) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const queryParams = validateQueryParams(attendanceQuerySchema, req.nextUrl.searchParams);

    const result = await attendanceService.listAttendance({
      ...queryParams,
      page: queryParams.page ?? 1,
      limit: queryParams.limit ?? 31,
    });

    return NextResponse.json({
      success: true,
      data: result.records,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Attendance list error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// POST /api/attendance - Create attendance record
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const validatedData = validateRequest(createAttendanceSchema, body);

    const attendance = await attendanceService.createAttendance(validatedData);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CREATE",
        entity_type: "ATTENDANCE",
        entity_id: attendance.id,
        operator_id: profile.id,
        details: { ...validatedData, createdById: profile.userId },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Attendance record created successfully",
      data: attendance,
    }, { status: 201 });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Attendance create error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
