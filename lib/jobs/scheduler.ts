/**
 * Job Scheduler for Innovate Bhutan ERP
 *
 * This module provides a simple job scheduling system for Next.js.
 * Jobs can be run manually via API routes or scheduled externally (Vercel Cron, etc.)
 *
 * All jobs are idempotent - they can be safely re-run without duplication.
 */

import { amcExpiryCheckJob } from "./jobs/amc-expiry-check";
import { invoiceOverdueCheckJob } from "./jobs/invoice-overdue-check";
import { payrollReminderJob } from "./jobs/payroll-reminder";

export interface JobResult {
  success: boolean;
  jobName: string;
  ranAt: Date;
  duration: number;
  result?: any;
  error?: string;
}

export interface Job {
  id: string;
  name: string;
  description: string;
  schedule?: string; // Cron expression (for documentation)
  run: () => Promise<JobResult>;
}

/**
 * Job Registry
 * All scheduled jobs must be registered here
 */
const jobs: Record<string, Job> = {
  "amc-expiry-check": {
    id: "amc-expiry-check",
    name: "AMC Expiry Check",
    description: "Check and update AMCs expiring within 30 days. Updates status to 'expiring' or 'expired' as needed.",
    schedule: "0 8 * * *", // 8 AM daily
    run: amcExpiryCheckJob,
  },
  "invoice-overdue-check": {
    id: "invoice-overdue-check",
    name: "Invoice Overdue Check",
    description: "Mark sent invoices past their due date as 'overdue'.",
    schedule: "0 9 * * *", // 9 AM daily
    run: invoiceOverdueCheckJob,
  },
  "payroll-reminder": {
    id: "payroll-reminder",
    name: "Payroll Reminder",
    description: "Check for pending payroll and generate reminders (optional, for notification integration).",
    schedule: "0 10 25 * *", // 25th of each month at 10 AM
    run: payrollReminderJob,
  },
};

/**
 * Run a job by ID
 */
export async function runJob(jobId: string): Promise<JobResult> {
  const job = jobs[jobId];

  if (!job) {
    return {
      success: false,
      jobName: jobId,
      ranAt: new Date(),
      duration: 0,
      error: `Job not found: ${jobId}`,
    };
  }

  const startTime = Date.now();

  try {
    const result = await job.run();
    const duration = Date.now() - startTime;

    return {
      success: true,
      jobName: job.name,
      ranAt: new Date(),
      duration,
      result,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;

    return {
      success: false,
      jobName: job.name,
      ranAt: new Date(),
      duration,
      error: error?.message || "Unknown error",
    };
  }
}

/**
 * Run all registered jobs
 * Useful for bulk execution or testing
 */
export async function runAllJobs(): Promise<JobResult[]> {
  const results: JobResult[] = [];

  for (const jobId of Object.keys(jobs)) {
    const result = await runJob(jobId);
    results.push(result);
  }

  return results;
}

/**
 * Get all registered jobs
 */
export function getRegisteredJobs(): Job[] {
  return Object.values(jobs);
}

/**
 * Get a specific job by ID
 */
export function getJob(jobId: string): Job | undefined {
  return jobs[jobId];
}
