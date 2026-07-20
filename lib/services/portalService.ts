import { randomBytes } from "crypto";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  amcs,
  clientPortalAccess,
  clients,
  invoices,
  portalPaymentProofs,
  profiles,
  projects,
  tickets,
  ticketMessages,
} from "@/db/schema";
import { writeAuditLog } from "@/lib/audit/writeAuditLog";
import { notificationService } from "@/lib/services/notificationService";
import { getMoneyPeopleProfileIds } from "@/lib/portal/portalAuth";
import { computeSlaDueAt } from "@/lib/services/ticketService";

function makeInviteToken() {
  return randomBytes(24).toString("hex");
}

function makeTicketPublicId() {
  return `TKT-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

export const PORTAL_PAY_INSTRUCTIONS = {
  methods: ["mbob", "cheque"] as const,
  payee: "Innovate Bhutan",
  gstTin: "P10285932",
  note:
    "We do not accept cash. Pay by M-BoB or cheque in favour of Innovate Bhutan, then upload a screenshot for confirmation. Bank / M-BoB account details: TBD — confirm with sales.",
};

export class PortalService {
  /** Create or refresh invite for a client email. */
  async inviteClient(params: {
    clientId: number;
    email: string;
    invitedByProfileId?: number;
    expiresInDays?: number;
  }) {
    const email = params.email.toLowerCase().trim();
    if (!email || !email.includes("@")) {
      throw new Error("Valid email required");
    }

    const [client] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, params.clientId))
      .limit(1);
    if (!client) throw new Error("Client not found");

    const token = makeInviteToken();
    const expires = new Date();
    expires.setDate(expires.getDate() + (params.expiresInDays ?? 14));

    const existing = await db
      .select()
      .from(clientPortalAccess)
      .where(
        and(
          eq(clientPortalAccess.clientId, params.clientId),
          eq(clientPortalAccess.inviteEmail, email)
        )
      )
      .limit(1);

    let row;
    if (existing[0]) {
      const [updated] = await db
        .update(clientPortalAccess)
        .set({
          inviteToken: token,
          inviteExpiresAt: expires,
          invitedAt: new Date(),
          isActive: existing[0].isActive,
          updatedAt: new Date(),
        })
        .where(eq(clientPortalAccess.id, existing[0].id))
        .returning();
      row = updated;
    } else {
      const [created] = await db
        .insert(clientPortalAccess)
        .values({
          clientId: params.clientId,
          inviteEmail: email,
          inviteToken: token,
          inviteExpiresAt: expires,
          invitedAt: new Date(),
          isActive: false,
          accessLevel: "basic",
          features: [
            "projects",
            "invoices",
            "tickets",
            "amc",
            "payment_proof",
          ],
        })
        .returning();
      row = created;
    }

    await writeAuditLog({
      operatorId: params.invitedByProfileId,
      action: "CREATE",
      entityType: "PORTAL_INVITE",
      entityId: row.id,
      details: { clientId: params.clientId, email },
    });

    const origin =
      process.env.NEXT_PUBLIC_APP_URL || "https://www.innovates.bt";
    return {
      access: row,
      inviteUrl: `${origin}/portal/accept?token=${token}`,
      email,
      clientName: client.name,
      expiresAt: expires,
    };
  }

  async getInviteByToken(token: string) {
    const [row] = await db
      .select({
        id: clientPortalAccess.id,
        clientId: clientPortalAccess.clientId,
        inviteEmail: clientPortalAccess.inviteEmail,
        inviteExpiresAt: clientPortalAccess.inviteExpiresAt,
        isActive: clientPortalAccess.isActive,
        clientName: clients.name,
      })
      .from(clientPortalAccess)
      .leftJoin(clients, eq(clientPortalAccess.clientId, clients.id))
      .where(eq(clientPortalAccess.inviteToken, token))
      .limit(1);

    if (!row) return null;
    if (
      row.inviteExpiresAt &&
      new Date(row.inviteExpiresAt).getTime() < Date.now()
    ) {
      return { ...row, expired: true as const };
    }
    return { ...row, expired: false as const };
  }

  async activateInvite(params: {
    token: string;
    authUserId: string;
    email: string;
    fullName?: string;
  }) {
    const invite = await this.getInviteByToken(params.token);
    if (!invite || invite.expired) {
      throw new Error("Invite invalid or expired");
    }

    const email = params.email.toLowerCase().trim();
    if (
      invite.inviteEmail &&
      invite.inviteEmail.toLowerCase() !== email
    ) {
      throw new Error("Sign up with the invited email address");
    }

    let profileId: number;
    const [existingProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, params.authUserId))
      .limit(1);

    if (existingProfile) {
      await db
        .update(profiles)
        .set({
          role: "CLIENT",
          fullName: params.fullName || existingProfile.fullName,
        })
        .where(eq(profiles.id, existingProfile.id));
      profileId = existingProfile.id;
    } else {
      const [created] = await db
        .insert(profiles)
        .values({
          userId: params.authUserId,
          fullName: params.fullName || invite.clientName || email,
          role: "CLIENT",
          capabilities: [],
        })
        .returning();
      profileId = created.id;
    }

    const [updated] = await db
      .update(clientPortalAccess)
      .set({
        authUserId: params.authUserId,
        profileId,
        isActive: true,
        activatedAt: new Date(),
        inviteToken: null,
        lastLogin: new Date(),
        loginCount: sql`COALESCE(${clientPortalAccess.loginCount}, 0) + 1`,
        updatedAt: new Date(),
      })
      .where(eq(clientPortalAccess.id, invite.id))
      .returning();

    return { access: updated, profileId, clientId: invite.clientId };
  }

  async touchLogin(accessId: number) {
    await db
      .update(clientPortalAccess)
      .set({
        lastLogin: new Date(),
        loginCount: sql`COALESCE(${clientPortalAccess.loginCount}, 0) + 1`,
        updatedAt: new Date(),
      })
      .where(eq(clientPortalAccess.id, accessId));
  }

  async listProjects(clientId: number) {
    return db
      .select({
        id: projects.id,
        name: projects.name,
        status: projects.status,
        productKey: projects.productKey,
        description: projects.description,
        startDate: projects.startDate,
        endDate: projects.endDate,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .where(eq(projects.clientId, clientId))
      .orderBy(desc(projects.updatedAt));
  }

  async listInvoices(clientId: number) {
    return db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        status: invoices.status,
        total: invoices.total,
        dueDate: invoices.dueDate,
        issueDate: invoices.issueDate,
        pdfUrl: invoices.pdfUrl,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .where(eq(invoices.clientId, clientId))
      .orderBy(desc(invoices.createdAt));
  }

  async getInvoiceForClient(clientId: number, invoiceId: number) {
    const [row] = await db
      .select()
      .from(invoices)
      .where(
        and(eq(invoices.id, invoiceId), eq(invoices.clientId, clientId))
      )
      .limit(1);
    return row || null;
  }

  async listAmcs(clientId: number) {
    return db
      .select({
        id: amcs.id,
        contractNumber: amcs.contractNumber,
        status: amcs.status,
        startDate: amcs.startDate,
        endDate: amcs.endDate,
        amount: amcs.amount,
        productKey: amcs.productKey,
      })
      .from(amcs)
      .where(eq(amcs.clientId, clientId))
      .orderBy(desc(amcs.endDate));
  }

  async listTickets(clientId: number) {
    return db
      .select({
        id: tickets.id,
        publicId: tickets.publicId,
        subject: tickets.subject,
        status: tickets.status,
        priority: tickets.priority,
        billable: tickets.billable,
        createdAt: tickets.createdAt,
        updatedAt: tickets.updatedAt,
      })
      .from(tickets)
      .where(eq(tickets.clientId, clientId))
      .orderBy(desc(tickets.createdAt));
  }

  async getTicketForClient(clientId: number, ticketId: number) {
    const [row] = await db
      .select()
      .from(tickets)
      .where(
        and(eq(tickets.id, ticketId), eq(tickets.clientId, clientId))
      )
      .limit(1);
    return row || null;
  }

  async createTicket(
    clientId: number,
    data: { subject: string; description?: string; priority?: string },
    profileId?: number
  ) {
    const priority = data.priority || "medium";
    const [ticket] = await db
      .insert(tickets)
      .values({
        publicId: makeTicketPublicId(),
        clientId,
        subject: data.subject,
        description: data.description,
        priority,
        status: "open",
        source: "portal",
        billable: false,
        slaDueAt: computeSlaDueAt(priority),
      })
      .returning();

    await writeAuditLog({
      operatorId: profileId,
      action: "CREATE",
      entityType: "TICKET",
      entityId: ticket.id,
      details: { source: "portal", clientId },
    });

    const moneyPeople = await getMoneyPeopleProfileIds();
    for (const pid of moneyPeople.slice(0, 20)) {
      await notificationService.createNotification({
        profileId: pid,
        title: "Portal ticket opened",
        message: `${ticket.publicId}: ${ticket.subject}`,
        type: "info",
        category: "ticket_assigned",
        entityType: "ticket",
        entityId: ticket.id,
        link: `/admin/tickets?ticketId=${ticket.id}`,
      });
    }

    return ticket;
  }

  async addTicketMessage(
    clientId: number,
    ticketId: number,
    profileId: number,
    message: string
  ) {
    const ticket = await this.getTicketForClient(clientId, ticketId);
    if (!ticket) throw new Error("Ticket not found");

    const [msg] = await db
      .insert(ticketMessages)
      .values({
        ticketId,
        senderId: profileId,
        message,
      })
      .returning();

    return msg;
  }

  async listTicketMessages(clientId: number, ticketId: number) {
    const ticket = await this.getTicketForClient(clientId, ticketId);
    if (!ticket) throw new Error("Ticket not found");
    return db
      .select()
      .from(ticketMessages)
      .where(eq(ticketMessages.ticketId, ticketId))
      .orderBy(asc(ticketMessages.createdAt));
  }

  async requestAmcRenew(
    clientId: number,
    amcId: number,
    profileId?: number,
    notes?: string
  ) {
    const [amc] = await db
      .select()
      .from(amcs)
      .where(and(eq(amcs.id, amcId), eq(amcs.clientId, clientId)))
      .limit(1);
    if (!amc) throw new Error("AMC not found");

    const meta =
      amc.meta && typeof amc.meta === "object"
        ? { ...(amc.meta as Record<string, unknown>) }
        : {};
    meta.portalRenewRequestedAt = new Date().toISOString();
    meta.portalRenewNotes = notes || null;

    await db
      .update(amcs)
      .set({ meta, updatedAt: new Date() })
      .where(eq(amcs.id, amcId));

    const [client] = await db
      .select({ name: clients.name })
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    const recipients = await getMoneyPeopleProfileIds();
    for (const pid of recipients) {
      await notificationService.notifyPortalAmcRenew(
        pid,
        client?.name || `Client #${clientId}`,
        amc.contractNumber || `AMC-${amc.id}`,
        amcId
      );
    }

    await writeAuditLog({
      operatorId: profileId,
      action: "UPDATE",
      entityType: "AMC",
      entityId: amcId,
      details: { portalRenewRequest: true, notes },
    });

    return { ok: true, amcId };
  }

  async submitPaymentProof(params: {
    clientId: number;
    invoiceId: number;
    proofUrl: string;
    method?: string;
    notes?: string;
    profileId?: number;
  }) {
    const invoice = await this.getInvoiceForClient(
      params.clientId,
      params.invoiceId
    );
    if (!invoice) throw new Error("Invoice not found");

    const [proof] = await db
      .insert(portalPaymentProofs)
      .values({
        clientId: params.clientId,
        invoiceId: params.invoiceId,
        method: params.method || "mbob",
        proofUrl: params.proofUrl,
        notes: params.notes,
        status: "submitted",
        submittedByProfileId: params.profileId,
      })
      .returning();

    const [client] = await db
      .select({ name: clients.name })
      .from(clients)
      .where(eq(clients.id, params.clientId))
      .limit(1);

    const recipients = await getMoneyPeopleProfileIds();
    for (const pid of recipients) {
      await notificationService.notifyPortalPaymentProof(
        pid,
        client?.name || `Client #${params.clientId}`,
        invoice.invoiceNumber || `INV-${invoice.id}`,
        params.invoiceId
      );
    }

    await writeAuditLog({
      operatorId: params.profileId,
      action: "CREATE",
      entityType: "PORTAL_PAYMENT_PROOF",
      entityId: proof.id,
      details: { invoiceId: params.invoiceId },
    });

    return proof;
  }

  async dashboard(clientId: number) {
    const [projectRows, invoiceRows, amcRows, ticketRows] = await Promise.all([
      this.listProjects(clientId),
      this.listInvoices(clientId),
      this.listAmcs(clientId),
      this.listTickets(clientId),
    ]);

    const unpaid = invoiceRows.filter((i) =>
      ["sent", "overdue", "draft"].includes(i.status || "")
    );
    const openTickets = ticketRows.filter((t) =>
      ["open", "started", "in_progress"].includes(t.status || "")
    );
    const expiringAmc = amcRows.filter((a) => {
      if (!a.endDate) return false;
      const end = new Date(a.endDate);
      const days = (end.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 30;
    });

    return {
      stats: {
        projects: projectRows.length,
        unpaidInvoices: unpaid.length,
        openTickets: openTickets.length,
        expiringAmc: expiringAmc.length,
      },
      projects: projectRows.slice(0, 5),
      invoices: invoiceRows.slice(0, 5),
      amcs: amcRows.slice(0, 5),
      tickets: ticketRows.slice(0, 5),
      payInstructions: PORTAL_PAY_INSTRUCTIONS,
    };
  }
}

export const portalService = new PortalService();
