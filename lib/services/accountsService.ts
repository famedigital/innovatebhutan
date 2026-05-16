import { accountsRepository, NewParty, NewAccount, NewPaymentEntry, NewJournalEntry, NewBankAccount } from "@/lib/repositories/accountsRepository";

export interface CreatePartyDTO {
  partyType: string;
  name: string;
  taxpayerId?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateAccountDTO {
  accountNumber: string;
  name: string;
  accountType: string;
  rootType: string;
  parentId?: number;
  isGroup?: boolean;
  taxRate?: number;
  notes?: string;
}

export interface CreatePaymentDTO {
  paymentType: string;
  partyType: string;
  partyId: number;
  amount: number;
  paidAmount: number;
  paymentMethod?: string;
  referenceNo?: string;
  referenceDate?: Date;
  referenceType?: string;
  referenceId?: number;
  bankAccountId?: number;
  postingDate?: Date;
  remarks?: string;
  projectId?: number;
}

export interface JournalEntryLine {
  accountId: number;
  debit: number;
  credit: number;
  partyType?: string;
  partyId?: number;
  remarks?: string;
}

export interface CreateJournalEntryDTO {
  postingDate: Date;
  voucherType: string;
  accounts: JournalEntryLine[];
  remarks?: string;
  userRemark?: string;
  fiscalYear?: string;
}

export class AccountsService {
  private repository = accountsRepository;

  async generatePublicId(prefix: string): Promise<string> {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  }

  async generatePaymentNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.repository.listPayments({ paymentType: 'receive' });
    const sequence = (count.total + 1).toString().padStart(4, '0');
    return `PAY-${year}-${sequence}`;
  }

  async generateVoucherNumber(voucherType: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = voucherType === 'journal_entry' ? 'JV' : 'BEV';
    const sequence = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}-${year}-${sequence}`;
  }

  async createParty(data: CreatePartyDTO) {
    const publicId = await this.generatePublicId('PTY');
    return await this.repository.createParty({
      publicId,
      partyType: data.partyType,
      name: data.name,
      taxpayerId: data.taxpayerId,
      address: data.address,
      city: data.city,
      phone: data.phone,
      email: data.email,
      metadata: data.metadata as any,
    });
  }

  async getPartyById(id: number) {
    return await this.repository.getPartyById(id);
  }

  async updateParty(id: number, data: Partial<CreatePartyDTO>) {
    return await this.repository.updateParty(id, data);
  }

  async listParties(filters: any = {}) {
    return await this.repository.listParties(filters);
  }

  async createAccount(data: CreateAccountDTO) {
    const publicId = await this.generatePublicId('ACC');
    return await this.repository.createAccount({
      publicId,
      accountNumber: data.accountNumber,
      name: data.name,
      accountType: data.accountType,
      rootType: data.rootType,
      parentId: data.parentId,
      isGroup: data.isGroup ?? false,
      taxRate: data.taxRate?.toString(),
      notes: data.notes,
    });
  }

  async getAccountById(id: number) {
    return await this.repository.getAccountById(id);
  }

  async updateAccount(id: number, data: Partial<CreateAccountDTO>) {
    return await this.repository.updateAccount(id, data);
  }

  async listAccounts(filters: any = {}) {
    return await this.repository.listAccounts(filters);
  }

  async createPayment(data: CreatePaymentDTO) {
    const publicId = await this.generatePublicId('PMT');
    const paymentNumber = await this.generatePaymentNumber();

    return await this.repository.createPayment({
      publicId,
      paymentNumber,
      paymentType: data.paymentType,
      partyType: data.partyType,
      partyId: data.partyId,
      amount: data.amount.toString(),
      paidAmount: data.paidAmount.toString(),
      outstandingAmount: (data.amount - data.paidAmount).toString(),
      paymentMethod: data.paymentMethod,
      referenceNo: data.referenceNo,
      referenceDate: data.referenceDate,
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      bankAccountId: data.bankAccountId,
      postingDate: data.postingDate ?? new Date(),
      remarks: data.remarks,
      projectId: data.projectId,
    });
  }

  async getPaymentById(id: number) {
    return await this.repository.getPaymentById(id);
  }

  async updatePaymentStatus(id: number, status: string) {
    return await this.repository.updatePaymentStatus(id, status);
  }

  async listPayments(filters: any = {}) {
    return await this.repository.listPayments(filters);
  }

  async createJournalEntry(data: CreateJournalEntryDTO) {
    const publicId = await this.generatePublicId('JNL');
    const voucherNo = await this.generateVoucherNumber(data.voucherType);

    const totalDebit = data.accounts.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = data.accounts.reduce((sum, line) => sum + line.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error("Debit and Credit must be equal");
    }

    const journalEntry = await this.repository.createJournalEntry({
      publicId,
      voucherNo,
      voucherType: data.voucherType,
      postingDate: data.postingDate,
      totalDebit: totalDebit.toString(),
      totalCredit: totalCredit.toString(),
      remarks: data.remarks,
      userRemark: data.userRemark,
      fiscalYear: data.fiscalYear,
    });

    for (const account of data.accounts) {
      await this.repository.addJournalEntryAccount({
        journalEntryId: journalEntry.id,
        accountId: account.accountId,
        debit: account.debit.toString(),
        credit: account.credit.toString(),
        partyType: account.partyType,
        partyId: account.partyId,
        remarks: account.remarks,
      });
    }

    return journalEntry;
  }

  async getJournalEntryById(id: number) {
    const journalEntry = await this.repository.getJournalEntryById(id);
    if (!journalEntry) return null;

    const accounts = await this.repository.getJournalEntryAccounts(journalEntry.id);

    return {
      ...journalEntry,
      accounts,
    };
  }

  async updateJournalEntryStatus(id: number, status: string) {
    return await this.repository.updateJournalEntryStatus(id, status);
  }

  async listJournalEntries(filters: any = {}) {
    return await this.repository.listJournalEntries(filters);
  }

  async getAgedReceivables(asOfDate?: Date) {
    return await this.repository.getAgedReceivables(asOfDate);
  }

  async getAgedPayables(asOfDate?: Date) {
    return await this.repository.getAgedPayables(asOfDate);
  }

  async getBankAccounts() {
    return await this.repository.getBankAccounts();
  }

  async createBankAccount(data: Omit<NewBankAccount, 'publicId'>) {
    const publicId = await this.generatePublicId('BNK');
    return await this.repository.createBankAccount({
      ...data,
      publicId,
    });
  }

  async getDefaultBankAccount() {
    return await this.repository.getDefaultBankAccount();
  }

  async getAccountBalance(accountId: number) {
    return await this.repository.getAccountBalance(accountId);
  }
}

export const accountsService = new AccountsService();
