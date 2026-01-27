'use client'

import { useState, useEffect, useCallback } from 'react'

export function useNotes(user) {
  const [notes, setNotes] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const userKey = user?.id || user?.email || user?.name

  const loadData = useCallback(() => {
    try {
      const storageKey = userKey ? `scribbly_notes_${userKey}` : 'scribbly_notes_local'
      const foldersKey = userKey ? `scribbly_folders_${userKey}` : 'scribbly_folders_local'
      
      const storedNotes = JSON.parse(localStorage.getItem(storageKey) || '[]')
      const storedFolders = JSON.parse(localStorage.getItem(foldersKey) || '[]')
      
      setNotes(storedNotes)
      setFolders(storedFolders)
    } catch (error) {
      console.error('Error loading data:', error)
      setNotes([])
      setFolders([])
    } finally {
      setLoading(false)
    }
  }, [userKey])

  useEffect(() => {
    loadData()
  }, [loadData])

  const saveNotes = (updatedNotes) => {
    const storageKey = userKey ? `scribbly_notes_${userKey}` : 'scribbly_notes_local'
    localStorage.setItem(storageKey, JSON.stringify(updatedNotes))
    setNotes(updatedNotes)
  }

  const saveFolders = (updatedFolders) => {
    const storageKey = userKey ? `scribbly_folders_${userKey}` : 'scribbly_folders_local'
    localStorage.setItem(storageKey, JSON.stringify(updatedFolders))
    setFolders(updatedFolders)
  }

  const createNote = async (noteData) => {
    const newNote = {
      id: Date.now().toString(),
      ...noteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const updatedNotes = [newNote, ...notes]
    saveNotes(updatedNotes)
    return newNote
  }

  const updateNote = async (noteId, updates) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    )
    saveNotes(updatedNotes)
  }

  const deleteNote = async (noteId) => {
    const updatedNotes = notes.filter(note => note.id !== noteId)
    saveNotes(updatedNotes)
  }

  const deleteAllNotes = async () => {
    saveNotes([])
  }

  const createFolder = async (name) => {
    const newFolder = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString()
    }
    
    const updatedFolders = [...folders, newFolder]
    saveFolders(updatedFolders)
    return newFolder
  }

  const deleteFolder = async (folderId) => {
    const updatedNotes = notes.map(note => 
      note.folderId === folderId 
        ? { ...note, folderId: null, updatedAt: new Date().toISOString() }
        : note
    )
    saveNotes(updatedNotes)
    
    const updatedFolders = folders.filter(folder => folder.id !== folderId)
    saveFolders(updatedFolders)
  }

  return {
    notes,
    folders,
    loading,
    createNote,
    updateNote,
    deleteNote,
    deleteAllNotes,
    createFolder,
    deleteFolder
  }
}
