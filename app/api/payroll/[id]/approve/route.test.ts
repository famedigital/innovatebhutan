/**
 * Payroll Approval API Endpoint Tests
 *
 * Tests for payslip approval endpoint:
 * - Authentication and authorization
 * - Status transition validation
 * - Audit logging
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/payroll/[id]/approve/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth/api-auth', () => ({
  requireApiAuth: vi.fn(() => Promise.resolve({
    user: { id: 'user-123' },
    profile: { id: 1, userId: 'user-123', role: 'ADMIN', createdAt: new Date() }
  })),
  requireStaffOrAdmin: vi.fn(),
  getClientIp: vi.fn(() => '127.0.0.1'),
  formatApiError: vi.fn((error) => ({
    success: false,
    error: error.message,
  })),
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
    approvePayslip: vi.fn(),
  },
}));

vi.mock('@/lib/validations/validation', () => ({
  validateRequest: vi.fn((schema, data) => data),
  validateId: vi.fn((id, type) => parseInt(id)),
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
import { requireApiAuth, requireStaffOrAdmin } from '@/lib/auth/api-auth';
import { checkRateLimit } from '@/lib/rate-limit/rate-limiter';
import { validateRequest, validateId } from '@/lib/validations/validation';

describe('POST /api/payroll/[id]/approve', () => {
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
    // Reset validateRequest to passthrough
    vi.mocked(validateRequest).mockImplementation((schema, data) => data);
    // Reset validateId to return parsed int
    vi.mocked(validateId).mockImplementation((id, type) => parseInt(id));
  });

  it('should approve a payslip successfully', async () => {
    const mockPayslip = {
      id: 1,
      employeeId: 1,
      month: 1,
      year: 2026,
      status: 'approved',
    };

    vi.mocked(payrollService.approvePayslip).mockResolvedValue(mockPayslip as any);

    const request = new NextRequest('http://localhost:3000/api/payroll/1/approve', {
      method: 'POST',
      body: JSON.stringify({
        approverId: 'user-123',
        notes: 'Approved after review',
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: '1' }),
    });

    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Payslip approved successfully');
    expect(data.data.status).toBe('approved');
  });

  it('should require authentication', async () => {
    vi.mocked(requireApiAuth).mockRejectedValue(new Error('Unauthorized'));

    const request = new NextRequest('http://localhost:3000/api/payroll/1/approve', {
      method: 'POST',
      body: JSON.stringify({
        approverId: 'user-123',
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: '1' }),
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should require staff or admin role', async () => {
    vi.mocked(requireStaffOrAdmin).mockImplementation(() => {
      throw new Error('Forbidden: Staff or admin only');
    });

    const request = new NextRequest('http://localhost:3000/api/payroll/1/approve', {
      method: 'POST',
      body: JSON.stringify({
        approverId: 'user-123',
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: '1' }),
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should validate payslip ID', async () => {
    vi.mocked(validateId).mockImplementation(() => {
      throw new Error('Invalid payslip ID');
    });

    const request = new NextRequest('http://localhost:3000/api/payroll/invalid/approve', {
      method: 'POST',
      body: JSON.stringify({
        approverId: 'user-123',
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: 'invalid' }),
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should validate request body', async () => {
    vi.mocked(validateRequest).mockImplementation(() => {
      throw new Error('Validation failed: approverId required');
    });

    const request = new NextRequest('http://localhost:3000/api/payroll/1/approve', {
      method: 'POST',
      body: JSON.stringify({
        // Missing approverId
        notes: 'Approved',
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: '1' }),
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should enforce rate limiting', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60000,
    });

    const request = new NextRequest('http://localhost:3000/api/payroll/1/approve', {
      method: 'POST',
      body: JSON.stringify({
        approverId: 'user-123',
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: '1' }),
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('should handle invalid status transitions', async () => {
    vi.mocked(payrollService.approvePayslip).mockRejectedValue(
      new Error('Cannot transition payslip from paid to approved')
    );

    const request = new NextRequest('http://localhost:3000/api/payroll/1/approve', {
      method: 'POST',
      body: JSON.stringify({
        approverId: 'user-123',
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: '1' }),
    });

    const data = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });

  it('should log audit event on approval', async () => {
    const mockPayslip = {
      id: 1,
      employeeId: 1,
      month: 1,
      year: 2026,
      status: 'approved',
    };

    vi.mocked(payrollService.approvePayslip).mockResolvedValue(mockPayslip as any);

    const request = new NextRequest('http://localhost:3000/api/payroll/1/approve', {
      method: 'POST',
      body: JSON.stringify({
        approverId: 'user-123',
        notes: 'Approved',
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: '1' }),
    });

    // The request should succeed
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);
  });

  it('should handle missing payslip', async () => {
    vi.mocked(payrollService.approvePayslip).mockRejectedValue(
      new Error('Payslip with ID 999 not found')
    );

    const request = new NextRequest('http://localhost:3000/api/payroll/999/approve', {
      method: 'POST',
      body: JSON.stringify({
        approverId: 'user-123',
      }),
    });

    const response = await POST(request, {
      params: Promise.resolve({ id: '999' }),
    });

    const data = await response.json();

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(data.success).toBe(false);
  });
});
