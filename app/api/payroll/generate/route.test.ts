/**
 * Payroll API Endpoint Tests
 *
 * Integration tests for payroll API endpoints:
 * - Authentication and authorization
 * - Rate limiting
 * - Input validation
 * - Response formatting
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST, GET } from '@/app/api/payroll/generate/route';
import { NextRequest } from 'next/server';

// Mock dependencies FIRST, then import
vi.mock('@/lib/auth/api-auth', () => ({
  requireApiAuth: vi.fn(() => Promise.resolve({
    user: { id: 'user-123' },
    profile: { id: 1, userId: 'user-123', role: 'ADMIN', createdAt: new Date() }
  })),
  requireStaffOrAdmin: vi.fn(),
  getClientIp: vi.fn(() => '127.0.0.1'),
  formatApiError: vi.fn((error) => {
    const isRateLimit = error?.constructor?.name === 'RateLimitError' || error?.code === 'RATE_LIMIT_EXCEEDED';
    return {
      success: false,
      error: error?.message || 'An error occurred',
      retryAfter: isRateLimit ? error?.details?.retryAfter : undefined,
    };
  }),
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

vi.mock('@/lib/services/payrollService', () => ({
  payrollService: {
    generatePayslip: vi.fn(),
    listPayslips: vi.fn(),
  },
}));

vi.mock('@/lib/validations/validation', () => ({
  validateRequest: vi.fn((schema, data) => data),
  validateQueryParams: vi.fn((schema, params) => ({ page: 1, limit: 20, ...params })),
}));

vi.mock('@/lib/errors/api-error', () => {
  class RateLimitError extends Error {
    statusCode = 429;
    code = 'RATE_LIMIT_EXCEEDED';
    details = { retryAfter: 60 };
    constructor(public retryAfter: number) {
      super('Too many requests');
      this.name = 'RateLimitError';
    }
  }
  return {
    ApiError: class extends Error {
      constructor(message: string, statusCode: number = 500) {
        super(message);
        this.name = 'ApiError';
      }
    },
    RateLimitError,
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
    isApiError: vi.fn((error: unknown) =>
      error?.constructor?.name === 'RateLimitError' ||
      (typeof error === 'object' && error !== null && 'statusCode' in error)
    ),
  };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve()),
    })),
  })),
}));

import { payrollService } from '@/lib/services/payrollService';
import { requireApiAuth, requireStaffOrAdmin, getClientIp, formatApiError } from '@/lib/auth/api-auth';
import { checkRateLimit } from '@/lib/rate-limit/rate-limiter';
import { validateRequest, validateQueryParams } from '@/lib/validations/validation';

describe('POST /api/payroll/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure rate limit always allows requests in tests
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 99,
      resetAt: Date.now() + 60000,
    });
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

  it('should generate a payslip successfully', async () => {
    const mockPayslip = {
      id: 1,
      employeeId: 1,
      month: 1,
      year: 2026,
      basicSalary: 45000,
      grossSalary: 50000,
      pfEmployee: 2500,
      pfEmployer: 2500,
      gisDeduction: 500,
      taxableIncome: 47000,
      pitDeduction: 0,
      netSalary: 47000,
      status: 'draft',
    };

    vi.mocked(payrollService.generatePayslip).mockResolvedValue(mockPayslip as any);

    const request = new NextRequest('http://localhost:3000/api/payroll/generate', {
      method: 'POST',
      body: JSON.stringify({
        employeeId: 1,
        month: 1,
        year: 2026,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Payslip generated successfully');
    expect(data.data).toBeDefined();
  });

  it('should require authentication', async () => {
    vi.mocked(requireApiAuth).mockRejectedValue(new Error('Unauthorized'));

    const request = new NextRequest('http://localhost:3000/api/payroll/generate', {
      method: 'POST',
      body: JSON.stringify({
        employeeId: 1,
        month: 1,
        year: 2026,
      }),
    });

    const response = await POST(request);

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should require staff or admin role', async () => {
    vi.mocked(requireStaffOrAdmin).mockImplementation(() => {
      throw new Error('Forbidden: Staff or admin only');
    });

    const request = new NextRequest('http://localhost:3000/api/payroll/generate', {
      method: 'POST',
      body: JSON.stringify({
        employeeId: 1,
        month: 1,
        year: 2026,
      }),
    });

    const response = await POST(request);

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should enforce rate limiting', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60000,
    });

    const request = new NextRequest('http://localhost:3000/api/payroll/generate', {
      method: 'POST',
      body: JSON.stringify({
        employeeId: 1,
        month: 1,
        year: 2026,
      }),
    });

    const response = await POST(request);

    // The route should return 429 when rate limit is exceeded
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should validate request body', async () => {
    vi.mocked(validateRequest).mockImplementation(() => {
      throw new Error('Validation failed');
    });

    const request = new NextRequest('http://localhost:3000/api/payroll/generate', {
      method: 'POST',
      body: JSON.stringify({
        employeeId: 'invalid', // Invalid type
        month: 1,
        year: 2026,
      }),
    });

    const response = await POST(request);

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should handle service errors gracefully', async () => {
    vi.mocked(payrollService.generatePayslip).mockRejectedValue(
      new Error('Employee not found')
    );

    const request = new NextRequest('http://localhost:3000/api/payroll/generate', {
      method: 'POST',
      body: JSON.stringify({
        employeeId: 999,
        month: 1,
        year: 2026,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });
});

describe('GET /api/payroll/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure rate limit always allows requests in tests
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      remaining: 99,
      resetAt: Date.now() + 60000,
    });
    // Reset requireApiAuth to default (successful auth)
    vi.mocked(requireApiAuth).mockResolvedValue({
      user: { id: 'user-123' },
      profile: { id: 1, userId: 'user-123', role: 'ADMIN', createdAt: new Date() }
    });
    // Reset requireStaffOrAdmin to default (no-op)
    vi.mocked(requireStaffOrAdmin).mockImplementation(() => {});
    // Reset validateQueryParams to default
    vi.mocked(validateQueryParams).mockImplementation((schema, params) => ({ page: 1, limit: 20, ...params }));
  });

  it('should list payslips with pagination', async () => {
    const mockPayslips = [
      { id: 1, employeeId: 1, month: 1, year: 2026, status: 'draft' },
      { id: 2, employeeId: 2, month: 1, year: 2026, status: 'approved' },
    ];

    vi.mocked(payrollService.listPayslips).mockResolvedValue({
      payslips: mockPayslips,
      total: 2,
    } as any);

    const request = new NextRequest('http://localhost:3000/api/payroll/generate?page=1&limit=20');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockPayslips);
    expect(data.pagination).toBeDefined();
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(20);
    expect(data.pagination.total).toBe(2);
  });

  it('should require authentication', async () => {
    vi.mocked(requireApiAuth).mockRejectedValue(new Error('Unauthorized'));

    const request = new NextRequest('http://localhost:3000/api/payroll/generate');

    const response = await GET(request);

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should validate query parameters', async () => {
    vi.mocked(validateQueryParams).mockImplementation(() => {
      throw new Error('Invalid query parameters');
    });

    const request = new NextRequest('http://localhost:3000/api/payroll/generate?limit=invalid');

    const response = await GET(request);

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should handle filtering by employee', async () => {
    vi.mocked(payrollService.listPayslips).mockResolvedValue({
      payslips: [{ id: 1, employeeId: 1, month: 1, year: 2026, status: 'draft' }],
      total: 1,
    } as any);

    const request = new NextRequest('http://localhost:3000/api/payroll/generate?employeeId=1');

    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('should handle filtering by status', async () => {
    vi.mocked(payrollService.listPayslips).mockResolvedValue({
      payslips: [{ id: 1, employeeId: 1, month: 1, year: 2026, status: 'draft' }],
      total: 1,
    } as any);

    const request = new NextRequest('http://localhost:3000/api/payroll/generate?status=draft');

    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('should calculate total pages correctly', async () => {
    vi.mocked(payrollService.listPayslips).mockResolvedValue({
      payslips: Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        employeeId: i + 1,
        month: 1,
        year: 2026,
        status: 'draft',
      })),
      total: 45,
    } as any);

    const request = new NextRequest('http://localhost:3000/api/payroll/generate?page=1&limit=20');

    const response = await GET(request);
    const data = await response.json();

    if (data.pagination) {
      expect(data.pagination.totalPages).toBe(3); // 45 / 20 = 2.25 -> 3 pages
    }
  });
});
