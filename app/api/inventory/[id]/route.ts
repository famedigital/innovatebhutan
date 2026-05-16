import { NextRequest, NextResponse } from "next/server";
import { inventoryService } from "@/lib/services/inventoryService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError, NotFoundError } from "@/lib/errors";
import { validateId } from "@/lib/validations/validation";

// GET /api/inventory/[id] - Get a single item
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const { id } = await params;
    const itemId = validateId(id, "item ID");

    const item = await inventoryService.getItemById(itemId);

    if (!item) {
      throw new NotFoundError("Item");
    }

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// PUT /api/inventory/[id] - Update an item
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const { id } = await params;
    const itemId = validateId(id, "item ID");

    const body = await req.json();

    const item = await inventoryService.updateItem(itemId, body);

    return NextResponse.json({
      success: true,
      message: "Item updated successfully",
      data: item,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// DELETE /api/inventory/[id] - Delete an item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);

    const { id } = await params;
    const itemId = validateId(id, "item ID");

    await inventoryService.deleteItem(itemId, profile.role);

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
