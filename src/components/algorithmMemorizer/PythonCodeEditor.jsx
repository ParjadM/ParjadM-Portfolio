import { useEffect, useRef } from 'react'
import { EditorState, Compartment } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, placeholder as cmPlaceholder } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { python } from '@codemirror/lang-python'
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter } from '@codemirror/language'

/**
 * CodeMirror 6 Python editor with anti-cheat hooks while `locked` (attempt active).
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
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

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
      editableComp.current.of(EditorView.editable.of(!readOnly)),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current?.(update.state.doc.toString())
        }
      }),
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: '14px',
          backgroundColor: 'rgba(0,0,0,0.35)',
        },
        '.cm-scroller': {
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          overflow: 'auto',
        },
        '.cm-content': { caretColor: '#6ee7b7', minHeight: '280px' },
        '.cm-gutters': {
          backgroundColor: 'rgba(0,0,0,0.25)',
          color: '#6b7280',
          border: 'none',
        },
        '&.cm-focused': { outline: '2px solid rgba(16,185,129,0.45)' },
        '.cm-shadow-layer': {
          color: 'rgba(156, 163, 175, 0.45)',
          pointerEvents: 'none',
          whiteSpace: 'pre',
          fontFamily: 'inherit',
          padding: '4px 2px 4px 6px',
          lineHeight: '1.5',
        },
      }),
      cmPlaceholder(placeholder || 'Write your Python solution…'),
      EditorView.domEventHandlers({
        copy(event) {
          if (locked) {
            event.preventDefault()
            return true
          }
          return false
        },
        cut(event) {
          if (locked) {
            event.preventDefault()
            return true
          }
          return false
        },
        paste(event) {
          if (locked) {
            event.preventDefault()
            return true
          }
          return false
        },
        drop(event) {
          if (locked) {
            event.preventDefault()
            return true
          }
          return false
        },
        dragstart(event) {
          if (locked) {
            event.preventDefault()
            return true
          }
          return false
        },
        contextmenu(event) {
          if (locked) {
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
      if (!locked) return
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

    return () => {
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

  return (
    <div className={`relative rounded-xl border border-white/10 overflow-hidden ${className}`}>
      {shadowCode ? (
        <pre
          aria-hidden="true"
          className="cm-shadow-layer absolute inset-0 z-0 overflow-hidden p-2 pl-[42px] pt-[4px] text-[14px] leading-[1.5] pointer-events-none select-none"
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
        >
          {shadowCode}
        </pre>
      ) : null}
      <div
        ref={hostRef}
        className="relative z-10 h-full min-h-[280px] [&_.cm-editor]:bg-transparent"
        role="textbox"
        aria-label={ariaLabel}
        aria-multiline="true"
      />
    </div>
  )
}
