import { db } from "@/db";
import { auditLogs } from "@/db/schema";

export async function writeAuditLog(params: {
  operatorId?: number;
  action: string;
  entityType: string;
  entityId?: number;
  details?: Record<string, unknown>;
}) {
  try {
    await db.insert(auditLogs).values({
      operatorId: params.operatorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details,
    });
  } catch (error) {
    console.error("[audit] Failed to write audit log:", error);
  }
}
