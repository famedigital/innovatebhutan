import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { expenseService } from "@/lib/services/expenseService";
import { expenseActionSchema } from "@/lib/validations/expense";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// POST /api/expenses/[id]/action - Approve or reject expense
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
    const expenseId = validateId(id, "Expense ID");

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(expenseActionSchema, body);

    const expense = await expenseService.processExpenseAction(
      expenseId,
      validatedData,
      profile.userId,
      profile.role
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: validatedData.action.toUpperCase(),
        entity_type: "EXPENSE",
        entity_id: expense.id,
        operator_id: profile.userId,
        details: { action: validatedData.action, notes: validatedData.notes },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: `Expense ${validatedData.action}d successfully`,
      data: expense,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Expense action error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
