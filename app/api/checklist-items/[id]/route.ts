import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { taskChecklistService } from "@/lib/services/taskChecklistService";
import { requireApiAuth, formatAuthError } from "@/lib/auth/api-auth";
import { AuthError } from "@/lib/errors/auth-error";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Validation schema
const updateChecklistItemSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  isCompleted: z.boolean().optional(),
  position: z.number().int().optional(),
});

// PATCH /api/checklist-items/[id] - Update a checklist item
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);

    const { id } = await params;
    const itemId = parseInt(id);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { success: false, error: "Invalid checklist item ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Check if this is a restore request
    if (body.action === "restore") {
      await taskChecklistService.restoreChecklistItem(itemId, profile.userId, profile.role);

      return NextResponse.json({
        success: true,
        message: "Checklist item restored successfully",
      });
    }

    // Normal update
    const validationResult = updateChecklistItemSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const item = await taskChecklistService.updateChecklistItem(
      itemId,
      validationResult.data,
      profile.userId,
      profile.role
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "UPDATE",
        entity_type: "CHECKLIST_ITEM",
        entity_id: itemId,
        details: {
          is_completed: item.isCompleted,
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Checklist item updated successfully",
      data: item,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(formatAuthError(error), { status: error.statusCode });
    }
    console.error("Checklist item update error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update checklist item" },
      { status: 500 }
    );
  }
}

// DELETE /api/checklist-items/[id] - Delete a checklist item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);

    const { id } = await params;
    const itemId = parseInt(id);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { success: false, error: "Invalid checklist item ID" },
        { status: 400 }
      );
    }

    await taskChecklistService.deleteChecklistItem(itemId, profile.userId, profile.role);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "DELETE",
        entity_type: "CHECKLIST_ITEM",
        entity_id: itemId,
        details: { deleted_checklist_item_id: itemId },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Checklist item deleted successfully",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(formatAuthError(error), { status: error.statusCode });
    }
    console.error("Checklist item deletion error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete checklist item" },
      { status: 500 }
    );
  }
}
