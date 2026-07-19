import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError, NotFoundError } from "@/lib/errors";
import { validateId } from "@/lib/validations/validation";
import { invoiceTemplateService } from "@/lib/services/invoiceTemplateService";
import { invoiceTemplateRepository } from "@/lib/repositories/invoiceTemplateRepository";
import { invoiceRepository } from "@/lib/repositories/invoiceRepository";
import { amcRepository } from "@/lib/repositories/amcRepository";
import { getRenewalPipeline, withRenewalPipeline } from "@/lib/amc/renewal";
import type { ProductKey } from "@/lib/invoices/templateDefaults";
import { eq, and, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { invoices } from "@/db/schema";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    await requireApiAuth(req).then((c) => requireStaffOrAdmin(c.profile));
    const { id } = await params;
    const templateId = validateId(id, "Template ID");
    const body = await req.json().catch(() => ({}));

    if (body?.activate === true || body?.action === "activate") {
      const updated = await invoiceTemplateService.activate(templateId);
      return NextResponse.json({ success: true, data: updated });
    }

    if (body?.action === "regenerate-pdfs") {
      const tpl = await invoiceTemplateRepository.getById(templateId);
      if (!tpl) throw new NotFoundError("Template");
      const productKey = tpl.productKey as ProductKey;
      const limit = Math.min(Number(body.limit) || 20, 50);

      const rows = await db
        .select()
        .from(invoices)
        .where(
          and(
            eq(invoices.productKey, productKey),
            isNotNull(invoices.pdfUrl)
          )
        )
        .limit(limit);

      // Mark for client-side / next download regen: stamp active template snapshot
      let updated = 0;
      for (const inv of rows) {
        await invoiceRepository.updateInvoice(inv.id, {
          templateId: tpl.id,
          templateSnapshot: tpl.design,
        });
        updated += 1;
      }

      // AMC quotation URLs: stamp meta flag for renewal desk re-upload on next PDF
      const amcList = await amcRepository.listAMCs({ limit: limit, offset: 0 });
      let amcFlagged = 0;
      for (const amc of amcList.amcs || []) {
        const pipeline = getRenewalPipeline(amc.meta);
        if (!pipeline.quotationPdfUrl) continue;
        await amcRepository.updateAMC(amc.id, {
          meta: withRenewalPipeline(amc.meta, {
            ...pipeline,
            quotationPdfNeedsRegen: true,
            quotationTemplateId: tpl.id,
          }),
        });
        amcFlagged += 1;
        if (amcFlagged >= limit) break;
      }

      return NextResponse.json({
        success: true,
        data: {
          invoicesUpdated: updated,
          amcFlagged,
          message:
            "Snapshots updated. Re-download / re-upload PDFs to replace Cloudinary files with the active design.",
        },
      });
    }

    return NextResponse.json(
      { success: false, error: "Unknown action" },
      { status: 400 }
    );
  } catch (error) {
    const status = isApiError(error)
      ? (error as { statusCode: number }).statusCode
      : 500;
    return NextResponse.json(formatApiError(error), { status });
  }
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await requireApiAuth(_req).then((c) => requireStaffOrAdmin(c.profile));
    const { id } = await params;
    const templateId = validateId(id, "Template ID");
    const tpl = await invoiceTemplateRepository.getById(templateId);
    if (!tpl) throw new NotFoundError("Template");
    return NextResponse.json({ success: true, data: tpl });
  } catch (error) {
    const status = isApiError(error)
      ? (error as { statusCode: number }).statusCode
      : 500;
    return NextResponse.json(formatApiError(error), { status });
  }
}
