import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { orderService } from "@/lib/services/orderService";
import { createOrderItemSchema } from "@/lib/validations/order";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError, BadRequestError } from "@/lib/errors";
import { validateId, validateRequest } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/orders/[id]/items - Get order items
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const { id } = await params;
    const orderId = validateId(id, "Order ID");

    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const result = await orderService.getOrderWithItems(orderId);

    return NextResponse.json({
      success: true,
      data: result.items,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Order items fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// POST /api/orders/[id]/items - Add item to order
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const { id } = await params;
    const orderId = validateId(id, "Order ID");

    const body = await req.json();

    // Validate and add orderId to the request
    const validatedData = validateRequest(createOrderItemSchema.omit({ orderId: true }), body);
    const item = await orderService.addOrderItem(
      orderId,
      validatedData.serviceId,
      validatedData.quantity,
      validatedData.unitPrice
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CREATE",
        entity_type: "ORDER_ITEM",
        entity_id: item.id,
        operator_id: profile.userId,
        details: { order_id: orderId, service_id: validatedData.serviceId },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Order item added successfully",
        data: item,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Order item creation error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
