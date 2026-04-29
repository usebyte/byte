# Byte Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-first React + Vite implementation of Byte's core chat loop with pixel-perfect UI matching the HTML mockup.

**Architecture:** Single-page app with state-driven view routing. Zustand store for state with localStorage persistence. CSS extracted from mockup into organized files. Streaming API calls to OpenAI, Anthropic, Google, and custom providers.

**Tech Stack:** React 19, Vite, TypeScript, Zustand, react-markdown, remark-math, rehype-katex, highlight.js

---

## File Map

| File | Responsibility |
|---|---|
| `package.json` | Dependencies, scripts |
| `vite.config.ts` | Vite config |
| `tsconfig.json` | TypeScript config |
| `index.html` | Entry HTML with font imports |
| `src/main.tsx` | React entry point |
| `src/App.tsx` | Root component, view router, keyboard shortcuts |
| `src/types/index.ts` | All TypeScript interfaces |
| `src/store/useStore.ts` | Zustand store with persistence |
| `src/lib/api.ts` | Provider API calls (streaming, model fetching) |
| `src/lib/markdown.tsx` | Markdown renderer component with LaTeX support |
| `src/styles/reset.css` | Reset + base + responsive |
| `src/styles/tokens.css` | CSS custom properties |
| `src/styles/themes.css` | Theme class overrides |
| `src/styles/components/shared.css` | Buttons, toggles, chips, modals |
| `src/styles/components/sidebar.css` | Sidebar styles |
| `src/styles/components/topbar.css` | Topbar styles |
| `src/styles/components/home.css` | Home view styles |
| `src/styles/components/chat.css` | Chat view styles |
| `src/styles/components/settings.css` | Settings view styles |
| `src/components/AppShell.tsx` | Layout shell |
| `src/components/sidebar/Sidebar.tsx` | Sidebar container |
| `src/components/sidebar/SidebarHeader.tsx` | Logo + new chat |
| `src/components/sidebar/SidebarNav.tsx` | Nav items |
| `src/components/sidebar/SidebarRecents.tsx` | Recent chats |
| `src/components/sidebar/SidebarFooter.tsx` | Settings + avatar |
| `src/components/topbar/Topbar.tsx` | Top bar |
| `src/components/views/HomeView.tsx` | Home screen |
| `src/components/views/ChatView.tsx` | Chat screen |
| `src/components/views/ChatsListView.tsx` | Chat list |
| `src/components/views/SettingsView.tsx` | Settings |
| `src/components/shared/InputBox.tsx` | Shared input box |
| `src/components/shared/ModelPicker.tsx` | Model picker modal |
| `src/components/shared/TokenBar.tsx` | Token usage bar |
| `src/components/shared/MessageBubble.tsx` | Message display |
| `src/components/shared/CodeBlock.tsx` | Code block with copy |
| `src/components/shared/Modal.tsx` | Generic modal wrapper |

---

## Chunk 1: Scaffold, Types, Store, CSS Foundation

### Task 1: Project Scaffold

**Files:**
- Create: `/Users/arnavsaini/Byte/package.json`
- Create: `/Users/arnavsaini/Byte/vite.config.ts`
- Create: `/Users/arnavsaini/Byte/tsconfig.json`
- Create: `/Users/arnavsaini/Byte/tsconfig.node.json`
- Create: `/Users/arnavsaini/Byte/index.html`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "byte",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "react-markdown": "^10.0.0",
    "remark-gfm": "^4.0.0",
    "remark-math": "^6.0.0",
    "rehype-highlight": "^7.0.0",
    "rehype-katex": "^7.0.0",
    "katex": "^0.16.0",
    "highlight.js": "^11.11.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "~5.7.0",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Byte</title>
    <link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500&family=Instrument+Serif:ital@0;1&family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,300&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.0/dist/katex.min.css">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Install dependencies**

```bash
cd /Users/arnavsaini/Byte && npm install
```

Expected: All packages installed, no errors.

- [ ] **Step 7: Create directory structure**

```bash
mkdir -p src/{components/{sidebar,topbar,views,shared},styles/components,store,types,lib}
```

- [ ] **Step 8: Commit**

```bash
git add . && git commit -m "chore: scaffold Vite + React + TypeScript project"
```

### Task 2: Type Definitions

**Files:**
- Create: `/Users/arnavsaini/Byte/src/types/index.ts`

- [ ] **Step 1: Create types/index.ts**

```typescript
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status: 'sending' | 'sent' | 'streaming' | 'done' | 'error';
  pinned?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  modelId: string | null;
  createdAt: number;
  updatedAt: number;
  saved: boolean;
}

export interface Provider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  models: Model[];
}

export interface Model {
  id: string;
  name: string;
  providerId: string;
  contextWindow: number;
  enabled: boolean;
}

export type ThemeId =
  | 't-dark'
  | 't-light'
  | 't-warm'
  | 't-ocean'
  | 't-sage'
  | 't-rose'
  | 't-sand'
  | 't-slate'
  | 't-midnight';

export type LayoutMode = 'full' | 'icons' | 'none';

export type ActiveView = 'home' | 'chats' | 'settings' | 'chat';

export interface StreamHandle {
  abort: () => void;
  isAborted: boolean;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts && git commit -m "types: define core interfaces"
```

### Task 3: Zustand Store

**Files:**
- Create: `/Users/arnavsaini/Byte/src/store/useStore.ts`

- [ ] **Step 1: Create the store**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ThemeId,
  LayoutMode,
  ActiveView,
  Provider,
  Model,
  Chat,
} from '../types'

interface AppState {
  // Theme
  theme: ThemeId;
  layoutMode: LayoutMode;
  fontFamily: string;
  headingFont: string;

  // Providers & Models
  providers: Provider[];
  enabledModelIds: string[];
  selectedModelId: string | null;

  // Chats
  chats: Chat[];
  activeChatId: string | null;
  activeView: ActiveView;

  // Settings
  disappearingMessages: boolean;
  disappearingInterval: number;

  // Actions
  setTheme: (theme: ThemeId) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setFontFamily: (font: string) => void;
  setHeadingFont: (font: string) => void;
  addProvider: (provider: Provider) => void;
  updateProvider: (id: string, updates: Partial<Provider>) => void;
  removeProvider: (id: string) => void;
  setProviderModels: (providerId: string, models: Model[]) => void;
  toggleModel: (modelId: string) => void;
  setSelectedModelId: (id: string | null) => void;
  addChat: (chat: Chat) => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  removeChat: (id: string) => void;
  setActiveChatId: (id: string | null) => void;
  setActiveView: (view: ActiveView) => void;
  newChat: () => void;
  setDisappearingMessages: (val: boolean) => void;
  setDisappearingInterval: (hours: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 't-light',
      layoutMode: 'full',
      fontFamily: "'Geist Mono',monospace",
      headingFont: "'Instrument Serif',serif",
      providers: [],
      enabledModelIds: [],
      selectedModelId: null,
      chats: [],
      activeChatId: null,
      activeView: 'home',
      disappearingMessages: true,
      disappearingInterval: 48,

      setTheme: (theme) => set({ theme }),
      setLayoutMode: (layoutMode) => set({ layoutMode }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setHeadingFont: (headingFont) => set({ headingFont }),
      addProvider: (provider) =>
        set((s) => ({ providers: [...s.providers, provider] })),
      updateProvider: (id, updates) =>
        set((s) => ({
          providers: s.providers.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      removeProvider: (id) =>
        set((s) => ({
          providers: s.providers.filter((p) => p.id !== id),
          enabledModelIds: s.enabledModelIds.filter(
            (mid) => !s.providers.find((p) => p.id === id)?.models.some((m) => m.id === mid)
          ),
        })),
      setProviderModels: (providerId, models) =>
        set((s) => ({
          providers: s.providers.map((p) =>
            p.id === providerId ? { ...p, models } : p
          ),
        })),
      toggleModel: (modelId) =>
        set((s) => ({
          enabledModelIds: s.enabledModelIds.includes(modelId)
            ? s.enabledModelIds.filter((id) => id !== modelId)
            : [...s.enabledModelIds, modelId],
        })),
      setSelectedModelId: (selectedModelId) => set({ selectedModelId }),
      addChat: (chat) =>
        set((s) => ({ chats: [...s.chats, chat] })),
      updateChat: (id, updates) =>
        set((s) => ({
          chats: s.chats.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
          ),
        })),
      removeChat: (id) =>
        set((s) => ({
          chats: s.chats.filter((c) => c.id !== id),
          activeChatId: s.activeChatId === id ? null : s.activeChatId,
        })),
      setActiveChatId: (activeChatId) => set({ activeChatId }),
      setActiveView: (activeView) => set({ activeView }),
      newChat: () => {
        const chat: Chat = {
          id: crypto.randomUUID(),
          title: 'New chat',
          messages: [],
          modelId: get().selectedModelId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          saved: false,
        };
        set({
          chats: [...get().chats, chat],
          activeChatId: chat.id,
          activeView: 'chat',
        });
      },
      setDisappearingMessages: (disappearingMessages) => set({ disappearingMessages }),
      setDisappearingInterval: (disappearingInterval) => set({ disappearingInterval }),
    }),
    {
      name: 'byte_store',
    }
  )
);
```

- [ ] **Step 2: Commit**

```bash
git add src/store/useStore.ts && git commit -m "store: Zustand store with persistence"
```

### Task 4: CSS Foundation

**Files:**
- Create: `/Users/arnavsaini/Byte/src/styles/tokens.css`
- Create: `/Users/arnavsaini/Byte/src/styles/themes.css`
- Create: `/Users/arnavsaini/Byte/src/styles/reset.css`
- Create: `/Users/arnavsaini/Byte/src/styles/components/shared.css`

Extract CSS from `byte ui mockup.html`. The mockup is at `/Users/arnavsaini/Byte/byte ui mockup.html`.

- [ ] **Step 1: Extract tokens.css**

Copy the `:root { ... }` block from the mockup (lines 19-46). This defines all CSS custom properties.

- [ ] **Step 2: Extract themes.css**

Copy all `body.t-*` class definitions from the mockup (lines 48-56).

- [ ] **Step 3: Extract reset.css**

Copy reset rules (lines 12-14), base styles (line 58), SVG inheritance (lines 60-63), color propagation (lines 66-147), and responsive breakpoints (lines 1317-1864).

- [ ] **Step 4: Extract shared.css**

Copy button styles (lines 251-257), toggle (260-263), badge (266), kbd (269), separator (953), rail buttons (956-966), label buttons (969-978), modal styles (930-948), plus menu (1162-1205), and any shared utility classes.

- [ ] **Step 5: Import CSS in main.tsx**

```typescript
import '../styles/tokens.css'
import '../styles/themes.css'
import '../styles/reset.css'
import '../styles/components/shared.css'
```

- [ ] **Step 6: Commit**

```bash
git add src/styles/ && git commit -m "styles: extract CSS foundation from mockup"
```

---

## Chunk 2: App Shell + Sidebar + Topbar

### Task 5: AppShell Component

**Files:**
- Create: `/Users/arnavsaini/Byte/src/components/AppShell.tsx`

- [ ] **Step 1: Create AppShell.tsx**

```tsx
import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { Sidebar } from './sidebar/Sidebar'
import { Topbar } from './topbar/Topbar'
import { HomeView } from './views/HomeView'
import { ChatView } from './views/ChatView'
import { ChatsListView } from './views/ChatsListView'
import { SettingsView } from './views/SettingsView'

export function AppShell() {
  const { activeView, theme, layoutMode, fontFamily, headingFont } = useStore()

  // Apply theme class to body
  useEffect(() => {
    document.body.className = theme
    if (layoutMode === 'icons') document.body.classList.add('ly-icons')
    if (layoutMode === 'none') document.body.classList.add('ly-none')
  }, [theme, layoutMode])

  // Apply fonts
  useEffect(() => {
    document.documentElement.style.setProperty('--font', fontFamily)
    document.documentElement.style.setProperty('--font-d', headingFont)
  }, [fontFamily, headingFont])

  const renderView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView />
      case 'chat':
        return <ChatView />
      case 'chats':
        return <ChatsListView />
      case 'settings':
        return <SettingsView />
      default:
        return <HomeView />
    }
  }

  return (
    <div id="s-app" className="scr on">
      <Sidebar />
      <div className="main">
        <Topbar />
        {renderView()}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AppShell.tsx && git commit -m "components: AppShell layout with view routing"
```

### Task 6: Sidebar Components

**Files:**
- Create: `/Users/arnavsaini/Byte/src/components/sidebar/Sidebar.tsx`
- Create: `/Users/arnavsaini/Byte/src/components/sidebar/SidebarHeader.tsx`
- Create: `/Users/arnavsaini/Byte/src/components/sidebar/SidebarNav.tsx`
- Create: `/Users/arnavsaini/Byte/src/components/sidebar/SidebarRecents.tsx`
- Create: `/Users/arnavsaini/Byte/src/components/sidebar/SidebarFooter.tsx`
- Create: `/Users/arnavsaini/Byte/src/styles/components/sidebar.css`

- [ ] **Step 1: Extract sidebar.css from mockup**

Copy sidebar styles (lines 276-378), nav item styles (334-344), recents (347-357), footer (360-378), layout modes (286-313), and single sidebar rows (994-1035).

- [ ] **Step 2: Create SidebarHeader.tsx**

Renders Byte logo (SVG from mockup lines 2047-2049) + new chat button. Uses `goView('home')` and `newChat()` from store.

- [ ] **Step 3: Create SidebarNav.tsx**

Nav items: Chats, Settings. Each uses `.sb-row` class with SVG icons from mockup. Active state via `activeView` comparison.

- [ ] **Step 4: Create SidebarRecents.tsx**

Shows last 10 chats sorted by `updatedAt`. Uses `.sb-rec` class. Clicking sets `activeChatId` and `activeView: 'chat'`.

- [ ] **Step 5: Create SidebarFooter.tsx**

Settings button + avatar (initial "B" in accent circle). Settings button sets `activeView: 'settings'`.

- [ ] **Step 6: Create Sidebar.tsx**

Container that composes Header, Nav, Recents, Footer.

- [ ] **Step 7: Import sidebar.css in main.tsx**

- [ ] **Step 8: Commit**

```bash
git add src/components/sidebar/ src/styles/components/sidebar.css && git commit -m "components: Sidebar with header, nav, recents, footer"
```

### Task 7: Topbar Component

**Files:**
- Create: `/Users/arnavsaini/Byte/src/components/topbar/Topbar.tsx`
- Create: `/Users/arnavsaini/Byte/src/styles/components/topbar.css`

- [ ] **Step 1: Extract topbar.css from mockup**

Copy topbar styles (lines 384-400).

- [ ] **Step 2: Create Topbar.tsx**

Left side: hamburger/sidebar toggle button (`Cmd+B`). Right side: view badge (pill showing current view name).

- [ ] **Step 3: Commit**

```bash
git add src/components/topbar/ src/styles/components/topbar.css && git commit -m "components: Topbar with sidebar toggle and view badge"
```

### Task 8: Entry Point + App

**Files:**
- Create: `/Users/arnavsaini/Byte/src/main.tsx`
- Create: `/Users/arnavsaini/Byte/src/App.tsx`

- [ ] **Step 1: Create main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../styles/tokens.css'
import '../styles/themes.css'
import '../styles/reset.css'
import '../styles/components/shared.css'
import '../styles/components/sidebar.css'
import '../styles/components/topbar.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 2: Create App.tsx**

```tsx
import { AppShell } from './components/AppShell'

export default function App() {
  return <AppShell />
}
```

- [ ] **Step 3: Verify dev server works**

```bash
npm run dev
```

Expected: Vite starts, shows Byte app with sidebar and empty main area.

- [ ] **Step 4: Commit**

```bash
git add src/main.tsx src/App.tsx && git commit -m "entry: wire up React app with CSS imports"
```

---

## Chunk 3: Home View + Chat View

### Task 9: Home View

**Files:**
- Create: `/Users/arnavsaini/Byte/src/components/views/HomeView.tsx`
- Create: `/Users/arnavsaini/Byte/src/components/shared/InputBox.tsx`
- Create: `/Users/arnavsaini/Byte/src/components/shared/TokenBar.tsx`
- Create: `/Users/arnavsaini/Byte/src/styles/components/home.css`

- [ ] **Step 1: Extract home.css from mockup**

Copy home stage (lines 410-418), home input box (421-430), suggestion pills (433-467), token bar (569-576), chips (579-590), and suggestion menu (470-495).

- [ ] **Step 2: Create TokenBar.tsx**

Shows token usage for selected model. Uses `.tok-bar`, `.tok-track`, `.tok-fill`, `.tok-labels` classes. Shows "0 / 128K tokens used" format.

- [ ] **Step 3: Create InputBox.tsx**

Reusable input box component. Props: `variant: 'home' | 'chat'`, `onSend: (text: string) => void`, `value`, `onChange`. Includes textarea, tool buttons, model chip, send button. Uses `.in-box`, `.in-wrap`, `.in-row-top`, `.in-row-bottom`, `.in-tools`, `.in-right` classes.

- [ ] **Step 4: Create HomeView.tsx**

Centered greeting ("Good evening") in display font. Large input box below. Static suggestion pills: "Write code", "Explain a concept", "Help me debug", "Draft an email". Token bar below input.

On send: calls `newChat()` from store, adds user message, navigates to chat view.

- [ ] **Step 5: Commit**

```bash
git add src/components/views/HomeView.tsx src/components/shared/InputBox.tsx src/components/shared/TokenBar.tsx src/styles/components/home.css && git commit -m "views: HomeView with greeting, input, suggestions"
```

### Task 10: Chat View

**Files:**
- Create: `/Users/arnavsaini/Byte/src/components/views/ChatView.tsx`
- Create: `/Users/arnavsaini/Byte/src/components/shared/MessageBubble.tsx`
- Create: `/Users/arnavsaini/Byte/src/components/shared/CodeBlock.tsx`
- Create: `/Users/arnavsaini/Byte/src/lib/markdown.tsx`
- Create: `/Users/arnavsaini/Byte/src/styles/components/chat.css`

- [ ] **Step 1: Extract chat.css from mockup**

Copy chat messages (lines 595-597), message layout (600-616), code blocks (611-616), tool cards (619-624), message actions (627-630), user message actions (633-644), perm card (652-657), chat input (660).

- [ ] **Step 2: Create markdown.tsx**

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import { CodeBlock } from '../components/shared/CodeBlock'

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeHighlight]}
      components={{
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '')
          const isInline = !match
          return isInline ? (
            <code className={className} {...props}>{children}</code>
          ) : (
            <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} />
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
```

- [ ] **Step 3: Create CodeBlock.tsx**

Renders code with language label, copy button. Uses `.code-blk`, `.code-hd`, `.code-lang`, `.code-copy` classes.

- [ ] **Step 4: Create MessageBubble.tsx**

Renders a single message. User messages: right-aligned bubble (`.msg.u`). AI messages: left-aligned with avatar (`.msg-av.ai`). Uses `.msg`, `.msg-body`, `.msg-meta`, `.msg-txt`, `.msg-acts` classes. AI messages use `MarkdownRenderer`.

- [ ] **Step 5: Create ChatView.tsx**

Message list (`.chat-msgs`) scrolling container. Maps over active chat's messages, renders `MessageBubble` for each. Input box at bottom. On send: appends user message, calls `streamChat` from api.ts, streams response into assistant message.

Streaming logic:
1. Create assistant message with `status: 'streaming'`
2. Call `streamChat()` with `onChunk` callback
3. Each chunk appends to message content
4. On done: set `status: 'done'`
5. On error: set `status: 'error'`

- [ ] **Step 6: Import chat.css in main.tsx**

- [ ] **Step 7: Commit**

```bash
git add src/components/views/ChatView.tsx src/components/shared/MessageBubble.tsx src/components/shared/CodeBlock.tsx src/lib/markdown.tsx src/styles/components/chat.css && git commit -m "views: ChatView with streaming messages"
```

### Task 11: API Integration

**Files:**
- Create: `/Users/arnavsaini/Byte/src/lib/api.ts`

- [ ] **Step 1: Create api.ts**

Implement `streamChat` and `fetchModels` functions.

For Phase 1, implement OpenAI and Anthropic streaming. Google and custom providers can be stubbed.

OpenAI streaming:
```
POST {baseUrl}/v1/chat/completions
Headers: { Authorization: `Bearer ${apiKey}`, Content-Type: 'application/json' }
Body: { model, messages: [{role, content}], stream: true }
```

Parse SSE stream: each `data: ` line contains JSON with `choices[0].delta.content`.

Anthropic streaming:
```
POST {baseUrl}/v1/messages
Headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }
Body: { model, messages: [{role, content}], max_tokens: 4096, stream: true }
```

Parse SSE stream: each `data: ` line contains JSON with `delta.text`.

Model fetching:
```
GET {baseUrl}/v1/models
Headers: { Authorization: `Bearer ${apiKey}` }
```

Parse response: extract `data[]` array, map to `Model` interface.

- [ ] **Step 2: Commit**

```bash
git add src/lib/api.ts && git commit -m "lib: API integration for OpenAI and Anthropic streaming"
```

### Task 12: Test Streaming

- [ ] **Step 1: Add a test API key in Settings**

Run `npm run dev`, go to Settings → Providers, add OpenAI provider with a valid API key.

- [ ] **Step 2: Start a chat and send a message**

Verify: user message appears, AI response streams in real-time, token bar updates, send button becomes stop button during streaming.

- [ ] **Step 3: Test stop generation**

Click stop button mid-stream. Verify: streaming stops, message shows partial content, regenerate button appears.

- [ ] **Step 4: Commit**

```bash
git commit --allow-empty -m "test: verify streaming works with OpenAI"
```

---

## Chunk 4: Settings View + Model Picker

### Task 13: Settings View

**Files:**
- Create: `/Users/arnavsaini/Byte/src/components/views/SettingsView.tsx`
- Create: `/Users/arnavsaini/Byte/src/styles/components/settings.css`

- [ ] **Step 1: Extract settings.css from mockup**

Copy settings layout (lines 762-772), setting rows (776-779), provider rows (782-786), model rows (789-791), theme swatches (794-798), color rows (801-809), accent dots (812-815), slider rows (818-823), font options (826-831), import (834-836), shortcut table (839-844).

- [ ] **Step 2: Create SettingsView.tsx**

Two-column layout (`.set-lay`). Left nav (`.set-nav`) with sections: Providers & Models, Appearance, Behavior, Data, About. Right panel (`.set-body`) with active section.

**Providers & Models panel:**
- Grid of provider cards (OpenAI, Anthropic, Google, Mistral, Groq, Custom)
- Click a provider → expand to show API key input + model list
- API key input with show/hide toggle
- "Save" button stores key, calls `fetchModels()`
- Model list with enable/disable toggles
- Default model selector

**Appearance panel:**
- Theme swatches (9 themes) — clicking updates store theme
- Layout mode picker (Full / Icons / None)
- Font picker (UI + Heading)

**Behavior panel:**
- Disappearing messages toggle
- Interval selector (24h, 48h, 72h, 1 week)

**Data panel:**
- Export all data (JSON download)
- Import data (JSON file upload)
- Clear all chats button

**About panel:**
- Byte version, description, team info

- [ ] **Step 3: Import settings.css in main.tsx**

- [ ] **Step 4: Commit**

```bash
git add src/components/views/SettingsView.tsx src/styles/components/settings.css && git commit -m "views: SettingsView with providers, appearance, behavior panels"
```

### Task 14: Model Picker

**Files:**
- Create: `/Users/arnavsaini/Byte/src/components/shared/ModelPicker.tsx`
- Create: `/Users/arnavsaini/Byte/src/components/shared/Modal.tsx`

- [ ] **Step 1: Create Modal.tsx**

Generic modal wrapper. Props: `isOpen`, `onClose`, `children`. Uses `.mm-box` styles from mockup (lines 930-948). Closes on Escape, click outside, or `onClose` call.

- [ ] **Step 2: Create ModelPicker.tsx**

Modal with search input (`.mm-search`), model list grouped by provider (`.mm-group`), context window info (`.mm-ctx`), checkmark on active model (`.mm-check`).

Models filtered by search query. Clicking a model calls `setSelectedModelId` and closes modal.

- [ ] **Step 3: Integrate ModelPicker into InputBox**

Model chip in InputBox opens ModelPicker on click.

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/ModelPicker.tsx src/components/shared/Modal.tsx && git commit -m "components: ModelPicker modal with search and grouped models"
```

### Task 15: Chats List View

**Files:**
- Create: `/Users/arnavsaini/Byte/src/components/views/ChatsListView.tsx`

- [ ] **Step 1: Create ChatsListView.tsx**

Header with "Chats" title (`.vi-h`), "New chat" button, "Select" button. Chat items (`.chat-list-item`) showing title, model icon, relative timestamp, bookmark state. Clicking a chat sets `activeChatId` and `activeView: 'chat'`.

Select mode: shows checkboxes (`.chat-cb`), bulk actions (add to project, delete).

- [ ] **Step 2: Commit**

```bash
git add src/components/views/ChatsListView.tsx && git commit -m "views: ChatsListView with select mode"
```

---

## Chunk 5: Polish + Keyboard Shortcuts

### Task 16: Keyboard Shortcuts

**Files:**
- Modify: `/Users/arnavsaini/Byte/src/App.tsx`

- [ ] **Step 1: Add keyboard shortcut handler to App.tsx**

```tsx
import { useEffect } from 'react'
import { useStore } from '../store/useStore'

// Inside App component:
const { newChat, setActiveView, layoutMode, setLayoutMode } = useStore()

useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey
    
    if (mod && e.key === 'n') {
      e.preventDefault()
      newChat()
    }
    if (mod && e.key === 'b') {
      e.preventDefault()
      const modes: Array<'full' | 'icons' | 'none'> = ['full', 'icons', 'none']
      const idx = modes.indexOf(layoutMode)
      setLayoutMode(modes[(idx + 1) % modes.length])
    }
    if (mod && e.key === ',') {
      e.preventDefault()
      setActiveView('settings')
    }
    if (e.key === 'Escape') {
      // Stop generation or close modal — modal takes precedence
      // Handled by Modal component
    }
  }
  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}, [newChat, layoutMode, setLayoutMode, setActiveView])
```

- [ ] **Step 2: Commit**

```bash
git add src/App.tsx && git commit -m "feat: keyboard shortcuts (Cmd+N, Cmd+B, Cmd+,)"
```

### Task 17: Responsive Polish

- [ ] **Step 1: Verify responsive breakpoints**

Test at 400px, 768px, 1024px, 1440px, 1920px, 2560px. Ensure sidebar overlay works on mobile, layout adapts correctly.

- [ ] **Step 2: Fix any CSS issues**

Check for overflow, clipped content, misaligned elements. Fix in respective CSS files.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "polish: responsive fixes"
```

### Task 18: Final Verification

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: No TypeScript errors, no build errors.

- [ ] **Step 2: Run preview**

```bash
npm run preview
```

Verify: All views work, theme switching works, API calls work, state persists.

- [ ] **Step 3: Check file sizes**

No single file should exceed 300 lines. If any do, split them.

- [ ] **Step 4: Final commit**

```bash
git add -A && git commit -m "release: Byte Phase 1 — core chat loop complete"
```

---

## Success Criteria Checklist

- [ ] UI matches mockup pixel-perfectly (themes, layout, animations)
- [ ] User can add API key and start a chat
- [ ] Messages stream in real-time from OpenAI and Anthropic
- [ ] Theme switching works instantly
- [ ] Sidebar layout modes (Full/Icons/None) work
- [ ] All state persists across page reloads
- [ ] Keyboard shortcuts function
- [ ] Responsive on mobile, tablet, desktop
- [ ] No CSS in JS — all styles in `.css` files
- [ ] No single file exceeds 300 lines
