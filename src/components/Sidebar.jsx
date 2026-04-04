import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { List, Star, Plus, FileText, FolderPlus, ChevronRight, ChevronDown, Folder, Search, X, MoreHorizontal } from 'lucide-react'
import { KiroBitLogo } from './KiroBitLogo'

function classNames(...values) {
  return values.filter(Boolean).join(' ')
}

export const SidebarTabs = {
  ALL: 'all',
  FAVORITES: 'favorites',
}

export function Sidebar({
  activeTab,
  onChangeTab,
  folders,
  user,
  notes,
  selectedFolderId,
  onSelectFolder,
  selectedNoteId,
  onSelectNote,
  onCreateNote,
  onCreateFolder,
  onSidebarContext,
  editingItem,
  onChangeEditingName,
  onCommitEditing,
  onCancelEditing,
  openFolders,
  onToggleFolderOpen,
  onCloseSidebarContext,
  sidebarContext,
  selectedNoteIds = [],
  onToggleNoteSelection,
  isMobile = false,
  search = '',
  onChangeSearch,
  onLogout,
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const searchRef = useRef(null)
  const searchInputRef = useRef(null)
  const userMenuRef = useRef(null)

  const mobileFilteredNotes = (isMobile && search.trim())
    ? notes.filter((n) => {
        const q = search.toLowerCase()
        return n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q)
      })
    : []
  const showMobileSearch = isMobile && isSearchOpen && Boolean(search.trim())

  useEffect(() => {
    if (!isMobile) return
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setIsSearchOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setIsUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isMobile])
  const displayNotes = notes.filter((n) =>
    activeTab === SidebarTabs.FAVORITES ? n.is_favorite : true
  )

  return (
    <aside className="flex flex-col h-full overflow-hidden"
      style={{ background: isMobile ? '#1a1a1a' : '#222222', borderRight: isMobile ? 'none' : '1px solid #333333' }}>

      {/* Header — on mobile acts as user menu button */}
      <div className="relative flex h-14 shrink-0 items-center justify-between px-4" ref={isMobile ? userMenuRef : undefined}>
        {isMobile ? (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setIsUserMenuOpen(prev => !prev) }}
            className="flex items-center gap-2 min-w-0"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg" aria-hidden>
              <KiroBitLogo variant="minimal" size="xs" />
            </span>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-sm font-semibold tracking-tight truncate min-w-0" style={{ color: '#ffffff' }}>
                {user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'}&apos;s Notes
              </span>
              <span className="text-[11px]" style={{ color: '#6b7280' }}>Personal workspace</span>
            </div>
            <ChevronDown size={14} strokeWidth={2} className="flex-shrink-0 ml-0.5" style={{ color: '#6b7280' }} />
          </button>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg" aria-hidden>
              <KiroBitLogo variant="minimal" size="xs" />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold tracking-tight truncate min-w-0" style={{ color: '#ffffff' }}>
                {user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'}'s Notes
              </span>
              <span className="text-[11px]" style={{ color: '#6b7280' }}>Personal workspace</span>
            </div>
          </div>
        )}
        {/* Mobile user menu dropdown */}
        {isMobile && isUserMenuOpen && (
          <div
            className="absolute left-4 top-full z-50 mt-1 w-52 rounded-lg shadow-2xl overflow-hidden"
            style={{ background: '#252525', border: '1px solid #333333' }}
          >
            <div className="px-3 py-2.5" style={{ borderBottom: '1px solid #333333' }}>
              <p className="text-xs font-medium truncate" style={{ color: '#e0e0e0' }}>
                {user?.user_metadata?.full_name || user?.user_metadata?.user_name || user?.user_metadata?.name || 'User'}
              </p>
              <p className="text-[11px] truncate" style={{ color: '#555555' }}>{user?.email}</p>
            </div>
            <button
              onClick={() => { onLogout?.(); setIsUserMenuOpen(false) }}
              className="w-full px-3 py-2.5 text-left text-sm transition-colors"
              style={{ color: '#f87171' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Log out
            </button>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: '1px solid #333333' }}>
        <button
          type="button"
          className={classNames(
            'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
            activeTab === SidebarTabs.ALL
              ? 'bg-[#2a2a2a] text-white'
              : 'text-[#6b7280] hover:bg-[#353535] hover:text-[#f3f4f6]',
          )}
          onClick={(e) => { e.stopPropagation(); onChangeTab(SidebarTabs.ALL); onSelectFolder(null) }}
        >
          <List size={17} strokeWidth={1.75} />
        </button>

        <button
          type="button"
          className={classNames(
            'flex h-8 w-8 items-center justify-center rounded-md transition-colors',
            activeTab === SidebarTabs.FAVORITES
              ? 'bg-[#2a2a2a] text-yellow-400'
              : 'text-[#6b7280] hover:bg-[#353535] hover:text-[#f3f4f6]',
          )}
          onClick={(e) => { e.stopPropagation(); onChangeTab(SidebarTabs.FAVORITES); onSelectFolder(null) }}
          title="Favorites"
        >
          <Star size={17} strokeWidth={1.75} fill={activeTab === SidebarTabs.FAVORITES ? '#eab308' : 'none'} />
        </button>

        <button
          type="button"
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-md transition-colors text-[#9ca3af] hover:bg-[#333333] hover:text-[#d1d5db]"
          onClick={(e) => { e.stopPropagation(); onCreateNote() }}
          title="New note"
        >
          <Plus size={17} strokeWidth={1.75} />
        </button>

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md transition-colors text-[#6b7280] hover:bg-[#353535] hover:text-[#f3f4f6]"
          onClick={(e) => { e.stopPropagation(); onCreateFolder() }}
          title="New folder"
        >
          <FolderPlus size={17} strokeWidth={1.75} />
        </button>
      </div>

      {/* Mobile search bar */}
      {isMobile && (
        <div className="relative px-3 py-2" style={{ borderBottom: '1px solid #333333' }} ref={searchRef}>
          <div className={
            showMobileSearch
              ? 'flex items-center gap-2 rounded-t-md rounded-b-none bg-[#1a1a1a] border border-[#333333] border-b-0 px-3 py-1.5'
              : 'flex items-center gap-2 rounded-md bg-[#1a1a1a] border border-[#333333] px-3 py-1.5'
          }>
            <Search size={14} style={{ color: '#444444' }} />
            <input
              ref={searchInputRef}
              value={search}
              onChange={(e) => { onChangeSearch?.(e.target.value); setIsSearchOpen(true) }}
              onFocus={() => search.trim() && setIsSearchOpen(true)}
              placeholder="Search notes..."
              className="w-full min-w-0 bg-transparent text-sm focus:outline-none"
              style={{ color: '#c9c9c9' }}
            />
            {search && (
              <button
                onClick={() => { onChangeSearch?.(''); setIsSearchOpen(false) }}
                className="text-xs transition-colors"
                style={{ color: '#555555' }}
              >
                <X size={12} />
              </button>
            )}
          </div>
          {showMobileSearch && (
            <div className="absolute left-3 right-3 top-full z-50 rounded-b-lg rounded-t-none border border-[#333333] border-t-0 bg-[#1e1e1e] shadow-2xl overflow-hidden">
              {mobileFilteredNotes.length === 0 ? (
                <p className="px-4 py-3 text-sm text-center" style={{ color: '#555555' }}>No results found</p>
              ) : (
                <ul className="scroll-thin max-h-[224px] overflow-y-auto divide-y divide-[#2a2a2a]">
                  {mobileFilteredNotes.map((note) => (
                    <li
                      key={note.id}
                      onClick={() => { onSelectNote(note.id); onChangeSearch?.(''); setIsSearchOpen(false) }}
                      className="flex cursor-pointer flex-col gap-0.5 px-4 py-3 transition-colors"
                      style={{ color: '#c9c9c9' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span className="text-sm font-medium truncate" style={{ color: '#e0e0e0' }}>{note.title || 'Untitled'}</span>
                      <span className="text-xs truncate" style={{ color: '#555555' }}>{note.content?.replace(/<[^>]*>/g, '').slice(0, 60)}...</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Scrollable list */}
      <div className="scroll-thin flex-1 overflow-y-auto px-2 py-2"
        onClick={(e) => {
          e.stopPropagation()
          onCloseSidebarContext()
          }}>

        {/* Folders */}
        {activeTab === SidebarTabs.ALL && folders.map((folder) => (
          <div key={folder.id} className="mb-0.5">
            {editingItem && editingItem.kind === 'folder' && editingItem.id === folder.id ? (
              // ✅ CHANGED: py-1.5 → py-2, text-xs → text-sm
              <div className="flex items-center rounded-md px-2.5 py-2.5 text-[15px] leading-snug"
                style={{ color: '#9ca3af' }}>
                <ChevronDown size={16} strokeWidth={1.75} className="mr-1 flex-shrink-0" style={{ color: '#6b7280' }} />
                <Folder size={17} strokeWidth={1.75} className="mr-2 flex-shrink-0" style={{ color: '#9ca3af' }} />
                <input
                  autoFocus
                  value={editingItem.tempName}
                  onChange={(e) => onChangeEditingName(e.target.value)}
                  onBlur={onCommitEditing}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); onCommitEditing() }
                    if (e.key === 'Escape') { e.preventDefault(); onCancelEditing() }
                  }}
                  // ✅ CHANGED: text-xs → text-sm
                  className="w-full rounded-sm px-1 py-0.5 text-[15px] outline-none"
                  style={{ background: '#1a1a1a', color: '#ffffff', border: '1px solid #444444' }}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggleFolderOpen(folder.id); onSelectFolder(folder.id) }}
                onContextMenu={(e) => onSidebarContext(e, { type: 'folder', folder })}
                className={classNames(
                  'flex w-full items-center justify-between rounded-md px-2.5 py-2.5 text-left text-[15px] font-medium leading-snug transition-colors',
                  !isMobile && selectedFolderId === folder.id && !selectedNoteId
                    ? 'bg-[#505050] text-[#f3f4f6] hover:bg-[#464646]'
                    : 'text-[#9ca3af] hover:bg-[#3a3a3a] hover:text-[#f3f4f6]',
                )}
              >
                <span className="flex items-center gap-2 min-w-0 flex-1">
                  {openFolders.includes(folder.id)
                    ? <ChevronDown size={16} strokeWidth={1.75} className="flex-shrink-0" style={{ color: '#6b7280' }} />
                    : <ChevronRight size={16} strokeWidth={1.75} className="flex-shrink-0" style={{ color: '#6b7280' }} />
                  }
                  <Folder size={17} strokeWidth={1.75} className="flex-shrink-0" style={{ color: '#9ca3af' }} />
                  <span className="truncate min-w-0">{folder.name || 'New Folder'}</span>
                </span>
              </button>
            )}

            {/* Notes inside folder */}
            {openFolders.includes(folder.id) &&
              notes.filter((n) => n.folder_id === folder.id).map((note) => (
                editingItem && editingItem.kind === 'note' && editingItem.id === note.id ? (
                  // ✅ CHANGED: text-[11px] → text-xs
                  <div key={note.id} className="ml-6 mt-0.5 flex w-[calc(100%-1.5rem)] items-center rounded-md px-2.5 py-2 text-[13px] leading-snug"
                    style={{ color: '#9ca3af' }}>
                    <input
                      autoFocus
                      value={editingItem.tempName}
                      onChange={(e) => onChangeEditingName(e.target.value)}
                      onBlur={onCommitEditing}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); onCommitEditing() }
                        if (e.key === 'Escape') { e.preventDefault(); onCancelEditing() }
                      }}
                      // ✅ CHANGED: text-[11px] → text-xs
                      className="w-full rounded-sm px-1 py-0.5 text-[13px] outline-none"
                      style={{ background: '#1a1a1a', color: '#ffffff', border: '1px solid #444444' }}
                    />
                  </div>
                ) : (
                  <button
                    key={note.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (e.ctrlKey || e.metaKey) onToggleNoteSelection(note.id)
                      else onSelectNote(note.id)
                    }}
                    onContextMenu={(e) => onSidebarContext(e, { type: 'note', note })}
                    className={classNames(
                      'ml-6 mt-0.5 mb-0.5 flex w-[calc(100%-1.5rem)] items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] leading-snug transition-colors',
                      isMobile && 'active:scale-[0.97] active:opacity-80',
                      !isMobile && selectedNoteId === note.id
                        ? 'bg-[#505050] text-[#f3f4f6] hover:bg-[#464646]'
                        : selectedNoteIds.includes(note.id)
                          ? 'bg-[#3a3a3a] text-[#e0e0e0] hover:bg-[#444444]'
                          : 'text-[#9ca3af] hover:bg-[#3a3a3a] hover:text-[#f3f4f6]',
                    )}
                    style={selectedNoteIds.includes(note.id) && selectedNoteId !== note.id ? { boxShadow: 'inset 2px 0 0 #9ca3af' } : undefined}
                  >
                    <FileText
                      size={15}
                      strokeWidth={1.75}
                      className="flex-shrink-0"
                      style={{ color: '#6b7280' }}
                    />
                    <span className="flex-1 truncate">{note.title || 'Untitled'}</span>
                    {note.is_favorite && <Star size={13} fill='#eab308' color='#eab308' className="flex-shrink-0" />}
                    {isMobile && (
                      <button
                        type="button"
                        className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded transition-colors"
                        style={{ color: '#6b7280' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (sidebarContext?.item?.type === 'note' && sidebarContext.item.note?.id === note.id) {
                            onCloseSidebarContext(); return
                          }
                          const rect = e.currentTarget.getBoundingClientRect()
                          const menuW = 176
                          const x = Math.max(8, rect.right - menuW)
                          const spaceBelow = window.innerHeight - rect.bottom
                          const y = spaceBelow > 140 ? rect.bottom + 4 : rect.top - 120
                          onSidebarContext({ preventDefault: () => {}, clientX: x, clientY: y }, { type: 'note', note })
                        }}
                      >
                        <MoreHorizontal size={14} strokeWidth={2} />
                      </button>
                    )}
                  </button>
                )
              ))
            }
          </div>
        ))}

        {/* Standalone / Favorites notes */}
        <div
          className={activeTab === SidebarTabs.ALL ? 'mt-2' : ''}
          // style={activeTab === SidebarTabs.ALL ? { borderTop: '1px solid #333333' } : {}}
        >
          {displayNotes
            .filter((n) => activeTab === SidebarTabs.FAVORITES ? true : !n.folder_id)
            .map((note) => (
              editingItem && editingItem.kind === 'note' && editingItem.id === note.id ? (
                // ✅ CHANGED: text-xs → text-sm, py-1.5 → py-2
                <div key={note.id} className="flex items-center rounded-md px-2.5 py-2.5 text-[15px] leading-snug"
                  style={{ color: '#9ca3af' }}>
                  <input
                    autoFocus
                    value={editingItem.tempName}
                    onChange={(e) => onChangeEditingName(e.target.value)}
                    onBlur={onCommitEditing}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); onCommitEditing() }
                      if (e.key === 'Escape') { e.preventDefault(); onCancelEditing() }
                    }}
                    className="w-full rounded-sm px-1 py-0.5 text-[15px] outline-none"
                    style={{ background: '#1a1a1a', color: '#ffffff', border: '1px solid #444444' }}
                  />
                </div>
              ) : (
                <button
                  key={note.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (e.ctrlKey || e.metaKey) onToggleNoteSelection(note.id)
                    else onSelectNote(note.id)
                  }}
                  onContextMenu={(e) => onSidebarContext(e, { type: 'note', note })}
                  className={classNames(
                    'flex w-full items-center gap-2 rounded-md px-2.5 py-2.5 mb-0.5 text-left text-[15px] leading-snug transition-colors',
                    isMobile && 'active:scale-[0.97] active:opacity-80',
                    !isMobile && selectedNoteId === note.id
                      ? 'bg-[#505050] text-[#f3f4f6] hover:bg-[#464646]'
                      : selectedNoteIds.includes(note.id)
                        ? 'bg-[#3a3a3a] text-[#e0e0e0] hover:bg-[#444444]'
                        : 'text-[#9ca3af] hover:bg-[#3a3a3a] hover:text-[#f3f4f6]',
                  )}
                  style={selectedNoteIds.includes(note.id) && selectedNoteId !== note.id ? { boxShadow: 'inset 2px 0 0 #9ca3af' } : undefined}
                >
                  <FileText
                    size={16}
                    strokeWidth={1.75}
                    className="flex-shrink-0"
                    style={{ color: '#6b7280' }}
                  />
                  <span className="flex-1 truncate min-w-0">{note.title || 'Untitled'}</span>
                  {note.is_favorite && <Star size={13} fill='#eab308' color='#eab308' className="flex-shrink-0" />}
                  {isMobile && (
                    <button
                      type="button"
                      className="flex-shrink-0 flex items-center justify-center h-7 w-7 rounded transition-colors"
                      style={{ color: '#6b7280' }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (sidebarContext?.item?.type === 'note' && sidebarContext.item.note?.id === note.id) {
                          onCloseSidebarContext(); return
                        }
                        const rect = e.currentTarget.getBoundingClientRect()
                        const menuW = 176
                        const x = Math.max(8, rect.right - menuW)
                        const spaceBelow = window.innerHeight - rect.bottom
                        const y = spaceBelow > 140 ? rect.bottom + 4 : rect.top - 120
                        onSidebarContext({ preventDefault: () => {}, clientX: x, clientY: y }, { type: 'note', note })
                      }}
                    >
                      <MoreHorizontal size={16} strokeWidth={2} />
                    </button>
                  )}
                </button>
              )
            ))
          }
        </div>
      </div>
      
    </aside>
  )
}

Sidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onChangeTab: PropTypes.func.isRequired,
  folders: PropTypes.array.isRequired,
  notes: PropTypes.array.isRequired,
  selectedFolderId: PropTypes.string,
  onSelectFolder: PropTypes.func.isRequired,
  selectedNoteId: PropTypes.string,
  onSelectNote: PropTypes.func.isRequired,
  onCreateNote: PropTypes.func.isRequired,
  onCreateFolder: PropTypes.func.isRequired,
  onSidebarContext: PropTypes.func.isRequired,
  editingItem: PropTypes.shape({
    kind: PropTypes.oneOf(['folder', 'note']),
    id: PropTypes.string,
    tempName: PropTypes.string,
    mode: PropTypes.oneOf(['rename', 'create']),
  }),
  onChangeEditingName: PropTypes.func.isRequired,
  onCommitEditing: PropTypes.func.isRequired,
  onCancelEditing: PropTypes.func.isRequired,
  openFolders: PropTypes.array.isRequired,
  onToggleFolderOpen: PropTypes.func.isRequired,
  onCloseSidebarContext: PropTypes.func.isRequired,
  sidebarContext: PropTypes.object,
  selectedNoteIds: PropTypes.array,
  onToggleNoteSelection: PropTypes.func,
  isMobile: PropTypes.bool,
  search: PropTypes.string,
  onChangeSearch: PropTypes.func,
  onLogout: PropTypes.func,
}