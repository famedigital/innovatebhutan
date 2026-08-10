import { NextRequest, NextResponse } from "next/server";
import jsQR from "jsqr";
import sharp from "sharp";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isEmvPayload, validateEmvCrc } from "@/lib/payments/bhutanEmvQr";

export const runtime = "nodejs";

/**
 * Decode an uploaded mBoB / Bhutan Scan & Pay sticker image to EMV text.
 * POST multipart field "file" or JSON { imageBase64 }.
 */
export async function POST(req: NextRequest) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const contentType = req.headers.get("content-type") || "";
    let bytes: Buffer | null = null;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json(
          { success: false, error: "Upload field 'file' required" },
          { status: 400 }
        );
      }
      bytes = Buffer.from(await file.arrayBuffer());
    } else {
      const body = await req.json().catch(() => ({}));
      const b64 = String(body.imageBase64 || "").replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      if (!b64) {
        return NextResponse.json(
          { success: false, error: "imageBase64 or multipart file required" },
          { status: 400 }
        );
      }
      bytes = Buffer.from(b64, "base64");
    }

    const { data, info } = await sharp(bytes)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const decoded = jsQR(
      new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength),
      info.width,
      info.height,
      { inversionAttempts: "attemptBoth" }
    );

    if (!decoded?.data) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not read a QR from that image. Use a clear photo of the Innovates Scan & Pay sticker.",
        },
        { status: 422 }
      );
    }

    const payload = decoded.data.trim();
    const emv = isEmvPayload(payload);
    const crcOk = emv ? validateEmvCrc(payload) : false;

    return NextResponse.json({
      success: true,
      data: {
        payload,
        isEmv: emv,
        crcOk,
        hint: emv
          ? "Valid EMV Scan & Pay payload — click Save All."
          : "Decoded text is not EMV (does not start with 000201). mBoB will reject it.",
      },
    });
  } catch (error) {
    console.error("[API /api/payments/mbob-decode-qr] error:", error);
    return NextResponse.json(formatApiError(error), {
      status:
        error instanceof Error && "statusCode" in error
          ? (error as { statusCode: number }).statusCode
          : 500,
    });
  }
}
