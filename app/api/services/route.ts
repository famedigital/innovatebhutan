import { NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireApiAuth, formatApiError } from "@/lib/auth/api-auth";

/**
 * GET /api/services - List all services
 *
 * Returns the service catalog.
 *
 * SECURITY: Public endpoint (no auth required) for service catalog display.
 * Rate limiting should be applied at middleware level.
 */
export async function GET() {
  try {
    const allServices = await db
      .select({
        id: services.id,
        publicId: services.publicId,
        name: services.name,
        category: services.category,
        tagline: services.tagline,
        description: services.description,
        price: services.price,
        currency: services.currency,
        imageUrl: services.imageUrl,
      })
      .from(services)
      .orderBy(services.name);

    return NextResponse.json({
      success: true,
      data: allServices,
      count: allServices.length,
    });
  } catch (error) {
    console.error("[API /api/services] Fetch error:", error);

    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as any).statusCode
        : 500
    });
  }
}

/**
 * POST /api/services - Create a new service
 *
 * Creates a new service catalog entry.
 *
 * SECURITY: Requires authenticated user with ADMIN role
 */
export async function POST(req: Request) {
  try {
    // Authenticate and authorize - only ADMIN can create services
    const authContext = await requireApiAuth(req);

    if (authContext.profile.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: "Only ADMIN users can create services",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { publicId, name, category, tagline, description, price, currency, imageUrl } = body;

    // Validate required fields
    if (!name || !category || !publicId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, category, publicId",
        },
        { status: 400 }
      );
    }

    // Check if publicId already exists
    const existing = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.publicId, publicId))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Service with this public ID already exists",
        },
        { status: 409 }
      );
    }

    // Create service
    const [newService] = await db
      .insert(services)
      .values({
        publicId,
        name,
        category,
        tagline,
        description,
        price,
        currency: currency || "Nu.",
        imageUrl,
      })
      .returning();

    console.log("[API /api/services] Created service:", newService.id, newService.name);

    return NextResponse.json({
      success: true,
      data: newService,
    }, { status: 201 });
  } catch (error) {
    console.error("[API /api/services] Create error:", error);

    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as any).statusCode
        : 500
    });
  }
}
