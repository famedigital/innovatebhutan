import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth, requireCapability, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";
import { portalService } from "@/lib/services/portalService";
import { z } from "zod";

const bodySchema = z.object({
  clientId: z.number().int().positive(),
  email: z.string().email(),
  expiresInDays: z.number().int().positive().max(90).optional(),
});

/** POST /api/portal/invite — staff invites a client (provision_users or ADMIN) */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireApiAuth(req);
    requireCapability(auth.profile, "provision_users");

    const body = bodySchema.parse(await req.json());
    const result = await portalService.inviteClient({
      clientId: body.clientId,
      email: body.email,
      invitedByProfileId: auth.profile.id,
      expiresInDays: body.expiresInDays,
    });

    return NextResponse.json({
      success: true,
      data: {
        inviteUrl: result.inviteUrl,
        email: result.email,
        clientName: result.clientName,
        expiresAt: result.expiresAt,
        accessId: result.access.id,
      },
    });
  } catch (error) {
    return NextResponse.json(formatApiError(error), {
      status: isApiError(error) ? (error as { statusCode?: number }).statusCode || 500 : 500,
    });
  }
}
