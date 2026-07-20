import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { projectService } from "@/lib/services/projectService";
import { createProjectSchema, projectQuerySchema } from "@/lib/validations/project";
import { requireApiAuth, requireStaffOrAdmin, formatApiError, getClientIp, canSeeMoney } from "@/lib/auth/api-auth";
import { redactProjectsMoney, redactProjectMoney } from "@/lib/auth/capabilities";
import { checkRateLimit, rateLimitPresets } from "@/lib/rate-limit/rate-limiter";
import { isApiError, RateLimitError } from "@/lib/errors";
import { validateRequest, validateQueryParams } from "@/lib/validations/validation";
import { moneySummary, parseMoneyMeta } from "@/lib/projects/moneyMeta";
import { normalizeStatus } from "@/lib/services/projectService";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

// GET /api/projects - List projects with filters
export async function GET(req: NextRequest) {
  try {
    console.log('[API /api/projects] GET request received');

    // 🔒 Require authentication
    const authContext = await requireApiAuth(req);
    console.log('[API /api/projects] Auth successful:', {
      userId: authContext.user.id,
      role: authContext.profile.role,
    });

    // 🔒 Require admin or staff role
    requireStaffOrAdmin(authContext.profile);
    console.log('[API /api/projects] Role check passed');

    const searchParams = req.nextUrl.searchParams;

    // Parse and validate query parameters
    const queryParams = validateQueryParams(projectQuerySchema, searchParams);
    const page = queryParams.page ?? 1;
    const limit = queryParams.limit ?? 20;
    const { page: _, limit: __, ...filters } = queryParams;
    const offset = (page - 1) * limit;

    const result = await projectService.listProjects({
      ...filters,
      limit,
      offset,
    });

    const seeMoney = canSeeMoney(authContext.profile);
    const data = seeMoney
      ? result.projects.map((p: any) => ({
          ...p,
          status: normalizeStatus(p.status),
          moneySummary: moneySummary(parseMoneyMeta(p.moneyMeta)),
        }))
      : redactProjectsMoney(
          result.projects.map((p: any) => ({
            ...p,
            status: normalizeStatus(p.status),
          }))
        );

    console.log('[API /api/projects] Projects fetched successfully:', {
      count: result.projects.length,
      total: result.total,
    });

    return NextResponse.json({
      success: true,
      data,
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
    console.error('[API /api/projects] Error:', {
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

// POST /api/projects - Create a new project
export async function POST(req: NextRequest) {
  try {
    console.log('[API /api/projects] POST request received');

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
    const authContext = await requireApiAuth(req);
    console.log('[API /api/projects] Auth successful:', {
      userId: authContext.user.id,
      role: authContext.profile.role,
    });

    // 🔒 Require admin or staff role
    requireStaffOrAdmin(authContext.profile);
    console.log('[API /api/projects] Role check passed');

    const body = await req.json();

    // Validate request body
    const validatedData = validateRequest(createProjectSchema, body);

    const project = await projectService.createProject(
      validatedData,
      authContext.profile.userId,
      {
        profileId: authContext.profile.id,
        role: authContext.profile.role,
        capabilities: authContext.profile.capabilities,
      }
    );

    // Log to audit
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from("audit_logs").insert([
      {
        action: "CREATE",
        entity_type: "PROJECT",
        entity_id: project.id,
        operator_id: authContext.profile.userId,
        details: {
          project_name: project.name,
          client_id: project.clientId,
          status: project.status,
          product_key: (project as any).productKey,
        },
      },
    ]);

    const seeMoney = canSeeMoney(authContext.profile);
    const payload = seeMoney
      ? {
          ...project,
          status: normalizeStatus(project.status),
          moneySummary: moneySummary(parseMoneyMeta((project as any).moneyMeta)),
        }
      : redactProjectMoney({
          ...project,
          status: normalizeStatus(project.status),
        } as any);
    console.log('[API /api/projects] Project created successfully:', {
      projectId: project.id,
      projectName: project.name,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        data: payload,
      },
      { status: 201 }
    );
  } catch (error) {
    const errorResponse = formatApiError(error);
    const statusCode = isApiError(error) ? (error as any).statusCode : 500;
    console.error('[API /api/projects] Error:', {
      error,
      statusCode,
      response: errorResponse,
    });
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
