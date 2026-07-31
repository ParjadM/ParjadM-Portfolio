import { describe, expect, it } from 'vitest'
import { formatElapsed, isNewPersonalBest, pickPersonalBest } from './timing.js'
import { createStubPythonRunner } from './stubRunner.js'
import { RUNNER_LIMITS } from './runnerTypes.js'

describe('formatElapsed', () => {
  it('formats minutes, seconds, and centiseconds', () => {
    expect(formatElapsed(0)).toBe('0:00.00')
    expect(formatElapsed(1250)).toBe('0:01.25')
    expect(formatElapsed(61_040)).toBe('1:01.04')
  })
})

describe('personal best helpers', () => {
  it('treats first pass as a personal best', () => {
    expect(isNewPersonalBest(5000, null)).toBe(true)
  })

  it('requires a strictly faster time', () => {
    expect(isNewPersonalBest(4000, 5000)).toBe(true)
    expect(isNewPersonalBest(5000, 5000)).toBe(false)
    expect(isNewPersonalBest(6000, 5000)).toBe(false)
  })

  it('picks the fastest passed attempt', () => {
    const best = pickPersonalBest([
      { id: '1', passed: false, elapsedMilliseconds: 1000 },
      { id: '2', passed: true, elapsedMilliseconds: 9000 },
      { id: '3', passed: true, elapsedMilliseconds: 4500 },
    ])
    expect(best.id).toBe('3')
  })

  it('returns null when nothing passed', () => {
    expect(pickPersonalBest([{ passed: false, elapsedMilliseconds: 1 }])).toBeNull()
  })
})

describe('stub python runner', () => {
  it('rejects oversized code', async () => {
    const runner = createStubPythonRunner()
    await runner.init()
    const result = await runner.runTests({
      code: 'x'.repeat(RUNNER_LIMITS.maxCodeLength + 1),
      testCases: [{ id: 't1', expression: '1', expected: '1' }],
    })
    expect(result.status).toBe('limit')
    expect(result.passed).toBe(false)
    runner.dispose()
  })

  it('returns not_ready for Stage 1', async () => {
    const runner = createStubPythonRunner()
    const result = await runner.runTests({
      code: 'def f():\n  return 1\n',
      testCases: [{ id: 't1', name: 'one', visible: true, expression: 'f()', expected: '1' }],
    })
    expect(result.status).toBe('not_ready')
    expect(result.passed).toBe(false)
    expect(result.results).toHaveLength(1)
  })
})
