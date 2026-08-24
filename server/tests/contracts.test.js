/**
 * API contract smoke for public endpoints.
 * QA mindset: assert response shape + status, not just "200 OK".
 */
import test from 'node:test'
import assert from 'node:assert/strict'
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

function assertPaginationMeta(pagination, { page, limit }) {
  assert.equal(typeof pagination, 'object')
  assert.equal(pagination.page, page)
  assert.equal(pagination.limit, limit)
  assert.equal(typeof pagination.totalItems, 'number')
  assert.equal(typeof pagination.totalPages, 'number')
  assert.equal(typeof pagination.hasPreviousPage, 'boolean')
  assert.equal(typeof pagination.hasNextPage, 'boolean')
}

test('contract: GET /api/health', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/health`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.status, 'ok')
    assert.equal(typeof body.service, 'string')
    assert.equal(typeof body.timestamp, 'string')
    assert.ok('dbEngine' in body)
  })
})

test('contract: GET /api/projects?page=1&limit=12', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/projects?page=1&limit=12`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(Array.isArray(body.projects))
    assertPaginationMeta(body.pagination, { page: 1, limit: 12 })
    for (const project of body.projects) {
      assert.equal(typeof project.title, 'string')
      assert.ok('liveUrl' in project)
      assert.ok(Array.isArray(project.tags))
      assert.equal(typeof project.featured, 'boolean')
    }
  })
})

test('contract: GET /api/projects?featured=true&page=1&limit=12', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/projects?featured=true&page=1&limit=12`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(Array.isArray(body.projects))
    assertPaginationMeta(body.pagination, { page: 1, limit: 12 })
    for (const project of body.projects) {
      assert.equal(project.featured, true)
    }
  })
})

test('contract: GET /api/blog?page=1&limit=12', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/blog?page=1&limit=12`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(Array.isArray(body.posts))
    assertPaginationMeta(body.pagination, { page: 1, limit: 12 })
  })
})

test('contract: GET /api/projects without query stays unpaginated (legacy)', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/projects`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(Array.isArray(body.projects))
    assert.equal(body.pagination, undefined)
  })
})
