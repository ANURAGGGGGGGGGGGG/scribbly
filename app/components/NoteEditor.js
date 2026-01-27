'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bold, Italic, Underline, Share, Download, List, ListOrdered, Heading1, Heading2, Undo, Redo, Link } from 'lucide-react'

export default function NoteEditor({ note, onUpdate }) {
  const [title, setTitle] = useState(note.title)
  const editorRef = useRef(null)
  const titleTimeoutRef = useRef(null)
  const lastCursorPosition = useRef(0)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const historyRef = useRef([])
  const historyIndexRef = useRef(-1)
  const titleRef = useRef(note.title)
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false
  })

  useEffect(() => {
    titleRef.current = title
  }, [title])

  const saveToHistory = useCallback((override) => {
    if (!editorRef.current) return

    const currentTitle = override?.title ?? titleRef.current
    const currentContent = override?.content ?? editorRef.current.innerHTML

    const currentHistory = historyRef.current
    const currentIndex = historyIndexRef.current

    const trimmedHistory =
      currentIndex < currentHistory.length - 1 ? currentHistory.slice(0, currentIndex + 1) : currentHistory

    const nextHistory = [...trimmedHistory, { title: currentTitle, content: currentContent }]
    const nextIndex = currentIndex + 1

    historyRef.current = nextHistory
    historyIndexRef.current = nextIndex
    setHistory(nextHistory)
    setHistoryIndex(nextIndex)
  }, [])

  useEffect(() => {
    setTitle(note.title)
    titleRef.current = note.title
    historyRef.current = []
    historyIndexRef.current = -1
    setHistory([])
    setHistoryIndex(-1)

    if (editorRef.current) {
      const content = note.content || ''
      editorRef.current.innerHTML = content
      saveToHistory({ title: note.title, content })
    }
  }, [note.id, note.title, note.content, saveToHistory])

  useEffect(() => {
    // Add event listener to detect formatting changes
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const node = range.startContainer.parentNode
        
        setActiveFormats({
          bold: window.getComputedStyle(node).fontWeight === '700',
          italic: window.getComputedStyle(node).fontStyle === 'italic',
          underline: window.getComputedStyle(node).textDecoration.includes('underline')
        })
      }
    }
    
    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [])

  const handleUndo = () => {
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)
    historyIndexRef.current = newIndex
    
    const prevState = history[newIndex]
    setTitle(prevState.title)
    editorRef.current.innerHTML = prevState.content
    onUpdate(prevState)
  }

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    historyIndexRef.current = newIndex
    
    const nextState = history[newIndex]
    setTitle(nextState.title)
    editorRef.current.innerHTML = nextState.content
    onUpdate(nextState)
  }

  const debouncedUpdate = (delay = 1000) => {
    clearTimeout(titleTimeoutRef.current)
    titleTimeoutRef.current = setTimeout(() => {
      saveCursorPosition()
      const content = editorRef.current.innerHTML
      saveToHistory()
      onUpdate({
        title,
        content
      })
      setTimeout(restoreCursorPosition, 0)
    }, delay)
  }

  const saveCursorPosition = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    const range = selection.getRangeAt(0)
    const preSelectionRange = range.cloneRange()
    preSelectionRange.selectNodeContents(editorRef.current)
    preSelectionRange.setEnd(range.endContainer, range.endOffset)
    lastCursorPosition.current = preSelectionRange.toString().length
  }

  const restoreCursorPosition = () => {
    if (lastCursorPosition.current === 0 || !editorRef.current) return

    const selection = window.getSelection()
    const range = document.createRange()
    let charCount = 0
    let found = false

    const traverseNodes = (node) => {
      if (found || !node) return
      if (node.nodeType === Node.TEXT_NODE) {
        const nextCharCount = charCount + node.length
        if (lastCursorPosition.current >= charCount && lastCursorPosition.current <= nextCharCount) {
          range.setStart(node, lastCursorPosition.current - charCount)
          range.collapse(true)
          found = true
        }
        charCount = nextCharCount
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          traverseNodes(node.childNodes[i])
          if (found) break
        }
      }
    }

    traverseNodes(editorRef.current)

    if (found) {
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }

  const handleTitleChange = (e) => {
    const newTitle = e.target.value
    titleRef.current = newTitle
    setTitle(newTitle)
    debouncedUpdate()
  }

  const handleEditorInput = () => {
    debouncedUpdate(1000)
  }

  const applyFormatting = (format) => {
    saveCursorPosition()
    document.execCommand(format, false, null)
    debouncedUpdate(500)
    setTimeout(restoreCursorPosition, 0)
  }

  const insertList = (ordered = false) => {
    saveCursorPosition()
    document.execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList')
    debouncedUpdate(500)
    setTimeout(restoreCursorPosition, 0)
  }

  const insertHeading = (level) => {
    saveCursorPosition()
    document.execCommand('formatBlock', false, `<h${level}>`)
    debouncedUpdate(500)
    setTimeout(restoreCursorPosition, 0)
  }

  const insertLink = () => {
    saveCursorPosition()
    const url = prompt('Enter URL:', 'https://')
    if (url) {
      document.execCommand('createLink', false, url)
    }
    debouncedUpdate(500)
    setTimeout(restoreCursorPosition, 0)
  }

  const exportNote = () => {
    const content = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 40px 20px;
            line-height: 1.6;
            color: #333;
          }
          .note-title { 
            font-size: 2.5rem; 
            font-weight: bold; 
            margin-bottom: 1.5rem;
            color: #1a202c;
          }
          .note-content {
            font-size: 1.1rem;
          }
          .note-content h1, .note-content h2, .note-content h3 {
            margin-top: 1.5em;
            margin-bottom: 0.5em;
            line-height: 1.3;
          }
          .note-content h1 { font-size: 1.8rem; }
          .note-content h2 { font-size: 1.5rem; }
          .note-content h3 { font-size: 1.3rem; }
          .note-content ul, .note-content ol {
            padding-left: 2rem;
            margin: 1rem 0;
          }
          .note-content li {
            margin-bottom: 0.5rem;
          }
          .note-content p {
            margin-bottom: 1.2rem;
          }
          .note-content a {
            color: #3182ce;
            text-decoration: underline;
          }
          .footer {
            margin-top: 3rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 0.9rem;
          }
        </style>
      </head>
      <body>
        <div class="note-title">${title}</div>
        <div class="note-content">${editorRef.current.innerHTML}</div>
        <div class="footer">
          Exported from Scribbly on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </div>
      </body>
      </html>
    `
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareNote = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: editorRef.current.innerText
        })
      } catch (err) {
        console.log('Sharing cancelled', err)
      }
    } else {
      navigator.clipboard.writeText(editorRef.current.innerText)
      alert('Note content copied to clipboard!')
    }
  }

  return (
    <div className="h-full flex flex-col" style={{backgroundColor: 'var(--card)'}}>
      <div className="border-b p-4" style={{borderColor: 'var(--border)'}}>
        <div className="flex items-center justify-between flex-wrap gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <div className="flex items-center gap-1 md:flex-wrap min-w-max">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-lg transition-colors hover:scale-105 touch-manipulation"
              style={{
                color: historyIndex <= 0 ? 'var(--muted-foreground)' : 'var(--card-foreground)',
                opacity: historyIndex <= 0 ? 0.5 : 1
              }}
              title="Undo"
            >
              <Undo size={18} />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-lg transition-colors hover:scale-105"
              style={{
                color: historyIndex >= history.length - 1 ? 'var(--muted-foreground)' : 'var(--card-foreground)',
                opacity: historyIndex >= history.length - 1 ? 0.5 : 1
              }}
              title="Redo"
            >
              <Redo size={18} />
            </button>
            
            <div className="h-5 border-l mx-1" style={{borderColor: 'var(--border)'}}></div>
            
            <button
              onClick={() => applyFormatting('bold')}
              className={`p-2 rounded-lg transition-colors hover:scale-105 ${activeFormats.bold ? 'bg-accent' : ''}`}
              style={{color: activeFormats.bold ? 'var(--primary)' : 'var(--card-foreground)'}}
              title="Bold"
            >
              <Bold size={18} />
            </button>
            <button
              onClick={() => applyFormatting('italic')}
              className={`p-2 rounded-lg transition-colors hover:scale-105 ${activeFormats.italic ? 'bg-accent' : ''}`}
              style={{color: activeFormats.italic ? 'var(--primary)' : 'var(--card-foreground)'}}
              title="Italic"
            >
              <Italic size={18} />
            </button>
            <button
              onClick={() => applyFormatting('underline')}
              className={`p-2 rounded-lg transition-colors hover:scale-105 ${activeFormats.underline ? 'bg-accent' : ''}`}
              style={{color: activeFormats.underline ? 'var(--primary)' : 'var(--card-foreground)'}}
              title="Underline"
            >
              <Underline size={18} />
            </button>
            
            <div className="h-5 border-l mx-1" style={{borderColor: 'var(--border)'}}></div>
            
            <button
              onClick={() => insertList(false)}
              className="p-2 rounded-lg transition-colors hover:scale-105"
              style={{color: 'var(--card-foreground)'}}
              title="Bullet List"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => insertList(true)}
              className="p-2 rounded-lg transition-colors hover:scale-105"
              style={{color: 'var(--card-foreground)'}}
              title="Numbered List"
            >
              <ListOrdered size={18} />
            </button>
            
            <div className="h-5 border-l mx-1" style={{borderColor: 'var(--border)'}}></div>
            
            <button
              onClick={() => insertHeading(1)}
              className="p-2 rounded-lg transition-colors hover:scale-105"
              style={{color: 'var(--card-foreground)'}}
              title="Heading 1"
            >
              <Heading1 size={18} />
            </button>
            <button
              onClick={() => insertHeading(2)}
              className="p-2 rounded-lg transition-colors hover:scale-105"
              style={{color: 'var(--card-foreground)'}}
              title="Heading 2"
            >
              <Heading2 size={18} />
            </button>
            
            <div className="h-5 border-l mx-1" style={{borderColor: 'var(--border)'}}></div>
            
            <button
              onClick={insertLink}
              className="p-2 rounded-lg transition-colors hover:scale-105"
              style={{color: 'var(--card-foreground)'}}
              title="Insert Link"
            >
              <Link size={18} />
            </button>
          </div>

          <div className="flex items-center space-x-2 min-w-max">
            <button 
              onClick={shareNote} 
              className="p-2 rounded-lg transition-colors hover:scale-105 flex items-center"
              style={{
                backgroundColor: 'var(--muted)',
                color: 'var(--card-foreground)'
              }}
              title="Share"
            >
              <Share size={18} className="mr-1" />
              <span className="text-sm hidden sm:inline">Share</span>
            </button>
            <button 
              onClick={exportNote} 
              className="p-2 rounded-lg transition-colors hover:scale-105 flex items-center"
              style={{
                backgroundColor: 'var(--muted)',
                color: 'var(--card-foreground)'
              }}
              title="Export"
            >
              <Download size={18} className="mr-1" />
              <span className="text-sm hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Note"
          className="w-full px-6 py-4 text-3xl font-bold border-none outline-none resize-none bg-transparent"
          style={{color: 'var(--card-foreground)'}}
        />

        <div
          ref={editorRef}
          contentEditable
          onInput={handleEditorInput}
          onKeyUp={saveCursorPosition}
          onMouseUp={saveCursorPosition}
          className="flex-1 w-full px-6 py-4 border-none outline-none resize-none bg-transparent leading-relaxed overflow-auto min-h-[300px]"
          style={{ 
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: 'var(--card-foreground)'
          }}
          data-placeholder="Start writing your note..."
        ></div>
      </div>

      <div className="border-t px-6 py-3 flex items-center justify-between" style={{borderColor: 'var(--border)'}}>
        <div className="text-sm" style={{color: 'var(--card-foreground)', opacity: 0.6}}>
          Last edited {new Date(note.updatedAt).toLocaleString()}
        </div>
        <div className="text-sm" style={{color: 'var(--card-foreground)', opacity: 0.6}}>
          {editorRef.current?.innerText?.trim().split(/\s+/).filter(Boolean).length || 0} words
        </div>
      </div>
    </div>
  )
}
