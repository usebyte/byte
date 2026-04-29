import { Settings } from 'lucide-react'
import { useStore } from '../../store/useStore'

export function SidebarFooter() {
  const { setActiveView } = useStore()

  return (
    <div id="sidebar-footer" style={{ padding: '10px 8px 14px', borderTop: '1px solid var(--bd)', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
      <button
        className="sb-row"
        onClick={() => setActiveView('settings')}
        title="Settings"
        style={{ border: '1px solid var(--bd2)' }}
      >
        <Settings size={18} className="sb-row-icon" />
        <span className="sb-text">Settings</span>
      </button>
    </div>
  )
}