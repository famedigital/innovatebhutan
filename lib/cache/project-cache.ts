/**
 * Simple in-memory cache for project-related data
 *
 * This cache is useful for reducing database load for frequently accessed
 * but rarely changing data like project progress.
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

/**
 * Cache configuration
 */
interface CacheConfig {
  ttl: number; // Time to live in milliseconds
}

/**
 * Default TTL values (in milliseconds)
 */
export const CacheTTL = {
  SHORT: 5000,      // 5 seconds - for frequently changing data
  MEDIUM: 30000,    // 30 seconds - for moderately changing data
  LONG: 300000,     // 5 minutes - for rarely changing data
  HOUR: 3600000,    // 1 hour - for static data
} as const;

// In-memory cache storage
const progressCache = new Map<number, CacheEntry<number>>();
const projectCache = new Map<number, CacheEntry<any>>();

/**
 * Get cached progress value for a project
 *
 * @param projectId - Project ID
 * @param ttl - Optional custom TTL (default: 5 seconds)
 * @returns Cached progress value or null if not found/expired
 */
export function getCachedProgress(projectId: number, ttl: number = CacheTTL.SHORT): number | null {
  const entry = progressCache.get(projectId);
  if (!entry) {
    return null;
  }

  const now = Date.now();
  if (now - entry.timestamp > ttl) {
    progressCache.delete(projectId);
    return null;
  }

  return entry.value;
}

/**
 * Set cached progress value for a project
 *
 * @param projectId - Project ID
 * @param value - Progress value to cache
 */
export function setCachedProgress(projectId: number, value: number): void {
  progressCache.set(projectId, {
    value,
    timestamp: Date.now(),
  });
}

/**
 * Invalidate cached progress for a project
 *
 * @param projectId - Project ID to invalidate
 */
export function invalidateProgress(projectId: number): void {
  progressCache.delete(projectId);
}

/**
 * Clear all progress cache entries
 */
export function clearProgressCache(): void {
  progressCache.clear();
}

/**
 * Get cached project data
 *
 * @param projectId - Project ID
 * @param ttl - Optional custom TTL (default: 30 seconds)
 * @returns Cached project data or null if not found/expired
 */
export function getCachedProject<T>(projectId: number, ttl: number = CacheTTL.MEDIUM): T | null {
  const entry = projectCache.get(projectId);
  if (!entry) {
    return null;
  }

  const now = Date.now();
  if (now - entry.timestamp > ttl) {
    projectCache.delete(projectId);
    return null;
  }

  return entry.value as T;
}

/**
 * Set cached project data
 *
 * @param projectId - Project ID
 * @param value - Data to cache
 */
export function setCachedProject<T>(projectId: number, value: T): void {
  projectCache.set(projectId, {
    value,
    timestamp: Date.now(),
  });
}

/**
 * Invalidate cached project data
 *
 * @param projectId - Project ID to invalidate
 */
export function invalidateProject(projectId: number): void {
  projectCache.delete(projectId);
}

/**
 * Clear all project cache entries
 */
export function clearProjectCache(): void {
  projectCache.clear();
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  progressCache.clear();
  projectCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  progressCacheSize: number;
  projectCacheSize: number;
  totalCacheSize: number;
} {
  return {
    progressCacheSize: progressCache.size,
    projectCacheSize: projectCache.size,
    totalCacheSize: progressCache.size + projectCache.size,
  };
}

/**
 * Helper function to wrap a function with caching
 *
 * @param key - Cache key
 * @param fn - Function to execute if cache miss
 * @param getCached - Function to get cached value
 * @param setCached - Function to set cached value
 * @returns Result from cache or function execution
 *
 * @example
 * ```ts
 * const progress = await withCache(
 *   projectId,
 *   () => repository.calculateProgress(projectId),
 *   getCachedProgress,
 *   setCachedProgress
 * );
 * ```
 */
export async function withCache<T>(
  key: number,
  fn: () => Promise<T>,
  getCached: (key: number) => T | null,
  setCached: (key: number, value: T) => void
): Promise<T> {
  const cached = getCached(key);
  if (cached !== null) {
    return cached;
  }

  const result = await fn();
  setCached(key, result);
  return result;
}

/**
 * Cleanup interval to remove expired entries
 * Runs every minute
 */
const CLEANUP_INTERVAL = 60 * 1000;

function cleanupExpiredEntries(): void {
  const now = Date.now();
  const ttl = CacheTTL.HOUR; // Use longest TTL for cleanup

  for (const [key, entry] of progressCache.entries()) {
    if (now - entry.timestamp > ttl) {
      progressCache.delete(key);
    }
  }

  for (const [key, entry] of projectCache.entries()) {
    if (now - entry.timestamp > ttl) {
      projectCache.delete(key);
    }
  }
}

// Start cleanup interval
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL);
}
