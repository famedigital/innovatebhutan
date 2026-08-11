import { createClient } from "@supabase/supabase-js";

/** Default Bhutan sales GST % when unset in ERP settings */
export const DEFAULT_GST_RATE_PERCENT = 5;

export type GstSettings = {
  /** Percent, e.g. 5 for 5% */
  ratePercent: number;
};

export async function loadGstSettings(): Promise<GstSettings> {
  const fromEnv = Number(process.env.GST_RATE_PERCENT);
  const envRate =
    Number.isFinite(fromEnv) && fromEnv >= 0 ? fromEnv : DEFAULT_GST_RATE_PERCENT;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !supabaseKey) {
    return { ratePercent: envRate };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .eq("key", "gst_rate")
      .maybeSingle();

    if (data?.value != null && data.value !== "") {
      const parsed = Number(data.value);
      if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 100) {
        return { ratePercent: parsed };
      }
    }
  } catch {
    // fall through to env/default
  }

  return { ratePercent: envRate };
}

export function calcGstAmount(subtotal: number, ratePercent: number): number {
  const rate = Math.min(100, Math.max(0, ratePercent || 0));
  return Math.round(subtotal * (rate / 100) * 100) / 100;
}
