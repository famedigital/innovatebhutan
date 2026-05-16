import { transactionRepository, type TransactionFilters } from "@/lib/repositories/transactionRepository";
import type { Transaction } from "@/lib/repositories/transactionRepository";
import { AuthorizationError, NotFoundError } from "@/lib/errors";

export type TransactionType = "INCOME" | "EXPENSE";
export type TransactionCategory = "service_revenue" | "product_sales" | "consulting_fees" | "amc_payment" | "project_payment" | "other_income" | "salary" | "rent" | "utilities" | "supplies" | "equipment" | "travel" | "marketing" | "software" | "insurance" | "taxes" | "other_expense";

export interface CreateTransactionDTO {
  type: TransactionType;
  amount: string;
  category: TransactionCategory;
  referenceId?: string;
  notes?: string;
  date?: Date;
}

export interface UpdateTransactionDTO {
  type?: TransactionType;
  amount?: string;
  category?: TransactionCategory;
  referenceId?: string;
  notes?: string;
  date?: Date;
}

export interface ReconcileTransactionDTO {
  action: "reconcile" | "unreconcile";
  notes?: string;
}

export class TransactionService {
  private repository = transactionRepository;

  // ==================== TRANSACTION OPERATIONS ====================

  async createTransaction(data: CreateTransactionDTO, userId?: string): Promise<Transaction> {
    const transaction = await this.repository.createTransaction({
      type: data.type,
      amount: data.amount,
      category: data.category,
      referenceId: data.referenceId,
      notes: data.notes,
      date: data.date || new Date(),
    });

    return transaction;
  }

  async getTransactionById(id: number): Promise<Transaction | null> {
    return await this.repository.getTransactionById(id);
  }

  async updateTransaction(id: number, data: UpdateTransactionDTO, userId?: string, userRole?: string): Promise<Transaction> {
    const transaction = await this.repository.getTransactionById(id);
    if (!transaction) {
      throw new NotFoundError("Transaction not found");
    }

    // 🔒 Authorization check - only admin/staff can modify transactions
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("You do not have permission to modify this transaction");
    }

    return await this.repository.updateTransaction(id, data);
  }

  async deleteTransaction(id: number, userId?: string, userRole?: string): Promise<void> {
    const transaction = await this.repository.getTransactionById(id);
    if (!transaction) {
      throw new NotFoundError("Transaction not found");
    }

    // 🔒 Only admins can delete transactions
    if (userRole !== "ADMIN") {
      throw new AuthorizationError("Only administrators can delete transactions");
    }

    await this.repository.deleteTransaction(id);
  }

  async listTransactions(filters: TransactionFilters = {}) {
    return await this.repository.listTransactions(filters);
  }

  // ==================== RECONCILIATION ====================

  async reconcileTransaction(id: number, action: ReconcileTransactionDTO, userId?: string, userRole?: string): Promise<Transaction> {
    const transaction = await this.repository.getTransactionById(id);
    if (!transaction) {
      throw new NotFoundError("Transaction not found");
    }

    // 🔒 Only admin/staff can reconcile transactions
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("You do not have permission to reconcile transactions");
    }

    // Add reconciliation note
    const note = action.notes ? action.notes : `Transaction ${action.action}d by ${userId}`;
    const updatedNotes = transaction.notes
      ? `${transaction.notes}\n\n[${new Date().toISOString()}] ${note}`
      : `[${new Date().toISOString()}] ${note}`;

    return await this.repository.updateTransaction(id, {
      notes: updatedNotes,
    });
  }

  // ==================== REFERENCE LOOKUP ====================

  async getTransactionsByReference(referenceId: string): Promise<Transaction[]> {
    return await this.repository.getTransactionsByReference(referenceId);
  }

  // ==================== DATE RANGE QUERIES ====================

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return await this.repository.getTransactionsByDateRange(startDate, endDate);
  }

  async getDailyTotals(date: Date): Promise<{ income: string; expense: string }> {
    return await this.repository.getDailyTotals(date);
  }

  async getMonthlyTotals(month: number, year: number): Promise<{ income: string; expense: string }> {
    return await this.repository.getMonthlyTotals(month, year);
  }

  // ==================== DASHBOARD STATS ====================

  async getDashboardStats() {
    return await this.repository.getTransactionStats();
  }

  // ==================== BUSINESS RULES ====================

  /**
   * Check if a transaction can be modified
   */
  canModifyTransaction(transaction: Transaction, userRole: string): boolean {
    // Admins and staff can modify any transaction
    if (userRole === "ADMIN" || userRole === "STAFF") {
      return true;
    }

    return false;
  }

  /**
   * Check if a transaction can be reconciled
   */
  canReconcileTransaction(transaction: Transaction, userRole: string): boolean {
    // Only admin/staff can reconcile
    return userRole === "ADMIN" || userRole === "STAFF";
  }

  /**
   * Get category group for reporting
   */
  getCategoryGroup(category: TransactionCategory): "income" | "expense" {
    const incomeCategories: TransactionCategory[] = [
      "service_revenue", "product_sales", "consulting_fees", "amc_payment", "project_payment", "other_income"
    ];
    return incomeCategories.includes(category) ? "income" : "expense";
  }
}

// Singleton instance
export const transactionService = new TransactionService();
