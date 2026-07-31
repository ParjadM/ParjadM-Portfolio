import { createPyodidePythonRunner } from './pyodideRunner.js'

/**
 * Factory for the active Python runner backend.
 * Swap to createJudge0PythonRunner() later without changing the Memorizer UI.
 * @returns {import('./runnerTypes.js').PythonRunner}
 */
export function createPythonRunner() {
  if (typeof Worker === 'undefined') {
    // SSR / non-browser — lazy import avoided; return a tiny fallback
    return {
      kind: 'unavailable',
      async init() {},
      async reset() {},
      async runTests() {
        return {
          passed: false,
          results: [],
          error: 'Python worker is unavailable in this environment',
          status: 'runtime',
        }
      },
      dispose() {},
    }
  }
  return createPyodidePythonRunner()
}
