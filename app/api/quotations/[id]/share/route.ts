import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { quotationService } from "@/lib/services/quotationService";
import {
  requireApiAuth,
  requireStaffOrAdmin,
  formatApiError,
} from "@/lib/auth/api-auth";
import { validateRequest, validateId } from "@/lib/validations/validation";
import { NotFoundError, BadRequestError } from "@/lib/errors";
import {
  buildQuotationEmailSubject,
  buildQuotationShareMessage,
  buildMailtoShareUrl,
  buildWhatsAppShareUrl,
  normalizeBhutanPhone,
  quotationPublicPath,
} from "@/lib/quotations/shareQuotation";
import { loadClientGreetingSettings } from "@/lib/settings/clientGreetingSettings";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { sendEmail } from "@/lib/email/sendEmail";

const shareSchema = z.object({
  channel: z.enum(["whatsapp", "email", "link"]),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  /** When true, also try Cloud API / SendGrid after returning share URLs */
  sendViaApi: z.boolean().optional().default(true),
  markSent: z.boolean().optional().default(true),
});

function absolutePublicUrl(req: NextRequest, publicId: string) {
  const path = quotationPublicPath(publicId);
  const envBase =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (envBase) {
    const base = envBase.startsWith("http") ? envBase : `https://${envBase}`;
    return `${base.replace(/\/$/, "")}${path}`;
  }
  return `${req.nextUrl.origin}${path}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const { id } = await params;
    const quotationId = validateId(id, "Quotation ID");
    const body = await req.json();
    const input = validateRequest(shareSchema, body);

    const quotation = await quotationService.getById(quotationId);
    if (!quotation) throw new NotFoundError("Quotation");
    if (quotation.status === "cancelled") {
      throw new BadRequestError("Cannot share a cancelled quotation");
    }

    const publicUrl = absolutePublicUrl(req, quotation.publicId);
    const businessName =
      quotation.businessName || quotation.customerName || "Client";
    const { greeting } = await loadClientGreetingSettings();
    const message = buildQuotationShareMessage({
      quotationNumber: quotation.quotationNumber,
      businessName,
      totalAmount: Number(quotation.totalAmount || 0),
      advanceAmount: Number(quotation.advanceAmount || 0),
      advancePercent: Number(quotation.advancePercent || 0),
      publicUrl,
      quotationFor: quotation.quotationFor,
      greeting,
    });
    const subject = buildQuotationEmailSubject(quotation.quotationNumber);

    const phone = normalizeBhutanPhone(input.phone || quotation.phone);
    const email = (input.email || quotation.email || "").trim();

    let shareUrl: string | null = null;
    let apiResult: { success: boolean; error?: string; skipped?: boolean } = {
      success: true,
      skipped: true,
    };

    if (input.channel === "whatsapp") {
      if (!phone) {
        throw new BadRequestError("Client phone required for WhatsApp share");
      }
      shareUrl = buildWhatsAppShareUrl(phone, message);
      if (input.sendViaApi) {
        const sent = await sendWhatsAppMessage(phone, message);
        apiResult = {
          success: Boolean(sent.success),
          error: sent.success
            ? undefined
            : typeof sent.error === "string"
              ? sent.error
              : "WhatsApp Cloud API send failed (wa.me link still available)",
          skipped: false,
        };
      }
    } else if (input.channel === "email") {
      if (!email) {
        throw new BadRequestError("Client email required for email share");
      }
      shareUrl = buildMailtoShareUrl({ email, subject, body: message });
      if (input.sendViaApi) {
        const sent = await sendEmail({
          to: email,
          subject,
          text: message,
          html: message.replace(/\n/g, "<br/>"),
        });
        apiResult = {
          success: sent.success,
          error: sent.success
            ? undefined
            : sent.error || "Email API not configured (mailto still available)",
          skipped: Boolean(sent.skipped),
        };
      }
    } else {
      shareUrl = publicUrl;
    }

    let updated = quotation;
    if (
      input.markSent &&
      (quotation.status === "draft" || quotation.status === "sent")
    ) {
      const next = await quotationService.updateStatus(quotationId, "sent");
      if (next) updated = { ...quotation, ...next };
    }

    return NextResponse.json({
      success: true,
      data: {
        channel: input.channel,
        publicUrl,
        shareUrl,
        message,
        subject,
        phone,
        email: email || null,
        api: apiResult,
        quotation: updated,
      },
      message: "Share payload ready",
    });
  } catch (error) {
    console.error("[API /api/quotations/[id]/share] POST error:", error);
    return NextResponse.json(formatApiError(error), {
      status:
        error instanceof Error && "statusCode" in error
          ? (error as { statusCode: number }).statusCode
          : 500,
    });
  }
}
