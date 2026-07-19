import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";

/**
 * PATCH /api/clients/[id] - Update a client
 *
 * Updates an existing client with provided fields.
 *
 * SECURITY: Requires authenticated user with STAFF or ADMIN role
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate and authorize
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const { id } = await params;
    const clientId = parseInt(id);
    if (isNaN(clientId)) {
      return NextResponse.json(
        { success: false, error: "Invalid client ID" },
        { status: 400 }
      );
    }

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

    // Build update object with only provided fields
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (contactPerson !== undefined) updateData.contactPerson = contactPerson?.trim() || null;
    if (email !== undefined) updateData.email = email?.trim() || null;
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp?.trim() || null;
    if (whatsappGroupId !== undefined) updateData.whatsappGroupId = whatsappGroupId?.trim() || null;
    if (whatsappGroupLink !== undefined) updateData.whatsappGroupLink = whatsappGroupLink?.trim() || null;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl?.trim() || null;
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (city !== undefined) updateData.city = city?.trim() || null;
    if (country !== undefined) updateData.country = country?.trim() || null;
    if (active !== undefined) updateData.active = active;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    // Update client
    const [updatedClient] = await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, clientId))
      .returning();

    if (!updatedClient) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    console.log("[API /api/clients/[id]] Updated client:", clientId);

    return NextResponse.json({
      success: true,
      data: updatedClient,
      message: "Client updated successfully",
    });
  } catch (error) {
    console.error("[API /api/clients/[id]] Update error:", error);

    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as any).statusCode
        : 500
    });
  }
}

/**
 * DELETE /api/clients/[id] - Delete a client
 *
 * Deletes a client by ID.
 *
 * SECURITY: Requires authenticated user with STAFF or ADMIN role
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate and authorize
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const clientId = parseInt(params.id);
    if (isNaN(clientId)) {
      return NextResponse.json(
        { success: false, error: "Invalid client ID" },
        { status: 400 }
      );
    }

    await db.delete(clients).where(eq(clients.id, clientId));

    console.log("[API /api/clients/[id]] Deleted client:", clientId);

    return NextResponse.json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("[API /api/clients/[id]] Delete error:", error);

    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as any).statusCode
        : 500
    });
  }
}
