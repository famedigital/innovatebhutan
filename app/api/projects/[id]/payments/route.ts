import { NextRequest, NextResponse } from "next/server";
import { projectService } from "@/lib/services/projectService";
import {
  recordPaymentSchema,
  writeOffSchema,
} from "@/lib/validations/project";
import {
  requireApiAuth,
  requireStaffOrAdmin,
  requireSeeMoney,
  formatApiError,
  getClientIp,
} from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError, NotFoundError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";
import { moneySummary, parseMoneyMeta } from "@/lib/projects/moneyMeta";
import { normalizeStatus } from "@/lib/services/projectService";

/**
 * POST /api/projects/[id]/payments
 * Body: { slot: "advance"|"balance", amount, method, proofUrl?, paidAt? }
 * or { action: "write_off", amount, reason }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(
      clientIp,
      rateLimitPresets.strict.maxRequests,
      rateLimitPresets.strict.windowMs
    );
    if (!rateLimitResult.allowed) {
      throw new RateLimitError(
        Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)
      );
    }

    const authContext = await requireApiAuth(req);
    requireStaffOrAdmin(authContext.profile);
    requireSeeMoney(authContext.profile);

    const { id } = await params;
    const projectId = validateId(id, "project ID");
    const body = await req.json();

    let project;
    if (body.action === "write_off") {
      const data = validateRequest(writeOffSchema, body);
      project = await projectService.writeOffBalance(
        projectId,
        {
          amount: data.amount,
          reason: data.reason,
          by: authContext.profile.userId,
        },
        {
          role: authContext.profile.role,
          capabilities: authContext.profile.capabilities,
        }
      );
    } else {
      const data = validateRequest(recordPaymentSchema, body);
      project = await projectService.recordPayment(
        projectId,
        {
          slot: data.slot,
          amount: data.amount,
          method: data.method,
          proofUrl: data.proofUrl || undefined,
          paidAt: data.paidAt,
          recordedBy: authContext.profile.userId,
        },
        {
          role: authContext.profile.role,
          capabilities: authContext.profile.capabilities,
        }
      );
    }

    if (!project) throw new NotFoundError("Project");

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        status: normalizeStatus(project.status),
        moneySummary: moneySummary(parseMoneyMeta(project.moneyMeta)),
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("[API /api/projects/[id]/payments]", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
