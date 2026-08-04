import { NextRequest, NextResponse } from "next/server";
import { projectService } from "@/lib/services/projectService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";

/**
 * GET /api/projects/queue
 * Implementor / assignee queue — non-deleted projects with client name + ops fields.
 * Query: assigneeRole, leadId (use "me" for current user)
 */
export async function GET(req: NextRequest) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const searchParams = req.nextUrl.searchParams;
    const assigneeRole = searchParams.get("assigneeRole") || undefined;
    let leadId = searchParams.get("leadId") || undefined;
    if (leadId === "me") {
      leadId = authContext.user.id;
    }

    const result = await projectService.listQueue({
      assigneeRole,
      leadId,
    });

    return NextResponse.json({
      success: true,
      data: result.projects,
      count: result.total,
    });
  } catch (error) {
    console.error("[API /api/projects/queue] GET error:", error);
    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as { statusCode: number }).statusCode
        : 500,
    });
  }
}
