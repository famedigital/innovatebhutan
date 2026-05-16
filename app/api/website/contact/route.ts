import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactInfoExtended } from "@/db/schema";
import { eq } from "drizzle-orm";

// Allowed info types for validation
const ALLOWED_INFO_TYPES = [
  "phone",
  "email",
  "address",
  "working_hours",
  "social_media",
  "website",
  "other",
];

// GET /api/website/contact - Fetch contact information
export async function GET() {
  try {
    const contact = await db
      .select()
      .from(contactInfoExtended)
      .where(eq(contactInfoExtended.isActive, true))
      .orderBy(contactInfoExtended.displayOrder);

    // Group by info_type
    const grouped = contact.reduce((acc, item) => {
      if (!acc[item.infoType]) acc[item.infoType] = [];
      acc[item.infoType].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    console.error("Error fetching contact info:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch contact info" },
      { status: 500 }
    );
  }
}

// POST /api/website/contact - Create new contact item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { infoType, label, value, displayOrder, isActive } = body;

    // Validate required fields
    if (!infoType || !value) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: infoType, value" },
        { status: 400 }
      );
    }

    // Validate infoType
    if (!ALLOWED_INFO_TYPES.includes(infoType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid infoType. Must be one of: ${ALLOWED_INFO_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Create new contact item
    const [newContact] = await db
      .insert(contactInfoExtended)
      .values({
        infoType,
        label: label || null,
        value,
        displayOrder: displayOrder ?? 0,
        isActive: isActive ?? true,
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newContact,
    });
  } catch (error) {
    console.error("Error creating contact info:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create contact info" },
      { status: 500 }
    );
  }
}

// PUT /api/website/contact - Update existing contact item
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, infoType, label, value, displayOrder, isActive } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required field: id" },
        { status: 400 }
      );
    }

    // Validate infoType if provided
    if (infoType && !ALLOWED_INFO_TYPES.includes(infoType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid infoType. Must be one of: ${ALLOWED_INFO_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (infoType !== undefined) updateData.infoType = infoType;
    if (label !== undefined) updateData.label = label;
    if (value !== undefined) updateData.value = value;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update contact item
    const [updatedContact] = await db
      .update(contactInfoExtended)
      .set(updateData)
      .where(eq(contactInfoExtended.id, id))
      .returning();

    if (!updatedContact) {
      return NextResponse.json(
        { success: false, error: "Contact item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedContact,
    });
  } catch (error) {
    console.error("Error updating contact info:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update contact info" },
      { status: 500 }
    );
  }
}

// DELETE /api/website/contact - Delete contact item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameter: id" },
        { status: 400 }
      );
    }

    const idNum = parseInt(id, 10);
    if (isNaN(idNum)) {
      return NextResponse.json(
        { success: false, error: "Invalid id parameter" },
        { status: 400 }
      );
    }

    // Delete contact item
    const [deletedContact] = await db
      .delete(contactInfoExtended)
      .where(eq(contactInfoExtended.id, idNum))
      .returning();

    if (!deletedContact) {
      return NextResponse.json(
        { success: false, error: "Contact item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contact item deleted successfully",
      data: deletedContact,
    });
  } catch (error) {
    console.error("Error deleting contact info:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete contact info" },
      { status: 500 }
    );
  }
}
