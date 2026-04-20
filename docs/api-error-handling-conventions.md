# API Error Handling Conventions

This document defines the standard patterns for API error handling in the Innovate Bhutan ERP.

## Overview

All API routes must follow these conventions:
1. **Use shared helpers** from `@/lib/api/api-response`
2. **Use typed error classes** from `@/lib/errors/api-error`
3. **Authenticate and authorize** using `@/lib/auth/api-auth`
4. **Validate inputs** with Zod schemas
5. **Return consistent response shapes**

## Standard Response Shape

```typescript
// Success response
{
  success: true,
  data: T,
  meta?: { ... }  // Optional pagination/metadata
}

// Error response
{
  success: false,
  error: string,
  code?: string,
  details?: unknown
}
```

## API Route Template

```typescript
import { NextRequest } from 'next/server';
import {
  success,
  error,
  created,
  notFound,
  unauthorized,
  forbidden,
  validationError,
  conflict,
  withErrorHandling,
} from '@/lib/api/api-response';
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '@/lib/errors/api-error';
import { requireApiAuth, requireStaffOrAdmin } from '@/lib/auth/api-auth';
import { zodError } from '@/lib/api/api-response';

// GET handler - list resources
export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    // 1. Authenticate
    const { profile } = await requireApiAuth(req);

    // 2. Authorize
    requireStaffOrAdmin(profile);

    // 3. Validate query params
    const schema = z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(20),
      status: z.string().optional(),
    });
    const query = schema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
    if (!query.success) {
      return validationError('Invalid query parameters', query.error.flatten());
    }

    // 4. Call service layer
    const result = await projectService.listProjects(query.data);

    // 5. Return response
    return success(result.items, {
      page: query.data.page,
      total: result.total,
      hasMore: result.hasMore,
    });
  });
}

// POST handler - create resource
export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const body = await req.json();

    // Validate body
    const validationResult = createSchema.safeParse(body);
    if (!validationResult.success) {
      return zodError(validationResult.error);
    }

    // Call service
    const result = await projectService.createProject(validationResult.data, profile.userId);

    return created(result);
  });
}

// PATCH handler - update resource
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const body = await req.json();
    const validationResult = updateSchema.safeParse(body);
    if (!validationResult.success) {
      return zodError(validationResult.error);
    }

    const result = await projectService.updateProject(
      params.id,
      validationResult.data,
      profile.userId
    );

    return success(result);
  });
}

// DELETE handler - delete resource
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    const { profile } = await requireApiAuth(req);
    requireAdmin(profile);

    await projectService.deleteProject(params.id, profile.userId);

    return success({ deleted: true });
  });
}
```

## Error Throwing in Services

Services should throw typed errors that the API layer will catch:

```typescript
// lib/services/projectService.ts
import {
  NotFoundError,
  ConflictError,
  ForbiddenError as ApiForbiddenError,
} from '@/lib/errors/api-error';

export class ProjectService {
  async getProject(id: string) {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new NotFoundError('Project');
    }
    return project;
  }

  async createProject(data: CreateProjectDto, userId: string) {
    // Check for conflicts
    const existing = await projectRepository.findByName(data.name);
    if (existing) {
      throw new ConflictError('A project with this name already exists');
    }

    return projectRepository.create(data, userId);
  }

  async updateProject(id: string, data: UpdateProjectDto, userId: string) {
    const project = await this.getProject(id);

    // Check permissions
    if (!this.canEdit(project, userId)) {
      throw new ApiForbiddenError('You do not have permission to edit this project');
    }

    return projectRepository.update(id, data);
  }

  private canEdit(project: Project, userId: string): boolean {
    // Permission logic here
    return true;
  }
}
```

## Common Error Scenarios

| Scenario | Helper | Status Code |
|----------|--------|-------------|
| Validation failed | `validationError()` or `zodError()` | 400 |
| Not authenticated | `unauthorized()` | 401 |
| Not authorized | `forbidden()` | 403 |
| Resource not found | `notFound()` | 404 |
| Resource conflict | `conflict()` | 409 |
| Rate limit exceeded | `rateLimited()` | 429 |
| Server error | `internalError()` | 500 |

## Service Layer Error Handling

Services should throw typed errors, not HTTP responses:

```typescript
// ❌ BAD - Service returns HTTP response
async createProject(data: CreateProjectDto) {
  try {
    const project = await db.insert(projects).values(data);
    return NextResponse.json({ success: true, data: project });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// ✅ GOOD - Service throws typed errors
async createProject(data: CreateProjectDto, userId: string) {
  const existing = await this.findByName(data.name);
  if (existing) {
    throw new ConflictError('Project with this name already exists');
  }

  return projectRepository.create(data, userId);
}
```

## Audit Logging

All mutations should be logged to audit_logs:

```typescript
// In API handler after successful mutation
import { createClient } from '@/utils/supabase/server';

// ... after successful create/update/delete
const supabase = await createClient();
await supabase.from('audit_logs').insert({
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  entity_type: 'PROJECT',
  entity_id: project.id,
  operator_id: profile.userId,
  details: { /* relevant details */ },
});
```

## Rate Limiting

Apply rate limiting to state-changing operations:

```typescript
import { checkRateLimit, rateLimitPresets } from '@/lib/rate-limit/rate-limiter';
import { getClientIp } from '@/lib/auth/api-auth';

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rateLimitResult = checkRateLimit(
    clientIp,
    rateLimitPresets.strict.maxRequests,
    rateLimitPresets.strict.windowMs
  );

  if (!rateLimitResult.allowed) {
    return rateLimited(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000));
  }

  // ... rest of handler
}
```

## Validation Patterns

Use Zod for all input validation:

```typescript
import { z } from 'zod';

// Define schema
export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  clientId: z.number().positive(),
  status: z.enum(['planning', 'active', 'testing', 'complete']).default('planning'),
  description: z.string().optional(),
});

// In API handler
const body = await req.json();
const result = createProjectSchema.safeParse(body);

if (!result.success) {
  return zodError(result.error);
}

// Use validated data
const project = await projectService.createProject(result.data, userId);
```

## Migration Checklist

When migrating existing API routes to this pattern:

1. ✅ Import helpers from `@/lib/api/api-response`
2. ✅ Wrap handler in `withErrorHandling()`
3. ✅ Replace manual `NextResponse.json()` with helpers
4. ✅ Replace thrown `Error()` with typed error classes
5. ✅ Ensure auth/authz calls are present
6. ✅ Add Zod validation for all inputs
7. ✅ Add audit logging for mutations
8. ✅ Test error paths (401, 403, 404, 409, 500)

## Example: Before and After

### Before (inconsistent)
```typescript
export async function GET(req: NextRequest) {
  try {
    const { profile } = await requireApiAuth(req);
    const projects = await projectService.listProjects();
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(formatAuthError(error), { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
```

### After (consistent)
```typescript
export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const projects = await projectService.listProjects();
    return success(projects);
  });
}
```
