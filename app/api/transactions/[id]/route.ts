import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { transactionService } from "@/lib/services/transactionService";
import { updateTransactionSchema } from "@/lib/validations/transaction";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/transactions/[id] - Get transaction by ID
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
    const transactionId = validateId(id, "Transaction ID");

    const transaction = await transactionService.getTransactionById(transactionId);

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Transaction fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// PATCH /api/transactions/[id] - Update transaction
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
    const transactionId = validateId(id, "Transaction ID");

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(updateTransactionSchema, body);

    const transaction = await transactionService.updateTransaction(
      transactionId,
      validatedData,
      profile.userId,
      profile.role
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "UPDATE",
        entity_type: "TRANSACTION",
        entity_id: transaction.id,
        operator_id: profile.userId,
        details: { changes: validatedData },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Transaction update error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// DELETE /api/transactions/[id] - Delete transaction
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
        { success: false, error: "Only administrators can delete transactions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const transactionId = validateId(id, "Transaction ID");

    // Get transaction details for audit log before deleting
    const transaction = await transactionService.getTransactionById(transactionId);
    if (!transaction) {
      return NextResponse.json(
        { success: false, error: "Transaction not found" },
        { status: 404 }
      );
    }

    await transactionService.deleteTransaction(transactionId, profile.userId, profile.role);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "DELETE",
        entity_type: "TRANSACTION",
        entity_id: transactionId,
        operator_id: profile.userId,
        details: { type: transaction.type, amount: transaction.amount },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Transaction deletion error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
