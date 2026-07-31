/**
 * Classic Web Worker — loads Pyodide via importScripts (CDN).
 * Served from /public so Vite does not rewrite it into a module worker.
 */

/* global loadPyodide, importScripts */

const PYODIDE_INDEX = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'

let pyodide = null
let initPromise = null

function post(msg) {
  self.postMessage(msg)
}

async function ensurePyodide() {
  if (pyodide) return pyodide
  if (initPromise) return initPromise
  initPromise = (async () => {
    importScripts(PYODIDE_INDEX + 'pyodide.js')
    pyodide = await loadPyodide({
      indexURL: PYODIDE_INDEX,
      stdout: function () {},
      stderr: function () {},
    })
    await pyodide.runPythonAsync(
      'def _blocked_network(*_a, **_k):\n' +
        '    raise RuntimeError("Network access is disabled in the Algorithm Memorizer sandbox")\n' +
        'try:\n' +
        '    import urllib.request as _ur\n' +
        '    _ur.urlopen = _blocked_network\n' +
        'except Exception:\n' +
        '    pass\n'
    )
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
  await pyodide.runPythonAsync(
    'import sys\n' +
      'for _name in list(sys.modules.keys()):\n' +
      '    if _name.startswith("_algo_user"):\n' +
      '        del sys.modules[_name]\n' +
      '_g = globals()\n' +
      'for _k in list(_g.keys()):\n' +
      '    if _k.startswith("_user") or _k in ("_expr", "_expected_raw", "_max_out", "_load_error", "_out", "_err", "_ok", "_actual", "_expected", "_tree", "_e", "_blocked_network"):\n' +
      '        try:\n' +
      '            del _g[_k]\n' +
      '        except Exception:\n' +
      '            pass\n'
  )
}

function truncate(text, max) {
  var s = String(text == null ? '' : text)
  if (s.length <= max) return s
  return s.slice(0, max) + '\u2026'
}

function proxyToObject(row) {
  if (row == null) return {}
  try {
    if (typeof row.toJs === 'function') {
      var js = row.toJs({ dict_converter: Object.fromEntries })
      if (typeof row.destroy === 'function') row.destroy()
      return js
    }
  } catch (e) { /* ignore */ }
  return row
}

async function runTests(payload) {
  var code = String(payload.code || '')
  var testCases = Array.isArray(payload.testCases) ? payload.testCases : []
  var maxCodeLength = Number(payload.maxCodeLength) || 20000
  var maxOutputLength = Number(payload.maxOutputLength) || 8000

  if (code.length > maxCodeLength) {
    return {
      passed: false,
      results: [],
      error: 'Code exceeds maximum length',
      status: 'limit',
    }
  }

  var py = await ensurePyodide()
  await resetEnv()

  py.globals.set('_user_source', code)
  py.globals.set('_max_out', maxOutputLength)

  var loadResult = await py.runPythonAsync(
    'import traceback\n' +
      '_user_ns = {"__name__": "_algo_user"}\n' +
      '_load_error = None\n' +
      'try:\n' +
      '    _tree = compile(_user_source, "<user>", "exec")\n' +
      '    exec(_tree, _user_ns, _user_ns)\n' +
      'except Exception as _e:\n' +
      '    _load_error = "".join(traceback.format_exception_only(type(_e), _e)).strip()\n' +
      '_load_error\n'
  )

  var loadError = loadResult ? String(loadResult) : ''
  if (loadError) {
    var truncated = truncate(loadError, maxOutputLength)
    return {
      passed: false,
      results: testCases.map(function (t) {
        return {
          id: String(t.id || ''),
          name: String(t.name || ''),
          visible: t.visible !== false,
          passed: false,
          error: truncated,
          output: '',
        }
      }),
      error: truncated,
      status: 'runtime',
    }
  }

  var results = []
  for (var i = 0; i < testCases.length; i++) {
    var t = testCases[i]
    py.globals.set('_expr', String(t.expression || ''))
    py.globals.set('_expected_raw', String(t.expected || ''))

    var row = await py.runPythonAsync(
      'import ast\n' +
        'import traceback\n' +
        '_out = ""\n' +
        '_err = ""\n' +
        '_ok = False\n' +
        'try:\n' +
        '    _actual = eval(_expr, _user_ns, _user_ns)\n' +
        '    _out = repr(_actual)\n' +
        '    if len(_out) > int(_max_out):\n' +
        '        _out = _out[:int(_max_out)] + "…"\n' +
        '        raise RuntimeError("Output exceeds maximum length")\n' +
        '    try:\n' +
        '        _expected = ast.literal_eval(_expected_raw)\n' +
        '    except Exception:\n' +
        '        _expected = _expected_raw\n' +
        '    _ok = (_actual == _expected)\n' +
        '    if not _ok:\n' +
        '        _err = "expected " + repr(_expected_raw) + ", got " + _out\n' +
        'except Exception as _e:\n' +
        '    _ok = False\n' +
        '    _err = "".join(traceback.format_exception_only(type(_e), _e)).strip()\n' +
        '    if len(_err) > int(_max_out):\n' +
        '        _err = _err[:int(_max_out)] + "…"\n' +
        '{"passed": _ok, "output": _out, "error": _err}\n'
    )

    var js = proxyToObject(row)
    results.push({
      id: String(t.id || ''),
      name: String(t.name || ''),
      visible: t.visible !== false,
      passed: !!js.passed,
      error: truncate(js.error || '', maxOutputLength),
      output: truncate(js.output || '', maxOutputLength),
    })
  }

  var allPassed = results.length > 0 && results.every(function (r) { return r.passed })
  return {
    passed: allPassed,
    results: results,
    error: allPassed ? '' : ((results.find(function (r) { return !r.passed }) || {}).error || 'Some tests failed'),
    status: 'ok',
  }
}

self.onmessage = async function (event) {
  var data = event.data || {}
  var requestId = data.requestId
  try {
    if (data.type === 'init') {
      await ensurePyodide()
      post({ type: 'ready', requestId: requestId })
      return
    }
    if (data.type === 'reset') {
      await resetEnv()
      post({ type: 'ready', requestId: requestId })
      return
    }
    if (data.type === 'run') {
      var payload = await runTests(data)
      post({ type: 'result', requestId: requestId, payload: payload })
      return
    }
    post({ type: 'error', requestId: requestId, error: 'Unknown message type: ' + data.type })
  } catch (err) {
    post({ type: 'error', requestId: requestId, error: String((err && err.message) || err) })
  }
}
