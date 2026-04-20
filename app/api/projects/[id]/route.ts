import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { projectService } from "@/lib/services/projectService";
import { updateProjectSchema } from "@/lib/validations/project";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, ForbiddenError, RateLimitError, NotFoundError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/projects/[id] - Get a single project with tasks
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔒 Require authentication
    const { profile } = await requireApiAuth(req);
    // 🔒 Require admin or staff role
    requireStaffOrAdmin(profile);

    const { id } = await params;
    const projectId = validateId(id, "project ID");

    const result = await projectService.getProjectWithTasks(projectId, profile.userId);

    if (!result) {
      throw new NotFoundError("Project");
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Project fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// PATCH /api/projects/[id] - Update a project or restore a soft deleted project
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔒 Rate limiting
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(
      clientIp,
      rateLimitPresets.strict.maxRequests,
      rateLimitPresets.strict.windowMs
    );

    if (!rateLimitResult.allowed) {
      throw new RateLimitError(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
    }

    // 🔒 Require authentication
    const { profile } = await requireApiAuth(req);

    const { id } = await params;
    const projectId = validateId(id, "project ID");

    const body = await req.json();

    // Check if this is a restore request
    if (body.action === 'restore') {
      // 🔒 Require admin role for restore
      if (profile.role !== 'ADMIN') {
        throw new ForbiddenError("Only administrators can restore projects");
      }

      await projectService.restoreProject(projectId, profile.userId, profile.role);

      // Log to audit
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("audit_logs").insert([
        {
          action: "RESTORE",
          entity_type: "PROJECT",
          entity_id: projectId,
          operator_id: profile.userId,
          details: { restored_project_id: projectId },
        },
      ]);

      return NextResponse.json({
        success: true,
        message: "Project restored successfully",
      });
    }

    // Normal update path
    // 🔒 Require admin or staff role for updates
    requireStaffOrAdmin(profile);

    // Validate request body
    const validatedData = validateRequest(updateProjectSchema, body);

    const project = await projectService.updateProject(
      projectId,
      validatedData,
      profile.userId,
      profile.role
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "UPDATE",
        entity_type: "PROJECT",
        entity_id: projectId,
        operator_id: profile.userId,
        details: { updates: validatedData },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Project update/restore error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔒 Rate limiting
    const clientIp = getClientIp(req);
    const rateLimitResult = checkRateLimit(
      clientIp,
      rateLimitPresets.strict.maxRequests,
      rateLimitPresets.strict.windowMs
    );

    if (!rateLimitResult.allowed) {
      throw new RateLimitError(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
    }

    // 🔒 Require authentication
    const { profile } = await requireApiAuth(req);
    // 🔒 Require admin role for deletion
    if (profile.role !== 'ADMIN') {
      throw new ForbiddenError("Only administrators can delete projects");
    }

    const { id } = await params;
    const projectId = validateId(id, "project ID");

    await projectService.deleteProject(projectId, profile.userId, profile.role);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "DELETE",
        entity_type: "PROJECT",
        entity_id: projectId,
        operator_id: profile.userId,
        details: { deleted_project_id: projectId },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Project deletion error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
