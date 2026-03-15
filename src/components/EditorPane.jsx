import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Mathematics from '@tiptap/extension-mathematics'
import 'katex/dist/katex.min.css'

export function EditorPane({
  loading,
  selectedNote,
  onCreateNote,
  onTitleChange,
  onEditorChange,
  onSlashKey,
  onContextMenu,
  onSlashMenuKeyDown,
  isSlashMenuOpen,
  setEditorInstance,
}) {
  const isSlashMenuOpenRef = useRef(isSlashMenuOpen)
  const onSlashMenuKeyDownRef = useRef(onSlashMenuKeyDown)
  const onSlashKeyRef = useRef(onSlashKey)
  const onContextMenuRef = useRef(onContextMenu)

  useEffect(() => { isSlashMenuOpenRef.current = isSlashMenuOpen }, [isSlashMenuOpen])
  useEffect(() => { onSlashMenuKeyDownRef.current = onSlashMenuKeyDown }, [onSlashMenuKeyDown])
  useEffect(() => { onSlashKeyRef.current = onSlashKey }, [onSlashKey])
  useEffect(() => { onContextMenuRef.current = onContextMenu }, [onContextMenu])

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
        Highlight,
        Mathematics,
      ],
      content: selectedNote?.content || '',
      onCreate: ({ editor }) => setEditorInstance(editor),
      editorProps: {
        handleDOMEvents: {
          contextmenu: (view, event) => {
            onContextMenuRef.current(event)
            return false
          },
          keydown: (view, event) => {
            if (isSlashMenuOpenRef.current) {
              const handled = onSlashMenuKeyDownRef.current(event)
              if (handled) return true
              if (event.key === 'Backspace') {
                onSlashMenuKeyDownRef.current({ key: 'Escape', preventDefault: () => {} })
              }
              if (event.key.length === 1 && event.key !== '/') {
                onSlashMenuKeyDownRef.current({ key: 'Escape', preventDefault: () => {} })
              }
            }
if (event.key === '/') {
  setTimeout(() => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      // ✅ Pass cursor position FROM editor state AFTER '/' is inserted
      onSlashKeyRef.current({ 
        x: rect.left, 
        y: rect.bottom,
        editorPos: null // will be set in App via editor.state
      })
    }
  }, 0)
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
        <p className="text-sm" style={{ color: '#555555' }}>Loading notes…</p>
      </section>
    )
  }

  if (!selectedNote) {
    return (
      <section className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3">
        <p className="text-sm" style={{ color: '#555555' }}>No notes yet.</p>
        <button
          type="button"
          onClick={onCreateNote}
          className="rounded-md px-3 py-1.5 text-xs font-medium text-white transition-colors"
          style={{ background: '#3730a3' }}
        >
          Create your first note
        </button>
      </section>
    )
  }

  return (
    <section className="flex-1 min-h-0 overflow-hidden flex flex-col">
      <div
        className="flex flex-col flex-1 min-h-0 px-16 py-8"
        style={{ background: '#0f0f0f' }}
      >
        {/* Title */}
        <input
          type="text"
          value={selectedNote.title || ''}
          onChange={onTitleChange}
          className="mb-1 w-full bg-transparent text-3xl font-bold tracking-tight focus:outline-none"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #a0a0a0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          placeholder="Untitled"
        />

        {/* Last edited */}
        <p className="mb-6 text-xs" style={{ color: '#3a3a3a' }}>
          Last edited{' '}
          {selectedNote.updated_at
            ? new Date(selectedNote.updated_at).toLocaleString()
            : 'just now'}
        </p>

        {/* Editor */}
        <EditorContent editor={editor} className="flex-1 overflow-y-auto scroll-thin" />
      </div>
    </section>
  )
}