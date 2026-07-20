import { NextRequest, NextResponse } from "next/server";
import { requirePortalContext } from "@/lib/portal/portalAuth";
import { portalService } from "@/lib/services/portalService";
import { formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";
import {
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
  generalMediaFolder,
} from "@/lib/cloudinary-server";
import { z } from "zod";

const jsonSchema = z.object({
  invoiceId: z.number().int().positive(),
  proofUrl: z.string().url(),
  method: z.enum(["mbob", "cheque"]).optional(),
  notes: z.string().max(2000).optional(),
});

/**
 * POST /api/portal/payments/proof
 * JSON { invoiceId, proofUrl } or multipart file + invoiceId
 */
export async function POST(req: NextRequest) {
  try {
    const ctx = await requirePortalContext(req);
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const invoiceId = parseInt(String(form.get("invoiceId") || "0"), 10);
      const method = String(form.get("method") || "mbob");
      const notes = String(form.get("notes") || "") || undefined;
      const file = form.get("file") as File | null;

      if (!invoiceId || !file) {
        return NextResponse.json(
          { success: false, error: "invoiceId and file required" },
          { status: 400 }
        );
      }

      let proofUrl: string;
      if (await isCloudinaryConfigured()) {
        const buf = Buffer.from(await file.arrayBuffer());
        const uploaded = await uploadBufferToCloudinary({
          buffer: buf,
          mimeType: file.type || "image/jpeg",
          folder: generalMediaFolder(`portal-payments/${ctx.clientId}`),
          originalFilename: file.name,
        });
        proofUrl = uploaded.secureUrl;
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Upload not configured. Ask staff for payment instructions.",
          },
          { status: 503 }
        );
      }

      const proof = await portalService.submitPaymentProof({
        clientId: ctx.clientId,
        invoiceId,
        proofUrl,
        method: method === "cheque" ? "cheque" : "mbob",
        notes,
        profileId: ctx.profile.id,
      });
      return NextResponse.json({ success: true, data: proof }, { status: 201 });
    }

    const body = jsonSchema.parse(await req.json());
    const proof = await portalService.submitPaymentProof({
      clientId: ctx.clientId,
      invoiceId: body.invoiceId,
      proofUrl: body.proofUrl,
      method: body.method,
      notes: body.notes,
      profileId: ctx.profile.id,
    });
    return NextResponse.json({ success: true, data: proof }, { status: 201 });
  } catch (error) {
    return NextResponse.json(formatApiError(error), {
      status: isApiError(error)
        ? (error as { statusCode?: number }).statusCode || 500
        : 500,
    });
  }
}
