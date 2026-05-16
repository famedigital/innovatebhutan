/**
 * Payroll Reminder Job
 *
 * This job checks for upcoming payroll cycles and generates reminders.
 * It's designed to be run periodically and is idempotent.
 *
 * Note: This is a placeholder job that can be extended with actual
 * notification logic when the notification service is implemented.
 */

import { payrollRepository } from "@/lib/repositories/payrollRepository";
import type { JobResult } from "../scheduler";

interface PayrollReminderData {
  currentMonth: number;
  currentYear: number;
  upcomingDate: string; // Expected payroll processing date
  activeEmployees: number;
  pendingPayslips: number;
  approvedPayslips: number;
}

/**
 * Main job runner for payroll reminder
 */
export async function payrollReminderJob(): Promise<JobResult> {
  const startTime = Date.now();

  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    // Get payslip summary for current month
    const summary = await payrollRepository.getPayrollPeriodSummary(currentMonth, currentYear);

    // Calculate expected payroll processing date (last day of month)
    const lastDayOfMonth = new Date(currentYear, currentMonth, 0);
    const upcomingDate = lastDayOfMonth.toISOString().split('T')[0];

    // Get active employees count
    const activeEmployees = await payrollRepository.getActiveEmployees();

    const reminderData: PayrollReminderData = {
      currentMonth,
      currentYear,
      upcomingDate,
      activeEmployees: activeEmployees.length,
      pendingPayslips: summary.pendingCount,
      approvedPayslips: summary.processedCount,
    };

    const duration = Date.now() - startTime;

    // TODO: When notification service is ready, create actual notifications here
    // For now, we just return the summary data

    return {
      success: true,
      jobName: "Payroll Reminder",
      ranAt: new Date(),
      duration,
      result: {
        ...reminderData,
        message: `Payroll reminder for ${currentMonth}/${currentYear}: ${reminderData.pendingPayslips} pending, ${reminderData.approvedPayslips} approved`,
      },
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;

    return {
      success: false,
      jobName: "Payroll Reminder",
      ranAt: new Date(),
      duration,
      error: error?.message || "Unknown error",
    };
  }
}
