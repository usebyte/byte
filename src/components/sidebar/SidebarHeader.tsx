import { Plus } from 'lucide-react'
import { useStore } from '../../store/useStore'
import { ByteLogo } from '../shared/ByteLogo'

export function SidebarHeader() {
  const { setActiveView } = useStore()

  return (
    <div className="sb-head">
      <div className="sb-brand" onClick={() => setActiveView('home')}>
        <ByteLogo size={18} />
        <span className="sb-brand-name">Byte</span>
      </div>

      <button
        id="nav-newchat"
        onClick={() => setActiveView('home')}
        className="sb-newchat"
        title="New chat"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}