import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs, profiles } from "@/db/schema";
import { requireApiAuth, requireAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";
import { desc, count, and, sql, or, eq } from "drizzle-orm";

interface AuditLogQueryParams {
  page: number;
  limit: number;
  action?: string;
  entityType?: string;
  entityId?: number;
  startDate?: string;
  endDate?: string;
}

// GET /api/audit - List audit logs (admin only)
export async function GET(req: NextRequest) {
  try {
    const { profile } = await requireApiAuth(req);
    requireAdmin(profile);

    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
    const offset = (page - 1) * limit;

    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build conditions
    const conditions = [];

    if (action) {
      conditions.push(sql`${auditLogs.action} = ${action}`);
    }
    if (entityType) {
      conditions.push(sql`${auditLogs.entityType} = ${entityType}`);
    }
    if (entityId) {
      conditions.push(eq(auditLogs.entityId, parseInt(entityId)));
    }
    if (startDate) {
      conditions.push(sql`${auditLogs.createdAt} >= ${new Date(startDate)}`);
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      conditions.push(sql`${auditLogs.createdAt} <= ${endDateTime}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(auditLogs)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Get audit logs with operator details
    const logs = await db
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
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Audit logs fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
