import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import {
  amcRenewalFolder,
  generalMediaFolder,
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
} from "@/lib/cloudinary-server";
import { isApiError } from "@/lib/errors";

/**
 * POST /api/media/upload - Upload media to Cloudinary (preferred) or Supabase Storage.
 *
 * Form fields:
 * - file (required)
 * - folder (optional) — Cloudinary folder path
 * - purpose (optional) — "amc-quotation" | "amc-payment" | "media"
 * - amcId (optional) — used with purpose for folder structure
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "video/mp4",
  "video/mpeg",
];

function resolveMimeType(file: File): string {
  if (file.type && file.type !== "application/octet-stream") return file.type;
  const name = (file.name || "").toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".gif")) return "image/gif";
  return file.type || "application/octet-stream";
}

function resolveFolder(formData: FormData): string {
  const explicit = String(formData.get("folder") || "").trim();
  if (explicit) return explicit.replace(/^\/+|\/+$/g, "");

  const purpose = String(formData.get("purpose") || "media").trim();
  const amcIdRaw = formData.get("amcId");
  const amcId = amcIdRaw ? Number(amcIdRaw) : NaN;

  if (purpose === "amc-quotation" && Number.isFinite(amcId)) {
    return amcRenewalFolder("quotations", amcId);
  }
  if (purpose === "amc-payment" && Number.isFinite(amcId)) {
    return amcRenewalFolder("payments", amcId);
  }
  return generalMediaFolder(purpose === "media" ? "uploads" : purpose);
}

export async function POST(req: NextRequest) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        },
        { status: 400 }
      );
    }

    const mimeType = resolveMimeType(file);
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: `File type not allowed (${mimeType || "unknown"}). Allowed: ${ALLOWED_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const folder = resolveFolder(formData);
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Prefer Cloudinary with signed upload + folder structure
    if (await isCloudinaryConfigured()) {
      try {
        const uploaded = await uploadBufferToCloudinary({
          buffer,
          mimeType,
          folder,
          originalFilename: file.name,
        });

        await supabase.from("media").insert({
          name: file.name,
          url: uploaded.secureUrl,
          type: mimeType.split("/")[0],
          size: file.size,
          uploadedBy: authContext.profile.userId,
        });

        console.log("[API /api/media/upload] Cloudinary:", uploaded.secureUrl, "folder:", folder);

        return NextResponse.json({
          success: true,
          url: uploaded.secureUrl,
          publicId: uploaded.publicId,
          folder: uploaded.folder,
          source: "cloudinary",
        });
      } catch (cloudErr) {
        console.error("[API /api/media/upload] Cloudinary failed:", cloudErr);
        return NextResponse.json(
          {
            success: false,
            error:
              cloudErr instanceof Error
                ? cloudErr.message
                : "Cloudinary upload failed",
          },
          { status: 502 }
        );
      }
    }

    // Fallback: Supabase Storage (same folder path as object prefix)
    const fileExt = file.name.split(".").pop() || "bin";
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(fileName, buffer, { contentType: mimeType, upsert: false });

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("media").getPublicUrl(fileName);

    await supabase.from("media").insert({
      name: file.name,
      url: publicUrl,
      type: mimeType.split("/")[0],
      size: file.size,
      uploadedBy: authContext.profile.userId,
    });

    console.log("[API /api/media/upload] Supabase fallback:", publicUrl);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      folder,
      source: "supabase",
    });
  } catch (error) {
    console.error("[API /api/media/upload] Error:", error);

    let statusCode = 500;
    if (isApiError(error)) {
      statusCode = (error as { statusCode: number }).statusCode;
    } else if (error instanceof Error && "statusCode" in error) {
      statusCode = Number((error as { statusCode: number }).statusCode) || 500;
    }

    return NextResponse.json(formatApiError(error), { status: statusCode });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message:
      "Media upload endpoint. POST multipart file. Optional: purpose=amc-quotation|amc-payment, amcId, folder. Requires STAFF or ADMIN.",
    cloudinaryConfigured: await isCloudinaryConfigured(),
  });
}
