import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { websiteContentExtended } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/website/content - Fetch website content
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "home";
    const section = searchParams.get("section");

    let whereClause: any = eq(websiteContentExtended.page, page);
    if (section) {
      whereClause = and(
        eq(websiteContentExtended.page, page),
        eq(websiteContentExtended.section, section)
      );
    }

    const content = await db
      .select()
      .from(websiteContentExtended)
      .where(whereClause)
      .orderBy(websiteContentExtended.contentKey);

    return NextResponse.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error("Error fetching website content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

// PUT /api/website/content - Update website content
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { page, section, content_key, value, type } = body;

    if (!page || !section || !content_key) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if content exists
    const existing = await db
      .select()
      .from(websiteContentExtended)
      .where(
        and(
          eq(websiteContentExtended.page, page),
          eq(websiteContentExtended.section, section),
          eq(websiteContentExtended.contentKey, content_key)
        )
      )
      .limit(1);

    let result;
    if (existing && existing.length > 0) {
      // Update existing
      [result] = await db
        .update(websiteContentExtended)
        .set({
          value,
          type: type || 'text',
          updatedAt: new Date()
        })
        .where(
          and(
            eq(websiteContentExtended.page, page),
            eq(websiteContentExtended.section, section),
            eq(websiteContentExtended.contentKey, content_key)
          )
        )
        .returning();
    } else {
      // Insert new
      [result] = await db
        .insert(websiteContentExtended)
        .values({
          page,
          section,
          contentKey: content_key,
          value,
          type: type || 'text',
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error updating website content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update content" },
      { status: 500 }
    );
  }
}
