import { useStore } from '../../store/useStore'
import { SidebarHeader } from './SidebarHeader'
import { SidebarNav } from './SidebarNav'
import { SidebarRecents } from './SidebarRecents'
import { SidebarFooter } from './SidebarFooter'

export function Sidebar() {
  const { layoutMode } = useStore()

  return (
    <aside
      id="sidebar"
      className="sb"
      style={{ width: layoutMode === 'icons' ? undefined : 'var(--sb-w)' }}
    >
      <SidebarHeader />
      <SidebarNav />
      <div id="sb-nav-divider" style={{ height: 1, background: 'var(--bd)', margin: '6px 8px 0', flexShrink: 0 }} />
      <SidebarRecents />
      <SidebarFooter />
    </aside>
  )
}
