import { useState, useRef, useEffect } from 'react'
import { X, Check, Sparkles } from 'lucide-react'
import './SuggestMemory.css'

interface SuggestMemoryProps {
  initialName: string
  initialContent: string
  onSave: (name: string, content: string) => void
  onDecline: () => void
}

export function SuggestMemory({ initialName, initialContent, onSave, onDecline }: SuggestMemoryProps) {
  const [name, setName] = useState(initialName)
  const [content, setContent] = useState(initialContent)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
    nameRef.current?.select()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onDecline()
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      onSave(name, content)
    }
  }

  return (
    <div className="sm-overlay" onKeyDown={handleKeyDown}>
      <div className="sm-modal">
        <div className="sm-header">
          <div className="sm-header-left">
            <Sparkles size={18} />
            <span className="sm-title">Save Memory?</span>
          </div>
          <button className="sm-close" onClick={onDecline} aria-label="Cancel">
            <X size={16} />
          </button>
        </div>

        <div className="sm-body">
          <label className="sm-label">Name</label>
          <input
            ref={nameRef}
            className="sm-input sm-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Short label for this memory"
          />

          <label className="sm-label">Content</label>
          <textarea
            className="sm-input sm-content-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What should Byte remember?"
            rows={4}
          />
        </div>

        <div className="sm-footer">
          <button className="sm-btn sm-btn-ghost" onClick={onDecline}>
            Decline
          </button>
          <button
            className="sm-btn sm-btn-primary"
            onClick={() => onSave(name, content)}
            disabled={!name.trim() && !content.trim()}
          >
            <Check size={14} />
            Save Memory
          </button>
        </div>
      </div>
    </div>
  )
}