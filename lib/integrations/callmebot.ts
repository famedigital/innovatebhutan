/**
 * CallMeBot WhatsApp alert integration
 * Docs: https://www.callmebot.com/blog/free-api-whatsapp-messages/
 *
 * Env (preferred) or Settings table:
 * - CALLMEBOT_PHONE / callmebot_phone
 * - CALLMEBOT_API_KEY / callmebot_api_key
 */

import { createClient } from "@supabase/supabase-js";

const CALLMEBOT_URL = "https://api.callmebot.com/whatsapp.php";

export type InquiryAlertPayload = {
  source: string;
  name?: string;
  businessName?: string;
  phone?: string;
  email?: string;
  category?: string;
  topic?: string;
  message?: string;
  leadId?: string | number;
};

async function getCallMeBotSettings() {
  const fromEnv = {
    phone: process.env.CALLMEBOT_PHONE || "",
    apiKey: process.env.CALLMEBOT_API_KEY || "",
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !supabaseKey) return fromEnv;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", ["callmebot_phone", "callmebot_api_key"]);

    const map: Record<string, string> = {};
    data?.forEach((row: { key: string; value: string }) => {
      map[row.key] = row.value;
    });

    return {
      phone: map.callmebot_phone || fromEnv.phone,
      apiKey: map.callmebot_api_key || fromEnv.apiKey,
    };
  } catch {
    return fromEnv;
  }
}

export async function sendCallMeBotMessage(text: string) {
  const { phone, apiKey } = await getCallMeBotSettings();

  if (!phone || !apiKey) {
    console.warn(
      "[CallMeBot] Skipped — set CALLMEBOT_PHONE + CALLMEBOT_API_KEY (or Admin → Settings)."
    );
    return { success: false, skipped: true, error: "Missing credentials" };
  }

  try {
    const url = new URL(CALLMEBOT_URL);
    url.searchParams.set("phone", phone.replace(/\s+/g, ""));
    url.searchParams.set("text", text);
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("source", "innovates-erp");

    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    const body = await response.text();
    if (!response.ok) {
      console.error("[CallMeBot] HTTP error", response.status, body);
      return { success: false, error: body || `HTTP ${response.status}` };
    }

    return { success: true, data: body };
  } catch (error) {
    console.error("[CallMeBot] Send failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Send failed",
    };
  }
}

export function formatInquiryAlert(payload: InquiryAlertPayload) {
  const lines = [
    `*New ${payload.source || "Inquiry"}*`,
    payload.businessName ? `Business: ${payload.businessName}` : null,
    payload.name ? `Name: ${payload.name}` : null,
    payload.phone ? `Mobile: ${payload.phone}` : null,
    payload.email ? `Email: ${payload.email}` : null,
    payload.category ? `Type: ${payload.category}` : null,
    payload.topic ? `Topic: ${payload.topic}` : null,
    payload.message ? `Details: ${payload.message}` : null,
    payload.leadId ? `Lead #${payload.leadId}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}

/**
 * Fire-and-forget alert. Never throws — inquiries must not fail on alert errors.
 */
export async function alertInquiry(payload: InquiryAlertPayload) {
  try {
    return await sendCallMeBotMessage(formatInquiryAlert(payload));
  } catch (error) {
    console.error("[CallMeBot] alertInquiry failed:", error);
    return { success: false, error: "alertInquiry failed" };
  }
}
