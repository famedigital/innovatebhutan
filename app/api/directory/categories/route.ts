import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { businessCategories, businesses } from "@/db/schema";
import { eq, sql, desc, count } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const withBusinessCount = searchParams.get('withBusinessCount') === 'true';

    // Build query conditions
    const conditions = activeOnly ? [eq(businessCategories.isActive, true)] : [];

    // Fetch categories
    const categoriesData = await db
      .select({
        id: businessCategories.id,
        publicId: businessCategories.publicId,
        name: businessCategories.name,
        slug: businessCategories.slug,
        icon: businessCategories.icon,
        description: businessCategories.description,
        displayOrder: businessCategories.displayOrder,
        isActive: businessCategories.isActive,
        parentId: businessCategories.parentId,
        businessCount: withBusinessCount ? sql<number>`(SELECT COUNT(*) FROM ${businesses} WHERE ${businesses.categoryId} = ${businessCategories.id} AND ${businesses.status} = 'active')` : sql<number>`0`,
      })
      .from(businessCategories)
      .where(conditions.length > 0 ? eq(businessCategories.isActive, true) : undefined)
      .orderBy(businessCategories.displayOrder);

    return NextResponse.json({
      success: true,
      data: categoriesData
    });

  } catch (error: any) {
    console.error("Categories fetch error:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}