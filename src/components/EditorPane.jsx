import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Mathematics from '@tiptap/extension-mathematics'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { CodeBlockWithToolbar } from './CodeBlockWithToolbar'
import {
  Star, Trash2, Type, Heading1, Heading2, Heading3, Pilcrow,
  Bold, Italic, Strikethrough, Highlighter, List, ListOrdered,
  Code2, Eraser, Palette, X,
} from 'lucide-react'
import { getColors } from '../theme'
import 'katex/dist/katex.min.css'

const MOBILE_FORMAT_GROUPS = [
  {
    title: 'Headings',
    items: [
      { label: 'Heading 1', command: 'h1', icon: Heading1 },
      { label: 'Heading 2', command: 'h2', icon: Heading2 },
      { label: 'Heading 3', command: 'h3', icon: Heading3 },
      { label: 'Paragraph', command: 'body', icon: Pilcrow },
    ],
  },
  {
    title: 'Text Style',
    items: [
      { label: 'Bold', command: 'bold', icon: Bold },
      { label: 'Italic', command: 'italic', icon: Italic },
      { label: 'Strikethrough', command: 'strike', icon: Strikethrough },
      { label: 'Highlight', command: 'highlight', icon: Highlighter },
    ],
  },
  {
    title: 'Lists & Blocks',
    items: [
      { label: 'Bullet list', command: 'bullet', icon: List },
      { label: 'Numbered list', command: 'numbered', icon: ListOrdered },
      { label: 'Code block', command: 'code', icon: Code2 },
    ],
  },
  {
    title: null,
    items: [
      { label: 'Clear formatting', command: 'clear', icon: Eraser, danger: true },
    ],
  },
]

const TEXT_COLORS = [
  { label: 'Red', color: '#ef4444' },
  { label: 'Orange', color: '#f97316' },
  { label: 'Yellow', color: '#eab308' },
  { label: 'Green', color: '#22c55e' },
  { label: 'Blue', color: '#3b82f6' },
  { label: 'Purple', color: '#a855f7' },
  { label: 'Pink', color: '#ec4899' },
  { label: 'Gray', color: '#6b7280' },
]

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
  isMobileEditorActive = false,
  theme = 'dark',
}) {
  const c = getColors(theme)
  const [mobileFormatOpen, setMobileFormatOpen] = useState(false)
  const isMobileRef = useRef(isMobile)
  isMobileRef.current = isMobile
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
            let isInCodeBlock = false
            let depth = $from.depth
            while (depth >= 0) {
              if ($from.node(depth).type.name === 'codeBlock') {
                isInCodeBlock = true
                break
              }
              depth--
            }

            if (event.key === 'Tab') {
              if (isInCodeBlock) {
                event.preventDefault()
                view.dispatch(view.state.tr.insertText('    ').scrollIntoView())
                return true
              }
              return false
            }

            if (event.key === '/') {
              if (isInCodeBlock || isMobileRef.current) return false
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

  const noteHasBodyText = Boolean(
    selectedNote?.content
      ?.replace(/<\s*br\s*\/?>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .trim(),
  )

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
          onClick={(e) => {
            e.stopPropagation()
            onCreateNote(null)
          }}
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
          background: !isMobile && theme === 'dark' ? c.sidebarBg : c.mainBg,
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
              fontSize: isMobile ? 'clamp(1.375rem, 5vw, 1.875rem)' : 'clamp(1.25rem, 4vw, 1.75rem)',
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

        <div className={`mb-4 ${isMobile ? 'text-[12px]' : 'text-[11px]'} font-medium flex items-center gap-2`} style={{ color: c.lastEdited }}>
          <span>
            Created{' '}
            {selectedNote.created_at
              ? new Date(selectedNote.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
              : 'just now'}
          </span>
          <span style={{ color: c.borderLight }}>·</span>
          <span>
            Edited{' '}
            {selectedNote.updated_at
              ? new Date(selectedNote.updated_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'just now'}
          </span>
        </div>

        {!noteHasBodyText && (
          <p
            className={`mb-2 ${isMobile ? 'text-[12px]' : 'text-[11px]'} select-none`}
            style={{ color: c.textMuted }}
          >
            {isMobile ? 'Tap the format button (T) to style your text.' : 'Type / to open the formatting menu.'}
          </p>
        )}

        <EditorContent editor={editor} className="flex-1 overflow-y-auto scroll-thin" />
      </div>

      {/* Mobile format button */}
      {isMobile && isMobileEditorActive && selectedNote && (
        <button
          type="button"
          onClick={() => setMobileFormatOpen(true)}
          className="fixed z-40 flex items-center justify-center rounded-full shadow-lg active:scale-95 transition-transform"
          style={{
            bottom: 24,
            right: 20,
            width: 48,
            height: 48,
            background: c.accent,
            color: '#fff',
          }}
          aria-label="Format text"
        >
          <Type size={22} strokeWidth={2.2} />
        </button>
      )}

      {/* Mobile format bottom sheet */}
      {isMobile && mobileFormatOpen && (
        <>
          <div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            onClick={() => setMobileFormatOpen(false)}
          />
          <div
            className="fixed left-0 right-0 bottom-0 z-50 rounded-t-2xl overflow-hidden"
            style={{
              background: c.contextBg,
              borderTop: `1px solid ${c.border}`,
              maxHeight: '75dvh',
              animation: 'mobileSheetUp 0.22s ease-out',
            }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${c.border}` }}>
              <span className="text-[14px] font-semibold" style={{ color: c.textHeading }}>Formatting</span>
              <button
                type="button"
                onClick={() => setMobileFormatOpen(false)}
                className="flex items-center justify-center h-8 w-8 rounded-full transition-colors"
                style={{ color: c.iconMuted, background: c.hover }}
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
            <div className="overflow-y-auto scroll-thin px-2 py-2" style={{ maxHeight: 'calc(75dvh - 52px)' }}>
              {MOBILE_FORMAT_GROUPS.map((group, gi) => (
                <div key={gi} className="mb-2 last:mb-0">
                  {group.title && (
                    <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: c.textMuted }}>
                      {group.title}
                    </p>
                  )}
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isActive = editor && (
                      (item.command === 'bold' && editor.isActive('bold')) ||
                      (item.command === 'italic' && editor.isActive('italic')) ||
                      (item.command === 'strike' && editor.isActive('strike')) ||
                      (item.command === 'highlight' && editor.isActive('highlight')) ||
                      (item.command === 'h1' && editor.isActive('heading', { level: 1 })) ||
                      (item.command === 'h2' && editor.isActive('heading', { level: 2 })) ||
                      (item.command === 'h3' && editor.isActive('heading', { level: 3 })) ||
                      (item.command === 'bullet' && editor.isActive('bulletList')) ||
                      (item.command === 'numbered' && editor.isActive('orderedList')) ||
                      (item.command === 'code' && editor.isActive('codeBlock'))
                    )
                    return (
                      <button
                        key={item.command}
                        type="button"
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors active:opacity-70"
                        style={{
                          color: item.danger ? c.danger : isActive ? c.accent : c.textBright,
                          background: isActive ? `${c.accent}12` : 'transparent',
                        }}
                        onClick={() => {
                          if (!editor) return
                          const chain = editor.chain().focus()
                          const actions = {
                            h1: () => chain.toggleHeading({ level: 1 }).run(),
                            h2: () => chain.toggleHeading({ level: 2 }).run(),
                            h3: () => chain.toggleHeading({ level: 3 }).run(),
                            body: () => chain.setParagraph().run(),
                            bold: () => chain.toggleBold().run(),
                            italic: () => chain.toggleItalic().run(),
                            strike: () => chain.toggleStrike().run(),
                            highlight: () => chain.toggleHighlight().run(),
                            bullet: () => chain.toggleBulletList().run(),
                            numbered: () => chain.toggleOrderedList().run(),
                            code: () => chain.toggleCodeBlock().run(),
                            clear: () => chain.clearNodes().unsetAllMarks().run(),
                          }
                          actions[item.command]?.()
                          if (['h1', 'h2', 'h3', 'body', 'bullet', 'numbered', 'code', 'clear'].includes(item.command)) {
                            setMobileFormatOpen(false)
                          }
                        }}
                      >
                        <Icon size={18} strokeWidth={1.75} className="flex-shrink-0" />
                        <span className="text-[14px] font-medium">{item.label}</span>
                        {isActive && <span className="ml-auto text-[11px] font-semibold" style={{ color: c.accent }}>ON</span>}
                      </button>
                    )
                  })}
                </div>
              ))}

              {/* Text colors */}
              <div className="mb-2">
                <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: c.textMuted }}>
                  Text Color
                </p>
                <div className="flex items-center gap-2 px-3 py-2 flex-wrap">
                  {TEXT_COLORS.map((tc) => (
                    <button
                      key={tc.color}
                      type="button"
                      title={tc.label}
                      onClick={() => {
                        if (!editor) return
                        editor.chain().focus().setColor(tc.color).run()
                      }}
                      className="flex items-center justify-center h-9 w-9 rounded-lg transition-transform active:scale-110"
                      style={{ background: `${tc.color}18`, border: `2px solid ${tc.color}` }}
                    >
                      <span className="rounded-full" style={{ width: 14, height: 14, background: tc.color }} />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      if (!editor) return
                      editor.chain().focus().unsetColor().run()
                    }}
                    className="flex items-center justify-center h-9 w-9 rounded-lg transition-transform active:scale-110"
                    style={{ color: c.danger, background: c.hover }}
                    title="Reset color"
                  >
                    <Eraser size={16} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}