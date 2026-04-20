import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { taskCommentService } from "@/lib/services/taskCommentService";
import { requireApiAuth, formatAuthError } from "@/lib/auth/api-auth";
import { AuthError } from "@/lib/errors/auth-error";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Validation schema
const updateCommentSchema = z.object({
  content: z.string().min(1).max(10000),
});

// PATCH /api/comments/[id] - Update a comment
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);

    const { id } = await params;
    const commentId = parseInt(id);

    if (isNaN(commentId)) {
      return NextResponse.json(
        { success: false, error: "Invalid comment ID" },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Check if this is a restore request
    if (body.action === "restore") {
      await taskCommentService.restoreComment(commentId, profile.userId, profile.role);

      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("audit_logs").insert([
        {
          action: "RESTORE",
          entity_type: "TASK_COMMENT",
          entity_id: commentId,
          details: { restored_comment_id: commentId },
        },
      ]);

      return NextResponse.json({
        success: true,
        message: "Comment restored successfully",
      });
    }

    // Normal update
    const validationResult = updateCommentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const comment = await taskCommentService.updateComment(
      commentId,
      validationResult.data,
      profile.userId,
      profile.role
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "UPDATE",
        entity_type: "TASK_COMMENT",
        entity_id: commentId,
        details: { comment_updated: true },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Comment updated successfully",
      data: comment,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(formatAuthError(error), { status: error.statusCode });
    }
    console.error("Comment update error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update comment" },
      { status: 500 }
    );
  }
}

// DELETE /api/comments/[id] - Delete a comment
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);

    const { id } = await params;
    const commentId = parseInt(id);

    if (isNaN(commentId)) {
      return NextResponse.json(
        { success: false, error: "Invalid comment ID" },
        { status: 400 }
      );
    }

    await taskCommentService.deleteComment(commentId, profile.userId, profile.role);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "DELETE",
        entity_type: "TASK_COMMENT",
        entity_id: commentId,
        details: { deleted_comment_id: commentId },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(formatAuthError(error), { status: error.statusCode });
    }
    console.error("Comment deletion error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete comment" },
      { status: 500 }
    );
  }
}
