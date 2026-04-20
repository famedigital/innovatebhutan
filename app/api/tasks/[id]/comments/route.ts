import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { taskCommentService } from "@/lib/services/taskCommentService";
import { requireApiAuth, formatAuthError } from "@/lib/auth/api-auth";
import { AuthError } from "@/lib/errors/auth-error";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Validation schemas
const createCommentSchema = z.object({
  content: z.string().min(1).max(10000),
  parentId: z.number().int().optional(),
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(10000),
});

// GET /api/tasks/[id]/comments - Get all comments for a task
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

    const comments = await taskCommentService.getCommentsByTask(taskId, profile.userId, profile.role);

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(formatAuthError(error), { status: error.statusCode });
    }
    console.error("Comments fetch error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/tasks/[id]/comments - Create a new comment
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
    const validationResult = createCommentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const comment = await taskCommentService.createComment(
      {
        taskId,
        ...validationResult.data,
      },
      profile.userId,
      profile.role
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CREATE",
        entity_type: "TASK_COMMENT",
        entity_id: comment.id,
        details: {
          task_id: taskId,
          has_parent: !!validationResult.data.parentId,
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Comment added successfully",
        data: comment,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(formatAuthError(error), { status: error.statusCode });
    }
    console.error("Comment creation error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to create comment" },
      { status: 500 }
    );
  }
}
