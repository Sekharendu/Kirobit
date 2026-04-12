import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Mathematics from '@tiptap/extension-mathematics'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { CodeBlockWithToolbar } from './CodeBlockWithToolbar'
import { Star, Trash2 } from 'lucide-react'
import { getColors } from '../theme'
import 'katex/dist/katex.min.css'

export function EditorPane({
  loading,
  selectedNote,
  onCreateNote,
  onTitleChange,
  onEditorChange,
  onSlashKey,
  onContextMenu,
  onFormatMenuKeyDown,
  isFormatMenuOpen,
  onToggleFavorite,
  onDeleteNote,
  setEditorInstance,
  isMobile = false,
  theme = 'dark',
}) {
  const c = getColors(theme)
  const isFormatMenuOpenRef = useRef(isFormatMenuOpen)
  const onFormatMenuKeyDownRef = useRef(onFormatMenuKeyDown)
  const onSlashKeyRef = useRef(onSlashKey)
  const onContextMenuRef = useRef(onContextMenu)

  useEffect(() => { isFormatMenuOpenRef.current = isFormatMenuOpen }, [isFormatMenuOpen])
  useEffect(() => { onFormatMenuKeyDownRef.current = onFormatMenuKeyDown }, [onFormatMenuKeyDown])
  useEffect(() => { onSlashKeyRef.current = onSlashKey }, [onSlashKey])
  useEffect(() => { onContextMenuRef.current = onContextMenu }, [onContextMenu])

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3, 4] },
          codeBlock: false,
        }),
        CodeBlockWithToolbar,
        Highlight,
        TextStyle,
        Color,
        Mathematics,
      ],
      content: selectedNote?.content || '',
      onCreate: ({ editor }) => setEditorInstance(editor),
      editorProps: {
        handleDOMEvents: {
          contextmenu: (view, event) => {
            // ✅ Use event target to check if right-click is inside a code block DOM element
            const target = event.target
            const isInCodeBlock = target.closest('pre') !== null || 
                                  target.closest('code') !== null ||
                                  view.state.selection.$from.parent.type.name === 'codeBlock'
            
            if (isInCodeBlock) {
              event.preventDefault()
              return true
            }

            onContextMenuRef.current(event)
            return false
          },

          keydown: (view, event) => {
            const { $from } = view.state.selection
            // ✅ Walk up the node tree to check if anywhere in a code block
            let isInCodeBlock = false
            let depth = $from.depth
            while (depth >= 0) {
              if ($from.node(depth).type.name === 'codeBlock') {
                isInCodeBlock = true
                break
              }
              depth--
            }

            // ✅ Tab inside code block
            if (event.key === 'Tab') {
              if (isInCodeBlock) {
                event.preventDefault()
                view.dispatch(view.state.tr.insertText('    ').scrollIntoView())
                return true
              }
              return false
            }

            // ✅ Slash inside code block — just let it type, skip menu entirely
            if (event.key === '/') {
              if (isInCodeBlock) return false
              // not in code block — open slash menu
              setTimeout(() => {
                const selection = window.getSelection()
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0)
                  const rect = range.getBoundingClientRect()
                  onSlashKeyRef.current({ x: rect.left, y: rect.bottom })
                }
              }, 0)
              return false
            }

            // Format menu keyboard nav (only when not in code block)
            if (!isInCodeBlock && isFormatMenuOpenRef.current) {
              const handled = onFormatMenuKeyDownRef.current(event)
              if (handled) return true
              if (event.key === 'Backspace') {
                onFormatMenuKeyDownRef.current({ key: 'Escape', preventDefault: () => {} })
              }
              if (event.key.length === 1 && event.key !== '/') {
                onFormatMenuKeyDownRef.current({ key: 'Escape', preventDefault: () => {} })
              }
            }

            return false
          },
        },
        attributes: {
          class: 'tiptap scroll-thin min-h-[200px] w-full flex-1 overflow-y-auto border-0 bg-transparent focus:outline-none p-1',
        },
      },
      onUpdate: ({ editor }) => onEditorChange(editor.getHTML()),
      immediatelyRender: false,
    },
    [selectedNote?.id],
  )

  useEffect(() => {
    if (editor && selectedNote?.content !== undefined) {
      const current = editor.getHTML()
      if (current !== selectedNote.content) {
        editor.commands.setContent(selectedNote.content || '')
      }
    }
  }, [selectedNote?.id])

  if (loading) {
    return (
      <section className="flex-1 min-h-0 flex items-center justify-center">
        <p className="text-sm" style={{ color: c.textMuted }}>Loading notes…</p>
      </section>
    )
  }

  if (!selectedNote) {
    return (
      <section className="flex-1 min-h-0 flex flex-col items-center justify-center gap-5 px-6">
        <div className="flex flex-col items-center gap-1.5 select-none">
          <div className="mb-1 rounded-xl p-3" style={{ background: theme === 'dark' ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.05)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={theme === 'dark' ? '#2a2a2a' : '#d1d5db'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <line x1="10" y1="9" x2="8" y2="9"/>
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: c.textMuted }}>No note selected</p>
          <p className="text-xs text-center max-w-[220px] leading-relaxed" style={{ color: theme === 'dark' ? '#333' : '#bbb' }}>
            Pick a note from the sidebar or create a new one to start writing.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateNote}
          className="rounded-lg px-4 py-2 text-sm font-medium transition-all"
          style={{
            background: theme === 'dark' ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)',
            color: '#10b981',
            border: `1px solid ${theme === 'dark' ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.2)'}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme === 'dark' ? 'rgba(16,185,129,0.18)' : 'rgba(16,185,129,0.14)'
            e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme === 'dark' ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.08)'
            e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.2)'
          }}
        >
          Create your first note
        </button>
      </section>
    )
  }

return (
    <section className="flex-1 min-h-0 overflow-hidden flex flex-col">
      <div
        className="flex flex-col flex-1 min-h-0"
        style={{
          background: c.mainBg,
          padding: isMobile ? '10px 16px' : 'clamp(10px, 2.4vw, 38px)',
        }}
      >
        <div className="flex items-start justify-between mb-0.5 gap-4">
          <input
            type="text"
            value={selectedNote.title || ''}
            onChange={onTitleChange}
            className="flex-1 bg-transparent min-w-0 font-bold tracking-tight focus:outline-none"
            style={{
              fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
              color: c.textHeading,
              letterSpacing: '-0.025em',
            }}
            placeholder="Untitled"
          />

          {!isMobile && (
            <div className="flex items-center gap-1 pt-0.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => onToggleFavorite(selectedNote)}
                className="flex items-center justify-center h-8 w-8 rounded-md transition-colors"
                style={{ color: selectedNote.is_favorite ? c.favorite : c.iconDark }}
                onMouseEnter={(e) => {
                  if (!selectedNote.is_favorite) e.currentTarget.style.color = c.icon
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = selectedNote.is_favorite ? c.favorite : c.iconDark
                }}
                title={selectedNote.is_favorite ? 'Remove from favourites' : 'Add to favourites'}
              >
                <Star size={18} fill={selectedNote.is_favorite ? c.favorite : 'none'} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => onDeleteNote(selectedNote.id)}
                className="flex items-center justify-center h-8 w-8 rounded-md transition-colors"
                style={{ color: c.iconDark }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = c.danger
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = c.iconDark
                }}
                title="Delete note"
              >
                <Trash2 size={18} strokeWidth={1.75} />
              </button>
            </div>
          )}
        </div>

        <p className="mb-4 text-[11px] font-medium tracking-wide uppercase" style={{ color: c.lastEdited, letterSpacing: '0.06em' }}>
          Edited{' '}
          {selectedNote.updated_at
            ? new Date(selectedNote.updated_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'just now'}
        </p>

        <EditorContent editor={editor} className="flex-1 overflow-y-auto scroll-thin" />
      </div>
    </section>
  )
}