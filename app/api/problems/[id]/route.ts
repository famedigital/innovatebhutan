/**
 * 🎯 INDIVIDUAL PROBLEM API ROUTES
 * REST API for individual problem management
 */

import { NextRequest, NextResponse } from "next/server";
import { problemService } from "@/lib/services/problemService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from '@/lib/auth/api-auth';
import { isApiError } from '@/lib/errors';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/problems/[id]
 * Get specific problem by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const _auth = await requireApiAuth(request);
    requireStaffOrAdmin(_auth.profile);
    const { id } = await context.params;
    const problemId = parseInt(id);

    if (isNaN(problemId)) {
      return NextResponse.json(
        { error: "Invalid problem ID" },
        { status: 400 }
      );
    }

    const problem = await problemService.getProblemById(problemId);

    if (!problem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    // AI resolution suggestion
    const resolutionSuggestion = await problemService.suggestResolution(problem);

    return NextResponse.json({
      success: true,
      data: problem,
      aiSuggestedResolution: resolutionSuggestion
    });
  } catch (error) {
    console.error("API error fetching problem:", error);
    return NextResponse.json(
      { error: "Failed to fetch problem" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/problems/[id]
 * Update problem
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const _auth = await requireApiAuth(request);
    requireStaffOrAdmin(_auth.profile);
    const { id } = await context.params;
    const problemId = parseInt(id);

    if (isNaN(problemId)) {
      return NextResponse.json(
        { error: "Invalid problem ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const result = await problemService.updateProblem(problemId, body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Problem updated successfully"
    });
  } catch (error) {
    console.error("API error updating problem:", error);
    return NextResponse.json(
      { error: "Failed to update problem" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/problems/[id]/resolve
 * Resolve problem with root cause analysis
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const _auth = await requireApiAuth(request);
    requireStaffOrAdmin(_auth.profile);
    const { id } = await context.params;
    const problemId = parseInt(id);

    if (isNaN(problemId)) {
      return NextResponse.json(
        { error: "Invalid problem ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const result = await problemService.resolveProblem(problemId, {
      rootCause: body.rootCause,
      preventionMeasures: body.preventionMeasures,
      lessonsLearned: body.lessonsLearned,
      resolutionTime: body.resolutionTime,
      resolvedById: body.resolvedById
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Problem resolved successfully"
    });
  } catch (error) {
    console.error("API error resolving problem:", error);
    return NextResponse.json(
      { error: "Failed to resolve problem" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/problems/[id]
 * Delete problem (restricted to low/medium severity)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const _auth = await requireApiAuth(request);
    requireStaffOrAdmin(_auth.profile);
    const { id } = await context.params;
    const problemId = parseInt(id);

    if (isNaN(problemId)) {
      return NextResponse.json(
        { error: "Invalid problem ID" },
        { status: 400 }
      );
    }

    const result = await problemService.deleteProblem(problemId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Problem deleted successfully"
    });
  } catch (error) {
    console.error("API error deleting problem:", error);
    return NextResponse.json(
      { error: "Failed to delete problem" },
      { status: 500 }
    );
  }
}