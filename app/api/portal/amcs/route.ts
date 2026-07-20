import { NextRequest, NextResponse } from "next/server";
import { requirePortalContext } from "@/lib/portal/portalAuth";
import { portalService } from "@/lib/services/portalService";
import { formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";
import { z } from "zod";

const renewSchema = z.object({
  notes: z.string().max(2000).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const ctx = await requirePortalContext(req);
    const data = await portalService.listAmcs(ctx.clientId);
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
    const url = new URL(req.url);
    const amcId = parseInt(url.searchParams.get("amcId") || "0", 10);
    if (!amcId) {
      const body = await req.json().catch(() => ({}));
      const id = Number(body.amcId);
      if (!id) {
        return NextResponse.json(
          { success: false, error: "amcId required" },
          { status: 400 }
        );
      }
      const notes = renewSchema.parse(body).notes;
      const result = await portalService.requestAmcRenew(
        ctx.clientId,
        id,
        ctx.profile.id,
        notes
      );
      return NextResponse.json({ success: true, data: result });
    }
    const body = renewSchema.parse(await req.json().catch(() => ({})));
    const result = await portalService.requestAmcRenew(
      ctx.clientId,
      amcId,
      ctx.profile.id,
      body.notes
    );
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(formatApiError(error), {
      status: isApiError(error)
        ? (error as { statusCode?: number }).statusCode || 500
        : 500,
    });
  }
}
