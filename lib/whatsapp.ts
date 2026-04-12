/**
 * 🛰️ WHATSAPP MESSAGING CLIENT
 * Supports both env vars and database settings
 */

import { createClient } from "@supabase/supabase-js";

const WHATSAPP_API_URL = "https://graph.facebook.com/v17.0";

async function getWhatsAppSettings() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  
  if (!supabaseUrl || !supabaseKey) {
    return {
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN
    };
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data } = await supabase.from('settings').select('key, value')
    .in('key', ['whatsapp_phone_id', 'whatsapp_token', 'whatsapp_access_token']);
  
  const map: Record<string, string> = {};
  data?.forEach((s: any) => { map[s.key] = s.value; });
  
  return {
    phoneNumberId: map.whatsapp_phone_id || process.env.WHATSAPP_PHONE_NUMBER_ID,
    accessToken: map.whatsapp_token || map.whatsapp_access_token || process.env.WHATSAPP_ACCESS_TOKEN
  };
}

export async function sendWhatsAppMessage(to: string, message: string) {
  const { phoneNumberId, accessToken } = await getWhatsAppSettings();
  
  if (!accessToken || !phoneNumberId) {
    console.error("WhatsApp credentials missing.");
    return { success: false, error: "Missing Credentials - configure in Settings" };
  }

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body: message },
      }),
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.error("WhatsApp Transmission Failure:", error);
    return { success: false, error };
  }
}

export async function sendWhatsAppDocument(to: string, media_url: string, filename: string) {
  const { phoneNumberId, accessToken } = await getWhatsAppSettings();
  
  if (!accessToken || !phoneNumberId) {
    return { success: false, error: "Missing Credentials" };
  }
  // Document sending logic
}