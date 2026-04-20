import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { milestoneService } from "@/lib/services/milestoneService";
import { requireApiAuth, formatAuthError } from "@/lib/auth/api-auth";
import { AuthError } from "@/lib/errors/auth-error";
import { z } from "zod";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Validation schema
const updateMilestoneSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(["pending", "in_progress", "complete", "cancelled"]).optional(),
  dueDate: z.coerce.date().optional(),
  position: z.number().int().optional(),
});

// GET /api/milestones/[id] - Get a single milestone
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);

    const { id } = await params;
    const milestoneId = parseInt(id);

    if (isNaN(milestoneId)) {
      return NextResponse.json(
        { success: false, error: "Invalid milestone ID" },
        { status: 400 }
      );
    }

    const milestone = await milestoneService.getMilestoneById(milestoneId);

    if (!milestone) {
      return NextResponse.json(
        { success: false, error: "Milestone not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: milestone,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(formatAuthError(error), { status: error.statusCode });
    }
    console.error("Milestone fetch error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to fetch milestone" },
      { status: 500 }
    );
  }
}

// PATCH /api/milestones/[id] - Update a milestone
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);

    const { id } = await params;
    const milestoneId = parseInt(id);

    if (isNaN(milestoneId)) {
      return NextResponse.json(
        { success: false, error: "Invalid milestone ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validationResult = updateMilestoneSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    // Check if this is a restore request
    if (body.action === "restore") {
      await milestoneService.restoreMilestone(milestoneId, profile.userId, profile.role);

      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("audit_logs").insert([
        {
          action: "RESTORE",
          entity_type: "MILESTONE",
          entity_id: milestoneId,
          details: { restored_milestone_id: milestoneId },
        },
      ]);

      return NextResponse.json({
        success: true,
        message: "Milestone restored successfully",
      });
    }

    const milestone = await milestoneService.updateMilestone(
      milestoneId,
      validationResult.data,
      profile.userId,
      profile.role
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "UPDATE",
        entity_type: "MILESTONE",
        entity_id: milestoneId,
        details: { updates: validationResult.data },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Milestone updated successfully",
      data: milestone,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(formatAuthError(error), { status: error.statusCode });
    }
    console.error("Milestone update error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update milestone" },
      { status: 500 }
    );
  }
}

// DELETE /api/milestones/[id] - Delete a milestone
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { profile } = await requireApiAuth(req);

    const { id } = await params;
    const milestoneId = parseInt(id);

    if (isNaN(milestoneId)) {
      return NextResponse.json(
        { success: false, error: "Invalid milestone ID" },
        { status: 400 }
      );
    }

    await milestoneService.deleteMilestone(milestoneId, profile.userId, profile.role);

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "DELETE",
        entity_type: "MILESTONE",
        entity_id: milestoneId,
        details: { deleted_milestone_id: milestoneId },
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Milestone deleted successfully",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(formatAuthError(error), { status: error.statusCode });
    }
    console.error("Milestone deletion error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to delete milestone" },
      { status: 500 }
    );
  }
}
