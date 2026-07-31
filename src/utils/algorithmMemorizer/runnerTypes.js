/**
 * Reusable Python runner interface for Algorithm Memorizer.
 * Swap `createPythonRunner` implementation (Pyodide → Judge0) without UI changes.
 */

export const RUNNER_LIMITS = {
  maxCodeLength: 20_000,
  maxOutputLength: 8_000,
  defaultTimeoutMs: 8_000,
}

/**
 * @typedef {object} RunnerTestCase
 * @property {string} id
 * @property {string} [name]
 * @property {boolean} [visible]
 * @property {string} expression
 * @property {string} expected
 */

/**
 * @typedef {object} RunnerTestResult
 * @property {string} id
 * @property {string} [name]
 * @property {boolean} [visible]
 * @property {boolean} passed
 * @property {string} [error]
 * @property {string} [output]
 */

/**
 * @typedef {object} RunnerRunResult
 * @property {boolean} passed
 * @property {RunnerTestResult[]} results
 * @property {string} [error]
 * @property {'ok'|'timeout'|'limit'|'runtime'|'not_ready'} status
 */

/**
 * @typedef {object} PythonRunner
 * @property {() => Promise<void>} init
 * @property {(opts: { code: string, testCases: RunnerTestCase[], timeoutMs?: number }) => Promise<RunnerRunResult>} runTests
 * @property {() => Promise<void>} reset
 * @property {() => void} dispose
 * @property {string} kind
 */

export function truncateOutput(text, max = RUNNER_LIMITS.maxOutputLength) {
  const s = String(text ?? '')
  if (s.length <= max) return s
  return `${s.slice(0, max)}…`
}
