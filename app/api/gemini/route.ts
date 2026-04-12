import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

async function getSettings(keys: string[]) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data } = await supabase.from('settings').select('key, value').in('key', keys);
  const map: Record<string, string> = {};
  data?.forEach((s: any) => { map[s.key] = s.value; });
  return map;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, systemPrompt } = body;

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Prompt is required" }, { status: 400 });
    }

    // Check database first, then env
    const settings = await getSettings(['gemini_api_key', 'google_gemini_api_key']);
    const apiKey = settings.gemini_api_key || settings.google_gemini_api_key || process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ success: false, error: "Gemini API key not configured. Add it in Settings > AI Engines." }, { status: 500 });
    }

    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const fullPrompt = systemPrompt ? `${systemPrompt}\n\nUser: ${prompt}` : prompt;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ success: true, response: text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const settings = await getSettings(['gemini_api_key', 'google_gemini_api_key']);
  const apiKey = settings.gemini_api_key || process.env.GEMINI_API_KEY;
  
  return NextResponse.json({ 
    success: true, 
    configured: !!apiKey,
    message: apiKey ? "Gemini API is configured" : "API key not set - configure in Settings page"
  });
}