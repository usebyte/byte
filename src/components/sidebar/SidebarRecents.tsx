import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { ChatMenu } from '../shared/ChatMenu'

export function SidebarRecents() {
  const { chats, activeChatId, activeView, setActiveChatId, setActiveView, removeChat, updateChat, toggleSaved } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const recentChats = [...chats]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 10)

  const handleDelete = (chatId: string) => {
    removeChat(chatId)
  }

  const handleStar = (chatId: string) => {
    toggleSaved(chatId)
  }

  const handleRename = (chat: { id: string; title: string }) => {
    setEditingId(chat.id)
    setEditingName(chat.title || '')
  }

  const handleRenameSubmit = (chatId: string) => {
    if (editingName.trim()) {
      updateChat(chatId, { title: editingName.trim() })
    }
    setEditingId(null)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(chatId)
    } else if (e.key === 'Escape') {
      setEditingId(null)
    }
  }

  if (recentChats.length === 0) {
    return (
      <>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 0' }} className="sb-recents-area" />
      </>
    )
  }

  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 0' }} className="sb-recents-area">
        {recentChats.map((chat) => (
          <div
            key={chat.id}
            className={`sb-rec-row${activeView === 'chat' && activeChatId === chat.id ? ' on' : ''}`}
            onClick={() => { setActiveChatId(chat.id); setActiveView('chat') }}
          >
            {editingId === chat.id ? (
              <input
                type="text"
                className="sb-edit-input"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => handleRenameSubmit(chat.id)}
                onKeyDown={(e) => handleRenameKeyDown(e, chat.id)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                style={{
                  flex: 1,
                  background: 'var(--sf2)',
                  border: '1px solid var(--bd)',
                  borderRadius: 'var(--r-sm)',
                  padding: '2px 6px',
                  fontSize: '12px',
                  fontFamily: 'var(--font)',
                  color: 'var(--tx)',
                  outline: 'none',
                  minWidth: 0,
                }}
              />
            ) : (
              <>
                <span className="sb-rec-label">{chat.title}</span>
                <ChatMenu
                  onStar={() => handleStar(chat.id)}
                  onRename={() => handleRename(chat)}
                  onDelete={() => handleDelete(chat.id)}
                  isSaved={chat.saved}
                />
              </>
            )}
          </div>
        ))}
      </div>
    </>
  )
}
