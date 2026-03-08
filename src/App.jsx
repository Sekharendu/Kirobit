import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './supabaseClient'
import { Sidebar, SidebarTabs } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { EditorPane } from './components/EditorPane'
import './index.css'

function App() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(SidebarTabs.ALL)
  const [folders, setFolders] = useState([])
  const [notes, setNotes] = useState([])
  const [selectedFolderId, setSelectedFolderId] = useState(null)
  const [selectedNoteId, setSelectedNoteId] = useState(null)
  const [search, setSearch] = useState('')
  const [sidebarContext, setSidebarContext] = useState(null)
  const [editorMenu, setEditorMenu] = useState(null)
  const [slashMenu, setSlashMenu] = useState(null)
  const [editingItem, setEditingItem] = useState(null) // { kind: 'folder'|'note', id, tempName, mode: 'rename'|'create' }
  const [openFolders, setOpenFolders] = useState([])
  const editorRef = useRef(null)
  const [editor,setEditor]=useState()
  const [menu, setMenu] = useState(null);
  const [content,setContent]=useState('');
  

  const applyCommand= (command)=>{
    const chain=editor.chain().focus();
    const actions={
      'h1':()=> chain.toggleHeading({ level: 1 }).run(),
      'h2':()=> chain.toggleHeading({ level: 2 }).run(),
      'h3':()=> chain.toggleHeading({ level: 3 }).run(),
      'h4':()=> chain.toggleHeading({ level: 4 }).run(),
      'body':()=> chain.setParagraph().run(),
      'bold':()=> chain.toggleBold().run(),
      'italic':()=> chain.toggleItalic().run(),
      'strike':()=> chain.toggleStrike().run(),
      'highlight':()=> chain.toggleHighlight().run(),
      'bullet':()=> chain.toggleBulletList().run(),
      'numbered':()=> chain.toggleOrderedList().run(),
      'code':()=> chain.toggleCodeBlock().run(),
      'formula':()=> chain.toggleMathBlock().run(),
      'clear':()=> chain.clearNodes().unsetAllMarks().run()
    };
    if(actions[command]){
      actions[command]();
    }
    setMenu(null);
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const userId = user?.id ?? null

      const [{ data: foldersData }, { data: notesData }] = await Promise.all([
        supabase.from('folders').select('*').order('created_at', { ascending: true }),
        supabase
          .from('notes')
          .select('*')
          .order('updated_at', { ascending: false }),
      ])

      setFolders(foldersData ?? [])
      setNotes(notesData ?? [])

      if (!selectedNoteId && (notesData?.length ?? 0) > 0) {
        setSelectedNoteId(notesData[0].id)
      }

      if (!userId) {
        // eslint-disable-next-line no-console
        console.warn('No Supabase user session found. Notes will still load if your policies allow anon access.')
      }

      setLoading(false)
    }

    load()
  }, [])

const handleContextMenu = (e) => {
  e.preventDefault()
  e.stopPropagation()  // prevent clearMenus() on the parent div from firing

  // ✅ Use native selection — always accurate at right-click time
  const selection = window.getSelection()
  if (!selection || selection.isCollapsed || selection.toString().trim() === '') return

  setMenu({ x: e.clientX, y: e.clientY, type: 'context' })

   const closeOnNextClick = () => {
    setMenu(null)
    document.removeEventListener('click', closeOnNextClick)
  }

  // Small timeout so this listener doesn't catch the current right-click's
  // bubbling mouseup/click events
  setTimeout(() => {
    document.addEventListener('click', closeOnNextClick)
  }, 0)
}

  const handleSlashKey = (e) => {
    const rect = editor.options.element.getBoundingClientRect();
    setMenu({ x: e.clientX, y: e.clientY, type: 'slash' });
    setTimeout(() => {
    const closeOnNextClick = () => {
      setMenu(null)
      document.removeEventListener('click', closeOnNextClick)
    }
    document.addEventListener('click', closeOnNextClick)
  }, 0)
  };

  const visibleNotes = useMemo(() => {
    let list = notes
    if (activeTab === SidebarTabs.FAVORITES) {
      list = list.filter((n) => n.is_favorite)
    }
    if (selectedFolderId) {
      list = list.filter((n) => n.folder_id === selectedFolderId)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (n) => n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q),
      )
    }
    return list
  }, [notes, activeTab, selectedFolderId, search])

  const selectedNote = notes.find((n) => n.id === selectedNoteId) ?? visibleNotes[0] ?? null

  useEffect(() => {
    if (!selectedNote && visibleNotes.length > 0) {
      setSelectedNoteId(visibleNotes[0].id)
    }
  }, [selectedNote, visibleNotes])

  const handleCreateNote = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('notes')
      .insert([
        {
          user_id: user?.id,
          title: 'Untitled',
          content: '',
          folder_id: selectedFolderId,
        },
      ])
      .select()
      .single()

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating note', error)
      return
    }

    setNotes((prev) => [data, ...prev])
    setSelectedNoteId(data.id)
  }

  const handleCreateFolder = async () => {
    // Create a temporary folder entry that will only be persisted if user types a name
    const tempId = `temp-folder-${Date.now()}`
    setFolders((prev) => [
      ...prev,
      {
        id: tempId,
        name: '',
        user_id: null,
        created_at: new Date().toISOString(),
      },
    ])
    setEditingItem({
      kind: 'folder',
      id: tempId,
      tempName: '',
      mode: 'create',
    })
  }

  const handleToggleFavorite = async (note) => {
    const next = !note.is_favorite
    setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, is_favorite: next } : n)))

    const { error } = await supabase
      .from('notes')
      .update({ is_favorite: next })
      .eq('id', note.id)

    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating favorite', error)
    }
  }

  const handleDeleteNote = async (noteId) => {
    const confirm = window.confirm('Delete this note?')
    if (!confirm) return

    setNotes((prev) => prev.filter((n) => n.id !== noteId))
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null)
    }

    const { error } = await supabase.from('notes').delete().eq('id', noteId)
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting note', error)
    }
  }

  const handleSidebarContext = (e, item) => {
    e.preventDefault()
    setSidebarContext({
      x: e.clientX,
      y: e.clientY,
      item,
    })
  }

  const closeSidebarContext = () => setSidebarContext(null)

  const applySidebarAction = async (action) => {
    const target = sidebarContext?.item
    if (!target) return

    if (action === 'favorite' && target.type === 'note') {
      await handleToggleFavorite(target.note)
    }

    if (action === 'rename') {
      if (target.type === 'folder') {
        setEditingItem({
          kind: 'folder',
          id: target.folder.id,
          tempName: target.folder.name ?? '',
          mode: 'rename',
        })
      } else {
        setEditingItem({
          kind: 'note',
          id: target.note.id,
          tempName: target.note.title ?? '',
          mode: 'rename',
        })
      }
    }

    if (action === 'delete') {
      if (target.type === 'folder') {
        const confirm = window.confirm(
          'Delete this folder? Notes in it will become standalone notes.',
        )
        if (!confirm) return
        setFolders((prev) => prev.filter((f) => f.id !== target.folder.id))
        setNotes((prev) =>
          prev.map((n) =>
            n.folder_id === target.folder.id ? { ...n, folder_id: null } : n,
          ),
        )
        await supabase.from('folders').delete().eq('id', target.folder.id)
      } else {
        await handleDeleteNote(target.note.id)
      }
    }

    closeSidebarContext()
  }

  const updateNoteContent = async (changes) => {
    if (!selectedNote) return

    const next = { ...selectedNote, ...changes, updated_at: new Date().toISOString() }
    setNotes((prev) => prev.map((n) => (n.id === selectedNote.id ? next : n)))

    const { error } = await supabase.from('notes').update(changes).eq('id', selectedNote.id)
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating note', error)
    }
  }

  const handleEditorInput = (e) => {
    updateNoteContent({ content: e.currentTarget.innerHTML })
  }

  const handleTitleChange = (e) => {
    updateNoteContent({ title: e.target.value || 'Untitled' })
  }

  const openEditorMenu = (e) => {
    e.preventDefault()
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return

    setEditorMenu({
      x: e.clientX,
      y: e.clientY,
    })
  }

  const closeEditorMenu = () => setEditorMenu(null)

  // const applyFormatting = (command) => {
  //   if (!editorRef.current) return
  //   editorRef.current.focus()

  //   const exec = (cmd, value = null) => {
  //     document.execCommand(cmd, false, value)
  //   }

  //   switch (command) {
  //     case 'bold':
  //       exec('bold')
  //       break
  //     case 'italic':
  //       exec('italic')
  //       break
  //     case 'strike':
  //       exec('strikeThrough')
  //       break
  //     case 'highlight':
  //       exec('backColor', 'yellow')
  //       break
  //     case 'h1':
  //       exec('formatBlock', 'h1')
  //       break
  //     case 'h2':
  //       exec('formatBlock', 'h2')
  //       break
  //     case 'h3':
  //       exec('formatBlock', 'h3')
  //       break
  //     case 'h4':
  //       exec('formatBlock', 'h4')
  //       break
  //     case 'bullet':
  //       exec('insertUnorderedList')
  //       break
  //     case 'numbered':
  //       exec('insertOrderedList')
  //       break
  //     case 'body':
  //     case 'clear':
  //       exec('removeFormat')
  //       exec('formatBlock', 'p')
  //       break
  //     default:
  //       break
  //   }

  //   if (editorRef.current) {
  //     updateNoteContent({ content: editorRef.current.innerHTML })
  //   }
  //   closeEditorMenu()
  // }

  const handleEditorKeyDown = (e) => {
    if (e.key === '/') {
      if (!editorRef.current) return
      const rect = editorRef.current.getBoundingClientRect()
      setSlashMenu({
        x: rect.left + 40,
        y: rect.top + 40,
      })
    }
  }

  // const applySlashCommand = (command) => {
  //   if (!editorRef.current) return
  //   editorRef.current.focus()

  //   if (command === 'code') {
  //     document.execCommand('insertHTML', false, '<pre><code></code></pre>')
  //   } else if (command === 'formula') {
  //     document.execCommand('insertText', false, '$$  $$')
  //   } else {
  //     applyFormatting(command)
  //     setSlashMenu(null)
  //     return
  //   }

  //   if (editorRef.current) {
  //     updateNoteContent({ content: editorRef.current.innerHTML })
  //   }
  //   setSlashMenu(null)
  // }

  const clearMenus = () => {
    closeSidebarContext()
    closeEditorMenu()
    setSlashMenu(null)
  }

  const handleChangeEditingName = (name) => {
    setEditingItem((prev) => (prev ? { ...prev, tempName: name } : prev))
  }

  const handleCancelEditing = () => {
    // If user cancels while creating a new folder with empty name, remove it
    if (editingItem?.mode === 'create' && editingItem.kind === 'folder') {
      setFolders((prev) => prev.filter((f) => f.id !== editingItem.id))
    }
    setEditingItem(null)
  }

  const handleCommitEditing = async () => {
    if (!editingItem) return
    const name = editingItem.tempName?.trim() ?? ''

    // If no name provided:
    if (!name) {
      // For create: discard; for rename: just cancel
      handleCancelEditing()
      return
    }

    if (editingItem.kind === 'folder') {
      if (editingItem.mode === 'create') {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('folders')
          .insert([{ user_id: user?.id, name }])
          .select()
          .single()

        if (error) {
          // eslint-disable-next-line no-console
          console.error('Error creating folder', error)
          // keep temporary folder so user can retry or cancel
          return
        }

        setFolders((prev) =>
          prev.map((f) => (f.id === editingItem.id ? { ...f, ...data } : f)),
        )
      } else {
        setFolders((prev) =>
          prev.map((f) => (f.id === editingItem.id ? { ...f, name } : f)),
        )

        const { error } = await supabase
          .from('folders')
          .update({ name })
          .eq('id', editingItem.id)
        if (error) {
          // eslint-disable-next-line no-console
          console.error('Error renaming folder', error)
        }
      }
    } else if (editingItem.kind === 'note') {
      setNotes((prev) =>
        prev.map((n) => (n.id === editingItem.id ? { ...n, title: name } : n)),
      )

      const { error } = await supabase.from('notes').update({ title: name }).eq('id', editingItem.id)
      if (error) {
        // eslint-disable-next-line no-console
        console.error('Error renaming note', error)
      }
    }

    setEditingItem(null)
  }

  const handleToggleFolderOpen = (folderId) => {
    setOpenFolders((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId],
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-100">
      <div className="flex w-full" onClick={clearMenus}>
        <Sidebar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          folders={folders}
          notes={notes}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          selectedNoteId={selectedNoteId}
          onSelectNote={setSelectedNoteId}
          onCreateNote={handleCreateNote}
          onCreateFolder={handleCreateFolder}
          onSidebarContext={handleSidebarContext}
          editingItem={editingItem}
          onChangeEditingName={handleChangeEditingName}
          onCommitEditing={handleCommitEditing}
          onCancelEditing={handleCancelEditing}
          openFolders={openFolders}
          onToggleFolderOpen={handleToggleFolderOpen}
        />

        <main className="flex flex-1 flex-col bg-slate-950/60 backdrop-blur-xl">
          <TopBar
            search={search}
            onChangeSearch={setSearch}
            selectedNote={selectedNote}
            onDeleteNote={handleDeleteNote}
            onOpenMenu={(e) =>
              setSidebarContext((prev) =>
                prev && prev.special === 'top'
                  ? null
                  : {
                      special: 'top',
                      x: e.clientX,
                      y: e.clientY + 10,
                      item: { type: 'note', note: selectedNote },
                    },
              )
            }
          />

          <EditorPane
            content={content}
            loading={loading}
            selectedNote={selectedNote}
            onCreateNote={handleCreateNote}
            onTitleChange={handleTitleChange}
            editorRef={editorRef}
            // onEditorChange={handleEditorInput}
            // onEditorChange={setContent}
            onEditorChange={(html) => updateNoteContent({ content: html })}
            onEditorKeyDown={handleEditorKeyDown}
            onEditorContextMenu={openEditorMenu}
            onSlashKey={handleSlashKey}
            onContextMenu={handleContextMenu}
            setEditorInstance={setEditor}
          />
        </main>
      </div>

      {/* Sidebar context menu */}
      {sidebarContext && (
        <div
          className="fixed z-40 w-40 rounded-md border border-slate-800 bg-slate-900/95 text-xs text-slate-100 shadow-soft"
          style={{ top: sidebarContext.y, left: sidebarContext.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-slate-800"
            onClick={() => applySidebarAction('favorite')}
          >
            <span>Add to Favourites</span>
            <span>★</span>
          </button>
          <button
            type="button"
            className="w-full px-3 py-1.5 text-left hover:bg-slate-800"
            onClick={() => applySidebarAction('rename')}
          >
            Rename
          </button>
          <button
            type="button"
            className="w-full px-3 py-1.5 text-left text-rose-300 hover:bg-rose-900/40"
            onClick={() => applySidebarAction('delete')}
          >
            Delete
          </button>
        </div>
      )}

      {/* Editor selection menu */}
      {/* {editorMenu && (
        <div
          className="fixed z-40 grid w-56 grid-cols-2 gap-1 rounded-md border border-slate-800 bg-slate-900/95 p-2 text-[11px] text-slate-100 shadow-soft"
          style={{ top: editorMenu.y, left: editorMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applyFormatting('h1')}
          >
            Heading 1
          </button>
          <button
            type="button"
            className="rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applyFormatting('h2')}
          >
            Heading 2
          </button>
          <button
            type="button"
            className="rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applyFormatting('h3')}
          >
            Heading 3
          </button>
          <button
            type="button"
            className="rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applyFormatting('h4')}
          >
            Heading 4
          </button>
          <button
            type="button"
            className="rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applyFormatting('body')}
          >
            Body
          </button>
          <button
            type="button"
            className="rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applyFormatting('bold')}
          >
            Bold
          </button>
          <button
            type="button"
            className="rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applyFormatting('italic')}
          >
            Italisc
          </button>
          <button
            type="button"
            className="rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applyFormatting('strike')}
          >
            Strikethrough
          </button>
          <button
            type="button"
            className="rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applyFormatting('highlight')}
          >
            Highlight
          </button>
          <button
            type="button"
            className="rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => document.execCommand('cut')}
          >
            Cut
          </button>
          <button
            type="button"
            className="rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => document.execCommand('copy')}
          >
            Copy
          </button>
          <button
            type="button"
            className="rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => document.execCommand('paste')}
          >
            Paste
          </button>
          <button
            type="button"
            className="rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applyFormatting('bullet')}
          >
            Bulleted List
          </button>
          <button
            type="button"
            className="rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applyFormatting('numbered')}
          >
            Numbered List
          </button>
          <button
            type="button"
            className="col-span-2 rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applyFormatting('clear')}
          >
            Clear Formatting
          </button>
        </div>
      )} */}

      {/* Slash menu */}
      {/* {slashMenu && (
        <div
          className="fixed z-40 w-56 rounded-md border border-slate-800 bg-slate-900/95 p-1 text-[11px] text-slate-100 shadow-soft"
          style={{ top: slashMenu.y, left: slashMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-slate-500">
            Insert
          </div>
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applySlashCommand('code')}
          >
            Code Block
          </button>
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applySlashCommand('formula')}
          >
            Formula Block
          </button>
          <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-slate-500">
            Text
          </div>
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applySlashCommand('h1')}
          >
            Heading 1
          </button>
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applySlashCommand('h2')}
          >
            Heading 2
          </button>
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applySlashCommand('h3')}
          >
            Heading 3
          </button>
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applySlashCommand('h4')}
          >
            Heading 4
          </button>
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applySlashCommand('body')}
          >
            Body
          </button>
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applySlashCommand('bold')}
          >
            Bold
          </button>
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applySlashCommand('italic')}
          >
            Italisc
          </button>
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applySlashCommand('strike')}
          >
            Strikethrough
          </button>
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applySlashCommand('highlight')}
          >
            Highlight
          </button>
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applySlashCommand('bullet')}
          >
            Bulleted List
          </button>
          <button
            type="button"
            className="w-full rounded-sm px-2 py-1 text-left hover:bg-slate-800"
            onClick={() => applySlashCommand('numbered')}
          >
            Numbered List
          </button>
        </div>
      )} */}

      {menu && (
        <div 
          className="fixed z-50 w-48 rounded-lg border border-slate-700 bg-slate-800 p-1 shadow-xl"
          style={{ top: menu.y, left: menu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {menu.type === 'context' ? (
            <>
              <button onClick={() => applyCommand('h1')} className="menu-btn">Heading 1</button>
              <button onClick={() => applyCommand('h2')} className="menu-btn">Heading 2</button>
              <button onClick={() => applyCommand('bold')} className="menu-btn font-bold">Bold</button>
              <button onClick={() => applyCommand('italic')} className="menu-btn italic">Italic</button>
              <button onClick={() => applyCommand('highlight')} className="menu-btn text-yellow-400">Highlight</button>
              <button onClick={() => applyCommand('clear')} className="menu-btn text-rose-400 border-t border-slate-700 mt-1">Clear All</button>
            </>
          ) : (
            <>
              <div className="px-3 py-1 text-[10px] uppercase text-slate-500">Insert Block</div>
              <button onClick={() => applyCommand('code')} className="menu-btn font-mono">Code Block</button>
              <button onClick={() => applyCommand('math')} className="menu-btn font-serif">Math Formula</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default App
