import { NextRequest, NextResponse } from "next/server";
import { ticketService } from "@/lib/services/ticketService";
import { createTicketSchema, ticketQuerySchema } from "@/lib/validations/ticket";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";
import { checkRateLimitMiddleware } from "@/lib/rate-limit/rate-limiter";

export async function GET(req: NextRequest) {
  try {
    const limited = checkRateLimitMiddleware(req, 120, 60000);
    if (limited) return limited;

    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const query = ticketQuerySchema.parse(params);
    const offset = (query.page - 1) * query.limit;

    const result = await ticketService.listTickets({
      status: query.status,
      priority: query.priority,
      clientId: query.clientId,
      search: query.search,
      limit: query.limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: result.tickets,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

export async function POST(req: NextRequest) {
  try {
    const limited = checkRateLimitMiddleware(req, 60, 60000);
    if (limited) return limited;

    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const body = await req.json();
    const data = createTicketSchema.parse(body);
    const ticket = await ticketService.createTicket(data, authContext.profile.id);

    return NextResponse.json(
      { success: true, data: ticket, message: "Ticket created" },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
