/**
 * API Route: Job Runner
 *
 * POST /api/jobs/run/[jobId]
 *
 * This endpoint allows manual triggering of scheduled jobs.
 * It's protected and should be called by authorized users or cron services.
 *
 * Usage:
 *   POST /api/jobs/run/amc-expiry-check
 *   POST /api/jobs/run/invoice-overdue-check
 *   POST /api/jobs/run/payroll-reminder
 */

import { NextRequest, NextResponse } from "next/server";
import { runJob, getJob } from "@/lib/jobs/scheduler";

/**
 * POST handler - Run a specific job by ID
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    // Validate job exists
    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, error: `Job not found: ${jobId}` },
        { status: 404 }
      );
    }

    // TODO: Add authentication check here
    // const user = await getCurrentUser(request);
    // if (!user || user.role !== 'ADMIN') {
    //   return NextResponse.json(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    // Run the job
    const result = await runJob(jobId);

    const statusCode = result.success ? 200 : 500;

    return NextResponse.json(
      {
        success: result.success,
        job: {
          id: job.id,
          name: job.name,
          description: job.description,
        },
        result: result.result,
        error: result.error,
        ranAt: result.ranAt,
        duration: result.duration,
      },
      { status: statusCode }
    );
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
 * GET handler - Get job information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const job = getJob(jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, error: `Job not found: ${jobId}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        name: job.name,
        description: job.description,
        schedule: job.schedule,
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
