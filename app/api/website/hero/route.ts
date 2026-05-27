/**
 * 🎯 HERO CONTENT API ROUTES
 * Public endpoint for fetching active hero content
 */

import { NextRequest, NextResponse } from "next/server";
import { getActiveHeroContent } from "@/lib/services/heroService";

/**
 * GET /api/website/hero
 * Get active hero content for public website display
 */
export async function GET(request: NextRequest) {
  try {
    const heroContent = await getActiveHeroContent();

    if (!heroContent) {
      return NextResponse.json(
        { error: "No active hero content found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: heroContent,
    });
  } catch (error) {
    console.error("API error fetching hero content:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero content" },
      { status: 500 }
    );
  }
}