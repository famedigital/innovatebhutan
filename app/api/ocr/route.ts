import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function getGeminiKey() {
  // Check env first
  const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
  if (envKey) return envKey;
  
  // Check database
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data } = await supabase.from('settings').select('value').eq('key', 'gemini_api_key').single();
  return data?.value || "";
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const fileExt = file.name.split(".").pop();
    const fileName = `ocr/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(fileName, file);

    if (uploadError) {
      return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from("media")
      .getPublicUrl(fileName);

    const geminiKey = await getGeminiKey();
    let ocrResult: any = {};

    if (geminiKey && file.type.startsWith("image/")) {
      const base64Data = Buffer.from(await file.arrayBuffer()).toString("base64");
      
      const prompt = type === "bank" 
        ? "Extract all transactions from this bank statement. For each transaction, provide: date, description, amount (positive for credit, negative for debit), and balance. Return as JSON array."
        : "Extract from this receipt: vendor name, date, items with quantities and prices, subtotal, tax, and total amount. Return as JSON.";

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                inlineData: {
                  mimeType: file.type,
                  data: base64Data
                }
              }, {
                text: prompt
              }]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 8192,
            }
          })
        }
      );

      const geminiData = await geminiRes.json();
      
      if (geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
        try {
          const text = geminiData.candidates[0].content.parts[0].text;
          const jsonMatch = text.match(/```json([\s\S]*?)```/);
          ocrResult = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(text);
        } catch (e) {
          ocrResult = { raw_text: geminiData.candidates[0].content.parts[0].text };
        }
      }
    }

    return NextResponse.json({
      success: true,
      result: {
        file_url: publicUrl,
        extracted: ocrResult,
        type,
        processed_at: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}