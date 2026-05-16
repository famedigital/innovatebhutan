import { NextRequest, NextResponse } from "next/server";
import { procurementService } from "@/lib/services/procurementService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

// GET /api/procurement/purchase-orders/[id] - Get purchase order by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[API /api/procurement/purchase-orders/[id]] GET request received');

    // Require authentication
    const authContext = await requireApiAuth(req);
    console.log('[API /api/procurement/purchase-orders/[id]] Auth successful:', {
      userId: authContext.user.id,
      role: authContext.profile.role,
    });

    // Require admin or staff role
    requireStaffOrAdmin(authContext.profile);

    const { id } = await params;
    const poId = parseInt(id);

    if (isNaN(poId)) {
      return NextResponse.json(
        { success: false, error: "Invalid purchase order ID" },
        { status: 400 }
      );
    }

    const po = await procurementService.getPurchaseOrderById(poId);

    if (!po) {
      return NextResponse.json(
        { success: false, error: "Purchase Order not found" },
        { status: 404 }
      );
    }

    console.log('[API /api/procurement/purchase-orders/[id]] PO fetched successfully:', {
      poId: po.id,
      orderNumber: po.orderNumber,
    });

    return NextResponse.json({
      success: true,
      data: po,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error('[API /api/procurement/purchase-orders/[id]] Error:', {
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// PATCH /api/procurement/purchase-orders/[id] - Update purchase order
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[API /api/procurement/purchase-orders/[id]] PATCH request received');

    // Require authentication
    const authContext = await requireApiAuth(req);
    console.log('[API /api/procurement/purchase-orders/[id]] Auth successful:', {
      userId: authContext.user.id,
      role: authContext.profile.role,
    });

    // Require admin or staff role
    requireStaffOrAdmin(authContext.profile);

    const { id } = await params;
    const poId = parseInt(id);

    if (isNaN(poId)) {
      return NextResponse.json(
        { success: false, error: "Invalid purchase order ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const po = await procurementService.updatePurchaseOrder(
      poId,
      body,
      authContext.user.id,
      authContext.profile.role
    );

    console.log('[API /api/procurement/purchase-orders/[id]] PO updated successfully:', {
      poId: po.id,
      orderNumber: po.orderNumber,
    });

    return NextResponse.json({
      success: true,
      message: "Purchase Order updated successfully",
      data: po,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error('[API /api/procurement/purchase-orders/[id]] Error:', {
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// DELETE /api/procurement/purchase-orders/[id] - Delete purchase order
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('[API /api/procurement/purchase-orders/[id]] DELETE request received');

    // Require authentication
    const authContext = await requireApiAuth(req);
    console.log('[API /api/procurement/purchase-orders/[id]] Auth successful:', {
      userId: authContext.user.id,
      role: authContext.profile.role,
    });

    // Require admin role
    if (authContext.profile.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only administrators can delete purchase orders" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const poId = parseInt(id);

    if (isNaN(poId)) {
      return NextResponse.json(
        { success: false, error: "Invalid purchase order ID" },
        { status: 400 }
      );
    }

    await procurementService.deletePurchaseOrder(poId, authContext.user.id, authContext.profile.role);

    console.log('[API /api/procurement/purchase-orders/[id]] PO deleted successfully:', {
      poId,
    });

    return NextResponse.json({
      success: true,
      message: "Purchase Order deleted successfully",
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error('[API /api/procurement/purchase-orders/[id]] Error:', {
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
