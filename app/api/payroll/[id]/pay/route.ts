import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { payrollService } from "@/lib/services/payrollService";
import { markPaidPayrollSchema } from "@/lib/validations/payroll";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// POST /api/payroll/[id]/pay - Mark a payslip as paid
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);
    const { id } = await params;
    const payslipId = validateId(id, "payslip ID");

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(markPaidPayrollSchema, body);

    const { paymentMethod, paymentDate, transactionReference, notes } = validatedData;

    // Check if payslip is ready for payment
    const isReady = await payrollService.isReadyForPayment(payslipId);
    if (!isReady) {
      return NextResponse.json(
        { success: false, error: "Payslip must be approved before marking as paid" },
        { status: 400 }
      );
    }

    // Mark as paid
    const payslip = await payrollService.markAsPaid(payslipId, paymentMethod, paymentDate);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "PAY",
        entity_type: "PAYSLIP",
        entity_id: payslipId,
        operator_id: profile.userId,
        details: {
          payment_method: paymentMethod,
          payment_date: paymentDate,
          transaction_reference: transactionReference,
          notes,
          net_salary: payslip.netSalary,
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Payslip marked as paid successfully",
      data: payslip,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Payslip payment error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
