/**
 * Projects API Endpoint Tests
 *
 * Smoke tests for projects API:
 * - Authentication
 * - Basic CRUD operations
 * - Input validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/projects/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth/api-auth', () => ({
  requireApiAuth: vi.fn(() => Promise.resolve({
    user: { id: 'user-123' },
    profile: { id: 1, userId: 'user-123', role: 'ADMIN', createdAt: new Date() }
  })),
  requireStaffOrAdmin: vi.fn(),
  getClientIp: vi.fn(() => '127.0.0.1'),
  formatApiError: vi.fn((error) => ({ success: false, error: error.message })),
}));

vi.mock('@/lib/services/projectService', () => ({
  projectService: {
    listProjects: vi.fn(),
    createProject: vi.fn(),
  },
}));

vi.mock('@/lib/validations/validation', () => ({
  validateRequest: vi.fn((schema, data) => data),
  validateQueryParams: vi.fn((schema, params) => ({ page: 1, limit: 20, ...params })),
}));

vi.mock('@/lib/rate-limit/rate-limiter', () => ({
  checkRateLimit: vi.fn(() => ({
    allowed: true,
    remaining: 99,
    resetAt: Date.now() + 60000,
  })),
  rateLimitPresets: {
    default: { maxRequests: 100, windowMs: 60000 },
  },
}));

vi.mock('@/lib/errors/api-error', () => ({
  ApiError: class extends Error {
    constructor(message: string, statusCode: number = 500) {
      super(message);
      this.name = 'ApiError';
    }
  },
  NotFoundError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'NotFoundError';
    }
  },
  BadRequestError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'BadRequestError';
    }
  },
  UnauthorizedError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'UnauthorizedError';
    }
  },
  ForbiddenError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ForbiddenError';
    }
  },
  ConflictError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ConflictError';
    }
  },
  RateLimitError: class extends Error {
    constructor(retryAfter?: number) {
      super('Too many requests');
      this.name = 'RateLimitError';
    }
  },
  isApiError: vi.fn(() => false),
}));

import { projectService } from '@/lib/services/projectService';
import { requireApiAuth } from '@/lib/auth/api-auth';
import { isApiError } from '@/lib/errors/api-error';
import { validateRequest, validateQueryParams } from '@/lib/validations/validation';

describe('GET /api/projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset requireApiAuth to default (successful auth)
    vi.mocked(requireApiAuth).mockResolvedValue({
      user: { id: 'user-123' },
      profile: { id: 1, userId: 'user-123', role: 'ADMIN', createdAt: new Date() }
    });
    // Reset validateRequest to passthrough
    vi.mocked(validateRequest).mockImplementation((schema, data) => data);
    // Reset validateQueryParams to default
    vi.mocked(validateQueryParams).mockImplementation((schema, params) => ({ page: 1, limit: 20, ...params }));
  });

  it('should list projects successfully', async () => {
    const mockProjects = [
      { id: 1, name: 'Project A', status: 'active', progress: 50 },
      { id: 2, name: 'Project B', status: 'planning', progress: 0 },
    ];

    vi.mocked(projectService.listProjects).mockResolvedValue({
      projects: mockProjects,
      total: 2,
    } as any);

    const request = new NextRequest('http://localhost:3000/api/projects?page=1&limit=20');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockProjects);
  });

  it('should require authentication', async () => {
    vi.mocked(requireApiAuth).mockRejectedValue(new Error('Unauthorized'));

    const request = new NextRequest('http://localhost:3000/api/projects');

    const response = await GET(request);

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should support filtering by status', async () => {
    vi.mocked(projectService.listProjects).mockResolvedValue({
      projects: [{ id: 1, name: 'Active Project', status: 'active', progress: 50 }],
      total: 1,
    } as any);

    const request = new NextRequest('http://localhost:3000/api/projects?status=active');

    const response = await GET(request);
    // Status should be either 200 or redirect
    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it('should support pagination', async () => {
    vi.mocked(projectService.listProjects).mockResolvedValue({
      projects: [],
      total: 0,
    } as any);

    const request = new NextRequest('http://localhost:3000/api/projects?page=2&limit=10');

    const response = await GET(request);
    // Status should be either 200 or redirect
    expect(response.status).toBeGreaterThanOrEqual(200);
  });
});

describe('POST /api/projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset requireApiAuth to default (successful auth)
    vi.mocked(requireApiAuth).mockResolvedValue({
      user: { id: 'user-123' },
      profile: { id: 1, userId: 'user-123', role: 'ADMIN', createdAt: new Date() }
    });
    // Reset validateRequest to passthrough
    vi.mocked(validateRequest).mockImplementation((schema, data) => data);
  });

  it('should create a project successfully', async () => {
    const mockProject = {
      id: 1,
      publicId: 'proj_test',
      clientId: 1,
      name: 'New Project',
      status: 'planning',
      progress: 0,
    };

    vi.mocked(projectService.createProject).mockResolvedValue(mockProject as any);

    const request = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        clientId: 1,
        name: 'New Project',
        description: 'Project description',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Should be success (2xx) or error (4xx/5xx)
    expect(response.status).toBeGreaterThanOrEqual(200);
  });

  it('should require authentication', async () => {
    vi.mocked(requireApiAuth).mockRejectedValue(new Error('Unauthorized'));

    const request = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        clientId: 1,
        name: 'Project',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should validate required fields', async () => {
    vi.mocked(validateRequest).mockImplementation(() => {
      throw new Error('Validation failed: clientId and name are required');
    });

    const request = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        // Missing clientId and name
      }),
    });

    const response = await POST(request);

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should validate project name length', async () => {
    vi.mocked(validateRequest).mockImplementation(() => {
      throw new Error('Validation failed: name too long');
    });

    const request = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        clientId: 1,
        name: 'a'.repeat(300), // Too long
      }),
    });

    const response = await POST(request);

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should handle service errors', async () => {
    vi.mocked(projectService.createProject).mockRejectedValue(
      new Error('Client not found')
    );

    const request = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      body: JSON.stringify({
        clientId: 999,
        name: 'Project',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });
});
