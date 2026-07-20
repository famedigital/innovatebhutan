import { NextRequest, NextResponse } from "next/server";
import { requirePortalContext } from "@/lib/portal/portalAuth";
import { portalService } from "@/lib/services/portalService";
import { formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";
import { z } from "zod";

const createSchema = z.object({
  subject: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const ctx = await requirePortalContext(req);
    const data = await portalService.listTickets(ctx.clientId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(formatApiError(error), {
      status: isApiError(error)
        ? (error as { statusCode?: number }).statusCode || 403
        : 403,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requirePortalContext(req);
    const body = createSchema.parse(await req.json());
    const ticket = await portalService.createTicket(
      ctx.clientId,
      body,
      ctx.profile.id
    );
    return NextResponse.json(
      { success: true, data: ticket },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(formatApiError(error), {
      status: isApiError(error)
        ? (error as { statusCode?: number }).statusCode || 500
        : 500,
    });
  }
}
