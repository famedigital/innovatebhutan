/**
 * API Error classes for consistent error handling across the application.
 *
 * These errors are designed to work with the api-response helpers
 * to provide standardized error responses to clients.
 *
 * Usage:
 * ```ts
 * import { NotFoundError, ConflictError } from '@/lib/errors/api-error';
 *
 * if (!user) {
 *   throw new NotFoundError('User');
 * }
 *
 * if (exists) {
 *   throw new ConflictError('Project with this name already exists');
 * }
 * ```
 */

/**
 * Base API Error class
 * All API errors extend this class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }

  /**
   * Convert this error to a JSON-serializable object
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
    };
  }
}

/**
 * 400 Bad Request - Invalid input from client
 */
export class BadRequestError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

/**
 * 401 Unauthorized - Authentication required or failed
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * 403 Forbidden - Authenticated but insufficient permissions
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends ApiError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/**
 * 409 Conflict - Resource state conflicts with request
 */
export class ConflictError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 409, 'CONFLICT', details);
  }
}

/**
 * 422 Unprocessable Entity - Valid syntax but semantic errors
 */
export class UnprocessableEntityError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 422, 'UNPROCESSABLE_ENTITY', details);
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class RateLimitError extends ApiError {
  constructor(retryAfter?: number) {
    super(
      'Too many requests',
      429,
      'RATE_LIMIT_EXCEEDED',
      retryAfter ? { retryAfter } : undefined
    );
  }
}

/**
 * 500 Internal Server Error - Unhandled server errors
 */
export class InternalServerError extends ApiError {
  constructor(
    message: string = 'An internal server error occurred',
    details?: unknown
  ) {
    // In production, don't expose internal error details
    const safeMessage =
      process.env.NODE_ENV === 'production'
        ? 'An internal server error occurred'
        : message;

    super(safeMessage, 500, 'INTERNAL_ERROR', details);
  }
}

/**
 * 503 Service Unavailable - Service temporarily down
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message: string = 'Service temporarily unavailable') {
    super(message, 503, 'SERVICE_UNAVAILABLE');
  }
}

/**
 * Re-export auth errors for convenience
 * These are defined in auth-error.ts but re-exported here
 * for a single import point
 */
export { AuthError, AuthorizationError, ValidationError } from './auth-error';

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Convert any error to an ApiError
 * Useful for catching unexpected errors
 */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new InternalServerError(error.message);
  }

  return new InternalServerError(String(error));
}

/**
 * Get the appropriate HTTP status code for an error
 */
export function getStatusCode(error: unknown): number {
  if (isApiError(error)) {
    return error.statusCode;
  }

  if (error instanceof Error) {
    switch (error.name) {
      case 'AuthError':
        return 401;
      case 'AuthorizationError':
        return 403;
      case 'ValidationError':
        return 400;
      default:
        return 500;
    }
  }

  return 500;
}

/**
 * Log error with context (integrates with audit logging)
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const errorInfo = {
    error: isApiError(error)
      ? error.toJSON()
      : error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
    context,
    timestamp: new Date().toISOString(),
  };

  console.error('[API Error]', JSON.stringify(errorInfo, null, 2));

  // TODO: Send to monitoring service (Sentry, Datadog, etc.)
  // TODO: Write to audit_logs table for mutations
}
