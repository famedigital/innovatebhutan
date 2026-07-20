import { NextRequest, NextResponse } from "next/server";
import { requirePortalContext } from "@/lib/portal/portalAuth";
import { portalService } from "@/lib/services/portalService";
import { formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

/** GET /api/portal/me — dashboard summary for invited client */
export async function GET(req: NextRequest) {
  try {
    const ctx = await requirePortalContext(req);
    if (ctx.access.id > 0) {
      await portalService.touchLogin(ctx.access.id);
    }
    const data = await portalService.dashboard(ctx.clientId);
    return NextResponse.json({
      success: true,
      data: {
        ...data,
        clientId: ctx.clientId,
        clientName: ctx.clientName,
        email: ctx.user.email,
      },
    });
  } catch (error) {
    return NextResponse.json(formatApiError(error), {
      status: isApiError(error) ? (error as { statusCode?: number }).statusCode || 403 : 403,
    });
  }
}
