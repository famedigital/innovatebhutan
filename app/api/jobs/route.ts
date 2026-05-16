/**
 * API Route: Jobs Registry
 *
 * GET /api/jobs - List all available jobs
 * POST /api/jobs - Run all jobs (bulk execution)
 */

import { NextRequest, NextResponse } from "next/server";
import { getRegisteredJobs, runAllJobs } from "@/lib/jobs/scheduler";

/**
 * GET handler - List all registered jobs
 */
export async function GET() {
  try {
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
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Run all jobs
 */
export async function POST() {
  try {
    // TODO: Add authentication check here
    // const user = await getCurrentUser(request);
    // if (!user || user.role !== 'ADMIN') {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    const results = await runAllJobs();

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: failureCount === 0,
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failureCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
