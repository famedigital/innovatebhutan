import { db } from "@/db";
import { employees, profiles, attendance } from "@/db/schema";
import { eq, and, desc, sql, count, lt, gte, or } from "drizzle-orm";

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;

// ==================== FILTERS & INTERFACES ====================

export interface EmployeeFilters {
  status?: string;
  department?: string;
  designation?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  onLeaveEmployees: number;
  terminatedEmployees: number;
}

// ==================== EMPLOYEE REPOSITORY ====================

export class EmployeeRepository {
  private db = db;

  // ==================== CRUD OPERATIONS ====================

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

  // ==================== LIST OPERATIONS ====================

  async listEmployees(filters: EmployeeFilters = {}): Promise<{ employees: Employee[]; total: number }> {
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(employees.status, filters.status as any));
    }
    if (filters.department) {
      conditions.push(eq(employees.department, filters.department));
    }
    if (filters.designation) {
      conditions.push(eq(employees.designation, filters.designation));
    }
    if (filters.search) {
      conditions.push(
        sql`(${employees.designation} ILIKE ${'%' + filters.search + '%'} OR ${employees.department} ILIKE ${'%' + filters.search + '%'})`
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
      conditions.push(eq(employees.status, filters.status as any));
    }
    if (filters.department) {
      conditions.push(eq(employees.department, filters.department));
    }
    if (filters.designation) {
      conditions.push(eq(employees.designation, filters.designation));
    }
    if (filters.search) {
      conditions.push(
        sql`(${profiles.fullName} ILIKE ${'%' + filters.search + '%'} OR ${employees.designation} ILIKE ${'%' + filters.search + '%'} OR ${employees.email} ILIKE ${'%' + filters.search + '%'})`
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
      .where(eq(employees.status, "active"))
      .orderBy(employees.joinDate);
  }

  async getEmployeesByDepartment(department: string): Promise<Employee[]> {
    return await this.db
      .select()
      .from(employees)
      .where(and(eq(employees.department, department), eq(employees.status, "active")))
      .orderBy(employees.designation);
  }

  // ==================== STATISTICS ====================

  async getEmployeeStats(): Promise<EmployeeStats> {
    const [statusStats, totalResult] = await Promise.all([
      this.db
        .select({
          status: employees.status,
          count: count(),
        })
        .from(employees)
        .groupBy(employees.status),

      this.db.select({ count: count() }).from(employees),
    ]);

    const total = Number(totalResult[0]?.count) || 0;
    const stats = statusStats.reduce(
      (acc, item) => {
        const status = item.status || "unknown";
        acc[status] = Number(item.count);
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalEmployees: total,
      activeEmployees: stats.active || 0,
      inactiveEmployees: stats.inactive || 0,
      onLeaveEmployees: stats.on_leave || 0,
      terminatedEmployees: stats.terminated || 0,
    };
  }

  // ==================== ATTENDANCE HELPERS ====================

  async getEmployeeAttendanceForMonth(
    employeeId: number,
    month: number,
    year: number
  ): Promise<Array<{ date: Date; checkIn: Date | null; checkOut: Date | null }>> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const result = await this.db
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

    return result.map(r => ({
      date: r.date ?? new Date(),
      checkIn: r.checkIn,
      checkOut: r.checkOut,
    }));
  }
}

// Singleton instance
export const employeeRepository = new EmployeeRepository();
