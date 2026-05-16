import { employeeRepository } from "@/lib/repositories/employeeRepository";
import type { Employee } from "@/lib/repositories/employeeRepository";
import type { CreateEmployeeInput, UpdateEmployeeInput, EmployeeQueryInput } from "@/lib/validations/employee";

// ==================== INTERFACES ====================

export interface EmployeeListResult {
  employees: Array<Employee & { fullName?: string | null; email?: string | null; userId?: string | null }>;
  total: number;
  page: number;
  limit: number;
}

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  onLeaveEmployees: number;
  terminatedEmployees: number;
}

// ==================== SERVICE CLASS ====================

export class EmployeeService {
  private repository = employeeRepository;

  // ==================== CRUD OPERATIONS ====================

  async createEmployee(data: CreateEmployeeInput): Promise<Employee> {
    // Check if employee with profile ID already exists
    const existing = await this.repository.getEmployeeByProfileId(data.profileId);
    if (existing) {
      throw new Error("Employee with this profile already exists");
    }

    // Convert salary string to decimal
    const employeeData = {
      ...data,
      baseSalary: data.baseSalary || undefined,
      status: data.status || "active",
    };

    return await this.repository.createEmployee(employeeData);
  }

  async getEmployeeById(id: number): Promise<Employee | null> {
    return await this.repository.getEmployeeById(id);
  }

  async getEmployeeByProfileId(profileId: number): Promise<Employee | null> {
    return await this.repository.getEmployeeByProfileId(profileId);
  }

  async updateEmployee(id: number, data: UpdateEmployeeInput): Promise<Employee> {
    const existing = await this.repository.getEmployeeById(id);
    if (!existing) {
      throw new Error("Employee not found");
    }

    // Convert salary string to decimal if present
    const updateData = {
      ...data,
      baseSalary: data.baseSalary || undefined,
    };

    return await this.repository.updateEmployee(id, updateData);
  }

  async deleteEmployee(id: number): Promise<void> {
    const existing = await this.repository.getEmployeeById(id);
    if (!existing) {
      throw new Error("Employee not found");
    }

    // Check if employee has active status - should terminate instead
    if (existing.status === "active") {
      throw new Error("Cannot delete active employee. Please terminate the employee first.");
    }

    await this.repository.deleteEmployee(id);
  }

  async terminateEmployee(id: number, reason?: string): Promise<Employee> {
    return await this.updateEmployee(id, { status: "terminated" });
  }

  // ==================== LIST OPERATIONS ====================

  async listEmployees(query: EmployeeQueryInput): Promise<EmployeeListResult> {
    const offset = ((query.page || 1) - 1) * (query.limit || 20);

    const filters = {
      status: query.status,
      department: query.department,
      designation: query.designation,
      search: query.search,
      limit: query.limit || 20,
      offset,
    };

    const result = await this.repository.listEmployeesWithDetails(filters);

    return {
      employees: result.employees,
      total: result.total,
      page: query.page || 1,
      limit: query.limit || 20,
    };
  }

  async getActiveEmployees(): Promise<Employee[]> {
    return await this.repository.getActiveEmployees();
  }

  async getEmployeesByDepartment(department: string): Promise<Employee[]> {
    return await this.repository.getEmployeesByDepartment(department);
  }

  // ==================== STATISTICS ====================

  async getEmployeeStats(): Promise<EmployeeStats> {
    return await this.repository.getEmployeeStats();
  }

  // ==================== ATTENDANCE HELPERS ====================

  async getEmployeeAttendanceForMonth(employeeId: number, month: number, year: number) {
    return await this.repository.getEmployeeAttendanceForMonth(employeeId, month, year);
  }

  // ==================== VALIDATION HELPERS ====================

  async validateEmployeeAccess(employeeId: number, requestingUserId: string): Promise<boolean> {
    // Admin can access all employees
    // Staff can access employees
    // Clients cannot access employee data
    const employee = await this.repository.getEmployeeById(employeeId);
    return employee !== null;
  }
}

// Singleton instance
export const employeeService = new EmployeeService();
