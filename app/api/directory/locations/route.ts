import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { locations, businesses } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const activeOnly = searchParams.get('activeOnly') === 'true';
    const withBusinessCount = searchParams.get('withBusinessCount') === 'true';

    // Build query conditions
    const conditions = activeOnly ? [eq(locations.isActive, true)] : [];

    // Fetch locations
    const locationsData = await db
      .select({
        id: locations.id,
        publicId: locations.publicId,
        name: locations.name,
        district: locations.district,
        dzongkhag: locations.dzongkhag,
        thromde: locations.thromde,
        description: locations.description,
        coordinates: locations.coordinates,
        displayOrder: locations.displayOrder,
        isActive: locations.isActive,
        businessCount: withBusinessCount ? sql<number>`(SELECT COUNT(*) FROM ${businesses} WHERE ${businesses.locationId} = ${locations.id} AND ${businesses.status} = 'active')` : sql<number>`0`,
      })
      .from(locations)
      .where(conditions.length > 0 ? eq(locations.isActive, true) : undefined)
      .orderBy(locations.displayOrder);

    return NextResponse.json({
      success: true,
      data: locationsData
    });

  } catch (error: any) {
    console.error("Locations fetch error:", error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}