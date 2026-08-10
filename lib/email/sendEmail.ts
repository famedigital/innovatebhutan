/**
 * Lightweight outbound email — SendGrid / Mailgun / SMTP from settings or env.
 * Soft-fails when not configured so mailto: share still works.
 */

import { createClient } from "@supabase/supabase-js";

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  from?: string;
};

async function loadEmailSettings() {
  const fromEnv = {
    sendgridKey: process.env.SENDGRID_API_KEY || "",
    mailgunKey: process.env.MAILGUN_API_KEY || "",
    mailgunDomain: process.env.MAILGUN_DOMAIN || "",
    from:
      process.env.EMAIL_FROM ||
      process.env.SMTP_FROM ||
      "Innovates Bhutan <noreply@innovates.bt>",
  };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !supabaseKey) return fromEnv;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", [
        "sendgrid_key",
        "mailgun_key",
        "mailgun_domain",
        "smtp_user",
        "email_from",
      ]);
    const map: Record<string, string> = {};
    data?.forEach((row: { key: string; value: string }) => {
      map[row.key] = row.value;
    });
    return {
      sendgridKey: map.sendgrid_key || fromEnv.sendgridKey,
      mailgunKey: map.mailgun_key || fromEnv.mailgunKey,
      mailgunDomain: map.mailgun_domain || fromEnv.mailgunDomain,
      from: map.email_from || map.smtp_user || fromEnv.from,
    };
  } catch {
    return fromEnv;
  }
}

export async function sendEmail(input: SendEmailInput): Promise<{
  success: boolean;
  skipped?: boolean;
  error?: string;
  provider?: string;
}> {
  const settings = await loadEmailSettings();
  const from = input.from || settings.from;

  if (settings.sendgridKey) {
    try {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.sendgridKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: input.to }] }],
          from: parseFrom(from),
          subject: input.subject,
          content: [
            { type: "text/plain", value: input.text },
            {
              type: "text/html",
              value: input.html || input.text.replace(/\n/g, "<br/>"),
            },
          ],
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        return { success: false, error: body || `SendGrid HTTP ${res.status}` };
      }
      return { success: true, provider: "sendgrid" };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "SendGrid failed",
      };
    }
  }

  if (settings.mailgunKey && settings.mailgunDomain) {
    try {
      const form = new URLSearchParams();
      form.set("from", from);
      form.set("to", input.to);
      form.set("subject", input.subject);
      form.set("text", input.text);
      if (input.html) form.set("html", input.html);

      const res = await fetch(
        `https://api.mailgun.net/v3/${settings.mailgunDomain}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`api:${settings.mailgunKey}`).toString("base64")}`,
          },
          body: form,
        }
      );
      if (!res.ok) {
        const body = await res.text();
        return { success: false, error: body || `Mailgun HTTP ${res.status}` };
      }
      return { success: true, provider: "mailgun" };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Mailgun failed",
      };
    }
  }

  return {
    success: false,
    skipped: true,
    error:
      "No email provider configured (SendGrid/Mailgun). Use mailto link instead.",
  };
}

function parseFrom(from: string): { email: string; name?: string } {
  const match = from.match(/^(.*)<([^>]+)>$/);
  if (match) {
    return { name: match[1].trim().replace(/^"|"$/g, ""), email: match[2].trim() };
  }
  return { email: from.trim() };
}
