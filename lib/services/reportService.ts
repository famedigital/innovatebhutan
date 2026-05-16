import { reportRepository, ReportFilters } from "@/lib/repositories/reportRepository";
import type {
  ProjectReportKPIs,
  FinanceReportKPIs,
  HRReportKPIs,
  SupportReportKPIs,
  AMCReportKPIs,
} from "@/lib/repositories/reportRepository";

// ==================== FILTER INTERFACES ====================

export interface ProjectReportFilters {
  clientId?: number;
  status?: string;
  leadId?: string;
  startDate?: string;
  endDate?: string;
}

export interface FinanceReportFilters {
  clientId?: number;
  status?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export interface HRReportFilters {
  department?: string;
  designation?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface SupportReportFilters {
  clientId?: number;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
}

export interface AMCReportFilters {
  clientId?: number;
  serviceId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// ==================== REPORT SERVICE ====================

export class ReportService {
  private repository = reportRepository;

  // ==================== DATE RANGE PARSING ====================

  private parseDateRange(startDate?: string, endDate?: string): { startDate?: Date; endDate?: Date } {
    const result: { startDate?: Date; endDate?: Date } = {};

    if (startDate) {
      result.startDate = new Date(startDate);
      if (isNaN(result.startDate.getTime())) {
        throw new Error("Invalid startDate format");
      }
    }

    if (endDate) {
      result.endDate = new Date(endDate);
      if (isNaN(result.endDate.getTime())) {
        throw new Error("Invalid endDate format");
      }
      // Set end of day
      result.endDate.setHours(23, 59, 59, 999);
    }

    return result;
  }

  // ==================== PROJECT REPORTS ====================

  async getProjectKPIs(filters: ProjectReportFilters): Promise<ProjectReportKPIs> {
    const dateRange = this.parseDateRange(filters.startDate as string, filters.endDate as string);

    const { startDate, endDate, ...otherFilters } = filters;
    const reportFilters: ReportFilters = {
      ...otherFilters,
      ...dateRange,
    };

    return await this.repository.getProjectKPIs(reportFilters);
  }

  async getProjectSummary(filters: ProjectReportFilters) {
    const kpis = await this.getProjectKPIs(filters);

    return {
      overview: {
        totalProjects: kpis.totalProjects,
        activeProjects: kpis.activeProjects,
        completionRate: kpis.totalProjects > 0
          ? Math.round((kpis.completedProjects / kpis.totalProjects) * 100)
          : 0,
        avgProgress: kpis.avgProgress,
      },
      statusBreakdown: kpis.byStatus,
      taskMetrics: {
        totalTasks: kpis.totalTasks,
        completedTasks: kpis.completedTasks,
        taskCompletionRate: kpis.totalTasks > 0
          ? Math.round((kpis.completedTasks / kpis.totalTasks) * 100)
          : 0,
        overdueTasks: kpis.overdueTasks,
      },
      budgetMetrics: {
        totalBudget: kpis.totalBudget,
        onBudgetProjects: kpis.onBudgetProjects,
        overBudgetProjects: kpis.overBudgetProjects,
      },
      topClients: kpis.topClients,
    };
  }

  // ==================== FINANCE REPORTS ====================

  async getFinanceKPIs(filters: FinanceReportFilters): Promise<FinanceReportKPIs> {
    const dateRange = this.parseDateRange(filters.startDate as string, filters.endDate as string);

    const { startDate, endDate, ...otherFilters } = filters;
    const reportFilters: ReportFilters = {
      ...otherFilters,
      ...dateRange,
    };

    return await this.repository.getFinanceKPIs(reportFilters);
  }

  async getFinanceSummary(filters: FinanceReportFilters) {
    const kpis = await this.getFinanceKPIs(filters);

    return {
      overview: {
        totalRevenue: kpis.totalRevenue,
        totalExpenses: kpis.totalExpenses,
        netIncome: kpis.netIncome,
        profitMargin: kpis.totalRevenue > 0
          ? Math.round((kpis.netIncome / kpis.totalRevenue) * 100)
          : 0,
      },
      invoiceMetrics: {
        totalInvoices: kpis.invoiceStats.total,
        pendingPayments: kpis.pendingPayments,
        paidAmount: kpis.paidAmount,
        overdueAmount: kpis.overdueAmount,
        collectionRate: kpis.invoiceStats.total > 0
          ? Math.round((kpis.invoiceStats.paid / kpis.invoiceStats.total) * 100)
          : 0,
      },
      expenseMetrics: {
        totalExpenses: kpis.totalExpenses,
        expenseByCategory: kpis.expenseByCategory,
        pendingExpenses: kpis.expenseStats.pending,
      },
      topClients: kpis.topClients,
    };
  }

  async getCashFlowStatement(filters: FinanceReportFilters) {
    const dateRange = this.parseDateRange(filters.startDate as string, filters.endDate as string);

    const { startDate, endDate, ...otherFilters } = filters;
    const reportFilters: ReportFilters = {
      ...otherFilters,
      ...dateRange,
    };

    const kpis = await this.repository.getFinanceKPIs(reportFilters);

    return {
      period: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
      cashFlow: {
        operating: {
          revenue: kpis.totalRevenue,
          expenses: kpis.totalExpenses,
          net: kpis.netIncome,
        },
        invoices: {
          paid: kpis.paidAmount,
          pending: kpis.pendingPayments,
          overdue: kpis.overdueAmount,
        },
      },
      topClients: kpis.topClients,
    };
  }

  // ==================== HR REPORTS ====================

  async getHRKPIs(filters: HRReportFilters): Promise<HRReportKPIs> {
    const dateRange = this.parseDateRange(filters.startDate as string, filters.endDate as string);

    const { startDate, endDate, ...otherFilters } = filters;
    const reportFilters: ReportFilters = {
      ...otherFilters,
      ...dateRange,
    };

    return await this.repository.getHRKPIs(reportFilters);
  }

  async getHRSummary(filters: HRReportFilters) {
    const kpis = await this.getHRKPIs(filters);

    return {
      overview: {
        totalEmployees: kpis.totalEmployees,
        activeEmployees: kpis.activeEmployees,
        newHiresThisPeriod: kpis.newHiresThisPeriod,
        turnoverRate: 0, // Would need historical data
      },
      payrollMetrics: {
        totalPayroll: kpis.totalPayroll,
        avgSalary: kpis.avgSalary,
        payslipsPending: kpis.payslipStats.draft,
        payslipsProcessed: kpis.payslipStats.paid,
      },
      attendanceMetrics: {
        avgAttendanceRate: kpis.attendanceStats.avgAttendanceRate,
        presentDays: kpis.attendanceStats.presentDays,
        absentDays: kpis.attendanceStats.absentDays,
        lateDays: kpis.attendanceStats.lateDays,
      },
      departmentBreakdown: kpis.employeesByDepartment,
      designationBreakdown: kpis.employeesByDesignation,
    };
  }

  async getPayrollSummary(filters: HRReportFilters) {
    const kpis = await this.getHRKPIs(filters);

    return {
      overview: {
        totalPayroll: kpis.totalPayroll,
        activeEmployees: kpis.activeEmployees,
        avgSalary: kpis.avgSalary,
      },
      payslipsByStatus: kpis.payslipStats,
      departmentCosts: kpis.employeesByDepartment, // Would need salary by department
    };
  }

  // ==================== SUPPORT REPORTS ====================

  async getSupportKPIs(filters: SupportReportFilters): Promise<SupportReportKPIs> {
    const dateRange = this.parseDateRange(filters.startDate as string, filters.endDate as string);

    const { startDate, endDate, ...otherFilters } = filters;
    const reportFilters: ReportFilters = {
      ...otherFilters,
      ...dateRange,
    };

    return await this.repository.getSupportKPIs(reportFilters);
  }

  async getSupportSummary(filters: SupportReportFilters) {
    const kpis = await this.getSupportKPIs(filters);

    return {
      overview: {
        totalTickets: kpis.totalTickets,
        openTickets: kpis.openTickets,
        inProgressTickets: kpis.inProgressTickets,
        resolvedTickets: kpis.resolvedTickets,
        resolutionRate: kpis.totalTickets > 0
          ? Math.round((kpis.resolvedTickets / kpis.totalTickets) * 100)
          : 0,
      },
      statusBreakdown: kpis.byStatus,
      priorityBreakdown: kpis.byPriority,
      performanceMetrics: {
        avgResolutionTime: kpis.avgResolutionTime,
        slaComplianceRate: kpis.slaComplianceRate,
      },
      topClients: kpis.ticketsByClient,
    };
  }

  // ==================== AMC REPORTS ====================

  async getAMCKPIs(filters: AMCReportFilters): Promise<AMCReportKPIs> {
    const dateRange = this.parseDateRange(filters.startDate as string, filters.endDate as string);

    const { startDate, endDate, ...otherFilters } = filters;
    const reportFilters: ReportFilters = {
      ...otherFilters,
      ...dateRange,
    };

    return await this.repository.getAMCKPIs(reportFilters);
  }

  async getAMCSummary(filters: AMCReportFilters) {
    const kpis = await this.getAMCKPIs(filters);

    return {
      overview: {
        totalAMCs: kpis.totalAMCs,
        activeAMCs: kpis.activeAMCs,
        expiringAMCs: kpis.expiringAMCs,
        expiredAMCs: kpis.expiredAMCs,
      },
      revenueMetrics: {
        monthlyRecurringRevenue: kpis.totalMonthlyRevenue,
        annualRecurringRevenue: kpis.totalAnnualRevenue,
        avgContractValue: kpis.activeAMCs > 0
          ? Math.round(kpis.totalAnnualRevenue / kpis.activeAMCs)
          : 0,
      },
      renewalMetrics: {
        renewalsThisMonth: kpis.renewalsThisMonth,
        renewalRate: kpis.renewalRate,
        expiringThisMonth: kpis.expiringAMCs,
      },
      topClients: kpis.topClients,
      serviceBreakdown: kpis.amcsByService,
    };
  }

  // ==================== DASHBOARD SUMMARY ====================

  async getDashboardSummary() {
    const [projects, finance, hr, support, amc] = await Promise.all([
      this.getProjectKPIs({}),
      this.getFinanceKPIs({}),
      this.getHRKPIs({}),
      this.getSupportKPIs({}),
      this.getAMCKPIs({}),
    ]);

    return {
      projects: {
        total: projects.totalProjects,
        active: projects.activeProjects,
        completionRate: projects.totalProjects > 0
          ? Math.round((projects.completedProjects / projects.totalProjects) * 100)
          : 0,
      },
      finance: {
        revenue: finance.totalRevenue,
        expenses: finance.totalExpenses,
        netIncome: finance.netIncome,
        pendingPayments: finance.pendingPayments,
      },
      hr: {
        totalEmployees: hr.totalEmployees,
        activeEmployees: hr.activeEmployees,
        payroll: hr.totalPayroll,
      },
      support: {
        totalTickets: support.totalTickets,
        openTickets: support.openTickets,
        resolvedTickets: support.resolvedTickets,
      },
      amc: {
        totalAMCs: amc.totalAMCs,
        activeAMCs: amc.activeAMCs,
        expiringAMCs: amc.expiringAMCs,
        monthlyRevenue: amc.totalMonthlyRevenue,
      },
    };
  }
}

// Singleton instance
export const reportService = new ReportService();
