/**
 * Example API Route demonstrating the standard error handling pattern
 *
 * This is a reference implementation. Copy this pattern for new routes
 * and migrate existing routes to follow this structure.
 *
 * File: app/api/example/[id]/route.ts
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  success,
  created,
  notFound,
  unauthorized,
  forbidden,
  validationError,
  zodError,
  withErrorHandling,
  type ApiHandler,
} from '@/lib/api/api-response';
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
} from '@/lib/errors';
import { requireApiAuth, requireStaffOrAdmin, requireAdmin } from '@/lib/auth/api-auth';

// Validation schemas
const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('pending'),
});

const updateSchema = createSchema.partial();

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
});

// GET /api/example - List resources
export async function GET(req: NextRequest) {
  return withErrorHandling(async () => {
    // 1️⃣ Authenticate
    const { profile } = await requireApiAuth(req);

    // 2️⃣ Authorize
    requireStaffOrAdmin(profile);

    // 3️⃣ Validate query parameters
    const queryResult = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
    if (!queryResult.success) {
      return validationError('Invalid query parameters', queryResult.error.flatten());
    }

    // 4️⃣ Call service layer (business logic)
    const result = await exampleService.list(queryResult.data);

    // 5️⃣ Return standardized response
    return success(result.items, {
      page: queryResult.data.page,
      limit: queryResult.data.limit,
      total: result.total,
      hasMore: result.hasMore,
    });
  });
}

// POST /api/example - Create new resource
export async function POST(req: NextRequest) {
  return withErrorHandling(async () => {
    const { profile } = await requireApiAuth(req);
    requireStaffOrAdmin(profile);

    const body = await req.json();

    // Validate request body
    const validationResult = createSchema.safeParse(body);
    if (!validationResult.success) {
      return zodError(validationResult.error);
    }

    // Call service layer
    const created = await exampleService.create(validationResult.data, profile.userId);

    // Audit logging (for mutations)
    await auditLog({
      action: 'CREATE',
      entityType: 'EXAMPLE',
      entityId: created.id,
      operatorId: profile.userId,
      details: { name: created.name },
    });

    return created(created);
  });
}

// PATCH /api/example/[id] - Update resource
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

    const updated = await exampleService.update(params.id, validationResult.data, profile.userId);

    await auditLog({
      action: 'UPDATE',
      entityType: 'EXAMPLE',
      entityId: updated.id,
      operatorId: profile.userId,
      details: validationResult.data,
    });

    return success(updated);
  });
}

// DELETE /api/example/[id] - Delete resource
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return withErrorHandling(async () => {
    const { profile } = await requireApiAuth(req);
    // Only admins can delete
    requireAdmin(profile);

    await exampleService.delete(params.id, profile.userId);

    await auditLog({
      action: 'DELETE',
      entityType: 'EXAMPLE',
      entityId: params.id,
      operatorId: profile.userId,
    });

    return success({ deleted: true });
  });
}

// Helper: Audit logging
async function auditLog(data: {
  action: string;
  entityType: string;
  entityId: string | number;
  operatorId: string;
  details?: Record<string, unknown>;
}) {
  // Implementation would write to audit_logs table
  // This is a placeholder for the actual implementation
}

/**
 * Service layer example (separate file: lib/services/exampleService.ts)
 *
 * Services contain business logic and throw typed errors
 */
class ExampleService {
  async list(query: { page: number; limit: number; status?: string }) {
    // Data access via repository
    return { items: [], total: 0, hasMore: false };
  }

  async create(data: z.infer<typeof createSchema>, userId: string) {
    // Check for conflicts
    const existing = await this.findByName(data.name);
    if (existing) {
      throw new ConflictError('Resource with this name already exists');
    }

    // Create via repository
    return { id: '1', ...data };
  }

  async update(id: string, data: z.infer<typeof updateSchema>, userId: string) {
    const resource = await this.findById(id);
    if (!resource) {
      throw new NotFoundError('Resource');
    }

    // Check permissions
    if (!this.canEdit(resource, userId)) {
      throw new ForbiddenError('You do not have permission to edit this resource');
    }

    // Update via repository
    return { ...resource, ...data };
  }

  async delete(id: string, userId: string) {
    const resource = await this.findById(id);
    if (!resource) {
      throw new NotFoundError('Resource');
    }

    // Delete via repository
    return { deleted: true };
  }

  private async findById(id: string) {
    // Repository lookup
    return null;
  }

  private async findByName(name: string) {
    // Repository lookup
    return null;
  }

  private canEdit(resource: unknown, userId: string): boolean {
    // Permission logic
    return true;
  }
}

// Singleton export
export const exampleService = new ExampleService();
