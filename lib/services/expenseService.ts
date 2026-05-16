import { expenseRepository, type ExpenseFilters } from "@/lib/repositories/expenseRepository";
import type { Expense } from "@/lib/repositories/expenseRepository";
import { AuthorizationError, NotFoundError } from "@/lib/errors";

export type ExpenseStatus = "pending" | "approved" | "rejected";
export type ExpenseCategory = "travel" | "accommodation" | "meals" | "supplies" | "equipment" | "transportation" | "utilities" | "communication" | "training" | "entertainment" | "medical" | "other";

export interface CreateExpenseDTO {
  employeeId?: number;
  amount: string;
  category: ExpenseCategory;
  description: string;
  receiptUrl?: string;
  status?: ExpenseStatus;
}

export interface UpdateExpenseDTO {
  amount?: string;
  category?: ExpenseCategory;
  description?: string;
  receiptUrl?: string;
  status?: ExpenseStatus;
}

export interface ExpenseActionDTO {
  action: "approve" | "reject";
}

export class ExpenseService {
  private repository = expenseRepository;

  // ==================== EXPENSE OPERATIONS ====================

  async createExpense(data: CreateExpenseDTO, userId?: string): Promise<Expense> {
    // Default status to pending if not provided
    const status = data.status || "pending";

    const expense = await this.repository.createExpense({
      employeeId: data.employeeId,
      amount: data.amount,
      category: data.category,
      description: data.description,
      receiptUrl: data.receiptUrl,
      status,
    });

    return expense;
  }

  async getExpenseById(id: number): Promise<Expense | null> {
    return await this.repository.getExpenseById(id);
  }

  async getExpenseWithDetails(id: number): Promise<Expense & { employeeName?: string; employeeEmail?: string } | null> {
    const expense = await this.repository.getExpenseWithDetails(id);
    if (!expense) {
      throw new NotFoundError("Expense not found");
    }
    return expense;
  }

  async updateExpense(id: number, data: UpdateExpenseDTO, userId?: string, userRole?: string): Promise<Expense> {
    const expense = await this.repository.getExpenseById(id);
    if (!expense) {
      throw new NotFoundError("Expense not found");
    }

    // 🔒 Authorization check - only admin/staff can modify expenses
    // Employees can only modify their own pending expenses
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("You do not have permission to modify this expense");
    }

    // Validate status transitions
    if (data.status && data.status !== expense.status) {
      this.validateStatusTransition(expense.status as ExpenseStatus, data.status, userRole);
    }

    return await this.repository.updateExpense(id, data);
  }

  async deleteExpense(id: number, userId?: string, userRole?: string): Promise<void> {
    const expense = await this.repository.getExpenseById(id);
    if (!expense) {
      throw new NotFoundError("Expense not found");
    }

    // 🔒 Only admins can delete expenses
    if (userRole !== "ADMIN") {
      throw new AuthorizationError("Only administrators can delete expenses");
    }

    await this.repository.deleteExpense(id);
  }

  async listExpenses(filters: ExpenseFilters = {}) {
    return await this.repository.listExpensesWithDetails(filters);
  }

  // ==================== APPROVAL ACTIONS ====================

  async processExpenseAction(id: number, action: ExpenseActionDTO, userId?: string, userRole?: string): Promise<Expense> {
    const expense = await this.repository.getExpenseById(id);
    if (!expense) {
      throw new NotFoundError("Expense not found");
    }

    // 🔒 Only admin/staff can approve/reject expenses
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("You do not have permission to approve or reject expenses");
    }

    // Can only act on pending expenses
    if (expense.status !== "pending") {
      throw new Error(`Cannot ${action.action} an expense with status "${expense.status}"`);
    }

    const newStatus: ExpenseStatus = action.action === "approve" ? "approved" : "rejected";

    // Update expense with new status
    const updatedExpense = await this.repository.updateExpense(id, {
      status: newStatus,
    });

    return updatedExpense;
  }

  // ==================== STATUS TRANSITIONS ====================

  private validateStatusTransition(currentStatus: ExpenseStatus, newStatus: ExpenseStatus, userRole?: string): void {
    const validTransitions: Record<ExpenseStatus, ExpenseStatus[]> = {
      pending: ["approved", "rejected"],
      approved: [], // Terminal state
      rejected: ["pending"], // Can be resubmitted
    };

    // Admins can override transitions
    if (userRole === "ADMIN") {
      return;
    }

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Cannot transition from ${currentStatus} to ${newStatus}. Valid transitions: ${allowed.join(", ") || "none"}`
      );
    }
  }

  // ==================== EMPLOYEE EXPENSES ====================

  async getEmployeeExpenses(employeeId: number, limit = 10): Promise<Expense[]> {
    return await this.repository.getExpensesByEmployeeId(employeeId, limit);
  }

  async getEmployeePendingTotal(employeeId: number): Promise<string> {
    return await this.repository.getEmployeePendingExpensesTotal(employeeId);
  }

  // ==================== DASHBOARD STATS ====================

  async getDashboardStats() {
    return await this.repository.getExpenseStats();
  }

  // ==================== BUSINESS RULES ====================

  /**
   * Check if an expense can be modified
   */
  canModifyExpense(expense: Expense, userRole: string): boolean {
    // Admins and staff can modify any expense
    if (userRole === "ADMIN" || userRole === "STAFF") {
      return true;
    }

    // Only pending expenses can be modified
    if (expense.status !== "pending") {
      return false;
    }

    return false;
  }

  /**
   * Check if an expense can be approved
   */
  canApproveExpense(expense: Expense, userRole: string): boolean {
    // Only admin/staff can approve
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      return false;
    }

    // Only pending expenses can be approved
    return expense.status === "pending";
  }
}

// Singleton instance
export const expenseService = new ExpenseService();
