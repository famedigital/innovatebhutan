import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { projectService } from "@/lib/services/projectService";
import { createProjectSchema, projectQuerySchema } from "@/lib/validations/project";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp } from "@/lib/auth/api-auth";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError } from "@/lib/errors";
import { validateRequest, validateQueryParams } from "@/lib/validations/validation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// GET /api/projects - List projects with filters
export async function GET(req: NextRequest) {
  try {
    // 🔒 Require authentication
    const { profile } = await requireApiAuth(req);
    // 🔒 Require admin or staff role
    requireStaffOrAdmin(profile);

    const searchParams = req.nextUrl.searchParams;

    // Parse and validate query parameters
    const { page, limit, ...filters } = validateQueryParams(projectQuerySchema, searchParams);
    const offset = (page - 1) * limit;

    const result = await projectService.listProjects({
      ...filters,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: result.projects,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Projects fetch error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// POST /api/projects - Create a new project
export async function POST(req: NextRequest) {
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
    // 🔒 Require admin or staff role
    requireStaffOrAdmin(profile);

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(createProjectSchema, body);

    const project = await projectService.createProject(
      validatedData,
      profile.userId
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CREATE",
        entity_type: "PROJECT",
        entity_id: project.id,
        operator_id: profile.userId,
        details: { project_name: project.name, client_id: project.clientId },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        data: project,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error("Project creation error:", error);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
