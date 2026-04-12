import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Cloudinary settings from database
    const { data: settings } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['cloudinary_name', 'cloudinary_key', 'cloudinary_secret']);

    const settingsMap: Record<string, string> = {};
    settings?.forEach((s: any) => { settingsMap[s.key] = s.value; });

    const cloudName = settingsMap.cloudinary_name;
    const apiKey = settingsMap.cloudinary_key;
    const apiSecret = settingsMap.cloudinary_secret;

    // If Cloudinary is configured, use it
    if (cloudName && apiKey) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString('base64');
      
      // Upload to Cloudinary
      const cloudResp = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            file: `data:${file.type};base64,${base64}`,
            api_key: apiKey,
            timestamp: Date.now().toString(),
            signature: 'use_server_signature', // Simplified
            folder: 'innovate_erp'
          })
        }
      );

      const cloudData = await cloudResp.json();
      
      if (cloudData.secure_url) {
        // Save to database
        await supabase.from('media').insert({
          name: file.name,
          url: cloudData.secure_url,
          type: file.type.split('/')[0],
          size: file.size,
        });

        return NextResponse.json({
          success: true,
          url: cloudData.secure_url,
          source: 'cloudinary'
        });
      }
    }

    // Fallback: Upload to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("media")
      .getPublicUrl(fileName);

    // Save to database
    await supabase.from('media').insert({
      name: file.name,
      url: publicUrl,
      type: file.type.split('/')[0],
      size: file.size,
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      source: 'supabase'
    });
  } catch (error: any) {
    console.error("Media upload error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: "Media upload endpoint. POST with file form data." 
  });
}