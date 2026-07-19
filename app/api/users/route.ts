import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/db";
import { profiles, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  requireApiAuth,
  requireAdmin,
  formatApiError,
  getClientIp,
} from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError } from "@/lib/errors";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1).max(255),
  role: z.enum(["ADMIN", "STAFF", "CLIENT"]).default("STAFF"),
});

const updateRoleSchema = z.object({
  profileId: z.number().int().positive(),
  role: z.enum(["ADMIN", "STAFF", "CLIENT"]),
});

function adminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function writeAudit(
  operatorId: number,
  action: string,
  entityId: number,
  details: Record<string, unknown>
) {
  try {
    await db.insert(auditLogs).values({
      operatorId,
      action,
      entityType: "PROFILE",
      entityId,
      details,
    });
  } catch (e) {
    console.warn("[users] audit log skipped", e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireApiAuth(req);
    requireAdmin(auth.profile);

    const rows = await db
      .select({
        id: profiles.id,
        userId: profiles.userId,
        fullName: profiles.fullName,
        role: profiles.role,
        createdAt: profiles.createdAt,
      })
      .from(profiles)
      .orderBy(profiles.id);

    return NextResponse.json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    const status = isApiError(error)
      ? (error as { statusCode?: number }).statusCode || 500
      : 500;
    return NextResponse.json(formatApiError(error), { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rl = checkRateLimit(
      clientIp,
      rateLimitPresets.default.maxRequests,
      rateLimitPresets.default.windowMs
    );
    if (!rl.allowed) {
      throw new RateLimitError(Math.ceil((rl.resetAt - Date.now()) / 1000));
    }

    const auth = await requireApiAuth(req);
    requireAdmin(auth.profile);

    const body = await req.json();
    const action = body.action as string;

    if (action === "update-role") {
      const data = updateRoleSchema.parse(body);
      const [updated] = await db
        .update(profiles)
        .set({ role: data.role })
        .where(eq(profiles.id, data.profileId))
        .returning();

      if (!updated) {
        return NextResponse.json(
          { success: false, error: "Profile not found" },
          { status: 404 }
        );
      }

      await writeAudit(auth.profile.id, "UPDATE", updated.id, {
        role: data.role,
      });

      return NextResponse.json({
        success: true,
        data: updated,
        message: "Role updated",
      });
    }

    if (action === "invite") {
      const data = inviteSchema.parse(body);
      const supabase = adminSupabase();

      let userId: string | null = null;
      let message = "Invite sent";

      const { data: invited, error } =
        await supabase.auth.admin.inviteUserByEmail(data.email, {
          data: { full_name: data.fullName, role: data.role },
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/login`,
        });

      if (error || !invited?.user) {
        const { data: created, error: createErr } =
          await supabase.auth.admin.createUser({
            email: data.email,
            email_confirm: true,
            user_metadata: { full_name: data.fullName, role: data.role },
          });

        if (createErr || !created.user) {
          return NextResponse.json(
            {
              success: false,
              error: error?.message || createErr?.message || "Invite failed",
            },
            { status: 400 }
          );
        }
        userId = created.user.id;
        message =
          "User created. They can use password recovery from login if needed.";
      } else {
        userId = invited.user.id;
      }

      const existing = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);

      let profile = existing[0];
      if (!profile) {
        const [created] = await db
          .insert(profiles)
          .values({
            userId,
            fullName: data.fullName,
            role: data.role,
          })
          .returning();
        profile = created;
      } else {
        const [updated] = await db
          .update(profiles)
          .set({ fullName: data.fullName, role: data.role })
          .where(eq(profiles.id, profile.id))
          .returning();
        profile = updated;
      }

      await writeAudit(auth.profile.id, "CREATE", profile.id, {
        email: data.email,
        role: data.role,
        via: "invite",
      });

      return NextResponse.json({
        success: true,
        data: profile,
        message,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.flatten(),
        },
        { status: 400 }
      );
    }
    const status = isApiError(error)
      ? (error as { statusCode?: number }).statusCode || 500
      : 500;
    return NextResponse.json(formatApiError(error), { status });
  }
}
