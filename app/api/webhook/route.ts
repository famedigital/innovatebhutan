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

    const { 
      source,           // 'make', 'zapier', 'custom', 'whatsapp', 'web'
      event,            // 'new_lead', 'ticket_created', 'payment', etc.
      data,             // The actual data payload
      phone,            // Contact phone
      email,            // Contact email  
      name,             // Contact name
      message           // Message content
    } = body;

    // Verify internal API key if configured
    const internalKey = process.env.INTERNAL_API_KEY;
    const providedKey = req.headers.get('x-api-key');
    
    if (internalKey && providedKey !== internalKey) {
      return NextResponse.json({ success: false, error: "Invalid API key" }, { status: 401 });
    }

    let result: any = null;

    switch (event) {
      case 'new_lead':
      case 'lead_created':
        result = await supabase.from('leads').insert([{
          name: name || data?.name || 'Unknown',
          phone: phone || data?.phone || data?.phoneNumber || '',
          email: email || data?.email || '',
          source: source || 'webhook',
          notes: message || data?.message || JSON.stringify(data),
          value: data?.value || data?.estimatedValue || 0,
          priority: data?.priority || 'warm',
          status: 'new'
        }]).select().single();
        break;

      case 'ticket_created':
        result = await supabase.from('tickets').insert([{
          subject: data?.subject || message?.substring(0, 100) || 'Webhook Ticket',
          description: message || data?.description || JSON.stringify(data),
          priority: data?.priority || 'medium',
          status: 'open',
          source: source || 'webhook'
        }]).select().single();
        break;

      case 'payment_received':
        result = await supabase.from('transactions').insert([{
          type: 'income',
          amount: data?.amount || 0,
          description: data?.description || message || 'Payment via webhook',
          category: data?.category || 'other',
          status: 'complete',
          source: 'webhook'
        }]).select().single();
        break;

      case 'client_created':
        result = await supabase.from('clients').insert([{
          name: name || data?.name || 'Unknown Client',
          contactPerson: data?.contactPerson || data?.contact_name || '',
          whatsapp: phone || data?.phone || data?.whatsapp || '',
          active: true
        }]).select().single();
        break;

      default:
        // Generic webhook - log to audit
        result = await supabase.from('audit_logs').insert([{
          action: 'WEBHOOK_RECEIVED',
          entityType: source || 'unknown',
          details: { event, data, phone, email, name, message }
        }]);
    }

    if (result?.error) throw result.error;

    return NextResponse.json({ 
      success: true, 
      message: `Event '${event}' processed successfully`,
      id: result?.data?.id
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const api_key = searchParams.get('api_key');

  if (api_key !== process.env.INTERNAL_API_KEY && process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ success: false, error: "Invalid API key" }, { status: 401 });
  }

  return NextResponse.json({ 
    success: true, 
    message: "ERP Webhook endpoint",
    supported_events: [
      'new_lead / lead_created',
      'ticket_created', 
      'payment_received',
      'client_created'
    ]
  });
}