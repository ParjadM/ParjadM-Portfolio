import { useEffect, useLayoutEffect, useRef } from 'react'
import { EditorState, Compartment } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, placeholder as cmPlaceholder } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { python } from '@codemirror/lang-python'
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter } from '@codemirror/language'

const EDITOR_FONT =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
const FONT_SIZE = '14px'
const LINE_HEIGHT = '1.5'
const TAB_SIZE = 4
const GHOST_CLASS = 'algo-mem-ghost'

/**
 * Build ghost text: matched typed prefix becomes invisible (same-width spaces/newlines),
 * so only the untyped remainder of the skeleton shows as a guide.
 */
export function buildGhostText(skeleton, typed) {
  if (!skeleton) return ''
  const sk = String(skeleton)
  const ty = String(typed || '')
  let i = 0
  while (i < ty.length && i < sk.length && ty[i] === sk[i]) i += 1
  let hidden = ''
  for (let j = 0; j < i; j += 1) {
    hidden += sk[j] === '\n' ? '\n' : ' '
  }
  return hidden + sk.slice(i)
}

/**
 * CodeMirror 6 Python editor with Easy-mode ghost skeleton injected into the scroller
 * (scrolls with the doc, sits behind transparent content, pointer-events none).
 */
export function PythonCodeEditor({
  value,
  onChange,
  readOnly = false,
  locked = false,
  shadowCode = '',
  placeholder = '',
  className = '',
  ariaLabel = 'Python editor',
}) {
  const hostRef = useRef(null)
  const viewRef = useRef(null)
  const editableComp = useRef(new Compartment())
  const placeholderComp = useRef(new Compartment())
  const onChangeRef = useRef(onChange)
  const lockedRef = useRef(locked)
  const shadowRef = useRef(shadowCode)
  onChangeRef.current = onChange
  lockedRef.current = locked
  shadowRef.current = shadowCode

  const syncGhost = (view) => {
    if (!view) return
    const skeleton = shadowRef.current || ''
    const typed = view.state.doc.toString()
    let ghost = view.scrollDOM.querySelector(`.${GHOST_CLASS}`)

    if (!skeleton) {
      ghost?.remove()
      return
    }

    const gutters = view.dom.querySelector('.cm-gutters')
    const gutterW = gutters ? Math.round(gutters.getBoundingClientRect().width) : 42

    if (!ghost) {
      ghost = document.createElement('pre')
      ghost.className = GHOST_CLASS
      ghost.setAttribute('aria-hidden', 'true')
      ghost.style.cssText = [
        'position:absolute',
        'top:0',
        'right:0',
        'margin:0',
        'padding:4px 2px 4px 6px',
        'box-sizing:border-box',
        'pointer-events:none',
        'user-select:none',
        'white-space:pre',
        `font-family:${EDITOR_FONT}`,
        `font-size:${FONT_SIZE}`,
        `line-height:${LINE_HEIGHT}`,
        `tab-size:${TAB_SIZE}`,
        'color:rgba(186, 198, 212, 0.58)',
        'z-index:0',
        'overflow:visible',
      ].join(';')
      // Sit behind content, inside the scroller so scroll stays in sync.
      view.scrollDOM.style.position = 'relative'
      view.contentDOM.style.position = 'relative'
      view.contentDOM.style.zIndex = '1'
      view.contentDOM.style.backgroundColor = 'transparent'
      view.scrollDOM.insertBefore(ghost, view.contentDOM)
    }

    ghost.style.left = `${gutterW}px`
    ghost.textContent = buildGhostText(skeleton, typed)
  }

  useEffect(() => {
    if (!hostRef.current || viewRef.current) return undefined

    const extensions = [
      lineNumbers(),
      highlightActiveLine(),
      foldGutter(),
      history(),
      bracketMatching(),
      python(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
      EditorState.tabSize.of(TAB_SIZE),
      editableComp.current.of(EditorView.editable.of(!readOnly)),
      placeholderComp.current.of(
        cmPlaceholder(shadowCode ? '' : (placeholder || 'Write your Python solution…')),
      ),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current?.(update.state.doc.toString())
        }
        if (update.docChanged || update.geometryChanged || update.viewportChanged) {
          syncGhost(update.view)
        }
      }),
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: FONT_SIZE,
          backgroundColor: 'transparent',
        },
        '.cm-scroller': {
          fontFamily: EDITOR_FONT,
          fontSize: FONT_SIZE,
          lineHeight: LINE_HEIGHT,
          overflow: 'auto',
          backgroundColor: 'transparent',
        },
        '.cm-content': {
          caretColor: '#6ee7b7',
          minHeight: '280px',
          padding: '4px 0',
          fontFamily: EDITOR_FONT,
          fontSize: FONT_SIZE,
          lineHeight: LINE_HEIGHT,
          tabSize: String(TAB_SIZE),
          backgroundColor: 'transparent',
        },
        '.cm-line': {
          padding: '0 2px 0 6px',
          lineHeight: LINE_HEIGHT,
          backgroundColor: 'transparent',
        },
        '.cm-activeLine': {
          backgroundColor: 'rgba(255,255,255,0.04)',
        },
        '.cm-gutters': {
          backgroundColor: 'rgba(0,0,0,0.2)',
          color: '#6b7280',
          border: 'none',
          zIndex: '2',
        },
        '&.cm-focused': { outline: '2px solid rgba(16,185,129,0.45)' },
      }),
      EditorView.domEventHandlers({
        copy(event) {
          if (lockedRef.current) {
            event.preventDefault()
            return true
          }
          return false
        },
        cut(event) {
          if (lockedRef.current) {
            event.preventDefault()
            return true
          }
          return false
        },
        paste(event) {
          if (lockedRef.current) {
            event.preventDefault()
            return true
          }
          return false
        },
        drop(event) {
          if (lockedRef.current) {
            event.preventDefault()
            return true
          }
          return false
        },
        dragstart(event) {
          if (lockedRef.current) {
            event.preventDefault()
            return true
          }
          return false
        },
        contextmenu(event) {
          if (lockedRef.current) {
            event.preventDefault()
            return true
          }
          return false
        },
      }),
    ]

    const state = EditorState.create({
      doc: value || '',
      extensions,
    })
    const view = new EditorView({ state, parent: hostRef.current })
    viewRef.current = view

    const onKeyDown = (e) => {
      if (!lockedRef.current) return
      const key = e.key?.toLowerCase?.() || ''
      const mod = e.ctrlKey || e.metaKey
      if (mod && (key === 'v' || key === 'c' || key === 'x' || key === 'insert')) {
        e.preventDefault()
        e.stopPropagation()
      }
      if (e.shiftKey && key === 'insert') {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    view.dom.addEventListener('keydown', onKeyDown, true)

    requestAnimationFrame(() => syncGhost(view))

    return () => {
      view.dom.removeEventListener('keydown', onKeyDown, true)
      view.scrollDOM.querySelector(`.${GHOST_CLASS}`)?.remove()
      view.destroy()
      viewRef.current = null
    }
  }, [])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const current = view.state.doc.toString()
    if (value != null && value !== current) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      })
    }
  }, [value])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    view.dispatch({
      effects: editableComp.current.reconfigure(EditorView.editable.of(!readOnly)),
    })
  }, [readOnly])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const text = shadowCode ? '' : (placeholder || 'Write your Python solution…')
    view.dispatch({
      effects: placeholderComp.current.reconfigure(cmPlaceholder(text)),
    })
  }, [shadowCode, placeholder])

  useLayoutEffect(() => {
    shadowRef.current = shadowCode
    syncGhost(viewRef.current)
  }, [shadowCode, value])

  return (
    <div
      className={`relative rounded-xl border border-white/10 overflow-hidden bg-black/35 ${className}`}
    >
      <div
        ref={hostRef}
        className="relative z-10 h-full min-h-[280px] bg-transparent [&_.cm-editor]:bg-transparent [&_.cm-scroller]:bg-transparent [&_.cm-content]:bg-transparent"
        role="textbox"
        aria-label={ariaLabel}
        aria-multiline="true"
      />
    </div>
  )
}
