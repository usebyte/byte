import { Zap } from 'lucide-react'
import { useStore } from '../../store/useStore'

export function SparksView() {
  const { chats } = useStore()

  const sparks = chats.filter(c => c.saved).slice(0, 10)

  return (
    <div className="view">
      <div className="view-header">
        <h1 className="view-title">Sparks</h1>
        <p className="view-subtitle">Saved conversations and ideas</p>
      </div>
      <div className="view-content">
        {sparks.length === 0 ? (
          <div className="empty-state">
            <Zap size={48} />
            <p>No saved sparks yet</p>
            <span>Save chats to access them here</span>
          </div>
        ) : (
          <div className="sparks-grid">
            {sparks.map(chat => (
              <button key={chat.id} className="spark-card" onClick={() => useStore.getState().setActiveView('chat')}>
                <span className="spark-title">{chat.title}</span>
                <span className="spark-meta">{chat.messages.length} messages</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}