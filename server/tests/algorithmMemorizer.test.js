import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  __resetMemoryStore,
  ensureAlgorithmSeed,
  listAlgorithms,
  createAlgorithm,
  updateAlgorithm,
  deleteAlgorithm,
  saveAttempt,
  getProgress,
  getAlgorithmById,
} from '../src/services/algorithmMemorizerStore.js'

describe('algorithm memorizer store', () => {
  beforeEach(() => {
    __resetMemoryStore()
  })

  it('seeds classic CS algorithms catalog into memory', async () => {
    const result = await ensureAlgorithmSeed()
    assert.equal(result.seeded, true)
    assert.ok(result.count >= 20)
    assert.equal(result.version, 2)
    const list = await listAlgorithms({ admin: false })
    assert.ok(list.length >= 20)
    assert.ok(list.every((a) => a.reference === undefined))
    assert.ok(list.some((a) => a.slug === 'binary-search'))
    assert.ok(list.some((a) => a.slug === 'merge-sort'))
    assert.ok(!list.some((a) => a.slug === 'two-sum'))
  })

  it('reseeds memory store when seed version changes', async () => {
    await ensureAlgorithmSeed()
    const first = await listAlgorithms({ admin: true })
    assert.ok(first.length >= 20)
    const again = await ensureAlgorithmSeed()
    assert.equal(again.seeded, false)
    assert.ok(again.count >= 20)
  })

  it('supports admin CRUD', async () => {
    await ensureAlgorithmSeed()
    const created = await createAlgorithm({
      slug: 'test-algo',
      title: 'Test Algo',
      category: 'searching',
      difficulty: 'easy',
      description: 'desc',
      skeleton: 'def f():\n  pass\n',
      reference: 'def f():\n  return 1\n',
      testCases: [{ id: 't1', name: 'one', visible: true, expression: 'f()', expected: '1' }],
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      enabled: true,
      order: 999,
    })
    assert.equal(created.slug, 'test-algo')
    assert.ok(created.reference)

    const updated = await updateAlgorithm(created.id, {
      ...created,
      title: 'Test Algo Updated',
      testCases: created.runnerTests || created.testCases,
    })
    assert.equal(updated.title, 'Test Algo Updated')

    const fetched = await getAlgorithmById(created.id, { admin: true })
    assert.equal(fetched.title, 'Test Algo Updated')

    const ok = await deleteAlgorithm(created.id)
    assert.equal(ok, true)
    assert.equal(await getAlgorithmById(created.id, { admin: true }), null)
  })

  it('tracks attempts and personal best only among passes', async () => {
    await ensureAlgorithmSeed()
    const [algo] = await listAlgorithms()
    await saveAttempt({
      visitorId: 'v1',
      algorithmId: algo.id,
      difficultyMode: 'hard',
      elapsedMilliseconds: 8000,
      passed: false,
      testResults: [],
    })
    await saveAttempt({
      visitorId: 'v1',
      algorithmId: algo.id,
      difficultyMode: 'hard',
      elapsedMilliseconds: 5000,
      passed: true,
      testResults: [{ id: 't1', passed: true }],
    })
    await saveAttempt({
      visitorId: 'v1',
      algorithmId: algo.id,
      difficultyMode: 'hard',
      elapsedMilliseconds: 7000,
      passed: true,
      testResults: [{ id: 't1', passed: true }],
    })

    const progress = await getProgress('v1', algo.id)
    assert.equal(progress.attemptCount, 3)
    assert.equal(progress.personalBest.elapsedMilliseconds, 5000)
    assert.equal(progress.personalBest.passed, true)
  })
})
