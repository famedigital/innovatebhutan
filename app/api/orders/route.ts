import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { orderService } from "@/lib/services/orderService";
import { createOrderSchema, orderQuerySchema } from "@/lib/validations/order";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError } from "@/lib/errors";
import { validateRequest, validateQueryParams } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/orders - List orders with filters
export async function GET(req: NextRequest) {
  try {
    // 🔒 Require authentication
    const { profile } = await requireApiAuth(req);
    // 🔒 Require admin or staff role
    requireStaffOrAdmin(profile);

    const searchParams = req.nextUrl.searchParams;

    // Parse and validate query parameters
    const { page, limit, ...filters } = validateQueryParams(orderQuerySchema, searchParams);
    const offset = (page - 1) * limit;

    const result = await orderService.listOrders({
      ...filters,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: result.orders,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Orders fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// POST /api/orders - Create a new order
export async function POST(req: NextRequest) {
  try {
    // 🔒 Rate limiting
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(
      clientIp,
      rateLimitPresets.strict.maxRequests,
      rateLimitPresets.strict.windowMs
    );

    if (!rateLimitResult.allowed) {
      throw new RateLimitError(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
    }

    // 🔒 Require authentication
    const { profile } = await requireApiAuth(req);
    // 🔒 Require admin or staff role
    requireStaffOrAdmin(profile);

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(createOrderSchema, body);

    const order = await orderService.createOrder(
      validatedData,
      profile.userId
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CREATE",
        entity_type: "ORDER",
        entity_id: order.id,
        operator_id: profile.userId,
        details: { customer_name: order.customerName, total_amount: order.totalAmount },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: order,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Order creation error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
