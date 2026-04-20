import { db } from "@/db";
import { amcs, clients, services } from "@/db/schema";
import { eq, and, desc, sql, count, gte, lte, isNotNull } from "drizzle-orm";

type AMC = typeof amcs.$inferSelect;
type NewAMC = typeof amcs.$inferInsert;

export interface AMCFilters {
  clientId?: number;
  serviceId?: number;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface AMCStats {
  total: number;
  active: number;
  expiring: number;
  expired: number;
  totalValue: number;
}

export class AMCRepository {
  private db = db;

  // ==================== AMC CRUD ====================

  async createAMC(data: NewAMC): Promise<AMC> {
    const [amc] = await this.db.insert(amcs).values(data).returning();
    return amc;
  }

  async getAMCById(id: number): Promise<AMC | null> {
    const [amc] = await this.db.select().from(amcs).where(eq(amcs.id, id)).limit(1);
    return amc || null;
  }

  async getAMCByPublicId(publicId: string): Promise<AMC | null> {
    const [amc] = await this.db.select().from(amcs).where(eq(amcs.publicId, publicId)).limit(1);
    return amc || null;
  }

  async getAMCByContractNumber(contractNumber: string): Promise<AMC | null> {
    const [amc] = await this.db.select().from(amcs).where(eq(amcs.contractNumber, contractNumber)).limit(1);
    return amc || null;
  }

  async updateAMC(id: number, data: Partial<NewAMC>): Promise<AMC> {
    const [amc] = await this.db
      .update(amcs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(amcs.id, id))
      .returning();
    return amc;
  }

  async deleteAMC(id: number): Promise<void> {
    await this.db.delete(amcs).where(eq(amcs.id, id));
  }

  async updateAMCStatus(id: number, status: string): Promise<AMC> {
    const [amc] = await this.db
      .update(amcs)
      .set({ status, updatedAt: new Date() })
      .where(eq(amcs.id, id))
      .returning();
    return amc;
  }

  // ==================== QUERY METHODS ====================

  async listAMCs(filters: AMCFilters = {}): Promise<{ amcs: AMC[]; total: number }> {
    const conditions = [];

    if (filters.clientId) {
      conditions.push(eq(amcs.clientId, filters.clientId));
    }
    if (filters.serviceId) {
      conditions.push(eq(amcs.serviceId, filters.serviceId));
    }
    if (filters.status) {
      conditions.push(eq(amcs.status, filters.status));
    }
    if (filters.search) {
      conditions.push(
        sql`(${amcs.contractNumber} ILIKE ${'%' + filters.search + '%'} OR ${amcs.notes} ILIKE ${'%' + filters.search + '%'})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(amcs)
      .where(whereClause);
    const total = totalResult[0]?.count || 0;

    // Fetch AMCs
    const amcsData = await this.db
      .select()
      .from(amcs)
      .where(whereClause)
      .orderBy(desc(amcs.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return { amcs: amcsData, total };
  }

  async listAMCsWithDetails(filters: AMCFilters = {}) {
    const conditions = [];

    if (filters.clientId) {
      conditions.push(eq(amcs.clientId, filters.clientId));
    }
    if (filters.serviceId) {
      conditions.push(eq(amcs.serviceId, filters.serviceId));
    }
    if (filters.status) {
      conditions.push(eq(amcs.status, filters.status));
    }
    if (filters.search) {
      conditions.push(
        sql`(${amcs.contractNumber} ILIKE ${'%' + filters.search + '%'} OR ${amcs.notes} ILIKE ${'%' + filters.search + '%'})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const amcsData = await this.db
      .select({
        id: amcs.id,
        publicId: amcs.publicId,
        clientId: amcs.clientId,
        serviceId: amcs.serviceId,
        contractNumber: amcs.contractNumber,
        startDate: amcs.startDate,
        endDate: amcs.endDate,
        amount: amcs.amount,
        hardwareDetails: amcs.hardwareDetails,
        servicesIncluded: amcs.servicesIncluded,
        renewedFrom: amcs.renewedFrom,
        renewedTo: amcs.renewedTo,
        status: amcs.status,
        notes: amcs.notes,
        createdAt: amcs.createdAt,
        updatedAt: amcs.updatedAt,
        clientName: clients.name,
        clientLogo: clients.logoUrl,
        clientWhatsapp: clients.whatsapp,
        serviceName: services.name,
        serviceCategory: services.category,
      })
      .from(amcs)
      .leftJoin(clients, eq(amcs.clientId, clients.id))
      .leftJoin(services, eq(amcs.serviceId, services.id))
      .where(whereClause)
      .orderBy(desc(amcs.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    // Get total count
    const totalResult = await this.db
      .select({ count: count() })
      .from(amcs)
      .where(whereClause);

    return {
      amcs: amcsData,
      total: totalResult[0]?.count || 0,
    };
  }

  // ==================== EXPIRY MANAGEMENT ====================

  async getExpiringAMCs(daysThreshold: number = 30): Promise<AMC[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysThreshold);

    return await this.db
      .select()
      .from(amcs)
      .where(
        and(
          eq(amcs.status, "active"),
          gte(amcs.endDate, today),
          lte(amcs.endDate, futureDate)
        )
      )
      .orderBy(amcs.endDate);
  }

  async getExpiredAMCs(): Promise<AMC[]> {
    const today = new Date();

    return await this.db
      .select()
      .from(amcs)
      .where(
        and(
          sql`${amcs.endDate} < ${today}`,
          eq(amcs.status, "active")
        )
      )
      .orderBy(amcs.endDate);
  }

  async getAMCsByClientId(clientId: number): Promise<AMC[]> {
    return await this.db
      .select()
      .from(amcs)
      .where(eq(amcs.clientId, clientId))
      .orderBy(desc(amcs.createdAt));
  }

  async getAMCsByServiceId(serviceId: number): Promise<AMC[]> {
    return await this.db
      .select()
      .from(amcs)
      .where(eq(amcs.serviceId, serviceId))
      .orderBy(desc(amcs.createdAt));
  }

  // ==================== RENEWAL MANAGEMENT ====================

  async getRenewalChain(amcId: number): Promise<AMC[]> {
    // First, find the root of the renewal chain
    const rootAMC = await this.findRenewalRoot(amcId);
    if (!rootAMC) {
      return [];
    }

    // Get all AMCs in the chain
    const chain: AMC[] = [rootAMC];
    let currentId = rootAMC.id;

    while (currentId) {
      const [next] = await this.db
        .select()
        .from(amcs)
        .where(eq(amcs.renewedFrom, currentId))
        .limit(1);

      if (next) {
        chain.push(next);
        currentId = next.id;
      } else {
        break;
      }
    }

    return chain;
  }

  private async findRenewalRoot(amcId: number): Promise<AMC | null> {
    let current = await this.getAMCById(amcId);
    const visited = new Set<number>();

    while (current && current.renewedFrom && !visited.has(current.renewedFrom)) {
      visited.add(current.id);
      current = await this.getAMCById(current.renewedFrom);
    }

    return current;
  }

  /**
   * Renew an AMC atomically - creates new AMC and updates old AMC's renewedTo reference
   * This ensures the renewal chain is always consistent
   */
  async renewAMC(oldAMCId: number, newAMCData: NewAMC): Promise<AMC> {
    return await this.db.transaction(async (tx) => {
      // Create the new AMC
      const [newAMC] = await tx.insert(amcs).values(newAMCData).returning();

      // Update old AMC with forward reference
      await tx
        .update(amcs)
        .set({ renewedTo: newAMC.id, updatedAt: new Date() })
        .where(eq(amcs.id, oldAMCId));

      return newAMC;
    });
  }

  async updateRenewalLinks(oldAMCId: number, newAMCId: number): Promise<void> {
    await this.db
      .update(amcs)
      .set({ renewedTo: newAMCId, updatedAt: new Date() })
      .where(eq(amcs.id, oldAMCId));
  }

  // ==================== DASHBOARD STATS ====================

  async getDashboardStats(): Promise<AMCStats> {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const [totalResult, activeResult, expiredResult, expiringResult] = await Promise.all([
      this.db.select({ count: count() }).from(amcs),
      this.db.select({ count: count(), totalValue: sql<number>`COALESCE(SUM(${amcs.amount}), 0)` }).from(amcs).where(eq(amcs.status, "active")),
      this.db.select({ count: count() }).from(amcs).where(eq(amcs.status, "expired")),
      this.db.select({ count: count() }).from(amcs).where(
        and(
          eq(amcs.status, "active"),
          gte(amcs.endDate, today),
          lte(amcs.endDate, thirtyDaysFromNow)
        )
      ),
    ]);

    const total = totalResult[0]?.count || 0;
    const activeData = activeResult[0] || { count: 0, totalValue: "0" };
    const expired = expiredResult[0]?.count || 0;
    const expiring = expiringResult[0]?.count || 0;

    return {
      total: Number(total),
      active: Number(activeData.count),
      expiring,
      expired,
      totalValue: Number(activeData.totalValue) || 0,
    };
  }

  async getExpiringAMCsWithDetails(daysThreshold: number = 30) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysThreshold);

    const amcsData = await this.db
      .select({
        id: amcs.id,
        publicId: amcs.publicId,
        contractNumber: amcs.contractNumber,
        endDate: amcs.endDate,
        amount: amcs.amount,
        status: amcs.status,
        clientName: clients.name,
        clientWhatsapp: clients.whatsapp,
        clientLogo: clients.logoUrl,
      })
      .from(amcs)
      .leftJoin(clients, eq(amcs.clientId, clients.id))
      .where(
        and(
          eq(amcs.status, "active"),
          gte(amcs.endDate, today),
          lte(amcs.endDate, futureDate)
        )
      )
      .orderBy(amcs.endDate);

    return amcsData;
  }
}

// Singleton instance
export const amcRepository = new AMCRepository();
