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
  // ✅ Refs so handlers always see latest values without triggering re-creation
  const isSlashMenuOpenRef = useRef(isSlashMenuOpen)
  const onSlashMenuKeyDownRef = useRef(onSlashMenuKeyDown)
  const onSlashKeyRef = useRef(onSlashKey)
  const onContextMenuRef = useRef(onContextMenu)

  // Keep refs in sync on every render
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
            // ✅ Read from ref — always fresh value, no stale closure
            if (isSlashMenuOpenRef.current) {
              const handled = onSlashMenuKeyDownRef.current(event)
              if (handled) return true
            }

            if (event.key === '/') {
              // ✅ Use setTimeout so the '/' is inserted FIRST, then we read position
              setTimeout(() => {
                const selection = window.getSelection()
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0)
                  const rect = range.getBoundingClientRect()
                  onSlashKeyRef.current({ x: rect.left, y: rect.bottom })
                }
              }, 0)
            }
            return false
          },
        },
        attributes: {
          class: 'tiptap scroll-thin min-h-[200px] w-full flex-1 overflow-y-auto border-0 bg-transparent text-sm leading-relaxed text-slate-100 focus:outline-none p-1',
        },
      },
      onUpdate: ({ editor }) => onEditorChange(editor.getHTML()),
      immediatelyRender: false,
    },
    [selectedNote?.id], // ✅ Only re-create when note changes, NOT on menu state
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
      <section className="flex-1 overflow-hidden px-8 py-5">
        <div className="flex h-full items-center justify-center text-sm text-slate-400">
          Loading notes…
        </div>
      </section>
    )
  }

  if (!selectedNote) {
    return (
      <section className="flex-1 overflow-hidden px-8 py-5">
        <div className="flex h-full flex-col items-center justify-center text-sm text-slate-500">
          <p>No notes yet.</p>
          <button
            type="button"
            onClick={onCreateNote}
            className="mt-3 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
          >
            Create your first note
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="flex-1 overflow-hidden px-8 py-5">
    
      <div className="mx-auto flex h-full max-w-3xl flex-col rounded-xl border border-slate-800/80 bg-slate-950/70 px-6 py-4 shadow-soft">
        <input
          type="text"
          value={selectedNote.title || ''}
          onChange={onTitleChange}
          className="mb-1 w-full bg-transparent text-xl font-semibold text-slate-50 placeholder:text-slate-500 focus:outline-none"
          placeholder="Untitled"
        />
        <p className="mb-3 text-xs text-slate-500">
          Last edited{' '}
          {selectedNote.updated_at
            ? new Date(selectedNote.updated_at).toLocaleString()
            : 'just now'}
        </p>
        <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
      </div>
    </section>
  )
}