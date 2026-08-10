import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { alertInquiry } from "@/lib/integrations/callmebot";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      email,
      service,
      message,
      formType,
      businessName,
      supportCategory,
      supportTopic,
    } = body;

    const displayName = (businessName || name || "").trim();
    if (!displayName || (!email && !phone)) {
      return NextResponse.json(
        {
          success: false,
          error: "Business name/name and at least one contact method (email/phone) required",
        },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const source =
      formType === "service-request" || formType === "support-request"
        ? "support_form"
        : "contact_form";

    const notes = [
      businessName ? `Business: ${businessName}` : null,
      supportCategory ? `Support category: ${supportCategory}` : null,
      supportTopic ? `Topic: ${supportTopic}` : null,
      `Service: ${service || supportTopic || supportCategory || "General"}`,
      "",
      `Message: ${message || ""}`,
    ]
      .filter(Boolean)
      .join("\n");

    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          name: displayName,
          phone: phone || "",
          email: email || "",
          source,
          notes,
          status: "new",
          priority: supportCategory === "technical" ? "hot" : "warm",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Soft-fail WhatsApp alert via CallMeBot
    void alertInquiry({
      source:
        source === "support_form"
          ? supportCategory === "technical"
            ? "Technical Support Request"
            : "Information Support Request"
          : "Contact Inquiry",
      name: name || displayName,
      businessName,
      phone,
      email,
      category: supportCategory || service,
      topic: supportTopic,
      message,
      leadId: data.id,
    });

    return NextResponse.json({
      success: true,
      message: "Thank you! We'll contact you soon.",
      lead_id: data.id,
    });
  } catch (error: unknown) {
    console.error("Form submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Submission failed",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message:
      "Contact form endpoint. POST with name/businessName, email, phone, service, message.",
  });
}
