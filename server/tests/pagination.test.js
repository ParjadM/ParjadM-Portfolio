import test from 'node:test'
import assert from 'node:assert/strict'
import {
  parsePaginationQuery,
  buildPaginationMeta,
  cacheKeyFromQuery,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} from '../src/utils/pagination.js'
import { createApp } from '../src/app.js'

async function withServer(fn) {
  const app = await createApp()
  const server = app.listen(0)
  const port = server.address().port
  const base = `http://127.0.0.1:${port}`
  try {
    await fn(base)
  } finally {
    await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())))
  }
}

test('parsePaginationQuery keeps legacy unpaginated when no page/limit', () => {
  const result = parsePaginationQuery({})
  assert.equal(result.paginate, false)
})

test('parsePaginationQuery clamps page/limit', () => {
  const result = parsePaginationQuery({ page: '0', limit: '999' })
  assert.equal(result.paginate, true)
  assert.equal(result.page, 1)
  assert.equal(result.limit, MAX_LIMIT)
  assert.equal(result.skip, 0)
})

test('parsePaginationQuery defaults when only page provided', () => {
  const result = parsePaginationQuery({ page: '2' })
  assert.equal(result.paginate, true)
  assert.equal(result.page, 2)
  assert.equal(result.limit, DEFAULT_LIMIT)
  assert.equal(result.skip, DEFAULT_LIMIT)
})

test('buildPaginationMeta computes totals', () => {
  const meta = buildPaginationMeta({ page: 2, limit: 12, totalItems: 25 })
  assert.equal(meta.totalPages, 3)
  assert.equal(meta.hasPreviousPage, true)
  assert.equal(meta.hasNextPage, true)
})

test('cacheKeyFromQuery is stable', () => {
  assert.equal(
    cacheKeyFromQuery('blog:list', { page: 1, category: 'all' }),
    cacheKeyFromQuery('blog:list', { category: 'all', page: 1 }),
  )
})

test('GET /api/blog?page=1&limit=12 returns pagination meta', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/blog?page=1&limit=12`)
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.ok(Array.isArray(json.posts))
    assert.ok(json.pagination)
    assert.equal(json.pagination.page, 1)
    assert.equal(json.pagination.limit, 12)
    assert.ok(typeof json.pagination.totalItems === 'number')
  })
})

test('GET /api/projects?page=1&limit=12 returns pagination meta', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/projects?page=1&limit=12`)
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.ok(Array.isArray(json.projects))
    assert.ok(json.pagination)
    assert.equal(json.pagination.limit, 12)
  })
})

test('GET /api/blog without query remains backward-compatible', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/blog`)
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.ok(Array.isArray(json.posts))
    assert.equal(json.pagination, undefined)
  })
})
