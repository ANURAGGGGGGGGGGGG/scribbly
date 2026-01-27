'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Trash2, Undo, Redo, Share, Download,
  Eraser, PenTool, Pencil
} from 'lucide-react'

const TOOL_SETTINGS = {
  pen: { opacity: 1.0, smoothing: 0.7, lineCap: 'round' },
  pencil: { opacity: 0.7, smoothing: 0.5, lineCap: 'round' },
  crayon: { opacity: 1.0, smoothing: 0.3, lineCap: 'square' },
  sketch: { opacity: 0.9, smoothing: 0.9, lineCap: 'round' },
  eraser: { opacity: 1.0, smoothing: 0.7, lineCap: 'round' }
}

export default function DrawingCanvas({ note, onUpdate }) {
  const canvasRef = useRef(null)
  const contextRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingData, setDrawingData] = useState(note.drawingData || null)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const [brushSize, setBrushSize] = useState(5)
  const [brushColor, setBrushColor] = useState('#000000')
  const [tool, setTool] = useState('pen')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const initialDrawingData = note.drawingData || null
    setDrawingData(initialDrawingData)

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
      // Set initial background color to white only
      const ctx = canvas.getContext('2d')
      ctx.save()
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.restore()
      if (initialDrawingData) {
        const img = new Image()
        img.onload = () => {
          contextRef.current.drawImage(img, 0, 0)
        }
        img.src = initialDrawingData
      }
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    const ctx = canvas.getContext('2d')
    contextRef.current = ctx
    if (initialDrawingData) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        const snapshot = canvas.toDataURL('image/png')
        setHistory([snapshot])
        setHistoryIndex(0)
      }
      img.src = initialDrawingData
    } else {
      const snapshot = canvas.toDataURL('image/png')
      setHistory([snapshot])
      setHistoryIndex(0)
    }
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [note.id, note.drawingData])

  useEffect(() => {
    if (!contextRef.current || !canvasRef.current) return
    const ctx = contextRef.current
    // Update drawing settings without clearing the canvas
    ctx.lineCap = TOOL_SETTINGS[tool].lineCap
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : brushColor
    ctx.lineWidth = brushSize
    ctx.globalAlpha = TOOL_SETTINGS[tool].opacity
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over'
  }, [brushSize, brushColor, tool])

  const saveToHistory = () => {
    if (!canvasRef.current) return

    const currentDrawing = canvasRef.current.toDataURL('image/png')
    if (historyIndex < history.length - 1) {
      setHistory(prev => prev.slice(0, historyIndex + 1))
    }

    setHistory(prev => [...prev, currentDrawing])
    setHistoryIndex(prev => prev + 1)
  }

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent
    contextRef.current.beginPath()
    contextRef.current.moveTo(offsetX, offsetY)
    setIsDrawing(true)
    
    if (historyIndex < history.length - 1) {
      setHistory(history.slice(0, historyIndex + 1))
    }
  }

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return
    const { offsetX, offsetY } = nativeEvent
    const ctx = contextRef.current

    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.globalAlpha = TOOL_SETTINGS[tool].opacity

    if (tool === 'eraser') {
      ctx.strokeStyle = '#FFFFFF'
      ctx.globalCompositeOperation = 'destination-out'
      ctx.globalAlpha = 1.0
    } else {
      ctx.strokeStyle = brushColor
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = TOOL_SETTINGS[tool].opacity
    }

    if (tool === 'pencil') {
      ctx.globalAlpha = 0.7
      ctx.lineWidth = brushSize * 0.5
      ctx.lineTo(offsetX, offsetY)
    } else {
      ctx.lineTo(offsetX, offsetY)
    }

    ctx.stroke()
  }

  const stopDrawing = (e) => {
    e.preventDefault()
    if (e.touches) e.stopPropagation()
    if (!isDrawing) return

    contextRef.current.closePath()
    setIsDrawing(false)

    saveToHistory()

    const newDrawingData = canvasRef.current.toDataURL('image/png')
    setDrawingData(newDrawingData)
    onUpdate({ drawingData: newDrawingData })
  }

  const handleUndo = () => {
    if (historyIndex <= 0) return
    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)

    const img = new Image()
    img.onload = () => {
      const ctx = contextRef.current
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.drawImage(img, 0, 0)

      const newDrawingData = canvasRef.current.toDataURL('image/png')
      setDrawingData(newDrawingData)
      onUpdate({ drawingData: newDrawingData })
    }
    img.src = history[newIndex]
  }

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return
    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)

    const img = new Image()
    img.onload = () => {
      const ctx = contextRef.current
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      ctx.drawImage(img, 0, 0)

      const newDrawingData = canvasRef.current.toDataURL('image/png')
      setDrawingData(newDrawingData)
      onUpdate({ drawingData: newDrawingData })
    }
    img.src = history[newIndex]
  }

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // Reset history
    setHistory([canvas.toDataURL('image/png')]);
    setHistoryIndex(0);
    
    const newDrawingData = canvas.toDataURL('image/png');
    setDrawingData(newDrawingData);
    onUpdate({ drawingData: newDrawingData });
  };

  const exportDrawing = () => {
    const link = document.createElement('a')
    link.href = canvasRef.current.toDataURL('image/png')
    link.download = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const shareDrawing = async () => {
    if (navigator.share) {
      try {
        const blob = await new Promise(resolve => canvasRef.current.toBlob(resolve))
        const file = new File([blob], `${note.title}.png`, { type: 'image/png' })
        await navigator.share({ title: note.title, files: [file] })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      alert('Sharing is not supported in your browser. Try exporting instead.')
    }
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      <div className="border-b p-4 flex items-center justify-between" style={{borderColor: 'var(--border)'}}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTool('pen')}
              className={`p-2 rounded-lg transition-all transform hover:scale-110 ${tool === 'pen' ? 'tool-selected' : ''}`}
              style={{
                backgroundColor: tool === 'pen' ? 'var(--accent)' : 'transparent',
                color: tool === 'pen' ? 'var(--primary)' : 'var(--card-foreground)',
                boxShadow: tool === 'pen' ? '0 0 5px rgba(0,0,0,0.2)' : 'none'
              }}
              title="Pen"
            >
              <PenTool size={18} />
            </button>
            <button
              onClick={() => setTool('pencil')}
              className={`p-2 rounded-lg transition-all transform hover:scale-110 ${tool === 'pencil' ? 'tool-selected' : ''}`}
              style={{
                backgroundColor: tool === 'pencil' ? 'var(--accent)' : 'transparent',
                color: tool === 'pencil' ? 'var(--primary)' : 'var(--card-foreground)',
                boxShadow: tool === 'pencil' ? '0 0 5px rgba(0,0,0,0.2)' : 'none'
              }}
              title="Pencil"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-2 rounded-lg transition-all transform hover:scale-110 ${tool === 'eraser' ? 'tool-selected' : ''}`}
              style={{
                backgroundColor: tool === 'eraser' ? 'var(--accent)' : 'transparent',
                color: tool === 'eraser' ? 'var(--primary)' : 'var(--card-foreground)',
                boxShadow: tool === 'eraser' ? '0 0 5px rgba(0,0,0,0.2)' : 'none'
              }}
              title="Eraser"
            >
              <Eraser size={18} />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm" style={{color: 'var(--card-foreground)'}}>Size:</label>
            <input
              type="range"
              min="1"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-24"
            />
            <span className="text-sm w-6" style={{color: 'var(--card-foreground)'}}>{brushSize}</span>
          </div>

          {tool !== 'eraser' && (
            <div className="flex items-center space-x-2">
              <label className="text-sm" style={{color: 'var(--card-foreground)'}}>Color:</label>
              <input
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
                className="w-8 h-8 rounded-full overflow-hidden cursor-pointer"
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleUndo}
            disabled={history.length === 0 || historyIndex === 0}
            className="p-2 rounded-lg transition-all transform hover:scale-110"
            style={{
              color: history.length === 0 || historyIndex === 0 ? 'var(--muted-foreground)' : 'var(--card-foreground)',
              cursor: history.length === 0 || historyIndex === 0 ? 'not-allowed' : 'pointer',
              transform: (history.length === 0 || historyIndex === 0) ? 'scale(1)' : 'scale(1)'
            }}
            title="Undo"
          >
            <Undo size={18} />
          </button>
          <button
            onClick={handleRedo}
            disabled={history.length === 0 || historyIndex === history.length - 1}
            className="p-2 rounded-lg transition-all transform hover:scale-110"
            style={{
              color: history.length === 0 || historyIndex === history.length - 1 ? 'var(--muted-foreground)' : 'var(--card-foreground)',
              cursor: history.length === 0 || historyIndex === history.length - 1 ? 'not-allowed' : 'pointer',
              transform: (history.length === 0 || historyIndex === history.length - 1) ? 'scale(1)' : 'scale(1)'
            }}
            title="Redo"
          >
            <Redo size={18} />
          </button>
          <button
            onClick={handleClear}
            className="p-2 rounded-lg transition-all transform hover:scale-110"
            style={{color: 'var(--card-foreground)'}}
            title="Clear"
          >
            <Trash2 size={18} />
          </button>
          <button
            onClick={shareDrawing}
            className="p-2 rounded-lg transition-all transform hover:scale-110"
            style={{color: 'var(--card-foreground)'}}
            title="Share"
          >
            <Share size={18} />
          </button>
          <button
            onClick={exportDrawing}
            className="p-2 rounded-lg transition-all transform hover:scale-110"
            style={{color: 'var(--card-foreground)'}}
            title="Export"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden" style={{backgroundColor: '#FFFFFF'}}>
        <canvas
          ref={canvasRef}
          className={`drawing-canvas absolute inset-0 ${
            tool === 'pen' ? 'cursor-pen' :
            tool === 'pencil' ? 'cursor-pencil' :
            tool === 'sketch' ? 'cursor-sketch' :
            tool === 'eraser' ? 'cursor-eraser' :
            'cursor-crosshair'
          }`}
          style={{
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none'
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  )
}
