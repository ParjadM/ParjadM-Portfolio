/**
 * Shared pagination helpers for public list endpoints.
 */

export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 12
export const MAX_LIMIT = 50

/**
 * Parse page/limit from query. When neither page nor limit is present and
 * `legacyUnpaginated` is true, returns { paginate: false } so callers can
 * keep the old full-list response during migration.
 */
export function parsePaginationQuery(query = {}, { legacyUnpaginated = true } = {}) {
  const hasPage = query.page !== undefined && query.page !== ''
  const hasLimit = query.limit !== undefined && query.limit !== ''

  if (legacyUnpaginated && !hasPage && !hasLimit) {
    return { paginate: false }
  }

  let page = Number.parseInt(String(query.page ?? DEFAULT_PAGE), 10)
  let limit = Number.parseInt(String(query.limit ?? DEFAULT_LIMIT), 10)
  if (!Number.isFinite(page) || page < 1) page = DEFAULT_PAGE
  if (!Number.isFinite(limit) || limit < 1) limit = DEFAULT_LIMIT
  if (limit > MAX_LIMIT) limit = MAX_LIMIT

  return {
    paginate: true,
    page,
    limit,
    skip: (page - 1) * limit,
  }
}

export function buildPaginationMeta({ page, limit, totalItems }) {
  const total = Math.max(0, Number(totalItems) || 0)
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1)
  const safePage = Math.min(Math.max(1, page), totalPages)
  return {
    page: safePage,
    limit,
    totalItems: total,
    totalPages,
    hasPreviousPage: safePage > 1,
    hasNextPage: safePage < totalPages,
  }
}

/** Stable cache-key fragment from normalized query params. */
export function cacheKeyFromQuery(prefix, params = {}) {
  const parts = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k] ?? ''}`)
    .join('&')
  return parts ? `${prefix}:${parts}` : prefix
}
