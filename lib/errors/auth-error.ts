/**
 * Authentication and Authorization error classes
 * Used across API routes for consistent error handling
 *
 * These extend ApiError for consistency but maintain backwards compatibility
 */

import { ApiError } from './api-error';

export class AuthError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}
