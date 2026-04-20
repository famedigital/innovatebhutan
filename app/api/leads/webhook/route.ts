import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimitMiddleware, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";

export async function POST(req: NextRequest) {
  // Apply strict rate limiting for public webhook (20 req/min)
  const rateLimitResponse = checkRateLimitMiddleware(req, rateLimitPresets.strict.maxRequests, rateLimitPresets.strict.windowMs);
  if (rateLimitResponse) return rateLimitResponse;
  try {
    const body = await req.json();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { lead_name, phone, email, source, message, priority, value, source_platform } = body;

    if (!lead_name || !phone) {
      return NextResponse.json({ success: false, error: "lead_name and phone required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('leads')
      .insert([{
        name: lead_name,
        phone: phone,
        email: email || null,
        source: source || source_platform || 'webhook',
        notes: message || null,
        priority: priority || 'warm',
        value: value || 0,
        status: 'new'
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      lead_id: data.id,
      message: "Lead created successfully" 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const api_key = searchParams.get('api_key');

  if (api_key !== process.env.INTERNAL_API_KEY && process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ success: false, error: "Invalid API key" }, { status: 401 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      leads: data,
      count: data?.length || 0
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}