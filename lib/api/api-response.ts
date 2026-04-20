/**
 * Shared API response helpers for consistent API responses across all endpoints.
 *
 * Usage:
 * ```ts
 * import { success, error, notFound, created } from '@/lib/api/api-response';
 *
 * // Success response
 * return success(data);
 *
 * // Error response
 * return error('Something went wrong', 500);
 *
 * // With metadata
 * return success(data, { page: 1, total: 100 });
 * ```
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

export interface ApiResponseMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  hasMore?: boolean;
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
  meta?: ApiResponseMeta;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
  code?: string;
}

/**
 * Create a success response with optional data and metadata
 */
export function success<T>(
  data: T,
  meta?: ApiResponseMeta,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
    } as ApiResponse<T>,
    { status }
  );
}

/**
 * Create a response for created resources (201)
 */
export function created<T>(
  data: T,
  meta?: ApiResponseMeta
): NextResponse<ApiResponse<T>> {
  return success(data, meta, 201);
}

/**
 * Create a response for accepted requests (202)
 */
export function accepted<T>(
  data: T,
  meta?: ApiResponseMeta
): NextResponse<ApiResponse<T>> {
  return success(data, meta, 202);
}

/**
 * Create a no-content response (204)
 */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Create an error response
 */
export function error(
  message: string,
  status: number = 500,
  details?: unknown,
  code?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && { details }),
      ...(code && { code }),
    } as ApiError,
    { status }
  );
}

/**
 * Create a validation error response (400)
 */
export function validationError(
  message: string,
  details?: unknown
): NextResponse<ApiError> {
  return error(message, 400, details, 'VALIDATION_ERROR');
}

/**
 * Handle Zod validation errors and return a standardized response
 */
export function zodError(zodError: z.ZodError): NextResponse<ApiError> {
  const details = zodError.errors.map((err) => ({
    path: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));

  return validationError('Validation failed', details);
}

/**
 * Create an unauthorized error response (401)
 */
export function unauthorized(
  message: string = 'Authentication required'
): NextResponse<ApiError> {
  return error(message, 401, undefined, 'UNAUTHORIZED');
}

/**
 * Create a forbidden error response (403)
 */
export function forbidden(
  message: string = 'You do not have permission to perform this action'
): NextResponse<ApiError> {
  return error(message, 403, undefined, 'FORBIDDEN');
}

/**
 * Create a not found error response (404)
 */
export function notFound(
  resource: string = 'Resource'
): NextResponse<ApiError> {
  return error(`${resource} not found`, 404, undefined, 'NOT_FOUND');
}

/**
 * Create a conflict error response (409)
 */
export function conflict(
  message: string,
  details?: unknown
): NextResponse<ApiError> {
  return error(message, 409, details, 'CONFLICT');
}

/**
 * Create a rate limit exceeded response (429)
 */
export function rateLimited(
  retryAfter?: number
): NextResponse<ApiError> {
  return new NextResponse(
    JSON.stringify({
      success: false,
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
    } as ApiError),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...(retryAfter && { 'Retry-After': retryAfter.toString() }),
      },
    }
  );
}

/**
 * Create an internal server error response (500)
 */
export function internalError(
  message: string = 'An internal server error occurred',
  details?: unknown
): NextResponse<ApiError> {
  // In production, don't expose internal error details
  const safeMessage =
    process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred'
      : message;

  return error(safeMessage, 500, details, 'INTERNAL_ERROR');
}

/**
 * Create a service unavailable response (503)
 */
export function serviceUnavailable(
  message: string = 'Service temporarily unavailable'
): NextResponse<ApiError> {
  return error(message, 503, undefined, 'SERVICE_UNAVAILABLE');
}

/**
 * Wrap an async handler with error handling
 * Catches errors and converts them to appropriate API responses
 */
export function withErrorHandling<T = unknown>(
  handler: () => Promise<NextResponse<ApiResponse<T>>>
): Promise<NextResponse<ApiResponse<T> | ApiError>> {
  return handler().catch((err) => {
    console.error('API error:', err);

    // Handle ApiError subclasses (check by constructor name for compatibility)
    const errorName = err?.constructor?.name || err?.name;

    switch (errorName) {
      case 'AuthError':
      case 'UnauthorizedError':
        return unauthorized(err.message);
      case 'AuthorizationError':
      case 'ForbiddenError':
        return forbidden(err.message);
      case 'ValidationError':
      case 'BadRequestError':
        return validationError(err.message, err.details);
      case 'ConflictError':
        return conflict(err.message, err.details);
      case 'NotFoundError':
        return notFound();
      case 'RateLimitError':
        return rateLimited(err.details?.retryAfter);
      default:
        break;
    }

    // Handle Zod errors
    if (err instanceof z.ZodError) {
      return zodError(err);
    }

    // Generic internal error
    return internalError(
      process.env.NODE_ENV === 'development' ? err.message : undefined
    );
  });
}

/**
 * Types for route handlers with error handling
 */
export type ApiHandler<T = unknown> = () => Promise<NextResponse<ApiResponse<T>>>;

/**
 * HOC to wrap GET handlers with error handling
 */
export function withGetHandling<T = unknown>(
  handler: ApiHandler<T>
): () => Promise<NextResponse<ApiResponse<T> | ApiError>> {
  return () => withErrorHandling(handler);
}

/**
 * HOC to wrap POST handlers with error handling
 */
export function withPostHandling<T = unknown>(
  handler: ApiHandler<T>
): () => Promise<NextResponse<ApiResponse<T> | ApiError>> {
  return () => withErrorHandling(handler);
}

/**
 * HOC to wrap PATCH handlers with error handling
 */
export function withPatchHandling<T = unknown>(
  handler: ApiHandler<T>
): () => Promise<NextResponse<ApiResponse<T> | ApiError>> {
  return () => withErrorHandling(handler);
}

/**
 * HOC to wrap DELETE handlers with error handling
 */
export function withDeleteHandling<T = unknown>(
  handler: ApiHandler<T>
): () => Promise<NextResponse<ApiResponse<T> | ApiError>> {
  return () => withErrorHandling(handler);
}
