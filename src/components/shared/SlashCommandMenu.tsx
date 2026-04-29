import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Brain, Sparkles, BookOpen } from 'lucide-react'

export interface SlashCommand {
  command: string
  label: string
  description: string
  icon: React.ComponentType<{ size: number }>
  /** Format to insert when selected. Defaults to "${command} " */
  format?: string
}

export const SLASH_COMMANDS: SlashCommand[] = [
  {
    command: '/remember',
    label: 'Remember',
    description: 'Save something to memory',
    icon: Brain,
    format: '/remember topic: ',
  },
  {
    command: '/summarize',
    label: 'Summarize',
    description: 'Summarize the conversation',
    icon: BookOpen,
  },
  {
    command: '/brainstorm',
    label: 'Brainstorm',
    description: 'Brainstorm ideas on a topic',
    icon: Sparkles,
  },
]

interface SlashCommandMenuProps {
  query: string
 anchorRect: DOMRect | null
  onSelect: (command: SlashCommand) => void
  onClose: () => void
  direction?: 'up' | 'down'
}

export function SlashCommandMenu({ query, anchorRect, onSelect, onClose, direction = 'up' }: SlashCommandMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filtered = SLASH_COMMANDS.filter((cmd) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      cmd.command.toLowerCase().startsWith(q) ||
      cmd.label.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q)
    )
  })

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!filtered.length) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % filtered.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length)
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        if (filtered[selectedIndex]) {
          onSelect(filtered[selectedIndex])
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [filtered, selectedIndex, onSelect, onClose])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  if (!anchorRect || !filtered.length) return null

  const menuStyle: React.CSSProperties = {
    position: 'fixed',
    background: 'var(--sf)',
    border: '1px solid var(--bd2)',
    borderRadius: 'var(--r)',
    padding: '4px',
    minWidth: 240,
    maxWidth: 320,
    boxShadow: '0 6px 24px rgba(0,0,0,.14), 0 1px 4px rgba(0,0,0,.08)',
    zIndex: 1000,
  }

  if (direction === 'up') {
    menuStyle.bottom = window.innerHeight - anchorRect.top + 6
    menuStyle.left = anchorRect.left
  } else {
    menuStyle.top = anchorRect.bottom + 6
    menuStyle.left = anchorRect.left
  }

  return createPortal(
    <div
      ref={menuRef}
      style={menuStyle}
      className="slash-menu"
      role="listbox"
    >
      {filtered.map((cmd, i) => {
        const Icon = cmd.icon
        const isSelected = i === selectedIndex
        return (
          <button
            key={cmd.command}
            className="slash-item"
            role="option"
            aria-selected={isSelected}
            onClick={() => onSelect(cmd)}
            onMouseEnter={() => setSelectedIndex(i)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '8px 10px',
              borderRadius: 'var(--r-sm)',
              border: 'none',
              background: isSelected ? 'rgba(var(--acc-r),var(--acc-g),var(--acc-b),.09)' : 'transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font)',
              fontSize: 13,
              color: isSelected ? 'var(--tx)' : 'var(--tx2)',
              textAlign: 'left',
              transition: 'background 0.1s, color 0.1s',
            }}
          >
            <span style={{
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: isSelected ? 'rgba(var(--acc-r),var(--acc-g),var(--acc-b),1)' : 'var(--tx3)',
            }}>
              <Icon size={15} />
            </span>
            <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span style={{ fontWeight: 500, lineHeight: 1.2, color: isSelected ? 'var(--tx)' : 'var(--tx2)' }}>
                {cmd.command}
              </span>
              <span style={{ fontSize: 11, color: 'var(--tx3)', lineHeight: 1.3 }}>
                {cmd.description}
              </span>
            </span>
          </button>
        )
      })}
    </div>,
    document.body
  )
}