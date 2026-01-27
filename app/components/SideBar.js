'use client'

import { useState } from 'react'
import { 
  FileText, PenTool, Plus, Search, Folder, 
  FolderPlus, Star, Trash2, User, LogOut, 
  ChevronDown, ChevronUp
} from 'lucide-react'
import NoteItem from './NoteItem'

export default function Sidebar({ 
  notes, 
  folders, 
  selectedNote, 
  onNoteSelect, 
  onCreateNote, 
  onDeleteNote,
  onDeleteAllNotes,
  onCreateFolder,
  onDeleteFolder,
  onUpdateNote,
  user,
  onShowAuth,
  onSignOut 
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [expandedFolders, setExpandedFolders] = useState(true)

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    const matchesFolder = !selectedFolder || note.folderId === selectedFolder
    return matchesSearch && matchesFolder
  })

  const pinnedNotes = filteredNotes.filter(note => note.isPinned)
  const regularNotes = filteredNotes.filter(note => !note.isPinned)

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim())
      setNewFolderName('')
      setShowNewFolder(false)
    }
  }

  const togglePin = (note) => {
    onUpdateNote(note.id, { isPinned: !note.isPinned })
  }

  const handleDeleteAllNotes = () => {
    if (!onDeleteAllNotes || notes.length === 0) return
    onDeleteAllNotes()
  }

  return (
    <>
      <div 
        className="h-full flex flex-col"
        style={{
          backgroundColor: 'var(--card)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          width: '18rem'
        }}
      >
        <div className="p-4 border-b" style={{borderColor: 'var(--border)'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-purple-600 to-blue-500 w-8 h-8 rounded-lg flex items-center justify-center">
                <PenTool size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-bold" style={{color: 'var(--card-foreground)'}}>Scribbly</h1>
            </div>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-medium"
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button 
                  onClick={onSignOut}
                  className="p-2 rounded-lg transition-all hover:bg-red-500 hover:text-white"
                  style={{
                    color: 'var(--card-foreground)',
                    opacity: 0.8
                  }}
                  title="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={onShowAuth}
                className="flex items-center space-x-1 text-sm transition-all hover:scale-105 hover:shadow-md"
                style={{
                  color: 'var(--primary)',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--accent)',
                }}
              >
                <User size={16} />
                <span>Sign In</span>
              </button>
            )}
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{color: 'var(--muted-foreground)'}} size={16} />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl focus:outline-none transition-all hover:shadow-sm"
              style={{
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              }}
            />
          </div>

          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => onCreateNote('text')}
              className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl transition-all hover:opacity-90 hover:scale-[1.03] active:scale-[0.98] hover:shadow-md touch-manipulation"
              style={{
                background: 'linear-gradient(135deg, var(--primary), #3b82f6)',
                color: 'var(--primary-foreground)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
              }}
            >
              <FileText size={16} />
              <span className="text-sm font-medium">Note</span>
            </button>
            <button
              onClick={() => onCreateNote('drawing')}
              className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl transition-all hover:opacity-90 hover:scale-[1.03] active:scale-[0.98] hover:shadow-md"
              style={{
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                color: 'white',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
              }}
            >
              <PenTool size={16} />
              <span className="text-sm font-medium">Sketch</span>
            </button>
          </div>
        </div>

        <div className="px-4 py-3 border-b" style={{borderColor: 'var(--border)'}}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium flex items-center" style={{color: 'var(--card-foreground)'}}>
                Folders
              </h3>
              <button 
                onClick={() => setExpandedFolders(!expandedFolders)}
                className="p-1 text-xs rounded-md transition-colors"
                style={{
                  backgroundColor: 'var(--background)',
                  color: 'var(--card-foreground)',
                  opacity: 0.7
                }}
              >
                {expandedFolders ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
            <button 
              onClick={() => setShowNewFolder(true)} 
              className="p-1.5 rounded-lg transition-colors hover:bg-accent hover:shadow-sm"
              style={{color: 'var(--card-foreground)', opacity: 0.8}}
              title="New folder"
            >
              <FolderPlus size={16} />
            </button>
          </div>

          {expandedFolders && (
            <div className="space-y-1">
              <div className="flex items-center group">
                <button
                  onClick={() => setSelectedFolder(null)}
                  className="flex-1 flex items-center space-x-2 px-3 py-2 rounded-xl text-sm transition-all hover:shadow-sm"
                  style={{
                    backgroundColor: selectedFolder === null ? 'var(--accent)' : 'transparent',
                    color: selectedFolder === null ? 'var(--primary)' : 'var(--card-foreground)'
                  }}
                >
                  <Folder size={16} className="opacity-70" />
                  <span className="font-medium">All Notes</span>
                  <span 
                    className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: selectedFolder === null ? 'var(--primary)' : 'var(--background)',
                      color: selectedFolder === null ? 'white' : 'var(--card-foreground)',
                      opacity: 0.8
                    }}
                  >
                    {notes.length}
                  </span>
                </button>
                {notes.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteAllNotes()
                    }}
                    className="p-1.5 rounded-lg transition-colors opacity-70 hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                    style={{color: 'var(--destructive)'}}
                    title="Delete all notes"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              {folders.map(folder => (
                <div 
                  key={folder.id} 
                  className="flex items-center group"
                >
                  <button
                    onClick={() => setSelectedFolder(folder.id)}
                    className="flex-1 flex items-center space-x-2 px-3 py-2 rounded-xl text-sm transition-all hover:shadow-sm"
                    style={{
                      backgroundColor: selectedFolder === folder.id ? 'var(--accent)' : 'transparent',
                      color: selectedFolder === folder.id ? 'var(--primary)' : 'var(--card-foreground)'
                    }}
                  >
                    <Folder size={16} className="opacity-70" />
                    <span className="font-medium">{folder.name}</span>
                    <span 
                      className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: selectedFolder === folder.id ? 'var(--primary)' : 'var(--background)',
                        color: selectedFolder === folder.id ? 'white' : 'var(--card-foreground)',
                        opacity: 0.8
                      }}
                    >
                      {notes.filter(n => n.folderId === folder.id).length}
                    </span>
                  </button>
                  <button
                    onClick={() => onDeleteFolder(folder.id)}
                    className="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-70 hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                    style={{color: 'var(--destructive)'}}
                    title="Delete folder"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showNewFolder && (
            <div className="mt-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                  className="flex-1 px-3 py-2 text-sm rounded-xl focus:outline-none transition-all hover:shadow-sm"
                  style={{
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)'
                  }}
                  autoFocus
                />
                <button
                  onClick={handleCreateFolder}
                  className="p-2 rounded-xl transition-colors hover:scale-110 active:scale-95"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'var(--primary-foreground)'
                  }}
                  title="Create folder"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {pinnedNotes.length > 0 && (
            <div className="px-4 py-3">
              <h3 className="text-sm font-medium mb-2 flex items-center" style={{color: 'var(--card-foreground)'}}>
                <Star size={14} className="mr-2 text-yellow-500 fill-yellow-500/20" />
                Pinned
              </h3>
              <div className="space-y-2">
                {pinnedNotes.map(note => (
                  <NoteItem 
                    key={note.id} 
                    note={note} 
                    isSelected={selectedNote?.id === note.id}
                    onSelect={() => onNoteSelect(note)}
                    onDelete={() => onDeleteNote(note.id)}
                    onTogglePin={() => togglePin(note)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2 gap-2">
              <h3 className="text-sm font-medium" style={{color: 'var(--card-foreground)'}}>
                {pinnedNotes.length > 0 ? 'All Notes' : 'Your Notes'}
              </h3>
              {notes.length > 0 && (
                <button
                  onClick={handleDeleteAllNotes}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg transition-colors hover:bg-red-100 hover:text-red-600"
                  style={{color: 'var(--destructive)'}}
                  title="Delete all notes"
                >
                  <Trash2 size={14} />
                  <span className="text-xs font-medium">Delete All</span>
                </button>
              )}
            </div>
            <div className="space-y-2">
              {regularNotes.map(note => (
                <NoteItem 
                  key={note.id} 
                  note={note} 
                  isSelected={selectedNote?.id === note.id}
                  onSelect={() => onNoteSelect(note)}
                  onDelete={() => onDeleteNote(note.id)}
                  onTogglePin={() => togglePin(note)}
                />
              ))}
            </div>
          </div>

          {filteredNotes.length === 0 && (
            <div className="px-4 py-8 text-center">
              <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="text-gray-400" size={24} />
              </div>
              <p className="text-sm mb-2 font-medium" style={{color: 'var(--card-foreground)'}}>No notes found</p>
              <p className="text-xs" style={{color: 'var(--muted-foreground)'}}>
                {searchTerm ? 'Try different search terms' : 'Create your first note'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
