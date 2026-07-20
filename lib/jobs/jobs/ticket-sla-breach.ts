/**
 * Ticket SLA breach job — marks overdue open/started tickets and notifies.
 */

import { db } from "@/db";
import { tickets, profiles } from "@/db/schema";
import { and, eq, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { notificationService } from "@/lib/services/notificationService";
import type { JobResult } from "../scheduler";

async function moneyPeopleIds(): Promise<number[]> {
  const rows = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(
      or(
        eq(profiles.role, "ADMIN"),
        eq(profiles.role, "SUPERADMIN"),
        sql`${profiles.capabilities}::jsonb ? 'see_money'`
      )
    );
  return rows.map((r) => r.id);
}

export async function ticketSlaBreachJob(): Promise<JobResult> {
  const startTime = Date.now();
  try {
    const now = new Date();
    const overdue = await db
      .select({
        id: tickets.id,
        publicId: tickets.publicId,
        subject: tickets.subject,
        assignedTo: tickets.assignedTo,
        priority: tickets.priority,
        slaDueAt: tickets.slaDueAt,
      })
      .from(tickets)
      .where(
        and(
          inArray(tickets.status, ["open", "started"]),
          isNull(tickets.slaBreachedAt),
          lte(tickets.slaDueAt, now)
        )
      )
      .limit(200);

    const admins = await moneyPeopleIds();
    let notified = 0;

    for (const t of overdue) {
      await db
        .update(tickets)
        .set({ slaBreachedAt: now, updatedAt: now })
        .where(eq(tickets.id, t.id));

      const recipients = new Set<number>(admins);
      if (t.assignedTo) recipients.add(t.assignedTo);

      await notificationService.notifyTicketSlaBreach(
        [...recipients],
        t.id,
        t.publicId || `TKT-${t.id}`,
        t.subject,
        t.priority || "medium"
      );
      notified++;
    }

    return {
      success: true,
      jobName: "Ticket SLA Breach Check",
      ranAt: new Date(),
      duration: Date.now() - startTime,
      result: { breached: overdue.length, notified },
    };
  } catch (error: unknown) {
    return {
      success: false,
      jobName: "Ticket SLA Breach Check",
      ranAt: new Date(),
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
