/**
 * 🎯 PROBLEM TRACKING API ROUTES
 * REST API for next-generation problem tracking
 */

import { NextRequest, NextResponse } from "next/server";
import { problemService } from "@/lib/services/problemService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from '@/lib/auth/api-auth';
import { isApiError } from '@/lib/errors';

/**
 * GET /api/problems
 * Get problems with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const _auth = await requireApiAuth(request);
    requireStaffOrAdmin(_auth.profile);
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      clientId: searchParams.get('clientId') ? parseInt(searchParams.get('clientId')!) : undefined,
      status: searchParams.get('status') || undefined,
      severity: searchParams.get('severity') || undefined,
      assignedTo: searchParams.get('assignedTo') ? parseInt(searchParams.get('assignedTo')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
    };

    const problems = await problemService.getProblems(filters);

    return NextResponse.json({
      success: true,
      data: problems,
      count: problems.length
    });
  } catch (error) {
    console.error("API error fetching problems:", error);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/problems
 * Create new problem with AI categorization
 */
export async function POST(request: NextRequest) {
  try {
    const _auth = await requireApiAuth(request);
    requireStaffOrAdmin(_auth.profile);
    const body = await request.json();

    // AI categorization
    const categorization = await problemService.categorizeProblem(body.description);

    const problemData = {
      ...body,
      severity: body.severity || categorization.suggestedSeverity,
      category: body.category || categorization.suggestedCategory,
      aiSuggestedCategory: categorization.suggestedCategory,
      aiSuggestedSeverity: categorization.suggestedSeverity
    };

    const result = await problemService.createProblem(problemData);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      aiCategorization: categorization,
      message: "Problem created successfully"
    }, { status: 201 });
  } catch (error) {
    console.error("API error creating problem:", error);
    return NextResponse.json(
      { error: "Failed to create problem" },
      { status: 500 }
    );
  }
}