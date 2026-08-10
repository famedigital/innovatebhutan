import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { alertInquiry } from "@/lib/integrations/callmebot";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      service,
      message,
      source = "website",
      utm_source,
      utm_medium,
      utm_campaign,
      businessName,
      supportCategory,
      supportTopic,
    } = body;

    const displayName = (businessName || name || "").trim();
    if (!displayName || (!email && !phone)) {
      return NextResponse.json(
        {
          success: false,
          error: "Name and at least one contact (email/phone) required",
        },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const notes = [
      businessName ? `Business: ${businessName}` : null,
      supportCategory ? `Support category: ${supportCategory}` : null,
      supportTopic ? `Topic: ${supportTopic}` : null,
      `Service: ${service || "General"}`,
      "",
      `Message: ${message || ""}`,
      "",
      `UTM: ${utm_source || ""}/${utm_medium || ""}/${utm_campaign || ""}`,
    ]
      .filter(Boolean)
      .join("\n");

    const { data: lead, error } = await supabase
      .from("leads")
      .insert([
        {
          name: displayName,
          phone: phone || "",
          email: email || "",
          source,
          status: "new",
          priority: "warm",
          notes,
          assigned_to: "",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    await supabase.from("audit_logs").insert([
      {
        action: "LEAD_CAPTURED",
        entity_type: "website_form",
        details: { name: displayName, service, source, lead_id: lead.id },
      },
    ]);

    void alertInquiry({
      source: `Lead Capture (${source})`,
      name: name || displayName,
      businessName,
      phone,
      email,
      category: supportCategory || service,
      topic: supportTopic,
      message,
      leadId: lead.id,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! We'll contact you soon.",
      lead_id: lead.id,
    });
  } catch (error: unknown) {
    console.error("Lead capture error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Capture failed",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message:
      "Lead capture endpoint. POST with name, email, phone, service, message.",
  });
}
