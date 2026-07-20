import { NextRequest, NextResponse } from "next/server";
import { requirePortalContext } from "@/lib/portal/portalAuth";
import { portalService } from "@/lib/services/portalService";
import { formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  ctxParams: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requirePortalContext(req);
    const { id } = await ctxParams.params;
    const invoiceId = parseInt(id, 10);
    const invoice = await portalService.getInvoiceForClient(
      ctx.clientId,
      invoiceId
    );
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "Invoice not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    return NextResponse.json(formatApiError(error), {
      status: isApiError(error)
        ? (error as { statusCode?: number }).statusCode || 403
        : 403,
    });
  }
}
