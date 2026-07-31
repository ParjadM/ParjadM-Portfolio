/**
 * Module Web Worker — loads Pyodide from CDN.
 * Receives only code + test cases (no DOM, secrets, or app APIs).
 */

const PYODIDE_INDEX = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'

/** @type {import('pyodide').PyodideInterface | null} */
let pyodide = null
let initPromise = null

function post(msg) {
  self.postMessage(msg)
}

async function ensurePyodide() {
  if (pyodide) return pyodide
  if (initPromise) return initPromise
  initPromise = (async () => {
    const { loadPyodide } = await import(/* @vite-ignore */ `${PYODIDE_INDEX}pyodide.mjs`)
    pyodide = await loadPyodide({
      indexURL: PYODIDE_INDEX,
      stdout: () => {},
      stderr: () => {},
    })
    await pyodide.runPythonAsync(`
def _blocked_network(*_a, **_k):
    raise RuntimeError("Network access is disabled in the Algorithm Memorizer sandbox")

try:
    import urllib.request as _ur
    _ur.urlopen = _blocked_network
except Exception:
    pass
`)
    return pyodide
  })()
  try {
    return await initPromise
  } catch (err) {
    initPromise = null
    pyodide = null
    throw err
  }
}

async function resetEnv() {
  if (!pyodide) return
  await pyodide.runPythonAsync(`
import sys

for _name in list(sys.modules.keys()):
    if _name.startswith("_algo_user"):
        del sys.modules[_name]

_g = globals()
for _k in list(_g.keys()):
    if _k.startswith("_user") or _k in (
        "_expr", "_expected_raw", "_max_out", "_load_error",
        "_out", "_err", "_ok", "_actual", "_expected", "_tree", "_e",
        "_blocked_network",
    ):
        try:
            del _g[_k]
        except Exception:
            pass
`)
}

function truncate(text, max) {
  const s = String(text ?? '')
  if (s.length <= max) return s
  return `${s.slice(0, max)}…`
}

function proxyToObject(row) {
  if (row == null) return {}
  try {
    if (typeof row.toJs === 'function') {
      const js = row.toJs({ dict_converter: Object.fromEntries })
      if (typeof row.destroy === 'function') row.destroy()
      return js
    }
  } catch { /* fall through */ }
  return row
}

async function runTests(payload) {
  const code = String(payload.code || '')
  const testCases = Array.isArray(payload.testCases) ? payload.testCases : []
  const maxCodeLength = Number(payload.maxCodeLength) || 20_000
  const maxOutputLength = Number(payload.maxOutputLength) || 8_000

  if (code.length > maxCodeLength) {
    return {
      passed: false,
      results: [],
      error: 'Code exceeds maximum length',
      status: 'limit',
    }
  }

  const py = await ensurePyodide()
  await resetEnv()

  py.globals.set('_user_source', code)
  py.globals.set('_max_out', maxOutputLength)

  const loadResult = await py.runPythonAsync(`
import traceback

_user_ns = {"__name__": "_algo_user"}
_load_error = None
try:
    _tree = compile(_user_source, "<user>", "exec")
    exec(_tree, _user_ns, _user_ns)
except Exception as _e:
    _load_error = "".join(traceback.format_exception_only(type(_e), _e)).strip()
_load_error
`)

  const loadError = loadResult ? String(loadResult) : ''
  if (loadError) {
    const truncated = truncate(loadError, maxOutputLength)
    return {
      passed: false,
      results: testCases.map((t) => ({
        id: String(t.id || ''),
        name: String(t.name || ''),
        visible: t.visible !== false,
        passed: false,
        error: truncated,
        output: '',
      })),
      error: truncated,
      status: 'runtime',
    }
  }

  const results = []
  for (const t of testCases) {
    py.globals.set('_expr', String(t.expression || ''))
    py.globals.set('_expected_raw', String(t.expected || ''))

    const row = await py.runPythonAsync(`
import ast
import traceback

_out = ""
_err = ""
_ok = False
try:
    _actual = eval(_expr, _user_ns, _user_ns)
    _out = repr(_actual)
    if len(_out) > int(_max_out):
        _out = _out[:int(_max_out)] + "…"
        raise RuntimeError("Output exceeds maximum length")
    try:
        _expected = ast.literal_eval(_expected_raw)
    except Exception:
        _expected = _expected_raw
    _ok = (_actual == _expected)
    if not _ok:
        _err = "expected " + repr(_expected_raw) + ", got " + _out
except Exception as _e:
    _ok = False
    _err = "".join(traceback.format_exception_only(type(_e), _e)).strip()
    if len(_err) > int(_max_out):
        _err = _err[:int(_max_out)] + "…"

{"passed": _ok, "output": _out, "error": _err}
`)

    const js = proxyToObject(row)
    results.push({
      id: String(t.id || ''),
      name: String(t.name || ''),
      visible: t.visible !== false,
      passed: !!js.passed,
      error: truncate(js.error || '', maxOutputLength),
      output: truncate(js.output || '', maxOutputLength),
    })
  }

  const allPassed = results.length > 0 && results.every((r) => r.passed)
  return {
    passed: allPassed,
    results,
    error: allPassed ? '' : (results.find((r) => !r.passed)?.error || 'Some tests failed'),
    status: 'ok',
  }
}

self.onmessage = async (event) => {
  const data = event.data || {}
  const requestId = data.requestId
  try {
    if (data.type === 'init') {
      await ensurePyodide()
      post({ type: 'ready', requestId })
      return
    }
    if (data.type === 'reset') {
      await resetEnv()
      post({ type: 'ready', requestId })
      return
    }
    if (data.type === 'run') {
      const payload = await runTests(data)
      post({ type: 'result', requestId, payload })
      return
    }
    post({ type: 'error', requestId, error: `Unknown message type: ${data.type}` })
  } catch (err) {
    post({ type: 'error', requestId, error: String(err?.message || err) })
  }
}
