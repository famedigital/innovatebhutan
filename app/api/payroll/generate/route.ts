import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { payrollService } from "@/lib/services/payrollService";
import { generatePayrollSchema, payslipQuerySchema } from "@/lib/validations/payroll";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError } from "@/lib/errors";
import { validateRequest, validateQueryParams } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/payroll/generate - List payslips with filters
export async function GET(req: NextRequest) {
  try {
    console.log("[API /api/payroll/generate] Fetching payslips list");

    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    console.log("[API /api/payroll/generate] Auth verified for user:", authContext.profile.userId);

    const searchParams = req.nextUrl.searchParams;

    // Parse and validate query parameters
    const queryParams = validateQueryParams(payslipQuerySchema, searchParams);
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 20;
    const { page: _, limit: __, ...filters } = queryParams;
    const offset = (page - 1) * limit;

    console.log("[API /api/payroll/generate] Fetching payslips with filters:", { page, limit, filters });
    const result = await payrollService.listPayslips({
      ...filters,
      limit,
      offset,
    });
    console.log("[API /api/payroll/generate] Fetched", result.payslips.length, "payslips");

    return NextResponse.json({
      success: true,
      data: result.payslips,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("[API /api/payroll/generate] Payslips fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// POST /api/payroll/generate - Generate a new payslip
export async function POST(req: NextRequest) {
  try {
    console.log("[API /api/payroll/generate] Starting payslip generation");

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
    console.log("[API /api/payroll/generate] Auth verified for user:", authContext.profile.userId);

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(generatePayrollSchema, body);

    const { employeeId, month, year, allowances, bonuses, deductions, workingDays, paidLeaveDays, unpaidLeaveDays, overtimeHours } =
      validatedData;

    console.log("[API /api/payroll/generate] Generating payslip for employee:", employeeId, "period:", { month, year });

    // Generate payslip
    const payslip = await payrollService.generatePayslip(employeeId, month, year, {
      allowances,
      bonuses,
      deductions,
      workingDays,
      paidLeaveDays,
      unpaidLeaveDays,
      overtimeHours,
    });

    console.log("[API /api/payroll/generate] Payslip generated successfully with net salary:", payslip.netSalary);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CREATE",
        entity_type: "PAYSLIP",
        entity_id: (payslip as any).id || null,
        operator_id: authContext.profile.userId,
        details: {
          employee_id: employeeId,
          month,
          year,
          net_salary: payslip.netSalary,
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Payslip generated successfully",
        data: payslip,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("[API /api/payroll/generate] Payslip generation error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
