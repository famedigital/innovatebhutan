import { db } from "@/db";
import { tickets, ticketMessages, clients, profiles } from "@/db/schema";
import { eq, and, desc, count, like, or } from "drizzle-orm";

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type TicketMessage = typeof ticketMessages.$inferSelect;

export interface TicketFilters {
  status?: string;
  priority?: string;
  clientId?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export class TicketRepository {
  private db = db;

  async createTicket(data: NewTicket): Promise<Ticket> {
    const [ticket] = await this.db.insert(tickets).values(data).returning();
    return ticket;
  }

  async getTicketById(id: number): Promise<Ticket | null> {
    const [ticket] = await this.db.select().from(tickets).where(eq(tickets.id, id)).limit(1);
    return ticket || null;
  }

  async getTicketWithDetails(id: number) {
    const [row] = await this.db
      .select({
        id: tickets.id,
        clientId: tickets.clientId,
        assignedTo: tickets.assignedTo,
        subject: tickets.subject,
        description: tickets.description,
        status: tickets.status,
        priority: tickets.priority,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        clientName: clients.name,
        assignedName: profiles.fullName,
      })
      .from(tickets)
      .leftJoin(clients, eq(tickets.clientId, clients.id))
      .leftJoin(profiles, eq(tickets.assignedTo, profiles.id))
      .where(eq(tickets.id, id))
      .limit(1);

    return row || null;
  }

  async updateTicket(id: number, data: Partial<NewTicket>): Promise<Ticket> {
    const [ticket] = await this.db
      .update(tickets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tickets.id, id))
      .returning();
    return ticket;
  }

  async deleteTicket(id: number): Promise<void> {
    await this.db.delete(ticketMessages).where(eq(ticketMessages.ticketId, id));
    await this.db.delete(tickets).where(eq(tickets.id, id));
  }

  async listTickets(filters: TicketFilters = {}) {
    const conditions: any[] = [];

    if (filters.status) conditions.push(eq(tickets.status, filters.status));
    if (filters.priority) conditions.push(eq(tickets.priority, filters.priority));
    if (filters.clientId) conditions.push(eq(tickets.clientId, filters.clientId));
    if (filters.search) {
      conditions.push(
        or(
          like(tickets.subject, `%${filters.search}%`),
          like(tickets.description, `%${filters.search}%`)
        )
      );
    }

    const where = conditions.length ? and(...conditions) : undefined;
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;

    const rows = await this.db
      .select({
        id: tickets.id,
        clientId: tickets.clientId,
        assignedTo: tickets.assignedTo,
        subject: tickets.subject,
        description: tickets.description,
        status: tickets.status,
        priority: tickets.priority,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
        clientName: clients.name,
      })
      .from(tickets)
      .leftJoin(clients, eq(tickets.clientId, clients.id))
      .where(where)
      .orderBy(desc(tickets.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalRow] = await this.db
      .select({ total: count() })
      .from(tickets)
      .where(where);

    return {
      tickets: rows,
      total: Number(totalRow?.total ?? 0),
    };
  }

  async listMessages(ticketId: number) {
    return await this.db
      .select({
        id: ticketMessages.id,
        ticketId: ticketMessages.ticketId,
        senderId: ticketMessages.senderId,
        message: ticketMessages.message,
        createdAt: ticketMessages.createdAt,
        senderName: profiles.fullName,
      })
      .from(ticketMessages)
      .leftJoin(profiles, eq(ticketMessages.senderId, profiles.id))
      .where(eq(ticketMessages.ticketId, ticketId))
      .orderBy(ticketMessages.createdAt);
  }

  async addMessage(data: {
    ticketId: number;
    senderId: number;
    message: string;
  }): Promise<TicketMessage> {
    const [msg] = await this.db.insert(ticketMessages).values(data).returning();
    return msg;
  }
}

export const ticketRepository = new TicketRepository();
