import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { businesses, businessCategories, locations } from "@/db/schema";
import { sql, or, ilike, and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json({
        success: false,
        error: "Search query is required"
      }, { status: 400 });
    }

    // Build search conditions
    const searchConditions = or(
      ilike(businesses.name, `%${query}%`),
      ilike(businesses.description, `%${query}%`),
      ilike(businesses.tagline, `%${query}%`)
    );

    const whereClause = and(
      searchConditions,
      eq(businesses.status, 'active')
    );

    // Search businesses with joins
    const searchResults = await db
      .select({
        id: businesses.id,
        publicId: businesses.publicId,
        slug: businesses.slug,
        name: businesses.name,
        tagline: businesses.tagline,
        description: businesses.description,
        phone: businesses.phone,
        whatsapp: businesses.whatsapp,
        email: businesses.email,
        website: businesses.website,
        address: businesses.address,
        logoUrl: businesses.logoUrl,
        rating: businesses.rating,
        reviewCount: businesses.reviewCount,
        isVerified: businesses.isVerified,
        isFeatured: businesses.isFeatured,
        type: businesses.type,
        categoryName: businessCategories.name,
        locationName: locations.name,
      })
      .from(businesses)
      .leftJoin(businessCategories, eq(businesses.categoryId, businessCategories.id))
      .leftJoin(locations, eq(businesses.locationId, locations.id))
      .where(whereClause)
      .orderBy(sql`CASE
        WHEN ${businesses.name} ILIKE ${'%' + query + '%'} THEN 1
        WHEN ${businesses.tagline} ILIKE ${'%' + query + '%'} THEN 2
        ELSE 3
      END`)
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: searchResults,
      query,
      count: searchResults.length
    });

  } catch (error: any) {
    console.error("Directory search error:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}