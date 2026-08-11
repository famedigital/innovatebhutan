import { NextRequest, NextResponse } from "next/server";
import { quotationService } from "@/lib/services/quotationService";
import { buildQuotationMbobQr } from "@/lib/payments/mbobSettings";
import { NotFoundError } from "@/lib/errors";
import { formatApiError } from "@/lib/auth/api-auth";

/**
 * Public client quotation view (no auth) — used in WhatsApp / email links.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;
    if (!publicId || publicId.length < 4) {
      throw new NotFoundError("Quotation");
    }

    const quotation = await quotationService.getByPublicId(publicId);
    if (!quotation) throw new NotFoundError("Quotation");
    if (quotation.status === "cancelled") throw new NotFoundError("Quotation");

    const amount = Number(quotation.advanceAmount || 0);
    const mbob =
      amount > 0
        ? await buildQuotationMbobQr({
            amount,
            billNumber: quotation.quotationNumber,
          })
        : { payload: null as string | null, accountNumber: undefined, error: undefined };

    return NextResponse.json({
      success: true,
      data: {
        publicId: quotation.publicId,
        quotationNumber: quotation.quotationNumber,
        category: quotation.category,
        businessName: quotation.businessName,
        customerName: quotation.customerName,
        quotationFor: quotation.quotationFor,
        validityDays: quotation.validityDays,
        subtotal: quotation.subtotal,
        taxRate: quotation.taxRate,
        taxAmount: quotation.taxAmount,
        totalAmount: quotation.totalAmount,
        advancePercent: quotation.advancePercent,
        advanceAmount: quotation.advanceAmount,
        status: quotation.status,
        notes: quotation.notes,
        createdAt: quotation.createdAt,
        items: (quotation.items || []).map((item) => ({
          name: item.name,
          brand: item.brand,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })),
        depositQrPayload: mbob.payload,
        mbobAccountNumber: mbob.accountNumber || null,
        mbobSetupError: mbob.payload ? null : mbob.error || null,
      },
    });
  } catch (error) {
    console.error("[API /api/quotations/public/[publicId]] GET error:", error);
    return NextResponse.json(formatApiError(error), {
      status:
        error instanceof Error && "statusCode" in error
          ? (error as { statusCode: number }).statusCode
          : 500,
    });
  }
}
