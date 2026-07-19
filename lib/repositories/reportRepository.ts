import { db } from "@/db";
import {
  projects,
  projectTasks,
  invoices,
  transactions,
  expenses,
  employees,
  payslips,
  attendance,
  tickets,
  amcs,
  clients,
  services,
} from "@/db/schema";
import {
  eq,
  and,
  sql,
  count,
  gte,
  lte,
  isNull,
  asc,
} from "drizzle-orm";
import { reportCache, withCache, hashFilters } from "@/lib/cache/repository-cache";

// ==================== COMMON INTERFACES ====================

export interface ReportDateRange {
  startDate?: Date;
  endDate?: Date;
}

export interface ReportFilters extends ReportDateRange {
  clientId?: number;
  status?: string;
  department?: string;
  designation?: string;
}

// ==================== PROJECT REPORT INTERFACES ====================

export interface ProjectReportKPIs {
  totalProjects: number;
  byStatus: Record<string, number>;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalBudget: number;
  avgProgress: number;
  onBudgetProjects: number;
  overBudgetProjects: number;
  tasksByStatus: Record<string, number>;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  topClients: Array<{ clientId: number; clientName: string; projectCount: number }>;
}

// ==================== FINANCE REPORT INTERFACES ====================

export interface FinanceReportKPIs {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  pendingPayments: number;
  paidAmount: number;
  overdueAmount: number;
  invoiceStats: {
    total: number;
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
    cancelled: number;
  };
  expenseStats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  expenseByCategory: Record<string, number>;
  revenueByMonth: Array<{ month: string; year: number; revenue: number; expenses: number }>;
  topClients: Array<{ clientId: number; clientName: string; totalAmount: number }>;
}

// ==================== HR REPORT INTERFACES ====================

export interface HRReportKPIs {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  newHiresThisPeriod: number;
  totalPayroll: number;
  avgSalary: number;
  payslipStats: {
    total: number;
    draft: number;
    approved: number;
    paid: number;
  };
  attendanceStats: {
    presentDays: number;
    absentDays: number;
    lateDays: number;
    avgAttendanceRate: number;
  };
  employeesByDepartment: Record<string, number>;
  employeesByDesignation: Record<string, number>;
}

// ==================== SUPPORT REPORT INTERFACES ====================

export interface SupportReportKPIs {
  totalTickets: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  avgResolutionTime: number; // in hours
  slaComplianceRate: number;
  ticketsByClient: Array<{ clientId: number; clientName: string; ticketCount: number }>;
  ticketsThisPeriod: number;
  resolvedThisPeriod: number;
}

// ==================== AMC REPORT INTERFACES ====================

export interface AMCReportKPIs {
  totalAMCs: number;
  activeAMCs: number;
  expiringAMCs: number;
  expiredAMCs: number;
  cancelledAMCs: number;
  totalMonthlyRevenue: number;
  totalAnnualRevenue: number;
  renewalsThisMonth: number;
  renewalRate: number;
  topClients: Array<{
    clientId: number | null;
    clientName: string;
    amcCount: number;
    totalValue: number;
  }>;
  amcsByService: Record<string, number>;
  /** Shape consumed by /admin/amc/reports UI */
  summary: {
    totalContracts: number;
    activeContracts: number;
    expiringContracts: number;
    expiredContracts: number;
    totalMonthlyRevenue: number;
    totalAnnualValue: number;
    upcomingRenewals: number;
    averageContractValue: number;
  };
  byStatus: Array<{
    status: string;
    count: number;
    totalValue: number;
    percentage: number;
  }>;
  byClient: Array<{
    clientName: string;
    contractCount: number;
    totalValue: number;
    activeContracts: number;
    monthlyRevenue: number;
  }>;
  renewalTimeline: Array<{
    month: string;
    contractsExpiring: number;
    valueAtRisk: number;
  }>;
  expiryAlert: Array<{
    contractNumber: string;
    clientName: string;
    serviceName: string;
    endDate: string;
    daysUntilExpiry: number;
    value: number;
  }>;
}

// ==================== REPORT REPOSITORY ====================

export class ReportRepository {
  private db = db;

  // ==================== PROJECT REPORTS ====================

  /**
   * Get project KPIs with caching (5 minute TTL for reports)
   * Expensive aggregation queries benefit significantly from caching
   */
  async getProjectKPIs(filters: ReportFilters = {}): Promise<ProjectReportKPIs> {
    const cacheKey = `report:projects:${hashFilters(filters)}`;
    return withCache(cacheKey, () => this.computeProjectKPIs(filters), reportCache, 300000); // 5 minutes
  }

  private async computeProjectKPIs(filters: ReportFilters = {}): Promise<ProjectReportKPIs> {
    const conditions: any[] = [isNull(projects.deletedAt)];

    if (filters.clientId) {
      conditions.push(eq(projects.clientId, filters.clientId));
    }
    if (filters.status) {
      conditions.push(eq(projects.status, filters.status));
    }
    if (filters.startDate) {
      conditions.push(sql`${projects.createdAt} >= ${filters.startDate}`);
    }
    if (filters.endDate) {
      conditions.push(sql`${projects.createdAt} <= ${filters.endDate}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [statusStats, budgetStats, taskStats, clientStats] = await Promise.all([
      // Projects by status
      this.db
        .select({
          status: projects.status,
          count: count(),
        })
        .from(projects)
        .where(whereClause)
        .groupBy(projects.status),

      // Budget stats
      this.db
        .select({
          totalBudget: sql<number>`COALESCE(SUM(${projects.budget}), 0)`,
          avgProgress: sql<number>`COALESCE(AVG(${projects.progress}), 0)`,
          totalProjects: count(),
        })
        .from(projects)
        .where(whereClause),

      // Task stats
      this.db
        .select({
          status: projectTasks.status,
          count: count(),
        })
        .from(projectTasks)
        .innerJoin(projects, eq(projectTasks.projectId, projects.id))
        .where(conditions.length > 0 ? and(...conditions) : isNull(projectTasks.deletedAt))
        .groupBy(projectTasks.status),

      // Top clients
      this.db
        .select({
          clientId: projects.clientId,
          clientName: clients.name,
          projectCount: count(),
        })
        .from(projects)
        .leftJoin(clients, eq(projects.clientId, clients.id))
        .where(whereClause)
        .groupBy(projects.clientId, clients.name)
        .orderBy(sql`${count()} DESC`)
        .limit(5),
    ]);

    const byStatus = statusStats.reduce((acc, item) => {
      acc[item.status || "unknown"] = Number(item.count);
      return acc;
    }, {} as Record<string, number>);

    const tasksByStatus = taskStats.reduce((acc, item) => {
      acc[item.status || "unknown"] = Number(item.count);
      return acc;
    }, {} as Record<string, number>);

    const activeProjects = byStatus.active || 0;
    const completedProjects = byStatus.complete || 0;
    const onHoldProjects = byStatus.on_hold || 0;

    return {
      totalProjects: Number(budgetStats[0]?.totalProjects) || 0,
      byStatus,
      activeProjects,
      completedProjects,
      onHoldProjects,
      totalBudget: Number(budgetStats[0]?.totalBudget) || 0,
      avgProgress: Math.round(Number(budgetStats[0]?.avgProgress) || 0),
      onBudgetProjects: 0, // Would require actual cost tracking
      overBudgetProjects: 0,
      tasksByStatus,
      totalTasks: Object.values(tasksByStatus).reduce((sum: number, val) => sum + (val as number), 0),
      completedTasks: tasksByStatus.done || 0,
      overdueTasks: tasksByStatus.blocked || 0,
      topClients: clientStats.map(c => ({
        clientId: c.clientId,
        clientName: c.clientName || "Unknown",
        projectCount: Number(c.projectCount),
      })),
    };
  }

  // ==================== FINANCE REPORTS ====================

  /**
   * Get finance KPIs with caching (5 minute TTL for reports)
   */
  async getFinanceKPIs(filters: ReportFilters = {}): Promise<FinanceReportKPIs> {
    const cacheKey = `report:finance:${hashFilters(filters)}`;
    return withCache(cacheKey, () => this.computeFinanceKPIs(filters), reportCache, 300000); // 5 minutes
  }

  private async computeFinanceKPIs(filters: ReportFilters = {}): Promise<FinanceReportKPIs> {
    const conditions: any[] = [];

    if (filters.startDate) {
      conditions.push(sql`${invoices.createdAt} >= ${filters.startDate}`);
    }
    if (filters.endDate) {
      conditions.push(sql`${invoices.createdAt} <= ${filters.endDate}`);
    }

    const invoiceWhereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [
      invoiceStatusStats,
      invoiceAmountStats,
      expenseStatusStats,
      expenseCategoryStats,
      transactionStats,
      clientStats,
    ] = await Promise.all([
      // Invoice status breakdown
      this.db
        .select({
          status: invoices.status,
          count: count(),
        })
        .from(invoices)
        .where(invoiceWhereClause)
        .groupBy(invoices.status),

      // Invoice amounts
      this.db
        .select({
          totalAmount: sql<number>`COALESCE(SUM(${invoices.total}), 0)`,
          paidAmount: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.total} ELSE 0 END), 0)`,
          overdueAmount: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'overdue' THEN ${invoices.total} ELSE 0 END), 0)`,
          pendingAmount: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} IN ('draft', 'sent') THEN ${invoices.total} ELSE 0 END), 0)`,
        })
        .from(invoices)
        .where(invoiceWhereClause),

      // Expense status breakdown
      this.db
        .select({
          status: expenses.status,
          count: count(),
        })
        .from(expenses)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(expenses.status),

      // Expense by category
      this.db
        .select({
          category: expenses.category,
          totalAmount: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
        })
        .from(expenses)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .groupBy(expenses.category),

      // Transaction totals
      this.db
        .select({
          totalIncome: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'INCOME' THEN ${transactions.amount} ELSE 0 END), 0)`,
          totalExpenses: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'EXPENSE' THEN ${transactions.amount} ELSE 0 END), 0)`,
        })
        .from(transactions)
        .where(conditions.length > 0 ? and(...conditions) : undefined),

      // Top clients by invoice amount
      this.db
        .select({
          clientId: invoices.clientId,
          clientName: clients.name,
          totalAmount: sql<number>`COALESCE(SUM(${invoices.total}), 0)`,
        })
        .from(invoices)
        .leftJoin(clients, eq(invoices.clientId, clients.id))
        .where(invoiceWhereClause)
        .groupBy(invoices.clientId, clients.name)
        .orderBy(sql`SUM(${invoices.total}) DESC`)
        .limit(5),
    ]);

    const invoiceStats = {
      total: invoiceStatusStats.reduce((sum, s) => sum + Number(s.count), 0),
      draft: invoiceStatusStats.find(s => s.status === "draft")?.count || 0,
      sent: invoiceStatusStats.find(s => s.status === "sent")?.count || 0,
      paid: invoiceStatusStats.find(s => s.status === "paid")?.count || 0,
      overdue: invoiceStatusStats.find(s => s.status === "overdue")?.count || 0,
      cancelled: invoiceStatusStats.find(s => s.status === "cancelled")?.count || 0,
    };

    const expenseStats = {
      total: expenseStatusStats.reduce((sum, s) => sum + Number(s.count), 0),
      pending: expenseStatusStats.find(s => s.status === "pending")?.count || 0,
      approved: expenseStatusStats.find(s => s.status === "approved")?.count || 0,
      rejected: expenseStatusStats.find(s => s.status === "rejected")?.count || 0,
    };

    const expenseByCategory = expenseCategoryStats.reduce((acc, item) => {
      acc[item.category || "uncategorized"] = Number(item.totalAmount);
      return acc;
    }, {} as Record<string, number>);

    const totalRevenue = Number(transactionStats[0]?.totalIncome) || 0;
    const totalExpenses = Number(transactionStats[0]?.totalExpenses) || 0;

    return {
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      pendingPayments: Number(invoiceAmountStats[0]?.pendingAmount) || 0,
      paidAmount: Number(invoiceAmountStats[0]?.paidAmount) || 0,
      overdueAmount: Number(invoiceAmountStats[0]?.overdueAmount) || 0,
      invoiceStats,
      expenseStats,
      expenseByCategory,
      revenueByMonth: [], // Would require more complex grouping query
      topClients: clientStats.map(c => ({
        clientId: c.clientId,
        clientName: c.clientName || "Unknown",
        totalAmount: Number(c.totalAmount),
      })),
    };
  }

  // ==================== HR REPORTS ====================

  /**
   * Get HR KPIs with caching (5 minute TTL for reports)
   */
  async getHRKPIs(filters: ReportFilters = {}): Promise<HRReportKPIs> {
    const cacheKey = `report:hr:${hashFilters(filters)}`;
    return withCache(cacheKey, () => this.computeHRKPIs(filters), reportCache, 300000); // 5 minutes
  }

  private async computeHRKPIs(filters: ReportFilters = {}): Promise<HRReportKPIs> {
    const conditions: any[] = [];

    if (filters.startDate) {
      conditions.push(sql`${employees.joinDate} >= ${filters.startDate}`);
    }
    if (filters.endDate) {
      conditions.push(sql`${employees.joinDate} <= ${filters.endDate}`);
    }

    const employeeWhereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [
      employeeStats,
      departmentStats,
      designationStats,
      payslipStats,
      salaryStats,
      attendanceStats,
    ] = await Promise.all([
      // Employee status breakdown
      this.db
        .select({
          status: employees.status,
          count: count(),
        })
        .from(employees)
        .groupBy(employees.status),

      // Employees by department
      this.db
        .select({
          department: employees.department,
          count: count(),
        })
        .from(employees)
        .where(employees.department ? sql`${employees.department} IS NOT NULL` : undefined)
        .groupBy(employees.department),

      // Employees by designation
      this.db
        .select({
          designation: employees.designation,
          count: count(),
        })
        .from(employees)
        .where(employees.designation ? sql`${employees.designation} IS NOT NULL` : undefined)
        .groupBy(employees.designation),

      // Payslip stats
      this.db
        .select({
          status: payslips.status,
          count: count(),
        })
        .from(payslips)
        .groupBy(payslips.status),

      // Salary stats
      this.db
        .select({
          totalPayroll: sql<number>`COALESCE(SUM(${employees.baseSalary}), 0)`,
          avgSalary: sql<number>`COALESCE(AVG(${employees.baseSalary}), 0)`,
        })
        .from(employees)
        .where(eq(employees.status, "active")),

      // Attendance stats (current month)
      this.db
        .select({
          presentCount: count(sql`CASE WHEN ${attendance.checkIn} IS NOT NULL THEN 1 END`),
          totalCount: count(),
        })
        .from(attendance),
    ]);

    const byStatus = employeeStats.reduce((acc, item) => {
      acc[item.status || "unknown"] = Number(item.count);
      return acc;
    }, {} as Record<string, number>);

    const employeesByDepartment = departmentStats.reduce((acc, item) => {
      acc[item.department || "unknown"] = Number(item.count);
      return acc;
    }, {} as Record<string, number>);

    const employeesByDesignation = designationStats.reduce((acc, item) => {
      acc[item.designation || "unknown"] = Number(item.count);
      return acc;
    }, {} as Record<string, number>);

    const payslipByStatus = payslipStats.reduce((acc, item) => {
      acc[item.status || "unknown"] = Number(item.count);
      return acc;
    }, {} as Record<string, number>);

    const presentDays = Number(attendanceStats[0]?.presentCount) || 0;
    const totalDays = Number(attendanceStats[0]?.totalCount) || 0;
    const avgAttendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    return {
      totalEmployees: Object.values(byStatus).reduce((sum: number, val) => sum + (val as number), 0),
      activeEmployees: byStatus.active || 0,
      inactiveEmployees: (byStatus.inactive || 0) + (byStatus.terminated || 0),
      newHiresThisPeriod: employeeWhereClause ? employeeStats.reduce((sum, s) => sum + Number(s.count), 0) : 0,
      totalPayroll: Number(salaryStats[0]?.totalPayroll) || 0,
      avgSalary: Math.round(Number(salaryStats[0]?.avgSalary) || 0),
      payslipStats: {
        total: Object.values(payslipByStatus).reduce((sum: number, val) => sum + (val as number), 0),
        draft: payslipByStatus.draft || 0,
        approved: payslipByStatus.approved || 0,
        paid: payslipByStatus.paid || 0,
      },
      attendanceStats: {
        presentDays,
        absentDays: totalDays - presentDays,
        lateDays: 0, // Would need time-based calculation
        avgAttendanceRate,
      },
      employeesByDepartment,
      employeesByDesignation,
    };
  }

  // ==================== SUPPORT REPORTS ====================

  /**
   * Get support KPIs with caching (5 minute TTL for reports)
   */
  async getSupportKPIs(filters: ReportFilters = {}): Promise<SupportReportKPIs> {
    const cacheKey = `report:support:${hashFilters(filters)}`;
    return withCache(cacheKey, () => this.computeSupportKPIs(filters), reportCache, 300000); // 5 minutes
  }

  private async computeSupportKPIs(filters: ReportFilters = {}): Promise<SupportReportKPIs> {
    const conditions: any[] = [];

    if (filters.clientId) {
      conditions.push(eq(tickets.clientId, filters.clientId));
    }
    if (filters.startDate) {
      conditions.push(sql`${tickets.createdAt} >= ${filters.startDate}`);
    }
    if (filters.endDate) {
      conditions.push(sql`${tickets.createdAt} <= ${filters.endDate}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [statusStats, priorityStats, clientStats] = await Promise.all([
      // Ticket status breakdown
      this.db
        .select({
          status: tickets.status,
          count: count(),
        })
        .from(tickets)
        .where(whereClause)
        .groupBy(tickets.status),

      // Ticket priority breakdown
      this.db
        .select({
          priority: tickets.priority,
          count: count(),
        })
        .from(tickets)
        .where(whereClause)
        .groupBy(tickets.priority),

      // Tickets by client
      this.db
        .select({
          clientId: tickets.clientId,
          clientName: clients.name,
          ticketCount: count(),
        })
        .from(tickets)
        .leftJoin(clients, eq(tickets.clientId, clients.id))
        .where(whereClause)
        .groupBy(tickets.clientId, clients.name)
        .orderBy(sql`${count()} DESC`)
        .limit(5),
    ]);

    const byStatus = statusStats.reduce((acc, item) => {
      acc[item.status || "unknown"] = Number(item.count);
      return acc;
    }, {} as Record<string, number>);

    const byPriority = priorityStats.reduce((acc, item) => {
      acc[item.priority || "unknown"] = Number(item.count);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTickets: Object.values(byStatus).reduce((sum: number, val) => sum + (val as number), 0),
      byStatus,
      byPriority,
      openTickets: byStatus.open || 0,
      inProgressTickets: byStatus.in_progress || 0,
      resolvedTickets: byStatus.resolved || 0,
      avgResolutionTime: 0, // Would need ticket message timestamps
      slaComplianceRate: 0, // Would need SLA configuration
      ticketsByClient: clientStats.map(c => ({
        clientId: c.clientId,
        clientName: c.clientName || "Unknown",
        ticketCount: Number(c.ticketCount),
      })),
      ticketsThisPeriod: filters.startDate || filters.endDate ? Object.values(byStatus).reduce((sum, val) => sum + val, 0) : 0,
      resolvedThisPeriod: filters.startDate || filters.endDate ? (byStatus.resolved || 0) : 0,
    };
  }

  // ==================== AMC REPORTS ====================

  /**
   * Get AMC KPIs with caching (5 minute TTL for reports)
   */
  async getAMCKPIs(filters: ReportFilters = {}): Promise<AMCReportKPIs> {
    const cacheKey = `report:amc:${hashFilters(filters)}`;
    return withCache(cacheKey, () => this.computeAMCKPIs(filters), reportCache, 300000); // 5 minutes
  }

  private async computeAMCKPIs(filters: ReportFilters = {}): Promise<AMCReportKPIs> {
    const conditions: any[] = [];

    if (filters.clientId) {
      conditions.push(eq(amcs.clientId, filters.clientId));
    }
    if (filters.status) {
      conditions.push(eq(amcs.status, filters.status));
    }
    // Date range filters contract end dates (renewal window), not createdAt
    if (filters.startDate) {
      conditions.push(gte(amcs.endDate, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(amcs.endDate, filters.endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const sixMonthsFromNow = new Date(today);
    sixMonthsFromNow.setMonth(today.getMonth() + 6);

    const alertConditions = [
      ...(conditions.length ? conditions : []),
      gte(amcs.endDate, today),
      lte(amcs.endDate, thirtyDaysFromNow),
    ];
    const timelineConditions = [
      ...(conditions.length ? conditions : []),
      gte(amcs.endDate, today),
      lte(amcs.endDate, sixMonthsFromNow),
    ];

    const [
      statusStats,
      amountStats,
      expiringStats,
      clientStats,
      serviceStats,
      expiryRows,
      timelineRows,
    ] = await Promise.all([
      this.db
        .select({
          status: amcs.status,
          count: count(),
          totalValue: sql<number>`COALESCE(SUM(${amcs.amount}::numeric), 0)`,
        })
        .from(amcs)
        .where(whereClause)
        .groupBy(amcs.status),

      this.db
        .select({
          totalValue: sql<number>`COALESCE(SUM(${amcs.amount}::numeric), 0)`,
          activeValue: sql<number>`COALESCE(SUM(CASE WHEN ${amcs.status} = 'active' THEN ${amcs.amount}::numeric ELSE 0 END), 0)`,
        })
        .from(amcs)
        .where(whereClause),

      this.db
        .select({ count: count() })
        .from(amcs)
        .where(
          and(
            eq(amcs.status, "active"),
            gte(amcs.endDate, today),
            lte(amcs.endDate, thirtyDaysFromNow)
          )
        ),

      this.db
        .select({
          clientId: amcs.clientId,
          clientName: clients.name,
          amcCount: count(),
          totalValue: sql<number>`COALESCE(SUM(${amcs.amount}::numeric), 0)`,
          activeContracts: sql<number>`COALESCE(SUM(CASE WHEN ${amcs.status} = 'active' THEN 1 ELSE 0 END), 0)`,
        })
        .from(amcs)
        .leftJoin(clients, eq(amcs.clientId, clients.id))
        .where(whereClause)
        .groupBy(amcs.clientId, clients.name)
        .orderBy(sql`COALESCE(SUM(${amcs.amount}::numeric), 0) DESC`)
        .limit(15),

      this.db
        .select({
          serviceId: amcs.serviceId,
          serviceName: services.name,
          count: count(),
        })
        .from(amcs)
        .leftJoin(services, eq(amcs.serviceId, services.id))
        .where(whereClause)
        .groupBy(amcs.serviceId, services.name),

      this.db
        .select({
          contractNumber: amcs.contractNumber,
          clientName: clients.name,
          serviceName: services.name,
          endDate: amcs.endDate,
          amount: amcs.amount,
        })
        .from(amcs)
        .leftJoin(clients, eq(amcs.clientId, clients.id))
        .leftJoin(services, eq(amcs.serviceId, services.id))
        .where(and(...alertConditions))
        .orderBy(asc(amcs.endDate))
        .limit(50),

      this.db
        .select({
          month: sql<string>`to_char(date_trunc('month', ${amcs.endDate}), 'YYYY-MM')`,
          contractsExpiring: count(),
          valueAtRisk: sql<number>`COALESCE(SUM(${amcs.amount}::numeric), 0)`,
        })
        .from(amcs)
        .where(and(...timelineConditions))
        .groupBy(sql`date_trunc('month', ${amcs.endDate})`)
        .orderBy(sql`date_trunc('month', ${amcs.endDate}) ASC`),
    ]);

    const byStatusMap = statusStats.reduce(
      (acc, item) => {
        acc[item.status || "unknown"] = Number(item.count);
        return acc;
      },
      {} as Record<string, number>
    );

    const totalAMCs = Object.values(byStatusMap).reduce(
      (sum, val) => sum + (val as number),
      0
    );
    const totalValue = Number(amountStats[0]?.totalValue) || 0;
    const activeAMCs = byStatusMap.active || 0;
    const expiringAMCs = Number(expiringStats[0]?.count) || 0;
    const expiredAMCs = byStatusMap.expired || 0;
    const cancelledAMCs = byStatusMap.cancelled || 0;
    const totalMonthlyRevenue = Math.round(totalValue / 12);

    const byStatus = statusStats.map((row) => {
      const countNum = Number(row.count) || 0;
      return {
        status: row.status || "unknown",
        count: countNum,
        totalValue: Number(row.totalValue) || 0,
        percentage: totalAMCs > 0 ? Math.round((countNum / totalAMCs) * 1000) / 10 : 0,
      };
    });

    const byClient = clientStats.map((c) => {
      const value = Number(c.totalValue) || 0;
      return {
        clientName: c.clientName || "Unknown",
        contractCount: Number(c.amcCount) || 0,
        totalValue: value,
        activeContracts: Number(c.activeContracts) || 0,
        monthlyRevenue: Math.round(value / 12),
      };
    });

    const msPerDay = 24 * 60 * 60 * 1000;
    const expiryAlert = expiryRows.map((row) => {
      const end = row.endDate ? new Date(row.endDate) : today;
      const daysUntilExpiry = Math.ceil((end.getTime() - today.getTime()) / msPerDay);
      return {
        contractNumber: row.contractNumber || "—",
        clientName: row.clientName || "Unknown",
        serviceName: row.serviceName || "",
        endDate: end.toISOString(),
        daysUntilExpiry,
        value: Number(row.amount) || 0,
      };
    });

    const renewalTimeline = timelineRows.map((row) => ({
      month: row.month,
      contractsExpiring: Number(row.contractsExpiring) || 0,
      valueAtRisk: Number(row.valueAtRisk) || 0,
    }));

    return {
      totalAMCs,
      activeAMCs,
      expiringAMCs,
      expiredAMCs,
      cancelledAMCs,
      totalMonthlyRevenue,
      totalAnnualRevenue: totalValue,
      renewalsThisMonth: expiringAMCs,
      renewalRate: 0,
      topClients: clientStats.slice(0, 5).map((c) => ({
        clientId: c.clientId,
        clientName: c.clientName || "Unknown",
        amcCount: Number(c.amcCount) || 0,
        totalValue: Number(c.totalValue) || 0,
      })),
      amcsByService: serviceStats.reduce(
        (acc, item) => {
          const key = item.serviceName || `service_${item.serviceId ?? "none"}`;
          acc[key] = Number(item.count) || 0;
          return acc;
        },
        {} as Record<string, number>
      ),
      summary: {
        totalContracts: totalAMCs,
        activeContracts: activeAMCs,
        expiringContracts: expiringAMCs,
        expiredContracts: expiredAMCs,
        totalMonthlyRevenue,
        totalAnnualValue: totalValue,
        upcomingRenewals: expiringAMCs,
        averageContractValue:
          activeAMCs > 0 ? Math.round(totalValue / Math.max(activeAMCs, 1)) : 0,
      },
      byStatus,
      byClient,
      renewalTimeline,
      expiryAlert,
    };
  }
}

// Singleton instance
export const reportRepository = new ReportRepository();
