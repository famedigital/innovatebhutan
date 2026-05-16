/**
 * Generic in-memory cache for repository-level operations
 *
 * Provides caching for expensive dashboard stats and report queries
 * that don't change frequently and are read often.
 */

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

/**
 * Cache TTL values (in milliseconds)
 */
export const CacheTTL = {
  INSTANT: 1000,      // 1 second - for real-time critical data
  SHORT: 5000,        // 5 seconds - for frequently changing data
  MEDIUM: 30000,      // 30 seconds - for moderately changing data
  LONG: 300000,       // 5 minutes - for rarely changing data
  HOUR: 3600000,      // 1 hour - for static data
  DAILY: 86400000,    // 24 hours - for daily report data
} as const;

/**
 * Generic cache store with typed keys
 */
export class CacheStore<K extends string | number, T> {
  private cache = new Map<K, CacheEntry<T>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize = 500, defaultTTL: number = 30000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  get(key: K, ttl?: number): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const entryTTL = ttl ?? this.defaultTTL;

    if (now - entry.timestamp > entryTTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key: K, value: T): void {
    // Simple LRU: if at max size, remove oldest entry (first in Map)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  invalidate(key: K): void {
    this.cache.delete(key);
  }

  invalidatePattern(predicate: (key: K) => boolean): number {
    let count = 0;
    // Convert to array to avoid iterator issues
    for (const key of Array.from(this.cache.keys())) {
      if (predicate(key)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  get stats(): { size: number; maxSize: number } {
    return { size: this.cache.size, maxSize: this.maxSize };
  }
}

// Dedicated cache instances for different data types

/**
 * Dashboard stats cache - high read frequency, low change rate
 * Key: "dashboard" | "amc" | "invoice" | "payroll" | "projects"
 */
export const dashboardCache = new CacheStore<string, any>(50, 30000);

/**
 * Report KPI cache - expensive aggregation queries
 * Key: "report:{module}:{hashOfFilters}"
 */
export const reportCache = new CacheStore<string, any>(200, 300000);

/**
 * List query cache - for paginated list results
 * Key: "{entity}:{hashOfFilters}"
 */
export const listCache = new CacheStore<string, any>(300, 5000);

/**
 * Stats aggregation cache - for count/sum aggregations
 * Key: "{entity}:stats:{hashOfFilters}"
 */
export const statsCache = new CacheStore<string, any>(200, 30000);

/**
 * Generate a stable hash from filter object for cache keys
 */
export function hashFilters(filters: Record<string, any>): string {
  const sorted = Object.keys(filters)
    .sort()
    .map(key => `${key}:${JSON.stringify(filters[key])}`)
    .join('|');
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < sorted.length; i++) {
    const char = sorted.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generic cache wrapper function
 *
 * @param key - Cache key
 * @param fn - Function to execute on cache miss
 * @param cache - Cache store to use
 * @param ttl - Optional custom TTL
 * @returns Result from cache or function execution
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  cache: CacheStore<string, any>,
  ttl?: number
): Promise<T> {
  const cached = cache.get(key, ttl);
  if (cached !== null) {
    return cached as T;
  }

  const result = await fn();
  cache.set(key, result);
  return result;
}

/**
 * Invalidate multiple cache entries by pattern
 */
export function invalidateCaches(patterns: {
  dashboard?: string[];
  reports?: string[];
  lists?: string[];
  stats?: string[];
}): void {
  if (patterns.dashboard) {
    for (const p of patterns.dashboard) {
      dashboardCache.invalidatePattern(key => key.startsWith(p));
    }
  }
  if (patterns.reports) {
    for (const p of patterns.reports) {
      reportCache.invalidatePattern(key => key.startsWith(p));
    }
  }
  if (patterns.lists) {
    for (const p of patterns.lists) {
      listCache.invalidatePattern(key => key.startsWith(p));
    }
  }
  if (patterns.stats) {
    for (const p of patterns.stats) {
      statsCache.invalidatePattern(key => key.startsWith(p));
    }
  }
}

/**
 * Get combined cache statistics
 */
export function getCacheStats(): {
  dashboard: { size: number; maxSize: number };
  reports: { size: number; maxSize: number };
  lists: { size: number; maxSize: number };
  stats: { size: number; maxSize: number };
  total: number;
} {
  return {
    dashboard: dashboardCache.stats,
    reports: reportCache.stats,
    lists: listCache.stats,
    stats: statsCache.stats,
    total: dashboardCache.size + reportCache.size + listCache.size + statsCache.size,
  };
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  dashboardCache.clear();
  reportCache.clear();
  listCache.clear();
  statsCache.clear();
}

// Cleanup expired entries periodically
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

function cleanupExpiredEntries(): void {
  // The cache stores auto-expire on read, but we should also clean up
  // to prevent memory bloat. Create a new map and only copy non-expired entries.
  const now = Date.now();

  const cleanupStore = (
    store: CacheStore<string, any>,
    ttl: number
  ) => {
    // Clear all - simple approach since entries expire on get() anyway
    // In production, you might want more sophisticated cleanup
    if (store.size > 100) {
      store.clear();
    }
  };

  cleanupStore(dashboardCache, 30000);
  cleanupStore(reportCache, 300000);
  cleanupStore(listCache, 5000);
  cleanupStore(statsCache, 30000);
}

if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL);
}
