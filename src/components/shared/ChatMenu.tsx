import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MoreHorizontal, Star, Pencil, Trash2 } from 'lucide-react'

interface ChatMenuProps {
  onStar: () => void
  onRename: () => void
  onDelete: () => void
  isSaved: boolean
}

export function ChatMenu({ onStar, onRename, onDelete, isSaved }: ChatMenuProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        const dd = document.getElementById('chat-menu-portal')
        if (dd && !dd.contains(e.target as Node)) {
          setOpen(false)
        }
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (open) { setOpen(false); return }
    const rect = btnRef.current!.getBoundingClientRect()
    setPosition({ top: rect.bottom + 6, right: window.innerWidth - rect.right })
    setOpen(true)
  }

  return (
    <>
      <button
        className="chat-menu-btn"
        ref={btnRef}
        onClick={handleOpen}
        title="More options"
      >
        <MoreHorizontal size={14} />
      </button>
      {open && createPortal(
        <div
          id="chat-menu-portal"
          className="chat-menu-dropdown"
          style={{ position: 'fixed', top: position.top, right: position.right, zIndex: 9999 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="chat-menu-item"
            onClick={(e) => { e.stopPropagation(); onStar(); setOpen(false) }}
          >
            <Star size={13} />
            <span>{isSaved ? 'Unstar' : 'Star'}</span>
          </button>
          <button
            className="chat-menu-item"
            onClick={(e) => { e.stopPropagation(); onRename(); setOpen(false) }}
          >
            <Pencil size={13} />
            <span>Rename</span>
          </button>
          <div className="chat-menu-divider" />
          <button
            className="chat-menu-item chat-menu-item-danger"
            onClick={(e) => { e.stopPropagation(); onDelete(); setOpen(false) }}
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        </div>,
        document.body
      )}
    </>
  )
}
