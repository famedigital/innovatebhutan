/**
 * Error handling utilities - Barrell export
 *
 * Import all error types from a single location:
 * import {
 *   ApiError,
 *   NotFoundError,
 *   ConflictError,
 *   AuthError,
 *   UnauthorizedError,
 *   ForbiddenError,
 * } from '@/lib/errors';
 */

export { ApiError, NotFoundError, ConflictError, BadRequestError, UnauthorizedError, ForbiddenError, UnprocessableEntityError, RateLimitError, InternalServerError, ServiceUnavailableError, isApiError, toApiError, getStatusCode, logError } from './api-error';
export { AuthError, AuthorizationError, ValidationError } from './auth-error';
