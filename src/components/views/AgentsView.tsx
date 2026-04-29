import { Users } from 'lucide-react'
import { useStore } from '../../store/useStore'

export function AgentsView() {
  useStore()

  return (
    <div className="view">
      <div className="view-header">
        <h1 className="view-title">Agents</h1>
        <p className="view-subtitle">AI assistants and custom agents</p>
      </div>
      <div className="view-content">
        <div className="empty-state">
          <Users size={48} />
          <p>No agents configured</p>
          <span>Add custom agents in Customize</span>
        </div>
      </div>
    </div>
  )
}