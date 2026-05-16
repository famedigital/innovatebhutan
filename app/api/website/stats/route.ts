import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { statsContent } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

// GET /api/website/stats - Fetch all stats
export async function GET() {
  try {
    const stats = await db
      .select()
      .from(statsContent)
      .where(eq(statsContent.isActive, true))
      .orderBy(asc(statsContent.displayOrder));

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/website/stats - Create a new stat
 * @description Creates a new website statistic with label, value, and optional styling
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.label || !body.value) {
      return NextResponse.json(
        { success: false, error: "Label and value are required" },
        { status: 400 }
      );
    }

    const [newStat] = await db
      .insert(statsContent)
      .values({
        label: body.label,
        value: body.value,
        description: body.description ?? null,
        iconName: body.iconName ?? null,
        iconColor: body.iconColor ?? null,
        colorFrom: body.colorFrom ?? null,
        colorTo: body.colorTo ?? null,
        bgGradient: body.bgGradient ?? null,
        displayOrder: body.displayOrder ?? 0,
        isActive: body.isActive ?? true,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Stat created successfully",
        data: newStat,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating stat:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create stat" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/website/stats - Update an existing stat
 * @description Updates a stat by ID with new values
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: "Stat ID is required" },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {};
    if (body.label !== undefined) updateData.label = body.label;
    if (body.value !== undefined) updateData.value = body.value;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.iconName !== undefined) updateData.iconName = body.iconName;
    if (body.iconColor !== undefined) updateData.iconColor = body.iconColor;
    if (body.colorFrom !== undefined) updateData.colorFrom = body.colorFrom;
    if (body.colorTo !== undefined) updateData.colorTo = body.colorTo;
    if (body.bgGradient !== undefined) updateData.bgGradient = body.bgGradient;
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const [updatedStat] = await db
      .update(statsContent)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(statsContent.id, body.id))
      .returning();

    if (!updatedStat) {
      return NextResponse.json(
        { success: false, error: "Stat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Stat updated successfully",
      data: updatedStat,
    });
  } catch (error) {
    console.error("Error updating stat:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update stat" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/website/stats - Delete a stat
 * @description Deletes a stat by ID (soft delete via isActive flag)
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Stat ID is required" },
        { status: 400 }
      );
    }

    const statId = parseInt(id, 10);
    if (isNaN(statId)) {
      return NextResponse.json(
        { success: false, error: "Invalid stat ID" },
        { status: 400 }
      );
    }

    // Soft delete by setting isActive to false
    const [deletedStat] = await db
      .update(statsContent)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(statsContent.id, statId))
      .returning();

    if (!deletedStat) {
      return NextResponse.json(
        { success: false, error: "Stat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Stat deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting stat:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete stat" },
      { status: 500 }
    );
  }
}
