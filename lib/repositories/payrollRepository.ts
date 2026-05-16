import { db } from "@/db";
import { employees, payslips, profiles, attendance } from "@/db/schema";
import { eq, and, desc, sql, count, lt, gte, or } from "drizzle-orm";
import { dashboardCache, withCache, hashFilters, listCache, statsCache } from "@/lib/cache/repository-cache";

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
export type Payslip = typeof payslips.$inferSelect;
export type NewPayslip = typeof payslips.$inferInsert;

// ==================== FILTERS & INTERFACES ====================

export interface EmployeeFilters {
  status?: string;
  department?: string;
  designation?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PayslipFilters {
  employeeId?: number;
  status?: string;
  month?: number;
  year?: number;
  department?: string;
  limit?: number;
  offset?: number;
}

export interface PayslipStats {
  totalPayslips: number;
  draftPayslips: number;
  approvedPayslips: number;
  paidPayslips: number;
  totalAmount: number;
}

export interface PayrollPeriodSummary {
  month: number;
  year: number;
  totalEmployees: number;
  processedCount: number;
  pendingCount: number;
  totalNetSalary: number;
  totalPFDeduction: number;
  totalPIT: number;
}

// ==================== EMPLOYEE REPOSITORY ====================

export class PayrollRepository {
  private db = db;

  // ==================== EMPLOYEE CRUD ====================

  async createEmployee(data: NewEmployee): Promise<Employee> {
    const [employee] = await this.db.insert(employees).values(data).returning();
    return employee;
  }

  async getEmployeeById(id: number): Promise<Employee | null> {
    const [employee] = await this.db.select().from(employees).where(eq(employees.id, id)).limit(1);
    return employee || null;
  }

  async getEmployeeByProfileId(profileId: number): Promise<Employee | null> {
    const [employee] = await this.db
      .select()
      .from(employees)
      .where(eq(employees.profileId, profileId))
      .limit(1);
    return employee || null;
  }

  async updateEmployee(id: number, data: Partial<NewEmployee>): Promise<Employee> {
    const [employee] = await this.db.update(employees).set(data).where(eq(employees.id, id)).returning();
    return employee;
  }

  async deleteEmployee(id: number): Promise<void> {
    await this.db.delete(employees).where(eq(employees.id, id));
  }

  async listEmployees(filters: EmployeeFilters = {}): Promise<{ employees: Employee[]; total: number }> {
    const conditions = [];

    if (filters.status) {
      conditions.push(sql`${employees.additionalDocs}->>'status' = ${filters.status}`);
    }
    if (filters.department) {
      conditions.push(sql`${employees.additionalDocs}->>'department' = ${filters.department}`);
    }
    if (filters.designation) {
      conditions.push(eq(employees.designation, filters.designation));
    }
    if (filters.search) {
      conditions.push(
        sql`(${employees.designation} ILIKE ${'%' + filters.search + '%'} OR ${employees.additionalDocs}->>'department' ILIKE ${'%' + filters.search + '%'})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await this.db
      .select({ count: count() })
      .from(employees)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const employeesData = await this.db
      .select()
      .from(employees)
      .where(whereClause)
      .orderBy(desc(employees.joinDate))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return { employees: employeesData, total };
  }

  async listEmployeesWithDetails(filters: EmployeeFilters = {}): Promise<{
    employees: Array<Employee & { fullName?: string | null; email?: string | null; userId?: string | null }>;
    total: number;
  }> {
    const conditions = [];

    if (filters.status) {
      conditions.push(sql`${employees.additionalDocs}->>'status' = ${filters.status}`);
    }
    if (filters.department) {
      conditions.push(sql`${employees.additionalDocs}->>'department' = ${filters.department}`);
    }
    if (filters.designation) {
      conditions.push(eq(employees.designation, filters.designation));
    }
    if (filters.search) {
      conditions.push(
        sql`(${profiles.fullName} ILIKE ${'%' + filters.search + '%'} OR ${employees.designation} ILIKE ${'%' + filters.search + '%'})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await this.db
      .select({ count: count() })
      .from(employees)
      .leftJoin(profiles, eq(employees.profileId, profiles.id))
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const employeesData = await this.db
      .select({
        id: employees.id,
        profileId: employees.profileId,
        designation: employees.designation,
        baseSalary: employees.baseSalary,
        joinDate: employees.joinDate,
        photoUrl: employees.photoUrl,
        nationalIdMasked: employees.nationalIdMasked,
        interviewScore: employees.interviewScore,
        agreementsDocUrl: employees.agreementsDocUrl,
        joiningLetterUrl: employees.joiningLetterUrl,
        additionalDocs: employees.additionalDocs,
        tin: employees.tin,
        pfNumber: employees.pfNumber,
        bankAccountNumber: employees.bankAccountNumber,
        bankName: employees.bankName,
        bankBranch: employees.bankBranch,
        status: employees.status,
        department: employees.department,
        phone: employees.phone,
        email: employees.email,
        fullName: profiles.fullName,
        userId: profiles.userId,
      })
      .from(employees)
      .leftJoin(profiles, eq(employees.profileId, profiles.id))
      .where(whereClause)
      .orderBy(desc(employees.joinDate))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return { employees: employeesData as any, total };
  }

  async getActiveEmployees(): Promise<Employee[]> {
    return await this.db
      .select()
      .from(employees)
      .where(sql`${employees.additionalDocs}->>'status' = 'active' OR ${employees.additionalDocs}->>'status' IS NULL`)
      .orderBy(employees.joinDate);
  }

  // ==================== PAYSLIP CRUD ====================

  async createPayslip(data: NewPayslip): Promise<Payslip> {
    const [payslip] = await this.db.insert(payslips).values(data).returning();
    return payslip;
  }

  async getPayslipById(id: number): Promise<Payslip | null> {
    const [payslip] = await this.db.select().from(payslips).where(eq(payslips.id, id)).limit(1);
    return payslip || null;
  }

  async getPayslipByEmployeeAndMonth(
    employeeId: number,
    month: number,
    year: number
  ): Promise<Payslip | null> {
    const [payslip] = await this.db
      .select()
      .from(payslips)
      .where(and(eq(payslips.employeeId, employeeId), eq(payslips.month, month), eq(payslips.year, year)))
      .limit(1);
    return payslip || null;
  }

  async updatePayslip(id: number, data: Partial<NewPayslip>): Promise<Payslip> {
    const [payslip] = await this.db.update(payslips).set(data).where(eq(payslips.id, id)).returning();
    return payslip;
  }

  async deletePayslip(id: number): Promise<void> {
    await this.db.delete(payslips).where(eq(payslips.id, id));
  }

  async listPayslips(filters: PayslipFilters = {}): Promise<{ payslips: Payslip[]; total: number }> {
    const conditions = [];

    if (filters.employeeId) {
      conditions.push(eq(payslips.employeeId, filters.employeeId));
    }
    if (filters.status) {
      conditions.push(eq(payslips.status, filters.status));
    }
    if (filters.month) {
      conditions.push(eq(payslips.month, filters.month));
    }
    if (filters.year) {
      conditions.push(eq(payslips.year, filters.year));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await this.db
      .select({ count: count() })
      .from(payslips)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const payslipsData = await this.db
      .select()
      .from(payslips)
      .where(whereClause)
      .orderBy(desc(payslips.year), desc(payslips.month), desc(payslips.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return { payslips: payslipsData, total };
  }

  async listPayslipsWithDetails(filters: PayslipFilters = {}): Promise<{
    payslips: Array<Payslip & {
      employeeName?: string | null;
      employeeDesignation?: string | null;
      employeeDepartment?: string | null;
      employeePhoto?: string | null;
    }>;
    total: number;
  }> {
    const conditions = [];

    if (filters.employeeId) {
      conditions.push(eq(payslips.employeeId, filters.employeeId));
    }
    if (filters.status) {
      conditions.push(eq(payslips.status, filters.status));
    }
    if (filters.month) {
      conditions.push(eq(payslips.month, filters.month));
    }
    if (filters.year) {
      conditions.push(eq(payslips.year, filters.year));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Run both queries in parallel for better performance
    const [payslipsData, totalResult] = await Promise.all([
      this.db
        .select({
          id: payslips.id,
          employeeId: payslips.employeeId,
          month: payslips.month,
          year: payslips.year,
          netSalary: payslips.netSalary,
          status: payslips.status,
          pdfUrl: payslips.pdfUrl,
          createdAt: payslips.createdAt,
          employeeName: profiles.fullName,
          employeeDesignation: employees.designation,
          employeeDepartment: sql<string>`${employees.additionalDocs}->>'department'`,
          employeePhoto: employees.photoUrl,
        })
        .from(payslips)
        .leftJoin(employees, eq(payslips.employeeId, employees.id))
        .leftJoin(profiles, eq(employees.profileId, profiles.id))
        .where(whereClause)
        .orderBy(desc(payslips.year), desc(payslips.month), desc(payslips.createdAt))
        .limit(filters.limit || 50)
        .offset(filters.offset || 0),

      this.db
        .select({ count: count() })
        .from(payslips)
        .where(whereClause),
    ]);

    return {
      payslips: payslipsData,
      total: Number(totalResult[0]?.count || 0),
    };
  }

  async getPayslipsByPeriod(month: number, year: number): Promise<Payslip[]> {
    return await this.db
      .select()
      .from(payslips)
      .where(and(eq(payslips.month, month), eq(payslips.year, year)))
      .orderBy(payslips.employeeId);
  }

  async getPayslipsByEmployee(employeeId: number, limit = 12): Promise<Payslip[]> {
    return await this.db
      .select()
      .from(payslips)
      .where(eq(payslips.employeeId, employeeId))
      .orderBy(desc(payslips.year), desc(payslips.month))
      .limit(limit);
  }

  // ==================== ATTENDANCE FOR PAYROLL ====================

  async getEmployeeAttendanceForMonth(
    employeeId: number,
    month: number,
    year: number
  ): Promise<Array<{ date: Date; checkIn: Date | null; checkOut: Date | null }>> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return await this.db
      .select({
        date: attendance.date,
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
      })
      .from(attendance)
      .where(
        and(
          eq(attendance.employeeId, employeeId),
          gte(attendance.date, startDate),
          lt(attendance.date, endDate)
        )
      )
      .orderBy(attendance.date);
  }

  // ==================== STATISTICS ====================

  /**
   * Get payslip stats with caching
   * Single aggregation query instead of 2 parallel queries
   */
  async getPayslipStats(filters: PayslipFilters = {}): Promise<PayslipStats> {
    const conditions = [];

    if (filters.employeeId) {
      conditions.push(eq(payslips.employeeId, filters.employeeId));
    }
    if (filters.month) {
      conditions.push(eq(payslips.month, filters.month));
    }
    if (filters.year) {
      conditions.push(eq(payslips.year, filters.year));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const cacheKey = `payslips:stats:${hashFilters(filters)}`;

    return withCache(
      cacheKey,
      () => this.computePayslipStats(whereClause),
      statsCache,
      30000 // 30 seconds
    );
  }

  private async computePayslipStats(whereClause: ReturnType<typeof and>): Promise<PayslipStats> {
    const [statsResult] = await this.db
      .select({
        draft: count(sql`CASE WHEN ${payslips.status} = 'draft' THEN 1 END`),
        approved: count(sql`CASE WHEN ${payslips.status} = 'approved' THEN 1 END`),
        paid: count(sql`CASE WHEN ${payslips.status} = 'paid' THEN 1 END`),
        total: count(),
        totalAmount: sql<number>`COALESCE(SUM(CAST(${payslips.netSalary} AS NUMERIC)), 0)`,
      })
      .from(payslips)
      .where(whereClause);

    return {
      totalPayslips: Number(statsResult.total),
      draftPayslips: Number(statsResult.draft),
      approvedPayslips: Number(statsResult.approved),
      paidPayslips: Number(statsResult.paid),
      totalAmount: Number(statsResult.totalAmount) || 0,
    };
  }

  async getPayrollPeriodSummary(month: number, year: number): Promise<PayrollPeriodSummary> {
    const [totalEmployees, payslipsData] = await Promise.all([
      this.db.select({ count: count() }).from(employees),
      this.db
        .select({
          status: payslips.status,
          count: count(),
          totalNetSalary: sql<number>`COALESCE(SUM(CAST(${payslips.netSalary} AS NUMERIC)), 0)`,
        })
        .from(payslips)
        .where(and(eq(payslips.month, month), eq(payslips.year, year)))
        .groupBy(payslips.status),
    ]);

    const totalEmployeeCount = totalEmployees[0]?.count || 0;

    const stats = payslipsData.reduce(
      (acc, item) => {
        const status = item.status || "unknown";
        acc.byStatus[status] = Number(item.count);
        acc.totalNetSalary += Number(item.totalNetSalary);
        return acc;
      },
      { byStatus: {} as Record<string, number>, totalNetSalary: 0 }
    );

    const processedCount = (stats.byStatus.approved || 0) + (stats.byStatus.paid || 0);
    const pendingCount = stats.byStatus.draft || 0;

    return {
      month,
      year,
      totalEmployees: totalEmployeeCount,
      processedCount,
      pendingCount,
      totalNetSalary: stats.totalNetSalary,
      totalPFDeduction: 0, // Will be calculated after schema update
      totalPIT: 0, // Will be calculated after schema update
    };
  }

  /**
   * Get dashboard stats with caching (30 second TTL)
   * Single aggregation query instead of 3 parallel queries
   */
  async getDashboardStats(): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    pendingPayslips: number;
    currentMonthPayout: number;
  }> {
    return withCache(
      'payroll:dashboard',
      () => this.computeDashboardStats(),
      dashboardCache,
      30000 // 30 seconds
    );
  }

  /**
   * Internal method to compute dashboard stats
   * Uses aggregation for better performance
   */
  private async computeDashboardStats(): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    pendingPayslips: number;
    currentMonthPayout: number;
  }> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [employeeStats, payslipStats] = await Promise.all([
      this.db
        .select({
          total: count(),
          active: count(sql`CASE WHEN ${employees.additionalDocs}->>'status' = 'active' OR ${employees.additionalDocs}->>'status' IS NULL THEN 1 END`),
        })
        .from(employees),

      this.db
        .select({
          pending: count(sql`CASE WHEN ${payslips.status} = 'draft' THEN 1 END`),
          currentMonthPayout: sql<number>`COALESCE(SUM(CASE WHEN ${payslips.month} = ${currentMonth} AND ${payslips.year} = ${currentYear} AND ${payslips.status} = 'paid' THEN CAST(${payslips.netSalary} AS NUMERIC) ELSE 0 END), 0)`,
        })
        .from(payslips),
    ]);

    return {
      totalEmployees: Number(employeeStats[0]?.total) || 0,
      activeEmployees: Number(employeeStats[0]?.active) || 0,
      pendingPayslips: Number(payslipStats[0]?.pending) || 0,
      currentMonthPayout: Number(payslipStats[0]?.currentMonthPayout) || 0,
    };
  }
}

// Singleton instance
export const payrollRepository = new PayrollRepository();
