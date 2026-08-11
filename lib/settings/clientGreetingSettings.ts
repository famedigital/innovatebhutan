import { createClient } from "@supabase/supabase-js";

/** Default Bhutanese greeting for client-facing quotation messages */
export const DEFAULT_CLIENT_GREETING = "Kuzu zangpola!";

export type ClientGreetingSettings = {
  greeting: string;
};

function normalizeGreeting(raw: string | null | undefined): string {
  const trimmed = (raw || "").trim();
  if (!trimmed) return DEFAULT_CLIENT_GREETING;
  // Ensure a closing bang if user typed plain words without punctuation
  return trimmed;
}

export async function loadClientGreetingSettings(): Promise<ClientGreetingSettings> {
  const fromEnv = process.env.CLIENT_GREETING;
  const envGreeting = normalizeGreeting(fromEnv);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !supabaseKey) {
    return { greeting: envGreeting };
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .eq("key", "client_greeting")
      .maybeSingle();

    if (data?.value != null && String(data.value).trim() !== "") {
      return { greeting: normalizeGreeting(String(data.value)) };
    }
  } catch {
    // fall through
  }

  return { greeting: envGreeting };
}
