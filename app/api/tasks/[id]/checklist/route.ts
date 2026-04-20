import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { taskChecklistService } from "@/lib/services/taskChecklistService";
import { requireApiAuth, formatAuthError } from "@/lib/auth/api-auth";
import { AuthError } from "@/lib/errors/auth-error";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Validation schemas
const createChecklistItemSchema = z.object({
  title: z.string().min(1).max(255),
  position: z.number().int().optional(),
});

const updateChecklistItemSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  isCompleted: z.boolean().optional(),
  position: z.number().int().optional(),
});

const bulkCreateChecklistSchema = z.object({
  items: z.array(
    z.object({
      title: z.string().min(1).max(255),
      position: z.number().int().optional(),
    })
  ).min(1),
});

// GET /api/tasks/[id]/checklist - Get all checklist items for a task
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);

    const { id } = await params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, error: "Invalid task ID" },
        { status: 400 }
      );
    }

    const items = await taskChecklistService.getChecklistItemsByTask(taskId, profile.userId, profile.role);
    const stats = await taskChecklistService.getChecklistStats(taskId);

    return NextResponse.json({
      success: true,
      data: items,
      stats,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(formatAuthError(error), { status: error.statusCode });
    }
    console.error("Checklist items fetch error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch checklist items" },
      { status: 500 }
    );
  }
}

// POST /api/tasks/[id]/checklist - Create checklist item(s)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);

    const { id } = await params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, error: "Invalid task ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Check if this is a bulk create
    if (body.items && Array.isArray(body.items)) {
      const validationResult = bulkCreateChecklistSchema.safeParse(body);

      if (!validationResult.success) {
        return NextResponse.json(
          { success: false, error: "Validation failed", details: validationResult.error.flatten() },
          { status: 400 }
        );
      }

      const items = await taskChecklistService.createBulkChecklistItems(
        taskId,
        validationResult.data.items,
        profile.userId,
        profile.role
      );

      return NextResponse.json(
        {
          success: true,
          message: `${items.length} checklist items created successfully`,
          data: items,
        },
        { status: 201 }
      );
    }

    // Single item creation
    const validationResult = createChecklistItemSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const item = await taskChecklistService.createChecklistItem(
      taskId,
      validationResult.data,
      profile.userId,
      profile.role
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CREATE",
        entity_type: "CHECKLIST_ITEM",
        entity_id: item.id,
        details: {
          task_id: taskId,
          item_title: item.title,
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Checklist item created successfully",
        data: item,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(formatAuthError(error), { status: error.statusCode });
    }
    console.error("Checklist item creation error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create checklist item" },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id]/checklist - Delete all checklist items for a task
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);

    const { id } = await params;
    const taskId = parseInt(id);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, error: "Invalid task ID" },
        { status: 400 }
      );
    }

    await taskChecklistService.deleteAllChecklistItems(taskId, profile.userId, profile.role);

    return NextResponse.json({
      success: true,
      message: "All checklist items deleted successfully",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(formatAuthError(error), { status: error.statusCode });
    }
    console.error("Checklist items deletion error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete checklist items" },
      { status: 500 }
    );
  }
}
