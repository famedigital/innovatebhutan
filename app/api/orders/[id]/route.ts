import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { orderService } from "@/lib/services/orderService";
import { updateOrderSchema } from "@/lib/validations/order";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/orders/[id] - Get order by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔒 Require authentication
    const { profile } = await requireApiAuth(req);
    // 🔒 Require admin or staff role
    requireStaffOrAdmin(profile);

    const { id } = await params;
    const orderId = validateId(id, "Order ID");

    const result = await orderService.getOrderWithItems(orderId);

    if (!result.order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { order: result.order, items: result.items },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Order fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// PATCH /api/orders/[id] - Update order
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔒 Require authentication
    const { profile } = await requireApiAuth(req);
    // 🔒 Require admin or staff role
    requireStaffOrAdmin(profile);

    const { id } = await params;
    const orderId = validateId(id, "Order ID");

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(updateOrderSchema, body);

    const order = await orderService.updateOrder(
      orderId,
      validatedData,
      profile.userId,
      profile.role
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "UPDATE",
        entity_type: "ORDER",
        entity_id: order.id,
        operator_id: profile.userId,
        details: { changes: validatedData },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Order update error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// DELETE /api/orders/[id] - Delete order
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔒 Require authentication
    const { profile } = await requireApiAuth(req);
    // 🔒 Require admin role only
    if (profile.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Only administrators can delete orders" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const orderId = validateId(id, "Order ID");

    // Get order details for audit log before deleting
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    await orderService.deleteOrder(orderId, profile.userId, profile.role);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "DELETE",
        entity_type: "ORDER",
        entity_id: orderId,
        operator_id: profile.userId,
        details: { customer_name: order.customerName },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Order deletion error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
