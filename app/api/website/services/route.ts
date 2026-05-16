import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { servicesFull } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

// GET /api/website/services - Fetch all services
// Query params: all=true to include inactive services (for admin)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeAll = searchParams.get('all') === 'true';

    const query = db.select().from(servicesFull);

    // Only filter by isActive if not requesting all services
    if (!includeAll) {
      query.where(eq(servicesFull.isActive, true));
    }

    const services = await query.orderBy(asc(servicesFull.displayOrder));

    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}

// POST /api/website/services - Create new service
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      slug,
      shortDescription,
      description,
      iconName,
      iconColor,
      gradientFrom,
      gradientTo,
      features,
      pricingDetails,
      galleryImages,
      videoUrl,
      ctaText,
      ctaLink,
      isActive,
      isFeatured,
      displayOrder,
      category,
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    // Auto-generate slug from title if not provided
    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const [service] = await db
      .insert(servicesFull)
      .values({
        title,
        slug: generatedSlug,
        shortDescription,
        description,
        iconName,
        iconColor,
        gradientFrom,
        gradientTo,
        features,
        pricingDetails,
        galleryImages,
        videoUrl,
        ctaText,
        ctaLink,
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        displayOrder: displayOrder ?? 0,
        category,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Service created successfully",
        data: service,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating service:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create service" },
      { status: 500 }
    );
  }
}

// PUT /api/website/services - Update existing service
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Service ID is required" },
        { status: 400 }
      );
    }

    // Auto-generate slug from title if title is being updated and slug is not provided
    let finalUpdateData = { ...updateData };
    if (updateData.title && !updateData.slug) {
      finalUpdateData.slug = updateData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    const [service] = await db
      .update(servicesFull)
      .set({
        ...finalUpdateData,
        updatedAt: new Date(),
      })
      .where(eq(servicesFull.id, id))
      .returning();

    if (!service) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update service" },
      { status: 500 }
    );
  }
}

// DELETE /api/website/services - Delete service
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Service ID is required" },
        { status: 400 }
      );
    }

    const [deletedService] = await db
      .delete(servicesFull)
      .where(eq(servicesFull.id, Number(id)))
      .returning();

    if (!deletedService) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
