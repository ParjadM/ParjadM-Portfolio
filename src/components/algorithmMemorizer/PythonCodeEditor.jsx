import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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

/**
 * CodeMirror 6 Python editor with optional Easy-mode ghost skeleton and anti-cheat hooks while `locked`.
 *
 * Layout: relative container → non-interactive shadow layer (z-0) → transparent CM editor (z-10).
 * Typed characters cover the ghost; empty positions show the skeleton.
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
  const shadowRef = useRef(null)
  const viewRef = useRef(null)
  const editableComp = useRef(new Compartment())
  const placeholderComp = useRef(new Compartment())
  const onChangeRef = useRef(onChange)
  const lockedRef = useRef(locked)
  const gutterPadRef = useRef(42)
  const [gutterPad, setGutterPad] = useState(42)
  onChangeRef.current = onChange
  lockedRef.current = locked

  const showShadow = Boolean(shadowCode)

  const syncShadowFromView = (view) => {
    const shadow = shadowRef.current
    if (!shadow || !view) return
    const gutters = view.dom.querySelector('.cm-gutters')
    const gutterW = gutters ? Math.round(gutters.getBoundingClientRect().width) : 42
    if (gutterW !== gutterPadRef.current) {
      gutterPadRef.current = gutterW
      setGutterPad(gutterW)
    }
    shadow.scrollTop = view.scrollDOM.scrollTop
    shadow.scrollLeft = view.scrollDOM.scrollLeft
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
      placeholderComp.current.of(cmPlaceholder(shadowCode ? '' : (placeholder || 'Write your Python solution…'))),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current?.(update.state.doc.toString())
        }
        if (update.docChanged || update.geometryChanged || update.viewportChanged) {
          syncShadowFromView(update.view)
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
        },
        '.cm-gutters': {
          backgroundColor: 'rgba(0,0,0,0.2)',
          color: '#6b7280',
          border: 'none',
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

    const scroller = view.scrollDOM
    const onScroll = () => syncShadowFromView(view)
    scroller.addEventListener('scroll', onScroll, { passive: true })

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

    requestAnimationFrame(() => syncShadowFromView(view))

    return () => {
      scroller.removeEventListener('scroll', onScroll)
      view.dom.removeEventListener('keydown', onKeyDown, true)
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
    const view = viewRef.current
    if (view) syncShadowFromView(view)
  }, [shadowCode, value, showShadow, gutterPad])

  return (
    <div
      className={`relative rounded-xl border border-white/10 overflow-hidden bg-black/35 ${className}`}
    >
      {showShadow ? (
        <pre
          ref={shadowRef}
          aria-hidden="true"
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none m-0"
          style={{
            fontFamily: EDITOR_FONT,
            fontSize: FONT_SIZE,
            lineHeight: LINE_HEIGHT,
            tabSize: TAB_SIZE,
            color: 'rgba(156, 163, 175, 0.42)',
            paddingTop: 4,
            paddingBottom: 4,
            paddingRight: 2,
            paddingLeft: gutterPad + 6,
            whiteSpace: 'pre',
          }}
        >
          {shadowCode}
        </pre>
      ) : null}
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
