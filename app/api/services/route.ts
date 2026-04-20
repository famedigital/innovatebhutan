import { NextResponse } from "next/server";
import { db } from "@/db";
import { services } from "@/db/schema";

// GET /api/services - List all services
export async function GET() {
  try {
    const allServices = await db
      .select({
        id: services.id,
        name: services.name,
        category: services.category,
      })
      .from(services)
      .orderBy(services.name);

    return NextResponse.json({
      success: true,
      data: allServices,
    });
  } catch (error) {
    console.error("Services fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch services" },
      { status: 500 }
    );
  }
}
