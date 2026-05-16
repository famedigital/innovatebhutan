import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { transactionService } from "@/lib/services/transactionService";
import { reconcileTransactionSchema } from "@/lib/validations/transaction";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// POST /api/transactions/[id]/reconcile - Reconcile or unreconcile transaction
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔒 Require authentication
    const { profile } = await requireApiAuth(req);
    // 🔒 Require admin or staff role
    requireStaffOrAdmin(profile);

    const { id } = await params;
    const transactionId = validateId(id, "Transaction ID");

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(reconcileTransactionSchema, body);

    const transaction = await transactionService.reconcileTransaction(
      transactionId,
      validatedData,
      profile.userId,
      profile.role
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "RECONCILE",
        entity_type: "TRANSACTION",
        entity_id: transaction.id,
        operator_id: profile.userId,
        details: { action: validatedData.action, notes: validatedData.notes },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: `Transaction ${validatedData.action}d successfully`,
      data: transaction,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Transaction reconcile error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
