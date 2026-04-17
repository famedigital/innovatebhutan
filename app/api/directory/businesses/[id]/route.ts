import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { businesses, businessCategories, locations, businessReviews, businessHours, businessAmenities } from "@/db/schema";
import { db } from "@/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const businessId = parseInt(params.id);

    if (isNaN(businessId)) {
      return NextResponse.json({
        success: false,
        error: "Invalid business ID"
      }, { status: 400 });
    }

    // Get business details with joins
    const [business] = await db.select({
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
      coordinates: businesses.coordinates,
      logoUrl: businesses.logoUrl,
      coverImageUrl: businesses.coverImageUrl,
      galleryUrls: businesses.galleryUrls,
      rating: businesses.rating,
      reviewCount: businesses.reviewCount,
      isVerified: businesses.isVerified,
      isFeatured: businesses.isFeatured,
      type: businesses.type,
      status: businesses.status,
      categoryId: businesses.categoryId,
      locationId: businesses.locationId,
      categoryName: businessCategories.name,
      categorySlug: businessCategories.slug,
      categoryIcon: businessCategories.icon,
      locationName: locations.name,
      locationDistrict: locations.district,
      locationDescription: locations.description,
    })
    .from(businesses)
    .leftJoin(businessCategories, eq(businesses.categoryId, businessCategories.id))
    .leftJoin(locations, eq(businesses.locationId, locations.id))
    .where(eq(businesses.id, businessId))
    .limit(1);

    if (!business) {
      return NextResponse.json({
        success: false,
        error: "Business not found"
      }, { status: 404 });
    }

    // Get reviews for this business
    const reviews = await db.select({
      id: businessReviews.id,
      customerName: businessReviews.customerName,
      rating: businessReviews.rating,
      title: businessReviews.title,
      comment: businessReviews.comment,
      response: businessReviews.response,
      isVerified: businessReviews.isVerified,
      createdAt: businessReviews.createdAt,
    })
    .from(businessReviews)
    .where(eq(businessReviews.businessId, businessId))
    .orderBy(businessReviews.createdAt)
    .limit(10);

    // Get business hours
    const hours = await db.select()
    .from(businessHours)
    .where(eq(businessHours.businessId, businessId))
    .orderBy(businessHours.dayOfWeek);

    // Get amenities/features
    const amenities = await db.select()
    .from(businessAmenities)
    .where(eq(businessAmenities.businessId, businessId));

    return NextResponse.json({
      success: true,
      data: {
        ...business,
        reviews,
        hours,
        amenities
      }
    });

  } catch (error: any) {
    console.error("Business detail fetch error:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}