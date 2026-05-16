import { NextRequest, NextResponse } from "next/server";
import { amcService } from "@/lib/services/amcService";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";
import { z } from "zod";

// Query schema for expiring AMCs
const expiringQuerySchema = z.object({
  daysThreshold: z.coerce.number().int().positive().default(30),
  includeClientDetails: z.coerce.boolean().default(false),
});

/**
 * GET /api/amc/expiring - Get AMCs expiring within threshold
 * Used by notification jobs and dashboard alerts
 */
export async function GET(req: NextRequest) {
  try {
    console.log("[API /api/amc/expiring] GET request received");
    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);

    const searchParams = req.nextUrl.searchParams;
    const { daysThreshold, includeClientDetails } = Object.fromEntries(
      searchParams.entries()
    );

    const validated = expiringQuerySchema.safeParse({
      daysThreshold,
      includeClientDetails,
    });

    if (!validated.success) {
      console.warn("[API /api/amc/expiring] Invalid query parameters:", validated.error.flatten());
      return NextResponse.json(
        { success: false, error: "Invalid query parameters", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const expiringAMCs = await amcService.getExpiringAMCs(validated.data.daysThreshold);
    console.log("[API /api/amc/expiring] Found", expiringAMCs.length, "expiring AMCs");

    return NextResponse.json({
      success: true,
      data: expiringAMCs,
      meta: {
        threshold: validated.data.daysThreshold,
        count: expiringAMCs.length,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("[API /api/amc/expiring] Expiring AMCs fetch error:", {
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
