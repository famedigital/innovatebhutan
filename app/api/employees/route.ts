import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { employeeService } from "@/lib/services/employeeService";
import { createEmployeeSchema, updateEmployeeSchema, employeeQuerySchema } from "@/lib/validations/employee";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, NotFoundError, RateLimitError } from "@/lib/errors";
import { validateRequest, validateQueryParams } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/employees - List employees
export async function GET(req: NextRequest) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const queryParams = validateQueryParams(employeeQuerySchema, req.nextUrl.searchParams);

    const result = await employeeService.listEmployees({
      ...queryParams,
      page: queryParams.page ?? 1,
      limit: queryParams.limit ?? 20,
    });

    return NextResponse.json({
      success: true,
      data: result.employees,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Employees list error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// POST /api/employees - Create employee
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
    const validatedData = validateRequest(createEmployeeSchema, body);

    const employee = await employeeService.createEmployee(validatedData);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CREATE",
        entity_type: "EMPLOYEE",
        entity_id: employee.id,
        operator_id: profile.id,
        details: { ...validatedData, createdById: profile.userId },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    }, { status: 201 });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Employee create error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
