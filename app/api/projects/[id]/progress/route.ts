import { NextRequest, NextResponse } from "next/server";
import { projectService } from "@/lib/services/projectService";
import { requireApiAuth, requireStaffOrAdmin, formatAuthError } from "@/lib/auth/api-auth";
import { AuthError } from "@/lib/errors/auth-error";

// GET /api/projects/[id]/progress - Get and recalculate project progress
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
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { success: false, error: "Invalid project ID" },
        { status: 400 }
      );
    }

    // Recalculate from tasks, persist projects.progress, return full stats for UI
    const progress = await projectService.calculateProjectProgress(projectId);
    const stats = await projectService.getProjectStats(projectId);
    const progressPercentage =
      typeof stats.progressPercentage === "number"
        ? stats.progressPercentage
        : progress;

    return NextResponse.json({
      success: true,
      data: {
        progress: progressPercentage,
        stats: {
          totalTasks: stats.totalTasks,
          completedTasks: stats.completedTasks,
          inProgressTasks: stats.inProgressTasks,
          todoTasks: stats.todoTasks,
          progressPercentage,
        },
      },
    });
  } catch (error) {
    // Handle auth errors with proper status codes
    if (error instanceof AuthError) {
      return NextResponse.json(formatAuthError(error), { status: error.statusCode });
    }
    console.error("Progress calculation error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to calculate progress" },
      { status: 500 }
    );
  }
}
