import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

export function TopBar({ notes, search, onChangeSearch, onSelectNote, selectedNote, onDeleteNote, user, onLogout }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const searchRef = useRef(null)
  const userMenuRef = useRef(null)

  const filteredNotes = search.trim()
    ? notes.filter((note) => {
        const q = search.toLowerCase()
        return (
          note.title?.toLowerCase().includes(q) ||
          note.content?.toLowerCase().includes(q)
        )
      })
    : []

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Get avatar URL from either Google or GitHub
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture

  return (
    <header className="flex items-center gap-3 border-b border-[#1f1f1f] bg-[#111111] px-5 py-3">

      {/* Search */}
      <div className="relative flex-1" ref={searchRef}>
        <div className="flex items-center gap-2 rounded-md bg-slate-900/80 px-3 py-1.5">
          <span className="text-xs text-slate-500">🔍</span>
          <input
            value={search}
            onChange={(e) => { onChangeSearch(e.target.value); setIsSearchOpen(true) }}
            onFocus={() => search.trim() && setIsSearchOpen(true)}
            placeholder="Search by title or content"
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {search && (
            <button
              onClick={() => { onChangeSearch(''); setIsSearchOpen(false) }}
              className="text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Search dropdown */}
        {isSearchOpen && search.trim() && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
            {filteredNotes.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500 text-center">No results found</p>
            ) : (
              <ul className="max-h-[224px] overflow-y-auto divide-y divide-slate-800">
                {filteredNotes.map((note) => (
                  <li
                    key={note.id}
                    onClick={() => {
                      onSelectNote(note.id)
                      onChangeSearch('')
                      setIsSearchOpen(false)
                    }}
                    className="flex cursor-pointer flex-col gap-0.5 px-4 py-3 hover:bg-slate-800 transition-colors"
                  >
                    <span className="text-sm font-medium text-slate-100 truncate">
                      {note.title || 'Untitled'}
                    </span>
                    <span className="text-xs text-slate-500 truncate">
                      {note.content?.replace(/<[^>]*>/g, '').slice(0, 60)}...
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Avatar + logout menu */}
      <div className="relative flex-shrink-0" ref={userMenuRef}>
        <button
          onClick={() => setIsUserMenuOpen(prev => !prev)}
          className="flex items-center justify-center rounded-full focus:outline-none"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="h-8 w-8 rounded-full border-2 border-indigo-500 object-cover"
            />
          ) : (
            // Fallback if no avatar
            <div className="h-8 w-8 rounded-full border-2 border-indigo-500 bg-indigo-600 flex items-center justify-center text-xs font-semibold text-white">
              {user?.email?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
        </button>

        {/* Logout dropdown */}
        {isUserMenuOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-lg border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
            {/* User info header */}
            <div className="px-3 py-2 border-b border-slate-800">
              <p className="text-xs font-medium text-slate-200 truncate">
                {user?.user_metadata?.full_name || user?.user_metadata?.user_name || 'User'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => { onLogout(); setIsUserMenuOpen(false) }}
              className="w-full px-3 py-2 text-left text-sm text-rose-400 hover:bg-slate-800 transition-colors"
            >
              Log out
            </button>
          </div>
        )}
      </div>
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
  user: PropTypes.object,
  onLogout: PropTypes.func.isRequired,
}