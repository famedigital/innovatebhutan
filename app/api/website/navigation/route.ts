import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { navigationLinks } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";

// GET /api/website/navigation - Fetch navigation structure (public)
export async function GET() {
  try {
    const nav = await db
      .select()
      .from(navigationLinks)
      .where(eq(navigationLinks.isActive, true))
      .orderBy(asc(navigationLinks.displayOrder));

    return NextResponse.json({
      success: true,
      data: nav,
    });
  } catch (error) {
    console.error("Error fetching navigation:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch navigation" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/website/navigation - Create new navigation item
 *
 * Creates a new navigation link with support for nested items (via parentId).
 * Requires label and url fields.
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
      label,
      url,
      parentId,
      iconName,
      iconColor,
      badge,
      badgeColor,
      openInNewTab,
      displayOrder,
      isActive,
    } = body;

    // Validate required fields
    if (!label || typeof label !== "string" || label.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Label is required" },
        { status: 400 }
      );
    }

    if (!url || typeof url !== "string" || url.trim() === "") {
      return NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      );
    }

    // Verify parentId exists if provided
    if (parentId !== undefined && parentId !== null) {
      const parentExists = await db
        .select({ id: navigationLinks.id })
        .from(navigationLinks)
        .where(eq(navigationLinks.id, parentId))
        .limit(1);

      if (parentExists.length === 0) {
        return NextResponse.json(
          { success: false, error: "Parent navigation item not found" },
          { status: 400 }
        );
      }
    }

    // Create navigation item
    const [newNavItem] = await db
      .insert(navigationLinks)
      .values({
        label: label.trim(),
        url: url.trim(),
        parentId: parentId ?? null,
        iconName: iconName?.trim() || null,
        iconColor: iconColor?.trim() || null,
        badge: badge?.trim() || null,
        badgeColor: badgeColor?.trim() || null,
        openInNewTab: openInNewTab ?? false,
        displayOrder: displayOrder ?? 0,
        isActive: isActive !== undefined ? isActive : true,
      })
      .returning();

    console.log("[API /api/website/navigation] Created nav item:", newNavItem.id, newNavItem.label);

    return NextResponse.json(
      {
        success: true,
        data: newNavItem,
        message: "Navigation item created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /api/website/navigation] Creation error:", error);

    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as any).statusCode
        : 500
    });
  }
}

/**
 * PUT /api/website/navigation - Update existing navigation item
 *
 * Updates an existing navigation link by ID.
 * Accepts partial updates - only provided fields will be updated.
 *
 * SECURITY: Requires authenticated user with STAFF or ADMIN role
 */
export async function PUT(req: NextRequest) {
  try {
    // Authenticate and authorize
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const body = await req.json();
    const { id, ...updateFields } = body;

    // Validate id
    if (!id || typeof id !== "number") {
      return NextResponse.json(
        { success: false, error: "Valid ID is required" },
        { status: 400 }
      );
    }

    // Check if nav item exists
    const existing = await db
      .select()
      .from(navigationLinks)
      .where(eq(navigationLinks.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Navigation item not found" },
        { status: 404 }
      );
    }

    // Verify parentId exists if being updated
    if (updateFields.parentId !== undefined && updateFields.parentId !== null) {
      // Prevent setting self as parent
      if (updateFields.parentId === id) {
        return NextResponse.json(
          { success: false, error: "Cannot set item as its own parent" },
          { status: 400 }
        );
      }

      const parentExists = await db
        .select({ id: navigationLinks.id })
        .from(navigationLinks)
        .where(eq(navigationLinks.id, updateFields.parentId))
        .limit(1);

      if (parentExists.length === 0) {
        return NextResponse.json(
          { success: false, error: "Parent navigation item not found" },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};

    if (updateFields.label !== undefined) {
      if (typeof updateFields.label !== "string" || updateFields.label.trim() === "") {
        return NextResponse.json(
          { success: false, error: "Label cannot be empty" },
          { status: 400 }
        );
      }
      updates.label = updateFields.label.trim();
    }

    if (updateFields.url !== undefined) {
      if (typeof updateFields.url !== "string" || updateFields.url.trim() === "") {
        return NextResponse.json(
          { success: false, error: "URL cannot be empty" },
          { status: 400 }
        );
      }
      updates.url = updateFields.url.trim();
    }

    if (updateFields.parentId !== undefined) {
      updates.parentId = updateFields.parentId;
    }

    if (updateFields.iconName !== undefined) {
      updates.iconName = updateFields.iconName?.trim() || null;
    }

    if (updateFields.iconColor !== undefined) {
      updates.iconColor = updateFields.iconColor?.trim() || null;
    }

    if (updateFields.badge !== undefined) {
      updates.badge = updateFields.badge?.trim() || null;
    }

    if (updateFields.badgeColor !== undefined) {
      updates.badgeColor = updateFields.badgeColor?.trim() || null;
    }

    if (updateFields.openInNewTab !== undefined) {
      updates.openInNewTab = updateFields.openInNewTab;
    }

    if (updateFields.displayOrder !== undefined) {
      updates.displayOrder = updateFields.displayOrder;
    }

    if (updateFields.isActive !== undefined) {
      updates.isActive = updateFields.isActive;
    }

    // Update nav item
    const [updatedNavItem] = await db
      .update(navigationLinks)
      .set(updates)
      .where(eq(navigationLinks.id, id))
      .returning();

    console.log("[API /api/website/navigation] Updated nav item:", id);

    return NextResponse.json({
      success: true,
      data: updatedNavItem,
      message: "Navigation item updated successfully",
    });
  } catch (error) {
    console.error("[API /api/website/navigation] Update error:", error);

    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as any).statusCode
        : 500
    });
  }
}

/**
 * DELETE /api/website/navigation - Delete navigation item
 *
 * Deletes a navigation link by ID. Child items will be cascade deleted.
 *
 * SECURITY: Requires authenticated user with STAFF or ADMIN role
 */
export async function DELETE(req: NextRequest) {
  try {
    // Authenticate and authorize
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const body = await req.json();
    const { id } = body;

    // Validate id
    if (!id || typeof id !== "number") {
      return NextResponse.json(
        { success: false, error: "Valid ID is required" },
        { status: 400 }
      );
    }

    // Check if nav item exists
    const existing = await db
      .select()
      .from(navigationLinks)
      .where(eq(navigationLinks.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Navigation item not found" },
        { status: 404 }
      );
    }

    // Delete nav item (cascade will handle children)
    await db.delete(navigationLinks).where(eq(navigationLinks.id, id));

    console.log("[API /api/website/navigation] Deleted nav item:", id);

    return NextResponse.json({
      success: true,
      message: "Navigation item deleted successfully",
    });
  } catch (error) {
    console.error("[API /api/website/navigation] Delete error:", error);

    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as any).statusCode
        : 500
    });
  }
}
