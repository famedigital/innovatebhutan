import { NextRequest, NextResponse } from "next/server";
import { projectService } from "@/lib/services/projectService";
import {
  requireApiAuth,
  requireStaffOrAdmin,
  formatApiError,
} from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

/**
 * GET /api/tasks?scope=mine — project tasks assigned to the current user
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireApiAuth(req);
    requireStaffOrAdmin(auth.profile);

    const scope = req.nextUrl.searchParams.get("scope") || "mine";
    if (scope !== "mine") {
      return NextResponse.json(
        { success: false, error: "Unsupported scope. Use scope=mine." },
        { status: 400 }
      );
    }

    const userId = auth.profile.userId;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "No auth user id on profile" },
        { status: 400 }
      );
    }

    const tasks = await projectService.getMyTasks(userId);
    return NextResponse.json({ success: true, data: tasks, count: tasks.length });
  } catch (error) {
    const status = isApiError(error)
      ? (error as { statusCode?: number }).statusCode || 500
      : 500;
    return NextResponse.json(formatApiError(error), { status });
  }
}
