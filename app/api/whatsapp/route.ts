import { NextRequest, NextResponse } from "next/server";
import { analyzeERPIntent, type AIActionResponse } from "@/lib/gemini";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { createClient } from "@/utils/supabase/server";
import { checkRateLimitMiddleware, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";

const DEFAULT_VERIFY_TOKEN = "innovate_bhutan_secret_token";
const DEFAULT_SUPERUSER = "97517000000";

async function getSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from('settings').select('key, value')
    .in('key', ['whatsapp_verify_token', 'superuser_whatsapp']);
  
  const map: Record<string, string> = {};
  data?.forEach((s: any) => { map[s.key] = s.value; });
  
  return {
    verifyToken: map.whatsapp_verify_token || process.env.WHATSAPP_VERIFY_TOKEN || DEFAULT_VERIFY_TOKEN,
    superuserPhone: map.superuser_whatsapp || process.env.SUPERUSER_WHATSAPP || DEFAULT_SUPERUSER
  };
}

export async function GET(request: NextRequest) {
  const { verifyToken, superuserPhone } = await getSettings();
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === verifyToken) {
    console.log("🛰️ WhatsApp Webhook Verified Successfully.");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  // Apply rate limiting for WhatsApp webhook (30 req/min - higher due to message delivery)
  const rateLimitResponse = checkRateLimitMiddleware(request, 30, 60000);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { verifyToken, superuserPhone } = await getSettings();
    const body = await request.json();
    console.log("📥 Inbound WhatsApp Signal:", JSON.stringify(body, null, 2));

    const messageEntry = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    
    if (!messageEntry || messageEntry.type !== "text") {
      return NextResponse.json({ success: true, reason: "No text message" });
    }

    const from = messageEntry.from;
    const text = messageEntry.text.body;

    const supabase = await createClient();

    // 🧠 Step 1: Analyze intent via AI
    const aiResult: AIActionResponse = await analyzeERPIntent(text);
    console.log(`🤖 AI Triage [${from}]:`, aiResult.intent);

    // 📝 Step 2: Log interaction to database
    await supabase.from('whatsapp_logs').insert({
      from_number: from,
      message: text,
      intent: aiResult.intent,
      ai_response: aiResult.suggestedReply,
      confidence: aiResult.confidence
    });

    // 👑 SUPERUSER MODE - Admin can control ERP via WhatsApp
    if (from === superuserPhone || from === `+${superuserPhone}`) {
      await handleSuperuserCommand(supabase, from, text, aiResult);
      return NextResponse.json({ success: true, mode: "superuser" });
    }

    // 🏢 CLIENT MODE - Auto-create tickets, leads, etc.
    await handleClientMessage(supabase, from, text, aiResult);

    // 📤 Step 3: Send AI-generated auto-reply
    const replyMessage = generateAutoReply(aiResult);
    await sendWhatsAppMessage(from, replyMessage);

    return NextResponse.json({ success: true, intent: aiResult.intent });
  } catch (error) {
    console.error("🌋 WhatsApp Bot Error:", error);
    return NextResponse.json({ success: false, error: "Internal Protocol Failure" }, { status: 500 });
  }
}

async function handleSuperuserCommand(supabase: any, from: string, text: string, aiResult: AIActionResponse) {
  const lowerText = text.toLowerCase();
  
  // Get stats
  if (lowerText.includes("stats") || lowerText.includes("report") || lowerText.includes("dashboard")) {
    const [{ count: clients }, { count: tickets }, { data: transactions }] = await Promise.all([
      supabase.from('clients').select('*', { count: 'exact', head: true }),
      supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('transactions').select('amount, type')
    ]);
    
    const income = (transactions || []).filter((t: any) => t.type === 'income').reduce((sum: number, t: any) => sum + Number(t.amount), 0);
    
    const stats = `📊 *Innovate Bhutan ERP Stats*
    
👥 Clients: ${clients || 0}
🎫 Open Tickets: ${tickets || 0}
💰 Revenue: Nu. ${income.toLocaleString()}

Sent from WhatsApp Bot 🤖`;
    
    await sendWhatsAppMessage(from, stats);
    return;
  }

  // Add new client
  if (lowerText.includes("add client") || lowerText.includes("new client")) {
    await sendWhatsAppMessage(from, "To add a new client, please use the ERP Admin Panel at /admin/clients");
    return;
  }

  // Default: send AI suggestion
  await sendWhatsAppMessage(from, aiResult.suggestedReply);
}

async function handleClientMessage(supabase: any, from: string, text: string, aiResult: AIActionResponse) {
  const { data: client } = await supabase
    .from('clients')
    .select('id, name')
    .eq('whatsapp', from)
    .single();

  switch (aiResult.intent) {
    case "SUPPORT_TICKET":
      if (client) {
        await supabase.from('tickets').insert({
          client_id: client.id,
          subject: aiResult.summary,
          description: text,
          priority: aiResult.confidence > 0.8 ? 'high' : 'medium',
          status: 'open',
          source: 'whatsapp'
        });
        console.log(`🎫 Ticket created for client ${client.name}`);
      }
      break;

    case "SALES_LEAD":
      await supabase.from('leads').insert({
        source: 'whatsapp',
        phone: from,
        notes: text,
        status: 'new'
      });
      console.log(`📈 New lead from ${from}`);
      break;

    case "AMC_QUERY":
      if (client) {
        await supabase.from('amc_inquiries').insert({
          client_id: client.id,
          query: text,
          status: 'pending'
        });
      }
      break;

    case "EXPENSE_REPORT":
      await supabase.from('expense_submissions').insert({
        submitted_via: 'whatsapp',
        phone: from,
        description: text,
        amount: aiResult.structuredData?.amount || 0,
        status: 'pending'
      });
      break;
  }
}

function generateAutoReply(aiResult: AIActionResponse): string {
  const intro = "🤖 *Innovate Bhutan Bot*";
  
  switch (aiResult.intent) {
    case "SUPPORT_TICKET":
      return `${intro}

Thank you for reaching out! I've noted your concern and created a support ticket. Our technical team will contact you shortly.

📋 Reference: ${aiResult.suggestedReply}

Need immediate assistance? Call: +975 17268753`;
    
    case "SALES_LEAD":
      return `${intro}

Thank you for your interest in our services! Our sales team will reach out to you within 24 hours.

📞 For urgent queries: +975 17268753

${aiResult.suggestedReply}`;
    
    case "AMC_QUERY":
      return `${intro}

Thank you for your inquiry about your AMC contract. Our team will review and get back to you.

${aiResult.suggestedReply}

To check your contract status, visit our portal or call +975 17268753`;
    
    case "EXPENSE_REPORT":
      return `${intro}

Your expense submission has been received and is pending approval.

📋 ${aiResult.suggestedReply}

You can track all submissions in the ERP Finance section.`;
    
    default:
      return `${intro}

Thank you for messaging Innovate Bhutan! 

How can we help you today?
- Technical Support
- Sales Inquiry  
- AMC & Contracts
- General Enquiry

${aiResult.suggestedReply}

💚 *Innovate Bhutan - IT Solutions for Bhutan*`;
  }
}