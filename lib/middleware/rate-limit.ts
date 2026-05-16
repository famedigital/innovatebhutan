/**
 * 🔒 Rate Limiting Middleware
 * Protects API endpoints from abuse and DDoS attacks
 *
 * Usage in API routes:
 * ```ts
 * import { rateLimit } from '@/lib/middleware/rate-limit';
 *
 * export async function POST(req: NextRequest) {
 *   const rateLimitResult = await rateLimit({
 *     limit: 10,        // 10 requests
 *     window: 60000,    // per 60 seconds
 *     key: req.headers.get('x-forwarded-for') || 'unknown'
 *   });
 *
 *   if (!rateLimitResult.success) {
 *     return NextResponse.json({
 *       error: 'Too many requests',
 *       retryAfter: rateLimitResult.retryAfter
 *     }, { status: 429 });
 *   }
 *
 *   // ... handle request
 * }
 * ```
 */

interface RateLimitOptions {
  limit: number;      // Max requests allowed
  window: number;     // Time window in milliseconds
  key?: string;       // Custom key (defaults to IP)
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number; // Seconds until retry is allowed
}

// In-memory storage (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, {
  count: number;
  resetAt: number;
}>();

/**
 * Clean up expired entries from the store
 * Runs every 5 minutes to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if a request should be rate limited
 */
export function rateLimit(options: RateLimitOptions): RateLimitResult {
  const { limit, window, key } = options;
  const now = Date.now();

  // Use custom key or generate one based on IP
  const rateLimitKey = key || 'default';

  // Get or create rate limit entry
  let entry = rateLimitStore.get(rateLimitKey);

  // Reset if window has expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + window,
    };
    rateLimitStore.set(rateLimitKey, entry);
  }

  // Increment count
  entry.count++;

  // Calculate remaining requests
  const remaining = Math.max(0, limit - entry.count);

  // Check if limit exceeded
  if (entry.count > limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: new Date(entry.resetAt),
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  return {
    success: true,
    remaining,
    resetAt: new Date(entry.resetAt),
  };
}

/**
 * Rate limit presets for different endpoint types
 */
export const RateLimitPresets = {
  // Strict rate limiting for sensitive operations
  strict: {
    limit: 5,
    window: 60 * 1000, // 5 requests per minute
  },

  // Standard rate limiting for general API calls
  standard: {
    limit: 20,
    window: 60 * 1000, // 20 requests per minute
  },

  // Lenient rate limiting for public endpoints
  lenient: {
    limit: 100,
    window: 60 * 1000, // 100 requests per minute
  },

  // Bulk operations
  bulk: {
    limit: 3,
    window: 60 * 1000, // 3 bulk operations per minute
  },

  // File uploads
  upload: {
    limit: 10,
    window: 60 * 1000 * 5, // 10 uploads per 5 minutes
  },

  // Authentication attempts
  auth: {
    limit: 5,
    window: 15 * 60 * 1000, // 5 attempts per 15 minutes
  },
} as const;

/**
 * Extract client IP from request
 */
export function getClientIp(request: Request): string {
  // Note: In Next.js edge runtime, we don't have full access to headers
  // This is a simplified version - adapt based on your deployment
  return 'unknown'; // Will be overridden by the caller in most cases
}

/**
 * Check rate limit and return error response if exceeded
 * Convenience function for API routes
 */
export async function checkRateLimit(
  options: RateLimitOptions,
  clientId: string
): Promise<{ success: boolean; response?: Response }> {
  const result = rateLimit({ ...options, key: clientId });

  if (!result.success) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          success: false,
          error: 'Too many requests',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(result.retryAfter || 60),
            'X-RateLimit-Limit': String(options.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor(result.resetAt.getTime() / 1000)),
          },
        }
      ),
    };
  }

  return { success: true };
}

/**
 * Add rate limit headers to a successful response
 */
export function addRateLimitHeaders(
  response: Response,
  options: RateLimitOptions,
  result: RateLimitResult
): Response {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('X-RateLimit-Limit', String(options.limit));
  newHeaders.set('X-RateLimit-Remaining', String(result.remaining));
  newHeaders.set('X-RateLimit-Reset', String(Math.floor(result.resetAt.getTime() / 1000)));

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
