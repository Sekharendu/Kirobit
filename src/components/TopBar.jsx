import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

export function TopBar({ notes, search, onChangeSearch, onSelectNote, selectedNote, onDeleteNote, onOpenMenu }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  const filteredNotes = search.trim()
    ? notes.filter((note) => {
        const q = search.toLowerCase()
        return (
          note.title?.toLowerCase().includes(q) ||
          note.content?.toLowerCase().includes(q)
        )
      })
    : []

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="flex items-center border-b border-slate-800 px-5 py-3">
      
      {/* Search container — position:relative so dropdown anchors to it */}
      <div className="relative flex-1" ref={containerRef}>
        <div className="flex items-center gap-2 rounded-md bg-slate-900/80 px-3 py-1.5 shadow-soft">
          <span className="text-xs text-slate-500">🔍</span>
          <input
            value={search}
            onChange={(e) => {
              onChangeSearch(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => search.trim() && setIsOpen(true)}
            placeholder="Search by title or content"
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {/* Clear button */}
          {search && (
            <button
              onClick={() => { onChangeSearch(''); setIsOpen(false) }}
              className="text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && search.trim() && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
            {filteredNotes.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500 text-center">
                No results found
              </p>
            ) : (
              // ✅ max-h for 4 items, overflow-y-auto for scroll beyond that
              <ul className="max-h-[224px] overflow-y-auto divide-y divide-slate-800">
                {filteredNotes.map((note) => (
                  <li
                    key={note.id}
                    onClick={() => {
                      onSelectNote(note.id)
                      onChangeSearch('')
                      setIsOpen(false)
                    }}
                    className="flex cursor-pointer flex-col gap-0.5 px-4 py-3 hover:bg-slate-800 transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-100 truncate">
                      {note.title || 'Untitled'}
                    </span>
                    <span className="text-xs text-slate-500 truncate">
                      {/* Strip HTML tags from content for preview */}
                      {note.content?.replace(/<[^>]*>/g, '').slice(0, 60)}...
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Right side buttons */}
      {selectedNote && (
        <div className="ml-3 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDeleteNote(selectedNote.id) }}
            className="rounded-md px-2 py-1 text-xs text-slate-400 hover:bg-slate-900 hover:text-rose-300"
          >
            ×
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onOpenMenu(e) }}
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
  notes: PropTypes.array.isRequired,
  search: PropTypes.string.isRequired,
  onChangeSearch: PropTypes.func.isRequired,
  onSelectNote: PropTypes.func.isRequired,
  selectedNote: PropTypes.object,
  onDeleteNote: PropTypes.func.isRequired,
  onOpenMenu: PropTypes.func.isRequired,
}