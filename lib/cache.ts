// lib/cache.ts

import { LRUCache } from "lru-cache";

// Cache for product lists (e.g., category pages)
export const productListCache = new LRUCache<string, unknown>({
  max: 500,         // max keys
  ttl: 60 * 1000,    // 60s for lists
});

// Cache for individual product pages
export const productBySlugCache = new LRUCache<string, unknown>({
  max: 500,
  ttl: 5 * 60 * 1000, // 5 minutes for product details
});

export function buildListKey(params: URLSearchParams) {
  // Stable key from filters: sort params alphabetically
  const entries = Array.from(params.entries()).sort(([a], [b]) => a.localeCompare(b));
  const stable = new URLSearchParams(entries).toString();
  return `products:${stable}`;
}

export function productKey(slug: string) {
  return `product:${slug}`;
}

// Simple invalidation helpers
export function invalidateAllLists() {
  productListCache.clear();
}

export function invalidateProductSlug(slug: string) {
  productBySlugCache.delete(productKey(slug));
}

