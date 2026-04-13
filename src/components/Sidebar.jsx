import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { List, Star, Plus, FileText, FolderPlus, ChevronRight, ChevronDown, Folder, Search, X, MoreHorizontal, Sun, Moon, LogOut, Settings } from 'lucide-react'
import { KiroBitLogo } from './KiroBitLogo'
import { getColors } from '../theme'

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
  onDropNote,
  isMobile = false,
  search = '',
  onChangeSearch,
  onLogout,
  theme = 'dark',
  onToggleTheme,
}) {
  const c = getColors(theme)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const searchRef = useRef(null)
  const searchInputRef = useRef(null)
  const userMenuRef = useRef(null)

  const [dragState, setDragState] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)

  const handleNoteDragStart = (e, note) => {
    setDragState({ noteId: note.id, fromFolderId: note.folder_id })
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', note.id)
  }

  const handleNoteDragEnd = () => {
    setDragState(null)
    setDropTarget(null)
  }

  const handleFolderDragOver = (e, folderId) => {
    if (!dragState) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTarget(prev => {
      if (prev?.type === 'folder' && prev.id === folderId) return prev
      return { type: 'folder', id: folderId }
    })
  }

  const handleFolderDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return
    setDropTarget(prev => prev?.type === 'folder' ? null : prev)
  }

  const handleNoteDragOver = (e, note) => {
    if (!dragState || dragState.noteId === note.id) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    const rect = e.currentTarget.getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const position = e.clientY < midY ? 'before' : 'after'
    setDropTarget(prev => {
      if (prev?.type === 'note' && prev.id === note.id && prev.position === position) return prev
      return { type: 'note', id: note.id, position, folderId: note.folder_id }
    })
  }

  const handleStandaloneDragOver = (e) => {
    if (!dragState) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTarget(prev => prev?.type === 'note' ? prev : { type: 'standalone' })
  }

  const handleDragDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!dragState || !dropTarget) { setDragState(null); setDropTarget(null); return }
    const info = {}
    if (dropTarget.type === 'folder') {
      info.targetFolderId = dropTarget.id
    } else if (dropTarget.type === 'note') {
      info.targetFolderId = dropTarget.folderId ?? null
      info.targetNoteId = dropTarget.id
      info.position = dropTarget.position
    } else {
      info.targetFolderId = null
    }
    onDropNote(dragState.noteId, info)
    setDragState(null)
    setDropTarget(null)
  }

  const getNoteDropStyle = (noteId) => {
    if (!dragState || !dropTarget || dropTarget.type !== 'note' || dropTarget.id !== noteId) return null
    return dropTarget.position === 'before'
      ? { boxShadow: `0 -2px 0 0 ${c.accent}` }
      : { boxShadow: `0 2px 0 0 ${c.accent}` }
  }

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
      style={{ background: isMobile ? c.sidebarMobileBg : c.sidebarBg, borderRight: isMobile ? 'none' : `1px solid ${c.border}` }}>

      {/* Header */}
      <div className={classNames("relative flex shrink-0 items-center justify-between", isMobile ? "px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2" : "h-14 px-4")} ref={isMobile ? userMenuRef : undefined}>
        {isMobile ? (
          <>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md" aria-hidden>
                <KiroBitLogo variant="minimal" size="xs" />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-semibold tracking-tight truncate" style={{ color: c.textHeading }}>
                  {user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'}&apos;s Notes
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onCloseSidebarContext(); onToggleTheme?.() }}
                className="flex items-center justify-center h-9 w-9 rounded-full transition-colors"
                style={{ color: c.icon }}
              >
                {theme === 'dark' ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onCloseSidebarContext(); setIsUserMenuOpen(prev => !prev) }}
                className="flex items-center justify-center rounded-full transition-colors"
              >
                {(() => {
                  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
                  return avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                      style={{ border: `2px solid ${c.border}` }}
                    />
                  ) : (
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                      style={{ background: c.hover, border: `2px solid ${c.border}`, color: c.textHeading }}
                    >
                      {user?.email?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  )
                })()}
              </button>
            </div>
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(e) => { e.stopPropagation(); setIsUserMenuOpen(false) }}
                />
                <div
                  className="absolute right-5 top-full z-50 mt-1 w-48 rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
                  style={{ background: c.menuBg, border: `1px solid ${c.border}` }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3.5 py-2.5" style={{ borderBottom: `1px solid ${c.border}` }}>
                    <p className="text-[13px] font-medium truncate" style={{ color: c.textBright }}>
                      {user?.user_metadata?.full_name || user?.user_metadata?.user_name || user?.user_metadata?.name || 'User'}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: c.textMuted }}>{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { onLogout?.(); setIsUserMenuOpen(false) }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] transition-colors"
                    style={{ color: c.danger }}
                  >
                    <LogOut size={15} strokeWidth={1.75} />
                    Log out
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md" aria-hidden>
              <KiroBitLogo variant="minimal" size="xs" />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold tracking-tight truncate min-w-0" style={{ color: c.textHeading }}>
                {user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'}'s Notes
              </span>
              <span className="text-[11px]" style={{ color: c.textSubtle }}>Personal workspace</span>
            </div>
          </div>
        )}
      </div>

      <div className={classNames("flex items-center", isMobile ? "px-5 pb-2 gap-2" : "px-3 py-2 gap-2")}
        style={isMobile ? {} : { borderBottom: `1px solid ${c.border}` }}>
        {isMobile ? (
          <>
            {/* Pill tab switcher */}
            <div className="flex rounded-lg p-0.5 flex-1" style={{ background: c.hover }}>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-[13px] font-medium transition-colors"
                style={activeTab === SidebarTabs.ALL
                  ? { background: c.sidebarMobileBg, color: c.textHeading, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }
                  : { color: c.textMuted }}
                onClick={(e) => { e.stopPropagation(); onCloseSidebarContext(); onChangeTab(SidebarTabs.ALL); onSelectFolder(null) }}
              >
                <List size={15} strokeWidth={2} />
                All
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-[13px] font-medium transition-colors"
                style={activeTab === SidebarTabs.FAVORITES
                  ? { background: c.sidebarMobileBg, color: c.favorite, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }
                  : { color: c.textMuted }}
                onClick={(e) => { e.stopPropagation(); onCloseSidebarContext(); onChangeTab(SidebarTabs.FAVORITES); onSelectFolder(null) }}
              >
                <Star size={14} strokeWidth={2} fill={activeTab === SidebarTabs.FAVORITES ? c.favorite : 'none'} />
                Favorites
              </button>
            </div>
            <button
              type="button"
              className="flex items-center justify-center h-9 w-9 rounded-lg transition-colors flex-shrink-0"
              style={{ color: c.icon, background: c.hover }}
              onClick={(e) => { e.stopPropagation(); onCloseSidebarContext(); onCreateFolder() }}
              title="New folder"
            >
              <FolderPlus size={17} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className="flex items-center justify-center h-9 w-9 rounded-lg transition-colors flex-shrink-0"
              style={{ color: '#fff', background: c.accent }}
              onClick={(e) => { e.stopPropagation(); onCloseSidebarContext(); onCreateNote() }}
              title="New note"
            >
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="flex items-center justify-center rounded-md transition-colors h-8 w-8"
              style={activeTab === SidebarTabs.ALL
                ? { background: c.tabActiveBg, color: c.textHeading }
                : { color: c.iconMuted }}
              onMouseEnter={(e) => { if (activeTab !== SidebarTabs.ALL) { e.currentTarget.style.background = c.contextHoverAlt; e.currentTarget.style.color = c.hoverText } }}
              onMouseLeave={(e) => { if (activeTab !== SidebarTabs.ALL) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.iconMuted } }}
              onClick={(e) => { e.stopPropagation(); onCloseSidebarContext(); onChangeTab(SidebarTabs.ALL); onSelectFolder(null) }}
            >
              <List size={17} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className="flex items-center justify-center rounded-md transition-colors h-8 w-8"
              style={activeTab === SidebarTabs.FAVORITES
                ? { background: c.tabActiveBg, color: c.favorite }
                : { color: c.iconMuted }}
              onMouseEnter={(e) => { if (activeTab !== SidebarTabs.FAVORITES) { e.currentTarget.style.background = c.contextHoverAlt; e.currentTarget.style.color = c.hoverText } }}
              onMouseLeave={(e) => { if (activeTab !== SidebarTabs.FAVORITES) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.iconMuted } }}
              onClick={(e) => { e.stopPropagation(); onCloseSidebarContext(); onChangeTab(SidebarTabs.FAVORITES); onSelectFolder(null) }}
              title="Favorites"
            >
              <Star size={17} strokeWidth={1.75} fill={activeTab === SidebarTabs.FAVORITES ? c.favorite : 'none'} />
            </button>
            <button
              type="button"
              className="ml-auto flex items-center justify-center rounded-md transition-colors h-8 w-8"
              style={{ color: c.icon }}
              onMouseEnter={(e) => { e.currentTarget.style.background = c.hover; e.currentTarget.style.color = c.textBright }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.icon }}
              onClick={(e) => { e.stopPropagation(); onCloseSidebarContext(); onCreateNote() }}
              title="New note"
            >
              <Plus size={17} strokeWidth={1.75} />
            </button>
            <button
              type="button"
              className="flex items-center justify-center rounded-md transition-colors h-8 w-8"
              style={{ color: c.iconMuted }}
              onMouseEnter={(e) => { e.currentTarget.style.background = c.contextHoverAlt; e.currentTarget.style.color = c.hoverText }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.iconMuted }}
              onClick={(e) => { e.stopPropagation(); onCloseSidebarContext(); onCreateFolder() }}
              title="New folder"
            >
              <FolderPlus size={17} strokeWidth={1.75} />
            </button>
          </>
        )}
      </div>

      {/* Mobile search bar */}
      {isMobile && (
        <div className="relative px-5 pb-3 pt-1" ref={searchRef}>
          <div
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
            style={showMobileSearch
              ? { background: c.searchBg, border: `1px solid ${c.border}`, borderBottom: 'none', borderRadius: '12px 12px 0 0' }
              : { background: c.searchBg, border: `1px solid ${c.border}` }}
          >
            <Search size={16} strokeWidth={2} style={{ color: c.iconMuted, flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              value={search}
              onChange={(e) => { onChangeSearch?.(e.target.value); setIsSearchOpen(true) }}
              onFocus={() => search.trim() && setIsSearchOpen(true)}
              placeholder="Search notes..."
              className="w-full min-w-0 bg-transparent text-[15px] focus:outline-none"
              style={{ color: c.text }}
            />
            {search && (
              <button
                onClick={() => { onChangeSearch?.(''); setIsSearchOpen(false) }}
                className="flex items-center justify-center h-6 w-6 rounded-full transition-colors"
                style={{ color: c.textMuted, background: c.hover }}
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            )}
          </div>
          {showMobileSearch && (
            <div className="absolute left-4 right-4 top-full z-50 rounded-b-xl rounded-t-none shadow-2xl shadow-black/40 overflow-hidden"
              style={{ background: c.mobileSearchResultsBg, border: `1px solid ${c.border}`, borderTop: 'none' }}>
              {mobileFilteredNotes.length === 0 ? (
                <p className="px-4 py-4 text-[13px] text-center" style={{ color: c.textMuted }}>No results found</p>
              ) : (
                <ul className="scroll-thin max-h-[260px] overflow-y-auto">
                  {mobileFilteredNotes.map((note) => (
                    <li
                      key={note.id}
                      onClick={() => { onSelectNote(note.id); onChangeSearch?.(''); setIsSearchOpen(false) }}
                      className="flex cursor-pointer flex-col gap-0.5 px-4 py-3 transition-colors active:opacity-70"
                      style={{ color: c.text, borderBottom: `1px solid ${c.borderLight}` }}
                    >
                      <span className="text-[14px] font-medium truncate" style={{ color: c.textBright }}>{note.title || 'Untitled'}</span>
                      <span className="text-xs truncate" style={{ color: c.textMuted }}>{note.content?.replace(/<[^>]*>/g, '').slice(0, 60)}...</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Scrollable list */}
      <div className={classNames("scroll-thin flex-1 overflow-y-auto", isMobile ? "px-4 pt-1 pb-[max(1rem,env(safe-area-inset-bottom))]" : "px-2 py-2")}
        onClick={(e) => {
          e.stopPropagation()
          onCloseSidebarContext()
          onSelectFolder(null)
          }}>

        {/* Folders */}
        {activeTab === SidebarTabs.ALL && folders.map((folder) => (
          <div key={folder.id} className={isMobile ? "mb-1" : "mb-0.5"}>
            {editingItem && editingItem.kind === 'folder' && editingItem.id === folder.id ? (
              <div className={classNames("flex items-center rounded-md px-2.5 leading-snug", isMobile ? "py-3 text-[15px]" : "py-2.5 text-[15px]")}
                style={{ color: c.text }}>
                <ChevronDown size={isMobile ? 18 : 16} strokeWidth={1.75} className="mr-1 flex-shrink-0" style={{ color: c.iconMuted }} />
                <Folder size={isMobile ? 19 : 17} strokeWidth={1.75} className="mr-2 flex-shrink-0" style={{ color: c.icon }} />
                <input
                  autoFocus
                  value={editingItem.tempName}
                  onChange={(e) => onChangeEditingName(e.target.value)}
                  onBlur={onCommitEditing}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); onCommitEditing() }
                    if (e.key === 'Escape') { e.preventDefault(); onCancelEditing() }
                  }}
                  className={classNames("w-full rounded-sm px-1 py-0.5 outline-none", isMobile ? "text-[15px]" : "text-[15px]")}
                  style={{ background: c.inputBg, color: c.textHeading, border: `1px solid ${c.inputBorder}` }}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onCloseSidebarContext(); onToggleFolderOpen(folder.id); onSelectFolder(folder.id) }}
                onContextMenu={(e) => onSidebarContext(e, { type: 'folder', folder })}
                onDragOver={(e) => handleFolderDragOver(e, folder.id)}
                onDragLeave={handleFolderDragLeave}
                onDrop={handleDragDrop}
                className={classNames("group/folder flex w-full items-center justify-between rounded-xl text-left font-medium leading-snug transition-colors", isMobile ? "px-3 py-3 text-[15px]" : "rounded-md px-2.5 py-2.5 text-[15px]")}
                style={{
                  ...(!isMobile && selectedFolderId === folder.id && !selectedNoteId
                    ? { background: c.selected, color: c.selectedText }
                    : { color: c.text }),
                  ...(dragState && dropTarget?.type === 'folder' && dropTarget.id === folder.id
                    ? { background: `${c.accent}22`, outline: `2px dashed ${c.accent}`, outlineOffset: '-2px' }
                    : {}),
                }}
                onMouseEnter={(e) => {
                  if (isMobile || !(selectedFolderId === folder.id && !selectedNoteId)) {
                    e.currentTarget.style.background = c.hover
                    e.currentTarget.style.color = c.hoverText
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile && selectedFolderId === folder.id && !selectedNoteId) {
                    e.currentTarget.style.background = c.selected
                    e.currentTarget.style.color = c.selectedText
                  } else {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = c.text
                  }
                }}
              >
                <span className="flex items-center gap-2 min-w-0 flex-1">
                  {openFolders.includes(folder.id)
                    ? <ChevronDown size={isMobile ? 16 : 16} strokeWidth={1.75} className="flex-shrink-0" style={{ color: c.iconMuted }} />
                    : <ChevronRight size={isMobile ? 16 : 16} strokeWidth={1.75} className="flex-shrink-0" style={{ color: c.iconMuted }} />
                  }
                  <Folder size={isMobile ? 17 : 17} strokeWidth={1.75} className="flex-shrink-0" style={{ color: c.icon }} />
                  <span className="truncate min-w-0">{folder.name || 'New Folder'}</span>
                </span>
                <span className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <span className="text-[11px]" style={{ color: c.textMuted }}>
                    {notes.filter(n => n.folder_id === folder.id).length}
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    className={classNames("inline-flex items-center justify-center rounded-md transition-colors", isMobile ? "h-7 w-7" : "h-5 w-5")}
                    style={{ color: c.iconMuted }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = c.hover; e.currentTarget.style.color = c.textBright }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = c.iconMuted }}
                    onClick={(e) => { e.stopPropagation(); onCloseSidebarContext(); onCreateNote(folder.id) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onCreateNote(folder.id) } }}
                    title="New note in folder"
                  >
                    <Plus size={isMobile ? 16 : 14} strokeWidth={2} />
                  </span>
                </span>
              </button>
            )}

            {/* Notes inside folder */}
            {openFolders.includes(folder.id) &&
              notes.filter((n) => n.folder_id === folder.id).map((note) => (
                editingItem && editingItem.kind === 'note' && editingItem.id === note.id ? (
                  <div key={note.id} className={classNames('ml-6 mt-0.5 flex w-[calc(100%-1.5rem)] items-center rounded-md px-2.5 leading-snug', isMobile ? 'py-3 text-[14px]' : 'py-1.5 text-[14px]')}
                    style={{ color: c.text }}>
                    <input
                      autoFocus
                      value={editingItem.tempName}
                      onChange={(e) => onChangeEditingName(e.target.value)}
                      onBlur={onCommitEditing}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); onCommitEditing() }
                        if (e.key === 'Escape') { e.preventDefault(); onCancelEditing() }
                      }}
                      className={classNames('w-full rounded-sm px-1 py-0.5 outline-none', isMobile ? 'text-[14px]' : 'text-[14px]')}
                      style={{ background: c.inputBg, color: c.textHeading, border: `1px solid ${c.inputBorder}` }}
                    />
                  </div>
                ) : isMobile ? (
                  <button
                    key={note.id}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onCloseSidebarContext(); onSelectNote(note.id) }}
                    onContextMenu={(e) => onSidebarContext(e, { type: 'note', note })}
                    className="ml-5 mt-0.5 flex w-[calc(100%-1.25rem)] items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors active:scale-[0.98] active:opacity-80"
                    style={{ color: c.text }}
                  >
                    <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium truncate flex-1" style={{ color: c.textBright }}>{note.title || 'Untitled'}</span>
                        {note.is_favorite && <Star size={13} fill={c.favorite} color={c.favorite} className="flex-shrink-0" />}
                      </div>
                      <span className="text-[12px] truncate" style={{ color: c.textMuted }}>
                        {note.content?.replace(/<[^>]*>/g, '').slice(0, 50) || 'Empty note'}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg transition-colors"
                      style={{ color: c.iconMuted }}
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
                  </button>
                ) : (
                  <button
                    key={note.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onCloseSidebarContext()
                      if (e.ctrlKey || e.metaKey) onToggleNoteSelection(note.id)
                      else onSelectNote(note.id)
                    }}
                    onContextMenu={(e) => onSidebarContext(e, { type: 'note', note })}
                    draggable
                    onDragStart={(e) => handleNoteDragStart(e, note)}
                    onDragEnd={handleNoteDragEnd}
                    onDragOver={(e) => handleNoteDragOver(e, note)}
                    onDrop={handleDragDrop}
                    className="ml-6 mt-0.5 mb-0.5 flex w-[calc(100%-1.5rem)] items-center gap-2 rounded-md px-2.5 text-left leading-snug transition-colors py-1.5 text-[14px]"
                    style={{
                      ...(selectedNoteId === note.id
                        ? { background: c.selected, color: c.selectedText }
                        : selectedNoteIds.includes(note.id)
                          ? { background: c.multiSelect, color: c.multiSelectText, boxShadow: selectedNoteId !== note.id ? `inset 2px 0 0 ${c.multiSelectAccent}` : undefined }
                          : { color: c.text }),
                      cursor: dragState?.noteId === note.id ? 'grabbing' : 'grab',
                      ...(dragState?.noteId === note.id ? { opacity: 0.4 } : {}),
                      ...(getNoteDropStyle(note.id) || {}),
                    }}
                    onMouseEnter={(e) => {
                      if (selectedNoteId !== note.id) {
                        e.currentTarget.style.background = selectedNoteIds.includes(note.id) ? c.multiSelectHover : c.hover
                        e.currentTarget.style.color = c.hoverText
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedNoteId === note.id) {
                        e.currentTarget.style.background = c.selected
                        e.currentTarget.style.color = c.selectedText
                      } else if (selectedNoteIds.includes(note.id)) {
                        e.currentTarget.style.background = c.multiSelect
                        e.currentTarget.style.color = c.multiSelectText
                      } else {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = c.text
                      }
                    }}
                  >
                    <FileText size={15} strokeWidth={1.75} className="flex-shrink-0" style={{ color: c.iconMuted }} />
                    <span className="flex-1 truncate">{note.title || 'Untitled'}</span>
                    {note.is_favorite && <Star size={13} fill={c.favorite} color={c.favorite} className="flex-shrink-0" />}
                  </button>
                )
              ))
            }
          </div>
        ))}

        {/* Standalone / Favorites notes */}
        <div className={activeTab === SidebarTabs.ALL && folders.length > 0 ? (isMobile ? 'mt-2 pt-2' : 'mt-2') : ''} 
          onDragOver={handleStandaloneDragOver}
          onDrop={handleDragDrop}
          style={{
            ...(activeTab === SidebarTabs.ALL && folders.length > 0 && isMobile ? { borderTop: `1px solid ${c.border}` } : {}),
            ...(dragState && !isMobile ? { minHeight: 40 } : {}),
            ...(dragState && dropTarget?.type === 'standalone' ? { background: `${c.accent}10`, borderRadius: 8 } : {}),
          }}>
          {displayNotes
            .filter((n) => activeTab === SidebarTabs.FAVORITES ? true : !n.folder_id)
            .map((note) => (
              editingItem && editingItem.kind === 'note' && editingItem.id === note.id ? (
                <div key={note.id} className={classNames('flex items-center rounded-md px-2.5 leading-snug', isMobile ? 'py-2.5 text-[14px]' : 'py-1.5 text-[14px]')}
                  style={{ color: c.text }}>
                  <input
                    autoFocus
                    value={editingItem.tempName}
                    onChange={(e) => onChangeEditingName(e.target.value)}
                    onBlur={onCommitEditing}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); onCommitEditing() }
                      if (e.key === 'Escape') { e.preventDefault(); onCancelEditing() }
                    }}
                    className={classNames('w-full rounded-sm px-1 py-0.5 outline-none', isMobile ? 'text-[14px]' : 'text-[14px]')}
                    style={{ background: c.inputBg, color: c.textHeading, border: `1px solid ${c.inputBorder}` }}
                  />
                </div>
              ) : isMobile ? (
                <button
                  key={note.id}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onCloseSidebarContext(); onSelectNote(note.id) }}
                  onContextMenu={(e) => onSidebarContext(e, { type: 'note', note })}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors active:scale-[0.98] active:opacity-80 mb-0.5"
                  style={{ color: c.text }}
                >
                  <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-medium truncate flex-1" style={{ color: c.textBright }}>{note.title || 'Untitled'}</span>
                      {note.is_favorite && <Star size={13} fill={c.favorite} color={c.favorite} className="flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] flex-shrink-0" style={{ color: c.textMuted }}>
                        {note.updated_at
                          ? new Date(note.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                          : ''}
                      </span>
                      <span className="text-[11px] flex-shrink-0" style={{ color: c.borderLight }}>·</span>
                      <span className="text-[12px] truncate" style={{ color: c.textMuted }}>
                        {note.content?.replace(/<[^>]*>/g, '').slice(0, 40) || 'Empty note'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-lg transition-colors"
                    style={{ color: c.iconMuted }}
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
                    <MoreHorizontal size={18} strokeWidth={2} />
                  </button>
                </button>
              ) : (
                <button
                  key={note.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCloseSidebarContext()
                    if (e.ctrlKey || e.metaKey) onToggleNoteSelection(note.id)
                    else onSelectNote(note.id)
                  }}
                  onContextMenu={(e) => onSidebarContext(e, { type: 'note', note })}
                  draggable={!isMobile}
                  onDragStart={(e) => handleNoteDragStart(e, note)}
                  onDragEnd={handleNoteDragEnd}
                  onDragOver={(e) => handleNoteDragOver(e, note)}
                  onDrop={handleDragDrop}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 text-left leading-snug transition-colors mb-0.5 py-1.5 text-[14px]"
                  style={{
                    ...(selectedNoteId === note.id
                      ? { background: c.selected, color: c.selectedText }
                      : selectedNoteIds.includes(note.id)
                        ? { background: c.multiSelect, color: c.multiSelectText, boxShadow: selectedNoteId !== note.id ? `inset 2px 0 0 ${c.multiSelectAccent}` : undefined }
                        : { color: c.text }),
                    ...(!isMobile ? { cursor: dragState?.noteId === note.id ? 'grabbing' : 'grab' } : {}),
                    ...(dragState?.noteId === note.id ? { opacity: 0.4 } : {}),
                    ...(getNoteDropStyle(note.id) || {}),
                  }}
                  onMouseEnter={(e) => {
                    if (selectedNoteId !== note.id) {
                      e.currentTarget.style.background = selectedNoteIds.includes(note.id) ? c.multiSelectHover : c.hover
                      e.currentTarget.style.color = c.hoverText
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedNoteId === note.id) {
                      e.currentTarget.style.background = c.selected
                      e.currentTarget.style.color = c.selectedText
                    } else if (selectedNoteIds.includes(note.id)) {
                      e.currentTarget.style.background = c.multiSelect
                      e.currentTarget.style.color = c.multiSelectText
                    } else {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = c.text
                    }
                  }}
                >
                  <FileText size={16} strokeWidth={1.75} className="flex-shrink-0" style={{ color: c.iconMuted }} />
                  <span className="flex-1 truncate min-w-0">{note.title || 'Untitled'}</span>
                  {note.is_favorite && <Star size={13} fill={c.favorite} color={c.favorite} className="flex-shrink-0" />}
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
  onDropNote: PropTypes.func,
  isMobile: PropTypes.bool,
  search: PropTypes.string,
  onChangeSearch: PropTypes.func,
  onLogout: PropTypes.func,
  theme: PropTypes.string,
  onToggleTheme: PropTypes.func,
}