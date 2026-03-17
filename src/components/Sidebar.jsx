import PropTypes from 'prop-types'
import { List, Star, Plus, FileText, FolderPlus, ChevronRight, ChevronDown, Folder } from 'lucide-react'


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
}) {



    const displayNotes = notes.filter((n) =>
    activeTab === SidebarTabs.FAVORITES ? n.is_favorite : true
  )
return (
  <aside className="flex w-72 flex-shrink-0 flex-col border-r border-[#1f1f1f] bg-[#111111] h-screen overflow-hidden">
    
    {/* Header */}
    <div className="flex items-center justify-between border-b border-[#1f1f1f] px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-semibold text-white">
          N
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[#e0e0e0] tracking-tight">
            {user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'}'s Notes
          </span>
          <span className="text-[11px] text-[#555555]">Personal workspace</span>
        </div>
      </div>
    </div>

    {/* Tab bar */}
    <div className="flex items-center gap-2 border-b border-[#1f1f1f] px-3 py-2">
      <button
        type="button"
        className={classNames(
          'flex h-8 w-8 items-center justify-center rounded-md text-[#555555]  hover:text-[#c0c0c0] transition-colors',
          activeTab === SidebarTabs.ALL && 'bg-[#1e1e1e] text-[#e0e0e0]',
        )}
        onClick={(e) => {
          e.stopPropagation()
          onChangeTab(SidebarTabs.ALL)
          onSelectFolder(null)
        }}
      >
        <List size={16} />
      </button>
      <button
        type="button"
        className={classNames(
          'flex h-8 w-8 items-center justify-center rounded-md text-[#555555]  hover:text-[#c0c0c0] transition-colors',
          activeTab === SidebarTabs.FAVORITES && 'bg-[#1e1e1e] text-yellow-400',
        )}
        onClick={(e) => {
          e.stopPropagation()
          onChangeTab(SidebarTabs.FAVORITES)
          onSelectFolder(null)
        }}
      >
        <Star size={16} fill={activeTab === SidebarTabs.FAVORITES ? '#eab308' : 'none'} />
      </button>
      <button
        type="button"
        className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-[#8a8a8a]  hover:text-[#e0e0e0] transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          onCreateNote()
        }}
      >
        <Plus size={16} />
      </button>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-md  border-[#2a2a2a] text-[#555555] hover:border-[#3a3a3a] hover:text-[#c0c0c0] transition-colors"
        onClick={(e) => {
          e.stopPropagation()
          onCreateFolder()
        }}
      >
        <FolderPlus size={16} />

      </button>
    </div>

    {/* Scrollable List */}
    <div
      className="scroll-thin flex-1 overflow-y-auto px-2 py-2"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Folders */}
      {activeTab === SidebarTabs.ALL && folders.map((folder) => (
        <div key={folder.id} className="mb-0.5">
          {editingItem && editingItem.kind === 'folder' && editingItem.id === folder.id ? (
            <div className="flex items-center rounded-md px-2 py-1.5 text-xs text-[#8a8a8a]">
              <ChevronDown size={10} className="mr-1 flex-shrink-0" style={{ color: '#444444' }} />
              <Folder size={10} className="mr-2 flex-shrink-0" style={{ color: '#eab308' }} />
              <input
                autoFocus
                value={editingItem.tempName}
                onChange={(e) => onChangeEditingName(e.target.value)}
                onBlur={onCommitEditing}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); onCommitEditing() }
                  if (e.key === 'Escape') { e.preventDefault(); onCancelEditing() }
                }}
                className="w-full rounded-sm bg-[#1a1a1a] px-1 py-0.5 text-xs text-[#e0e0e0] outline-none ring-1 ring-[#2a2a2a] focus:ring-[#3a3a3a]"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleFolderOpen(folder.id)
                onSelectFolder(folder.id)
              }}
              onContextMenu={(e) => onSidebarContext(e, { type: 'folder', folder })}
              className={classNames(
                'flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs font-medium text-[#7a7a7a] hover:bg-[#1a1a1a] hover:text-[#c0c0c0] transition-colors',
                selectedFolderId === folder.id && !selectedNoteId && 'bg-[#1e1e1e] text-[#e0e0e0]',
              )}
            >
              <span className="flex items-center gap-1">
                <span className="text-[10px] text-[#444444]">
                  {openFolders.includes(folder.id) ? '▾' : '▸'}
                </span>
                <Folder size={13} className="flex-shrink-0" style={{ color: '#eab308' }} />
                <span className="truncate">{folder.name || 'New Folder'}</span>
              </span>
            </button>
          )}

          {/* Notes inside folder */}
          {openFolders.includes(folder.id) &&
            notes
              .filter((n) => n.folder_id === folder.id)
              .map((note) => (
                editingItem && editingItem.kind === 'note' && editingItem.id === note.id ? (
                  <div key={note.id} className="ml-7 mt-0.5 flex w-[calc(100%-1.75rem)] items-center rounded-md px-2 py-1 text-[11px] text-[#8a8a8a]">
                    <input
                      autoFocus
                      value={editingItem.tempName}
                      onChange={(e) => onChangeEditingName(e.target.value)}
                      onBlur={onCommitEditing}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); onCommitEditing() }
                        if (e.key === 'Escape') { e.preventDefault(); onCancelEditing() }
                      }}
                      className="w-full rounded-sm bg-[#1a1a1a] px-1 py-0.5 text-[11px] text-[#e0e0e0] outline-none ring-1 ring-[#2a2a2a] focus:ring-[#3a3a3a]"
                    />
                  </div>
                ) : (
                  <button
                    key={note.id}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onSelectNote(note.id) }}
                    onContextMenu={(e) => onSidebarContext(e, { type: 'note', note })}
                    className={classNames(
                      'ml-7 mt-0.5 flex w-[calc(100%-1.75rem)] items-center gap-1.5 rounded-md px-2 py-1 text-left text-[11px] text-[#7a7a7a] hover:bg-[#1a1a1a] hover:text-[#c0c0c0] transition-colors',
                      selectedNoteId === note.id && 'bg-[#1e1e1e] text-[#e0e0e0]',
                    )}
                  >
                    {/* ✅ File icon */}
                    <FileText size={11} className="flex-shrink-0" style={{ color: '#555555' }} />
                    {/* ✅ Title takes remaining space */}
                    <span className="flex-1 truncate">{note.title || 'Untitled'}</span>
                    {/* ✅ Favorite star at the end */}
                    {note.is_favorite && (
                      <Star size={10} fill='#eab308' color='#eab308' className="flex-shrink-0" />
                    )}
                </button>
                )
              ))
          }
        </div>
      ))}

      {/* Standalone / Favorites notes */}
      <div className={activeTab === SidebarTabs.ALL ? 'mt-2 border-t border-[#1f1f1f] pt-2' : ''}>
        {displayNotes
          .filter((n) => activeTab === SidebarTabs.FAVORITES ? true : !n.folder_id)
          .map((note) => (
            editingItem && editingItem.kind === 'note' && editingItem.id === note.id ? (
              <div key={note.id} className="flex items-center rounded-md px-2 py-1.5 text-xs text-[#8a8a8a]">
                <input
                  autoFocus
                  value={editingItem.tempName}
                  onChange={(e) => onChangeEditingName(e.target.value)}
                  onBlur={onCommitEditing}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); onCommitEditing() }
                    if (e.key === 'Escape') { e.preventDefault(); onCancelEditing() }
                  }}
                  className="w-full rounded-sm bg-[#1a1a1a] px-1 py-0.5 text-xs text-[#e0e0e0] outline-none ring-1 ring-[#2a2a2a] focus:ring-[#3a3a3a]"
                />
              </div>
            ) : (
              <button
                key={note.id}
                type="button"
                onClick={(e) => { e.stopPropagation(); onSelectNote(note.id) }}
                onContextMenu={(e) => onSidebarContext(e, { type: 'note', note })}
                className={classNames(
                  'flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs text-[#7a7a7a] hover:bg-[#1a1a1a] hover:text-[#c0c0c0] transition-colors',
                  selectedNoteId === note.id && 'bg-[#1e1e1e] text-[#e0e0e0]',
                )}
              >
                {/* ✅ File icon */}
                <FileText size={12} className="flex-shrink-0" style={{ color: '#555555' }} />
                {/* ✅ Title takes remaining space */}
                <span className="flex-1 truncate">{note.title || 'Untitled'}</span>
                {/* ✅ Favorite star at the end */}
                {note.is_favorite && (
                  <Star size={10} fill='#eab308' color='#eab308' className="flex-shrink-0" />
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
}

