/**
 * Centralized validation helpers for API routes
 *
 * Provides consistent validation error handling across all endpoints
 */

import { ZodError, ZodSchema } from "zod";
import { BadRequestError } from "@/lib/errors";

/**
 * Validates request data against a Zod schema
 * Throws BadRequestError if validation fails
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @param errorMessage - Custom error message (default: "Validation failed")
 * @returns Validated data
 * @throws BadRequestError if validation fails
 */
export function validateRequest<T>(
  schema: ZodSchema<T>,
  data: unknown,
  errorMessage: string = "Validation failed"
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new BadRequestError(errorMessage, result.error.flatten());
  }

  return result.data;
}

/**
 * Validates query parameters against a Zod schema
 *
 * @param schema - Zod schema to validate against
 * @param searchParams - URLSearchParams to validate
 * @param errorMessage - Custom error message (default: "Invalid query parameters")
 * @returns Validated query parameters
 * @throws BadRequestError if validation fails
 */
export function validateQueryParams<T>(
  schema: ZodSchema<T>,
  searchParams: URLSearchParams | Record<string, string>,
  errorMessage: string = "Invalid query parameters"
): T {
  const params =
    searchParams instanceof URLSearchParams
      ? Object.fromEntries(searchParams)
      : searchParams;

  return validateRequest(schema, params, errorMessage);
}

/**
 * Validates a numeric ID parameter
 *
 * @param value - String value to parse as integer
 * @param paramName - Name of the parameter (for error messages)
 * @returns Parsed integer ID
 * @throws BadRequestError if value is not a valid integer
 */
export function validateId(value: string, paramName: string = "ID"): number {
  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    throw new BadRequestError(`Invalid ${paramName}`);
  }

  return parsed;
}
