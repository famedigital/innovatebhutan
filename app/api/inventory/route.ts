import { NextRequest, NextResponse } from "next/server";
import { inventoryService } from "@/lib/services/inventoryService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

// GET /api/inventory - List items with filters
export async function GET(req: NextRequest) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const searchParams = req.nextUrl.searchParams;
    const filters = {
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      isActive: searchParams.get("isActive") === "true" ? true : searchParams.get("isActive") === "false" ? false : undefined,
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
    };

    const result = await inventoryService.listItems(filters);

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: result.total,
      },
    });
  } catch (error) {
    console.error("[API /api/inventory] GET error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to list inventory";
    const isMissingTable =
      /relation .* does not exist|undefined table|items/i.test(message);
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error)
      ? (error as { statusCode?: number }).statusCode || 500
      : 500;
    return NextResponse.json(
      {
        ...errorResponse,
        error: isMissingTable
          ? "Inventory tables missing. Apply drizzle/0015_erp_modules_clean.sql (items/warehouses) on Supabase."
          : errorResponse.error || message,
      },
      { status: statusCode }
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const body = await req.json();

    const item = await inventoryService.createItem(body);

    return NextResponse.json(
      {
        success: true,
        message: "Item created successfully",
        data: item,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
