import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { milestoneService } from "@/lib/services/milestoneService";
import { requireApiAuth, formatApiError } from "@/lib/auth/api-auth";
import { isApiError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Validation schemas
const createMilestoneSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  status: z.enum(["pending", "in_progress", "complete", "cancelled"]).optional(),
  dueDate: z.coerce.date().optional(),
  position: z.number().int().optional(),
});

const updateMilestoneSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(["pending", "in_progress", "complete", "cancelled"]).optional(),
  dueDate: z.coerce.date().optional(),
  position: z.number().int().optional(),
});

// GET /api/projects/[id]/milestones - Get all milestones for a project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);

    const { id } = await params;
    const projectId = validateId(id, "project ID");

    const milestones = await milestoneService.getMilestonesByProject(projectId, profile.userId);
    const stats = await milestoneService.getMilestoneStats(projectId);

    return NextResponse.json({
      success: true,
      data: milestones,
      stats,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Milestones fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// POST /api/projects/[id]/milestones - Create a new milestone
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);

    const { id } = await params;
    const projectId = validateId(id, "project ID");

    const body = await req.json();
    const validatedData = validateRequest(createMilestoneSchema, body);

    const milestone = await milestoneService.createMilestone(
      {
        projectId,
        ...validatedData,
      },
      profile.userId,
      profile.role
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CREATE",
        entity_type: "MILESTONE",
        entity_id: milestone.id,
        operator_id: profile.userId,
        details: {
          project_id: projectId,
          milestone_name: milestone.name,
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Milestone created successfully",
        data: milestone,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Milestone creation error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
