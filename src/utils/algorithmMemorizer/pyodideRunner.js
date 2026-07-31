import { RUNNER_LIMITS, truncateOutput } from './runnerTypes.js'

function makeRequestId() {
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Create a dedicated Pyodide worker from the static public asset.
 * Using /algo-pyodide-worker.js avoids Vite turning it into a module worker
 * (which breaks CDN importScripts under CSP).
 * @param {typeof Worker} [WorkerImpl]
 */
export function spawnPyodideWorker(WorkerImpl = Worker) {
  return new WorkerImpl('/algo-pyodide-worker.js', {
    name: 'algo-memorizer-pyodide',
  })
}

/**
 * Pyodide-backed PythonRunner.
 * - Executes only inside a Web Worker
 * - Timeouts terminate + recreate the worker
 * - reset() clears the Python env (or recreates worker after timeout)
 *
 * @param {{ createWorker?: () => Worker }} [options]
 * @returns {import('./runnerTypes.js').PythonRunner}
 */
export function createPyodidePythonRunner(options = {}) {
  const createWorker = options.createWorker || (() => spawnPyodideWorker())

  /** @type {Worker | null} */
  let worker = null
  let disposed = false
  let generation = 0
  /** @type {Map<string, { resolve: Function, reject: Function, timer?: ReturnType<typeof setTimeout> }>} */
  const pending = new Map()

  function clearPending(errorMessage) {
    for (const [id, entry] of pending) {
      if (entry.timer) clearTimeout(entry.timer)
      entry.reject(new Error(errorMessage || 'Runner cancelled'))
      pending.delete(id)
    }
  }

  function attachWorker(w) {
    worker = w
    w.onmessage = (event) => {
      const data = event.data || {}
      const entry = pending.get(data.requestId)
      if (!entry) return
      if (entry.timer) clearTimeout(entry.timer)
      pending.delete(data.requestId)
      if (data.type === 'error') {
        entry.reject(new Error(data.error || 'Worker error'))
        return
      }
      if (data.type === 'ready') {
        entry.resolve(true)
        return
      }
      if (data.type === 'result') {
        entry.resolve(data.payload)
        return
      }
      entry.reject(new Error(`Unexpected worker message: ${data.type}`))
    }
    w.onerror = (err) => {
      clearPending(err?.message || 'Worker crashed')
    }
  }

  function terminateWorker() {
    if (!worker) return
    try {
      worker.terminate()
    } catch { /* ignore */ }
    worker = null
    generation += 1
  }

  function recreateWorker() {
    terminateWorker()
    clearPending('Worker restarted')
    const w = createWorker()
    attachWorker(w)
    return w
  }

  function callWorker(type, payload = {}, timeoutMs = RUNNER_LIMITS.defaultTimeoutMs) {
    if (disposed) return Promise.reject(new Error('Runner disposed'))
    if (!worker) recreateWorker()

    const requestId = makeRequestId()
    const gen = generation

    return new Promise((resolve, reject) => {
      const entry = {
        resolve: (value) => {
          if (generation !== gen && type === 'run') {
            // Stale generation after timeout recreate
            reject(new Error('Worker was restarted'))
            return
          }
          resolve(value)
        },
        reject,
        timer: undefined,
      }

      if (timeoutMs > 0) {
        entry.timer = setTimeout(() => {
          if (!pending.has(requestId)) return
          pending.delete(requestId)
          terminateWorker()
          try {
            recreateWorker()
          } catch { /* ignore */ }
          reject(Object.assign(new Error('Execution timed out'), { code: 'TIMEOUT' }))
        }, timeoutMs)
      }

      pending.set(requestId, entry)
      try {
        worker.postMessage({ type, requestId, ...payload })
      } catch (err) {
        if (entry.timer) clearTimeout(entry.timer)
        pending.delete(requestId)
        reject(err)
      }
    })
  }

  return {
    kind: 'pyodide',

    async init() {
      if (disposed) throw new Error('Runner disposed')
      if (!worker) recreateWorker()
      // First Pyodide download can take a while
      await callWorker('init', {}, 120_000)
    },

    async reset() {
      if (disposed) return
      if (!worker) {
        recreateWorker()
        return
      }
      try {
        await callWorker('reset', {}, 15_000)
      } catch {
        // If reset hangs/fails, hard recreate
        recreateWorker()
      }
    },

    async runTests({ code, testCases, timeoutMs = RUNNER_LIMITS.defaultTimeoutMs }) {
      if (disposed) {
        return { passed: false, results: [], error: 'Runner disposed', status: 'runtime' }
      }
      if (String(code || '').length > RUNNER_LIMITS.maxCodeLength) {
        return {
          passed: false,
          results: [],
          error: 'Code exceeds maximum length',
          status: 'limit',
        }
      }

      try {
        if (!worker) {
          await this.init()
        }
        const payload = await callWorker(
          'run',
          {
            code: String(code || ''),
            testCases: Array.isArray(testCases) ? testCases : [],
            maxCodeLength: RUNNER_LIMITS.maxCodeLength,
            maxOutputLength: RUNNER_LIMITS.maxOutputLength,
          },
          timeoutMs,
        )
        return {
          passed: !!payload?.passed,
          results: Array.isArray(payload?.results) ? payload.results : [],
          error: truncateOutput(payload?.error || ''),
          status: payload?.status || 'ok',
        }
      } catch (err) {
        const timedOut = err?.code === 'TIMEOUT' || /timed out/i.test(String(err?.message || ''))
        return {
          passed: false,
          results: [],
          error: truncateOutput(err?.message || 'Runtime error'),
          status: timedOut ? 'timeout' : 'runtime',
        }
      }
    },

    dispose() {
      disposed = true
      clearPending('Runner disposed')
      terminateWorker()
    },
  }
}
