import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/themes.css'
import './styles/reset.css'
import './styles/components/shared.css'
import './styles/components/sidebar.css'
import './styles/components/topbar.css'
import './styles/components/home.css'
import './styles/components/chat.css'
import './styles/components/settings.css'
import './styles/animations.css'
import { AppShell } from './components/AppShell'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
)
