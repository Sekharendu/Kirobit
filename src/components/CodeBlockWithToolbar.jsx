import { useEffect, useRef, useState } from 'react'
import CodeBlock from '@tiptap/extension-code-block'
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from '@tiptap/react'
import { Copy, ClipboardPaste } from 'lucide-react'

const FEEDBACK_MS = 2200

function CodeBlockToolbarView({ editor, node, getPos }) {
  const [feedback, setFeedback] = useState(null)
  const hideTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [])

  const showFeedback = (kind) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    setFeedback(kind)
    hideTimerRef.current = setTimeout(() => {
      setFeedback(null)
      hideTimerRef.current = null
    }, FEEDBACK_MS)
  }

  const copyCode = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(node.textContent)
      showFeedback('copied')
    } catch {
      /* ignore */
    }
  }

  const pasteCode = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const text = await navigator.clipboard.readText()
      const pos = getPos()
      if (pos === undefined) return
      const ok = editor
        .chain()
        .focus()
        .command(({ tr, state }) => {
          const block = state.doc.nodeAt(pos)
          if (!block || block.type.name !== 'codeBlock') return false
          const from = pos + 1
          const to = pos + block.nodeSize - 1
          tr.replaceWith(from, to, state.schema.text(text))
          return true
        })
        .run()
      if (ok) showFeedback('pasted')
    } catch {
      /* ignore */
    }
  }

  const btnClass =
    'flex h-7 w-7 items-center justify-center rounded-md text-[#9ca3af] transition-colors hover:bg-[#2a2a2a] hover:text-[#e5e7eb]'

  return (
    <NodeViewWrapper className="code-block-with-toolbar my-4 overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#141414]">
      <div
        className="flex items-center justify-between gap-2 border-b border-[#2a2a2a] bg-[#1a1a1a] px-2 py-1"
        contentEditable={false}
      >
        <div className="min-h-[18px] min-w-0 flex-1 pr-1">
          {feedback && (
            <span
              className="text-[11px] font-medium tracking-wide text-emerald-400/95"
              role="status"
              aria-live="polite"
            >
              {feedback === 'copied' ? 'Copied' : 'Pasted'}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center justify-end gap-0.5">
        <button
          type="button"
          className={btnClass}
          title="Copy code"
          onMouseDown={(e) => e.preventDefault()}
          onClick={copyCode}
        >
          <Copy size={15} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          className={btnClass}
          title="Paste into code block"
          onMouseDown={(e) => e.preventDefault()}
          onClick={pasteCode}
        >
          <ClipboardPaste size={15} strokeWidth={1.75} />
        </button>
        </div>
      </div>
      <pre className="code-block-with-toolbar__pre m-0 overflow-x-auto rounded-none border-0 bg-[#141414] px-4 py-3">
        <NodeViewContent as="code" className="code-block-with-toolbar__code" />
      </pre>
    </NodeViewWrapper>
  )
}

export const CodeBlockWithToolbar = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockToolbarView)
  },

  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      Enter: ({ editor }) => {
        if (!this.editor.isActive('codeBlock')) return false
        return editor.commands.command(({ tr, state }) => {
          const { $from } = state.selection
          tr.insertText('\n', $from.pos, state.selection.to)
          return true
        })
      },
    }
  },
})
