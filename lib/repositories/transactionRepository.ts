import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, and, desc, sql, count, like, or } from "drizzle-orm";

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export interface TransactionFilters {
  type?: string;
  category?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export class TransactionRepository {
  private db = db;

  // ==================== TRANSACTION CRUD ====================

  async createTransaction(data: NewTransaction): Promise<Transaction> {
    const [transaction] = await this.db.insert(transactions).values(data).returning();
    return transaction;
  }

  async getTransactionById(id: number): Promise<Transaction | null> {
    const [transaction] = await this.db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
    return transaction || null;
  }

  async updateTransaction(id: number, data: Partial<NewTransaction>): Promise<Transaction> {
    const [transaction] = await this.db
      .update(transactions)
      .set(data)
      .where(eq(transactions.id, id))
      .returning();
    return transaction;
  }

  async deleteTransaction(id: number): Promise<void> {
    await this.db.delete(transactions).where(eq(transactions.id, id));
  }

  async listTransactions(filters: TransactionFilters = {}): Promise<{ transactions: Transaction[]; total: number }> {
    const conditions: any[] = [];

    if (filters.type) {
      conditions.push(eq(transactions.type, filters.type));
    }
    if (filters.category) {
      conditions.push(eq(transactions.category, filters.category));
    }
    if (filters.search) {
      conditions.push(
        or(
          like(transactions.notes || '', `%${filters.search}%`),
          like(transactions.referenceId || '', `%${filters.search}%`)
        )
      );
    }
    if (filters.dateFrom) {
      conditions.push(sql`${transactions.date} >= ${filters.dateFrom}`);
    }
    if (filters.dateTo) {
      conditions.push(sql`${transactions.date} <= ${filters.dateTo}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(transactions)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Fetch transactions
    const transactionsData = await this.db
      .select()
      .from(transactions)
      .where(whereClause)
      .orderBy(desc(transactions.date))
      .limit(filters.limit || 20)
      .offset(filters.offset || 0);

    return { transactions: transactionsData, total };
  }

  // ==================== STATS ====================

  async getTransactionStats() {
    const [typeStats, categoryStats, incomeTotal, expenseTotal, netBalance] = await Promise.all([
      this.db
        .select({
          type: transactions.type,
          count: count(),
        })
        .from(transactions)
        .groupBy(transactions.type),

      this.db
        .select({
          category: transactions.category,
          count: count(),
        })
        .from(transactions)
        .groupBy(transactions.category),

      this.db
        .select({
          total: sql<number>`SUM(COALESCE(${transactions.amount}, 0))`,
        })
        .from(transactions)
        .where(eq(transactions.type, 'INCOME')),

      this.db
        .select({
          total: sql<number>`SUM(COALESCE(${transactions.amount}, 0))`,
        })
        .from(transactions)
        .where(eq(transactions.type, 'EXPENSE')),

      this.db
        .select({
          total: sql<number>`SUM(CASE WHEN ${transactions.type} = 'INCOME' THEN ${transactions.amount} ELSE -${transactions.amount} END)`,
        })
        .from(transactions),
    ]);

    return {
      byType: typeStats.reduce((acc, item) => {
        acc[item.type || 'unknown'] = Number(item.count);
        return acc;
      }, {} as Record<string, number>),
      byCategory: categoryStats.reduce((acc, item) => {
        acc[item.category || 'unknown'] = Number(item.count);
        return acc;
      }, {} as Record<string, number>),
      totalIncome: incomeTotal[0]?.total || "0",
      totalExpense: expenseTotal[0]?.total || "0",
      netBalance: netBalance[0]?.total || "0",
    };
  }

  // ==================== REFERENCE LOOKUP ====================

  async getTransactionsByReference(referenceId: string): Promise<Transaction[]> {
    return await this.db
      .select()
      .from(transactions)
      .where(eq(transactions.referenceId, referenceId))
      .orderBy(desc(transactions.date));
  }

  // ==================== DATE RANGE QUERIES ====================

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return await this.db
      .select()
      .from(transactions)
      .where(
        and(
          sql`${transactions.date} >= ${startDate}`,
          sql`${transactions.date} <= ${endDate}`
        )
      )
      .orderBy(desc(transactions.date));
  }

  async getDailyTotals(date: Date): Promise<{ income: string; expense: string }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [incomeResult, expenseResult] = await Promise.all([
      this.db
        .select({
          total: sql<number>`SUM(COALESCE(${transactions.amount}, 0))`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.type, 'INCOME'),
            sql`${transactions.date} >= ${startOfDay}`,
            sql`${transactions.date} <= ${endOfDay}`
          )
        ),

      this.db
        .select({
          total: sql<number>`SUM(COALESCE(${transactions.amount}, 0))`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.type, 'EXPENSE'),
            sql`${transactions.date} >= ${startOfDay}`,
            sql`${transactions.date} <= ${endOfDay}`
          )
        ),
    ]);

    return {
      income: incomeResult[0]?.total || "0",
      expense: expenseResult[0]?.total || "0",
    };
  }

  async getMonthlyTotals(month: number, year: number): Promise<{ income: string; expense: string }> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [incomeResult, expenseResult] = await Promise.all([
      this.db
        .select({
          total: sql<number>`SUM(COALESCE(${transactions.amount}, 0))`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.type, 'INCOME'),
            sql`${transactions.date} >= ${startDate}`,
            sql`${transactions.date} <= ${endDate}`
          )
        ),

      this.db
        .select({
          total: sql<number>`SUM(COALESCE(${transactions.amount}, 0))`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.type, 'EXPENSE'),
            sql`${transactions.date} >= ${startDate}`,
            sql`${transactions.date} <= ${endDate}`
          )
        ),
    ]);

    return {
      income: incomeResult[0]?.total || "0",
      expense: expenseResult[0]?.total || "0",
    };
  }
}

// Singleton instance
export const transactionRepository = new TransactionRepository();
