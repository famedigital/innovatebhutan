import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { orderService } from "@/lib/services/orderService";
import { orderStatusSchema } from "@/lib/validations/order";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";
import { validateId, validateRequest } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// POST /api/orders/[id]/status - Transition order status
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
    const { status } = validateRequest(
      orderStatusSchema.pick({ status: true }).required(),
      body
    );

    const order = await orderService.transitionOrderStatus(orderId, status);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "STATUS_CHANGE",
        entity_type: "ORDER",
        entity_id: orderId,
        operator_id: profile.userId,
        details: { new_status: status },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Order status update error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
