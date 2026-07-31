import { RUNNER_LIMITS, truncateOutput } from './runnerTypes.js'

/**
 * Stage-1 stub runner — keeps the UI/API contract without executing Python yet.
 * Stage 2 replaces this with Pyodide via createPythonRunner().
 * @returns {import('./runnerTypes.js').PythonRunner}
 */
export function createStubPythonRunner() {
  let disposed = false

  return {
    kind: 'stub',
    async init() {
      if (disposed) throw new Error('Runner disposed')
    },
    async reset() {},
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
      void timeoutMs
      const results = (testCases || []).map((t) => ({
        id: t.id,
        name: t.name || '',
        visible: !!t.visible,
        passed: false,
        error: 'Python runner not ready yet (Stage 2: Pyodide worker).',
        output: '',
      }))
      return {
        passed: false,
        results,
        error: truncateOutput('Python execution is not enabled in this build stage.'),
        status: 'not_ready',
      }
    },
    dispose() {
      disposed = true
    },
  }
}
