import { db } from "@/db";
import { expenses, employees, profiles } from "@/db/schema";
import { eq, and, desc, sql, count, like, or } from "drizzle-orm";

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

export interface ExpenseFilters {
  status?: string;
  category?: string;
  employeeId?: number;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export class ExpenseRepository {
  private db = db;

  // ==================== EXPENSE CRUD ====================

  async createExpense(data: NewExpense): Promise<Expense> {
    const [expense] = await this.db.insert(expenses).values(data).returning();
    return expense;
  }

  async getExpenseById(id: number): Promise<Expense | null> {
    const [expense] = await this.db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
    return expense || null;
  }

  async getExpenseWithDetails(id: number): Promise<Expense & { employeeName?: string; employeeEmail?: string } | null> {
    const [expense] = await this.db
      .select({
        id: expenses.id,
        employeeId: expenses.employeeId,
        amount: expenses.amount,
        category: expenses.category,
        description: expenses.description,
        receiptUrl: expenses.receiptUrl,
        status: expenses.status,
        createdAt: expenses.createdAt,
        employeeName: profiles.fullName,
      })
      .from(expenses)
      .leftJoin(employees, eq(expenses.employeeId, employees.id))
      .leftJoin(profiles, eq(employees.profileId, profiles.id))
      .where(eq(expenses.id, id))
      .limit(1);

    return expense ? {
      ...expense,
      employeeName: expense.employeeName ?? undefined,
    } : null;
  }

  async updateExpense(id: number, data: Partial<NewExpense>): Promise<Expense> {
    const [expense] = await this.db
      .update(expenses)
      .set(data)
      .where(eq(expenses.id, id))
      .returning();
    return expense;
  }

  async deleteExpense(id: number): Promise<void> {
    await this.db.delete(expenses).where(eq(expenses.id, id));
  }

  async listExpenses(filters: ExpenseFilters = {}): Promise<{ expenses: Expense[]; total: number }> {
    const conditions: any[] = [];

    if (filters.status) {
      conditions.push(eq(expenses.status, filters.status));
    }
    if (filters.category) {
      conditions.push(eq(expenses.category, filters.category));
    }
    if (filters.employeeId) {
      conditions.push(eq(expenses.employeeId, filters.employeeId));
    }
    if (filters.search) {
      conditions.push(
        like(expenses.description, `%${filters.search}%`)
      );
    }
    if (filters.dateFrom) {
      conditions.push(sql`${expenses.createdAt} >= ${filters.dateFrom}`);
    }
    if (filters.dateTo) {
      conditions.push(sql`${expenses.createdAt} <= ${filters.dateTo}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(expenses)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Fetch expenses
    const expensesData = await this.db
      .select()
      .from(expenses)
      .where(whereClause)
      .orderBy(desc(expenses.createdAt))
      .limit(filters.limit || 20)
      .offset(filters.offset || 0);

    return { expenses: expensesData, total };
  }

  async listExpensesWithDetails(filters: ExpenseFilters = {}) {
    const conditions: any[] = [];

    if (filters.status) {
      conditions.push(eq(expenses.status, filters.status));
    }
    if (filters.category) {
      conditions.push(eq(expenses.category, filters.category));
    }
    if (filters.employeeId) {
      conditions.push(eq(expenses.employeeId, filters.employeeId));
    }
    if (filters.search) {
      conditions.push(
        like(expenses.description, `%${filters.search}%`)
      );
    }
    if (filters.dateFrom) {
      conditions.push(sql`${expenses.createdAt} >= ${filters.dateFrom}`);
    }
    if (filters.dateTo) {
      conditions.push(sql`${expenses.createdAt} <= ${filters.dateTo}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const expensesData = await this.db
      .select({
        id: expenses.id,
        employeeId: expenses.employeeId,
        amount: expenses.amount,
        category: expenses.category,
        description: expenses.description,
        receiptUrl: expenses.receiptUrl,
        status: expenses.status,
        createdAt: expenses.createdAt,
        employeeName: profiles.fullName,
      })
      .from(expenses)
      .leftJoin(employees, eq(expenses.employeeId, employees.id))
      .leftJoin(profiles, eq(employees.profileId, profiles.id))
      .where(whereClause)
      .orderBy(desc(expenses.createdAt))
      .limit(filters.limit || 20)
      .offset(filters.offset || 0);

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(expenses)
      .where(whereClause);

    return {
      expenses: expensesData.map(e => ({
        ...e,
        employeeName: e.employeeName ?? undefined,
      })),
      total: totalResult[0]?.count || 0,
    };
  }

  // ==================== STATS ====================

  async getExpenseStats() {
    const [statusStats, categoryStats, totalAmount, pendingAmount] = await Promise.all([
      this.db
        .select({
          status: expenses.status,
          count: count(),
        })
        .from(expenses)
        .groupBy(expenses.status),

      this.db
        .select({
          category: expenses.category,
          count: count(),
        })
        .from(expenses)
        .groupBy(expenses.category),

      this.db
        .select({
          total: sql<number>`SUM(COALESCE(${expenses.amount}, 0))`,
        })
        .from(expenses),

      this.db
        .select({
          total: sql<number>`SUM(COALESCE(${expenses.amount}, 0))`,
        })
        .from(expenses)
        .where(eq(expenses.status, 'pending')),
    ]);

    return {
      byStatus: statusStats.reduce((acc, item) => {
        acc[item.status || 'unknown'] = Number(item.count);
        return acc;
      }, {} as Record<string, number>),
      byCategory: categoryStats.reduce((acc, item) => {
        acc[item.category || 'unknown'] = Number(item.count);
        return acc;
      }, {} as Record<string, number>),
      totalAmount: totalAmount[0]?.total || "0",
      pendingAmount: pendingAmount[0]?.total || "0",
    };
  }

  // ==================== EMPLOYEE EXPENSES ====================

  async getExpensesByEmployeeId(employeeId: number, limit = 10): Promise<Expense[]> {
    return await this.db
      .select()
      .from(expenses)
      .where(eq(expenses.employeeId, employeeId))
      .orderBy(desc(expenses.createdAt))
      .limit(limit);
  }

  async getEmployeePendingExpensesTotal(employeeId: number): Promise<string> {
    const [result] = await this.db
      .select({
        total: sql<number>`SUM(COALESCE(${expenses.amount}, 0))`,
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.employeeId, employeeId),
          eq(expenses.status, 'pending')
        )
      );
    return result?.total || "0";
  }
}

// Singleton instance
export const expenseRepository = new ExpenseRepository();
