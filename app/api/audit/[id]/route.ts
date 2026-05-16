import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs, profiles } from "@/db/schema";
import { requireApiAuth, requireAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError, NotFoundError } from "@/lib/errors";
import { eq } from "drizzle-orm";
import { validateId } from "@/lib/validations/validation";

// GET /api/audit/[id] - Get specific audit log (admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);
    requireAdmin(profile);

    const { id } = await params;
    const auditLogId = validateId(id, "audit log ID");

    const [log] = await db
      .select({
        id: auditLogs.id,
        operatorId: auditLogs.operatorId,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        details: auditLogs.details,
        createdAt: auditLogs.createdAt,
        operatorName: profiles.fullName,
        operatorUserId: profiles.userId,
      })
      .from(auditLogs)
      .leftJoin(profiles, eq(auditLogs.operatorId, profiles.id))
      .where(eq(auditLogs.id, auditLogId))
      .limit(1);

    if (!log) {
      throw new NotFoundError("Audit log");
    }

    return NextResponse.json({
      success: true,
      data: log,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Audit log fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
