import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";

/**
 * GET /api/clients - List all clients
 *
 * Returns all clients with full contact details and metadata.
 *
 * SECURITY: Requires authenticated user with STAFF or ADMIN role
 */
export async function GET(req: NextRequest) {
  try {
    // Authenticate and authorize
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const allClients = await db
      .select({
        id: clients.id,
        name: clients.name,
        active: clients.active,
        contactPerson: clients.contactPerson,
        email: clients.email,
        phone: clients.phone,
        whatsapp: clients.whatsapp,
        whatsappGroupId: clients.whatsappGroupId,
        whatsappGroupLink: clients.whatsappGroupLink,
        logoUrl: clients.logoUrl,
        address: clients.address,
        city: clients.city,
        country: clients.country,
        createdAt: clients.createdAt,
      })
      .from(clients)
      .orderBy(clients.name);

    return NextResponse.json({
      success: true,
      data: allClients,
      count: allClients.length,
    });
  } catch (error) {
    console.error("[API /api/clients] Fetch error:", error);

    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as any).statusCode
        : 500
    });
  }
}

/**
 * POST /api/clients - Create a new client
 *
 * Creates a new client with full contact details.
 * All fields are optional except `name`.
 *
 * SECURITY: Requires authenticated user with STAFF or ADMIN role
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate and authorize
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const body = await req.json();
    const {
      name,
      contactPerson,
      email,
      phone,
      whatsapp,
      whatsappGroupId,
      whatsappGroupLink,
      logoUrl,
      address,
      city,
      country,
      active,
    } = body;

    // Validate required field
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Client name is required" },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && typeof email === "string") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    // Create client with all provided fields
    const [newClient] = await db
      .insert(clients)
      .values({
        name: name.trim(),
        contactPerson: contactPerson?.trim() || null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        whatsapp: whatsapp?.trim() || null,
        whatsappGroupId: whatsappGroupId?.trim() || null,
        whatsappGroupLink: whatsappGroupLink?.trim() || null,
        logoUrl: logoUrl?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        country: country?.trim() || null,
        active: active !== undefined ? active : true,
      })
      .returning();

    console.log("[API /api/clients] Created client:", newClient.id, newClient.name);

    return NextResponse.json(
      {
        success: true,
        data: newClient,
        message: "Client created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /api/clients] Creation error:", error);

    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as any).statusCode
        : 500
    });
  }
}
