import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { transactionService } from "@/lib/services/transactionService";
import { createTransactionSchema, transactionQuerySchema } from "@/lib/validations/transaction";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError } from "@/lib/errors";
import { validateRequest, validateQueryParams } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/transactions - List transactions with filters
export async function GET(req: NextRequest) {
  try {
    // 🔒 Require authentication
    const { profile } = await requireApiAuth(req);
    // 🔒 Require admin or staff role
    requireStaffOrAdmin(profile);

    const searchParams = req.nextUrl.searchParams;

    // Parse and validate query parameters
    const queryParams = validateQueryParams(transactionQuerySchema, searchParams);
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 20;
    const { page: _, limit: __, ...filters } = queryParams;
    const offset = (page - 1) * limit;

    const result = await transactionService.listTransactions({
      ...filters,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: result.transactions,
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
    console.error("Transactions fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// POST /api/transactions - Create a new transaction
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
    const validatedData = validateRequest(createTransactionSchema, body);

    const transaction = await transactionService.createTransaction(
      validatedData,
      profile.userId
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CREATE",
        entity_type: "TRANSACTION",
        entity_id: transaction.id,
        operator_id: profile.userId,
        details: { type: transaction.type, amount: transaction.amount, category: transaction.category },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Transaction created successfully",
        data: transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Transaction creation error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
