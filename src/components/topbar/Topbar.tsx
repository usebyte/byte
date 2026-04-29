import { Menu } from 'lucide-react'
import { useStore } from '../../store/useStore'

const viewLabels: Record<string, string> = {
  home: 'Home',
  chats: 'Chats',
  chat: 'Chat',
  settings: 'Settings',
}

export function Topbar() {
  const { activeView, layoutMode, setLayoutMode } = useStore()

  const cycleLayout = () => {
    const modes: Array<'full' | 'icons' | 'none'> = ['full', 'icons', 'none']
    const idx = modes.indexOf(layoutMode)
    setLayoutMode(modes[(idx + 1) % modes.length])
  }

  return (
    <div className="topbar">
      <div className="tb-l">
        <button className="tb-btn" onClick={cycleLayout} title="Toggle sidebar (⌘B)">
          <Menu size={14} />
        </button>
      </div>
      <div className="tb-r">
        <span className="view-badge" style={{ display: 'inline-flex', alignItems: 'center', padding: '5px 13px', borderRadius: 20, border: '1px solid var(--bd2)', background: 'rgba(var(--acc-r),var(--acc-g),var(--acc-b),.07)', fontSize: 'calc(var(--fs) - 1px)', color: 'var(--tx2)', letterSpacing: '.04em', fontFamily: 'var(--font)' }}>
          {viewLabels[activeView] || activeView}
        </span>
      </div>
    </div>
  )
}