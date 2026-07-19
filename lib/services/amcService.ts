import { amcRepository, type AMCFilters, type AMCStats } from "@/lib/repositories/amcRepository";
import type { AMC } from "@/lib/repositories/amcRepository";
import { notificationService } from "@/lib/services/notificationService";
import { invoiceService } from "@/lib/services/invoiceService";
import { clientRepository } from "@/lib/repositories/clientRepository";
import {
  buildQuotationLineItems,
  buildQuotationNotes,
  computeRenewalSteps,
  getRenewalPipeline,
  withRenewalPipeline,
  type AmcRenewalPipeline,
  type RancelabRemittance,
} from "@/lib/amc/renewal";

export type AMCStatus = "active" | "expiring" | "expired" | "cancelled";

export interface CreateAMCDTO {
  clientId: number;
  serviceId?: number;
  contractNumber: string;
  startDate: Date;
  endDate: Date;
  amount: string;
  hardwareDetails?: Record<string, any>;
  servicesIncluded?: string[];
  notes?: string;
}

export interface UpdateAMCDTO {
  serviceId?: number;
  contractNumber?: string;
  startDate?: Date;
  endDate?: Date;
  amount?: string;
  hardwareDetails?: Record<string, any>;
  servicesIncluded?: string[];
  notes?: string;
  status?: AMCStatus;
}

export interface RenewAMCDTO {
  startDate: Date;
  endDate: Date;
  amount: string;
  copyHardwareDetails?: boolean;
  copyServicesIncluded?: boolean;
  notes?: string;
}

// 30-day threshold for "expiring" status (per user requirement)
const EXPIRING_THRESHOLD_DAYS = 30;

export class AMCService {
  private repository = amcRepository;

  // ==================== AMC CRUD ====================

  async createAMC(data: CreateAMCDTO): Promise<AMC> {
    // Validate dates
    this.validateDates(data.startDate, data.endDate);

    // Generate public ID
    const publicId = this.generatePublicId();

    // Calculate initial status
    const status = this.calculateStatus(data.endDate);

    const amc = await this.repository.createAMC({
      publicId,
      clientId: data.clientId,
      serviceId: data.serviceId,
      contractNumber: data.contractNumber,
      startDate: data.startDate,
      endDate: data.endDate,
      amount: data.amount,
      hardwareDetails: data.hardwareDetails,
      servicesIncluded: data.servicesIncluded,
      notes: data.notes,
      status,
    });

    return amc;
  }

  async getAMCById(id: number): Promise<AMC | null> {
    return await this.repository.getAMCById(id);
  }

  async getAMCByPublicId(publicId: string): Promise<AMC | null> {
    return await this.repository.getAMCByPublicId(publicId);
  }

  async updateAMC(id: number, data: UpdateAMCDTO): Promise<AMC> {
    const existing = await this.repository.getAMCById(id);
    if (!existing) {
      throw new Error("AMC not found");
    }

    // Validate dates if both are provided
    const newStartDate = data.startDate || existing.startDate;
    const newEndDate = data.endDate || existing.endDate;
    if (data.startDate || data.endDate) {
      this.validateDates(newStartDate, newEndDate);
    }

    // Recalculate status if dates changed
    let status = data.status;
    if (data.startDate || data.endDate) {
      status = this.calculateStatus(newEndDate);
    }

    return await this.repository.updateAMC(id, {
      ...data,
      status,
    });
  }

  async deleteAMC(id: number): Promise<void> {
    const amc = await this.repository.getAMCById(id);
    if (!amc) {
      throw new Error("AMC not found");
    }

    // Check if this AMC has been renewed
    if (amc.renewedTo) {
      throw new Error("Cannot delete an AMC that has been renewed. Cancel it instead.");
    }

    await this.repository.deleteAMC(id);
  }

  async listAMCs(filters: AMCFilters = {}) {
    const result = await this.repository.listAMCsWithDetails(filters);

    // Derive display status from endDate in-memory (no per-row DB writes — those caused Vercel 504s)
    const amcs = result.amcs.map((amc) => {
      if (amc.status === "cancelled" || amc.renewedTo) return amc;
      return { ...amc, status: this.calculateStatus(amc.endDate) };
    });

    return { ...result, amcs };
  }

  // ==================== STATUS MANAGEMENT ====================

  async updateAMCStatus(id: number, status: AMCStatus): Promise<AMC> {
    const amc = await this.repository.getAMCById(id);
    if (!amc) {
      throw new Error("AMC not found");
    }

    // Validate status transition
    this.validateStatusTransition(amc.status as AMCStatus, status);

    return await this.repository.updateAMCStatus(id, status);
  }

  /**
   * Calculate AMC status based on end date
   * - expired: end date is in the past
   * - expiring: end date is within 30 days
   * - active: end date is more than 30 days away
   */
  calculateStatus(endDate: Date | string): AMCStatus {
    const end = typeof endDate === "string" ? new Date(endDate) : endDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysUntilExpiry = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return "expired";
    if (daysUntilExpiry <= EXPIRING_THRESHOLD_DAYS) return "expiring";
    return "active";
  }

  /**
   * Update statuses for all active AMCs based on current date
   * Call this periodically (e.g., daily cron job)
   * Sends notifications for contracts becoming expiring or expired
   */
  async updateAllAMCStatuses(): Promise<{ updated: number }> {
    const [active, expiring] = await Promise.all([
      this.repository.listAMCs({ status: "active", limit: 1000 }),
      this.repository.listAMCs({ status: "expiring", limit: 1000 }),
    ]);
    const candidates = [...active.amcs, ...expiring.amcs];
    let updated = 0;

    for (const amc of candidates) {
      if (amc.status === "cancelled") continue;
      const newStatus = this.calculateStatus(amc.endDate);
      if (newStatus !== amc.status) {
        await this.repository.updateAMCStatus(amc.id, newStatus);
        updated++;
        await this.notifyAMCStatusChange(amc, newStatus);
      }
    }

    return { updated };
  }

  /**
   * Send notifications when AMC status changes
   */
  private async notifyAMCStatusChange(amc: AMC, newStatus: string): Promise<void> {
    // Get admin profile IDs (placeholder - should fetch from database)
    const adminProfileIds = await this.getAdminProfileIds();

    if (newStatus === "expiring") {
      const daysUntilExpiry = this.getDaysUntilExpiry(amc);
      await notificationService.notifyAMCExpiring(
        adminProfileIds,
        `Client #${amc.clientId}`,
        amc.contractNumber || "Unknown",
        new Date(amc.endDate),
        daysUntilExpiry
      );
    } else if (newStatus === "expired") {
      await notificationService.notifyAMCExpired(
        adminProfileIds,
        `Client #${amc.clientId}`,
        amc.contractNumber || "Unknown",
        new Date(amc.endDate)
      );
    }
  }

  /**
   * Get profile IDs of admin users who should receive AMC notifications
   * This is a placeholder - implement based on your auth setup
   */
  private async getAdminProfileIds(): Promise<number[]> {
    // TODO: Implement actual admin profile lookup
    // For now, return empty array to prevent errors
    // In production, you would:
    // 1. Query profiles table where role = 'ADMIN'
    // 2. Return their integer IDs
    return [];
  }

  /**
   * Get all AMCs expiring within the threshold
   */
  async getExpiringAMCs(daysThreshold: number = EXPIRING_THRESHOLD_DAYS) {
    return await this.repository.getExpiringAMCsWithDetails(daysThreshold);
  }

  // ==================== RENEWAL MANAGEMENT ====================

  async getRenewalStatus(amcId: number) {
    const amc = await this.repository.getAMCById(amcId);
    if (!amc) {
      throw new Error("AMC not found");
    }

    const pipeline = getRenewalPipeline(amc.meta);
    let quotationInvoice: {
      id: number;
      invoiceNumber: string;
      status: string | null;
      total: string;
      dueDate: Date;
    } | null = null;

    if (pipeline.quotationInvoiceId) {
      const inv = await invoiceService.getInvoiceById(pipeline.quotationInvoiceId);
      if (inv) {
        quotationInvoice = {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          status: inv.status,
          total: inv.total,
          dueDate: inv.dueDate,
        };
      }
    }

    const steps = computeRenewalSteps({
      pipeline,
      invoiceStatus: quotationInvoice?.status,
      alreadyRenewed: !!amc.renewedTo,
    });

    return {
      amc,
      pipeline,
      quotationInvoice,
      steps,
      canRenew: this.isAMCRenewable(amc),
    };
  }

  /**
   * Step 1: Create quotation invoice (GST 5%) and store pipeline on AMC meta.
   * Does not create a new AMC contract.
   */
  async createRenewalQuotation(
    amcId: number,
    data: { startDate: Date; endDate: Date; amount: string; notes?: string }
  ) {
    const amc = await this.repository.getAMCById(amcId);
    if (!amc) throw new Error("AMC not found");
    if (!this.isAMCRenewable(amc)) {
      throw new Error("This AMC cannot be renewed. It may be cancelled or already renewed.");
    }
    if (!amc.clientId) throw new Error("AMC has no client");

    this.validateDates(data.startDate, data.endDate);

    const pipeline = getRenewalPipeline(amc.meta);
    if (pipeline.quotationInvoiceId) {
      const existing = await invoiceService.getInvoiceById(pipeline.quotationInvoiceId);
      if (existing && existing.status !== "cancelled") {
        throw new Error(
          `Quotation already exists (${existing.invoiceNumber}). Mark it paid or cancel it before creating another.`
        );
      }
    }

    const amountNum = parseFloat(data.amount);
    if (!amountNum || amountNum <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    const client = await clientRepository.getById(amc.clientId);
    const clientName = client?.name || `Client #${amc.clientId}`;

    const startStr =
      data.startDate instanceof Date
        ? data.startDate.toISOString().slice(0, 10)
        : String(data.startDate).slice(0, 10);
    const endStr =
      data.endDate instanceof Date
        ? data.endDate.toISOString().slice(0, 10)
        : String(data.endDate).slice(0, 10);

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const invoice = await invoiceService.generateInvoice({
      clientId: amc.clientId,
      issueDate,
      dueDate,
      items: buildQuotationLineItems({
        amount: amountNum,
        startDate: startStr,
        endDate: endStr,
        clientName,
      }),
      notes: [
        buildQuotationNotes(amcId, amc.contractNumber),
        data.notes || "",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    await invoiceService.markInvoiceAsSent(invoice.id);

    const nextPipeline: AmcRenewalPipeline = {
      ...pipeline,
      quotationInvoiceId: invoice.id,
      startDate: startStr,
      endDate: endStr,
      amount: data.amount,
    };

    const updated = await this.repository.updateAMC(amcId, {
      meta: withRenewalPipeline(amc.meta, nextPipeline),
    });

    const refreshed = await invoiceService.getInvoiceById(invoice.id);

    return {
      amc: updated,
      invoice: refreshed || invoice,
      pipeline: nextPipeline,
    };
  }

  /**
   * Step 3: Record RanceLab remittance (amount, date, reference, notes).
   */
  async saveRancelabRemittance(amcId: number, remittance: RancelabRemittance) {
    const amc = await this.repository.getAMCById(amcId);
    if (!amc) throw new Error("AMC not found");
    if (!this.isAMCRenewable(amc)) {
      throw new Error("This AMC cannot be renewed.");
    }

    const pipeline = getRenewalPipeline(amc.meta);
    if (!pipeline.quotationInvoiceId) {
      throw new Error("Create a quotation invoice before recording RanceLab remittance.");
    }

    const invoice = await invoiceService.getInvoiceById(pipeline.quotationInvoiceId);
    if (!invoice || invoice.status !== "paid") {
      throw new Error("Mark the quotation invoice as paid before recording remittance.");
    }
    if (!pipeline.payment?.proofUrl) {
      throw new Error("Upload payment proof before recording RanceLab remittance.");
    }

    if (remittance.remitted) {
      if (!remittance.amount || !remittance.date) {
        throw new Error("Remittance amount and date are required.");
      }
    }

    const nextPipeline: AmcRenewalPipeline = {
      ...pipeline,
      rancelab: {
        ...remittance,
        remittedAt: remittance.remitted
          ? remittance.remittedAt || new Date().toISOString()
          : undefined,
      },
    };

    const updated = await this.repository.updateAMC(amcId, {
      meta: withRenewalPipeline(amc.meta, nextPipeline),
    });

    return { amc: updated, pipeline: nextPipeline };
  }

  /**
   * Step 4: Complete license renewal — creates new AMC.
   * Requires paid quotation + RanceLab remittance. Does not create another invoice.
   */
  async renewAMC(amcId: number, renewalData: RenewAMCDTO): Promise<AMC> {
    const oldAMC = await this.repository.getAMCById(amcId);
    if (!oldAMC) {
      throw new Error("AMC not found");
    }

    if (!this.isAMCRenewable(oldAMC)) {
      throw new Error("This AMC cannot be renewed. It may be cancelled or already renewed.");
    }

    const pipeline = getRenewalPipeline(oldAMC.meta);
    if (!pipeline.quotationInvoiceId) {
      throw new Error("Create and send the quotation invoice first.");
    }

    const invoice = await invoiceService.getInvoiceById(pipeline.quotationInvoiceId);
    if (!invoice || invoice.status !== "paid") {
      throw new Error("Receive client payment (mark quotation invoice as paid) before renewing the license.");
    }

    if (!pipeline.payment?.proofUrl) {
      throw new Error("Upload payment proof before renewing the license.");
    }

    if (!pipeline.rancelab?.remitted) {
      throw new Error("Record RanceLab remittance before renewing the license.");
    }

    // Prefer pipeline dates/amount if request omitted extras; still validate body dates
    this.validateDates(renewalData.startDate, renewalData.endDate);

    if (new Date(renewalData.startDate) < new Date(oldAMC.endDate)) {
      // Allow same-day rollover: start may equal day after end; keep soft check
      const oldEnd = new Date(oldAMC.endDate);
      oldEnd.setHours(0, 0, 0, 0);
      const newStart = new Date(renewalData.startDate);
      newStart.setHours(0, 0, 0, 0);
      if (newStart < oldEnd) {
        throw new Error("Renewal start date must be on or after the current contract end date");
      }
    }

    const publicId = this.generatePublicId();
    const contractNumber = this.generateRenewalContractNumber(oldAMC.contractNumber ?? "");

    const newAMCData: Parameters<typeof this.repository.createAMC>[0] = {
      publicId,
      clientId: oldAMC.clientId,
      serviceId: oldAMC.serviceId,
      contractNumber,
      startDate: renewalData.startDate,
      endDate: renewalData.endDate,
      amount: renewalData.amount,
      status: this.calculateStatus(renewalData.endDate),
      renewedFrom: oldAMC.id,
      notes: renewalData.notes,
      meta: {
        renewedFromPipeline: {
          quotationInvoiceId: pipeline.quotationInvoiceId,
          rancelab: pipeline.rancelab,
        },
      },
    };

    if (renewalData.copyHardwareDetails && oldAMC.hardwareDetails) {
      newAMCData.hardwareDetails = oldAMC.hardwareDetails;
    }

    if (renewalData.copyServicesIncluded && oldAMC.servicesIncluded) {
      newAMCData.servicesIncluded = oldAMC.servicesIncluded;
    }

    const renewed = await this.repository.renewAMC(amcId, newAMCData);

    // Clear active pipeline on old AMC (keep history under completed flag)
    await this.repository.updateAMC(amcId, {
      meta: withRenewalPipeline(oldAMC.meta, {
        ...pipeline,
        // keep invoice + remittance for audit; license complete via renewedTo
      }),
    });

    return renewed;
  }

  async getRenewalChain(amcId: number): Promise<AMC[]> {
    return await this.repository.getRenewalChain(amcId);
  }

  // ==================== VALIDATION ====================

  validateDates(startDate: Date | string, endDate: Date | string): void {
    const start = typeof startDate === "string" ? new Date(startDate) : startDate;
    const end = typeof endDate === "string" ? new Date(endDate) : endDate;

    if (end <= start) {
      throw new Error("End date must be after start date");
    }
  }

  private validateStatusTransition(currentStatus: AMCStatus, newStatus: AMCStatus): void {
    const validTransitions: Record<AMCStatus, AMCStatus[]> = {
      active: ["expiring", "expired", "cancelled"],
      expiring: ["active", "expired", "cancelled"],
      expired: ["active"], // Can reactivate expired contracts
      cancelled: [], // Terminal state
    };

    if (currentStatus === newStatus) return;

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Cannot transition from ${currentStatus} to ${newStatus}. Valid transitions: ${allowed.join(", ") || "none"}`
      );
    }
  }

  // ==================== DASHBOARD & ANALYTICS ====================

  async getDashboardStats(): Promise<AMCStats> {
    return await this.repository.getDashboardStats();
  }

  async getAMCsByClientId(clientId: number): Promise<AMC[]> {
    return await this.repository.getAMCsByClientId(clientId);
  }

  async getAMCsByServiceId(serviceId: number): Promise<AMC[]> {
    return await this.repository.getAMCsByServiceId(serviceId);
  }

  // ==================== BUSINESS RULES ====================

  /**
   * Check if an AMC is renewable
   */
  isAMCRenewable(amc: AMC): boolean {
    // Cannot renew if already cancelled
    if (amc.status === "cancelled") return false;

    // Cannot renew if already has a renewal (renewedTo is set)
    if (amc.renewedTo) return false;

    return true;
  }

  /**
   * Get days until expiry
   */
  getDaysUntilExpiry(amc: AMC): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(amc.endDate);
    return Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate monthly revenue from an AMC
   */
  calculateMonthlyRevenue(amount: string | number): number {
    const value = typeof amount === "string" ? parseFloat(amount) : amount;
    return value / 12;
  }

  // ==================== HELPERS ====================

  private generatePublicId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `AMC-${timestamp}-${random}`.toUpperCase();
  }

  private generateRenewalContractNumber(oldContractNumber: string): string {
    // If existing contract number ends with -Y01, increment to -Y02, etc.
    const match = oldContractNumber.match(/(.+)-Y(\d+)$/);
    if (match) {
      const base = match[1];
      const year = parseInt(match[2]) + 1;
      return `${base}-Y${year.toString().padStart(2, "0")}`;
    }

    // If no year suffix, add -Y01
    return `${oldContractNumber}-Y01`;
  }
}

// Singleton instance
export const amcService = new AMCService();
