/**
 * 👥 TEAM MANAGEMENT API ROUTES
 * REST API for AI-optimized team management
 */

import { NextRequest, NextResponse } from "next/server";
import { teamManagementService } from "@/lib/services/teamManagementService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from '@/lib/auth/api-auth';
import { isApiError } from '@/lib/errors';

/**
 * GET /api/team/workload
 * Get team workload overview
 */
export async function GET(request: NextRequest) {
  try {
    const _auth = await requireApiAuth(request);
    requireStaffOrAdmin(_auth.profile);
    const endpoint = request.nextUrl.pathname.split('/').pop();

    let data;
    switch (endpoint) {
      case 'workload':
        data = await teamManagementService.getTeamWorkloadOverview();
        break;

      case 'performance':
        const searchParams = request.nextUrl.searchParams;
        const teamMemberId = searchParams.get('teamMemberId');
        data = await teamManagementService.getTeamPerformanceMetrics(
          teamMemberId ? parseInt(teamMemberId) : undefined
        );
        break;

      default:
        data = await teamManagementService.getTeamWorkloadOverview();
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error("API error fetching team data:", error);
    return NextResponse.json(
      { error: "Failed to fetch team data" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/team/assign
 * AI-optimized team assignment
 */
export async function POST(request: NextRequest) {
  try {
    const _auth = await requireApiAuth(request);
    requireStaffOrAdmin(_auth.profile);
    const body = await request.json();
    const action = body.action;

    if (action === 'assign-best') {
      // AI-optimized assignment
      const result = await teamManagementService.assignBestTeamMember(
        body.clientId,
        body.problemSeverity || 'medium'
      );

      return NextResponse.json({
        success: result.success,
        data: {
          teamMemberId: result.teamMemberId,
          reason: result.reason
        }
      });
    }

    if (action === 'set-focal-person') {
      const result = await teamManagementService.setFocalPerson(
        body.clientId,
        body.teamMemberId
      );

      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Focal person updated successfully"
      });
    }

    if (action === 'calculate-optimal') {
      const result = await teamManagementService.calculateOptimalAssignment(
        body.clientId,
        body.problemData || {}
      );

      return NextResponse.json({
        success: true,
        data: result
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("API error in team management:", error);
    return NextResponse.json(
      { error: "Failed to process team management request" },
      { status: 500 }
    );
  }
}