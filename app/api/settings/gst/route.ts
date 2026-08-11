import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { loadGstSettings } from "@/lib/settings/gstSettings";

/** Staff-only: current ERP GST rate for quotation UI */
export async function GET(req: NextRequest) {
  try {
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    const gst = await loadGstSettings();
    return NextResponse.json({
      success: true,
      data: { ratePercent: gst.ratePercent },
    });
  } catch (error) {
    return NextResponse.json(formatApiError(error), {
      status:
        error instanceof Error && "statusCode" in error
          ? (error as { statusCode: number }).statusCode
          : 500,
    });
  }
}
