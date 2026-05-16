/**
 * Invoice Overdue Check Job
 *
 * This job marks all sent invoices that are past their due date as 'overdue'.
 *
 * This job is idempotent - it only updates invoices with status 'sent' that are
 * past the due date, so running multiple times won't cause issues.
 */

import { invoiceService } from "@/lib/services/invoiceService";
import type { JobResult } from "../scheduler";

/**
 * Main job runner for invoice overdue check
 */
export async function invoiceOverdueCheckJob(): Promise<JobResult> {
  const startTime = Date.now();

  try {
    // Mark all overdue invoices
    const updatedInvoices = await invoiceService.markOverdueInvoices();

    const duration = Date.now() - startTime;

    return {
      success: true,
      jobName: "Invoice Overdue Check",
      ranAt: new Date(),
      duration,
      result: {
        count: updatedInvoices.length,
        message: `Marked ${updatedInvoices.length} invoice(s) as overdue`,
      },
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;

    return {
      success: false,
      jobName: "Invoice Overdue Check",
      ranAt: new Date(),
      duration,
      error: error?.message || "Unknown error",
    };
  }
}
