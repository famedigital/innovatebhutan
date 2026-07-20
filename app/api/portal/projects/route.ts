import { NextRequest, NextResponse } from "next/server";
import { requirePortalContext } from "@/lib/portal/portalAuth";
import { portalService } from "@/lib/services/portalService";
import { formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const ctx = await requirePortalContext(req);
    const data = await portalService.listProjects(ctx.clientId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(formatApiError(error), {
      status: isApiError(error) ? (error as { statusCode?: number }).statusCode || 403 : 403,
    });
  }
}
