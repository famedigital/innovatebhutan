import { amcRepository, type AMCFilters, type AMCStats } from "@/lib/repositories/amcRepository";
import type { AMC } from "@/lib/repositories/amcRepository";

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
    return await this.repository.listAMCsWithDetails(filters);
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
   */
  async updateAllAMCStatuses(): Promise<{ updated: number }> {
    const activeAMCs = await this.repository.listAMCs({ status: "active", limit: 1000 });
    let updated = 0;

    for (const amc of activeAMCs.amcs) {
      const newStatus = this.calculateStatus(amc.endDate);
      if (newStatus !== amc.status) {
        await this.repository.updateAMCStatus(amc.id, newStatus);
        updated++;
      }
    }

    return { updated };
  }

  /**
   * Get all AMCs expiring within the threshold
   */
  async getExpiringAMCs(daysThreshold: number = EXPIRING_THRESHOLD_DAYS) {
    return await this.repository.getExpiringAMCsWithDetails(daysThreshold);
  }

  // ==================== RENEWAL MANAGEMENT ====================

  async renewAMC(amcId: number, renewalData: RenewAMCDTO): Promise<AMC> {
    const oldAMC = await this.repository.getAMCById(amcId);
    if (!oldAMC) {
      throw new Error("AMC not found");
    }

    // Validate dates
    this.validateDates(renewalData.startDate, renewalData.endDate);

    // Renewal must start after or on the old AMC's end date
    if (new Date(renewalData.startDate) < new Date(oldAMC.endDate)) {
      throw new Error("Renewal start date must be on or after the current contract end date");
    }

    // Generate new public ID
    const publicId = this.generatePublicId();

    // Generate new contract number (base on old one)
    const contractNumber = this.generateRenewalContractNumber(oldAMC.contractNumber);

    // Prepare data for new AMC
    const newAMCData: Parameters<typeof this.repository.createAMC>[0] = {
      publicId,
      clientId: oldAMC.clientId,
      serviceId: oldAMC.serviceId,
      contractNumber,
      startDate: renewalData.startDate,
      endDate: renewalData.endDate,
      amount: renewalData.amount,
      status: "active",
      renewedFrom: oldAMC.id,
      notes: renewalData.notes,
    };

    // Copy hardware details if requested
    if (renewalData.copyHardwareDetails && oldAMC.hardwareDetails) {
      newAMCData.hardwareDetails = oldAMC.hardwareDetails;
    }

    // Copy services included if requested
    if (renewalData.copyServicesIncluded && oldAMC.servicesIncluded) {
      newAMCData.servicesIncluded = oldAMC.servicesIncluded;
    }

    // Use transactional renew method - creates new AMC and updates old AMC atomically
    return await this.repository.renewAMC(amcId, newAMCData);
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
