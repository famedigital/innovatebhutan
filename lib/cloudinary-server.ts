/**
 * Server-side Cloudinary upload helpers (AMC renewal assets, media library)
 */
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

export type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  bytes: number;
  format?: string;
  folder?: string;
};

type CloudinaryCreds = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

function credsFromEnv(): CloudinaryCreds | null {
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

/** Fallback: admin Settings page stores keys in `settings` table */
async function credsFromSettings(): Promise<CloudinaryCreds | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) return null;

  const supabase = createClient(url, key);
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", ["cloudinary_name", "cloudinary_key", "cloudinary_secret"]);

  const map: Record<string, string> = {};
  data?.forEach((row: { key: string; value: string }) => {
    map[row.key] = row.value;
  });

  if (!map.cloudinary_name || !map.cloudinary_key || !map.cloudinary_secret) {
    return null;
  }

  return {
    cloudName: map.cloudinary_name,
    apiKey: map.cloudinary_key,
    apiSecret: map.cloudinary_secret,
  };
}

async function resolveCloudinaryConfig(): Promise<CloudinaryCreds | null> {
  const fromEnv = credsFromEnv();
  if (fromEnv) {
    cloudinary.config({
      cloud_name: fromEnv.cloudName,
      api_key: fromEnv.apiKey,
      api_secret: fromEnv.apiSecret,
      secure: true,
    });
    return fromEnv;
  }

  const fromSettings = await credsFromSettings();
  if (fromSettings) {
    cloudinary.config({
      cloud_name: fromSettings.cloudName,
      api_key: fromSettings.apiKey,
      api_secret: fromSettings.apiSecret,
      secure: true,
    });
    return fromSettings;
  }

  return null;
}

/** Folder layout: innovates/amc/{quotations|payments}/{yyyy}/{amcId} */
export function amcRenewalFolder(
  kind: "quotations" | "payments",
  amcId: number
): string {
  const year = new Date().getFullYear();
  return `innovates/amc/${kind}/${year}/${amcId}`;
}

export function generalMediaFolder(subfolder = "uploads"): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");
  return `innovates/media/${subfolder}/${year}/${month}`;
}

export async function uploadBufferToCloudinary(params: {
  buffer: Buffer;
  mimeType: string;
  folder: string;
  publicId?: string;
  originalFilename?: string;
}): Promise<CloudinaryUploadResult> {
  const cfg = await resolveCloudinaryConfig();
  if (!cfg) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_* env vars or Admin → Settings cloudinary keys."
    );
  }

  const dataUri = `data:${params.mimeType};base64,${params.buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: params.folder,
    public_id: params.publicId,
    resource_type: "auto",
    overwrite: false,
    use_filename: !params.publicId,
    unique_filename: true,
    filename_override: params.originalFilename,
  });

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    bytes: result.bytes,
    format: result.format,
    folder: params.folder,
  };
}

export async function isCloudinaryConfigured(): Promise<boolean> {
  return (await resolveCloudinaryConfig()) !== null;
}
