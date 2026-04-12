import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, service, message, formType } = body;

    if (!name || (!email && !phone)) {
      return NextResponse.json({
        success: false,
        error: "Name and at least one contact method (email/phone) required"
      }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.from('leads').insert([{
      name,
      phone: phone || '',
      email: email || '',
      source: formType === 'service-request' ? 'support_form' : 'contact_form',
      notes: `Service: ${service || 'General'}\n\nMessage: ${message || ''}`,
      status: 'new',
      priority: 'warm'
    }]).select().single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Thank you! We'll contact you soon.",
      lead_id: data.id
    });
  } catch (error: any) {
    console.error("Form submission error:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Contact form endpoint. POST with name, email, phone, service, message."
  });
}