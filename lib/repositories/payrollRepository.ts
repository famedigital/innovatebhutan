import { db } from "@/db";
import { employees, payslips, profiles, attendance } from "@/db/schema";
import { eq, and, desc, sql, count, lt, gte, or } from "drizzle-orm";

type Employee = typeof employees.$inferSelect;
type NewEmployee = typeof employees.$inferInsert;
type Payslip = typeof payslips.$inferSelect;
type NewPayslip = typeof payslips.$inferInsert;

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
      conditions.push(sql`${employees.additional_docs}->>'status' = ${filters.status}`);
    }
    if (filters.department) {
      conditions.push(sql`${employees.additional_docs}->>'department' = ${filters.department}`);
    }
    if (filters.designation) {
      conditions.push(eq(employees.designation, filters.designation));
    }
    if (filters.search) {
      conditions.push(
        sql`(${employees.designation} ILIKE ${'%' + filters.search + '%'} OR ${employees.additional_docs}->>'department' ILIKE ${'%' + filters.search + '%'})`
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
      conditions.push(sql`${employees.additional_docs}->>'status' = ${filters.status}`);
    }
    if (filters.department) {
      conditions.push(sql`${employees.additional_docs}->>'department' = ${filters.department}`);
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
        fullName: profiles.fullName,
        email: profiles.userId, // Using userId as email proxy
        userId: profiles.userId,
      })
      .from(employees)
      .leftJoin(profiles, eq(employees.profileId, profiles.id))
      .where(whereClause)
      .orderBy(desc(employees.joinDate))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return { employees: employeesData, total };
  }

  async getActiveEmployees(): Promise<Employee[]> {
    return await this.db
      .select()
      .from(employees)
      .where(sql`${employees.additional_docs}->>'status' = 'active' OR ${employees.additional_docs}->>'status' IS NULL`)
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

    const totalResult = await this.db
      .select({ count: count() })
      .from(payslips)
      .leftJoin(employees, eq(payslips.employeeId, employees.id))
      .leftJoin(profiles, eq(employees.profileId, profiles.id))
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const payslipsData = await this.db
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
      .offset(filters.offset || 0);

    return { payslips: payslipsData, total };
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

    const [statusStats, totalAmount] = await Promise.all([
      this.db
        .select({
          status: payslips.status,
          count: count(),
        })
        .from(payslips)
        .where(whereClause)
        .groupBy(payslips.status),

      this.db
        .select({
          total: sql<number>`COALESCE(SUM(CAST(${payslips.netSalary} AS NUMERIC)), 0)`,
        })
        .from(payslips)
        .where(whereClause),
    ]);

    const stats = statusStats.reduce(
      (acc, item) => {
        const status = item.status || "unknown";
        acc[status] = Number(item.count);
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalPayslips: Object.values(stats).reduce((sum, count) => sum + count, 0),
      draftPayslips: stats.draft || 0,
      approvedPayslips: stats.approved || 0,
      paidPayslips: stats.paid || 0,
      totalAmount: Number(totalAmount[0]?.total) || 0,
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

  async getDashboardStats(): Promise<{
    totalEmployees: number;
    activeEmployees: number;
    pendingPayslips: number;
    currentMonthPayout: number;
  }> {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [totalEmployees, pendingPayslips, currentMonthPayout] = await Promise.all([
      this.db.select({ count: count() }).from(employees),
      this.db
        .select({ count: count() })
        .from(payslips)
        .where(eq(payslips.status, "draft")),
      this.db
        .select({
          total: sql<number>`COALESCE(SUM(CAST(${payslips.netSalary} AS NUMERIC)), 0)`,
        })
        .from(payslips)
        .where(
          and(eq(payslips.month, currentMonth), eq(payslips.year, currentYear), eq(payslips.status, "paid"))
        ),
    ]);

    return {
      totalEmployees: Number(totalEmployees[0]?.count) || 0,
      activeEmployees: Number(totalEmployees[0]?.count) || 0, // Will filter by status after migration
      pendingPayslips: Number(pendingPayslips[0]?.count) || 0,
      currentMonthPayout: Number(currentMonthPayout[0]?.total) || 0,
    };
  }
}

// Singleton instance
export const payrollRepository = new PayrollRepository();
