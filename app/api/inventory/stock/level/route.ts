import { NextRequest, NextResponse } from "next/server";
import { inventoryService } from "@/lib/services/inventoryService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

// GET /api/inventory/stock/level - Get current stock levels
export async function GET(req: NextRequest) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const searchParams = req.nextUrl.searchParams;
    const filters = {
      warehouseId: searchParams.get("warehouseId") ? parseInt(searchParams.get("warehouseId")!) : undefined,
      lowStock: searchParams.get("lowStock") === "true",
    };

    const stockLevels = await inventoryService.getStockLevels(filters);

    return NextResponse.json({
      success: true,
      data: stockLevels,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
