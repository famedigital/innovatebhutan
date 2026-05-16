import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { payrollService } from "@/lib/services/payrollService";
import { batchPayrollSchema } from "@/lib/validations/payroll";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError } from "@/lib/errors";
import { validateRequest } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// POST /api/payroll/batch - Generate payroll for multiple employees
export async function POST(req: NextRequest) {
  try {
    console.log("[API /api/payroll/batch] Starting batch payroll generation");

    // Rate limiting - stricter for batch operations
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(
      clientIp,
      rateLimitPresets.strict.maxRequests,
      rateLimitPresets.strict.windowMs
    );

    if (!rateLimitResult.allowed) {
      throw new RateLimitError(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
    }

    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    console.log("[API /api/payroll/batch] Auth verified for user:", authContext.profile.userId);

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(batchPayrollSchema, body);

    const { month, year, employeeIds, generateForAll, skipExisting } = validatedData;
    console.log("[API /api/payroll/batch] Generating payroll for period:", { month, year, employeeIds });

    // Generate batch payroll
    const result = await payrollService.generateBatchPayroll(month, year, employeeIds, {
      // Default options for batch generation
    });

    console.log("[API /api/payroll/batch] Batch payroll completed:", {
      totalRequested: result.summary.totalRequested,
      totalGenerated: result.summary.totalGenerated,
      failed: result.failed.length,
      skipped: result.skipped.length
    });

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "BATCH_CREATE",
        entity_type: "PAYSLIP",
        operator_id: authContext.profile.userId,
        details: {
          month,
          year,
          employee_count: result.summary.totalRequested,
          generated_count: result.summary.totalGenerated,
          failed_count: result.failed.length,
          skipped_count: result.skipped.length,
          total_net_salary: result.summary.totalNetSalary,
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: `Batch payroll generation completed. ${result.summary.totalGenerated} payslips generated.`,
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("[API /api/payroll/batch] Batch payroll generation error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// GET /api/payroll/batch - Get payroll period summary
export async function GET(req: NextRequest) {
  try {
    console.log("[API /api/payroll/batch] Fetching payroll period summary");

    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    console.log("[API /api/payroll/batch] Auth verified for user:", authContext.profile.userId);

    const searchParams = req.nextUrl.searchParams;
    const month = parseInt(searchParams.get("month") || "");
    const year = parseInt(searchParams.get("year") || "");

    if (isNaN(month) || month < 1 || month > 12) {
      throw new Error("Invalid month. Must be between 1 and 12.");
    }

    if (isNaN(year) || year < 2020 || year > 2100) {
      throw new Error("Invalid year.");
    }

    console.log("[API /api/payroll/batch] Fetching summary for period:", { month, year });
    const summary = await payrollService.getPeriodSummary(month, year);
    console.log("[API /api/payroll/batch] Summary fetched:", summary);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("[API /api/payroll/batch] Payroll summary fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
