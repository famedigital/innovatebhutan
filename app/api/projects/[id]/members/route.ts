import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { projectMemberService } from "@/lib/services/projectMemberService";
import { requireApiAuth, formatApiError } from "@/lib/auth/api-auth";
import { isApiError, ForbiddenError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Validation schemas
const addMemberSchema = z.object({
  userId: z.string(),
  role: z.enum(["owner", "lead", "member", "viewer", "client_viewer"]),
});

const updateMemberRoleSchema = z.object({
  role: z.enum(["owner", "lead", "member", "viewer", "client_viewer"]),
});

const removeMemberSchema = z.object({
  userId: z.string(),
});

// GET /api/projects/[id]/members - Get all members of a project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);

    const { id } = await params;
    const projectId = validateId(id, "project ID");

    // Check if user can view the project
    const canView = await projectMemberService.canViewProject(projectId, profile.userId);
    if (!canView && profile.role !== "ADMIN" && profile.role !== "STAFF") {
      throw new ForbiddenError("You do not have permission to view this project");
    }

    const members = await projectMemberService.getMembers(projectId);

    return NextResponse.json({
      success: true,
      data: members,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Members fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// POST /api/projects/[id]/members - Add a member to a project
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);

    const { id } = await params;
    const projectId = validateId(id, "project ID");

    const body = await req.json();
    const validatedData = validateRequest(addMemberSchema, body);

    const member = await projectMemberService.addMember(
      projectId,
      validatedData.userId,
      validatedData.role,
      profile.userId,
      profile.role
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CREATE",
        entity_type: "PROJECT_MEMBER",
        entity_id: member.id,
        operator_id: profile.userId,
        details: {
          project_id: projectId,
          user_id: member.userId,
          role: member.role,
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Member added successfully",
        data: member,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Add member error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// PATCH /api/projects/[id]/members - Update member role or remove members
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);

    const { id } = await params;
    const projectId = validateId(id, "project ID");

    const body = await req.json();
    const { action, ...data } = body;

    if (action === "update_role") {
      const validatedData = validateRequest(updateMemberRoleSchema, data);

      const member = await projectMemberService.updateMemberRole(
        projectId,
        data.userId,
        validatedData.role,
        profile.userId,
        profile.role
      );

      // Log to audit
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("audit_logs").insert([
        {
          action: "UPDATE",
          entity_type: "PROJECT_MEMBER",
          entity_id: member.id,
          operator_id: profile.userId,
          details: {
            project_id: projectId,
            user_id: member.userId,
            new_role: member.role,
          },
        },
      ]);

      return NextResponse.json({
        success: true,
        message: "Member role updated successfully",
        data: member,
      });
    }

    throw new BadRequestError("Invalid action");
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Update member error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// DELETE /api/projects/[id]/members - Remove a member from a project
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);

    const { id } = await params;
    const projectId = validateId(id, "project ID");

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      throw new BadRequestError("User ID is required");
    }

    await projectMemberService.removeMember(projectId, userId, profile.userId, profile.role);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "DELETE",
        entity_type: "PROJECT_MEMBER",
        entity_id: projectId,
        operator_id: profile.userId,
        details: {
          project_id: projectId,
          user_id: userId,
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Remove member error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
