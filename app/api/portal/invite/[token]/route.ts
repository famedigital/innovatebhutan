import { NextRequest, NextResponse } from "next/server";
import { portalService } from "@/lib/services/portalService";
import { formatApiError } from "@/lib/auth/api-auth";

/** GET /api/portal/invite/[token] — public invite preview */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await ctx.params;
    const invite = await portalService.getInviteByToken(token);
    if (!invite) {
      return NextResponse.json(
        { success: false, error: "Invite not found" },
        { status: 404 }
      );
    }
    if (invite.expired) {
      return NextResponse.json(
        { success: false, error: "Invite expired", data: { expired: true } },
        { status: 410 }
      );
    }
    return NextResponse.json({
      success: true,
      data: {
        email: invite.inviteEmail,
        clientName: invite.clientName,
        clientId: invite.clientId,
        alreadyActive: invite.isActive,
      },
    });
  } catch (error) {
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
}
