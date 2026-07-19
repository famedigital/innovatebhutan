import { ticketRepository } from "@/lib/repositories/ticketRepository";
import type { CreateTicketInput, UpdateTicketInput } from "@/lib/validations/ticket";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";

const PRIORITY_SLA_HOURS: Record<string, number> = {
  high: 4,
  medium: 24,
  low: 72,
};

function makePublicId() {
  return `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

export function buildTicketGroupNotifyText(params: {
  kind: "started" | "resolved";
  ticketId: number;
  publicId?: string | null;
  subject: string;
  clientName?: string;
  baseUrl?: string;
}) {
  const origin =
    params.baseUrl ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.innovates.bt";
  const link = `${origin}/admin/tickets?ticketId=${params.ticketId}`;
  if (params.kind === "started") {
    return [
      `🎫 Ticket #${params.ticketId} logged`,
      params.clientName ? `Client: ${params.clientName}` : null,
      `Subject: ${params.subject}`,
      `Status: Started`,
      `Open: ${link}`,
      `— Innovates Support`,
    ]
      .filter(Boolean)
      .join("\n");
  }
  return [
    `✅ Ticket #${params.ticketId} resolved`,
    params.clientName ? `Client: ${params.clientName}` : null,
    `Subject: ${params.subject}`,
    `Open: ${link}`,
    `— Innovates Support`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildWhatsAppGroupDeepLink(
  groupLink: string | null | undefined,
  text: string
): string | null {
  if (!groupLink) return null;
  // Invite links cannot prefill; return group link — staff pastes text
  if (groupLink.includes("chat.whatsapp.com")) return groupLink;
  const phone = groupLink.replace(/\D/g, "");
  if (!phone) return groupLink;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export class TicketService {
  private repository = ticketRepository;

  private withSla<
    T extends {
      status?: string | null;
      priority?: string | null;
      createdAt?: Date | null;
    }
  >(ticket: T) {
    const createdAt = ticket.createdAt ? new Date(ticket.createdAt) : new Date();
    const slaHours = PRIORITY_SLA_HOURS[ticket.priority || "medium"] || 24;
    const slaDeadline = new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000);
    const waiting =
      ticket.status === "open" || ticket.status === "started";
    const isBreached = waiting && new Date() > slaDeadline;
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
    assignedTo?: number;
    productKey?: string;
    queue?: string;
    search?: string;
    limit?: number;
    offset?: number;
    profileId?: number;
  }) {
    const repoFilters: Parameters<typeof this.repository.listTickets>[0] = {
      status: filters.status,
      priority: filters.priority,
      clientId: filters.clientId,
      productKey: filters.productKey,
      search: filters.search,
      limit: filters.limit,
      offset: filters.offset,
    };

    if (filters.queue === "mine" && filters.profileId) {
      repoFilters.assignedTo = filters.profileId;
    } else if (filters.queue === "unassigned") {
      repoFilters.unassigned = true;
    } else if (filters.queue === "started") {
      repoFilters.status = "started";
    } else if (filters.queue === "in_progress") {
      repoFilters.status = "in_progress";
    } else if (filters.queue === "resolved") {
      repoFilters.status = "resolved";
    } else if (filters.assignedTo) {
      repoFilters.assignedTo = filters.assignedTo;
    }

    const result = await this.repository.listTickets(repoFilters);
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
      publicId: makePublicId(),
      clientId: data.clientId,
      subject: data.subject,
      description: data.description,
      priority: data.priority || "medium",
      assignedTo: data.assignedTo,
      status: "open",
      productKey: data.productKey || null,
      source: data.source || "call_centre",
    });
    await writeAuditLog({
      operatorId,
      action: "CREATE",
      entityType: "TICKET",
      entityId: ticket.id,
      details: { subject: ticket.subject, clientId: ticket.clientId },
    });

    if (data.startAndNotify && data.assignedTo) {
      return this.startTicket(ticket.id, operatorId);
    }
    return this.getTicket(ticket.id);
  }

  async startTicket(id: number, operatorId?: number) {
    const existing = await this.repository.getTicketWithDetails(id);
    if (!existing) throw new Error("Ticket not found");
    if (!existing.assignedTo) {
      throw new Error("Assign a staff member before starting");
    }

    await this.repository.updateTicket(id, {
      status: "started",
      groupNotifiedAt: new Date(),
    });

    const text = buildTicketGroupNotifyText({
      kind: "started",
      ticketId: id,
      publicId: existing.publicId,
      subject: existing.subject,
      clientName: existing.clientName || undefined,
    });
    const waLink = buildWhatsAppGroupDeepLink(
      existing.clientWhatsappGroupLink,
      text
    );

    await writeAuditLog({
      operatorId,
      action: "UPDATE",
      entityType: "TICKET",
      entityId: id,
      details: { status: "started", groupNotify: true },
    });

    const ticket = await this.getTicket(id);
    return {
      ticket,
      notify: {
        text,
        whatsappUrl: waLink,
        groupLink: existing.clientWhatsappGroupLink,
      },
    };
  }

  async acknowledgeTicket(id: number, profileId: number) {
    const existing = await this.repository.getTicketById(id);
    if (!existing) throw new Error("Ticket not found");
    if (existing.status !== "started" && existing.status !== "open") {
      throw new Error("Only started/open tickets can be acknowledged");
    }
    await this.repository.updateTicket(id, {
      status: "in_progress",
      acknowledgedAt: new Date(),
      acknowledgedBy: profileId,
    });
    await writeAuditLog({
      operatorId: profileId,
      action: "UPDATE",
      entityType: "TICKET",
      entityId: id,
      details: { status: "in_progress", acknowledged: true },
    });
    return this.getTicket(id);
  }

  async resolveTicket(id: number, operatorId?: number) {
    const existing = await this.repository.getTicketWithDetails(id);
    if (!existing) throw new Error("Ticket not found");

    await this.repository.updateTicket(id, {
      status: "resolved",
      resolveNotifiedAt: new Date(),
    });

    const text = buildTicketGroupNotifyText({
      kind: "resolved",
      ticketId: id,
      publicId: existing.publicId,
      subject: existing.subject,
      clientName: existing.clientName || undefined,
    });
    const waLink = buildWhatsAppGroupDeepLink(
      existing.clientWhatsappGroupLink,
      text
    );

    await writeAuditLog({
      operatorId,
      action: "UPDATE",
      entityType: "TICKET",
      entityId: id,
      details: { status: "resolved", groupNotify: true },
    });

    return {
      ticket: await this.getTicket(id),
      notify: {
        text,
        whatsappUrl: waLink,
        groupLink: existing.clientWhatsappGroupLink,
      },
    };
  }

  async updateTicket(id: number, data: UpdateTicketInput, operatorId?: number) {
    const existing = await this.repository.getTicketById(id);
    if (!existing) throw new Error("Ticket not found");

    if (data.status) {
      const allowed: Record<string, string[]> = {
        open: ["started", "in_progress", "resolved", "closed"],
        started: ["in_progress", "resolved", "closed", "open"],
        in_progress: ["resolved", "closed", "open", "started"],
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
      productKey: data.productKey,
      ...(data.assignedTo !== undefined ? { assignedTo: data.assignedTo } : {}),
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
