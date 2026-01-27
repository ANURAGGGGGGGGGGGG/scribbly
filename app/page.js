'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from './components/SideBar'
import NoteEditor from './components/NoteEditor'
import DrawingCanvas from './components/DrawingCanvas'
import AuthModal from './components/AuthModal'

import { useAuth } from './hooks/useAuth'
import { useNotes } from './hooks/useNotes'
import { PenTool, FileText, Menu, X, Plus } from 'lucide-react'

export default function Home() {
  const [activeView, setActiveView] = useState('notes')
  const [selectedNote, setSelectedNote] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showGuestWarning, setShowGuestWarning] = useState(false)
  const [guestWarningAction, setGuestWarningAction] = useState('this action')
  const hasAutoOpenedAuthRef = useRef(false)
  const pendingGuestActionRef = useRef(null)
  
  const { user, loading: authLoading, signOut } = useAuth()
  const { 
    notes, 
    folders, 
    loading: notesLoading, 
    createNote, 
    updateNote, 
    deleteNote,
    deleteAllNotes,
    createFolder,
    deleteFolder
  } = useNotes(user)

  useEffect(() => {
    if (notes.length > 0 && !selectedNote) {
      setSelectedNote(notes[0])
    }
  }, [notes, selectedNote])

  useEffect(() => {
    if (authLoading) return

    if (user) {
      hasAutoOpenedAuthRef.current = false
      setShowAuthModal(false)
      return
    }

    if (!hasAutoOpenedAuthRef.current) {
      hasAutoOpenedAuthRef.current = true
      setShowAuthModal(true)
    }
  }, [authLoading, user?.id])

  const openGuestWarning = (actionLabel, action) => {
    pendingGuestActionRef.current = action
    setGuestWarningAction(actionLabel)
    setShowGuestWarning(true)
  }

  const performCreateNote = async (type = 'text') => {
    const newNote = await createNote({
      title: 'Untitled Note',
      type,
      content: type === 'text' ? '' : null,
      drawingData: type === 'drawing' ? null : null,
      folderId: null,
      tags: [],
      isPinned: false
    })
    setSelectedNote(newNote)
    setActiveView(type === 'drawing' ? 'drawing' : 'notes')
  }

  const handleCreateNote = (type = 'text') => {
    if (!user) {
      openGuestWarning('create notes or sketches', () => performCreateNote(type))
      return
    }
    performCreateNote(type)
  }

  const handleNoteSelect = (note) => {
    setSelectedNote(note)
    setActiveView(note.type === 'drawing' ? 'drawing' : 'notes')
    // Close sidebar on mobile when a note is selected
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }

  const handleNoteUpdate = async (noteId, updates) => {
    await updateNote(noteId, updates)
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote({ ...selectedNote, ...updates })
    }
  }

  const performDeleteNote = async (noteId) => {
    await deleteNote(noteId)
    if (selectedNote?.id === noteId) {
      setSelectedNote(null)
    }
  }

  const handleDeleteNote = (noteId) => {
    if (!user) {
      openGuestWarning('delete notes or sketches', () => performDeleteNote(noteId))
      return
    }
    performDeleteNote(noteId)
  }

  const performDeleteAllNotes = async () => {
    if (notes.length === 0) return
    const confirmed = window.confirm(`Delete all ${notes.length} notes? This cannot be undone.`)
    if (!confirmed) return
    await deleteAllNotes()
    setSelectedNote(null)
    setActiveView('notes')
  }

  const handleDeleteAllNotes = () => {
    if (!user) {
      openGuestWarning('delete notes or sketches', performDeleteAllNotes)
      return
    }
    performDeleteAllNotes()
  }

  if (authLoading || notesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{backgroundColor: 'var(--background)', color: 'var(--foreground)'}}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" style={{borderColor: 'var(--primary)'}}></div>
        <p className="text-lg font-medium" style={{color: 'var(--foreground)'}}>Loading your notes...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden env-safe-area-inset" style={{backgroundColor: 'var(--background)', color: 'var(--foreground)'}}>
      {/* Mobile sidebar toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-safe right-safe z-50 p-2 sm:p-3 rounded-full shadow-lg transition-all hover:scale-110"
        style={{
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          margin: '0.5rem',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={sidebarOpen}
        aria-controls="sidebar"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden relative order-1">
        {/* Top bar */}
        <div className="px-6 py-4 flex items-center justify-between" style={{
          backgroundColor: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <div className="flex items-center flex-wrap gap-4 w-full sm:w-auto">
            <h1 className="text-xl font-bold flex items-center" style={{color: 'var(--card-foreground)'}}>
  {selectedNote && <span>{selectedNote.title}</span>}
</h1>
            
            {selectedNote && (
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => setActiveView('notes')}
                  className="p-2 rounded-lg transition-all hover:scale-105 flex items-center"
                  style={{
                    backgroundColor: activeView === 'notes' ? 'var(--accent)' : 'var(--muted)',
                    color: activeView === 'notes' ? 'var(--primary)' : 'var(--card-foreground)',
                    transform: activeView === 'notes' ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: activeView === 'notes' ? '0 0 10px rgba(59, 130, 246, 0.3)' : 'none'
                  }}
                >
                  <FileText size={18} className="mr-1" />
                  <span className="text-sm">Text</span>
                </button>
                <button
                  onClick={() => setActiveView('drawing')}
                  className="p-2 rounded-lg transition-all hover:scale-105 flex items-center"
                  style={{
                    backgroundColor: activeView === 'drawing' ? 'var(--accent)' : 'var(--muted)',
                    color: activeView === 'drawing' ? '#10b981' : 'var(--card-foreground)',
                    transform: activeView === 'drawing' ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: activeView === 'drawing' ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none'
                  }}
                >
                  <PenTool size={18} className="mr-1" />
                  <span className="text-sm">Drawing</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden relative">
          {selectedNote ? (
            activeView === 'notes' ? (
              <NoteEditor
                note={selectedNote}
                onUpdate={(updates) => handleNoteUpdate(selectedNote.id, updates)}
              />
            ) : (
              <DrawingCanvas
                note={selectedNote}
                onUpdate={(updates) => handleNoteUpdate(selectedNote.id, updates)}
              />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center" style={{color: 'var(--foreground)', opacity: 0.8}}>
              <div className="mb-6 relative">
                <div className="w-32 h-32 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--muted)'}}>
                  <FileText size={64} style={{color: 'var(--primary)', opacity: 0.5}} />
                </div>
                <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
                  <Plus size={32} className="text-white" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-3" style={{color: 'var(--card-foreground)'}}>
                Let&apos;s Get Started!
              </h2>
              <p className="max-w-md mb-6 text-lg">
                Create your first note or sketch to begin your creative journey
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
                <button
                  onClick={() => handleCreateNote('text')}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 touch-manipulation"
                  style={{
                    color: 'black',
                    background: 'linear-gradient(135deg, var(--primary), #3b82f6)',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
                  }}
                >
                  <FileText size={20} />
                  <span>Create Text Note</span>
                </button>
                <button
                  onClick={() => handleCreateNote('drawing')}
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105"
                  style={{
                    color: 'white',
                    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <PenTool size={20} />
                  <span>Create Sketch</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`${sidebarOpen ? 'translate-x-0 lg:translate-x-0' : 'translate-x-full lg:hidden'} 
        transition-transform duration-300 ease-in-out
        fixed lg:relative z-40 w-[85%] sm:w-80 h-full right-0 order-2`}
        style={{
          backgroundColor: 'var(--card)',
          boxShadow: '0 0 30px rgba(0,0,0,0.1)',
          maxWidth: '320px'
        }}>
        <Sidebar
          notes={notes}
          folders={folders}
          selectedNote={selectedNote}
          onNoteSelect={handleNoteSelect}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
          onDeleteAllNotes={handleDeleteAllNotes}
          onCreateFolder={createFolder}
          onDeleteFolder={deleteFolder}
          onUpdateNote={handleNoteUpdate}
          user={user}
          onShowAuth={() => setShowAuthModal(true)}
          onSignOut={signOut}
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md z-30"
          onClick={() => setSidebarOpen(false)}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        />
      )}
      {showGuestWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)'}}>
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
            }}
          >
            <div className="p-6 border-b" style={{borderColor: 'rgba(255,255,255,0.06)'}}>
              <h2 className="text-xl font-bold text-white">Sign in to keep your notes</h2>
              <p className="text-sm mt-2 text-gray-300">
                You&apos;re not signed in. If you {guestWarningAction} as a guest, your data is stored only on this device and can be lost if browser data is cleared.
              </p>
            </div>
            <div className="p-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowGuestWarning(false)
                  pendingGuestActionRef.current = null
                }}
                className="flex-1 py-3 px-4 rounded-xl transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'white' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowGuestWarning(false)
                  setShowAuthModal(true)
                  pendingGuestActionRef.current = null
                }}
                className="flex-1 py-3 px-4 rounded-xl font-medium"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={async () => {
                  const pending = pendingGuestActionRef.current
                  setShowGuestWarning(false)
                  pendingGuestActionRef.current = null
                  await pending?.()
                }}
                className="flex-1 py-3 px-4 rounded-xl font-medium"
                style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', color: 'white', boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
}
