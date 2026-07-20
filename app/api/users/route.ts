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
  email: z.string().email(),
  fullName: z.string().min(1).max(255),
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

function adminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
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

    // Direct create (no email invite) — preferred for staff onboarding
    if (action === "create" || action === "invite") {
      const data = createUserSchema.parse({
        ...body,
        // invite path used to omit password; require create now
        password: body.password,
        createEmployee:
          body.createEmployee !== undefined
            ? body.createEmployee
            : dataRoleWantsEmployee(body.role),
      });

      const supabase = adminSupabase();

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

      if (createErr || !created.user) {
        return NextResponse.json(
          {
            success: false,
            error:
              createErr?.message ||
              "Failed to create auth user. Check email is unique and service role key is set.",
          },
          { status: 400 }
        );
      }

      const userId = created.user.id;

      const existing = await db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1);

      let profile = existing[0];
      if (!profile) {
        const [inserted] = await db
          .insert(profiles)
          .values({
            userId,
            fullName: data.fullName,
            role: data.role,
          })
          .returning();
        profile = inserted;
      } else {
        const [updated] = await db
          .update(profiles)
          .set({ fullName: data.fullName, role: data.role })
          .where(eq(profiles.id, profile.id))
          .returning();
        profile = updated;
      }

      let employeeId: number | null = null;
      if (
        data.createEmployee &&
        (data.role === "STAFF" || data.role === "ADMIN")
      ) {
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
            })
            .returning({ id: employees.id });
          employeeId = emp?.id ?? null;
        } else {
          employeeId = existingEmp[0].id;
        }
      }

      await writeAudit(auth.profile.id, "CREATE", profile.id, {
        email: data.email,
        role: data.role,
        via: "direct-create",
        employeeId,
      });

      return NextResponse.json({
        success: true,
        data: { ...profile, employeeId },
        message: employeeId
          ? "Staff created with login and employee record"
          : "User created with login",
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

function dataRoleWantsEmployee(role: unknown) {
  return role === "STAFF" || role === "ADMIN" || role === undefined;
}
