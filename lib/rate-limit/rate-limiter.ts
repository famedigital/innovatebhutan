/**
 * Simple in-memory rate limiter for API routes
 *
 * This is a basic implementation suitable for single-instance deployments.
 * For production with multiple instances, consider using Redis or a similar solution.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * In-memory storage for rate limit data
 * Key: identifier, Value: { count, resetAt }
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Cleanup interval to remove expired entries
 * Runs every 5 minutes
 */
const CLEANUP_INTERVAL = 5 * 60 * 1000;

/**
 * Clean up expired entries from the store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Start cleanup interval
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL);
}

/**
 * Check rate limit for a given identifier
 *
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param maxRequests - Maximum number of requests allowed in the time window
 * @param windowMs - Time window in milliseconds
 * @returns RateLimitResult with allowed status and metadata
 *
 * @example
 * ```ts
 * const rateLimit = checkRateLimit('192.168.1.1', 100, 60000); // 100 requests per minute
 * if (!rateLimit.allowed) {
 *   return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 * }
 * ```
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get or create entry
  let entry = rateLimitStore.get(identifier);

  // Reset if window has expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(identifier, entry);
  }

  // Increment counter
  entry.count += 1;
  rateLimitStore.set(identifier, entry);

  const remaining = Math.max(0, maxRequests - entry.count);
  const allowed = entry.count <= maxRequests;

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Get current rate limit status without incrementing
 *
 * @param identifier - Unique identifier
 * @returns Current rate limit status
 */
export function getRateLimitStatus(identifier: string): RateLimitResult | null {
  const entry = rateLimitStore.get(identifier);
  if (!entry) {
    return null;
  }

  const now = Date.now();
  if (entry.resetAt < now) {
    rateLimitStore.delete(identifier);
    return null;
  }

  return {
    allowed: true,
    remaining: Math.max(0, 100 - entry.count),
    resetAt: entry.resetAt,
  };
}

/**
 * Reset rate limit for a specific identifier
 *
 * @param identifier - Unique identifier to reset
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Get all rate limit data (for monitoring/debugging)
 *
 * @returns Array of all rate limit entries
 */
export function getAllRateLimits(): Array<{ identifier: string; entry: RateLimitEntry }> {
  return Array.from(rateLimitStore.entries()).map(([identifier, entry]) => ({
    identifier,
    entry,
  }));
}

/**
 * Middleware helper for Next.js API routes
 *
 * @param request - Next.js Request object
 * @param maxRequests - Max requests per window
 * @param windowMs - Window size in milliseconds
 * @returns Response object if rate limited, null if allowed
 *
 * @example
 * ```ts
 * export async function GET(request: Request) {
 *   const rateLimitResponse = checkRateLimitMiddleware(request, 20, 60000);
 *   if (rateLimitResponse) return rateLimitResponse;
 *
 *   // Your handler code here
 * }
 * ```
 */
export function checkRateLimitMiddleware(
  request: Request,
  maxRequests: number = 100,
  windowMs: number = 60000
): Response | null {
  // Get client IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const result = checkRateLimit(ip, maxRequests, windowMs);

  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Too many requests',
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
        },
      }
    );
  }

  return null;
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimitPresets = {
  strict: { maxRequests: 10, windowMs: 60000 },      // 10 req/min
  default: { maxRequests: 100, windowMs: 60000 },    // 100 req/min
  loose: { maxRequests: 1000, windowMs: 60000 },     // 1000 req/min
  hourly: { maxRequests: 1000, windowMs: 3600000 },  // 1000 req/hour
} as const;
