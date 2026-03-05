import PropTypes from 'prop-types'

export function TopBar({ search, onChangeSearch, selectedNote, onDeleteNote, onOpenMenu }) {
  return (
    <header className="flex items-center border-b border-slate-800 px-5 py-3">
      <div className="flex flex-1 items-center gap-2 rounded-md bg-slate-900/80 px-3 py-1.5 shadow-soft">
        <span className="text-xs text-slate-500">Search notes</span>
        <input
          value={search}
          onChange={(e) => onChangeSearch(e.target.value)}
          placeholder="Search by title or content"
          className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
      </div>
      {selectedNote && (
        <div className="ml-3 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDeleteNote(selectedNote.id)
            }}
            className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-slate-900 hover:text-rose-300"
          >
            ×
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onOpenMenu(e)
              }}
              className="rounded-md px-1.5 py-1 text-slate-400 hover:bg-slate-900 hover:text-slate-100"
            >
              ⋯
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

TopBar.propTypes = {
  search: PropTypes.string.isRequired,
  onChangeSearch: PropTypes.func.isRequired,
  selectedNote: PropTypes.object,
  onDeleteNote: PropTypes.func.isRequired,
  onOpenMenu: PropTypes.func.isRequired,
}

