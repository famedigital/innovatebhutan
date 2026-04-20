import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { orderService } from "@/lib/services/orderService";
import { updateOrderItemSchema } from "@/lib/validations/order";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";
import { validateId, validateRequest } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// PATCH /api/order-items/[id] - Update order item
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const { id } = await params;
    const itemId = validateId(id, "Order Item ID");

    const body = await req.json();
    const validatedData = validateRequest(updateOrderItemSchema, body);

    const item = await orderService.updateOrderItem(itemId, validatedData);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "UPDATE",
        entity_type: "ORDER_ITEM",
        entity_id: itemId,
        operator_id: profile.userId,
        details: { changes: validatedData },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Order item updated successfully",
      data: item,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Order item update error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// DELETE /api/order-items/[id] - Delete order item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const { id } = await params;
    const itemId = validateId(id, "Order Item ID");

    await orderService.removeOrderItem(itemId);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "DELETE",
        entity_type: "ORDER_ITEM",
        entity_id: itemId,
        operator_id: profile.userId,
        details: {},
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Order item deleted successfully",
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Order item deletion error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
