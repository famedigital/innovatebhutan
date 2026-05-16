import { db } from "@/db";
import { attendance, employees, profiles } from "@/db/schema";
import { eq, and, desc, sql, count, gte, lt, between } from "drizzle-orm";

export type Attendance = typeof attendance.$inferSelect;
export type NewAttendance = typeof attendance.$inferInsert;

// ==================== FILTERS & INTERFACES ====================

export interface AttendanceFilters {
  employeeId?: number;
  startDate?: Date;
  endDate?: Date;
  month?: number;
  year?: number;
  limit?: number;
  offset?: number;
}

export interface AttendanceReport {
  employeeId: number;
  employeeName?: string;
  month: number;
  year: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  totalHours?: number;
}

export interface DailyAttendanceRecord {
  id: number;
  employeeId: number;
  employeeName?: string;
  employeeDesignation?: string;
  date: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  location?: Record<string, any> | null;
}

// ==================== ATTENDANCE REPOSITORY ====================

export class AttendanceRepository {
  private db = db;

  // ==================== CRUD OPERATIONS ====================

  async createAttendance(data: NewAttendance): Promise<Attendance> {
    const [record] = await this.db.insert(attendance).values(data).returning();
    return record;
  }

  async getAttendanceById(id: number): Promise<Attendance | null> {
    const [record] = await this.db.select().from(attendance).where(eq(attendance.id, id)).limit(1);
    return record || null;
  }

  async updateAttendance(id: number, data: Partial<NewAttendance>): Promise<Attendance> {
    const [record] = await this.db.update(attendance).set(data).where(eq(attendance.id, id)).returning();
    return record;
  }

  async deleteAttendance(id: number): Promise<void> {
    await this.db.delete(attendance).where(eq(attendance.id, id));
  }

  // ==================== CHECK-IN/CHECK-OUT ====================

  async checkIn(employeeId: number, location?: Record<string, any>): Promise<Attendance> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if already checked in today
    const existing = await this.db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.employeeId, employeeId),
          gte(attendance.date, today),
          sql`DATE(${attendance.date}) = DATE(${now})`
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing record if no check-in
      if (!existing[0].checkIn) {
        return await this.updateAttendance(existing[0].id, { checkIn: now, location: location as any });
      }
      return existing[0];
    }

    // Create new attendance record
    return await this.createAttendance({
      employeeId,
      date: now,
      checkIn: now,
      location: location as any,
    });
  }

  async checkOut(attendanceId: number, location?: Record<string, any>): Promise<Attendance> {
    const now = new Date();
    return await this.updateAttendance(attendanceId, {
      checkOut: now,
      location: location as any,
    });
  }

  async getTodayAttendance(employeeId: number): Promise<Attendance | null> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [record] = await this.db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.employeeId, employeeId),
          gte(attendance.date, today)
        )
      )
      .orderBy(desc(attendance.date))
      .limit(1);

    return record || null;
  }

  // ==================== LIST OPERATIONS ====================

  async listAttendance(filters: AttendanceFilters = {}): Promise<{ records: Attendance[]; total: number }> {
    const conditions = [];

    if (filters.employeeId) {
      conditions.push(eq(attendance.employeeId, filters.employeeId));
    }
    if (filters.startDate && filters.endDate) {
      conditions.push(between(attendance.date, filters.startDate, filters.endDate));
    } else if (filters.startDate) {
      conditions.push(gte(attendance.date, filters.startDate));
    } else if (filters.endDate) {
      conditions.push(sql`${attendance.date} <= ${filters.endDate}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await this.db
      .select({ count: count() })
      .from(attendance)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const records = await this.db
      .select()
      .from(attendance)
      .where(whereClause)
      .orderBy(desc(attendance.date))
      .limit(filters.limit || 31)
      .offset(filters.offset || 0);

    return { records, total };
  }

  async listAttendanceWithDetails(filters: AttendanceFilters = {}): Promise<{
    records: Array<Attendance & {
      employeeName?: string | null;
      employeeDesignation?: string | null;
      employeeDepartment?: string | null;
      employeePhoto?: string | null;
    }>;
    total: number;
  }> {
    const conditions = [];

    if (filters.employeeId) {
      conditions.push(eq(attendance.employeeId, filters.employeeId));
    }
    if (filters.startDate && filters.endDate) {
      conditions.push(between(attendance.date, filters.startDate, filters.endDate));
    } else if (filters.startDate) {
      conditions.push(gte(attendance.date, filters.startDate));
    } else if (filters.endDate) {
      conditions.push(sql`${attendance.date} <= ${filters.endDate}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await this.db
      .select({ count: count() })
      .from(attendance)
      .leftJoin(employees, eq(attendance.employeeId, employees.id))
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const records = await this.db
      .select({
        id: attendance.id,
        employeeId: attendance.employeeId,
        date: attendance.date,
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        location: attendance.location,
        employeeName: profiles.fullName,
        employeeDesignation: employees.designation,
        employeeDepartment: employees.department,
        employeePhoto: employees.photoUrl,
      })
      .from(attendance)
      .leftJoin(employees, eq(attendance.employeeId, employees.id))
      .leftJoin(profiles, eq(employees.profileId, profiles.id))
      .where(whereClause)
      .orderBy(desc(attendance.date))
      .limit(filters.limit || 31)
      .offset(filters.offset || 0);

    return { records, total };
  }

  async getEmployeeAttendanceForMonth(
    employeeId: number,
    month: number,
    year: number
  ): Promise<Attendance[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return await this.db
      .select()
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

  async getMonthlyAttendanceReport(month: number, year: number): Promise<Attendance[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    return await this.db
      .select()
      .from(attendance)
      .where(
        and(
          gte(attendance.date, startDate),
          lt(attendance.date, endDate)
        )
      )
      .orderBy(attendance.employeeId, attendance.date);
  }

  // ==================== REPORTING ====================

  async getAttendanceReport(month: number, year: number): Promise<AttendanceReport[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const records = await this.db
      .select({
        employeeId: attendance.employeeId,
        date: attendance.date,
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        employeeName: profiles.fullName,
      })
      .from(attendance)
      .leftJoin(employees, eq(attendance.employeeId, employees.id))
      .leftJoin(profiles, eq(employees.profileId, profiles.id))
      .where(
        and(
          gte(attendance.date, startDate),
          lt(attendance.date, endDate)
        )
      )
      .orderBy(attendance.employeeId, attendance.date);

    // Group by employee and calculate stats
    const reportMap = new Map<number, AttendanceReport>();

    for (const record of records) {
      if (!reportMap.has(record.employeeId)) {
        reportMap.set(record.employeeId, {
          employeeId: record.employeeId,
          employeeName: record.employeeName || undefined,
          month,
          year,
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          lateDays: 0,
          halfDays: 0,
        });
      }

      const report = reportMap.get(record.employeeId)!;
      report.totalDays++;

      if (record.checkIn) {
        report.presentDays++;

        // Check if late (after 9:30 AM)
        const checkInTime = new Date(record.checkIn);
        if (checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 30)) {
          report.lateDays++;
        }

        // Check if half day (less than 4 hours)
        if (record.checkOut) {
          const diffHours = (new Date(record.checkOut).getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
          if (diffHours < 4) {
            report.halfDays++;
          }
        }
      } else {
        report.absentDays++;
      }
    }

    return Array.from(reportMap.values());
  }

  async getDailyAttendance(date: Date): Promise<DailyAttendanceRecord[]> {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

    return await this.db
      .select({
        id: attendance.id,
        employeeId: attendance.employeeId,
        date: attendance.date,
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        location: attendance.location,
        employeeName: profiles.fullName,
        employeeDesignation: employees.designation,
      })
      .from(attendance)
      .leftJoin(employees, eq(attendance.employeeId, employees.id))
      .leftJoin(profiles, eq(employees.profileId, profiles.id))
      .where(
        and(
          gte(attendance.date, startOfDay),
          lt(attendance.date, endOfDay)
        )
      )
      .orderBy(attendance.checkIn);
  }
}

// Singleton instance
export const attendanceRepository = new AttendanceRepository();
