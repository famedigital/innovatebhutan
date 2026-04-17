import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { businesses, businessCategories, locations } from "@/db/schema";
import { sql, eq, like, desc, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const categoryId = searchParams.get('categoryId');
    const locationId = searchParams.get('locationId');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const type = searchParams.get('type');
    const status = searchParams.get('status') || 'active';

    // Build query conditions
    const conditions = [];

    if (status) {
      conditions.push(eq(businesses.status, status as any));
    }

    if (featured === 'true') {
      conditions.push(eq(businesses.isFeatured, true));
    }

    if (type) {
      conditions.push(eq(businesses.type, type as any));
    }

    if (categoryId) {
      conditions.push(eq(businesses.categoryId, parseInt(categoryId)));
    }

    if (locationId) {
      conditions.push(eq(businesses.locationId, parseInt(locationId)));
    }

    if (search) {
      conditions.push(
        sql`(${businesses.name} ILIKE ${'%' + search + '%'} OR ${businesses.description} ILIKE ${'%' + search + '%'} OR ${businesses.tagline} ILIKE ${'%' + search + '%'})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(businesses)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    // Fetch businesses with joins
    const businessesData = await db
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
        coverImageUrl: businesses.coverImageUrlUrl,
        rating: businesses.rating,
        reviewCount: businesses.reviewCount,
        isVerified: businesses.isVerified,
        isFeatured: businesses.isFeatured,
        type: businesses.type,
        status: businesses.status,
        categoryName: businessCategories.name,
        locationName: locations.name,
      })
      .from(businesses)
      .leftJoin(businessCategories, eq(businesses.categoryId, businessCategories.id))
      .leftJoin(locations, eq(businesses.locationId, locations.id))
      .where(whereClause)
      .orderBy(desc(businesses.isFeatured), desc(businesses.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: businessesData,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error: any) {
    console.error("Directory businesses fetch error:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      tagline,
      description,
      categoryId,
      locationId,
      phone,
      whatsapp,
      email,
      website,
      address,
      type,
      ownerId
    } = body;

    // Validation
    if (!name || !description) {
      return NextResponse.json({
        success: false,
        error: "Name and description are required"
      }, { status: 400 });
    }

    // Generate public ID and slug
    const publicId = `biz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);

    // Create business
    const [business] = await db.insert(businesses).values({
      publicId,
      slug,
      name,
      tagline,
      description,
      categoryId: categoryId ? parseInt(categoryId) : null,
      locationId: locationId ? parseInt(locationId) : null,
      phone,
      whatsapp,
      email,
      website,
      address,
      type: type || 'external',
      ownerId: ownerId ? parseInt(ownerId) : null,
      status: 'pending', // Pending approval
      rating: '0',
      reviewCount: 0,
      isVerified: false,
      isFeatured: false
    }).returning();

    return NextResponse.json({
      success: true,
      message: "Business listing submitted for review",
      data: business
    }, { status: 201 });

  } catch (error: any) {
    console.error("Business creation error:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}