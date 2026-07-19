import { db } from "@/db";
import { amcs, clients, services, teamAssignments } from "@/db/schema";
import { eq, and, desc, sql, count, gte, lte, lt, ne } from "drizzle-orm";
import { dashboardCache, withCache, CacheTTL, hashFilters, listCache } from "@/lib/cache/repository-cache";

export type AMC = typeof amcs.$inferSelect;
type NewAMC = typeof amcs.$inferInsert;

export interface AMCFilters {
  clientId?: number;
  serviceId?: number;
  status?: string;
  search?: string;
  /** Hybrid ownership: all | mine | unclaimed | today */
  owner?: "all" | "mine" | "unclaimed" | "today";
  /** employees.id for mine/today filters */
  focalEmployeeId?: number;
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
    // Don't cache lists with search (too many permutations)
    const cacheKey = filters.search
      ? null
      : `amcs:list:${hashFilters(filters)}`;

    if (cacheKey) {
      const cached = listCache.get<{ amcs: any[]; total: number }>(cacheKey, 5000); // 5 seconds
      if (cached) {
        return cached;
      }
    }

    const conditions = [];

    if (filters.clientId) {
      conditions.push(eq(amcs.clientId, filters.clientId));
    }
    if (filters.serviceId) {
      conditions.push(eq(amcs.serviceId, filters.serviceId));
    }
    // Status filter uses endDate so list stays correct even if DB status is stale
    if (filters.status === "cancelled") {
      conditions.push(eq(amcs.status, "cancelled"));
    } else if (filters.status === "expired") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      conditions.push(ne(amcs.status, "cancelled"));
      conditions.push(lt(amcs.endDate, today));
    } else if (filters.status === "expiring") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const soon = new Date(today);
      soon.setDate(soon.getDate() + 30);
      conditions.push(ne(amcs.status, "cancelled"));
      conditions.push(gte(amcs.endDate, today));
      conditions.push(lte(amcs.endDate, soon));
    } else if (filters.status === "active") {
      const soon = new Date();
      soon.setHours(0, 0, 0, 0);
      soon.setDate(soon.getDate() + 30);
      conditions.push(ne(amcs.status, "cancelled"));
      conditions.push(sql`${amcs.endDate} > ${soon}`);
    }
    if (filters.search) {
      conditions.push(
        sql`(${amcs.contractNumber} ILIKE ${'%' + filters.search + '%'} OR ${amcs.notes} ILIKE ${'%' + filters.search + '%'})`
      );
    }

    // Hybrid ownership filters (team_assignments.focal)
    const owner = filters.owner || "all";
    if (owner === "mine" && filters.focalEmployeeId) {
      conditions.push(
        sql`${amcs.clientId} IN (
          SELECT ${teamAssignments.clientId} FROM ${teamAssignments}
          WHERE ${teamAssignments.teamMemberId} = ${filters.focalEmployeeId}
            AND ${teamAssignments.isFocalPerson} = true
            AND ${teamAssignments.isActive} = true
        )`
      );
    } else if (owner === "unclaimed") {
      conditions.push(
        sql`${amcs.clientId} NOT IN (
          SELECT ${teamAssignments.clientId} FROM ${teamAssignments}
          WHERE ${teamAssignments.isFocalPerson} = true
            AND ${teamAssignments.isActive} = true
        )`
      );
    } else if (owner === "today") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const soon = new Date(todayStart);
      soon.setDate(soon.getDate() + 30);
      conditions.push(ne(amcs.status, "cancelled"));
      conditions.push(sql`${amcs.renewedTo} IS NULL`);
      conditions.push(lte(amcs.endDate, soon));
      if (filters.focalEmployeeId) {
        conditions.push(
          sql`(
            ${amcs.clientId} IN (
              SELECT ${teamAssignments.clientId} FROM ${teamAssignments}
              WHERE ${teamAssignments.teamMemberId} = ${filters.focalEmployeeId}
                AND ${teamAssignments.isFocalPerson} = true
                AND ${teamAssignments.isActive} = true
            )
            OR ${amcs.clientId} NOT IN (
              SELECT ${teamAssignments.clientId} FROM ${teamAssignments}
              WHERE ${teamAssignments.isFocalPerson} = true
                AND ${teamAssignments.isActive} = true
            )
          )`
        );
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Run both queries in parallel
    const [amcsData, totalResult] = await Promise.all([
      this.db
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
          meta: amcs.meta,
          createdAt: amcs.createdAt,
          updatedAt: amcs.updatedAt,
          clientName: clients.name,
          clientLogo: clients.logoUrl,
          clientWhatsapp: clients.whatsapp,
          clientWhatsappGroupLink: clients.whatsappGroupLink,
          clientMeta: clients.meta,
          serviceName: services.name,
          serviceCategory: services.category,
        })
        .from(amcs)
        .leftJoin(clients, eq(amcs.clientId, clients.id))
        .leftJoin(services, eq(amcs.serviceId, services.id))
        .where(whereClause)
        .orderBy(
          owner === "today" ? amcs.endDate : desc(amcs.createdAt)
        )
        .limit(filters.limit || 50)
        .offset(filters.offset || 0),

      this.db
        .select({ count: count() })
        .from(amcs)
        .where(whereClause),
    ]);

    // Keep list fast: skip per-row invoice/ticket fetches (was N+1 and timed out on Vercel)
    const amcsWithData = amcsData.map((amc) => ({
      ...amc,
      invoices: [] as Array<{
        id: number;
        invoiceNumber: string;
        total: string;
        status: string;
        dueDate: Date;
      }>,
      tickets: [] as Array<{
        id: number;
        subject: string;
        status: string;
        priority: string;
        createdAt: Date;
      }>,
    }));

    const result = {
      amcs: amcsWithData,
      total: Number(totalResult[0]?.count || 0),
    };

    if (cacheKey) {
      listCache.set(cacheKey, result);
    }

    return result;
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

  /**
   * Get renewal chain using optimized batch queries
   * Reduces N queries to 2 queries total instead of N+1
   */
  async getRenewalChain(amcId: number): Promise<AMC[]> {
    // First, get all AMCs that could be in this chain (by client)
    const startAMC = await this.getAMCById(amcId);
    if (!startAMC) {
      return [];
    }

    // Get all AMCs for this client - much smaller set than all AMCs
    // Then build chain in memory - eliminates N+1 query pattern
    const clientAMCs = await this.db
      .select()
      .from(amcs)
      .where(eq(amcs.clientId, startAMC.clientId));

    // Build chain in memory
    const amcMap = new Map(clientAMCs.map(a => [a.id, a]));
    const chain: AMC[] = [];

    // Find root (traverse backwards)
    let current = amcMap.get(amcId);
    const visited = new Set<number>();

    while (current && current.renewedFrom && !visited.has(current.renewedFrom)) {
      visited.add(current.id);
      current = amcMap.get(current.renewedFrom);
    }

    if (current) {
      chain.push(current);

      // Follow forward links
      while (current && current.renewedTo) {
        const next = amcMap.get(current.renewedTo);
        if (next) {
          chain.push(next);
          current = next;
        } else {
          break;
        }
      }
    }

    return chain;
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

  /**
   * Get dashboard stats with caching (30 second TTL)
   * These stats are expensive to compute and don't change frequently
   */
  async getDashboardStats(): Promise<AMCStats> {
    return withCache(
      'amc:dashboard',
      () => this.computeDashboardStats(),
      dashboardCache,
      30000 // 30 seconds
    );
  }

  /**
   * Internal method to compute dashboard stats
   * Separated to allow caching wrapper
   */
  private async computeDashboardStats(): Promise<AMCStats> {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Single aggregation query instead of multiple parallel queries
    const [statsResult] = await this.db
      .select({
        total: count(),
        active: count(sql`CASE WHEN ${amcs.status} = 'active' THEN 1 END`),
        expired: count(sql`CASE WHEN ${amcs.status} = 'expired' THEN 1 END`),
        expiring: count(sql`CASE WHEN ${amcs.status} = 'active' AND ${amcs.endDate} >= ${today} AND ${amcs.endDate} <= ${thirtyDaysFromNow} THEN 1 END`),
        totalValue: sql<number>`COALESCE(SUM(CASE WHEN ${amcs.status} = 'active' THEN ${amcs.amount} ELSE 0 END), 0)`,
      })
      .from(amcs);

    return {
      total: Number(statsResult.total),
      active: Number(statsResult.active),
      expiring: Number(statsResult.expiring),
      expired: Number(statsResult.expired),
      totalValue: Number(statsResult.totalValue) || 0,
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
