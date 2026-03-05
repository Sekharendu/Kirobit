import PropTypes from 'prop-types'

export function EditorPane({
  loading,
  selectedNote,
  onCreateNote,
  onTitleChange,
  editorRef,
  onEditorChange,
  onEditorKeyDown,
  onEditorContextMenu,
}) {
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
        <div
          key={selectedNote.id}
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={onEditorChange}
          onKeyDown={onEditorKeyDown}
          onContextMenu={onEditorContextMenu}
          className="scroll-thin min-h-0 w-full flex-1 overflow-y-auto whitespace-pre-wrap border-0 bg-transparent text-sm leading-relaxed text-slate-100 focus:outline-none"
          dangerouslySetInnerHTML={{ __html: selectedNote.content || '' }}
        />
      </div>
    </section>
  )
}

EditorPane.propTypes = {
  loading: PropTypes.bool.isRequired,
  selectedNote: PropTypes.object,
  onCreateNote: PropTypes.func.isRequired,
  onTitleChange: PropTypes.func.isRequired,
  editorRef: PropTypes.object.isRequired,
  onEditorChange: PropTypes.func.isRequired,
  onEditorKeyDown: PropTypes.func.isRequired,
  onEditorContextMenu: PropTypes.func.isRequired,
}

