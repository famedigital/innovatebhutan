import { NextRequest, NextResponse } from "next/server";
import { requirePortalContext } from "@/lib/portal/portalAuth";
import {
  portalService,
  PORTAL_PAY_INSTRUCTIONS,
} from "@/lib/services/portalService";
import { formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const ctx = await requirePortalContext(req);
    const data = await portalService.listInvoices(ctx.clientId);
    return NextResponse.json({
      success: true,
      data,
      payInstructions: PORTAL_PAY_INSTRUCTIONS,
    });
  } catch (error) {
    return NextResponse.json(formatApiError(error), {
      status: isApiError(error)
        ? (error as { statusCode?: number }).statusCode || 403
        : 403,
    });
  }
}
