import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { projectService } from "@/lib/services/projectService";
import { createTaskSchema, updateTaskSchema, bulkCreateTasksSchema } from "@/lib/validations/project";
import { requireApiAuth, requireStaffOrAdmin, formatApiError } from "@/lib/auth/api-auth";
import { isApiError, BadRequestError } from "@/lib/errors";
import { validateRequest, validateId } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/projects/[id]/tasks - Get all tasks for a project
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

    const tasks = await projectService.getTasksWithProfiles(projectId);

    return NextResponse.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Tasks fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// POST /api/projects/[id]/tasks - Create a new task or bulk create tasks
export async function POST(
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

    const body = await req.json();

    // Check if this is a bulk create
    if (body.tasks && Array.isArray(body.tasks)) {
      const validatedData = validateRequest(bulkCreateTasksSchema, body);

      const tasks = await projectService.bulkCreateTasks(
        projectId,
        validatedData.tasks,
        profile.userId,
        profile.role
      );

      // Log to audit
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("audit_logs").insert([
        {
          action: "BULK_CREATE",
          entity_type: "TASK",
          operator_id: profile.userId,
          details: {
            project_id: projectId,
            task_count: tasks.length,
            task_ids: tasks.map((t: any) => t.id),
          },
        },
      ]);

      return NextResponse.json(
        {
          success: true,
          message: `${tasks.length} tasks created successfully`,
          data: tasks,
        },
        { status: 201 }
      );
    }

    // Single task creation
    const validatedData = validateRequest(createTaskSchema, { ...body, projectId });

    const task = await projectService.createTask(
      validatedData,
      profile.userId,
      profile.role
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CREATE",
        entity_type: "TASK",
        entity_id: task.id,
        operator_id: profile.userId,
        details: { task_title: task.title, project_id: projectId },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully",
        data: task,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Task creation error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// PATCH /api/projects/[id]/tasks - Bulk update tasks
export async function PATCH(
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

    const body = await req.json();

    // Bulk update task statuses
    if (body.taskIds && Array.isArray(body.taskIds) && body.status) {
      const tasks = await projectService.bulkUpdateTaskStatus(body.taskIds, body.status);

      // Log to audit
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("audit_logs").insert([
        {
          action: "BULK_UPDATE",
          entity_type: "TASK",
          operator_id: profile.userId,
          details: {
            project_id: projectId,
            task_count: tasks.length,
            task_ids: body.taskIds,
            new_status: body.status,
          },
        },
      ]);

      return NextResponse.json({
        success: true,
        message: `${tasks.length} tasks updated successfully`,
        data: tasks,
      });
    }

    throw new BadRequestError("Invalid request. Use /api/tasks/[id] for single task updates");
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Bulk task update error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
