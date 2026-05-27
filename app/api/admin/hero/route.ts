/**
 * 🎯 HERO CONTENT ADMIN API ROUTES
 * Admin endpoints for managing hero content
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllHeroContent,
  createHeroContent,
} from "@/lib/services/heroService";

/**
 * GET /api/admin/hero
 * Get all hero content (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const heroContentList = await getAllHeroContent();

    return NextResponse.json({
      success: true,
      data: heroContentList,
      count: heroContentList.length,
    });
  } catch (error) {
    console.error("Admin API error fetching hero content list:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero content list" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/hero
 * Create new hero content (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    const body = await request.json();

    // Validate required fields
    if (!body.headline) {
      return NextResponse.json(
        { error: "Headline is required" },
        { status: 400 }
      );
    }

    const result = await createHeroContent(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Hero content created successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("Admin API error creating hero content:", error);
    return NextResponse.json(
      { error: "Failed to create hero content" },
      { status: 500 }
    );
  }
}