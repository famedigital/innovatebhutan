/**
 * API Route: Jobs Registry
 *
 * GET /api/jobs - List all available jobs
 * POST /api/jobs - Run all jobs (bulk execution)
 */

import { NextRequest, NextResponse } from "next/server";
import { getRegisteredJobs, runAllJobs } from "@/lib/jobs/scheduler";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";
import { checkRateLimitMiddleware } from "@/lib/rate-limit/rate-limiter";

export async function GET(request: NextRequest) {
  try {
    const limited = checkRateLimitMiddleware(request, 30, 60000);
    if (limited) return limited;

    const _auth = await requireApiAuth(request);
    requireStaffOrAdmin(_auth.profile);
    const jobs = getRegisteredJobs();

    return NextResponse.json({
      success: true,
      jobs: jobs.map((job) => ({
        id: job.id,
        name: job.name,
        description: job.description,
        schedule: job.schedule || null,
      })),
      count: jobs.length,
    });
  } catch (error: any) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

export async function POST(request: NextRequest) {
  try {
    const limited = checkRateLimitMiddleware(request, 10, 60000);
    if (limited) return limited;

    const _auth = await requireApiAuth(request);
    requireStaffOrAdmin(_auth.profile);

    const results = await runAllJobs();

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
