import test from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { Analytics, Project, BlogPost } from '../src/db/mongo.js'
import { initDatabase } from '../src/db/index.js'

async function serve(fn) {
  const app = await createApp()
  const server = app.listen(0)
  try { await fn(`http://127.0.0.1:${server.address().port}`) }
  finally { await new Promise(resolve => server.close(resolve)) }
}

test('database failures are retryable, never cached as empty data', async t => {
  const previous = process.env.MONGODB_URI
  process.env.MONGODB_URI = 'mongodb://test.invalid/not-a-real-database'
  t.after(() => { if (previous === undefined) delete process.env.MONGODB_URI; else process.env.MONGODB_URI = previous })
  let fail = true
  const connect = t.mock.method(mongoose, 'connect', async () => { if (fail) throw new Error('simulated outage') })
  t.mock.method(Analytics, 'findOne', () => ({ lean: async () => ({ pageviews: 10234, uniqueVisitors: 2034 }) }))
  await serve(async base => {
    for (const route of ['/api/metrics', '/api/blog', '/api/projects', '/api/blog/507f1f77bcf86cd799439011']) {
      const response = await fetch(base + route)
      assert.equal(response.status, 503)
      assert.equal(response.headers.get('cache-control'), 'no-store')
      const body = await response.json()
      assert.ok(body.error)
      assert.equal(body.uniqueVisitors, undefined)
      assert.equal(body.projects, undefined)
      assert.equal(body.posts, undefined)
    }
    fail = false
    const response = await fetch(base + '/api/metrics')
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('cache-control'), 'no-store')
    assert.deepEqual(await response.json(), { available: true, pageviews: 10234, uniqueVisitors: 2034 })
    assert.ok(connect.mock.callCount() >= 5)
  })
})

test('concurrent startup requests share one connection attempt', async t => {
  const previous = process.env.MONGODB_URI
  process.env.MONGODB_URI = 'mongodb://test.invalid/not-a-real-database'
  t.after(() => { if (previous === undefined) delete process.env.MONGODB_URI; else process.env.MONGODB_URI = previous })
  let release
  const connect = t.mock.method(mongoose, 'connect', () => new Promise(resolve => { release = resolve }))
  const requests = [initDatabase(), initDatabase(), initDatabase()]
  assert.equal(connect.mock.callCount(), 1)
  release()
  await Promise.all(requests)
})

test('query errors are 503, not successful empty projects or blog lists', async t => {
  const previous = process.env.MONGODB_URI
  process.env.MONGODB_URI = 'mongodb://test.invalid/not-a-real-database'
  t.after(() => { if (previous === undefined) delete process.env.MONGODB_URI; else process.env.MONGODB_URI = previous })
  t.mock.method(mongoose, 'connect', async () => {})
  t.mock.method(Project, 'updateOne', async () => ({}))
  t.mock.method(Project, 'find', () => { throw new Error('simulated query failure') })
  t.mock.method(BlogPost, 'find', () => { throw new Error('simulated query failure') })
  t.mock.method(Analytics, 'findOne', () => ({ lean: async () => null }))
  await serve(async base => {
    for (const route of ['/api/projects', '/api/blog', '/api/metrics']) {
      const response = await fetch(base + route)
      assert.equal(response.status, 503)
      assert.equal(response.headers.get('cache-control'), 'no-store')
      assert.ok((await response.json()).error)
    }
  })
})

test('production without database configuration fails closed', async t => {
  const uri = process.env.MONGODB_URI, env = process.env.NODE_ENV
  delete process.env.MONGODB_URI
  process.env.NODE_ENV = 'production'
  t.after(() => {
    if (uri === undefined) delete process.env.MONGODB_URI; else process.env.MONGODB_URI = uri
    if (env === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = env
  })
  await serve(async base => {
    const response = await fetch(base + '/api/projects')
    assert.equal(response.status, 503)
    assert.equal(response.headers.get('cache-control'), 'no-store')
  })
})
