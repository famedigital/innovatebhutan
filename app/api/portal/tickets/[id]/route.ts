import { NextRequest, NextResponse } from "next/server";
import { requirePortalContext } from "@/lib/portal/portalAuth";
import { portalService } from "@/lib/services/portalService";
import { formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";
import { z } from "zod";

const msgSchema = z.object({
  message: z.string().min(1).max(5000),
});

export async function GET(
  req: NextRequest,
  ctxParams: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requirePortalContext(req);
    const { id } = await ctxParams.params;
    const ticketId = parseInt(id, 10);
    const ticket = await portalService.getTicketForClient(
      ctx.clientId,
      ticketId
    );
    if (!ticket) {
      return NextResponse.json(
        { success: false, error: "Ticket not found" },
        { status: 404 }
      );
    }
    const messages = await portalService.listTicketMessages(
      ctx.clientId,
      ticketId
    );
    return NextResponse.json({ success: true, data: { ticket, messages } });
  } catch (error) {
    return NextResponse.json(formatApiError(error), {
      status: isApiError(error)
        ? (error as { statusCode?: number }).statusCode || 403
        : 403,
    });
  }
}

export async function POST(
  req: NextRequest,
  ctxParams: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requirePortalContext(req);
    const { id } = await ctxParams.params;
    const ticketId = parseInt(id, 10);
    const body = msgSchema.parse(await req.json());
    const msg = await portalService.addTicketMessage(
      ctx.clientId,
      ticketId,
      ctx.profile.id,
      body.message
    );
    return NextResponse.json({ success: true, data: msg }, { status: 201 });
  } catch (error) {
    return NextResponse.json(formatApiError(error), {
      status: isApiError(error)
        ? (error as { statusCode?: number }).statusCode || 500
        : 500,
    });
  }
}
