import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      name, email, phone, service, message, source = 'website',
      utm_source, utm_medium, utm_campaign 
    } = body;

    if (!name || (!email && !phone)) {
      return NextResponse.json({ 
        success: false, 
        error: "Name and at least one contact (email/phone) required" 
      }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create lead
    const { data: lead, error } = await supabase.from('leads').insert([{
      name,
      phone: phone || '',
      email: email || '',
      source,
      status: 'new',
      priority: 'warm',
      notes: `Service: ${service || 'General'}\n\nMessage: ${message || ''}\n\nUTM: ${utm_source || ''}/${utm_medium || ''}/${utm_campaign || ''}`,
      assigned_to: '' // Not assigned yet - needs follow-up
    }]).select().single();

    if (error) throw error;

    // Log the inquiry for audit
    await supabase.from('audit_logs').insert([{
      action: 'LEAD_CAPTURED',
      entity_type: 'website_form',
      details: { name, service, source, lead_id: lead.id }
    }]);

    return NextResponse.json({ 
      success: true, 
      message: "Thank you! We'll contact you soon.",
      lead_id: lead.id
    });
  } catch (error: any) {
    console.error("Lead capture error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: "Lead capture endpoint. POST with name, email, phone, service, message." 
  });
}