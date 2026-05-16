import { attendanceRepository } from "@/lib/repositories/attendanceRepository";
import type { Attendance } from "@/lib/repositories/attendanceRepository";
import type {
  CreateAttendanceInput,
  UpdateAttendanceInput,
  CheckInInput,
  CheckOutInput,
  AttendanceQueryInput,
  AttendanceReportInput,
} from "@/lib/validations/attendance";

// ==================== INTERFACES ====================

export interface AttendanceListResult {
  records: Array<Attendance & {
    employeeName?: string | null;
    employeeDesignation?: string | null;
    employeeDepartment?: string | null;
    employeePhoto?: string | null;
  }>;
  total: number;
  page: number;
  limit: number;
}

export interface CheckInResult {
  attendance: Attendance;
  message: string;
}

export interface CheckOutResult {
  attendance: Attendance;
  workHours?: number;
  message: string;
}

// ==================== SERVICE CLASS ====================

export class AttendanceService {
  private repository = attendanceRepository;

  // ==================== CRUD OPERATIONS ====================

  async createAttendance(data: CreateAttendanceInput): Promise<Attendance> {
    // Verify employee exists
    const { employeeService } = await import("@/lib/services/employeeService");
    const employee = await employeeService.getEmployeeById(data.employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    return await this.repository.createAttendance({
      ...data,
      date: data.date || new Date(),
    });
  }

  async getAttendanceById(id: number): Promise<Attendance | null> {
    return await this.repository.getAttendanceById(id);
  }

  async updateAttendance(id: number, data: UpdateAttendanceInput): Promise<Attendance> {
    const existing = await this.repository.getAttendanceById(id);
    if (!existing) {
      throw new Error("Attendance record not found");
    }

    return await this.repository.updateAttendance(id, data);
  }

  async deleteAttendance(id: number): Promise<void> {
    const existing = await this.repository.getAttendanceById(id);
    if (!existing) {
      throw new Error("Attendance record not found");
    }

    await this.repository.deleteAttendance(id);
  }

  // ==================== CHECK-IN/CHECK-OUT ====================

  async checkIn(data: CheckInInput): Promise<CheckInResult> {
    const { employeeService } = await import("@/lib/services/employeeService");
    const employee = await employeeService.getEmployeeById(data.employeeId);
    if (!employee) {
      throw new Error("Employee not found");
    }

    if (employee.status !== "active") {
      throw new Error("Cannot check in: employee is not active");
    }

    const attendance = await this.repository.checkIn(data.employeeId, data.location);

    // Check if this was a new check-in or already checked in
    const isNewCheckIn = attendance.checkIn && new Date(attendance.checkIn).getTime() > Date.now() - 60000; // Within last minute

    return {
      attendance,
      message: isNewCheckIn ? "Checked in successfully" : "Already checked in today",
    };
  }

  async checkOut(data: CheckOutInput): Promise<CheckOutResult> {
    const attendance = await this.repository.getAttendanceById(data.attendanceId);
    if (!attendance) {
      throw new Error("Attendance record not found");
    }

    if (!attendance.checkIn) {
      throw new Error("Cannot check out: no check-in record found");
    }

    if (attendance.checkOut) {
      throw new Error("Already checked out. Please create a new attendance record.");
    }

    const updated = await this.repository.checkOut(data.attendanceId, data.location);

    // Calculate work hours
    let workHours: number | undefined;
    if (attendance.checkIn && updated.checkOut) {
      const diffMs = new Date(updated.checkOut).getTime() - new Date(attendance.checkIn).getTime();
      workHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
    }

    return {
      attendance: updated,
      workHours,
      message: "Checked out successfully",
    };
  }

  async getTodayAttendance(employeeId: number): Promise<Attendance | null> {
    return await this.repository.getTodayAttendance(employeeId);
  }

  // ==================== LIST OPERATIONS ====================

  async listAttendance(query: AttendanceQueryInput): Promise<AttendanceListResult> {
    const offset = ((query.page || 1) - 1) * (query.limit || 31);

    const filters: Record<string, any> = {
      limit: query.limit || 31,
      offset,
    };

    if (query.employeeId) {
      filters.employeeId = query.employeeId;
    }
    if (query.startDate && query.endDate) {
      filters.startDate = query.startDate;
      filters.endDate = query.endDate;
    } else if (query.month && query.year) {
      filters.startDate = new Date(query.year, query.month - 1, 1);
      filters.endDate = new Date(query.year, query.month, 0, 23, 59, 59);
    }

    const result = await this.repository.listAttendanceWithDetails(filters);

    return {
      records: result.records,
      total: result.total,
      page: query.page || 1,
      limit: query.limit || 31,
    };
  }

  async getEmployeeAttendanceForMonth(employeeId: number, month: number, year: number): Promise<Attendance[]> {
    return await this.repository.getEmployeeAttendanceForMonth(employeeId, month, year);
  }

  async getDailyAttendance(date: Date) {
    return await this.repository.getDailyAttendance(date);
  }

  // ==================== REPORTING ====================

  async getAttendanceReport(query: AttendanceReportInput) {
    return await this.repository.getAttendanceReport(query.month, query.year);
  }

  async getMonthlyAttendanceReport(month: number, year: number): Promise<Attendance[]> {
    return await this.repository.getMonthlyAttendanceReport(month, year);
  }

  // ==================== VALIDATION HELPERS ====================

  async validateAttendanceAccess(attendanceId: number, requestingUserId: string): Promise<boolean> {
    // Admin can access all attendance
    // Staff can access attendance for their department
    // Employees can access their own attendance
    const attendance = await this.repository.getAttendanceById(attendanceId);
    if (!attendance) {
      return false;
    }

    // For now, allow all staff/admin to access
    return true;
  }
}

// Singleton instance
export const attendanceService = new AttendanceService();
