'use client'

import { useState } from 'react'
import { FileText, PenTool, Star, Tag, MoreHorizontal, Trash2 } from 'lucide-react'

export default function NoteItem({ note, isSelected, onSelect, onDelete, onTogglePin }) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div 
      className="relative group rounded-lg p-3 cursor-pointer transition-colors"
      style={{
        backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
        borderColor: isSelected ? 'var(--border)' : 'transparent',
        border: isSelected ? '1px solid' : 'none'
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.target.style.backgroundColor = 'var(--muted)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.target.style.backgroundColor = 'transparent'
        }
      }}
    >
      <div onClick={onSelect} className="flex-1">
        <div className="flex items-start justify-between mb-1">
          <h4 className="font-medium text-sm truncate flex-1 mr-2" style={{color: 'var(--card-foreground)'}}>
            {note.title}
          </h4>
          <div className="flex items-center space-x-1">
            {note.type === 'drawing' ? (
              <PenTool size={12} style={{color: '#10b981'}} />
            ) : (
              <FileText size={12} style={{color: '#3b82f6'}} />
            )}
            {note.isPinned && <Star size={12} style={{color: '#eab308'}} className="fill-current" />}
          </div>
        </div>
        
        <p className="text-xs mb-2" style={{color: 'var(--muted-foreground)'}}>
          {new Date(note.updatedAt).toLocaleDateString()}
        </p>

        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map(tag => (
              <span 
                key={tag} 
                className="inline-flex items-center px-2 py-1 text-xs rounded"
                style={{
                  backgroundColor: 'var(--muted)',
                  color: 'var(--muted-foreground)'
                }}
              >
                <Tag size={10} className="mr-1" />
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-xs" style={{color: 'var(--muted-foreground)'}}>+{note.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowMenu(!showMenu)
        }}
        className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 rounded transition-opacity"
        style={{
          backgroundColor: 'transparent'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--muted)'
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent'
        }}
      >
        <MoreHorizontal size={14} style={{color: 'var(--muted-foreground)'}} />
      </button>

      {showMenu && (
        <div 
          className="absolute top-8 right-2 rounded-lg shadow-lg z-10 py-1"
          style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)'
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTogglePin(note)
              setShowMenu(false)
            }}
            className="w-full px-3 py-1 text-left text-sm flex items-center space-x-2 transition-colors"
            style={{color: note.isPinned ? '#eab308' : 'var(--card-foreground)'}}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#fef9c3'
              e.target.style.color = '#eab308'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = note.isPinned ? '#eab308' : 'var(--card-foreground)'
            }}
          >
            <Star size={14} />
            <span>{note.isPinned ? 'Unpin' : 'Pin'}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(note.id)
              setShowMenu(false)
            }}
            className="w-full px-3 py-1 text-left text-sm flex items-center space-x-2 transition-colors"
            style={{color: 'var(--destructive)'}}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#fee2e2'
              e.target.style.color = '#dc2626'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = 'var(--destructive)'
            }}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  )
}