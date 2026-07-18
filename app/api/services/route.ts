import { NextResponse } from "next/server";
import { serviceCatalogService } from "@/lib/services/serviceCatalogService";
import { requireApiAuth, formatApiError } from "@/lib/auth/api-auth";

export async function GET() {
  try {
    const allServices = await serviceCatalogService.listServices();

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

export async function POST(req: Request) {
  try {
    const authContext = await requireApiAuth(req);

    if (authContext.profile.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only ADMIN users can create services" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { publicId, name, category, tagline, description, price, currency, imageUrl } = body;

    if (!name || !category || !publicId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, category, publicId" },
        { status: 400 }
      );
    }

    const existing = await serviceCatalogService.listServices();
    if (existing.some((s) => s.publicId === publicId)) {
      return NextResponse.json(
        { success: false, error: "Service with this public ID already exists" },
        { status: 409 }
      );
    }

    const newService = await serviceCatalogService.createService({
      publicId,
      name,
      category,
      tagline,
      description,
      price,
      currency: currency || "Nu.",
      imageUrl,
    });

    return NextResponse.json({ success: true, data: newService }, { status: 201 });
  } catch (error) {
    console.error("[API /api/services] Create error:", error);
    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as any).statusCode
        : 500
    });
  }
}
