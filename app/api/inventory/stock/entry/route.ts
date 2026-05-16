import { NextRequest, NextResponse } from "next/server";
import { inventoryService } from "@/lib/services/inventoryService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

// POST /api/inventory/stock/entry - Process stock movement (receipt, issue, transfer, adjustment)
export async function POST(req: NextRequest) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const body = await req.json();
    const { operation } = body;

    let result;

    switch (operation) {
      case "receipt":
        result = await inventoryService.receiveStock(body);
        break;

      case "issue":
        result = await inventoryService.issueStock(body);
        break;

      case "transfer":
        result = await inventoryService.transferStock(body);
        break;

      case "adjustment":
        result = await inventoryService.adjustStock(body);
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: "Invalid operation. Must be: receipt, issue, transfer, or adjustment",
          },
          { status: 400 }
        );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Stock ${operation} processed successfully`,
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
