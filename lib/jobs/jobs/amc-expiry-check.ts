/**
 * AMC Expiry Check Job
 *
 * This job checks all active AMCs and updates their status based on expiry dates:
 * - active -> expiring (within 30 days)
 * - active/expiring -> expired (past end date)
 *
 * This job is idempotent - it can be safely re-run multiple times.
 */

import { amcService } from "@/lib/services/amcService";
import type { JobResult } from "../scheduler";

/**
 * Main job runner for AMC expiry check
 */
export async function amcExpiryCheckJob(): Promise<JobResult> {
  const startTime = Date.now();

  try {
    // Update all AMC statuses based on current date
    const result = await amcService.updateAllAMCStatuses();

    const duration = Date.now() - startTime;

    return {
      success: true,
      jobName: "AMC Expiry Check",
      ranAt: new Date(),
      duration,
      result: {
        updated: result.updated,
        message: `Updated ${result.updated} AMC(s) status`,
      },
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;

    return {
      success: false,
      jobName: "AMC Expiry Check",
      ranAt: new Date(),
      duration,
      error: error?.message || "Unknown error",
    };
  }
}
