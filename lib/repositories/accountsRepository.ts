import { db } from "@/db";
import {
  parties,
  accounts,
  paymentEntries,
  journalEntries,
  journalEntryAccounts,
  glEntries,
  accountsReceivable,
  accountsPayable,
  bankAccounts,
  clients
} from "@/db/schema";
import { eq, and, desc, sql, count, gte, lte, isNull } from "drizzle-orm";

export type Party = typeof parties.$inferSelect;
export type NewParty = typeof parties.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type PaymentEntry = typeof paymentEntries.$inferSelect;
export type NewPaymentEntry = typeof paymentEntries.$inferInsert;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type JournalEntryAccount = typeof journalEntryAccounts.$inferSelect;
export type NewJournalEntryAccount = typeof journalEntryAccounts.$inferInsert;
export type BankAccount = typeof bankAccounts.$inferSelect;
export type NewBankAccount = typeof bankAccounts.$inferInsert;

export interface PartyFilters {
  partyType?: string;
  search?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export interface AccountFilters {
  accountType?: string;
  rootType?: string;
  isGroup?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface PaymentFilters {
  paymentType?: string;
  partyType?: string;
  status?: string;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export interface JournalEntryFilters {
  status?: string;
  fromDate?: Date;
  toDate?: Date;
  fiscalYear?: string;
  limit?: number;
  offset?: number;
}

export interface AgedReceivablesRow {
  partyId: number;
  partyName: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  daysAbove90: number;
}

export interface AgedPayablesRow {
  partyId: number;
  partyName: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  current: number;
  days30: number;
  days60: number;
  days90: number;
  daysAbove90: number;
}

export class AccountsRepository {
  private db = db;

  async createParty(data: NewParty): Promise<Party> {
    const [party] = await this.db.insert(parties).values(data).returning();
    return party;
  }

  async getPartyById(id: number): Promise<Party | null> {
    const [party] = await this.db.select().from(parties).where(eq(parties.id, id)).limit(1);
    return party || null;
  }

  async getPartyByPublicId(publicId: string): Promise<Party | null> {
    const [party] = await this.db.select().from(parties).where(eq(parties.publicId, publicId)).limit(1);
    return party || null;
  }

  async updateParty(id: number, data: Partial<NewParty>): Promise<Party> {
    const [party] = await this.db
      .update(parties)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(parties.id, id))
      .returning();
    return party;
  }

  async listParties(filters: PartyFilters = {}): Promise<{ parties: Party[]; total: number }> {
    const conditions = [];

    if (filters.partyType) {
      conditions.push(eq(parties.partyType, filters.partyType));
    }
    if (filters.isActive !== undefined) {
      conditions.push(eq(parties.isActive, filters.isActive));
    }
    if (filters.search) {
      conditions.push(
        sql`(${parties.name} ILIKE ${'%' + filters.search + '%'} OR ${parties.email} ILIKE ${'%' + filters.search + '%'})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await this.db
      .select({ count: count() })
      .from(parties)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const partiesData = await this.db
      .select()
      .from(parties)
      .where(whereClause)
      .orderBy(desc(parties.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return { parties: partiesData, total };
  }

  async createAccount(data: NewAccount): Promise<Account> {
    const [account] = await this.db.insert(accounts).values(data).returning();
    return account;
  }

  async getAccountById(id: number): Promise<Account | null> {
    const [account] = await this.db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
    return account || null;
  }

  async getAccountByNumber(accountNumber: string): Promise<Account | null> {
    const [account] = await this.db
      .select()
      .from(accounts)
      .where(eq(accounts.accountNumber, accountNumber))
      .limit(1);
    return account || null;
  }

  async updateAccount(id: number, data: Partial<NewAccount>): Promise<Account> {
    const [account] = await this.db
      .update(accounts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(accounts.id, id))
      .returning();
    return account;
  }

  async updateAccountBalance(id: number, balance: number): Promise<Account> {
    const [account] = await this.db
      .update(accounts)
      .set({ balance: balance.toString(), updatedAt: new Date() })
      .where(eq(accounts.id, id))
      .returning();
    return account;
  }

  async listAccounts(filters: AccountFilters = {}): Promise<{ accounts: Account[]; total: number }> {
    const conditions = [eq(accounts.isActive, true)];

    if (filters.accountType) {
      conditions.push(eq(accounts.accountType, filters.accountType));
    }
    if (filters.rootType) {
      conditions.push(eq(accounts.rootType, filters.rootType));
    }
    if (filters.isGroup !== undefined) {
      conditions.push(eq(accounts.isGroup, filters.isGroup));
    }
    if (filters.search) {
      conditions.push(
        sql`(${accounts.name} ILIKE ${'%' + filters.search + '%'} OR ${accounts.accountNumber} ILIKE ${'%' + filters.search + '%'})`
      );
    }

    const whereClause = and(...conditions);

    const totalResult = await this.db
      .select({ count: count() })
      .from(accounts)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const accountsData = await this.db
      .select()
      .from(accounts)
      .where(whereClause)
      .orderBy(accounts.accountNumber)
      .limit(filters.limit || 100)
      .offset(filters.offset || 0);

    return { accounts: accountsData, total };
  }

  async createPayment(data: NewPaymentEntry): Promise<PaymentEntry> {
    const [payment] = await this.db.insert(paymentEntries).values(data).returning();
    return payment;
  }

  async getPaymentById(id: number): Promise<PaymentEntry | null> {
    const [payment] = await this.db
      .select()
      .from(paymentEntries)
      .where(eq(paymentEntries.id, id))
      .limit(1);
    return payment || null;
  }

  async getPaymentByPublicId(publicId: string): Promise<PaymentEntry | null> {
    const [payment] = await this.db
      .select()
      .from(paymentEntries)
      .where(eq(paymentEntries.publicId, publicId))
      .limit(1);
    return payment || null;
  }

  async updatePayment(id: number, data: Partial<NewPaymentEntry>): Promise<PaymentEntry> {
    const [payment] = await this.db
      .update(paymentEntries)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(paymentEntries.id, id))
      .returning();
    return payment;
  }

  async updatePaymentStatus(id: number, status: string): Promise<PaymentEntry> {
    const [payment] = await this.db
      .update(paymentEntries)
      .set({ status, updatedAt: new Date() })
      .where(eq(paymentEntries.id, id))
      .returning();
    return payment;
  }

  async listPayments(filters: PaymentFilters = {}): Promise<{ payments: PaymentEntry[]; total: number }> {
    const conditions = [];

    if (filters.paymentType) {
      conditions.push(eq(paymentEntries.paymentType, filters.paymentType));
    }
    if (filters.partyType) {
      conditions.push(eq(paymentEntries.partyType, filters.partyType));
    }
    if (filters.status) {
      conditions.push(eq(paymentEntries.status, filters.status));
    }
    if (filters.fromDate) {
      conditions.push(gte(paymentEntries.postingDate, filters.fromDate));
    }
    if (filters.toDate) {
      conditions.push(lte(paymentEntries.postingDate, filters.toDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await this.db
      .select({ count: count() })
      .from(paymentEntries)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const paymentsData = await this.db
      .select()
      .from(paymentEntries)
      .where(whereClause)
      .orderBy(desc(paymentEntries.postingDate))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return { payments: paymentsData, total };
  }

  async createJournalEntry(data: NewJournalEntry): Promise<JournalEntry> {
    const [journalEntry] = await this.db.insert(journalEntries).values(data).returning();
    return journalEntry;
  }

  async getJournalEntryById(id: number): Promise<JournalEntry | null> {
    const [journalEntry] = await this.db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.id, id))
      .limit(1);
    return journalEntry || null;
  }

  async getJournalEntryByVoucher(voucherNo: string): Promise<JournalEntry | null> {
    const [journalEntry] = await this.db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.voucherNo, voucherNo))
      .limit(1);
    return journalEntry || null;
  }

  async updateJournalEntry(id: number, data: Partial<NewJournalEntry>): Promise<JournalEntry> {
    const [journalEntry] = await this.db
      .update(journalEntries)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(journalEntries.id, id))
      .returning();
    return journalEntry;
  }

  async updateJournalEntryStatus(id: number, status: string): Promise<JournalEntry> {
    const [journalEntry] = await this.db
      .update(journalEntries)
      .set({ status, updatedAt: new Date() })
      .where(eq(journalEntries.id, id))
      .returning();
    return journalEntry;
  }

  async listJournalEntries(filters: JournalEntryFilters = {}): Promise<{ journalEntries: JournalEntry[]; total: number }> {
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(journalEntries.status, filters.status));
    }
    if (filters.fromDate) {
      conditions.push(gte(journalEntries.postingDate, filters.fromDate));
    }
    if (filters.toDate) {
      conditions.push(lte(journalEntries.postingDate, filters.toDate));
    }
    if (filters.fiscalYear) {
      conditions.push(eq(journalEntries.fiscalYear, filters.fiscalYear));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await this.db
      .select({ count: count() })
      .from(journalEntries)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    const journalEntriesData = await this.db
      .select()
      .from(journalEntries)
      .where(whereClause)
      .orderBy(desc(journalEntries.postingDate))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return { journalEntries: journalEntriesData, total };
  }

  async addJournalEntryAccount(data: NewJournalEntryAccount): Promise<JournalEntryAccount> {
    const [jea] = await this.db.insert(journalEntryAccounts).values(data).returning();
    return jea;
  }

  async getJournalEntryAccounts(journalEntryId: number): Promise<JournalEntryAccount[]> {
    return await this.db
      .select({
        id: journalEntryAccounts.id,
        journalEntryId: journalEntryAccounts.journalEntryId,
        accountId: journalEntryAccounts.accountId,
        accountName: accounts.name,
        accountNumber: accounts.accountNumber,
        debit: journalEntryAccounts.debit,
        credit: journalEntryAccounts.credit,
        partyType: journalEntryAccounts.partyType,
        partyId: journalEntryAccounts.partyId,
        remarks: journalEntryAccounts.remarks,
      })
      .from(journalEntryAccounts)
      .innerJoin(accounts, eq(journalEntryAccounts.accountId, accounts.id))
      .where(eq(journalEntryAccounts.journalEntryId, journalEntryId));
  }

  async createGLEntry(data: typeof glEntries.$inferInsert): Promise<void> {
    await this.db.insert(glEntries).values(data);
  }

  async getAccountBalance(accountId: number): Promise<number> {
    const [result] = await this.db
      .select({
        debit: sql<number>`COALESCE(SUM(${glEntries.debit}), 0)`,
        credit: sql<number>`COALESCE(SUM(${glEntries.credit}), 0)`,
      })
      .from(glEntries)
      .where(eq(glEntries.account, accountId));

    const account = await this.getAccountById(accountId);
    if (!account) return 0;

    const debitTotal = Number(result?.debit || 0);
    const creditTotal = Number(result?.credit || 0);

    if (account.rootType === 'asset' || account.rootType === 'expense') {
      return debitTotal - creditTotal;
    }
    return creditTotal - debitTotal;
  }

  async getAgedReceivables(asOfDate: Date = new Date()): Promise<AgedReceivablesRow[]> {
    const current = new Date(asOfDate);
    const date30 = new Date(current);
    date30.setDate(date30.getDate() - 30);
    const date60 = new Date(current);
    date60.setDate(date60.getDate() - 60);
    const date90 = new Date(current);
    date90.setDate(date90.getDate() - 90);

    const arData = await this.db
      .select({
        partyId: accountsReceivable.partyId,
        partyName: parties.name,
        outstandingAmount: accountsReceivable.outstandingAmount,
        dueDate: accountsReceivable.dueDate,
      })
      .from(accountsReceivable)
      .innerJoin(parties, eq(accountsReceivable.partyId, parties.id))
      .where(sql`${accountsReceivable.outstandingAmount} > 0`);

    const grouped = new Map<number, AgedReceivablesRow>();

    for (const row of arData) {
      const outstanding = Number(row.outstandingAmount);
      const dueDate = new Date(row.dueDate);
      const daysOverdue = Math.floor((current.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (!grouped.has(row.partyId)) {
        grouped.set(row.partyId, {
          partyId: row.partyId,
          partyName: row.partyName,
          totalAmount: 0,
          paidAmount: 0,
          outstandingAmount: 0,
          current: 0,
          days30: 0,
          days60: 0,
          days90: 0,
          daysAbove90: 0,
        });
      }

      const bucket = grouped.get(row.partyId)!;
      bucket.totalAmount += outstanding;
      bucket.outstandingAmount += outstanding;

      if (daysOverdue <= 0) {
        bucket.current += outstanding;
      } else if (daysOverdue <= 30) {
        bucket.days30 += outstanding;
      } else if (daysOverdue <= 60) {
        bucket.days60 += outstanding;
      } else if (daysOverdue <= 90) {
        bucket.days90 += outstanding;
      } else {
        bucket.daysAbove90 += outstanding;
      }
    }

    return Array.from(grouped.values());
  }

  async getAgedPayables(asOfDate: Date = new Date()): Promise<AgedPayablesRow[]> {
    const current = new Date(asOfDate);

    const apData = await this.db
      .select({
        partyId: accountsPayable.partyId,
        partyName: parties.name,
        outstandingAmount: accountsPayable.outstandingAmount,
        dueDate: accountsPayable.dueDate,
      })
      .from(accountsPayable)
      .innerJoin(parties, eq(accountsPayable.partyId, parties.id))
      .where(sql`${accountsPayable.outstandingAmount} > 0`);

    const grouped = new Map<number, AgedPayablesRow>();

    for (const row of apData) {
      const outstanding = Number(row.outstandingAmount);
      const dueDate = new Date(row.dueDate);
      const daysOverdue = Math.floor((current.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (!grouped.has(row.partyId)) {
        grouped.set(row.partyId, {
          partyId: row.partyId,
          partyName: row.partyName,
          totalAmount: 0,
          paidAmount: 0,
          outstandingAmount: 0,
          current: 0,
          days30: 0,
          days60: 0,
          days90: 0,
          daysAbove90: 0,
        });
      }

      const bucket = grouped.get(row.partyId)!;
      bucket.totalAmount += outstanding;
      bucket.outstandingAmount += outstanding;

      if (daysOverdue <= 0) {
        bucket.current += outstanding;
      } else if (daysOverdue <= 30) {
        bucket.days30 += outstanding;
      } else if (daysOverdue <= 60) {
        bucket.days60 += outstanding;
      } else if (daysOverdue <= 90) {
        bucket.days90 += outstanding;
      } else {
        bucket.daysAbove90 += outstanding;
      }
    }

    return Array.from(grouped.values());
  }

  async createBankAccount(data: NewBankAccount): Promise<BankAccount> {
    const [bankAccount] = await this.db.insert(bankAccounts).values(data).returning();
    return bankAccount;
  }

  async getBankAccounts(): Promise<BankAccount[]> {
    return await this.db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.isActive, true))
      .orderBy(bankAccounts.isDefault, desc(bankAccounts.createdAt));
  }

  async getDefaultBankAccount(): Promise<BankAccount | null> {
    const [bankAccount] = await this.db
      .select()
      .from(bankAccounts)
      .where(and(eq(bankAccounts.isDefault, true), eq(bankAccounts.isActive, true)))
      .limit(1);
    return bankAccount || null;
  }
}

export const accountsRepository = new AccountsRepository();
