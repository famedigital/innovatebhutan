import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, clients } from "@/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";

/**
 * GET /api/projects/queue
 * Lightweight project queue for implementors / accountants / trainees.
 * Query: assigneeRole?, me=1 (leadId = auth user)
 */
export async function GET(req: NextRequest) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const searchParams = req.nextUrl.searchParams;
    const assigneeRole = searchParams.get("assigneeRole") || undefined;
    const meOnly = searchParams.get("me") === "1";

    const conditions = [isNull(projects.deletedAt)];

    if (assigneeRole) {
      conditions.push(eq(projects.assigneeRole, assigneeRole));
    }
    if (meOnly) {
      conditions.push(eq(projects.leadId, authContext.user.id));
    }

    const rows = await db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        productKey: projects.productKey,
        categoryType: projects.categoryType,
        assigneeRole: projects.assigneeRole,
        productMasterStatus: projects.productMasterStatus,
        trainingPlan: projects.trainingPlan,
        preferredInstallDate: projects.preferredInstallDate,
        leadId: projects.leadId,
        clientName: clients.name,
        clientId: projects.clientId,
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(and(...conditions))
      .orderBy(desc(projects.updatedAt))
      .limit(100);

    return NextResponse.json({
      success: true,
      data: rows,
      count: rows.length,
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
