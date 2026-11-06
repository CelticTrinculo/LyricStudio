import { EditorState, StateEffect, StateField } from 'https://esm.sh/@codemirror/state@6.5.2?target=es2022'
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  hoverTooltip,
  keymap,
  lineNumbers,
  placeholder,
  showTooltip,
} from 'https://esm.sh/@codemirror/view@6.38.6?target=es2022&deps=@codemirror/state@6.5.2'
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from 'https://esm.sh/@codemirror/commands@6.8.1?target=es2022&deps=@codemirror/state@6.5.2,@codemirror/view@6.38.6'
import { countSyllables } from './tools/syllableCounter.js'

export const DEFAULT_EDITOR_TEXT = [
  'When the room gets quiet enough,',
  'the page starts breathing back.',
  '',
  '',
].join('\n')

const EDITOR_PLACEHOLDER = 'Write a line…\nThen another one.\nLeave blank lines for stanzas.'

const SYLLABLE_HINT_DELAY_MS = 700
const SYLLABLE_HINT_HOLD_MS = 550
const SYLLABLE_HINT_AUTO_HIDE_MS = 4000

let lastHoverMouse = { x: 0, y: 0 }
let hoverTooltipDom = null

function shouldAutofocusEditor() {
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches
}

function normalizeEditorText(value = '') {
  return String(value).replace(/\r\n?/g, '\n')
}

function createLineEntry(lineNumber, text) {
  return {
    id: `line-${lineNumber}`,
    number: lineNumber,
    text,
  }
}

function parseDisplayedLineNumber(value = '') {
  const parsedLineNumber = Number.parseInt(String(value).replace(/[^\d]+/g, ''), 10)
  return Number.isFinite(parsedLineNumber) ? parsedLineNumber : null
}

function getLineFromPointerEvent(view, event, fallbackPos = null) {
  const targetNode = event.target instanceof Node ? event.target : null
  const targetElement = targetNode instanceof Element ? targetNode : targetNode?.parentElement ?? null
  const lineElement = targetElement?.closest('.cm-line')

  if (lineElement && view.contentDOM.contains(lineElement)) {
    return view.state.doc.lineAt(view.posAtDOM(lineElement, 0))
  }

  const position = view.posAtCoords({
    x: event.clientX,
    y: event.clientY,
  }) ?? fallbackPos

  return typeof position === 'number' ? view.state.doc.lineAt(position) : null
}

function focusEditorViewLine(targetView, lineNumber, selectWholeLine = true, updateHash = true) {
  let line

  try {
    line = targetView.state.doc.line(lineNumber)
  } catch {
    return false
  }

  targetView.focus()
  targetView.dispatch({
    selection: {
      anchor: selectWholeLine ? line.from : line.to,
      head: line.to,
    },
    scrollIntoView: true,
  })

  if (updateHash) {
    window.history.replaceState(null, '', `#line-${lineNumber}`)
  }

  return true
}

/* ---------- Syllable hints (hover + long-press) ---------- */

function buildSyllableTooltip(view, lineNumber, { atCursor = false } = {}) {
  let line

  try {
    line = view.state.doc.line(lineNumber)
  } catch {
    return null
  }

  const count = countSyllables(line.text)

  if (!count) {
    return null
  }

  const label = count === 1 ? '1 syllable' : `${count} syllables`

  return {
    pos: line.from,
    // Keep the hint alive while the cursor travels anywhere along the line.
    end: atCursor ? line.to : line.from,
    above: true,
    create: () => {
      const dom = document.createElement('div')
      dom.className = 'cm-syllable-hint'
      dom.textContent = label

      if (!atCursor) {
        // Long-press hint: anchored at the line start, next to the gutter.
        return { dom }
      }

      hoverTooltipDom = dom

      return {
        dom,
        // Track the cursor: the pill centers on the mouse horizontally
        // and floats just above it.
        getCoords: () => ({
          top: lastHoverMouse.y,
          bottom: lastHoverMouse.y,
          left: lastHoverMouse.x,
          right: lastHoverMouse.x,
        }),
        get offset() {
          return { x: -(dom.offsetWidth / 2), y: 6 }
        },
      }
    },
  }
}

// Touch long-press tooltip: a StateField feeding the showTooltip facet,
// so a descriptor can be shown or cleared with a simple state effect.
const setTouchSyllableTooltip = StateEffect.define()

const touchSyllableTooltipField = StateField.define({
  create: () => null,
  update: (value, tr) => {
    for (const effect of tr.effects) {
      if (effect.is(setTouchSyllableTooltip)) {
        return effect.value
      }
    }

    if (tr.docChanged) {
      return null
    }

    return value
  },
  provide: (field) => showTooltip.from(field),
})

export function createEditor({ container, onChange, onSelectionChange }) {
  container.innerHTML = '<div class="editor-grid"><div class="editor-host"></div></div>'

  const editorHost = container.querySelector('.editor-host')
  let view

  function getEditorText() {
    return view.state.doc.toString()
  }

  function getLines() {
    return getEditorText().split('\n').map((text, index) => createLineEntry(index + 1, text))
  }

  function getActiveLineNumber() {
    return view.state.doc.lineAt(view.state.selection.main.head).number
  }

  function getActiveLine() {
    const activeLine = view.state.doc.lineAt(view.state.selection.main.head)
    return createLineEntry(activeLine.number, activeLine.text)
  }

  function getSelectedText() {
    const { from, to } = view.state.selection.main
    return view.state.sliceDoc(from, to).trim()
  }

  function buildSnapshot() {
    return {
      lines: getLines(),
      activeLine: getActiveLine(),
      selectedText: getSelectedText(),
    }
  }

  function emitChange() {
    onChange?.(buildSnapshot())
  }

  function emitSelectionChange() {
    onSelectionChange?.(buildSnapshot())
  }

  function focusLine(lineNumber, selectWholeLine = true, updateHash = true) {
    focusEditorViewLine(view, lineNumber, selectWholeLine, updateHash)
  }

  function syncLineHash() {
    const hashMatch = window.location.hash.match(/^#line-(\d+)$/)

    if (!hashMatch) {
      return false
    }

    focusLine(Number(hashMatch[1]), true, false)
    return true
  }

  view = new EditorView({
    state: EditorState.create({
      doc: DEFAULT_EDITOR_TEXT,
      extensions: [
        history(),
        lineNumbers(),
        EditorView.domEventHandlers({
          mousedown(event, currentView) {
            if (event.button !== 0 || event.detail < 3) {
              return false
            }

            const targetNode = event.target instanceof Node ? event.target : null

            if (!targetNode || !currentView.contentDOM.contains(targetNode)) {
              return false
            }

            const line = getLineFromPointerEvent(currentView, event)

            if (!line) {
              return false
            }

            event.preventDefault()
            return focusEditorViewLine(currentView, line.number)
          },
        }),
        EditorView.lineWrapping,
        hoverTooltip((currentView, pos) => {
          const line = currentView.state.doc.lineAt(pos)
          return buildSyllableTooltip(currentView, line.number, { atCursor: true })
        }, { hoverTime: SYLLABLE_HINT_DELAY_MS, hideOnChange: true }),
        touchSyllableTooltipField,
        highlightActiveLine(),
        highlightActiveLineGutter(),
        EditorState.tabSize.of(2),
        placeholder(EDITOR_PLACEHOLDER),
        EditorView.contentAttributes.of({
          spellcheck: 'true',
          'aria-label': 'Lyric draft editor',
        }),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          indentWithTab,
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            emitChange()
          }

          if (update.docChanged || update.selectionSet || update.focusChanged) {
            emitSelectionChange()
          }
        }),
      ],
    }),
    parent: editorHost,
  })

  /* ---------- Syllable hints: gutter long-press (touch) ---------- */

  let touchHoldTimer = null
  let touchAutoHideTimer = null
  let suppressGutterTap = false

  function showTouchSyllableTooltip(lineNumber) {
    view.dispatch({
      effects: setTouchSyllableTooltip.of(buildSyllableTooltip(view, lineNumber)),
    })
  }

  function dismissTouchSyllableTooltip() {
    if (view.state.field(touchSyllableTooltipField)) {
      view.dispatch({
        effects: setTouchSyllableTooltip.of(null),
      })
    }
  }

  const getGutterLineNumber = (event) => {
    const target = event.target instanceof Element ? event.target : null
    const gutterElement = target?.closest('.cm-lineNumbers .cm-gutterElement')

    if (!gutterElement) {
      return null
    }

    return parseDisplayedLineNumber(gutterElement.textContent)
  }

  const handleGutterPointerDown = (event) => {
    const lineNumber = getGutterLineNumber(event)

    if (!lineNumber) {
      dismissTouchSyllableTooltip()
      return
    }

    event.preventDefault()
    suppressGutterTap = false
    window.clearTimeout(touchHoldTimer)
    touchHoldTimer = window.setTimeout(() => {
      suppressGutterTap = true
      showTouchSyllableTooltip(lineNumber)
      touchAutoHideTimer = window.setTimeout(dismissTouchSyllableTooltip, SYLLABLE_HINT_AUTO_HIDE_MS)
    }, SYLLABLE_HINT_HOLD_MS)
  }

  const handleGutterPointerUp = (event) => {
    window.clearTimeout(touchHoldTimer)
    touchHoldTimer = null

    if (suppressGutterTap) {
      suppressGutterTap = false
      event.preventDefault()
      return
    }

    const lineNumber = getGutterLineNumber(event)

    if (lineNumber) {
      focusLine(lineNumber)
    }
  }

  const handleGutterPointerCancel = () => {
    window.clearTimeout(touchHoldTimer)
    touchHoldTimer = null
    suppressGutterTap = false
  }

  const handleContextMenu = (event) => {
    if (getGutterLineNumber(event) !== null) {
      event.preventDefault()
    }
  }

  const handleScrollDismissTouchHint = () => {
    dismissTouchSyllableTooltip()
  }

  const handleHashChange = () => {
    syncLineHash()
  }

  const handleHoverMouseMove = (event) => {
    if (event.pointerType !== 'mouse') {
      return
    }

    lastHoverMouse = { x: event.clientX, y: event.clientY }

    if (!hoverTooltipDom) {
      return
    }

    if (!hoverTooltipDom.isConnected) {
      hoverTooltipDom = null
      return
    }

    const shell = hoverTooltipDom.closest('.cm-tooltip')

    if (!shell) {
      return
    }

    // Follow the cursor: centered horizontally, floating just above it.
    const rect = shell.getBoundingClientRect()
    const left = Math.max(4, Math.min(event.clientX - rect.width / 2, window.innerWidth - rect.width - 4))
    const aboveTop = event.clientY - rect.height - 6
    const top = aboveTop < 4 ? event.clientY + 10 : aboveTop

    shell.style.left = `${left}px`
    shell.style.top = `${top}px`
  }

  view.dom.addEventListener('pointermove', handleHoverMouseMove)
  view.dom.addEventListener('pointerdown', handleGutterPointerDown)
  view.dom.addEventListener('pointerup', handleGutterPointerUp)
  view.dom.addEventListener('pointercancel', handleGutterPointerCancel)
  view.dom.addEventListener('contextmenu', handleContextMenu)
  view.scrollDOM.addEventListener('scroll', handleScrollDismissTouchHint, { passive: true })
  window.addEventListener('hashchange', handleHashChange)

  queueMicrotask(() => {
    const focusedHashLine = syncLineHash()

    if (!focusedHashLine && shouldAutofocusEditor()) {
      view.focus()
    }

    emitChange()
    emitSelectionChange()
  })

  return {
    getLines,
    getSelectedText,
    getActiveLine,
    getActiveLineNumber,
    getTextarea() {
      return null
    },
    getEditorText,
    setEditorText(nextText = '') {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: normalizeEditorText(nextText),
        },
        selection: {
          anchor: 0,
          head: 0,
        },
        scrollIntoView: true,
      })
      view.focus()
    },
    setFlaggedLines(_lineEntries) {
      // Styling hooks for flagged lines can be added in a later CodeMirror pass.
    },
    requestMeasure() {
      view.requestMeasure()
    },
    focusLine,
    insertBelowActive(text) {
      const activeLine = view.state.doc.lineAt(view.state.selection.main.head)
      const normalizedText = normalizeEditorText(text)
      const isLastLine = activeLine.number === view.state.doc.lines
      const insertionPoint = isLastLine ? activeLine.to : activeLine.to + 1
      const insertionText = isLastLine ? `\n${normalizedText}` : `${normalizedText}\n`

      view.dispatch({
        changes: {
          from: insertionPoint,
          insert: insertionText,
        },
      })

      focusLine(activeLine.number + 1, false)
    },
    destroy() {
      view.dom.removeEventListener('pointermove', handleHoverMouseMove)
      view.dom.removeEventListener('pointerdown', handleGutterPointerDown)
      view.dom.removeEventListener('pointerup', handleGutterPointerUp)
      view.dom.removeEventListener('pointercancel', handleGutterPointerCancel)
      view.dom.removeEventListener('contextmenu', handleContextMenu)
      view.scrollDOM.removeEventListener('scroll', handleScrollDismissTouchHint)
      window.removeEventListener('hashchange', handleHashChange)
      window.clearTimeout(touchHoldTimer)
      window.clearTimeout(touchAutoHideTimer)
      hoverTooltipDom = null
      view.destroy()
    },
  }
}
