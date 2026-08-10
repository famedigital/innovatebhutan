import { createClient } from "@supabase/supabase-js";
import {
  buildMbobPaymentQrFromSettings,
  isEmvPayload,
  type MbobSettings,
} from "@/lib/payments/bhutanEmvQr";

const SETTING_KEYS = [
  "mbob_static_qr",
  "mbob_account_number",
  "mbob_merchant_name",
  "mbob_merchant_city",
] as const;

export async function loadMbobSettings(): Promise<Partial<MbobSettings>> {
  const fromEnv: Partial<MbobSettings> = {
    staticPayload: process.env.MBOB_STATIC_QR || "",
    accountNumber: process.env.MBOB_ACCOUNT_NUMBER || "",
    merchantName: process.env.MBOB_MERCHANT_NAME || "INNOVATES",
    merchantCity: process.env.MBOB_MERCHANT_CITY || "THIMPHU",
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !supabaseKey) return fromEnv;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", [...SETTING_KEYS]);

    const map: Record<string, string> = {};
    data?.forEach((row: { key: string; value: string }) => {
      map[row.key] = row.value;
    });

    return {
      staticPayload: map.mbob_static_qr || fromEnv.staticPayload,
      accountNumber: map.mbob_account_number || fromEnv.accountNumber,
      merchantName: map.mbob_merchant_name || fromEnv.merchantName,
      merchantCity: map.mbob_merchant_city || fromEnv.merchantCity,
    };
  } catch {
    return fromEnv;
  }
}

export async function buildQuotationMbobQr(opts: {
  amount: number;
  billNumber: string;
}): Promise<{ payload: string | null; error?: string; accountNumber?: string }> {
  try {
    const settings = await loadMbobSettings();
    const staticPayload = (settings.staticPayload || "").trim();

    if (!staticPayload || !isEmvPayload(staticPayload)) {
      return {
        payload: null,
        accountNumber: settings.accountNumber,
        error:
          "mBoB needs your official Scan & Pay sticker payload. Decode the Innovates QR (text starts with 000201) and paste it in Admin → Settings → Payments.",
      };
    }

    const payload = buildMbobPaymentQrFromSettings(
      settings,
      opts.amount,
      opts.billNumber
    );
    return { payload, accountNumber: settings.accountNumber };
  } catch (error) {
    return {
      payload: null,
      error: error instanceof Error ? error.message : "Failed to build mBoB QR",
    };
  }
}
