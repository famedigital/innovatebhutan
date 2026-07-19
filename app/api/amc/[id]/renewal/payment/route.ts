import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { amcService } from "@/lib/services/amcService";
import { invoiceService } from "@/lib/services/invoiceService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError, NotFoundError } from "@/lib/errors";
import { validateId, validateRequest } from "@/lib/validations/validation";
import { getRenewalPipeline, withRenewalPipeline } from "@/lib/amc/renewal";
import { amcRepository } from "@/lib/repositories/amcRepository";
import { getEmployeeIdByProfileId } from "@/lib/amc/ownership";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const paymentSchema = z.object({
  proofUrl: z.string().url("Payment proof URL is required"),
  proofNote: z.string().max(2000).optional(),
});

/**
 * POST /api/amc/[id]/renewal/payment — mark quotation paid + store proof
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const amcId = validateId(id, "AMC ID");

    const amc = await amcService.getAMCById(amcId);
    if (!amc) throw new NotFoundError("AMC");

    const pipeline = getRenewalPipeline(amc.meta);
    if (!pipeline.quotationInvoiceId) {
      return NextResponse.json(
        { success: false, error: "Create a quotation invoice first." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = validateRequest(paymentSchema, body);

    let invoice = await invoiceService.getInvoiceById(pipeline.quotationInvoiceId);
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Quotation invoice not found." },
        { status: 400 }
      );
    }

    if (invoice.status === "draft") {
      invoice = await invoiceService.markInvoiceAsSent(invoice.id);
    }
    if (invoice.status === "sent" || invoice.status === "overdue") {
      invoice = await invoiceService.markInvoiceAsPaid(invoice.id);
    } else if (invoice.status !== "paid") {
      return NextResponse.json(
        { success: false, error: `Cannot mark invoice paid from status ${invoice.status}` },
        { status: 400 }
      );
    }

    const employeeId = await getEmployeeIdByProfileId(authContext.profile.id);

    const nextPipeline = {
      ...pipeline,
      payment: {
        paidAt: new Date().toISOString(),
        proofUrl: validated.proofUrl,
        proofNote: validated.proofNote,
        acknowledgedBy: employeeId ?? undefined,
      },
    };

    const updated = await amcRepository.updateAMC(amcId, {
      meta: withRenewalPipeline(amc.meta, nextPipeline),
    });

    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "RENEWAL_PAYMENT",
        entity_type: "AMC",
        entity_id: amcId,
        operator_id: authContext.profile.userId,
        details: {
          invoice_id: pipeline.quotationInvoiceId,
          proof_url: validated.proofUrl,
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Payment recorded with proof",
      data: { amc: updated, pipeline: nextPipeline },
    });
  } catch (error) {
    if (error instanceof Error && !isApiError(error)) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as { statusCode?: number }).statusCode || 500 : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
