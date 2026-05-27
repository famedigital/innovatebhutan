/**
 * 🎯 HERO CONTENT ADMIN API ROUTES (Individual)
 * Admin endpoints for managing specific hero content items
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getHeroContentById,
  updateHeroContent,
  deleteHeroContent,
  toggleHeroContentActive,
  setActiveHeroContent,
} from "@/lib/services/heroService";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/admin/hero/[id]
 * Get specific hero content by ID (admin only)
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    // TODO: Add admin authentication check
    const { id } = await context.params;
    const heroContentId = parseInt(id);

    if (isNaN(heroContentId)) {
      return NextResponse.json(
        { error: "Invalid hero content ID" },
        { status: 400 }
      );
    }

    const heroContent = await getHeroContentById(heroContentId);

    if (!heroContent) {
      return NextResponse.json(
        { error: "Hero content not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: heroContent,
    });
  } catch (error) {
    console.error("Admin API error fetching hero content:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero content" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/hero/[id]
 * Update hero content (admin only)
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    // TODO: Add admin authentication check
    const { id } = await context.params;
    const heroContentId = parseInt(id);

    if (isNaN(heroContentId)) {
      return NextResponse.json(
        { error: "Invalid hero content ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const result = await updateHeroContent(heroContentId, body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Hero content updated successfully",
    });
  } catch (error) {
    console.error("Admin API error updating hero content:", error);
    return NextResponse.json(
      { error: "Failed to update hero content" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/hero/[id]
 * Delete hero content (admin only)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // TODO: Add admin authentication check
    const { id } = await context.params;
    const heroContentId = parseInt(id);

    if (isNaN(heroContentId)) {
      return NextResponse.json(
        { error: "Invalid hero content ID" },
        { status: 400 }
      );
    }

    const result = await deleteHeroContent(heroContentId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Hero content deleted successfully",
    });
  } catch (error) {
    console.error("Admin API error deleting hero content:", error);
    return NextResponse.json(
      { error: "Failed to delete hero content" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/hero/[id]/toggle
 * Toggle hero content active status (admin only)
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    // TODO: Add admin authentication check
    const { id } = await context.params;
    const heroContentId = parseInt(id);

    if (isNaN(heroContentId)) {
      return NextResponse.json(
        { error: "Invalid hero content ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action } = body;

    let result;
    if (action === "toggle") {
      result = await toggleHeroContentActive(heroContentId);
    } else if (action === "setActive") {
      result = await setActiveHeroContent(heroContentId);
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: "Hero content set as active successfully",
        });
      }
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'toggle' or 'setActive'" },
        { status: 400 }
      );
    }

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || "Failed to update hero content status" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Hero content status updated successfully",
    });
  } catch (error) {
    console.error("Admin API error toggling hero content status:", error);
    return NextResponse.json(
      { error: "Failed to update hero content status" },
      { status: 500 }
    );
  }
}