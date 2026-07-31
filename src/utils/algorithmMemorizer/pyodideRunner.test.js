import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { createPyodidePythonRunner } from './pyodideRunner.js'
import { RUNNER_LIMITS } from './runnerTypes.js'

function createMockWorker(handler) {
  const workers = []
  class MockWorker {
    constructor() {
      this.onmessage = null
      this.onerror = null
      this.terminated = false
      workers.push(this)
    }

    postMessage(msg) {
      if (this.terminated) return
      Promise.resolve()
        .then(() => handler(this, msg))
        .catch((err) => {
          this.onerror?.(err)
        })
    }

    terminate() {
      this.terminated = true
    }

    emit(data) {
      this.onmessage?.({ data })
    }
  }
  return { MockWorker, workers }
}

describe('createPyodidePythonRunner', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('runs tests through the worker and returns pass', async () => {
    const { MockWorker } = createMockWorker((worker, msg) => {
      if (msg.type === 'init' || msg.type === 'reset') {
        worker.emit({ type: 'ready', requestId: msg.requestId })
        return
      }
      if (msg.type === 'run') {
        worker.emit({
          type: 'result',
          requestId: msg.requestId,
          payload: {
            passed: true,
            status: 'ok',
            error: '',
            results: [{ id: 't1', passed: true, visible: true, error: '', output: '1' }],
          },
        })
      }
    })

    const runner = createPyodidePythonRunner({ createWorker: () => new MockWorker() })
    await runner.init()
    const result = await runner.runTests({
      code: 'def f():\n  return 1\n',
      testCases: [{ id: 't1', expression: 'f()', expected: '1' }],
      timeoutMs: 5000,
    })
    expect(result.passed).toBe(true)
    expect(result.status).toBe('ok')
    expect(result.results[0].passed).toBe(true)
    runner.dispose()
  })

  it('enforces max code length on the main thread', async () => {
    const { MockWorker } = createMockWorker((worker, msg) => {
      if (msg.type === 'init') worker.emit({ type: 'ready', requestId: msg.requestId })
    })
    const runner = createPyodidePythonRunner({ createWorker: () => new MockWorker() })
    await runner.init()
    const result = await runner.runTests({
      code: 'x'.repeat(RUNNER_LIMITS.maxCodeLength + 10),
      testCases: [],
    })
    expect(result.status).toBe('limit')
    expect(result.passed).toBe(false)
    runner.dispose()
  })

  it('terminates and recreates the worker on timeout', async () => {
    const { MockWorker, workers } = createMockWorker((worker, msg) => {
      if (msg.type === 'init') {
        worker.emit({ type: 'ready', requestId: msg.requestId })
        return
      }
      // run: never responds → timeout
    })

    const runner = createPyodidePythonRunner({ createWorker: () => new MockWorker() })
    await runner.init()
    expect(workers.length).toBe(1)

    const pending = runner.runTests({
      code: 'while True: pass',
      testCases: [{ id: 't1', expression: '1', expected: '1' }],
      timeoutMs: 1000,
    })

    await vi.advanceTimersByTimeAsync(1000)
    const result = await pending
    expect(result.status).toBe('timeout')
    expect(result.passed).toBe(false)
    expect(workers[0].terminated).toBe(true)
    expect(workers.length).toBeGreaterThanOrEqual(2)
    runner.dispose()
  })
})
