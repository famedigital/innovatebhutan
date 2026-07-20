import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { portalService } from "@/lib/services/portalService";
import { formatApiError } from "@/lib/auth/api-auth";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(16),
  password: z.string().min(8),
  fullName: z.string().min(1).max(255).optional(),
});

/**
 * POST /api/portal/accept-invite
 * Creates auth user (or signs in) and activates portal invite.
 */
export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const invite = await portalService.getInviteByToken(body.token);
    if (!invite || invite.expired) {
      return NextResponse.json(
        { success: false, error: "Invite invalid or expired" },
        { status: 400 }
      );
    }
    if (!invite.inviteEmail) {
      return NextResponse.json(
        { success: false, error: "Invite has no email" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const email = invite.inviteEmail;

    // Try sign up; if exists, sign in with password
    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email,
        password: body.password,
        options: {
          data: { full_name: body.fullName || invite.clientName },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || ""}/portal`,
        },
      });

    let authUserId = signUpData.user?.id;

    if (signUpError || !authUserId) {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password: body.password,
        });
      if (signInError || !signInData.user) {
        return NextResponse.json(
          {
            success: false,
            error:
              signUpError?.message ||
              signInError?.message ||
              "Could not create or sign in account. If you already registered, use the invited email and correct password.",
          },
          { status: 400 }
        );
      }
      authUserId = signInData.user.id;
    }

    const activated = await portalService.activateInvite({
      token: body.token,
      authUserId,
      email,
      fullName: body.fullName,
    });

    return NextResponse.json({
      success: true,
      data: {
        clientId: activated.clientId,
        profileId: activated.profileId,
        redirect: "/portal",
      },
      message: "Portal access activated",
    });
  } catch (error) {
    return NextResponse.json(formatApiError(error), { status: 500 });
  }
}
