import { NextRequest, NextResponse } from "next/server";
import { ticketService } from "@/lib/services/ticketService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    const auth = await requireApiAuth(req);
    requireStaffOrAdmin(auth.profile);
    const id = parseInt((await params).id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
    }
    const body = await req.json().catch(() => ({}));
    const action = body?.action as string;

    if (action === "start") {
      const result = await ticketService.startTicket(id, auth.profile.id);
      return NextResponse.json({ success: true, data: result });
    }
    if (action === "acknowledge") {
      const ticket = await ticketService.acknowledgeTicket(id, auth.profile.id);
      return NextResponse.json({ success: true, data: ticket });
    }
    if (action === "resolve") {
      const result = await ticketService.resolveTicket(id, auth.profile.id);
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json(
      { success: false, error: "action must be start | acknowledge | resolve" },
      { status: 400 }
    );
  } catch (error) {
    const statusCode = isApiError(error)
      ? (error as { statusCode?: number }).statusCode || 500
      : 500;
    return NextResponse.json(formatApiError(error), { status: statusCode });
  }
}
