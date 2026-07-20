import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients, amcs, invoices, tickets } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireApiAuth, formatApiError } from "@/lib/auth/api-auth";

/**
 * GET /api/clients/[id]/details - Get comprehensive client details
 *
 * Returns client information with related AMCs, invoices, and tickets
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate
    const authContext = await requireApiAuth(req);

    const { id } = await params;
    const clientId = parseInt(id);
    if (isNaN(clientId)) {
      return NextResponse.json(
        { success: false, error: "Invalid client ID" },
        { status: 400 }
      );
    }

    // Fetch client details
    const [clientData] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (!clientData) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    // Fetch related data in parallel
    const [clientAMCs, clientInvoices, clientTickets] = await Promise.all([
      db
        .select({
          id: amcs.id,
          contractNumber: amcs.contractNumber,
          startDate: amcs.startDate,
          endDate: amcs.endDate,
          amount: amcs.amount,
          status: amcs.status,
          productKey: amcs.productKey,
          renewedFrom: amcs.renewedFrom,
          renewedTo: amcs.renewedTo,
          createdAt: amcs.createdAt,
        })
        .from(amcs)
        .where(eq(amcs.clientId, clientId))
        .orderBy(desc(amcs.endDate))
        .limit(50),

      db
        .select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          total: invoices.total,
          status: invoices.status,
          dueDate: invoices.dueDate,
        })
        .from(invoices)
        .where(eq(invoices.clientId, clientId))
        .orderBy(desc(invoices.createdAt))
        .limit(5),

      db
        .select({
          id: tickets.id,
          subject: tickets.subject,
          status: tickets.status,
          priority: tickets.priority,
          createdAt: tickets.createdAt,
        })
        .from(tickets)
        .where(eq(tickets.clientId, clientId))
        .orderBy(desc(tickets.createdAt))
        .limit(10),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        ...clientData,
        amcs: clientAMCs,
        invoices: clientInvoices,
        tickets: clientTickets,
      },
    });
  } catch (error) {
    console.error("[API /api/clients/[id]/details] Error:", error);
    return NextResponse.json(formatApiError(error), {
      status: error instanceof Error && "statusCode" in error
        ? (error as any).statusCode
        : 500,
    });
  }
}
