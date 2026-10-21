import test from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import { initDatabase } from '../src/db/index.js'
import { BlogPost } from '../src/db/mongo.js'
import { explainBlogPost } from '../src/ai/blogExplain.js'

test('generated summaries survive persistence outages in both modes', async t => {
  const previous = process.env.MONGODB_URI
  process.env.MONGODB_URI = 'mongodb://test.invalid/test'
  t.after(() => { if (previous === undefined) delete process.env.MONGODB_URI; else process.env.MONGODB_URI = previous })
  t.mock.method(mongoose, 'connect', async () => {})
  await initDatabase()
  const postId = '507f1f77bcf86cd799439011'
  t.mock.method(BlogPost, 'findOne', () => ({ lean: async () => ({ title: 'An article', content: 'The published article content.' }) }))
  const save = t.mock.method(BlogPost, 'updateOne', async () => { throw new Error('Database unavailable') })
  for (const mode of ['tldr', 'junior']) {
    const result = await explainBlogPost({ postId, mode }, { generate: async () => ({ ok: true, source: 'test', reply: 'Generated explanation.' }) })
    assert.equal(result.ok, true)
    assert.equal(result.reply, 'Generated explanation.')
    assert.equal(result.mode, mode)
  }
  assert.equal(save.mock.calls[0].arguments[0].content, 'The published article content.')
  const empty = await explainBlogPost({ postId, mode: 'tldr' }, { generate: async () => ({ ok: true, reply: '' }) })
  assert.equal(empty.status, 502)
  assert.equal(save.mock.callCount(), 2)
})
