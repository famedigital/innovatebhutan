import { NextRequest, NextResponse } from "next/server";
import { procurementService } from "@/lib/services/procurementService";
import { procurementRepository } from "@/lib/repositories/procurementRepository";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

// GET /api/procurement/purchase-orders - List purchase orders
export async function GET(req: NextRequest) {
  try {
    console.log('[API /api/procurement/purchase-orders] GET request received');

    // Require authentication
    const authContext = await requireApiAuth(req);
    console.log('[API /api/procurement/purchase-orders] Auth successful:', {
      userId: authContext.user.id,
      role: authContext.profile.role,
    });

    // Require admin or staff role
    requireStaffOrAdmin(authContext.profile);
    console.log('[API /api/procurement/purchase-orders] Role check passed');

    const searchParams = req.nextUrl.searchParams;
    const filters = {
      supplierId: searchParams.get("supplierId") ? parseInt(searchParams.get("supplierId")!) : undefined,
      status: searchParams.get("status") || undefined,
      projectId: searchParams.get("projectId") ? parseInt(searchParams.get("projectId")!) : undefined,
      warehouseId: searchParams.get("warehouseId") ? parseInt(searchParams.get("warehouseId")!) : undefined,
      limit: parseInt(searchParams.get("limit") || "50"),
      offset: parseInt(searchParams.get("offset") || "0"),
    };

    const result = await procurementService.listPurchaseOrders(filters);

    console.log('[API /api/procurement/purchase-orders] POs fetched successfully:', {
      count: result.purchaseOrders.length,
      total: result.total,
    });

    return NextResponse.json({
      success: true,
      data: result.purchaseOrders,
      pagination: {
        limit: filters.limit,
        offset: filters.offset,
        total: result.total,
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error('[API /api/procurement/purchase-orders] Error:', {
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// POST /api/procurement/purchase-orders - Create purchase order
export async function POST(req: NextRequest) {
  try {
    console.log('[API /api/procurement/purchase-orders] POST request received');

    // Require authentication
    const authContext = await requireApiAuth(req);
    console.log('[API /api/procurement/purchase-orders] Auth successful:', {
      userId: authContext.user.id,
      role: authContext.profile.role,
    });

    // Require admin or staff role
    requireStaffOrAdmin(authContext.profile);
    console.log('[API /api/procurement/purchase-orders] Role check passed');

    const body = await req.json();

    // Create PO
    const po = await procurementService.createPurchaseOrder(body, authContext.user.id);

    // Create PO items
    if (body.items && body.items.length > 0) {
      for (const item of body.items) {
        const amount = Number(item.quantity) * Number(item.rate);
        const taxRate = Number(item.taxRate || 0);
        const discountRate = Number(item.discountRate || 0);
        const taxAmount = amount * (taxRate / 100);
        const discountAmount = amount * (discountRate / 100);
        const netAmount = amount + taxAmount - discountAmount;

        await procurementRepository.createPOItem({
          purchaseOrderId: po.id,
          itemId: item.itemId,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: amount.toString(),
          taxRate: item.taxRate || "0",
          taxAmount: taxAmount.toString(),
          discountRate: item.discountRate || "0",
          discountAmount: discountAmount.toString(),
          netAmount: netAmount.toString(),
          warehouseId: item.warehouseId,
          notes: item.notes,
        });
      }
    }

    console.log('[API /api/procurement/purchase-orders] PO created successfully:', {
      poId: po.id,
      orderNumber: po.orderNumber,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Purchase Order created successfully",
        data: po,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error('[API /api/procurement/purchase-orders] Error:', {
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
