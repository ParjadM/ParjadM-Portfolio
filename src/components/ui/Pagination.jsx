import React from 'react'
import { getAccent } from '../../utils/themeTokens.js'

const PAGE_SIZE = 12

/**
 * Simple numbered pagination. Hides itself when there is only one page.
 */
export function Pagination({
  page,
  totalItems,
  pageSize = PAGE_SIZE,
  onChange,
  theme = 'emerald',
  className = '',
  prevLabel = 'Previous',
  nextLabel = 'Next',
  pageLabel = 'Page {{page}} of {{total}}',
}) {
  const totalPages = Math.max(1, Math.ceil((totalItems || 0) / pageSize))
  if (totalPages <= 1) return null

  const accentTokens = getAccent(theme)
  const accent = accentTokens.paginationAccent
  const idle = 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
  const active = accentTokens.paginationActive

  const status = pageLabel
    .replace('{{page}}', String(page))
    .replace('{{total}}', String(totalPages))

  // Show a compact window of page numbers around the current page
  const windowSize = 5
  let start = Math.max(1, page - Math.floor(windowSize / 2))
  let end = Math.min(totalPages, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)
  const pages = []
  for (let i = start; i <= end; i += 1) pages.push(i)

  return (
    <nav
      className={`mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 ${className}`}
      aria-label="Pagination"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className={`px-3 py-2 text-sm rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${idle}`}
        >
          {prevLabel}
        </button>
        {pages.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-current={n === page ? 'page' : undefined}
            className={`min-w-[2.25rem] px-2.5 py-2 text-sm rounded-lg border transition-colors ${
              n === page ? active : idle
            }`}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className={`px-3 py-2 text-sm rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${accent}`}
        >
          {nextLabel}
        </button>
      </div>
      <p className="text-xs text-gray-400" aria-live="polite">
        {status}
      </p>
    </nav>
  )
}

export const GRID_PAGE_SIZE = PAGE_SIZE

export function paginateItems(items, page, pageSize = PAGE_SIZE) {
  const list = Array.isArray(items) ? items : []
  const safePage = Math.max(1, page || 1)
  const start = (safePage - 1) * pageSize
  return list.slice(start, start + pageSize)
}
