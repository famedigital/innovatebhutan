import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/db";
import { profiles, auditLogs, employees } from "@/db/schema";
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

const createUserSchema = z.object({
  email: z.string().email("Valid email required").transform((v) => v.trim().toLowerCase()),
  fullName: z.string().min(1, "Name is required").max(255).transform((v) => v.trim()),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "STAFF", "CLIENT"]).default("STAFF"),
  designation: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  createEmployee: z.boolean().optional().default(true),
});

const updateRoleSchema = z.object({
  profileId: z.number().int().positive(),
  role: z.enum(["ADMIN", "STAFF", "CLIENT"]),
});

function getServiceRoleKeyError(): string | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!key) {
    return "Server missing SUPABASE_SERVICE_ROLE_KEY. Add the service_role/secret key in Vercel env (not the publishable key).";
  }
  if (key.startsWith("sb_publishable_")) {
    return "SUPABASE_SERVICE_ROLE_KEY looks like a publishable key. Use the service_role or sb_secret key from Supabase → Project Settings → API.";
  }
  return null;
}

function adminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const keyError = getServiceRoleKeyError();
  if (!url) {
    return {
      client: null as ReturnType<typeof createClient> | null,
      keyError: "Server missing NEXT_PUBLIC_SUPABASE_URL.",
    };
  }
  if (keyError) {
    return { client: null as ReturnType<typeof createClient> | null, keyError };
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return {
    client: createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    }),
    keyError: null as string | null,
  };
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
      const parsed = updateRoleSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            details: parsed.error.flatten(),
          },
          { status: 400 }
        );
      }
      const data = parsed.data;
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

    if (action === "create" || action === "invite") {
      const parsed = createUserSchema.safeParse({
        email: body.email,
        fullName: body.fullName,
        password: body.password,
        role: body.role || "STAFF",
        designation: body.designation || undefined,
        department: body.department || undefined,
        phone: body.phone || undefined,
        createEmployee:
          body.createEmployee !== undefined
            ? body.createEmployee
            : body.role === "STAFF" ||
              body.role === "ADMIN" ||
              body.role === undefined,
      });

      if (!parsed.success) {
        const flat = parsed.error.flatten();
        const first =
          Object.values(flat.fieldErrors).flat()[0] ||
          flat.formErrors[0] ||
          "Validation failed";
        return NextResponse.json(
          {
            success: false,
            error: first,
            details: flat,
          },
          { status: 400 }
        );
      }

      const data = parsed.data;
      const { client: supabase, keyError } = adminSupabase();
      if (!supabase) {
        return NextResponse.json(
          {
            success: false,
            error:
              keyError ||
              "Server missing SUPABASE_SERVICE_ROLE_KEY. Add it in Vercel env to create users.",
          },
          { status: 503 }
        );
      }

      const { data: created, error: createErr } =
        await supabase.auth.admin.createUser({
          email: data.email,
          password: data.password,
          email_confirm: true,
          user_metadata: {
            full_name: data.fullName,
            role: data.role,
          },
        });

      if (createErr || !created?.user) {
        const msg = createErr?.message || "Failed to create auth user";
        console.error("[users] createUser failed:", createErr);
        let friendly = msg;
        if (/already.*(registered|been|exists)/i.test(msg)) {
          friendly =
            "That email already has an account. Use a different email.";
        } else if (/password/i.test(msg)) {
          friendly = `Password rejected: ${msg}`;
        } else if (/bearer|token|jwt|apikey|not allowed/i.test(msg)) {
          friendly =
            "Auth admin rejected the server key. Set SUPABASE_SERVICE_ROLE_KEY to the service_role/secret key (not publishable) in Vercel and redeploy.";
          return NextResponse.json(
            { success: false, error: friendly },
            { status: 503 }
          );
        }
        return NextResponse.json(
          { success: false, error: friendly },
          { status: 400 }
        );
      }

      const userId = created.user.id;

      // Wait briefly if a DB trigger creates the profile
      let profile =
        (
          await db
            .select()
            .from(profiles)
            .where(eq(profiles.userId, userId))
            .limit(1)
        )[0] || null;

      if (!profile) {
        try {
          const [inserted] = await db
            .insert(profiles)
            .values({
              userId,
              fullName: data.fullName,
              role: data.role,
            })
            .returning();
          profile = inserted;
        } catch (insertErr) {
          // Race with auth trigger — fetch again
          console.warn("[users] profile insert race, refetching", insertErr);
          profile =
            (
              await db
                .select()
                .from(profiles)
                .where(eq(profiles.userId, userId))
                .limit(1)
            )[0] || null;
          if (profile) {
            const [updated] = await db
              .update(profiles)
              .set({ fullName: data.fullName, role: data.role })
              .where(eq(profiles.id, profile.id))
              .returning();
            profile = updated;
          }
        }
      } else {
        const [updated] = await db
          .update(profiles)
          .set({ fullName: data.fullName, role: data.role })
          .where(eq(profiles.id, profile.id))
          .returning();
        profile = updated;
      }

      if (!profile) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Auth user created but profile row failed. Check profiles table / triggers.",
          },
          { status: 500 }
        );
      }

      let employeeId: number | null = null;
      let employeeError: string | null = null;
      if (
        data.createEmployee &&
        (data.role === "STAFF" || data.role === "ADMIN")
      ) {
        try {
          const existingEmp = await db
            .select({ id: employees.id })
            .from(employees)
            .where(eq(employees.profileId, profile.id))
            .limit(1);

          if (!existingEmp[0]) {
            const [emp] = await db
              .insert(employees)
              .values({
                profileId: profile.id,
                designation: data.designation || "Staff",
                department: data.department || undefined,
                phone: data.phone || undefined,
                email: data.email,
                status: "active",
                availability: "available",
              })
              .returning({ id: employees.id });
            employeeId = emp?.id ?? null;
          } else {
            employeeId = existingEmp[0].id;
          }
        } catch (empErr) {
          employeeError =
            empErr instanceof Error ? empErr.message : "Employee create failed";
          console.error("[users] employee create failed:", empErr);
        }
      }

      await writeAudit(auth.profile.id, "CREATE", profile.id, {
        email: data.email,
        role: data.role,
        via: "direct-create",
        employeeId,
        employeeError,
      });

      if (data.createEmployee && !employeeId) {
        return NextResponse.json(
          {
            success: true,
            warning: true,
            data: { ...profile, employeeId: null },
            error:
              employeeError ||
              "User created but employee record missing — they will not appear in client assign until fixed.",
            message:
              "Login works, but assign-to-client needs an Employees row. Open Clients again (auto-backfill) or add them under Employees.",
          },
          { status: 201 }
        );
      }

      return NextResponse.json({
        success: true,
        data: { ...profile, employeeId },
        message: employeeId
          ? "Staff created — they can log in with the password you set"
          : "User created — they can log in with the password you set",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Use create or update-role." },
      { status: 400 }
    );
  } catch (error) {
    console.error("[users] POST error:", error);
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
