/**
 * TEAM MANAGEMENT API
 * Workload, performance, and client ownership assignment
 */

import { NextRequest, NextResponse } from "next/server";
import { teamManagementService } from "@/lib/services/teamManagementService";
import {
  requireApiAuth,
  requireStaffOrAdmin,
  formatApiError,
} from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request);
    requireStaffOrAdmin(auth.profile);

    const { searchParams } = request.nextUrl;
    const view = searchParams.get("view") || "workload";
    const clientIdsParam = searchParams.get("clientIds");

    if (view === "ownership" && clientIdsParam) {
      const clientIds = clientIdsParam
        .split(",")
        .map((id) => parseInt(id.trim(), 10))
        .filter((n) => !Number.isNaN(n));
      const data = await teamManagementService.getOwnershipForClients(clientIds);
      return NextResponse.json({ success: true, data });
    }

    if (view === "members") {
      const { listAssignableStaff } = await import(
        "@/lib/admin/assignable-staff-server"
      );
      const result = await listAssignableStaff();
      return NextResponse.json({
        success: true,
        data: result.data,
        meta: {
          count: result.data.length,
          backfilled: result.backfilled,
          errors: result.errors.length ? result.errors : undefined,
        },
      });
    }

    if (view === "performance") {
      const teamMemberId = searchParams.get("teamMemberId");
      const data = await teamManagementService.getTeamPerformanceMetrics(
        teamMemberId ? parseInt(teamMemberId, 10) : undefined
      );
      return NextResponse.json({ success: true, data });
    }

    if (view === "client" && searchParams.get("clientId")) {
      const clientId = parseInt(searchParams.get("clientId")!, 10);
      const data = await teamManagementService.getClientTeamMembers(clientId);
      return NextResponse.json({ success: true, data });
    }

    const data = await teamManagementService.getTeamWorkloadOverview();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API error fetching team data:", error);
    const status = isApiError(error) ? (error as { statusCode?: number }).statusCode || 500 : 500;
    return NextResponse.json(formatApiError(error), { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiAuth(request);
    requireStaffOrAdmin(auth.profile);
    const body = await request.json();
    const action = body.action as string;

    if (action === "bulk-assign") {
      const clientIds: number[] = Array.isArray(body.clientIds)
        ? body.clientIds.map((id: unknown) => Number(id)).filter((n: number) => !Number.isNaN(n))
        : [];
      const teamMemberId = Number(body.teamMemberId);
      const role =
        body.role === "backup-team-member" || body.role === "specialist"
          ? body.role
          : "focal-person";

      const result = await teamManagementService.bulkAssignClients(
        clientIds,
        teamMemberId,
        role
      );

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || "Bulk assign failed" },
          { status: 400 }
        );
      }

      try {
        const { db } = await import("@/db");
        const { auditLogs } = await import("@/db/schema");
        await db.insert(auditLogs).values({
          operatorId: auth.profile.id,
          action: "UPDATE",
          entityType: "TEAM_ASSIGNMENT",
          entityId: teamMemberId,
          details: {
            action: "bulk-assign",
            clientIds,
            role,
            assigned: result.assigned,
          },
        });
      } catch (e) {
        console.warn("[team] audit skipped", e);
      }

      return NextResponse.json({
        success: true,
        assigned: result.assigned,
        message: `Assigned ${result.assigned} client(s)`,
      });
    }

    if (action === "clear-assignments") {
      const clientIds: number[] = Array.isArray(body.clientIds)
        ? body.clientIds.map((id: unknown) => Number(id)).filter((n: number) => !Number.isNaN(n))
        : [];
      const result = await teamManagementService.clearAssignments(clientIds);
      return NextResponse.json({
        success: true,
        cleared: result.cleared,
        message: `Cleared assignments on ${result.cleared} record(s)`,
      });
    }

    if (action === "assign-best") {
      const result = await teamManagementService.assignBestTeamMember(
        body.clientId,
        body.problemSeverity || "medium"
      );

      return NextResponse.json({
        success: result.success,
        data: {
          teamMemberId: result.teamMemberId,
          reason: result.reason,
        },
      });
    }

    if (action === "set-focal-person") {
      const result = await teamManagementService.setFocalPerson(
        body.clientId,
        body.teamMemberId
      );

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: "Focal person updated successfully",
      });
    }

    if (action === "assign") {
      const role =
        body.role === "backup-team-member" || body.role === "specialist"
          ? body.role
          : "focal-person";
      const result = await teamManagementService.bulkAssignClients(
        [Number(body.clientId)],
        Number(body.teamMemberId),
        role
      );
      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, assigned: result.assigned });
    }

    if (action === "calculate-optimal") {
      const result = await teamManagementService.calculateOptimalAssignment(
        body.clientId,
        body.problemData || {}
      );

      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("API error in team management:", error);
    const status = isApiError(error) ? (error as { statusCode?: number }).statusCode || 500 : 500;
    return NextResponse.json(formatApiError(error), { status });
  }
}
