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
    assert.equal(typeof body.pagination, 'object')
    assert.equal(body.pagination.page, 1)
    assert.equal(body.pagination.limit, 12)
    assert.equal(typeof body.pagination.totalItems, 'number')
    for (const project of body.projects) {
      assert.equal(typeof project.title, 'string')
      assert.ok('liveUrl' in project)
      assert.ok(Array.isArray(project.tags))
    }
  })
})

test('contract: GET /api/blog?page=1&limit=12', async () => {
  await withServer(async (base) => {
    const res = await fetch(`${base}/api/blog?page=1&limit=12`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.ok(Array.isArray(body.posts))
    assert.equal(typeof body.pagination, 'object')
    assert.equal(body.pagination.page, 1)
    assert.equal(body.pagination.limit, 12)
    assert.equal(typeof body.pagination.totalItems, 'number')
  })
})
