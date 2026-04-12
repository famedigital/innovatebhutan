import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export type ERPIntent = "SUPPORT_TICKET" | "SALES_LEAD" | "AMC_QUERY" | "EXPENSE_REPORT" | "OTHER";

export interface AIActionResponse {
  intent: ERPIntent;
  summary: string;
  structuredData: any;
  suggestedReply: string;
  confidence: number;
}

async function getGeminiApiKey(): Promise<string> {
  // Check environment first
  const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
  if (envKey) return envKey;
  
  // Check database settings
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data } = await supabase.from('settings').select('value').eq('key', 'gemini_api_key').single();
    if (data?.value) return data.value;
  }
  
  return "";
}

export async function analyzeERPIntent(message: string): Promise<AIActionResponse> {
  const apiKey = await getGeminiApiKey();
  
  if (!apiKey) {
    return {
      intent: "OTHER",
      summary: "AI not configured",
      structuredData: {},
      suggestedReply: "AI not configured. Please add Gemini API key in Settings page.",
      confidence: 0,
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are the "Innovate Bhutan" ERP Liaison AI. 
    Analyze the following user message and categorize it into one of these intents:
    - SUPPORT_TICKET: Technical issues, POS lag, hardware problems.
    - SALES_LEAD: Interest in new services, pricing for POS, software upgrades.
    - AMC_QUERY: Questions about contract expiry, renewal, or system health.
    - EXPENSE_REPORT: Staff submitting spending, receipts, or bills.
    - OTHER: General greetings or unrelated text.

    User Message: "${message}"

    Return ONLY a JSON object with this structure:
    {
      "intent": "INTENT_NAME",
      "summary": "Short 1-sentence summary",
      "structuredData": { ... relevant fields ... },
      "suggestedReply": "A professional reply for the user",
      "confidence": 0.0 to 1.0
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse AI response as JSON");
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini Bridge Error:", error);
    return {
      intent: "OTHER",
      summary: "Manual review required due to system error.",
      structuredData: {},
      suggestedReply: "Something went wrong. Please contact support.",
      confidence: 0,
    };
  }
}