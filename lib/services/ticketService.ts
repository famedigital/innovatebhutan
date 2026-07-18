import { ticketRepository } from "@/lib/repositories/ticketRepository";
import type { CreateTicketInput, UpdateTicketInput } from "@/lib/validations/ticket";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";

const PRIORITY_SLA_HOURS: Record<string, number> = {
  high: 4,
  medium: 24,
  low: 72,
};

export class TicketService {
  private repository = ticketRepository;

  private withSla<T extends { status?: string | null; priority?: string | null; createdAt?: Date | null }>(
    ticket: T
  ) {
    const createdAt = ticket.createdAt ? new Date(ticket.createdAt) : new Date();
    const slaHours = PRIORITY_SLA_HOURS[ticket.priority || "medium"] || 24;
    const slaDeadline = new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000);
    const isBreached = ticket.status === "open" && new Date() > slaDeadline;
    return {
      ...ticket,
      slaBreach: isBreached,
      slaDeadline,
    };
  }

  async listTickets(filters: {
    status?: string;
    priority?: string;
    clientId?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const result = await this.repository.listTickets(filters);
    return {
      tickets: result.tickets.map((t) => this.withSla(t)),
      total: result.total,
    };
  }

  async getTicket(id: number) {
    const ticket = await this.repository.getTicketWithDetails(id);
    if (!ticket) return null;
    return this.withSla(ticket);
  }

  async createTicket(data: CreateTicketInput, operatorId?: number) {
    const ticket = await this.repository.createTicket({
      clientId: data.clientId,
      subject: data.subject,
      description: data.description,
      priority: data.priority || "medium",
      assignedTo: data.assignedTo,
      status: "open",
    });
    await writeAuditLog({
      operatorId,
      action: "CREATE",
      entityType: "TICKET",
      entityId: ticket.id,
      details: { subject: ticket.subject, clientId: ticket.clientId },
    });
    return ticket;
  }

  async updateTicket(id: number, data: UpdateTicketInput, operatorId?: number) {
    const existing = await this.repository.getTicketById(id);
    if (!existing) throw new Error("Ticket not found");

    if (data.status) {
      const allowed: Record<string, string[]> = {
        open: ["in_progress", "resolved", "closed"],
        in_progress: ["resolved", "closed", "open"],
        resolved: ["closed", "open"],
        closed: ["open"],
      };
      const from = existing.status || "open";
      if (data.status !== from && !(allowed[from] || []).includes(data.status)) {
        throw new Error(`Invalid status transition: ${from} → ${data.status}`);
      }
    }

    const ticket = await this.repository.updateTicket(id, {
      subject: data.subject,
      description: data.description,
      status: data.status,
      priority: data.priority,
      assignedTo: data.assignedTo === null ? undefined : data.assignedTo,
    });
    await writeAuditLog({
      operatorId,
      action: "UPDATE",
      entityType: "TICKET",
      entityId: id,
      details: { before: existing, after: data },
    });
    return ticket;
  }

  async deleteTicket(id: number, operatorId?: number) {
    const existing = await this.repository.getTicketById(id);
    if (!existing) throw new Error("Ticket not found");
    await this.repository.deleteTicket(id);
    await writeAuditLog({
      operatorId,
      action: "DELETE",
      entityType: "TICKET",
      entityId: id,
      details: { subject: existing.subject },
    });
  }

  async listMessages(ticketId: number) {
    return await this.repository.listMessages(ticketId);
  }

  async addMessage(ticketId: number, senderProfileId: number, message: string) {
    const existing = await this.repository.getTicketById(ticketId);
    if (!existing) throw new Error("Ticket not found");
    const msg = await this.repository.addMessage({
      ticketId,
      senderId: senderProfileId,
      message,
    });
    await writeAuditLog({
      operatorId: senderProfileId,
      action: "CREATE",
      entityType: "TICKET_MESSAGE",
      entityId: msg.id,
      details: { ticketId },
    });
    return msg;
  }
}

export const ticketService = new TicketService();
