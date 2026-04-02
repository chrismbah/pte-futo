/**
 * Simple in-memory runtime cache with TTL.
 * Used to avoid re-fetching the same Firestore / Supabase data
 * when a user navigates back to a page they already visited.
 *
 * Default TTL: 5 minutes. For near-static data (course outlines,
 * team images, blog posts) a longer TTL of 30 minutes is recommended.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

/** Retrieve a cached value, or `null` if missing / expired. */
export function getCache<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data;
}

/** Store a value in the cache. `ttlMs` defaults to 5 minutes. */
export function setCache<T>(key: string, data: T, ttlMs = 5 * 60 * 1000): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/** Remove a specific cache entry (call after mutations). */
export function invalidateCache(key: string): void {
  store.delete(key);
}

/** Remove all entries whose key starts with a given prefix. */
export function invalidateCachePrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}

/**
 * Convenience wrapper: returns cached data immediately if fresh,
 * otherwise calls `fetcher`, caches the result, and returns it.
 *
 * @example
 * const posts = await cachedFetch('blog:posts', () => getDocs(...), 30 * 60_000);
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 5 * 60 * 1000
): Promise<T> {
  const cached = getCache<T>(key);
  if (cached !== null) return cached;
  const data = await fetcher();
  setCache(key, data, ttlMs);
  return data;
}
