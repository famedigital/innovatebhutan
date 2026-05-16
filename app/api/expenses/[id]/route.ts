import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { expenseService } from "@/lib/services/expenseService";
import { updateExpenseSchema } from "@/lib/validations/expense";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/expenses/[id] - Get expense by ID
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
    const expenseId = validateId(id, "Expense ID");

    const expense = await expenseService.getExpenseWithDetails(expenseId);

    return NextResponse.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Expense fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// PATCH /api/expenses/[id] - Update expense
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
    const expenseId = validateId(id, "Expense ID");

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(updateExpenseSchema, body);

    const expense = await expenseService.updateExpense(
      expenseId,
      validatedData,
      profile.userId,
      profile.role
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "UPDATE",
        entity_type: "EXPENSE",
        entity_id: expense.id,
        operator_id: profile.userId,
        details: { changes: validatedData },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Expense updated successfully",
      data: expense,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Expense update error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// DELETE /api/expenses/[id] - Delete expense
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
        { success: false, error: "Only administrators can delete expenses" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const expenseId = validateId(id, "Expense ID");

    // Get expense details for audit log before deleting
    const expense = await expenseService.getExpenseById(expenseId);
    if (!expense) {
      return NextResponse.json(
        { success: false, error: "Expense not found" },
        { status: 404 }
      );
    }

    await expenseService.deleteExpense(expenseId, profile.userId, profile.role);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "DELETE",
        entity_type: "EXPENSE",
        entity_id: expenseId,
        operator_id: profile.userId,
        details: { amount: expense.amount, category: expense.category },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Expense deletion error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
